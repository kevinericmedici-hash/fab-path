/* ========================================
   LAB LAYOUT EXPORT

   Turns a design's mask layers into files that real layout and CAD
   tools open:

     GDSII (.gds)   the industry standard. CoventorWare, KLayout, L-Edit,
                    Cadence and every mask shop read it.
     DXF (.dxf)     for CAD programs (AutoCAD, SolidWorks, Fusion,
                    LibreCAD). Also imported by most layout tools.
     CIF (.cif)     an older plain-text mask format some MEMS tools use.
     SVG (.svg)     a drawing at true scale for slides, reports and
                    Illustrator or Inkscape.
     layers.csv     the layer stack bottom to top, with material,
                    thickness and mask polarity, to set up the process.
     .zip           all of the above plus a README with import steps.

   Units: the editor works in micrometres with y growing downward. The
   files use micrometres with y growing upward (the CAD convention), so
   the drawing is flipped top to bottom on the way out, which keeps it
   looking the same.

   LabExport.files(design) returns { name, files: [{ name, data, mime }] }.
   LabExport.download(file) saves one file (or shares it in the app).
   No DOM needed for the builders, so they also run in Node.
======================================== */

(function (root) {

    "use strict";

    const CIRCLE_SIDES = 64;

    // Rough AutoCAD colour numbers for each layer role, so DXF layers aren't all white.
    const DXF_COLORS = {
        electrode: 4, collector: 30, insulation: 5, semiconductor: 6, channel: 140, membrane: 1,
        substrate: 8, coating: 200, structure: 3, oxide: 151, dimple: 2, hole: 10
    };

    function engine() { return root.LabEngine || {}; }


    /* ------------------------------------------------
       NAMES AND SHAPES
    ------------------------------------------------ */

    // Letters, digits and _ only: safe for GDS cell names, CIF, DXF layers and file names.
    function clean(text, fallback, max) {

        const s = String(text || "").normalize("NFKD").replace(/[^\x20-\x7e]/g, "")
            .replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");

        return (s || fallback).slice(0, max || 32);
    }

    function ascii(text) {

        return String(text || "").replace(/−/g, "-").normalize("NFKD").replace(/[^\x20-\x7e]/g, "");
    }

    function circlePoints(cx, cy, r) {

        const out = [];

        for (let k = 0; k < CIRCLE_SIDES; k++) {

            const a = (k / CIRCLE_SIDES) * Math.PI * 2;

            out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }

        return out;
    }

    function rectPoints(s) {

        return [[s.x, s.y], [s.x + s.w, s.y], [s.x + s.w, s.y + s.h], [s.x, s.y + s.h]];
    }

    // Layers with the names each format will use. Mask names are unique.
    function layerTable(design) {

        const used = {};

        return design.layers.map(function (l, i) {

            let mask = clean(l.name, "Layer" + (i + 1), 24);
            let n = 2;

            while (used[mask.toLowerCase()]) { mask = clean(l.name, "Layer", 21) + "_" + n; n++; }

            used[mask.toLowerCase()] = true;

            const num = i + 1;

            return {
                layer: l,
                gds: num,
                cif: "L" + String(num).padStart(2, "0"),
                dxf: "L" + String(num).padStart(2, "0") + "_" + mask,
                mask: mask
            };
        });
    }

    function boundsOf(design) {

        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;

        function add(x, y, pad) {

            pad = pad || 0;

            if (x - pad < x0) { x0 = x - pad; }
            if (y - pad < y0) { y0 = y - pad; }
            if (x + pad > x1) { x1 = x + pad; }
            if (y + pad > y1) { y1 = y + pad; }
        }

        design.layers.forEach(function (l) {

            l.shapes.forEach(function (s) {

                if (s.t === "r") { add(s.x, s.y); add(s.x + s.w, s.y + s.h); }
                else if (s.t === "c") { add(s.x, s.y, s.r); }
                else if (s.pts) { s.pts.forEach(function (p) { add(p[0], p[1], s.t === "t" ? s.w / 2 : 0); }); }
            });
        });

        if (x0 === Infinity) { return { x0: 0, y0: 0, x1: 100, y1: 100 }; }

        return { x0: x0, y0: y0, x1: x1, y1: y1 };
    }

    // Holes: a layer's shapes with the cut shapes applied. Shapes no cut touches come back as
    // { s } and keep their exact form (true circles in DXF, paths for traces); shapes a cut
    // touches come back as { region: { outer, holes } }. Cut shapes themselves are never drawn.
    function ringsOf(s) {

        if (s.t === "r") { return [rectPoints(s)]; }
        if (s.t === "c") { return [circlePoints(s.x, s.y, s.r)]; }
        if (s.t === "p") { return [s.pts]; }

        return root.LabGeom ? root.LabGeom.polysOf(s) : [];
    }

    function partsOf(layer) {

        const G = root.LabGeom;
        const cuts = layer.shapes.filter(function (s) { return s.cut; });
        const solid = layer.shapes.filter(function (s) { return !s.cut; });

        if (!cuts.length || !G || !G.cutRegions || !root.ClipperLib) { return solid.map(function (s) { return { s: s }; }); }

        const box = function (s) { return G.bboxOf([s]); };
        const cb = cuts.map(box);
        const out = [];

        solid.forEach(function (s) {

            const b = box(s);
            const near = cuts.filter(function (_, i) { return b.x0 <= cb[i].x1 && cb[i].x0 <= b.x1 && b.y0 <= cb[i].y1 && cb[i].y0 <= b.y1; });

            if (!near.length || s.pad) { out.push({ s: s }); return; }

            G.cutRegions(s, near, ringsOf).forEach(function (region) { out.push({ region: region }); });
        });

        return out;
    }

    // A region as hole-free polygons, for formats that can't store holes.
    function sliced(region) {

        return root.LabGeom && region.holes.length ? root.LabGeom.sliceRegion(region) : [region.outer];
    }

    function shapeCount(design) {

        return design.layers.reduce(function (n, l) { return n + l.shapes.length; }, 0);
    }


    /* ------------------------------------------------
       GDSII (binary)
    ------------------------------------------------ */

    // GDSII stores reals in an old IBM format: sign, base-16 exponent (excess 64), 56-bit fraction.
    function real8(value) {

        const out = new Uint8Array(8);

        if (value === 0) { return out; }

        let v = Math.abs(value);
        let e = 0;

        while (v >= 1) { v /= 16; e++; }
        while (v < 1 / 16) { v *= 16; e--; }

        let m = BigInt(Math.round(v * Math.pow(2, 56)));

        if (m >= (1n << 56n)) { m >>= 4n; e++; }

        out[0] = (value < 0 ? 0x80 : 0) | (e + 64);

        for (let k = 7; k >= 1; k--) {

            out[k] = Number(m & 0xffn);
            m >>= 8n;
        }

        return out;
    }

    function gds(design) {

        const chunks = [];

        function record(type, dataType, payload) {

            const len = 4 + (payload ? payload.length : 0);
            const head = new Uint8Array(4);

            head[0] = len >> 8; head[1] = len & 0xff; head[2] = type; head[3] = dataType;

            chunks.push(head);

            if (payload) { chunks.push(payload); }
        }

        function int16s(values) {

            const b = new Uint8Array(values.length * 2);
            const dv = new DataView(b.buffer);

            values.forEach(function (v, k) { dv.setInt16(k * 2, v); });

            return b;
        }

        function int32s(values) {

            const b = new Uint8Array(values.length * 4);
            const dv = new DataView(b.buffer);

            values.forEach(function (v, k) { dv.setInt32(k * 4, v); });

            return b;
        }

        function str(text) {

            let s = ascii(text);

            if (s.length % 2) { s += "\0"; }

            const b = new Uint8Array(s.length);

            for (let k = 0; k < s.length; k++) { b[k] = s.charCodeAt(k); }

            return b;
        }

        // 1 database unit = 1 nm, 1 user unit = 1 um. Flip y.
        function xy(points, close) {

            const flat = [];

            points.forEach(function (p) { flat.push(Math.round(p[0] * 1000), Math.round(-p[1] * 1000)); });

            if (close) { flat.push(flat[0], flat[1]); }

            return int32s(flat);
        }

        function boundary(layerNum, points) {

            // GDSII allows at most 8191 points in one boundary.
            if (points.length < 3 || points.length > 8190) { return; }

            record(0x08, 0x00);
            record(0x0D, 0x02, int16s([layerNum]));
            record(0x0E, 0x02, int16s([0]));
            record(0x10, 0x03, xy(points, true));
            record(0x11, 0x00);
        }

        function path(layerNum, width, points) {

            if (points.length < 2) { return; }

            record(0x09, 0x00);
            record(0x0D, 0x02, int16s([layerNum]));
            record(0x0E, 0x02, int16s([0]));
            record(0x21, 0x02, int16s([0]));                           // flush ends
            record(0x0F, 0x03, int32s([Math.round(width * 1000)]));
            record(0x10, 0x03, xy(points, false));
            record(0x11, 0x00);
        }

        function text(layerNum, label, x, y) {

            record(0x0C, 0x00);
            record(0x0D, 0x02, int16s([layerNum]));
            record(0x16, 0x02, int16s([0]));
            record(0x17, 0x01, int16s([0x0005]));                      // centred
            record(0x10, 0x03, xy([[x, y]], false));
            record(0x19, 0x06, str(label));
            record(0x11, 0x00);
        }

        const now = new Date();
        const stamp = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];

        record(0x00, 0x02, int16s([600]));                              // HEADER (version 6)
        record(0x01, 0x02, int16s(stamp.concat(stamp)));                // BGNLIB
        record(0x02, 0x06, str("FABPATH"));                             // LIBNAME

        const units = new Uint8Array(16);

        units.set(real8(1e-3), 0);                                      // user units per database unit
        units.set(real8(1e-9), 8);                                      // database unit in metres

        record(0x03, 0x05, units);                                      // UNITS
        record(0x05, 0x02, int16s(stamp.concat(stamp)));                // BGNSTR
        record(0x06, 0x06, str(clean(design.name, "FABPATH_DESIGN")));  // STRNAME

        layerTable(design).forEach(function (row) {

            partsOf(row.layer).forEach(function (part) {

                if (part.region) { sliced(part.region).forEach(function (p) { boundary(row.gds, p); }); return; }

                const s = part.s;

                if (s.t === "r") {

                    boundary(row.gds, rectPoints(s));

                    if (s.pad) { text(row.gds, s.pad, s.x + s.w / 2, s.y + s.h / 2); }

                } else if (s.t === "c") {

                    boundary(row.gds, circlePoints(s.x, s.y, s.r));

                } else if (s.t === "p") {

                    boundary(row.gds, s.pts);

                } else if (s.t === "t") {

                    path(row.gds, s.w, s.pts);
                }
            });
        });

        record(0x07, 0x00);                                             // ENDSTR
        record(0x04, 0x00);                                             // ENDLIB

        const total = chunks.reduce(function (n, c) { return n + c.length; }, 0);
        const out = new Uint8Array(total);
        let at = 0;

        chunks.forEach(function (c) { out.set(c, at); at += c.length; });

        return out;
    }


    /* ------------------------------------------------
       DXF (AutoCAD R12, plain text)
    ------------------------------------------------ */

    function num(v) { return String(Math.round(v * 10000) / 10000); }

    function dxf(design) {

        const out = [];
        const rows = layerTable(design);
        const b = boundsOf(design);

        function put(code, value) { out.push(String(code), String(value)); }

        function polyline(layer, points, closed, width) {

            put(0, "POLYLINE"); put(8, layer); put(66, 1);
            put(10, 0); put(20, 0); put(30, 0);
            put(70, closed ? 1 : 0);

            if (width) { put(40, num(width)); put(41, num(width)); }

            points.forEach(function (p) {

                put(0, "VERTEX"); put(8, layer);
                put(10, num(p[0])); put(20, num(-p[1])); put(30, 0);
            });

            put(0, "SEQEND"); put(8, layer);
        }

        put(999, "Fab Path layout: " + ascii(design.name) + ". Units: micrometres.");

        put(0, "SECTION"); put(2, "HEADER");
        put(9, "$ACADVER"); put(1, "AC1009");
        put(9, "$INSUNITS"); put(70, 13);                               // 13 = microns
        put(9, "$EXTMIN"); put(10, num(b.x0)); put(20, num(-b.y1)); put(30, 0);
        put(9, "$EXTMAX"); put(10, num(b.x1)); put(20, num(-b.y0)); put(30, 0);
        put(0, "ENDSEC");

        put(0, "SECTION"); put(2, "TABLES");
        put(0, "TABLE"); put(2, "LTYPE"); put(70, 1);
        put(0, "LTYPE"); put(2, "CONTINUOUS"); put(70, 0); put(3, "Solid line"); put(72, 65); put(73, 0); put(40, 0);
        put(0, "ENDTAB");
        put(0, "TABLE"); put(2, "LAYER"); put(70, rows.length);

        rows.forEach(function (row) {

            put(0, "LAYER"); put(2, row.dxf); put(70, 0);
            put(62, DXF_COLORS[row.layer.role] || 7); put(6, "CONTINUOUS");
        });

        put(0, "ENDTAB");
        put(0, "ENDSEC");

        put(0, "SECTION"); put(2, "ENTITIES");

        rows.forEach(function (row) {

            partsOf(row.layer).forEach(function (part) {

                // CAD keeps holes as their own closed outlines inside the outer one.
                if (part.region) {

                    polyline(row.dxf, part.region.outer, true);
                    part.region.holes.forEach(function (hp) { polyline(row.dxf, hp, true); });

                    return;
                }

                const s = part.s;

                if (s.t === "r") {

                    polyline(row.dxf, rectPoints(s), true);

                    if (s.pad) {

                        const h = Math.max(1, Math.min(s.w, s.h) * 0.4);
                        const cx = num(s.x + s.w / 2), cy = num(-(s.y + s.h / 2));

                        put(0, "TEXT"); put(8, row.dxf);
                        put(10, cx); put(20, cy); put(30, 0);
                        put(40, num(h)); put(1, ascii(s.pad));
                        put(72, 1); put(73, 2);
                        put(11, cx); put(21, cy); put(31, 0);
                    }

                } else if (s.t === "c") {

                    put(0, "CIRCLE"); put(8, row.dxf);
                    put(10, num(s.x)); put(20, num(-s.y)); put(30, 0); put(40, num(s.r));

                } else if (s.t === "p" && s.pts.length >= 3) {

                    polyline(row.dxf, s.pts, true);

                } else if (s.t === "t" && s.pts.length >= 2) {

                    polyline(row.dxf, s.pts, false, s.w);
                }
            });
        });

        put(0, "ENDSEC");
        put(0, "EOF");

        return out.join("\r\n") + "\r\n";
    }


    /* ------------------------------------------------
       CIF (Caltech Intermediate Form, plain text)
    ------------------------------------------------ */

    function cif(design) {

        // CIF works in hundredths of a micrometre, with y up.
        function c(v) { return Math.round(v * 100); }
        function pt(p) { return c(p[0]) + " " + c(-p[1]); }

        const out = [];

        out.push("(Fab Path layout: " + ascii(design.name).replace(/[()]/g, "") + ". Units: 0.01 um.);");
        out.push("DS 1 1 1;");
        out.push("9 " + clean(design.name, "FABPATH_DESIGN") + ";");

        layerTable(design).forEach(function (row) {

            const parts = partsOf(row.layer);

            if (!parts.length) { return; }

            out.push("(" + row.mask + ");");
            out.push("L " + row.cif + ";");

            parts.forEach(function (part) {

                if (part.region) { sliced(part.region).forEach(function (p) { out.push("P " + p.map(pt).join(" ") + ";"); }); return; }

                const s = part.s;

                if (s.t === "r") {

                    out.push("B " + c(s.w) + " " + c(s.h) + " " + c(s.x + s.w / 2) + " " + c(-(s.y + s.h / 2)) + ";");

                    if (s.pad) { out.push("94 " + clean(ascii(s.pad).replace("+", "P").replace("-", "N"), "PAD", 16) + " " + c(s.x + s.w / 2) + " " + c(-(s.y + s.h / 2)) + ";"); }

                } else if (s.t === "c") {

                    out.push("R " + c(s.r * 2) + " " + c(s.x) + " " + c(-s.y) + ";");

                } else if (s.t === "p" && s.pts.length >= 3) {

                    out.push("P " + s.pts.map(pt).join(" ") + ";");

                } else if (s.t === "t" && s.pts.length >= 2) {

                    out.push("W " + c(s.w) + " " + s.pts.map(pt).join(" ") + ";");
                }
            });
        });

        out.push("DF;");
        out.push("C 1;");
        out.push("E");

        return out.join("\n") + "\n";
    }


    /* ------------------------------------------------
       SVG (true scale: 1 mm on paper = 1 mm of chip)
    ------------------------------------------------ */

    function esc(text) {

        return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function svg(design) {

        const b = boundsOf(design);
        const m = Math.max(10, 0.05 * Math.max(b.x1 - b.x0, b.y1 - b.y0));
        const x0 = b.x0 - m, y0 = b.y0 - m, w = b.x1 - b.x0 + 2 * m, hh = b.y1 - b.y0 + 2 * m;
        const roles = engine().ROLES || {};

        const out = [];

        out.push('<?xml version="1.0" encoding="UTF-8"?>');
        out.push('<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ' +
            'width="' + num(w / 1000) + 'mm" height="' + num(hh / 1000) + 'mm" viewBox="' + [num(x0), num(y0), num(w), num(hh)].join(" ") + '">');
        out.push("<title>" + esc(design.name || "Fab Path layout") + "</title>");
        out.push("<desc>Exported from Fab Path. 1 unit = 1 micrometre.</desc>");

        layerTable(design).forEach(function (row) {

            const color = (roles[row.layer.role] || {}).color || "#888888";
            const cut = row.layer.mode === "cut";

            out.push('<g id="' + row.dxf + '" inkscape:groupmode="layer" inkscape:label="' + esc(row.layer.name) + '" ' +
                'fill="' + color + '" fill-opacity="' + (cut ? 0.25 : 0.55) + '" stroke="' + color + '" stroke-width="' + num(Math.max(0.5, w / 800)) + '"' +
                (cut ? ' stroke-dasharray="' + num(w / 200) + " " + num(w / 300) + '"' : "") + ">");

            partsOf(row.layer).forEach(function (part) {

                if (part.region) {

                    const ring = function (p) { return "M" + p.map(function (q) { return num(q[0]) + "," + num(q[1]); }).join("L") + "Z"; };

                    out.push('<path fill-rule="evenodd" d="' + [part.region.outer].concat(part.region.holes).map(ring).join(" ") + '"/>');

                    return;
                }

                const s = part.s;

                if (s.t === "r") {

                    out.push('<rect x="' + num(s.x) + '" y="' + num(s.y) + '" width="' + num(s.w) + '" height="' + num(s.h) + '"/>');

                    if (s.pad) {

                        out.push('<text x="' + num(s.x + s.w / 2) + '" y="' + num(s.y + s.h / 2) + '" font-size="' + num(Math.max(1, Math.min(s.w, s.h) * 0.4)) +
                            '" text-anchor="middle" dominant-baseline="central" fill="#000" fill-opacity="1" stroke="none" font-family="sans-serif">' + esc(s.pad) + "</text>");
                    }

                } else if (s.t === "c") {

                    out.push('<circle cx="' + num(s.x) + '" cy="' + num(s.y) + '" r="' + num(s.r) + '"/>');

                } else if (s.t === "p" && s.pts.length >= 3) {

                    out.push('<polygon points="' + s.pts.map(function (p) { return num(p[0]) + "," + num(p[1]); }).join(" ") + '"/>');

                } else if (s.t === "t" && s.pts.length >= 2) {

                    out.push('<polyline points="' + s.pts.map(function (p) { return num(p[0]) + "," + num(p[1]); }).join(" ") +
                        '" fill="none" stroke-opacity="0.75" stroke-width="' + num(s.w) + '" stroke-linejoin="round" stroke-linecap="butt" stroke-dasharray="none"/>');
                }
            });

            out.push("</g>");
        });

        out.push("</svg>");

        return out.join("\n") + "\n";
    }


    /* ------------------------------------------------
       LAYER TABLE (CSV) AND README
    ------------------------------------------------ */

    function csvCell(v) {

        const s = String(v === undefined || v === null ? "" : v);

        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }

    function layerInfo(row) {

        const E = engine();
        const l = row.layer;
        const role = (E.ROLES || {})[l.role] || {};
        const mat = E.materialOf ? E.materialOf(l) : null;
        const resists = (root.SCLab && root.SCLab.RESISTS) || {};
        const litho = l.litho || {};
        const resist = resists[litho.resist];

        return {
            order: row.gds,
            mask: row.mask,
            gds: row.gds + "/0",
            cif: row.cif,
            dxf: row.dxf,
            name: l.name,
            role: (role.name || l.role || "").split(" (")[0],
            material: mat ? mat.name : (l.material || ""),
            thickness: l.thickness,
            drawn: l.mode === "cut" ? "openings (etched through the film)" : "material (what stays)",
            field: l.mask && l.mask.field ? (l.mask.field === "clear" ? "clear field (light)" : "dark field") : "",
            method: litho.method === "liftoff" ? "lift-off" : (litho.method || ""),
            resist: resist ? resist.name + (resist.tone && resist.name.toLowerCase().indexOf(resist.tone) < 0 ? " (" + resist.tone + ")" : "") : (litho.resist || ""),
            shapes: l.shapes.filter(function (s) { return !s.cut; }).length,
            holes: l.shapes.filter(function (s) { return s.cut; }).length
        };
    }

    function csv(design) {

        const head = ["Order (bottom to top)", "Mask name", "GDS layer/datatype", "CIF layer", "DXF layer", "Fab Path layer", "Role",
            "Material", "Thickness (um)", "Drawn shapes are", "Mask polarity", "Patterning", "Resist", "Shapes", "Holes"];

        const keys = ["order", "mask", "gds", "cif", "dxf", "name", "role", "material", "thickness", "drawn", "field", "method", "resist", "shapes", "holes"];

        const lines = [head.map(csvCell).join(",")];

        layerTable(design).forEach(function (row) {

            const info = layerInfo(row);

            lines.push(keys.map(function (k) { return csvCell(info[k]); }).join(","));
        });

        return "﻿" + lines.join("\r\n") + "\r\n";
    }

    function readme(design, base) {

        const rows = layerTable(design);
        const b = boundsOf(design);

        const lines = [
            "FAB PATH LAYOUT EXPORT",
            "",
            "Design: " + ascii(design.name || "Untitled"),
            "Exported: " + new Date().toISOString().slice(0, 16).replace("T", " "),
            "Size: " + num(b.x1 - b.x0) + " x " + num(b.y1 - b.y0) + " um, " + shapeCount(design) + " shapes on " + rows.length + " layers",
            "Units: micrometres (um). GDSII database grid: 1 nm.",
            "",
            "FILES",
            "  " + base + ".gds   GDSII layout. Use this one for CoventorWare, KLayout, L-Edit, Cadence or a mask shop.",
            "  " + base + ".dxf   DXF drawing for CAD programs (AutoCAD, SolidWorks, Fusion, LibreCAD).",
            "  " + base + ".cif   CIF layout, for tools that prefer it.",
            "  " + base + ".svg   True-scale picture for reports and slides.",
            "  layers.csv          The layer stack, bottom to top, with materials and mask polarity.",
            "",
            "OPENING THE LAYOUT IN COVENTORWARE",
            "  1. In the layout editor, import " + base + ".gds (GDSII). Keep the units in micrometres.",
            "  2. Each Fab Path layer is its own GDS layer number, datatype 0:",
            ""
        ];

        rows.forEach(function (row) {

            lines.push("       GDS " + String(row.gds).padStart(2) + "  ->  " + row.mask + "   (" + ascii(row.layer.name) + ", " + row.layer.thickness + " um)");
        });

        lines.push(
            "",
            "     Give each layer the mask name shown, so the process steps can refer to it.",
            "  3. In the process editor, build the stack bottom to top following layers.csv:",
            "     deposit each material at its thickness, then pattern it with its mask.",
            "     \"Drawn shapes are: material\" means the drawn shapes are what remains.",
            "     \"Drawn shapes are: openings\" means they are holes etched through the film.",
            "     Use the mask polarity column to set the photoresist / mask polarity for each step.",
            "  4. Build the 3D model and mesh it as usual.",
            "",
            "NOTES",
            "  - Circles are exported as " + CIRCLE_SIDES + "-sided polygons (GDSII has no true circles).",
            "    The DXF keeps them as real circles.",
            "  - Traces are paths with flush ends. Their bends are mitred in GDSII and CIF,",
            "    where Fab Path draws them rounded, so corners can differ slightly.",
            "  - Contact pad labels (+, -, S, D, G and port names) are text labels on the pad's layer.",
            "  - Holes (cut shapes) are already subtracted. GDSII and CIF can't store a hole inside a",
            "    polygon, so a shape with holes is split into touching pieces; on the mask they merge",
            "    back into one. The DXF keeps the outer outline and each hole outline instead.",
            "  - Layers that are bought or dropped on rather than patterned (membranes, for example)",
            "    are listed in layers.csv but may have no shapes.",
            "  - Thicknesses and materials come from your Process step in Fab Path. Real foundry",
            "    processes (PolyMUMPs, for example) set their own values: use theirs if you follow one.",
            ""
        );

        return lines.join("\r\n");
    }


    /* ------------------------------------------------
       ZIP (stored, no compression)
    ------------------------------------------------ */

    const CRC_TABLE = (function () {

        const t = new Uint32Array(256);

        for (let n = 0; n < 256; n++) {

            let c = n;

            for (let k = 0; k < 8; k++) { c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; }

            t[n] = c >>> 0;
        }

        return t;
    }());

    function crc32(bytes) {

        let c = 0xffffffff;

        for (let k = 0; k < bytes.length; k++) { c = CRC_TABLE[(c ^ bytes[k]) & 0xff] ^ (c >>> 8); }

        return (c ^ 0xffffffff) >>> 0;
    }

    function utf8(text) { return new TextEncoder().encode(text); }

    function bytesOf(data) { return typeof data === "string" ? utf8(data) : data; }

    function zip(files) {

        const parts = [];
        const central = [];
        let offset = 0;

        const now = new Date();
        const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
        const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

        files.forEach(function (f) {

            const name = utf8(f.name);
            const data = bytesOf(f.data);
            const crc = crc32(data);

            const local = new Uint8Array(30 + name.length);
            const lv = new DataView(local.buffer);

            lv.setUint32(0, 0x04034b50, true);
            lv.setUint16(4, 20, true);
            lv.setUint16(6, 0x0800, true);                              // names are UTF-8
            lv.setUint16(8, 0, true);                                   // stored
            lv.setUint16(10, time, true);
            lv.setUint16(12, date, true);
            lv.setUint32(14, crc, true);
            lv.setUint32(18, data.length, true);
            lv.setUint32(22, data.length, true);
            lv.setUint16(26, name.length, true);
            local.set(name, 30);

            const cen = new Uint8Array(46 + name.length);
            const cv = new DataView(cen.buffer);

            cv.setUint32(0, 0x02014b50, true);
            cv.setUint16(4, 20, true);
            cv.setUint16(6, 20, true);
            cv.setUint16(8, 0x0800, true);
            cv.setUint16(10, 0, true);
            cv.setUint16(12, time, true);
            cv.setUint16(14, date, true);
            cv.setUint32(16, crc, true);
            cv.setUint32(20, data.length, true);
            cv.setUint32(24, data.length, true);
            cv.setUint16(28, name.length, true);
            cv.setUint32(42, offset, true);
            cen.set(name, 46);

            parts.push(local, data);
            central.push(cen);

            offset += local.length + data.length;
        });

        const cenSize = central.reduce(function (n, c) { return n + c.length; }, 0);
        const end = new Uint8Array(22);
        const ev = new DataView(end.buffer);

        ev.setUint32(0, 0x06054b50, true);
        ev.setUint16(8, files.length, true);
        ev.setUint16(10, files.length, true);
        ev.setUint32(12, cenSize, true);
        ev.setUint32(16, offset, true);

        const all = parts.concat(central, [end]);
        const total = all.reduce(function (n, c) { return n + c.length; }, 0);
        const out = new Uint8Array(total);
        let at = 0;

        all.forEach(function (c) { out.set(c, at); at += c.length; });

        return out;
    }


    /* ------------------------------------------------
       ALL FORMATS AND SAVING
    ------------------------------------------------ */

    function baseName(design) { return clean(design.name, "fab-path-layout", 40); }

    function build(design, format) {

        const base = baseName(design);

        switch (format) {

            case "gds": return { name: base + ".gds", data: gds(design), mime: "application/octet-stream" };
            case "dxf": return { name: base + ".dxf", data: dxf(design), mime: "application/dxf" };
            case "cif": return { name: base + ".cif", data: cif(design), mime: "text/plain" };
            case "svg": return { name: base + ".svg", data: svg(design), mime: "image/svg+xml" };
            case "csv": return { name: base + "-layers.csv", data: csv(design), mime: "text/csv" };

            case "zip": {

                const files = [
                    { name: base + ".gds", data: gds(design) },
                    { name: base + ".dxf", data: dxf(design) },
                    { name: base + ".cif", data: cif(design) },
                    { name: base + ".svg", data: svg(design) },
                    { name: "layers.csv", data: csv(design) },
                    { name: "README.txt", data: readme(design, base) }
                ];

                return { name: base + ".zip", data: zip(files), mime: "application/zip" };
            }

            default: return null;
        }
    }

    function toBase64(bytes) {

        let s = "";

        for (let k = 0; k < bytes.length; k += 0x8000) {

            s += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
        }

        return btoa(s);
    }

    // In the iPhone app a download link does nothing, so write the file and open the share sheet.
    function download(file) {

        const bytes = bytesOf(file.data);
        const cap = root.Capacitor;
        const P = cap && cap.Plugins;

        if (cap && cap.isNativePlatform && cap.isNativePlatform() && P && P.Filesystem && P.Share) {

            return P.Filesystem.writeFile({ path: file.name, data: toBase64(bytes), directory: "CACHE" }).then(function (res) {

                return P.Share.share({ title: file.name, files: [res.uri], dialogTitle: "Save or send " + file.name });
            });
        }

        const url = URL.createObjectURL(new Blob([bytes], { type: file.mime }));
        const a = document.createElement("a");

        a.href = url;
        a.download = file.name;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);

        return Promise.resolve();
    }

    const API = {
        FORMATS: [
            { id: "gds", label: "GDSII (.gds)", note: "CoventorWare, KLayout, L-Edit, mask shops" },
            { id: "dxf", label: "DXF (.dxf)", note: "AutoCAD, SolidWorks and other CAD" },
            { id: "cif", label: "CIF (.cif)", note: "Older layout tools" },
            { id: "svg", label: "SVG (.svg)", note: "True-scale picture" },
            { id: "csv", label: "Layer table (.csv)", note: "Stack, materials, polarity" },
            { id: "zip", label: "Everything (.zip)", note: "All files plus import steps" }
        ],
        build: build, download: download, shapeCount: shapeCount,
        gds: gds, dxf: dxf, cif: cif, svg: svg, csv: csv, readme: readme, zip: zip, real8: real8, crc32: crc32
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = API;
    }

    root.LabExport = API;

}(typeof window !== "undefined" ? window : globalThis));
