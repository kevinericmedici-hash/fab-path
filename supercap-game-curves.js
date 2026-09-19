/* ========================================
   SUPERCAPACITOR GAMES — NAME THAT CURVE
   Curves are generated from small physical
   models, then the player names the
   behavior they show.
======================================== */

(function () {

    /* ---------- figure helpers ---------- */

    const W = 300;
    const H = 180;


    function path(points) {

        return points.map(function (p, i) {
            return `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
        }).join(" ");
    }


    function frame(xLabel, yLabel, baselineY, leftX) {

        return `
            <line class="sc-axis" x1="${leftX}" y1="10" x2="${leftX}" y2="${baselineY}"></line>
            <line class="sc-axis" x1="${leftX}" y1="${baselineY}" x2="${W - 10}" y2="${baselineY}"></line>
            <text class="sc-axis-label" x="${W - 12}" y="${H - 6}" text-anchor="end">${xLabel}</text>
            <text class="sc-axis-label" x="${leftX + 6}" y="18">${yLabel}</text>
        `;
    }


    /* ---------- cyclic voltammetry ---------- */

    /*
        A capacitor in series with a resistor,
        driven by a triangular voltage sweep,
        plus optional extra faradaic current.
    */

    function cvPoints(model) {

        const vmax = 1;
        const rate = 1;
        const steps = 900;
        const total = 2 * vmax / rate;
        const dt = total / steps;

        let capacitance = 1;
        let resistance = 0.04;

        if (model === "leaf") {
            resistance = 0.45;
        }

        if (model === "peaks") {
            capacitance = 0.12;
        }

        let vc = 0;
        const raw = [];

        for (let i = 0; i <= steps; i++) {

            const t = i * dt;
            const forward = t <= total / 2;

            const va =
                forward
                    ? rate * t
                    : vmax - rate * (t - total / 2);

            const ic = (va - vc) / resistance;

            vc += ic * dt / capacitance;

            let extra = 0;

            if (model === "pseudo") {

                const center = forward ? 0.52 : 0.44;
                const bump = Math.exp(-Math.pow((va - center) / 0.13, 2));

                extra = (forward ? 1 : -1) * 0.85 * bump;
            }

            if (model === "breakdown") {

                extra = 0.02 * Math.exp((va - 0.8) / 0.05);
            }

            if (model === "peaks") {

                const center = forward ? 0.62 : 0.36;
                const x = (va - center) / 0.07;

                let shape = Math.exp(-x * x);

                if ((forward && x > 0) || (!forward && x < 0)) {
                    shape += 0.25 * Math.exp(-Math.abs(x) / 2.5);
                }

                extra = (forward ? 1 : -1) * 1.0 * shape;
            }

            raw.push([va, ic + extra]);
        }

        return raw;
    }


    function cvFigure(model) {

        const pts = cvPoints(model);

        const maxCurrent =
            Math.max.apply(null, pts.map(function (p) {
                return Math.abs(p[1]);
            }));

        const left = 30;
        const mid = 92;

        const mapped =
            pts.map(function (p) {

                return [
                    left + p[0] * 240,
                    mid - (p[1] / maxCurrent) * 72
                ];
            });

        return `
            ${frame("Voltage →", "Current", mid, left)}
            <path class="sc-curve" d="${path(mapped)}"></path>
        `;
    }


    /* ---------- galvanostatic charge-discharge ---------- */

    function gcdPoints(model) {

        const pts = [];

        function push(t, v) {
            pts.push([t, v]);
        }

        function plateau(q) {

            if (q < 0.3) {
                return q * (0.55 / 0.3);
            }

            if (q < 0.7) {
                return 0.55 + (q - 0.3) * (0.1 / 0.4);
            }

            return 0.65 + (q - 0.7) * (0.35 / 0.3);
        }

        if (model === "ideal") {

            for (let c = 0; c < 2; c++) {

                const t0 = c * 2;

                push(t0, 0);
                push(t0 + 1, 1);
                push(t0 + 2, 0);
            }

        } else if (model === "ir") {

            const drop = 0.26;

            for (let c = 0; c < 2; c++) {

                const t0 = c * 2;

                push(t0, 0);
                push(t0, drop);
                push(t0 + 1, 1);
                push(t0 + 1, 1 - drop);
                push(t0 + 2, 0);
            }

        } else if (model === "plateau") {

            const steps = 40;

            for (let c = 0; c < 2; c++) {

                const t0 = c * 2.4;

                for (let i = 0; i <= steps; i++) {
                    push(t0 + (i / steps) * 1.2, plateau(i / steps));
                }

                for (let i = 1; i <= steps; i++) {
                    push(t0 + 1.2 + (i / steps) * 1.2, plateau(1 - i / steps));
                }
            }

        } else if (model === "lowce") {

            const dischargeLength = 0.5;
            const cycle = 1 + dischargeLength;

            for (let c = 0; c < 2; c++) {

                const t0 = c * cycle;

                push(t0, 0);
                push(t0 + 1, 1);
                push(t0 + cycle, 0);
            }
        }

        return pts;
    }


    function gcdFigure(model) {

        const pts = gcdPoints(model);

        const tMax =
            Math.max.apply(null, pts.map(function (p) {
                return p[0];
            }));

        const left = 30;
        const base = 160;

        const mapped =
            pts.map(function (p) {

                return [
                    left + (p[0] / tMax) * 250,
                    base - p[1] * 130
                ];
            });

        return `
            ${frame("Time →", "Voltage", base, left)}
            <path class="sc-curve" d="${path(mapped)}"></path>
        `;
    }


    /* ---------- impedance (Nyquist) ---------- */

    function eisPoints(model) {

        const pts = [];

        function semicircle(start, diameter) {

            for (let i = 0; i <= 30; i++) {

                const angle = Math.PI - (i / 30) * Math.PI;

                pts.push([
                    start + diameter / 2 + (diameter / 2) * Math.cos(angle),
                    (diameter / 2) * Math.sin(angle)
                ]);
            }
        }

        if (model === "ideal") {

            pts.push([0.12, 0]);
            pts.push([0.13, 0.15]);
            pts.push([0.14, 1.0]);

        } else if (model === "highrs") {

            pts.push([0.7, 0]);
            pts.push([0.71, 0.15]);
            pts.push([0.72, 1.0]);

        } else if (model === "semicircle") {

            semicircle(0.1, 0.6);

            pts.push([0.7, 0.05]);
            pts.push([0.72, 0.5]);
            pts.push([0.74, 0.95]);

        } else if (model === "warburg") {

            semicircle(0.1, 0.25);

            pts.push([0.35, 0]);
            pts.push([0.7, 0.35]);
            pts.push([0.8, 0.9]);
        }

        return pts;
    }


    function eisFigure(model) {

        const pts = eisPoints(model);

        const left = 30;
        const base = 160;
        const scale = 150;

        const mapped =
            pts.map(function (p) {

                return [
                    left + p[0] * scale,
                    base - p[1] * scale
                ];
            });

        return `
            ${frame("Z′ →", "−Z″", base, left)}
            <path class="sc-curve" d="${path(mapped)}"></path>
        `;
    }


    function figureFor(item) {

        if (item.type === "cv") {
            return cvFigure(item.model);
        }

        if (item.type === "gcd") {
            return gcdFigure(item.model);
        }

        return eisFigure(item.model);
    }


    /* ---------- game loop ---------- */

    function startCurves(cfg) {

        const svg =
            document.getElementById("curveSvg");

        const grid =
            document.getElementById("categoryGrid");

        if (!svg || !grid) {
            return;
        }

        let deck = [];
        let index = 0;
        let mistakes = 0;


        function optionsFor(item) {

            const pool =
                cfg.pools[item.type].filter(function (label) {
                    return label !== item.answer;
                });

            const distractors =
                SCGames.shuffle(pool).slice(0, 3);

            return SCGames.shuffle(distractors.concat(item.answer));
        }


        function renderCard() {

            const item = deck[index];

            svg.innerHTML = figureFor(item);

            document.getElementById("curveQuestion").textContent =
                cfg.questions[item.type];

            SCGames.setProgress(index + 1, deck.length);
            SCGames.setFeedback("Read the curve, then tap what it shows.");

            grid.innerHTML = "";

            optionsFor(item).forEach(function (label) {

                const button =
                    document.createElement("button");

                button.type = "button";
                button.className = "category-button";

                button.innerHTML =
                    `<span class="category-button-label">${label}</span>`;

                button.addEventListener("click", function () {
                    handlePick(label, button);
                });

                grid.appendChild(button);
            });
        }


        function handlePick(label, button) {

            if (button.classList.contains("disabled")) {
                return;
            }

            const item = deck[index];

            if (label === item.answer) {

                button.classList.add("correct");

                grid.querySelectorAll(".category-button")
                    .forEach(function (btn) {
                        btn.classList.add("disabled");
                    });

                SCGames.setFeedback(`Correct — ${item.why}`);

                setTimeout(function () {

                    index++;

                    if (index >= deck.length) {
                        complete();
                    } else {
                        renderCard();
                    }

                }, 1700);

            } else {

                mistakes++;

                button.classList.add("wrong");

                SCGames.setFeedback(cfg.wrongHints[item.type]);

                setTimeout(function () {
                    button.classList.remove("wrong");
                }, 400);
            }
        }


        function complete() {

            const groups = [
                { type: "cv", title: "📈 Cyclic voltammetry" },
                { type: "gcd", title: "📉 Charge–discharge" },
                { type: "eis", title: "🌀 Impedance (Nyquist)" }
            ];

            const recap =
                groups.map(function (group) {

                    const rows =
                        cfg.items
                            .filter(function (item) {
                                return item.type === group.type;
                            })
                            .map(function (item) {
                                return SCGames.recapRow("•", item.answer, item.why);
                            })
                            .join("");

                    return SCGames.recapGroup(group.title, rows);

                }).join("");

            const total = deck.length;

            SCGames.finish({
                key: cfg.key,
                xp: cfg.xp,
                recap: recap,
                stats:
                    mistakes === 0
                        ? `${total} for ${total} — every curve read correctly.`
                        : `${total} for ${total}, with ${SCGames.plural(mistakes, "mistake")} along the way.`
            });
        }


        function reset() {

            deck = SCGames.shuffle(cfg.items);
            index = 0;
            mistakes = 0;

            SCGames.showBoard();
            renderCard();
        }


        reset();

        SCGames.onPlayAgain(reset);
    }


    window.SCGames.startCurves = startCurves;

    /* exposed for the layout test page */
    window.SCGames.curveFigure = figureFor;

})();
