/* ========================================
   Copies the Fab Path site's runtime files
   from the repo root into mobile/www/, so
   Capacitor bundles a real snapshot of the
   site (offline-capable) instead of pointing
   at the live URL.

   Uses an allowlist of runtime file types at
   the repo root, plus fonts/ recursively, so
   it naturally skips repo-management files
   (README.md, CNAME, robots.txt, sitemap.xml,
   supabase-setup.sql, .git, .claude, mobile/
   itself) without hardcoding exceptions, and
   automatically picks up new pages as they're
   added to the site.
======================================== */

import { readdirSync, statSync, mkdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const MOBILE_DIR = fileURLToPath(new URL("..", import.meta.url));
const ROOT_DIR = join(MOBILE_DIR, "..");
const WWW_DIR = join(MOBILE_DIR, "www");

const ROOT_EXTENSIONS = new Set([
    ".html", ".css", ".js",
    ".png", ".jpg", ".jpeg", ".svg", ".ico",
    ".woff", ".woff2", ".ttf"
]);

const RECURSIVE_DIRS = ["fonts"];


function copyDirRecursive(srcDir, destDir) {

    mkdirSync(destDir, { recursive: true });

    for (const name of readdirSync(srcDir)) {

        const srcPath = join(srcDir, name);
        const destPath = join(destDir, name);

        if (statSync(srcPath).isDirectory()) {

            copyDirRecursive(srcPath, destPath);

        } else {

            copyFileSync(srcPath, destPath);
        }
    }
}


function main() {

    /* Clear the folder's CONTENTS rather than removing the folder
       itself: on Windows, a sync client (OneDrive etc.) watching
       mobile/www/ can hold a handle on the directory node that
       makes rmdir-then-recreate fail with EPERM, even though the
       files inside it are free to delete and replace. */

    mkdirSync(WWW_DIR, { recursive: true });

    for (const name of readdirSync(WWW_DIR)) {

        rmSync(join(WWW_DIR, name), {
            recursive: true,
            force: true,
            maxRetries: 10,
            retryDelay: 300
        });
    }

    let fileCount = 0;

    for (const name of readdirSync(ROOT_DIR)) {

        const srcPath = join(ROOT_DIR, name);

        if (!statSync(srcPath).isFile()) {

            continue;
        }

        if (!ROOT_EXTENSIONS.has(extname(name).toLowerCase())) {

            continue;
        }

        copyFileSync(srcPath, join(WWW_DIR, name));
        fileCount++;
    }

    for (const dirName of RECURSIVE_DIRS) {

        const srcPath = join(ROOT_DIR, dirName);

        if (existsSync(srcPath)) {

            copyDirRecursive(srcPath, join(WWW_DIR, dirName));
        }
    }

    console.log(`Synced ${fileCount} root files + ${RECURSIVE_DIRS.join(", ")} into mobile/www/`);
}

main();
