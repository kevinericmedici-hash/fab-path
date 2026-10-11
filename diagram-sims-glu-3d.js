/* ========================================
   GLUCOSE SENSORS: 3D SCENES

   Unit 1:  glucose, insulin and the cell (healthy, type 1, type 2).
   Unit 4:  three ways to sense glucose (electrochemical, optical, other fluids).
   Unit 10: the anatomy of a Dexcom CGM, from applicator to phone.
   Unit 15: building the sensor layers by dip coating.

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
        // UNIT 1: GLUCOSE, INSULIN AND THE CELL
        // ================================================================
        D("glu-3d-bloodstream", {

            title: "Explore in 3D: glucose, insulin and the cell",
            intro: "Eat a meal and watch glucose rise. In a healthy body, insulin opens the doors on cells and glucose goes in. Now try type 1 and type 2.",
            stats: [["Blood glucose", "g"], ["Insulin signal", "ins"], ["Doors on the cell", "gate"]],
            defaults: { body: "healthy" },
            controls: [
                { actions: [["meal", "🍝 Eat a meal"], ["insulin", "💉 Take insulin"]], label: "Do" },
                { seg: "body", label: "The body", options: [["healthy", "Healthy"], ["t1", "Type 1 (no insulin)"], ["t2", "Type 2 (cells respond poorly)"]] },
                { views: ["three", "front", "top"] }
            ],
            formula: "Cells burn glucose for energy. Insulin is a hormone that helps cells take glucose in, which lowers blood glucose. In a healthy body, insulin and other hormones keep glucose within a narrow band. In type 1 the body stops making insulin, so it must be replaced by injection or a pump. In type 2 cells respond poorly to insulin, and over time the body may not make enough. You can only balance what you can measure, which is why sensors matter. (Numbers and speeds are illustrative.)",
            stage: { target: [0, 1.5, 0], halfWidth: 5.6, views: { three: [0.5, 1.15], front: [0, 1.45], top: [0, 0.4] }, home: "three", sway: [0.45, 0.28] },
            info: {
                vessel: "A blood vessel carrying glucose (gold) and insulin (blue) past the body's cells.",
                glu: "Glucose: the body's fuel. Cells burn it for energy, and the brain depends on a steady supply.",
                ins: "Insulin: a hormone that helps cells take glucose in, which lowers blood glucose. Healthy: made automatically. Type 1: not made. Type 2: made, but cells respond poorly.",
                gate: "A glucose door on a cell. Insulin binding the cell opens it, so glucose can pass in.",
                cell: "The cell. Glucose that enters is burned for energy.",
                pancreas: "The pancreas makes insulin in a healthy body. In type 1 it has stopped making it."
            },
            read: function (c) {

                const d = c.data;

                if (d.G === undefined) { return {}; }

                const G = d.G;

                return {
                    g: Math.round(G) + " mg/dL",
                    ins: d.ins < 0.05 ? "Almost none" : Math.round(d.ins * 100) + " %",
                    gate: Math.round(d.gate * 100) + " % open",
                    verdict: G < 55 ? "Dangerously low: below 55 mg/dL" : G < 70 ? "Low: below 70 mg/dL" : G <= 180 ? "In range: 70 to 180 mg/dL" : G <= 250 ? "High: above 180 mg/dL" : "Very high: years of this damage the eyes, kidneys, nerves and heart"
                };
            },
            reward: { when: function (c) { return c.data.sawT1 && c.data.sawH && c.data.sawT2 && c.data.meals >= 2; }, msg: "You compared a healthy body with type 1 and type 2" },
            act: function (c, id) {

                if (id === "meal") { c.data.mealLeft = 3; c.data.meals++; }
                if (id === "insulin") { c.data.dose = 1; }
            },
            onChange: function (c, keys) { if (keys.indexOf("body") >= 0) { c.data.G = 100; c.data.dose = 0; } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(21);
                const NG = 150;

                d.G = 100; d.ins = 0; d.gate = 0; d.dose = 0; d.mealLeft = 0; d.meals = 0;
                d.sawH = false; d.sawT1 = false; d.sawT2 = false;
                s.scene.add(g);
                s.shadow(g, 12, 6);

                // blood vessel
                const vm = s.glass(0xff8a8a, 0.14, false);
                const ves = s.cyl(1.15, 1.15, 10, vm, 0, 2.55, 0, 32, true);

                ves.rotation.z = Math.PI / 2;
                s.part(g, "vessel", ves, [vm], true);

                // cell below
                const cm = s.glass(0xc89cff, 0.35, false);
                const cell = s.box(10, 1.6, 3.2, cm, 0, 0.8, 0);

                s.part(g, "cell", cell, [cm]);

                // doors on the cell surface
                const gm = s.mat(0x54c9b0, { roughness: 0.4, emissive: 0x000000 });
                const lm = s.mat(0xff9a54, { roughness: 0.4 });
                const gates = [];
                const lids = [];

                for (let i = 0; i < 6; i++) {

                    const x = -3.5 + i * 1.4;
                    const ring = new T.Mesh(new T.TorusGeometry(0.26, 0.08, 10, 20), gm);

                    ring.rotation.x = Math.PI / 2;
                    ring.position.set(x, 1.62, 0);
                    gates.push(ring);

                    const lid = s.cyl(0.24, 0.24, 0.07, lm, x, 1.66, 0, 16);

                    lids.push(lid);
                    g.add(lid);
                }

                s.part(g, "gate", gates, [gm]);

                // the pancreas
                const pm = s.mat(0xffb27a, { roughness: 0.5, emissive: 0x000000 });
                const panc = s.sph(0.7, pm, -5.2, 3.9, 0, 20);

                panc.scale.set(1.3, 0.8, 1);
                s.part(g, "pancreas", panc, [pm]);

                const lab = s.label("Pancreas");

                lab.at = function () { return [-5.2, 4.7, 0]; };

                const lab2 = s.label("Cell");

                lab2.at = function () { return [4.2, 0.9, 1.7]; };

                const lab3 = s.label("Blood vessel");

                lab3.at = function () { return [4.6, 3.9, 0]; };

                // glucose and insulin particles
                const glM = new T.MeshStandardMaterial({ color: 0xffc94a, emissive: 0x6a4400, roughness: 0.3 });
                const gl = s.inst(NG, new T.SphereGeometry(0.1, 12, 10), glM);

                s.part(g, "glu", gl.mesh, [glM]);

                const inM = new T.MeshStandardMaterial({ color: 0x5fb1ff, emissive: 0x0a2a4a, roughness: 0.3 });
                const NI = 30;
                const ig = s.inst(NI, new T.OctahedronGeometry(0.11), inM);

                s.part(g, "ins", ig.mesh, [inM]);

                d.parts = [];

                for (let i = 0; i < NG; i++) { d.parts.push({ x: -4.5 + rand() * 9, r: Math.sqrt(rand()) * 0.9, a: rand() * 6.28, v: 0.5 + rand() * 0.5, sink: -1, gx: 0, on: i < 60 }); }

                d.ip = [];

                for (let i = 0; i < NI; i++) { d.ip.push({ x: -5.2, y: 3.8, z: 0, t: -1 - rand() * 4, r: Math.sqrt(rand()) * 0.8, a: rand() * 6.28 }); }

                d.gl = gl; d.ig = ig; d.gates = gates; d.lids = lids; d.gm = gm; d.pm = pm; d.rand = rand; d.NG = NG; d.NI = NI;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const body = c.state.body;
                const sens = body === "t2" ? 0.3 : 1;

                if (body === "healthy") { d.sawH = true; }
                if (body === "t1") { d.sawT1 = true; }
                if (body === "t2") { d.sawT2 = true; }

                // insulin signal: made by the body (healthy, t2) or injected (any)
                d.dose = Math.max(0, d.dose - dt * 0.07);

                const own = body === "t1" ? 0 : clamp((d.G - 70) / 110, 0, 1) * (body === "t2" ? 0.9 : 1);

                d.ins += (clamp(own + d.dose, 0, 1) - d.ins) * Math.min(1, dt * 1.5);
                d.gate = clamp(d.ins * sens * (body === "t2" ? 1.0 : 1), 0, 1);

                // glucose balance: liver makes it, meals add it, open doors remove it
                if (d.mealLeft > 0) { d.G += 30 * dt; d.mealLeft -= dt; }

                d.G += 3 * dt;
                d.G -= 0.075 * d.gate * d.G * dt;
                d.G = clamp(d.G, 20, 420);

                // the doors
                d.gates.forEach(function (m, i) { d.lids[i].position.x = d.gates[i].position.x + d.gate * 0.5; d.lids[i].visible = d.gate < 0.9; });
                d.gm.emissive.setRGB(0.1 * d.gate, 0.5 * d.gate, 0.4 * d.gate);
                d.pm.emissive.setRGB(0.6 * d.ins * (body === "t1" ? 0 : 1), 0.2 * d.ins * (body === "t1" ? 0 : 1), 0);

                // glucose particles
                const want = Math.round(clamp(d.G / 2.6, 12, d.NG));
                let active = 0;

                d.parts.forEach(function (p) { if (p.on) { active++; } });

                d.parts.forEach(function (p, i) {

                    if (!p.on && active < want && p.sink < 0) { p.on = true; p.x = -4.6; active++; }

                    if (p.on && active > want && p.sink < 0 && d.gate > 0.15) {

                        const gi = Math.floor(d.rand() * 6);

                        p.sink = 0;
                        p.gx = -3.5 + gi * 1.4;
                        active--;
                    }

                    if (!p.on) { d.gl.hide(i); return; }

                    if (p.sink >= 0) {

                        p.sink += dt;
                        p.x += (p.gx - p.x) * Math.min(1, dt * 4);

                        const u = p.sink / 1.2;

                        d.gl.set(i, p.x, 2.55 - 0.9 - u * 1.6, 0.0, u < 1 ? 1 - u * 0.5 : 0.0001);

                        if (p.sink > 1.2) { p.on = false; p.sink = -1; }

                        return;
                    }

                    p.x += p.v * dt * 0.9;

                    if (p.x > 4.8) { p.x = -4.8; p.a = d.rand() * 6.28; p.r = Math.sqrt(d.rand()) * 0.9; }

                    d.gl.set(i, p.x, 2.55 + Math.sin(p.a + t * 0.7) * p.r * 0.9, Math.cos(p.a + t * 0.7) * p.r * 0.9);
                });

                d.gl.flush();

                // insulin travels from the pancreas along the vessel
                d.ip.forEach(function (p, i) {

                    const on = d.ins > 0.08 && (i / d.NI) < d.ins;

                    p.t += dt;

                    if (p.t < 0 || !on) { d.ig.hide(i); if (p.t > 6) { p.t = -d.rand() * 3; } return; }

                    const u = Math.min(1, p.t / 1.0);

                    if (p.t < 1.0) {

                        d.ig.set(i, -5.2 + u * 1.0, 3.8 - u * 1.25, 0);

                    } else {

                        const x = -4.2 + (p.t - 1.0) * 1.1;

                        if (x > 4.8) { p.t = -d.rand() * 2; d.ig.hide(i); return; }

                        d.ig.set(i, x, 2.55 + Math.sin(p.a + t * 0.9) * p.r * 0.8, Math.cos(p.a + t * 0.9) * p.r * 0.8);
                    }
                });

                d.ig.flush();
            }
        });

        // ================================================================
        // UNIT 4: THREE WAYS TO SENSE GLUCOSE
        // ================================================================
        D("glu-3d-sensing", {

            title: "Explore in 3D: three ways to sense glucose",
            intro: "Pick a family, then change the glucose level. In the electrochemical sensor, try turning the enzyme off.",
            stats: [["Signal", "sig"], ["Glucose", "gl"], ["Selective for glucose?", "sel"]],
            defaults: { fam: "elec", g: 120, enzyme: "on" },
            controls: [
                { seg: "fam", label: "Family", options: [["elec", "Electrochemical"], ["opt", "Optical"], ["other", "Other fluids (sweat)"]] },
                { seg: "enzyme", label: "Enzyme (electrochemical)", options: [["on", "Enzyme on"], ["off", "No enzyme (a bare metal)"]] },
                { slider: "g", label: "Glucose around the sensor (mg/dL)", min: 40, max: 400, step: 5, fmt: function (v) { return v + " mg/dL"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "A sensor must pick out one sugar from a messy fluid. Electrochemical: a reaction with glucose produces electrons, which become a current. An enzyme such as glucose oxidase reacts only with glucose, which gives excellent selectivity; a bare metal catalyzes glucose directly but also reacts with look-alikes (rose). Optical: a glucose-binding material changes how brightly it glows. Other fluids: sweat, tears, saliva, or breath carry far less glucose than tissue fluid. Almost every commercial CGM uses the first two. (Illustrative.)",
            stage: { target: [0, 1.8, 0], halfWidth: 4.6, views: { three: [0.5, 1.15], front: [0, 1.45], top: [0, 0.4] }, home: "three", sway: [0.4, 0.28] },
            info: {
                wire: "The electrode: glucose reacting at the enzyme layer releases electrons, which flow up the wire as a current.",
                enz: "The enzyme layer (glucose oxidase). It reacts only with glucose, so look-alike molecules are ignored.",
                bare: "A bare metal catalyst: it reacts with glucose directly, but also with look-alike molecules, so the signal is less selective.",
                cap: "A fluorescent capsule: a glucose-binding material that glows more brightly as more glucose binds. Used in implantable CGMs.",
                det: "The detector reads the glow through the skin.",
                sweat: "Glucose in sweat is present at far lower levels than in tissue fluid, so the signal is very weak.",
                glu: "Glucose molecules in the fluid.",
                other: "Look-alike molecules (other sugars, drugs, vitamins)."
            },
            read: function (c) {

                const d = c.data;
                const fam = c.state.fam;

                if (d.sig === undefined) { return {}; }

                return {
                    sig: fam === "elec" ? d.sig.toFixed(1) + " nA" : fam === "opt" ? Math.round(d.sig) + " % brightness" : d.sig.toFixed(2) + " nA (very weak)",
                    gl: c.state.g + " mg/dL",
                    sel: fam === "elec" ? (c.state.enzyme === "on" ? "Yes: the enzyme ignores look-alikes" : "No: look-alikes add false current") : fam === "opt" ? "Yes: the binding material is picky" : "Yes, but there is almost no glucose",
                    verdict: fam === "elec" ? (c.state.enzyme === "on" ? "The enzyme is what lets the sensor ignore everything that is not glucose" : "Without the enzyme the rose look-alikes react too, and the reading is wrong") : fam === "opt" ? "Optical methods avoid consuming a reaction, but the glucose signal can be weak" : "Sweat has so little glucose that the signal is tiny"
                };
            },
            reward: { when: function (c) { return !!c.data.sawFam && c.data.sawFam.elec && c.data.sawFam.opt && c.data.sawFam.other && c.data.sawOff; }, msg: "You compared all three ways to sense glucose" },
            onChange: function (c, keys) { c.data.rebuildVis(); },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(41);
                const NG = 70;
                const NO = 70;

                d.sawFam = {}; d.sawOff = false; d.sig = 0;
                s.scene.add(g);
                s.shadow(g, 7, 5);

                const gl = s.glass(0x9fb8f0, 0.1, false);
                const box = s.box(4.4, 3.4, 3.2, gl, 0, 1.8, 0);

                s.part(g, "tank", box, [gl], true);

                const ed = new T.LineSegments(new T.EdgesGeometry(box.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.35 }));

                ed.position.copy(box.position);
                g.add(ed);

                // electrochemical group
                const eg = new T.Group();
                const wm = s.mat(0xd9dae6, { metalness: 0.8, roughness: 0.25 });
                const wire = s.cyl(0.08, 0.08, 4.0, wm, 0, 3.6, 0, 14);
                const em = s.glass(0x7fe0a0, 0.55, false);
                const enz = s.cyl(0.26, 0.26, 1.6, em, 0, 1.6, 0, 20);
                const bm = s.mat(0xd9b45a, { metalness: 0.6, roughness: 0.35 });
                const bare = s.cyl(0.16, 0.16, 1.6, bm, 0, 1.6, 0, 18);

                eg.add(wire);
                eg.add(enz);
                eg.add(bare);
                g.add(eg);
                s.part(g, "wire", wire, [wm]);

                d.enz = enz;
                d.bare = bare;
                s.part(g, "enz", enz, [em]);
                s.part(g, "bare", bare, [bm]);

                // optical group
                const og = new T.Group();
                const cm = new T.MeshStandardMaterial({ color: 0xffa24a, emissive: 0xff8a2a, emissiveIntensity: 0.4, roughness: 0.35, transparent: true, opacity: 0.9 });
                const cap = s.cyl(0.3, 0.3, 1.4, cm, 0, 1.4, 0, 20);

                cap.rotation.z = Math.PI / 2;
                og.add(cap);
                s.part(g, "cap", cap, [cm]);

                const dm = s.mat(0x4a516a, { metalness: 0.4, roughness: 0.4 });
                const det = s.box(1.2, 0.3, 0.9, dm, 0, 3.4, 0);

                og.add(det);
                s.part(g, "det", det, [dm]);

                const rays = s.lineSeg([-0.3, 1.8, 0, -0.5, 3.2, 0, 0, 1.8, 0, 0, 3.2, 0, 0.3, 1.8, 0, 0.5, 3.2, 0], 0xffd9a0, 0.5);

                og.add(rays);
                g.add(og);

                // other fluids group: a skin patch with sweat
                const xg = new T.Group();
                const skin = s.mat(0xe7b894, { roughness: 0.6 });
                const sk = s.box(3.6, 0.25, 2.6, skin, 0, 2.9, 0);

                xg.add(sk);

                const patchM = s.mat(0x54c9b0, { roughness: 0.4 });
                const patch = s.box(1.4, 0.12, 1.0, patchM, 0, 3.08, 0);

                xg.add(patch);
                s.part(g, "sweat", [sk, patch], [skin, patchM]);

                for (let i = 0; i < 6; i++) { xg.add(s.cyl(0.05, 0.05, 0.28, s.mat(0x7fb6ff, { roughness: 0.3 }), -1.3 + i * 0.52, 2.78, (i % 2 ? 0.5 : -0.5), 8)); }

                g.add(xg);

                d.eg = eg; d.og = og; d.xg = xg; d.cm = cm;

                // glucose and look-alike particles
                const glM = new T.MeshStandardMaterial({ color: 0xffc94a, emissive: 0x6a4400, roughness: 0.3 });
                const glI = s.inst(NG, new T.SphereGeometry(0.11, 12, 10), glM);

                s.part(g, "glu", glI.mesh, [glM]);

                const oM = new T.MeshStandardMaterial({ color: 0xff6f7e, roughness: 0.4 });
                const oI = s.inst(NO, new T.SphereGeometry(0.09, 10, 8), oM);

                s.part(g, "other", oI.mesh, [oM]);

                const eM = new T.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68, roughness: 0.3 });
                const eI = s.inst(20, new T.SphereGeometry(0.07, 8, 6), eM);

                g.add(eI.mesh);

                d.gp = []; d.op = []; d.el = [];

                for (let i = 0; i < NG; i++) { d.gp.push({ x: (rand() - 0.5) * 3.8, y: 0.4 + rand() * 2.8, z: (rand() - 0.5) * 2.6, ph: rand() * 6, flash: 0 }); }
                for (let i = 0; i < NO; i++) { d.op.push({ x: (rand() - 0.5) * 3.8, y: 0.4 + rand() * 2.8, z: (rand() - 0.5) * 2.6, ph: rand() * 6, flash: 0 }); }

                d.glI = glI; d.oI = oI; d.eI = eI; d.NG = NG; d.NO = NO; d.rand = rand; d.rate = 0; d.rateS = 0;

                d.rebuildVis = function () {

                    const fam = c.state.fam;

                    d.eg.visible = fam === "elec";
                    d.og.visible = fam === "opt";
                    d.xg.visible = fam === "other";
                    d.enz.visible = c.state.enzyme === "on";
                    d.bare.visible = c.state.enzyme === "off";
                    d.sawFam[fam] = true;

                    if (fam === "elec" && c.state.enzyme === "off") { d.sawOff = true; }
                };

                d.rebuildVis();

                const l1 = s.label("Tissue fluid");

                l1.at = function () { return [-1.9, 0.2, 1.6]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const fam = c.state.fam;
                const G = c.state.g;
                const nG = Math.round(clamp(G / 6, 4, d.NG));
                const nO = fam === "other" ? 0 : Math.round(d.NO * 0.8);
                const sweatScale = fam === "other" ? 0.12 : 1;
                const nGg = Math.max(1, Math.round(nG * sweatScale));
                const reactors = [];
                let ev = 0;

                // where the reaction happens
                const wx = 0, wz = 0;

                d.gp.forEach(function (p, i) {

                    if (i >= nGg) { d.glI.hide(i); return; }

                    let x = p.x + Math.sin(t * 0.9 + p.ph) * 0.15;
                    let y = p.y + Math.cos(t * 0.7 + p.ph * 1.3) * 0.15;
                    const z = p.z + Math.sin(t * 0.8 + p.ph * 2) * 0.15;

                    if (fam === "other") { y = 2.4 + (p.y - 2) * 0.4; }

                    d.glI.set(i, x, y, z);

                    if (fam === "elec" && Math.hypot(x - wx, z - wz) < 0.5 && y > 0.8 && y < 2.4) { ev += 1; p.flash = 1; }
                    if (fam === "opt" && Math.hypot(x, y - 1.4) < 0.7) { ev += 1; }
                });

                d.glI.flush();

                d.op.forEach(function (p, i) {

                    if (i >= nO || fam !== "elec") { d.oI.hide(i); return; }

                    const x = p.x + Math.sin(t * 0.8 + p.ph) * 0.15;
                    const y = p.y + Math.cos(t * 0.6 + p.ph * 1.3) * 0.15;
                    const z = p.z + Math.sin(t * 0.7 + p.ph * 2) * 0.15;

                    d.oI.set(i, x, y, z);

                    if (c.state.enzyme === "off" && Math.hypot(x - wx, z - wz) < 0.5 && y > 0.8 && y < 2.4) { ev += 0.6; }
                });

                d.oI.flush();

                // signal readouts
                if (fam === "elec") { d.sig = 0.045 * G * (c.state.enzyme === "off" ? 2.1 : 1); }
                else if (fam === "opt") { d.sig = 100 * G / (G + 160); }
                else { d.sig = G * 0.0012; }

                // optical glow follows the binding
                d.cm.emissiveIntensity = 0.2 + 1.4 * (G / (G + 160));

                // electrons climbing the wire
                d.rate += (clamp(d.sig / 12, 0, 1) - d.rate) * Math.min(1, dt * 3);

                for (let i = 0; i < 20; i++) {

                    if (fam !== "elec") { d.eI.hide(i); continue; }

                    const u = ((i / 20) + t * 0.5) % 1;
                    const on = (i / 20) < d.rate;

                    if (on) { d.eI.set(i, 0, 1.7 + u * 3.2, 0); } else { d.eI.hide(i); }
                }

                d.eI.flush();
            }
        });

        // ================================================================
        // UNIT 10: ANATOMY OF A DEXCOM CGM
        // ================================================================
        const STEPS = [
            "Ready: the sensor sits inside a spring-loaded applicator, held above the skin.",
            "Press the applicator to the skin. The introducer needle carries the filament just under the surface.",
            "The needle withdraws back into the applicator, leaving the filament in place under the skin.",
            "The applicator lifts away. The adhesive patch holds the sensor and transmitter on the skin.",
            "The transmitter measures the sensor's current and sends it wirelessly. A new reading arrives about every 5 minutes."
        ];

        D("glu-3d-cgm", {

            title: "Explore in 3D: putting on a Dexcom CGM",
            intro: "Slide through the five steps, or press Play, and click any part to learn what it does.",
            stats: [["Step", "step"], ["Reading", "rd"], ["Where the filament is", "where"]],
            defaults: { step: 0, g: 118 },
            controls: [
                { actions: [["play", "▶ Play the five steps"]], label: "Apply" },
                { slider: "step", label: "Step (0 ready, 1 press, 2 needle out, 3 wear it, 4 reading)", min: 0, max: 4, step: 1, fmt: function (v) { return v + " of 4"; } },
                { slider: "g", label: "Glucose in the tissue (mg/dL)", min: 40, max: 400, step: 5, fmt: function (v) { return v + " mg/dL"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "The user presses a spring-loaded applicator to the skin. A tiny introducer needle carries the filament just under the skin and then withdraws, leaving the filament in place. An adhesive patch holds everything on, and the whole process takes seconds. The filament is placed once, and the needle does not stay in. The sensor measures glucose in the fluid between cells, a few minutes behind the blood. In Dexcom G7 the sensor and transmitter are combined into one small disposable. (Not to scale: the filament is far thinner than drawn.)",
            stage: { target: [0, 1.7, 0], halfWidth: 4.6, views: { three: [0.5, 1.2], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.45, 0.3] },
            info: {
                skin: "Skin: a thin outer layer (epidermis), the dermis beneath it, and fat below. The filament sits in the fluid between cells, a few millimeters down.",
                app: "The spring-loaded applicator: it positions everything and drives the introducer needle in one quick motion. It is thrown away after use.",
                needle: "The introducer needle: it carries the filament under the skin and then withdraws. It does not stay in.",
                fil: "The sensor filament: hair-thin, with its coating of enzyme and membranes. It is the part that senses glucose, and it stays under the skin for the whole wear period.",
                patch: "The adhesive patch: it holds the sensor and transmitter to the skin for 10 days (and a newer G7 version, 15).",
                tx: "The transmitter: electronics that measure the sensor's current and send it wirelessly. In Dexcom G7 it is combined with the sensor into one small disposable.",
                phone: "The display: a smartphone app or a dedicated receiver shows the value and trend, and sounds the alerts."
            },
            read: function (c) {

                const st = c.state.step;
                const G = c.state.g;

                return {
                    step: st + " of 4",
                    rd: st >= 4 ? Math.round(G) + " mg/dL" : "-",
                    where: st < 1 ? "Not placed yet" : st < 2 ? "Inside the needle" : "In the fluid under the skin",
                    verdict: STEPS[st]
                };
            },
            reward: { when: function (c) { return c.data.sawStep4 && c.count() >= 4; }, msg: "You applied a CGM and read it" },
            act: function (c, id) { if (id === "play") { c.state.step = 0; c.data.auto = true; c.data.at = 0; c.root.querySelector('input[data-key="step"]').value = 0; } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                d.sawStep4 = false; d.auto = false; d.at = 0;
                s.scene.add(g);
                s.shadow(g, 8, 6);

                // skin layers
                const epi = s.mat(0xe7b894, { roughness: 0.6, transparent: true, opacity: 0.55, depthWrite: false });
                const der = s.mat(0xe49a8a, { roughness: 0.6, transparent: true, opacity: 0.5, depthWrite: false });
                const fat = s.mat(0xf2d27a, { roughness: 0.6, transparent: true, opacity: 0.5, depthWrite: false });

                const e1 = s.box(5.2, 0.14, 3.2, epi, 0, 1.43, 0);
                const e2 = s.box(5.2, 0.7, 3.2, der, 0, 1.01, 0);
                const e3 = s.box(5.2, 1.2, 3.2, fat, 0, 0.06, 0);

                s.part(g, "skin", [e1, e2, e3], [epi, der, fat]);

                const sl = ["epidermis", "dermis", "fat"].map(function (n, i) { const l = s.label(n); l.at = function () { return [-2.9, [1.45, 1.0, 0.1][i], 1.6]; }; return l; });

                void sl;

                // applicator
                const am = s.glass(0xbfd0ff, 0.28, false);
                const app = new T.Group();
                const body = s.cyl(0.8, 0.8, 1.6, am, 0, 0.8, 0, 32);

                app.add(body);

                const cap = s.cyl(0.85, 0.85, 0.25, s.mat(0x4a516a, { roughness: 0.4 }), 0, 1.7, 0, 32);

                app.add(cap);

                const spring = s.tube((function () { const p = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 2 * 5; p.push([Math.cos(a) * 0.45, 0.3 + i / 60 * 1.1, Math.sin(a) * 0.45]); } return p; })(), 0.03, s.mat(0xc2c6d2, { metalness: 0.8, roughness: 0.3 }), 120);

                app.add(spring);
                s.part(g, "app", [body, cap, spring], [am]);
                g.add(app);
                d.app = app;

                // needle (in the applicator, then through the skin) and the filament
                const nm = s.mat(0xd9dae6, { metalness: 0.85, roughness: 0.25 });
                const needle = s.cyl(0.05, 0.05, 1.7, nm, 0, 0.85, 0, 12);

                g.add(needle);
                s.part(g, "needle", needle, [nm]);
                d.needle = needle;

                const fm = s.mat(0xffc94a, { roughness: 0.3, emissive: 0x2a1c00 });
                const fil = s.cyl(0.028, 0.028, 1.15, fm, 0, 0.6, 0, 8);

                g.add(fil);
                s.part(g, "fil", fil, [fm]);
                d.fil = fil;

                // patch and transmitter
                const pm = s.mat(0xf2f2f8, { roughness: 0.6 });
                const patch = s.cyl(1.25, 1.25, 0.07, pm, 0, 1.54, 0, 40);

                s.part(g, "patch", patch, [pm]);

                const tm = s.mat(0x54c9b0, { roughness: 0.35 });
                const tx = s.cyl(0.55, 0.62, 0.32, tm, 0, 1.76, 0, 32);

                s.part(g, "tx", tx, [tm]);
                d.patch = patch; d.tx = tx; d.tm = tm;

                // phone
                const ph = new T.Group();
                const phM = s.mat(0x10172e, { roughness: 0.3, metalness: 0.4 });
                const phBody = s.box(1.3, 2.4, 0.12, phM, 0, 0, 0);

                ph.add(phBody);

                const scr = new T.Mesh(new T.PlaneGeometry(1.1, 2.1), new T.MeshBasicMaterial({ color: 0x0a2a2a }));

                scr.position.z = 0.07;
                ph.add(scr);
                ph.position.set(3.4, 2.2, 0);
                ph.rotation.y = -0.5;
                s.part(g, "phone", phBody, [phM]);
                g.add(ph);
                d.ph = ph; d.scr = scr;

                // the reading painted on the screen
                const cv = document.createElement("canvas");

                cv.width = 128;
                cv.height = 256;
                d.cv = cv;
                d.tex = new T.CanvasTexture(cv);
                scr.material = new T.MeshBasicMaterial({ map: d.tex });

                // wireless waves
                const waves = [];

                for (let i = 0; i < 3; i++) {

                    const w = new T.Mesh(new T.TorusGeometry(0.6 + i * 0.3, 0.015, 6, 40, Math.PI * 0.6), new T.MeshBasicMaterial({ color: 0x78b4ff, transparent: true, opacity: 0.0 }));

                    w.position.set(0.8, 2.0, 0);
                    w.rotation.z = -Math.PI * 0.3;
                    g.add(w);
                    waves.push(w);
                }

                d.waves = waves;

                const lp = s.label("Phone or receiver");

                lp.at = function () { return [3.4, 3.7, 0]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const st = c.state.step;

                if (d.auto) {

                    d.at += dt;

                    if (d.at > 2.0) {

                        d.at = 0;

                        if (c.state.step < 4) { c.state.step++; c.root.querySelector('input[data-key="step"]').value = c.state.step; } else { d.auto = false; }
                    }
                }

                if (st >= 4) { d.sawStep4 = true; }

                // targets for each step
                const appY = [2.5, 1.6, 1.6, 4.4, 4.4][st];
                const appX = st >= 3 ? -3.2 : 0;
                const needleY = [3.4, 1.45, 2.8, 5.4, 5.4][st];
                const k = Math.min(1, dt * 4);

                d.app.position.y += (appY - d.app.position.y) * k;
                d.app.position.x += (appX - d.app.position.x) * k;
                d.needle.position.y += (needleY - d.needle.position.y) * k;
                d.needle.position.x += (appX - d.needle.position.x) * k;
                d.fil.visible = st >= 1;
                d.fil.position.y = 1.12;

                const worn = st >= 3;

                d.patch.visible = worn || d.patch.scale.x > 0.01;
                d.patch.scale.setScalar(Math.max(0.0001, d.patch.scale.x + ((worn ? 1 : 0) - d.patch.scale.x) * k));
                d.tx.scale.setScalar(Math.max(0.0001, d.tx.scale.x + ((worn ? 1 : 0) - d.tx.scale.x) * k));

                // phone screen
                const G = c.state.g;
                const x = d.cv.getContext("2d");

                x.fillStyle = "#0a1020";
                x.fillRect(0, 0, 128, 256);

                if (st >= 4) {

                    const col = G < 55 ? "#ff5a6a" : G < 70 || G > 250 ? "#ffd666" : "#54e0c7";

                    x.fillStyle = col;
                    x.font = "bold 52px sans-serif";
                    x.textAlign = "center";
                    x.fillText(String(Math.round(G)), 64, 120);
                    x.font = "16px sans-serif";
                    x.fillStyle = "#cdd6f5";
                    x.fillText("mg/dL", 64, 150);
                    x.font = "bold 40px sans-serif";
                    x.fillStyle = "#f5f7ff";
                    x.fillText("→", 64, 210);

                } else {

                    x.fillStyle = "#6b7390";
                    x.font = "16px sans-serif";
                    x.textAlign = "center";
                    x.fillText("waiting…", 64, 128);
                }

                d.tex.needsUpdate = true;

                d.waves.forEach(function (w, i) {

                    const a = st >= 4 ? Math.max(0, 0.9 - ((t * 0.7 + i / 3) % 1)) : 0;

                    w.material.opacity = a;
                    w.position.x = 0.4 + ((t * 0.7 + i / 3) % 1) * 1.2;
                });

                d.ph.visible = true;
            }
        });

        // ================================================================
        // UNIT 15: DIP COATING THE SENSOR
        // ================================================================
        const BATHS = {
            sel: { name: "Selective layer (purple)", hex: 0x9b7bff, info: "A selective inner layer: lets the small signal molecule through but blocks look-alikes such as acetaminophen." },
            enz: { name: "Enzyme layer (green)", hex: 0x54c98f, info: "The enzyme layer (glucose oxidase): it reacts with glucose and produces the hydrogen peroxide the electrode detects." },
            out: { name: "Outer membrane (blue)", hex: 0x5f9bff, info: "The outer membrane: it lets oxygen in more easily than glucose, so glucose is the limiting reagent, and it keeps the body's reaction down." }
        };

        D("glu-3d-dipcoat", {

            title: "Explore in 3D: building the layers by dip coating",
            intro: "Pick a bath, press Dip, and watch a layer build up around the wire. The order you dip in sets the order of the layers.",
            stats: [["Dips so far", "n"], ["Layers, inside to out", "order"], ["Total coating", "tot"], ["Uniformity", "uni"]],
            defaults: { bath: "sel", speed: 40 },
            controls: [
                { seg: "bath", label: "Bath", options: [["sel", "Selective"], ["enz", "Enzyme"], ["out", "Outer membrane"]] },
                { actions: [["dip", "⬇ Dip"], ["strip", "↺ New wire"]], label: "Coat" },
                { slider: "speed", label: "Withdrawal speed: faster drags up a thicker, less even film", min: 10, max: 100, step: 5, fmt: function (v) { return v + " %"; } },
                { views: ["three", "front", "close"] }
            ],
            formula: "A wire is dipped repeatedly to build up thin layers. Each dip leaves a film whose thickness depends on how fast the wire is pulled out: faster withdrawal drags up a thicker film but a less even one. Layer thickness sets sensitivity, so it must be controlled very tightly: a thicker outer membrane means less current but a straight response over a wider glucose range. A very reproducible process is what makes calibration-free sensing possible. (Layers are exaggerated in thickness.)",
            stage: { target: [0.4, 2.5, 0], halfWidth: 5.4, halfHeight: 3.7, views: { three: [0.5, 1.2], front: [0, 1.5], close: [0.4, 1.45] }, home: "three", sway: [0.4, 0.3] },
            info: (function () {

                const o = {};

                Object.keys(BATHS).forEach(function (k) { o["bath-" + k] = BATHS[k].info; });
                o.wire = "The electrode wire: platinum, a very effective catalyst for oxidizing hydrogen peroxide, but expensive. Everything else is coated on it.";
                o.arm = "The dipping arm: it lowers the wire into a bath, holds, and pulls it out at a controlled speed.";
                o.shell = "A coating layer, built by one dip. Layers stack in the order they were dipped.";

                return o;
            })(),
            read: function (c) {

                const d = c.data;

                if (!d.layers) { return {}; }

                const tot = d.layers.reduce(function (a, l) { return a + l.th; }, 0);
                const sp = c.state.speed;
                const uni = sp < 35 ? "Very even" : sp < 65 ? "Even" : "Uneven: ripples";
                const names = d.layers.map(function (l) { return BATHS[l.k].name.split(" ")[0]; });
                const order = [];

                names.forEach(function (n) { if (order[order.length - 1] !== n) { order.push(n); } });

                const idealOK = order.join(">") === "Selective>Enzyme>Outer";

                return {
                    n: d.layers.length,
                    order: order.length ? order.join(" → ") : "Bare wire",
                    tot: (tot * 10).toFixed(1) + " µm (relative)",
                    uni: uni,
                    verdict: d.layers.length === 0 ? "A bare platinum wire: pick a bath and dip" : idealOK ? "Selective, then enzyme, then outer membrane: the correct order, from the inside out" : "Layers build in the order you dip them: the usual order is selective, enzyme, outer"
                };
            },
            reward: { when: function (c) { const d = c.data; if (!d.layers) { return false; } const o = []; d.layers.forEach(function (l) { if (o[o.length - 1] !== l.k) { o.push(l.k); } }); return o.join(">") === "sel>enz>out" && d.layers.length >= 6; }, msg: "You built the sensor's layers in the right order" },
            act: function (c, id) { if (id === "dip") { c.data.dip(); } else { c.data.strip(); } },
            reset: function (c) { c.data.strip(); },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const R0 = 0.07;
                const WL = 2.2;               // coated length at the tip

                d.layers = [];
                d.dipState = 0;
                d.dipT = 0;
                d.shells = [];
                s.scene.add(g);
                s.shadow(g, 9, 4);

                // the three baths
                const bathX = { sel: -2.6, enz: 0, out: 2.6 };

                Object.keys(BATHS).forEach(function (k) {

                    const gl = s.glass(0xbfd0ff, 0.2, false);
                    const bk = s.cyl(0.85, 0.75, 1.5, gl, bathX[k], 0.75, 0, 28, true);
                    const liq = s.cyl(0.8, 0.72, 1.1, s.mat(BATHS[k].hex, { roughness: 0.2, metalness: 0.1 }), bathX[k], 0.58, 0, 28);

                    g.add(liq);
                    s.part(g, "bath-" + k, bk, [gl]);

                    const lb = s.label(BATHS[k].name);

                    lb.at = function () { return [bathX[k], 1.9, 0.9]; };
                });

                // the arm, holder and wire
                const armM = s.mat(0x4a516a, { metalness: 0.5, roughness: 0.4 });

                g.add(s.box(0.25, 5.2, 0.25, armM, -4.2, 2.6, -1.1));
                s.part(g, "arm", s.box(8.8, 0.22, 0.22, armM, 0, 5.1, -1.1), [armM]);

                const holder = new T.Group();
                const hd = s.cyl(0.14, 0.14, 0.5, armM, 0, 0, 0, 14);

                holder.add(hd);

                const wm = s.mat(0xe2e4ee, { metalness: 0.9, roughness: 0.2 });
                const wire = s.cyl(R0, R0, 4.2, wm, 0, -2.3, 0, 12);

                holder.add(wire);
                s.part(g, "wire", wire, [wm]);

                // shells of coating live in a group at the wire tip
                const tip = new T.Group();

                tip.position.set(0, -4.4 + WL / 2, 0);
                holder.add(tip);
                d.tip = tip;
                d.holder = holder;
                d.bathX = bathX;
                g.add(holder);
                holder.position.set(0, 5.0, 0.0);
                d.s = s;
                d.WL = WL;
                d.R0 = R0;

                const connector = s.cyl(0.05, 0.05, 0.9, armM, 0, 5.05, -0.55, 8);

                connector.rotation.x = Math.PI / 2;
                g.add(connector);

                d.dip = function () {

                    if (d.dipState !== 0) { return; }

                    d.dipState = 1;
                    d.dipT = 0;
                    d.bath = c.state.bath;
                };

                d.strip = function () {

                    d.layers = [];
                    d.shells.forEach(function (m) { tip.remove(m); m.geometry.dispose(); });
                    d.shells = [];
                    d.dipState = 0;
                    holder.position.y = 5.0;

                    if (d.rebuildSlice) { d.rebuildSlice(); }
                };

                d.addLayer = function (k, sp) {

                    const th = (0.02 + 0.07 * Math.pow(sp / 100, 0.7));
                    const outer = d.R0 + d.layers.reduce(function (a, l) { return a + l.th; }, 0);
                    const r1 = outer + th;
                    const mat = new T.MeshStandardMaterial({ color: BATHS[k].hex, roughness: 0.4 + sp / 300, metalness: 0.05 });
                    const sh = new T.Mesh(new T.CylinderGeometry(r1, r1, WL, 28, 1), mat);

                    sh.userData.k = k;
                    tip.add(sh);

                    // build from the outside in so that inner shells stay visible through the cutaway
                    d.shells.push(sh);
                    d.layers.push({ k: k, th: th });
                    sh.renderOrder = -d.layers.length;
                    s.part(g, "shell", sh, [mat]);
                    sh.position.y = 0;
                    d.rebuildSlice();
                };

                // a magnified cross-section of the wire so every layer can be seen
                const slice = new T.Group();

                slice.position.set(4.0, 0.9, 0.9);
                slice.rotation.x = -Math.PI / 2 + 0.25;
                g.add(slice);

                const sl = s.label("Cross-section (magnified)");

                sl.at = function () { return [4.3, 2.2, 0.9]; };

                d.rebuildSlice = function () {

                    while (slice.children.length) { const m = slice.children[0]; slice.remove(m); m.geometry.dispose(); }

                    const MAG = 6;
                    let r = d.R0 * MAG;
                    const core = new T.Mesh(new T.CircleGeometry(r, 40), new T.MeshStandardMaterial({ color: 0xe2e4ee, metalness: 0.8, roughness: 0.3, side: T.DoubleSide }));

                    slice.add(core);

                    d.layers.forEach(function (l, i) {

                        const r2 = r + l.th * MAG;
                        const ring = new T.Mesh(new T.RingGeometry(r, r2, 48), new T.MeshStandardMaterial({ color: BATHS[l.k].hex, roughness: 0.5, side: T.DoubleSide }));

                        ring.position.z = 0.001 * (i + 1);
                        slice.add(ring);
                        r = r2;
                    });
                };

                d.rebuildSlice();
            },
            frame: function (c, dt) {

                const d = c.data;
                const bx = d.bathX[c.state.bath];

                if (d.dipState === 0) {

                    d.holder.position.x += (bx - d.holder.position.x) * Math.min(1, dt * 4);
                    d.holder.position.y += (5.0 - d.holder.position.y) * Math.min(1, dt * 4);

                    return;
                }

                d.dipT += dt;

                const bxd = d.bathX[d.bath];

                // down 0.9 s, hold 0.4 s, up (slower when withdrawal speed is low)
                const up = 0.5 + (1 - c.state.speed / 100) * 1.3;

                if (d.dipT < 0.9) {

                    d.holder.position.x += (bxd - d.holder.position.x) * Math.min(1, dt * 6);
                    d.holder.position.y = 5.0 - (d.dipT / 0.9) * 2.6;

                } else if (d.dipT < 1.3) {

                    d.holder.position.y = 2.4;

                } else if (d.dipT < 1.3 + up) {

                    d.holder.position.y = 2.4 + ((d.dipT - 1.3) / up) * 2.6;

                } else {

                    d.addLayer(d.bath, c.state.speed);
                    d.dipState = 0;
                }
            }
        });

        document.querySelectorAll('.fd-sim[data-sim^="glu-3d-"]').forEach(F.mount);
    }

})();
