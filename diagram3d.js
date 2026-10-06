/* ========================================
   3D LOOK FOR COURSE DIAGRAMS

   Loaded by script.js on any page that has a
   .module-visual. It upgrades every inline SVG
   diagram (.module-visual.fet-diagram) with:
     - soft shading, so panels read as slabs and
       dots and cells read as spheres
     - a drop shadow that lifts the drawing off
       the page
     - a 3D rise-in whenever its slide appears
     - a pointer tilt, with labels floating a
       little above the drawing as it moves
   and gives the large emoji icons the same
   treatment. Nothing in the diagrams' own SVG
   needs to change. Respects reduced-motion.
======================================== */

(function () {

    if (window.__fabDiagram3D) {
        return;
    }

    window.__fabDiagram3D = true;

    const NS = "http://www.w3.org/2000/svg";

    const reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    const CSS = `
.module-visual.fet-diagram,
.module-visual.fd3-icon {
    position: relative;
}

.module-visual.fet-diagram svg {
    transform: perspective(900px)
        rotateX(var(--fd-rx, 0deg))
        rotateY(var(--fd-ry, 0deg));
    transition: transform .35s cubic-bezier(.2, .8, .2, 1);
    will-change: transform;
    filter:
        drop-shadow(0 9px 9px rgba(0, 0, 0, .34))
        drop-shadow(0 1px 1px rgba(0, 0, 0, .45));
}

.module-visual.fet-diagram.fd3-live svg {
    transition: transform .06s linear;
}

.module-visual.fet-diagram svg text:not([transform]) {
    transform: translate(var(--fd-tx, 0px), var(--fd-ty, 0px));
    transition: transform .35s cubic-bezier(.2, .8, .2, 1);
}

.module-visual.fet-diagram.fd3-live svg text:not([transform]) {
    transition: transform .06s linear;
}

.module-visual.fet-diagram::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background: radial-gradient(
        circle at var(--fd-gx, 50%) var(--fd-gy, 35%),
        rgba(255, 255, 255, .13),
        transparent 55%
    );
    opacity: var(--fd-go, 0);
    transition: opacity .35s ease;
}

@keyframes fd3-rise {
    from {
        opacity: 0;
        transform: perspective(900px) translateY(18px) rotateX(24deg) scale(.95);
    }
    to {
        opacity: 1;
        transform: perspective(900px) translateY(0) rotateX(0deg) scale(1);
    }
}

.module-slide.active-slide .module-visual.fet-diagram svg {
    animation: fd3-rise .8s cubic-bezier(.2, .8, .2, 1) backwards;
}

.module-visual.fd3-icon {
    text-shadow:
        1px 1px 0 rgba(0, 0, 0, .28),
        2px 2px 0 rgba(0, 0, 0, .24),
        3px 3px 0 rgba(0, 0, 0, .2),
        4px 4px 0 rgba(0, 0, 0, .16),
        0 14px 22px rgba(0, 0, 0, .45);
    perspective: 700px;
}

.module-visual.fd3-icon > * {
    display: inline-block;
    transform: rotateX(var(--fd-rx, 0deg)) rotateY(var(--fd-ry, 0deg));
    transition: transform .35s cubic-bezier(.2, .8, .2, 1);
}

@media (prefers-reduced-motion: reduce) {
    .module-slide.active-slide .module-visual.fet-diagram svg {
        animation: none;
    }
}
`;


    function injectStyles() {

        const style = document.createElement("style");

        style.id = "fabDiagram3DStyles";
        style.textContent = CSS;

        document.head.appendChild(style);
    }


    // Shared gradients, defined once and referenced by every diagram.
    function injectDefs() {

        const holder = document.createElementNS(NS, "svg");

        holder.setAttribute("width", "0");
        holder.setAttribute("height", "0");
        holder.setAttribute("aria-hidden", "true");
        holder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";

        holder.innerHTML = `
            <defs>
                <linearGradient id="fd3-sheen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity=".30"/>
                    <stop offset=".38" stop-color="#fff" stop-opacity=".05"/>
                    <stop offset="1" stop-color="#000" stop-opacity=".30"/>
                </linearGradient>
                <radialGradient id="fd3-sphere" cx=".32" cy=".28" r=".78">
                    <stop offset="0" stop-color="#fff" stop-opacity=".62"/>
                    <stop offset=".35" stop-color="#fff" stop-opacity=".12"/>
                    <stop offset="1" stop-color="#000" stop-opacity=".40"/>
                </radialGradient>
            </defs>`;

        document.body.appendChild(holder);
    }


    function attr(el, name) {
        return parseFloat(el.getAttribute(name)) || 0;
    }


    // [width, height] from attributes, so it works inside hidden slides.
    function sizeOf(el) {

        switch (el.tagName.toLowerCase()) {

            case "rect":
                return [attr(el, "width"), attr(el, "height")];

            case "circle":
                return [attr(el, "r") * 2, attr(el, "r") * 2];

            case "ellipse":
                return [attr(el, "rx") * 2, attr(el, "ry") * 2];

            case "polygon": {

                const nums =
                    (el.getAttribute("points") || "")
                        .split(/[\s,]+/)
                        .map(parseFloat)
                        .filter(function (n) { return !isNaN(n); });

                const xs = nums.filter(function (_, i) { return i % 2 === 0; });
                const ys = nums.filter(function (_, i) { return i % 2 === 1; });

                if (!xs.length || !ys.length) {
                    return [0, 0];
                }

                return [
                    Math.max.apply(null, xs) - Math.min.apply(null, xs),
                    Math.max.apply(null, ys) - Math.min.apply(null, ys)
                ];
            }
        }

        return [0, 0];
    }


    function isFilled(el) {

        const fill = window.getComputedStyle(el).fill;

        return Boolean(fill) &&
            fill !== "none" &&
            fill.indexOf("url(") === -1 &&
            fill !== "rgba(0, 0, 0, 0)";
    }


    // Lays a shaded copy over each filled shape.
    function shade(svg) {

        if (svg.dataset.fd3Shaded) {
            return;
        }

        svg.dataset.fd3Shaded = "1";

        const shapes =
            svg.querySelectorAll("rect, circle, ellipse, polygon");

        shapes.forEach(function (el) {

            if (el.closest(".fd-arrow")) {
                return;
            }

            const size = sizeOf(el);
            const w = size[0];
            const h = size[1];
            const tag = el.tagName.toLowerCase();

            if (tag === "polygon" && Math.max(w, h) < 14) {
                return;
            }

            if (w < 6 || h < 6 || !isFilled(el)) {
                return;
            }

            // Slab thickness: two dark side faces to the right and below.
            if (tag === "rect" && w >= 14 && h >= 10) {

                const rx = attr(el, "rx");

                if (rx <= Math.min(w, h) * 0.25) {

                    const x = attr(el, "x");
                    const y = attr(el, "y");
                    const d = Math.max(2, Math.min(5, Math.min(w, h) * 0.12));
                    const dx = d * 0.8;
                    const dy = d;

                    const faces = document.createElementNS(NS, "path");

                    faces.setAttribute(
                        "d",
                        "M" + (x + w) + "," + y +
                        " L" + (x + w + dx) + "," + (y + dy) +
                        " L" + (x + w + dx) + "," + (y + h + dy) +
                        " L" + (x + dx) + "," + (y + h + dy) +
                        " L" + x + "," + (y + h) +
                        " L" + (x + w) + "," + (y + h) + " Z"
                    );

                    faces.setAttribute("class", "fd3-ov fd3-face");
                    faces.setAttribute("aria-hidden", "true");
                    faces.setAttribute(
                        "style",
                        "fill:rgba(0,0,0,.34);stroke:rgba(0,0,0,.2);stroke-width:.6;pointer-events:none"
                    );

                    if (el.hasAttribute("transform")) {
                        faces.setAttribute("transform", el.getAttribute("transform"));
                    }

                    el.after(faces);
                }
            }

            const overlay = el.cloneNode(false);

            overlay.removeAttribute("class");
            overlay.removeAttribute("id");
            overlay.removeAttribute("filter");

            overlay.setAttribute("class", "fd3-ov");
            overlay.setAttribute("aria-hidden", "true");

            overlay.setAttribute(
                "style",
                "stroke:none;pointer-events:none;fill:url(#" +
                (tag === "circle" || tag === "ellipse" ? "fd3-sphere" : "fd3-sheen") +
                ")"
            );

            el.after(overlay);
        });
    }


    function tilt(box) {

        const svg = box.querySelector("svg");

        if (!svg || reduceMotion) {
            return;
        }

        let frame = null;
        let last = null;

        function apply() {

            frame = null;

            if (!last) {
                return;
            }

            const r = svg.getBoundingClientRect();

            if (!r.width || !r.height) {
                return;
            }

            const x = Math.max(-0.5, Math.min(0.5, (last.x - r.left) / r.width - 0.5));
            const y = Math.max(-0.5, Math.min(0.5, (last.y - r.top) / r.height - 0.5));

            svg.style.setProperty("--fd-ry", (x * 11).toFixed(2) + "deg");
            svg.style.setProperty("--fd-rx", (-y * 9).toFixed(2) + "deg");
            svg.style.setProperty("--fd-tx", (-x * 6).toFixed(2) + "px");
            svg.style.setProperty("--fd-ty", (-y * 5).toFixed(2) + "px");

            box.style.setProperty("--fd-gx", ((x + 0.5) * 100).toFixed(0) + "%");
            box.style.setProperty("--fd-gy", ((y + 0.5) * 100).toFixed(0) + "%");
            box.style.setProperty("--fd-go", "1");
        }

        function reset() {

            last = null;

            box.classList.remove("fd3-live");

            ["--fd-rx", "--fd-ry", "--fd-tx", "--fd-ty"].forEach(function (name) {
                svg.style.removeProperty(name);
            });

            box.style.setProperty("--fd-go", "0");
        }

        box.addEventListener("pointermove", function (e) {

            last = { x: e.clientX, y: e.clientY };

            box.classList.add("fd3-live");

            if (!frame) {
                frame = window.requestAnimationFrame(apply);
            }
        });

        box.addEventListener("pointerleave", reset);
        box.addEventListener("pointercancel", reset);
        box.addEventListener("pointerup", function (e) {

            if (e.pointerType === "touch") {
                reset();
            }
        });
    }


    function tiltIcon(box) {

        if (reduceMotion) {
            return;
        }

        const inner = box.firstElementChild;

        if (!inner) {
            return;
        }

        box.addEventListener("pointermove", function (e) {

            const r = box.getBoundingClientRect();

            if (!r.width || !r.height) {
                return;
            }

            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;

            box.style.setProperty("--fd-ry", (x * 28).toFixed(1) + "deg");
            box.style.setProperty("--fd-rx", (-y * 22).toFixed(1) + "deg");
        });

        box.addEventListener("pointerleave", function () {

            box.style.removeProperty("--fd-rx");
            box.style.removeProperty("--fd-ry");
        });
    }


    function init() {

        const diagrams =
            document.querySelectorAll(".module-visual.fet-diagram");

        const icons =
            document.querySelectorAll(
                ".module-visual:not(.fet-diagram):not(.module-visual-text):not(.fd-sim)"
            );

        if (!diagrams.length && !icons.length) {
            return;
        }

        injectStyles();

        if (diagrams.length) {

            injectDefs();

            diagrams.forEach(function (box) {

                const svg = box.querySelector("svg");

                if (svg) {
                    shade(svg);
                }

                tilt(box);
            });
        }

        icons.forEach(function (box) {

            // Emoji icons are bare text, so give them an element to tilt.
            if (!box.firstElementChild) {

                const glyph = box.textContent.trim();

                if (!glyph) {
                    return;
                }

                const span = document.createElement("span");

                span.className = "fd3-glyph";
                span.textContent = glyph;

                box.textContent = "";
                box.appendChild(span);
            }

            box.classList.add("fd3-icon");

            tiltIcon(box);
        });
    }


    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", init);

    } else {

        init();
    }

})();
