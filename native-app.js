/* ========================================
   FAB PATH: NATIVE APP FEATURES

   Loaded by account.js only inside the wrapped
   iOS and Android app (window.Capacitor exists
   only there), so it never runs on the website.

   What it adds on the device:
   - A native-style tab bar for getting around.
   - Study reminders as real local notifications,
     scheduled around the learner's streak.
   - Haptic feedback for answers, rewards, taps.
   - The system share sheet for progress and for
     course certificates.
   - A settings sheet for reminders and haptics.
   - Progress backed up to the device's native
     key-value storage, and restored if the web
     view's own storage is ever cleared.
   - Everything is stored on the device, so every
     course works with no internet connection.
======================================== */

(function () {

    if (!window.Capacitor || !window.Capacitor.isNativePlatform || !window.Capacitor.isNativePlatform()) {
        return;
    }

    /* The site is plain HTML with no bundler, so the plugins' own
       JavaScript packages are never loaded and Capacitor.Plugins starts
       out empty. registerPlugin() hooks a name straight to the native
       implementation, so ask for each plugin that is built into this
       app (isPluginAvailable) by name instead. */

    const Cap = window.Capacitor;
    const P = {};

    ["Haptics", "LocalNotifications", "Share", "Filesystem", "Preferences", "App"].forEach(function (name) {

        try {

            const present = Cap.isPluginAvailable ? Cap.isPluginAvailable(name) : !!(Cap.Plugins && Cap.Plugins[name]);

            if (present) {

                P[name] = (Cap.Plugins && Cap.Plugins[name]) || (Cap.registerPlugin ? Cap.registerPlugin(name) : null);
            }

        } catch (e) {}
    });

    const KEY_REMIND_ON = "fabNativeReminderOn";
    const KEY_REMIND_AT = "fabNativeReminderTime";
    const KEY_HAPTICS = "fabNativeHaptics";
    const KEY_PROMPTED = "fabNativePromptSeen";
    const BACKUP_KEY = "fabPathBackup";
    const BACKUP_AT_KEY = "fabPathBackupAt";

    function store(key, fallback) {

        try {

            const v = localStorage.getItem(key);

            return v === null ? fallback : v;

        } catch (e) {

            return fallback;
        }
    }

    function put(key, value) {

        try { localStorage.setItem(key, value); } catch (e) {}
    }


    /* ---------- progress backup in native storage ---------- */

    function collectProgress() {

        const data = {};

        try {

            for (let i = 0; i < localStorage.length; i++) {

                const k = localStorage.key(i);

                if (k && k.indexOf("fabPath") === 0 && k !== BACKUP_KEY) {
                    data[k] = localStorage.getItem(k);
                }
            }

        } catch (e) {}

        return data;
    }

    let lastBackup = "";

    function backup() {

        if (!P.Preferences) { return; }

        const json = JSON.stringify(collectProgress());

        if (json === lastBackup || json === "{}") { return; }

        lastBackup = json;

        P.Preferences.set({ key: BACKUP_KEY, value: json }).catch(function () {});
        P.Preferences.set({ key: BACKUP_AT_KEY, value: String(Date.now()) }).catch(function () {});
    }

    function restoreIfEmpty() {

        if (!P.Preferences) { return Promise.resolve(false); }

        const hasProgress = Object.keys(collectProgress()).length > 0;

        if (hasProgress) { return Promise.resolve(false); }

        return P.Preferences.get({ key: BACKUP_KEY }).then(function (res) {

            if (!res || !res.value) { return false; }

            let data;

            try { data = JSON.parse(res.value); } catch (e) { return false; }

            let n = 0;

            Object.keys(data).forEach(function (k) {

                if (k.indexOf("fabPath") === 0 && localStorage.getItem(k) === null) {

                    localStorage.setItem(k, data[k]);
                    n++;
                }
            });

            if (n && !sessionStorage.getItem("fabNativeRestored")) {

                sessionStorage.setItem("fabNativeRestored", "1");
                location.reload();

                return true;
            }

            return n > 0;

        }).catch(function () { return false; });
    }


    /* ---------- haptics ---------- */

    function hapticsOn() { return store(KEY_HAPTICS, "1") !== "0"; }

    let lastBuzz = 0;

    function buzz(kind) {

        if (!P.Haptics || !hapticsOn()) { return; }

        const now = Date.now();

        if (now - lastBuzz < 90) { return; }

        lastBuzz = now;

        try {

            if (kind === "success") { P.Haptics.notification({ type: "SUCCESS" }); }
            else if (kind === "error") { P.Haptics.notification({ type: "ERROR" }); }
            else if (kind === "medium") { P.Haptics.impact({ style: "MEDIUM" }); }
            else { P.Haptics.impact({ style: "LIGHT" }); }

        } catch (e) {}
    }

    function wireHaptics() {

        // a light tap on buttons and links
        document.addEventListener("click", function (e) {

            const t = e.target;

            if (t && t.closest && t.closest("button, a, [role=button], .option, .fd-q-options button")) {
                buzz("light");
            }

        }, true);

        // right and wrong answers are marked by adding a class
        const ok = ["correct", "right"];
        const bad = ["incorrect", "wrong"];

        new MutationObserver(function (records) {

            records.forEach(function (r) {

                if (r.type === "attributes" && r.attributeName === "class" && r.target.classList) {

                    const was = (r.oldValue || "").split(/\s+/);
                    const cl = r.target.classList;

                    ok.forEach(function (c) { if (cl.contains(c) && was.indexOf(c) < 0) { buzz("success"); } });
                    bad.forEach(function (c) { if (cl.contains(c) && was.indexOf(c) < 0) { buzz("error"); } });

                    if (r.target.id === "fabToast" && cl.contains("show") && was.indexOf("show") < 0) { buzz("medium"); }
                }
            });

        }).observe(document.documentElement, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["class"] });
    }


    /* ---------- study reminders (local notifications) ---------- */

    function todayKey() {

        const d = new Date();

        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }

    function remindersOn() { return store(KEY_REMIND_ON, "0") === "1"; }

    function remindAt() {

        const t = store(KEY_REMIND_AT, "19:00").split(":");

        return { h: Math.min(23, parseInt(t[0], 10) || 19), m: Math.min(59, parseInt(t[1], 10) || 0) };
    }

    const LINES = [
        "Ready for a quick lesson? A few minutes of microfabrication keeps you moving.",
        "Your next chip layer is waiting. Pick up where you left off.",
        "Five minutes with Fab Path: one lesson, one quiz, a few XP.",
        "Sand to silicon to circuits: what will you learn today?",
        "Tiny things, big ideas. Time for today's lesson."
    ];

    function schedule() {

        const LN = P.LocalNotifications;

        if (!LN) { return Promise.resolve(); }

        return LN.getPending().then(function (p) {

            const pending = (p && p.notifications) || [];

            return pending.length ? LN.cancel({ notifications: pending.map(function (n) { return { id: n.id }; }) }) : null;

        }).then(function () {

            if (!remindersOn()) { return null; }

            return LN.checkPermissions();

        }).then(function (perm) {

            if (!perm || perm.display !== "granted") { return null; }

            const at = remindAt();
            const now = new Date();
            const studiedToday = store("fabPathLastActiveDate", "") === todayKey();
            const streak = parseInt(store("fabPathStreak", "0"), 10) || 0;
            const list = [];

            for (let i = 0; i < 14; i++) {

                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, at.h, at.m, 0, 0);

                if (d <= now) { continue; }
                if (i === 0 && studiedToday) { continue; }

                const body = i === 0 && streak > 0
                    ? "Keep your " + streak + "-day streak alive 🔥 One lesson does it."
                    : LINES[(d.getDate() + i) % LINES.length];

                list.push({
                    id: 100 + i,
                    title: "Fab Path",
                    body: body,
                    schedule: { at: d, allowWhileIdle: true },
                    extra: { go: "learn" }
                });
            }

            return list.length ? LN.schedule({ notifications: list }) : null;

        }).catch(function () {});
    }

    function enableReminders() {

        const LN = P.LocalNotifications;

        if (!LN) { return Promise.resolve("unavailable"); }

        return LN.requestPermissions().then(function (res) {

            if (res && res.display === "granted") {

                put(KEY_REMIND_ON, "1");

                return schedule().then(function () { return "granted"; });
            }

            put(KEY_REMIND_ON, "0");

            return "denied";

        }).catch(function () { return "unavailable"; });
    }

    function disableReminders() {

        put(KEY_REMIND_ON, "0");

        return schedule();
    }

    function learnHref() {

        const a = document.querySelector("nav a[href*='learn']");

        return a ? a.getAttribute("href") : "learn.html";
    }


    /* ---------- the interface: styles, tab bar, settings sheet ---------- */

    function injectStyles() {

        if (document.getElementById("fabNativeStyles")) { return; }

        const style = document.createElement("style");

        style.id = "fabNativeStyles";
        style.textContent = `
html.fab-native-app body.fab-has-tabs .topbar nav { display: none !important; }
html.fab-native-app body.fab-has-tabs { padding-bottom: calc(84px + max(env(safe-area-inset-bottom), 18px)); }

.fab-tabbar {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 9000;
    display: flex; justify-content: center;
    background: rgba(11, 16, 32, .94);
    -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255, 255, 255, .12);
    padding-bottom: max(env(safe-area-inset-bottom), 18px);
}

.fab-tabbar-inner { display: flex; width: min(560px, 100%); }

.fab-tab {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 8px 4px 7px; border: 0; background: none; color: var(--muted, #aab3cf);
    font: 600 .68rem/1 system-ui, -apple-system, sans-serif; text-decoration: none; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.fab-tab svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.fab-tab.on { color: var(--accent, #54e0c7); }

.fab-sheet-bg {
    position: fixed; inset: 0; z-index: 9500; background: rgba(0, 0, 0, .55);
    display: none; align-items: flex-end; justify-content: center;
}

.fab-sheet-bg.open { display: flex; }

.fab-sheet {
    width: min(560px, 100%); max-height: 86vh; overflow-y: auto;
    background: #121a33; color: var(--text, #f5f7ff);
    border-radius: 22px 22px 0 0; border: 1px solid rgba(255, 255, 255, .12); border-bottom: 0;
    padding: 18px 18px calc(24px + env(safe-area-inset-bottom));
    animation: fab-sheet-up .25s ease;
}

@keyframes fab-sheet-up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }

.fab-sheet h2 { margin: 0 0 4px; font-size: 1.25rem; }
.fab-sheet .sub { margin: 0 0 14px; color: var(--muted, #aab3cf); font-size: .88rem; line-height: 1.45; }

.fab-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 13px 4px; border-top: 1px solid rgba(255, 255, 255, .09);
}

.fab-row b { display: block; font-size: .98rem; }
.fab-row small { display: block; color: var(--muted, #aab3cf); font-size: .8rem; margin-top: 2px; line-height: 1.35; }

.fab-switch { position: relative; width: 50px; height: 30px; flex: none; }
.fab-switch input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
.fab-switch span { position: absolute; inset: 0; border-radius: 15px; background: rgba(255, 255, 255, .18); transition: .2s; pointer-events: none; }
.fab-switch span::after { content: ""; position: absolute; left: 3px; top: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: .2s; }
.fab-switch input:checked + span { background: var(--accent, #54e0c7); }
.fab-switch input:checked + span::after { transform: translateX(20px); }

.fab-time { background: rgba(255, 255, 255, .08); color: var(--text, #f5f7ff); border: 1px solid rgba(255, 255, 255, .18); border-radius: 10px; padding: 8px 10px; font: inherit; }

.fab-btn {
    display: block; width: 100%; margin-top: 14px; padding: 13px; border: 0; border-radius: 14px;
    background: var(--accent, #54e0c7); color: #04201b; font: 800 1rem system-ui, sans-serif; cursor: pointer;
}

.fab-link { display: inline-block; margin: 2px 8px 2px 0; color: var(--accent, #54e0c7); font-weight: 700; font-size: .9rem; text-decoration: none; }

.fab-btn.ghost { background: rgba(255, 255, 255, .08); color: var(--text, #f5f7ff); font-weight: 700; }

.fab-prompt {
    margin: 12px auto 0; width: min(1180px, calc(100% - 40px));
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding: 12px 16px; border-radius: 16px; border: 1px solid rgba(84, 224, 199, .5); background: rgba(84, 224, 199, .1);
}

.fab-prompt p { margin: 0; flex: 1 1 200px; font-size: .92rem; line-height: 1.4; }
.fab-prompt button { border: 0; border-radius: 12px; padding: 9px 14px; font: 700 .9rem system-ui, sans-serif; cursor: pointer; }
.fab-prompt .yes { background: var(--accent, #54e0c7); color: #04201b; }
.fab-prompt .no { background: transparent; color: var(--muted, #aab3cf); }

/* ---------- the app should feel like an app, not a web page ---------- */

html.fab-native-app {
    -webkit-touch-callout: none;
    overscroll-behavior-y: none;
    -webkit-text-size-adjust: 100%;
}

html.fab-native-app * {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}

html.fab-native-app body {
    -webkit-user-select: none;
    user-select: none;
    animation: fab-enter .24s ease-out;
}

html.fab-native-app input,
html.fab-native-app textarea {
    -webkit-user-select: text;
    user-select: text;
}

@keyframes fab-enter { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* press feedback */
html.fab-native-app a:active,
html.fab-native-app button:active,
html.fab-native-app [role=button]:active {
    opacity: .72;
    transition: opacity .05s;
}

html.fab-native-app .fab-tab:active { transform: scale(.92); }

/* the app has no marketing page: it opens straight to progress and courses */
html.fab-native-app .hm-hero,
html.fab-native-app .hm-section,
html.fab-native-app .site-footer { display: none !important; }

/* lesson and unit pages are full screen, with no website header above them */
html.fab-native-app body.fab-immersive > .topbar { display: none; }
html.fab-native-app body.fab-immersive { padding-top: env(safe-area-inset-top); }

/* use the whole screen for unit pages, so diagrams and interactives can be big */
html.fab-native-app .module-page { width: 100%; padding: 0 0 24px; }

html.fab-native-app .module-shell {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    box-shadow: none;
    min-height: 100vh;
    padding: 12px 12px 20px;
}

html.fab-native-app .module-top { gap: 12px; padding-bottom: 14px; }
html.fab-native-app .module-slides { padding: 18px 0 28px; align-items: flex-start; }
html.fab-native-app .module-visual { padding: 10px; margin: 22px 0; border-radius: 18px; }
html.fab-native-app .module-visual.fd-sim { padding: 12px 10px 14px; }

html.fab-native-app .fd-sim canvas.fd-sim-canvas,
html.fab-native-app .fd-sim canvas.fd-wide {
    width: 100% !important;
    max-width: 100% !important;
}

html.fab-native-app .fd-sim .fd-sim-art { width: 100%; max-width: none; }
html.fab-native-app .fd-sim .fd-sim-title { font-size: .9rem; }
html.fab-native-app .fd-sim .fd-sim-note,
html.fab-native-app .fd-sim .fd-sim-formula { font-size: .95rem; line-height: 1.5; }
html.fab-native-app .fd-sim .fd-sim-big { font-size: 1.15rem; }
html.fab-native-app .fd-sim .fd-stat b { font-size: 1.3rem; }
html.fab-native-app .fd-sim button.fd-sim-btn { min-height: 44px; padding: 10px 14px; font-size: .95rem; }
html.fab-native-app .fd-q-options button { min-height: 48px; font-size: 1rem; }
html.fab-native-app .fd-sim input[type=range] { height: 36px; }

html.fab-native-app .module-visual.fet-diagram svg { width: 100%; height: auto; }

@media (min-width: 700px) {

    html.fab-native-app .module-page { width: min(980px, 100%); }

    html.fab-native-app .module-shell {
        border-radius: 24px;
        border: 1px solid var(--border);
        padding: 22px;
    }
}

html.fab-native-app .module-top { position: relative; }

html.fab-native-app .module-top .fab-share-btn { position: absolute; top: -4px; right: 0; margin: 0; }

html.fab-native-app .module-top .module-exit { padding-right: 52px; }

/* a compact progress dashboard on the home screen */
html.fab-native-app .progress-summary-section { padding-top: 6px; padding-bottom: 6px; }
html.fab-native-app .progress-header h1 { font-size: clamp(1.8rem, 8vw, 2.4rem); }
html.fab-native-app .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 10px; }
html.fab-native-app .stat-card { padding: 14px 10px; border-radius: 18px; }
html.fab-native-app .stat-card span { font-size: 1.5rem; }
html.fab-native-app .stat-card h2 { font-size: 1.7rem; margin: 4px 0; }
html.fab-native-app .stat-card p { font-size: .8rem; }

/* diagram labels are small SVG text: nudge them up on a phone held upright */
@media (max-width: 600px) {

    html.fab-native-app .fd-sim .fd-sim-art text { font-size: 8.5px !important; }
}

/* held sideways, the interactives fill the screen, so keep them from running taller than it */
@media (orientation: landscape) and (max-height: 520px) {

    html.fab-native-app .fd-sim .fd-sim-art,
    html.fab-native-app .fd-sim canvas.fd-sim-canvas,
    html.fab-native-app .fd-sim canvas.fd-wide {
        width: auto !important;
        max-width: 100% !important;
        max-height: 80vh;
        margin-left: auto;
        margin-right: auto;
    }
}

/* a gentle hint that a phone held sideways gives the interactives more room */
.fab-rotate-hint { display: none; }

html.fab-native-app .module-slide > p.fab-rotate-hint { margin: 14px 0 -18px; font-size: .78rem; line-height: 1.3; color: var(--muted, #aab3cf); text-align: center; }

@media (orientation: portrait) and (max-width: 600px) {

    html.fab-native-app .module-slide > p.fab-rotate-hint { display: block; }
}

/* the share button */
.fab-share-btn {
    flex: none; width: 40px; height: 40px; margin-left: 10px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%; border: 1px solid rgba(255, 255, 255, .18);
    background: rgba(255, 255, 255, .06); color: var(--accent, #54e0c7); cursor: pointer; padding: 0;
}

.fab-share-btn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
`;

        document.head.appendChild(style);
    }

    const ICONS = {
        learn: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
        games: '<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M8 10v5M5.5 12.5h5"/><circle cx="16" cy="11.5" r=".6"/><circle cx="18.2" cy="13.8" r=".6"/></svg>',
        practice: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/></svg>',
        progress: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>',
        more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>'
    };

    function pageKind() {

        const a = document.querySelector("nav a.active-nav");

        if (a) {

            const t = (a.textContent || "").trim().toLowerCase();

            if (["learn", "games", "practice", "progress"].indexOf(t) >= 0) { return t; }
        }

        const p = location.pathname.toLowerCase();

        if (p.indexOf("practice") >= 0) { return "practice"; }
        if (p.indexOf("game") >= 0) { return "games"; }
        if (p.indexOf("learn") >= 0) { return "learn"; }

        return "progress";
    }

    function buildTabBar() {

        // immersive lesson and unit pages have their own bottom controls
        if (!document.querySelector(".topbar") || document.querySelector(".lesson-page, .module-slides")) { return; }

        let links = {};

        document.querySelectorAll("nav a").forEach(function (a) {

            links[(a.textContent || "").trim().toLowerCase()] = a.getAttribute("href");
        });

        // on a course page remember which course the tabs belong to; on the home page reuse it
        if (links.learn && links.games && links.practice) {

            put("fabNativeLinks", JSON.stringify(links));

        } else {

            try { links = JSON.parse(store("fabNativeLinks", "{}")) || {}; } catch (e) { links = {}; }
        }

        const defs = [
            ["learn", "Learn", links.learn || "learn.html"],
            ["games", "Games", links.games || "games.html"],
            ["practice", "Practice", links.practice || "practice.html"],
            ["progress", "Progress", "index.html"]
        ];

        const active = pageKind();
        const bar = document.createElement("div");

        bar.className = "fab-tabbar";

        let html = '<div class="fab-tabbar-inner">';

        defs.forEach(function (d) {

            html += '<a class="fab-tab' + (d[0] === active ? " on" : "") + '" href="' + d[2] + '">' + ICONS[d[0]] + "<span>" + d[1] + "</span></a>";
        });

        html += '<button type="button" class="fab-tab" data-more>' + ICONS.more + "<span>More</span></button></div>";

        bar.innerHTML = html;
        document.body.appendChild(bar);
        document.body.classList.add("fab-has-tabs");

        bar.querySelector("[data-more]").addEventListener("click", openSheet);
    }

    let sheetBg = null;

    function fmtTime(s) {

        const t = s.split(":");

        return String(parseInt(t[0], 10)).padStart(2, "0") + ":" + String(parseInt(t[1], 10)).padStart(2, "0");
    }

    function shareProgress() {

        const xp = parseInt(store("fabPathXP", "0"), 10) || 0;
        const streak = parseInt(store("fabPathStreak", "0"), 10) || 0;

        if (!P.Share) { return; }

        P.Share.share({
            title: "Fab Path",
            text: "I'm learning how microchips get made on Fab Path: " + xp + " XP and a " + streak + "-day streak 🔥",
            url: "https://fab-path.com",
            dialogTitle: "Share your progress"
        }).catch(function () {});
    }

    function openSheet() {

        if (!sheetBg) {

            sheetBg = document.createElement("div");
            sheetBg.className = "fab-sheet-bg";

            sheetBg.innerHTML =
                '<div class="fab-sheet" role="dialog" aria-label="Fab Path settings">' +
                "<h2>Fab Path</h2>" +
                '<p class="sub" data-sub></p>' +
                '<div class="fab-row"><div><b>Daily study reminder</b><small data-remind-note>A notification at a time you choose, skipped on days you have already studied.</small></div>' +
                '<label class="fab-switch"><input type="checkbox" data-remind><span></span></label></div>' +
                '<div class="fab-row" data-time-row><div><b>Remind me at</b></div><input class="fab-time" type="time" data-time></div>' +
                '<div class="fab-row"><div><b>Haptic feedback</b><small>A tap on buttons, and a distinct buzz for right and wrong answers and rewards.</small></div>' +
                '<label class="fab-switch"><input type="checkbox" data-haptics><span></span></label></div>' +
                '<div class="fab-row"><div><b>Works offline</b><small>Every course is stored on this device, so you can study with no connection.</small></div></div>' +
                '<div class="fab-row"><div><b>Progress backup</b><small data-backup>Your streak, XP, and lessons are also saved in the device\'s own storage.</small></div></div>' +
                '<div class="fab-row"><div><b>Explore</b></div><div><a class="fab-link" href="index.html#courses">Courses</a> <a class="fab-link" href="careers.html">Careers</a> <a class="fab-link" href="about.html">About</a> <a class="fab-link" href="feedback.html">Feedback</a></div></div>' +
                '<button type="button" class="fab-btn" data-share>Share my progress</button>' +
                '<button type="button" class="fab-btn ghost" data-close>Done</button>' +
                "</div>";

            document.body.appendChild(sheetBg);

            sheetBg.addEventListener("click", function (e) {

                if (e.target === sheetBg) { sheetBg.classList.remove("open"); }
            });

            sheetBg.querySelector("[data-close]").addEventListener("click", function () { sheetBg.classList.remove("open"); });
            sheetBg.querySelector("[data-share]").addEventListener("click", shareProgress);

            const rem = sheetBg.querySelector("[data-remind]");
            const tm = sheetBg.querySelector("[data-time]");
            const hp = sheetBg.querySelector("[data-haptics]");
            const note = sheetBg.querySelector("[data-remind-note]");

            rem.addEventListener("change", function () {

                if (rem.checked) {

                    enableReminders().then(function (res) {

                        if (res === "granted") {

                            note.textContent = "Reminders are on. You will get one each day at " + fmtTime(store(KEY_REMIND_AT, "19:00")) + " if you have not studied yet.";

                        } else {

                            rem.checked = false;
                            note.textContent = res === "denied"
                                ? "Notifications are turned off for Fab Path. Turn them on in your device's Settings to get reminders."
                                : "Reminders are not available on this device.";
                        }

                        syncRows();
                    });

                } else {

                    disableReminders().then(function () {

                        note.textContent = "Reminders are off.";
                        syncRows();
                    });
                }
            });

            tm.addEventListener("change", function () {

                if (tm.value) {

                    put(KEY_REMIND_AT, tm.value);
                    schedule();
                }
            });

            hp.addEventListener("change", function () {

                put(KEY_HAPTICS, hp.checked ? "1" : "0");

                if (hp.checked) { buzz("success"); }
            });
        }

        syncRows();
        sheetBg.classList.add("open");
    }

    function syncRows() {

        if (!sheetBg) { return; }

        const xp = parseInt(store("fabPathXP", "0"), 10) || 0;
        const streak = parseInt(store("fabPathStreak", "0"), 10) || 0;

        sheetBg.querySelector("[data-sub]").textContent = "🔥 " + streak + "-day streak · ⚡ " + xp + " XP";
        sheetBg.querySelector("[data-remind]").checked = remindersOn();
        sheetBg.querySelector("[data-time]").value = fmtTime(store(KEY_REMIND_AT, "19:00"));
        sheetBg.querySelector("[data-time-row]").style.display = remindersOn() ? "" : "none";
        sheetBg.querySelector("[data-haptics]").checked = hapticsOn();

        if (P.Preferences) {

            P.Preferences.get({ key: BACKUP_AT_KEY }).then(function (r) {

                if (r && r.value) {

                    sheetBg.querySelector("[data-backup]").textContent = "Your streak, XP, and lessons are also saved in the device's own storage. Last saved " + new Date(parseInt(r.value, 10)).toLocaleString() + ".";
                }

            }).catch(function () {});
        }
    }


    /* ---------- first-run invitation to turn on reminders ---------- */

    function maybePrompt() {

        if (store(KEY_PROMPTED, "0") === "1" || remindersOn() || !P.LocalNotifications) { return; }

        const header = document.querySelector(".topbar");

        if (!header || !document.querySelector(".learn-page, .games-page, .practice-page, main")) { return; }

        // wait until the learner has seen the app a moment
        setTimeout(function () {

            if (document.getElementById("fabPrompt")) { return; }

            const box = document.createElement("div");

            box.className = "fab-prompt";
            box.id = "fabPrompt";
            box.innerHTML = '<p>🔔 Want a daily nudge to keep your streak going? Reminders skip the days you have already studied.</p><button type="button" class="yes">Turn on</button><button type="button" class="no">Not now</button>';

            header.insertAdjacentElement("afterend", box);

            box.querySelector(".yes").addEventListener("click", function () {

                put(KEY_PROMPTED, "1");
                box.remove();
                openSheet();
                sheetBg.querySelector("[data-remind]").checked = true;
                sheetBg.querySelector("[data-remind]").dispatchEvent(new Event("change"));
            });

            box.querySelector(".no").addEventListener("click", function () {

                put(KEY_PROMPTED, "1");
                box.remove();
            });

        }, 4000);
    }


    /* ---------- share the certificate with the system share sheet ---------- */

    function wireCertificateShare() {

        function ensure() {

            const hint = document.getElementById("fabCertNativeHint");
            const actions = document.querySelector(".cert-actions");
            const img = document.getElementById("fabCertImage");

            if (!hint || !actions || !img || document.getElementById("fabCertShareButton")) { return; }

            hint.hidden = true;

            const btn = document.createElement("button");

            btn.type = "button";
            btn.id = "fabCertShareButton";
            btn.className = "start-button";
            btn.textContent = "Share certificate";

            btn.addEventListener("click", function () {

                const src = img.src || "";
                const b64 = src.split(",")[1];

                if (!b64 || !P.Share) { return; }

                const text = "I finished a course on Fab Path 🎓";

                if (P.Filesystem) {

                    P.Filesystem.writeFile({ path: "fab-path-certificate.png", data: b64, directory: "CACHE" }).then(function (res) {

                        return P.Share.share({ title: "Fab Path certificate", text: text, files: [res.uri], dialogTitle: "Share your certificate" });

                    }).catch(function () {});

                } else {

                    P.Share.share({ title: "Fab Path certificate", text: text, url: "https://fab-path.com" }).catch(function () {});
                }
            });

            actions.insertBefore(btn, actions.firstChild);
        }

        new MutationObserver(ensure).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] });
    }



    /* ---------- the share button ---------- */

    function shareThisPage() {

        if (!P.Share) { return; }

        const file = (location.pathname.split("/").pop() || "index.html");
        const url = "https://fab-path.com/" + (file === "index.html" ? "" : file);
        const title = (document.title || "Fab Path").replace(/\s*\|\s*Fab Path\s*$/, "");

        P.Share.share({
            title: title,
            text: "I'm learning " + title + " on Fab Path, a free interactive course on how microchips get made.",
            url: url,
            dialogTitle: "Share"
        }).catch(function () {});
    }

    function addShareButtons() {

        const slots = [
            document.querySelector(".topbar .user-stats"),
            document.querySelector(".module-top")
        ];

        slots.forEach(function (slot) {

            if (!slot || slot.querySelector(".fab-share-btn")) { return; }

            const b = document.createElement("button");

            b.type = "button";
            b.className = "fab-share-btn";
            b.setAttribute("aria-label", "Share");
            b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
            b.addEventListener("click", shareThisPage);

            slot.appendChild(b);
        });
    }

    function markImmersive() {

        if (document.querySelector(".module-slides, .lesson-page")) {
            document.body.classList.add("fab-immersive");
        }
    }


    function addRotateHints() {

        document.querySelectorAll(".module-visual.fd-sim").forEach(function (sim) {

            const prev = sim.previousElementSibling;

            if (prev && prev.classList.contains("fab-rotate-hint")) { return; }

            const hint = document.createElement("p");

            hint.className = "fab-rotate-hint";
            hint.textContent = "↻ Turn your phone sideways for a bigger view";

            sim.parentNode.insertBefore(hint, sim);
        });
    }

    /* ---------- start up ---------- */

    function boot() {

        injectStyles();
        wireHaptics();
        markImmersive();
        buildTabBar();
        addShareButtons();
        addRotateHints();
        wireCertificateShare();
        maybePrompt();
        backup();

        // keep the backup current and the reminders accurate as the app comes and goes
        setInterval(backup, 30000);
        window.addEventListener("pagehide", backup);
        document.addEventListener("visibilitychange", function () { if (document.hidden) { backup(); } });

        if (P.App) {

            P.App.addListener("appStateChange", function (state) {

                backup();
                schedule();

                if (state && state.isActive) { syncRows(); }
            });
        }

        if (P.LocalNotifications) {

            P.LocalNotifications.addListener("localNotificationActionPerformed", function () {

                location.href = learnHref();
            });

            schedule();
        }
    }

    restoreIfEmpty().then(function (reloading) {

        if (reloading) { return; }

        if (document.readyState === "loading") {

            document.addEventListener("DOMContentLoaded", boot);

        } else {

            boot();
        }
    });

})();
