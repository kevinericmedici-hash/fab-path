/* ========================================
   GAME 3 — MATCH THE PROCESS
   Unit 3: Microfabrication Technology
======================================== */

const processCategories = [

    {
        id: "add",
        label: "Add (Deposit)",
        icon: "➕"
    },

    {
        id: "pattern",
        label: "Pattern (Lithography)",
        icon: "🎯"
    },

    {
        id: "remove",
        label: "Remove (Etch)",
        icon: "✂️"
    },

    {
        id: "modify",
        label: "Modify (Oxidize / Dope)",
        icon: "🔥"
    }

];


const processDeck = [

    {
        icon: processArt.lpcvdNitride,
        name: "LPCVD Silicon Nitride",
        category: "add",
        desc: "Low-pressure chemical vapor deposition grows a thin nitride film across the wafer for electrical isolation."
    },

    {
        icon: processArt.sputteredMetal,
        name: "Sputtered Metal",
        category: "add",
        desc: "Atoms knocked off a target by ion bombardment travel across the chamber and deposit as a thin metal film."
    },

    {
        icon: processArt.evaporatedAluminum,
        name: "Evaporated Aluminum",
        category: "add",
        desc: "Metal is heated in a vacuum until it vaporizes, then condenses onto the cooler wafer surface."
    },

    {
        icon: processArt.polysiliconDeposit,
        name: "Polysilicon Deposition",
        category: "add",
        desc: "LPCVD deposits a polycrystalline silicon film used as a structural layer in surface micromachining."
    },

    {
        icon: processArt.photoresistCoat,
        name: "Photoresist Coating",
        category: "pattern",
        desc: "The wafer is spun at high speed to spread a light-sensitive polymer into a thin, even layer."
    },

    {
        icon: processArt.maskAlignment,
        name: "Mask Alignment",
        category: "pattern",
        desc: "A photomask is precisely positioned over the wafer so its pattern lands exactly where it needs to."
    },

    {
        icon: processArt.uvExposure,
        name: "UV Exposure",
        category: "pattern",
        desc: "Light passes through the mask and chemically changes the photoresist wherever it isn't blocked."
    },

    {
        icon: processArt.resistDevelop,
        name: "Resist Development",
        category: "pattern",
        desc: "A developer solution dissolves away resist based on light exposure, revealing the patterned mask below."
    },

    {
        icon: processArt.wetEtch,
        name: "Wet Etching",
        category: "remove",
        desc: "A liquid chemical bath dissolves exposed material, typically etching outward in all directions."
    },

    {
        icon: processArt.dryEtch,
        name: "Dry (Plasma / RIE) Etching",
        category: "remove",
        desc: "Reactive plasma gas etches straight down into a wafer with sharp, well-controlled sidewalls."
    },

    {
        icon: processArt.resistStrip,
        name: "Resist Stripping",
        category: "remove",
        desc: "Once a pattern has been transferred, the photoresist that protected it is removed entirely."
    },

    {
        icon: processArt.sacrificialRelease,
        name: "Sacrificial Layer Release",
        category: "remove",
        desc: "An HF bath dissolves a sacrificial oxide layer, freeing a suspended structure to move."
    },

    {
        icon: processArt.thermalOxidation,
        name: "Thermal Oxidation",
        category: "modify",
        desc: "The silicon surface itself reacts with oxygen at high heat, growing a layer of silicon dioxide."
    },

    {
        icon: processArt.diffusionDoping,
        name: "Diffusion Doping",
        category: "modify",
        desc: "At high temperature, dopant atoms slowly migrate into the silicon, changing its electrical properties."
    },

    {
        icon: processArt.ionImplant,
        name: "Ion Implantation",
        category: "modify",
        desc: "Dopant ions are accelerated and physically driven into the wafer to a controlled, precise depth."
    },

    {
        icon: processArt.anneal,
        name: "Anneal",
        category: "modify",
        desc: "A heat treatment step that activates dopants and relieves stress built up in a deposited film."
    }

];


const GAME3_XP_REWARD = 40;
const GAME3_COMPLETE_KEY = "fabPathGame3Complete";

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

    return processCategories.find(function (cat) {
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

    processCategories.forEach(function (cat) {

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
        "Tap what this process does to the wafer."
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
            `Correct — ${item.name} is a ${categoryFor(item.category).label} step.`
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
            "Not quite — look at what's happening to the wafer in the picture."
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
        localStorage.getItem(GAME3_COMPLETE_KEY) === "true";

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME3_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME3_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME3_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME3_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }


    if (gameRecap) {

        gameRecap.innerHTML =
            processCategories.map(function (cat) {

                const itemsInCategory =
                    processDeck.filter(function (item) {
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

    deckOrder = shuffleDeck(processDeck);
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


function initMatchTheProcessGame() {

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


initMatchTheProcessGame();
