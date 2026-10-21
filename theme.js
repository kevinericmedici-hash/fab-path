/* ========================================
   FAB PATH: LIGHT / DARK THEME

   Loaded in <head> on every page, right after security.js, so the
   saved theme is applied before anything is drawn (no dark flash).

   Dark is the default. The choice is kept in localStorage under
   "fabTheme" ("light" or "dark") and a sun / moon button is added to
   the top bar. The light colors live in theme-light.css.
======================================== */

(function () {

    const KEY = "fabTheme";
    const root = document.documentElement;

    function saved() {

        try {

            return localStorage.getItem(KEY) === "light" ? "light" : "dark";

        } catch (e) {

            return "dark";
        }
    }

    function apply(theme) {

        if (theme === "light") {

            root.setAttribute("data-theme", "light");

        } else {

            root.removeAttribute("data-theme");
        }

        const button = document.getElementById("fabThemeToggle");

        if (button) {

            const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

            button.setAttribute("aria-label", label);
            button.setAttribute("title", label);
            button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
        }
    }

    apply(saved());

    function addButton() {

        if (document.getElementById("fabThemeToggle")) { return; }

        const bar = document.querySelector(".topbar");

        if (!bar) { return; }

        const button = document.createElement("button");

        button.type = "button";
        button.id = "fabThemeToggle";
        button.className = "theme-toggle";
        button.innerHTML =
            '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>' +
            '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/>' +
            '<path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';

        button.addEventListener("click", function () {

            const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";

            try { localStorage.setItem(KEY, next); } catch (e) { /* private mode: still switch for this page */ }

            apply(next);
        });

        const stats = bar.querySelector(".user-stats");

        if (stats) {

            stats.insertBefore(button, stats.firstChild);

        } else {

            bar.appendChild(button);
        }

        apply(saved());

        // The dropdown site menu lives in its own file; every page with a top bar gets it from here.
        if (!document.getElementById("fabSiteNav")) {

            const nav = document.createElement("script");

            nav.id = "fabSiteNav";
            nav.src = "site-nav.js";
            document.head.appendChild(nav);
        }
    }

    // keep every open tab in step
    window.addEventListener("storage", function (e) {

        if (e.key === KEY) { apply(saved()); }
    });

    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", addButton);

    } else {

        addButton();
    }

}());
