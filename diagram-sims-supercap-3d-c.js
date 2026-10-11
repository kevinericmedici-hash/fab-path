/* ========================================
   SUPERCAPACITORS: 3D SCENES, PART 2

   Unit 19: what the electrolyte does (aqueous, organic, ionic liquid, gel).
   Unit 25: how a supercapacitor is tested (three- vs two-electrode cell).
   Unit 31: slurry to electrode (a production line).
   Unit 37: where supercapacitors win (a 3D scorecard).

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

        function btn(label, attr) { return '<button type="button" class="fd-sim-btn" ' + attr + ">" + label + "</button>"; }

        function viewButtons() {

            return '<div class="fd-seg"><span class="fd-seg-label">View</span>' + btn("3/4 view", 'data-view="three"') + btn("Front", 'data-view="front"') + btn("Top", 'data-view="top"') + "</div>";
        }

        function bindViews(root, get) {

            root.querySelectorAll("[data-view]").forEach(function (b) {

                b.addEventListener("click", function () { const s = get(); if (s) { s.preset(b.dataset.view); } });
            });
        }

        // ================================================================
        // UNIT 19: THE ELECTROLYTE
        // ================================================================
        const ELY = {
            aq: { name: "Aqueous (water-based)", win: 1.2, cond: 1.0, safe: "Safest: not flammable, low cost", ion: 0.15, shell: 0.34, nShell: 1, solv: 170, mob: 1.0, ions: 26, note: "Water makes a small, tight solvation shell, so ions slide through quickly and conductivity is high. But water itself breaks apart above about 1.2 V, which caps the voltage." },
            org: { name: "Organic solvent", win: 2.7, cond: 0.4, safe: "Flammable solvent: needs care", ion: 0.15, shell: 0.5, nShell: 1, solv: 110, mob: 0.45, ions: 26, note: "Bulky organic solvent molecules wrap each ion in a bigger shell and the liquid is thicker, so ions move more slowly. In return the window reaches about 2.5 to 3 V, so the energy is much higher." },
            il: { name: "Ionic liquid", win: 3.5, cond: 0.12, safe: "Non-flammable, but costly", ion: 0.25, shell: 0, nShell: 0, solv: 0, mob: 0.18, ions: 40, note: "No solvent at all: the salt is already a liquid, made of big, bulky ions packed shoulder to shoulder. The window is wide, but the crowd is thick and slow, so conductivity is low." },
            gel: { name: "Gel polymer", win: 1.3, cond: 0.4, safe: "Safe: no free liquid to leak", ion: 0.15, shell: 0.34, nShell: 1, solv: 110, mob: 0.4, ions: 22, note: "A polymer network holds the liquid in place like a sponge (the green strands). Ions have to wind through the mesh, so they are slower than in a free liquid, but nothing can leak." }
        };

        SIMS["supercap-3d-electrolyte"] = function (root) {

            const defaults = { fam: "aq", v: 0.8 };
            const state = { fam: "aq", v: 0.8 };
            const seen = {};
            let S = null;
            let hit = false;
            let breakdownSeen = false;
            let dyn = null;
            const MAXC = 40;
            const MAXS = 200;
            const NB = 60;
            const rand = mulberry(19);

            root.innerHTML =
                head("Explore in 3D: inside the electrolyte") +
                F.three.stageHTML() +
                '<div class="fd-stat-row">' + stat("Voltage window", "win") + stat("Conductivity", "cond") + stat("Safety", "safe") + stat("Ions are moving", "drift") + "</div>" +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click an ion, a solvent molecule, or an electrode to learn what it does.</p>' +
                seg("Electrolyte family", "fam", [["aq", "Aqueous"], ["org", "Organic"], ["il", "Ionic liquid"], ["gel", "Gel polymer"]]) +
                viewButtons() +
                '<div class="fd-sim-controls">' + slider({ label: "Voltage across the cell (V)", key: "v", min: 0, max: 4, step: 0.1, value: 0.8 }) + "</div>" +
                '<p class="fd-sim-formula">Most electrolytes are a salt dissolved in a solvent. The salt splits into cations (orange) and anions (blue), and solvent molecules gather around each ion in a solvation shell, so an ion arrives with a coat that changes how big it acts and how fast it moves. Ionic liquids skip the solvent. No electrolyte wins every line: wide window, high conductivity, safety, and cost pull against each other. (Illustrative.)</p>';

            function update() {

                const E = ELY[state.fam];
                const over = state.v > E.win;

                seen[state.fam] = true;
                setVal(root, "v", state.v.toFixed(1) + " V");
                out(root, "win", "about " + E.win.toFixed(1) + " V");
                out(root, "cond", E.cond >= 0.9 ? "Highest" : E.cond >= 0.35 ? "Medium" : "Lowest");
                out(root, "safe", E.safe);
                out(root, "drift", state.v < 0.05 ? "only jiggling" : Math.round(E.mob * state.v / 1.0 * 10) / 10 + " (relative drift)");
                out(root, "verdict", over ? "Past the window: the electrolyte itself breaks down (bubbles)" : state.v < 0.05 ? "No voltage: ions just jiggle at random" : "Inside the window: ions drift toward the oppositely charged electrodes");

                if (over) { breakdownSeen = true; }

                if (!hit && breakdownSeen && Object.keys(seen).length >= 4) {

                    hit = true;
                    F.reward("supercap-3d-electrolyte", 10, "You compared all four electrolytes in 3D");
                }
            }

            function describe(p) {

                if (!p) { return; }

                const E = ELY[state.fam];
                const t = {
                    cat: "A cation (positive ion), orange. It is pulled toward the negative electrode on the left. " + E.note,
                    an: "An anion (negative ion), blue. It is pulled toward the positive electrode on the right.",
                    shell: state.fam === "il" ? "An ionic liquid has no solvation shell: the big ions touch each other directly." : "The solvation shell: solvent molecules cluster around the ion, so it moves and acts bigger than the bare ion.",
                    solvent: state.fam === "il" ? "There is no solvent in an ionic liquid." : "Solvent molecules. They surround ions, and they set how thick the liquid is.",
                    polymer: "The polymer network of a gel electrolyte. It holds the liquid like a sponge so it cannot leak, but ions have to wind through it.",
                    negE: "The negative electrode. Cations gather here and build the double layer.",
                    posE: "The positive electrode. Anions gather here.",
                    bubbles: "Gas or decomposition products. Past the voltage window the electrolyte itself is attacked, which ruins the cell."
                }[p.key];

                seen[p.key] = true;
                out(root, "info", t);
                update();
            }

            function ensureDyn() {

                const T = S.T;

                if (dyn) { S.dispose(dyn.group); }

                const E = ELY[state.fam];
                const g = new T.Group();
                const nI = E.ions;
                const parts = {};

                // ions
                const catM = new T.MeshStandardMaterial({ color: 0xffb04a, emissive: 0x4a2a00, roughness: 0.3 });
                const anM = new T.MeshStandardMaterial({ color: 0x5fb1ff, emissive: 0x0a2a4a, roughness: 0.3 });
                const shellM = new T.MeshPhysicalMaterial({ color: 0x9fe8d8, transparent: true, opacity: 0.18, roughness: 0.1, depthWrite: false });
                const solvM = new T.MeshStandardMaterial({ color: 0x8fe0c8, transparent: true, opacity: 0.7, roughness: 0.4 });

                const cats = new T.InstancedMesh(new T.SphereGeometry(E.ion, 14, 12), catM, nI);
                const ans = new T.InstancedMesh(new T.SphereGeometry(E.ion, 14, 12), anM, nI);
                const shC = new T.InstancedMesh(new T.SphereGeometry(Math.max(E.shell, 0.01), 14, 12), shellM, E.shell ? nI : 1);
                const shA = new T.InstancedMesh(new T.SphereGeometry(Math.max(E.shell, 0.01), 14, 12), shellM, E.shell ? nI : 1);
                const solv = new T.InstancedMesh(new T.SphereGeometry(0.075, 8, 6), solvM, Math.max(E.solv, 1));

                S.part(g, "cat", cats, [catM]);
                S.part(g, "an", ans, [anM]);

                if (E.shell) { S.part(g, "shell", [shC, shA], [shellM]); }

                if (E.solv) { S.part(g, "solvent", solv, [solvM]); }

                const st = { cats: [], ans: [], solv: [], nI: nI };

                for (let i = 0; i < nI; i++) {

                    st.cats.push({ x: (rand() - 0.5) * 3.6, y: 0.5 + rand() * 2.0, z: (rand() - 0.5) * 1.6, ph: rand() * 6 });
                    st.ans.push({ x: (rand() - 0.5) * 3.6, y: 0.5 + rand() * 2.0, z: (rand() - 0.5) * 1.6, ph: rand() * 6 });
                }

                for (let i = 0; i < E.solv; i++) { st.solv.push({ x: (rand() - 0.5) * 4, y: 0.45 + rand() * 2.1, z: (rand() - 0.5) * 1.8, ph: rand() * 6 }); }

                // gel network
                if (state.fam === "gel") {

                    const pm = new T.MeshStandardMaterial({ color: 0x4fb27a, roughness: 0.6 });
                    const strands = [];

                    for (let i = 0; i < 16; i++) {

                        const pts = [];
                        let x = -2 + rand() * 4;
                        let y = 0.4 + rand() * 2.2;
                        let z = (rand() - 0.5) * 1.8;

                        for (let k = 0; k < 5; k++) {

                            pts.push(new T.Vector3(x, y, z));
                            x += (rand() - 0.5) * 1.2;
                            y += (rand() - 0.5) * 1.0;
                            z += (rand() - 0.5) * 0.8;
                            x = clamp(x, -2.1, 2.1);
                            y = clamp(y, 0.35, 2.7);
                            z = clamp(z, -0.9, 0.9);
                        }

                        strands.push(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 24, 0.035, 6), pm));
                    }

                    S.part(g, "polymer", strands, [pm]);
                }

                // bubbles when we go past the window
                const bm = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.1 });
                const bubbles = new T.InstancedMesh(new T.SphereGeometry(0.06, 8, 6), bm, NB);

                S.part(g, "bubbles", bubbles, [bm]);
                st.bub = [];

                for (let i = 0; i < NB; i++) { st.bub.push({ side: i % 2, y: rand() * 2.4, x: 0, z: (rand() - 0.5) * 1.5, v: 0.5 + rand() * 0.8 }); }

                dyn = { group: g, cats: cats, ans: ans, shC: shC, shA: shA, solv: solv, st: st, E: E, bubbles: bubbles, m4: new T.Matrix4() };
                S.scene.add(g);
                update();
            }

            function frame(dt, t) {

                if (!dyn) { return; }

                const E = dyn.E;
                const st = dyn.st;
                const m4 = dyn.m4;
                const T = S.T;
                const field = state.v;
                const over = state.v > E.win;
                const L = -2.15;
                const R = 2.15;
                const drift = E.mob * field * 0.55;
                const r = E.shell || E.ion;
                const place = function (arr, im, sh, dir) {

                    for (let i = 0; i < st.nI; i++) {

                        const p = arr[i];

                        p.x += (dir * drift + Math.sin(t * 1.3 + p.ph) * 0.35) * dt;
                        p.y += Math.cos(t * 1.1 + p.ph * 1.7) * 0.3 * dt;
                        p.z += Math.sin(t * 0.9 + p.ph * 2.1) * 0.25 * dt;
                        p.x = clamp(p.x, L + r + 0.08, R - r - 0.08);
                        p.y = clamp(p.y, 0.45 + r, 2.65 - r);
                        p.z = clamp(p.z, -0.95 + r, 0.95 - r);

                        m4.makeTranslation(p.x, p.y, p.z);
                        im.setMatrixAt(i, m4);

                        if (sh && E.shell) { sh.setMatrixAt(i, m4); }
                    }

                    im.instanceMatrix.needsUpdate = true;

                    if (sh && E.shell) { sh.instanceMatrix.needsUpdate = true; }
                };

                place(st.cats, dyn.cats, dyn.shC, -1);
                place(st.ans, dyn.ans, dyn.shA, 1);

                if (E.solv) {

                    for (let i = 0; i < E.solv; i++) {

                        const p = st.solv[i];

                        p.x += Math.sin(t * 1.9 + p.ph) * 0.3 * dt;
                        p.y += Math.cos(t * 1.7 + p.ph * 1.3) * 0.3 * dt;
                        p.z += Math.sin(t * 1.5 + p.ph * 2.3) * 0.25 * dt;
                        p.x = clamp(p.x, L + 0.1, R - 0.1);
                        p.y = clamp(p.y, 0.45, 2.6);
                        p.z = clamp(p.z, -0.9, 0.9);
                        m4.makeTranslation(p.x, p.y, p.z);
                        dyn.solv.setMatrixAt(i, m4);
                    }

                    dyn.solv.instanceMatrix.needsUpdate = true;
                }

                // bubbles stream off both electrodes when the voltage is past the window
                const rate = over ? clamp((state.v - E.win) / 1.2, 0.2, 1) : 0;

                for (let i = 0; i < NB; i++) {

                    const b = st.bub[i];
                    const on = i / NB < rate;

                    b.y += b.v * dt * 0.9;

                    if (b.y > 2.6) { b.y = 0.45; b.z = (rand() - 0.5) * 1.5; }

                    const sc = on ? 1 : 0.0001;

                    m4.makeScale(sc, sc, sc);
                    m4.setPosition(b.side ? R - 0.15 : L + 0.15, b.y, b.z);
                    dyn.bubbles.setMatrixAt(i, m4);
                }

                dyn.bubbles.instanceMatrix.needsUpdate = true;
                void T;
                update();
            }

            root.querySelector("[data-reset]").addEventListener("click", function () {

                if (S) { S.select(null); S.resetView(); }

                out(root, "info", "Click an ion, a solvent molecule, or an electrode to learn what it does.");
            });

            bindViews(root, function () { return S; });

            let lastFam = state.fam;

            wire(root, state, defaults, function () {

                if (S && state.fam !== lastFam) { lastFam = state.fam; ensureDyn(); out(root, "info", ELY[state.fam].note); }

                update();
            });

            update();

            F.three.create(root, { target: [0, 1.5, 0], halfWidth: 4.2, views: { three: [0.5, 1.15], front: [0, 1.48], top: [0, 0.3] }, home: "three", sway: [0.4, 0.3], onPick: describe }).then(function (s) {

                S = s;

                const T = s.T;
                const g = new T.Group();

                s.shadow(g, 6, 3.6);
                s.scene.add(g);

                const glass = s.glass(0x9fb8f0, 0.12, false);
                const tank = new T.Mesh(new T.BoxGeometry(4.5, 2.6, 2.0), glass);

                tank.position.set(0, 1.5, 0);
                g.add(tank);

                const ed = new T.LineSegments(new T.EdgesGeometry(tank.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.5 }));

                ed.position.copy(tank.position);
                g.add(ed);

                const liq = new T.MeshStandardMaterial({ color: 0x7fe6d6, transparent: true, opacity: 0.08, depthWrite: false });
                const li = new T.Mesh(new T.BoxGeometry(4.4, 2.3, 1.9), liq);

                li.position.set(0, 1.45, 0);
                g.add(li);

                const nm = s.mat(0x6aa5ff, { metalness: 0.6, roughness: 0.3 });
                const pm = s.mat(0xff6f7e, { metalness: 0.6, roughness: 0.3 });

                s.part(g, "negE", s.box(0.1, 2.5, 1.9, nm, -2.25, 1.5, 0), [nm]);
                s.part(g, "posE", s.box(0.1, 2.5, 1.9, pm, 2.25, 1.5, 0), [pm]);

                const l1 = s.label("− electrode");

                l1.at = function () { return [-2.25, 3.0, 0]; };

                const l2 = s.label("+ electrode");

                l2.at = function () { return [2.25, 3.0, 0]; };

                ensureDyn();
                s.onFrame(frame);
                s.start();

            }).catch(function () { });
        };

        // ================================================================
        // UNIT 25: THE TEST CELL
        // ================================================================
        SIMS["supercap-3d-testcell"] = function (root) {

            const defaults = { cell: "three", sweep: "run", scan: 50 };
            const state = { cell: "three", sweep: "run", scan: 50 };
            const seen = {};
            let S = null;
            let hit = false;
            let E = 0;                     // potential of the working electrode vs the reference, volts
            let dir = 1;
            let dyn = null;
            let cvPts = [];
            let tCv = 0;
            let cvCanvas = null;
            let sweeps = 0;
            const rand = mulberry(25);
            const NI = 56;
            const C = 4;                     // capacitance in arbitrary units, for the current readout

            root.innerHTML =
                head("Explore in 3D: the test cell") +
                F.three.stageHTML() +
                '<canvas data-cv width="680" height="170" style="width:100%;max-height:170px;border-radius:12px;background:rgba(6,10,24,.6);margin-top:8px" role="img" aria-label="A live cyclic voltammogram: current against voltage as the potential sweeps up and down. The current is a flat box for an ideal capacitor."></canvas>' +
                '<div class="fd-stat-row">' + stat("Working electrode vs reference", "e") + stat("Current", "i") + stat("What you are measuring", "what") + "</div>" +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click an electrode, the beaker, or the potentiostat to learn what it does.</p>' +
                seg("Cell", "cell", [["three", "Three-electrode (a material)"], ["two", "Two-electrode (a real device)"]]) +
                seg("Sweep", "sweep", [["run", "Run the sweep"], ["hold", "Hold"]]) +
                viewButtons() +
                '<div class="fd-sim-controls">' + slider({ label: "Scan rate (mV/s): how fast the voltage sweeps", key: "scan", min: 10, max: 100, step: 5, value: 50 }) + "</div>" +
                '<p class="fd-sim-formula">A potentiostat controls the voltage and measures the current (cyclic voltammetry). In a three-electrode cell the reference electrode holds a steady, known potential, so the working electrode can be measured on its own. The counter electrode just carries the current. A two-electrode cell is the device itself: the full voltage is applied across both electrodes with no reference. Materials: three-electrode. Devices: two-electrode. For an ideal capacitor, i = C × (scan rate), a flat box on the plot.</p>';

            cvCanvas = root.querySelector("[data-cv]");

            const INFO = {
                we: "Working electrode: the material under test. Its potential is what you control and study. Ions gather on its surface as the potential is swept.",
                re: "Reference electrode: holds a steady, known potential (often silver/silver chloride), so the working electrode can be measured against it. It draws almost no current.",
                ce: "Counter electrode: completes the circuit and carries the current, usually with a larger area than the working electrode so it never limits the measurement.",
                dev1: "Device electrode 1: in a two-electrode cell this is one electrode of the real device itself, wired like the working electrode.",
                dev2: "Device electrode 2: the other electrode of the device. The full cell voltage is applied across both, with no reference.",
                potentiostat: "The potentiostat: it controls the voltage and measures the current. Most electrochemical workstations also do constant-current charge and discharge, and impedance.",
                beaker: "The cell holding the electrolyte and the electrodes.",
                electrolyte: "The electrolyte: the ions that build the double layer on the electrode surface."
            };

            function update() {

                const three = state.cell === "three";
                const I = C * (state.scan / 50) * dir;

                setVal(root, "scan", state.scan + " mV/s");
                out(root, "e", (E >= 0 ? "+" : "") + E.toFixed(2) + " V");
                out(root, "i", (I >= 0 ? "+" : "") + I.toFixed(1) + " mA");
                out(root, "what", three ? "The material alone" : "The whole device: electrodes, separator, electrolyte and contacts");
                out(root, "verdict", three ? "Three-electrode: the reference lets you watch the working electrode by itself" : "Two-electrode: the full cell voltage goes across both electrodes, as in real use");

                if (!hit && sweeps >= 2 && Object.keys(seen).length >= 3) {

                    hit = true;
                    F.reward("supercap-3d-testcell", 10, "You ran both kinds of test cell");
                }
            }

            function drawCv() {

                const c = cvCanvas.getContext("2d");
                const W = 680;
                const H = 170;

                c.clearRect(0, 0, W, H);
                c.fillStyle = "rgba(6,10,24,.55)";
                c.fillRect(0, 0, W, H);

                const L = 74;
                const R = 650;
                const T = 14;
                const B = 138;
                const X = function (v) { return L + (v + 0.5) / 1.0 * (R - L); };
                const Y = function (i) { return (T + B) / 2 - i / 6 * ((B - T) / 2); };

                c.strokeStyle = "rgba(170,179,207,.5)";
                c.lineWidth = 1.5;
                c.beginPath();
                c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B);
                c.moveTo(L, Y(0)); c.lineTo(R, Y(0));
                c.stroke();
                c.fillStyle = "rgba(245,247,255,.7)";
                c.font = "11px sans-serif";
                c.textAlign = "center";
                [-0.5, 0, 0.5].forEach(function (v) { c.fillText((v > 0 ? "+" : "") + v.toFixed(1) + " V", X(v), B + 14); });
                c.fillText("potential (V) →", (L + R) / 2, B + 28);

                c.save();
                c.translate(18, (T + B) / 2);
                c.rotate(-Math.PI / 2);
                c.font = "bold 12px sans-serif";
                c.fillStyle = "rgba(238,242,255,.9)";
                c.fillText("current (mA)", 0, 0);
                c.restore();

                const sc = state.scan / 50;

                c.strokeStyle = "rgba(84,224,199,.5)";
                c.setLineDash([4, 4]);
                c.beginPath();
                c.moveTo(X(-0.5), Y(C * sc)); c.lineTo(X(0.5), Y(C * sc));
                c.moveTo(X(0.5), Y(-C * sc)); c.lineTo(X(-0.5), Y(-C * sc));
                c.stroke();
                c.setLineDash([]);

                c.strokeStyle = "rgba(84,224,199,.98)";
                c.lineWidth = 3;
                c.beginPath();

                cvPts.forEach(function (p, i) { if (i === 0) { c.moveTo(X(p[0]), Y(p[1])); } else { c.lineTo(X(p[0]), Y(p[1])); } });

                c.stroke();
                c.fillStyle = "rgba(255,214,102,1)";
                c.beginPath();
                c.arc(X(E), Y(C * (state.scan / 50) * dir), 6, 0, 7);
                c.fill();
            }

            function describe(p) {

                if (!p) { return; }

                seen[p.key] = true;
                out(root, "info", INFO[p.key]);
                update();
            }

            function buildCell() {

                const T = S.T;

                if (dyn) { S.dispose(dyn.group); }

                const g = new T.Group();
                const three = state.cell === "three";
                const wm = S.mat(0xd9b45a, { metalness: 0.7, roughness: 0.3 });

                S.shadow(g, 9, 4);

                const glass = S.glass(0xb9c8ee, 0.14, false);
                const bk = new T.Mesh(new T.CylinderGeometry(1.5, 1.45, 2.9, 40, 1, true), glass);

                bk.position.set(0, 1.55, 0);
                S.part(g, "beaker", bk, [glass], true);

                const base = new T.Mesh(new T.CylinderGeometry(1.45, 1.45, 0.08, 40), glass);

                base.position.set(0, 0.12, 0);
                g.add(base);

                const lm = new T.MeshStandardMaterial({ color: 0x7fe6d6, transparent: true, opacity: 0.16, roughness: 0.1, depthWrite: false });
                const lq = new T.Mesh(new T.CylinderGeometry(1.42, 1.42, 2.1, 40), lm);

                lq.position.set(0, 1.2, 0);
                S.part(g, "electrolyte", lq, [lm], true);

                const weM = S.mat(0x3b6fd8, { metalness: 0.6, roughness: 0.3 });
                const reM = S.mat(0xd8dae2, { metalness: 0.3, roughness: 0.3 });
                const ceM = S.mat(0xc2c6d2, { metalness: 0.7, roughness: 0.3 });
                const ceM2 = S.mat(0xc2c6d2, { metalness: 0.7, roughness: 0.3 });
                const wires = [];
                const ions = new T.InstancedMesh(new T.SphereGeometry(0.06, 10, 8), new T.MeshStandardMaterial({ color: 0xffb04a, emissive: 0x4a2a00 }), NI);
                const pos = [];

                // electrodes
                const we = three ? S.box(0.08, 1.7, 0.7, weM, -0.55, 1.35, 0) : S.box(0.08, 1.7, 1.1, weM, -0.7, 1.35, 0);
                const ce = three ? S.box(0.06, 1.8, 1.2, ceM, 0.95, 1.35, 0) : S.box(0.08, 1.7, 1.1, ceM2, 0.7, 1.35, 0);
                const stems = [];

                S.part(g, three ? "we" : "dev1", we, [weM]);
                S.part(g, three ? "ce" : "dev2", ce, [three ? ceM : ceM2]);

                // leads up out of the beaker
                const mk = function (x, mat) { const r = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1.4, 8), mat); r.position.set(x, 2.8, 0); g.add(r); stems.push(r); };

                mk(three ? -0.55 : -0.7, weM);
                mk(three ? 0.95 : 0.7, three ? ceM : ceM2);

                let reX = 0.2;

                if (three) {

                    const tubeM = S.glass(0xcfe0ff, 0.35, false);
                    const tube = new T.Mesh(new T.CylinderGeometry(0.12, 0.1, 2.2, 14), tubeM);

                    tube.position.set(reX, 1.9, 0.0);

                    const inner = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1.9, 8), reM);

                    inner.position.set(reX, 1.95, 0);
                    S.part(g, "re", [tube, inner], [tubeM, reM]);

                    const tip = new T.Mesh(new T.SphereGeometry(0.1, 12, 8), S.mat(0x9aa4c4, { roughness: 0.6 }));

                    tip.position.set(reX, 0.85, 0);
                    g.add(tip);
                    mk(reX, reM);
                }

                // potentiostat box
                const pm = S.mat(0x39415c, { metalness: 0.3, roughness: 0.45 });
                const px = 3.7;
                const pot = S.box(1.9, 1.3, 1.3, pm, px, 0.75, 0);

                S.part(g, "potentiostat", pot, [pm]);

                const scr = new T.Mesh(new T.PlaneGeometry(1.2, 0.5), new T.MeshBasicMaterial({ color: 0x0a2a2a }));

                scr.position.set(px, 0.95, 0.66);
                g.add(scr);

                const sock = [[px - 0.55, 0xff6f7e], [px, 0xd9b45a], [px + 0.55, 0x6aa5ff]];

                sock.forEach(function (sk, i) {

                    const c = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.1, 12), new T.MeshStandardMaterial({ color: sk[1] }));

                    c.rotation.x = Math.PI / 2;
                    c.position.set(sk[0], 0.45, 0.66);
                    g.add(c);
                });

                // wires from the leads to the potentiostat
                const toPot = function (x0, mat, sx) {

                    const curve = new T.CatmullRomCurve3([new T.Vector3(x0, 3.5, 0), new T.Vector3(x0, 4.0, 0.2), new T.Vector3((x0 + sx) / 2, 4.2, 0.5), new T.Vector3(sx, 3.0, 0.9), new T.Vector3(sx, 1.5, 0.8)]);
                    const tb = new T.Mesh(new T.TubeGeometry(curve, 30, 0.03, 6), mat);

                    g.add(tb);
                    wires.push(tb);
                };

                toPot(three ? -0.55 : -0.7, new T.MeshStandardMaterial({ color: 0x6aa5ff }), px + 0.55);
                toPot(three ? 0.95 : 0.7, new T.MeshStandardMaterial({ color: 0xff6f7e }), px - 0.55);

                if (three) { toPot(reX, new T.MeshStandardMaterial({ color: 0xd9b45a }), px); }

                // ions near the working electrode surface (and the counter electrode)
                const weX = three ? -0.55 : -0.7;
                const ceX = three ? 0.95 : 0.7;

                for (let i = 0; i < NI; i++) {

                    const onW = i % 2 === 0;

                    pos.push({
                        w: onW,
                        free: [(rand() - 0.5) * 2.3, 0.5 + rand() * 1.9, (rand() - 0.5) * 1.5],
                        site: [onW ? weX + 0.12 : ceX - 0.1, 0.65 + rand() * 1.4, (rand() - 0.5) * (onW ? 0.6 : 1.0)]
                    });
                }

                S.part(g, "electrolyte", ions, [ions.material], true);
                g.add(ions);

                S.scene.add(g);

                const l1 = S.label(three ? "Working" : "Device +/−");

                l1.at = function () { return [weX, 3.35, 0, -14, 0]; };

                const l3 = S.label(three ? "Counter" : "Device");

                l3.at = function () { return [ceX, 3.35, 0, 14, 0]; };

                const lbls = [l1, l3];

                if (three) {

                    const l2 = S.label("Reference");

                    l2.at = function () { return [reX, 4.15, 0]; };
                    lbls.push(l2);
                }

                const lp = S.label("Potentiostat");

                lp.at = function () { return [px, 1.8, 0]; };
                lbls.push(lp);

                dyn = { group: g, ions: ions, pos: pos, m4: new T.Matrix4(), lbls: lbls };
            }

            function frame(dt, t) {

                if (!dyn) { return; }

                // sweep the potential as a triangle wave
                if (state.sweep === "run") {

                    const rate = (state.scan / 1000) * 7;

                    E += dir * rate * dt;

                    if (E >= 0.5) { E = 0.5; dir = -1; sweeps += 0.5; }
                    if (E <= -0.5) { E = -0.5; dir = 1; sweeps += 0.5; }

                    tCv += dt;
                    cvPts.push([E, C * (state.scan / 50) * dir]);

                    if (cvPts.length > 260) { cvPts.shift(); }
                }

                const m4 = dyn.m4;
                const q = (E + 0.5);                // 0 to 1 over the sweep

                dyn.pos.forEach(function (p, i) {

                    const s = p.w ? clamp((E + 0.5) * 1.6 - 0.1, 0, 1) : clamp((0.5 - E) * 1.6 - 0.1, 0, 1);
                    const e = s * s * (3 - 2 * s);
                    const jit = (1 - e) * 0.03;

                    m4.makeTranslation(p.free[0] + (p.site[0] - p.free[0]) * e + Math.sin(t * 1.5 + i) * jit, p.free[1] + (p.site[1] - p.free[1]) * e + Math.cos(t * 1.3 + i) * jit, p.free[2] + (p.site[2] - p.free[2]) * e);
                    dyn.ions.setMatrixAt(i, m4);
                });

                void q;
                dyn.ions.instanceMatrix.needsUpdate = true;
                update();
                drawCv();
            }

            root.querySelector("[data-reset]").addEventListener("click", function () {

                E = 0;
                dir = 1;
                cvPts = [];
                sweeps = 0;

                if (S) { S.select(null); S.resetView(); }

                out(root, "info", "Click an electrode, the beaker, or the potentiostat to learn what it does.");
            });

            bindViews(root, function () { return S; });

            let lastCell = state.cell;

            wire(root, state, defaults, function () {

                if (S && state.cell !== lastCell) {

                    lastCell = state.cell;

                    if (dyn) { dyn.lbls.forEach(function (l) { l.el.remove(); S.labels.splice(S.labels.indexOf(l), 1); }); }

                    buildCell();
                    cvPts = [];
                }

                update();
            });

            update();
            drawCv();

            F.three.create(root, { target: [1.0, 1.7, 0], halfWidth: 5.4, views: { three: [0.35, 1.15], front: [0, 1.48], top: [0, 0.3] }, home: "three", sway: [0.35, 0.25], onPick: describe }).then(function (s) {

                S = s;
                buildCell();
                s.onFrame(frame);
                s.start();

            }).catch(function () { });
        };

        // ================================================================
        // UNIT 31: THE COATING LINE
        // ================================================================
        const STATIONS = {
            mix: ["Mix", "Active material, conductive additive, binder and solvent are stirred into a uniform paste called a slurry."],
            cast: ["Cast", "A doctor blade spreads the slurry into a film on metal foil. The gap under the blade sets how thick the wet film is, and so how much active material goes on."],
            dry: ["Dry", "The oven drives off the solvent. The film shrinks, and a thick film dried too fast can crack or peel."],
            press: ["Press", "Rollers squeeze the dried film to densify it and improve contact between grains and with the foil."],
            cut: ["Cut", "Discs or strips are punched out for assembly into cells."],
            foil: ["Metal foil (current collector)", "The foil carries the electrons out. Everything else is coated on it."],
            film: ["Electrode film", "The coated film of active material, additive and binder. Its thickness and loading are a dial between energy and speed."]
        };

        SIMS["supercap-3d-coating"] = function (root) {

            const defaults = { gap: 0.12, bind: 6, play: "run" };
            const state = { gap: 0.12, bind: 6, play: "run" };
            const seen = {};
            let S = null;
            let hit = false;
            let discs = 0;
            let segs = [];
            let discIM = null;
            let stirrer = null;
            let blade = null;
            let punch = null;
            let vapor = null;
            let vp = [];
            let rollA = null;
            let rollB = null;
            let glow = null;
            const rand = mulberry(31);
            const NSEG = 30;
            const SEGL = 0.5;
            const X0 = -7.2;
            const X1 = 7.4;
            const MAXD = 40;

            root.innerHTML =
                head("Explore in 3D: from slurry to electrode") +
                F.three.stageHTML() +
                '<div class="fd-stat-row">' + stat("Wet film", "wet") + stat("Dry, pressed film", "dry") + stat("Loading", "load") + stat("Film quality", "quality") + "</div>" +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click a station of the line, or the foil, to learn what happens there.</p>' +
                seg("Line", "play", [["run", "Run"], ["hold", "Pause"]]) +
                viewButtons() +
                '<div class="fd-sim-controls">' +
                slider({ label: "Blade gap: wet film thickness (mm, relative)", key: "gap", min: 0.04, max: 0.24, step: 0.01, value: 0.12 }) +
                slider({ label: "Binder (%): glue that holds the film on", key: "bind", min: 0, max: 20, step: 1, value: 6 }) +
                "</div>" +
                '<p class="fd-sim-formula">The recipe is borrowed from batteries: Mix, Cast, Dry, Press, Cut. A thicker film holds more material (more energy) but makes ions travel farther (less power) and risks cracking. Too little binder and the film peels; too much blocks the pores. Loading is a dial between energy and speed. (Not to scale; thicknesses are exaggerated.)</p>';

            function quality() {

                const crack = state.gap > 0.16 && state.bind < 8 ? 1 : state.gap > 0.2 ? 0.7 : 0;
                const peel = state.bind < 3 ? 1 : 0;

                return { crack: crack, peel: peel };
            }

            function update() {

                const q = quality();

                setVal(root, "gap", state.gap.toFixed(2));
                setVal(root, "bind", state.bind + " %");
                out(root, "wet", (state.gap * 1000).toFixed(0) + " µm (relative)");
                out(root, "dry", (state.gap * 0.6 * 1000).toFixed(0) + " → " + (state.gap * 0.42 * 1000).toFixed(0) + " µm");
                out(root, "load", state.gap < 0.08 ? "Low: fast but less energy" : state.gap > 0.17 ? "High: more energy, slower ions" : "Middle");
                out(root, "quality", q.peel ? "Peeling: not enough binder" : q.crack ? "Cracking in the oven" : state.bind > 14 ? "Holds, but binder blocks pores" : "Good film");
                out(root, "verdict", q.peel ? "Too little binder: the film peels off the foil" : q.crack ? "Thick film and little binder: it cracks as it dries" : "Loading is a dial between energy and speed");

                if (!hit && discs >= 6 && Object.keys(seen).length >= 3) {

                    hit = true;
                    F.reward("supercap-3d-coating", 10, "You ran the coating line");
                }
            }

            function describe(p) {

                if (!p) { return; }

                const d = STATIONS[p.key];

                if (!d) { return; }

                seen[p.key] = true;
                out(root, "info", d[0] + ": " + d[1]);
                update();
            }

            function thick(x, k) {

                // thickness of the coating by zone along the line
                if (x < -3.6) { return 0; }
                if (x < -0.9) { return state.gap * 1.0; }
                if (x < 0.9) { return state.gap * (1.0 - 0.4 * clamp((x + 0.9) / 1.8, 0, 1)); }
                if (x < 2.4) { return state.gap * 0.6; }
                if (x < 4.0) { return state.gap * (0.6 - 0.18 * clamp((x - 2.4) / 0.8, 0, 1)); }

                return state.gap * 0.42;
            }

            function frame(dt, t) {

                const run = state.play === "run";
                const sp = run ? 0.85 : 0;
                const q = quality();

                if (stirrer) { stirrer.rotation.y += dt * 4; }

                if (blade) { blade.position.y = 0.56 + state.gap * 2.2 + 0.03; }

                if (rollA) { rollA.rotation.z += sp * dt * 2.4; rollB.rotation.z -= sp * dt * 2.4; }

                if (punch) {

                    const ph = (t * 1.1) % 1;

                    punch.position.y = 1.3 - Math.abs(Math.sin(ph * Math.PI)) * 0.78 * (run ? 1 : 0);
                }

                segs.forEach(function (s) {

                    s.x += sp * dt;

                    if (s.x > X1) {

                        s.x = X0;
                    }

                    const th = thick(s.x);
                    const dried = s.x > 0.9;

                    s.group.position.x = s.x;

                    s.coat.visible = th > 0.002 && s.x < 5.6;
                    s.coat.scale.y = Math.max(0.01, th * 2.2);
                    s.coat.position.y = 0.56 + th * 1.1;
                    s.coat.material.color.setHex(s.x < 0.9 ? 0x1c2030 : s.x < 2.4 ? 0x3b4256 : 0x2a2f40);
                    s.coat.material.roughness = s.x < 0.9 ? 0.15 : 0.8;

                    s.crack.visible = dried && q.crack > 0 && s.x < 5.6;
                    s.crack.position.y = 0.56 + th * 2.2 + 0.001;

                    if (q.peel && dried && s.x < 5.6) {

                        s.coat.position.y += Math.sin(t * 6 + s.x) * 0.01;
                        s.coat.rotation.z = 0.12 * Math.sin(s.x * 3);

                    } else {

                        s.coat.rotation.z = 0;
                    }

                    if (!s.punched && s.x > 5.55) {

                        s.punched = true;
                        discs = Math.min(MAXD, discs + 1);
                    }

                    if (s.x < X0 + 0.6) { s.punched = false; }
                });

                // discs piling up in the tray
                const m4 = new S.T.Matrix4();

                for (let i = 0; i < MAXD; i++) {

                    const on = i < discs;
                    const sc = on ? 1 : 0.0001;

                    m4.makeScale(sc, sc, sc);
                    m4.setPosition(6.3 + (i % 8) * 0.0, 0.5 + Math.floor(i / 1) * 0.0, 0);
                    m4.setPosition(5.9 + (i % 5) * 0.24, 0.12 + Math.floor(i / 5) * 0.045, 1.4 + ((i * 7) % 3) * 0.12);
                    discIM.setMatrixAt(i, m4);
                }

                discIM.instanceMatrix.needsUpdate = true;

                // solvent vapor over the oven
                for (let i = 0; i < vp.length; i++) {

                    const v = vp[i];

                    v.y += dt * 0.8 * (run ? 1 : 0.2);

                    if (v.y > 2.1) { v.y = 0.8; v.x = -0.7 + rand() * 1.4; v.z = (rand() - 0.5) * 0.8; }

                    const on = run && i / vp.length < clamp(state.gap / 0.14, 0, 1);

                    m4.makeScale(on ? 1 : 0.0001, on ? 1 : 0.0001, on ? 1 : 0.0001);
                    m4.setPosition(v.x, v.y, v.z);
                    vapor.setMatrixAt(i, m4);
                }

                vapor.instanceMatrix.needsUpdate = true;

                if (glow) { glow.intensity = 1.6 + Math.sin(t * 5) * 0.2; }

                update();
            }

            function build(s) {

                const T = s.T;
                const g = new T.Group();

                s.shadow(g, 18, 5);
                s.scene.add(g);

                // belt
                const beltM = s.mat(0x6a7290, { metalness: 0.1, roughness: 0.7 });

                g.add(s.box(15.2, 0.14, 1.7, beltM, 0, 0.35, 0));

                [-1, 1].forEach(function (k) {

                    const r = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 1.8, 24), s.mat(0x4a516a, { metalness: 0.6 }));

                    r.rotation.x = Math.PI / 2;
                    r.position.set(k * 7.6, 0.35, 0);
                    g.add(r);
                });

                // 1. mixer
                const glassM = s.glass(0x9fb8f0, 0.2, false);
                const bk = new T.Mesh(new T.CylinderGeometry(0.9, 0.78, 1.5, 28, 1, true), glassM);

                bk.position.set(-6.0, 1.1, 0);
                s.part(g, "mix", bk, [glassM]);

                const slurry = new T.Mesh(new T.CylinderGeometry(0.82, 0.76, 1.0, 28), new T.MeshStandardMaterial({ color: 0x1c2030, roughness: 0.15, metalness: 0.2 }));

                slurry.position.set(-6.0, 0.88, 0);
                g.add(slurry);

                stirrer = new T.Group();
                stirrer.position.set(-6.0, 1.5, 0);
                [0, Math.PI / 2].forEach(function (a) {

                    const bl = new T.Mesh(new T.BoxGeometry(0.9, 0.05, 0.12), s.mat(0xc2c6d2, { metalness: 0.8, roughness: 0.3 }));

                    bl.rotation.y = a;
                    bl.position.y = -0.4;
                    stirrer.add(bl);
                });

                const shaft = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1.4, 10), s.mat(0xc2c6d2, { metalness: 0.8 }));

                shaft.position.y = 0.2;
                stirrer.add(shaft);
                g.add(stirrer);

                // 2. doctor blade
                const frameM = s.mat(0x4a516a, { metalness: 0.6, roughness: 0.4 });
                const bridge = new T.Group();

                bridge.position.set(-2.4, 0, 0);
                [-0.95, 0.95].forEach(function (z) { bridge.add(s.box(0.14, 1.9, 0.14, frameM, 0, 1.2, z)); });
                bridge.add(s.box(0.14, 0.14, 2.1, frameM, 0, 2.1, 0));

                blade = s.box(0.1, 0.5, 1.5, s.mat(0xc9ccd6, { metalness: 0.85, roughness: 0.25 }), -2.4, 0.8, 0);
                s.part(g, "cast", [bridge.children[0], bridge.children[1], bridge.children[2], blade], [frameM]);
                g.add(bridge);
                g.add(blade);

                // hopper above the blade
                g.add(s.box(0.6, 0.5, 1.2, s.mat(0x39415c), -2.9, 2.3, 0));

                // 3. oven
                const ovenM = s.glass(0xff9a54, 0.2, false);
                const oven = new T.Mesh(new T.BoxGeometry(3.4, 1.9, 2.1), ovenM);

                oven.position.set(0, 1.3, 0);
                s.part(g, "dry", oven, [ovenM]);

                const ovenEdges = new T.LineSegments(new T.EdgesGeometry(oven.geometry), new T.LineBasicMaterial({ color: 0xffc08a, transparent: true, opacity: 0.7 }));

                ovenEdges.position.copy(oven.position);
                g.add(ovenEdges);

                glow = new T.PointLight(0xff8a3c, 1.6, 6);
                glow.position.set(0, 1.4, 0);
                g.add(glow);

                const vm = new T.MeshStandardMaterial({ color: 0xffd9b0, transparent: true, opacity: 0.45, roughness: 0.5 });

                vapor = new T.InstancedMesh(new T.SphereGeometry(0.07, 8, 6), vm, 30);

                for (let i = 0; i < 30; i++) { vp.push({ x: -0.7 + rand() * 1.4, y: 0.8 + rand() * 1.3, z: (rand() - 0.5) * 0.8 }); }

                g.add(vapor);

                // 4. press rolls
                const rollM = s.mat(0xa7acb8, { metalness: 0.85, roughness: 0.25 });

                rollA = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 1.6, 28), rollM);
                rollB = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 1.6, 28), rollM);
                rollA.rotation.x = Math.PI / 2;
                rollB.rotation.x = Math.PI / 2;
                rollA.position.set(3.2, 1.38, 0);
                rollB.position.set(3.2, 0.44, 0);
                s.part(g, "press", [rollA, rollB], [rollM]);

                [-0.9, 0.9].forEach(function (z) { g.add(s.box(0.14, 1.6, 0.14, frameM, 3.2, 0.95, z)); });

                // 5. punch and tray
                const punchM = s.mat(0xc9ccd6, { metalness: 0.85, roughness: 0.25 });

                punch = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.6, 28), punchM);
                punch.position.set(5.55, 1.3, 0);
                s.part(g, "cut", punch, [punchM]);
                g.add(s.box(0.14, 1.8, 0.14, frameM, 5.55, 1.1, -0.95));
                g.add(s.box(0.14, 1.8, 0.14, frameM, 5.55, 1.1, 0.95));
                g.add(s.box(0.14, 0.14, 2.1, frameM, 5.55, 2.0, 0));
                g.add(s.box(1.6, 0.08, 1.0, s.mat(0x39415c), 6.4, 0.07, 1.5));

                const dm = new T.MeshStandardMaterial({ color: 0x2a2f40, roughness: 0.7 });

                discIM = new T.InstancedMesh(new T.CylinderGeometry(0.1, 0.1, 0.035, 20), dm, MAXD);
                g.add(discIM);

                // moving foil segments with a coating on top
                const foilM = s.mat(0xd0d3dc, { metalness: 0.85, roughness: 0.3 });

                for (let i = 0; i < NSEG; i++) {

                    const sg = new T.Group();
                    const foil = new T.Mesh(new T.BoxGeometry(SEGL * 0.98, 0.02, 1.2), foilM);

                    foil.position.y = 0.43;
                    sg.add(foil);

                    const cm = new T.MeshStandardMaterial({ color: 0x1c2030, roughness: 0.15, metalness: 0.2 });
                    const coat = new T.Mesh(new T.BoxGeometry(SEGL * 0.98, 1, 1.1), cm);

                    sg.add(coat);

                    const crackM = new T.MeshBasicMaterial({ color: 0x05070e });
                    const crack = new T.Mesh(new T.BoxGeometry(0.03, 0.002, 1.0), crackM);

                    crack.position.x = (rand() - 0.5) * 0.3;
                    sg.add(crack);
                    g.add(sg);

                    segs.push({ group: sg, coat: coat, crack: crack, x: X0 + i * SEGL, punched: true });

                    s.part(g, "foil", foil, [foilM]);
                    s.part(g, "film", coat, [cm]);
                }

                // station labels
                [["Mix", -6.0], ["Cast", -2.4], ["Dry", 0], ["Press", 3.2], ["Cut", 5.55]].forEach(function (st, i) {

                    const lb = s.label((i + 1) + " · " + st[0]);

                    lb.at = function () { return [st[1], 3.0, 0]; };
                });
            }

            root.querySelector("[data-reset]").addEventListener("click", function () {

                discs = 0;

                if (S) { S.select(null); S.resetView(); }

                out(root, "info", "Click a station of the line, or the foil, to learn what happens there.");
            });

            bindViews(root, function () { return S; });

            wire(root, state, defaults, update);

            update();

            F.three.create(root, { target: [0, 1.0, 0], halfWidth: 8.4, views: { three: [0.35, 1.2], front: [0, 1.45], top: [0, 0.35] }, home: "three", sway: [0.3, 0.22], onPick: describe }).then(function (s) {

                S = s;
                build(s);
                s.onFrame(frame);
                s.start();

            }).catch(function () { });
        };

        // ================================================================
        // UNIT 37: THE SCORECARD
        // ================================================================
        const METRICS = [
            { k: "power", name: "Power", bat: 0.12, sc: 1.0, tip: "Very high for a supercapacitor: often ten times a battery's, or more." },
            { k: "energy", name: "Energy", bat: 1.0, sc: 0.08, tip: "Much lower: roughly 5 Wh/kg versus 100 to 250 Wh/kg for lithium-ion." },
            { k: "cycles", name: "Cycle life", bat: 0.3, sc: 1.0, tip: "Hundreds of thousands to millions of cycles, versus about a thousand to a few thousand. (Bar scaled for comparison.)" },
            { k: "charge", name: "Charge time", bat: 0.15, sc: 1.0, tip: "Seconds to minutes, versus around an hour for a battery. A taller bar means faster." },
            { k: "temp", name: "Temperature range", bat: 0.55, sc: 0.85, tip: "Often −40 to 65 °C, wider than most batteries." },
            { k: "hold", name: "Holds charge", bat: 0.9, sc: 0.3, tip: "Supercapacitors self-discharge faster: a charged cell drifts down over days to weeks. A taller bar means better at holding charge." }
        ];

        const APPS = {
            phone: { name: "Phone: lots of energy, delivered slowly", w: { power: 0.05, energy: 0.45, cycles: 0.1, charge: 0.1, temp: 0.08, hold: 0.22 } },
            crane: { name: "Crane: repeated bursts of power", w: { power: 0.35, energy: 0.05, cycles: 0.28, charge: 0.2, temp: 0.07, hold: 0.05 } },
            sensor: { name: "Sensor idle for months", w: { power: 0.05, energy: 0.25, cycles: 0.1, charge: 0.05, temp: 0.1, hold: 0.45 } }
        };

        SIMS["supercap-3d-scorecard"] = function (root) {

            const defaults = { app: "phone" };
            const state = { app: "phone" };
            const seen = {};
            let S = null;
            let hit = false;
            let bars = [];
            let tot = [];

            root.innerHTML =
                head("Explore in 3D: the scorecard") +
                F.three.stageHTML() +
                '<div class="fd-stat-row">' + stat("Battery fit", "fb") + stat("Supercapacitor fit", "fs") + stat("Better fit for this job", "win") + "</div>" +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click any bar to read the numbers behind it. Then pick a job and see which device fits.</p>' +
                seg("The job", "app", [["phone", "Phone"], ["crane", "Crane"], ["sensor", "Idle sensor"]]) +
                viewButtons() +
                '<p class="fd-sim-formula">Blue bars are a lithium-ion battery and teal bars are a supercapacitor; taller is better in every group. The two big columns at the front add up the six bars, weighted by what the job cares about. Batteries win on energy; supercapacitors win on power and cycle life. Total energy points to batteries; fast, repeated bursts point to supercapacitors. (Bars are scaled for comparison, not exact.)</p>';

            function fit(a, who) {

                let s = 0;

                METRICS.forEach(function (m) { s += APPS[a].w[m.k] * m[who]; });

                return s;
            }

            function update() {

                const fb = fit(state.app, "bat");
                const fs = fit(state.app, "sc");

                seen[state.app] = true;
                out(root, "fb", Math.round(fb * 100) + " / 100");
                out(root, "fs", Math.round(fs * 100) + " / 100");
                out(root, "win", fb > fs ? "Battery" : "Supercapacitor");
                out(root, "verdict", APPS[state.app].name + ": " + (fb > fs ? "total energy decides it, so the battery wins" : "bursts and cycles decide it, so the supercapacitor wins"));

                if (!hit && seen.phone && seen.crane && seen.sensor) {

                    hit = true;
                    F.reward("supercap-3d-scorecard", 10, "You matched each job to the right device");
                }
            }

            function describe(p) {

                if (!p) { return; }

                const m = METRICS.find(function (x) { return p.key.indexOf(x.k) === 0; });

                if (!m) {

                    out(root, "info", p.key === "totB" ? "The battery's overall fit for the chosen job: the six bars weighted by what the job cares about." : "The supercapacitor's overall fit for the chosen job.");

                    return;
                }

                out(root, "info", m.name + ": " + (p.key.indexOf("Bat") > 0 ? "battery " : "supercapacitor ") + (p.key.indexOf("Bat") > 0 ? Math.round(m.bat * 100) : Math.round(m.sc * 100)) + " / 100. " + m.tip);
            }

            function frame(dt) {

                bars.forEach(function (b) {

                    const want = Math.max(0.02, b.target) * 3.2;

                    b.h += (want - b.h) * Math.min(1, dt * 5);
                    b.mesh.scale.y = b.h;
                    b.mesh.position.y = b.h / 2 + 0.02;
                });

                const w = { b: fit(state.app, "bat"), s: fit(state.app, "sc") };

                tot.forEach(function (b) {

                    const want = Math.max(0.02, b.who === "b" ? w.b : w.s) * 3.2;

                    b.h += (want - b.h) * Math.min(1, dt * 5);
                    b.mesh.scale.y = b.h;
                    b.mesh.position.y = b.h / 2 + 0.02;
                });

                update();
            }

            root.querySelector("[data-reset]").addEventListener("click", function () {

                if (S) { S.select(null); S.resetView(); }

                out(root, "info", "Click any bar to read the numbers behind it. Then pick a job and see which device fits.");
            });

            bindViews(root, function () { return S; });

            wire(root, state, defaults, update);

            update();

            F.three.create(root, { target: [0.4, 1.4, 0.4], halfWidth: 7.4, views: { three: [0.45, 1.05], front: [0, 1.35], top: [0, 0.4] }, home: "three", sway: [0.35, 0.3], onPick: describe }).then(function (s) {

                S = s;

                const T = s.T;
                const g = new T.Group();

                s.shadow(g, 14, 6);
                s.scene.add(g);

                const floorM = s.mat(0x1c2540, { roughness: 0.8, metalness: 0.1 });

                g.add(s.box(13, 0.06, 4.2, floorM, 0, -0.03, 0.4));

                const batM = s.mat(0x4d8dff, { roughness: 0.35, metalness: 0.2 });
                const scM = s.mat(0x54e0c7, { roughness: 0.35, metalness: 0.2 });

                METRICS.forEach(function (m, i) {

                    const x = (i - 2.5) * 1.45 - 1.4;
                    const mkBar = function (mat, dx, target, key) {

                        const mesh = new T.Mesh(new T.BoxGeometry(0.58, 1, 0.58), mat);

                        mesh.position.set(x + dx, 0.5, 0);
                        s.part(g, key, mesh, [mat]);
                        bars.push({ mesh: mesh, target: target, h: 0.05 });
                    };

                    mkBar(batM, -0.33, m.bat, m.k + "Bat");
                    mkBar(scM, 0.33, m.sc, m.k + "Sc");

                    const lb = s.label(m.name);

                    lb.at = function () { return [x, -0.05, 1.1, 0, 14 + (i % 2) * 18]; };
                });

                // overall fit: two tall columns at the right
                [["b", batM, 4.2, "totB"], ["s", scM, 5.2, "totS"]].forEach(function (c) {

                    const mesh = new T.Mesh(new T.BoxGeometry(0.8, 1, 0.8), c[1]);

                    mesh.position.set(c[2] + 0.2, 0.5, 0);
                    s.part(g, c[3], mesh, [c[1]]);
                    tot.push({ mesh: mesh, who: c[0], h: 0.05 });
                });

                const lt = s.label("Overall fit for the job");

                lt.at = function () { return [5.2, -0.05, 1.1, 0, 14]; };

                const lg = s.label("Blue: battery   ·   Teal: supercapacitor");

                lg.at = function () { return [0.4, 4.7, 0]; };

                s.onFrame(frame);
                s.start();

            }).catch(function () { });
        };

        document.querySelectorAll('.fd-sim[data-sim^="supercap-3d-"]').forEach(F.mount);
    }

})();
