/* ========================================
   SUPERCAPACITORS: A REAL 3D SCENE (three.js)

   Unit 1: a lithium-ion battery next to a supercapacitor
   (or an ordinary capacitor). Drag to turn them, scroll or
   pinch to zoom, click any part to learn what it does, and
   charge and discharge to watch what happens inside.

   Uses the local copy of three.js (three.module.min.js), so
   it also works offline in the app.
   Teaching model: sizes, speeds and numbers are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers) {
        return;
    }

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

    let threePromise = null;

    function loadThree() {

        if (!threePromise) {
            threePromise = import("./three.module.min.js");
        }

        return threePromise;
    }

    // What each part is and does. Text shown when a part is clicked.
    const INFO = {
        batCase: ["Battery case", "The sealed package. It holds the electrolyte in and keeps air and water out. Drag the Cutaway slider to remove the front half and look inside."],
        batCollN: ["Copper current collector", "A thin metal foil that carries electrons between the anode and the outside circuit. It does not store anything itself."],
        batAnode: ["Anode: graphite layers", "Graphite is made of stacked sheets. While charging, lithium ions slip in between the sheets (intercalation), which is a real chemical change. The graphite swells a little and turns gold. Each swell and shrink slowly wears the material out."],
        batSep: ["Separator", "A thin porous plastic membrane. Ions pass through its pores, but electrons cannot, so the electrodes never touch and short-circuit."],
        batCath: ["Cathode: metal oxide", "A lithium metal oxide crystal. Lithium ions sit inside the crystal and leave it when charging. Storing energy in the bulk of the material is why batteries hold so much, and why they are slow."],
        batCollP: ["Aluminum current collector", "The foil on the cathode side. It carries electrons to the positive terminal."],
        batIons: ["Lithium ions (Li⁺)", "The charge carriers. Charging pushes them from the cathode, across the separator, and into the graphite. Discharging lets them flow back and the electrons do work in the circuit."],
        batTermN: ["Negative terminal", "Where electrons leave the anode toward the load when the battery discharges."],
        batTermP: ["Positive terminal", "Where electrons return to the cell when it discharges."],
        batElectrolyte: ["Electrolyte", "A liquid salt solution that lets lithium ions move between the electrodes. It conducts ions but not electrons."],
        capCase: ["Capacitor case", "The package around the plates."],
        capPlateN: ["Negative plate", "A metal plate. Charging crowds extra electrons onto it. The energy is stored in the electric field, not in a chemical change."],
        capPlateP: ["Positive plate", "The other metal plate. It loses electrons while charging, leaving a positive surface charge."],
        capDielectric: ["Dielectric", "An insulating layer between the plates. It keeps the plates apart so charge can pile up, and it holds the electric field."],
        capCharges: ["Surface charges", "In an ordinary capacitor the charge lives only on the flat surface of the plates. A flat plate has very little area, so very little charge fits. That is why it stores so little energy."],
        capTermN: ["Negative terminal", "The connection to the negative plate."],
        capTermP: ["Positive terminal", "The connection to the positive plate."],
        scCase: ["Supercapacitor case", "The sealed package that holds the electrolyte and electrodes."],
        scCollN: ["Current collector (negative)", "A metal foil that carries electrons between the porous carbon and the outside circuit."],
        scElecN: ["Porous carbon electrode (negative)", "Activated carbon is full of tiny pores, giving it a huge surface area in a small volume. Charging gathers positive ions on this surface."],
        scSep: ["Separator", "A porous membrane that lets ions through but keeps the two carbon electrodes from touching."],
        scElecP: ["Porous carbon electrode (positive)", "The other carbon electrode. Charging gathers negative ions on its huge surface."],
        scCollP: ["Current collector (positive)", "The foil on the positive side. It carries electrons to the positive terminal."],
        scIons: ["Ions in the electrolyte", "Positive (orange) and negative (blue) ions float in the liquid. Charging only moves them to the surfaces of the carbon: no chemical change, no swelling. The result is the electric double layer, so charging is fast and the device lasts a very long time."],
        scTermN: ["Negative terminal", "Where electrons enter the negative electrode when charging."],
        scTermP: ["Positive terminal", "Where electrons leave the positive electrode when charging."],
        wire: ["External circuit", "The wire that carries electrons from one electrode to the other through the charger or the load. The teal dots are electrons, drawn bigger than they are."]
    };

    SIMS["supercap-3d"] = function (root) {

        const defaults = { other: "sc", cut: 0, cyc: 0 };
        const state = { other: "sc", cut: 0, cyc: 0 };
        const seen = {};
        let T = null;                       // the THREE module once it has loaded
        let mode = "idle";                  // idle, charge, discharge
        let qB = 0;                         // charge fraction of the battery
        let qO = 0;                         // charge fraction of the other device
        let t = 0;
        let hit = false;
        let fullSeen = false;
        let drainSeen = false;
        let selected = null;
        let disposed = false;

        root.innerHTML =
            head("Explore in 3D: a battery and a supercapacitor") +
            '<div data-stage style="position:relative;width:100%;height:clamp(360px,56vw,470px);border-radius:14px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,rgba(40,60,110,.55),rgba(8,12,28,.95) 70%);touch-action:pan-y;cursor:grab">' +
            '<div data-loading style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(245,247,255,.8);font-size:14px">Loading the 3D scene…</div>' +
            '<div data-labels style="position:absolute;inset:0;pointer-events:none"></div>' +
            '<div style="position:absolute;left:10px;bottom:8px;font-size:11px;color:rgba(245,247,255,.6);pointer-events:none">Drag to turn · scroll or pinch to zoom · click a part</div>' +
            "</div>" +
            '<div class="fd-stat-row">' + stat("Battery charge stored", "qb") + stat("Other device charge stored", "qo") + stat("Battery capacity left", "cb") + stat("Other capacity left", "co") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click any part of either device to see what it is and what it does.</p>' +
            '<div class="fd-seg"><span class="fd-seg-label">Reactions</span>' +
            '<button type="button" class="fd-sim-btn" data-act="charge">⚡ Charge both</button>' +
            '<button type="button" class="fd-sim-btn" data-act="discharge">🔋 Discharge both</button>' +
            '<button type="button" class="fd-sim-btn" data-act="hold">⏸ Hold</button></div>' +
            seg("Compare the battery with", "other", [["sc", "Supercapacitor"], ["cap", "Ordinary capacitor"]]) +
            '<div class="fd-seg"><span class="fd-seg-label">View</span>' +
            '<button type="button" class="fd-sim-btn" data-view="three">3/4 view</button>' +
            '<button type="button" class="fd-sim-btn" data-view="front">Front (cross-section)</button>' +
            '<button type="button" class="fd-sim-btn" data-view="top">Top</button>' +
            '<button type="button" class="fd-sim-btn" data-view="side">Side</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Cutaway: remove the front of the cases", key: "cut", min: 0, max: 100, step: 1, value: 0 }) +
            slider({ label: "Cycles of charge and discharge (log scale)", key: "cyc", min: 0, max: 6, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A typical lithium-ion cell stores charge by chemical reactions inside its electrodes, so it holds a lot but charges slowly and wears out in about a thousand cycles. A supercapacitor only parks ions on the surface of porous carbon, so it charges quickly and survives about a million cycles, but holds less. An ordinary capacitor stores charge on flat plates, so it is the fastest and holds the least. (Shapes, speeds and cycle counts are illustrative.)</p>';

        const stage = root.querySelector("[data-stage]");
        const loading = root.querySelector("[data-loading]");
        const labelLayer = root.querySelector("[data-labels]");

        function capBat() { return clamp(1 - 0.2 * Math.pow(10, state.cyc) / 1000, 0, 1); }
        function capOther() { return state.other === "sc" ? clamp(1 - 0.1 * Math.pow(10, state.cyc) / 1000000, 0, 1) : 1; }
        function pct(v) { return v > 0.9995 ? "100 %" : v > 0.99 ? (v * 100).toFixed(1) + " %" : Math.round(v * 100) + " %"; }

        function update() {

            setVal(root, "cut", state.cut + " %");
            setVal(root, "cyc", Math.round(Math.pow(10, state.cyc)).toLocaleString("en-US"));
            out(root, "qb", Math.round(qB * capBat() * 100) + " %");
            out(root, "qo", Math.round(qO * capOther() * 100) + " %");
            out(root, "cb", pct(capBat()));
            out(root, "co", pct(capOther()));

            const o = state.other === "sc" ? "supercapacitor" : "ordinary capacitor";
            const cb = capBat();

            out(root, "verdict", mode === "charge" ? (qO > qB + 0.05 ? "The " + o + " fills first; the battery is still reacting inside" : "Charging: watch the ions and electrons move") : mode === "discharge" ? "Discharging: everything flows back" : cb < 0.5 ? "After many cycles the battery has lost most of its capacity" : "Press Charge to see what happens inside");

            if (!hit && fullSeen && drainSeen && Object.keys(seen).length >= 3) {

                hit = true;
                F.reward("supercap-3d", 10, "You explored a battery and a capacitor in 3D");
            }
        }

        function showInfo(key) {

            const d = INFO[key];

            if (!d) { return; }

            seen[key] = true;
            out(root, "info", d[0] + ": " + d[1]);
        }

        // ------------------------------------------------------------
        // Everything below needs three.js, which loads asynchronously.
        // ------------------------------------------------------------
        let renderer, scene, camera, raycaster, plane, envTex;
        let batt = null;
        let other = null;
        const pickables = [];
        const cam = { yaw: 0.6, phi: 1.15, r: 13, ty: 0.6, tp: 1.15, tr: 13, tyaw: 0.6, spin: true };
        let fit = 13;
        const target = { x: 0, y: 1.9, z: 0 };

        function makeMat(THREE, hex, o) {

            const m = new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.45, metalness: 0.1 }, o || {}));

            m.userData.base = new THREE.Color(hex);

            return m;
        }

        function addPart(group, key, mesh, mats) {

            const part = { key: key, mats: mats || [mesh.material], meshes: [mesh] };

            mesh.userData.part = part;
            group.add(mesh);
            pickables.push(mesh);

            return part;
        }

        function box(THREE, w, h, d, mat, x, y, z) {

            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

            m.position.set(x, y, z);

            return m;
        }

        function envScene(THREE) {

            const s = new THREE.Scene();
            const g = new THREE.SphereGeometry(30, 24, 16);
            const col = [];
            const pos = g.attributes.position;
            const c1 = new THREE.Color(0x0d1530);
            const c2 = new THREE.Color(0x6f89d8);

            for (let i = 0; i < pos.count; i++) {

                const k = (pos.getY(i) / 30 + 1) / 2;
                const c = c1.clone().lerp(c2, k);

                col.push(c.r, c.g, c.b);
            }

            g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
            s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

            [[0, 12, 6, 14, 6], [-14, 4, 4, 5, 10], [14, 3, -4, 5, 10]].forEach(function (b) {

                const q = new THREE.Mesh(new THREE.PlaneGeometry(b[3], b[4]), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));

                q.position.set(b[0], b[1], b[2]);
                q.lookAt(0, 0, 0);
                s.add(q);
            });

            return s;
        }

        function shadowTexture(THREE) {

            const c = document.createElement("canvas");

            c.width = c.height = 128;

            const x = c.getContext("2d");
            const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);

            g.addColorStop(0, "rgba(0,0,0,.55)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            x.fillStyle = g;
            x.fillRect(0, 0, 128, 128);

            return new THREE.CanvasTexture(c);
        }

        // Shared pieces: floor shadow, case, edges, terminals, tabs.
        function frame(THREE, g, prefix, opts) {

            const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 4), new THREE.MeshBasicMaterial({ map: shadowTexture(THREE), transparent: true, depthWrite: false }));

            shadow.rotation.x = -Math.PI / 2;
            shadow.position.y = 0.01;
            g.add(shadow);

            const caseMat = new THREE.MeshPhysicalMaterial({ color: 0x9fb8f0, transparent: true, opacity: 0.17, roughness: 0.12, metalness: 0, side: THREE.DoubleSide, depthWrite: false, clippingPlanes: [plane] });

            caseMat.userData.base = new THREE.Color(0x9fb8f0);

            const cs = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 1.9), caseMat);

            cs.position.set(0, 1.6, 0);

            const casePart = addPart(g, prefix + "Case", cs, [caseMat]);

            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cs.geometry), new THREE.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.55, clippingPlanes: [plane] }));

            edges.position.copy(cs.position);
            g.add(edges);

            // terminals and tabs
            const termN = makeMat(THREE, 0x6aa5ff, { metalness: 0.6, roughness: 0.3 });
            const termP = makeMat(THREE, 0xff6f7e, { metalness: 0.6, roughness: 0.3 });
            const tabMat = makeMat(THREE, 0xc9ccd6, { metalness: 0.7, roughness: 0.3 });

            [[-1.1, termN, "TermN"], [1.1, termP, "TermP"]].forEach(function (s) {

                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 20), s[1]);

                post.position.set(s[0], 3.41, 0);
                addPart(g, prefix + s[2], post);

                const tab = box(THREE, 0.1, 0.4, 0.5, tabMat, s[0], 3.05, 0);

                g.add(tab);
            });

            return { casePart: casePart };
        }

        // ------------------------------------------------------------
        // The lithium-ion battery
        // ------------------------------------------------------------
        function buildBattery(THREE) {

            const g = new THREE.Group();
            const rand = mulberry(7);

            g.position.x = -3.4;
            frame(THREE, g, "bat", {});

            // electrolyte region (very faint) so it can be picked
            const elMat = new THREE.MeshStandardMaterial({ color: 0x7fe6d6, transparent: true, opacity: 0.07, depthWrite: false });
            const el = box(THREE, 0.9, 2.6, 1.5, elMat, 0, 1.6, 0);

            el.userData.noClipCheck = true;
            addPart(g, "batElectrolyte", el, [elMat]);

            const metal = makeMat(THREE, 0xc2c6d2, { metalness: 0.75, roughness: 0.28 });
            const metal2 = makeMat(THREE, 0xd8dae2, { metalness: 0.75, roughness: 0.28 });

            addPart(g, "batCollN", box(THREE, 0.06, 2.7, 1.55, metal, -1.1, 1.6, 0));
            addPart(g, "batCollP", box(THREE, 0.06, 2.7, 1.55, metal2, 1.1, 1.6, 0));

            // anode: stacked graphite sheets
            const gMat = makeMat(THREE, 0x2f3340, { metalness: 0.3, roughness: 0.5 });
            const sheets = [];
            const anode = new THREE.Group();

            for (let k = 0; k < 8; k++) {

                const s = box(THREE, 0.032, 2.5, 1.45, gMat, -1.0 + k * 0.074, 1.6, 0);

                anode.add(s);
                sheets.push(s);
                s.userData.part = null;
            }

            g.add(anode);

            const anodePart = { key: "batAnode", mats: [gMat], meshes: sheets };

            sheets.forEach(function (s) { s.userData.part = anodePart; pickables.push(s); });

            // cathode: a cloud of metal oxide particles
            const cMat = makeMat(THREE, 0x5b86e0, { metalness: 0.35, roughness: 0.4 });
            const cath = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 10, 8), cMat, 260);
            const m4 = new THREE.Matrix4();

            for (let i = 0; i < 260; i++) {

                m4.makeTranslation(0.52 + rand() * 0.46, 0.4 + rand() * 2.4, (rand() - 0.5) * 1.3);
                cath.setMatrixAt(i, m4);
            }

            addPart(g, "batCath", cath);

            // separator
            const sepMat = new THREE.MeshStandardMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.55, roughness: 0.6 });

            sepMat.userData.base = new THREE.Color(0xffe9a8);
            addPart(g, "batSep", box(THREE, 0.05, 2.6, 1.5, sepMat, 0, 1.6, 0));

            // lithium ions: home in the cathode, slot between the graphite sheets
            const N = 56;
            const ionMat = new THREE.MeshStandardMaterial({ color: 0xffb04a, emissive: 0x6a3a00, roughness: 0.3 });

            ionMat.userData.base = new THREE.Color(0xffb04a);

            const ions = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 10), ionMat, N);
            const homes = [];
            const slots = [];

            for (let i = 0; i < N; i++) {

                homes.push([0.55 + rand() * 0.4, 0.5 + rand() * 2.2, (rand() - 0.5) * 1.2]);
                slots.push([-1.0 + Math.floor(rand() * 7) * 0.074 + 0.037, 0.5 + rand() * 2.2, (rand() - 0.5) * 1.2]);
                ions.setColorAt(i, new THREE.Color(0xffb04a));
            }

            addPart(g, "batIons", ions);

            return { group: g, sheets: sheets, anodeMat: gMat, ions: ions, homes: homes, slots: slots, N: N, sepMat: sepMat, kind: "bat", m4: m4, base: gMat.userData.base.clone() };
        }

        // ------------------------------------------------------------
        // The supercapacitor
        // ------------------------------------------------------------
        function buildSuper(THREE) {

            const g = new THREE.Group();
            const rand = mulberry(11);

            g.position.x = 3.4;
            frame(THREE, g, "sc", {});

            const elMat = new THREE.MeshStandardMaterial({ color: 0x7fe6d6, transparent: true, opacity: 0.07, depthWrite: false });

            g.add(box(THREE, 0.9, 2.6, 1.5, elMat, 0, 1.6, 0));

            const metal = makeMat(THREE, 0xc2c6d2, { metalness: 0.75, roughness: 0.28 });
            const metal2 = makeMat(THREE, 0xd8dae2, { metalness: 0.75, roughness: 0.28 });

            addPart(g, "scCollN", box(THREE, 0.06, 2.7, 1.55, metal, -1.1, 1.6, 0));
            addPart(g, "scCollP", box(THREE, 0.06, 2.7, 1.55, metal2, 1.1, 1.6, 0));

            // porous carbon electrodes: dense clouds of small grains
            const mk = function (x0, key) {

                const mat = makeMat(THREE, 0x2d3344, { metalness: 0.2, roughness: 0.65 });
                const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), mat, 700);
                const m4 = new THREE.Matrix4();

                for (let i = 0; i < 700; i++) {

                    m4.makeTranslation(x0 + rand() * 0.52, 0.4 + rand() * 2.4, (rand() - 0.5) * 1.3);
                    im.setMatrixAt(i, m4);
                }

                addPart(g, key, im);

                return mat;
            };

            const matN = mk(-1.04, "scElecN");
            const matP = mk(0.52, "scElecP");
            const sepMat = new THREE.MeshStandardMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.55, roughness: 0.6 });

            sepMat.userData.base = new THREE.Color(0xffe9a8);
            addPart(g, "scSep", box(THREE, 0.05, 2.6, 1.5, sepMat, 0, 1.6, 0));

            // ions: N cations and N anions
            const N = 48;
            const ionMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, emissive: 0x222233 });
            const ions = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 10), ionMat, N * 2);
            const free = [];
            const site = [];

            for (let i = 0; i < N * 2; i++) {

                const cation = i < N;
                const j = cation ? i : i - N;
                const gy = 0.55 + (j % 8 + rand() * 0.6) * (2.1 / 8);
                const gz = -0.62 + (Math.floor(j / 8) + rand() * 0.6) * (1.25 / 6);

                free.push([(rand() - 0.5) * 0.7, 0.45 + rand() * 2.3, (rand() - 0.5) * 1.3]);
                site.push([cation ? -0.4 - rand() * 0.04 : 0.4 + rand() * 0.04, gy, gz]);
                ions.setColorAt(i, new THREE.Color(cation ? 0xffb04a : 0x5fb1ff));
            }

            addPart(g, "scIons", ions);

            return { group: g, matN: matN, matP: matP, ions: ions, free: free, site: site, N: N, sepMat: sepMat, kind: "sc", m4: new THREE.Matrix4() };
        }

        // ------------------------------------------------------------
        // An ordinary capacitor
        // ------------------------------------------------------------
        function buildPlain(THREE) {

            const g = new THREE.Group();

            g.position.x = 3.4;
            frame(THREE, g, "cap", {});

            const mN = makeMat(THREE, 0x9aa4c4, { metalness: 0.8, roughness: 0.25 });
            const mP = makeMat(THREE, 0xb4b9cc, { metalness: 0.8, roughness: 0.25 });

            addPart(g, "capPlateN", box(THREE, 0.12, 2.6, 1.5, mN, -0.62, 1.6, 0));
            addPart(g, "capPlateP", box(THREE, 0.12, 2.6, 1.5, mP, 0.62, 1.6, 0));

            const dMat = new THREE.MeshStandardMaterial({ color: 0xf2c46b, transparent: true, opacity: 0.38, roughness: 0.5 });

            dMat.userData.base = new THREE.Color(0xf2c46b);
            addPart(g, "capDielectric", box(THREE, 1.04, 2.5, 1.4, dMat, 0, 1.6, 0));

            // leads from plates up to the terminals
            const lead = makeMat(THREE, 0xc9ccd6, { metalness: 0.7, roughness: 0.3 });

            g.add(box(THREE, 0.1, 0.5, 0.4, lead, -0.62, 3.05, 0));

            // wires from plates to the terminal posts (flat links)
            g.add(box(THREE, 0.55, 0.06, 0.4, lead, -0.85, 3.2, 0));
            g.add(box(THREE, 0.55, 0.06, 0.4, lead, 0.85, 3.2, 0));
            g.add(box(THREE, 0.1, 0.5, 0.4, lead, 0.62, 3.05, 0));

            // charges on the inner faces
            const NC = 14;
            const chMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, emissive: 0x333344 });
            const ch = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 10), chMat, NC * 2);
            const pos = [];

            for (let i = 0; i < NC; i++) {

                const y = 0.7 + (i % 7) * 0.3;
                const z = -0.35 + Math.floor(i / 7) * 0.7;

                pos.push([-0.54, y, z]);
                ch.setColorAt(i, new THREE.Color(0x5fb1ff));
            }

            for (let i = 0; i < NC; i++) {

                pos.push([0.54, pos[i][1], pos[i][2]]);
                ch.setColorAt(NC + i, new THREE.Color(0xff6f7e));
            }

            addPart(g, "capCharges", ch);

            // field lines
            const lg = new THREE.BufferGeometry();
            const pts = [];

            for (let i = 0; i < NC; i++) { pts.push(-0.5, pos[i][1], pos[i][2], 0.5, pos[i][1], pos[i][2]); }

            lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));

            const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0 }));

            g.add(lines);

            return { group: g, ch: ch, pos: pos, NC: NC, lines: lines, dMat: dMat, kind: "cap", m4: new THREE.Matrix4(), plateN: mN, plateP: mP };
        }

        // the external wire with moving electrons
        function buildWires(THREE, dev) {

            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-1.1, 3.6, 0), new THREE.Vector3(-1.1, 4.1, 0), new THREE.Vector3(-0.55, 4.45, 0),
                new THREE.Vector3(0.55, 4.45, 0), new THREE.Vector3(1.1, 4.1, 0), new THREE.Vector3(1.1, 3.6, 0)
            ]);
            const wm = makeMat(THREE, 0xd9b45a, { metalness: 0.7, roughness: 0.3 });
            const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.045, 8), wm);

            dev.group.add(tube);
            tube.userData.part = { key: "wire", mats: [wm], meshes: [tube] };
            pickables.push(tube);

            const em = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68 }), 14);

            dev.group.add(em);
            dev.curve = curve;
            dev.elec = em;
        }

        function makeLabel(text) {

            const d = document.createElement("div");

            d.textContent = text;
            d.style.cssText = "position:absolute;transform:translate(-50%,-50%);font-size:12px;font-weight:700;color:#f5f7ff;background:rgba(10,16,36,.7);padding:2px 8px;border-radius:999px;white-space:nowrap;border:1px solid rgba(255,255,255,.2)";
            labelLayer.appendChild(d);

            return d;
        }

        const labels = {};

        function buildOther(THREE) {

            if (other) {

                scene.remove(other.group);
                other.group.traverse(function (o) {

                    const i = pickables.indexOf(o);

                    if (i >= 0) { pickables.splice(i, 1); }

                    if (o.geometry) { o.geometry.dispose(); }
                });
            }

            other = state.other === "sc" ? buildSuper(THREE) : buildPlain(THREE);
            buildWires(THREE, other);
            scene.add(other.group);

            if (labels.other) { labels.other.textContent = state.other === "sc" ? "Supercapacitor" : "Ordinary capacitor"; }

            applyCut();
        }

        function applyCut() {

            plane.constant = 1.05 - state.cut / 100 * 1.05;
        }

        function setSelected(part) {

            if (selected) {

                selected.mats.forEach(function (m) { if (m.emissive) { m.emissive.setHex(m.userData.emissive0 || 0x000000); } });
            }

            selected = part || null;

            if (selected) {

                selected.mats.forEach(function (m) {

                    if (m.emissive) {

                        if (m.userData.emissive0 === undefined) { m.userData.emissive0 = m.emissive.getHex(); }

                        m.emissive.setHex(0x8a6a10);
                    }
                });
            }
        }

        function pickAt(clientX, clientY) {

            const r = renderer.domElement.getBoundingClientRect();
            const v = new T.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);

            raycaster.setFromCamera(v, camera);

            const hits = raycaster.intersectObjects(pickables, false);
            let pick = null;
            let caseHit = null;

            for (let i = 0; i < hits.length; i++) {

                const o = hits[i].object;
                const part = o.userData.part;

                if (!part) { continue; }

                const mat = o.material;

                if (mat.clippingPlanes && mat.clippingPlanes.length && plane.distanceToPoint(hits[i].point) < 0) { continue; }

                if (/Case$/.test(part.key)) { caseHit = caseHit || part; continue; }

                if (part.key === "batElectrolyte") { caseHit = caseHit || part; continue; }

                pick = part;
                break;
            }

            return pick || caseHit;
        }

        function placeInstances() {

            const m4 = batt.m4;

            // battery ions: cathode home to anode slot, staggered, with a little jitter
            const capB = capBat();
            const NB = batt.N;
            const col = new T.Color();

            for (let i = 0; i < NB; i++) {

                const alive = i < Math.round(NB * capB);
                const s = alive ? clamp(qB * 1.5 - (i / NB) * 0.5, 0, 1) : 0;
                const h = batt.homes[i];
                const sl = batt.slots[i];
                const e = s * s * (3 - 2 * s);
                const arc = Math.sin(Math.PI * e) * 0.1;
                const j = alive && s > 0 && s < 1 ? 0.02 : 0;

                m4.makeTranslation(h[0] + (sl[0] - h[0]) * e + Math.sin(t * 7 + i) * j, h[1] + (sl[1] - h[1]) * e + arc, h[2] + (sl[2] - h[2]) * e + Math.cos(t * 6 + i) * j);
                batt.ions.setMatrixAt(i, m4);
                col.set(alive ? 0xffb04a : 0x6b6f7a);
                batt.ions.setColorAt(i, col);
            }

            batt.ions.instanceMatrix.needsUpdate = true;

            if (batt.ions.instanceColor) { batt.ions.instanceColor.needsUpdate = true; }

            // anode swells and turns gold as it fills with lithium
            const gold = new T.Color(0xd9a648);
            const grey = batt.base;
            const filled = clamp(qB * capB, 0, 1);

            batt.anodeMat.color.copy(grey).lerp(gold, filled * 0.9);

            const wear = 1 - capB;

            batt.anodeMat.color.lerp(new T.Color(0x4a3a30), wear * 0.5);

            batt.sheets.forEach(function (s, k) {

                s.position.x = -1.0 + k * (0.074 + filled * 0.012);
            });

            if (other.kind === "sc") {

                const N = other.N;
                const capO = capOther();

                for (let i = 0; i < N * 2; i++) {

                    const j = i < N ? i : i - N;
                    const alive = j < Math.round(N * capO);
                    const s = alive ? clamp(qO * 1.4 - (j / N) * 0.4, 0, 1) : 0;
                    const f = other.free[i];
                    const st = other.site[i];
                    const e = s * s * (3 - 2 * s);
                    const jit = (1 - e) * 0.03;

                    m4.makeTranslation(f[0] + (st[0] - f[0]) * e + Math.sin(t * 2 + i) * jit, f[1] + (st[1] - f[1]) * e + Math.cos(t * 1.7 + i * 1.3) * jit, f[2] + (st[2] - f[2]) * e + Math.sin(t * 1.9 + i * 0.7) * jit);
                    other.ions.setMatrixAt(i, m4);
                }

                other.ions.instanceMatrix.needsUpdate = true;

                // the electrodes tint blue and red as they charge
                other.matN.color.copy(other.matN.userData.base).lerp(new T.Color(0x3b6fd8), qO * 0.55);
                other.matP.color.copy(other.matP.userData.base).lerp(new T.Color(0xd85a68), qO * 0.55);

            } else {

                const shown = Math.round(other.NC * qO);

                for (let i = 0; i < other.NC * 2; i++) {

                    const k = i < other.NC ? i : i - other.NC;
                    const p = other.pos[i];

                    m4.makeScale(k < shown ? 1 : 0.0001, k < shown ? 1 : 0.0001, k < shown ? 1 : 0.0001);
                    m4.setPosition(p[0], p[1], p[2]);
                    other.ch.setMatrixAt(i, m4);
                }

                other.ch.instanceMatrix.needsUpdate = true;
                other.lines.material.opacity = qO * 0.75;
                other.dMat.color.copy(other.dMat.userData.base).lerp(new T.Color(0xfff2c0), qO * 0.4);
            }

            // electrons in the outside wires
            [[batt, qB, mode], [other, qO, mode]].forEach(function (d) {

                const dev = d[0];
                const moving = d[2] !== "idle" && ((d[2] === "charge" && d[1] < 0.999) || (d[2] === "discharge" && d[1] > 0.001));
                const rate = dev.kind === "bat" ? 0.18 : dev.kind === "sc" ? 0.5 : 1.2;

                if (!dev.elec) { return; }

                for (let i = 0; i < 14; i++) {

                    let u = (i / 14 + t * rate) % 1;

                    if (mode === "charge") { u = 1 - u; }

                    const p = dev.curve.getPoint(u);

                    m4.makeScale(moving ? 1 : 0.0001, moving ? 1 : 0.0001, moving ? 1 : 0.0001);
                    m4.setPosition(p.x, p.y, p.z);
                    dev.elec.setMatrixAt(i, m4);
                }

                dev.elec.instanceMatrix.needsUpdate = true;
            });
        }

        function placeLabels() {

            const w = renderer.domElement.clientWidth;
            const h = renderer.domElement.clientHeight;
            const v = new T.Vector3();

            function put(el, x, y, z, dx) {

                v.set(x, y, z).project(camera);

                if (v.z > 1) { el.style.display = "none"; return; }

                el.style.display = "";
                el.style.left = ((v.x + 1) / 2 * w + (dx || 0)) + "px";
                el.style.top = ((1 - v.y) / 2 * h) + "px";
            }

            put(labels.batt, batt.group.position.x, 5.0, 0);
            put(labels.other, other.group.position.x, 5.0, 0);
            put(labels.bn, batt.group.position.x - 1.1, 3.95, 0, -16);
            put(labels.bp, batt.group.position.x + 1.1, 3.95, 0, 16);
            put(labels.on, other.group.position.x - 1.1, 3.95, 0, -16);
            put(labels.op, other.group.position.x + 1.1, 3.95, 0, 16);
        }

        function setCamera() {

            const r = cam.r;
            const sp = Math.sin(cam.phi);

            camera.position.set(target.x + r * sp * Math.sin(cam.yaw), target.y + r * Math.cos(cam.phi), target.z + r * sp * Math.cos(cam.yaw));
            camera.lookAt(target.x, target.y, target.z);
        }

        function resize() {

            if (!renderer) { return; }

            const w = Math.max(200, stage.clientWidth);
            const h = Math.max(200, stage.clientHeight);

            renderer.setSize(w, h, false);
            renderer.domElement.style.width = "100%";
            renderer.domElement.style.height = "100%";
            camera.aspect = w / h;
            camera.updateProjectionMatrix();

            const half = Math.tan(camera.fov * Math.PI / 360);

            fit = Math.max(11, 5.9 / (half * Math.min(camera.aspect, 1.9)));

            if (!cam.fitted) { cam.r = cam.tr = fit; cam.fitted = true; }
        }

        function preset(name) {

            cam.spin = false;

            const p = { three: [0.6, 1.15], front: [0, 1.5], top: [0, 0.22], side: [1.5, 1.45] }[name];

            cam.tyaw = p[0];
            cam.tp = p[1];
            cam.tr = fit;
        }

        // pointer controls: drag to turn, wheel or pinch to zoom, tap to pick
        function controls() {

            const el = renderer.domElement;
            const pts = new Map();
            let down = null;
            let pinch = 0;

            el.style.touchAction = "pan-y";

            el.addEventListener("pointerdown", function (e) {

                pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                el.setPointerCapture(e.pointerId);
                down = { x: e.clientX, y: e.clientY, moved: false };
                cam.spin = false;
                stage.style.cursor = "grabbing";

                if (pts.size === 2) {

                    const a = Array.from(pts.values());

                    pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
                }
            });

            el.addEventListener("pointermove", function (e) {

                if (!pts.has(e.pointerId)) { return; }

                const prev = pts.get(e.pointerId);

                pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (pts.size === 2) {

                    const a = Array.from(pts.values());
                    const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);

                    if (pinch > 0) { cam.tr = clamp(cam.tr * (pinch / d), fit * 0.3, fit * 1.35); cam.r = cam.tr; }

                    pinch = d;

                    if (down) { down.moved = true; }

                    return;
                }

                const dx = e.clientX - prev.x;
                const dy = e.clientY - prev.y;

                if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) { down.moved = true; }

                cam.yaw -= dx * 0.008;
                cam.phi = clamp(cam.phi - dy * 0.006, 0.18, 1.52);
                cam.tyaw = cam.yaw;
                cam.tp = cam.phi;
            });

            function up(e) {

                const wasDown = down;

                pts.delete(e.pointerId);
                pinch = 0;
                stage.style.cursor = "grab";

                if (pts.size === 0 && wasDown && !wasDown.moved && e.type === "pointerup") {

                    const part = pickAt(e.clientX, e.clientY);

                    setSelected(part);

                    if (part) { showInfo(part.key); update(); }
                }

                if (pts.size === 0) { down = null; }
            }

            el.addEventListener("pointerup", up);
            el.addEventListener("pointercancel", up);

            el.addEventListener("wheel", function (e) {

                e.preventDefault();
                cam.spin = false;
                cam.tr = clamp(cam.tr * (1 + e.deltaY * 0.001), fit * 0.3, fit * 1.35);
            }, { passive: false });
        }

        function frameLoop(dt) {

            if (!renderer || disposed) { return; }

            t += dt;

            // charge dynamics: the capacitor is fastest, then the supercapacitor, then the battery
            const rB = 1 / 9;
            const rO = state.other === "sc" ? 1 / 2.6 : 1 / 0.6;
            const capB = capBat();
            const capO = capOther();

            if (mode === "charge") { qB = Math.min(1, qB + rB * dt); qO = Math.min(1, qO + rO * dt); }
            if (mode === "discharge") { qB = Math.max(0, qB - rB * dt); qO = Math.max(0, qO - rO * dt); }

            if (qB >= 0.999 && qO >= 0.999) { fullSeen = true; }
            if (fullSeen && qB <= 0.001 && qO <= 0.001) { drainSeen = true; }

            if (cam.spin) { cam.yaw = 0.45 + 0.42 * Math.sin(t * 0.45); cam.tyaw = cam.yaw; }

            // ease toward the target camera
            cam.yaw += (cam.tyaw - cam.yaw) * Math.min(1, dt * 6);
            cam.phi += (cam.tp - cam.phi) * Math.min(1, dt * 6);
            cam.r += (cam.tr - cam.r) * Math.min(1, dt * 6);

            setCamera();
            placeInstances();
            placeLabels();
            update();
            renderer.render(scene, camera);

            void capB; void capO;
        }

        function setup(THREEmod) {

            T = THREEmod;

            try {

                renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });

            } catch (err) {

                loading.textContent = "This device can't show the 3D scene.";

                return;
            }

            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.outputColorSpace = T.SRGBColorSpace;
            renderer.toneMapping = T.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.05;
            renderer.localClippingEnabled = true;
            renderer.domElement.style.display = "block";
            stage.insertBefore(renderer.domElement, stage.firstChild);
            loading.style.display = "none";

            scene = new T.Scene();
            camera = new T.PerspectiveCamera(28, 1.6, 0.1, 100);
            raycaster = new T.Raycaster();
            plane = new T.Plane(new T.Vector3(0, 0, -1), 1.05);

            const pm = new T.PMREMGenerator(renderer);

            envTex = pm.fromScene(envScene(T), 0.03).texture;
            scene.environment = envTex;
            pm.dispose();

            scene.add(new T.HemisphereLight(0xcfdcff, 0x16204a, 0.7));

            const key = new T.DirectionalLight(0xffffff, 1.6);

            key.position.set(5, 9, 7);
            scene.add(key);

            const rim = new T.DirectionalLight(0x54e0c7, 0.7);

            rim.position.set(-7, 4, -6);
            scene.add(rim);

            batt = buildBattery(T);
            buildWires(T, batt);
            scene.add(batt.group);

            labels.batt = makeLabel("Lithium-ion battery");
            labels.other = makeLabel("Supercapacitor");
            labels.bn = makeLabel("−");
            labels.bp = makeLabel("+");
            labels.on = makeLabel("−");
            labels.op = makeLabel("+");

            buildOther(T);
            resize();
            controls();

            if (window.ResizeObserver) { new ResizeObserver(resize).observe(stage); } else { window.addEventListener("resize", resize); }

            M.animate(root, frameLoop);
            frameLoop(0);
        }

        root.querySelectorAll("[data-act]").forEach(function (b) {

            b.addEventListener("click", function () {

                mode = b.dataset.act === "hold" ? "idle" : b.dataset.act;
                update();
            });
        });

        root.querySelectorAll("[data-view]").forEach(function (b) {

            b.addEventListener("click", function () {

                if (renderer) { preset(b.dataset.view); }
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            mode = "idle";
            qB = 0;
            qO = 0;
            setSelected(null);

            if (renderer) { cam.spin = true; preset("three"); cam.spin = true; }

            out(root, "info", "Click any part of either device to see what it is and what it does.");
        });

        let lastOther = state.other;

        wire(root, state, defaults, function () {

            if (renderer) {

                applyCut();

                if (state.other !== lastOther) {

                    lastOther = state.other;
                    qO = 0;
                    setSelected(null);
                    buildOther(T);
                }
            }

            update();
        });

        update();

        loadThree().then(function (mod) { setup(mod); }).catch(function () {

            loading.textContent = "The 3D scene couldn't load. Check your connection and try again.";
        });
    };

    document.querySelectorAll('.fd-sim[data-sim="supercap-3d"]').forEach(F.mount);

})();
