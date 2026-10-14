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
        { id: "hole", name: "Hole", key: "O", hint: "Click to place a round hole of the set diameter. It cuts through every shape under it on the active layer." },
        { id: "dim", name: "Smart Dimension", key: "S", hint: "Click an edge, circle or shape, then click empty space to dimension it, or click a second shape to dimension the distance. Type the value you want (2.5 mm, 300 nm, 2*40) and press Enter." },
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


    const UNITS = {
        nm: { k: 1000, label: "nm" },
        um: { k: 1, label: "µm" },
        mm: { k: 0.001, label: "mm" }
    };

    // Reads a length typed by a person: "12.5", "2.5 mm", "300nm", "2*40", "(100 - 2*5) um".
    // A bare number is in the given unit. Returns micrometres, or NaN.
    function parseLength(text, unit) {

        let t = String(text || "").trim().toLowerCase().replace(/[µμ]/g, "u").replace(/,/g, "");
        let u = unit || "um";

        const m = t.match(/(nm|um|mm|cm|m)\s*$/);

        if (m) { u = m[1]; t = t.slice(0, m.index); }

        const toUm = { nm: 0.001, um: 1, mm: 1000, cm: 10000, m: 1e6 };
        const v = evalMath(t);

        return isFinite(v) ? v * toUm[u] : NaN;
    }

    // + - * / and brackets, nothing else.
    function evalMath(text) {

        const tokens = text.match(/\d*\.?\d+(?:e[+-]?\d+)?|[-+*/()]|\S/g) || [];
        let i = 0;

        function peek() { return tokens[i]; }

        function atom() {

            const t = tokens[i++];

            if (t === "(") { const v = sum(); if (tokens[i++] !== ")") { return NaN; } return v; }
            if (t === "-") { return -atom(); }
            if (t === "+") { return atom(); }

            return t !== undefined && /^\d*\.?\d+(e[+-]?\d+)?$/.test(t) ? parseFloat(t) : NaN;
        }

        function product() {

            let v = atom();

            while (peek() === "*" || peek() === "/") { const op = tokens[i++]; const b = atom(); v = op === "*" ? v * b : v / b; }

            return v;
        }

        function sum() {

            let v = product();

            while (peek() === "+" || peek() === "-") { const op = tokens[i++]; const b = product(); v = op === "+" ? v + b : v - b; }

            return v;
        }

        if (!tokens.length) { return NaN; }

        const v = sum();

        return i === tokens.length ? v : NaN;
    }


    function fmtLenAuto(um) {

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

        let cutMode = false;      // new rectangles, circles, polygons and traces are holes
        let holeD = 10;           // Hole tool diameter (um)

        // Smart dimensions: first pick, hover target, selected dimension, label hit boxes, open editor.
        let dimPick = null;
        let dimHover = null;
        let dimSel = -1;
        let dimBoxes = [];
        let dimInput = null;

        if (!Array.isArray(design.dims)) { design.dims = []; }
        if (!UNITS[design.units]) { design.units = "um"; }

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

        // ----- units -----
        // Everything is stored in micrometres; the chosen unit is only for showing and typing.
        function unitOf() { return UNITS[design.units] ? design.units : "um"; }
        function toU(um) { return um * UNITS[unitOf()].k; }
        function fromU(v) { return v / UNITS[unitOf()].k; }
        function roundU(um) { return Math.round(toU(um) * 1000) / 1000; }

        // Every length label in the editor goes through this, so it follows the chosen unit.
        // In micrometres it keeps the automatic µm / mm switching.
        function fmtLen(um) {

            if (unitOf() === "um") { return fmtLenAuto(um); }

            if (!isFinite(um)) { return "none"; }

            const v = toU(um);
            const a = Math.abs(v);
            const d = a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : 4;

            return String(Number(v.toFixed(d))) + " " + UNITS[unitOf()].label;
        }

        function parseLen(text) { return parseLength(text, unitOf()); }

        function toScreen(x, y) { return [(x - view.cx) * view.s + W / 2, (y - view.cy) * view.s + Hh / 2]; }
        function toWorld(px, py) { return [(px - W / 2) / view.s + view.cx, (py - Hh / 2) / view.s + view.cy]; }

        function pointer(e) {

            const r = canvas.getBoundingClientRect();

            const px = (e.clientX - r.left) * (W / r.width);
            const py = (e.clientY - r.top) * (Hh / r.height);

            const w = toWorld(px, py);

            return { px: px, py: py, x: w[0], y: w[1], sx: snap(w[0]), sy: snap(w[1]) };
        }

        function snapshot() { return JSON.stringify({ l: design.layers, d: design.dims }); }

        function pushUndo() {

            undo.push(snapshot());

            if (undo.length > 60) { undo.shift(); }

            redo.length = 0;
        }

        function restore(text) {

            const snap1 = JSON.parse(text);
            const layers = Array.isArray(snap1) ? snap1 : snap1.l;

            design.layers.length = 0;
            layers.forEach(function (l) { design.layers.push(l); });

            design.dims.length = 0;
            (snap1.d || []).forEach(function (m) { design.dims.push(m); });
            dimSel = -1;

            if (!layerById(activeId)) { activeId = design.layers.length ? design.layers[design.layers.length - 1].id : ""; }

            sel = [];
        }

        function doUndo() {

            if (!undo.length) { return; }

            redo.push(snapshot());
            restore(undo.pop());
            changed("shapes", true);
        }

        function doRedo() {

            if (!redo.length) { return; }

            undo.push(snapshot());
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

                    if (s.cut) { return; }

                    ctx.beginPath();
                    tracePath(ctx, s);
                    ctx.stroke();

                    ctx.fillStyle = "rgba(11,16,32,0.55)";
                    ctx.fill();
                });

                // In a film of windows, a cut shape puts the film back.
                l.shapes.forEach(function (s) {

                    if (!s.cut) { return; }

                    ctx.beginPath();
                    tracePath(ctx, s);
                    ctx.fillStyle = layerColor(l, alpha * 0.35);
                    ctx.fill();
                });

                ctx.restore();

                drawCutOutlines(l, alpha, isActive);

                return;
            }

            const cuts = l.shapes.some(function (s) { return s.cut; });

            // With holes, paint the layer on its own canvas, erase the holes, then copy it over.
            const c = cuts ? offCanvas() : ctx;

            c.fillStyle = layerColor(l, alpha * 0.55);
            c.strokeStyle = layerColor(l, Math.min(1, alpha + 0.3));
            c.lineWidth = isActive ? 1.6 : 1;

            l.shapes.forEach(function (s) {

                if (s.cut) { return; }

                c.beginPath();
                tracePath(c, s);
                c.fill();
                c.stroke();

                if (s.pad) {

                    const b = G.bboxOf([s]);
                    const p = toScreen((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2);

                    c.fillStyle = "#06201b";
                    c.font = "700 " + Math.max(11, Math.min(34, (b.x1 - b.x0) * view.s * 0.5)) + "px Inter, Arial, sans-serif";
                    c.textAlign = "center";
                    c.textBaseline = "middle";
                    c.fillText(s.pad, p[0], p[1]);
                    c.fillStyle = layerColor(l, alpha * 0.55);
                }
            });

            if (cuts) {

                c.globalCompositeOperation = "destination-out";
                c.fillStyle = "#000";

                l.shapes.forEach(function (s) {

                    if (!s.cut) { return; }

                    c.beginPath();
                    tracePath(c, s);
                    c.fill();
                });

                c.globalCompositeOperation = "source-over";

                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.drawImage(off, 0, 0);
                ctx.restore();

                drawCutOutlines(l, alpha, isActive);
            }
        }

        let off = null;

        function offCanvas() {

            if (!off) { off = document.createElement("canvas"); }

            if (off.width !== canvas.width || off.height !== canvas.height) { off.width = canvas.width; off.height = canvas.height; }

            const c = off.getContext("2d");

            c.setTransform(1, 0, 0, 1, 0, 0);
            c.clearRect(0, 0, off.width, off.height);
            c.setTransform(canvas.width / W, 0, 0, canvas.height / Hh, 0, 0);

            return c;
        }

        // Holes get a fine dashed outline so they can be seen and picked.
        function drawCutOutlines(l, alpha, isActive) {

            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = isActive ? 1.4 : 1;
            ctx.strokeStyle = layerColor(l, Math.min(1, alpha + 0.4));

            l.shapes.forEach(function (s) {

                if (!s.cut) { return; }

                ctx.beginPath();
                tracePath(ctx, s);
                ctx.stroke();
            });

            ctx.restore();
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

            drawDims();

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

            const target = toU(120 / view.s);
            const mag = Math.pow(10, Math.floor(Math.log10(target)));
            const norm = target / mag;
            const len = fromU((norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag);

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


        // ----- smart dimensions -----
        // A dimension points at shapes on one layer by index: { id, layer, a: { k, f }, b?: { k, f }, dir? }.
        // Features (f): w h (rectangle width, height), d (circle diameter), tw (trace width),
        // e<i> (polygon edge i), s<i> (trace segment i), and for distances L R T B (rectangle sides) or C (centre).
        // The label always shows the live size; typing a new value moves the geometry to match.

        const DIM_COLOR = "#ffd36b";

        function dimLayer(m) { return layerById(m.layer); }

        function featOk(s, f) {

            if (!s) { return false; }
            if (f === "C") { return true; }
            if (f === "w" || f === "h" || f === "L" || f === "R" || f === "T" || f === "B") { return s.t === "r"; }
            if (f === "d") { return s.t === "c"; }
            if (f === "tw") { return s.t === "t"; }

            const i = Number(f.slice(1));

            if (f[0] === "e") { return s.t === "p" && i < s.pts.length; }
            if (f[0] === "s") { return s.t === "t" && i + 1 < s.pts.length; }

            return false;
        }

        function dimValid(m) {

            const l = dimLayer(m);

            if (!l || !featOk(l.shapes[m.a.k], m.a.f)) { return false; }

            return !m.b || (featOk(l.shapes[m.b.k], m.b.f) && m.b.k !== m.a.k);
        }

        function pruneDims() {

            for (let i = design.dims.length - 1; i >= 0; i--) { if (!dimValid(design.dims[i])) { design.dims.splice(i, 1); } }
        }

        function centreOf(s) {

            if (s.t === "c") { return [s.x, s.y]; }

            const b = G.bboxOf([s]);

            return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
        }

        // The point a distance is measured from.
        function featPoint(s, f) {

            const c = centreOf(s);

            if (s.t === "r") {

                if (f === "L") { return [s.x, c[1]]; }
                if (f === "R") { return [s.x + s.w, c[1]]; }
                if (f === "T") { return [c[0], s.y]; }
                if (f === "B") { return [c[0], s.y + s.h]; }
            }

            return c;
        }

        function edgeOf(s, f) {

            const i = Number(f.slice(1));
            const n = s.pts.length;

            return f[0] === "e" ? [s.pts[i], s.pts[(i + 1) % n]] : [s.pts[i], s.pts[i + 1]];
        }

        function dimValue(m) {

            const l = dimLayer(m);
            const a = l.shapes[m.a.k];

            if (m.b) {

                const pa = featPoint(a, m.a.f);
                const pb = featPoint(l.shapes[m.b.k], m.b.f);

                return m.dir === "v" ? Math.abs(pb[1] - pa[1]) : Math.abs(pb[0] - pa[0]);
            }

            const f = m.a.f;

            if (f === "w") { return a.w; }
            if (f === "h") { return a.h; }
            if (f === "d") { return 2 * a.r; }
            if (f === "tw") { return a.w; }

            const e = edgeOf(a, f);

            return Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]);
        }

        function dimName(m) {

            if (m.b) { return m.dir === "v" ? "vertical distance" : "horizontal distance"; }

            return { w: "width", h: "height", d: "diameter", tw: "trace width" }[m.a.f] || (m.a.f[0] === "e" ? "edge length" : "segment length");
        }

        // Drive the geometry so the dimension reads v (um).
        function applyDim(m, v) {

            const l = dimLayer(m);
            const a = l.shapes[m.a.k];
            const f = m.a.f;

            if (m.b) {

                const k = m.b.k;
                const pa = featPoint(a, f);
                const pb = featPoint(l.shapes[k], m.b.f);
                const cur = m.dir === "v" ? pb[1] - pa[1] : pb[0] - pa[0];
                const shift = (cur < 0 ? -v : v) - cur;

                l.shapes[k] = G.moveShape(l.shapes[k], m.dir === "v" ? 0 : shift, m.dir === "v" ? shift : 0);

                return;
            }

            if (f === "w") { a.w = v; return; }
            if (f === "h") { a.h = v; return; }
            if (f === "d") { a.r = v / 2; return; }
            if (f === "tw") { a.w = v; return; }

            const i = Number(f.slice(1));
            const e = edgeOf(a, f);
            const len = Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]) || 1;
            const nx = e[0][0] + (e[1][0] - e[0][0]) * v / len;
            const ny = e[0][1] + (e[1][1] - e[0][1]) * v / len;
            const dx = nx - e[1][0];
            const dy = ny - e[1][1];

            if (f[0] === "e") {

                a.pts[(i + 1) % a.pts.length] = [nx, ny];

            } else {

                // A trace keeps its shape past the segment: everything after it moves along.
                for (let j = i + 1; j < a.pts.length; j++) { a.pts[j] = [a.pts[j][0] + dx, a.pts[j][1] + dy]; }
            }
        }

        // What the Smart Dimension tool would pick at (x, y) on the active layer.
        function featAt(x, y) {

            const l = active();

            if (!l) { return null; }

            const tol = 6 / view.s;

            for (let k = l.shapes.length - 1; k >= 0; k--) {

                const s = l.shapes[k];

                if (s.t === "r") {

                    const inX = x >= s.x - tol && x <= s.x + s.w + tol;
                    const inY = y >= s.y - tol && y <= s.y + s.h + tol;

                    if (inX && Math.abs(y - s.y) <= tol) { return { k: k, f: "T" }; }
                    if (inX && Math.abs(y - s.y - s.h) <= tol) { return { k: k, f: "B" }; }
                    if (inY && Math.abs(x - s.x) <= tol) { return { k: k, f: "L" }; }
                    if (inY && Math.abs(x - s.x - s.w) <= tol) { return { k: k, f: "R" }; }
                    if (inX && inY) { return { k: k, f: "C" }; }

                } else if (s.t === "c") {

                    if (Math.hypot(x - s.x, y - s.y) <= s.r + tol) { return { k: k, f: "d" }; }

                } else if (s.t === "p") {

                    for (let i = 0; i < s.pts.length; i++) {

                        const a = s.pts[i];
                        const b = s.pts[(i + 1) % s.pts.length];

                        if (Math.sqrt(G.pointSegDist2(x, y, a[0], a[1], b[0], b[1])) <= tol) { return { k: k, f: "e" + i }; }
                    }

                    if (G.pointInPoly(x, y, s.pts)) { return { k: k, f: "C" }; }

                } else if (s.t === "t") {

                    for (let i = 0; i + 1 < s.pts.length; i++) {

                        const a = s.pts[i];
                        const b = s.pts[i + 1];

                        if (Math.sqrt(G.pointSegDist2(x, y, a[0], a[1], b[0], b[1])) <= s.w / 2 + tol) { return { k: k, f: "s" + i }; }
                    }
                }
            }

            return null;
        }

        // One pick made, then a click on empty space (or Enter): dimension that one thing.
        function singleFrom(p) {

            const s = active().shapes[p.k];

            if (s.t === "r") { return p.f === "L" || p.f === "R" ? "h" : "w"; }
            if (s.t === "c") { return "d"; }
            if (s.t === "t") { return p.f[0] === "s" ? p.f : "tw"; }
            if (s.t === "p" && p.f[0] === "e") { return p.f; }

            return null;
        }

        function addDim(m) {

            const l = active();

            if (!l) { return; }

            pushUndo();

            m.id = E.uid("M");
            m.layer = l.id;
            design.dims.push(m);
            dimSel = design.dims.length - 1;

            setHint("Type the " + dimName(m) + " you want and press Enter. Esc keeps it as it is. Double-click a dimension later to change it.");
            changed("props", false);
            openDimInput(dimSel);
        }

        function finishDim(second) {

            const a = dimPick;
            const l = active();

            dimPick = null;

            if (!a || !l || !l.shapes[a.k]) { return; }

            if (!second || (second.k === a.k && second.f === a.f)) {

                const f = singleFrom(a);

                if (!f) { setHint("Pick an edge or circle to size it, or two shapes to set the distance between them."); draw(); return; }

                addDim({ a: { k: a.k, f: f } });

                return;
            }

            if (second.k === a.k) {

                // Two sides of one rectangle: its width or height.
                const s = l.shapes[a.k];
                const pair = a.f + second.f;

                if (s.t === "r" && (pair === "LR" || pair === "RL")) { addDim({ a: { k: a.k, f: "w" } }); return; }
                if (s.t === "r" && (pair === "TB" || pair === "BT")) { addDim({ a: { k: a.k, f: "h" } }); return; }

                const f2 = singleFrom(second);

                if (f2) { addDim({ a: { k: a.k, f: f2 } }); } else { draw(); }

                return;
            }

            const fa = /^[LRTB]$/.test(a.f) ? a.f : "C";
            const fb = /^[LRTB]$/.test(second.f) ? second.f : "C";
            const pa = featPoint(l.shapes[a.k], fa);
            const pb = featPoint(l.shapes[second.k], fb);

            // Side edges measure across, top and bottom edges measure up and down; anything else
            // (centres, or one of each) goes the way the two points are farther apart.
            const lr = /[LR]/.test(fa + fb);
            const tb = /[TB]/.test(fa + fb);

            let dir = Math.abs(pb[0] - pa[0]) >= Math.abs(pb[1] - pa[1]) ? "h" : "v";

            if (lr && !tb) { dir = "h"; }
            if (tb && !lr) { dir = "v"; }

            addDim({ a: { k: a.k, f: fa }, b: { k: second.k, f: fb }, dir: dir });
        }

        function arrowHead(x, y, ang) {

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 7 * Math.cos(ang - 0.35), y - 7 * Math.sin(ang - 0.35));
            ctx.lineTo(x - 7 * Math.cos(ang + 0.35), y - 7 * Math.sin(ang + 0.35));
            ctx.closePath();
            ctx.fill();
        }

        // A dimension line between two screen points, with arrows; returns its middle.
        function dimLine(a, b) {

            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();

            const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);

            if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 16) { arrowHead(b[0], b[1], ang); arrowHead(a[0], a[1], ang + Math.PI); }

            return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        }

        function extLine(a, b) {

            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
        }

        function dimLabel(text, c, i, hot) {

            ctx.font = "600 12px Inter, Arial, sans-serif";

            const w = ctx.measureText(text).width + 10;
            const box = { i: i, x: c[0] - w / 2, y: c[1] - 10, w: w, h: 20 };

            ctx.fillStyle = hot ? DIM_COLOR : "rgba(6,8,15,0.88)";
            ctx.fillRect(box.x, box.y, box.w, box.h);
            ctx.strokeStyle = DIM_COLOR;
            ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
            ctx.fillStyle = hot ? "#0b1020" : DIM_COLOR;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, c[0], c[1] + 1);

            dimBoxes.push(box);
        }

        function drawDims() {

            dimBoxes = [];
            pruneDims();

            const l = active();

            if (!l) { return; }

            ctx.save();
            ctx.lineWidth = 1;
            ctx.font = "600 12px Inter, Arial, sans-serif";

            design.dims.forEach(function (m, i) {

                if (m.layer !== l.id || !l.visible) { return; }

                const a = l.shapes[m.a.k];
                const OFF = 22;
                const text = (m.a.f === "d" && !m.b ? "⌀ " : "") + fmtLen(dimValue(m));
                const tw2 = ctx.measureText(text).width / 2;
                let c;

                ctx.strokeStyle = DIM_COLOR;
                ctx.fillStyle = DIM_COLOR;

                if (m.b) {

                    const s2 = l.shapes[m.b.k];
                    const pa = toScreen.apply(null, featPoint(a, m.a.f));
                    const pb = toScreen.apply(null, featPoint(s2, m.b.f));
                    const ba = G.bboxOf([a]);
                    const bb = G.bboxOf([s2]);

                    if (m.dir === "v") {

                        const x = Math.max(toScreen(ba.x1, 0)[0], toScreen(bb.x1, 0)[0]) + OFF;

                        extLine(pa, [x + 4, pa[1]]);
                        extLine(pb, [x + 4, pb[1]]);
                        c = dimLine([x, pa[1]], [x, pb[1]]);
                        c = [c[0] + 10 + tw2, c[1]];

                    } else {

                        const y = Math.min(toScreen(0, ba.y0)[1], toScreen(0, bb.y0)[1]) - OFF;

                        extLine(pa, [pa[0], y - 4]);
                        extLine(pb, [pb[0], y - 4]);
                        c = dimLine([pa[0], y], [pb[0], y]);
                        c = [c[0], c[1] - 12];
                    }

                } else if (m.a.f === "w" || m.a.f === "h") {

                    const tl = toScreen(a.x, a.y);
                    const br = toScreen(a.x + a.w, a.y + a.h);

                    if (m.a.f === "w") {

                        const y = tl[1] - OFF;

                        extLine(tl, [tl[0], y - 4]);
                        extLine([br[0], tl[1]], [br[0], y - 4]);
                        c = dimLine([tl[0], y], [br[0], y]);
                        c = [c[0], c[1] - 12];

                    } else {

                        const x = tl[0] - OFF;

                        extLine(tl, [x - 4, tl[1]]);
                        extLine([tl[0], br[1]], [x - 4, br[1]]);
                        c = dimLine([x, tl[1]], [x, br[1]]);
                        c = [c[0] - 10 - tw2, c[1]];
                    }

                } else if (m.a.f === "d") {

                    const p = toScreen(a.x, a.y);
                    const r = a.r * view.s;
                    const q = [Math.SQRT1_2, -Math.SQRT1_2];

                    dimLine([p[0] - q[0] * r, p[1] - q[1] * r], [p[0] + q[0] * r, p[1] + q[1] * r]);
                    c = [p[0] + q[0] * (r + 14) + tw2, p[1] + q[1] * (r + 14)];

                } else if (m.a.f === "tw") {

                    const e = [a.pts[0], a.pts[1]];
                    const len = Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]) || 1;
                    const nx = -(e[1][1] - e[0][1]) / len;
                    const ny = (e[1][0] - e[0][0]) / len;
                    const mx = (e[0][0] + e[1][0]) / 2;
                    const my = (e[0][1] + e[1][1]) / 2;

                    const p1 = toScreen(mx - nx * a.w / 2, my - ny * a.w / 2);
                    const p2 = toScreen(mx + nx * a.w / 2, my + ny * a.w / 2);

                    dimLine(p1, p2);
                    c = [p2[0] + nx * (14 + tw2), p2[1] + ny * 16];

                } else {

                    // Edge or segment: a dimension line parallel to it, pushed outward.
                    const e = edgeOf(a, m.a.f);
                    const p1 = toScreen(e[0][0], e[0][1]);
                    const p2 = toScreen(e[1][0], e[1][1]);
                    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
                    let nx = -(p2[1] - p1[1]) / len;
                    let ny = (p2[0] - p1[0]) / len;

                    const cc = toScreen.apply(null, centreOf(a));

                    if ((p1[0] - cc[0]) * nx + (p1[1] - cc[1]) * ny < 0) { nx = -nx; ny = -ny; }

                    const off = OFF + (a.t === "t" ? a.w * view.s / 2 : 0);
                    const q1 = [p1[0] + nx * off, p1[1] + ny * off];
                    const q2 = [p2[0] + nx * off, p2[1] + ny * off];

                    extLine(p1, [q1[0] + nx * 4, q1[1] + ny * 4]);
                    extLine(p2, [q2[0] + nx * 4, q2[1] + ny * 4]);
                    c = dimLine(q1, q2);
                    c = [c[0] + nx * (12 + Math.abs(nx) * tw2), c[1] + ny * 12];
                }

                dimLabel(text, c, i, i === dimSel);
            });

            // What the Smart Dimension tool is pointing at.
            if (tool === "dim") {

                [dimPick, dimHover].forEach(function (p, n) {

                    if (!p || !l.shapes[p.k]) { return; }

                    const s = l.shapes[p.k];

                    ctx.save();
                    ctx.strokeStyle = n === 0 ? DIM_COLOR : "rgba(255,211,107,0.6)";
                    ctx.lineWidth = n === 0 ? 3 : 2;
                    ctx.beginPath();

                    if (s.t === "r" && /^[LRTB]$/.test(p.f)) {

                        const a = toScreen(p.f === "R" ? s.x + s.w : s.x, p.f === "B" ? s.y + s.h : s.y);
                        const b = toScreen(p.f === "L" ? s.x : s.x + s.w, p.f === "T" ? s.y : s.y + s.h);

                        ctx.moveTo(a[0], a[1]);
                        ctx.lineTo(b[0], b[1]);

                    } else if (p.f[0] === "e" || p.f[0] === "s") {

                        const e = edgeOf(s, p.f);
                        const a = toScreen(e[0][0], e[0][1]);
                        const b = toScreen(e[1][0], e[1][1]);

                        ctx.moveTo(a[0], a[1]);
                        ctx.lineTo(b[0], b[1]);

                    } else {

                        tracePath(ctx, s);
                    }

                    ctx.stroke();
                    ctx.restore();
                });
            }

            ctx.restore();
        }

        function dimBoxAt(px, py) {

            for (let k = dimBoxes.length - 1; k >= 0; k--) {

                const b = dimBoxes[k];

                if (px >= b.x - 3 && px <= b.x + b.w + 3 && py >= b.y - 3 && py <= b.y + b.h + 3) { return b; }
            }

            return null;
        }

        function closeDimInput() {

            if (dimInput) { const el = dimInput; dimInput = null; el.remove(); }
        }

        // The box where you type the value, right over the dimension's label.
        function openDimInput(i) {

            closeDimInput();
            draw();

            const m = design.dims[i];
            const box = dimBoxes.filter(function (b) { return b.i === i; })[0];

            if (!m || !box) { return; }

            const input = h("input", {
                type: "text", className: "ed-dim-input", inputmode: "decimal", spellcheck: "false", autocomplete: "off",
                "aria-label": "Set the " + dimName(m) + " (" + UNITS[unitOf()].label + ")",
                value: String(roundU(dimValue(m)))
            });

            input.style.left = Math.max(4, Math.min(W - 124, box.x + box.w / 2 - 60)) + "px";
            input.style.top = Math.max(4, Math.min(Hh - 34, box.y - 5)) + "px";

            let done = false;

            function commit() {

                if (done) { return; }

                done = true;

                const v = parseLen(input.value);

                closeDimInput();

                if (!isFinite(v)) { setHint("Couldn't read “" + input.value + "”. Type a number, optionally with a unit: 12.5, 2.5 mm, 300 nm, 2*40."); draw(); return; }

                const min = m.b ? 0 : 0.01;

                if (v < min) { setHint("The " + dimName(m) + " must be " + (m.b ? "zero or more." : "more than zero.")); draw(); return; }

                if (Math.abs(v - dimValue(m)) < 1e-9) { draw(); return; }

                pushUndo();
                applyDim(m, v);
                setHint("Set the " + dimName(m) + " to " + fmtLen(v) + ".");
                changed("shapes", false);
                buildProps();
                canvas.focus();
            }

            input.addEventListener("keydown", function (e) {

                e.stopPropagation();

                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") { e.preventDefault(); done = true; closeDimInput(); canvas.focus(); draw(); }
            });

            stage.appendChild(input);
            dimInput = input;

            // Focus after the click that opened it has finished, or the canvas takes focus back
            // and the box closes straight away.
            setTimeout(function () {

                if (dimInput !== input) { return; }

                input.focus();
                input.select();
                input.addEventListener("blur", function () { setTimeout(commit, 0); });

            }, 0);
        }

        function deleteDim(i) {

            if (i < 0 || !design.dims[i]) { return; }

            pushUndo();
            design.dims.splice(i, 1);
            dimSel = -1;
            closeDimInput();
            changed("props", false);
        }

        // After shapes are deleted, point the dimensions at the shapes' new places.
        function remapDims(layerId, keep) {

            const map = {};
            let n = 0;

            keep.forEach(function (ok, i) { if (ok) { map[i] = n++; } });

            for (let i = design.dims.length - 1; i >= 0; i--) {

                const m = design.dims[i];

                if (m.layer !== layerId) { continue; }

                if (map[m.a.k] === undefined || (m.b && map[m.b.k] === undefined)) { design.dims.splice(i, 1); continue; }

                m.a.k = map[m.a.k];

                if (m.b) { m.b.k = map[m.b.k]; }
            }

            dimSel = -1;
        }


        // ----- shape creation -----
        function commitShape(s) {

            const l = active();

            if (!l) { return; }

            if (l.shapes.length >= 500) { setHint("This layer has 500 shapes, the limit. Delete some first."); return; }

            if (cutMode && !s.pad && (tool === "r" || tool === "c" || tool === "p" || tool === "t")) { s.cut = true; }

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

            // A click on a dimension's label selects it (Smart Dimension: edits it).
            const db = (tool === "select" || tool === "dim") ? dimBoxAt(p.px, p.py) : null;

            if (db) {

                dimSel = db.i;
                dimPick = null;

                if (tool === "dim" || Date.now() - lastTap < 350) { openDimInput(db.i); } else { draw(); }

                lastTap = Date.now();

                return;
            }

            if (tool === "hole") {

                const r = Math.max(0.05, holeD / 2);

                commitShape({ t: "c", x: p.sx, y: p.sy, r: Math.round(r * 1000) / 1000, cut: true });
                setHint("Hole " + fmtLen(holeD) + " placed. Click to add another, or use Smart Dimension to position it exactly.");

                return;
            }

            if (tool === "dim") {

                const ft = featAt(p.x, p.y);

                if (!dimPick) {

                    if (!ft) { setHint("Click an edge, circle or shape on the active layer."); return; }

                    dimPick = ft;
                    setHint("Now click empty space (or press Enter) to dimension it, or click a second edge or shape for the distance between them.");
                    draw();

                    return;
                }

                finishDim(ft);

                return;
            }

            if (dimSel >= 0) { dimSel = -1; }

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

            } else if (tool === "dim" && l) {

                dimHover = featAt(p.x, p.y);

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

            if (draft && (tool === "p" || tool === "t")) { e.preventDefault(); finishPoly(); return; }

            const r = canvas.getBoundingClientRect();
            const db = dimBoxAt((e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (Hh / r.height));

            if (db) { e.preventDefault(); openDimInput(db.i); }
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

            if (k === "Escape") { draft = null; ruler = []; drag = null; sel = []; dimPick = null; dimSel = -1; buildProps(); draw(); return; }
            if (k === "Enter" && tool === "dim" && dimPick) { finishDim(null); return; }
            if (k === "Enter" && dimSel >= 0 && !draft) { openDimInput(dimSel); return; }
            if (k === "Enter") { finishPoly(); return; }

            if ((k === "Delete" || k === "Backspace") && dimSel >= 0) { e.preventDefault(); deleteDim(dimSel); return; }
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

            remapDims(l.id, l.shapes.map(function (_, i) { return sel.indexOf(i) < 0; }));

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

            dimPick = null;
            dimHover = null;
            closeDimInput();

            const t = TOOLS.filter(function (x) { return x.id === id; })[0];

            setHint(t ? t.hint : "");
            buildBar();
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
            }, [0.5, 1, 2, 5, 10, 20, 50, 100].map(function (g) { return h("option", { value: String(g), text: "Grid " + fmtLen(g) }); }));

            gsel.value = String(grid());

            bar.appendChild(gsel);

            const usel = h("select", {
                className: "ed-select", "aria-label": "Units",
                onchange: function (e) { design.units = e.target.value; onChange("props"); buildBar(); buildSide(); draw(); }
            }, [["nm", "nm"], ["um", "µm"], ["mm", "mm"]].map(function (u) { return h("option", { value: u[0], text: "Units " + u[1] }); }));

            usel.value = unitOf();

            bar.appendChild(usel);

            // Tool options.
            const opts2 = h("span", { className: "ed-opts" });
            const ul = " " + UNITS[unitOf()].label;

            // A length box in the chosen unit that also takes "2.5 mm" or "2*40".
            const lenBox = function (label, get, set, aria) {

                const inp = h("input", {
                    type: "text", className: "ed-num", inputmode: "decimal", value: String(roundU(get())), "aria-label": aria,
                    onchange: function (e) {

                        const v = parseLen(e.target.value);

                        if (isFinite(v) && v > 0) { set(v); }

                        e.target.value = String(roundU(get()));
                    }
                });

                return h("label", { className: "ed-opt" }, [label, inp, ul]);
            };

            if (tool === "r" || tool === "c" || tool === "p" || tool === "t") {

                opts2.appendChild(h("button", {
                    type: "button", className: "ed-tool small" + (cutMode ? " ed-cut-on" : ""), "aria-pressed": cutMode ? "true" : "false",
                    title: "Draw holes: new shapes remove material from this layer", text: cutMode ? "Cut on" : "Cut off",
                    onclick: function () { cutMode = !cutMode; buildBar(); setHint(cutMode ? "Cut is on: what you draw now removes material from the active layer." : TOOLS.filter(function (x) { return x.id === tool; })[0].hint); }
                }));
            }

            if (tool === "t") {

                opts2.appendChild(lenBox("Width ", function () { return traceWidth; }, function (v) { traceWidth = Math.max(0.05, v); }, "Trace width"));
            }

            if (tool === "hole") {

                opts2.appendChild(lenBox("Diameter ", function () { return holeD; }, function (v) { holeD = Math.max(0.1, v); }, "Hole diameter"));
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

            const gu = toU(grid());
            const dg = gu >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(gu)));

            status.textContent = "x " + toU(p.sx).toFixed(dg) + "  y " + toU(p.sy).toFixed(dg) + " " + UNITS[unitOf()].label;
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

            if (root.LabExport) { side.appendChild(buildExport()); }
        }

        // Download the layout for CoventorWare, KLayout, CAD programs and so on.
        function buildExport() {

            const X = root.LabExport;
            const box = h("div", { className: "ed-card ed-export" });
            const note = h("p", { className: "ed-muted", "aria-live": "polite" });

            function say(text) { note.textContent = text; }

            box.appendChild(h("h3", { text: "Export layout" }));
            box.appendChild(h("p", { className: "ed-muted", text: "Open this design in CoventorWare, KLayout, L-Edit or a CAD program. GDSII is the one CoventorWare imports; the .zip adds the layer stack and import steps." }));

            const row = h("div", { className: "ed-export-grid" });

            X.FORMATS.forEach(function (f) {

                row.appendChild(h("button", {
                    type: "button", className: "ed-mini ed-export-btn" + (f.id === "gds" || f.id === "zip" ? " primary" : ""), title: f.note,
                    onclick: function () {

                        if (!X.shapeCount(design)) { say("Draw at least one shape first."); return; }

                        const file = X.build(design, f.id);

                        X.download(file).then(function () {

                            say("Saved " + file.name + ".");

                        }).catch(function () {

                            say("Couldn't save " + file.name + ". Please try again.");
                        });
                    }
                }, [h("strong", { text: f.label }), h("span", { text: f.note })]));
            });

            box.appendChild(row);
            box.appendChild(note);

            return box;
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

                const nl = E.newLayer(role, { material: E.defaultMaterial(role, design.kind) });

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
            remapDims(l.id, []);
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

                // Typed in the chosen unit; "2.5 mm" or "2*40" work too.
                const num = function (label, get, set) {

                    return h("label", { className: "ed-field inline" }, [label + " (" + UNITS[unitOf()].label + ")", h("input", {
                        type: "text", inputmode: "decimal", className: "ed-text", value: String(roundU(get())),
                        onchange: function (e) {

                            const v = parseLen(e.target.value);

                            if (!isFinite(v)) { e.target.value = String(roundU(get())); return; }

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

                if (!s.pad) {

                    propsBox.appendChild(h("label", { className: "ed-check" }, [
                        h("input", {
                            type: "checkbox", checked: s.cut ? true : false,
                            onchange: function (e) {

                                pushUndo();

                                sel.forEach(function (i) { const x = l.shapes[i]; if (x && !x.pad) { if (e.target.checked) { x.cut = true; } else { delete x.cut; } } });

                                changed("shapes", true);
                            }
                        }),
                        " Cut (hole): removes material from this layer instead of adding it"
                    ]));
                }

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
            const dx = h("input", { type: "text", inputmode: "decimal", className: "ed-text", value: String(roundU(150)), "aria-label": "Spacing in x (" + UNITS[unitOf()].label + ")" });
            const dy = h("input", { type: "text", inputmode: "decimal", className: "ed-text", value: "0", "aria-label": "Spacing in y (" + UNITS[unitOf()].label + ")" });

            propsBox.appendChild(h("div", { className: "ed-array" }, [
                h("strong", { text: "Repeat (array)" }),
                h("div", { className: "ed-grid3" }, [
                    h("label", { className: "ed-field inline" }, ["copies", n]),
                    h("label", { className: "ed-field inline" }, ["step x", dx]),
                    h("label", { className: "ed-field inline" }, ["step y", dy])
                ]),
                h("button", { type: "button", className: "ed-mini", text: "Make copies", onclick: function () { arraySel(Number(n.value), parseLen(dx.value) || 0, parseLen(dy.value) || 0); } })
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
                const pt = E.patterning(l, m, design);

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


    root.LabEditor = { mount: mount, fmtLen: fmtLenAuto, fmtArea: fmtArea, parseLength: parseLength };

}(typeof window !== "undefined" ? window : globalThis));
