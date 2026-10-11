/* ========================================
   FAB PATH 3D CORE (three.js)

   One small engine that every 3D scene shares: it loads the local
   copy of three.js, builds the lit stage with a floor shadow, adds
   drag to turn, scroll or pinch to zoom, click to pick a part, view
   presets, floating labels, and a render loop that only runs while
   the scene is on screen.

   A scene file asks for a stage:

       F.three.create(root, { target: [0, 1.5, 0], halfWidth: 5 }).then(function (s) { ... })

   and gets back helpers: s.T (the three.js module), s.scene, s.mat,
   s.box, s.part, s.label, s.select, s.preset, s.onFrame.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || F.three) {
        return;
    }

    const M = F.memsHelpers;
    const clamp = M.clamp;

    let threePromise = null;

    function load() {

        if (!threePromise) {
            threePromise = import("./three.module.min.js");
        }

        return threePromise;
    }

    function stageHTML(css) {

        return '<div data-stage style="position:relative;width:100%;height:' + (css || "clamp(360px,56vw,470px)") + ';border-radius:14px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,rgba(40,60,110,.55),rgba(8,12,28,.95) 70%);touch-action:pan-y;cursor:grab">' +
            '<div data-loading style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(245,247,255,.8);font-size:14px">Loading the 3D scene…</div>' +
            '<div data-labels style="position:absolute;inset:0;pointer-events:none"></div>' +
            '<div data-hint style="position:absolute;left:10px;bottom:8px;font-size:11px;color:rgba(245,247,255,.6);pointer-events:none">Drag to turn · scroll or pinch to zoom · click a part</div>' +
            "</div>";
    }

    function create(root, cfg) {

        cfg = cfg || {};

        const stageEl = root.querySelector("[data-stage]");
        const loading = root.querySelector("[data-loading]");
        const labelLayer = root.querySelector("[data-labels]");

        return load().then(function (T) {

            let renderer;

            try {

                renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });

            } catch (err) {

                loading.textContent = "This device can't show the 3D scene.";

                return Promise.reject(err);
            }

            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.outputColorSpace = T.SRGBColorSpace;
            renderer.toneMapping = T.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.05;
            renderer.localClippingEnabled = true;
            renderer.domElement.style.display = "block";
            stageEl.insertBefore(renderer.domElement, stageEl.firstChild);
            loading.style.display = "none";

            const scene = new T.Scene();
            const camera = new T.PerspectiveCamera(cfg.fov || 28, 1.6, 0.1, 120);
            const raycaster = new T.Raycaster();
            const plane = new T.Plane(new T.Vector3(0, 0, -1), 1.2);
            const pickables = [];
            const frameFns = [];
            const target = new T.Vector3().fromArray(cfg.target || [0, 1.8, 0]);
            const views = Object.assign({ three: [0.6, 1.15], front: [0, 1.5], top: [0, 0.22], side: [1.5, 1.45] }, cfg.views || {});
            const home = views[cfg.home || "three"];
            const cam = { yaw: home[0], phi: home[1], r: 14, tyaw: home[0], tp: home[1], tr: 14, spin: cfg.sway !== false, fitted: false };
            const sway = cfg.sway || [home[0], 0.4];
            let fit = 14;
            let t = 0;
            let selected = null;

            // soft studio environment so metals and glass have something to reflect
            const envS = new T.Scene();
            const eg = new T.SphereGeometry(30, 24, 16);
            const ec = [];
            const ep = eg.attributes.position;
            const c1 = new T.Color(0x0d1530);
            const c2 = new T.Color(0x6f89d8);

            for (let i = 0; i < ep.count; i++) {

                const c = c1.clone().lerp(c2, (ep.getY(i) / 30 + 1) / 2);

                ec.push(c.r, c.g, c.b);
            }

            eg.setAttribute("color", new T.Float32BufferAttribute(ec, 3));
            envS.add(new T.Mesh(eg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));

            [[0, 12, 6, 14, 6], [-14, 4, 4, 5, 10], [14, 3, -4, 5, 10]].forEach(function (b) {

                const q = new T.Mesh(new T.PlaneGeometry(b[3], b[4]), new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide }));

                q.position.set(b[0], b[1], b[2]);
                q.lookAt(0, 0, 0);
                envS.add(q);
            });

            const pm = new T.PMREMGenerator(renderer);

            scene.environment = pm.fromScene(envS, 0.03).texture;
            pm.dispose();

            scene.add(new T.HemisphereLight(0xcfdcff, 0x16204a, 0.7));

            const key = new T.DirectionalLight(0xffffff, 1.6);

            key.position.set(5, 9, 7);
            scene.add(key);

            const rim = new T.DirectionalLight(0x54e0c7, 0.7);

            rim.position.set(-7, 4, -6);
            scene.add(rim);

            const api = { T: T, scene: scene, camera: camera, renderer: renderer, stage: stageEl, plane: plane, pickables: pickables, cam: cam, target: target, labelLayer: labelLayer };

            api.mat = function (hex, o) {

                const m = new T.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.45, metalness: 0.1 }, o || {}));

                m.userData.base = new T.Color(hex);

                return m;
            };

            api.glass = function (hex, opacity, clip) {

                const m = new T.MeshPhysicalMaterial({ color: hex, transparent: true, opacity: opacity, roughness: 0.12, metalness: 0, side: T.DoubleSide, depthWrite: false, clippingPlanes: clip === false ? [] : [plane] });

                m.userData.base = new T.Color(hex);

                return m;
            };

            api.box = function (w, h, d, mat, x, y, z) {

                const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);

                m.position.set(x || 0, y || 0, z || 0);

                return m;
            };

            // register meshes as one clickable part
            api.part = function (group, key, meshes, mats, weak) {

                meshes = Array.isArray(meshes) ? meshes : [meshes];

                const p = { key: key, meshes: meshes, mats: mats || [meshes[0].material], weak: !!weak };

                meshes.forEach(function (m) {

                    m.userData.part = p;

                    if (!m.parent) { group.add(m); }

                    pickables.push(m);
                });

                return p;
            };

            api.dispose = function (obj) {

                obj.traverse(function (o) {

                    const i = pickables.indexOf(o);

                    if (i >= 0) { pickables.splice(i, 1); }

                    if (o.geometry) { o.geometry.dispose(); }
                });

                if (obj.parent) { obj.parent.remove(obj); }
            };

            api.shadow = function (group, w, d) {

                const c = document.createElement("canvas");

                c.width = c.height = 128;

                const x = c.getContext("2d");
                const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);

                g.addColorStop(0, "rgba(0,0,0,.55)");
                g.addColorStop(1, "rgba(0,0,0,0)");
                x.fillStyle = g;
                x.fillRect(0, 0, 128, 128);

                const s = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }));

                s.rotation.x = -Math.PI / 2;
                s.position.y = 0.01;
                group.add(s);

                return s;
            };


            // ---- small builders so scene files stay short ----
            const tm = new T.Matrix4();
            const tq = new T.Quaternion();
            const te = new T.Euler();
            const tp = new T.Vector3();
            const ts = new T.Vector3();
            const tc = new T.Color();

            api.inst = function (n, geo, mat) {

                const im = new T.InstancedMesh(geo, mat, n);
                const o = { mesh: im, n: n };

                o.set = function (i, x, y, z, k) {

                    k = k === undefined ? 1 : k;
                    tp.set(x, y, z);
                    ts.set(k, k, k);
                    tq.identity();
                    tm.compose(tp, tq, ts);
                    im.setMatrixAt(i, tm);
                };

                o.xform = function (i, x, y, z, rx, ry, rz, sx, sy, sz) {

                    tp.set(x, y, z);
                    ts.set(sx === undefined ? 1 : sx, sy === undefined ? 1 : sy, sz === undefined ? 1 : sz);
                    te.set(rx || 0, ry || 0, rz || 0);
                    tq.setFromEuler(te);
                    tm.compose(tp, tq, ts);
                    im.setMatrixAt(i, tm);
                };

                o.hide = function (i) { tm.makeScale(0.0001, 0.0001, 0.0001); im.setMatrixAt(i, tm); };
                o.color = function (i, c) { im.setColorAt(i, tc.set(c)); };
                o.flush = function () { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) { im.instanceColor.needsUpdate = true; } };

                for (let i = 0; i < n; i++) { o.hide(i); }

                o.flush();

                return o;
            };

            api.cyl = function (r1, r2, h, mat, x, y, z, seg, open) {

                const m = new T.Mesh(new T.CylinderGeometry(r1, r2, h, seg || 28, 1, !!open), mat);

                m.position.set(x || 0, y || 0, z || 0);

                return m;
            };

            api.sph = function (r, mat, x, y, z, seg) {

                const m = new T.Mesh(new T.SphereGeometry(r, seg || 18, Math.max(8, (seg || 18) - 4)), mat);

                m.position.set(x || 0, y || 0, z || 0);

                return m;
            };

            api.tube = function (pts, r, mat, segs, closed) {

                const c = new T.CatmullRomCurve3(pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }), !!closed);

                return new T.Mesh(new T.TubeGeometry(c, segs || 40, r, 8, !!closed), mat);
            };

            api.lineSeg = function (pts, hex, opacity) {

                const g = new T.BufferGeometry();

                g.setAttribute("position", new T.Float32BufferAttribute(pts, 3));

                return new T.LineSegments(g, new T.LineBasicMaterial({ color: hex, transparent: true, opacity: opacity === undefined ? 0.6 : opacity }));
            };

            // a thick arrow from a to b
            api.arrow = function (a, b, hex, r) {

                const g = new T.Group();
                const d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
                const len = d.length();
                const m = new T.MeshStandardMaterial({ color: hex, roughness: 0.4 });
                const sh = new T.Mesh(new T.CylinderGeometry(r || 0.04, r || 0.04, Math.max(0.01, len - 0.25), 10), m);
                const hd = new T.Mesh(new T.ConeGeometry((r || 0.04) * 2.6, 0.25, 12), m);

                sh.position.y = (len - 0.25) / 2;
                hd.position.y = len - 0.125;
                g.add(sh);
                g.add(hd);
                g.position.set(a[0], a[1], a[2]);
                g.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());

                return g;
            };

            api.disc = function (r, h, mat, x, y, z) { return api.cyl(r, r, h, mat, x, y, z, 64); };

            api.label = function (text) {

                const d = document.createElement("div");

                d.textContent = text;
                d.style.cssText = "position:absolute;transform:translate(-50%,-50%);font-size:12px;font-weight:700;color:#f5f7ff;background:rgba(10,16,36,.7);padding:2px 8px;border-radius:999px;white-space:nowrap;border:1px solid rgba(255,255,255,.2)";
                labelLayer.appendChild(d);

                const v = new T.Vector3();
                const o = { el: d, set: function (s) { d.textContent = s; }, at: null };

                o.place = function () {

                    if (!o.at) { return; }

                    const w = renderer.domElement.clientWidth;
                    const h = renderer.domElement.clientHeight;
                    const p = o.at();

                    v.set(p[0], p[1], p[2]).project(camera);

                    if (v.z > 1) { d.style.display = "none"; return; }

                    d.style.display = "";
                    d.style.left = ((v.x + 1) / 2 * w + (p[3] || 0)) + "px";
                    d.style.top = ((1 - v.y) / 2 * h + (p[4] || 0)) + "px";
                };

                api.labels.push(o);

                return o;
            };

            api.labels = [];

            api.select = function (part) {

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
            };

            api.selected = function () { return selected; };

            api.onFrame = function (fn) { frameFns.push(fn); };

            api.preset = function (name) {

                const p = views[name];

                if (!p) { return; }

                cam.spin = false;
                cam.tyaw = p[0];
                cam.tp = p[1];
                cam.tr = fit;
            };

            api.resetView = function () {

                cam.spin = cfg.sway !== false;
                cam.tyaw = home[0];
                cam.tp = home[1];
                cam.tr = fit;
            };

            function resize() {

                const w = Math.max(200, stageEl.clientWidth);
                const h = Math.max(200, stageEl.clientHeight);

                renderer.setSize(w, h, false);
                renderer.domElement.style.width = "100%";
                renderer.domElement.style.height = "100%";
                camera.aspect = w / h;
                camera.updateProjectionMatrix();

                const half = Math.tan(camera.fov * Math.PI / 360);

                fit = Math.max(cfg.minFit || 9, (cfg.halfWidth || 5.5) / (half * Math.min(camera.aspect, 1.9)), (cfg.halfHeight || 2.8) / half);

                if (!cam.fitted || cam.autoFit) { cam.r = cam.tr = fit; cam.fitted = true; cam.autoFit = true; }
            }

            function pickAt(clientX, clientY) {

                const r = renderer.domElement.getBoundingClientRect();
                const v = new T.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);

                raycaster.setFromCamera(v, camera);

                const hits = raycaster.intersectObjects(pickables, false);
                let weak = null;

                for (let i = 0; i < hits.length; i++) {

                    const o = hits[i].object;
                    const part = o.userData.part;

                    if (!part) { continue; }

                    const mat = o.material;

                    if (mat.clippingPlanes && mat.clippingPlanes.length && plane.distanceToPoint(hits[i].point) < 0) { continue; }

                    if (part.weak) { weak = weak || part; continue; }

                    api.lastHit = hits[i];
                    return part;
                }

                return weak;
            }

            api.pickAt = pickAt;

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
                stageEl.style.cursor = "grabbing";

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

                    if (pinch > 0) { cam.autoFit = false; cam.tr = clamp(cam.tr * (pinch / d), fit * 0.3, fit * 1.35); cam.r = cam.tr; }

                    pinch = d;

                    if (down) { down.moved = true; }

                    return;
                }

                if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) { down.moved = true; }

                cam.yaw -= (e.clientX - prev.x) * 0.008;
                cam.phi = clamp(cam.phi - (e.clientY - prev.y) * 0.006, 0.18, 1.52);
                cam.tyaw = cam.yaw;
                cam.tp = cam.phi;
            });

            function up(e) {

                const wasDown = down;

                pts.delete(e.pointerId);
                pinch = 0;
                stageEl.style.cursor = "grab";

                if (pts.size === 0 && wasDown && !wasDown.moved && e.type === "pointerup") {

                    const part = pickAt(e.clientX, e.clientY);

                    api.select(part);

                    if (cfg.onPick) { cfg.onPick(part); }
                }

                if (pts.size === 0) { down = null; }
            }

            el.addEventListener("pointerup", up);
            el.addEventListener("pointercancel", up);

            el.addEventListener("wheel", function (e) {

                e.preventDefault();
                cam.spin = false;
                cam.autoFit = false;
                cam.tr = clamp(cam.tr * (1 + e.deltaY * 0.001), fit * 0.3, fit * 1.35);
            }, { passive: false });

            if (window.ResizeObserver) { new ResizeObserver(resize).observe(stageEl); } else { window.addEventListener("resize", resize); }

            resize();

            function loop(dt) {

                t += dt;

                if (cam.spin) { cam.yaw = sway[0] + sway[1] * Math.sin(t * 0.45); cam.tyaw = cam.yaw; }

                const k = Math.min(1, dt * 6);

                cam.yaw += (cam.tyaw - cam.yaw) * k;
                cam.phi += (cam.tp - cam.phi) * k;
                cam.r += (cam.tr - cam.r) * k;

                const sp = Math.sin(cam.phi);

                camera.position.set(target.x + cam.r * sp * Math.sin(cam.yaw), target.y + cam.r * Math.cos(cam.phi), target.z + cam.r * sp * Math.cos(cam.yaw));
                camera.lookAt(target);

                for (let i = 0; i < frameFns.length; i++) { frameFns[i](dt, t); }

                for (let i = 0; i < api.labels.length; i++) { api.labels[i].place(); }

                renderer.render(scene, camera);
            }

            api.start = function () {

                M.animate(root, loop);
                loop(0);
            };

            api.time = function () { return t; };

            return api;
        });
    }


    // ------------------------------------------------------------------
    // A declarative way to make a whole 3D lesson scene: the page markup,
    // controls, readouts, click-for-info, rewards and the render loop are
    // all wired here, so a scene file only supplies the geometry and the
    // physics. See the scene files for examples.
    // ------------------------------------------------------------------
    const VIEW_LABELS = { three: "3/4 view", front: "Front", top: "Top", side: "Side", close: "Close up" };

    function define(name, cfg) {

        F.SIMS[name] = function (root) {

            const state = Object.assign({}, cfg.defaults || {});
            const defaults = Object.assign({}, state);
            const ctx = { root: root, state: state, cfg: cfg, S: null, seen: {}, data: {}, hit: false };
            const sliders = [];

            ctx.out = function (k, t) { M.out(root, k, t); };
            ctx.say = function (t) { M.out(root, "info", t); };
            ctx.mark = function (k) { ctx.seen[k] = true; };
            ctx.count = function () { return Object.keys(ctx.seen).length; };

            let h = M.head(cfg.title) + stageHTML(cfg.stage && cfg.stage.height);

            h += '<div class="fd-stat-row">' + (cfg.stats || []).map(function (s) { return M.stat(s[0], s[1]); }).join("") + "</div>";
            h += '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>';
            h += '<p class="fd-sim-note" data-out="info" style="min-height:4.2em"></p>';

            const sl = [];

            (cfg.controls || []).forEach(function (c) {

                if (c.seg) {

                    h += M.seg(c.label, c.seg, c.options);

                } else if (c.actions) {

                    h += '<div class="fd-seg"><span class="fd-seg-label">' + (c.label || "Try") + "</span>" + c.actions.map(function (a) { return '<button type="button" class="fd-sim-btn" data-act="' + a[0] + '">' + a[1] + "</button>"; }).join("") + "</div>";

                } else if (c.views) {

                    h += '<div class="fd-seg"><span class="fd-seg-label">View</span>' + c.views.map(function (v) { return '<button type="button" class="fd-sim-btn" data-view="' + v + '">' + (VIEW_LABELS[v] || v) + "</button>"; }).join("") + "</div>";

                } else if (c.slider) {

                    sl.push(F.slider({ label: c.label, key: c.slider, min: c.min, max: c.max, step: c.step, value: state[c.slider] }));
                    sliders.push(c);
                }
            });

            if (sl.length) { h += '<div class="fd-sim-controls">' + sl.join("") + "</div>"; }

            if (cfg.formula) { h += '<p class="fd-sim-formula">' + cfg.formula + "</p>"; }

            root.innerHTML = h;

            function refresh() {

                sliders.forEach(function (c) { M.setVal(root, c.slider, c.fmt ? c.fmt(state[c.slider], ctx) : state[c.slider]); });

                const r = cfg.read ? cfg.read(ctx) : null;

                if (r) { Object.keys(r).forEach(function (k) { M.out(root, k, r[k]); }); }

                if (!ctx.hit && cfg.reward && cfg.reward.when(ctx)) {

                    ctx.hit = true;
                    F.reward(name, 10, cfg.reward.msg);
                }
            }

            ctx.refresh = refresh;

            root.querySelectorAll("[data-act]").forEach(function (b) {

                b.addEventListener("click", function () {

                    if (cfg.act) { cfg.act(ctx, b.dataset.act); }

                    refresh();
                });
            });

            root.querySelectorAll("[data-view]").forEach(function (b) {

                b.addEventListener("click", function () { if (ctx.S) { ctx.S.preset(b.dataset.view); } });
            });

            root.querySelector("[data-reset]").addEventListener("click", function () {

                if (cfg.reset) { cfg.reset(ctx); }

                if (ctx.S) { ctx.S.select(null); ctx.S.resetView(); }

                ctx.say(cfg.intro || "");
                refresh();
            });

            let prev = Object.assign({}, state);

            M.wire(root, state, defaults, function () {

                const changed = Object.keys(state).filter(function (k) { return state[k] !== prev[k]; });

                prev = Object.assign({}, state);

                if (cfg.onChange && ctx.S && changed.length) { cfg.onChange(ctx, changed); }

                refresh();
            });

            ctx.say(cfg.intro || "");
            refresh();

            create(root, Object.assign({}, cfg.stage || {}, {

                onPick: function (part) {

                    if (!part) { return; }

                    ctx.mark(part.key);

                    const i = cfg.info ? cfg.info[part.key] : null;
                    const text = typeof i === "function" ? i(ctx, part) : i;

                    if (text) { ctx.say(text); }

                    refresh();
                }

            })).then(function (S) {

                ctx.S = S;
                cfg.build(ctx);
                S.onFrame(function (dt, t) {

                    if (cfg.frame) { cfg.frame(ctx, dt, t); }

                    refresh();
                });
                S.start();

            }).catch(function () { });
        };
    }

    F.three = { load: load, stageHTML: stageHTML, create: create, define: define };

})();
