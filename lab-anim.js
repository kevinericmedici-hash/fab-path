/* ========================================
   VIRTUAL FAB LAB: LIVE ANIMATIONS (shared)

   Visual, interactive pieces for the lab step pages:
     stack3d       a layer stack you can rotate and pull apart, made from the drawn layers
     processBox    a movie of one layer being patterned (spin, bake, expose, develop,
                   deposit, lift off or etch) that reacts to dose, develop time and polarity
     buildMovie    the finished device built up layer by layer, with the real misalignment
     playbox       a scrubbable "inside the device" animation with a live curve (used by the
                   per-course modules in lab-anim-kinds.js)

   Needs window.LabEngine, window.LabGeom and window.SCLab.
======================================== */

(function (root) {

    "use strict";

    const E = root.LabEngine;
    const G = root.LabGeom;
    const SC = root.SCLab;

    const LW = 600;

    const reduce = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const all = [];


    /* ------------------------------------------------
       SMALL TOOLS
    ------------------------------------------------ */

    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

    function lerp(a, b, u) { return a + (b - a) * u; }

    function ease(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }

    function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

    function hexRgb(hex) {

        const n = parseInt(hex.replace("#", ""), 16);

        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function rgba(hex, a, k) {

        const c = hexRgb(hex);
        const m = k === undefined ? 1 : k;

        return "rgba(" + Math.round(clamp(c[0] * m, 0, 255)) + "," + Math.round(clamp(c[1] * m, 0, 255)) + "," + Math.round(clamp(c[2] * m, 0, 255)) + "," + a + ")";
    }

    function text(ctx, str, x, y, color, size, align) {

        ctx.font = (size || 12) + "px Inter, Arial, sans-serif";
        ctx.fillStyle = color || "#cbd2e3";
        ctx.textAlign = align || "left";
        ctx.fillText(str, x, y);
    }

    function rrect(ctx, x, y, w, h, r) {

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function h(tag, attrs, kids) {

        const node = document.createElement(tag);

        Object.keys(attrs || {}).forEach(function (k) {

            const v = attrs[k];

            if (v === undefined || v === null || v === false) { return; }

            if (k === "className") { node.className = v; }
            else if (k === "text") { node.textContent = v; }
            else if (k.indexOf("on") === 0) { node.addEventListener(k.slice(2), v); }
            else { node.setAttribute(k, v === true ? "" : v); }
        });

        (kids || []).forEach(function (c) {

            if (c === null || c === undefined || c === false) { return; }

            node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
        });

        return node;
    }


    /* ------------------------------------------------
       THE LOOP
    ------------------------------------------------ */

    function makeLoop(canvas, o) {

        const holder = canvas.parentNode;
        const LH = Math.round(LW * (o.ratio || 0.5));
        const maxW = o.maxW || 720;

        let W = LW;
        let raf = 0;
        let last = 0;
        let t = 0;
        let visible = true;
        let stopped = false;
        let wake = reduce ? 2 : Infinity;

        const ctx = canvas.getContext("2d");

        function size() {

            const w = Math.max(240, Math.min(holder && holder.clientWidth ? holder.clientWidth : LW, maxW));
            const dpr = root.devicePixelRatio || 1;

            W = w;

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(w * LH / LW * dpr);
            canvas.style.width = w + "px";
            canvas.style.height = Math.round(w * LH / LW) + "px";
        }

        function paint(dt) {

            const dpr = root.devicePixelRatio || 1;
            const s = W / LW * dpr;

            ctx.setTransform(s, 0, 0, s, 0, 0);
            ctx.clearRect(0, 0, LW, LH);
            o.draw(ctx, t, dt, LH);
        }

        function frame(now) {

            raf = 0;

            if (stopped || !canvas.isConnected) { stop(); return; }

            const hw = holder && holder.clientWidth ? Math.min(holder.clientWidth, maxW) : 0;

            if (hw && Math.abs(Math.max(240, hw) - W) > 1) { size(); }

            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));

            last = now;

            const running = wake === Infinity || t < wake;

            if (visible && running) { t += dt; paint(dt); }

            if (running) { schedule(); }
        }

        function schedule() { if (!raf && !stopped) { last = performance.now(); raf = root.requestAnimationFrame(frame); } }

        function stop() { stopped = true; if (raf) { root.cancelAnimationFrame(raf); raf = 0; } }

        size();

        if (root.IntersectionObserver) {

            const io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible) { schedule(); } });

            io.observe(canvas);
        }

        if (root.ResizeObserver && holder) {

            let tm = 0;
            const ro = new ResizeObserver(function () { clearTimeout(tm); tm = setTimeout(function () { size(); paint(0); }, 40); });

            ro.observe(holder);
        }

        paint(0);
        schedule();

        const api = {
            stop: stop,
            redraw: function () { paint(0); },
            wake: function (sec) { if (reduce) { wake = t + (sec || 3); } schedule(); },
            time: function () { return t; },
            toLogical: function (e) {

                const r = canvas.getBoundingClientRect();

                return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * LH };
            },
            LH: LH
        };

        all.push(api);

        return api;
    }

    function stopAll() { all.splice(0).forEach(function (a) { a.stop(); }); }

    function frameBox(label, sticky) {

        const canvas = h("canvas", { role: "img", "aria-label": label });
        const info = h("p", { className: "la-status", text: "" });
        const wrap = h("div", { className: "la-canvas-wrap" }, [canvas]);

        return { canvas: canvas, info: info, wrap: wrap, say: function (t) { info.textContent = t; }, sticky: !!sticky };
    }


    /* ------------------------------------------------
       1. THE LAYER STACK IN 3D
    ------------------------------------------------ */

    function stack3dBox(getDesign) {

        const fb = frameBox("A 3D view of the layer stack. Drag to rotate.", false);
        const state = { yaw: -0.6, pitch: 0.95, explode: 1, hidden: {}, auto: true, dragging: false, hl: null, zoom: 1 };

        const chips = h("div", { className: "la-chips" });

        let sigNow = "";
        let geo = [];

        const lp = makeLoop(fb.canvas, { ratio: 0.62, draw: draw });

        function signature(d) {

            return d.layers.map(function (l) { return l.id + ":" + l.role + ":" + l.mode + ":" + l.thickness + ":" + l.shapes.length + ":" + JSON.stringify(l.shapes).length; }).join("|");
        }

        function rebuild(d) {

            geo = d.layers.map(function (l) {

                const polys = [];

                G.applyCuts(E.effectiveShapes ? E.effectiveShapes(d, l) : l.shapes).forEach(function (s) { if (!s.cut) { G.polysOf(s).forEach(function (p) { polys.push(p); }); } });

                return { id: l.id, l: l, polys: polys };
            });

            // The common outline for films with windows.
            let x0 = Infinity;
            let y0 = Infinity;
            let x1 = -Infinity;
            let y1 = -Infinity;

            geo.forEach(function (gl) { gl.polys.forEach(function (p) { p.forEach(function (q) { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }); }); });

            if (!isFinite(x0)) { x0 = 0; y0 = 0; x1 = 100; y1 = 100; }

            const mx = (x1 - x0) * 0.04 + 5;
            const my = (y1 - y0) * 0.04 + 5;

            geo.box = { x0: x0 - mx, y0: y0 - my, x1: x1 + mx, y1: y1 + my };

            // Chips to hide or show each layer.
            chips.innerHTML = "";

            d.layers.forEach(function (l, k) {

                if (!l.shapes.length) { return; }

                const b = h("button", {
                    type: "button", className: "la-chip" + (state.hidden[l.id] ? " off" : ""),
                    onclick: function () { state.hidden[l.id] = !state.hidden[l.id]; b.classList.toggle("off", !!state.hidden[l.id]); lp.wake(2); },
                    onmouseenter: function () { state.hl = l.id; lp.wake(2); },
                    onmouseleave: function () { state.hl = null; }
                }, [h("span", { className: "la-swatch", style: "background:" + E.ROLES[l.role].color }), (k + 1) + ". " + l.name]);

                chips.appendChild(b);
            });
        }

        function draw(ctx, t, dt, LH) {

            const d = getDesign();

            if (!d) { return; }

            const s = signature(d);

            if (s !== sigNow) { sigNow = s; rebuild(d); }

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            if (state.auto && !state.dragging) { state.yaw += dt * 0.28; }

            const bx = geo.box;
            const cx = (bx.x0 + bx.x1) / 2;
            const cy = (bx.y0 + bx.y1) / 2;
            const span = Math.max(bx.x1 - bx.x0, bx.y1 - bx.y0, 1);
            const cosY = Math.cos(state.yaw);
            const sinY = Math.sin(state.yaw);
            const sinP = Math.sin(state.pitch);
            const cosP = Math.cos(state.pitch);

            const used = d.layers.filter(function (l) { return l.shapes.length && !state.hidden[l.id]; });
            const gap = span * 0.07 * state.explode;
            const scale = Math.min(LW * 0.72 / (span * 1.15), LH * 0.78 / (span * (0.55 * sinP + 0.15 + (used.length * (gap + span * 0.03)) / span * cosP + 0.2))) * state.zoom;

            const ox = LW / 2;
            const oy = LH * 0.58;

            const proj = function (x, y, z) {

                const rx = (x - cx) * cosY - (y - cy) * sinY;
                const ry = (x - cx) * sinY + (y - cy) * cosY;

                return [ox + rx * scale, oy + (ry * sinP - z * cosP) * scale, ry];
            };

            // A floor grid under the stack.
            ctx.strokeStyle = "rgba(255,255,255,0.07)";
            ctx.lineWidth = 1;

            for (let k = 0; k <= 8; k++) {

                const u = bx.x0 - span * 0.1 + (span * 1.2) * k / 8;
                const a = proj(u, bx.y0 - span * 0.1, 0);
                const b = proj(u, bx.y1 + span * 0.1, 0);
                const c2 = proj(bx.x0 - span * 0.1, bx.y0 - span * 0.1 + (span * 1.2) * k / 8, 0);
                const e = proj(bx.x1 + span * 0.1, bx.y0 - span * 0.1 + (span * 1.2) * k / 8, 0);

                ctx.beginPath();
                ctx.moveTo(a[0], a[1]);
                ctx.lineTo(b[0], b[1]);
                ctx.moveTo(c2[0], c2[1]);
                ctx.lineTo(e[0], e[1]);
                ctx.stroke();
            }

            let z = 0;

            geo.forEach(function (gl, idx) {

                const l = gl.l;

                if (!l.shapes.length || state.hidden[l.id]) { return; }

                const hv = span * (0.012 + 0.012 * Math.log10(1 + l.thickness * 4));
                const z0 = z;
                const z1 = z + hv;

                z = z1 + gap;

                const hl = state.hl === l.id;
                const color = E.ROLES[l.role].color;
                const cut = l.mode === "cut";

                const polys = cut ? [[[bx.x0, bx.y0], [bx.x1, bx.y0], [bx.x1, bx.y1], [bx.x0, bx.y1]]].concat(gl.polys) : gl.polys;

                // Side faces, far ones first.
                const sides = [];
                let edges = 0;

                polys.forEach(function (p) { edges += p.length; });

                if (edges < 5000) {

                    polys.forEach(function (p) {

                        for (let k = 0; k < p.length; k++) {

                            const a = p[k];
                            const b = p[(k + 1) % p.length];
                            const mid = proj((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z0);

                            sides.push({ a: a, b: b, depth: mid[2] });
                        }
                    });

                    sides.sort(function (m, n) { return n.depth - m.depth; });

                    sides.forEach(function (sd) {

                        const p0 = proj(sd.a[0], sd.a[1], z0);
                        const p1 = proj(sd.b[0], sd.b[1], z0);
                        const p2 = proj(sd.b[0], sd.b[1], z1);
                        const p3 = proj(sd.a[0], sd.a[1], z1);

                        const nx = sd.b[1] - sd.a[1];
                        const ny = sd.a[0] - sd.b[0];
                        const shade = 0.55 + 0.35 * (nx * cosY * 0.7 - ny * sinY * 0.7 + ny * cosY * 0.3) / Math.max(Math.hypot(nx, ny), 1e-6);

                        ctx.beginPath();
                        ctx.moveTo(p0[0], p0[1]);
                        ctx.lineTo(p1[0], p1[1]);
                        ctx.lineTo(p2[0], p2[1]);
                        ctx.lineTo(p3[0], p3[1]);
                        ctx.closePath();
                        ctx.fillStyle = rgba(color, 0.9, clamp(shade, 0.35, 1));
                        ctx.fill();
                    });
                }

                // Top face with the windows cut out.
                ctx.beginPath();

                polys.forEach(function (p) {

                    p.forEach(function (q, k) {

                        const pq = proj(q[0], q[1], z1);

                        if (k === 0) { ctx.moveTo(pq[0], pq[1]); } else { ctx.lineTo(pq[0], pq[1]); }
                    });

                    ctx.closePath();
                });

                ctx.fillStyle = rgba(color, cut ? 0.55 : 0.92, hl ? 1.25 : 1.05);
                ctx.fill("evenodd");
                ctx.lineWidth = hl ? 2 : 0.8;
                ctx.strokeStyle = hl ? "#ffffff" : "rgba(255,255,255,0.35)";
                ctx.stroke();

                // Pads get a bright mark.
                l.shapes.forEach(function (sh) {

                    if (sh.t === "r" && sh.pad) {

                        const c = proj(sh.x + sh.w / 2, sh.y + sh.h / 2, z1);

                        text(ctx, sh.pad, c[0], c[1] + 3, "#0b1020", 10, "center");
                    }
                });

                // Label at the right-hand edge.
                const lab = proj(bx.x1, cy, (z0 + z1) / 2);

                text(ctx, (idx + 1) + "  " + l.name, Math.min(lab[0] + 14, LW - 6), lab[1], "#cbd2e3", 10, lab[0] + 14 > LW - 120 ? "right" : "left");
            });

            text(ctx, "drag to rotate · the layers are drawn thicker than they are", 10, LH - 8, "#8791ab", 10);
        }

        let px = 0;
        let py = 0;

        fb.canvas.style.touchAction = "none";
        fb.canvas.addEventListener("pointerdown", function (e) { state.dragging = true; px = e.clientX; py = e.clientY; fb.canvas.setPointerCapture(e.pointerId); lp.wake(4); });
        fb.canvas.addEventListener("pointermove", function (e) {

            if (!state.dragging) { return; }

            state.yaw += (e.clientX - px) * 0.012;
            state.pitch = clamp(state.pitch + (e.clientY - py) * 0.008, 0.25, 1.45);
            px = e.clientX;
            py = e.clientY;
            lp.wake(2);
        });
        fb.canvas.addEventListener("pointerup", function () { state.dragging = false; });
        fb.canvas.addEventListener("wheel", function (e) { e.preventDefault(); state.zoom = clamp(state.zoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.5, 2.5); lp.wake(2); }, { passive: false });

        const explode = h("input", { type: "range", min: "0", max: "3", step: "0.05", value: "1", "aria-label": "Pull the layers apart" });

        explode.addEventListener("input", function () { state.explode = Number(explode.value); lp.wake(2); });

        const auto = h("input", { type: "checkbox", checked: true });

        auto.addEventListener("change", function () { state.auto = auto.checked; lp.wake(2); });

        const box = h("div", { className: "la-box" }, [
            fb.wrap,
            fb.info,
            h("div", { className: "la-controls" }, [
                h("label", { className: "la-ctl" }, [h("span", { text: "Pull apart" }), explode]),
                h("label", { className: "la-ctl" }, [auto, h("span", { text: "Turn slowly" })])
            ]),
            chips
        ]);

        fb.say("Your drawn layers as a stack. Drag to rotate, scroll to zoom, hover a layer name to highlight it, click it to hide it.");

        return { box: box, stop: lp.stop };
    }


    /* ------------------------------------------------
       2. THE PROCESS MOVIE FOR ONE LAYER
    ------------------------------------------------ */

    const MATERIAL_COLOR = { au: "#e8c06a", pt: "#d8dce6", cu: "#d98a4a", al: "#b7bcc9", ti: "#9aa3b5", ito: "#8fd0e0", agcl: "#c9ced8", gc: "#4a4f5c" };

    function layerFilm(l) {

        if (l.role === "collector") { return MATERIAL_COLOR[l.material] || "#e8c06a"; }

        return E.ROLES[l.role].color;
    }

    function processBox(getDesign) {

        const fb = frameBox("A movie of one layer being patterned", true);
        const st = { id: "", u: 0, playing: true, scrub: false, t0: 0 };

        const sel = h("select", { className: "lab-select", "aria-label": "Layer to watch" });
        const scrub = h("input", { type: "range", min: "0", max: "1000", value: "0", "aria-label": "Scrub through the process" });
        const playBtn = h("button", { type: "button", className: "lab-btn small", text: "Pause" });

        let listSig = "";

        function layers() {

            const d = getDesign();

            return d ? d.layers.filter(function (l) { return l.shapes.length; }) : [];
        }

        function refreshList() {

            const ls = layers();
            const sg = ls.map(function (l) { return l.id + l.name; }).join("|");

            if (sg === listSig) { return; }

            listSig = sg;
            sel.innerHTML = "";

            ls.forEach(function (l, k) { sel.appendChild(h("option", { value: l.id, text: "Layer " + (k + 1) + ": " + l.name })); });

            if (!ls.some(function (l) { return l.id === st.id; })) { st.id = ls.length ? ls[0].id : ""; }

            sel.value = st.id;
        }

        sel.addEventListener("change", function () { st.id = sel.value; st.u = 0; lp.wake(20); });

        playBtn.addEventListener("click", function () { st.playing = !st.playing; playBtn.textContent = st.playing ? "Pause" : "Play"; lp.wake(20); });

        scrub.addEventListener("input", function () { st.u = Number(scrub.value) / 1000; st.playing = false; playBtn.textContent = "Play"; lp.wake(3); });

        // The steps of the process, depending on how this layer is made.
        function plan(l) {

            const photo = E.isPhoto(l);
            const lt = l.litho;

            if (photo && E.isPyro && E.isPyro(l)) { return ["spin", "bake", "expose", "develop", "pyro"]; }
            if (photo) { return ["spin", "bake", "expose", "develop"]; }
            if (lt.method === "etch") { return ["film", "spin", "bake", "expose", "develop", "etch", "strip"]; }

            return ["spin", "bake", "expose", "develop", "film", "lift"];
        }

        const NAMES = {
            spin: "Spin on photoresist", bake: "Soft bake", expose: "Expose through the mask", develop: "Develop", film: "Deposit the material",
            lift: "Lift off the resist", etch: "Etch away the unprotected film", strip: "Strip the resist",
            pyro: "Pyrolyse the SU-8 into glassy carbon"
        };

        function draw(ctx, t, dt, LH) {

            refreshList();

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            const l = layers().filter(function (x) { return x.id === st.id; })[0];

            if (!l) { text(ctx, "Draw something on a layer to watch it being made.", LW / 2, LH / 2, "#8791ab", 13, "center"); return; }

            const sheet = E.sheetSpec ? E.sheetSpec(l, getDesign()) : (E.SHEET_ROLES && E.SHEET_ROLES[l.role]);

            if (sheet) {

                // Split the hint at word boundaries into lines of about 92 characters.
                const lines = [""];

                sheet.hint.split(" ").forEach(function (w) {

                    if ((lines[lines.length - 1] + " " + w).length > 92) { lines.push(w); } else { lines[lines.length - 1] = (lines[lines.length - 1] + " " + w).trim(); }
                });

                text(ctx, l.name, LW / 2, LH / 2 - 14, "#e8edf8", 14, "center");
                lines.slice(0, 3).forEach(function (t, k) { text(ctx, t, LW / 2, LH / 2 + 8 + 16 * k, "#9fb2c8", 11, "center"); });

                return;
            }

            const steps = plan(l);
            const nS = steps.length;
            const m = E.layerMetrics(l);
            const pat = E.patterning(l, m);
            const lt = l.litho;
            const rs = SC.RESISTS[lt.resist];
            const photo = E.isPhoto(l);
            const tr = lt.tResist;
            const r = lt.dose / rs.dose(tr);
            const rd = lt.dev / rs.dev(tr);
            const negative = rs.tone === "negative";

            // Advance the clock.
            if (st.playing) { st.u += dt / (nS * 2.4 + 2.2); if (st.u >= 1) { st.u = 0; } scrub.value = String(Math.round(st.u * 1000)); }

            const total = nS + 0.9;
            const pos = clamp(st.u * total, 0, nS - 0.0001);
            const k = Math.floor(pos);
            const p = ease(pos - k);
            const cur = steps[k];

            // The three drawn shapes and the gaps between them, to scale.
            const f = isFinite(m.minFeature) ? m.minFeature : 10;
            const g = isFinite(m.minGap) ? m.minGap : f;
            const totalW = 3 * f + 2 * g;
            const s = 360 / totalW;
            const sv = Math.min(s, 105 / Math.max(tr, 0.01));
            const compressed = sv < s * 0.98;
            const x0 = 120;
            const y0 = 232;

            const shapes = [0, 1, 2].map(function (i) { const a = x0 + i * (f + g) * s; return [a, a + f * s]; });
            const gaps = [0, 1].map(function (i) { const a = x0 + (i * (f + g) + f) * s; return [a, a + g * s]; });

            // The mask: where does the light go?
            const lightOnShapes = l.mask.field === "dark";
            const lit = lightOnShapes ? shapes : gaps;

            // Exposure blur: over-exposure grows the exposed region, under-exposure shrinks it.
            const grow = clamp(0.5 * 0.12 * tr * (r - 1), -0.45 * Math.min(f, g), 0.45 * Math.min(f, g)) * s;
            const exposed = lit.map(function (a) { return [a[0] - grow, a[1] + grow]; });
            const depth = clamp(r / 0.75, 0.15, 1);

            // Which parts of the resist are soluble in the developer?
            const solubleIsLit = !negative;
            const trPx = tr * sv;

            const filmCol = layerFilm(l);
            const filmPx = Math.max(3, Math.min(26, l.thickness * sv));

            // The wafer, with the layers already made drawn as a faint strip.
            ctx.fillStyle = "#6c7590";
            ctx.fillRect(40, y0, 520, 56);
            ctx.fillStyle = "rgba(255,255,255,0.07)";

            for (let x = 52; x < 560; x += 16) { for (let y = y0 + 10; y < y0 + 54; y += 16) { ctx.fillRect(x, y, 2, 2); } }

            // The film, resist and result at the current moment of the movie.
            const idx = function (name) { return steps.indexOf(name); };
            const after = function (name) { const i = idx(name); return i >= 0 && k > i; };
            const during = function (name) { return cur === name; };
            const progOf = function (name) { return after(name) ? 1 : during(name) ? p : 0; };

            // Resist remaining after development, as a list of [xLeft, xRight, slope] regions.
            function resistRegions() {

                const out = [];
                const slope = (Math.log(Math.max(r, 0.05)) * 0.25 * tr * sv) * (negative ? 1 : -1);
                const under = clamp(rd - 1, 0, 1.5) * 0.08 * tr * s;

                // Regions over the whole width, split at the exposure edges.
                let edges = [x0 - 20, x0 + totalW * s + 20];

                exposed.forEach(function (e) { edges.push(e[0], e[1]); });
                edges.sort(function (a, b) { return a - b; });

                for (let i = 0; i + 1 < edges.length; i++) {

                    const mid = (edges[i] + edges[i + 1]) / 2;
                    const isLit = exposed.some(function (e) { return mid >= e[0] && mid <= e[1]; });
                    const soluble = solubleIsLit ? isLit : !isLit;

                    if (!soluble) { out.push({ a: edges[i], b: edges[i + 1], slope: slope, under: under, shallow: negative && isLit && depth < 1 ? depth : 1 }); }
                }

                return out;
            }

            const regions = resistRegions();
            const dissolve = clamp(rd, 0, 1);
            const residue = clamp(1 - rd, 0, 1) * 0.35 * trPx;

            function drawResist(alpha, withExposure) {

                const hgt = trPx * (during("bake") ? lerp(1, 0.94, p) : after("bake") ? 0.94 : 1);

                ctx.fillStyle = "rgba(190,90,210," + alpha + ")";

                // Whole film before development.
                if (!after("develop") && !during("develop")) {

                    ctx.fillRect(40, y0 - hgt * (during("spin") ? p : 1), 520, hgt * (during("spin") ? p : 1));

                    if (withExposure) {

                        // The exposed parts darken from the top down as far as the light reaches.
                        exposed.forEach(function (e) {

                            ctx.fillStyle = "rgba(255,230,120,0.55)";
                            ctx.fillRect(e[0], y0 - hgt, e[1] - e[0], hgt * depth);
                        });
                    }

                    return;
                }

                // During and after development: soluble parts dissolve away.
                const dp = after("develop") ? 1 : p;

                // Start from the whole film and take away what dissolves.
                ctx.fillRect(40, y0 - hgt, 520, hgt);

                const solubleRegions = [];
                let edges = [40, 560];

                exposed.forEach(function (e) { edges.push(e[0], e[1]); });
                edges.sort(function (a, b) { return a - b; });

                for (let i = 0; i + 1 < edges.length; i++) {

                    const mid = (edges[i] + edges[i + 1]) / 2;
                    const isLit = exposed.some(function (e) { return mid >= e[0] && mid <= e[1]; });

                    if (solubleIsLit ? isLit : !isLit) { solubleRegions.push([edges[i], edges[i + 1]]); }
                }

                // Wipe out the soluble regions, top-down, leaving residue if development is cut short.
                ctx.fillStyle = "#1c2132";

                solubleRegions.forEach(function (rg) {

                    const wipe = (hgt - residue) * dp;

                    ctx.fillRect(rg[0], y0 - hgt, rg[1] - rg[0], wipe);
                });

                // Under-exposed negative resist: the cross-linked top is all that holds, so thin lines wash off.
                // Slanted walls for badly exposed lines.
                ctx.fillStyle = "rgba(190,90,210," + alpha + ")";

                regions.forEach(function (rg) {

                    if (rg.shallow < 0.4 && dp >= 1) { ctx.fillStyle = "#1c2132"; ctx.fillRect(rg.a, y0 - hgt, rg.b - rg.a, hgt); ctx.fillStyle = "rgba(190,90,210," + alpha + ")"; }
                });

                // Sidewall slope and undercut sketched as small wedges.
                if (dp >= 0.8) {

                    ctx.fillStyle = "#1c2132";

                    regions.forEach(function (rg) {

                        if (rg.b - rg.a < 6) { return; }

                        const sl = clamp(rg.slope, -30, 30);

                        ctx.beginPath();
                        ctx.moveTo(rg.a, y0 - hgt);
                        ctx.lineTo(rg.a + Math.max(sl, 0), y0 - hgt);
                        ctx.lineTo(rg.a, y0 - hgt * 0.4 + 0);
                        ctx.closePath();
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(rg.b, y0 - hgt);
                        ctx.lineTo(rg.b - Math.max(sl, 0), y0 - hgt);
                        ctx.lineTo(rg.b, y0 - hgt * 0.4);
                        ctx.closePath();
                        ctx.fill();

                        if (rg.under > 0.5) {

                            ctx.fillRect(rg.a, y0 - rg.under * 2, rg.under, rg.under * 2);
                            ctx.fillRect(rg.b - rg.under, y0 - rg.under * 2, rg.under, rg.under * 2);
                        }
                    });
                }
            }

            // Where the film ends up: in the openings (lift-off), or under the resist (etch), or the resist itself.
            function filmRegions() {

                const out = [];

                regions.forEach(function (rg) { if (!(rg.shallow < 0.4)) { out.push([rg.a, rg.b]); } });

                return out;
            }

            const finalFilm = photo ? filmRegions() : (lt.method === "etch" ? filmRegions() : (function () {

                // Lift-off: the film lands where the resist was dissolved.
                const open = [];
                let edges = [x0 - 20, x0 + totalW * s + 20];

                exposed.forEach(function (e) { edges.push(e[0], e[1]); });
                edges.sort(function (a, b) { return a - b; });

                for (let i = 0; i + 1 < edges.length; i++) {

                    const mid = (edges[i] + edges[i + 1]) / 2;
                    const isLit = exposed.some(function (e) { return mid >= e[0] && mid <= e[1]; });

                    if (solubleIsLit ? isLit : !isLit) { open.push([edges[i], edges[i + 1]]); }
                }

                return open;
            }()));

            // Draw by step.
            if (steps[0] === "film" || photo) {

                // Etch route: the film is on the wafer before the resist.
                if (!photo && (steps[0] === "film")) {

                    const fp = progOf("film");

                    ctx.fillStyle = filmCol;
                    ctx.fillRect(40, y0 - filmPx * fp, 520, filmPx * fp);
                }
            }

            const etchProg = progOf("etch");

            if (lt.method === "etch" && !photo && after("film")) {

                // The film, minus what has been etched away.
                ctx.fillStyle = filmCol;

                const keep = finalFilm;

                if (etchProg > 0) {

                    ctx.fillStyle = "#1c2132";
                    ctx.fillRect(40, y0 - filmPx - 2, 520, filmPx + 2);
                    ctx.fillStyle = filmCol;

                    // Etching takes away the film outside the resist, from the top down.
                    ctx.fillRect(40, y0 - filmPx, 520, filmPx);
                    ctx.fillStyle = "#1c2132";

                    let prev = 40;

                    keep.concat([[560, 560]]).forEach(function (rg) { ctx.fillRect(prev, y0 - filmPx, rg[0] - prev, filmPx * etchProg); prev = rg[1]; });
                }
            }

            // The resist, when it exists.
            const showResist = !(steps.indexOf("strip") >= 0 && after("strip")) && !(steps.indexOf("lift") >= 0 && (after("lift") || during("lift") && p > 0.6));
            const resistBase = steps.indexOf("spin");

            if (resistBase >= 0 && (k >= resistBase) && showResist) {

                // For the etch route the resist sits on the film.
                if (lt.method === "etch" && !photo) {

                    ctx.save();
                    ctx.translate(0, -filmPx);
                    drawResist(0.82, during("expose") || after("expose"));
                    ctx.restore();

                } else { drawResist(0.82, during("expose") || (after("expose") && !after("develop"))); }
            }

            // Lift-off route: the film arrives over everything.
            if (steps.indexOf("film") >= 0 && lt.method !== "etch" && !photo && (during("film") || during("lift") || after("film"))) {

                const fp = progOf("film");

                ctx.fillStyle = filmCol;

                // Film in the openings.
                finalFilm.forEach(function (rg) { ctx.fillRect(rg[0], y0 - filmPx * fp, rg[1] - rg[0], filmPx * fp); });

                // Film on top of the resist, lifted off with it.
                if (!after("lift")) {

                    const lift = during("lift") ? p : 0;

                    ctx.globalAlpha = 1 - lift;
                    regions.forEach(function (rg) { ctx.fillRect(rg.a, y0 - trPx * 0.94 - filmPx * fp - lift * 30, rg.b - rg.a, filmPx * fp); });
                    ctx.globalAlpha = 1;
                }
            }

            // The photodefinable film (the resist is the layer) keeps its colour.
            if (photo && after("develop") && steps.indexOf("pyro") < 0) {

                ctx.fillStyle = filmCol;
                regions.forEach(function (rg) { ctx.fillRect(rg.a, y0 - trPx * 0.94, rg.b - rg.a, trPx * 0.94); });
            }

            // Pyrolysis: the SU-8 darkens and shrinks to glassy carbon.
            if (steps.indexOf("pyro") >= 0 && (during("pyro") || after("pyro"))) {

                const keep = E.PYRO_TEMPS[E.pyroOf(l).T].keep;
                const pp = after("pyro") ? 1 : progOf("pyro");
                const hgt = trPx * 0.94 * (1 - (1 - keep) * pp);

                ctx.fillStyle = "#1c2132";
                regions.forEach(function (rg) { ctx.fillRect(rg.a - 1, y0 - trPx - 2, rg.b - rg.a + 2, trPx + 2); });

                ctx.fillStyle = pp < 0.5 ? "#8a5a2c" : filmCol;
                regions.forEach(function (rg) { ctx.fillRect(rg.a, y0 - hgt, rg.b - rg.a, hgt); });

                if (during("pyro")) {

                    ctx.fillStyle = "rgba(255,120,40," + (0.12 + 0.08 * Math.sin(t * 3)) + ")";
                    ctx.fillRect(40, 60, 520, y0 - 60);

                    const py = E.pyroOf(l);

                    text(ctx, py.T + " \u00b0C in " + E.PYRO_GASES[py.gas].name + ": everything but carbon leaves as gas", 300, 80, "#ffb070", 11, "center");
                }
            }

            // Mask and light during exposure.
            if (during("expose")) {

                const my = 74;

                ctx.fillStyle = "#2b2f3d";

                // Opaque parts of the mask.
                const opaque = lightOnShapes ? gaps : shapes;

                ctx.fillRect(x0 - 30, my, 20, 8);
                ctx.fillRect(x0 + totalW * s + 10, my, 20, 8);

                opaque.forEach(function (o) { ctx.fillRect(o[0], my, o[1] - o[0], 8); });
                ctx.fillRect(40, my, Math.max(0, lit[0][0] - 40 - 0 + 0) * 0, 8);

                ctx.setLineDash([6, 5]);
                ctx.lineDashOffset = -t * 40;
                ctx.strokeStyle = "rgba(150,110,255,0.9)";
                ctx.lineWidth = 2;

                lit.forEach(function (e) {

                    for (let q = 0; q < 3; q++) {

                        const x = lerp(e[0], e[1], (q + 0.5) / 3);

                        ctx.beginPath();
                        ctx.moveTo(x, my + 8);
                        ctx.lineTo(lerp(x, (e[0] + e[1]) / 2, 0.5), y0 - trPx);
                        ctx.stroke();
                    }
                });

                ctx.setLineDash([]);

                text(ctx, "mask", 56, my + 8, "#aab3c7", 11);
                text(ctx, "UV light", 56, 64, "#c8b8ff", 11);
                ctx.fillStyle = "rgba(150,110,255," + (0.35 + 0.15 * Math.sin(t * 6)) + ")";
                ctx.fillRect(x0 - 30, 56, totalW * s + 60, 5);
            }

            if (during("spin")) {

                ctx.strokeStyle = "rgba(255,255,255,0.4)";
                ctx.lineWidth = 2;

                for (let q = 0; q < 3; q++) {

                    ctx.beginPath();
                    ctx.arc(300, 120, 24 + q * 10, t * 4 + q, t * 4 + q + 1.8);
                    ctx.stroke();
                }

                text(ctx, "spinning at a few thousand rpm", 300, 80, "#cbd2e3", 11, "center");
            }

            if (during("bake")) {

                for (let q = 0; q < 9; q++) {

                    const x = 90 + q * 52;

                    ctx.strokeStyle = "rgba(255,150,60," + (0.5 - ((t * 0.8 + q * 0.2) % 1) * 0.5) + ")";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y0 - trPx - 10 - ((t * 24 + q * 7) % 40));
                    ctx.quadraticCurveTo(x + 6, y0 - trPx - 20 - ((t * 24 + q * 7) % 40), x, y0 - trPx - 30 - ((t * 24 + q * 7) % 40));
                    ctx.stroke();
                }

                text(ctx, lt.bakeT + " °C for " + lt.bakeMin + " min", 300, 80, "#ffb070", 11, "center");
            }

            if (during("develop")) {

                ctx.fillStyle = "rgba(90,170,255,0.25)";
                ctx.fillRect(40, y0 - trPx - 20 - 0, 520, 20);
                ctx.strokeStyle = "rgba(190,230,255,0.7)";
                ctx.lineWidth = 1;

                for (let q = 0; q < 10; q++) { const x = (q * 61 + t * 30) % 520 + 40; ctx.beginPath(); ctx.arc(x, y0 - trPx - 10 - Math.abs(Math.sin(t * 3 + q)) * 8, 2, 0, Math.PI * 2); ctx.stroke(); }

                text(ctx, "developer: " + lt.dev + " s (" + Math.round(rd * 100) + "% of ideal)", 300, 80, "#8fc4ff", 11, "center");
            }

            if (during("etch")) { text(ctx, "etchant removes the exposed film", 300, 80, "#e0a070", 11, "center"); }
            if (during("lift")) { text(ctx, "solvent dissolves the resist and takes the film on top with it", 300, 80, "#cbd2e3", 11, "center"); }
            if (during("film")) { text(ctx, "material is deposited over the whole wafer", 300, 80, "#cbd2e3", 11, "center"); }

            // The title and verdict.
            text(ctx, "Layer: " + l.name, 14, 22, "#e8edf8", 13);
            text(ctx, "Step " + (k + 1) + " of " + nS + ": " + NAMES[cur], 14, 42, "#54e0c7", 12);

            const readout = [
                "Dose " + lt.dose + " mJ/cm² (" + Math.round(r * 100) + "% of what this resist needs)",
                "Develop " + lt.dev + " s (" + Math.round(rd * 100) + "% of ideal)"
            ];

            readout.forEach(function (rt, q) { text(ctx, rt, LW - 14, 22 + q * 16, Math.abs(Math.log(q ? rd : r)) > 0.3 ? "#f2b84b" : "#9fb2c8", 11, "right"); });

            if (compressed) { text(ctx, "heights squeezed to fit", LW - 14, 62, "#8791ab", 10, "right"); }

            // The result badge once the pattern is complete.
            const q = pat.status === "inverted" ? "inverted pattern" : pat.status === "lost" ? "pattern lost" : pat.quality > 0.85 ? "excellent" : pat.quality > 0.6 ? "good" : pat.quality > 0.3 ? "marginal" : "poor";
            const qc = pat.status !== "ok" || pat.quality < 0.3 ? "#ff9a9a" : pat.quality < 0.6 ? "#f2b84b" : "#7be0b0";

            text(ctx, "pattern quality: " + q, 14, LH - 30, qc, 12);

            if (pat.status === "inverted") { text(ctx, "wrong mask polarity: you would print the opposite pattern", 14, LH - 14, "#ff9a9a", 11); }
            else if (pat.notes && pat.notes.length) { text(ctx, pat.notes[0].slice(0, 96), 14, LH - 14, "#c9a76f", 11); }
            else { text(ctx, "smallest feature " + (f >= 1 ? f.toFixed(1) : f.toFixed(2)) + " µm, smallest gap " + (g >= 1 ? g.toFixed(1) : g.toFixed(2)) + " µm", 14, LH - 14, "#8791ab", 11); }

            const biasLine = "width change " + (pat.bias >= 0 ? "+" : "") + pat.bias.toFixed(2) + " µm";

            text(ctx, biasLine, LW - 14, LH - 14, "#9fb2c8", 11, "right");
        }

        const lp = makeLoop(fb.canvas, { ratio: 0.58, draw: draw });

        const box = h("div", { className: "la-box la-sticky" }, [
            fb.wrap,
            fb.info,
            h("div", { className: "la-controls" }, [sel, playBtn, h("label", { className: "la-ctl la-grow" }, [h("span", { text: "Scrub" }), scrub])])
        ]);

        fb.say("Watch one layer being made. Change the dose, develop time or mask polarity in the layer cards below and the movie changes with them.");

        return { box: box, stop: lp.stop };
    }


    /* ------------------------------------------------
       3. THE BUILT DEVICE, LAYER BY LAYER
       built: { frame, P, per } from a fabricated device, and info.layers for the notes
    ------------------------------------------------ */

    function buildBox(built, info) {

        const fb = frameBox("The device built layer by layer, with the real misalignment", false);
        const f = built.frame;
        const per = built.per;

        const layerCanvas = per.map(function (q, k) {

            const off = document.createElement("canvas");

            off.width = f.w;
            off.height = f.h;

            const octx = off.getContext("2d");
            const img = octx.createImageData(f.w, f.h);
            const c = hexRgb(E.ROLES[q.layer.role].color);
            const alpha = q.layer.role === "insulation" ? 105 : q.layer.role === "channel" || q.layer.role === "substrate" ? 130 : 225;

            for (let i = 0; i < f.w * f.h; i++) {

                if (!built.P[k][i]) { continue; }

                img.data[i * 4] = c[0];
                img.data[i * 4 + 1] = c[1];
                img.data[i * 4 + 2] = c[2];
                img.data[i * 4 + 3] = alpha;
            }

            octx.putImageData(img, 0, 0);

            return off;
        });

        const nl = per.length;
        const st = { u: 0, playing: true, exag: 1, hidden: {} };
        const scrub = h("input", { type: "range", min: "0", max: "1000", value: "0", "aria-label": "Scrub through the layers" });
        const exag = h("input", { type: "range", min: "1", max: "12", step: "0.5", value: "1", "aria-label": "Exaggerate the misalignment" });
        const playBtn = h("button", { type: "button", className: "lab-btn small", text: "Pause" });

        const lp = makeLoop(fb.canvas, { ratio: 0.62, draw: draw });

        function draw(ctx, t, dt, LH) {

            ctx.fillStyle = "#101526";
            ctx.fillRect(0, 0, LW, LH);

            if (st.playing) { st.u += dt / (nl * 1.6 + 2); if (st.u >= 1) { st.u = 0; } scrub.value = String(Math.round(st.u * 1000)); }

            const sc = Math.min((LW - 190) / f.w, (LH - 36) / f.h);
            const dw = f.w * sc;
            const dh = f.h * sc;
            const ox = 12;
            const oy = (LH - dh) / 2;

            // The wafer under everything.
            ctx.fillStyle = "#0d1326";
            ctx.fillRect(ox, oy, dw, dh);

            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;

            for (let x = 0; x <= dw; x += 20) { ctx.beginPath(); ctx.moveTo(ox + x, oy); ctx.lineTo(ox + x, oy + dh); ctx.stroke(); }
            for (let y = 0; y <= dh; y += 20) { ctx.beginPath(); ctx.moveTo(ox, oy + y); ctx.lineTo(ox + dw, oy + y); ctx.stroke(); }

            const pos = st.u * (nl + 0.6);
            let current = -1;

            per.forEach(function (q, k) {

                if (st.hidden[k]) { return; }

                const prog = clamp(pos - k, 0, 1);

                if (prog <= 0) { return; }

                if (prog < 1) { current = k; }

                const lay = info && info.layers ? info.layers[k] : null;
                const offx = lay ? (st.exag - 1) * lay.dx / f.px * sc : 0;
                const offy = lay ? (st.exag - 1) * lay.dy / f.px * sc : 0;

                // The layer wipes in from the left with a glowing edge, like being exposed under a scanner.
                ctx.save();
                ctx.beginPath();
                ctx.rect(ox, oy, dw * ease(prog), dh);
                ctx.clip();
                ctx.drawImage(layerCanvas[k], ox + offx, oy + offy, dw, dh);
                ctx.restore();

                if (prog < 1) {

                    const x = ox + dw * ease(prog);

                    const gr = ctx.createLinearGradient(x - 24, 0, x, 0);

                    gr.addColorStop(0, "rgba(120,200,255,0)");
                    gr.addColorStop(1, "rgba(160,220,255,0.7)");
                    ctx.fillStyle = gr;
                    ctx.fillRect(x - 24, oy, 24, dh);
                }
            });

            // A legend that doubles as the list of layers.
            text(ctx, "Layers (tap to hide)", ox + dw + 14, 20, "#cbd2e3", 11);

            per.forEach(function (q, k) {

                const y = 40 + k * 22;
                const prog = clamp(pos - k, 0, 1);
                const lay = info && info.layers ? info.layers[k] : null;

                ctx.fillStyle = E.ROLES[q.layer.role].color;
                ctx.globalAlpha = st.hidden[k] ? 0.2 : (prog > 0 ? 1 : 0.35);
                ctx.fillRect(ox + dw + 14, y - 9, 12, 12);
                ctx.globalAlpha = 1;

                text(ctx, (k + 1) + ". " + q.layer.name.slice(0, 22), ox + dw + 32, y, prog > 0 ? "#e8edf8" : "#6b7390", 11);

                if (lay && prog >= 1) { text(ctx, Math.round(lay.quality * 100) + "% · shifted " + Math.hypot(lay.dx, lay.dy).toFixed(1) + " µm", ox + dw + 32, y + 10, lay.status !== "ok" ? "#ff9a9a" : "#8791ab", 9); }
            });

            if (current >= 0) {

                const methods = ["spin resist", "expose", "develop", "deposit", "lift off"];

                text(ctx, "now: " + per[current].layer.name + " (" + methods[Math.floor((t * 2) % methods.length)] + "…)", ox, LH - 8, "#54e0c7", 11);
            }

            if (st.exag > 1) { text(ctx, "misalignment exaggerated " + st.exag + "×", LW - 10, LH - 8, "#f2b84b", 11, "right"); }
        }

        fb.canvas.addEventListener("click", function (e) {

            const m = lp.toLogical(e);
            const sc = Math.min((LW - 190) / f.w, (LH_() - 36) / f.h);
            const lx = 12 + f.w * sc + 14;

            if (m.x >= lx) {

                const k = Math.floor((m.y - 31) / 22);

                if (k >= 0 && k < nl) { st.hidden[k] = !st.hidden[k]; lp.wake(2); }
            }
        });

        function LH_() { return lp.LH; }

        playBtn.addEventListener("click", function () { st.playing = !st.playing; playBtn.textContent = st.playing ? "Pause" : "Play"; lp.wake(20); });
        scrub.addEventListener("input", function () { st.u = Number(scrub.value) / 1000; st.playing = false; playBtn.textContent = "Play"; lp.wake(3); });
        exag.addEventListener("input", function () { st.exag = Number(exag.value); lp.wake(3); });

        const box = h("div", { className: "la-box" }, [
            fb.wrap, fb.info,
            h("div", { className: "la-controls" }, [
                playBtn,
                h("label", { className: "la-ctl la-grow" }, [h("span", { text: "Scrub" }), scrub]),
                h("label", { className: "la-ctl la-grow" }, [h("span", { text: "Exaggerate misalignment" }), exag])
            ])
        ]);

        fb.say("Device 1, built one layer at a time. Slide the exaggeration up to see how far each layer landed from where you drew it.");

        return { box: box, stop: lp.stop };
    }


    /* ------------------------------------------------
       4. PLAYBOX: A SCRUBBABLE ANIMATION WITH A LIVE CURVE
       opts: { title, dur, draw(ctx, u, t, dt, W, H), series, xLabel, yLabel, xLog, yLog, caption, onInfo }
    ------------------------------------------------ */

    function playbox(opts) {

        const fb = frameBox(opts.title, false);
        const st = { u: 0, playing: true, speed: 1 };

        const scrub = h("input", { type: "range", min: "0", max: "1000", value: "0", "aria-label": "Scrub through the measurement" });
        const speed = h("input", { type: "range", min: "0.25", max: "3", step: "0.05", value: "1", "aria-label": "Speed" });
        const playBtn = h("button", { type: "button", className: "lab-btn small", text: "Pause" });

        const series = opts.series || [];
        const px0 = 392;
        const px1 = LW - 14;
        const py0 = 34;

        function range(vals, log) {

            let lo = Infinity;
            let hi = -Infinity;

            vals.forEach(function (arr) { arr.forEach(function (v) { if (isFinite(v) && (!log || v > 0)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }); });

            if (!isFinite(lo)) { lo = 0; hi = 1; }
            if (lo === hi) { lo -= 0.5; hi += 0.5; }

            return log ? [Math.log10(lo), Math.log10(hi)] : [lo, hi];
        }

        const xr = range(series.map(function (s) { return s.x; }), opts.xLog);
        const yr = range(series.map(function (s) { return s.y; }), opts.yLog);

        const lp = makeLoop(fb.canvas, { ratio: opts.ratio || 0.5, draw: draw });

        function draw(ctx, t, dt, LH) {

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            if (st.playing) { st.u += dt * st.speed / (opts.dur || 10); if (st.u >= 1) { st.u = 0; } scrub.value = String(Math.round(st.u * 1000)); }

            opts.draw(ctx, st.u, t, dt, 380, LH);

            // The curve on the right, with the playhead.
            const py1 = LH - 38;

            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.lineWidth = 1;
            ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);

            const tx = function (v) { const x = opts.xLog ? Math.log10(Math.max(v, 1e-30)) : v; return lerp(px0, px1, (x - xr[0]) / Math.max(xr[1] - xr[0], 1e-30)); };
            const ty = function (v) { const y = opts.yLog ? Math.log10(Math.max(v, 1e-30)) : v; return lerp(py1, py0, (y - yr[0]) / Math.max(yr[1] - yr[0], 1e-30)); };

            series.forEach(function (s) {

                ctx.strokeStyle = s.color || "#54e0c7";
                ctx.lineWidth = s.width || 2;
                ctx.globalAlpha = s.alpha === undefined ? 1 : s.alpha;
                ctx.setLineDash(s.dash || []);
                ctx.beginPath();

                let pen = false;

                s.x.forEach(function (xv, k) {

                    const yv = s.y[k];

                    if (!isFinite(xv) || !isFinite(yv) || (opts.xLog && xv <= 0) || (opts.yLog && yv <= 0)) { pen = false; return; }

                    if (pen) { ctx.lineTo(tx(xv), ty(yv)); } else { ctx.moveTo(tx(xv), ty(yv)); pen = true; }
                });

                ctx.stroke();
                ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            });

            const lead = series[0];

            if (lead && lead.x.length) {

                const i = clamp(Math.round(st.u * (lead.x.length - 1)), 0, lead.x.length - 1);

                ctx.strokeStyle = "rgba(255,255,255,0.25)";
                ctx.beginPath();
                ctx.moveTo(tx(lead.x[i]), py0);
                ctx.lineTo(tx(lead.x[i]), py1);
                ctx.stroke();

                if (isFinite(lead.x[i]) && isFinite(lead.y[i])) {

                    ctx.fillStyle = "#ffdf70";
                    ctx.beginPath();
                    ctx.arc(tx(lead.x[i]), ty(lead.y[i]), 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#1c2132";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                if (opts.readout) { text(ctx, opts.readout(i), px1, py0 - 12, "#e8edf8", 11, "right"); }
            }

            text(ctx, opts.xLabel || "", (px0 + px1) / 2, LH - 14, "#9fb2c8", 10, "center");
            ctx.save();
            ctx.translate(px0 - 10, (py0 + py1) / 2);
            ctx.rotate(-Math.PI / 2);
            text(ctx, opts.yLabel || "", 0, 0, "#9fb2c8", 10, "center");
            ctx.restore();
        }

        function jump(e) {

            const m = lp.toLogical(e);
            const lead = series[0];

            if (!lead || m.x < px0 - 6) { return; }

            st.u = clamp((m.x - px0) / (px1 - px0), 0, 1);
            st.playing = false;
            playBtn.textContent = "Play";
            scrub.value = String(Math.round(st.u * 1000));
            lp.wake(3);
        }

        fb.canvas.addEventListener("click", jump);

        fb.canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);

            if (opts.onInfo) { fb.say(opts.onInfo(m.x < px0 - 6 ? "mech" : "plot", m, st.u) || opts.caption || ""); }
        });

        playBtn.addEventListener("click", function () { st.playing = !st.playing; playBtn.textContent = st.playing ? "Pause" : "Play"; lp.wake(30); });
        scrub.addEventListener("input", function () { st.u = Number(scrub.value) / 1000; st.playing = false; playBtn.textContent = "Play"; lp.wake(3); });
        speed.addEventListener("input", function () { st.speed = Number(speed.value); });

        const box = h("div", { className: "la-box" }, [
            h("p", { className: "la-title", text: opts.title }),
            fb.wrap, fb.info,
            h("div", { className: "la-controls" }, [
                playBtn,
                h("label", { className: "la-ctl la-grow" }, [h("span", { text: "Scrub" }), scrub]),
                h("label", { className: "la-ctl" }, [h("span", { text: "Speed" }), speed])
            ])
        ]);

        fb.say(opts.caption || "");

        return { box: box, stop: lp.stop, state: st, wake: lp.wake };
    }


    root.LabAnim = {

        stack3dBox: stack3dBox, processBox: processBox, buildBox: buildBox, playbox: playbox, stopAll: stopAll, makeLoop: makeLoop,
        util: { clamp: clamp, lerp: lerp, ease: ease, hash: hash, hexRgb: hexRgb, rgba: rgba, text: text, rrect: rrect, h: h, LW: LW, reduce: reduce }
    };

}(typeof window !== "undefined" ? window : globalThis));
