/* ========================================
   FAB VALLEY ADVENTURE: CARBON CITY
   Reached by the Spark Line tram from
   Ampfield. A town for playing with
   carbon's structures: the buckyball,
   benzene rings, nanotube lamps, the
   diamond and pencil statues and the
   carbon-atom friends all moved here from
   Ion City. Dr. Bucky's Carbon Lab has four
   hands-on exhibits:
     - Allotrope builder (3D diamond,
       graphite, graphene, nanotube, C60)
     - Sticky-tape bench (peel graphite down
       to one-atom-thick graphene)
     - Nanotube roller ((n, m), metallic
       when n − m is a multiple of 3)
     - Buckyball kit (60 atoms, 12 pentagons,
       20 hexagons)
   Finish all four and The Soot Golem
   (amorphous carbon) shows up in the plaza.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);
        const draw = api.carbon.draw;
        const drawAtom = api.carbon.drawAtom;

        api.TYPES.carboncity = { label: "Carbon", icon: "⚽" };

        const EXHIBITS = [
            { id: "builder", name: "Allotrope Builder", what: "Build diamond, graphite, graphene, a nanotube and a buckyball, and see how one element makes them all." },
            { id: "tape", name: "Sticky-Tape Bench", what: "Peel a graphite flake with tape until you're down to a single layer: graphene." },
            { id: "roller", name: "Nanotube Roller", what: "Roll graphene into tubes and predict which ones conduct like a metal." },
            { id: "bucky", name: "Buckyball Kit", what: "Count the atoms, pentagons and hexagons in C₆₀." }
        ];

        function cc() {
            const s = api.save();
            if (!s.carboncity) {
                s.carboncity = { intro: false, done: {}, seen: {}, tubes: {}, boss: false, bossUp: false };
            }
            return s.carboncity;
        }

        function allDone() {
            return EXHIBITS.every((e) => cc().done[e.id]);
        }

        function finishExhibit(id, summary) {
            const s = cc();
            const first = !s.done[id];
            s.done[id] = true;
            if (allDone() && !s.boss) {
                s.bossUp = true;
            }
            api.writeSave();
            if (first) {
                api.gainXP(40);
                api.awardSiteXP("carbon_" + id, 40);
            }
            const left = EXHIBITS.filter((e) => !s.done[e.id]);
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">EXHIBIT COMPLETE</p>
                    <h2>✓ ${EXHIBITS.find((e) => e.id === id).name}</h2>
                    ${first ? '<p class="adv-xp-big">+40 XP</p>' : ""}
                    <div class="adv-takeaway">${summary}</div>
                    <p class="adv-lead">${left.length ? `Still to try: <strong>${left.map((e) => e.name).join(", ")}</strong>.` : s.boss ? "You've done every exhibit." : "That's every exhibit! Something is stirring out in the plaza…"}</p>
                    <button type="button" class="adv-btn" data-close>Back to the lab</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
            if (!left.length && first && !s.boss) {
                api.afterModal(() => api.say([
                    "You've tried every exhibit! Diamond, graphite, graphene, nanotubes and buckyballs: all pure carbon, all different.",
                    "But… out in the plaza, a cloud of soot is gathering into a shape. It's The Soot Golem: carbon with no order at all! Go!"
                ], "Dr. Bucky"));
            }
        }

        function label(c, text, x, y, color, align, bold) {
            c.fillStyle = color || "#a9b2d0";
            c.font = `${bold ? "bold " : ""}11px sans-serif`;
            c.textAlign = align || "left";
            c.fillText(text, x, y);
        }

        function bg(c) {
            c.clearRect(0, 0, 460, 230);
            c.fillStyle = "#0b1020";
            c.fillRect(0, 0, 460, 230);
        }

        function dot(c, x, y, r, col) {
            c.fillStyle = col;
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
        }


        /* ---------- 3D carbon models ---------- */

        const PHI = (1 + Math.sqrt(5)) / 2;

        function bondsByLength(pts, len, tol) {
            const b = [];
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
                    if (Math.abs(d - len) < tol) {
                        b.push([i, j]);
                    }
                }
            }
            return b;
        }

        function center(pts) {
            const n = pts.length;
            const m = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / n);
            return pts.map((p) => [p[0] - m[0], p[1] - m[1], p[2] - m[2]]);
        }

        // graphene lattice with bond length 1
        function graphenePoints(range) {
            const pts = [];
            const a1 = [Math.sqrt(3), 0];
            const a2 = [Math.sqrt(3) / 2, 1.5];
            for (let i = -range; i <= range; i++) {
                for (let j = -range; j <= range; j++) {
                    const x = i * a1[0] + j * a2[0];
                    const y = i * a1[1] + j * a2[1];
                    pts.push([x, y]);
                    pts.push([x, y + 1]);
                }
            }
            return pts;
        }

        function modelGraphene() {
            const pts = graphenePoints(7).filter(([x, y]) => Math.hypot(x, y) < 5.2).map(([x, y]) => [x, y, 0]);
            const p = center(pts);
            return { pts: p, bonds: bondsByLength(p, 1, 0.05), color: "#54e0c7" };
        }

        function modelGraphite() {
            const pts = [];
            [-1, 0, 1].forEach((layer) => {
                const shift = layer === 0 ? 1 : 0;
                graphenePoints(5).filter(([x, y]) => Math.hypot(x, y - shift) < 3.6).forEach(([x, y]) => pts.push([x, y + shift, layer * 2.36]));
            });
            const p = center(pts);
            return { pts: p, bonds: bondsByLength(p, 1, 0.05), color: "#8f98aa", rotX: 1.2 };
        }

        function modelDiamond() {
            const base = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
            const pts = [];
            for (let i = -1; i <= 2; i++) {
                for (let j = -1; j <= 2; j++) {
                    for (let k = -1; k <= 2; k++) {
                        base.forEach(([x, y, z]) => {
                            [[0, 0, 0], [0.25, 0.25, 0.25]].forEach(([dx, dy, dz]) => {
                                const p = [i + x + dx, j + y + dy, k + z + dz];
                                if (p.every((v) => v >= -0.01 && v <= 1.51)) {
                                    pts.push(p);
                                }
                            });
                        });
                    }
                }
            }
            const uniq = pts.filter((p, idx) => pts.findIndex((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 1e-6) === idx);
            const p = center(uniq).map((v) => v.map((x) => x * 4));
            return { pts: p, bonds: bondsByLength(p, Math.sqrt(3), 0.05), color: "#cfe8ff" };
        }

        // roll graphene along the chiral vector C = n·a1 + m·a2
        function modelTube(n, m, length) {
            const a1 = [Math.sqrt(3), 0];
            const a2 = [Math.sqrt(3) / 2, 1.5];
            const C = [n * a1[0] + m * a2[0], n * a1[1] + m * a2[1]];
            const Clen = Math.hypot(C[0], C[1]);
            const ch = [C[0] / Clen, C[1] / Clen];
            const tv = [-ch[1], ch[0]];
            const R = Clen / (2 * Math.PI);
            const pts = [];
            graphenePoints(26).forEach(([x, y]) => {
                const u = x * ch[0] + y * ch[1];
                const v = x * tv[0] + y * tv[1];
                if (u >= -1e-6 && u < Clen - 1e-6 && v >= 0 && v < length) {
                    const ang = 2 * Math.PI * u / Clen;
                    pts.push([R * Math.cos(ang), v - length / 2, R * Math.sin(ang)]);
                }
            });
            return { pts: pts, bonds: bondsByLength(pts, 1, 0.08), color: "#54e0c7", R: R, Clen: Clen };
        }

        function modelC60() {
            const sets = [[0, 1, 3 * PHI], [1, 2 + PHI, 2 * PHI], [PHI, 2, PHI * PHI * PHI]];
            const pts = [];
            sets.forEach((base) => {
                for (let r = 0; r < 3; r++) {
                    const v = [base[r % 3], base[(r + 1) % 3], base[(r + 2) % 3]];
                    for (let sx = -1; sx <= 1; sx += 2) {
                        for (let sy = -1; sy <= 1; sy += 2) {
                            for (let sz = -1; sz <= 1; sz += 2) {
                                const p = [v[0] * sx, v[1] * sy, v[2] * sz];
                                if (!pts.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 1e-6)) {
                                    pts.push(p);
                                }
                            }
                        }
                    }
                }
            });
            const p = pts.map((v) => v.map((x) => x / 1.4));
            const bonds = bondsByLength(p, 2 / 1.4, 0.05);
            // each atom belongs to one pentagon: the nearest of the 12 icosahedron directions
            const ico = [];
            [[0, 1, PHI]].forEach((base) => {
                for (let r = 0; r < 3; r++) {
                    const v = [base[r % 3], base[(r + 1) % 3], base[(r + 2) % 3]];
                    for (let sy = -1; sy <= 1; sy += 2) {
                        for (let sz = -1; sz <= 1; sz += 2) {
                            const q = r === 0 ? [0, v[1] * sy, v[2] * sz] : r === 1 ? [v[0] * sy, v[1] * sz, 0] : [v[0] * sz, 0, v[2] * sy];
                            ico.push(q);
                        }
                    }
                }
            });
            const owner = p.map((a) => {
                let best = 0;
                let bd = -Infinity;
                ico.forEach((q, k) => {
                    const d = a[0] * q[0] + a[1] * q[1] + a[2] * q[2];
                    if (d > bd) {
                        bd = d;
                        best = k;
                    }
                });
                return best;
            });
            const pent = bonds.map(([i, j]) => owner[i] === owner[j]);
            return { pts: p, bonds: bonds, color: "#ffd84a", pent: pent, ico: ico.length };
        }

        function render3D(c, model, rotY, rotX, cx, cy, scale, opts) {
            opts = opts || {};
            const cy1 = Math.cos(rotY);
            const sy1 = Math.sin(rotY);
            const cx1 = Math.cos(rotX);
            const sx1 = Math.sin(rotX);
            const proj = model.pts.map(([x, y, z]) => {
                const x1 = x * cy1 + z * sy1;
                const z1 = -x * sy1 + z * cy1;
                const y1 = y * cx1 - z1 * sx1;
                const z2 = y * sx1 + z1 * cx1;
                const f = 14 / (14 + z2);
                return [cx + x1 * scale * f, cy + y1 * scale * f, z2, f];
            });
            const bonds = model.bonds.map((b, k) => ({ b: b, k: k, z: (proj[b[0]][2] + proj[b[1]][2]) / 2 })).sort((a, b) => b.z - a.z);
            bonds.forEach(({ b, k, z }) => {
                const shade = Math.max(0.25, Math.min(1, 0.65 - z / 12));
                c.strokeStyle = model.pent && model.pent[k] && opts.pentagons ? `rgba(255, 107, 125, ${shade})` : `rgba(200, 210, 230, ${shade})`;
                c.lineWidth = model.pent && model.pent[k] && opts.pentagons ? 2.4 : 1.4;
                c.beginPath();
                c.moveTo(proj[b[0]][0], proj[b[0]][1]);
                c.lineTo(proj[b[1]][0], proj[b[1]][1]);
                c.stroke();
            });
            proj.map((p, i) => ({ p: p, i: i })).sort((a, b) => b.p[2] - a.p[2]).forEach(({ p }) => {
                const shade = Math.max(0.35, Math.min(1, 0.75 - p[2] / 12));
                c.globalAlpha = shade;
                dot(c, p[0], p[1], Math.max(1.5, (opts.r || 3.2) * p[3]), model.color);
                c.globalAlpha = 1;
            });
        }


        /* ---------- Exhibit 1: allotrope builder ---------- */

        const ALLOTROPES = [
            {
                id: "diamond", label: "sp³: four bonds in 3D", name: "Diamond", make: modelDiamond, scale: 26,
                facts: ["Every carbon bonds to four neighbors, pointing to the corners of a tetrahedron, in a rigid 3D network.",
                    "That makes diamond the hardest natural material. All its electrons are locked in bonds, so it's an electrical insulator and it's transparent."]
            },
            {
                id: "graphite", label: "sp²: flat sheets, stacked", name: "Graphite", make: modelGraphite, scale: 22,
                facts: ["Each carbon bonds to three neighbors in a flat honeycomb sheet. Sheets stack 0.335 nm apart, held only by weak forces.",
                    "The sheets slide over each other, which is why graphite is soft, slippery and leaves a mark from a pencil. It conducts electricity along the sheets."]
            },
            {
                id: "graphene", label: "sp²: one single sheet", name: "Graphene", make: modelGraphene, scale: 20,
                facts: ["A single honeycomb sheet, one atom thick: graphene.",
                    "It's among the strongest materials ever measured and conducts electricity extremely well. It was first isolated in 2004 using sticky tape, which won a Nobel Prize in 2010."]
            },
            {
                id: "tube", label: "sp², rolled into a tube", name: "Carbon nanotube", make: () => modelTube(5, 5, 9), scale: 16,
                facts: ["Roll a strip of graphene into a seamless cylinder and you get a carbon nanotube, often about a nanometer across.",
                    "Depending on how it's rolled, a nanotube conducts like a metal or acts like a semiconductor. Try the Nanotube Roller!"]
            },
            {
                id: "c60", label: "sp² with pentagons: a closed cage", name: "Buckyball (C₆₀)", make: modelC60, scale: 22,
                facts: ["Add pentagons among the hexagons and the sheet curves until it closes into a ball: 60 atoms, shaped like a soccer ball.",
                    "It was discovered in 1985 and named after Buckminster Fuller, an architect famous for geodesic domes."]
            }
        ];

        const modelCache = {};

        function getModel(a) {
            if (!modelCache[a.id]) {
                modelCache[a.id] = a.make();
            }
            return modelCache[a.id];
        }

        function openBuilder() {
            const s = cc();
            s.seen = s.seen || {};
            const m = api.openModal(`
                ${api.head("carboncity", "Allotrope Builder")}
                <p class="adv-lead">Diamond, graphite, graphene, nanotubes and buckyballs are all pure carbon. They're <em>allotropes</em>: same atoms, different bonding. Pick how each carbon bonds and watch what it builds.</p>
                <canvas id="abCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="abCap">Choose a bonding pattern.</p>
                ${ui.chips("allo", ALLOTROPES.map((a) => ({ id: a.id, label: a.label })), null)}
                <div class="adv-takeaway" id="abFacts"><p>Built so far: <strong id="abCount">0</strong> of ${ALLOTROPES.length}</p></div>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="abDone" hidden>Finish the exhibit</button></div>`);
            const c = $("abCv").getContext("2d");
            let pick = null;

            function count() {
                const n = ALLOTROPES.filter((a) => s.seen[a.id]).length;
                $("abCount").textContent = n;
                $("abDone").hidden = n < ALLOTROPES.length;
            }

            function spin() {
                // keep rotating while the modal is open
                ui.animate(m, 60000, (k, now) => {
                    bg(c);
                    if (!pick) {
                        label(c, "Pick a bonding pattern below", 230, 118, "#a9b2d0", "center");
                        return;
                    }
                    const a = ALLOTROPES.find((x) => x.id === pick);
                    const model = getModel(a);
                    render3D(c, model, now / 2200, model.rotX || 0.45, 230, 112, a.scale, { r: a.id === "diamond" ? 3.6 : 3 });
                    label(c, a.name, 14, 22, "#f5f7ff", "left", true);
                    label(c, `${model.pts.length} atoms shown`, 446, 22, "#a9b2d0", "right");
                }, spin);
            }
            spin();

            ui.wireChips("allo", (v) => {
                pick = v;
                const a = ALLOTROPES.find((x) => x.id === v);
                s.seen[v] = true;
                api.writeSave();
                $("abCap").innerHTML = `<strong>${a.name}.</strong> ${a.facts[0]}`;
                $("abFacts").innerHTML = `<p>${a.facts[1]}</p><p>Built so far: <strong id="abCount">0</strong> of ${ALLOTROPES.length}</p>`;
                count();
            });
            count();

            $("abDone").addEventListener("click", () => finishExhibit("builder", "<p>One element, five structures. How the atoms bond decides everything: diamond's 3D bonds make it hard and insulating, while graphite's flat sheets make it soft and conductive.</p>"));
        }


        /* ---------- Exhibit 2: sticky-tape bench ---------- */

        function openTape() {
            let layers = 40 + Math.floor(Math.random() * 40);
            let busy = false;
            let peels = 0;
            const m = api.openModal(`
                ${api.head("carboncity", "Sticky-Tape Bench")}
                <p class="adv-lead">In 2004, Andre Geim and Konstantin Novoselov pressed sticky tape onto graphite, peeled it off, and did it again and again. Each peel splits the flake. Eventually some pieces are just one layer thick: graphene.</p>
                <canvas id="tpCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="tpCap">A graphite flake on tape. Peel it apart until you reach exactly one layer.</p>
                <div class="adv-button-row">
                    <button type="button" class="adv-btn" id="tpPeel" data-autofocus>Fold the tape and peel</button>
                    <button type="button" class="adv-btn secondary" id="tpNew">New flake</button>
                    <button type="button" class="adv-btn" id="tpKeep" hidden>Put it on a chip</button>
                </div>
                <p class="adv-result" id="tpRes" aria-live="polite"></p>`);
            const c = $("tpCv").getContext("2d");

            function draw(k, now, from, to) {
                bg(c);
                // tape strips
                rect(c, 20, 30, 420, 30, "rgba(255, 240, 180, 0.35)");
                rect(c, 20, 150, 420, 30, "rgba(255, 240, 180, 0.35)");
                const lift = 40 * Math.sin(Math.PI * k);
                const n = Math.round(from + (to - from) * k);
                // flake: one line per layer (capped so it fits)
                const shown = Math.min(n, 60);
                for (let i = 0; i < shown; i++) {
                    rect(c, 170, 146 - i * 1.4 - (k > 0 && k < 1 ? lift * (i / Math.max(1, shown)) : 0), 120, 1, "#5d6577");
                }
                // light passing through: graphene absorbs about 2.3% per layer
                const absorb = Math.min(100, n * 2.3);
                rect(c, 330, 80, 100, 50, "#141a2e");
                rect(c, 335, 85, 90, 40, `rgba(240, 245, 255, ${Math.max(0.05, 1 - absorb / 100)})`);
                label(c, `light absorbed: ${absorb.toFixed(1)}%`, 380, 142, "#a9b2d0", "center");
                label(c, `${n} layer${n === 1 ? "" : "s"}`, 230, 210, n === 1 ? "#5be38a" : "#f5f7ff", "center", true);
                label(c, `peels: ${peels}`, 24, 24, "#a9b2d0");
            }
            draw(0, 0, layers, layers);

            $("tpPeel").addEventListener("click", () => {
                if (busy || layers <= 1) {
                    return;
                }
                busy = true;
                peels++;
                const from = layers;
                const to = Math.max(0, Math.round(from * (0.3 + Math.random() * 0.4) - (from < 4 ? Math.round(Math.random()) : 0)));
                $("tpCap").innerHTML = "Folding the tape onto the flake and pulling it apart…";
                ui.animate(m, 1800, (k, now) => draw(k, now, from, to), () => {
                    layers = to;
                    busy = false;
                    draw(1, 0, to, to);
                    if (to === 1) {
                        $("tpCap").innerHTML = "<strong>One layer!</strong> It absorbs only about 2.3% of the light, so it's barely visible, yet it's a complete sheet of carbon one atom thick.";
                        $("tpKeep").hidden = false;
                        $("tpPeel").disabled = true;
                    } else if (to === 0) {
                        $("tpCap").innerHTML = "The tape came away empty: the flake is gone. Grab a new flake and try again.";
                        $("tpPeel").disabled = true;
                    } else {
                        $("tpCap").innerHTML = `Now ${to} layers. Each layer you remove makes the flake let through more light. Keep peeling!`;
                    }
                });
            });
            $("tpNew").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                layers = 40 + Math.floor(Math.random() * 40);
                peels = 0;
                $("tpPeel").disabled = false;
                $("tpKeep").hidden = true;
                $("tpCap").innerHTML = "A fresh graphite flake. Peel it down to exactly one layer.";
                draw(0, 0, layers, layers);
            });
            $("tpKeep").addEventListener("click", () => finishExhibit("tape", `<p>You made graphene in ${peels} peels! Graphite is just graphene sheets stacked up, held by weak forces, so tape can pull them apart.</p><p>Labs still use this "sticky-tape method" for the cleanest, highest-quality flakes.</p>`));
        }


        /* ---------- Exhibit 3: nanotube roller ---------- */

        function tubeKind(n, m) {
            return {
                shape: n === m ? "armchair" : m === 0 ? "zigzag" : "chiral",
                metal: (n - m) % 3 === 0,
                d: 0.0783 * Math.sqrt(n * n + n * m + m * m)
            };
        }

        function openRoller() {
            const s = cc();
            s.tubes = s.tubes || {};
            let busy = false;
            const m = api.openModal(`
                ${api.head("carboncity", "Nanotube Roller")}
                <p class="adv-lead">Which way you roll graphene is written as two numbers (n, m): the steps along the honeycomb that wrap once around the tube. They decide the tube's width and whether it conducts like a metal or a semiconductor.</p>
                <canvas id="rlCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="rlCap">Set (n, m), roll the tube, then predict how it conducts.</p>
                ${ui.slider("rlN", "n", "", 3, 10, 1, 6)}
                ${ui.slider("rlM", "m", "", 0, 10, 1, 0)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="rlGo" data-autofocus>Roll it</button></div>
                <div id="rlQ"></div>
                <p class="adv-keys" style="text-align:left">Rolled correctly so far: metallic <strong id="rlMet">${s.tubes.metal ? "✓" : "–"}</strong> · semiconducting <strong id="rlSemi">${s.tubes.semi ? "✓" : "–"}</strong></p>`);
            const c = $("rlCv").getContext("2d");
            let nEl = null;
            let mEl = null;
            nEl = ui.wireSlider("rlN", null, () => clamp());
            mEl = ui.wireSlider("rlM", null, () => clamp());

            function clamp() {
                if (!nEl || !mEl) {
                    return;
                }
                if (Number(mEl.value) > Number(nEl.value)) {
                    mEl.value = nEl.value;
                    $("rlMOut").textContent = mEl.value;
                }
                if (!busy) {
                    flat();
                }
            }

            function flat() {
                bg(c);
                const n = Number(nEl.value);
                const mm = Number(mEl.value);
                const pts = graphenePoints(9);
                const sc = 9;
                const ox = 60;
                const oy = 190;
                c.strokeStyle = "rgba(200, 210, 230, 0.35)";
                c.lineWidth = 1;
                const inView = (x, y) => ox + x * sc > 4 && ox + x * sc < 456 && oy - y * sc > 4 && oy - y * sc < 226;
                pts.forEach(([x, y], i) => {
                    if (inView(x, y)) {
                        dot(c, ox + x * sc, oy - y * sc, 1.4, "#54e0c7");
                    }
                });
                const C = [n * Math.sqrt(3) + mm * Math.sqrt(3) / 2, mm * 1.5];
                c.strokeStyle = "#ffd84a";
                c.lineWidth = 2.5;
                c.beginPath();
                c.moveTo(ox, oy);
                c.lineTo(ox + C[0] * sc, oy - C[1] * sc);
                c.stroke();
                dot(c, ox + C[0] * sc, oy - C[1] * sc, 4, "#ffd84a");
                label(c, `wrap vector (${n}, ${mm}): this line becomes the tube's circumference`, 14, 20, "#ffd84a", "left", true);
            }
            flat();

            $("rlGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const n = Number(nEl.value);
                const mm = Number(mEl.value);
                const kind = tubeKind(n, mm);
                const model = modelTube(n, mm, 10);
                $("rlCap").innerHTML = `Rolling a (${n}, ${mm}) tube: the yellow wrap vector joins head to tail. It's ${kind.shape}, about ${kind.d.toFixed(2)} nm across.`;
                ui.animate(m, 6500, (k, now) => {
                    bg(c);
                    render3D(c, model, now / 2000, 0.25 + 0.3 * (1 - k), 230, 115, Math.min(18, 70 / Math.max(1, model.R)) * (0.6 + 0.4 * k), { r: 2.4 });
                    label(c, `(${n}, ${mm}) · ${kind.shape} · ${kind.d.toFixed(2)} nm`, 14, 22, "#f5f7ff", "left", true);
                }, () => {
                    $("rlQ").innerHTML = `
                        <div class="adv-takeaway">
                            <p><strong>Does a (${n}, ${mm}) nanotube conduct like a metal?</strong></p>
                            <div class="adv-chips">
                                <button type="button" class="adv-chip" data-rq="1">Metallic</button>
                                <button type="button" class="adv-chip" data-rq="0">Semiconducting</button>
                            </div>
                            <p class="adv-result" id="rqRes"></p>
                        </div>`;
                    let answered = false;
                    api.modalBody().querySelectorAll("[data-rq]").forEach((b) => b.addEventListener("click", () => {
                        if (answered) {
                            return;
                        }
                        answered = true;
                        b.classList.add("on");
                        const ok = (b.dataset.rq === "1") === kind.metal;
                        if (ok) {
                            s.tubes[kind.metal ? "metal" : "semi"] = true;
                            api.writeSave();
                        }
                        $("rlMet").textContent = s.tubes.metal ? "✓" : "–";
                        $("rlSemi").textContent = s.tubes.semi ? "✓" : "–";
                        ui.result("rqRes", `${ok ? "✓" : "✗"} ${kind.metal ? "Metallic" : "Semiconducting"}. The rule: a tube is metallic when n − m is a multiple of 3. Here n − m = ${n - mm}${kind.metal ? ", a multiple of 3" : ", not a multiple of 3"}.`, ok);
                        busy = false;
                        if (s.tubes.metal && s.tubes.semi) {
                            const btn = document.createElement("div");
                            btn.className = "adv-button-row";
                            btn.innerHTML = '<button type="button" class="adv-btn" id="rlDone">Finish the exhibit</button>';
                            $("rlQ").appendChild(btn);
                            $("rlDone").addEventListener("click", () => finishExhibit("roller", "<p>Same graphene, rolled two ways, two different electrical personalities. When n − m is a multiple of 3 (like every armchair (n, n) tube) the tube is metallic; otherwise it's a semiconductor.</p><p>That's why researchers sort nanotubes before building transistors from them.</p>"));
                        }
                    }));
                });
            });
        }


        /* ---------- Exhibit 4: buckyball kit ---------- */

        function openBucky() {
            const model = getModel(ALLOTROPES[4]);
            const qs = [
                { q: "How many carbon atoms are in this ball?", a: ["60", "50", "70", "32"], why: "That's where the name C₆₀ comes from." },
                { q: "How many pentagons (red rings)?", a: ["12", "6", "20", "10"], why: "Exactly 12 pentagons are what it takes to close a sheet of hexagons into a ball." },
                { q: "And how many hexagons?", a: ["20", "12", "30", "60"], why: "Twenty hexagons and twelve pentagons: the same pattern as a classic soccer ball." }
            ];
            let qi = 0;
            const m = api.openModal(`
                ${api.head("carboncity", "Buckyball Kit")}
                <p class="adv-lead">C₆₀, the buckyball: carbon atoms at the corners, bonds along the edges. The pentagons are drawn in red. Watch it turn and count.</p>
                <canvas id="bkCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <div id="bkQ"></div>`);
            const c = $("bkCv").getContext("2d");
            const spin = () => ui.animate(m, 60000, (k, now) => {
                bg(c);
                render3D(c, model, now / 2600, 0.5 + 0.2 * Math.sin(now / 3000), 230, 115, 24, { pentagons: true, r: 3 });
            }, spin);
            spin();

            function ask() {
                const q = qs[qi];
                const opts = window.SCGames ? window.SCGames.shuffle(q.a) : q.a.slice();
                $("bkQ").innerHTML = `
                    <div class="adv-takeaway">
                        <p><strong>${q.q}</strong></p>
                        <div class="adv-chips">${opts.map((o) => `<button type="button" class="adv-chip" data-bq="${o}">${o}</button>`).join("")}</div>
                        <p class="adv-result" id="bqRes"></p>
                    </div>
                    <div class="adv-button-row"><button type="button" class="adv-btn" id="bkNext" hidden>${qi < qs.length - 1 ? "Next question" : "Finish the exhibit"}</button></div>`;
                let answered = false;
                api.modalBody().querySelectorAll("[data-bq]").forEach((b) => b.addEventListener("click", () => {
                    if (answered) {
                        return;
                    }
                    const ok = b.dataset.bq === q.a[0];
                    b.classList.add("on");
                    if (!ok) {
                        ui.result("bqRes", "✗ Not quite. Count again: try following one ring around.", false);
                        setTimeout(() => b.classList.remove("on"), 900);
                        return;
                    }
                    answered = true;
                    ui.result("bqRes", `✓ ${q.a[0]}. ${q.why}`, true);
                    $("bkNext").hidden = false;
                    $("bkNext").focus();
                }));
                $("bkNext").addEventListener("click", () => {
                    qi++;
                    if (qi < qs.length) {
                        ask();
                    } else {
                        finishExhibit("bucky", "<p>60 atoms, 12 pentagons, 20 hexagons. The pentagons are what curve the sheet into a cage: without them, hexagons alone lie flat like graphene.</p><p>C₆₀ was discovered in 1985 by Kroto, Curl and Smalley, who shared the 1996 Nobel Prize in Chemistry for it.</p>");
                    }
                });
            }
            ask();
        }


        /* ---------- Boss: The Soot Golem ---------- */

        function drawGolem(c, ox, oy, s, t) {
            const bob = Math.sin(t / 420) * 1.5;
            c.fillStyle = "rgba(0,0,0,0.25)";
            c.fillRect(ox + 5 * s, oy + 30 * s, 22 * s, 2 * s);
            // a jumble of soot particles: no order at all
            for (let i = 0; i < 26; i++) {
                const a = i * 2.4 + t / 2000;
                const r = 4 + (i * 7) % 9;
                const x = 16 + Math.cos(a) * r * 0.9;
                const y = 15 + Math.sin(a * 1.3) * r + bob;
                c.fillStyle = i % 3 ? "#2b2f3a" : "#454b5a";
                c.beginPath();
                c.arc(ox + x * s, oy + y * s, (2.4 + (i % 3)) * s, 0, Math.PI * 2);
                c.fill();
            }
            c.fillStyle = "#ffb84a";
            c.fillRect(ox + 11 * s, oy + (12 + bob) * s, 3 * s, 3 * s);
            c.fillRect(ox + 18 * s, oy + (12 + bob) * s, 3 * s, 3 * s);
            c.fillStyle = "#1a2033";
            c.fillRect(ox + 13 * s, oy + (20 + bob) * s, 6 * s, 2 * s);
        }

        const GOLEM_QS = {
            diamond: [
                { q: "In diamond, each carbon atom bonds to how many neighbors?", a: ["Four", "Three", "Two", "Six"], why: "Four bonds in a rigid 3D network." },
                { q: "Why is diamond so hard?", a: ["Every atom is locked into a rigid 3D network of strong bonds", "It's made of metal", "It's very cold", "It has no atoms"], why: "There are no weak directions to slip along." },
                { q: "Does diamond conduct electricity?", a: ["No: all its electrons are tied up in bonds", "Yes, like copper", "Only when wet", "Only in the dark"], why: "That's also why it's transparent." },
                { q: "Diamond, graphite and graphene are…", a: ["Allotropes: the same element arranged differently", "Different elements", "Alloys", "Isotopes"], why: "All pure carbon." }
            ],
            graphene: [
                { q: "How thick is graphene?", a: ["One atom", "One millimeter", "One micrometer", "100 atoms"], why: "A single honeycomb sheet." },
                { q: "How was graphene first isolated in 2004?", a: ["Peeling graphite with sticky tape", "Melting diamonds", "Burning sugar", "Freezing carbon dioxide"], why: "The \"sticky-tape method\" won the 2010 Nobel Prize in Physics." },
                { q: "Graphite is made of…", a: ["Graphene sheets stacked and held by weak forces", "Diamond crystals", "Buckyballs glued together", "Lead"], why: "The weak forces let the sheets slide." },
                { q: "Why does a pencil write?", a: ["Graphite layers slide off onto the paper", "It contains lead metal", "It melts", "It's magnetic"], why: "Pencil \"lead\" is graphite." }
            ],
            tubes: [
                { q: "A carbon nanotube is…", a: ["A graphene sheet rolled into a seamless tube", "A hollow diamond", "A plastic straw", "A stack of buckyballs"], why: "Often about a nanometer across." },
                { q: "When is an (n, m) nanotube metallic?", a: ["When n − m is a multiple of 3", "Always", "Never", "When n is even"], why: "Otherwise it's a semiconductor." },
                { q: "An armchair (n, n) nanotube is…", a: ["Always metallic", "Always semiconducting", "An insulator", "Magnetic"], why: "n − n = 0, a multiple of 3." },
                { q: "About how wide is a typical single-walled nanotube?", a: ["About a nanometer", "About a meter", "About a millimeter", "About a centimeter"], why: "Tens of thousands of times thinner than a hair." }
            ],
            bucky: [
                { q: "How many atoms are in a buckyball?", a: ["60", "12", "100", "6"], why: "C₆₀." },
                { q: "How many pentagons does a buckyball have?", a: ["12", "20", "6", "60"], why: "Twelve pentagons close the cage." },
                { q: "Why does a buckyball need pentagons?", a: ["They curve the sheet so it closes into a ball", "For color", "To conduct heat", "They don't"], why: "Hexagons alone lie flat." },
                { q: "Who is the buckyball named after?", a: ["Buckminster Fuller, designer of geodesic domes", "A soccer player", "A deer", "The first astronaut"], why: "Its shape looks like his domes." }
            ]
        };

        function golemBattle() {
            const rematch = cc().boss;
            return {
                foeName: "The Soot Golem",
                foeTag: "Amorphous carbon · Lv 29",
                foeSize: 32,
                fieldClass: "adv-field-carboncity",
                drawFoe: (c, t) => drawGolem(c, 0, 0, 1, t),
                foeMax: 300,
                foePower: 1.0,
                meMax: 140,
                moves: [
                    { type: "diamond", name: "Diamond Lattice", mult: 1.75, label: "Diamond", icon: "💎", special: "dep", cls: "dep", effect: "Direct hit! Order snaps into a rigid crystal." },
                    { type: "graphene", name: "Graphene Sheet", mult: 1.5, label: "Graphene", icon: "⬡", special: "etch", cls: "etch", effect: "It's effective! A perfect honeycomb wraps around the soot." },
                    { type: "tubes", name: "Nanotube Spin", mult: 1, label: "Nanotubes", icon: "🌀", special: "litho", cls: "litho", effect: "A spinning tube sweeps up the loose carbon." },
                    { type: "bucky", name: "Count the Rings", mult: 0.5, focus: true, label: "Buckyballs", icon: "⚽", special: "inspect", cls: "inspect", effect: "You've counted its pattern. Your next hit does 1.5× damage!" }
                ],
                questions: GOLEM_QS,
                attacks: [
                    { name: "Soot Cloud", text: "A cloud of soot smudged everything!" },
                    { name: "Disorder", text: "It scrambled your carbon into random bonds!" },
                    { name: "Smudge", text: "Everything you touched turned gray!" }
                ],
                intro: [
                    "Soot swirls up from the plaza… It's <strong>The Soot Golem</strong>!",
                    "It's amorphous carbon: carbon with no order at all. Answer questions about carbon's structures to sort it out!"
                ],
                runText: "You backed off. The Soot Golem keeps swirling…",
                loseTitle: "The Soot Golem smothered you",
                loseTip: "Tip: The Soot Golem is weak to <strong>Diamond Lattice</strong> and <strong>Graphene Sheet</strong>. <strong>Count the Rings</strong> first makes your next hit 1.5× stronger.",
                winLines: rematch ? ["The Soot Golem crumbles again!", "Order restored. Rematch won!"] : ["The Soot Golem crumbles into neat little hexagons!", "📜 Dr. Bucky hands you the Carbon City Certificate of Completion!"],
                onWin: () => {
                    const s = cc();
                    const first = !s.boss;
                    s.boss = true;
                    s.bossUp = false;
                    api.save().badges.carboncity = true;
                    api.writeSave();
                    api.updateHud();
                    api.gainXP(first ? 150 : 25);
                    if (first) {
                        api.awardSiteXP("carboncityboss", 150);
                    }
                    api.afterModal(() => api.say(first ? [
                        "Order from chaos! Even soot is carbon, just with no pattern to it.",
                        "Arrange the same atoms differently and you get a gem, a pencil, a wonder material or a tiny soccer ball. Here's your Carbon City Certificate of Completion!"
                    ] : ["Crumbled again! Come back whenever you like."], "Dr. Bucky"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">ORDER RESTORED</p>
                            <h2>${first ? "📜 Certificate of Completion" : "⚽ Rematch Won"}</h2>${first ? api.certificate("carboncity") : ""}
                            <p class="adv-xp-big">+${first ? 150 : 25} XP</p>
                            <div class="adv-takeaway">
                                <p>Soot is amorphous carbon: the atoms bond every which way, with no repeating pattern.</p>
                                <p>Heat or press carbon the right way and it can order itself into graphite or even diamond. Synthetic diamonds are made exactly like that.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the plaza</button>
                        </div>`;
                }
            };
        }


        /* ---------- Exhibit guide (R) ---------- */

        function openGuide() {
            const s = cc();
            api.openModal(`
                ${api.head("carboncity", "Dr. Bucky's Exhibit Guide")}
                <p class="adv-lead">Four hands-on exhibits in the Carbon Lab. Try them all${s.boss ? "" : " and see what turns up in the plaza"}.</p>
                <ol class="adv-recipe">
                    ${EXHIBITS.map((e, i) => `
                        <li class="${s.done[e.id] ? "done" : ""}">
                            <span class="adv-recipe-mark">${s.done[e.id] ? "✓" : i + 1}</span>
                            <span><strong>${e.name}</strong><small>${e.what}</small></span>
                        </li>`).join("")}
                </ol>
                <div class="adv-button-row"><button type="button" class="adv-btn secondary" data-close>Close</button></div>`);
        }

        api.registerRecipe({
            id: "carboncity",
            scenes: ["carboncity", "carbonhall"],
            available: () => cc().intro,
            open: openGuide,
            label: "Dr. Bucky's carbon exhibits",
            progress: () => EXHIBITS.filter((e) => cc().done[e.id]).length,
            total: EXHIBITS.length,
            restart: () => {
                cc().done = {};
                cc().seen = {};
                cc().tubes = {};
                api.writeSave();
            }
        });


        /* ---------- The Spark Line back to Ampfield ---------- */

        function rideTram(toId, toLabel, x, y) {
            if (window.FabAdventureAudio) {
                window.FabAdventureAudio.sfx("tram");
            }
            const m = api.openModal(`
                ${api.head("carboncity", "Spark Line Tram")}
                <canvas id="rdCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage">All aboard for ${toLabel}! The tram recharges its supercapacitors at every stop.</p>`);
            const c = $("rdCv").getContext("2d");
            ui.animate(m, 6500, (k, now) => {
                bg(c);
                rect(c, 0, 0, 460, 150, "#1b2a4a");
                for (let i = 0; i < 6; i++) {
                    const x = ((i * 110 - now / 6) % 560 + 560) % 560 - 80;
                    c.fillStyle = "#2e4a3a";
                    c.beginPath();
                    c.moveTo(x, 150);
                    c.lineTo(x + 50, 90 + (i % 3) * 12);
                    c.lineTo(x + 100, 150);
                    c.fill();
                }
                rect(c, 0, 150, 460, 80, "#3a4a2e");
                rect(c, 0, 176, 460, 3, "#8f98aa");
                for (let x = -((now / 3) % 20); x < 460; x += 20) {
                    rect(c, x, 179, 10, 3, "#6b4a2f");
                }
                const tx = 60 + 280 * k;
                rect(c, tx, 136, 110, 38, "#ffb84a");
                for (let i = 0; i < 4; i++) {
                    rect(c, tx + 8 + i * 25, 142, 18, 12, "#ffe9a8");
                }
                rect(c, tx + 53, 118, 3, 18, "#1a2033");
                rect(c, 0, 116, 460, 2, "#1a2033");
                dot(c, tx + 22, 176, 6, "#1a2033");
                dot(c, tx + 88, 176, 6, "#1a2033");
                label(c, `Spark Line → ${toLabel}`, 230, 30, "#f5f7ff", "center", true);
            }, () => {
                api.closeModal();
                api.goTo(toId, x, y, "down");
            });
        }

        api.carbonCity = { rideTram: rideTram };


        /* ---------- Drawing ---------- */

        function exhibit(id, label2, x, y, w, h, drawFn, openFn) {
            return {
                kind: "cc-" + id,
                x: x, y: y, w: w, h: h,
                label: label2,
                draw: (c, X, Y, W, H, t) => {
                    drawFn(c, X, Y, W, H, t);
                    if (cc().intro && !cc().done[id]) {
                        const ay = Y - 32 + Math.round(Math.sin(t / 250) * 2);
                        c.fillStyle = "#1a2033";
                        c.beginPath();
                        c.moveTo(X + W / 2 - 5, ay - 1);
                        c.lineTo(X + W / 2 + 5, ay - 1);
                        c.lineTo(X + W / 2, ay + 6);
                        c.fill();
                        c.fillStyle = "#ffd84a";
                        c.beginPath();
                        c.moveTo(X + W / 2 - 3.5, ay);
                        c.lineTo(X + W / 2 + 3.5, ay);
                        c.lineTo(X + W / 2, ay + 4.5);
                        c.fill();
                    }
                },
                prompt: "A: Try the " + label2,
                use: () => {
                    if (!cc().intro) {
                        api.say(["An exhibit about carbon. Dr. Bucky can tell you how it works."]);
                        return;
                    }
                    openFn();
                }
            };
        }

        const D = {
            builder(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 10, W - 4, H - 11, "#c9cfdb");
                const a = t / 600;
                for (let i = 0; i < 6; i++) {
                    const ang = a + i * Math.PI / 3;
                    dot(c, X + W / 2 + Math.cos(ang) * 8, Y + 8 + Math.sin(ang) * 4, 2, "#54e0c7");
                }
            },
            tape(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8946a");
                rect(c, X + 6, Y + 5, W - 12, 4, "rgba(255, 240, 180, 0.8)");
                rect(c, X + W / 2 - 4, Y + 5, 8, 4, "#5d6577");
            },
            roller(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 10, W - 4, H - 11, "#c9cfdb");
                const k = (Math.sin(t / 700) + 1) / 2;
                c.strokeStyle = "#54e0c7";
                c.lineWidth = 2;
                c.beginPath();
                c.ellipse(X + W / 2, Y + 8, 12, 3 + 4 * k, 0, 0, Math.PI * 2);
                c.stroke();
            },
            bucky(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 12, W - 4, H - 13, "#c9cfdb");
                draw.bucky(c, X + 4, Y - 2, W - 8, W - 8, t);
            }
        };

        function railTile(c, x, y, t) {
            api.drawWorldTile(x, y, ".", t);
            const X = x * TILE;
            const Y = y * TILE;
            rect(c, X, Y + 2, TILE, 12, "#b9a68a");
            for (let i = 0; i < 4; i++) {
                rect(c, X + i * 4 + 1, Y + 3, 2, 10, "#6b4a2f");
            }
            rect(c, X, Y + 5, TILE, 2, "#8f98aa");
            rect(c, X, Y + 10, TILE, 2, "#8f98aa");
        }

        function drawTram(c, X, Y, W, H, t) {
            rect(c, X, Y - 10, W, 24, "#1a2033");
            rect(c, X + 1, Y - 9, W - 2, 22, "#ffb84a");
            for (let i = 0; i < 4; i++) {
                rect(c, X + 5 + i * 15, Y - 6, 10, 7, "#ffe9a8");
            }
            rect(c, X + W / 2 - 1, Y - 18, 2, 8, "#1a2033");
            rect(c, X + 4, Y + 9, W - 8, 3, "#54e0c7");
            dot(c, X + 10, Y + 14, 3, "#1a2033");
            dot(c, X + W - 10, Y + 14, 3, "#1a2033");
        }

        function drawGrapheneSheet(c, X, Y, W, H, t) {
            rect(c, X + 2, Y + H - 4, W - 4, 4, "#8f98aa");
            const wave = Math.sin(t / 700) * 2;
            c.strokeStyle = "#1a2033";
            c.lineWidth = 1;
            for (let r = 0; r < 3; r++) {
                for (let q = 0; q < 4; q++) {
                    const cx = X + 6 + q * 7 + (r % 2) * 3.5;
                    const cy = Y + 6 + r * 6 + Math.sin(q + t / 700) * 1 + wave * (r / 3);
                    c.beginPath();
                    for (let k = 0; k < 6; k++) {
                        const a = Math.PI / 6 + k * Math.PI / 3;
                        const px = cx + Math.cos(a) * 3.6;
                        const py = cy + Math.sin(a) * 3.6;
                        if (k) {
                            c.lineTo(px, py);
                        } else {
                            c.moveTo(px, py);
                        }
                    }
                    c.closePath();
                    c.strokeStyle = "#54e0c7";
                    c.stroke();
                }
            }
        }

        function decor(kind, x, y, w, h, drawFn, lines) {
            return { kind: kind, x: x, y: y, w: w, h: h, draw: drawFn, lines: lines, prompt: "A: Look" };
        }


        /* ---------- Scenes ---------- */

        api.SCENES.carboncity = {
            id: "carboncity",
            label: "Carbon City",
            outdoor: true,
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T.f......f.......f.T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBDBB..BBDBBB..T",
                "T.....p......p.....T",
                "T.ppppppppppppp....T",
                "T.........p........T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "TrrrrrrrrrrrrrrrrrrT",
                "TTTTTTTTTTTTTTTTTTTT"
            ],
            drawTile: (c, x, y, ch, t) => {
                if (ch === "h") {
                    api.carbon.hexTile(c, x, y);
                } else if (ch === "r") {
                    railTile(c, x, y, t);
                } else {
                    api.drawWorldTile(x, y, ch, t);
                }
            },
            edges: {},
            buildings: [
                { id: "carbonhall", sign: "CARBON LAB", x: 2, y: 2, w: 7, h: 4, door: { x: 6, y: 5 }, wall: "#cfd3dd", roof: "#2b2f3a", locked: () => false },
                {
                    id: "bucky-cafe", sign: "BUCKY CAFÉ", x: 11, y: 2, w: 6, h: 4, door: { x: 13, y: 5 }, wall: "#f3e3c3", roof: "#8a5a3b",
                    locked: () => true,
                    lockedText: ["BUCKY CAFÉ: \"Closed while we roast the beans. Opening in a later update!\"", "Fun fact on the door: roasting coffee turns some of the bean's sugars into carbon-rich compounds. That's the brown!"]
                }
            ],
            npcs: [
                {
                    id: "drbucky", name: "Dr. Bucky", x: 8, y: 6, dir: "down",
                    look: { suit: "#2b2f3a", accent: "#ffd84a", visor: "#54e0c7" },
                    talk: buckyTalk
                },
                {
                    id: "cee", name: "Cee the Carbon Atom", x: 12, y: 8, dir: "down",
                    draw: (c, X, Y, t) => drawAtom(c, X, Y, t, "#54e0c7"),
                    talk: () => [
                        "Hi hi! I'm a carbon atom! Welcome to Carbon City, where everything is made of me!",
                        "I have four valence electrons, so I love making four bonds. That's why carbon can build so many different things."
                    ]
                },
                {
                    id: "graphy", name: "Graphy", x: 5, y: 12, dir: "down",
                    draw: (c, X, Y, t) => drawAtom(c, X, Y, t, "#ffd84a"),
                    talk: () => [
                        "See the plaza tiles? They're a honeycomb, just like graphene!",
                        "Graphene is a single sheet of carbon atoms, only one atom thick. Stack lots of sheets and you get graphite."
                    ]
                },
                {
                    id: "glassy", name: "Glassy", x: 16, y: 9, dir: "down",
                    draw: (c, X, Y, t) => drawAtom(c, X, Y, t, "#ff8aa8"),
                    talk: () => [
                        "I'm glassy carbon! I'm not actually glass, I just break like it.",
                        "I'm made by baking a polymer with no oxygen around. I'm hard, I conduct electricity, and almost no chemical can hurt me. Dr. Carbon uses me for ISFET gates over in Ion City!"
                    ]
                }
            ],
            objects: [
                decor("bucky", 9, 10, 2, 2, draw.bucky, [
                    "A buckyball is C₆₀: 60 carbon atoms arranged in 12 pentagons and 20 hexagons, like a soccer ball."
                ]),
                decor("benzene", 4, 10, 2, 2, draw.benzene, [
                    "A benzene ring sculpture: six carbon atoms in a hexagon, with alternating double bonds.",
                    "SU-8 is packed with rings like this, part of why it leaves carbon behind when it's baked without oxygen."
                ]),
                decor("benzene", 14, 10, 2, 2, draw.benzene, [
                    "Another benzene ring. Rings like this are the building blocks of graphite and graphene, too."
                ]),
                decor("graphene", 12, 10, 2, 1, drawGrapheneSheet, [
                    "A rippling graphene sheet sculpture. Real graphene ripples a little too: a perfectly flat sheet one atom thick isn't stable on its own."
                ]),
                decor("lamp", 9, 8, 1, 1, draw.lamp, [
                    "A carbon nanotube lamppost. A nanotube is a sheet of graphene rolled into a seamless tube, just a few nanometers across."
                ]),
                decor("lamp", 11, 8, 1, 1, draw.lamp, [
                    "Another nanotube lamppost. Nanotubes are stronger than steel for their weight."
                ]),
                decor("diamond", 7, 12, 1, 1, draw.diamond, [
                    "A diamond statue. In diamond, every carbon bonds to four neighbors in a rigid 3D lattice. That's why it's so hard.",
                    "Graphite and graphene are carbon too, but arranged in flat sheets instead."
                ]),
                decor("pencil", 13, 12, 1, 1, draw.pencil, [
                    "A giant pencil. Pencil \"lead\" is really graphite: stacked sheets of carbon that slide off onto the paper."
                ]),
                {
                    kind: "tram", x: 14, y: 13, w: 4, h: 1, draw: drawTram, label: "Spark Line",
                    prompt: "A: Ride the Spark Line to Ampfield",
                    use: () => rideTram("energy", "Ampfield", 12, 11)
                },
                {
                    kind: "golem", x: 6, y: 9, w: 2, h: 2,
                    active: () => !!cc().bossUp,
                    draw: (c, X, Y, W, H, t) => {
                        drawGolem(c, X, Y - 10, 1, t);
                        const bob = Math.round(Math.sin(t / 250) * 2);
                        rect(c, X + 26, Y - 22 + bob, 9, 11, "#1a2033");
                        rect(c, X + 27, Y - 21 + bob, 7, 9, "#ffd84a");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("!", X + 30.5, Y - 16 + bob);
                    },
                    prompt: "A: Battle The Soot Golem",
                    use: () => api.say(["A swirl of soot rises from the honeycomb tiles…", "Get ready to battle!"], "", () => api.openBattle(golemBattle()))
                }
            ]
        };

        api.SCENES.carbonhall = {
            id: "carbonhall",
            label: "Carbon Lab · Dr. Bucky",
            grid: api.interiorRows(),
            floor: "#dfe3ea",
            exitTo: { scene: "carboncity", x: 6, y: 6 },
            objects: [
                exhibit("builder", "Allotrope Builder", 2, 2, 3, 2, D.builder, openBuilder),
                exhibit("tape", "Sticky-Tape Bench", 7, 2, 3, 1, D.tape, openTape),
                exhibit("roller", "Nanotube Roller", 12, 2, 3, 2, D.roller, openRoller),
                exhibit("bucky", "Buckyball Kit", 16, 2, 2, 2, D.bucky, openBucky),
                {
                    kind: "glassydisplay", x: 3, y: 9, w: 3, h: 1, label: "Glassy carbon", prompt: "A: Look",
                    draw: (c, X, Y, W, H) => { api.box(X, Y + 2, W, H - 2, "#c9cfdb"); rect(c, X + 8, Y + 4, W - 16, 6, "#2b2f3a"); },
                    lines: ["A display case of glassy carbon: a disordered tangle of graphene-like ribbons, made by baking SU-8 with no oxygen.", "Dr. Carbon turns it into ISFET gates in the Ion Lab over in Ion City."]
                }
            ],
            npcs: [
                { id: "buckylab", name: "Dr. Bucky", x: 9, y: 9, dir: "down", look: { suit: "#2b2f3a", accent: "#ffd84a", visor: "#54e0c7" }, talk: buckyTalk }
            ]
        };

        function buckyTalk() {
            const s = cc();
            const name = api.currentChar() ? api.currentChar().name : "engineer";
            if (!s.intro) {
                return {
                    lines: [
                        `Welcome to Carbon City, ${name}! I'm Dr. Bucky, named after the buckyball, of course.`,
                        "Everything here is carbon. One element, but arrange the atoms differently and you get diamond, pencil graphite, graphene, nanotubes or buckyballs.",
                        "My Carbon Lab has four hands-on exhibits. Try them all!",
                        "📋 Exhibit guide added! Press R or tap Recipe any time."
                    ],
                    done: () => {
                        s.intro = true;
                        api.writeSave();
                        api.refreshRecipe();
                    }
                };
            }
            if (s.bossUp) {
                return ["The Soot Golem is swirling around in the plaza! Go!"];
            }
            const left = EXHIBITS.filter((e) => !s.done[e.id]);
            if (left.length) {
                return [`Next, try the ${left[0].name}: ${left[0].what}`, "The exhibits are in the Carbon Lab, with yellow arrows over the ones you haven't done."];
            }
            return ["You've mastered carbon's structures! Come back any time to play with the exhibits.", "The Spark Line tram at the bottom of the plaza goes back to Ampfield."];
        }
    });

})();
