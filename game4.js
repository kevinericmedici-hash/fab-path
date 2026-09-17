/* ========================================
   GAME 4 — STACK THE LAYERS
   Unit 4: PolyMUMPs Fabrication
======================================== */

const polyMumpsLayers = [

    {
        id: "nitride",
        rank: 1,
        emoji: "🛡️",
        name: "Silicon Nitride",
        thickness: "0.6 µm",
        height: 31,
        background: "var(--muted)",
        textColor: "#08110f",
        sacrificial: false,
        desc: "Electrically isolates everything above it from the substrate."
    },

    {
        id: "poly0",
        rank: 2,
        emoji: "⚪",
        name: "Poly0",
        thickness: "0.5 µm",
        height: 30,
        background: "var(--text)",
        textColor: "#08110f",
        sacrificial: false,
        desc: "The fixed ground plane and wiring layer — it never moves."
    },

    {
        id: "psg1",
        rank: 3,
        emoji: "⏳",
        name: "PSG1 (First Oxide)",
        thickness: "2.0 µm",
        height: 48,
        background:
            "repeating-linear-gradient(45deg, rgba(170,179,207,0.28), rgba(170,179,207,0.28) 5px, rgba(170,179,207,0.08) 5px, rgba(170,179,207,0.08) 10px)",
        textColor: "var(--text)",
        sacrificial: true,
        desc: "A temporary spacer, dissolved away at the end to free Poly1."
    },

    {
        id: "poly1",
        rank: 4,
        emoji: "🟢",
        name: "Poly1",
        thickness: "2.0 µm",
        height: 48,
        background: "var(--accent)",
        textColor: "#08110f",
        sacrificial: false,
        desc: "The first structural layer, anchored down through holes in PSG1."
    },

    {
        id: "psg2",
        rank: 5,
        emoji: "⏳",
        name: "PSG2 (Second Oxide)",
        thickness: "0.75 µm",
        height: 33,
        background:
            "repeating-linear-gradient(45deg, rgba(170,179,207,0.28), rgba(170,179,207,0.28) 5px, rgba(170,179,207,0.08) 5px, rgba(170,179,207,0.08) 10px)",
        textColor: "var(--text)",
        sacrificial: true,
        desc: "A second temporary spacer, connecting and separating Poly1 from Poly2."
    },

    {
        id: "poly2",
        rank: 6,
        emoji: "🔵",
        name: "Poly2",
        thickness: "1.5 µm",
        height: 42,
        background: "#9be8da",
        textColor: "#08110f",
        sacrificial: false,
        desc: "The second structural layer, for parts that move independently of Poly1."
    },

    {
        id: "metal",
        rank: 7,
        emoji: "🟡",
        name: "Metal",
        thickness: "0.5 µm",
        height: 30,
        background: "linear-gradient(135deg, #ffd166, #f77f00)",
        textColor: "#2a1400",
        sacrificial: false,
        desc: "The final layer — probing pads, wire bonding, and mirror surfaces."
    }

];


const GAME4_XP_REWARD = 40;
const GAME4_COMPLETE_KEY = "fabPathGame4Complete";

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


function layerRowHTML(layer) {

    return `
        <div
            class="stack-layer${layer.sacrificial ? " sacrificial" : ""}"
            style="height:${layer.height}px; background:${layer.background}; color:${layer.textColor};"
            data-layer-id="${layer.id}"
        >
            <span class="stack-layer-name">${layer.emoji} ${layer.name}</span>
            <span class="stack-layer-thickness">${layer.thickness}</span>
        </div>
    `;
}


function renderStack(containerId) {

    const container =
        document.getElementById(containerId);

    if (!container) {
        return;
    }

    const placed =
        polyMumpsLayers.filter(function (layer) {
            return layer.rank < nextExpectedRank;
        });

    const rows =
        placed.slice().reverse().map(layerRowHTML).join("");

    container.innerHTML =
        rows +
        `<div class="stack-substrate">SILICON SUBSTRATE</div>`;
}


function renderTileGrid() {

    const tileGrid =
        document.getElementById("tileGrid");

    if (!tileGrid) {
        return;
    }

    tileGrid.innerHTML = "";

    const remaining =
        polyMumpsLayers.filter(function (layer) {
            return layer.rank >= nextExpectedRank;
        });

    const shuffled =
        shuffleItems(remaining);

    shuffled.forEach(function (layer) {

        const tile =
            document.createElement("button");

        tile.type = "button";
        tile.className = "game-tile";
        tile.dataset.rank = layer.rank;

        tile.innerHTML = `
            <span class="game-tile-emoji">${layer.emoji}</span>
            <span class="game-tile-label">${layer.name} — ${layer.thickness}</span>
        `;

        tile.addEventListener("click", function () {
            handleTileClick(layer, tile);
        });

        tileGrid.appendChild(tile);
    });
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function updateProgress() {

    const placedCount =
        nextExpectedRank - 1;

    document.getElementById("gameProgressText").textContent =
        `${placedCount} / ${polyMumpsLayers.length}`;

    const progress =
        (placedCount / polyMumpsLayers.length) * 100;

    document.getElementById("gameProgressFill").style.width =
        `${progress}%`;
}


function handleTileClick(layer, tileEl) {

    if (layer.rank === nextExpectedRank) {

        nextExpectedRank++;

        renderStack("stackVisual");
        renderTileGrid();
        updateProgress();

        if (nextExpectedRank > polyMumpsLayers.length) {

            completeGame();

        } else {

            setFeedback(
                `${layer.name} is in place. What goes on next?`
            );
        }

    } else {

        mistakeCount++;

        tileEl.classList.add("wrong");

        setFeedback(
            "Not quite — check what's already been deposited before picking the next layer."
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

    const gameCompleteStats =
        document.getElementById("gameCompleteStats");

    const gameRecap =
        document.getElementById("gameRecap");


    if (gameBoard) {
        gameBoard.hidden = true;
    }

    if (gameComplete) {
        gameComplete.hidden = false;
    }


    renderStack("finalStackVisual");


    if (gameCompleteStats) {

        gameCompleteStats.textContent =
            mistakeCount === 0
                ? "7 for 7 — perfect run, no mistakes."
                : `7 for 7, with ${mistakeCount} mistake${mistakeCount === 1 ? "" : "s"} along the way.`;
    }


    const alreadyComplete =
        localStorage.getItem(GAME4_COMPLETE_KEY) === "true";

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME4_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME4_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME4_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME4_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }


    if (gameRecap) {

        gameRecap.innerHTML =
            polyMumpsLayers.slice().reverse().map(function (layer) {

                return `
                    <div class="game-recap-row">
                        <span class="game-recap-emoji">${layer.emoji}</span>
                        <span class="game-recap-label">${layer.name}${layer.sacrificial ? " (sacrificial)" : ""}</span>
                        <span class="game-recap-size">${layer.thickness}</span>
                    </div>
                `;

            }).join("");
    }
}


function releaseStructure() {

    const finalStackVisual =
        document.getElementById("finalStackVisual");

    const releaseButton =
        document.getElementById("releaseButton");

    const releaseCaption =
        document.getElementById("releaseCaption");

    if (finalStackVisual) {

        finalStackVisual.classList.add("released");
    }

    if (releaseButton) {

        releaseButton.disabled = true;
    }

    if (releaseCaption) {

        releaseCaption.hidden = false;
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

    const finalStackVisual =
        document.getElementById("finalStackVisual");

    if (finalStackVisual) {

        finalStackVisual.classList.remove("released");
    }

    const releaseButton =
        document.getElementById("releaseButton");

    if (releaseButton) {

        releaseButton.disabled = false;
    }

    const releaseCaption =
        document.getElementById("releaseCaption");

    if (releaseCaption) {

        releaseCaption.hidden = true;
    }

    setFeedback(
        "Tap the layer that goes right on the substrate."
    );

    renderStack("stackVisual");
    renderTileGrid();
    updateProgress();
}


function initStackTheLayersGame() {

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

    const releaseButton =
        document.getElementById("releaseButton");

    if (releaseButton) {

        releaseButton.addEventListener(
            "click",
            releaseStructure
        );
    }
}


initStackTheLayersGame();
