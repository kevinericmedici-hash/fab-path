/* ========================================
   Builds theme-light.css: the light version of the site.

   The site was designed dark, and many colors are written straight
   into the stylesheets. Rather than keep a second hand-made copy in
   sync, this reads every rule that sets a color and writes a matching
   rule for html[data-theme="light"] with the colors swapped:

     - page and panel backgrounds become white and pale gray
     - white text becomes dark slate, bright accents get darker so
       they stay readable on white
     - faint white borders and tints become faint dark ones

   Diagrams, sims, 3D scenes and the Virtual Fab Labs draw their own
   colors in JavaScript, so they are left as dark "screens" set into
   the light page (see KEEP_DARK below).

   Usage (from the repo root):
       node tools/build-light-theme.mjs                 rewrite theme-light.css
       node tools/build-light-theme.mjs --skip tutor    leave out rules whose
                                                        selector mentions "tutor"

   Run it again whenever a stylesheet's colors change.
======================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const skipIndex = process.argv.indexOf("--skip");
const SKIP = skipIndex > -1 ? new RegExp(process.argv[skipIndex + 1], "i") : null;

const LIGHT = 'html[data-theme="light"]';

// Containers that stay dark in light mode. Everything inside them keeps
// its original colors.
const KEEP_DARK = [".module-visual:not(.module-visual-text)", ".lab-app"];
const NOT_DARK = ":not(" + KEEP_DARK.join(", ") + ", " + KEEP_DARK.map(function (s) { return s + " *"; }).join(", ") + ")";

const SHEETS = ["style.css", "lab.css", "lab-editor.css", "chip-lab.css", "lab-anim.css"];

// Styles that scripts inject at runtime: [file, element id of the <style>]
const SCRIPT_STYLES = ["native-app.js", "account.js"];


/* ---------- color math ---------- */

const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1] };

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;

function parseColor(text) {

    const t = text.toLowerCase();

    if (NAMED[t]) { return NAMED[t].slice(); }

    if (t[0] === "#") {

        let h = t.slice(1);

        if (h.length === 3 || h.length === 4) { h = h.split("").map(function (c) { return c + c; }).join(""); }

        if (h.length !== 6 && h.length !== 8) { return null; }

        return [
            parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16),
            h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
        ];
    }

    const parts = t.replace(/rgba?\(|\)/g, "").split(/[\s,/]+/).filter(Boolean);

    if (parts.length < 3) { return null; }

    const n = parts.map(function (p) { return p.endsWith("%") ? parseFloat(p) / 100 : parseFloat(p); });

    return [n[0], n[1], n[2], parts.length > 3 ? n[3] : 1];
}

function format(c) {

    const r = Math.round(c[0]), g = Math.round(c[1]), b = Math.round(c[2]);
    const a = Math.round(Math.min(1, Math.max(0, c[3])) * 1000) / 1000;

    if (a >= 1) {

        return "#" + [r, g, b].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("");
    }

    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

function luminance(c) {

    const ch = c.slice(0, 3).map(function (v) {

        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function saturation(c) {

    const max = Math.max(c[0], c[1], c[2]), min = Math.min(c[0], c[1], c[2]);

    return max === 0 ? 0 : (max - min) / max;
}

function toHsl(c) {

    const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {

        const d = max - min;

        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        if (max === r) { h = (g - b) / d + (g < b ? 6 : 0); }
        else if (max === g) { h = (b - r) / d + 2; }
        else { h = (r - g) / d + 4; }

        h /= 6;
    }

    return [h, s, l];
}

function fromHsl(h, s, l, a) {

    function hue(p, q, t) {

        if (t < 0) { t += 1; }
        if (t > 1) { t -= 1; }
        if (t < 1 / 6) { return p + (q - p) * 6 * t; }
        if (t < 1 / 2) { return q; }
        if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
        return p;
    }

    if (s === 0) { return [l * 255, l * 255, l * 255, a]; }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255, a];
}

function isAccent(c) {

    // the teal brand color (#54e0c7, #2ebfa5 and their tints)
    return Math.abs(c[0] - 84) + Math.abs(c[1] - 224) + Math.abs(c[2] - 199) < 40 ||
        Math.abs(c[0] - 46) + Math.abs(c[1] - 191) + Math.abs(c[2] - 165) < 40;
}

const INK = [15, 23, 42];          // dark slate, the light theme's "white"
const TEAL = [20, 184, 166];       // accent that holds up on white
const TEAL_TEXT = [15, 118, 110];  // accent dark enough for text


/* ---------- one color, by the job it does ---------- */

function mapText(c) {

    if (isAccent(c)) { return TEAL_TEXT.concat(c[3]); }

    const lum = luminance(c);

    if (saturation(c) < 0.25) {

        if (lum > 0.6) { return INK.concat(c[3]); }
        if (lum > 0.15) { return [75, 86, 113, c[3]]; }   // muted gray text
        return c;                                          // already dark
    }

    if (lum > 0.25) {

        const hsl = toHsl(c);

        return fromHsl(hsl[0], Math.min(hsl[1], 0.85), Math.min(hsl[2], 0.36), c[3]);
    }

    return c;
}

function mapBackground(c, selector) {

    const lum = luminance(c);
    const sat = saturation(c);

    if (isAccent(c)) {

        return c[3] < 0.5 ? TEAL.concat(Math.min(c[3] * 1.3, 1)) : c;
    }

    if (sat < 0.25 && lum > 0.6) {

        // faint white tint over dark becomes faint ink over light
        return c[3] < 0.5 ? INK.concat(Math.min(c[3] * 1.15, 0.5)) : c;
    }

    if (lum < 0.06) {

        if (/backdrop|overlay|sheet-bg|scrim|-bg\b/.test(selector)) { return c; }

        if (c[0] + c[1] + c[2] === 0) { return c; }       // pure black: leave

        if (c[3] < 1) { return [255, 255, 255, Math.min(c[3] + 0.25, 1)]; }

        return lum < 0.012 ? [244, 246, 251, 1] : [255, 255, 255, 1];
    }

    if (c[3] < 0.4) { return c.slice(0, 3).concat(Math.min(c[3] * 1.4, 1)); }

    return c;
}

function mapLine(c) {

    const lum = luminance(c);

    if (isAccent(c)) { return TEAL.concat(Math.min(c[3] * 1.2, 1)); }

    if (saturation(c) < 0.25 && lum > 0.6) {

        return c[3] < 1 ? INK.concat(Math.min(Math.max(c[3] * 1.4, 0.06), 0.9)) : [216, 222, 233, 1];
    }

    if (lum < 0.06 && c[3] >= 0.9) { return [216, 222, 233, 1]; }

    return c;
}

function mapShadow(c) {

    if (isAccent(c)) { return c; }

    if (luminance(c) < 0.06 || (saturation(c) < 0.25 && luminance(c) > 0.6)) {

        return INK.concat(Math.round(c[3] * 0.35 * 1000) / 1000);
    }

    return c;
}


/* ---------- declarations ---------- */

function roleOf(prop, value) {

    if (/^(color|fill|stroke|caret-color|-webkit-text-fill-color|text-decoration-color)$/.test(prop)) { return "text"; }
    if (/^background(-color|-image)?$/.test(prop)) { return "background"; }
    if (/^(border|outline|column-rule)(-|$)/.test(prop) && !/radius|width|style|collapse|spacing|image-(slice|width|outset|repeat)/.test(prop)) { return "line"; }
    if (/^(box-shadow|text-shadow)$/.test(prop)) { return "shadow"; }
    if (prop === "filter" && /drop-shadow/.test(value)) { return "shadow"; }
    if (prop.startsWith("--") && (COLOR_RE.test(value) || /var\(/.test(value))) {

        COLOR_RE.lastIndex = 0;

        // guess the job from the variable's name
        if (/bg|background|panel|fill|surface/.test(prop)) { return "background"; }
        if (/text|ink|fg|label|color/.test(prop)) { return "text"; }

        return "line";
    }

    return null;
}

function mapValue(prop, value, role, selector) {

    if (/^url\(\s*["']?data:/i.test(value.trim()) && !/gradient/.test(value)) { return value; }

    let out = value;

    if (role === "text") {

        out = out.replace(/var\(--accent(-dark)?([,)])/g, "var(--accent-text$2").replace(/var\(--copper([,)])/g, "var(--copper-text$1");
    }

    // leave colors inside data: URLs (inline SVG icons) alone
    const pieces = out.split(/(url\([^)]*\))/);

    return pieces.map(function (piece) {

        if (/^url\(/.test(piece)) { return piece; }

        return piece.replace(COLOR_RE, function (m) {

            const c = parseColor(m);

            if (!c) { return m; }

            const fn = role === "text" ? mapText : role === "background" ? function (x) { return mapBackground(x, selector); } : role === "shadow" ? mapShadow : mapLine;

            return format(fn(c));
        });

    }).join("");
}


/* ---------- selectors ---------- */

function splitTopLevel(text, sep) {

    const out = [];
    let depth = 0, cur = "", quote = null;

    for (const ch of text) {

        if (quote) { cur += ch; if (ch === quote) { quote = null; } continue; }
        if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
        if (ch === "(" || ch === "[") { depth++; }
        if (ch === ")" || ch === "]") { depth--; }
        if (ch === sep && depth === 0) { out.push(cur); cur = ""; continue; }

        cur += ch;
    }

    out.push(cur);

    return out;
}

function lightSelector(sel) {

    let s = sel.trim().replace(/^:root\b/, "html");

    // put the exclusion before any pseudo-element on the last part
    const pe = s.match(/(::?(before|after|placeholder|selection|marker|-webkit-[a-z-]+|-moz-[a-z-]+|first-letter|first-line|backdrop))+$/);
    const tail = pe ? pe[0] : "";
    let head = pe ? s.slice(0, -tail.length) : s;

    const isRoot = /^html(?![\w-])/.test(head) && !/\s/.test(head);

    if (!isRoot) { head += NOT_DARK; }

    if (/^html(?![\w-])/.test(head)) {

        return head.replace(/^html/, LIGHT) + tail;
    }

    return LIGHT + " " + head + tail;
}


/* ---------- a small CSS reader ---------- */

function stripComments(css) {

    return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Returns a list of { type: "rule", selector, body } and { type: "at", prelude, children }
function parse(css) {

    const items = [];
    let i = 0;

    function readBlock() {

        // i is just after "{". Returns the inner text and moves i past the matching "}".
        let depth = 1, start = i, quote = null;

        while (i < css.length && depth > 0) {

            const ch = css[i];

            if (quote) { if (ch === quote && css[i - 1] !== "\\") { quote = null; } }
            else if (ch === '"' || ch === "'") { quote = ch; }
            else if (ch === "{") { depth++; }
            else if (ch === "}") { depth--; }

            i++;
        }

        return css.slice(start, i - 1);
    }

    while (i < css.length) {

        const open = css.indexOf("{", i);

        if (open < 0) { break; }

        const prelude = css.slice(i, open).replace(/^[\s;]*(@(import|charset)[^;]*;\s*)*/, "").trim();

        i = open + 1;

        const body = readBlock();

        if (prelude.startsWith("@")) {

            if (/^@(media|supports|container|layer)\b/.test(prelude)) {

                items.push({ type: "at", prelude: prelude, children: parse(body) });
            }
            // @keyframes, @font-face and the rest carry no themable rules

        } else {

            items.push({ type: "rule", selector: prelude, body: body });
        }
    }

    return items;
}

function declarations(body) {

    return splitTopLevel(body, ";").map(function (d) {

        const colon = d.indexOf(":");

        if (colon < 0) { return null; }

        return { prop: d.slice(0, colon).trim().toLowerCase(), value: d.slice(colon + 1).trim() };

    }).filter(function (d) { return d && d.prop && d.value; });
}

function emit(items, indent) {

    const out = [];

    for (const item of items) {

        if (item.type === "at") {

            const inner = emit(item.children, indent + "    ");

            if (inner.length) { out.push(indent + item.prelude + " {\n" + inner.join("\n") + "\n" + indent + "}"); }

            continue;
        }

        if (SKIP && SKIP.test(item.selector)) { continue; }

        const decls = [];

        for (const d of declarations(item.body)) {

            const role = roleOf(d.prop, d.value);

            // background-size, -clip, -position... ride along unchanged, so a
            // restated "background:" shorthand doesn't reset them
            if (!role && /^(-webkit-)?background-/.test(d.prop)) {

                decls.push(indent + "    " + d.prop + ": " + d.value + ";");
                continue;
            }

            if (!role) { continue; }

            // the page background and the palette are set by hand in BASE
            if (role === "background" && /^\s*(html|body)\s*$/.test(item.selector)) { continue; }
            if (d.prop.startsWith("--") && /^\s*(:root|html)\s*$/.test(item.selector)) { continue; }

            decls.push(indent + "    " + d.prop + ": " + mapValue(d.prop, d.value, role, item.selector) + ";");
        }

        if (!decls.length) { continue; }

        const selectors = splitTopLevel(item.selector, ",").map(lightSelector);

        out.push(indent + selectors.join(",\n" + indent) + " {\n" + decls.join("\n") + "\n" + indent + "}");
    }

    return out;
}


/* ---------- the theme itself ---------- */

const HEADER = `/* ========================================
   FAB PATH: LIGHT THEME

   Generated by tools/build-light-theme.mjs. Don't edit the generated
   part by hand: change the stylesheets (or the base block in the
   script) and run  node tools/build-light-theme.mjs  again.

   Applies when <html data-theme="light">, set by theme.js.
======================================== */
`;

const BASE = `
/* ---------- palette ---------- */

${LIGHT} {
    color-scheme: light;
    --bg: #f4f6fb;
    --panel: #ffffff;
    --panel-light: #eef2f8;
    --text: #0f172a;
    --muted: #4b5671;
    --accent: #14b8a6;
    --accent-dark: #0d9488;
    --accent-text: #0f766e;
    --accent-soft: rgba(20, 184, 166, 0.14);
    --copper: #f59e0b;
    --copper-text: #b45309;
    --border: rgba(15, 23, 42, 0.12);
    --shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
}

${LIGHT} body {
    background:
        radial-gradient(circle at top right, rgba(20, 184, 166, 0.10), transparent 34%),
        radial-gradient(circle at bottom left, rgba(245, 158, 11, 0.06), transparent 30%),
        linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px),
        linear-gradient(135deg, #f7f9fc, #eef2f8);
    background-size: auto, auto, 56px 56px, 56px 56px, auto;
}

/* ---------- diagrams, sims and labs stay dark ---------- */

${LIGHT} ${KEEP_DARK.join(`,\n${LIGHT} `)} {
    color-scheme: dark;
    --bg: #0b1020;
    --panel: #141a2e;
    --panel-light: #1b2340;
    --text: #f5f7ff;
    --muted: #aab3cf;
    --accent: #54e0c7;
    --accent-dark: #2ebfa5;
    --accent-text: #54e0c7;
    --accent-soft: rgba(84, 224, 199, 0.12);
    --copper: #ffb86b;
    --copper-text: #ffb86b;
    --border: rgba(255, 255, 255, 0.08);
    --shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    color: #f5f7ff;
}

${LIGHT} ${KEEP_DARK[0]} {
    background:
        radial-gradient(circle at top right, rgba(84, 224, 199, 0.10), transparent 40%),
        linear-gradient(135deg, #0e1426, #141c33);
    border-color: rgba(15, 23, 42, 0.18);
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
}

/* ---------- the light / dark switch (added by theme.js) ---------- */

.theme-toggle {
    display: inline-grid;
    place-items: center;
    width: 38px;
    height: 38px;
    flex: none;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}

.theme-toggle:hover {
    border-color: var(--accent);
}

.theme-toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

.theme-toggle svg {
    width: 19px;
    height: 19px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.theme-toggle .sun { display: none; }
${LIGHT} .theme-toggle .sun { display: block; }
${LIGHT} .theme-toggle .moon { display: none; }
`;

// Hand-tuned fixes that the automatic swap can't get right. Emitted last,
// with the same selector shape as the generated rules, so they win.
const FIXES = [
    [".hm-hero h1 span", "background-image: linear-gradient(90deg, #0f766e, #0d9488 55%, #b45309); -webkit-background-clip: text; background-clip: text;"]
];

function fixes() {

    return FIXES.map(function (f) {

        return lightSelector(f[0]) + " {\n    " + f[1].split(/;\s*/).filter(Boolean).join(";\n    ") + ";\n}";

    }).join("\n\n");
}

function scriptCss(file) {

    const js = readFileSync(join(ROOT, file), "utf8");
    const out = [];
    const re = /\.textContent\s*=\s*`([\s\S]*?)`/g;
    let m;

    while ((m = re.exec(js))) {

        if (m[1].includes("{")) { out.push(m[1]); }
    }

    // account.js builds its CSS from "..." + "..." pieces
    const joined = /style\.textContent\s*=\s*("[\s\S]*?");\s*\n/g;

    while ((m = joined.exec(js))) {

        const pieces = m[1].match(/"((?:[^"\\]|\\.)*)"/g) || [];

        out.push(pieces.map(function (p) { return p.slice(1, -1).replace(/\\"/g, '"'); }).join(""));
    }

    return out.join("\n");
}

const parts = [HEADER, BASE];

for (const sheet of SHEETS) {

    const rules = emit(parse(stripComments(readFileSync(join(ROOT, sheet), "utf8"))), "");

    if (rules.length) { parts.push("\n/* ---------- from " + sheet + " ---------- */\n\n" + rules.join("\n\n") + "\n"); }
}

for (const file of SCRIPT_STYLES) {

    const css = scriptCss(file);
    const rules = css ? emit(parse(stripComments(css)), "") : [];

    if (rules.length) { parts.push("\n/* ---------- from styles injected by " + file + " ---------- */\n\n" + rules.join("\n\n") + "\n"); }
}

parts.push("\n/* ---------- hand-tuned fixes ---------- */\n\n" + fixes() + "\n");

writeFileSync(join(ROOT, "theme-light.css"), parts.join(""));

console.log("theme-light.css written");
