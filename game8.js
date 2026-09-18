/* ========================================
   GAME 8 — BUILD THE PACKAGE
   Unit 8: MEMS Packaging
======================================== */

const packagingSteps = [

    {
        id: "bonding",
        name: "Bonding",
        icon: "🔗",
        desc: "Seal a cap onto the wafer before it's ever diced — direct wafer bonding or anodic bonding to glass."
    },

    {
        id: "waferSawing",
        name: "Wafer Sawing",
        icon: "✂️",
        desc: "Diamond-saw the bonded wafer apart, mounted on a mylar film."
    },

    {
        id: "pickAndPlace",
        name: "Pick and Place",
        icon: "🤖",
        desc: "Lift each individual die from the wafer onto a lead-frame or package."
    },

    {
        id: "dieAttach",
        name: "Die Attach",
        icon: "📌",
        desc: "Cure an adhesive bond layer to anchor the die to its substrate."
    },

    {
        id: "wireBonding",
        name: "Wire Bonding",
        icon: "🧵",
        desc: "Thermocompression ball-wedge bond gold wire from the die's pads to the lead-frame."
    },

    {
        id: "encapsulation",
        name: "Encapsulation",
        icon: "🛡️",
        desc: "Seal the die against corrosion and mechanical damage."
    },

    {
        id: "overmolding",
        name: "Overmolding",
        icon: "🧱",
        desc: "Mold a protective plastic body around the whole package."
    },

    {
        id: "trimming",
        name: "Trimming",
        icon: "🔪",
        desc: "Cut away the excess lead-frame material."
    },

    {
        id: "finalTesting",
        name: "Final Testing",
        icon: "✅",
        desc: "Verify the finished package survived the entire process."
    }

];

const GAME8_XP_REWARD = 65;
const GAME8_COMPLETE_KEY = "fabPathGame8Complete";

let placedSteps = [];
let mistakeCount = 0;


function shuffleArray(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function updateProgress() {

    document.getElementById("gameProgressText").textContent =
        `${placedSteps.length} / ${packagingSteps.length}`;

    document.getElementById("gameProgressFill").style.width =
        `${(placedSteps.length / packagingSteps.length) * 100}%`;
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function renderBuildZone() {

    const buildZone =
        document.getElementById("buildZone");

    if (placedSteps.length === 0) {

        buildZone.innerHTML =
            `<p class="build-zone-empty">No steps placed yet.</p>`;

        return;
    }

    buildZone.innerHTML =
        placedSteps.map(function (step, index) {

            return `
                <div class="build-part">
                    <span class="build-part-icon">${index + 1}. ${step.icon}</span>
                    <span class="build-part-name">${step.name}</span>
                </div>
            `;

        }).join("");
}


function renderTray() {

    const tileGrid =
        document.getElementById("tileGrid");

    tileGrid.innerHTML = "";

    const remaining =
        packagingSteps.filter(function (step) {
            return placedSteps.indexOf(step) === -1;
        });

    const trayItems =
        shuffleArray(remaining);

    trayItems.forEach(function (step) {

        const tile =
            document.createElement("button");

        tile.type = "button";
        tile.className = "game-tile";
        tile.dataset.stepId = step.id;

        tile.innerHTML = `
            <span class="game-tile-emoji part-tile-icon">${step.icon}</span>
            <span class="game-tile-label">${step.name}</span>
        `;

        tile.addEventListener("click", function () {
            handleStepClick(step, tile);
        });

        tileGrid.appendChild(tile);
    });
}


function handleStepClick(step, tileEl) {

    const nextStep =
        packagingSteps[placedSteps.length];

    if (step.id === nextStep.id) {

        placedSteps.push(step);

        renderBuildZone();
        renderTray();
        updateProgress();

        if (placedSteps.length === packagingSteps.length) {

            completeGame();

        } else {

            setFeedback(
                `${step.name} placed. ${packagingSteps.length - placedSteps.length} step${packagingSteps.length - placedSteps.length === 1 ? "" : "s"} to go.`
            );
        }

    } else {

        mistakeCount++;

        tileEl.classList.add("wrong");

        setFeedback(
            `Not yet — ${nextStep.name} has to happen first.`
        );

        setTimeout(function () {
            tileEl.classList.remove("wrong");
        }, 400);
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

    const gameCompleteStats =
        document.getElementById("gameCompleteStats");

    if (gameCompleteStats) {

        const total =
            packagingSteps.length;

        gameCompleteStats.textContent =
            mistakeCount === 0
                ? `${total} for ${total} — every step placed in order, first try.`
                : `${total} for ${total}, with ${mistakeCount} out-of-order attempt${mistakeCount === 1 ? "" : "s"} along the way.`;
    }

    const gameRecap =
        document.getElementById("gameRecap");

    if (gameRecap) {

        const rows =
            packagingSteps.map(function (step, index) {

                return `
                    <div class="game-recap-row">
                        <span class="game-recap-emoji">${step.icon}</span>
                        <span class="game-recap-label">${index + 1}. ${step.name}</span>
                    </div>
                `;

            }).join("");

        gameRecap.innerHTML = `
            <div class="recap-category-group">
                <p class="recap-category-title">
                    📦 Die to shipped chip
                </p>
                ${rows}
            </div>
        `;
    }

    const alreadyComplete =
        localStorage.getItem(GAME8_COMPLETE_KEY) === "true";

    const gameCompleteXP =
        document.getElementById("gameCompleteXP");

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME8_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME8_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME8_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME8_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }
}


function resetGame() {

    placedSteps = [];
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

    setFeedback(
        "Tap the first packaging step."
    );

    renderBuildZone();
    renderTray();
    updateProgress();
}


function initBuildThePackageGame() {

    const tileGrid =
        document.getElementById("tileGrid");

    if (!tileGrid) {
        return;
    }

    resetGame();

    const playAgainButton =
        document.getElementById("playAgainButton");

    if (playAgainButton) {

        playAgainButton.addEventListener(
            "click",
            resetGame
        );
    }
}


initBuildThePackageGame();
