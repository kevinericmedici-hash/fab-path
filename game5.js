/* ========================================
   GAME 5 — ELECTROSTATIC FORCE LAB
   Unit 5: MEMS Accelerometer Design
======================================== */

const EPSILON_0 = 8.854e-12;
const PLATE_AREA = 2.5e-7;

const forceTargets = [
    { microNewtons: 2, tolerance: 0.2 },
    { microNewtons: 20, tolerance: 0.18 },
    { microNewtons: 100, tolerance: 0.15 },
    { microNewtons: 400, tolerance: 0.15 },
    { microNewtons: 900, tolerance: 0.15 }
];

const FORCE_METER_MIN = 0.03;
const FORCE_METER_MAX = 1900;

const GAME5_XP_REWARD = 50;
const GAME5_COMPLETE_KEY = "fabPathGame5Complete";

let targetIndex = 0;
let mistakeCount = 0;


function computeForceMicroNewtons(voltage, gapMicrons) {

    const gapMeters =
        gapMicrons * 1e-6;

    const forceNewtons =
        (EPSILON_0 * PLATE_AREA * voltage * voltage) /
        (2 * gapMeters * gapMeters);

    return forceNewtons * 1e6;
}


function forceToMeterPercent(microNewtons) {

    const clamped =
        Math.max(
            FORCE_METER_MIN,
            Math.min(FORCE_METER_MAX, microNewtons)
        );

    const logMin = Math.log10(FORCE_METER_MIN);
    const logMax = Math.log10(FORCE_METER_MAX);
    const logVal = Math.log10(clamped);

    return ((logVal - logMin) / (logMax - logMin)) * 100;
}


function formatForce(microNewtons) {

    if (microNewtons >= 1000) {

        return `${(microNewtons / 1000).toFixed(2)} mN`;
    }

    if (microNewtons >= 1) {

        return `${microNewtons.toFixed(1)} µN`;
    }

    return `${(microNewtons * 1000).toFixed(0)} nN`;
}


function currentReadings() {

    const voltage =
        parseFloat(
            document.getElementById("voltageSlider").value
        );

    const gap =
        parseFloat(
            document.getElementById("gapSlider").value
        );

    return { voltage, gap };
}


function updateVisuals() {

    const { voltage, gap } =
        currentReadings();

    document.getElementById("voltageValue").textContent =
        `${voltage.toFixed(1)} V`;

    document.getElementById("gapValue").textContent =
        `${gap.toFixed(1)} µm`;

    document.getElementById("gapLabel").textContent =
        `${gap.toFixed(1)} µm`;

    const gapMin = 0.5;
    const gapMax = 5;
    const visualGapMin = 16;
    const visualGapMax = 150;

    const visualGap =
        visualGapMin +
        ((gap - gapMin) / (gapMax - gapMin)) *
        (visualGapMax - visualGapMin);

    const movablePlate =
        document.getElementById("movablePlate");

    if (movablePlate) {

        movablePlate.style.top =
            `${22 + visualGap}px`;
    }

    const gapLabelEl =
        document.getElementById("gapLabel");

    if (gapLabelEl) {

        gapLabelEl.style.top =
            `${22 + visualGap / 2 - 10}px`;
    }

    const force =
        computeForceMicroNewtons(voltage, gap);

    document.getElementById("forceReadout").textContent =
        formatForce(force);

    document.getElementById("forceMeterFill").style.width =
        `${forceToMeterPercent(force)}%`;

    return force;
}


function renderTarget() {

    const target =
        forceTargets[targetIndex];

    document.getElementById("targetBadge").textContent =
        `🎯 Target: ~${target.microNewtons} µN`;

    document.getElementById("forceMeterTarget").style.left =
        `${forceToMeterPercent(target.microNewtons)}%`;

    document.getElementById("gameProgressText").textContent =
        `${targetIndex + 1} / ${forceTargets.length}`;

    document.getElementById("gameProgressFill").style.width =
        `${((targetIndex) / forceTargets.length) * 100}%`;
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function handleLockIn() {

    const { voltage, gap } =
        currentReadings();

    const force =
        computeForceMicroNewtons(voltage, gap);

    const target =
        forceTargets[targetIndex];

    const lowerBound =
        target.microNewtons * (1 - target.tolerance);

    const upperBound =
        target.microNewtons * (1 + target.tolerance);

    if (force >= lowerBound && force <= upperBound) {

        setFeedback(
            `Locked in at ${formatForce(force)} — nice work.`
        );

        targetIndex++;

        if (targetIndex >= forceTargets.length) {

            completeGame();

        } else {

            renderTarget();
        }

    } else {

        mistakeCount++;

        if (force < lowerBound) {

            setFeedback(
                "Too weak — try more voltage, or close the gap a bit."
            );

        } else {

            setFeedback(
                "Too strong — try less voltage, or open the gap a bit."
            );
        }

        const lockInButton =
            document.getElementById("lockInButton");

        if (lockInButton) {

            lockInButton.classList.add("wrong");

            setTimeout(function () {
                lockInButton.classList.remove("wrong");
            }, 400);
        }
    }
}


function completeGame() {

    const gameBoard =
        document.getElementById("gameBoard");

    const gameComplete =
        document.getElementById("gameComplete");

    const gameCompleteXP =
        document.getElementById("gameCompleteXP");

    const gameCompleteStats =
        document.getElementById("gameCompleteStats");


    if (gameBoard) {
        gameBoard.hidden = true;
    }

    if (gameComplete) {
        gameComplete.hidden = false;
    }

    document.getElementById("gameProgressText").textContent =
        `${forceTargets.length} / ${forceTargets.length}`;

    document.getElementById("gameProgressFill").style.width =
        "100%";


    if (gameCompleteStats) {

        const total = forceTargets.length;

        gameCompleteStats.textContent =
            mistakeCount === 0
                ? `${total} for ${total} — every target hit on the first try.`
                : `${total} for ${total}, with ${mistakeCount} adjustment${mistakeCount === 1 ? "" : "s"} along the way.`;
    }


    const alreadyComplete =
        localStorage.getItem(GAME5_COMPLETE_KEY) === "true";

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME5_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME5_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME5_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME5_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }
}


function resetGame() {

    targetIndex = 0;
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

    document.getElementById("voltageSlider").value = 10;
    document.getElementById("gapSlider").value = 2;

    setFeedback(
        "Adjust voltage and gap, then lock in when you think you've hit the target."
    );

    updateVisuals();
    renderTarget();
}


function initForceLabGame() {

    const voltageSlider =
        document.getElementById("voltageSlider");

    if (!voltageSlider) {
        return;
    }

    voltageSlider.addEventListener("input", updateVisuals);

    document
        .getElementById("gapSlider")
        .addEventListener("input", updateVisuals);

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


initForceLabGame();
