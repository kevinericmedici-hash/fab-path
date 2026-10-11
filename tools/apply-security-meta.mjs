/* ========================================
   Stamps every HTML page with a Content-Security-Policy and a
   referrer policy, as <meta> tags.

   Why a script: GitHub Pages cannot send custom response headers, so
   the policy has to live in each page. Inline <script> blocks are
   allowed only by their SHA-256 hash, so an attacker who finds an
   HTML-injection bug still cannot run their own script.

   Usage (from the repo root):
       node tools/apply-security-meta.mjs          rewrite the pages
       node tools/apply-security-meta.mjs --check  exit 1 if any page is stale

   Run it again whenever an inline <script> changes, and CI runs it with
   --check so a stale hash fails the build instead of breaking a page.
======================================== */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

// Where the site is allowed to talk to. Keep this list short.
const SUPABASE = "https://xcftpdlniahvxpxtkdaq.supabase.co";
const PWNED = "https://api.pwnedpasswords.com";          // leaked-password check (k-anonymity)
const TURNSTILE = "https://challenges.cloudflare.com";   // optional bot check on sign-in

function policy(hashes) {

    const scripts = ["'self'"].concat(hashes.map(function (h) { return "'sha256-" + h + "'"; }), TURNSTILE);

    return [
        "default-src 'self'",
        "script-src " + scripts.join(" "),
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "media-src 'self' blob:",
        "connect-src 'self' " + SUPABASE + " " + PWNED + " " + TURNSTILE,
        "frame-src " + TURNSTILE,
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ].join("; ");
}

// The HTML parser turns CRLF into LF before a script is hashed, so do the same.
function normalize(text) {

    return text.replace(/\r\n?/g, "\n");
}

function inlineHashes(html) {

    const out = new Set();

    for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {

        const attrs = m[1] || "";

        if (/\bsrc\s*=/i.test(attrs)) { continue; }                 // external file: covered by 'self'
        if (/type\s*=\s*["']?application\/(ld\+)?json/i.test(attrs)) { continue; }   // data, never executed

        out.add(createHash("sha256").update(normalize(m[2]), "utf8").digest("base64"));
    }

    return Array.from(out).sort();
}

const META_RE = /[ \t]*<meta http-equiv="Content-Security-Policy"[^>]*>\r?\n?[ \t]*<meta name="referrer"[^>]*>\r?\n?(?:[ \t]*<script src="security\.js"><\/script>\r?\n?)?/i;

let changed = 0;
let total = 0;

for (const file of readdirSync(ROOT).filter(function (f) { return f.endsWith(".html"); })) {

    const path = join(ROOT, file);
    const html = readFileSync(path, "utf8");
    const nl = html.includes("\r\n") ? "\r\n" : "\n";

    // Hash the page without our own tags, so the result does not depend on them.
    const bare = html.replace(META_RE, "");
    const tags =
        '    <meta http-equiv="Content-Security-Policy" content="' + policy(inlineHashes(bare)) + '">' + nl +
        '    <meta name="referrer" content="strict-origin-when-cross-origin">' + nl +
        '    <script src="security.js"></script>' + nl;

    let next;

    if (META_RE.test(html)) {

        next = html.replace(META_RE, tags);

    } else {

        const charset = /(<meta charset=[^>]*>\r?\n)/i;

        next = charset.test(html)
            ? html.replace(charset, "$1" + tags)
            : html.replace(/<head>\r?\n?/i, "<head>" + nl + tags);
    }

    total++;

    if (next !== html) {

        changed++;

        if (!CHECK) { writeFileSync(path, next, "utf8"); }
    }
}

if (CHECK) {

    if (changed) {

        console.error(changed + " of " + total + " pages have a stale or missing security policy. Run: node tools/apply-security-meta.mjs");
        process.exit(1);
    }

    console.log("All " + total + " pages have an up-to-date security policy.");

} else {

    console.log("Updated " + changed + " of " + total + " pages.");
}
