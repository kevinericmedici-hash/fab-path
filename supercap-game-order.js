/* ========================================
   SUPERCAPACITOR GAMES — STEP ORDERING
   Tap process steps in the right order,
   round by round. Used by the Unit 7
   fabrication game.
======================================== */

(function () {

    function startOrder(cfg) {

        const zone =
            document.getElementById("buildZone");

        const tray =
            document.getElementById("tileGrid");

        if (!zone || !tray) {
            return;
        }

        const totalSteps =
            cfg.rounds.reduce(function (sum, round) {
                return sum + round.steps.length;
            }, 0);

        let roundIndex = 0;
        let placed = [];
        let mistakes = 0;
        let missesOnStep = 0;
        let stepsDone = 0;
        let locked = false;


        function currentRound() {
            return cfg.rounds[roundIndex];
        }


        function renderZone() {

            if (placed.length === 0) {

                zone.innerHTML =
                    `<p class="build-zone-empty">No steps placed yet.</p>`;

                return;
            }

            zone.innerHTML =
                placed.map(function (step, i) {

                    return `
                        <div class="build-part">
                            <span class="build-part-icon">${i + 1}. ${step.icon}</span>
                            <span class="build-part-name">${step.name}</span>
                        </div>
                    `;

                }).join("");
        }


        function renderTray() {

            tray.innerHTML = "";

            const round = currentRound();

            const remaining =
                round.steps.filter(function (step) {
                    return placed.indexOf(step) === -1;
                });

            const nextStep =
                round.steps[placed.length];

            SCGames.shuffle(remaining).forEach(function (step) {

                const tile =
                    document.createElement("button");

                tile.type = "button";
                tile.className = "game-tile";

                if (missesOnStep >= 3 && step === nextStep) {
                    tile.classList.add("hint");
                }

                tile.innerHTML = `
                    <span class="game-tile-emoji">${step.icon}</span>
                    <span class="game-tile-label">${step.name}</span>
                `;

                tile.addEventListener("click", function () {
                    handleClick(step, tile);
                });

                tray.appendChild(tile);
            });
        }


        function loadRound() {

            const round = currentRound();

            placed = [];
            missesOnStep = 0;
            locked = false;

            document.getElementById("orderRoundTitle").textContent =
                `Round ${roundIndex + 1} of ${cfg.rounds.length} · ${round.title}`;

            document.getElementById("orderRoundLead").textContent =
                round.lead;

            renderZone();
            renderTray();

            SCGames.setFeedback("Tap the first step.");
        }


        function handleClick(step, tile) {

            if (locked) {
                return;
            }

            const round = currentRound();

            const expected =
                round.steps[placed.length];

            if (step === expected) {

                placed.push(step);
                stepsDone++;
                missesOnStep = 0;

                SCGames.setProgress(stepsDone, totalSteps);
                renderZone();

                if (placed.length === round.steps.length) {

                    roundIndex++;

                    if (roundIndex >= cfg.rounds.length) {

                        finishGame();
                        return;
                    }

                    locked = true;
                    tray.innerHTML = "";

                    SCGames.setFeedback(
                        `${step.name} — ${step.why} Round complete! Next up: ${currentRound().title}.`
                    );

                    setTimeout(loadRound, 2000);

                } else {

                    renderTray();

                    SCGames.setFeedback(
                        `${step.name} — ${step.why}`
                    );
                }

            } else {

                mistakes++;
                missesOnStep++;

                tile.classList.add("wrong");

                SCGames.setFeedback(
                    missesOnStep >= 3
                        ? "Still stuck? The glowing step is next."
                        : "Not yet — what has to happen before that?"
                );

                if (missesOnStep === 3) {
                    renderTray();
                }

                setTimeout(function () {
                    tile.classList.remove("wrong");
                }, 400);
            }
        }


        function finishGame() {

            const recap =
                cfg.rounds.map(function (round) {

                    const rows =
                        round.steps.map(function (step, i) {
                            return SCGames.recapRow(step.icon, `${i + 1}. ${step.name}`);
                        }).join("");

                    return SCGames.recapGroup(
                        `${round.icon} ${round.title}`,
                        rows
                    );

                }).join("");

            SCGames.finish({
                key: cfg.key,
                xp: cfg.xp,
                recap: recap,
                stats:
                    mistakes === 0
                        ? `${totalSteps} steps across ${cfg.rounds.length} processes, all in order on the first try.`
                        : `${totalSteps} steps across ${cfg.rounds.length} processes, with ${SCGames.plural(mistakes, "out-of-order attempt")} along the way.`
            });
        }


        function reset() {

            roundIndex = 0;
            mistakes = 0;
            stepsDone = 0;

            SCGames.showBoard();
            SCGames.setProgress(0, totalSteps);
            loadRound();
        }


        reset();

        SCGames.onPlayAgain(reset);
    }


    window.SCGames.startOrder = startOrder;

})();
