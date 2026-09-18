/* ========================================
   GAME 7 — SORT THE CELLS
   Unit 7: Microfluidics Device Design
======================================== */

const rounds = [
    { small: 5, large: 15 },
    { small: 6, large: 18 },
    { small: 6, large: 12 },
    { small: 8, large: 14 },
    { small: 9, large: 13 }
];

const FORCE_CONSTANT = 56;
const STATUS_THRESHOLD = 0.9;

const CENTER_X = 150;
const SMALL_START_X = 60;
const LARGE_START_X = 240;

const GAME7_XP_REWARD = 55;
const GAME7_COMPLETE_KEY = "fabPathGame7Complete";

let roundIndex = 0;
let mistakeCount = 0;


function fractionMigrated(voltage, radiusMicrons) {

    const raw =
        (voltage * radiusMicrons) / FORCE_CONSTANT;

    return Math.min(1, raw * raw);
}


function currentVoltage() {

    return parseFloat(
        document.getElementById("powerSlider").value
    );
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function updateVisuals() {

    const voltage =
        currentVoltage();

    document.getElementById("powerValue").textContent =
        `${voltage.toFixed(1)} V`;

    const round =
        rounds[roundIndex];

    const smallFraction =
        fractionMigrated(voltage, round.small);

    const largeFraction =
        fractionMigrated(voltage, round.large);

    const smallCx =
        SMALL_START_X + (CENTER_X - SMALL_START_X) * smallFraction;

    const largeCx =
        LARGE_START_X + (CENTER_X - LARGE_START_X) * largeFraction;

    document.getElementById("smallParticle").setAttribute("cx", smallCx.toFixed(1));
    document.getElementById("smallParticleLabel").setAttribute("x", smallCx.toFixed(1));

    document.getElementById("largeParticle").setAttribute("cx", largeCx.toFixed(1));
    document.getElementById("largeParticleLabel").setAttribute("x", largeCx.toFixed(1));

    document.getElementById("smallParticleLabel").textContent =
        `Small (${round.small} µm)`;

    document.getElementById("largeParticleLabel").textContent =
        `Large (${round.large} µm)`;

    const smallMigrated =
        smallFraction >= STATUS_THRESHOLD;

    const largeMigrated =
        largeFraction >= STATUS_THRESHOLD;

    document.getElementById("smallStatusLabel").textContent =
        "Small cells";

    document.getElementById("smallStatusValue").textContent =
        smallMigrated ? "✅ at the node" : "❌ at the edges";

    document.getElementById("largeStatusLabel").textContent =
        "Large cells";

    document.getElementById("largeStatusValue").textContent =
        largeMigrated ? "✅ at the node" : "❌ at the edges";

    return { smallMigrated, largeMigrated };
}


function renderRound() {

    const round =
        rounds[roundIndex];

    document.getElementById("targetBadge").textContent =
        `🎯 Round ${roundIndex + 1} / ${rounds.length} — sort ${round.small} µm cells from ${round.large} µm cells`;

    document.getElementById("gameProgressText").textContent =
        `${roundIndex + 1} / ${rounds.length}`;

    document.getElementById("gameProgressFill").style.width =
        `${(roundIndex / rounds.length) * 100}%`;

    updateVisuals();
}


function handleLockIn() {

    const { smallMigrated, largeMigrated } =
        updateVisuals();

    if (largeMigrated && !smallMigrated) {

        setFeedback(
            "Locked in — large cells funneled clean, small cells stayed out."
        );

        roundIndex++;

        if (roundIndex >= rounds.length) {

            completeGame();

        } else {

            renderRound();
        }

        return;
    }

    mistakeCount++;

    const lockInButton =
        document.getElementById("lockInButton");

    if (lockInButton) {

        lockInButton.classList.add("wrong");

        setTimeout(function () {
            lockInButton.classList.remove("wrong");
        }, 400);
    }

    if (!largeMigrated) {

        setFeedback(
            "Too weak — the large cells aren't reaching the node. Raise the voltage."
        );

    } else {

        setFeedback(
            "Too strong — the small cells are getting pulled in too. Ease off the voltage."
        );
    }
}


function completeGame() {

    const gameBoard =
        document.getElementById("gameBoard");

    const gameComplete =
        document.getElementById("gameComplete");

    if (gameBoard) {
        gameBoard.hidden = true;
    }

    if (gameComplete) {
        gameComplete.hidden = false;
    }

    document.getElementById("gameProgressText").textContent =
        `${rounds.length} / ${rounds.length}`;

    document.getElementById("gameProgressFill").style.width =
        "100%";

    const gameCompleteStats =
        document.getElementById("gameCompleteStats");

    if (gameCompleteStats) {

        const total =
            rounds.length;

        gameCompleteStats.textContent =
            mistakeCount === 0
                ? `${total} for ${total} — every batch sorted on the first try.`
                : `${total} for ${total}, with ${mistakeCount} adjustment${mistakeCount === 1 ? "" : "s"} along the way.`;
    }

    const gameRecap =
        document.getElementById("gameRecap");

    if (gameRecap) {

        const rows =
            rounds.map(function (round) {

                return `
                    <div class="game-recap-row">
                        <span class="game-recap-emoji">🔊</span>
                        <span class="game-recap-label">${round.small} µm sorted from ${round.large} µm</span>
                    </div>
                `;

            }).join("");

        gameRecap.innerHTML = `
            <div class="recap-category-group">
                <p class="recap-category-title">
                    🧫 Batches sorted
                </p>
                ${rows}
            </div>
        `;
    }

    const alreadyComplete =
        localStorage.getItem(GAME7_COMPLETE_KEY) === "true";

    const gameCompleteXP =
        document.getElementById("gameCompleteXP");

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME7_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME7_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME7_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME7_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }
}


function resetGame() {

    roundIndex = 0;
    mistakeCount = 0;

    const gameBoard =
        document.getElementById("gameBoard");

    const gameComplete =
        document.getElementById("gameComplete");

    if (gameBoard) {
        gameBoard.hidden = false;
    }

    if (gameComplete) {
        gameComplete.hidden = true;
    }

    document.getElementById("powerSlider").value = 1;

    setFeedback(
        "Raise the voltage until only the large cells are funneled into the node, then lock it in."
    );

    renderRound();
}


function initSortTheCellsGame() {

    const powerSlider =
        document.getElementById("powerSlider");

    if (!powerSlider) {
        return;
    }

    powerSlider.addEventListener("input", updateVisuals);

    document
        .getElementById("lockInButton")
        .addEventListener("click", handleLockIn);

    const playAgainButton =
        document.getElementById("playAgainButton");

    if (playAgainButton) {

        playAgainButton.addEventListener(
            "click",
            resetGame
        );
    }

    resetGame();
}


initSortTheCellsGame();
