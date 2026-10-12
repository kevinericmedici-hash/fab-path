/* ========================================
   LAB LAYOUT EDITOR

   A small vector editor for mask layers, drawn with the mouse or a
   finger: rectangle, circle, polygon, trace, contact pad and ruler
   tools, snapping, zoom and pan, undo and redo, copies and arrays,
   a layer list and live footprint / feature / gap readouts.

   LabEditor.mount(host, { design, onChange }) edits design.layers in place.
   Needs window.LabGeom and window.LabEngine.
======================================== */

(function (root) {

    "use strict";

    const G = root.LabGeom;
    const E = root.LabEngine;

    const TOOLS = [
        { id: "select", name: "Select", key: "V", hint: "Click a shape to select it. Drag to move. Drag a handle to resize. Drag an empty area to box-select." },
        { id: "r", name: "Rectangle", key: "R", hint: "Click and drag to draw a rectangle." },
        { id: "c", name: "Circle", key: "C", hint: "Click the centre and drag out the radius." },
        { id: "p", name: "Polygon", key: "P", hint: "Click each corner. Double-click, press Enter, or click the first point to close it." },
        { id: "t", name: "Trace", key: "T", hint: "Click points along a line. Double-click or press Enter to finish. Set the width in the toolbar." },
        { id: "pad", name: "Pad", key: "D", hint: "Drag a contact pad on a conductive layer, then pick its label (+ or −)." },
        { id: "measure", name: "Ruler", key: "M", hint: "Click two points to measure the distance between them." },
        { id: "pan", name: "Pan", key: "H", hint: "Drag to move the view. (Middle mouse or right mouse button also pans.)" }
    ];

    const PAD_LABELS = ["+", "−", "S", "D", "G"];

    // Pad labels and layer types depend on the kind of device being drawn.
    // Labels that make sense on a layer: ports (inlet, outlet) belong on the fluidic layers, electrode and contact labels on metal.
    function padLabelsFor(design, layer) {

        const kd = E.KINDS[design.kind] || {};
        const all = kd.pads || PAD_LABELS;

        if (!layer || !kd.portPads) { return all; }

        const onPort = (kd.padRoles || []).indexOf(layer.role) >= 0;

        return all.filter(function (p) { return (kd.portPads.indexOf(p) >= 0) === onPort; });
    }

    function padRoleHint(design, p) {

        const d = ((E.KINDS[design.kind] || {}).padNames || {})[p];

        return d ? " (" + d + ")" : "";
    }

    // Contact pads go on conductors, and ports on the layer roles a kind lists.
    function canPad(design, layer) {

        return E.ROLES[layer.role].conductive || ((E.KINDS[design.kind] || {}).padRoles || []).indexOf(layer.role) >= 0;
    }

    function rolesFor(design) { return (E.KINDS[design.kind] || {}).roles || Object.keys(E.ROLES); }

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


    function fmtLen(um) {

        if (!isFinite(um)) { return "none"; }

        const a = Math.abs(um);

        if (a >= 1000) { return (um / 1000).toFixed(a >= 10000 ? 1 : 2) + " mm"; }
        if (a >= 100) { return um.toFixed(0) + " µm"; }
        if (a >= 10) { return um.toFixed(1) + " µm"; }

        return um.toFixed(2) + " µm";
    }


    function fmtArea(um2) {

        if (um2 >= 1e6) { return (um2 / 1e6).toFixed(3) + " mm²"; }
        if (um2 >= 1e4) { return (um2 / 1e6).toFixed(4) + " mm²"; }

        return Math.round(um2).toLocaleString("en-US") + " µm²";
    }


    function mount(host, opts) {

        const design = opts.design;
        const onChange = opts.onChange || function () { };

        host.innerHTML = "";

        let activeId = design.layers.length ? design.layers[design.layers.length - 1].id : "";
        let tool = "select";
        let sel = [];
        let snapOn = true;
        let showOthers = "dim";
        let showBox = true;
        let spaceDown = false;

        let traceWidth = 10;
        let padLabel = padLabelsFor(design)[0];

        const view = { cx: 0, cy: 0, s: 0.2 };

        const undo = [];
        const redo = [];

        let W = 800;
        let Hh = 520;

        let cursor = null;
        let drag = null;
        let draft = null;
        let ruler = [];
        let lastTap = 0;
        let hover = -1;

        const metricsTimer = { id: 0 };

        // ----- DOM -----
        const root1 = h("div", { className: "ed" });

        const bar = h("div", { className: "ed-bar", role: "toolbar", "aria-label": "Drawing tools" });
        const stage = h("div", { className: "ed-stage" });
        const canvas = h("canvas", { className: "ed-canvas", tabindex: "0", "aria-label": "Layout drawing area" });
        const hint = h("p", { className: "ed-hint", "aria-live": "polite" });
        const status = h("div", { className: "ed-status" });
        const side = h("div", { className: "ed-side" });

        stage.appendChild(canvas);
        stage.appendChild(status);

        const main = h("div", { className: "ed-main" }, [h("div", { className: "ed-left" }, [bar, stage, hint]), side]);

        root1.appendChild(main);
        host.appendChild(root1);

        const ctx = canvas.getContext("2d");


        // ----- helpers -----
        function layerById(id) { return design.layers.filter(function (l) { return l.id === id; })[0]; }
        function active() { return layerById(activeId) || design.layers[0]; }
        function grid() { return design.grid || 10; }
        function snap(v) { return snapOn ? Math.round(v / grid()) * grid() : Math.round(v * 100) / 100; }

        function toScreen(x, y) { return [(x - view.cx) * view.s + W / 2, (y - view.cy) * view.s + Hh / 2]; }
        function toWorld(px, py) { return [(px - W / 2) / view.s + view.cx, (py - Hh / 2) / view.s + view.cy]; }

        function pointer(e) {

            const r = canvas.getBoundingClientRect();

            const px = (e.clientX - r.left) * (W / r.width);
            const py = (e.clientY - r.top) * (Hh / r.height);

            const w = toWorld(px, py);

            return { px: px, py: py, x: w[0], y: w[1], sx: snap(w[0]), sy: snap(w[1]) };
        }

        function pushUndo() {

            undo.push(JSON.stringify(design.layers));

            if (undo.length > 60) { undo.shift(); }

            redo.length = 0;
        }

        function restore(text) {

            const layers = JSON.parse(text);

            design.layers.length = 0;
            layers.forEach(function (l) { design.layers.push(l); });

            if (!layerById(activeId)) { activeId = design.layers.length ? design.layers[design.layers.length - 1].id : ""; }

            sel = [];
        }

        function doUndo() {

            if (!undo.length) { return; }

            redo.push(JSON.stringify(design.layers));
            restore(undo.pop());
            changed("shapes", true);
        }

        function doRedo() {

            if (!redo.length) { return; }

            undo.push(JSON.stringify(design.layers));
            restore(redo.pop());
            changed("shapes", true);
        }

        function changed(kind, rebuild) {

            onChange(kind);

            if (rebuild) { buildSide(); }

            scheduleMetrics();
            draw();
            updateBar();
        }

        function fitView() {

            const all = [];

            design.layers.forEach(function (l) { l.shapes.forEach(function (s) { all.push(s); }); });

            const b = G.bboxOf(all);

            if (!b) { view.cx = 0; view.cy = 0; view.s = 0.25; return; }

            const w = Math.max(b.x1 - b.x0, 50);
            const hh = Math.max(b.y1 - b.y0, 50);

            view.cx = (b.x0 + b.x1) / 2;
            view.cy = (b.y0 + b.y1) / 2;
            view.s = Math.min(W / (w * 1.25), Hh / (hh * 1.25));
        }

        function zoomAt(px, py, factor) {

            const w = toWorld(px, py);

            view.s = Math.max(0.005, Math.min(60, view.s * factor));

            view.cx = w[0] - (px - W / 2) / view.s;
            view.cy = w[1] - (py - Hh / 2) / view.s;
        }


        // ----- hit testing -----
        function hitShape(s, x, y, tol) {

            if (s.t === "r") { return x >= s.x - tol && x <= s.x + s.w + tol && y >= s.y - tol && y <= s.y + s.h + tol; }
            if (s.t === "c") { return Math.hypot(x - s.x, y - s.y) <= s.r + tol; }

            if (s.t === "t") {

                for (let k = 0; k + 1 < s.pts.length; k++) {

                    if (Math.sqrt(G.pointSegDist2(x, y, s.pts[k][0], s.pts[k][1], s.pts[k + 1][0], s.pts[k + 1][1])) <= s.w / 2 + tol) { return true; }
                }

                return false;
            }

            return G.pointInPoly(x, y, s.pts);
        }

        function pickAt(x, y) {

            const l = active();

            if (!l) { return -1; }

            const tol = 4 / view.s;

            for (let k = l.shapes.length - 1; k >= 0; k--) {

                if (hitShape(l.shapes[k], x, y, tol)) { return k; }
            }

            return -1;
        }

        function handlesOf(s) {

            if (s.t === "r") {

                const xm = s.x + s.w / 2;
                const ym = s.y + s.h / 2;

                return [
                    { id: "nw", x: s.x, y: s.y }, { id: "n", x: xm, y: s.y }, { id: "ne", x: s.x + s.w, y: s.y },
                    { id: "e", x: s.x + s.w, y: ym }, { id: "se", x: s.x + s.w, y: s.y + s.h }, { id: "s", x: xm, y: s.y + s.h },
                    { id: "sw", x: s.x, y: s.y + s.h }, { id: "w", x: s.x, y: ym }
                ];
            }

            if (s.t === "c") { return [{ id: "r", x: s.x + s.r, y: s.y }]; }

            return s.pts.map(function (q, k) { return { id: "v" + k, x: q[0], y: q[1] }; });
        }

        function hitHandle(x, y) {

            const l = active();

            if (!l || sel.length !== 1) { return null; }

            const s = l.shapes[sel[0]];

            if (!s) { return null; }

            const tol = 7 / view.s;
            const hs = handlesOf(s);

            for (let k = 0; k < hs.length; k++) {

                if (Math.abs(hs[k].x - x) <= tol && Math.abs(hs[k].y - y) <= tol) { return hs[k].id; }
            }

            return null;
        }


        // ----- drawing -----
        function layerColor(l, a) {

            const hex = E.ROLES[l.role].color;
            const n = parseInt(hex.slice(1), 16);

            return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
        }

        function tracePath(c, s) {

            if (s.t === "r") { c.rect.apply(c, toScreen(s.x, s.y).concat([s.w * view.s, s.h * view.s])); return; }

            if (s.t === "c") {

                const p = toScreen(s.x, s.y);

                c.moveTo(p[0] + s.r * view.s, p[1]);
                c.arc(p[0], p[1], s.r * view.s, 0, Math.PI * 2);

                return;
            }

            G.polysOf(s).forEach(function (poly) {

                poly.forEach(function (q, k) {

                    const p = toScreen(q[0], q[1]);

                    if (k === 0) { c.moveTo(p[0], p[1]); } else { c.lineTo(p[0], p[1]); }
                });

                c.closePath();
            });
        }

        function drawGrid() {

            const g = grid();

            let step = g;

            while (step * view.s < 12) { step *= 2; }

            const tl = toWorld(0, 0);
            const br = toWorld(W, Hh);

            ctx.lineWidth = 1;

            for (let x = Math.floor(tl[0] / step) * step; x <= br[0]; x += step) {

                const sx = toScreen(x, 0)[0];
                const major = Math.abs(Math.round(x / step)) % 5 === 0;

                ctx.strokeStyle = major ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.045)";
                ctx.beginPath();
                ctx.moveTo(Math.round(sx) + 0.5, 0);
                ctx.lineTo(Math.round(sx) + 0.5, Hh);
                ctx.stroke();
            }

            for (let y = Math.floor(tl[1] / step) * step; y <= br[1]; y += step) {

                const sy = toScreen(0, y)[1];
                const major = Math.abs(Math.round(y / step)) % 5 === 0;

                ctx.strokeStyle = major ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.045)";
                ctx.beginPath();
                ctx.moveTo(0, Math.round(sy) + 0.5);
                ctx.lineTo(W, Math.round(sy) + 0.5);
                ctx.stroke();
            }

            // Origin.
            const o = toScreen(0, 0);

            ctx.strokeStyle = "rgba(84,224,199,0.35)";
            ctx.beginPath();
            ctx.moveTo(o[0], 0);
            ctx.lineTo(o[0], Hh);
            ctx.moveTo(0, o[1]);
            ctx.lineTo(W, o[1]);
            ctx.stroke();
        }

        function allBox() {

            const all = [];

            design.layers.forEach(function (l) { l.shapes.forEach(function (s) { all.push(s); }); });

            return G.bboxOf(all);
        }

        function drawLayer(l, alpha, isActive) {

            if (!l.visible) { return; }

            if (l.mode === "cut") {

                const b = allBox();

                if (b) {

                    const tl = toScreen(b.x0 - 30, b.y0 - 30);

                    ctx.save();
                    ctx.fillStyle = layerColor(l, alpha * 0.22);
                    ctx.fillRect(tl[0], tl[1], (b.x1 - b.x0 + 60) * view.s, (b.y1 - b.y0 + 60) * view.s);
                    ctx.restore();
                }

                ctx.save();
                ctx.setLineDash([5, 4]);
                ctx.lineWidth = isActive ? 1.8 : 1.2;
                ctx.strokeStyle = layerColor(l, Math.min(1, alpha + 0.4));

                l.shapes.forEach(function (s) {

                    ctx.beginPath();
                    tracePath(ctx, s);
                    ctx.stroke();

                    ctx.fillStyle = "rgba(11,16,32,0.55)";
                    ctx.fill();
                });

                ctx.restore();

                return;
            }

            ctx.fillStyle = layerColor(l, alpha * 0.55);
            ctx.strokeStyle = layerColor(l, Math.min(1, alpha + 0.3));
            ctx.lineWidth = isActive ? 1.6 : 1;

            l.shapes.forEach(function (s) {

                ctx.beginPath();
                tracePath(ctx, s);
                ctx.fill();
                ctx.stroke();

                if (s.pad) {

                    const b = G.bboxOf([s]);
                    const c = toScreen((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2);

                    ctx.fillStyle = "#06201b";
                    ctx.font = "700 " + Math.max(11, Math.min(34, (b.x1 - b.x0) * view.s * 0.5)) + "px Inter, Arial, sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(s.pad, c[0], c[1]);
                    ctx.fillStyle = layerColor(l, alpha * 0.55);
                }
            });
        }

        function draw() {

            ctx.setTransform(canvas.width / W, 0, 0, canvas.height / Hh, 0, 0);

            ctx.fillStyle = "#0d1326";
            ctx.fillRect(0, 0, W, Hh);

            drawGrid();

            // Layers, bottom to top.
            design.layers.forEach(function (l) {

                const isActive = l.id === activeId;

                if (!isActive && showOthers === "off") { return; }

                drawLayer(l, isActive ? 1 : (showOthers === "all" ? 0.75 : 0.35), isActive);
            });

            // Footprint box.
            if (showBox) {

                const b = allBox();

                if (b) {

                    const a = toScreen(b.x0, b.y0);
                    const c = toScreen(b.x1, b.y1);

                    ctx.save();
                    ctx.setLineDash([2, 5]);
                    ctx.strokeStyle = "rgba(255,255,255,0.4)";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(a[0], a[1], c[0] - a[0], c[1] - a[1]);
                    ctx.restore();

                    ctx.fillStyle = "rgba(255,255,255,0.7)";
                    ctx.font = "11px Inter, Arial, sans-serif";
                    ctx.textAlign = "left";
                    ctx.textBaseline = "bottom";
                    ctx.fillText("Footprint " + fmtLen(b.x1 - b.x0) + " × " + fmtLen(b.y1 - b.y0), a[0] + 2, a[1] - 3);
                }
            }

            // Selection.
            const l = active();

            if (l) {

                sel.forEach(function (k) {

                    const s = l.shapes[k];

                    if (!s) { return; }

                    ctx.save();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([6, 3]);
                    ctx.beginPath();
                    tracePath(ctx, s);
                    ctx.stroke();
                    ctx.restore();
                });

                if (sel.length === 1 && l.shapes[sel[0]] && tool === "select") {

                    handlesOf(l.shapes[sel[0]]).forEach(function (hd) {

                        const p = toScreen(hd.x, hd.y);

                        ctx.fillStyle = "#0d1326";
                        ctx.strokeStyle = "#ffffff";
                        ctx.lineWidth = 1.5;
                        ctx.fillRect(p[0] - 4, p[1] - 4, 8, 8);
                        ctx.strokeRect(p[0] - 4, p[1] - 4, 8, 8);
                    });
                }
            }

            if (hover >= 0 && tool === "select" && l && l.shapes[hover] && sel.indexOf(hover) < 0) {

                ctx.save();
                ctx.strokeStyle = "rgba(255,255,255,0.55)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                tracePath(ctx, l.shapes[hover]);
                ctx.stroke();
                ctx.restore();
            }

            // Draft shape and live size.
            if (draft) { drawDraft(); }

            // Marquee.
            if (drag && drag.kind === "marquee") {

                const a = toScreen(drag.x0, drag.y0);
                const c = toScreen(drag.x1, drag.y1);

                ctx.save();
                ctx.strokeStyle = "#54e0c7";
                ctx.fillStyle = "rgba(84,224,199,0.08)";
                ctx.setLineDash([4, 3]);
                ctx.fillRect(a[0], a[1], c[0] - a[0], c[1] - a[1]);
                ctx.strokeRect(a[0], a[1], c[0] - a[0], c[1] - a[1]);
                ctx.restore();
            }

            // Ruler.
            if (ruler.length) { drawRuler(); }

            drawScale();
        }

        function label(text, x, y) {

            ctx.save();
            ctx.font = "600 12px Inter, Arial, sans-serif";

            const w = ctx.measureText(text).width + 12;

            ctx.fillStyle = "rgba(6,8,15,0.85)";
            ctx.fillRect(x, y - 9, w, 20);
            ctx.fillStyle = "#54e0c7";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(text, x + 6, y + 1);
            ctx.restore();
        }

        function drawDraft() {

            ctx.save();
            ctx.strokeStyle = "#54e0c7";
            ctx.fillStyle = "rgba(84,224,199,0.18)";
            ctx.lineWidth = 1.6;

            const d = draft;

            if (d.t === "r" || d.t === "pad") {

                const x = Math.min(d.x0, d.x1);
                const y = Math.min(d.y0, d.y1);
                const w = Math.abs(d.x1 - d.x0);
                const hh = Math.abs(d.y1 - d.y0);

                const p = toScreen(x, y);

                ctx.fillRect(p[0], p[1], w * view.s, hh * view.s);
                ctx.strokeRect(p[0], p[1], w * view.s, hh * view.s);

                label(fmtLen(w) + " × " + fmtLen(hh) + "  =  " + fmtArea(w * hh), p[0] + 6, p[1] - 14);

            } else if (d.t === "c") {

                const r = Math.hypot(d.x1 - d.x0, d.y1 - d.y0);
                const p = toScreen(d.x0, d.y0);

                ctx.beginPath();
                ctx.arc(p[0], p[1], r * view.s, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                label("radius " + fmtLen(r) + "  =  " + fmtArea(Math.PI * r * r), p[0] + 6, p[1] - 14);

            } else {

                const pts = d.pts.concat(d.cur ? [d.cur] : []);

                ctx.beginPath();

                pts.forEach(function (q, k) {

                    const p = toScreen(q[0], q[1]);

                    if (k === 0) { ctx.moveTo(p[0], p[1]); } else { ctx.lineTo(p[0], p[1]); }
                });

                if (d.t === "t") { ctx.lineWidth = Math.max(1.5, traceWidth * view.s); ctx.globalAlpha = 0.45; }

                ctx.stroke();
                ctx.globalAlpha = 1;

                pts.forEach(function (q) {

                    const p = toScreen(q[0], q[1]);

                    ctx.fillStyle = "#54e0c7";
                    ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6);
                });

                if (d.cur && d.pts.length) {

                    const last = d.pts[d.pts.length - 1];
                    const p = toScreen(d.cur[0], d.cur[1]);

                    label("length " + fmtLen(Math.hypot(d.cur[0] - last[0], d.cur[1] - last[1])), p[0] + 8, p[1] - 14);
                }
            }

            ctx.restore();
        }

        function drawRuler() {

            const a = ruler[0];
            const b = ruler[1] || (cursor ? [cursor.sx, cursor.sy] : null);

            ctx.save();
            ctx.strokeStyle = "#ffd84d";
            ctx.fillStyle = "#ffd84d";
            ctx.lineWidth = 1.5;

            const p = toScreen(a[0], a[1]);

            ctx.beginPath();
            ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
            ctx.fill();

            if (b) {

                const q = toScreen(b[0], b[1]);

                ctx.beginPath();
                ctx.moveTo(p[0], p[1]);
                ctx.lineTo(q[0], q[1]);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(q[0], q[1], 4, 0, Math.PI * 2);
                ctx.fill();

                const dx = b[0] - a[0];
                const dy = b[1] - a[1];

                label(fmtLen(Math.hypot(dx, dy)) + "   Δx " + fmtLen(Math.abs(dx)) + "   Δy " + fmtLen(Math.abs(dy)),
                    (p[0] + q[0]) / 2 + 8, (p[1] + q[1]) / 2 - 12);
            }

            ctx.restore();
        }

        function drawScale() {

            const target = 120 / view.s;
            const mag = Math.pow(10, Math.floor(Math.log10(target)));
            const norm = target / mag;
            const len = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;

            const x = 14;
            const y = Hh - 16;

            ctx.save();
            ctx.strokeStyle = "#ffffff";
            ctx.fillStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + len * view.s, y);
            ctx.moveTo(x, y - 4);
            ctx.lineTo(x, y + 4);
            ctx.moveTo(x + len * view.s, y - 4);
            ctx.lineTo(x + len * view.s, y + 4);
            ctx.stroke();
            ctx.font = "11px Inter, Arial, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(fmtLen(len), x, y - 8);
            ctx.restore();
        }


        // ----- shape creation -----
        function commitShape(s) {

            const l = active();

            if (!l) { return; }

            if (l.shapes.length >= 500) { setHint("This layer has 500 shapes, the limit. Delete some first."); return; }

            pushUndo();
            l.shapes.push(s);
            sel = [l.shapes.length - 1];

            changed("shapes", true);
        }

        function finishPoly() {

            if (!draft) { return; }

            const d = draft;

            draft = null;

            if (d.t === "p" && d.pts.length >= 3) { commitShape({ t: "p", pts: d.pts.map(function (q) { return [q[0], q[1]]; }) }); }
            else if (d.t === "t" && d.pts.length >= 2) { commitShape({ t: "t", w: traceWidth, pts: d.pts.map(function (q) { return [q[0], q[1]]; }) }); }

            draw();
        }


        // ----- pointer events -----
        const pointers = {};
        let pinch = null;

        canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

        canvas.addEventListener("pointerdown", function (e) {

            canvas.focus();

            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };

            const ids = Object.keys(pointers);

            if (ids.length === 2) {

                // Two fingers: pinch to zoom, drag to pan.
                const a = pointers[ids[0]];
                const b = pointers[ids[1]];

                pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
                drag = null;
                draft = null;

                return;
            }

            canvas.setPointerCapture(e.pointerId);

            const p = pointer(e);
            const l = active();

            if (e.button === 1 || e.button === 2 || spaceDown || tool === "pan") {

                drag = { kind: "pan", px: p.px, py: p.py, cx: view.cx, cy: view.cy };

                return;
            }

            if (!l) { setHint("Add a layer first."); return; }

            if (tool === "select") {

                const hd = hitHandle(p.x, p.y);

                if (hd) {

                    pushUndo();
                    drag = { kind: "handle", id: hd, moved: false };

                    return;
                }

                const k = pickAt(p.x, p.y);

                if (k >= 0) {

                    if (e.shiftKey) {

                        const at = sel.indexOf(k);

                        if (at >= 0) { sel.splice(at, 1); } else { sel.push(k); }

                    } else if (sel.indexOf(k) < 0) {

                        sel = [k];
                    }

                    pushUndo();

                    drag = { kind: "move", x0: p.sx, y0: p.sy, moved: false, base: JSON.stringify(sel.map(function (i) { return l.shapes[i]; })) };

                    buildProps();
                    draw();

                    return;
                }

                if (!e.shiftKey) { sel = []; }

                drag = { kind: "marquee", x0: p.x, y0: p.y, x1: p.x, y1: p.y };

                buildProps();
                draw();

                return;
            }

            if (tool === "measure") {

                if (ruler.length !== 1) { ruler = [[p.sx, p.sy]]; } else { ruler.push([p.sx, p.sy]); }

                draw();

                return;
            }

            if (tool === "r" || tool === "c" || tool === "pad") {

                if (tool === "pad" && !canPad(design, l)) {

                    setHint((E.KINDS[design.kind] || {}).padRoles ? "Pads go on a conductive layer (metal) or a channel layer (inlet and outlet ports). Pick one in the layer list." :
                        "Pads go on a conductive layer (electrode or current collector). Pick one in the layer list.");

                    return;
                }

                draft = { t: tool, x0: p.sx, y0: p.sy, x1: p.sx, y1: p.sy };
                drag = { kind: "draw" };

                return;
            }

            if (tool === "p" || tool === "t") {

                const now = Date.now();

                if (!draft) { draft = { t: tool, pts: [], cur: null }; }

                const pts = draft.pts;

                if (tool === "p" && pts.length >= 3 && Math.hypot(p.sx - pts[0][0], p.sy - pts[0][1]) < 8 / view.s) { finishPoly(); return; }

                if (now - lastTap < 350 && pts.length && Math.hypot(p.sx - pts[pts.length - 1][0], p.sy - pts[pts.length - 1][1]) < 1e-6) {

                    finishPoly();
                    lastTap = 0;

                    return;
                }

                lastTap = now;

                if (!pts.length || pts[pts.length - 1][0] !== p.sx || pts[pts.length - 1][1] !== p.sy) { pts.push([p.sx, p.sy]); }

                draft.cur = [p.sx, p.sy];

                draw();
            }
        });

        canvas.addEventListener("pointermove", function (e) {

            if (pointers[e.pointerId]) { pointers[e.pointerId] = { x: e.clientX, y: e.clientY }; }

            const ids = Object.keys(pointers);

            if (pinch && ids.length === 2) {

                const a = pointers[ids[0]];
                const b = pointers[ids[1]];

                const d = Math.hypot(a.x - b.x, a.y - b.y);
                const r = canvas.getBoundingClientRect();

                zoomAt(((a.x + b.x) / 2 - r.left) * (W / r.width), ((a.y + b.y) / 2 - r.top) * (Hh / r.height), d / pinch.d);

                view.cx -= ((a.x + b.x) / 2 - pinch.mx) * (W / r.width) / view.s;
                view.cy -= ((a.y + b.y) / 2 - pinch.my) * (Hh / r.height) / view.s;

                pinch = { d: d, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };

                draw();

                return;
            }

            const p = pointer(e);

            cursor = p;
            updateStatus(p);

            const l = active();

            if (drag) {

                if (drag.kind === "pan") {

                    view.cx = drag.cx - (p.px - drag.px) / view.s;
                    view.cy = drag.cy - (p.py - drag.py) / view.s;

                } else if (drag.kind === "draw" && draft) {

                    draft.x1 = p.sx;
                    draft.y1 = p.sy;

                } else if (drag.kind === "marquee") {

                    drag.x1 = p.x;
                    drag.y1 = p.y;

                } else if (drag.kind === "move" && l) {

                    const dx = p.sx - drag.x0;
                    const dy = p.sy - drag.y0;

                    if (dx || dy) {

                        drag.moved = true;

                        const base = JSON.parse(drag.base);

                        sel.forEach(function (i, n) { l.shapes[i] = G.moveShape(base[n], dx, dy); });
                    }

                } else if (drag.kind === "handle" && l) {

                    applyHandle(l.shapes[sel[0]], drag.id, p);
                    drag.moved = true;
                }

            } else if (tool === "p" || tool === "t") {

                if (draft) { draft.cur = [p.sx, p.sy]; }

            } else if (tool === "select" && l) {

                const k = pickAt(p.x, p.y);

                if (k !== hover) { hover = k; }

                canvas.style.cursor = hitHandle(p.x, p.y) ? "crosshair" : (k >= 0 ? "move" : "default");
            }

            if (tool !== "select") { canvas.style.cursor = tool === "pan" ? "grab" : "crosshair"; }

            draw();
        });

        function endPointer(e) {

            delete pointers[e.pointerId];

            if (pinch && Object.keys(pointers).length < 2) { pinch = null; }

            if (!drag) { return; }

            const l = active();
            const d = drag;

            drag = null;

            if (d.kind === "draw" && draft) {

                const dr = draft;

                draft = null;

                if (dr.t === "c") {

                    const r = Math.hypot(dr.x1 - dr.x0, dr.y1 - dr.y0);

                    if (r >= grid() / 2) { commitShape({ t: "c", x: dr.x0, y: dr.y0, r: Math.round(r * 100) / 100 }); }

                } else {

                    const w = Math.abs(dr.x1 - dr.x0);
                    const hh = Math.abs(dr.y1 - dr.y0);

                    if (w >= grid() / 2 && hh >= grid() / 2) {

                        const s = { t: "r", x: Math.min(dr.x0, dr.x1), y: Math.min(dr.y0, dr.y1), w: w, h: hh };

                        if (dr.t === "pad") {

                            const allowed = padLabelsFor(design, l);

                            padLabel = allowed.indexOf(padLabel) >= 0 ? padLabel : allowed[0];
                            s.pad = padLabel;
                            autoPadLabel(l);
                        }

                        commitShape(s);
                    }
                }

            } else if (d.kind === "marquee" && l) {

                const x0 = Math.min(d.x0, d.x1);
                const x1 = Math.max(d.x0, d.x1);
                const y0 = Math.min(d.y0, d.y1);
                const y1 = Math.max(d.y0, d.y1);

                if (x1 - x0 > 2 / view.s || y1 - y0 > 2 / view.s) {

                    l.shapes.forEach(function (s, k) {

                        const b = G.bboxOf([s]);

                        if (b.x0 >= x0 && b.x1 <= x1 && b.y0 >= y0 && b.y1 <= y1 && sel.indexOf(k) < 0) { sel.push(k); }
                    });
                }

                buildProps();

            } else if ((d.kind === "move" || d.kind === "handle") && l) {

                if (!d.moved) { undo.pop(); } else { changed("shapes", false); buildProps(); }
            }

            draw();
        }

        canvas.addEventListener("pointerup", endPointer);
        canvas.addEventListener("pointercancel", endPointer);

        canvas.addEventListener("pointerleave", function () { cursor = null; hover = -1; status.textContent = ""; draw(); });

        canvas.addEventListener("dblclick", function (e) {

            if (draft && (tool === "p" || tool === "t")) { e.preventDefault(); finishPoly(); }
        });

        canvas.addEventListener("wheel", function (e) {

            e.preventDefault();

            const p = pointer(e);

            zoomAt(p.px, p.py, e.deltaY < 0 ? 1.15 : 1 / 1.15);
            draw();

        }, { passive: false });

        function autoPadLabel(layer) {

            // After one pad the next is most likely its partner: + then −, A then B, inlet then outlet.
            const next = { "+": "−", "A": "B", "I": "O", "1": "2", "2": "3", "3": "4", "4": "5", "5": "6", "6": "7", "7": "8" }[padLabel];

            if (next) { padLabel = next; buildBar(); }
        }

        function applyHandle(s, id, p) {

            const g = grid();

            if (s.t === "r") {

                let x0 = s.x;
                let y0 = s.y;
                let x1 = s.x + s.w;
                let y1 = s.y + s.h;

                if (id.indexOf("w") >= 0) { x0 = Math.min(p.sx, x1 - g / 2); }
                if (id.indexOf("e") >= 0) { x1 = Math.max(p.sx, x0 + g / 2); }
                if (id.indexOf("n") >= 0) { y0 = Math.min(p.sy, y1 - g / 2); }
                if (id.indexOf("s") >= 0) { y1 = Math.max(p.sy, y0 + g / 2); }

                s.x = x0;
                s.y = y0;
                s.w = x1 - x0;
                s.h = y1 - y0;

            } else if (s.t === "c") {

                s.r = Math.max(g / 2, Math.round(Math.hypot(p.sx - s.x, p.sy - s.y) * 100) / 100);

            } else {

                const k = Number(id.slice(1));

                s.pts[k] = [p.sx, p.sy];
            }
        }


        // ----- keyboard -----
        canvas.addEventListener("keydown", function (e) {

            const l = active();
            const k = e.key;

            if (k === " ") { spaceDown = true; e.preventDefault(); return; }

            if ((e.ctrlKey || e.metaKey) && (k === "z" || k === "Z")) { e.preventDefault(); if (e.shiftKey) { doRedo(); } else { doUndo(); } return; }
            if ((e.ctrlKey || e.metaKey) && (k === "y" || k === "Y")) { e.preventDefault(); doRedo(); return; }
            if ((e.ctrlKey || e.metaKey) && (k === "d" || k === "D")) { e.preventDefault(); duplicateSel(); return; }
            if ((e.ctrlKey || e.metaKey) && (k === "a" || k === "A") && l) { e.preventDefault(); sel = l.shapes.map(function (_, i) { return i; }); buildProps(); draw(); return; }

            if (k === "Escape") { draft = null; ruler = []; drag = null; sel = []; buildProps(); draw(); return; }
            if (k === "Enter") { finishPoly(); return; }

            if ((k === "Delete" || k === "Backspace") && sel.length && l) { e.preventDefault(); deleteSel(); return; }

            if (k.indexOf("Arrow") === 0 && sel.length && l) {

                e.preventDefault();

                const step = e.shiftKey ? grid() * 10 : grid();
                const dx = k === "ArrowLeft" ? -step : k === "ArrowRight" ? step : 0;
                const dy = k === "ArrowUp" ? -step : k === "ArrowDown" ? step : 0;

                pushUndo();

                sel.forEach(function (i) { l.shapes[i] = G.moveShape(l.shapes[i], dx, dy); });

                changed("shapes", false);
                buildProps();

                return;
            }

            if (k === "+" || k === "=") { zoomAt(W / 2, Hh / 2, 1.25); draw(); return; }
            if (k === "-") { zoomAt(W / 2, Hh / 2, 0.8); draw(); return; }
            if (k === "f" || k === "F") { fitView(); draw(); return; }
            if (k === "g" || k === "G") { snapOn = !snapOn; updateBar(); return; }

            const t = TOOLS.filter(function (x) { return x.key.toLowerCase() === k.toLowerCase(); })[0];

            if (t && !e.ctrlKey && !e.metaKey) { setTool(t.id); }
        });

        canvas.addEventListener("keyup", function (e) { if (e.key === " ") { spaceDown = false; } });


        // ----- edit actions -----
        function deleteSel() {

            const l = active();

            if (!l || !sel.length) { return; }

            pushUndo();

            l.shapes = l.shapes.filter(function (_, i) { return sel.indexOf(i) < 0; });

            sel = [];

            changed("shapes", true);
        }

        function duplicateSel() {

            const l = active();

            if (!l || !sel.length) { return; }

            pushUndo();

            const off = grid() * 2;
            const added = [];

            sel.forEach(function (i) { l.shapes.push(G.moveShape(l.shapes[i], off, off)); added.push(l.shapes.length - 1); });

            sel = added;

            changed("shapes", true);
        }

        function arraySel(count, dx, dy) {

            const l = active();

            if (!l || !sel.length) { setHint("Select a shape first."); return; }

            count = Math.max(1, Math.min(200, Math.round(count)));

            if (l.shapes.length + sel.length * count > 500) { setHint("That would exceed 500 shapes on this layer."); return; }

            pushUndo();

            const src = sel.map(function (i) { return l.shapes[i]; });
            const added = [];

            for (let n = 1; n <= count; n++) {

                src.forEach(function (s) { l.shapes.push(G.moveShape(s, dx * n, dy * n)); added.push(l.shapes.length - 1); });
            }

            sel = sel.concat(added);

            changed("shapes", true);
        }

        function mirrorSel(axis) {

            const l = active();

            if (!l || !sel.length) { return; }

            pushUndo();

            const b = G.bboxOf(sel.map(function (i) { return l.shapes[i]; }));
            const cx = (b.x0 + b.x1) / 2;
            const cy = (b.y0 + b.y1) / 2;

            sel.forEach(function (i) {

                const s = l.shapes[i];

                if (s.t === "r") {

                    if (axis === "x") { s.x = 2 * cx - s.x - s.w; } else { s.y = 2 * cy - s.y - s.h; }

                } else if (s.t === "c") {

                    if (axis === "x") { s.x = 2 * cx - s.x; } else { s.y = 2 * cy - s.y; }

                } else {

                    s.pts = s.pts.map(function (q) { return axis === "x" ? [2 * cx - q[0], q[1]] : [q[0], 2 * cy - q[1]]; });
                }
            });

            changed("shapes", true);
        }

        function addFingers(N, w, g, L) {

            const l = active();

            if (!l) { return; }

            if (l.shapes.length + N + 2 > 500) { setHint("Too many shapes for this layer."); return; }

            const ide = E.ideGeometry({ N: N, w: w, g: g, L: L });
            const b = allBox();

            // Place the comb beside what is already there, or at the origin.
            const ox = b ? Math.ceil((b.x1 + 200) / grid()) * grid() : 0;
            const oy = b ? Math.ceil(b.y0 / grid()) * grid() : 0;

            pushUndo();

            const first = l.shapes.length;

            ide.bus.concat(ide.plus.map(function (f) { return { t: "r", x: f.x, y: f.y, w: f.w, h: f.h }; }),
                ide.minus.map(function (f) { return { t: "r", x: f.x, y: f.y, w: f.w, h: f.h }; })).forEach(function (s) {

                l.shapes.push({ t: "r", x: s.x + ox, y: s.y + oy, w: s.w, h: s.h });
            });

            sel = [];

            for (let k = first; k < l.shapes.length; k++) { sel.push(k); }

            changed("shapes", true);
            fitView();
            draw();
        }


        // ----- UI: toolbar -----
        function setHint(text) { hint.textContent = text; }

        function setTool(id) {

            tool = id;
            draft = null;
            drag = null;

            if (id !== "measure") { ruler = []; }

            const t = TOOLS.filter(function (x) { return x.id === id; })[0];

            setHint(t ? t.hint : "");
            updateBar();
            draw();
        }

        let barBtns = {};
        let snapBtn;
        let undoBtn;
        let redoBtn;

        function buildBar() {

            bar.innerHTML = "";
            barBtns = {};

            TOOLS.forEach(function (t) {

                const b = h("button", {
                    type: "button", className: "ed-tool", title: t.name + " (" + t.key + ")", "aria-label": t.name,
                    "aria-pressed": tool === t.id ? "true" : "false",
                    onclick: function () { setTool(t.id); canvas.focus(); }
                }, [h("span", { className: "ed-ico ed-ico-" + t.id, "aria-hidden": "true" }), h("span", { className: "ed-name", text: t.name })]);

                barBtns[t.id] = b;
                bar.appendChild(b);
            });

            bar.appendChild(h("span", { className: "ed-sep" }));

            undoBtn = h("button", { type: "button", className: "ed-tool small", title: "Undo (Ctrl+Z)", "aria-label": "Undo", text: "Undo", onclick: doUndo });
            redoBtn = h("button", { type: "button", className: "ed-tool small", title: "Redo (Ctrl+Y)", "aria-label": "Redo", text: "Redo", onclick: doRedo });

            bar.appendChild(undoBtn);
            bar.appendChild(redoBtn);

            bar.appendChild(h("span", { className: "ed-sep" }));

            bar.appendChild(h("button", { type: "button", className: "ed-tool small", text: "−", title: "Zoom out (-)", "aria-label": "Zoom out", onclick: function () { zoomAt(W / 2, Hh / 2, 0.8); draw(); } }));
            bar.appendChild(h("button", { type: "button", className: "ed-tool small", text: "+", title: "Zoom in (+)", "aria-label": "Zoom in", onclick: function () { zoomAt(W / 2, Hh / 2, 1.25); draw(); } }));
            bar.appendChild(h("button", { type: "button", className: "ed-tool small", text: "Fit", title: "Fit to drawing (F)", onclick: function () { fitView(); draw(); } }));

            bar.appendChild(h("span", { className: "ed-sep" }));

            snapBtn = h("button", { type: "button", className: "ed-tool small", title: "Snap to grid (G)", onclick: function () { snapOn = !snapOn; updateBar(); } });

            bar.appendChild(snapBtn);

            const gsel = h("select", {
                className: "ed-select", "aria-label": "Grid size",
                onchange: function (e) { design.grid = Number(e.target.value); onChange("props"); draw(); }
            }, [0.5, 1, 2, 5, 10, 20, 50, 100].map(function (g) { return h("option", { value: String(g), text: "Grid " + g + " µm" }); }));

            gsel.value = String(grid());

            bar.appendChild(gsel);

            // Tool options.
            const opts2 = h("span", { className: "ed-opts" });

            if (tool === "t") {

                const wi = h("input", {
                    type: "number", className: "ed-num", min: "1", max: "1000", step: String(grid()), value: String(traceWidth), "aria-label": "Trace width in micrometres",
                    onchange: function (e) { traceWidth = Math.max(1, Number(e.target.value) || 10); }
                });

                opts2.appendChild(h("label", { className: "ed-opt" }, ["Width ", wi, " µm"]));
            }

            if (tool === "pad") {

                const ps = h("select", {
                    className: "ed-select", "aria-label": "Pad label",
                    onchange: function (e) { padLabel = e.target.value; }
                }, padLabelsFor(design).map(function (p) { return h("option", { value: p, text: "Label " + p + padRoleHint(design, p) }); }));

                ps.value = padLabel;

                opts2.appendChild(ps);
            }

            bar.appendChild(opts2);

            updateBar();
        }

        function updateBar() {

            Object.keys(barBtns).forEach(function (id) { barBtns[id].setAttribute("aria-pressed", id === tool ? "true" : "false"); });

            if (snapBtn) {

                snapBtn.textContent = "Snap " + (snapOn ? "on" : "off");
                snapBtn.setAttribute("aria-pressed", snapOn ? "true" : "false");
            }

            if (undoBtn) { undoBtn.disabled = !undo.length; }
            if (redoBtn) { redoBtn.disabled = !redo.length; }
        }

        function updateStatus(p) {

            if (!p) { status.textContent = ""; return; }

            status.textContent = "x " + p.sx.toFixed(grid() < 1 ? 2 : 0) + "  y " + p.sy.toFixed(grid() < 1 ? 2 : 0) + " µm";
        }


        // ----- UI: side panel -----
        let layersBox;
        let propsBox;
        let measureBox;

        function buildSide() {

            side.innerHTML = "";

            layersBox = h("div", { className: "ed-card" });
            propsBox = h("div", { className: "ed-card" });
            measureBox = h("div", { className: "ed-card", "aria-live": "polite" });

            side.appendChild(layersBox);
            side.appendChild(propsBox);
            side.appendChild(measureBox);

            buildLayers();
            buildProps();
            buildMeasure();
        }

        function buildLayers() {

            layersBox.innerHTML = "";

            layersBox.appendChild(h("h3", { text: "Layers (bottom to top)" }));

            const list = h("div", { className: "ed-layers", role: "listbox", "aria-label": "Layers" });

            for (let i = design.layers.length - 1; i >= 0; i--) {

                const l = design.layers[i];

                const row = h("div", { className: "ed-layer" + (l.id === activeId ? " active" : ""), role: "option", "aria-selected": l.id === activeId ? "true" : "false" }, [
                    h("button", {
                        type: "button", className: "ed-eye" + (l.visible ? " on" : ""), "aria-label": (l.visible ? "Hide " : "Show ") + l.name, title: "Show / hide",
                        onclick: function () { l.visible = !l.visible; onChange("props"); buildLayers(); draw(); }
                    }, [h("span", { className: "ed-swatch", style: "background:" + E.ROLES[l.role].color })]),
                    h("button", {
                        type: "button", className: "ed-layer-name",
                        onclick: function () { activeId = l.id; sel = []; buildSide(); draw(); }
                    }, [h("strong", { text: l.name }), h("span", { text: E.ROLES[l.role].name.split(" (")[0].split(" /")[0] + " · " + l.shapes.length + " shape" + (l.shapes.length === 1 ? "" : "s") })])
                ]);

                list.appendChild(row);
            }

            layersBox.appendChild(list);

            const add = h("select", { className: "ed-select", "aria-label": "Add a layer", onchange: function (e) {

                const role = e.target.value;

                if (!role) { return; }

                if (design.layers.length >= 8) { setHint("Eight layers is the limit in this lab."); e.target.value = ""; return; }

                pushUndo();

                const nl = E.newLayer(role);

                nl.name = nl.name + " " + (design.layers.filter(function (x) { return x.role === role; }).length + 1);

                design.layers.push(nl);
                activeId = nl.id;
                sel = [];

                changed("layers", true);
            } }, [h("option", { value: "", text: "+ Add layer…" })].concat(rolesFor(design).map(function (r) {

                return h("option", { value: r, text: E.ROLES[r].name });
            })));

            const mv = h("div", { className: "ed-row" }, [
                h("button", { type: "button", className: "ed-mini", text: "Move up", onclick: function () { moveLayer(1); } }),
                h("button", { type: "button", className: "ed-mini", text: "Move down", onclick: function () { moveLayer(-1); } }),
                h("button", { type: "button", className: "ed-mini danger", text: "Delete layer", onclick: deleteLayer })
            ]);

            layersBox.appendChild(add);
            layersBox.appendChild(mv);

            const dim = h("select", {
                className: "ed-select", "aria-label": "Other layers",
                onchange: function (e) { showOthers = e.target.value; draw(); }
            }, [["dim", "Other layers: dimmed"], ["all", "Other layers: bright"], ["off", "Other layers: hidden"]].map(function (o) { return h("option", { value: o[0], text: o[1] }); }));

            dim.value = showOthers;

            layersBox.appendChild(dim);

            // Properties of the active layer.
            const l = active();

            if (!l) { return; }

            const props = h("div", { className: "ed-props" });

            props.appendChild(h("label", { className: "ed-field" }, ["Name", h("input", {
                type: "text", className: "ed-text", maxlength: "30", value: l.name,
                oninput: function (e) { l.name = e.target.value.slice(0, 30); onChange("props"); },
                onchange: function () { buildLayers(); }
            })]));

            const roleSel = h("select", { className: "ed-select", "aria-label": "Layer type", onchange: function (e) {

                pushUndo();
                l.role = e.target.value;
                l.material = E.defaultMaterial(l.role, design.kind);
                l.treat = "none";
                l.mode = E.defaultMode(l.role, l.material);
                delete l.pore;
                delete l.porosity;
                l.thickness = l.role === "electrode" ? 10 : (E.MATERIAL_TABLE[l.role][l.material].thick || 1);

                const d = E.defaultPatterning(l);

                l.mask = d.mask;
                l.litho = d.litho;

                E.syncLayer(l);
                changed("layers", true);
            } }, rolesFor(design).map(function (r) { return h("option", { value: r, text: E.ROLES[r].name }); }));

            roleSel.value = l.role;

            props.appendChild(h("label", { className: "ed-field" }, ["Type", roleSel]));

            const matSel = h("select", { className: "ed-select", "aria-label": "Material", onchange: function (e) {

                pushUndo();
                l.material = e.target.value;

                if (l.role !== "electrode") { l.thickness = E.MATERIAL_TABLE[l.role][l.material].thick || l.thickness; }

                if (l.role === "channel") { l.mode = E.defaultMode(l.role, l.material); }

                if (l.role === "membrane") { delete l.pore; delete l.porosity; }

                const d = E.defaultPatterning(l);

                l.mask = d.mask;
                l.litho = d.litho;

                E.syncLayer(l);
                changed("layers", true);
            } }, E.materialKeys(l.role, design.kind).map(function (k) { return h("option", { value: k, text: E.MATERIAL_TABLE[l.role][k].name }); }));

            matSel.value = l.material;

            props.appendChild(h("label", { className: "ed-field" }, ["Material", matSel]));

            props.appendChild(h("label", { className: "ed-field" }, ["Thickness (µm)", h("input", {
                type: "number", className: "ed-text", min: "0.0003", max: "100", step: "0.001", value: String(l.thickness),
                onchange: function (e) {

                    pushUndo();
                    l.thickness = Math.max(0.0003, Math.min(100, Number(e.target.value) || 1));
                    E.syncLayer(l);
                    changed("layers", true);
                }
            })]));

            if (l.role === "insulation" || l.role === "channel") {

                const modeSel = h("select", { className: "ed-select", "aria-label": "Drawn shapes are", onchange: function (e) {

                    pushUndo();
                    l.mode = e.target.value;

                    const dp = E.defaultPatterning(l);

                    l.mask = dp.mask;
                    changed("layers", true);
                } }, l.role === "channel" ?
                    [h("option", { value: "cut", text: "Channels are openings cut in a wall film (SU-8, dry film)" }), h("option", { value: "add", text: "Channels are raised features on a master (PDMS molding)" })] :
                    [h("option", { value: "cut", text: "Windows cut through a film that covers everything" }), h("option", { value: "add", text: "Insulator exists only where drawn" })]);

                modeSel.value = l.mode;

                props.appendChild(h("label", { className: "ed-field" }, ["Drawn shapes are", modeSel]));
            }

            layersBox.appendChild(props);
        }

        function moveLayer(dir) {

            const i = design.layers.findIndex(function (l) { return l.id === activeId; });
            const j = i + dir;

            if (i < 0 || j < 0 || j >= design.layers.length) { return; }

            pushUndo();

            const t = design.layers[i];

            design.layers[i] = design.layers[j];
            design.layers[j] = t;

            changed("layers", true);
        }

        function deleteLayer() {

            if (design.layers.length <= 1) { setHint("Keep at least one layer."); return; }

            const l = active();

            if (!l) { return; }

            if (l.shapes.length && !window.confirm("Delete layer “" + l.name + "” and its " + l.shapes.length + " shapes?")) { return; }

            pushUndo();

            const i = design.layers.indexOf(l);

            design.layers.splice(i, 1);
            activeId = design.layers[Math.max(0, i - 1)].id;
            sel = [];

            changed("layers", true);
        }

        function buildProps() {

            if (!propsBox) { return; }

            propsBox.innerHTML = "";

            const l = active();

            propsBox.appendChild(h("h3", { text: sel.length > 1 ? sel.length + " shapes selected" : "Selected shape" }));

            if (!l || !sel.length) {

                propsBox.appendChild(h("p", { className: "ed-muted", text: "Nothing selected. Use the Select tool and click a shape, or drag a box around several." }));

                return;
            }

            if (sel.length > 1) {

                const shapes = sel.map(function (i) { return l.shapes[i]; }).filter(Boolean);
                const b = G.bboxOf(shapes);
                const total = shapes.reduce(function (s, x) { return s + G.shapeInfo(x).area; }, 0);

                propsBox.appendChild(h("p", { className: "ed-muted", text: "Bounding box " + fmtLen(b.x1 - b.x0) + " × " + fmtLen(b.y1 - b.y0) + ". Total shape area " + fmtArea(total) + " (overlaps counted twice)." }));

            } else {

                const s = l.shapes[sel[0]];

                if (!s) { return; }

                const info = G.shapeInfo(s);

                const num = function (label, get, set, step) {

                    return h("label", { className: "ed-field inline" }, [label, h("input", {
                        type: "number", className: "ed-text", step: String(step || grid()), value: String(Math.round(get() * 100) / 100),
                        onchange: function (e) {

                            const v = Number(e.target.value);

                            if (!isFinite(v)) { return; }

                            pushUndo();
                            set(v);
                            changed("shapes", false);
                            buildProps();
                        }
                    })]);
                };

                const grp = h("div", { className: "ed-grid2" });

                if (s.t === "r") {

                    grp.appendChild(num("x", function () { return s.x; }, function (v) { s.x = v; }));
                    grp.appendChild(num("y", function () { return s.y; }, function (v) { s.y = v; }));
                    grp.appendChild(num("width", function () { return s.w; }, function (v) { s.w = Math.max(0.5, v); }));
                    grp.appendChild(num("height", function () { return s.h; }, function (v) { s.h = Math.max(0.5, v); }));

                } else if (s.t === "c") {

                    grp.appendChild(num("centre x", function () { return s.x; }, function (v) { s.x = v; }));
                    grp.appendChild(num("centre y", function () { return s.y; }, function (v) { s.y = v; }));
                    grp.appendChild(num("radius", function () { return s.r; }, function (v) { s.r = Math.max(0.5, v); }));

                } else if (s.t === "t") {

                    grp.appendChild(num("width", function () { return s.w; }, function (v) { s.w = Math.max(0.5, v); }));

                } else {

                    grp.appendChild(h("p", { className: "ed-muted", text: s.pts.length + " corners. Drag the square handles to reshape." }));
                }

                propsBox.appendChild(grp);

                if (s.t === "r" && canPad(design, l)) {

                    const ps = h("select", { className: "ed-select", "aria-label": "Contact pad label", onchange: function (e) {

                        pushUndo();

                        if (e.target.value) { s.pad = e.target.value; } else { delete s.pad; }

                        changed("shapes", false);
                    } }, [h("option", { value: "", text: "Not a contact pad" })].concat(padLabelsFor(design, l).map(function (p) { return h("option", { value: p, text: "Contact pad " + p + padRoleHint(design, p) }); })));

                    ps.value = s.pad || "";

                    propsBox.appendChild(h("label", { className: "ed-field" }, ["Pad", ps]));
                }

                const rows = [
                    ["Size", fmtLen(info.w) + " × " + fmtLen(info.h)],
                    ["Area", fmtArea(info.area)],
                    ["Perimeter", fmtLen(info.perimeter)],
                    ["Smallest dimension", fmtLen(info.minDim)]
                ];

                if (s.t === "t") { rows.splice(1, 0, ["Length", fmtLen(info.length)]); }

                rows.forEach(function (r) {

                    propsBox.appendChild(h("div", { className: "ed-kv" }, [h("span", { text: r[0] }), h("strong", { text: r[1] })]));
                });
            }

            const acts = h("div", { className: "ed-row" }, [
                h("button", { type: "button", className: "ed-mini", text: "Duplicate", onclick: duplicateSel }),
                h("button", { type: "button", className: "ed-mini", text: "Mirror ↔", onclick: function () { mirrorSel("x"); } }),
                h("button", { type: "button", className: "ed-mini", text: "Mirror ↕", onclick: function () { mirrorSel("y"); } }),
                h("button", { type: "button", className: "ed-mini danger", text: "Delete", onclick: deleteSel })
            ]);

            propsBox.appendChild(acts);

            // Repeat.
            const n = h("input", { type: "number", className: "ed-text", min: "1", max: "200", value: "5", "aria-label": "Number of copies" });
            const dx = h("input", { type: "number", className: "ed-text", step: String(grid()), value: "150", "aria-label": "Spacing in x (um)" });
            const dy = h("input", { type: "number", className: "ed-text", step: String(grid()), value: "0", "aria-label": "Spacing in y (um)" });

            propsBox.appendChild(h("div", { className: "ed-array" }, [
                h("strong", { text: "Repeat (array)" }),
                h("div", { className: "ed-grid3" }, [
                    h("label", { className: "ed-field inline" }, ["copies", n]),
                    h("label", { className: "ed-field inline" }, ["step x", dx]),
                    h("label", { className: "ed-field inline" }, ["step y", dy])
                ]),
                h("button", { type: "button", className: "ed-mini", text: "Make copies", onclick: function () { arraySel(Number(n.value), Number(dx.value) || 0, Number(dy.value) || 0); } })
            ]));
        }

        function scheduleMetrics() {

            clearTimeout(metricsTimer.id);

            metricsTimer.id = setTimeout(buildMeasure, 150);
        }

        function buildMeasure() {

            if (!measureBox) { return; }

            measureBox.innerHTML = "";

            measureBox.appendChild(h("h3", { text: "Footprint and features" }));

            const sum = E.summarize(design);

            if (!sum.bbox) {

                measureBox.appendChild(h("p", { className: "ed-muted", text: "Draw something to see its footprint and smallest features." }));
                measureBox.appendChild(buildAddFingers());

                return;
            }

            const kv = function (a, b, cls) {

                return h("div", { className: "ed-kv " + (cls || "") }, [h("span", { text: a }), h("strong", { text: b })]);
            };

            measureBox.appendChild(kv("Footprint (all layers)", fmtLen(sum.width) + " × " + fmtLen(sum.height)));
            measureBox.appendChild(kv("Footprint area", fmtArea(sum.footprintUm2)));

            const l = active();

            if (l) {

                const m = E.layerMetrics(l);
                const pt = E.patterning(l, m);

                measureBox.appendChild(h("h4", { text: "Layer: " + l.name }));
                measureBox.appendChild(kv("Shapes", String(m.count)));
                measureBox.appendChild(kv(l.mode === "cut" ? "Open area (windows)" : "Material area", fmtArea(m.area)));

                if (m.bbox) { measureBox.appendChild(kv("Layer size", fmtLen(m.bbox.x1 - m.bbox.x0) + " × " + fmtLen(m.bbox.y1 - m.bbox.y0))); }

                const limit = pt.limit;

                const featOk = !isFinite(m.featureMin) || m.featureMin >= 1.5 * limit;
                const gapOk = !isFinite(m.gapMin) || m.gapMin >= 1.5 * limit;

                measureBox.appendChild(kv(l.mode === "cut" ? "Smallest wall between windows" : "Smallest feature", fmtLen(m.featureMin), featOk ? "ok" : "warn"));
                measureBox.appendChild(kv(l.mode === "cut" ? "Smallest window" : "Smallest gap", fmtLen(m.gapMin), gapOk ? "ok" : "warn"));
                measureBox.appendChild(kv("Process limit (mask + resist)", "about " + fmtLen(limit)));

                if (!featOk || !gapOk) { measureBox.appendChild(h("p", { className: "ed-warn", text: "Something on this layer is close to or below what the chosen mask and resist can print. Widen it, or switch to a chrome mask in the Process step." })); }
            }

            const issues = E.checkDesign(design).filter(function (c) { return c.level !== "info"; }).slice(0, 5);

            if (issues.length) {

                measureBox.appendChild(h("h4", { text: "Checks" }));

                issues.forEach(function (c) { measureBox.appendChild(h("p", { className: c.level === "error" ? "ed-err" : "ed-warn", text: c.text })); });
            }

            measureBox.appendChild(buildAddFingers());
        }

        function buildAddFingers() {

            if (design.kind !== "supercap") { return h("span"); }

            const box = h("details", { className: "ed-fingers" });

            box.appendChild(h("summary", { text: "Quick shape: interdigitated fingers" }));

            const f = { N: 12, w: 100, g: 60, L: 3000 };

            const field = function (label, key, min, max) {

                return h("label", { className: "ed-field inline" }, [label, h("input", {
                    type: "number", className: "ed-text", min: String(min), max: String(max), value: String(f[key]),
                    onchange: function (e) { f[key] = Math.max(min, Math.min(max, Number(e.target.value) || f[key])); }
                })]);
            };

            box.appendChild(h("div", { className: "ed-grid2" }, [
                field("fingers", "N", 4, 60), field("width µm", "w", 5, 1000),
                field("gap µm", "g", 5, 1000), field("length µm", "L", 100, 20000)
            ]));

            box.appendChild(h("button", {
                type: "button", className: "ed-mini", text: "Add to this layer",
                onclick: function () { addFingers(Math.round(f.N / 2) * 2, f.w, f.g, f.L); }
            }));

            return box;
        }


        // ----- sizing -----
        function resize() {

            const r = stage.getBoundingClientRect();

            const w = Math.max(280, Math.round(r.width || 700));
            const hh = w < 520 ? 400 : Math.max(420, Math.min(620, Math.round(w * 0.62)));

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            W = w;
            Hh = hh;

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(hh * dpr);
            canvas.style.height = hh + "px";

            draw();
        }

        let ro = null;

        if (window.ResizeObserver) {

            ro = new ResizeObserver(function () {

                // Resize on the next frame: resizing inside the callback triggers a harmless but noisy loop warning.
                requestAnimationFrame(function () {

                    const r = stage.getBoundingClientRect();

                    if (Math.abs(r.width - W) > 2) { resize(); }
                });
            });

            ro.observe(stage);

        } else {

            window.addEventListener("resize", resize);
        }

        buildBar();
        buildSide();
        setHint(TOOLS[0].hint);

        // The stage must be in the page before it has a width.
        setTimeout(function () { resize(); fitView(); draw(); }, 0);

        return {

            refresh: function () { buildSide(); draw(); },
            setActive: function (id) { activeId = id; buildSide(); draw(); },
            fit: function () { fitView(); draw(); },
            destroy: function () { if (ro) { ro.disconnect(); } window.removeEventListener("resize", resize); clearTimeout(metricsTimer.id); host.innerHTML = ""; }
        };
    }


    root.LabEditor = { mount: mount, fmtLen: fmtLen, fmtArea: fmtArea };

}(typeof window !== "undefined" ? window : globalThis));
