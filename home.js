/* ========================================
   HOMEPAGE: START HERE DOORS

   Three "doors" filter the course catalog down to a few courses so
   new visitors are not faced with every course at once. The progress
   cards only appear once someone has started a lesson.
======================================== */

(function () {

    "use strict";

    const DOORS = {
        chips: ["chip-learn.html", "learn.html"],
        body: ["fet-learn.html", "glu-learn.html", "nt-learn.html", "bbb-learn.html"],
        future: ["supercap-learn.html", "qc-learn.html"]
    };

    function cards() {

        const grid = document.getElementById("courseCatalogGrid");

        return grid ? Array.prototype.slice.call(grid.children) : [];
    }

    function choose(id, scroll) {

        const door = DOORS[id];
        const button = document.querySelector('.hm-door[data-door="' + id + '"] b');
        const title = document.getElementById("hmCatalogTitle");
        const all = document.getElementById("hmShowAll");

        document.querySelectorAll(".hm-door").forEach(function (b) {

            b.setAttribute("aria-pressed", b.getAttribute("data-door") === id ? "true" : "false");
        });

        cards().forEach(function (c) {

            const href = c.getAttribute("href");

            c.hidden = Boolean(door) && door.indexOf(href) === -1;
        });

        // the catalog heading repeats the door's own label
        if (title) { title.textContent = door && button ? button.textContent : "All courses"; }
        if (all) { all.hidden = !door; }

        if (scroll) {

            const target = document.getElementById("courses");

            if (target) { target.scrollIntoView({ behavior: "smooth", block: "start" }); }
        }
    }

    function showProgress() {

        const section = document.getElementById("progressSection");

        if (!section) { return; }

        const xp = parseInt((document.getElementById("progressXP") || {}).textContent, 10) || 0;
        const done = parseInt((document.getElementById("lessonsCompleted") || {}).textContent, 10) || 0;

        section.hidden = xp + done === 0;
    }

    function init() {

        document.querySelectorAll(".hm-door").forEach(function (b) {

            b.addEventListener("click", function () {

                const id = b.getAttribute("data-door");

                choose(b.getAttribute("aria-pressed") === "true" ? null : id, true);
            });
        });

        const all = document.getElementById("hmShowAll");

        if (all) { all.addEventListener("click", function () { choose(null, false); }); }

        // script.js fills the stats on load; check after it has run
        showProgress();
        setTimeout(showProgress, 400);
    }

    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }

}());
