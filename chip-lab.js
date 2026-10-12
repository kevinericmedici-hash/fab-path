/* ========================================
   SAND TO CHIP: THE VIRTUAL FOUNDRY (app)

   A guided lab that follows a pile of sand all the way to packaged chips.
   Nine stations, each with real choices that change the numbers further
   down the line. The physics lives in chip-lab-model.js.

   Needs window.ChipLab and window.SCLabDraw.
======================================== */

(function () {

    "use strict";

    const C = window.ChipLab;
    const D = window.SCLabDraw;
    const A = window.ChipAnim;

    const KEY = "fabPathLabChip";
    const MAX_RUNS = 8;

    const STEPS = [
        { id: "sand", name: "Sand" },
        { id: "furnace", name: "Furnace" },
        { id: "purify", name: "Purify" },
        { id: "crystal", name: "Crystal" },
        { id: "wafers", name: "Wafers" },
        { id: "fab", name: "Fab" },
        { id: "chip", name: "Chips" },
        { id: "pack", name: "Package" },
        { id: "results", name: "Results" }
    ];


    /* ------------------------------------------------
       STATE
    ------------------------------------------------ */

    function newSeed() { return Math.floor(Math.random() * 4e9) + 1; }

    function fresh() {

        return { v: 1, step: "sand", c: C.sanitize({ seed: newSeed() }), seen: {}, runs: [], mapSeed: 1 };
    }

    let S = fresh();

    function load() {

        try {

            const raw = JSON.parse(localStorage.getItem(KEY) || "null");

            if (!raw || typeof raw !== "object") { return; }

            S.c = C.sanitize(raw.c);
            S.step = STEPS.some(function (s) { return s.id === raw.step; }) ? raw.step : "sand";

            S.seen = {};

            STEPS.forEach(function (s) { if (raw.seen && raw.seen[s.id]) { S.seen[s.id] = true; } });

            S.runs = [];

            (Array.isArray(raw.runs) ? raw.runs : []).slice(0, MAX_RUNS).forEach(function (r) {

                if (!r || typeof r !== "object") { return; }

                S.runs.push({ id: String(r.id || "").slice(0, 12) || "r" + S.runs.length, label: String(r.label || "").slice(0, 40), created: String(r.created || "").slice(0, 12), c: C.sanitize(r.c) });
            });

        } catch (e) { S = fresh(); }
    }

    let saveTimer = 0;

    function save() {

        clearTimeout(saveTimer);

        saveTimer = setTimeout(function () {

            try {

                const text = JSON.stringify({ v: 1, step: S.step, c: S.c, seen: S.seen, runs: S.runs });

                if (text.length < 48000) { localStorage.setItem(KEY, text); }

            } catch (e) { /* ignore */ }

        }, 250);
    }


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

    function sig(x, d) {

        if (!isFinite(x)) { return "n/a"; }

        const a = Math.abs(x);

        if (a === 0) { return "0"; }
        if (a >= 1e9) { return (x / 1e9).toFixed(a >= 1e10 ? 0 : 1) + " billion"; }
        if (a >= 1e6) { return (x / 1e6).toFixed(a >= 1e7 ? 0 : 1) + " million"; }
        if (a >= 1000) { return Math.round(x).toLocaleString("en-US"); }
        if (a >= 100) { return x.toFixed(0); }
        if (a >= 10) { return x.toFixed(d === undefined ? 1 : d); }
        if (a >= 1) { return x.toFixed(d === undefined ? 2 : d); }
        if (a >= 0.01) { return x.toFixed(3); }

        return x.toExponential(1);
    }

    function money(x) {

        if (!isFinite(x)) { return "n/a"; }
        if (x >= 1e6) { return "$" + (x / 1e6).toFixed(1) + " M"; }
        if (x >= 1e4) { return "$" + Math.round(x).toLocaleString("en-US"); }
        if (x >= 100) { return "$" + x.toFixed(0); }
        if (x >= 1) { return "$" + x.toFixed(2); }

        return "$" + x.toFixed(3);
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

        const k = "fabPathLabChip" + key;

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

    // A slider whose steps are evenly spaced in the logarithm of the value.
    function logSlider(o) {

        const a = Math.log10(o.min);
        const b = Math.log10(o.max);

        const toPos = function (v) { return Math.round((Math.log10(Math.max(v, o.min)) - a) / (b - a) * 1000); };
        const fromPos = function (p) { return Math.pow(10, a + (b - a) * p / 1000); };

        return slider({
            label: o.label, min: 0, max: 1000, step: 1, value: toPos(o.value), unit: o.unit, hint: o.hint,
            format: function (p) { return o.format ? o.format(fromPos(p)) : sig(fromPos(p)); },
            onChange: function (p) { o.onChange(fromPos(p)); }
        });
    }

    function cards(o) {

        const wrap = h("div", { className: "lab-cards", role: "radiogroup", "aria-label": o.label });

        o.items.forEach(function (it) {

            const card = h("button", {
                type: "button", className: "lab-card" + (it.id === o.value ? " active" : "") + (it.disabled ? " disabled" : ""),
                role: "radio", "aria-checked": it.id === o.value ? "true" : "false",
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

    function selectChoice(label, options, current, onChange, hint) {

        const sel = h("select", { className: "lab-select", "aria-label": label, onchange: function (e) { onChange(e.target.value); } },
            options.map(function (o) { return h("option", { value: o.value, text: o.label }); }));

        sel.value = current;

        return h("div", { className: "lab-field" }, [h("span", { className: "lab-label", text: label }), sel, hint ? h("p", { className: "lab-hint", text: hint }) : null]);
    }

    function check(label, blurb, on, onChange) {

        const cb = h("input", { type: "checkbox", onchange: function (e) { onChange(e.target.checked); } });

        cb.checked = !!on;

        return h("label", { className: "lab-pick cl-check" }, [cb, h("span", {}, [h("strong", { text: label }), h("small", { text: blurb })])]);
    }

    function table(head, rows) {

        const t = h("table", { className: "lab-table" });

        t.appendChild(h("thead", {}, [h("tr", {}, head.map(function (c) { return h("th", { scope: "col", text: c }); }))]));
        t.appendChild(h("tbody", {}, rows.map(function (r) {

            return h("tr", {}, r.map(function (c, k) { return h(k === 0 ? "th" : "td", k === 0 ? { scope: "row", text: c } : { text: c }); }));
        })));

        return h("div", { className: "lab-table-wrap" }, [t]);
    }

    function row(label, value) { return h("div", { className: "lab-row" }, [h("span", { text: label }), h("strong", { text: value })]); }

    function note(level, text) { return h("p", { className: "lab-note " + level, text: text }); }

    function hint(text) { return h("p", { className: "lab-hint", text: text }); }

    function canvasEl(label) { return h("canvas", { role: "img", "aria-label": label }); }

    // An animation with a line of text under it that explains whatever the pointer is over.
    function animBox(label, sticky) {

        const canvas = canvasEl(label);
        const info = h("p", { className: "cl-status", text: "" });
        const wrap = h("div", { className: "cl-canvas-wrap" }, [canvas]);
        const box = h("div", { className: "cl-anim" + (sticky ? " cl-sticky" : "") }, [wrap, info]);

        return { canvas: canvas, info: info, box: box, say: function (t) { info.textContent = t; } };
    }

    function nines(n) { return isFinite(n) ? Math.floor(n * 10) / 10 + "N" : "n/a"; }


    /* ------------------------------------------------
       FRAME: RAIL AND NAVIGATION
    ------------------------------------------------ */

    let root;
    let panel;
    let R = null;

    function run() { R = C.runAll(S.c); return R; }

    function go(id) {

        S.step = id;
        S.seen[id] = true;

        save();
        render();

        const top = document.getElementById("labTop");

        if (top) { top.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }

    function rail() {

        const nav = h("nav", { className: "lab-rail", "aria-label": "Foundry stations" });

        STEPS.forEach(function (s, k) {

            const done = !!S.seen[s.id];

            nav.appendChild(h("button", {
                type: "button", className: "lab-rail-btn" + (S.step === s.id ? " active" : "") + (done ? " done" : ""),
                "aria-current": S.step === s.id ? "step" : null,
                onclick: function () { go(s.id); }
            }, [
                h("span", { className: "lab-rail-num", text: done && S.step !== s.id ? "✓" : String(k + 1) }),
                h("span", { className: "lab-rail-name", text: s.name })
            ]));
        });

        return nav;
    }

    function navButtons(next, nextLabel) {

        const k = STEPS.findIndex(function (s) { return s.id === S.step; });
        const prev = k > 0 ? STEPS[k - 1].id : null;

        return h("div", { className: "lab-actions no-print" }, [
            prev ? h("button", { type: "button", className: "lab-btn ghost", text: "← Back", onclick: function () { go(prev); } }) : h("span"),
            next ? h("button", { type: "button", className: "start-button lab-btn", text: nextLabel || "Next station →", onclick: function () { go(next); } }) : null
        ]);
    }

    function heading(n, title, lead) {

        panel.appendChild(h("p", { className: "eyebrow", text: "STATION " + n + " OF 9" }));
        panel.appendChild(h("h1", { text: title }));

        if (lead) { panel.appendChild(h("p", { className: "lab-lead", text: lead })); }
    }

    function render() {

        A.stopAll();

        root.innerHTML = "";

        root.appendChild(h("div", { id: "labTop" }));
        root.appendChild(rail());

        panel = h("section", { className: "lab-panel lab-panel-" + S.step });

        root.appendChild(panel);

        run();

        const fn = { sand: stSand, furnace: stFurnace, purify: stPurify, crystal: stCrystal, wafers: stWafers, fab: stFab, chip: stChip, pack: stPack, results: stResults }[S.step];

        fn();
    }

    // A box that is rebuilt whenever a control changes, so the numbers stay live while a slider is dragged.
    function liveBox(builder) {

        const box = h("div", { className: "cl-live", "aria-live": "polite" });

        const redraw = function () {

            run();
            box.innerHTML = "";
            builder(box, R);
        };

        redraw();

        return { box: box, redraw: redraw };
    }

    function change(live, mut) {

        mut();
        save();
        live.redraw();
    }


    /* ------------------------------------------------
       STATION 1: SAND
    ------------------------------------------------ */

    function grade(s) {

        if (s.sio2 >= 0.995 && s.fe < 100) { return "Electronic-quartz grade"; }
        if (s.sio2 >= 0.985) { return "Glass-sand grade"; }
        if (s.sio2 >= 0.95) { return "Construction-sand grade"; }

        return "Dirty beach sand";
    }

    function stSand() {

        heading(1, "Pick up the sand", "Every chip starts as sand. But not all sand is the same, and the impurities in it follow the silicon all the way to the finished chip. Choose where to dig, pick out the bad grains with your tweezers, then clean the pile.");

        const live = liveBox(function (box, r) {

            const s = r.sand;

            box.appendChild(h("h2", { className: "lab-h2", text: "What is in your pile now" }));

            box.appendChild(table(["Measure", "Value"], [
                ["Silica (SiO₂) in the pile", (s.sio2 * 100).toFixed(2) + " %"],
                ["Grade", grade(s)],
                ["Iron (Fe)", sig(s.fe) + " ppm"],
                ["Aluminium (Al)", sig(s.al) + " ppm"],
                ["Titanium (Ti)", sig(s.ti) + " ppm"],
                ["Calcium (Ca)", sig(s.ca) + " ppm"],
                ["Boron (B)", sig(s.b) + " ppm"],
                ["Phosphorus (P)", sig(s.p) + " ppm"],
                ["Sand left to process", sig(s.kg) + " kg of " + sig(s.feedKg) + " kg"],
                ["Cost of the sand and cleaning", money(s.cost)]
            ]));

            box.appendChild(hint("ppm means parts per million. A chip can only stand a few parts per billion of most of these in the end, so what you remove now saves work later. Boron and phosphorus are the hardest to get rid of, because they change how silicon conducts."));

            const worst = s.sio2 < 0.95 ? "This pile is a long way from silicon-grade quartz. Expect trouble in the furnace and the purifier." : s.fe > 400 ? "Iron is the biggest problem here. Magnetic separation and acid leaching target it." : "A clean pile. The later stages will thank you.";

            box.appendChild(note(s.sio2 < 0.95 ? "warn" : "ok", worst));
        });

        const sites = Object.keys(C.SITES);

        panel.appendChild(h("h2", { className: "lab-h2", text: "Where do you dig?" }));

        panel.appendChild(cards({
            label: "Sand source",
            items: sites.map(function (id) { return { id: id, title: C.SITES[id].name, body: C.SITES[id].blurb, meta: "$" + C.SITES[id].cost + " per kg" }; }),
            value: S.c.sand.site,
            onChange: function (id) { S.c.sand.site = id; S.c.sand.removed = []; save(); render(); }
        }));

        panel.appendChild(slider({
            label: "How much sand to start with", min: 100, max: 10000, step: 100, value: S.c.sand.kg, unit: "kg",
            hint: "More sand makes more chips in the end, and costs more. One tonne is a small batch for a real plant.",
            onChange: function (v) { S.c.sand.kg = v; save(); live.redraw(); }
        }));

        panel.appendChild(h("h2", { className: "lab-h2", text: "Sort the pile by hand" }));
        panel.appendChild(hint("Tap a grain to pick it out with the tweezers. Clear, glassy grey-white grains are quartz: keep those. Orange, black, red, tan and pink-white grains are not: pick them out. Tap the wrong grain and you throw away good sand. Hover (or touch) a grain to see what it is."));

        const ab = animBox("A tray of sand grains. Tap a grain to remove it.", false);
        const wrap = ab.box;
        const info = h("span");
        const countPicksRef = { fn: null };

        ab.say("Hover over a grain to see what it is.");

        const tray = A.sandTray(ab.canvas, {
            grains: function () { return R.grains; },
            removed: function () { return S.c.sand.removed; },
            treat: function () { return S.c.sand.treat; },
            onInfo: function (t) { ab.say(t); },
            onPick: function (id) {

                S.c.sand.removed.push(id);
                save();
                run();
                live.redraw();
                countPicksRef.fn();

                award("FirstPick", 10, "picked your first grain");
            }
        });

        panel.appendChild(wrap);

        const counts = h("p", { className: "lab-hint" });

        const countPicks = function () {

            let bad = 0;
            let good = 0;

            S.c.sand.removed.forEach(function (id) { if (R.grains[id]) { if (R.grains[id].type === "quartz") { good += 1; } else { bad += 1; } } });

            counts.textContent = "Picked out: " + bad + " impure grain" + (bad === 1 ? "" : "s") + ", and " + good + " good quartz grain" + (good === 1 ? "" : "s") + " by mistake.";
        };

        countPicksRef.fn = countPicks;
        countPicks();
        panel.appendChild(counts);

        const legend = h("div", { className: "cl-legend" });

        Object.keys(C.GRAINS).forEach(function (t) {

            if (!C.SITES[S.c.sand.site].mix[t]) { return; }

            legend.appendChild(h("span", { className: "cl-legend-item" }, [h("span", { className: "cl-dot", style: "background:" + C.GRAINS[t].color + ";border-color:" + C.GRAINS[t].edge }), C.GRAINS[t].name]));
        });

        panel.appendChild(legend);

        const tools = h("div", { className: "lab-action-group cl-tools" });

        const typeSel = h("select", { className: "lab-select", "aria-label": "Type of grain to pick out" },
            Object.keys(C.SITES[S.c.sand.site].mix).filter(function (t) { return t !== "quartz"; }).map(function (t) { return h("option", { value: t, text: C.GRAINS[t].name }); }));

        tools.appendChild(typeSel);

        tools.appendChild(h("button", {
            type: "button", className: "lab-btn small", text: "Pick out most of this type",
            onclick: function () {

                const t = typeSel.value;
                const r = C.rng(S.c.seed + S.c.sand.removed.length * 13 + 7);

                R.grains.forEach(function (g) { if (g.type === t && S.c.sand.removed.indexOf(g.id) < 0 && r() < 0.85) { S.c.sand.removed.push(g.id); } });

                save();
                run();
                tray.notify();
                live.redraw();
                countPicks();

                award("FirstPick", 10, "picked your first grain");
            }
        }));

        tools.appendChild(h("button", {
            type: "button", className: "lab-btn small ghost", text: "Undo last pick",
            onclick: function () { S.c.sand.removed.pop(); save(); run(); tray.notify(); live.redraw(); countPicks(); }
        }));

        tools.appendChild(h("button", {
            type: "button", className: "lab-btn small ghost", text: "Reset the pile",
            onclick: function () { S.c.sand.removed = []; save(); run(); tray.notify(); live.redraw(); countPicks(); }
        }));

        panel.appendChild(tools);

        panel.appendChild(h("h2", { className: "lab-h2", text: "Then clean the whole pile" }));
        panel.appendChild(hint("Real plants can't pick grains by hand. They use machines that treat tonnes at a time. Each one removes certain kinds of grain, loses a little good sand and costs money."));

        const tlist = h("div", { className: "lab-picks cl-picks" });

        Object.keys(C.TREATMENTS).forEach(function (id) {

            tlist.appendChild(check(C.TREATMENTS[id].name, C.TREATMENTS[id].blurb, S.c.sand.treat[id], function (on) { S.c.sand.treat[id] = on ? 1 : 0; save(); live.redraw(); tray.notify(); }));
        });

        panel.appendChild(tlist);
        panel.appendChild(live.box);

        panel.appendChild(navButtons("furnace", "Take it to the furnace →"));

        S.seen.sand = true;
    }


    /* ------------------------------------------------
       STATION 2: ARC FURNACE
    ------------------------------------------------ */

    function barRow(label, value, max, text) {

        return h("div", { className: "cl-bar" }, [
            h("span", { className: "cl-bar-label", text: label }),
            h("span", { className: "cl-bar-track" }, [h("span", { className: "cl-bar-fill", style: "width:" + Math.max(1, Math.min(100, value / max * 100)) + "%" })]),
            h("span", { className: "cl-bar-text", text: text })
        ]);
    }

    function stFurnace() {

        heading(2, "The arc furnace", "Sand is silicon dioxide: silicon already bonded to oxygen. To get the silicon out, you heat the sand with carbon to about 2,000 °C in an electric arc furnace. The carbon grabs the oxygen and leaves as carbon monoxide gas. The result is metallurgical-grade silicon, about 98 to 99% pure.");

        panel.appendChild(h("p", { className: "cl-equation", html: "SiO<sub>2</sub> + 2 C &rarr; Si + 2 CO" }));

        const fab0 = animBox("A cutaway of the electric arc furnace", true);

        panel.appendChild(fab0.box);

        fab0.say("Hover over the furnace to see what each part does. Change the temperature and the carbon below and watch the furnace respond.");

        const fur = A.furnace(fab0.canvas, function () { return { R: R, c: S.c }; }, function (t) { fab0.say(t); });

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [h("span"), h("button", { type: "button", className: "lab-btn", text: "Tap the furnace into the ladle", onclick: function () { fur.tap(); } })]));

        const live = liveBox(function (box, r) {

            const m = r.mg;

            box.appendChild(h("h2", { className: "lab-h2", text: "What came out" }));

            box.appendChild(barRow("Sand in", m.kgSand, m.kgSand, sig(m.kgSand) + " kg"));
            box.appendChild(barRow("Silica in it", m.kgSilica, m.kgSand, sig(m.kgSilica) + " kg"));
            box.appendChild(barRow("Carbon added", m.kgC, m.kgSand, sig(m.kgC) + " kg"));
            box.appendChild(barRow("Silicon made", m.kgSi, m.kgSand, sig(m.kgSi) + " kg"));

            box.appendChild(table(["Measure", "Value"], [
                ["Share of the silicon in the silica that you recovered", Math.round(m.rho * 100) + " %"],
                ["Purity of the silicon", m.purity.toFixed(2) + " %"],
                ["Iron / aluminium / titanium", sig(m.ppm.fe) + " / " + sig(m.ppm.al) + " / " + sig(m.ppm.ti) + " ppm"],
                ["Boron / phosphorus", sig(m.ppm.b) + " / " + sig(m.ppm.p) + " ppm"],
                ["Electricity", sig(m.kwhPerKg) + " kWh per kg, " + sig(m.kwh) + " kWh in all"],
                ["Carbon dioxide released", sig(m.co2) + " kg"],
                ["Cost so far", money(m.cost)]
            ]));

            const c = S.c.furnace;

            if (c.temp < 1850) { box.appendChild(note("warn", "Too cold: the reaction hardly runs below about 1,850 °C, so most of the sand stays unreacted.")); }
            if (c.temp > 2100) { box.appendChild(note("warn", "Very hot: silicon monoxide gas escapes up the stack and you lose silicon, and the electricity bill climbs.")); }
            if (c.carbonPer100 < 35) { box.appendChild(note("warn", "Not enough carbon: some of the silica is left unreduced. The chemistry needs about 40 kg of carbon per 100 kg of silica.")); }
            if (c.carbonPer100 > 52) { box.appendChild(note("warn", "Too much carbon: it forms silicon carbide, a hard crust that clogs the furnace and wastes silicon.")); }

            box.appendChild(hint("The silicon here is good enough for aluminium alloys and silicones, but a chip needs about a million times cleaner. The next station does that."));
        });

        panel.appendChild(h("h2", { className: "lab-h2", text: "What carbon do you burn it with?" }));

        panel.appendChild(cards({
            label: "Carbon source",
            items: Object.keys(C.CARBON).map(function (id) { return { id: id, title: C.CARBON[id].name, body: C.CARBON[id].blurb, meta: "$" + C.CARBON[id].cost + " per kg" }; }),
            value: S.c.furnace.carbon,
            onChange: function (id) { change(live, function () { S.c.furnace.carbon = id; }); }
        }));

        panel.appendChild(slider({
            label: "Carbon per 100 kg of silica", min: 25, max: 60, step: 1, value: S.c.furnace.carbonPer100, unit: "kg",
            hint: "A recipe is a balance. A little extra carbon covers what burns off in the arc.",
            onChange: function (v) { change(live, function () { S.c.furnace.carbonPer100 = v; }); }
        }));

        panel.appendChild(slider({
            label: "Furnace temperature", min: 1700, max: 2300, step: 10, value: S.c.furnace.temp, unit: "°C",
            hint: "Hotter reacts faster, but not forever.",
            onChange: function (v) { change(live, function () { S.c.furnace.temp = v; }); }
        }));

        panel.appendChild(live.box);
        panel.appendChild(navButtons("purify", "Purify the silicon →"));

        award("FirstFurnace", 10, "fired up the furnace");
    }


    /* ------------------------------------------------
       STATION 3: PURIFICATION
    ------------------------------------------------ */

    function stPurify() {

        heading(3, "Purify it a million times over", "Chip silicon has to be 99.9999999% pure: nine nines. To get there, the silicon is turned into a gas, trichlorosilane, which is distilled over and over, then turned back into solid silicon on hot rods. This is called the Siemens process.");

        const pu = animBox("A distillation column feeding a Siemens reactor", true);

        panel.appendChild(pu.box);

        pu.say("Hover over the column to see how clean the gas is after each stage. Orange dots are metals, purple dots are boron and phosphorus.");

        A.purify(pu.canvas, function () { return { R: R, c: S.c }; }, function (t) { pu.say(t); });

        const live = liveBox(function (box, r) {

            const p = r.poly;
            const m = r.mg;

            box.appendChild(h("h2", { className: "lab-h2", text: "The polysilicon you made" }));

            box.appendChild(table(["Impurity", "Before (ppm)", "After (parts per billion)"], [
                ["Iron", sig(m.ppm.fe), sig(p.ppb.fe)],
                ["Aluminium", sig(m.ppm.al), sig(p.ppb.al)],
                ["Titanium", sig(m.ppm.ti), sig(p.ppb.ti)],
                ["Calcium", sig(m.ppm.ca), sig(p.ppb.ca)],
                ["Boron", sig(m.ppm.b), sig(p.ppb.b)],
                ["Phosphorus", sig(m.ppm.p), sig(p.ppb.p)]
            ]));

            box.appendChild(table(["Measure", "Value"], [
                ["Purity", nines(p.nines) + " (" + p.nines.toFixed(1) + " nines)"],
                ["Polysilicon made", sig(p.kgPoly) + " kg"],
                ["Rod surface quality", Math.round(p.q * 100) + " %"],
                ["Time in the reactor", sig(p.hours) + " hours"],
                ["Electricity", sig(p.kwhPerKg) + " kWh per kg, " + sig(p.kwh) + " kWh in all"],
                ["Cost so far", money(p.cost)]
            ]));

            if (p.nines < 8) { box.appendChild(note("warn", "Only " + p.nines.toFixed(1) + " nines. Metal left in the silicon becomes tiny electrical short circuits in every transistor, and boron and phosphorus decide the resistivity. You will see the damage at the crystal and in the yield.")); }
            else { box.appendChild(note("ok", "Electronic grade: nine or more nines. Good enough to grow chip crystals.")); }

            if (p.q < 0.7) { box.appendChild(note("warn", "The rods grew rough, lumpy deposits ('popcorn'): they trap metal and cost you at the crystal puller. Slow down or stay near 1,080 °C.")); }

            box.appendChild(hint("Each distillation stage knocks the metals down by a large factor, but boron and phosphorus are chemically close to silicon, so each stage removes far less of them. A dirty feed also overloads the columns."));
        });

        panel.appendChild(slider({
            label: "Distillation stages", min: 1, max: 10, step: 1, value: S.c.poly.stages, unit: "",
            hint: "More stages mean cleaner gas, but each one costs energy.",
            onChange: function (v) { change(live, function () { S.c.poly.stages = v; }); }
        }));

        panel.appendChild(slider({
            label: "Rod temperature", min: 950, max: 1200, step: 5, value: S.c.poly.rodT, unit: "°C",
            hint: "Around 1,080 °C the silicon deposits as a smooth, dense layer. Hotter, it forms dust in the gas.",
            onChange: function (v) { change(live, function () { S.c.poly.rodT = v; }); }
        }));

        panel.appendChild(slider({
            label: "Deposition speed", min: 0.2, max: 2, step: 0.05, value: S.c.poly.rate, unit: "mm/hour",
            format: function (v) { return v.toFixed(2); },
            hint: "Faster saves time and electricity, but rough growth and trapped dirt follow.",
            onChange: function (v) { change(live, function () { S.c.poly.rate = v; }); }
        }));

        panel.appendChild(live.box);
        panel.appendChild(navButtons("crystal", "Grow a crystal →"));

        award("FirstPoly", 10, "made polysilicon");
    }


    /* ------------------------------------------------
       STATION 4: CRYSTAL GROWTH
    ------------------------------------------------ */

    function stCrystal() {

        heading(4, "Grow a single crystal", "Polysilicon is a mess of tiny crystal grains. A chip needs one perfect crystal. In the Czochralski process, polysilicon is melted in a quartz crucible at 1,420 °C and a small seed crystal is dipped in and slowly pulled up, drawing a single crystal behind it. Pull too fast and it fails. Pull slowly and it takes days.");

        const cb = animBox("A crystal puller. Steer the pull speed while the crystal grows.", true);
        const pullResult = h("p", { className: "lab-hint", text: "" });

        const puller = A.crystal(cb.canvas, function () { return { R: R, c: S.c }; }, function (t) { cb.say(t); }, function (res) {

            const pc = Math.round(res.perfect * 100);

            pullResult.textContent = res.lost ?
                "You lost the single crystal after " + res.lostAt.toFixed(0) + " cm. The part before that is good (" + pc + " % of what grew was defect-free). In practice you would cut off the bad end and re-melt." :
                "A complete crystal, " + res.len.toFixed(0) + " cm long: " + pc + " % defect-free, " + Math.round(res.defect * 100) + " % with point defects.";

            award("FirstIngot", 15, "pulled your first crystal");
        });

        const live = liveBox(function (box, r) {

            const c = r.cr;

            box.appendChild(h("h2", { className: "lab-h2", text: "Your crystal" }));

            box.appendChild(table(["Measure", "Value"], [
                ["Pull speed against the critical speed for this furnace", c.x.toFixed(2) + " ×  (critical " + c.vcrit.toFixed(2) + " mm/min)"],
                ["Point defects in the crystal", c.regime === "perfect" ? "none to speak of (a perfect crystal)" : c.regime === "vacancy" ? "vacancy voids (too fast)" : "interstitial loops (too slow)"],
                ["Killer defect density from the crystal", sig(c.dCr) + " per cm²"],
                ["Oxygen from the crucible", c.oxygen.toFixed(1) + " ppma" + (c.oxygen < 12 ? " (low: weak at trapping metals)" : c.oxygen > 17 ? " (high: makes precipitates)" : " (good)")],
                ["Crystal kept after dislocation losses", Math.round(c.fy * 100) + " %"],
                ["Dopant", (c.type === "p" ? "Boron (p-type)" : "Phosphorus (n-type)") + ", about " + sig(c.nTarget) + " atoms per cm³"],
                ["Resistivity", sig(c.rho) + " Ω·cm"],
                ["Stays within ±20% of the target over", Math.round(c.usable * 100) + " % of the crystal"],
                ["Usable crystal", sig(c.kgUsable) + " kg of " + sig(c.kgIn) + " kg of polysilicon"],
                ["Time in the puller", sig(c.hours) + " hours (" + c.runs + " run" + (c.runs > 1 ? "s" : "") + ")"],
                ["Cost so far", money(c.cost)]
            ]));

            if (!c.bgOk) { box.appendChild(note("warn", "The leftover boron and phosphorus in the polysilicon are too close to the dopant level you want (" + Math.round(c.bgError * 100) + " %), so the resistivity cannot be controlled. Go back and purify more, or choose a lower resistivity.")); }
            if (c.regime !== "perfect") { box.appendChild(note("warn", c.regime === "vacancy" ? "Pulling faster than the temperature gradient allows leaves clusters of missing atoms. They become tiny pits in the wafer surface that kill transistors." : "Pulling slower than the critical speed leaves clusters of extra atoms (dislocation loops).")); }
            if (c.fy < 0.8) { box.appendChild(note("warn", "At this speed for this diameter the crystal often loses its single-crystal structure (a dislocation travels up it) and you must cut off and re-melt.")); }
            if (c.type === "n") { box.appendChild(hint("Phosphorus is picked up by the crystal less readily than boron, so its concentration drifts more as the melt empties. Less of the ingot ends up in the resistivity window.")); }

        });

        panel.appendChild(h("h2", { className: "lab-h2", text: "Steer the crystal yourself" }));
        panel.appendChild(hint("Press Start, then drag the Pull speed slider below while the crystal grows. Keep the line inside the green window. Too fast and you get voids, too slow and you get loops, and far too fast the crystal loses its single-crystal structure."));
        panel.appendChild(cb.box);
        cb.say("Hover over the puller to see what each part does.");

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [
            h("button", { type: "button", className: "lab-btn ghost", text: "Reset", onclick: function () { puller.reset(); pullResult.textContent = ""; } }),
            h("button", { type: "button", className: "start-button lab-btn", text: "Start pulling", onclick: function () { pullResult.textContent = ""; puller.start(); } })
        ]));
        panel.appendChild(pullResult);

        panel.appendChild(h("h2", { className: "lab-h2", text: "Choose the wafer size" }));

        panel.appendChild(cards({
            label: "Crystal diameter",
            items: Object.keys(C.SIZES).map(function (k) {

                const sz = C.SIZES[k];

                return { id: k, title: sz.name, body: "Holds up to " + sz.charge + " kg of silicon per run. Can make chips down to about " + C.NODES[sz.node].name + ".", meta: "pull no faster than " + sz.vmax + " mm/min" };
            }),
            value: String(S.c.crystal.size),
            onChange: function (id) { change(live, function () { S.c.crystal.size = Number(id); S.c.wafer.thick = C.SIZES[id].thick; }); curve(); }
        }));

        panel.appendChild(cards({
            label: "Furnace hot zone",
            items: Object.keys(C.HOTZONES).map(function (k) { return { id: k, title: C.HOTZONES[k].name, body: C.HOTZONES[k].blurb }; }),
            value: S.c.crystal.hotzone,
            onChange: function (id) { change(live, function () { S.c.crystal.hotzone = id; }); curve(); }
        }));

        panel.appendChild(slider({
            label: "Pull speed", min: 0.1, max: 1.6, step: 0.02, value: S.c.crystal.pull, unit: "mm/min", format: function (v) { return v.toFixed(2); },
            hint: "The sweet spot is where the pull speed divided by the temperature gradient hits a critical value. Too far either side and defects appear.",
            onChange: function (v) { change(live, function () { S.c.crystal.pull = v; }); curve(); }
        }));

        panel.appendChild(slider({
            label: "Crucible rotation", min: 0, max: 16, step: 1, value: S.c.crystal.crucibleRot, unit: "rpm",
            hint: "A spinning crucible stirs more oxygen from the quartz into the melt. A little oxygen is good: it traps metals. A lot makes precipitates.",
            onChange: function (v) { change(live, function () { S.c.crystal.crucibleRot = v; }); }
        }));

        panel.appendChild(selectChoice("Dopant", [{ value: "p", label: "Boron (p-type)" }, { value: "n", label: "Phosphorus (n-type)" }], S.c.crystal.dopant,
            function (v) { change(live, function () { S.c.crystal.dopant = v; }); }, "A little boron or phosphorus is added to the melt to set how well the silicon conducts."));

        panel.appendChild(logSlider({
            label: "Target resistivity", min: 0.01, max: 100, value: S.c.crystal.rho, unit: "Ω·cm", format: function (v) { return sig(v); },
            hint: "Lower resistivity means more dopant. Very high resistivity needs very pure polysilicon.",
            onChange: function (v) { change(live, function () { S.c.crystal.rho = v; }); }
        }));

        panel.appendChild(live.box);

        panel.appendChild(h("h2", { className: "lab-h2", text: "Defects against pull speed" }));

        const cv = canvasEl("Chart of crystal defect density against pull speed");

        panel.appendChild(cv);

        function curve() {

            run();

            const xs = [];
            const ys = [];

            for (let v = 0.1; v <= 1.6; v += 0.02) {

                xs.push(v);
                ys.push(C.grow(R.poly, Object.assign({}, S.c.crystal, { pull: v })).dCr);
            }

            D.line(cv, {
                theme: "dark", xLabel: "Pull speed (mm/min)", yLabel: "Killer defects per cm²", yLog: true, title: "The defect-free window (this furnace)",
                series: [
                    { label: "Defect density", color: D.color(0, "dark"), width: 2.2, x: xs, y: ys },
                    { label: "Your pull speed", color: "#e0a070", width: 0, dotsOnly: true, x: [S.c.crystal.pull], y: [R.cr.dCr] }
                ]
            });
        }

        curve();

        panel.appendChild(hint("The valley is the defect-free window. A hotter gradient (the advanced hot zone) moves it to higher speeds, so you can pull faster and make more crystal per day."));

        panel.appendChild(navButtons("wafers", "Slice it into wafers →"));
    }


    /* ------------------------------------------------
       STATION 5: WAFERS
    ------------------------------------------------ */

    function stWafers() {

        heading(5, "Slice, grind and polish", "The ingot is sawed into discs with a wire that carries abrasive. The saw wire eats a slot (the kerf), so some silicon becomes dust. The wafers are then ground, etched and polished until they are flatter than anything else humans make.");

        const sz = C.SIZES[S.c.crystal.size];

        const wb = animBox("A wire saw cutting an ingot, then a wafer being polished", true);

        panel.appendChild(wb.box);

        wb.say("Hover to see where the crystal goes. Change the wire, thickness or polish below and watch the slices and the surface respond.");

        A.wafering(wb.canvas, function () { return { R: R, c: S.c }; }, function (t) { wb.say(t); });

        const live = liveBox(function (box, r) {

            const w = r.wf;

            box.appendChild(h("h2", { className: "lab-h2", text: "Your wafers" }));

            const pitch = w.pitch;

            box.appendChild(h("div", { className: "cl-stack", role: "img", "aria-label": "How each slice of crystal is used" }, [
                h("span", { className: "cl-seg wafer", style: "flex:" + w.t, title: "wafer" }, [h("em", { text: "wafer" })]),
                h("span", { className: "cl-seg polish", style: "flex:" + (w.polish + 40), title: "ground and polished away" }, [h("em", { text: "ground away" })]),
                h("span", { className: "cl-seg kerf", style: "flex:" + w.wire.kerf, title: "sawdust" }, [h("em", { text: "kerf" })])
            ]));

            box.appendChild(hint("Of every " + sig(pitch) + " µm of crystal, " + Math.round(w.t / pitch * 100) + "% ends up as wafer and " + Math.round(w.kerfLoss * 100) + "% is sawdust."));

            box.appendChild(table(["Measure", "Value"], [
                ["Wafers sliced / wafers that survive", sig(w.sliced) + " / " + sig(w.wafers)],
                ["Broken in sawing and handling", (w.brk * 100).toFixed(1) + " %"],
                ["Flatness after polishing", sig(w.flat) + " nm"],
                ["Cost of a finished wafer, sand to polish", money(w.costPerWafer)],
                ["Cost so far", money(w.cost)]
            ]));

            if (w.wafers === 0) { box.appendChild(note("warn", "No wafers: the crystal could not be used. Go back and look at the notes at the crystal and purification stations.")); }
            if (w.t < 0.85 * sz.thick) { box.appendChild(note("warn", "A thin wafer breaks easily. Handling robots and the heat of the fab will crack a lot of them.")); }

            box.appendChild(hint("Flatness matters later: the lithography tool can only focus on a very thin slice of height. The finer the pattern, the flatter the wafer must be."));
        });

        panel.appendChild(cards({
            label: "Saw wire",
            items: Object.keys(C.WIRES).map(function (k) { return { id: k, title: C.WIRES[k].name, body: "Cuts a " + C.WIRES[k].kerf + " µm slot. " + (C.WIRES[k].wire < 140 ? "Wastes less crystal but breaks more." : C.WIRES[k].wire > 140 ? "Tougher but wastes more crystal." : "A balanced choice.") }; }),
            value: String(S.c.wafer.wire),
            onChange: function (id) { change(live, function () { S.c.wafer.wire = Number(id); }); }
        }));

        panel.appendChild(slider({
            label: "Wafer thickness", min: Math.round(sz.thick * 0.6), max: Math.round(sz.thick * 1.2), step: 5, value: Math.max(Math.round(sz.thick * 0.6), Math.min(Math.round(sz.thick * 1.2), S.c.wafer.thick)), unit: "µm",
            hint: "The standard for " + sz.d + " mm wafers is " + sz.thick + " µm. Thinner saves crystal but breaks more.",
            onChange: function (v) { change(live, function () { S.c.wafer.thick = v; }); }
        }));

        panel.appendChild(slider({
            label: "Material polished away", min: 10, max: 80, step: 1, value: S.c.wafer.polish, unit: "µm",
            hint: "More polishing makes a flatter, cleaner surface. It also uses up crystal.",
            onChange: function (v) { change(live, function () { S.c.wafer.polish = v; }); }
        }));

        panel.appendChild(live.box);
        panel.appendChild(navButtons("fab", "Into the fab →"));

        award("FirstWafer", 15, "cut your first wafers");
    }


    /* ------------------------------------------------
       STATION 6: THE FAB
    ------------------------------------------------ */

    function group(title, open, children) {

        const det = h("details", { className: "lab-layer-card", open: open ? true : null });

        det.appendChild(h("summary", {}, [h("strong", { text: title })]));
        det.appendChild(h("div", { className: "lab-layer-body" }, children));

        return det;
    }

    function stFab() {

        heading(6, "Build the transistors", "Now the wafer goes into the fab. Hundreds of steps build billions of transistors, but a few decide most of a transistor's behaviour: how thick the gate oxide is, how deep the source and drain go, and how much dopant sets the switching voltage. Choose a node, then tune the process so that each number lands on the node's target.");

        const live = liveBox(function (box, r) {

            const f = r.fab;
            const n = f.node;
            const o = S.c.fab;

            const mark = function (ok) { return ok ? "✓ on target" : "✗ off target"; };

            box.appendChild(h("h2", { className: "lab-h2", text: "Your transistor" }));

            box.appendChild(table(["What", "Yours", "The " + n.name + " node wants", ""], [
                ["Gate oxide (equivalent thickness)", f.eot.toFixed(2) + " nm", "about " + n.eot + " nm", mark(Math.abs(f.eot / n.eot - 1) <= 0.25)],
                ["Threshold voltage", f.vt.toFixed(2) + " V", n.vt + " V ± 0.1", mark(Math.abs(f.vt - n.vt) <= 0.1)],
                ["Junction depth", f.xj.toFixed(0) + " nm", "under " + Math.round(0.6 * n.lg) + " nm", mark(f.xj <= 0.6 * n.lg)],
                ["Sheet resistance of source and drain", sig(f.rsh) + " Ω per square", "as low as you can get", ""],
                ["Drive current", sig(f.ion) + " µA per µm", "higher is faster", ""],
                ["Leakage when off", sig(f.ioff) + " nA per µm", "lower is cooler", ""],
                ["Swing", sig(f.ss) + " mV per decade", "60 is the ideal limit", ""],
                ["Delay of one logic gate", sig(f.tauGate * 1e12) + " ps", "", ""]
            ]));

            const reasons = r.bins.reasons;

            reasons.forEach(function (t) { box.appendChild(note("warn", t)); });

            if (!r.chip.sizeOk) { box.appendChild(note("warn", "The " + r.cr.size.d + " mm wafers you grew can't be run through " + n.name + " tools. That node needs " + n.minSize + " mm wafers or bigger. Go back to the crystal station.")); }
            if (!r.chip.toolOk) { box.appendChild(note("warn", "That exposure tool cannot print " + n.name + " features. Pick one marked ✓ below.")); }
            if (o.dielectric === "sio2" && f.jg > 1) { box.appendChild(note("warn", "Electrons tunnel straight through a gate oxide this thin: gate leakage is " + sig(f.jg) + " A per cm². Thin oxides need a high-k material like hafnium oxide.")); }

            if (!reasons.length && r.chip.sizeOk && r.chip.toolOk) { box.appendChild(note("ok", "Everything lands near the node's targets. Transistors like this should work.")); }
        });

        const tb = animBox("A transistor being built layer by layer, drawn to scale", true);
        const stepLine = h("p", { className: "lab-hint cl-stepline", text: "" });

        const tr = A.transistor(tb.canvas, function () { return { R: R, c: S.c }; }, function (t) { tb.say(t); }, function (k, label, finished) {

            stepLine.textContent = "Step " + (k + 1) + " of " + A.STEPS.length + ": " + label;

            if (finished) { award("FirstBuild", 15, "watched a transistor being built"); }
        });

        const playBtn = h("button", { type: "button", className: "lab-btn", text: "Play", onclick: function () { if (tr.playing()) { tr.pause(); playBtn.textContent = "Play"; } else { tr.play(); playBtn.textContent = "Pause"; } } });

        panel.appendChild(h("h2", { className: "lab-h2", text: "Watch the transistor being built" }));
        panel.appendChild(tb.box);

        tb.say("Step through the process, or press Play. The sizes are drawn to scale for your node. Change the settings below to see the oxide and junction change.");

        panel.appendChild(h("div", { className: "lab-actions no-print cl-controls" }, [
            h("button", { type: "button", className: "lab-btn ghost", text: "← Previous step", onclick: function () { tr.pause(); playBtn.textContent = "Play"; tr.prev(); } }),
            playBtn,
            h("button", { type: "button", className: "lab-btn ghost", text: "Next step →", onclick: function () { tr.pause(); playBtn.textContent = "Play"; tr.next(); } })
        ]));
        panel.appendChild(stepLine);

        panel.appendChild(h("h2", { className: "lab-h2", text: "Choose a technology node" }));

        panel.appendChild(cards({
            label: "Technology node",
            items: Object.keys(C.NODES).sort(function (x, y) { return Number(y) - Number(x); }).map(function (k) {

                const n = C.NODES[k];

                return { id: k, title: n.name, body: "Gate length about " + n.lg + " nm, " + n.vdd + " V supply. Packs " + n.dens + " million transistors per mm².", meta: "about " + money(n.cost) + " per 300 mm wafer, wafers of " + n.minSize + " mm or bigger" };
            }),
            value: String(S.c.fab.node),
            onChange: function (id) { change(live, function () { S.c.fab.node = Number(id); const t = Object.keys(C.TOOLS).filter(function (k) { return C.TOOLS[k].nodes.indexOf(Number(id)) >= 0; }); if (t.indexOf(S.c.fab.tool) < 0) { S.c.fab.tool = t[0]; } }); render(); }
        }));

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [
            h("span"),
            h("button", {
                type: "button", className: "lab-btn", text: "Use the recommended recipe for this node",
                onclick: function () {

                    const rec = C.recommendFab(S.c.fab.node, S.c.fab);

                    S.c.fab = C.sanitize({ fab: rec }).fab;
                    save();
                    toast("Recipe set. See how each number lands.");
                    render();
                }
            })
        ]));

        const o = S.c.fab;

        const lb = animBox("The pattern of light that a lithography tool prints on the wafer", false);

        lb.say("Change the exposure tool below to see how sharply it can print this node's lines.");

        A.litho(lb.canvas, function () { return { R: R, c: S.c }; }, function (t) { lb.say(t); });

        panel.appendChild(group("Lithography: how fine can you print?", true, [
            lb.box,
            selectChoice("Exposure tool", Object.keys(C.TOOLS).map(function (k) { return { value: k, label: C.TOOLS[k].name + (C.TOOLS[k].nodes.indexOf(o.node) >= 0 ? "  ✓ can print this node" : "  ✗ cannot print this node") }; }), o.tool,
                function (v) { change(live, function () { S.c.fab.tool = v; }); },
                "Smaller features need shorter-wavelength light and bigger lenses. Each step up costs much more per layer."),
            hint("Resolution is roughly a constant times the wavelength divided by the numerical aperture of the lens. 365 nm, 248 nm, 193 nm and finally 13.5 nm extreme ultraviolet.")
        ]));

        const gate = [];

        gate.push(selectChoice("Gate dielectric", [{ value: "sio2", label: "Silicon dioxide, grown from the silicon (thermal oxide)" }, { value: "hfo2", label: "Hafnium oxide (high-k), deposited by atomic layers" }], o.dielectric,
            function (v) { change(live, function () { S.c.fab.dielectric = v; }); render(); },
            "Below about 2 nm of oxide, electrons tunnel through and the gate leaks. A high-k material is physically thicker for the same electrical thickness, so it leaks much less."));

        if (o.dielectric === "sio2") {

            gate.push(slider({ label: "Oxidation temperature", min: 700, max: 1100, step: 10, value: o.oxT, unit: "°C", hint: "Dry oxygen at high temperature grows oxide by consuming the silicon surface.", onChange: function (v) { change(live, function () { S.c.fab.oxT = v; }); curves(); } }));
            gate.push(logSlider({ label: "Oxidation time", min: 1, max: 600, value: o.oxMin, unit: "min", format: function (v) { return sig(v, 0); }, onChange: function (v) { change(live, function () { S.c.fab.oxMin = Math.round(v); }); curves(); } }));

        } else {

            gate.push(slider({ label: "Hafnium oxide thickness", min: 1, max: 6, step: 0.1, value: o.hfNm, unit: "nm", format: function (v) { return v.toFixed(1); }, hint: "Plus a thin 0.5 nm oxide underneath. Its electrical thickness is about a sixth of the physical one.", onChange: function (v) { change(live, function () { S.c.fab.hfNm = v; }); } }));
        }

        gate.push(logSlider({ label: "Channel implant dose (sets the threshold voltage)", min: 1e11, max: 1e14, value: o.chDose, unit: "per cm²", format: function (v) { return v.toExponential(1); }, hint: "More dopant in the channel raises the voltage needed to turn the transistor on. The right dose depends on the oxide.", onChange: function (v) { change(live, function () { S.c.fab.chDose = v; }); } }));

        panel.appendChild(group("Gate stack and threshold voltage", true, gate));

        panel.appendChild(group("Source and drain: implant and anneal", true, [
            logSlider({ label: "Implant dose (arsenic)", min: 1e14, max: 1e16, value: o.implDose, unit: "per cm²", format: function (v) { return v.toExponential(1); }, hint: "How many dopant atoms are fired into the silicon.", onChange: function (v) { change(live, function () { S.c.fab.implDose = v; }); curves(); } }),
            slider({ label: "Implant energy", min: 1, max: 100, step: 1, value: o.implE, unit: "keV", hint: "Higher energy drives the atoms deeper.", onChange: function (v) { change(live, function () { S.c.fab.implE = v; }); curves(); } }),
            slider({ label: "Anneal temperature", min: 800, max: 1100, step: 10, value: o.annT, unit: "°C", hint: "Heating repairs the damage and puts dopant atoms on active sites, but it also lets them spread deeper.", onChange: function (v) { change(live, function () { S.c.fab.annT = v; }); curves(); } }),
            logSlider({ label: "Anneal time", min: 0.1, max: 3600, value: o.annSec, unit: "s", format: function (v) { return sig(v); }, hint: "Short and hot activates the dopant without letting it spread. That is why modern fabs use flash and laser anneals.", onChange: function (v) { change(live, function () { S.c.fab.annSec = v; }); curves(); } })
        ]));

        panel.appendChild(group("Wiring and cleanliness", false, [
            slider({ label: "Layers of metal wiring", min: 2, max: 12, step: 1, value: o.metals, unit: "", hint: "Bigger chips need more layers to connect everything. You will see how many your product needs in the next station.", onChange: function (v) { change(live, function () { S.c.fab.metals = v; }); } }),
            selectChoice("Wire metal", [{ value: "cu", label: "Copper (damascene)" }, { value: "al", label: "Aluminium" }], o.metal, function (v) { change(live, function () { S.c.fab.metal = v; }); }, "Copper has lower resistance, which matters for fine wires. Aluminium is cheaper to process."),
            selectChoice("Insulator between wires", Object.keys(C.ILD).map(function (k) { return { value: k, label: C.ILD[k].name }; }), o.ild, function (v) { change(live, function () { S.c.fab.ild = v; }); }, "Lower dielectric constant means less capacitance between wires, so a faster, cooler chip. These insulators cost more."),
            selectChoice("Cleanroom", Object.keys(C.CLEANROOMS).map(function (k) { return { value: k, label: C.CLEANROOMS[k].name + " (cost x" + C.CLEANROOMS[k].mult + ")" }; }), o.clean, function (v) { change(live, function () { S.c.fab.clean = v; }); }, "A particle on the wafer kills the transistor under it. Cleaner air costs a lot but kills fewer chips, and smaller transistors need cleaner rooms.")
        ]));

        panel.appendChild(live.box);

        const cv1 = canvasEl("Oxide thickness against time");
        const cv2 = canvasEl("Dopant concentration against depth");

        panel.appendChild(h("div", { className: "lab-charts" }, [cv1, cv2]));

        function curves() {

            run();

            const o2 = S.c.fab;
            const ts = [];

            for (let k = 0; k <= 40; k++) { ts.push(Math.pow(10, Math.log10(1) + Math.log10(600) * k / 40)); }

            const series = [100, 0, -100].map(function (dT, k) {

                const T = Math.max(700, Math.min(1100, o2.oxT + dT));

                return { label: T + " °C" + (dT === 0 ? " (yours)" : ""), color: D.color(k, "dark"), width: dT === 0 ? 2.4 : 1.2, alpha: dT === 0 ? 1 : 0.7, x: ts, y: ts.map(function (t) { return C.oxideNm(T, t); }) };
            });

            series.push({ label: "target " + R.fab.node.eot + " nm", color: "#888888", width: 1.2, dash: [5, 4], x: [1, 600], y: [R.fab.node.eot, R.fab.node.eot] });

            D.line(cv1, { theme: "dark", xLabel: "Oxidation time (min)", yLabel: "Oxide thickness (nm)", xLog: true, yLog: true, title: "Thermal oxide growth", series: series });

            const pr = C.implantProfile(R.fab, o2);

            D.line(cv2, {
                theme: "dark", xLabel: "Depth (nm)", yLabel: "Dopant per cm³", yLog: true, title: "Source and drain dopant profile",
                series: [
                    { label: "as implanted", color: D.color(0, "dark"), width: 1.6, x: pr.z, y: pr.asImp },
                    { label: "after anneal", color: D.color(1, "dark"), width: 2.4, x: pr.z, y: pr.annealed },
                    { label: "channel doping", color: "#888888", width: 1.2, dash: [5, 4], x: [pr.z[0], pr.z[pr.z.length - 1]], y: [5e17, 5e17] }
                ]
            });
        }

        curves();

        panel.appendChild(hint("The junction is where the dopant curve falls to the channel doping level. Annealing flattens and spreads the curve, so the junction moves deeper."));

        panel.appendChild(navButtons("chip", "Design a chip →"));

        award("FirstFab", 15, "ran your first transistor process");
    }


    /* ------------------------------------------------
       STATION 7: THE CHIP, DIES AND WAFER TEST
    ------------------------------------------------ */

    const STATE_COLOR = { fast: "#2fd0b0", pass: "#3ecf8e", slow: "#f2b84b", dead: "#d9484f", fail: "#6b7280" };

    function stChip() {

        heading(7, "Design a chip and test the wafer", "A wafer is a round tray of identical chips, called dies. How many fit depends on how big each chip is, and how many work depends on the dirt, the crystal and the process. Choose a product, then look at your wafer under the probe card.");

        const pb = animBox("A wafer under the probe card. Hover over a die for its result.", false);
        const mapCanvas = pb.canvas;
        const mapWrap = pb.box;

        mapWrap.classList.add("cl-wafer");

        const probe = A.waferProbe(mapCanvas, function () { return { R: R }; }, function (t) { pb.say(t); });

        pb.say("Hover over a die to see its result.");

        const live = liveBox(function (box, r) {

            const c = r.chip;
            const f = r.fin;

            box.appendChild(h("h2", { className: "lab-h2", text: "Your chip" }));

            box.appendChild(table(["Measure", "Value"], [
                ["Transistors", sig(c.prod.n)],
                ["Size of one die", c.areaMm2.toFixed(1) + " mm²" + (c.congest > 1 ? " (padded: not enough wiring layers)" : "")],
                ["Wiring layers needed / you have", c.mReq + " / " + c.mHave],
                ["Dies on one wafer", sig(c.dies)],
                ["Speed it can reach", c.fGHz.toFixed(2) + " GHz (the product needs " + c.prod.fGHz + " GHz)"],
                ["Power at its working speed", sig(c.pTotal) + " W (limit " + c.prod.pMax + " W)"],
                ["Share of that power that is leakage", Math.round(c.pLeak / Math.max(c.pTotal, 1e-12) * 100) + " %"]
            ]));

            if (!c.reticleOk) { box.appendChild(note("warn", "This die is " + c.areaMm2.toFixed(0) + " mm². The biggest die a scanner can print is about " + C.RETICLE + " mm². Pick a smaller node (more transistors per mm²) or a smaller chip.")); }
            if (c.mHave < c.mReq) { box.appendChild(note("warn", "A chip this size needs about " + c.mReq + " wiring layers. With fewer, the wires have to detour and the die grows.")); }
            if (c.fGHz < c.prod.fGHz) { box.appendChild(note("warn", "This process can't reach the speed the product needs.")); }
            if (c.pTotal > c.prod.pMax) { box.appendChild(note("warn", "Too much power for this product. A smaller node, lower leakage or better insulator would cut it.")); }
            if (c.flatFactor < 0.9) { box.appendChild(note("warn", "The wafers are rougher than the exposure tool can focus on (" + sig(r.wf.flat) + " nm against about " + c.dof + " nm). Polish them more, or use a coarser tool: " + Math.round((1 - c.flatFactor) * 100) + "% of the dies are lost to blur.")); }

            box.appendChild(h("h2", { className: "lab-h2", text: "Where do the dies die?" }));

            const parts = c.parts;
            const cvB = canvasEl("Defects per cm² from each source");

            box.appendChild(cvB);

            window.requestAnimationFrame(function () {

                D.bars(cvB, {
                    theme: "dark", title: "Killer defects by source (per cm²)", yLabel: "defects per cm²",
                    bars: [
                        { label: "Cleanroom", value: parts.clean, error: 0, color: D.color(0, "dark") },
                        { label: "Crystal", value: parts.crystal, error: 0, color: D.color(1, "dark") },
                        { label: "Metals", value: parts.metal, error: 0, color: D.color(2, "dark") },
                        { label: "Wafer surface", value: parts.surface, error: 0, color: D.color(3, "dark") }
                    ]
                });
            });

            box.appendChild(table(["Yield step", "Share that survives"], [
                ["Free of killer defects", Math.round(c.yDefect * 100) + " %"],
                ["In focus on the scanner", Math.round(c.flatFactor * 100) + " %"],
                ["Fast enough and not leaky (parametric)", Math.round((f.yParam) * 100) + " %"],
                ["Wafer yield after test", Math.round(f.yDef * f.yParam * 100) + " %"]
            ]));

            box.appendChild(hint("Yield is the share of dies that work. A bigger die has more area to catch a defect, so yield falls steeply with size. That is why big chips are expensive."));
        });

        panel.appendChild(h("h2", { className: "lab-h2", text: "What are you making?" }));

        panel.appendChild(cards({
            label: "Product",
            items: Object.keys(C.PRODUCTS).map(function (k) { const p = C.PRODUCTS[k]; return { id: k, title: p.name, body: p.blurb, meta: sig(p.n) + " transistors, " + p.fGHz + " GHz, under " + p.pMax + " W" }; }),
            value: S.c.chip.product,
            onChange: function (id) { change(live, function () { S.c.chip.product = id; }); redrawMap(); }
        }));

        panel.appendChild(live.box);

        panel.appendChild(h("h2", { className: "lab-h2", text: "One wafer under the probe card" }));
        panel.appendChild(mapWrap);

        const legend = h("div", { className: "cl-legend" });

        [["fast", "Works, fast bin"], ["pass", "Works"], ["slow", "Works but slow"], ["fail", "Leaky or off target"], ["dead", "Killed by a defect"]].forEach(function (e) {

            legend.appendChild(h("span", { className: "cl-legend-item" }, [h("span", { className: "cl-dot", style: "background:" + STATE_COLOR[e[0]] }), e[1]]));
        });

        panel.appendChild(legend);

        const stats = h("p", { className: "lab-hint" });

        panel.appendChild(stats);

        function redrawMap() {

            run();

            if (!R.chip.dies) { probe.load([]); stats.textContent = "No dies fit on this wafer."; return; }

            const dies = C.waferMap(R.chip, R.bins.bins, S.c.seed + S.mapSeed * 977);

            probe.load(dies);

            const n = { fast: 0, pass: 0, slow: 0, fail: 0, dead: 0 };

            dies.forEach(function (d) { n[d.state] += 1; });

            stats.textContent = "This wafer: " + (n.fast + n.pass) + " good of " + dies.length + " dies (" + Math.round((n.fast + n.pass) / dies.length * 100) + "%), " + n.slow + " slow, " + n.fail + " off target, " + n.dead + " dead from defects. Another wafer from the same batch comes out a little different.";
        }

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [
            h("span"),
            h("button", { type: "button", className: "lab-btn ghost", text: "Replay the test", onclick: function () { probe.replay(); } }),
            h("button", { type: "button", className: "lab-btn", text: "Test another wafer", onclick: function () { S.mapSeed += 1; redrawMap(); award("FirstMap", 15, "probed your first wafer"); } })
        ]));

        redrawMap();

        panel.appendChild(navButtons("pack", "Cut and package the dies →"));
    }


    /* ------------------------------------------------
       STATION 8: PACKAGING
    ------------------------------------------------ */

    function stPack() {

        heading(8, "Cut, package and test", "The wafer is cut into dies and each good die is glued into a package that protects it, connects it to a circuit board and carries away heat. Then every chip is tested again. A chip that gets too hot slows itself down to survive.");

        const kb = animBox("A die being packaged, then running and heating up", true);

        panel.appendChild(kb.box);

        kb.say("Choose a package below. Slide the speed down and the chip cools; run it flat out and watch the thermometer.");

        const pkgAnim = A.packaging(kb.canvas, function () { return { R: R, c: S.c }; }, function (t) { kb.say(t); });

        panel.appendChild(slider({
            label: "Run the chip at", min: 10, max: 120, step: 5, value: 100, unit: "% of its speed",
            hint: "Dynamic power grows with clock speed. Past what the package can cool, the chip has to throttle.",
            onChange: function (v) { pkgAnim.setLoad(v / 100); }
        }));

        const live = liveBox(function (box, r) {

            const f = r.fin;
            const c = r.chip;

            box.appendChild(h("h2", { className: "lab-h2", text: "Your finished chips" }));

            box.appendChild(table(["Measure", "Value"], [
                ["Package", f.pkg.name],
                ["Junction temperature at full load", f.tj.toFixed(0) + " °C (limit 105 °C)"],
                ["Speed after thermal throttling", f.fFinal.toFixed(2) + " GHz" + (f.throttle < 1 ? " (slowed down to stay cool)" : "")],
                ["Power", sig(c.pTotal) + " W"],
                ["Dies that work", sig(f.goodDies)],
                ["Good packaged chips", sig(f.goodChips)],
                ["Overall yield, sand to chip, of all dies on the wafers", (f.yTotal * 100).toFixed(1) + " %"],
                ["Cost of one packaged chip", f.costPerChip === Infinity ? "n/a" : money(f.costPerChip)]
            ]));

            if (!f.feasible) { box.appendChild(note("warn", "This chip cannot be made with your choices: " + (!c.sizeOk ? "the wafers are too small for this node. " : "") + (!c.toolOk ? "the exposure tool cannot print this node. " : "") + (!c.reticleOk ? "the die is too big for the scanner." : ""))); }
            if (f.throttle < 1) { box.appendChild(note("warn", "Too hot: the chip must throttle to " + Math.round(f.throttle * 100) + "% speed. A package that carries heat away better (flip-chip with a heat spreader) would help.")); }
            if (!f.meetsF && f.feasible) { box.appendChild(note("warn", "It misses the speed the product needs.")); }
            if (f.goodChips > 0 && f.meetsF && f.meetsP) { box.appendChild(note("ok", "It meets the product's speed and power. These chips can ship.")); }
        });

        panel.appendChild(cards({
            label: "Package",
            items: Object.keys(C.PACKAGES).map(function (k) { const p = C.PACKAGES[k]; return { id: k, title: p.name, body: p.blurb, meta: "$" + p.base + " each, " + p.theta + " °C/W" }; }),
            value: S.c.pkg.pkg,
            onChange: function (id) { change(live, function () { S.c.pkg.pkg = id; }); }
        }));

        panel.appendChild(live.box);
        panel.appendChild(navButtons("results", "See the results →"));
    }


    /* ------------------------------------------------
       STATION 9: RESULTS AND COMPARISON
    ------------------------------------------------ */

    function summaryOf(c) {

        const r = C.runAll(c);

        return { r: r, chips: r.fin.goodChips, cost: r.fin.costPerChip, yTotal: r.fin.yTotal, kwh: r.fin.kwhPerChip, co2: r.fin.co2PerChip, perTonne: r.fin.goodChips / (c.sand.kg / 1000) };
    }

    function diffText(a, b) {

        const out = [];

        const walk = function (x, y, path) {

            Object.keys(x).forEach(function (k) {

                if (k === "seed" || k === "removed") { return; }

                const p = path ? path + " " + k : k;

                if (x[k] && typeof x[k] === "object") { walk(x[k], y[k] || {}, p); }
                else if (x[k] !== y[k]) { out.push(p + ": " + (typeof x[k] === "number" ? sig(x[k]) : x[k]) + " → " + (typeof y[k] === "number" ? sig(y[k]) : y[k])); }
            });
        };

        walk(a, b, "");

        return out;
    }

    function stResults() {

        heading(9, "From sand to chip: your results", "Here is everything that happened to your sand. Save this run, change one thing, and run it again to see what really matters.");

        const live = liveBox(function (box, r) {

            const f = r.fin;
            const c = S.c;

            box.appendChild(h("h2", { className: "lab-h2", text: sig(c.sand.kg) + " kg of sand became " + sig(f.goodChips) + " chips" }));

            const fb = animBox("A funnel showing how much of the silicon makes it through each stage", false);

            box.appendChild(fb.box);
            fb.say("Hover over a stage to see how much was kept and what was lost.");

            A.funnel(fb.canvas, function () { return { R: R, c: S.c }; }, function (t) { fb.say(t); });

            const dies = r.chip.dies * r.wf.wafers;

            box.appendChild(table(["Stage", "What you had at the end"], [
                ["Sand, after sorting and cleaning", sig(r.sand.kg) + " kg (" + (r.sand.sio2 * 100).toFixed(1) + " % silica)"],
                ["Metallurgical silicon", sig(r.mg.kgSi) + " kg, " + r.mg.purity.toFixed(1) + " % pure"],
                ["Polysilicon", sig(r.poly.kgPoly) + " kg, " + nines(r.poly.nines) + " pure"],
                ["Single crystal in spec", sig(r.cr.kgUsable) + " kg of " + c.crystal.size + " mm silicon"],
                ["Wafers", sig(r.wf.wafers)],
                ["Dies printed", sig(dies) + " (" + r.chip.areaMm2.toFixed(1) + " mm² each, " + C.NODES[c.fab.node].name + " node)"],
                ["Dies that work", sig(f.goodDies)],
                ["Good packaged chips", sig(f.goodChips) + " " + C.PRODUCTS[c.chip.product].name.toLowerCase() + (f.goodChips === 1 ? "" : "s")]
            ]));

            box.appendChild(h("h2", { className: "lab-h2", text: "Cost, energy and carbon" }));

            box.appendChild(table(["Measure", "Value"], [
                ["Total cost of the run", money(f.total)],
                ["Cost of one packaged chip", f.costPerChip === Infinity ? "n/a" : money(f.costPerChip)],
                ["What these chips sell for (about)", money(C.PRODUCTS[c.chip.product].price) + " each"],
                ["Electricity per chip", f.kwhPerChip === Infinity ? "n/a" : sig(f.kwhPerChip) + " kWh"],
                ["Carbon dioxide per chip", f.co2PerChip === Infinity ? "n/a" : sig(f.co2PerChip) + " kg"],
                ["Chips per tonne of sand", sig(f.goodChips / (c.sand.kg / 1000))]
            ]));

            const cv = canvasEl("Where the money went");

            box.appendChild(cv);

            window.requestAnimationFrame(function () {

                D.bars(cv, {
                    theme: "dark", title: "Where the money went", yLabel: "dollars",
                    bars: [
                        { label: "Sand to wafer", value: f.costs.upstream, error: 0, color: D.color(0, "dark") },
                        { label: "Fab", value: f.costs.fab, error: 0, color: D.color(1, "dark") },
                        { label: "Wafer test", value: f.costs.probe, error: 0, color: D.color(2, "dark") },
                        { label: "Packaging", value: f.costs.pkg, error: 0, color: D.color(3, "dark") },
                        { label: "Final test", value: f.costs.test, error: 0, color: D.color(4, "dark") }
                    ]
                });
            });

            if (f.goodChips === 0) { box.appendChild(note("warn", "No chips came out. Walk back through the stations and read the warnings: the cause is usually at the first station that showed one.")); }
            else if (f.costPerChip < C.PRODUCTS[c.chip.product].price * 0.6) { box.appendChild(note("ok", "Each chip costs well under what it sells for. That is a business.")); }
            else if (f.costPerChip > C.PRODUCTS[c.chip.product].price) { box.appendChild(note("warn", "Each chip costs more than it sells for. A bigger batch spreads the fab cost, or a different node might fit this product better.")); }

            if (f.goodChips > 0) { award("FirstChip", 40, "made your first working chips from sand"); }
        });

        panel.appendChild(live.box);

        panel.appendChild(h("h2", { className: "lab-h2", text: "Save this run and compare" }));

        const nameInput = h("input", { type: "text", className: "lab-name", maxlength: "40", placeholder: "Name this run (optional)", "aria-label": "Name for this run" });

        const saveBtn = h("button", {
            type: "button", className: "lab-btn", text: "Save this run",
            onclick: function () {

                if (S.runs.length >= MAX_RUNS) { toast("You have " + MAX_RUNS + " saved runs. Delete one first."); return; }

                S.runs.push({ id: "r" + Date.now().toString(36).slice(-5) + S.runs.length, label: nameInput.value.trim().slice(0, 40), created: new Date().toISOString().slice(0, 10), c: JSON.parse(JSON.stringify(S.c)) });
                save();
                toast("Saved. Change something and save another to compare.");
                award("FirstSave", 15, "saved a run");
                render();
            }
        });

        panel.appendChild(h("div", { className: "lab-batch col" }, [nameInput, h("div", { className: "lab-actions no-print" }, [saveBtn, h("button", {
            type: "button", className: "lab-btn ghost", text: "Start a fresh run from the top",
            onclick: function () {

                if (!window.confirm("Start over with new sand? Your saved runs stay.")) { return; }

                S.c = C.sanitize({ seed: newSeed() });
                S.seen = {};
                S.step = "sand";
                save();
                render();
            }
        })])]));

        if (S.runs.length) {

            const list = h("div", { className: "lab-batches" });

            S.runs.forEach(function (run, k) {

                const sm = summaryOf(run.c);

                list.appendChild(h("div", { className: "lab-batch" }, [
                    h("span", { className: "lab-dot", style: "background:" + D.color(k, "dark") }),
                    h("div", { className: "lab-batch-body" }, [
                        h("strong", { text: "Run " + (k + 1) + (run.label ? ": " + run.label : "") }),
                        h("p", { text: C.NODES[run.c.fab.node].name + " · " + C.PRODUCTS[run.c.chip.product].name + " · " + sig(run.c.sand.kg) + " kg of " + C.SITES[run.c.sand.site].name.toLowerCase() + " · " + sig(sm.chips) + " chips" })
                    ]),
                    h("div", { className: "lab-batch-actions" }, [
                        h("button", { type: "button", className: "lab-btn small", text: "Load", onclick: function () { S.c = C.sanitize(JSON.parse(JSON.stringify(run.c))); S.step = "sand"; save(); render(); } }),
                        h("button", { type: "button", className: "lab-btn small ghost", text: "Delete", "aria-label": "Delete run " + (k + 1), onclick: function () { S.runs.splice(k, 1); save(); render(); } })
                    ])
                ]));
            });

            panel.appendChild(list);
        }

        if (S.runs.length >= 2) {

            award("Compared", 30, "compared two runs");

            const sums = S.runs.map(function (run) { return summaryOf(run.c); });

            panel.appendChild(h("h2", { className: "lab-h2", text: "Side by side" }));

            panel.appendChild(table(["Run", "Node", "Wafer", "Product", "Chips", "Per tonne of sand", "Cost per chip", "kWh per chip", "Yield"], S.runs.map(function (run, k) {

                const sm = sums[k];

                return ["Run " + (k + 1) + (run.label ? ": " + run.label : ""), C.NODES[run.c.fab.node].name, run.c.crystal.size + " mm", C.PRODUCTS[run.c.chip.product].name, sig(sm.chips), sig(sm.perTonne),
                    sm.cost === Infinity ? "n/a" : money(sm.cost), sm.kwh === Infinity ? "n/a" : sig(sm.kwh), (sm.yTotal * 100).toFixed(1) + " %"];
            })));

            const charts = h("div", { className: "lab-charts" });

            const mk = function (title, yLabel, fn) {

                const cv = canvasEl(title);

                charts.appendChild(cv);

                window.requestAnimationFrame(function () {

                    D.bars(cv, { theme: "dark", title: title, yLabel: yLabel, bars: S.runs.map(function (run, k) { return { label: "Run " + (k + 1), value: fn(sums[k]), error: 0, color: D.color(k, "dark") }; }) });
                });
            };

            mk("Chips per tonne of sand", "chips", function (sm) { return sm.perTonne; });
            mk("Cost of one chip", "dollars", function (sm) { return isFinite(sm.cost) ? sm.cost : NaN; });
            mk("Electricity per chip", "kWh", function (sm) { return isFinite(sm.kwh) ? sm.kwh : NaN; });
            mk("Yield, sand to chip", "%", function (sm) { return sm.yTotal * 100; });

            panel.appendChild(charts);

            const diffs = diffText(S.runs[0].c, S.runs[1].c);

            panel.appendChild(h("h2", { className: "lab-h2", text: "What changed between run 1 and run 2?" }));

            if (diffs.length) { panel.appendChild(h("ul", { className: "lab-obs" }, diffs.slice(0, 14).map(function (d) { return h("li", { text: d }); }))); }
            else { panel.appendChild(hint("The two runs used the same choices.")); }

            panel.appendChild(hint("The best comparisons change one thing at a time. Which step moved the cost most? Which one moved the yield? A trade-off is a finding, not a failure."));
        }

        panel.appendChild(h("div", { className: "lab-actions no-print" }, [
            h("button", { type: "button", className: "lab-btn ghost", text: "← Back to packaging", onclick: function () { go("pack"); } }),
            h("button", { type: "button", className: "lab-btn ghost", text: "Print", onclick: function () { window.print(); } })
        ]));
    }


    /* ------------------------------------------------
       START
    ------------------------------------------------ */

    function start() {

        root = document.getElementById("labApp");

        if (!root || !C || !D) { return; }

        load();

        const stats = document.getElementById("totalXPDisplay");

        if (stats) { stats.textContent = localStorage.getItem("fabPathXP") || "0"; }

        render();
    }

    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }

}());
