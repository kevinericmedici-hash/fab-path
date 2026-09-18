/* ========================================
   GAME 6 — BUILD THE DISPLAY
   Unit 6: Optical MEMS Design
======================================== */

const partsCatalog = {

    torsionBeam: {
        name: "Torsion Beam",
        desc: "A thin torsional spring the mirror support hangs from.",
        device: "dmd"
    },

    mirrorSupport: {
        name: "Mirror Support",
        desc: "H-shaped structure suspended above the substrate.",
        device: "dmd"
    },

    centralPost: {
        name: "Central Post",
        desc: "Elevates the mirror above the support plane.",
        device: "dmd"
    },

    actuationElectrodes: {
        name: "Actuation Electrodes",
        desc: "Beneath the support, tip it about the torsion axis.",
        device: "dmd"
    },

    landingPads: {
        name: "Landing Pads",
        desc: "Prevent the tilted mirror from short-circuiting.",
        device: "dmd"
    },

    diffractionRibbons: {
        name: "Diffraction-Grating Ribbons",
        desc: "An array of electrostatically actuated ribbons that diffract light.",
        device: "glv"
    },

    reflectiveSubstrate: {
        name: "Reflective Substrate",
        desc: "Sits beneath the ribbons and reflects light that isn't diffracted away.",
        device: "glv"
    },

    deformableMembrane: {
        name: "Deformable Reflective Membrane",
        desc: "A self-supporting membrane that acts as one mirror of the cavity.",
        device: "mirasol"
    },

    thinFilmStack: {
        name: "Thin-Film Stack",
        desc: "A fixed layer stack that acts as the second mirror.",
        device: "mirasol"
    },

    transparentSubstrate: {
        name: "Transparent Substrate",
        desc: "Holds both mirror components, letting light reach them.",
        device: "mirasol"
    }

};


const devices = [

    {
        id: "dmd",
        name: "Digital Micromirror Device",
        shortName: "DMD",
        icon: "🪞",
        parts: [
            "torsionBeam",
            "mirrorSupport",
            "centralPost",
            "actuationElectrodes",
            "landingPads"
        ],
        blurb: "A tilting mirror that reflects light toward the lens, or deflects it away — a clean binary switch."
    },

    {
        id: "glv",
        name: "Grating Light Valve",
        shortName: "GLV",
        icon: "🎞️",
        parts: [
            "diffractionRibbons",
            "reflectiveSubstrate"
        ],
        blurb: "An array of ribbons that diffract light instead of reflecting it — ribbon spacing controls color."
    },

    {
        id: "mirasol",
        name: "Mirasol Display",
        shortName: "Mirasol",
        icon: "🌈",
        parts: [
            "deformableMembrane",
            "thinFilmStack",
            "transparentSubstrate"
        ],
        blurb: "A deformable membrane and a fixed film stack form a resonant cavity — the gap between them sets the color."
    }

];


const TOTAL_PARTS =
    devices.reduce(function (sum, device) {
        return sum + device.parts.length;
    }, 0);

const GAME6_XP_REWARD = 60;
const GAME6_COMPLETE_KEY = "fabPathGame6Complete";

let phaseIndex = 0;
let gatheredThisPhase = [];
let gatheredAllPhases = {};
let phaseDecoys = [];
let totalGathered = 0;
let mistakeCount = 0;


function shuffleArray(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function pickDecoys(currentDeviceId, count) {

    const otherPartIds =
        Object.keys(partsCatalog).filter(function (id) {
            return partsCatalog[id].device !== currentDeviceId;
        });

    return shuffleArray(otherPartIds).slice(0, count);
}


function currentDevice() {

    return devices[phaseIndex];
}


function updateProgress() {

    document.getElementById("gameProgressText").textContent =
        `${totalGathered} / ${TOTAL_PARTS}`;

    document.getElementById("gameProgressFill").style.width =
        `${(totalGathered / TOTAL_PARTS) * 100}%`;
}


function renderPhaseHeader() {

    const device =
        currentDevice();

    document.getElementById("devicePhaseIcon").textContent =
        device.icon;

    document.getElementById("devicePhaseLabel").textContent =
        `DEVICE ${phaseIndex + 1} OF ${devices.length}`;

    document.getElementById("devicePhaseName").textContent =
        device.name;
}


function renderBuildZone() {

    const buildZone =
        document.getElementById("buildZone");

    if (gatheredThisPhase.length === 0) {

        buildZone.innerHTML =
            `<p class="build-zone-empty">No parts gathered yet.</p>`;

        return;
    }

    buildZone.innerHTML =
        gatheredThisPhase.map(function (partId) {

            const part =
                partsCatalog[partId];

            return `
                <div class="build-part">
                    <span class="build-part-icon">${opticsPartsArt[partId]}</span>
                    <span class="build-part-name">${part.name}</span>
                </div>
            `;

        }).join("");
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function renderTray() {

    const tileGrid =
        document.getElementById("tileGrid");

    tileGrid.innerHTML = "";

    const device =
        currentDevice();

    const remainingCorrect =
        device.parts.filter(function (partId) {
            return gatheredThisPhase.indexOf(partId) === -1;
        });

    const trayIds =
        shuffleArray(remainingCorrect.concat(phaseDecoys));

    trayIds.forEach(function (partId) {

        const part =
            partsCatalog[partId];

        const tile =
            document.createElement("button");

        tile.type = "button";
        tile.className = "game-tile";
        tile.dataset.partId = partId;

        tile.innerHTML = `
            <span class="game-tile-emoji part-tile-icon">${opticsPartsArt[partId]}</span>
            <span class="game-tile-label">${part.name}</span>
        `;

        tile.addEventListener("click", function () {
            handlePartClick(partId, tile);
        });

        tileGrid.appendChild(tile);
    });
}


function handlePartClick(partId, tileEl) {

    const device =
        currentDevice();

    const part =
        partsCatalog[partId];

    if (part.device === device.id) {

        gatheredThisPhase.push(partId);
        totalGathered++;

        renderBuildZone();
        renderTray();
        updateProgress();

        if (gatheredThisPhase.length === device.parts.length) {

            showPhaseComplete();

        } else {

            setFeedback(
                `${part.name} added. ${device.parts.length - gatheredThisPhase.length} to go.`
            );
        }

    } else {

        mistakeCount++;

        tileEl.classList.add("wrong");

        const actualDevice =
            devices.find(function (d) {
                return d.id === part.device;
            });

        setFeedback(
            `${part.name} isn't part of the ${device.shortName} — that belongs to the ${actualDevice.shortName}.`
        );

        setTimeout(function () {
            tileEl.classList.remove("wrong");
        }, 400);
    }
}


function showPhaseComplete() {

    const device =
        currentDevice();

    gatheredAllPhases[device.id] =
        gatheredThisPhase.slice();

    document.getElementById("tileGrid").innerHTML = "";

    setFeedback("");

    const phaseCompletePanel =
        document.getElementById("phaseCompletePanel");

    const isLastPhase =
        phaseIndex === devices.length - 1;

    document.getElementById("phaseCompleteTitle").textContent =
        `✅ ${device.shortName} complete!`;

    document.getElementById("phaseCompleteBlurb").textContent =
        device.blurb;

    const continueButton =
        document.getElementById("continueButton");

    continueButton.textContent =
        isLastPhase
            ? "Finish the build →"
            : `Next: Build the ${devices[phaseIndex + 1].shortName} →`;

    phaseCompletePanel.hidden = false;
}


function advancePhase() {

    const phaseCompletePanel =
        document.getElementById("phaseCompletePanel");

    phaseCompletePanel.hidden = true;

    if (phaseIndex >= devices.length - 1) {

        completeGame();
        return;
    }

    phaseIndex++;
    gatheredThisPhase = [];
    phaseDecoys =
        pickDecoys(currentDevice().id, 3);

    renderPhaseHeader();
    renderBuildZone();
    renderTray();
    updateProgress();

    setFeedback(
        "Tap the parts that belong to this device."
    );
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
                ? `${TOTAL_PARTS} for ${TOTAL_PARTS} — every part correct, no mistakes.`
                : `${TOTAL_PARTS} for ${TOTAL_PARTS}, with ${mistakeCount} wrong part${mistakeCount === 1 ? "" : "s"} picked up along the way.`;
    }


    const alreadyComplete =
        localStorage.getItem(GAME6_COMPLETE_KEY) === "true";

    if (!alreadyComplete) {

        const previousXP =
            parseInt(
                localStorage.getItem("fabPathXP")
            ) || 0;

        localStorage.setItem(
            "fabPathXP",
            (previousXP + GAME6_XP_REWARD).toString()
        );

        localStorage.setItem(
            GAME6_COMPLETE_KEY,
            "true"
        );

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + GAME6_XP_REWARD;
        }

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                `+${GAME6_XP_REWARD} XP`;
        }

    } else {

        if (gameCompleteXP) {

            gameCompleteXP.textContent =
                "Already earned — nice replay!";
        }
    }


    if (gameRecap) {

        gameRecap.innerHTML =
            devices.map(function (device) {

                const rows =
                    device.parts.map(function (partId) {

                        const part =
                            partsCatalog[partId];

                        return `
                            <div class="game-recap-row">
                                <span class="game-recap-emoji">${opticsPartsArt[partId]}</span>
                                <span class="game-recap-label">${part.name}</span>
                            </div>
                        `;

                    }).join("");

                return `
                    <div class="recap-category-group">
                        <p class="recap-category-title">
                            ${device.icon} ${device.name}
                        </p>
                        ${rows}
                    </div>
                `;

            }).join("");
    }
}


function resetGame() {

    phaseIndex = 0;
    gatheredThisPhase = [];
    gatheredAllPhases = {};
    totalGathered = 0;
    mistakeCount = 0;

    phaseDecoys =
        pickDecoys(currentDevice().id, 3);

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

    document.getElementById("phaseCompletePanel").hidden = true;

    setFeedback(
        "Tap the parts that belong to this device."
    );

    renderPhaseHeader();
    renderBuildZone();
    renderTray();
    updateProgress();
}


function initBuildTheDisplayGame() {

    const tileGrid =
        document.getElementById("tileGrid");

    if (!tileGrid) {
        return;
    }

    resetGame();

    document
        .getElementById("continueButton")
        .addEventListener("click", advancePhase);

    const playAgainButton =
        document.getElementById("playAgainButton");

    if (playAgainButton) {

        playAgainButton.addEventListener(
            "click",
            resetGame
        );
    }
}


initBuildTheDisplayGame();
