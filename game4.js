/* ========================================
   GAME 4 — STACK THE LAYERS
   Unit 4: PolyMUMPs Fabrication
======================================== */

const PSG_BACKGROUND =
    "repeating-linear-gradient(45deg, rgba(170,179,207,0.28), rgba(170,179,207,0.28) 5px, rgba(170,179,207,0.08) 5px, rgba(170,179,207,0.08) 10px)";

const polyMumpsSteps = [

    {
        id: "nitride",
        rank: 1,
        type: "deposit",
        emoji: "🛡️",
        name: "Silicon Nitride",
        thickness: "0.6 µm",
        height: 31,
        background: "var(--muted)",
        textColor: "#08110f",
        sacrificial: false,
        desc: "Deposited across the whole wafer for electrical isolation — no mask needed."
    },

    {
        id: "poly0-dep",
        rank: 2,
        type: "deposit",
        emoji: "⚪",
        name: "Poly0",
        thickness: "0.5 µm",
        height: 30,
        background: "var(--text)",
        textColor: "#08110f",
        sacrificial: false,
        desc: "LPCVD deposits a blanket polysilicon film across the whole wafer."
    },

    {
        id: "poly0-pattern",
        rank: 3,
        type: "pattern",
        mask: "Mask 1 · POLY0",
        name: "Pattern Poly0",
        layerId: "poly0-dep",
        desc: "Photoresist and etching shape Poly0 into the ground plane and wiring."
    },

    {
        id: "psg1-dep",
        rank: 4,
        type: "deposit",
        emoji: "⏳",
        name: "PSG1 (First Oxide)",
        thickness: "2.0 µm",
        height: 48,
        background: PSG_BACKGROUND,
        textColor: "var(--text)",
        sacrificial: true,
        desc: "A sacrificial oxide spacer is deposited over Poly0 — no mask needed yet."
    },

    {
        id: "dimples",
        rank: 5,
        type: "pattern",
        mask: "Mask 2 · DIMPLES",
        name: "Etch Dimples",
        layerId: "psg1-dep",
        desc: "Shallow ~750 nm dimples are etched into PSG1 — standoff bumps for Poly1."
    },

    {
        id: "anchor1",
        rank: 6,
        type: "pattern",
        mask: "Mask 3 · ANCHOR1",
        name: "Etch ANCHOR1",
        layerId: "psg1-dep",
        desc: "Holes are etched through PSG1 down to Poly0, to be filled by Poly1."
    },

    {
        id: "poly1-dep",
        rank: 7,
        type: "deposit",
        emoji: "🟢",
        name: "Poly1",
        thickness: "2.0 µm",
        height: 48,
        background: "var(--accent)",
        textColor: "#08110f",
        sacrificial: false,
        desc: "Poly1 fills the ANCHOR1 holes and covers PSG1, capped with a thin PSG hard mask."
    },

    {
        id: "poly1-pattern",
        rank: 8,
        type: "pattern",
        mask: "Mask 4 · POLY1",
        name: "Pattern Poly1",
        layerId: "poly1-dep",
        desc: "The PSG hard mask helps etch Poly1 into the first structural layer."
    },

    {
        id: "psg2-dep",
        rank: 9,
        type: "deposit",
        emoji: "⏳",
        name: "PSG2 (Second Oxide)",
        thickness: "0.75 µm",
        height: 33,
        background: PSG_BACKGROUND,
        textColor: "var(--text)",
        sacrificial: true,
        desc: "A second sacrificial oxide spacer is deposited over Poly1."
    },

    {
        id: "via",
        rank: 10,
        type: "pattern",
        mask: "Mask 5 · POLY1_POLY2_VIA",
        name: "Etch the Via",
        layerId: "psg2-dep",
        desc: "Holes are etched through PSG2 down to Poly1, connecting it to Poly2."
    },

    {
        id: "anchor2",
        rank: 11,
        type: "pattern",
        mask: "Mask 6 · ANCHOR2",
        name: "Etch ANCHOR2",
        layerId: "psg2-dep",
        desc: "One etch cuts through both PSG1 and PSG2 down to Poly0, avoiding misalignment between separate holes."
    },

    {
        id: "poly2-dep",
        rank: 12,
        type: "deposit",
        emoji: "🔵",
        name: "Poly2",
        thickness: "1.5 µm",
        height: 42,
        background: "#9be8da",
        textColor: "#08110f",
        sacrificial: false,
        desc: "Poly2 fills the via and ANCHOR2 holes, capped with another thin PSG layer."
    },

    {
        id: "poly2-pattern",
        rank: 13,
        type: "pattern",
        mask: "Mask 7 · POLY2",
        name: "Pattern Poly2",
        layerId: "poly2-dep",
        desc: "Poly2 is etched into the second structural layer."
    },

    {
        id: "metal",
        rank: 14,
        type: "deposit",
        emoji: "🟡",
        name: "Metal (Lift-off)",
        thickness: "0.5 µm",
        height: 30,
        background: "linear-gradient(135deg, #ffd166, #f77f00)",
        textColor: "#2a1400",
        sacrificial: false,
        mask: "Mask 8 · METAL",
        desc: "Metal is patterned first this time: photoresist opens windows, metal deposits over everything, then lift-off removes the resist and any metal sitting on it."
    }

];


const GAME4_XP_REWARD = 60;
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


function layerRowHTML(step) {

    return `
        <div
            class="stack-layer${step.sacrificial ? " sacrificial" : ""}"
            style="height:${step.height}px; background:${step.background}; color:${step.textColor};"
            data-layer-id="${step.id}"
        >
            <span class="stack-layer-name">${step.emoji} ${step.name}</span>
            <span class="stack-layer-thickness">${step.thickness}</span>
        </div>
    `;
}


function renderStack(containerId) {

    const container =
        document.getElementById(containerId);

    if (!container) {
        return;
    }

    const placedDeposits =
        polyMumpsSteps.filter(function (step) {
            return step.type === "deposit" && step.rank < nextExpectedRank;
        });

    const rows =
        placedDeposits.slice().reverse().map(layerRowHTML).join("");

    container.innerHTML =
        rows +
        `<div class="stack-substrate">SILICON SUBSTRATE</div>`;
}


function processLogRowHTML(step) {

    return `
        <div class="process-log-row">
            <span class="process-log-check">✓</span>
            <span class="process-log-mask">${step.mask}</span>
            <span class="process-log-name">${step.name}</span>
        </div>
    `;
}


function renderProcessLog(containerId) {

    const container =
        document.getElementById(containerId);

    if (!container) {
        return;
    }

    const placedPatterns =
        polyMumpsSteps.filter(function (step) {
            return step.type === "pattern" && step.rank < nextExpectedRank;
        });

    if (placedPatterns.length === 0) {

        container.innerHTML =
            `<p class="process-log-empty">Masking steps you complete will be logged here.</p>`;

        return;
    }

    container.innerHTML =
        placedPatterns.map(processLogRowHTML).join("");
}


function renderTileGrid() {

    const tileGrid =
        document.getElementById("tileGrid");

    if (!tileGrid) {
        return;
    }

    tileGrid.innerHTML = "";

    const remaining =
        polyMumpsSteps.filter(function (step) {
            return step.rank >= nextExpectedRank;
        });

    const shuffled =
        shuffleItems(remaining);

    shuffled.forEach(function (step) {

        const tile =
            document.createElement("button");

        tile.type = "button";
        tile.className =
            step.type === "pattern"
                ? "game-tile pattern-tile"
                : "game-tile";

        tile.dataset.rank = step.rank;

        const label =
            step.type === "pattern"
                ? `${step.name} <span class="game-tile-tag">${step.mask}</span>`
                : step.mask
                    ? `${step.name} — ${step.thickness} <span class="game-tile-tag">${step.mask}</span>`
                    : `${step.name} — ${step.thickness}`;

        const emoji =
            step.type === "pattern" ? "🎯" : step.emoji;

        tile.innerHTML = `
            <span class="game-tile-emoji">${emoji}</span>
            <span class="game-tile-label">${label}</span>
        `;

        tile.addEventListener("click", function () {
            handleTileClick(step, tile);
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
        `${placedCount} / ${polyMumpsSteps.length}`;

    const progress =
        (placedCount / polyMumpsSteps.length) * 100;

    document.getElementById("gameProgressFill").style.width =
        `${progress}%`;
}


function flashLayer(layerId) {

    const layerEl =
        document.querySelector(
            `#stackVisual .stack-layer[data-layer-id="${layerId}"]`
        );

    if (!layerEl) {
        return;
    }

    layerEl.classList.add("flash");

    setTimeout(function () {
        layerEl.classList.remove("flash");
    }, 700);
}


function handleTileClick(step, tileEl) {

    if (step.rank === nextExpectedRank) {

        nextExpectedRank++;

        if (step.type === "pattern") {

            renderProcessLog("processLog");
            renderTileGrid();
            updateProgress();

            flashLayer(step.layerId);

            setFeedback(
                `${step.mask} etched. ${step.desc}`
            );

        } else {

            renderStack("stackVisual");
            renderTileGrid();
            updateProgress();

            setFeedback(
                `${step.name} deposited. What happens to the wafer next?`
            );
        }

        if (nextExpectedRank > polyMumpsSteps.length) {

            completeGame();
        }

    } else {

        mistakeCount++;

        tileEl.classList.add("wrong");

        setFeedback(
            "Not quite — check what's already been built before picking the next step."
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

    const processRecap =
        document.getElementById("processRecap");


    if (gameBoard) {
        gameBoard.hidden = true;
    }

    if (gameComplete) {
        gameComplete.hidden = false;
    }


    renderStack("finalStackVisual");


    if (gameCompleteStats) {

        const total = polyMumpsSteps.length;

        gameCompleteStats.textContent =
            mistakeCount === 0
                ? `${total} for ${total} — perfect run, no mistakes.`
                : `${total} for ${total}, with ${mistakeCount} mistake${mistakeCount === 1 ? "" : "s"} along the way.`;
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

        const deposits =
            polyMumpsSteps.filter(function (step) {
                return step.type === "deposit";
            });

        gameRecap.innerHTML =
            deposits.slice().reverse().map(function (layer) {

                return `
                    <div class="game-recap-row">
                        <span class="game-recap-emoji">${layer.emoji}</span>
                        <span class="game-recap-label">${layer.name}${layer.sacrificial ? " (sacrificial)" : ""}</span>
                        <span class="game-recap-size">${layer.thickness}</span>
                    </div>
                `;

            }).join("");
    }


    if (processRecap) {

        processRecap.innerHTML =
            polyMumpsSteps.map(function (step) {

                if (step.type === "pattern") {

                    return `
                        <div class="process-log-row">
                            <span class="process-log-check">🎯</span>
                            <span class="process-log-mask">${step.mask}</span>
                            <span class="process-log-name">${step.name}</span>
                        </div>
                    `;
                }

                return `
                    <div class="process-log-row deposit-row">
                        <span class="process-log-check">${step.emoji}</span>
                        <span class="process-log-mask">${step.mask ? step.mask : step.thickness}</span>
                        <span class="process-log-name">Deposit ${step.name}</span>
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
        "Tap the step that comes first, right on the bare substrate."
    );

    renderStack("stackVisual");
    renderProcessLog("processLog");
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
