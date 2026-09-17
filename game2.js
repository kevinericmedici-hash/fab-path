/* ========================================
   GAME 2 — SPOT THE EQUIPMENT
   Unit 2: Cleanroom Fundamentals
======================================== */

const equipmentCategories = [

    {
        id: "gowning",
        label: "Gowning & PPE",
        icon: "🥼"
    },

    {
        id: "airflow",
        label: "Airflow & Contamination Control",
        icon: "🌬️"
    },

    {
        id: "process",
        label: "Process Equipment",
        icon: "⚙️"
    },

    {
        id: "inspection",
        label: "Inspection & Metrology",
        icon: "🔬"
    },

    {
        id: "safety",
        label: "Safety Equipment",
        icon: "🚨"
    }

];


const equipmentDeck = [

    {
        icon: equipmentArt.bunnySuit,
        name: "Bunny Suit",
        category: "gowning",
        desc: "A full-body coverall worn over street clothes to trap skin flakes and fabric fibers before they can reach the wafer."
    },

    {
        icon: equipmentArt.gloves,
        name: "Cleanroom Gloves",
        category: "gowning",
        desc: "Nitrile gloves that keep skin oils, salts, and fingerprints off wafer surfaces during handling."
    },

    {
        icon: equipmentArt.hoodBooties,
        name: "Hood & Booties",
        category: "gowning",
        desc: "Cover hair and shoes — two of the biggest particle sources a person carries into a cleanroom."
    },

    {
        icon: equipmentArt.hepaFilter,
        name: "HEPA / ULPA Filter",
        category: "airflow",
        desc: "Traps sub-micron airborne particles, filtering the air before it ever enters the cleanroom."
    },

    {
        icon: equipmentArt.laminarHood,
        name: "Laminar Flow Hood",
        category: "airflow",
        desc: "Pushes a steady, one-directional curtain of filtered air across a workbench to keep particles away from exposed wafers."
    },

    {
        icon: equipmentArt.airShower,
        name: "Air Shower",
        category: "airflow",
        desc: "Blasts jets of filtered air over a gowned worker right before cleanroom entry, knocking loose particles off the suit."
    },

    {
        icon: equipmentArt.spinCoater,
        name: "Spin Coater",
        category: "process",
        desc: "Spins a wafer at high speed to spread liquid photoresist into a thin, uniform film."
    },

    {
        icon: equipmentArt.maskAligner,
        name: "Mask Aligner",
        category: "process",
        desc: "Precisely lines up a photomask over the wafer, then exposes the photoresist to UV light through it."
    },

    {
        icon: equipmentArt.wetBench,
        name: "Wet Bench",
        category: "process",
        desc: "A ventilated station with chemical baths used for wet etching and wafer cleaning."
    },

    {
        icon: equipmentArt.plasmaEtcher,
        name: "Plasma (RIE) Etcher",
        category: "process",
        desc: "Uses reactive plasma gas inside a vacuum chamber to etch patterns into a wafer without any liquid chemicals."
    },

    {
        icon: equipmentArt.lpcvdFurnace,
        name: "LPCVD Furnace",
        category: "process",
        desc: "Heats wafers inside a low-pressure tube to deposit thin films like polysilicon or silicon nitride."
    },

    {
        icon: equipmentArt.opticalMicroscope,
        name: "Optical Microscope",
        category: "inspection",
        desc: "The everyday tool for spotting visible defects, particles, and pattern misalignment."
    },

    {
        icon: equipmentArt.sem,
        name: "SEM",
        category: "inspection",
        desc: "Uses a focused electron beam instead of light, resolving features far smaller than an optical microscope ever could."
    },

    {
        icon: equipmentArt.profilometer,
        name: "Profilometer",
        category: "inspection",
        desc: "Drags a fine stylus across the wafer surface to measure step height and film thickness."
    },

    {
        icon: equipmentArt.fumeHood,
        name: "Fume Hood",
        category: "safety",
        desc: "A ventilated enclosure that pulls hazardous chemical vapors away from the operator's face."
    },

    {
        icon: equipmentArt.eyewash,
        name: "Eyewash Station",
        category: "safety",
        desc: "An emergency station for immediately rinsing chemicals out of the eyes."
    }

];


const GAME2_XP_REWARD = 40;
const GAME2_COMPLETE_KEY = "fabPathGame2Complete";

let deckOrder = [];
let cardIndex = 0;
let correctCount = 0;
let mistakeCount = 0;


function shuffleDeck(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function categoryFor(id) {

    return equipmentCategories.find(function (cat) {
        return cat.id === id;
    });
}


function renderCategoryButtons() {

    const categoryGrid =
        document.getElementById("categoryGrid");

    if (!categoryGrid) {
        return;
    }

    categoryGrid.innerHTML = "";

    equipmentCategories.forEach(function (cat) {

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "category-button";
        button.dataset.categoryId = cat.id;

        button.innerHTML = `
            <span class="category-button-icon">${cat.icon}</span>
            <span class="category-button-label">${cat.label}</span>
        `;

        button.addEventListener("click", function () {
            handleCategoryClick(cat.id, button);
        });

        categoryGrid.appendChild(button);
    });
}


function renderCard() {

    const item =
        deckOrder[cardIndex];

    if (!item) {
        return;
    }

    document.getElementById("equipmentIcon").innerHTML =
        item.icon;

    document.getElementById("equipmentName").textContent =
        item.name;

    document.getElementById("equipmentDesc").textContent =
        item.desc;

    document.getElementById("gameProgressText").textContent =
        `${cardIndex + 1} / ${deckOrder.length}`;

    const progress =
        ((cardIndex + 1) / deckOrder.length) * 100;

    document.getElementById("gameProgressFill").style.width =
        `${progress}%`;

    setFeedback(
        "Tap the category this equipment belongs to."
    );

    document
        .querySelectorAll(".category-button")
        .forEach(function (btn) {
            btn.classList.remove("correct", "wrong", "disabled");
        });
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function handleCategoryClick(categoryId, buttonEl) {

    if (buttonEl.classList.contains("disabled")) {
        return;
    }

    const item =
        deckOrder[cardIndex];

    if (categoryId === item.category) {

        correctCount++;

        buttonEl.classList.add("correct");

        document
            .querySelectorAll(".category-button")
            .forEach(function (btn) {
                btn.classList.add("disabled");
            });

        setFeedback(
            `Correct — ${item.name} belongs in ${categoryFor(item.category).label}.`
        );

        setTimeout(function () {

            cardIndex++;

            if (cardIndex >= deckOrder.length) {

                completeGame();

            } else {

                renderCard();
            }

        }, 700);

    } else {

        mistakeCount++;

        buttonEl.classList.add("wrong");

        setFeedback(
            "Not quite — think about what stage of the process this is used in."
        );

        setTimeout(function () {
            buttonEl.classList.remove("wrong");
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


    if (gameCompleteStats) {

        gameCompleteStats.textContent =
            mistakeCount === 0
                ? `${deckOrder.length} for ${deckOrder.length} — perfect run, no mistakes.`
                : `${deckOrder.length} for ${deckOrder.length}, with ${mistakeCount} mistake${mistakeCount === 1 ? "" : "s"} along the way.`;
    }


    const alreadyComplete =
        localStorage.getItem(GAME2_COMPLETE_KEY) === "true";

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME2_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME2_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME2_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME2_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }


    if (gameRecap) {

        gameRecap.innerHTML =
            equipmentCategories.map(function (cat) {

                const itemsInCategory =
                    equipmentDeck.filter(function (item) {
                        return item.category === cat.id;
                    });

                const rows =
                    itemsInCategory.map(function (item) {

                        return `
                            <div class="game-recap-row">
                                <span class="game-recap-emoji">${item.icon}</span>
                                <span class="game-recap-label">${item.name}</span>
                            </div>
                        `;

                    }).join("");

                return `
                    <div class="recap-category-group">
                        <p class="recap-category-title">
                            ${cat.icon} ${cat.label}
                        </p>
                        ${rows}
                    </div>
                `;

            }).join("");
    }
}


function resetGame() {

    deckOrder = shuffleDeck(equipmentDeck);
    cardIndex = 0;
    correctCount = 0;
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

    renderCard();
}


function initSpotTheEquipmentGame() {

    const categoryGrid =
        document.getElementById("categoryGrid");

    if (!categoryGrid) {
        return;
    }

    renderCategoryButtons();
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


initSpotTheEquipmentGame();
