/* ========================================
   BIOFETS AND MOSFETS: 3D SCENES

   Unit 1:  a MOSFET: the gate field makes a channel and the drain pulls current through it.
   Unit 8:  an ISFET: the metal gate is replaced by a liquid, and pH moves the threshold.
   Unit 14: a BioFET: receptors on the gate, and bound targets change the charge.
   Unit 20: Debye screening: why salt hides the charge you want to see.

   Built on diagram-sims-3d-core.js and the local three.js.
   Teaching models: sizes, voltages and currents are illustrative.
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

        const VTH = 1.0;
        const K = 100;              // µA per V², illustrative

        function drain(vg, vd, vth) {

            const vov = vg - vth;

            if (vov <= 0) { return { id: 0, mode: "cutoff" }; }

            if (vd < vov) { return { id: K * (vov * vd - vd * vd / 2), mode: "triode" }; }

            return { id: K / 2 * vov * vov, mode: "saturation" };
        }

        // The transistor body shared by all four scenes: a p-type block with n+ source and drain,
        // a thin oxide on top, and electrons that fill the channel.
        function buildBody(s, g, opts) {

            const T = s.T;
            const rand = mulberry(opts.seed || 2);
            const parts = {};

            const pm = s.glass(0x7c8cff, 0.2, false);
            const body = s.box(8.6, 1.5, 2.6, pm, 0, -0.75, 0);

            s.part(g, "body", body, [pm]);

            const nm = s.mat(0xff9a54, { roughness: 0.5, transparent: true, opacity: 0.55 });
            const src = s.box(2.0, 0.55, 2.6, nm, -3.3, -0.275, 0);
            const drn = s.box(2.0, 0.55, 2.6, nm, 3.3, -0.275, 0);

            s.part(g, "src", src, [nm]);
            s.part(g, "drn", drn, [nm]);

            // the depletion region under the channel
            const dm = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.5, depthWrite: false });
            const dep = s.box(4.4, 0.35, 2.6, dm, 0, -0.18, 0);

            s.part(g, "dep", dep, [dm], true);

            // oxide
            const om = s.glass(0xfff1c4, 0.65, false);
            const ox = s.box(4.4, 0.18, 2.6, om, 0, 0.09, 0);

            s.part(g, "ox", ox, [om]);

            // electrons
            const NE = 280;
            const em = new T.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68, roughness: 0.3 });
            const el = s.inst(NE, new T.SphereGeometry(0.1, 10, 8), em);

            s.part(g, "elec", el.mesh, [em]);

            const E = [];

            for (let i = 0; i < NE; i++) { E.push({ x: -4.2 + rand() * 8.4, z: (rand() - 0.5) * 2.3, u: rand(), ph: rand() * 6, y: -0.06 - rand() * 0.14, inW: i < 50 ? -1 : i < 100 ? 1 : 0 }); }

            return { rand: rand, el: el, E: E, NE: NE, dm: dm, dep: dep };
        }

        function placeElectrons(c, b, vg, vd, vth, dt, t) {

            const vov = vg - vth;
            const mx = Math.max(0.3, vov);

            b.E.forEach(function (e, i) {

                if (e.inW !== 0) {

                    // electrons waiting in the source and drain wells
                    const wx = e.inW * 3.3;

                    b.el.set(i, wx + (e.x % 1) * 0.8 + Math.sin(t + e.ph) * 0.04, -0.25 + Math.sin(t * 1.3 + e.ph) * 0.06, e.z);

                    return;
                }

                // electrons in the channel: density falls toward the drain as the drain voltage rises
                const frac = (e.x + 2.2) / 4.4;
                const local = vov > 0 ? clamp(vov - vd * frac, 0, 5) : 0;
                const show = local / mx > e.u * 0.9 && e.x > -2.2 && e.x < 2.2 && local > 0.02;

                if (!show) {

                    b.el.hide(i);
                    e.x += (0.2 + 0.4 * vd) * dt;

                    if (e.x > 2.4) { e.x = -2.4 + Math.random() * 0.3; }

                    return;
                }

                e.x += vd * Math.min(1.6, 0.4 + local) * 0.9 * dt;

                if (e.x > 2.2) { e.x = -2.2; }

                b.el.set(i, e.x, -0.05 - e.y * 0.2 * Math.min(1, 1 / (0.4 + local * 0.4)), e.z);
            });

            b.el.flush();
        }

        // ================================================================
        // UNIT 1: A MOSFET
        // ================================================================
        D("fet-3d-mosfet", {

            title: "Explore in 3D: a MOSFET",
            intro: "Raise the gate voltage past the threshold and watch a channel of electrons form. Then raise the drain voltage and watch the current flow.",
            stats: [["Gate voltage", "vg"], ["Mode", "mode"], ["Drain current", "id"]],
            defaults: { vg: 0.5, vd: 0.5 },
            controls: [
                { slider: "vg", label: "Gate voltage VG (V): the control", min: 0, max: 3, step: 0.05, fmt: function (v) { return v.toFixed(2) + " V"; } },
                { slider: "vd", label: "Drain voltage VD (V): the pull", min: 0, max: 3, step: 0.05, fmt: function (v) { return v.toFixed(2) + " V"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "A field-effect transistor has three terminals: the gate controls, the source is where charges enter the channel, and the drain is where they leave. The gate is insulated from the channel by an oxide, so its electric field, not a current, controls how many charges sit in the channel. Below the threshold (about 1 V here) there is no channel: cutoff. Above it, a channel of electrons forms, and the current is I<sub>D</sub> = k[(V<sub>GS</sub> − V<sub>th</sub>)V<sub>DS</sub> − V<sub>DS</sub>²/2] in the triode region and (k/2)(V<sub>GS</sub> − V<sub>th</sub>)² in saturation. (k = 100 µA/V², illustrative.)",
            stage: { target: [0, 0.8, 0], halfWidth: 5.6, halfHeight: 2.6, views: { three: [0.5, 1.15], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.4, 0.25] },
            info: {
                gate: "The gate: a metal electrode that sets the field. Its voltage, not a current, decides how many electrons sit in the channel.",
                ox: "The gate oxide: a thin insulator between the gate and the silicon. It lets the gate's field through but blocks current.",
                src: "The source: an n+ region where electrons enter the channel.",
                drn: "The drain: an n+ region where electrons leave the channel. A positive drain voltage pulls them in.",
                body: "The body: p-type silicon. With no gate voltage there are almost no free electrons between source and drain.",
                dep: "The depletion region: where the gate has pushed away holes and left fixed charges. It sits under the channel.",
                elec: "Electrons. A positive gate pulls them up to the oxide, forming the channel.",
                channel: "The channel: a thin layer of electrons at the oxide, formed when the gate voltage passes the threshold."
            },
            read: function (c) {

                const r = drain(c.state.vg, c.state.vd, VTH);

                return {
                    vg: c.state.vg.toFixed(2) + " V",
                    mode: r.mode === "cutoff" ? "Cutoff (no channel)" : r.mode === "triode" ? "Triode (channel to the drain)" : "Saturation (channel pinched off)",
                    id: r.id.toFixed(0) + " µA",
                    verdict: r.mode === "cutoff" ? "Below the threshold the gate has not made a channel, so the transistor is off" : r.mode === "triode" ? "The channel reaches the drain: current grows with both voltages" : "The channel has pinched off near the drain: the current stops depending on VD"
                };
            },
            reward: { when: function (c) { return c.data.seen && c.data.seen.cutoff && c.data.seen.triode && c.data.seen.saturation; }, msg: "You drove a MOSFET through all three modes" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const b = buildBody(s, g, { seed: 4 });

                c.data.b = b;
                c.data.seen = {};
                s.scene.add(g);
                s.shadow(g, 11, 5);

                const gm = s.mat(0xc2c6d2, { metalness: 0.6, roughness: 0.25, transparent: true, opacity: 0.32, depthWrite: false });
                const gate = s.box(4.4, 0.3, 2.6, gm, 0, 0.33, 0);

                s.part(g, "gate", gate, [gm]);

                // terminal posts with labels
                const post = function (x, hex, name, key) {

                    const m = s.mat(hex, { metalness: 0.6, roughness: 0.3 });
                    const p = s.cyl(0.14, 0.14, 0.8, m, x, 0.7, 0, 14);

                    g.add(p);
                    s.part(g, key, p, [m]);

                    const lb = s.label(name);

                    lb.at = function () { return [x, 1.4, 0]; };
                };

                post(-3.3, 0x6aa5ff, "Source", "src");
                post(0, 0xffd66a, "Gate", "gate");
                post(3.3, 0xff6f7e, "Drain", "drn");

                c.data.gate = gate;
            },
            frame: function (c, dt, t) {

                const r = drain(c.state.vg, c.state.vd, VTH);

                c.data.seen[r.mode] = true;
                c.data.gate.material.emissive = c.data.gate.material.emissive || new c.S.T.Color(0, 0, 0);
                c.data.gate.material.emissive.setRGB(0.1 * c.state.vg, 0.08 * c.state.vg, 0);
                c.data.b.dm.opacity = 0.12 + 0.05 * clamp(c.state.vg, 0, 3);
                placeElectrons(c, c.data.b, c.state.vg, c.state.vd, VTH, dt, t);
            }
        });

        // ================================================================
        // UNIT 8: THE ISFET
        // ================================================================
        const INS = {
            sio2: { name: "SiO₂", pzc: 2.5, sens: 30 },
            al2o3: { name: "Al₂O₃", pzc: 8.5, sens: 53 }
        };

        D("fet-3d-isfet", {

            title: "Explore in 3D: an ISFET, with a liquid gate",
            intro: "The metal gate is gone: a liquid sits on the insulator. Change the pH and watch the surface charge, the threshold and the current move.",
            stats: [["Surface charge", "chg"], ["Threshold shift", "dv"], ["Drain current", "id"]],
            defaults: { ph: 7, ins: "al2o3" },
            controls: [
                { seg: "ins", label: "Sensing insulator", options: [["sio2", "SiO₂ (about 30 mV/pH)"], ["al2o3", "Al₂O₃ (about 53 mV/pH)"]] },
                { slider: "ph", label: "pH of the solution", min: 2, max: 12, step: 0.1, fmt: function (v) { return "pH " + v.toFixed(1); } },
                { views: ["three", "front", "top"] }
            ],
            formula: "An ion-sensitive FET removes the metal gate: the insulator's surface touches a solution, and a reference electrode holds the liquid at a fixed, known voltage. Sites on the surface give up or take protons, so the surface charge depends on pH: below the point of zero charge it is positive, above it negative. Only one term of the threshold depends on the solution: V<sub>th</sub> = constants − ψ<sub>0</sub>, and ψ<sub>0</sub> changes with pH by up to 59 mV per pH unit (the Nernst limit). The MOSFET rules still apply. (Illustrative.)",
            stage: { target: [0, 1.0, 0], halfWidth: 5.6, halfHeight: 2.8, views: { three: [0.5, 1.15], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.4, 0.25] },
            info: {
                liq: "The electrolyte: water with dissolved ions. It conducts, so it can carry the gate voltage from the reference electrode to the insulator surface.",
                ref: "The reference electrode: holds the solution at a stable, known potential, so any change in the current comes from the surface, not from the liquid.",
                sites: "Surface sites on the insulator: each can be negative (SiO⁻), neutral (SiOH) or positive (SiOH₂⁺), depending on the pH next to the surface.",
                ox: "The sensing insulator. Its surface charge is set by how many sites are in each state.",
                src: "The source.", drn: "The drain.", body: "The silicon body: the transistor underneath is an ordinary MOSFET.", elec: "Electrons in the channel.",
                ions: "Mobile ions in the liquid: protons (red) and others. They crowd near a charged surface."
            },
            read: function (c) {

                const d = c.data;

                if (d.q === undefined) { return {}; }

                const dv = d.dv;

                return {
                    chg: d.q > 0.15 ? "Positive (+)" : d.q < -0.15 ? "Negative (−)" : "Near neutral",
                    dv: (dv >= 0 ? "+" : "") + dv.toFixed(0) + " mV",
                    id: d.id.toFixed(0) + " µA",
                    verdict: c.state.ph < INS[c.state.ins].pzc ? "Below the point of zero charge: the surface is positive" : c.state.ph > INS[c.state.ins].pzc ? "Above the point of zero charge: the surface is negative" : "At the point of zero charge: the surface is neutral"
                };
            },
            reward: { when: function (c) { return c.data.sawLow && c.data.sawHigh && c.count() >= 3; }, msg: "You moved an ISFET with pH" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(8);
                const NS = 60;
                const NI = 90;

                d.b = buildBody(s, g, { seed: 9 });
                d.sawLow = false; d.sawHigh = false; d.q = 0; d.dv = 0; d.id = 0;
                s.scene.add(g);
                s.shadow(g, 11, 5);

                // the liquid and its reference electrode
                const lm = new T.MeshStandardMaterial({ color: 0x7fe6d6, transparent: true, opacity: 0.12, roughness: 0.2, depthWrite: false });
                const liq = s.box(4.4, 2.0, 2.6, lm, 0, 1.18, 0);

                s.part(g, "liq", liq, [lm], true);

                const rm = s.mat(0xd9dae6, { metalness: 0.5, roughness: 0.3 });
                const ref = s.cyl(0.1, 0.1, 2.6, rm, 1.4, 2.4, 0, 12);

                s.part(g, "ref", ref, [rm]);

                const rl = s.label("Reference electrode");

                rl.at = function () { return [1.4, 3.8, 0]; };

                const l2 = s.label("Solution");

                l2.at = function () { return [-1.8, 2.0, 1.4]; };

                // surface sites on the insulator
                const sm = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
                const sites = s.inst(NS, new T.SphereGeometry(0.085, 12, 10), sm);

                s.part(g, "sites", sites.mesh, [sm]);
                d.sites = sites; d.sp = [];

                for (let i = 0; i < NS; i++) { d.sp.push({ x: -2.0 + (i % 12) * 0.36, z: -1.0 + Math.floor(i / 12) * 0.5, u: rand() }); }

                // ions in the solution
                const im = new T.MeshStandardMaterial({ color: 0xff7a7a, emissive: 0x4a1010, roughness: 0.3 });
                const ions = s.inst(NI, new T.SphereGeometry(0.06, 8, 6), im);

                s.part(g, "ions", ions.mesh, [im]);
                d.ions = ions; d.ip = [];

                for (let i = 0; i < NI; i++) { d.ip.push({ x: (rand() - 0.5) * 4.2, y: 0.4 + rand() * 1.9, z: (rand() - 0.5) * 2.4, ph: rand() * 6 }); }

                d.NS = NS; d.NI = NI;
                d.tmpC = new T.Color();
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const I = INS[c.state.ins];
                const ph = c.state.ph;
                const q = clamp((I.pzc - ph) / 3.5, -1, 1);          // surface charge: + below the pzc
                const dv = (ph - 7) * I.sens;                         // threshold shift in mV

                d.q = q; d.dv = dv;

                if (ph < I.pzc - 1.5) { d.sawLow = true; }
                if (ph > I.pzc + 1.5) { d.sawHigh = true; }

                // a positive surface charge attracts electrons, so the effective gate voltage is higher
                const vgEff = 1.9 + (-dv) / 1000 * 4;
                const r = drain(vgEff, 0.9, VTH);

                d.id = r.id;
                placeElectrons(c, d.b, vgEff, 0.9, VTH, dt, t);

                // site charge colors
                d.sp.forEach(function (p, i) {

                    const k = p.u < Math.abs(q) ? Math.sign(q) : 0;

                    d.sites.set(i, p.x, 0.22, p.z);
                    d.sites.color(i, k > 0 ? 0xff5a6a : k < 0 ? 0x5a8cff : 0xcfd5ee);
                });

                d.sites.flush();

                // ions drift: protons sit close to a negative surface
                d.ip.forEach(function (p, i) {

                    const near = q < 0 ? 0.18 : 0.5;
                    const y0 = q < 0 ? p.y * 0.5 : p.y;

                    d.ions.set(i, p.x + Math.sin(t + p.ph) * 0.06, Math.max(0.35 + near * 0.3, y0 * (q < -0.2 ? 0.7 : 1)) + Math.cos(t * 0.8 + p.ph) * 0.05, p.z + Math.sin(t * 0.9 + p.ph * 2) * 0.05);
                });

                d.ions.flush();
            }
        });

        // ================================================================
        // UNIT 14: A BIOFET
        // ================================================================
        D("fet-3d-biofet", {

            title: "Explore in 3D: receptors on the gate",
            intro: "Add target molecules to the solution and watch them bind the receptors. Their charge shifts the threshold, and the current changes.",
            stats: [["Receptors occupied", "occ"], ["Threshold shift ΔVth", "dv"], ["Drain current", "id"]],
            defaults: { rec: "dna", conc: 10 },
            controls: [
                { seg: "rec", label: "Receptor", options: [["dna", "DNA probe (target is DNA, negative)"], ["ab", "Antibody (target is a protein)"]] },
                { slider: "conc", label: "Target concentration (log scale)", min: 0, max: 100, step: 1, fmt: function (v) { return "×" + Math.pow(10, v / 25).toFixed(1); } },
                { views: ["three", "front", "top"] }
            ],
            formula: "A bare ISFET responds mainly to the pH at its surface. Put receptors on the insulator and a target that binds adds its charge to the surface charge, so the threshold moves just as it did for pH: ΔV<sub>th</sub> ≈ −Q/C<sub>ox</sub>. No fluorescent label is needed. DNA is strongly negative, so more bound DNA means a bigger shift. A good receptor is specific, strong, stable and small. (Illustrative.)",
            stage: { target: [0, 1.2, 0], halfWidth: 5.4, halfHeight: 2.8, views: { three: [0.5, 1.15], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.4, 0.25] },
            info: {
                probe: "A receptor on the insulator surface: a DNA probe strand or a Y-shaped antibody. It binds one specific target and little else.",
                target: "A target molecule in the solution. When it binds a receptor, its charge joins the surface charge.",
                bound: "A bound target: its charge now sits at the gate, and shifts the threshold.",
                ox: "The gate insulator. The shift is the bound charge divided by the oxide capacitance.",
                liq: "The sample solution.",
                src: "The source.", drn: "The drain.", body: "The silicon body.", elec: "Electrons in the channel. Negative bound charge pushes them away, so the current falls."
            },
            read: function (c) {

                const d = c.data;

                if (d.occ === undefined) { return {}; }

                return {
                    occ: Math.round(d.occ * 100) + " %",
                    dv: (d.dv >= 0 ? "+" : "") + d.dv.toFixed(0) + " mV",
                    id: d.id.toFixed(0) + " µA",
                    verdict: d.occ < 0.05 ? "Almost nothing bound: no signal" : d.occ < 0.6 ? "Some receptors have caught a target: the threshold has moved" : "Most receptors are occupied: the signal is nearly at its maximum"
                };
            },
            reward: { when: function (c) { return c.data.occ > 0.7 && c.count() >= 3; }, msg: "You saw a BioFET detect its target" },
            onChange: function (c, keys) { if (keys.indexOf("rec") >= 0) { c.data.makeProbes(); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(12);
                const NPR = 24;
                const NT = 60;

                d.b = buildBody(s, g, { seed: 6 });
                d.occ = 0; d.dv = 0; d.id = 0;
                s.scene.add(g);
                s.shadow(g, 11, 5);

                const lm = new T.MeshStandardMaterial({ color: 0x7fe6d6, transparent: true, opacity: 0.1, roughness: 0.2, depthWrite: false });

                s.part(g, "liq", s.box(4.4, 2.2, 2.6, lm, 0, 1.28, 0), [lm], true);

                // probes
                const pm = s.mat(0x9b7bff, { roughness: 0.4 });
                const probes = new T.Group();

                g.add(probes);
                d.probes = probes;

                d.pp = [];

                for (let i = 0; i < NPR; i++) { d.pp.push({ x: -1.9 + (i % 8) * 0.54, z: -0.8 + Math.floor(i / 8) * 0.8, u: rand() }); }

                d.makeProbes = function () {

                    while (probes.children.length) { const m = probes.children[0]; probes.remove(m); m.geometry.dispose(); }

                    d.probeMeshes = [];

                    d.pp.forEach(function (p) {

                        let m;

                        if (c.state.rec === "dna") {

                            m = s.tube([[p.x, 0.18, p.z], [p.x + 0.05, 0.5, p.z], [p.x - 0.05, 0.8, p.z], [p.x + 0.03, 1.1, p.z]], 0.025, pm, 12);

                        } else {

                            m = new T.Group();
                            m.add(s.cyl(0.04, 0.04, 0.5, pm, p.x, 0.43, p.z, 8));
                            [-0.17, 0.17].forEach(function (k) { const arm = s.cyl(0.04, 0.04, 0.45, pm, p.x + k, 0.85, p.z, 8); arm.rotation.z = -k * 1.2; m.add(arm); });
                            m.children.forEach(function (ch) { ch.userData.part = null; });
                        }

                        probes.add(m);
                        d.probeMeshes.push(m);
                    });

                    const arr = [];

                    probes.traverse(function (o) { if (o.isMesh) { arr.push(o); } });
                    s.part(probes, "probe", arr, [pm]);
                };

                d.makeProbes();

                // target molecules (negative: rose) floating and binding
                const tm = new T.MeshStandardMaterial({ color: 0xff7a9a, emissive: 0x4a1020, roughness: 0.35 });
                const tg = s.inst(NT, new T.SphereGeometry(0.1, 12, 10), tm);

                s.part(g, "target", tg.mesh, [tm]);
                d.tg = tg; d.tp = [];

                for (let i = 0; i < NT; i++) { d.tp.push({ x: (rand() - 0.5) * 4.0, y: 1.0 + rand() * 1.8, z: (rand() - 0.5) * 2.2, ph: rand() * 6, u: rand(), k: i % NPR }); }

                d.NT = NT; d.NPR = NPR;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const conc = Math.pow(10, c.state.conc / 25);                 // 1 to 10,000 times
                const Kd = 30;
                const occ = conc / (conc + Kd);

                d.occ += (occ - d.occ) * Math.min(1, dt * 2);

                const charge = c.state.rec === "dna" ? 120 : 70;               // mV at full occupancy, illustrative
                d.dv = -charge * d.occ;

                const vgEff = 1.9 + d.dv / 1000 * 4;
                const r = drain(vgEff, 0.9, VTH);

                d.id = r.id;
                placeElectrons(c, d.b, vgEff, 0.9, VTH, dt, t);

                // targets: the ones that bind sit at a receptor, the rest drift
                const nVis = Math.round(clamp(Math.log10(conc + 1) / 4 * d.NT, 4, d.NT));
                const nBound = Math.round(d.occ * d.NPR);

                d.tp.forEach(function (p, i) {

                    if (i >= nVis) { d.tg.hide(i); return; }

                    if (i < nBound) {

                        const pr = d.pp[i % d.NPR];

                        d.tg.set(i, pr.x, 1.2, pr.z, 1.3);

                    } else {

                        d.tg.set(i, p.x + Math.sin(t * 0.9 + p.ph) * 0.25, p.y + Math.cos(t * 0.7 + p.ph) * 0.2, p.z + Math.sin(t * 0.8 + p.ph * 2) * 0.2);
                    }
                });

                d.tg.flush();
            }
        });

        // ================================================================
        // UNIT 20: DEBYE SCREENING
        // ================================================================
        const RECS = {
            ab: { name: "Antibody (about 10 nm tall)", h: 10 },
            fab: { name: "Fab fragment (about 5 nm)", h: 5 },
            apt: { name: "Aptamer (about 2.5 nm)", h: 2.5 }
        };

        D("fet-3d-debye", {

            title: "Explore in 3D: salt hides the charge",
            intro: "The bound molecule's charge is screened by the ions around it. Raise the salt, or use a taller receptor, and watch the signal fade.",
            stats: [["Debye length", "ld"], ["Charge height", "h"], ["Signal the gate feels", "sig"]],
            defaults: { rec: "ab", salt: 10 },
            controls: [
                { seg: "rec", label: "Receptor", options: [["ab", "Antibody"], ["fab", "Fab fragment"], ["apt", "Aptamer"]] },
                { slider: "salt", label: "Salt concentration (mM; the body is about 150)", min: 1, max: 150, step: 1, fmt: function (v) { return v + " mM"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "A bound molecule's charge is screened by the mobile ions around it. The gate feels a charge at height d above the surface reduced by e<sup>−d/λ<sub>D</sub></sup>, where λ<sub>D</sub> ≈ 0.3 nm ÷ √c (c in mol/L). In 150 mM saline λ<sub>D</sub> is about 0.8 nm, so the top of a 10 nm antibody is far out of reach. Workarounds: dilute the sample, use small receptors such as Fab fragments, nanobodies or aptamers, or use polymer layers. (To scale in nanometers: the box on the left is 12 nm tall.)",
            stage: { target: [0, 2.3, 0], halfWidth: 4.2, halfHeight: 3.1, views: { three: [0.55, 1.2], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.4, 0.25] },
            info: {
                surf: "The gate surface: the insulator that the transistor senses. It feels the electric field at its surface.",
                rec: "The receptor, standing on the surface. The target binds at its tip, far above the surface for a tall receptor.",
                charge: "The bound molecule's charge. The farther it is from the surface, the more of its field is screened away before it reaches the gate.",
                cloud: "The screening cloud of mobile ions. It is thick in low salt and thin in high salt. Its thickness is the Debye length.",
                ions: "Mobile ions: positive (orange) and negative (blue). Near the negative bound charge, positive ions gather and cancel its field."
            },
            read: function (c) {

                const ld = 0.304 / Math.sqrt(c.state.salt / 1000);
                const h = RECS[c.state.rec].h;
                const sg = Math.exp(-h / ld);

                return {
                    ld: ld.toFixed(1) + " nm",
                    h: h + " nm",
                    sig: sg < 0.01 ? "Under 1 %" : Math.round(sg * 100) + " %",
                    verdict: sg > 0.5 ? "The charge is inside the Debye length: the gate feels most of it" : sg > 0.1 ? "Partly screened: a weakened signal" : "Screened away: the gate barely feels the charge"
                };
            },
            reward: { when: function (c) { return c.data.sawApt && c.data.sawHigh && c.data.sawLow; }, msg: "You found a way around Debye screening" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(20);
                const NI = 140;
                const SC = 0.22;                 // scene units per nanometer

                d.sawApt = false; d.sawHigh = false; d.sawLow = false;
                s.scene.add(g);
                s.shadow(g, 8, 6);

                const sm = s.mat(0x9aa4c4, { metalness: 0.2, roughness: 0.45 });
                const surf = s.box(6.2, 0.3, 3.6, sm, 0, -0.15, 0);

                s.part(g, "surf", surf, [sm]);

                // the receptor and its charge
                const rm = s.mat(0x9b7bff, { roughness: 0.4 });
                const stem = s.cyl(0.07, 0.07, 1, rm, 0, 0.5, 0, 12);

                g.add(stem);
                s.part(g, "rec", stem, [rm]);
                d.stem = stem;

                const cm = new T.MeshStandardMaterial({ color: 0xff5a7a, emissive: 0x601020, roughness: 0.3 });
                const charge = s.sph(0.2, cm, 0, 1, 0, 18);

                s.part(g, "charge", charge, [cm]);
                d.charge = charge;

                // the screening cloud as stacked translucent layers
                const cl = new T.MeshStandardMaterial({ color: 0xffd66a, transparent: true, opacity: 0.18, roughness: 0.3, depthWrite: false });
                const cloud = s.box(6.2, 1, 3.6, cl, 0, 0.5, 0);

                s.part(g, "cloud", cloud, [cl], true);
                d.cloud = cloud;

                // a height ruler
                const ruler = s.lineSeg([-3.4, 0, 0, -3.4, 12 * SC, 0], 0xcfe0ff, 0.8);

                g.add(ruler);

                [0, 2, 4, 6, 8, 10, 12].forEach(function (nm) {

                    const lb = s.label(nm + " nm");

                    lb.at = function () { return [-3.7, nm * SC, 0]; };
                });

                // ions
                const catM = new T.MeshStandardMaterial({ color: 0xffb04a, emissive: 0x4a2a00, roughness: 0.3 });
                const anM = new T.MeshStandardMaterial({ color: 0x5fb1ff, emissive: 0x0a2a4a, roughness: 0.3 });
                const cats = s.inst(NI, new T.SphereGeometry(0.07, 10, 8), catM);
                const ans = s.inst(NI, new T.SphereGeometry(0.07, 10, 8), anM);

                s.part(g, "ions", [cats.mesh, ans.mesh], [catM, anM]);
                d.cats = cats; d.ans = ans; d.ip = [];

                for (let i = 0; i < NI; i++) { d.ip.push({ x: (rand() - 0.5) * 5.6, z: (rand() - 0.5) * 3.2, u: rand(), ph: rand() * 6, v: rand() }); }

                d.NI = NI; d.SC = SC;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const ld = 0.304 / Math.sqrt(c.state.salt / 1000);
                const h = RECS[c.state.rec].h;
                const SC = d.SC;

                if (c.state.rec === "apt") { d.sawApt = true; }
                if (c.state.salt >= 100) { d.sawHigh = true; }
                if (c.state.salt <= 15) { d.sawLow = true; }

                d.stem.scale.y = Math.max(0.01, h * SC);
                d.stem.position.y = h * SC / 2;
                d.charge.position.y = h * SC + 0.1;

                const th = Math.max(0.05, ld * SC * 1.6);

                d.cloud.scale.y = th;
                d.cloud.position.y = th / 2;

                // ions pile up in the Debye layer: exponential profile, plus a crowd around the charge
                d.ip.forEach(function (p, i) {

                    const y = -Math.log(1 - p.u * 0.95) * ld * SC * 0.9 + 0.08;
                    const wob = 0.04;

                    let px = p.x + Math.sin(t * 1.1 + p.ph) * wob;
                    let pz = p.z + Math.cos(t * 0.9 + p.ph) * wob;
                    let py = y + Math.sin(t * 0.8 + p.ph * 2) * 0.03;

                    // positive ions gather round the negative bound charge
                    if (p.v < 0.45) {

                        const a = p.ph * 3;
                        const rr = 0.35 + p.u * 0.5;

                        px = Math.cos(a) * rr + Math.sin(t + p.ph) * 0.04;
                        pz = Math.sin(a) * rr;
                        py = d.charge.position.y + (p.u - 0.5) * 0.9;
                    }

                    d.cats.set(i, px, py, pz);
                    d.ans.set(i, p.x * 0.9 + Math.sin(t * 0.9 + p.ph) * wob, y * 1.7 + 0.15, p.z * 0.9 + Math.cos(t + p.ph) * wob);
                });

                d.cats.flush();
                d.ans.flush();
            }
        });

        document.querySelectorAll('.fd-sim[data-sim^="fet-3d-"]').forEach(F.mount);
    }

})();
