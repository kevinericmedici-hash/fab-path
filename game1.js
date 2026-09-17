/* ========================================
   GAME 1 — THE SCALE LADDER
   Unit 1: MEMS Foundations
======================================== */

const scaleLadderItems = [

    {
        id: "atom",
        rank: 1,
        emoji: "⚛️",
        label: "Silicon atom",
        size: "~0.2 nanometers across"
    },

    {
        id: "virus",
        rank: 2,
        emoji: "🦠",
        label: "Virus",
        size: "~100 nanometers across"
    },

    {
        id: "bacterium",
        rank: 3,
        emoji: "🧫",
        label: "E. coli bacterium",
        size: "~2 micrometers long"
    },

    {
        id: "bloodcell",
        rank: 4,
        emoji: "🩸",
        label: "Red blood cell",
        size: "~7 micrometers across"
    },

    {
        id: "hair",
        rank: 5,
        emoji: "💇",
        label: "Human hair",
        size: "~80 micrometers wide"
    },

    {
        id: "memschip",
        rank: 6,
        emoji: "🔬",
        label: "MEMS accelerometer die",
        size: "~2 millimeters across"
    },

    {
        id: "human",
        rank: 7,
        emoji: "🧍",
        label: "Human being",
        size: "~1.7 meters tall"
    }

];

const GAME1_XP_REWARD = 30;
const GAME1_COMPLETE_KEY = "fabPathGame1Complete";

let nextExpectedRank = 1;
let mistakeCount = 0;


function shuffleItems(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function renderTileGrid() {

    const tileGrid =
        document.getElementById("tileGrid");

    if (!tileGrid) {
        return;
    }

    tileGrid.innerHTML = "";

    const remaining =
        scaleLadderItems.filter(function (item) {
            return item.rank >= nextExpectedRank;
        });

    const shuffled =
        shuffleItems(remaining);

    shuffled.forEach(function (item) {

        const tile =
            document.createElement("button");

        tile.type = "button";
        tile.className = "game-tile";
        tile.dataset.rank = item.rank;

        tile.innerHTML = `
            <span class="game-tile-emoji">${item.emoji}</span>
            <span class="game-tile-label">${item.label}</span>
        `;

        tile.addEventListener("click", function () {
            handleTileClick(item, tile);
        });

        tileGrid.appendChild(tile);
    });
}


function renderOrderedSlots() {

    const orderedStrip =
        document.getElementById("orderedStrip");

    if (!orderedStrip) {
        return;
    }

    orderedStrip.innerHTML = "";

    scaleLadderItems.forEach(function (item) {

        const slot =
            document.createElement("div");

        slot.className = "ordered-slot";

        if (item.rank < nextExpectedRank) {

            slot.classList.add("filled");

            slot.innerHTML = `
                <span class="ordered-slot-rank">${item.rank}</span>
                <span class="ordered-slot-emoji">${item.emoji}</span>
                <span class="ordered-slot-label">${item.label}</span>
                <span class="ordered-slot-size">${item.size}</span>
            `;

        } else {

            slot.innerHTML = `
                <span class="ordered-slot-rank">${item.rank}</span>
                <span class="ordered-slot-placeholder">?</span>
            `;
        }

        orderedStrip.appendChild(slot);
    });
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function handleTileClick(item, tileEl) {

    if (item.rank === nextExpectedRank) {

        nextExpectedRank++;

        renderOrderedSlots();
        renderTileGrid();

        if (nextExpectedRank > scaleLadderItems.length) {

            completeGame();

        } else {

            setFeedback(
                `${item.label} locked in. Keep going — find the next smallest.`
            );
        }

    } else {

        mistakeCount++;

        tileEl.classList.add("wrong");

        setFeedback(
            "Not quite — look for something smaller."
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

    const gameCompleteXP =
        document.getElementById("gameCompleteXP");

    const gameRecap =
        document.getElementById("gameRecap");


    if (gameBoard) {
        gameBoard.hidden = true;
    }

    if (gameComplete) {
        gameComplete.hidden = false;
    }


    const alreadyComplete =
        localStorage.getItem(GAME1_COMPLETE_KEY) === "true";

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME1_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME1_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME1_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME1_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }


    if (gameRecap) {

        gameRecap.innerHTML =
            scaleLadderItems.map(function (item) {

                return `
                    <div class="game-recap-row">
                        <span class="game-recap-emoji">${item.emoji}</span>
                        <span class="game-recap-label">${item.label}</span>
                        <span class="game-recap-size">${item.size}</span>
                    </div>
                `;

            }).join("");
    }
}


function resetGame() {

    nextExpectedRank = 1;
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
        "Tap the smallest item to begin."
    );

    renderOrderedSlots();
    renderTileGrid();
}


function initScaleLadderGame() {

    const tileGrid =
        document.getElementById("tileGrid");

    if (!tileGrid) {
        return;
    }

    renderOrderedSlots();
    renderTileGrid();

    const playAgainButton =
        document.getElementById("playAgainButton");

    if (playAgainButton) {

        playAgainButton.addEventListener(
            "click",
            resetGame
        );
    }
}


initScaleLadderGame();
