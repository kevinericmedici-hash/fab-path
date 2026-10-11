/* ========================================
   NEURAL INTERFACE CHIP: 3D SCENES

   Unit 1:  a neuron, and how a spike travels down a myelinated axon.
   Unit 5:  the messengers as 3D molecules: size and charge.
   Unit 10: ionotropic and metabotropic receptors in a membrane.
   Unit 14: why measuring a neurotransmitter is hard.

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
        // UNIT 1: A NEURON
        // ================================================================
        D("nt-3d-neuron", {

            title: "Explore in 3D: a neuron and its spike",
            intro: "Click any part of the neuron, then press Fire to send a spike from the dendrites to the next cell.",
            stats: [["Spike is at", "where"], ["Speed", "speed"], ["Time to reach the end", "time"]],
            defaults: { myelin: "on" },
            controls: [
                { actions: [["fire", "⚡ Fire a spike"]], label: "Signal" },
                { seg: "myelin", label: "Axon wrapping", options: [["on", "Myelinated"], ["off", "Bare (no myelin)"]] },
                { views: ["three", "front", "top"] }
            ],
            formula: "A neuron receives signals on its dendrites, adds them up in the cell body, and sends a spike down the axon. Many axons are wrapped in segments of myelin, a fatty insulating layer, and the spike is regenerated only at the small gaps between segments (nodes of Ranvier), so it appears to jump. That is why myelinated axons carry signals up to about 100 meters per second, far faster than bare ones. (Shape and speeds are illustrative.)",
            stage: { target: [3.4, 0.2, 0], halfWidth: 6.8, views: { three: [0.3, 1.3], front: [0, 1.55], top: [0, 0.4] }, home: "three", sway: [0.3, 0.25] },
            info: {
                dend: "Dendrites: branches that receive signals from other neurons. Each synapse nudges the voltage a little; the cell body adds the nudges up.",
                soma: "Cell body: holds the nucleus and adds up the incoming signals. If the total reaches threshold, the neuron fires.",
                axon: "Axon: a long fiber that carries the spike away from the cell body. Pulses travel along it without getting weaker.",
                myelin: "Myelin: segments of fatty insulation wrapped around the axon. They make the spike jump from gap to gap, which speeds it up.",
                node: "Nodes of Ranvier: the small bare gaps between myelin segments, where the spike is regenerated.",
                term: "Axon terminals: the ends that release neurotransmitter onto the next cell. This is where the electrical signal turns chemical.",
                target: "The next cell. It receives the neurotransmitter on its receptors."
            },
            read: function (c) {

                const d = c.data;

                if (!d) { return {}; }

                return {
                    where: d.x < -0.3 ? "Dendrites" : d.x < 0.6 ? "Cell body" : d.x < 6.5 ? "Axon" : "Terminals",
                    speed: state(c).myelin === "on" ? "Fast: it jumps node to node" : "Slow: a smooth crawl",
                    time: d.done ? d.time.toFixed(1) + " s (scaled)" : d.firing ? "…" : "Press Fire",
                    verdict: state(c).myelin === "on" ? "Myelin lets the spike jump between nodes, so it arrives quickly" : "Without myelin the spike has to regenerate everywhere along the axon, so it is slow"
                };
            },
            reward: { when: function (c) { return c.data && c.data.fires >= 2 && c.count() >= 3; }, msg: "You fired a neuron and compared fast and slow axons" },
            act: function (c, id) { if (id === "fire") { c.data.fire(); } },
            onChange: function (c) { c.data.applyMyelin(); },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const NS = 48;
                const L0 = 0.55;
                const L1 = 6.5;
                const rand = mulberry(3);

                d.x = -1.8;
                d.firing = false;
                d.done = false;
                d.time = 0;
                d.fires = 0;
                d.flash = 0;

                s.scene.add(g);
                s.shadow(g, 14, 5);

                const cellM = s.mat(0xe0b4ff, { roughness: 0.4, metalness: 0.05 });
                const somaM = s.mat(0xe0b4ff, { roughness: 0.35 });
                const nucM = s.mat(0x6d3fb0, { roughness: 0.5 });

                // soma, with a nucleus inside a glass shell
                const soma = s.sph(0.55, s.glass(0xe0b4ff, 0.55, false), 0, 0.2, 0, 28);

                s.part(g, "soma", soma, [soma.material]);
                g.add(s.sph(0.22, nucM, 0, 0.2, 0, 18));

                // dendrites: a few branching tubes
                const dm = s.mat(0xd7a8ff, { roughness: 0.45 });
                const dend = [];
                const dirs = [[-1, 0.3, 0.2], [-0.9, -0.5, 0.5], [-0.8, 0.8, -0.4], [-0.6, -0.4, -0.8], [-0.5, 0.9, 0.5], [-0.3, 0.1, 1]];

                dirs.forEach(function (v, i) {

                    const len = 1.4 + rand() * 0.6;
                    const m = Math.hypot(v[0], v[1], v[2]);
                    const p0 = [v[0] / m * 0.5, 0.2 + v[1] / m * 0.5, v[2] / m * 0.5];
                    const p1 = [v[0] / m * len * 0.6, 0.2 + v[1] / m * len * 0.6 + 0.1, v[2] / m * len * 0.6];
                    const p2 = [v[0] / m * len, 0.2 + v[1] / m * len, v[2] / m * len];

                    dend.push(s.tube([p0, p1, p2], 0.045, dm, 14));

                    // two little twigs
                    [-1, 1].forEach(function (k) {

                        dend.push(s.tube([p1, [p1[0] + v[0] * 0.2 - k * 0.2, p1[1] + k * 0.3, p1[2] + 0.2 * k], [p1[0] - 0.45, p1[1] + k * 0.45, p1[2] + 0.1 * k]], 0.028, dm, 10));
                    });
                });

                s.part(g, "dend", dend, [dm]);

                // axon: instanced segments, so each can light up as the pulse passes
                const axM = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0x000000 });
                const axI = s.inst(NS, new T.CylinderGeometry(0.07, 0.07, (L1 - L0) / NS * 1.02, 10), axM);
                const segLen = (L1 - L0) / NS;

                for (let i = 0; i < NS; i++) { axI.xform(i, L0 + segLen * (i + 0.5), 0.2, 0, 0, 0, Math.PI / 2); axI.color(i, 0xd7a8ff); }

                axI.flush();
                s.part(g, "axon", axI.mesh, [axM]);

                // myelin sheaths with nodes between them
                const NM = 11;
                const mySeg = (L1 - L0) / NM;
                const myM = s.mat(0xfff0b8, { roughness: 0.5 });
                const myI = s.inst(NM, new T.CylinderGeometry(0.2, 0.2, mySeg * 0.86, 20), myM);

                for (let i = 0; i < NM; i++) { myI.xform(i, L0 + mySeg * (i + 0.5), 0.2, 0, 0, 0, Math.PI / 2); }

                myI.flush();
                s.part(g, "myelin", myI.mesh, [myM]);

                // node markers
                const ndM = s.mat(0xff9fb0, { roughness: 0.4, emissive: 0x000000 });
                const ndI = s.inst(NM - 1, new T.TorusGeometry(0.1, 0.03, 8, 20), ndM);

                for (let i = 0; i < NM - 1; i++) { ndI.xform(i, L0 + mySeg * (i + 1), 0.2, 0, 0, Math.PI / 2, 0); }

                ndI.flush();
                s.part(g, "node", ndI.mesh, [ndM]);

                // terminals and boutons
                const tm = s.mat(0xd7a8ff, { roughness: 0.45 });
                const bm = s.mat(0xffc94a, { roughness: 0.35, emissive: 0x000000 });
                const bout = [];
                const tp = [];

                [[1, 0.5, 0.3], [1, -0.1, -0.5], [1, -0.6, 0.4]].forEach(function (v) {

                    tp.push(s.tube([[L1, 0.2, 0], [L1 + 0.35, 0.2 + v[1] * 0.4, v[2] * 0.4], [L1 + 0.8, 0.2 + v[1], v[2]]], 0.045, tm, 12));

                    const b = s.sph(0.15, bm, L1 + 0.9, 0.2 + v[1], v[2], 14);

                    bout.push(b);
                });

                s.part(g, "term", tp.concat(bout), [tm, bm]);

                // the next cell
                const tgM = s.glass(0x7c8cff, 0.25, false);
                const tgt = s.box(1.0, 2.4, 2.4, tgM, 8.35, 0.2, 0);

                s.part(g, "target", tgt, [tgM]);

                // vesicles
                const vI = s.inst(18, new T.SphereGeometry(0.05, 8, 6), new T.MeshStandardMaterial({ color: 0xffc94a, emissive: 0x6a3a00 }));

                d.vs = [];

                for (let i = 0; i < 18; i++) { d.vs.push({ b: i % 3, t: -1, v: 0.7 + rand() * 0.6, o: [rand() - 0.5, rand() - 0.5] }); }

                g.add(vI.mesh);

                // the traveling spike
                const pulseM = new T.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffb800, emissiveIntensity: 1.4, transparent: true, opacity: 0.95 });
                const pulse = s.sph(0.17, pulseM, -1.8, 0.2, 0, 16);

                g.add(pulse);

                const labs = [["Dendrites", -1.0, 1.2], ["Cell body", 0, -0.7], ["Axon", 3.4, 0.7], ["Terminals", 7.0, 1.0], ["Next cell", 8.35, 1.6]];

                labs.forEach(function (l) { const lb = s.label(l[0]); lb.at = function () { return [l[1], l[2] + 0.2, 0]; }; });

                d.applyMyelin = function () {

                    myI.mesh.visible = state(c).myelin === "on";
                    ndI.mesh.visible = state(c).myelin === "on";
                };

                d.fire = function () {

                    d.x = -1.8;
                    d.firing = true;
                    d.done = false;
                    d.time = 0;
                    d.fires++;
                };

                d.axI = axI;
                d.pulse = pulse;
                d.pulseM = pulseM;
                d.bm = bm;
                d.tgM = tgM;
                d.ndM = ndM;
                d.vI = vI;
                d.L0 = L0;
                d.L1 = L1;
                d.NS = NS;
                d.segLen = segLen;
                d.mySeg = mySeg;
                d.tmpC = new T.Color();
                d.base = new T.Color(0xd7a8ff);
                d.hot = new T.Color(0xffd34a);
                d.applyMyelin();
                d.fire();
                d.fires = 0;
            },
            frame: function (c, dt) {

                const d = c.data;
                const my = state(c).myelin === "on";

                if (d.firing) {

                    d.time += dt;

                    const inAxon = d.x > d.L0 && d.x < d.L1;
                    const v = inAxon ? (my ? 2.4 : 0.5) : 1.6;

                    d.x += v * dt;

                    if (d.x >= 7.3) {

                        d.firing = false;
                        d.done = true;
                        d.flash = 1;
                        d.vs.forEach(function (q) { q.t = 0; });
                    }
                }

                // pulse sphere
                const px = clamp(d.x, -1.8, 7.3);

                d.pulse.position.x = px;
                d.pulse.visible = d.firing;
                d.pulse.scale.setScalar(1 + Math.sin(d.time * 20) * 0.1);

                // axon segments light up near the pulse
                for (let i = 0; i < d.NS; i++) {

                    const cx = d.L0 + d.segLen * (i + 0.5);
                    const k = d.firing ? Math.exp(-Math.pow((cx - px) / (my ? 0.18 : 0.38), 2)) : 0;

                    d.tmpC.copy(d.base).lerp(d.hot, k);
                    d.axI.color(i, d.tmpC.getHex());
                }

                d.axI.flush();

                // nodes flash when the spike is at them
                const nodeHit = d.firing && my ? Math.max(0, 1 - Math.abs(((px - d.L0) % d.mySeg) - 0) / 0.2) : 0;

                d.ndM.emissive.setRGB(nodeHit, nodeHit * 0.3, nodeHit * 0.3);

                // release: vesicles drift to the next cell and the target flashes
                d.flash = Math.max(0, d.flash - dt * 1.4);
                d.tgM.emissive = d.tgM.emissive || new c.S.T.Color(0, 0, 0);
                d.tgM.emissive.setRGB(0.2 * d.flash, 0.3 * d.flash, 0.9 * d.flash);
                d.bm.emissive.setRGB(0.6 * d.flash, 0.35 * d.flash, 0);

                d.vs.forEach(function (q, i) {

                    if (q.t >= 0) {

                        q.t += dt * q.v * 0.7;

                        const by = 0.2 + [0.5, -0.1, -0.6][q.b];
                        const bz = [0.3, -0.5, 0.4][q.b];
                        const u = Math.min(1, q.t);

                        d.vI.set(i, d.L1 + 0.9 + u * 0.9, by + u * (q.o[0] * 0.5), bz + u * (q.o[1] * 0.5), u < 1 ? 1 : 0.0001);

                        if (q.t > 1.4) { q.t = -1; d.vI.hide(i); }

                    } else {

                        d.vI.hide(i);
                    }
                });

                d.vI.flush();
            }
        });

        function state(c) { return c.state; }

        // ================================================================
        // UNIT 5: THE MESSENGERS
        // ================================================================
        const MOL = [
            { k: "glut", n: "Glutamate", mw: 147, q: -1, fam: "Amino acid", job: "The main excitatory transmitter", hex: 0xff8a5c },
            { k: "gaba", n: "GABA", mw: 103, q: 0, fam: "Amino acid", job: "The main inhibitory transmitter", hex: 0x5fb1ff },
            { k: "dopa", n: "Dopamine", mw: 153, q: 1, fam: "Monoamine", job: "Reward, motivation, and movement", hex: 0xffc94a },
            { k: "sero", n: "Serotonin", mw: 176, q: 1, fam: "Monoamine", job: "Mood, sleep, and appetite", hex: 0x9b7bff },
            { k: "ach", n: "Acetylcholine", mw: 146, q: 1, fam: "Choline-based", job: "Muscle control, attention, and memory", hex: 0x54e0c7 },
            { k: "ne", n: "Norepinephrine", mw: 169, q: 1, fam: "Monoamine", job: "Alertness and the stress response", hex: 0xff6f7e }
        ];

        function molInfo(m) {

            const ch = m.q > 0 ? "a positive charge at body pH" + (m.k === "ach" ? " (permanently positive)" : "") : m.q < 0 ? "a net negative charge at body pH" : "both a positive and a negative group, so it is roughly neutral overall";

            return m.n + ": about " + m.mw + " daltons. " + m.fam + ". " + m.job + ". It carries " + ch + ".";
        }

        D("nt-3d-messengers", {

            title: "Explore in 3D: the messengers, drawn to scale",
            intro: "Click a molecule. Then switch to Charge and slide the electrode voltage to see charge decide how they move.",
            stats: [["Picked", "pick"], ["Weight (daltons)", "mw"], ["Charge at body pH", "chg"]],
            defaults: { mode: "size", volt: 0 },
            controls: [
                { seg: "mode", label: "Show", options: [["size", "Size"], ["charge", "Charge"]] },
                { slider: "volt", label: "Voltage on the sensor surface (V)", min: -0.5, max: 0.5, step: 0.05, fmt: function (v) { return (v > 0 ? "+" : "") + v.toFixed(2) + " V"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "Sphere volume is proportional to molecular weight, so radius scales with the cube root. All six messengers are under 200 daltons, tiny next to an antibody at about 150,000 daltons (the large Y-shaped protein at the back). Charge matters for sensors, because many sense charge: a positive molecule is pulled toward a negative surface, a negative one is pushed away, and a neutral one ignores it. (Drawn as simple spheres.)",
            stage: { target: [0, 0.9, 0], halfWidth: 6.6, views: { three: [0.35, 1.2], front: [0, 1.45], top: [0, 0.4] }, home: "three", sway: [0.3, 0.25] },
            info: (function () {

                const o = {};

                MOL.forEach(function (m) { o[m.k] = function () { return molInfo(m); }; });
                o.ab = "An antibody: about 150,000 daltons, roughly a thousand times the weight of a neurotransmitter, and about ten times its width. Compare it with the six small messengers.";
                o.plate = "A sensor surface. A positive voltage attracts negative molecules and repels positive ones, and the reverse for a negative voltage.";

                return o;
            })(),
            read: function (c) {

                const pk = c.data.pick ? MOL.find(function (m) { return m.k === c.data.pick; }) : null;

                return {
                    pick: pk ? pk.n : "None yet",
                    mw: pk ? pk.mw : "-",
                    chg: pk ? (pk.q > 0 ? "Positive" : pk.q < 0 ? "Negative" : "Neutral overall") : "-",
                    verdict: c.state.mode === "size" ? "All six are tiny compared with an antibody" : "Charge decides how they behave near a charged surface"
                };
            },
            reward: { when: function (c) { return c.count() >= 4 && c.data.volt; }, msg: "You compared the messengers by size and charge" },
            onChange: function (c, keys) { if (keys.indexOf("volt") >= 0) { c.data.volt = true; } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                s.scene.add(g);
                s.shadow(g, 14, 6);
                d.volt = false;
                d.mols = [];

                // sensor plate on the left
                const plateM = s.mat(0xc2c6d2, { metalness: 0.75, roughness: 0.28, emissive: 0x000000 });
                const plate = s.box(0.12, 3.2, 3.6, plateM, -5.2, 1.5, 0);

                s.part(g, "plate", plate, [plateM]);

                MOL.forEach(function (m, i) {

                    const r = 0.22 * Math.pow(m.mw / 100, 1 / 3);
                    const mat = s.mat(m.hex, { roughness: 0.3, metalness: 0.1, emissive: 0x000000 });
                    const mesh = s.sph(r, mat, 0, 0, 0, 24);
                    const halo = new T.Mesh(new T.SphereGeometry(r * 1.55, 20, 16), new T.MeshBasicMaterial({ color: m.q > 0 ? 0xff5a6a : m.q < 0 ? 0x5a8cff : 0xffffff, transparent: true, opacity: 0.0, depthWrite: false }));
                    const sign = s.label(m.q > 0 ? "+" : m.q < 0 ? "−" : "±");
                    const nm = s.label(m.n);
                    const ox = -3.2 + i * 1.3;
                    const rec = { m: m, mesh: mesh, halo: halo, r: r, ox: ox, x: ox, z: (i % 2 ? 0.5 : -0.5), sign: sign };

                    mesh.position.set(ox, 0.5 + r, rec.z);
                    halo.position.copy(mesh.position);
                    g.add(halo);
                    s.part(g, m.k, mesh, [mat]);
                    d.mols.push(rec);
                    nm.at = function () { return [rec.x, 0.1, rec.z, 0, 22]; };
                    sign.at = function () { return [rec.x, 0.5 + r * 2 + 0.2, rec.z]; };
                });

                // the antibody: a Y made of three big spheres
                const abM = s.mat(0xd8dcf0, { roughness: 0.4 });
                const ab = new T.Group();

                [[0, 0.9, 0], [-0.8, 2.0, 0], [0.8, 2.0, 0]].forEach(function (p, i) { ab.add(s.sph(i === 0 ? 0.62 : 0.55, abM, p[0], p[1], p[2], 24)); });
                ab.position.set(3.6, 0.2, -1.4);
                ab.children.forEach(function (m) { m.userData.part = null; });
                s.part(g, "ab", ab.children.slice(), [abM]);
                g.add(ab);

                const al = s.label("Antibody (150,000 Da)");

                al.at = function () { return [3.6, 3.1, -1.4]; };

                d.plate = plateM;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const ch = c.state.mode === "charge";
                const V = c.state.volt;

                d.mols.forEach(function (r, i) {

                    const push = r.m.q * V * 2.0;     // positive molecules move toward a negative surface (left)
                    const target = r.ox + (ch ? push : 0);

                    r.x += (target - r.x) * Math.min(1, dt * 3);
                    r.mesh.position.x = r.x;
                    r.mesh.position.y = 0.5 + r.r + Math.sin(t * 1.5 + i) * 0.06;
                    r.halo.position.copy(r.mesh.position);
                    r.halo.material.opacity += ((ch ? 0.32 : 0) - r.halo.material.opacity) * Math.min(1, dt * 4);
                    r.sign.el.style.opacity = ch ? "1" : "0";
                });

                d.plate.emissive.setRGB(V > 0 ? 0.5 * V : 0, 0.05, V < 0 ? -0.5 * V : 0);

                d.pick = c.S.selected() ? c.S.selected().key : d.pick;
            }
        });

        // ================================================================
        // UNIT 10: IONOTROPIC AND METABOTROPIC RECEPTORS
        // ================================================================
        D("nt-3d-receptors", {

            title: "Explore in 3D: two kinds of receptor",
            intro: "Press Release to send transmitter at both receptors, and compare the speed and the size of each response.",
            stats: [["Ionotropic (the door)", "io"], ["Metabotropic (the doorbell)", "meta"], ["Second messengers made", "msg"]],
            defaults: { amp: 6 },
            controls: [
                { actions: [["release", "💥 Release transmitter"], ["clear", "↺ Clear"]], label: "Transmitter" },
                { slider: "amp", label: "Amplification: messengers per activated enzyme", min: 1, max: 12, step: 1, fmt: function (v) { return v + "×"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "An ionotropic receptor is also an ion channel: binding opens it directly, and ions flow within about a millisecond. A metabotropic receptor activates a G protein, which starts a signaling cascade inside the cell. It is slower, from tens of milliseconds to seconds, but one bound receptor can trigger many downstream molecules, so the effect is amplified and lasts longer. (Time is stretched so you can see it.)",
            stage: { target: [0, 1.6, 0], halfWidth: 5.8, views: { three: [0.45, 1.3], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.35, 0.25] },
            info: {
                memb: "The cell membrane: a double layer of lipids. Charged ions cannot cross it on their own, so signals use receptors built into it.",
                io: "An ionotropic receptor: a channel made of subunits around a central pore. When a transmitter binds, the pore opens and ions flow through at once.",
                meta: "A metabotropic receptor: it does not open a pore. Binding changes its shape and wakes up a G protein on the inside.",
                gprot: "The G protein: a relay inside the membrane. Activated by the receptor, it drifts to an enzyme and switches it on.",
                enz: "The effector enzyme: once on, it makes many second messengers, so one receptor can drive a big response.",
                trans: "Transmitter molecules released from the sending cell above. Each can bind a receptor for a moment.",
                ions: "Ions streaming through the open channel. This changes the cell's voltage within about a millisecond.",
                msgs: "Second messengers: small molecules made in bulk by the enzyme. One bound receptor can create many of them: amplification."
            },
            read: function (c) {

                const d = c.data;

                if (!d.io) { return {}; }

                return {
                    io: d.ioT < 0 ? "Waiting" : d.ioOpen ? "Open: ions flowing (" + d.ioT.toFixed(1) + " s)" : "Closed again",
                    meta: d.mT < 0 ? "Waiting" : d.mStage === 0 ? "Binding…" : d.mStage === 1 ? "G protein moving…" : "Enzyme on",
                    msg: d.nMsg,
                    verdict: d.ioT < 0 ? "Press Release to see both receptors answer" : d.nMsg === 0 ? "The door has already opened; the doorbell is still ringing" : "The doorbell is slower, but one receptor now makes many messengers"
                };
            },
            reward: { when: function (c) { return c.data.nMsg >= 12 && c.count() >= 3; }, msg: "You saw the door and the doorbell" },
            act: function (c, id) { if (id === "release") { c.data.release(); } else { c.data.clear(); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(10);

                s.scene.add(g);
                s.shadow(g, 12, 5);

                // the membrane: a slab with rows of lipid heads on top and below
                const mem = s.glass(0xe0b4ff, 0.14, false);
                const slab = s.box(10, 0.5, 4, mem, 0, 1.5, 0);

                s.part(g, "memb", slab, [mem], true);

                const lipM = s.mat(0xd7a8ff, { roughness: 0.5 });
                const NL = 150;
                const lip = s.inst(NL * 2, new T.SphereGeometry(0.075, 10, 8), lipM);

                for (let i = 0; i < NL; i++) {

                    const x = -4.7 + (i % 25) * 0.39;
                    const z = -1.8 + Math.floor(i / 25) * 0.7 + ((i % 2) ? 0.2 : 0);

                    if (Math.abs(x + 2.2) < 0.85 || Math.abs(x - 2.0) < 0.75) { lip.hide(i); lip.hide(i + NL); continue; }

                    lip.set(i, x, 1.78, z);
                    lip.set(i + NL, x, 1.22, z);
                }

                lip.flush();
                g.add(lip.mesh);

                // ionotropic receptor: four subunits round a pore
                const ioM = s.mat(0x54c9b0, { roughness: 0.35, metalness: 0.1, emissive: 0x000000 });
                const sub = [];

                for (let i = 0; i < 4; i++) {

                    const m = s.cyl(0.26, 0.26, 1.2, ioM, 0, 1.5, 0, 14);

                    sub.push(m);
                }

                s.part(g, "io", sub, [ioM]);
                d.ioCx = -2.2;

                // the plug that opens
                const plugM = s.mat(0xff8a5c, { roughness: 0.4 });
                const plug = s.cyl(0.16, 0.16, 0.5, plugM, d.ioCx, 1.5, 0, 12);

                g.add(plug);

                // metabotropic receptor: seven helices
                const meM = s.mat(0x9b7bff, { roughness: 0.35, emissive: 0x000000 });
                const hel = [];

                for (let i = 0; i < 7; i++) {

                    const a = i / 7 * Math.PI * 2;
                    const m = s.cyl(0.1, 0.1, 1.15, meM, 2.0 + Math.cos(a) * 0.3, 1.5, Math.sin(a) * 0.3, 10);

                    hel.push(m);
                }

                s.part(g, "meta", hel, [meM]);
                d.meCx = 2.0;

                // G protein under the membrane, and the enzyme beside it
                const gpM = s.mat(0xffc94a, { roughness: 0.4, emissive: 0x000000 });
                const gp = s.sph(0.24, gpM, 2.0, 0.75, 0, 16);

                s.part(g, "gprot", gp, [gpM]);

                const enzM = s.mat(0xff6f7e, { roughness: 0.4, emissive: 0x000000 });
                const enz = s.box(0.7, 0.5, 0.7, enzM, 3.7, 0.9, 0);

                s.part(g, "enz", enz, [enzM]);

                const sMat = new T.MeshStandardMaterial({ color: 0xffc94a, emissive: 0x6a3a00, roughness: 0.3 });
                const trs = s.inst(30, new T.SphereGeometry(0.15, 12, 10), sMat);

                s.part(g, "trans", trs.mesh, [sMat]);

                const iMat = new T.MeshStandardMaterial({ color: 0x5fb1ff, emissive: 0x0a2a4a, roughness: 0.3 });
                const ions = s.inst(24, new T.SphereGeometry(0.11, 12, 10), iMat);

                s.part(g, "ions", ions.mesh, [iMat]);

                const mMat = new T.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68, roughness: 0.3 });
                const msgs = s.inst(60, new T.SphereGeometry(0.09, 10, 8), mMat);

                s.part(g, "msgs", msgs.mesh, [mMat]);

                // outside the cell: a few ions at rest above the membrane
                d.sub = sub; d.plug = plug; d.hel = hel; d.gp = gp; d.gpM = gpM; d.enz = enz; d.enzM = enzM; d.ioM = ioM; d.meM = meM;
                d.trs = trs; d.ions = ions; d.msgs = msgs; d.rand = rand;
                d.io = true;

                function reset() {

                    d.tr = [];
                    d.ioT = -1;
                    d.mT = -1;
                    d.ioOpen = false;
                    d.mStage = -1;
                    d.nMsg = 0;
                    d.ionList = [];
                    d.msgList = [];
                    d.mt = 0;
                }

                d.clear = function () { reset(); };

                d.release = function () {

                    reset();
                    d.ioT = 0;
                    d.mT = 0;
                    d.mStage = 0;

                    for (let i = 0; i < 30; i++) {

                        const toIo = i < 14;

                        d.tr.push({ x: (toIo ? d.ioCx : d.meCx) + (rand() - 0.5) * 1.4, y: 3.8 + rand() * 1.6, z: (rand() - 0.5) * 1.2, v: 1.4 + rand() * 0.8, io: toIo, bound: false, t: 0 });
                    }
                };

                reset();

                const l1 = s.label("Ionotropic: a door");
                const l2 = s.label("Metabotropic: a doorbell");

                l1.at = function () { return [-2.2, 3.0, 0]; };
                l2.at = function () { return [2.9, 3.0, 0]; };

                const lo = s.label("outside the cell");
                const li = s.label("inside the cell");

                lo.at = function () { return [-4.6, 3.4, 0]; };
                li.at = function () { return [-4.6, 0.2, 0]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;

                if (!d.io) { return; }

                // transmitter falling in
                d.tr.forEach(function (p) {

                    if (!p.bound) {

                        p.y -= p.v * dt;
                        p.x += Math.sin(t * 3 + p.z * 5) * 0.2 * dt;

                        const tx = p.io ? d.ioCx : d.meCx;

                        if (p.y <= 2.2) {

                            p.y = 2.2;
                            p.x += (tx - p.x) * Math.min(1, dt * 8);

                            if (Math.abs(p.x - tx) < 0.18) { p.bound = true; }
                        }
                    }

                    if (p.bound) { p.t += dt; }
                });

                d.tr.forEach(function (p, i) { d.trs.set(i, p.x, p.y, p.z, p.bound && p.t > 0.9 ? 0.0001 : 1); });

                for (let i = d.tr.length; i < 30; i++) { d.trs.hide(i); }

                d.trs.flush();

                // ionotropic: opens a moment after the first transmitter binds
                const ioBound = d.tr.some(function (p) { return p.io && p.bound; });

                if (ioBound && d.ioT >= 0) { d.ioT += dt; }

                d.ioOpen = ioBound && d.ioT > 0 && d.ioT < 3.2;

                const open = d.ioOpen ? Math.min(1, d.ioT * 6) : 0;

                d.sub.forEach(function (m, i) {

                    const a = i / 4 * Math.PI * 2 + 0.4;
                    const r = 0.3 + open * 0.15;

                    m.position.set(d.ioCx + Math.cos(a) * r, 1.5, Math.sin(a) * r);
                });

                d.plug.position.y = 1.5 + open * 1.3;
                d.plug.visible = open < 0.95;
                d.ioM.emissive.setRGB(0.15 * open, 0.5 * open, 0.4 * open);

                // ions streaming through the open channel
                if (d.ioOpen && d.rand() < dt * 18 && d.ionList.length < 24) { d.ionList.push({ x: d.ioCx + (d.rand() - 0.5) * 0.2, y: 3.0, z: (d.rand() - 0.5) * 0.2, v: 1.8 + d.rand() }); }

                d.ionList.forEach(function (p) { p.y -= p.v * dt; });
                d.ionList = d.ionList.filter(function (p) { return p.y > 0.2; });

                for (let i = 0; i < 24; i++) {

                    if (i < d.ionList.length) { d.ions.set(i, d.ionList[i].x, d.ionList[i].y, d.ionList[i].z); } else { d.ions.hide(i); }
                }

                d.ions.flush();

                // metabotropic: binds, then a delay, then the G protein moves, then the enzyme makes messengers
                const meBound = d.tr.some(function (p) { return !p.io && p.bound; });

                if (meBound && d.mT >= 0) { d.mT += dt; }

                d.mStage = !meBound ? 0 : d.mT < 1.2 ? 0 : d.mT < 2.2 ? 1 : 2;

                const gpGo = clamp((d.mT - 1.0) / 1.2, 0, 1);

                d.gp.position.x = d.meCx + (3.7 - 0.5 - d.meCx) * gpGo;
                d.gp.position.y = 0.75 + (1.0 - 0.75) * gpGo;
                d.meM.emissive.setRGB(0.4 * (meBound ? 1 : 0), 0.2 * (meBound ? 1 : 0), 0.6 * (meBound ? 1 : 0));
                d.gpM.emissive.setRGB(gpGo * 0.7, gpGo * 0.4, 0);

                const on = d.mStage === 2;

                d.enzM.emissive.setRGB(on ? 0.6 : 0, on ? 0.1 : 0, 0);

                if (on && d.rand() < dt * 3 * c.state.amp && d.msgList.length < 60) { d.msgList.push({ x: 3.7 + (d.rand() - 0.5) * 0.4, y: 1.2, z: (d.rand() - 0.5) * 0.4, vx: (d.rand() - 0.5) * 0.7, vy: 0.3 + d.rand() * 0.4, vz: (d.rand() - 0.5) * 0.7 }); d.nMsg++; }

                d.msgList.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt * 0.5; p.z += p.vz * dt; p.y = clamp(p.y, 0.15, 1.1); p.x = clamp(p.x, 2.7, 4.8); p.z = clamp(p.z, -1.4, 1.4); });

                for (let i = 0; i < 60; i++) {

                    if (i < d.msgList.length) { d.msgs.set(i, d.msgList[i].x, d.msgList[i].y, d.msgList[i].z); } else { d.msgs.hide(i); }
                }

                d.msgs.flush();
            }
        });

        // ================================================================
        // UNIT 14: WHY MEASURING IS HARD
        // ================================================================
        D("nt-3d-measure", {

            title: "Explore in 3D: finding one molecule in a crowd",
            intro: "Release a burst of dopamine and watch the electrode. Then change how selective it is.",
            stats: [["Dopamine near the tip", "da"], ["Look-alikes near the tip", "asc"], ["The electrode reports", "read"], ["Error", "err"]],
            defaults: { sel: 10 },
            controls: [
                { actions: [["burst", "💥 Release a burst of dopamine"]], label: "Release" },
                { slider: "sel", label: "Selectivity (log scale): how well the electrode ignores look-alikes", min: 0, max: 5, step: 0.1, fmt: function (v) { return "×" + Math.round(Math.pow(10, v)).toLocaleString("en-US"); } },
                { views: ["three", "front", "top"] }
            ],
            formula: "A release event is fast (about a millisecond to a second), the cleft is tens of nanometers wide, dopamine sits at nanomolar levels, and vitamin C and other look-alikes are present at hundreds of micromolar, thousands of times more. A sensor must be fast, tiny, sensitive and selective at once. Reading = dopamine + look-alikes ÷ selectivity. (Counts are scaled down: the real ratio is thousands to one.)",
            stage: { target: [0, 2.0, 0], halfWidth: 4.6, views: { three: [0.5, 1.2], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.45, 0.3] },
            info: {
                tip: "A carbon-fiber microelectrode tip, about 5 to 7 micrometers wide. It oxidizes whatever reaches it that reacts at the right voltage, including look-alikes.",
                da: "Dopamine, released in a burst from the terminal above. Its level is only nanomolar, and it is cleared within about a second.",
                asc: "Look-alikes such as ascorbic acid (vitamin C) and metabolites: far more of them, and they can react at the electrode too.",
                term: "The sending terminal, about a micrometer across. A release burst lasts about a second or less.",
                fluid: "The extracellular fluid, crowded with many small molecules."
            },
            read: function (c) {

                const d = c.data;

                if (d.nDa === undefined) { return {}; }

                const sel = Math.pow(10, c.state.sel);
                const rd = d.nDa + d.nAsc / sel;
                const err = d.nDa > 0 ? (rd - d.nDa) / d.nDa : 0;

                return {
                    da: Math.round(d.nDa),
                    asc: Math.round(d.nAsc),
                    read: rd.toFixed(1) + " (units)",
                    err: d.nDa < 0.5 ? "-" : err < 0.05 ? "none" : "+" + Math.round(err * 100) + " %",
                    verdict: d.nDa < 0.5 ? "Release a burst to see the electrode respond" : err > 1 ? "The look-alikes swamp the signal: you cannot tell dopamine from the crowd" : err > 0.15 ? "Still contaminated by look-alikes" : "Selective enough: the reading follows the dopamine"
                };
            },
            reward: { when: function (c) { const d = c.data; return d.bursts >= 2 && c.state.sel >= 3.5 && c.count() >= 2; }, msg: "You picked one molecule out of the crowd" },
            act: function (c, id) { if (id === "burst") { c.data.burst(); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(14);
                const NA = 420;
                const ND = 40;

                s.scene.add(g);
                s.shadow(g, 7, 5);

                // the volume of fluid
                const gl = s.glass(0x9fb8f0, 0.1, false);
                const box = s.box(5, 4, 3, gl, 0, 2.0, 0);

                s.part(g, "fluid", box, [gl], true);

                const ed = new T.LineSegments(new T.EdgesGeometry(box.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.35 }));

                ed.position.copy(box.position);
                g.add(ed);

                // sending terminal on the left wall
                const tm = s.mat(0x54c9b0, { roughness: 0.45 });
                const term = s.sph(0.9, tm, -2.4, 2.0, 0, 24);

                term.scale.set(0.7, 1, 1);
                s.part(g, "term", term, [tm]);

                // carbon-fiber electrode from the top
                const em = s.mat(0xd9dae6, { metalness: 0.5, roughness: 0.25, emissive: 0x000000 });
                const shaft = s.cyl(0.08, 0.08, 3.4, em, 1.0, 3.9, 0, 12);
                const tip = s.cyl(0.07, 0.04, 0.7, em, 1.0, 2.0, 0, 12);

                s.part(g, "tip", [shaft, tip], [em]);

                const aM = new T.MeshStandardMaterial({ color: 0xff6f7e, roughness: 0.4, transparent: true, opacity: 0.8 });
                const asc = s.inst(NA, new T.SphereGeometry(0.055, 8, 6), aM);

                s.part(g, "asc", asc.mesh, [aM]);

                const dM = new T.MeshStandardMaterial({ color: 0xffb04a, emissive: 0x6a3a00, roughness: 0.3 });
                const da = s.inst(ND, new T.SphereGeometry(0.14, 14, 12), dM);

                s.part(g, "da", da.mesh, [dM]);

                d.asc = []; d.da = [];

                for (let i = 0; i < NA; i++) { d.asc.push({ x: (rand() - 0.2) * 4.2 - 0.4, y: 0.2 + rand() * 3.6, z: (rand() - 0.5) * 2.8, ph: rand() * 6 }); }
                for (let i = 0; i < ND; i++) { d.da.push({ x: -2.0, y: 2.0, z: 0, vx: 0, vy: 0, vz: 0, live: false, age: 0 }); }

                d.ascIM = asc; d.daIM = da; d.em = em; d.tmpMsg = 0;
                d.nDa = 0; d.nAsc = 0; d.bursts = 0; d.tipPos = new T.Vector3(1.0, 2.0, 0);

                d.burst = function () {

                    d.bursts++;

                    d.da.forEach(function (p) {

                        p.x = -1.9 + rand() * 0.2;
                        p.y = 2.0 + (rand() - 0.5) * 0.8;
                        p.z = (rand() - 0.5) * 0.8;
                        p.vx = 0.8 + rand() * 1.2;
                        p.vy = (rand() - 0.5) * 0.6;
                        p.vz = (rand() - 0.5) * 0.6;
                        p.live = true;
                        p.age = -rand() * 0.5;
                    });
                };

                const lt = s.label("Carbon-fiber electrode");

                lt.at = function () { return [1.0, 4.0, 0, 0, -16]; };

                const l2 = s.label("Sending terminal");

                l2.at = function () { return [-2.4, 3.2, 0]; };

                const l3 = s.label("Dopamine (orange) in a crowd of look-alikes (rose)");

                l3.at = function () { return [0, -0.1, 1.6, 0, 18]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const tip = d.tipPos;
                let nearD = 0;
                let nearA = 0;

                d.asc.forEach(function (p, i) {

                    d.ascIM.set(i, p.x + Math.sin(t * 0.9 + p.ph) * 0.1, p.y + Math.cos(t * 0.8 + p.ph * 1.3) * 0.1, p.z + Math.sin(t * 0.7 + p.ph * 2) * 0.1);

                    if (Math.hypot(p.x - tip.x, p.y - tip.y, p.z - tip.z) < 0.95) { nearA++; }
                });

                d.ascIM.flush();

                d.da.forEach(function (p, i) {

                    if (!p.live) { d.daIM.hide(i); return; }

                    p.age += dt;

                    if (p.age < 0) { d.daIM.hide(i); return; }

                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.z += p.vz * dt;
                    p.vx *= 1 - dt * 0.7;

                    // reuptake clears it after a second or two
                    if (p.age > 3.2 + (i % 5) * 0.4 || p.x > 2.4) { p.live = false; d.daIM.hide(i); return; }

                    d.daIM.set(i, p.x, p.y, p.z);

                    if (Math.hypot(p.x - tip.x, p.y - tip.y, p.z - tip.z) < 0.95) { nearD++; }
                });

                d.daIM.flush();

                d.nDa += (nearD * 1.0 - d.nDa) * Math.min(1, dt * 8);
                d.nAsc += (nearA * 1.0 - d.nAsc) * Math.min(1, dt * 4);

                const sel = Math.pow(10, c.state.sel);
                const rd = d.nDa + d.nAsc / sel;
                const glow = clamp(rd / 20, 0, 1);

                d.em.emissive.setRGB(glow * 0.9, glow * 0.55, glow * 0.1);
            }
        });

        document.querySelectorAll('.fd-sim[data-sim^="nt-3d-"]').forEach(F.mount);
    }

})();
