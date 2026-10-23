/* ========================================
   SITE MENU (dropdowns on every page)

   Loaded by theme.js on every page that has a top bar, so no page
   needs its own copy. On site pages (home, about, careers...) it
   replaces the flat links with dropdowns: Courses, Labs, Play,
   Careers and About. On course pages it keeps the course's own
   links (Learn, Games, Practice...) and adds one "Explore" menu.
   On phones everything folds into a ☰ menu.

   Self-contained: injects its own CSS, uses the theme's colour
   variables so it follows light and dark mode.
======================================== */

(function () {

    "use strict";

    if (window.FabSiteNav) {
        return;
    }

    window.FabSiteNav = true;

    const MENU = [
        {
            id: "courses", label: "Courses",
            groups: [
                {
                    title: "Chips & fabrication", items: [
                        ["chip-learn.html", "🏭", "Sand to Chip", "How a chip gets made, from sand to finished chip"],
                        ["learn.html", "🔬", "MEMS & Microfabrication", "Cleanroom processes and tiny machines"],
                        ["qc-learn.html", "⚛️", "Quantum Computing Chips", "How quantum computers are built (new)"]
                    ]
                },
                {
                    title: "Sensors & the body", items: [
                        ["fet-learn.html", "🧪", "BioFETs & MOSFETs", "Transistors that sense biology"],
                        ["glu-learn.html", "🩸", "Glucose Sensors", "How a glucose monitor works"],
                        ["nt-learn.html", "🧬", "Neural Interface Chip", "Chips that talk to neurons"]
                    ]
                },
                {
                    title: "Energy", items: [
                        ["supercap-learn.html", "⚡", "Supercapacitors", "Storing energy at the electrode surface"]
                    ]
                }
            ],
            foot: ["index.html#courses", "All courses and your progress →"]
        },
        {
            id: "labs", label: "Labs",
            groups: [
                {
                    title: "Virtual fab labs: design, build and test", items: [
                        ["chip-lab.html", "🏭", "Sand to Chip foundry", "Sand to finished chip, station by station"],
                        ["mems-lab.html", "🔬", "MEMS lab", "Accelerometers, gyroscopes, micromirrors"],
                        ["qc-lab.html", "⚛️", "Quantum Foundry", "Transmon qubit chips, measured at 10 mK"],
                        ["supercap-lab.html", "⚡", "Supercapacitor lab", "Chip, coin, pouch and jelly-roll cells"],
                        ["fet-lab.html", "🧪", "MOSFET & BioFET lab", "Transistors and biosensors"],
                        ["glu-lab.html", "🩸", "Glucose sensor lab", "Electrodes, enzymes and membranes"],
                        ["nt-lab.html", "🧬", "Neural probe lab", "Electrode arrays for the brain"]
                    ]
                }
            ],
            foot: ["equations.html", "How the lab simulations work →"]
        },
        {
            id: "play", label: "Play",
            groups: [
                {
                    title: "Adventure", items: [
                        ["adventure.html", "🎒", "Waferbound", "Our adventure game: explore a world built from chip science"]
                    ]
                },
                {
                    title: "Games", items: [
                        ["chip-games.html", "🏭", "Sand to Chip games", ""],
                        ["games.html", "🔬", "MEMS games", ""],
                        ["supercap-games.html", "⚡", "Supercapacitor games", ""],
                        ["fet-games.html", "🧪", "BioFET games", ""],
                        ["glu-games.html", "🩸", "Glucose games", ""],
                        ["nt-games.html", "🧬", "Neural games", ""]
                    ]
                },
                {
                    title: "Practice", items: [
                        ["chip-practice.html", "🏭", "Sand to Chip practice", ""],
                        ["practice.html", "🔬", "MEMS practice", ""],
                        ["supercap-practice.html", "⚡", "Supercapacitor practice", ""],
                        ["fet-practice.html", "🧪", "BioFET practice", ""],
                        ["glu-practice.html", "🩸", "Glucose practice", ""],
                        ["nt-practice.html", "🧬", "Neural practice", ""]
                    ]
                }
            ]
        },
        { id: "game", label: "Waferbound", href: "adventure.html", badge: "NEW" },
        { id: "careers", label: "Careers", href: "careers.html" },
        {
            id: "about", label: "About",
            groups: [
                {
                    title: "Fab Path", items: [
                        ["about.html", "ℹ️", "About Fab Path", "Who built it and why"],
                        ["sources.html", "📚", "Sources", "Textbooks and papers behind the lessons"],
                        ["equations.html", "∑", "Lab equations", "The physics inside every simulation"],
                        ["feedback.html", "💬", "Feedback", "Report an error or suggest an idea"],
                        ["privacy.html", "🔒", "Privacy", ""],
                        ["terms.html", "📄", "Terms", ""]
                    ]
                }
            ]
        }
    ];

    const CSS = `
.sn { display: flex; align-items: center; gap: 4px; margin-left: 18px; margin-right: auto; position: relative; }
.topbar .logo { white-space: nowrap; }
.sn-desktop { display: flex; align-items: center; gap: 4px; }
.sn-trigger { display: inline-flex; align-items: center; gap: 6px; padding: 9px 12px; border-radius: 10px; border: 1px solid transparent; background: none; color: var(--text); font: inherit; font-size: 0.95rem; font-weight: 600; cursor: pointer; text-decoration: none; white-space: nowrap; }
.sn-trigger:hover, .sn-trigger[aria-expanded="true"] { background: var(--panel-light); border-color: var(--border); }
.sn-trigger.sn-current { color: var(--accent); }
.sn-game { color: var(--accent); }
.sn-badge { margin-left: 6px; padding: 2px 6px; border-radius: 999px; background: var(--accent); color: #06121a; font-size: 0.62rem; font-weight: 800; letter-spacing: .08em; vertical-align: middle; }
.sn-caret { width: 9px; height: 9px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg) translate(-2px, -2px); opacity: .7; transition: transform .15s; }
.sn-trigger[aria-expanded="true"] .sn-caret { transform: rotate(225deg) translate(-2px, -2px); }
.sn-panel { position: absolute; top: calc(100% + 10px); left: 0; z-index: 400; min-width: 320px; max-width: min(860px, calc(100vw - 40px)); max-height: calc(100vh - 120px); overflow: auto; padding: 18px; border-radius: 16px; background: var(--panel); border: 1px solid var(--border); box-shadow: 0 24px 60px rgba(0,0,0,.35); display: none; }
.sn-panel.open { display: block; }
.sn-cols { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 1fr); gap: 18px; }
.sn-compact { grid-auto-columns: minmax(170px, 1fr); gap: 10px; }
.sn-compact .sn-link { padding: 6px 8px; }
.sn-group h4 { margin: 0 0 8px; font-size: 0.72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); }
.sn-link { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 10px; color: var(--text); text-decoration: none; }
.sn-link:hover, .sn-link:focus-visible { background: var(--panel-light); outline: none; }
.sn-link.sn-here { background: var(--accent-soft, rgba(84,224,199,.12)); }
.sn-ico { width: 24px; text-align: center; flex: none; font-size: 1.05rem; line-height: 1.4; }
.sn-txt b { display: block; font-size: 0.92rem; font-weight: 700; }
.sn-txt span { display: block; font-size: 0.8rem; color: var(--muted); margin-top: 2px; }
.sn-foot { display: block; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); color: var(--accent); font-weight: 700; font-size: 0.9rem; text-decoration: none; }
.sn-burger { display: none; width: 42px; height: 42px; border-radius: 10px; border: 1px solid var(--border); background: var(--panel-light); color: var(--text); font-size: 1.2rem; cursor: pointer; }
.sn-mobile { display: none; }
.topbar.sn-has-course nav:not(.hm-nav) { gap: 22px; }
@media (max-width: 900px) {
  .sn .sn-desktop { display: none; }
  .sn-burger { display: inline-flex; align-items: center; justify-content: center; }
  .sn { margin-left: 10px; }
  .sn-mobile.open { display: block; position: fixed; inset: 0; z-index: 900; overflow: auto; padding: 18px 16px 40px; background: var(--bg); }
  .sn-mobile-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .sn-mobile-head strong { color: var(--accent); letter-spacing: .18em; }
  .sn-mobile details { border: 1px solid var(--border); border-radius: 14px; margin-bottom: 10px; background: var(--panel); }
  .sn-mobile summary { padding: 14px 16px; font-weight: 700; cursor: pointer; list-style: none; display: flex; justify-content: space-between; }
  .sn-mobile summary::after { content: "+"; color: var(--accent); }
  .sn-mobile details[open] summary::after { content: "−"; }
  .sn-mobile .sn-group { padding: 0 10px 12px; }
  .sn-mobile .sn-plain { display: block; padding: 14px 16px; border: 1px solid var(--border); border-radius: 14px; margin-bottom: 10px; background: var(--panel); color: var(--text); font-weight: 700; text-decoration: none; }
  .sn-mobile .sn-course { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
  .sn-mobile .sn-course a { padding: 8px 12px; border-radius: 999px; border: 1px solid var(--border); color: var(--text); text-decoration: none; font-weight: 600; font-size: 0.9rem; }
  .topbar.sn-site nav.hm-nav { display: none; }
}
@media (min-width: 901px) {
  .topbar.sn-site nav.hm-nav { display: none; }
}
@media (min-width: 901px) and (max-width: 1200px) {
  .sn-trigger { padding: 8px 9px; font-size: 0.9rem; }
  .sn { margin-left: 10px; gap: 2px; }
  .topbar.sn-site .user-stats > span, .topbar.sn-has-course .user-stats > span { display: none; }
}
html.sn-lock, html.sn-lock body { overflow: hidden; }
`;

    function byId(id) {

        return MENU.filter(function (m) { return m.id === id; })[0];
    }

    function page() {

        const p = location.pathname.split("/").pop() || "index.html";

        return p.toLowerCase();
    }

    function el(tag, attrs, kids) {

        const n = document.createElement(tag);

        Object.keys(attrs || {}).forEach(function (k) {

            if (k === "text") { n.textContent = attrs[k]; } else if (k === "className") { n.className = attrs[k]; } else { n.setAttribute(k, attrs[k]); }
        });

        (kids || []).forEach(function (c) { if (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); } });

        return n;
    }

    function linkFor(item, here) {

        const a = el("a", { className: "sn-link" + (item[0] === here ? " sn-here" : ""), href: item[0] });

        a.appendChild(el("span", { className: "sn-ico", "aria-hidden": "true", text: item[1] }));

        const t = el("span", { className: "sn-txt" });

        t.appendChild(el("b", { text: item[2] }));

        if (item[3]) { t.appendChild(el("span", { text: item[3] })); }

        a.appendChild(t);

        if (item[0] === here) { a.setAttribute("aria-current", "page"); }

        return a;
    }

    function groupsFor(m, here) {

        const wrap = el("div", { className: "sn-cols" });

        m.groups.forEach(function (g) {

            const box = el("div", { className: "sn-group" });

            box.appendChild(el("h4", { text: g.title }));
            g.items.forEach(function (it) { box.appendChild(linkFor(it, here)); });
            wrap.appendChild(box);
        });

        return wrap;
    }

    function inMenu(m, here) {

        if (m.href) { return m.href === here; }

        return m.groups.some(function (g) { return g.items.some(function (it) { return it[0] === here; }); });
    }

    function build() {

        const bar = document.querySelector(".topbar");

        if (!bar || bar.querySelector(".sn")) { return; }

        const style = document.createElement("style");

        style.id = "fabSiteNavCss";
        style.textContent = CSS;
        document.head.appendChild(style);

        const here = page();
        const siteNav = bar.querySelector("nav.hm-nav");
        const courseNav = siteNav ? null : bar.querySelector("nav");
        const logo = bar.querySelector(".logo");

        const sn = el("div", { className: "sn" });
        const desk = el("div", { className: "sn-desktop" });
        let openPanel = null;

        function closeAll() {

            if (openPanel) {

                openPanel.panel.classList.remove("open");
                openPanel.btn.setAttribute("aria-expanded", "false");
                openPanel = null;
            }
        }

        // On course pages there is one "Explore" menu holding every section; on site pages each section has its own.
        const sections = siteNav ? MENU : [{ id: "explore", label: "Explore", all: true }];

        sections.forEach(function (m) {

            if (m.href) {

                const a = el("a", { className: "sn-trigger" + (m.badge ? " sn-game" : "") + (m.href === here ? " sn-current" : ""), href: m.href, text: m.label });

                if (m.badge) { a.appendChild(el("span", { className: "sn-badge", text: m.badge })); }

                desk.appendChild(a);

                return;
            }

            const btn = el("button", { type: "button", className: "sn-trigger" + (!m.all && inMenu(m, here) ? " sn-current" : ""), "aria-expanded": "false", "aria-haspopup": "true" });

            btn.appendChild(document.createTextNode(m.label));
            btn.appendChild(el("span", { className: "sn-caret", "aria-hidden": "true" }));

            const panel = el("div", { className: "sn-panel", role: "menu" });

            if (m.all) {

                // Course pages: one compact panel. Practice is left out (each course links its own) and
                // Careers joins the About links, so it fits in four columns.
                const cols = el("div", { className: "sn-cols sn-compact" });
                const columns = [
                    ["Courses", byId("courses").groups.reduce(function (a, g) { return a.concat(g.items); }, [])],
                    ["Labs", byId("labs").groups[0].items],
                    ["Play", byId("play").groups[0].items.concat(byId("play").groups[1].items)],
                    ["More", [["careers.html", "🧭", "Careers", ""]].concat(byId("about").groups[0].items)]
                ];

                columns.forEach(function (c) {

                    const box = el("div", { className: "sn-group" });

                    box.appendChild(el("h4", { text: c[0] }));
                    c[1].forEach(function (it) { box.appendChild(linkFor([it[0], it[1], it[2], ""], here)); });
                    cols.appendChild(box);
                });

                panel.appendChild(cols);
                panel.style.maxWidth = "min(1000px, calc(100vw - 40px))";

            } else {

                panel.appendChild(groupsFor(m, here));

                if (m.foot) { panel.appendChild(el("a", { className: "sn-foot", href: m.foot[0], text: m.foot[1] })); }
            }

            btn.addEventListener("click", function (e) {

                e.stopPropagation();

                const was = openPanel && openPanel.panel === panel;

                closeAll();

                if (!was) {

                    panel.classList.add("open");
                    btn.setAttribute("aria-expanded", "true");
                    openPanel = { panel: panel, btn: btn };

                    // keep the panel inside the window
                    panel.style.left = "0px";

                    const r = panel.getBoundingClientRect();

                    if (r.right > window.innerWidth - 12) { panel.style.left = -Math.min(r.left - 12, r.right - window.innerWidth + 12) + "px"; }
                }
            });

            const holder = el("div", { style: "position:relative" }, [btn, panel]);

            panel.style.left = "0px";
            desk.appendChild(holder);
        });

        sn.appendChild(desk);

        // ---------- phone menu ----------
        const burger = el("button", { type: "button", className: "sn-burger", "aria-label": "Open the menu", "aria-expanded": "false", text: "☰" });
        const mob = el("div", { className: "sn-mobile", role: "dialog", "aria-label": "Site menu" });
        const close = el("button", { type: "button", className: "sn-burger", "aria-label": "Close the menu", text: "✕", style: "display:inline-flex" });

        mob.appendChild(el("div", { className: "sn-mobile-head" }, [el("strong", { text: "FAB PATH" }), close]));

        if (courseNav) {

            const row = el("div", { className: "sn-course" });

            courseNav.querySelectorAll("a").forEach(function (a) { row.appendChild(el("a", { href: a.getAttribute("href"), text: a.textContent.trim() })); });

            mob.appendChild(el("h4", { text: "This course", style: "margin:4px 0 8px;font-size:.72rem;letter-spacing:.14em;color:var(--accent)" }));
            mob.appendChild(row);
        }

        MENU.forEach(function (m) {

            if (m.href) {

                const a = el("a", { className: "sn-plain", href: m.href, text: m.label });

                if (m.badge) { a.appendChild(el("span", { className: "sn-badge", text: m.badge })); }

                mob.appendChild(a);

                return;
            }

            const d = el("details", inMenu(m, here) ? { open: "" } : {});

            d.appendChild(el("summary", { text: m.label }));
            m.groups.forEach(function (g) {

                const box = el("div", { className: "sn-group" });

                box.appendChild(el("h4", { text: g.title }));
                g.items.forEach(function (it) { box.appendChild(linkFor(it, here)); });
                d.appendChild(box);
            });

            if (m.foot) { d.appendChild(el("a", { className: "sn-foot", href: m.foot[0], text: m.foot[1], style: "margin:0 16px 14px" })); }

            mob.appendChild(d);
        });

        function setMob(on) {

            mob.classList.toggle("open", on);
            burger.setAttribute("aria-expanded", on ? "true" : "false");
            document.documentElement.classList.toggle("sn-lock", on);

            if (on) { close.focus(); } else { burger.focus(); }
        }

        burger.addEventListener("click", function () { setMob(true); });
        close.addEventListener("click", function () { setMob(false); });
        sn.appendChild(burger);
        document.body.appendChild(mob);

        // ---------- place it ----------
        if (siteNav) {

            bar.classList.add("sn-site");
            siteNav.parentNode.insertBefore(sn, siteNav);

        } else if (logo) {

            bar.classList.add("sn-has-course");
            logo.parentNode.insertBefore(sn, logo.nextSibling);
        }

        if (courseNav) { sn.style.marginRight = "0"; }

        document.addEventListener("click", function (e) { if (openPanel && !openPanel.panel.contains(e.target)) { closeAll(); } });
        document.addEventListener("keydown", function (e) {

            if (e.key !== "Escape") { return; }

            if (mob.classList.contains("open")) { setMob(false); } else if (openPanel) { const b = openPanel.btn; closeAll(); b.focus(); }
        });
    }

    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", build); } else { build(); }

}());
