/* ========================================
   VIRTUAL FAB LAB: THE APP

   A virtual fab project. You keep several designs, each a stack of
   mask layers you draw yourself. For every layer you pick materials and
   the exposure and bake, build batches of devices, test them and compare.

   The same code drives every course. Which device kinds are offered, and
   where things are saved, comes from window.LAB_COURSE (set by a small
   config file on the page). Everything specific to one kind of device
   (its tests, charts and metrics) lives in window.LabKinds.<kind>.

   Saved on this device, so it syncs with the account:
     <prefix>                 project: designs list, batches, tests
     <prefix>Design.<id>      one design (compact)
     <prefix>Batch.<id>       the frozen copy of a design used for a batch
======================================== */

(function () {

    "use strict";

    const SC = window.SCLab;
    const D = window.SCLabDraw;
    const G = window.LabGeom;
    const E = window.LabEngine;
    const Kinds = window.LabKinds = window.LabKinds || {};

    const COURSE = window.LAB_COURSE || { id: "supercap", kinds: ["supercap"], prefix: "fabPathLab", award: "fabPathLab" };

    const KEY = COURSE.prefix;
    const DKEY = COURSE.prefix + "Design.";
    const BKEY = COURSE.prefix + "Batch.";
    const OLD_KEY = "fabPathLabSupercap";

    const MAX_DESIGNS = 8;
    const MAX_BATCHES = 12;
    const MAX_TESTS = 48;
    const MAX_LAYERS = 8;
    const MAX_SHAPES = 500;

    const PAD_LABELS = ["+", "−", "S", "D", "G", "A", "B", "I", "O", "1", "2", "3", "4", "5", "6", "7", "8"];

    const STEPS = [
        { id: "designs", name: "Designs" },
        { id: "layout", name: "Layout" },
        { id: "process", name: "Process" },
        { id: "build", name: "Build" },
        { id: "test", name: "Test" },
        { id: "compare", name: "Compare" }
    ];


    function kindImpl(kind) { return Kinds[kind] || Kinds[COURSE.kinds[0]]; }


    /* ------------------------------------------------
       STATE
    ------------------------------------------------ */

    let project = freshProject();
    const designs = {};        // id -> full design
    const snaps = {};          // batch id -> frozen design

    function freshProject() {

        return { v: 2, step: "designs", current: "", designs: [], batches: [], tests: [], counter: 0, bn: 0 };
    }


    function num(v, lo, hi, fallback) {

        const n = Number(v);

        return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
    }

    function pick(v, table, fallback) {

        return typeof v === "string" && Object.prototype.hasOwnProperty.call(table, v) ? v : fallback;
    }

    function str(v, max) {

        return typeof v === "string" ? v.slice(0, max) : "";
    }

    function safeId(v, fallback) {

        return typeof v === "string" && /^[A-Za-z0-9_-]{1,24}$/.test(v) ? v : fallback;
    }

    function courseKind(v) {

        return typeof v === "string" && COURSE.kinds.indexOf(v) >= 0 ? v : COURSE.kinds[0];
    }


    /* ---------- shapes <-> compact arrays ---------- */

    function r2(v) { return Math.round(v * 100) / 100; }

    function packShape(s) {

        if (s.t === "r") { return s.pad ? ["r", r2(s.x), r2(s.y), r2(s.w), r2(s.h), s.pad] : ["r", r2(s.x), r2(s.y), r2(s.w), r2(s.h)]; }
        if (s.t === "c") { return ["c", r2(s.x), r2(s.y), r2(s.r)]; }

        const flat = [];

        s.pts.forEach(function (q) { flat.push(r2(q[0]), r2(q[1])); });

        return s.t === "t" ? ["t", r2(s.w), flat] : ["p", flat];
    }

    function unpackShape(a) {

        if (!Array.isArray(a)) { return null; }

        const L = 1e6;
        const n = function (v) { return num(v, -L, L, 0); };

        if (a[0] === "r") {

            const s = { t: "r", x: n(a[1]), y: n(a[2]), w: num(a[3], 0.01, L, 10), h: num(a[4], 0.01, L, 10) };

            if (typeof a[5] === "string" && PAD_LABELS.indexOf(a[5]) >= 0) { s.pad = a[5]; }

            return s;
        }

        if (a[0] === "c") { return { t: "c", x: n(a[1]), y: n(a[2]), r: num(a[3], 0.01, L, 10) }; }

        const flat = a[0] === "t" ? a[2] : a[1];

        if ((a[0] !== "p" && a[0] !== "t") || !Array.isArray(flat)) { return null; }

        const pts = [];

        for (let k = 0; k + 1 < flat.length && pts.length < 200; k += 2) { pts.push([n(flat[k]), n(flat[k + 1])]); }

        if (a[0] === "p") { return pts.length >= 3 ? { t: "p", pts: pts } : null; }

        return pts.length >= 2 ? { t: "t", w: num(a[1], 0.01, L, 10), pts: pts } : null;
    }


    function packDesign(d) {

        return {
            id: d.id, name: d.name, kind: d.kind, electrolyte: d.electrolyte, grid: d.grid, receptor: d.receptor || "none", culture: d.culture,
            layers: d.layers.map(function (l) {

                return {
                    id: l.id, name: l.name, role: l.role, material: l.material, treat: l.treat, thickness: l.thickness,
                    mode: l.mode, visible: l.visible ? 1 : 0, mask: l.mask, litho: l.litho, pore: l.pore, porosity: l.porosity,
                    shapes: l.shapes.map(packShape)
                };
            })
        };
    }


    function unpackDesign(raw) {

        if (!raw || typeof raw !== "object") { return null; }

        const kind = courseKind(raw.kind);
        const kdef = E.KINDS[kind];
        const receptors = window.LabFET ? window.LabFET.RECEPTORS : { none: 1 };

        const d = {
            id: safeId(raw.id, E.uid("D")),
            name: str(raw.name, 40),
            kind: kind,
            electrolyte: pick(raw.electrolyte, SC.ELECTROLYTES, "acid"),
            receptor: pick(raw.receptor, receptors, "none"),
            grid: [0.5, 1, 2, 5, 10, 20, 50, 100].indexOf(Number(raw.grid)) >= 0 ? Number(raw.grid) : 10,
            layers: []
        };

        if (Kinds[kind] && Kinds[kind].cleanCulture) { d.culture = Kinds[kind].cleanCulture(raw.culture, num); }

        (Array.isArray(raw.layers) ? raw.layers : []).slice(0, MAX_LAYERS).forEach(function (rl) {

            if (!rl || typeof rl !== "object") { return; }

            const role = typeof rl.role === "string" && kdef.roles.indexOf(rl.role) >= 0 ? rl.role : kdef.roles[0];
            const table = E.MATERIAL_TABLE[role];

            const material = pick(rl.material, table, E.defaultMaterial(role));

            const l = {
                id: safeId(rl.id, E.uid("L")),
                name: str(rl.name, 30) || "Layer",
                role: role,
                material: material,
                treat: role === "electrode" ? pick(rl.treat, SC.TREATMENTS, "none") : "none",
                thickness: num(rl.thickness, 0.0001, 100, 1),
                mode: role === "insulation" || role === "channel" ? (rl.mode === "add" || rl.mode === "cut" ? rl.mode : E.defaultMode(role, material)) : "add",
                visible: rl.visible !== 0 && rl.visible !== false,
                shapes: []
            };

            if (role === "membrane") {

                if (rl.pore !== undefined && rl.pore !== null) { l.pore = num(rl.pore, 0.05, 20, 0.4); }
                if (rl.porosity !== undefined && rl.porosity !== null) { l.porosity = num(rl.porosity, 0.01, 0.4, 0.1); }
            }

            const dp = E.defaultPatterning(l);

            const m = rl.mask || {};
            const p = rl.litho || {};

            const resist = pick(p.resist, SC.RESISTS, dp.litho.resist);
            const rs = SC.RESISTS[resist];

            l.mask = { type: pick(m.type, SC.MASK_TYPES, "film"), field: m.field === "dark" ? "dark" : "clear" };
            l.litho = {
                method: p.method === "etch" ? "etch" : "liftoff",
                resist: resist,
                tResist: num(p.tResist, rs.tMin, rs.tMax, rs.tDefault),
                dose: num(p.dose, 5, 2000, dp.litho.dose),
                dev: num(p.dev, 5, 2000, dp.litho.dev),
                bakeT: num(p.bakeT, 40, 300, rs.bakeT),
                bakeMin: num(p.bakeMin, 0.1, 200, rs.bakeMin)
            };

            (Array.isArray(rl.shapes) ? rl.shapes : []).slice(0, MAX_SHAPES).forEach(function (a) {

                const s = unpackShape(a);

                if (s) { l.shapes.push(s); }
            });

            E.syncLayer(l);

            d.layers.push(l);
        });

        return d.layers.length ? d : null;
    }


    function sanitizeProject(raw) {

        const p = freshProject();

        if (!raw || typeof raw !== "object") { return p; }

        p.step = STEPS.some(function (s) { return s.id === raw.step; }) ? raw.step : "designs";
        p.counter = Math.round(num(raw.counter, 0, 1e6, 0));
        p.bn = Math.round(num(raw.bn, 0, 1e6, 0));
        p.current = safeId(raw.current, "");

        (Array.isArray(raw.designs) ? raw.designs : []).slice(0, MAX_DESIGNS).forEach(function (d) {

            if (d && safeId(d.id, "")) { p.designs.push({ id: d.id, name: str(d.name, 40), kind: courseKind(d.kind) }); }
        });

        if (!p.designs.some(function (d) { return d.id === p.current; })) { p.current = p.designs.length ? p.designs[0].id : ""; }

        (Array.isArray(raw.batches) ? raw.batches : []).slice(0, MAX_BATCHES).forEach(function (b) {

            if (!b || !safeId(b.id, "")) { return; }

            p.batches.push({
                id: b.id, designId: safeId(b.designId, ""), designName: str(b.designName, 40), kind: courseKind(b.kind),
                label: str(b.label, 40), n: Math.round(num(b.n, 1, 3, 3)), seed: Math.round(num(b.seed, 1, 4294967295, 1)),
                created: str(b.created, 30)
            });
        });

        const byId = {};

        p.batches.forEach(function (b) { byId[b.id] = b; });

        (Array.isArray(raw.tests) ? raw.tests : []).slice(0, MAX_TESTS).forEach(function (t) {

            const b = t && byId[t.batchId];

            if (!b) { return; }

            const impl = kindImpl(b.kind);

            if (!impl || !impl.tests(b.kind).some(function (x) { return x.id === t.type; })) { return; }

            p.tests.push({
                id: str(t.id, 14), batchId: t.batchId, type: t.type, created: str(t.created, 30),
                params: impl.cleanParams(t.params || {}, num)
            });
        });

        return p;
    }


    function load() {

        try { localStorage.removeItem(OLD_KEY); } catch (e) { /* ignore */ }

        try {

            const raw = localStorage.getItem(KEY);

            project = sanitizeProject(raw ? JSON.parse(raw) : null);

        } catch (e) {

            project = freshProject();
        }

        project.designs = project.designs.filter(function (m) {

            try {

                const raw = localStorage.getItem(DKEY + m.id);
                const d = raw ? unpackDesign(JSON.parse(raw)) : null;

                if (!d) { return false; }

                d.id = m.id;
                designs[m.id] = d;
                m.name = d.name || m.name;
                m.kind = d.kind;

                return true;

            } catch (e) { return false; }
        });

        project.batches = project.batches.filter(function (b) {

            try {

                const raw = localStorage.getItem(BKEY + b.id);
                const d = raw ? unpackDesign(JSON.parse(raw)) : null;

                if (!d) { return false; }

                snaps[b.id] = d;
                b.kind = d.kind;

                return true;

            } catch (e) { return false; }
        });

        const bids = project.batches.map(function (b) { return b.id; });

        project.tests = project.tests.filter(function (t) { return bids.indexOf(t.batchId) >= 0; });

        if (!designs[project.current]) { project.current = project.designs.length ? project.designs[0].id : ""; }
    }


    const timers = {};

    function debounce(name, fn, ms) {

        clearTimeout(timers[name]);
        timers[name] = setTimeout(fn, ms);
    }

    function writeKey(key, obj) {

        try {

            const text = JSON.stringify(obj);

            if (text.length < 48000) { localStorage.setItem(key, text); return true; }

            toast("This design is too large to save. Delete some shapes.");

            return false;

        } catch (e) { return false; }
    }

    function saveProject() { debounce("project", function () { writeKey(KEY, project); }, 250); }

    function saveDesign(id) { debounce("d" + id, function () { if (designs[id]) { writeKey(DKEY + id, packDesign(designs[id])); } }, 350); }


    /* ------------------------------------------------
       SMALL HELPERS
    ------------------------------------------------ */

    function h(tag, attrs, kids) {

        const node = document.createElement(tag);

        Object.keys(attrs || {}).forEach(function (k) {

            const v = attrs[k];

            if (v === undefined || v === null || v === false) { return; }

            if (k === "className") { node.className = v; }
            else if (k === "text") { node.textContent = v; }
            else if (k === "html") { node.innerHTML = v; }                       // constants only
            else if (k.indexOf("on") === 0) { node.addEventListener(k.slice(2), v); }
            else { node.setAttribute(k, v === true ? "" : v); }
        });

        (kids || []).forEach(function (c) {

            if (c === null || c === undefined || c === false) { return; }

            node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
        });

        return node;
    }

    function mean(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : NaN; }

    function sd(a) {

        if (a.length < 2) { return 0; }

        const m = mean(a);

        return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1));
    }

    function sig(x, d) {

        if (!isFinite(x)) { return "n/a"; }

        const a = Math.abs(x);

        if (a === 0) { return "0"; }
        if (a >= 1000) { return Math.round(x).toLocaleString("en-US"); }
        if (a >= 100) { return x.toFixed(0); }
        if (a >= 10) { return x.toFixed(d === undefined ? 1 : d); }
        if (a >= 1) { return x.toFixed(d === undefined ? 2 : d); }
        if (a >= 0.01) { return x.toFixed(3); }

        return x.toExponential(1);
    }

    function pm(values, d) {

        const clean = values.filter(isFinite);

        if (!clean.length) { return "n/a"; }

        const m = mean(clean);
        const s = sd(clean);

        return clean.length > 1 ? sig(m, d) + " ± " + sig(s, d) : sig(m, d);
    }

    function toast(text) {

        const old = document.getElementById("labToast");

        if (old) { old.remove(); }

        const t = h("div", { id: "labToast", className: "lab-toast", role: "status", text: text });

        document.body.appendChild(t);

        setTimeout(function () { t.classList.add("show"); }, 10);
        setTimeout(function () { t.remove(); }, 3600);
    }

    function award(key, xp, why) {

        const k = (COURSE.award || "fabPathLab") + key;

        try {

            if (localStorage.getItem(k) === "true") { return; }

            const prev = parseInt(localStorage.getItem("fabPathXP"), 10) || 0;

            localStorage.setItem("fabPathXP", String(prev + xp));
            localStorage.setItem(k, "true");

            const el = document.getElementById("totalXPDisplay");

            if (el) { el.textContent = String(prev + xp); }

            toast("+" + xp + " XP: " + why);

        } catch (e) { /* ignore */ }
    }

    function slider(o) {

        const valueEl = h("span", { className: "lab-value" });
        const input = h("input", { type: "range", min: o.min, max: o.max, step: o.step, value: o.value, "aria-label": o.label });

        const show = function (v) { valueEl.textContent = (o.format ? o.format(v) : String(v)) + (o.unit ? " " + o.unit : ""); };

        show(o.value);

        input.addEventListener("input", function () { const v = Number(input.value); show(v); o.onChange(v); });

        return h("div", { className: "lab-field" }, [
            h("div", { className: "lab-field-top" }, [h("span", { className: "lab-label", text: o.label }), valueEl]),
            input,
            o.hint ? h("p", { className: "lab-hint", text: o.hint }) : null
        ]);
    }

    function cards(o) {

        const wrap = h("div", { className: "lab-cards", role: "radiogroup", "aria-label": o.label });

        o.items.forEach(function (it) {

            const card = h("button", {
                type: "button", className: "lab-card" + (it.id === o.value ? " active" : "") + (it.disabled ? " disabled" : ""),
                role: "radio", "aria-checked": it.id === o.value ? "true" : "false", disabled: it.disabled ? true : null,
                onclick: function () {

                    o.onChange(it.id);

                    Array.prototype.forEach.call(wrap.children, function (c) { c.classList.remove("active"); c.setAttribute("aria-checked", "false"); });

                    card.classList.add("active");
                    card.setAttribute("aria-checked", "true");
                }
            }, [h("strong", { text: it.title }), h("span", { text: it.body }), it.meta ? h("em", { text: it.meta }) : null]);

            wrap.appendChild(card);
        });

        return wrap;
    }

    function noteList(notes, okText) {

        const box = h("div", { className: "lab-notes" });

        if (!notes.length) { box.appendChild(h("p", { className: "lab-note ok", text: okText })); return box; }

        notes.forEach(function (n) { box.appendChild(h("p", { className: "lab-note warn", text: n })); });

        return box;
    }

    function table(head, rows) {

        const t = h("table", { className: "lab-table" });

        t.appendChild(h("thead", {}, [h("tr", {}, head.map(function (c) { return h("th", { scope: "col", text: c }); }))]));
        t.appendChild(h("tbody", {}, rows.map(function (r) {

            return h("tr", {}, r.map(function (c, k) { return h(k === 0 ? "th" : "td", k === 0 ? { scope: "row", text: c } : { text: c }); }));
        })));

        return h("div", { className: "lab-table-wrap" }, [t]);
    }

    function selectField(label, values, current, unit, onChange, hint) {

        const sel = h("select", { className: "lab-select", "aria-label": label, onchange: function (e) { onChange(Number(e.target.value)); } },
            values.map(function (v) { return h("option", { value: String(v), text: v + " " + unit }); }));

        sel.value = String(current);

        return h("div", { className: "lab-field" }, [h("span", { className: "lab-label", text: label }), sel, hint ? h("p", { className: "lab-hint", text: hint }) : null]);
    }

    function selectChoice(label, options, current, onChange, hint) {

        const sel = h("select", { className: "lab-select", "aria-label": label, onchange: function (e) { onChange(e.target.value); } },
            options.map(function (o) { return h("option", { value: o.value, text: o.label }); }));

        sel.value = current;

        return h("div", { className: "lab-field" }, [h("span", { className: "lab-label", text: label }), sel, hint ? h("p", { className: "lab-hint", text: hint }) : null]);
    }

    function nextCounter() { project.counter += 1; return project.counter; }

    function currentDesign() { return designs[project.current] || null; }

    function designName(d) { return d.name || (E.KINDS[d.kind].name + " " + d.id.slice(-3)); }

    function fmtLen(um) { return window.LabEditor ? window.LabEditor.fmtLen(um) : sig(um) + " µm"; }

    function fmtArea(um2) { return window.LabEditor ? window.LabEditor.fmtArea(um2) : sig(um2) + " µm²"; }


    /* ------------------------------------------------
       APP SHELL
    ------------------------------------------------ */

    let root;
    let panel;
    let editor = null;

    function go(id) {

        if (editor) { editor.destroy(); editor = null; }

        project.step = id;

        if (id === "build") { buildDesignId = ""; }

        saveProject();
        render();

        const top = document.getElementById("labTop");

        if (top) { top.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }

    function stepDone(id) {

        switch (id) {
            case "designs": return project.designs.length > 0;
            case "layout": return project.designs.some(function (m) { return designs[m.id] && designs[m.id].layers.some(function (l) { return l.shapes.length; }); });
            case "process": return project.batches.length > 0;
            case "build": return project.batches.length > 0;
            case "test": return project.tests.length > 0;
            case "compare": return project.batches.filter(function (b) { return project.tests.some(function (t) { return t.batchId === b.id; }); }).length >= 2;
            default: return false;
        }
    }

    function rail() {

        const nav = h("nav", { className: "lab-rail", "aria-label": "Lab steps" });

        STEPS.forEach(function (s, k) {

            const done = stepDone(s.id);

            nav.appendChild(h("button", {
                type: "button", className: "lab-rail-btn" + (project.step === s.id ? " active" : "") + (done ? " done" : ""),
                "aria-current": project.step === s.id ? "step" : null,
                onclick: function () { go(s.id); }
            }, [
                h("span", { className: "lab-rail-num", text: done && project.step !== s.id ? "✓" : String(k + 1) }),
                h("span", { className: "lab-rail-name", text: s.name })
            ]));
        });

        return nav;
    }

    function navButtons(prev, next, nextLabel) {

        return h("div", { className: "lab-actions no-print" }, [
            prev ? h("button", { type: "button", className: "lab-btn ghost", text: "← Back", onclick: function () { go(prev); } }) : h("span"),
            next ? h("button", { type: "button", className: "start-button lab-btn", text: nextLabel || "Next →", onclick: function () { go(next); } }) : null
        ]);
    }

    function heading(eyebrow, title, lead) {

        panel.appendChild(h("p", { className: "eyebrow", text: eyebrow }));
        panel.appendChild(h("h1", { text: title }));

        if (lead) { panel.appendChild(h("p", { className: "lab-lead", html: lead })); }
    }

    function render() {

        if (window.LabAnim) { window.LabAnim.stopAll(); }

        if (editor) { editor.destroy(); editor = null; }

        root.innerHTML = "";

        root.appendChild(h("div", { id: "labTop" }));
        root.appendChild(rail());

        panel = h("section", { className: "lab-panel lab-panel-" + project.step });

        root.appendChild(panel);

        const fn = { designs: stepDesigns, layout: stepLayout, process: stepProcess, build: stepBuild, test: stepTest, compare: stepCompare }[project.step];

        fn();
    }


    /* ------------------------------------------------
       STEP 1: DESIGNS
    ------------------------------------------------ */

    let newKind = "";
    let newTemplate = "";

    function designSummary(d) {

        const s = E.summarize(d);

        return d.layers.length + " layer" + (d.layers.length === 1 ? "" : "s") + (s.bbox ? " · footprint " + fmtLen(s.width) + " × " + fmtLen(s.height) : " · empty");
    }

    function createDesign() {

        if (project.designs.length >= MAX_DESIGNS) { toast("You have " + MAX_DESIGNS + " designs. Delete one first."); return; }

        const d = newTemplate === "blank" ? E.blankDesign(newKind) : E.buildTemplate(newKind, newTemplate);

        d.id = "D" + nextCounter();
        d.name = E.KINDS[newKind].name.split(" /")[0].split(" (")[0] + " " + project.counter;

        designs[d.id] = d;
        project.designs.push({ id: d.id, name: d.name, kind: d.kind });
        project.current = d.id;

        saveDesign(d.id);
        saveProject();

        award("FirstDesign", 10, "first design created");

        go("layout");
    }

    function stepDesigns() {

        heading("STEP 1 OF 6", "Your designs",
            "A project can hold <strong>several devices</strong>. Each design is a stack of mask layers that you draw yourself. " +
            "Build them, test them and compare them side by side.");

        if (!newKind || COURSE.kinds.indexOf(newKind) < 0) { newKind = COURSE.kinds[0]; }

        const tpls = E.TEMPLATES[newKind] || [];

        if (!tpls.some(function (t) { return t.id === newTemplate; })) { newTemplate = tpls.length ? tpls[0].id : "blank"; }

        if (project.designs.length) {

            const list = h("div", { className: "lab-batches" });

            project.designs.forEach(function (m) {

                const d = designs[m.id];

                const name = h("input", {
                    type: "text", className: "lab-name", maxlength: "40", value: d.name, placeholder: "Name this design", "aria-label": "Design name",
                    oninput: function (e) { d.name = e.target.value; m.name = d.name; saveDesign(d.id); saveProject(); }
                });

                const nb = project.batches.filter(function (b) { return b.designId === d.id; }).length;

                list.appendChild(h("div", { className: "lab-batch" + (m.id === project.current ? " current" : "") }, [
                    h("div", { className: "lab-batch-body" }, [
                        h("strong", { text: E.KINDS[d.kind].name + (m.id === project.current ? "  ·  open" : "") }),
                        name,
                        h("p", { text: designSummary(d) + " · " + nb + " batch" + (nb === 1 ? "" : "es") })
                    ]),
                    h("div", { className: "lab-batch-actions" }, [
                        h("button", { type: "button", className: "lab-btn small", text: "Draw layout", onclick: function () { project.current = d.id; go("layout"); } }),
                        h("button", { type: "button", className: "lab-btn small ghost", text: "Copy", onclick: function () { duplicateDesign(d.id); } }),
                        h("button", { type: "button", className: "lab-btn small ghost", text: "Delete", "aria-label": "Delete " + (d.name || "design"), onclick: function () { removeDesign(d.id); } })
                    ])
                ]));
            });

            panel.appendChild(list);
        }

        panel.appendChild(h("h2", { className: "lab-h2", text: project.designs.length ? "Add another design" : "Start your first design" }));

        const kindIds = Object.keys(E.KINDS).filter(function (k) { return COURSE.kinds.indexOf(k) >= 0 || !E.KINDS[k].ready; });

        panel.appendChild(cards({
            label: "Device type",
            items: kindIds.map(function (id) {

                const k = E.KINDS[id];
                const offered = COURSE.kinds.indexOf(id) >= 0;

                return { id: id, title: k.name, body: k.blurb, disabled: !k.ready || !offered, meta: k.ready && offered ? "Ready" : "Coming soon" };
            }),
            value: newKind,
            onChange: function (id) { newKind = id; newTemplate = ""; render(); }
        }));

        panel.appendChild(h("p", { className: "lab-label block", text: "Starting point" }));

        panel.appendChild(cards({
            label: "Template",
            items: tpls.map(function (t) { return { id: t.id, title: t.name, body: t.blurb }; }),
            value: newTemplate,
            onChange: function (id) { newTemplate = id; }
        }));

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [
            h("span"),
            h("button", { type: "button", className: "start-button lab-btn", text: "Create design and draw", onclick: createDesign })
        ]));

        panel.appendChild(h("p", { className: "lab-hint", text: "Every template is just a starting point. You can move, resize or delete anything, add layers and draw your own shapes. The physics is simplified so you can see real trends quickly. It is a learning tool, not a research-grade predictor." }));
    }

    function duplicateDesign(id) {

        if (project.designs.length >= MAX_DESIGNS) { toast("You have " + MAX_DESIGNS + " designs. Delete one first."); return; }

        const src = designs[id];
        const d = JSON.parse(JSON.stringify(src));

        d.id = "D" + nextCounter();
        d.name = (src.name || "Design") + " copy";
        d.layers.forEach(function (l) { l.id = E.uid("L"); });

        designs[d.id] = d;
        project.designs.push({ id: d.id, name: d.name, kind: d.kind });
        project.current = d.id;

        saveDesign(d.id);
        saveProject();
        render();
    }

    function removeDesign(id) {

        const nb = project.batches.filter(function (b) { return b.designId === id; }).length;

        if (!window.confirm("Delete this design?" + (nb ? " Its " + nb + " batches stay, because they hold their own frozen copy." : ""))) { return; }

        delete designs[id];

        try { localStorage.removeItem(DKEY + id); } catch (e) { /* ignore */ }

        project.designs = project.designs.filter(function (m) { return m.id !== id; });

        if (project.current === id) { project.current = project.designs.length ? project.designs[0].id : ""; }

        saveProject();
        render();
    }


    /* ------------------------------------------------
       STEP 2: LAYOUT
    ------------------------------------------------ */

    function needDesign() {

        panel.appendChild(h("p", { className: "lab-note warn", text: "Create or pick a design first." }));
        panel.appendChild(h("div", { className: "lab-actions" }, [h("span"), h("button", { type: "button", className: "start-button lab-btn", text: "Go to designs", onclick: function () { go("designs"); } })]));
    }

    function designPicker() {

        const sel = h("select", {
            className: "lab-select", "aria-label": "Design",
            onchange: function (e) { project.current = e.target.value; saveProject(); render(); }
        }, project.designs.map(function (m) { return h("option", { value: m.id, text: designName(designs[m.id]) + " (" + E.KINDS[designs[m.id].kind].name + ")" }); }));

        sel.value = project.current;

        return h("div", { className: "lab-picker" }, [h("label", { className: "lab-label", text: "Design" }), sel]);
    }

    function padHint(d) {

        if (E.KINDS[d.kind].padText) { return E.KINDS[d.kind].padText; }

        const need = E.KINDS[d.kind].need || [];

        const which = need.length ? "This device needs contact pads labelled " + need.join(", ") + (d.kind === "biofet" ? " (a gate pad is optional: the solution acts as the gate)" : "") + ", on a metal layer with no insulation covering them. " : "";

        return "Contact pads (the Pad tool) are where probes touch. " + which + "Conductors in different layers connect where they overlap with no insulation or semiconductor layer between them.";
    }

    function stepLayout() {

        heading("STEP 2 OF 6", "Draw your mask layers",
            "Each layer is one photomask. Draw the shapes with your mouse or finger and read the footprint and smallest feature live. " +
            "Stack as many layers as you need.");

        const d = currentDesign();

        if (!d) { needDesign(); return; }

        panel.appendChild(designPicker());

        const host = h("div", { className: "ed-host" });

        panel.appendChild(host);

        editor = window.LabEditor.mount(host, {
            design: d,
            onChange: function () {

                saveDesign(d.id);

                if (d.layers.some(function (l) { return l.shapes.length; })) { award("FirstDrawing", 15, "first shapes drawn"); }
                if (d.layers.filter(function (l) { return l.shapes.length; }).length >= 3) { award("Stack3", 20, "built a 3-layer stack"); }
            }
        });

        panel.appendChild(h("p", { className: "lab-hint", text: padHint(d) }));

        if (window.LabAnim) {

            panel.appendChild(h("h2", { className: "lab-h2", text: "Your layers in 3D" }));
            panel.appendChild(window.LabAnim.stack3dBox(function () { return currentDesign(); }).box);
        }

        panel.appendChild(navButtons("designs", "process", "Set up the process →"));
    }


    /* ------------------------------------------------
       STEP 3: PROCESS
    ------------------------------------------------ */

    function stepProcess() {

        heading("STEP 3 OF 6", "Materials, exposure and bake",
            "Every layer is patterned in turn: spin resist, expose it through the mask, develop, then deposit material and lift off or etch. " +
            "The minimum feature and gap come straight from your drawing.");

        const d = currentDesign();

        if (!d) { needDesign(); return; }

        const impl = kindImpl(d.kind);

        panel.appendChild(designPicker());

        if (impl.processExtras) { impl.processExtras(panel, d, function () { saveDesign(d.id); }, d.kind); }

        const used = d.layers.filter(function (l) { return l.shapes.length; });

        if (!used.length) {

            panel.appendChild(h("p", { className: "lab-note warn", text: "No layer has any shapes yet. Go back to the layout step and draw something." }));
            panel.appendChild(navButtons("layout", null));

            return;
        }

        if (window.LabAnim) {

            panel.appendChild(h("h2", { className: "lab-h2", text: "Watch a layer being made" }));
            panel.appendChild(window.LabAnim.processBox(function () { return currentDesign(); }).box);
        }

        const total = h("div", { className: "lab-report", "aria-live": "polite" });

        d.layers.forEach(function (l, k) {

            if (!l.shapes.length) { return; }

            panel.appendChild(layerCard(d, l, k, total));
        });

        panel.appendChild(total);

        updateTotal(d, total);

        panel.appendChild(navButtons("layout", "build", "Build devices →"));
    }

    function materialName(l) {

        const m = E.materialOf(l) || {};

        if (l.role === "electrode") { return SC.MATERIALS[l.material].name + " (" + SC.TREATMENTS[l.treat].name.toLowerCase() + ")"; }

        return m.name;
    }

    function updateTotal(d, box) {

        const sum = E.summarize(d);

        box.innerHTML = "";

        box.appendChild(h("h2", { text: "Process summary" }));

        const steps = d.layers.filter(function (l) { return l.shapes.length; }).map(function (l, k) {

            const lt = l.litho;
            const rs = SC.RESISTS[lt.resist];

            return (k + 1) + ". " + l.name + ": spin " + lt.tResist + " µm " + rs.name + ", expose " + lt.dose + " mJ/cm² through a " +
                (l.mask.type === "film" ? "film" : "chrome") + " mask, develop " + lt.dev + " s, bake " + lt.bakeT + " °C for " + lt.bakeMin + " min, " +
                (E.isPhoto(l) ? "keep the patterned resist as the " : (lt.method === "liftoff" ? "deposit " : "etch ")) + materialName(l) + " (" + (l.thickness < 0.1 ? sig(l.thickness * 1000) + " nm" : l.thickness + " µm") + ")" +
                (lt.method === "liftoff" && !E.isPhoto(l) ? ", lift off." : ".");
        });

        steps.forEach(function (t) { box.appendChild(h("p", { className: "lab-step-line", text: t })); });

        box.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Rough cost / lab time per batch" }), h("strong", { text: "$".repeat(Math.max(1, Math.min(8, Math.round(sum.cost / 3)))) + " · about " + sum.hours + " h" })]));
    }

    function layerCard(d, l, index, totalBox) {

        const impl = kindImpl(d.kind);

        const det = h("details", { className: "lab-layer-card", open: index < 3 ? true : null });

        const badge = h("span", { className: "lab-badge" });

        det.appendChild(h("summary", {}, [
            h("span", { className: "ed-swatch", style: "background:" + E.ROLES[l.role].color }),
            h("strong", { text: "Layer " + (index + 1) + ": " + l.name }),
            h("span", { className: "lab-muted", text: E.ROLES[l.role].name.split(" (")[0].split(" /")[0] }),
            badge
        ]));

        const body = h("div", { className: "lab-layer-body" });

        det.appendChild(body);

        const refresh = function () {

            saveDesign(d.id);
            report();
            updateTotal(d, totalBox);
        };

        const photo = E.isPhoto(l);

        const out = h("div", { className: "lab-report", "aria-live": "polite" });

        const handled = impl.layerExtras ? impl.layerExtras(l, body, d, refresh) : false;

        if (!handled) {

            const mat = E.materialOf(l);

            body.appendChild(h("p", { className: "lab-muted", text: mat.name + (l.role === "collector" ? "" : " · permittivity " + mat.eps) }));
        }

        if (E.SHEET_ROLES[l.role]) {

            // Membranes, probe bodies and coatings are cut, bought or dropped on: there is nothing to expose or bake.
            body.appendChild(h("p", { className: "lab-hint", text: E.SHEET_ROLES[l.role].hint }));
            body.appendChild(out);

            report();

            return det;
        }

        const tr = impl.thicknessRange ? impl.thicknessRange(l) : null;

        const rng = tr || { min: 0.05, max: l.role === "electrode" ? 40 : 10, step: l.role === "electrode" ? 1 : 0.05 };

        const thick = Math.max(rng.min, Math.min(rng.max, l.thickness));

        body.appendChild(slider({
            label: "Film thickness", min: rng.min, max: rng.max, step: rng.step, value: thick, unit: "",
            format: function (v) { return v < 0.1 ? sig(v * 1000) + " nm" : (Math.round(v * 100) / 100) + " µm"; },
            hint: l.role === "electrode" ? "Thicker films hold more material, but ions take longer to reach the inside, and thick films crack and peel." :
                l.role === "insulation" ? "Thin insulation gives more capacitance but has more pinholes that can short the layers on either side." :
                    l.role === "semiconductor" ? "Thin channels give better gate control. Very thin films are hard to make uniformly." :
                        l.role === "channel" ? "The channel height. Shallow channels give more shear stress on the cells for the same flow, but resist flow more and clog sooner." :
                            "Thicker metal carries more current but needs thicker resist to lift off.",
            onChange: function (v) {

                l.thickness = v;
                E.syncLayer(l);

                if (photo) { saveDesign(d.id); redrawCard(); } else { refresh(); }
            }
        }));

        body.appendChild(h("h3", { className: "lab-h3", text: "Patterning" }));

        if (photo) {

            body.appendChild(h("p", { className: "lab-hint", text: "This material is itself a photoresist: the patterned resist stays as the film, so its thickness matches the film thickness." }));

        } else {

            body.appendChild(h("div", { className: "lab-seg", role: "radiogroup", "aria-label": "Patterning method" }, [["liftoff", "Lift-off"], ["etch", "Etch"]].map(function (m) {

                return h("button", {
                    type: "button", className: "lab-seg-btn" + (l.litho.method === m[0] ? " active" : ""), role: "radio", "aria-checked": l.litho.method === m[0] ? "true" : "false",
                    onclick: function () { l.litho.method = m[0]; saveDesign(d.id); redrawCard(); }
                }, [m[1]]);
            })));

            body.appendChild(h("p", { className: "lab-hint", text: "Lift-off: deposit through the resist openings, then dissolve the resist. Etch: deposit everywhere, protect what you want with resist, etch the rest." }));

            const rsel = h("select", {
                className: "lab-select", "aria-label": "Resist for " + l.name,
                onchange: function (e) {

                    l.litho.resist = e.target.value;
                    l.litho.tResist = Math.max(SC.RESISTS[l.litho.resist].tMin, Math.min(SC.RESISTS[l.litho.resist].tMax, l.litho.tResist));
                    saveDesign(d.id);
                    redrawCard();
                }
            }, Object.keys(SC.RESISTS).map(function (id) { return h("option", { value: id, text: SC.RESISTS[id].name + " (" + SC.RESISTS[id].tMin + " to " + SC.RESISTS[id].tMax + " µm)" }); }));

            rsel.value = l.litho.resist;

            body.appendChild(h("label", { className: "lab-label block", text: "Photoresist" }));
            body.appendChild(rsel);

            const rs0 = SC.RESISTS[l.litho.resist];

            body.appendChild(slider({
                label: "Resist thickness", min: rs0.tMin, max: rs0.tMax, step: 0.5, value: l.litho.tResist, unit: "µm",
                hint: "Thicker resist needs more UV and develop time, and resolves coarser features.",
                onChange: function (v) { l.litho.tResist = v; refresh(); }
            }));
        }

        const mk = h("select", { className: "lab-select", "aria-label": "Mask type for " + l.name, onchange: function (e) { l.mask.type = e.target.value; refresh(); } },
            Object.keys(SC.MASK_TYPES).map(function (id) { return h("option", { value: id, text: SC.MASK_TYPES[id].name + " (about " + SC.MASK_TYPES[id].res + " µm)" }); }));

        mk.value = l.mask.type;

        body.appendChild(h("label", { className: "lab-label block", text: "Mask" }));
        body.appendChild(mk);

        body.appendChild(h("div", { className: "lab-seg", role: "radiogroup", "aria-label": "Mask polarity" }, [["dark", "Dark-field (shapes are clear)"], ["clear", "Clear-field (shapes are opaque)"]].map(function (m) {

            return h("button", {
                type: "button", className: "lab-seg-btn" + (l.mask.field === m[0] ? " active" : ""), role: "radio", "aria-checked": l.mask.field === m[0] ? "true" : "false",
                onclick: function () { l.mask.field = m[0]; saveDesign(d.id); redrawCard(); }
            }, [m[1]]);
        })));

        body.appendChild(h("p", { className: "lab-hint", text: "Positive resist dissolves where UV hits it, negative resist hardens where UV hits it. Which polarity prints your shapes depends on the resist and on lift-off versus etch." }));

        const rs = SC.RESISTS[l.litho.resist];

        body.appendChild(slider({ label: "UV exposure dose (365 nm)", min: 10, max: Math.max(800, Math.ceil(rs.dose(l.litho.tResist) * 2.2 / 100) * 100), step: 5, value: l.litho.dose, unit: "mJ/cm²", onChange: function (v) { l.litho.dose = v; refresh(); } }));
        body.appendChild(slider({ label: "Develop time", min: 10, max: Math.max(700, Math.ceil(rs.dev(l.litho.tResist) * 2.2 / 100) * 100), step: 5, value: l.litho.dev, unit: "s", onChange: function (v) { l.litho.dev = v; refresh(); } }));
        body.appendChild(slider({ label: "Bake temperature", min: 50, max: 260, step: 5, value: l.litho.bakeT, unit: "°C", onChange: function (v) { l.litho.bakeT = v; refresh(); } }));
        body.appendChild(slider({ label: "Bake time", min: 1, max: 60, step: 1, value: l.litho.bakeMin, unit: "min", onChange: function (v) { l.litho.bakeMin = v; refresh(); } }));

        body.appendChild(h("p", { className: "lab-hint", text: "Datasheet guide for " + l.litho.tResist + " µm: about " + Math.round(rs.dose(l.litho.tResist)) + " mJ/cm², " +
            Math.round(rs.dev(l.litho.tResist)) + " s develop, bake near " + rs.bakeT + " °C for about " + rs.bakeMin + " min." }));

        body.appendChild(h("button", {
            type: "button", className: "lab-btn small", text: "Reset to datasheet settings",
            onclick: function () {

                const p = E.defaultPatterning(l);

                l.mask = p.mask;
                l.litho = p.litho;

                E.syncLayer(l);
                saveDesign(d.id);
                redrawCard();
            }
        }));

        body.appendChild(out);

        function report() {

            const m = E.layerMetrics(l);
            const p = E.patterning(l, m);

            const q = p.status === "inverted" ? "Inverted pattern" : p.status === "lost" ? "Pattern lost" :
                p.quality > 0.85 ? "Excellent" : p.quality > 0.6 ? "Good" : p.quality > 0.3 ? "Marginal" : "Poor";

            badge.textContent = q;
            badge.className = "lab-badge " + (p.status !== "ok" || p.quality < 0.3 ? "bad" : p.quality < 0.6 ? "mid" : "good");

            out.innerHTML = "";

            out.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Pattern quality" }), h("strong", { text: q })]));
            out.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Smallest feature / gap on this layer" }), h("strong", { text: fmtLen(m.featureMin) + " / " + fmtLen(m.gapMin) })]));
            out.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Process limit" }), h("strong", { text: "about " + fmtLen(p.limit) })]));
            out.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Printed width change" }), h("strong", { text: (p.bias >= 0 ? "+" : "") + sig(p.bias) + " µm" })]));
            out.appendChild(noteList(p.notes, "The pattern should print cleanly. Misalignment between layers still varies from device to device."));
        }

        function redrawCard() {

            const wasOpen = det.hasAttribute("open");
            const fresh = layerCard(d, l, index, totalBox);

            if (wasOpen) { fresh.setAttribute("open", ""); } else { fresh.removeAttribute("open"); }

            det.replaceWith(fresh);
            updateTotal(d, totalBox);
        }

        report();

        return det;
    }


    /* ------------------------------------------------
       DEVICES AND TESTS
    ------------------------------------------------ */

    const devCache = {};

    function replicateSeed(b, k) { return (b.seed + 977 * (k + 1)) >>> 0; }

    function cacheKey(batch) { return batch.id + ":" + batch.seed + ":" + batch.n; }

    function runsOf(batch) {

        const key = cacheKey(batch);

        if (!devCache[key]) {

            const list = [];

            for (let k = 0; k < batch.n; k++) { list.push(E.fabricate(snaps[batch.id], replicateSeed(batch, k), {})); }

            devCache[key] = list;
        }

        return devCache[key];
    }

    function devicesOf(batch) { return runsOf(batch).map(function (r) { return r.dev; }); }

    function infosOf(batch) { return runsOf(batch).map(function (r) { return r.info; }); }

    function batchById(id) { return project.batches.filter(function (b) { return b.id === id; })[0]; }

    function batchName(b) { return (b.label ? b.id + ": " + b.label : "Batch " + b.id) + " (" + b.designName + ")"; }

    function shortName(b) { return "Batch " + b.id; }

    function batchColorIndex(id) {

        for (let k = 0; k < project.batches.length; k++) { if (project.batches[k].id === id) { return k; } }

        return 0;
    }

    function nextBatchId() {

        project.bn += 1;

        let id = "";
        let k = project.bn - 1;

        do { id = String.fromCharCode(65 + (k % 26)) + id; k = Math.floor(k / 26) - 1; } while (k >= 0);

        // Skip an id that is already taken (a deleted batch can leave gaps, never duplicates).
        return project.batches.some(function (b) { return b.id === id; }) ? nextBatchId() : id;
    }

    function lastTest(batchId, type) {

        const list = project.tests.filter(function (t) { return t.batchId === batchId && t.type === type; });

        return list.length ? list[list.length - 1] : null;
    }

    const resultCache = {};

    function measureTest(test) {

        const batch = batchById(test.batchId);

        if (!batch) { return null; }

        const key = test.id + JSON.stringify(test.params) + batch.seed;

        if (resultCache[key]) { return resultCache[key]; }

        const impl = kindImpl(batch.kind);

        const reps = devicesOf(batch).map(function (dev) { return impl.measure(test.type, dev, test.params); });

        const out = { test: test, batch: batch, reps: reps };

        resultCache[key] = out;

        return out;
    }


    /* ------------------------------------------------
       STEP 4: BUILD
    ------------------------------------------------ */

    let buildN = 3;
    let pendingMovie = "";
    let buildDesignId = "";
    let building = false;

    function batchLine(b) {

        const snap = snaps[b.id];
        const nl = snap.layers.filter(function (l) { return l.shapes.length; }).length;

        if (snap.kind === "supercap") { return nl + " layers · " + SC.ELECTROLYTES[snap.electrolyte].name; }

        if (kindImpl(snap.kind).batchInfo) { return nl + " layers · " + kindImpl(snap.kind).batchInfo(snap); }

        const sem = snap.layers.filter(function (l) { return l.role === "semiconductor"; })[0];

        return nl + " layers" + (sem ? " · " + E.SEMICONDUCTORS[sem.material].name : "") +
            (snap.kind === "biofet" && window.LabFET ? " · receptor: " + window.LabFET.RECEPTORS[snap.receptor || "none"].name.split(" (")[0].toLowerCase() : "");
    }

    function stepBuild() {

        heading("STEP 4 OF 6", "Fabricate a batch",
            "Each device is made from your drawing with small, realistic run-to-run changes: layer misalignment, feature size drift, film variation and the odd defect. " +
            "You will not know whether a device works until you test it.");

        if (!project.designs.length) { needDesign(); return; }

        if (!designs[buildDesignId]) { buildDesignId = project.current; }

        const sel = h("select", {
            className: "lab-select", "aria-label": "Design to build",
            onchange: function (e) { buildDesignId = e.target.value; render(); }
        }, project.designs.map(function (m) { return h("option", { value: m.id, text: designName(designs[m.id]) + " (" + E.KINDS[designs[m.id].kind].name + ")" }); }));

        sel.value = buildDesignId;

        panel.appendChild(h("div", { className: "lab-picker" }, [h("label", { className: "lab-label", text: "Design to build" }), sel]));

        const d = designs[buildDesignId];

        panel.appendChild(slider({
            label: "Devices in the batch", min: 1, max: 3, step: 1, value: buildN,
            hint: "Three devices let you report an average and a spread, which makes a comparison believable.",
            onChange: function (v) { buildN = v; }
        }));

        const sum = E.summarize(d);
        const checks = E.checkDesign(d);

        const report = h("div", { className: "lab-report" });

        report.appendChild(h("h2", { text: "This design" }));
        report.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Footprint" }), h("strong", { text: sum.bbox ? fmtLen(sum.width) + " × " + fmtLen(sum.height) : "empty" })]));
        report.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Layers with shapes" }), h("strong", { text: String(sum.layers) })]));

        if (d.kind === "supercap") { report.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Electrolyte" }), h("strong", { text: SC.ELECTROLYTES[d.electrolyte].name })])); }

        if (kindImpl(d.kind).designRows) {

            kindImpl(d.kind).designRows(d).forEach(function (row) { report.appendChild(h("div", { className: "lab-row" }, [h("span", { text: row[0] }), h("strong", { text: row[1] })])); });
        }

        if (d.kind === "biofet" && window.LabFET) { report.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Receptor" }), h("strong", { text: window.LabFET.RECEPTORS[d.receptor || "none"].name })])); }

        report.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Rough cost / lab time" }), h("strong", { text: "$".repeat(Math.max(1, Math.min(8, Math.round(sum.cost / 3)))) + " · about " + sum.hours + " h" })]));

        report.appendChild(noteList(checks.filter(function (c) { return c.level !== "info"; }).map(function (c) { return c.text; }), "No problems spotted in the design. You can still be surprised at the test bench."));

        panel.appendChild(report);

        const make = h("button", { type: "button", className: "start-button lab-btn", text: "Fabricate batch", onclick: fabricate });

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [h("span"), make]));

        function fabricate() {

            if (building) { return; }

            if (project.batches.length >= MAX_BATCHES) { toast("You have " + MAX_BATCHES + " batches. Delete one first."); return; }

            if (!sum.bbox) { toast("Draw something first."); return; }

            building = true;
            make.disabled = true;
            make.textContent = "Fabricating…";

            const seed = (Math.floor(Math.random() * 4e9) + 1) >>> 0;
            const batch = { id: nextBatchId(), designId: d.id, designName: designName(d), kind: d.kind, label: "", n: buildN, seed: seed, created: new Date().toISOString().slice(0, 10) };

            const snap = JSON.parse(JSON.stringify(d));

            snaps[batch.id] = snap;

            const results = [];
            let k = 0;

            const step = function () {

                if (k < batch.n) {

                    make.textContent = "Fabricating device " + (k + 1) + " of " + batch.n + "…";

                    results.push(E.fabricate(snap, replicateSeed(batch, k), {}));

                    k += 1;

                    setTimeout(step, 20);

                    return;
                }

                devCache[cacheKey(batch)] = results;

                pendingMovie = batch.id;

                project.batches.push(batch);

                writeKey(BKEY + batch.id, packDesign(snap));
                saveProject();

                building = false;

                award("FirstBatch", 20, "first batch built");

                if (snap.layers.filter(function (l) { return l.shapes.length; }).length >= 3) { award("Batch3Layers", 25, "built a multi-layer device"); }

                render();
            };

            setTimeout(step, 30);
        }

        if (project.batches.length) {

            panel.appendChild(h("h2", { className: "lab-h2", text: "Your batches" }));

            const list = h("div", { className: "lab-batches" });

            project.batches.forEach(function (b, k) {

                const name = h("input", {
                    type: "text", className: "lab-name", maxlength: "40", value: b.label, placeholder: "Name this batch (optional)", "aria-label": "Name for batch " + b.id,
                    oninput: function (e) { b.label = e.target.value; saveProject(); }
                });

                const preview = h("div", { className: "lab-micro" });

                list.appendChild(h("div", { className: "lab-batch col" }, [
                    h("div", { className: "lab-batch-row" }, [
                        h("span", { className: "lab-dot", style: "background:" + D.color(k, "dark") }),
                        h("div", { className: "lab-batch-body" }, [
                            h("strong", { text: "Batch " + b.id + " · " + b.n + " device" + (b.n > 1 ? "s" : "") + " · " + b.designName }),
                            name,
                            h("p", { text: batchLine(b) })
                        ]),
                        h("div", { className: "lab-batch-actions" }, [
                            h("button", { type: "button", className: "lab-btn small ghost", text: "Watch it made", onclick: function () { showMovie(b, preview); } }),
                            h("button", { type: "button", className: "lab-btn small ghost", text: "Microscope view", onclick: function () { showMicro(b, preview); } }),
                            h("button", { type: "button", className: "lab-btn small", text: "Test", onclick: function () { testBatch = b.id; go("test"); } }),
                            h("button", { type: "button", className: "lab-btn small ghost", text: "Delete", "aria-label": "Delete batch " + b.id, onclick: function () { removeBatch(b.id); } })
                        ])
                    ]),
                    preview
                ]));

                if (pendingMovie === b.id) { pendingMovie = ""; showMovie(b, preview); }
            });

            panel.appendChild(list);
        }

        panel.appendChild(navButtons("process", "test", "Go test them →"));
    }

    function showMovie(b, box) {

        if (box.firstChild) { box.innerHTML = ""; return; }

        if (!window.LabAnim) { return; }

        const r = E.fabricate(snaps[b.id], replicateSeed(b, 0), { keepRasters: true });

        if (r.raster) { box.appendChild(window.LabAnim.buildBox(r.raster, r.info).box); }
    }

    function showMicro(b, box) {

        if (box.firstChild) { box.innerHTML = ""; return; }

        const r = E.fabricate(snaps[b.id], replicateSeed(b, 0), { keepRasters: true });

        const canvas = h("canvas", { role: "img", "aria-label": "Microscope view of device 1, all layers stacked" });

        box.appendChild(h("p", { className: "lab-cap", text: "Device 1 as fabricated, all layers stacked. Notice the layer-to-layer misalignment and any feature drift." }));
        box.appendChild(canvas);

        if (r.raster) { drawMicro(canvas, r.raster); }

        const legend = h("div", { className: "lab-legend" });

        snaps[b.id].layers.filter(function (l) { return l.shapes.length; }).forEach(function (l) {

            legend.appendChild(h("span", { className: "lab-legend-item" }, [h("span", { className: "ed-swatch", style: "background:" + E.ROLES[l.role].color }), l.name]));
        });

        box.appendChild(legend);
    }

    function drawMicro(canvas, r) {

        const f = r.frame;
        const scale = Math.max(1, Math.min(560 / f.w, 360 / f.h));

        const cw = Math.round(f.w * scale);
        const ch = Math.round(f.h * scale);

        const off = document.createElement("canvas");

        off.width = f.w;
        off.height = f.h;

        const octx = off.getContext("2d");
        const img = octx.createImageData(f.w, f.h);

        const px = img.data;

        const cols = r.per.map(function (q) {

            return { hex: parseInt(E.ROLES[q.layer.role].color.slice(1), 16), a: q.layer.role === "insulation" ? 0.4 : 0.85 };
        });

        for (let i = 0; i < f.w * f.h; i++) {

            let R = 13;
            let Gc = 19;
            let B = 38;

            for (let k = 0; k < cols.length; k++) {

                if (!r.P[k][i]) { continue; }

                const a = cols[k].a;

                R = R * (1 - a) + (cols[k].hex >> 16) * a;
                Gc = Gc * (1 - a) + ((cols[k].hex >> 8) & 255) * a;
                B = B * (1 - a) + (cols[k].hex & 255) * a;
            }

            px[i * 4] = R;
            px[i * 4 + 1] = Gc;
            px[i * 4 + 2] = B;
            px[i * 4 + 3] = 255;
        }

        octx.putImageData(img, 0, 0);

        canvas.width = cw;
        canvas.height = ch;

        const c = canvas.getContext("2d");

        c.imageSmoothingEnabled = false;
        c.drawImage(off, 0, 0, cw, ch);
    }

    function removeBatch(id) {

        project.batches = project.batches.filter(function (b) { return b.id !== id; });
        project.tests = project.tests.filter(function (t) { return t.batchId !== id; });

        delete snaps[id];

        try { localStorage.removeItem(BKEY + id); } catch (e) { /* ignore */ }

        saveProject();
        render();
    }


    /* ------------------------------------------------
       STEP 5: TEST BENCH
    ------------------------------------------------ */

    let testBatch = "";
    let testType = "";
    let shown = null;
    let refreshParamsFn = function () { };

    function stepTest() {

        heading("STEP 5 OF 6", "The test bench", "");

        if (!project.batches.length) {

            panel.appendChild(h("p", { className: "lab-lead", text: "Build a batch first, then come back to measure it." }));
            panel.appendChild(h("p", { className: "lab-note warn", text: "You have not built any devices yet. Fabricate a batch first." }));
            panel.appendChild(navButtons("build", null));

            return;
        }

        if (!batchById(testBatch)) { testBatch = project.batches[project.batches.length - 1].id; }

        const batch = batchById(testBatch);
        const impl = kindImpl(batch.kind);
        const tests = impl.tests(batch.kind);

        panel.appendChild(h("p", { className: "lab-lead", text: impl.testLead || "Apply voltages or currents to your devices and measure the response. Start with the continuity check, then work through the tests. Each test runs on every device in the batch." }));

        if (!tests.some(function (t) { return t.id === testType; })) { testType = tests[0].id; }

        const bar = h("div", { className: "lab-bench" });

        const sel = h("select", {
            className: "lab-select", "aria-label": "Batch to test",
            onchange: function (e) { testBatch = e.target.value; shown = null; render(); }
        }, project.batches.map(function (b) { return h("option", { value: b.id, text: batchName(b) }); }));

        sel.value = testBatch;

        bar.appendChild(h("label", { className: "lab-label block", text: "Batch" }));
        bar.appendChild(sel);
        bar.appendChild(h("label", { className: "lab-label block", text: "Test" }));

        bar.appendChild(cards({
            label: "Test type", items: tests.map(function (t) { return { id: t.id, title: t.name, body: t.blurb }; }),
            value: testType, onChange: function (id) { testType = id; renderParams(); }
        }));

        panel.appendChild(bar);

        const paramBox = h("div", { className: "lab-params" });

        panel.appendChild(paramBox);

        const devs = devicesOf(batch);

        const params = impl.defaultParams(batch, devs);

        function renderParams() {

            paramBox.innerHTML = "";

            impl.paramControls(testType, params, devs, batch.kind).forEach(function (el) { paramBox.appendChild(el); });

            paramBox.appendChild(h("div", { className: "lab-actions no-print" }, [h("span"), h("button", { type: "button", className: "start-button lab-btn", text: "Run test", onclick: runIt })]));
        }

        refreshParamsFn = renderParams;

        const out = h("div", { className: "lab-results", id: "labResults", "aria-live": "polite" });

        panel.appendChild(out);

        function runIt() {

            if (project.tests.length >= MAX_TESTS) { toast("You have " + MAX_TESTS + " saved tests. Delete a batch to free some up."); return; }

            const t = {
                id: "t" + (Date.now() % 1e8).toString(36) + project.tests.length, batchId: testBatch, type: testType,
                params: impl.cleanParams(params, num), created: new Date().toISOString().slice(0, 10)
            };

            project.tests.push(t);
            shown = t.id;

            saveProject();

            award("FirstTest", 20, "first measurement");

            if (testType === "eis") { award("FirstEIS", 15, "first impedance scan"); }
            if (testType === "cycling") { award("FirstCycling", 15, "first lifetime test"); }
            if (testType === "transfer") { award("FirstTransfer", 15, "first transfer curve"); }
            if (testType === "teer") { award("FirstTEER", 15, "first TEER reading"); }
            if (testType === "rec") { award("FirstSpikes", 20, "first spike recording"); }
            if (testType === "da") { award("FirstDopamine", 20, "first dopamine calibration"); }
            if (testType === "glu") { award("FirstGlutamate", 20, "first glutamate sensor test"); }
            if (testType === "papp") { award("FirstPermeability", 20, "first permeability assay"); }
            if (testType === "sense") { award("FirstSense", 20, "first sensing titration"); }

            showResult(t);
        }

        function showResult(t) {

            out.innerHTML = "";

            const r = measureTest(t);

            out.appendChild(h("h2", { text: tests.filter(function (x) { return x.id === t.type; })[0].name + ": " + batchName(r.batch) }));

            if (window.LabAnim && window.LabAnim.insideBox) {

                const inside = window.LabAnim.insideBox(r.batch.kind, r, devicesOf(r.batch));

                if (inside) { out.appendChild(inside); }
            }

            impl.view(out, r, "dark", batchColorIndex(r.batch.id));

            out.appendChild(analysisBox(r.batch));

            history();
        }

        const hist = h("div", { className: "lab-history" });

        panel.appendChild(hist);

        function history() {

            hist.innerHTML = "";

            const mine = project.tests.filter(function (t) { return t.batchId === testBatch; });

            if (!mine.length) { return; }

            hist.appendChild(h("h2", { className: "lab-h2", text: "Earlier tests on " + shortName(batch) }));

            mine.slice().reverse().forEach(function (t) {

                const kind = tests.filter(function (x) { return x.id === t.type; })[0].name;

                hist.appendChild(h("button", {
                    type: "button", className: "lab-hist" + (t.id === shown ? " active" : ""),
                    onclick: function () { shown = t.id; showResult(t); }
                }, [h("strong", { text: kind }), h("span", { text: impl.describeParams(t) })]));
            });
        }

        renderParams();

        const cur = shown ? project.tests.filter(function (x) { return x.id === shown && x.batchId === testBatch; })[0] : null;

        if (cur) { showResult(cur); } else { history(); }

        panel.appendChild(navButtons("build", "compare", "Compare batches →"));
    }

    // "Why does it behave like this?" Offered after a test, so it stays a discovery.
    function analysisBox(batch) {

        const impl = kindImpl(batch.kind);

        const det = h("details", { className: "lab-layer-card" });

        det.appendChild(h("summary", {}, [h("strong", { text: "Why does it behave like this? (failure analysis)" })]));

        const infos = infosOf(batch);
        const devs = devicesOf(batch);

        const body = h("div", { className: "lab-layer-body" });

        devs.forEach(function (dv, k) {

            const inf = infos[k];

            body.appendChild(h("h3", { className: "lab-h3", text: "Device " + (k + 1) + ": " + ({ ok: "working", short: "shorted", leaky: "leaks", blocked: "blocked", crosstalk: "channels joined" }[dv.status] || "open / failed") }));

            if (dv.reason) { body.appendChild(h("p", { className: "lab-note warn", text: dv.reason })); }

            impl.analysis(dv, inf).forEach(function (el) { body.appendChild(el); });

            inf.layers.forEach(function (ly) {

                const dz = ly.dx || ly.dy ? ", shifted " + sig(Math.hypot(ly.dx, ly.dy)) + " µm" : "";

                body.appendChild(h("p", { className: "lab-hint", text: ly.name + ": quality " + Math.round(ly.quality * 100) + "%" + (ly.status !== "ok" ? " (" + ly.status + ")" : "") + dz }));
            });

            inf.notes.forEach(function (n) { body.appendChild(h("p", { className: "lab-note warn", text: n })); });
        });

        det.appendChild(body);

        return det;
    }


    /* ------------------------------------------------
       STEP 6: COMPARE
    ------------------------------------------------ */

    let picks = null;
    const picksSeen = [];

    function compareCharts(container, batches, theme, impl) {

        const colors = {};

        project.batches.forEach(function (b, k) { colors[b.id] = D.color(k, theme); });

        const bars = impl.charts(container, batches, theme, colors) || [];

        const heads = batches.map(function (b) { return { b: b, h: impl.headline(b) }; });

        const mk = function (cfg, fn) { const c = h("canvas", { role: "img" }); fn(c, cfg); container.appendChild(c); };

        bars.forEach(function (spec) {

            const items = heads.filter(function (x) { return x.h[spec.key]; }).map(function (x) {

                const vals = x.h[spec.key].filter(isFinite);

                return { label: shortName(x.b), value: mean(vals), error: sd(vals), color: colors[x.b.id] };
            });

            if (items.length) { mk({ theme: theme, title: spec.title, yLabel: spec.yLabel, bars: items }, D.bars); }
        });

        const sharedBars = function (title, yLabel, fn) {

            mk({ theme: theme, title: title, yLabel: yLabel, bars: batches.map(function (b) { return { label: shortName(b), value: fn(b), error: 0, color: colors[b.id] }; }) }, D.bars);
        };

        sharedBars("Fraction of devices that work", "%", function (b) {

            const devs = devicesOf(b);

            return devs.filter(function (x) { return x.status === "ok"; }).length / devs.length * 100;
        });

        sharedBars("Rough cost per batch (relative)", "units", function (b) { return devicesOf(b)[0].cost; });
    }

    function metricTable(batches, impl) {

        const rows = batches.map(function (b) {

            const hd = impl.headline(b);
            const devs = devicesOf(b);
            const ok = devs.filter(function (x) { return x.status === "ok"; }).length;
            const snap = snaps[b.id];

            return [
                shortName(b) + " (" + b.designName + ")",
                ok + " / " + devs.length,
                snap.layers.filter(function (l) { return l.shapes.length; }).length + " layers",
                (devs[0].footprint * 100).toFixed(3) + " mm²"
            ].concat(impl.tableRow(hd, b));
        });

        return table(["Batch", "Working", "Stack", "Footprint"].concat(impl.tableHead), rows);
    }

    function observations(batches, impl) {

        const out = [];
        const heads = batches.map(function (b) { return { b: b, h: impl.headline(b) }; });

        impl.ranks.forEach(function (rk) {

            const key = rk.key;

            const have = heads.filter(function (x) { return x.h[key] && x.h[key].some(isFinite); });

            if (have.length < 2) { return; }

            have.sort(function (a, b) { const dd = mean(a.h[key].filter(isFinite)) - mean(b.h[key].filter(isFinite)); return rk.higher ? -dd : dd; });

            const best = have[0];
            const worst = have[have.length - 1];
            const mb = mean(best.h[key].filter(isFinite));
            const mw = mean(worst.h[key].filter(isFinite));

            if (!isFinite(mb) || !isFinite(mw) || mw === 0) { return; }

            const diff = Math.abs(mb - mw) / Math.abs(mw) * 100;
            const overlap = Math.abs(mb - mw) < (sd(best.h[key].filter(isFinite)) + sd(worst.h[key].filter(isFinite)));

            out.push(shortName(best.b) + " (" + best.b.designName + ") had the " + (rk.higher ? "highest " : "lowest ") + rk.label + " (" + sig(mb, rk.digits) + (rk.unit ? " " + rk.unit : "") + ") versus " +
                sig(mw, rk.digits) + (rk.unit ? " " + rk.unit : "") + " for " + shortName(worst.b) + ", a difference of " + Math.round(diff) + "%." +
                (overlap ? " That is within the spread between devices, so it may not be a real difference." : ""));
        });

        return out;
    }

    function stepCompare() {

        heading("STEP 6 OF 6", "Compare your devices",
            "Put batches side by side, even from different designs. The best comparisons change <strong>one thing</strong> between batches, and note where a difference is bigger than the spread between devices.");

        const tested = project.batches.filter(function (b) { return project.tests.some(function (t) { return t.batchId === b.id; }); });

        if (!tested.length) {

            panel.appendChild(h("p", { className: "lab-note warn", text: "Test at least one batch first. Comparisons use your most recent test of each kind." }));
            panel.appendChild(navButtons("test", null));

            return;
        }

        // Newly tested batches join the comparison the first time they are seen; one the user unticked stays unticked.
        if (!picks) { picks = []; }

        tested.forEach(function (b) {

            if (picksSeen.indexOf(b.id) < 0) { picksSeen.push(b.id); picks.push(b.id); }
        });

        picks = picks.filter(function (id) { return tested.some(function (b) { return b.id === id; }); });

        panel.appendChild(h("p", { className: "lab-label block", text: "Batches to compare" }));

        const row = h("div", { className: "lab-picks" });

        tested.forEach(function (b) {

            const cb = h("input", {
                type: "checkbox",
                onchange: function (e) {

                    const i = picks.indexOf(b.id);

                    if (e.target.checked && i < 0) { picks.push(b.id); }
                    if (!e.target.checked && i >= 0) { picks.splice(i, 1); }

                    draw();
                }
            });

            cb.checked = picks.indexOf(b.id) >= 0;

            row.appendChild(h("label", { className: "lab-pick" }, [cb, h("span", { className: "lab-dot", style: "background:" + D.color(batchColorIndex(b.id), "dark") }), h("span", { text: batchName(b) })]));
        });

        panel.appendChild(row);

        const area = h("div", { className: "lab-compare" });

        panel.appendChild(area);

        function draw() {

            area.innerHTML = "";

            const sel = tested.filter(function (b) { return picks.indexOf(b.id) >= 0; });

            if (!sel.length) { area.appendChild(h("p", { className: "lab-note warn", text: "Pick at least one batch." })); return; }

            const impl = kindImpl(sel[0].kind);

            const same = sel.filter(function (b) { return kindImpl(b.kind) === impl; });

            if (same.length < sel.length) { area.appendChild(h("p", { className: "lab-note warn", text: "Batches of different device types cannot be compared on the same measurements. Showing " + E.KINDS[sel[0].kind].name + " only." })); }

            if (same.length >= 2) { award("Compared", 30, "compared two batches"); }

            if (new Set(same.map(function (b) { return b.designId; })).size >= 2) { award("ComparedDesigns", 30, "compared different designs"); }

            area.appendChild(metricTable(same, impl));

            const charts = h("div", { className: "lab-charts" });

            area.appendChild(charts);

            compareCharts(charts, same, "dark", impl);

            const obs = observations(same, impl);

            if (obs.length) {

                area.appendChild(h("h2", { className: "lab-h2", text: "What the numbers say" }));
                area.appendChild(h("ul", { className: "lab-obs" }, obs.map(function (o) { return h("li", { text: o }); })));
            }

            area.appendChild(h("p", { className: "lab-hint", text: "Ask yourself: what changed between these batches? Which result surprised you? A trade-off is a finding, not a failure. To dig into a result, open the failure analysis on the test bench." }));
        }

        draw();

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [
            h("button", { type: "button", className: "lab-btn ghost", text: "← Back to testing", onclick: function () { go("test"); } }),
            h("div", { className: "lab-action-group" }, [
                h("button", { type: "button", className: "lab-btn ghost", text: "Print this comparison", onclick: function () { window.print(); } }),
                h("button", { type: "button", className: "start-button lab-btn", text: "Design another device", onclick: function () { go("designs"); } })
            ])
        ]));
    }


    /* ------------------------------------------------
       START
    ------------------------------------------------ */

    function start() {

        root = document.getElementById("labApp");

        if (!root || !SC || !D || !G || !E || !window.LabEditor) { return; }

        Kinds.env = {
            h: h, slider: slider, selectField: selectField, selectChoice: selectChoice, cards: cards, table: table, noteList: noteList,
            pm: pm, sig: sig, mean: mean, sd: sd, fmtLen: fmtLen, fmtArea: fmtArea, lastTest: lastTest, measureTest: measureTest,
            devicesOf: devicesOf, shortName: shortName, refreshParams: function () { refreshParamsFn(); }
        };

        load();

        const stats = document.getElementById("totalXPDisplay");

        if (stats) { stats.textContent = localStorage.getItem("fabPathXP") || "0"; }

        render();
    }

    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }

}());
