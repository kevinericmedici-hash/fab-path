/* ========================================
   SUPERCAPACITOR GAMES — SIZE IT
   Pick the smallest standard supercapacitor
   that carries a real load through its
   hold-up window, ESR drop included.
======================================== */

(function () {

    const W = 320;
    const H = 190;

    const LEFT = 42;
    const RIGHT = W - 12;
    const TOP = 14;
    const BOTTOM = H - 30;


    function formatTime(seconds) {

        if (seconds >= 3600) {

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.round((seconds % 3600) / 60);

            return minutes === 0
                ? `${hours} h`
                : `${hours} h ${minutes} min`;
        }

        if (seconds >= 120) {
            return `${(seconds / 60).toFixed(1)} min`;
        }

        if (seconds >= 10) {
            return `${seconds.toFixed(0)} s`;
        }

        if (seconds >= 1) {
            return `${seconds.toFixed(1)} s`;
        }

        return `${seconds.toFixed(2)} s`;
    }


    function formatCurrent(amps) {

        if (amps >= 1) {
            return `${amps} A`;
        }

        if (amps >= 0.001) {
            return `${(amps * 1000).toFixed(0)} mA`;
        }

        return `${(amps * 1e6).toFixed(0)} µA`;
    }


    function formatCap(farads) {
        return `${farads} F`;
    }


    function evaluate(round, part) {

        const drop = round.current * part.esr;
        const usable = round.vmax - round.vmin - drop;

        const hold =
            usable > 0
                ? part.c * usable / round.current
                : 0;

        return {
            drop: drop,
            hold: hold,
            passes: hold >= round.seconds
        };
    }


    function smallestPassing(cfg, round) {

        for (let i = 0; i < cfg.parts.length; i++) {

            if (evaluate(round, cfg.parts[i]).passes) {
                return i;
            }
        }

        return cfg.parts.length - 1;
    }


    function startSizing(cfg) {

        const svg =
            document.getElementById("sizeSvg");

        const slider =
            document.getElementById("sizeSlider");

        if (!svg || !slider) {
            return;
        }

        let roundIndex = 0;
        let mistakes = 0;
        let perfectRounds = 0;
        let passed = false;
        let tested = false;
        let results = [];


        function currentRound() {
            return cfg.rounds[roundIndex];
        }


        function currentPart() {
            return cfg.parts[parseInt(slider.value)];
        }


        function xFor(t, tMax) {
            return LEFT + (t / tMax) * (RIGHT - LEFT);
        }


        function yFor(v, vTop) {
            return BOTTOM - (v / vTop) * (BOTTOM - TOP);
        }


        function drawChart(round, part, outcome) {

            const vTop = round.vmax * 1.08;
            const tMax = round.seconds * 1.3;

            let html = `
                <line class="sc-axis" x1="${LEFT}" y1="${TOP}" x2="${LEFT}" y2="${BOTTOM}"></line>
                <line class="sc-axis" x1="${LEFT}" y1="${BOTTOM}" x2="${RIGHT}" y2="${BOTTOM}"></line>
                <text class="sc-axis-label" x="${RIGHT}" y="${H - 8}" text-anchor="end">Time →</text>
                <text class="sc-axis-label" x="${LEFT + 4}" y="${TOP + 4}">Voltage</text>
            `;

            const yMin = yFor(round.vmin, vTop);
            const yMax = yFor(round.vmax, vTop);
            const xNeed = xFor(round.seconds, tMax);

            html += `
                <line class="sc-limit" x1="${LEFT}" y1="${yMin}" x2="${RIGHT}" y2="${yMin}"></line>
                <text class="sc-limit-label" x="${RIGHT}" y="${yMin - 4}" text-anchor="end">cutoff ${round.vmin} V</text>
                <line class="sc-need" x1="${xNeed}" y1="${TOP + 14}" x2="${xNeed}" y2="${BOTTOM}"></line>
                <text class="sc-limit-label" x="${xNeed}" y="${TOP + 10}" text-anchor="middle">needs ${formatTime(round.seconds)}</text>
                <text class="sc-limit-label" x="${LEFT - 4}" y="${yMax + 3}" text-anchor="end">${round.vmax} V</text>
            `;

            if (outcome) {

                const startV = round.vmax - outcome.drop;
                const startVisible = Math.max(startV, 0);

                const holdEnd = Math.min(outcome.hold, tMax);

                const endV =
                    outcome.hold >= tMax
                        ? startV - (round.current * tMax) / part.c
                        : round.vmin;

                const points = [
                    [xFor(0, tMax), yMax],
                    [xFor(0, tMax), yFor(startVisible, vTop)],
                    [xFor(holdEnd, tMax), yFor(Math.max(endV, 0), vTop)]
                ];

                const cls =
                    outcome.passes
                        ? "sc-curve"
                        : "sc-curve sc-curve-fail";

                html += `<path class="${cls}" d="${points.map(function (p, i) {
                    return `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
                }).join(" ")}"></path>`;

                if (!outcome.passes) {

                    html += `<circle class="sc-fail-dot" cx="${points[2][0].toFixed(1)}" cy="${points[2][1].toFixed(1)}" r="4"></circle>`;
                }
            }

            svg.innerHTML = html;
        }


        function updatePartReadout() {

            const part = currentPart();

            document.getElementById("sizeValue").textContent =
                `${formatCap(part.c)} · ESR ${part.esr} Ω`;
        }


        function setResult(html, tone) {

            const box =
                document.getElementById("sizeResult");

            box.className = `sc-size-result ${tone || ""}`;
            box.innerHTML = html;
        }


        function renderRound() {

            const round = currentRound();

            passed = false;
            tested = false;

            document.getElementById("sizeIcon").textContent =
                round.icon;

            document.getElementById("sizeTitle").textContent =
                `Round ${roundIndex + 1} of ${cfg.rounds.length} · ${round.title}`;

            document.getElementById("sizeText").textContent =
                round.text;

            document.getElementById("sizeSpec").innerHTML = `
                <span>Load <strong>${formatCurrent(round.current)}</strong></span>
                <span>Hold <strong>${formatTime(round.seconds)}</strong></span>
                <span>Window <strong>${round.vmax} V → ${round.vmin} V</strong></span>
            `;

            slider.value = 0;

            updatePartReadout();
            drawChart(round, currentPart(), null);

            setResult("Choose a size, then test it.", "");
            SCGames.setFeedback("Slide to pick a part, then test it.");
            SCGames.setProgress(roundIndex, cfg.rounds.length);

            document.getElementById("sizeTestButton").hidden = false;
            document.getElementById("sizeNextButton").hidden = true;
        }


        function runTest() {

            const round = currentRound();
            const part = currentPart();
            const outcome = evaluate(round, part);

            drawChart(round, part, outcome);

            tested = true;

            const dropText =
                `ESR drop <strong>${outcome.drop.toFixed(outcome.drop < 0.1 ? 3 : 2)} V</strong> at the start`;

            const holdText =
                `holds <strong>${formatTime(outcome.hold)}</strong> of the ${formatTime(round.seconds)} needed`;

            if (!outcome.passes) {

                mistakes++;

                setResult(
                    `✗ Not enough: ${dropText}, then ${holdText}. Try a bigger part.`,
                    "fail"
                );

                SCGames.setFeedback(
                    "It falls to the cutoff before the load is done."
                );

                return;
            }

            const best = smallestPassing(cfg, round);
            const chosen = parseInt(slider.value);

            passed = true;

            if (chosen === best) {

                perfectRounds++;

                setResult(
                    `✓ Perfect: ${dropText}, and it ${holdText}. No smaller part would work.`,
                    "pass"
                );

                SCGames.setFeedback(
                    "Right-sized: the smallest part that survives the load."
                );

            } else {

                setResult(
                    `✓ It works: ${dropText}, and it ${holdText}. But a smaller part would also do the job, so you paid for size you didn't need.`,
                    "pass"
                );

                SCGames.setFeedback(
                    "It works, but it's oversized. Slide down and test again for a perfect round, or move on."
                );
            }

            results.push({ round: round, part: part, best: cfg.parts[best], perfect: chosen === best });

            document.getElementById("sizeNextButton").hidden = false;
            document.getElementById("sizeNextButton").textContent =
                roundIndex === cfg.rounds.length - 1
                    ? "Finish →"
                    : "Next round →";
        }


        function next() {

            if (!passed) {
                return;
            }

            roundIndex++;

            if (roundIndex >= cfg.rounds.length) {

                complete();
                return;
            }

            renderRound();
        }


        function complete() {

            SCGames.setProgress(cfg.rounds.length, cfg.rounds.length);

            /* keep only the last passing result per round */

            const latest = {};

            results.forEach(function (r) {
                latest[r.round.title] = r;
            });

            const rows =
                cfg.rounds.map(function (round) {

                    const r = latest[round.title];

                    const label =
                        `${formatCap(r.part.c)}${r.perfect ? " ✓" : ` (smallest: ${formatCap(r.best.c)})`}`;

                    return SCGames.recapRow(round.icon, round.title, label);

                }).join("");

            const total = cfg.rounds.length;

            const perfect =
                cfg.rounds.filter(function (round) {
                    return latest[round.title].perfect;
                }).length;

            SCGames.finish({
                key: cfg.key,
                xp: cfg.xp,
                recap: SCGames.recapGroup("🔋 Your parts", rows),
                stats:
                    perfect === total
                        ? `${total} for ${total} — every part perfectly sized, with ${SCGames.plural(mistakes, "failed test")}.`
                        : `${total} rounds cleared, ${perfect} perfectly sized, with ${SCGames.plural(mistakes, "failed test")} along the way.`
            });
        }


        function reset() {

            roundIndex = 0;
            mistakes = 0;
            perfectRounds = 0;
            results = [];

            SCGames.showBoard();
            renderRound();
        }


        slider.setAttribute("max", cfg.parts.length - 1);

        slider.addEventListener("input", function () {

            updatePartReadout();

            if (tested) {

                drawChart(currentRound(), currentPart(), null);

                setResult("Choose a size, then test it.", "");

                document.getElementById("sizeNextButton").hidden = true;

                passed = false;
                tested = false;
            }
        });

        document.getElementById("sizeTestButton")
            .addEventListener("click", runTest);

        document.getElementById("sizeNextButton")
            .addEventListener("click", next);

        reset();

        SCGames.onPlayAgain(reset);
    }


    window.SCGames.startSizing = startSizing;

})();
