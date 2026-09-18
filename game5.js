/* ========================================
   GAME 5 — ACCELEROMETER DESIGN LAB
   Unit 5: MEMS Accelerometer Design
======================================== */

const partsCatalog = {

    proofMass: {
        name: "Proof Mass",
        desc: "The suspended comb structure that moves in response to acceleration.",
        icon: accelPartsArt.proofMass,
        correct: true
    },

    anchor: {
        name: "Anchor",
        desc: "Fixes the spring structure to the substrate.",
        icon: accelPartsArt.anchor,
        correct: true
    },

    foldedSprings: {
        name: "Folded Springs",
        desc: "Flexible beams that suspend the proof mass and set the spring constant.",
        icon: accelPartsArt.foldedSprings,
        correct: true
    },

    fixedFingers: {
        name: "Fixed Sense Fingers",
        desc: "Stationary polysilicon electrodes that interleave with fingers on the moving mass.",
        icon: accelPartsArt.fixedFingers,
        correct: true
    },

    positionSenseRegion: {
        name: "Position Sense Region",
        desc: "42 cells that measure the mass's displacement capacitively.",
        icon: accelPartsArt.positionSenseRegion,
        correct: true
    },

    selfTestRegion: {
        name: "Self-Test Region",
        desc: "12 cells that electrostatically shake the mass to test it.",
        icon: accelPartsArt.selfTestRegion,
        correct: true
    },

    torsionBeam: {
        name: "Torsion Beam",
        desc: "A torsional spring a tilting mirror hangs from.",
        icon: opticsPartsArt.torsionBeam,
        correct: false,
        actualPlace: "the DMD (Unit 6)"
    },

    diffractionRibbons: {
        name: "Diffraction-Grating Ribbons",
        desc: "An array of ribbons that diffract light instead of reflecting it.",
        icon: opticsPartsArt.diffractionRibbons,
        correct: false,
        actualPlace: "the GLV (Unit 6)"
    },

    thinFilmStack: {
        name: "Thin-Film Stack",
        desc: "A fixed layer stack that acts as a mirror.",
        icon: opticsPartsArt.thinFilmStack,
        correct: false,
        actualPlace: "the Mirasol display (Unit 6)"
    }

};

const CORRECT_PART_IDS = [
    "proofMass",
    "anchor",
    "foldedSprings",
    "fixedFingers",
    "positionSenseRegion",
    "selfTestRegion"
];

const DECOY_PART_IDS = [
    "torsionBeam",
    "diffractionRibbons",
    "thinFilmStack"
];

const TOTAL_STEPS = CORRECT_PART_IDS.length + 1;

const GAME5_XP_REWARD = 60;
const GAME5_COMPLETE_KEY = "fabPathGame5Complete";

const KB = 1.380649e-23;
const TEMP_K = 300;
const AIR_VISCOSITY = 1.8e-5;
const PROOF_MASS_AREA = 2.5e-8;

const TARGET_FREQ_HZ = 24700;
const FREQ_TOLERANCE = 0.2;
const TARGET_Q = 120;
const Q_TOLERANCE = 0.35;

let gatheredParts = [];
let mistakeCount = 0;
let tuneLocked = false;


function shuffleArray(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function updateProgress() {

    const stepsDone =
        tuneLocked
            ? TOTAL_STEPS
            : gatheredParts.length;

    document.getElementById("gameProgressText").textContent =
        `${stepsDone} / ${TOTAL_STEPS}`;

    document.getElementById("gameProgressFill").style.width =
        `${(stepsDone / TOTAL_STEPS) * 100}%`;
}


function setFeedback(text) {

    const feedback =
        document.getElementById("gameFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function setTuneFeedback(text) {

    const feedback =
        document.getElementById("tuneFeedback");

    if (feedback) {
        feedback.textContent = text;
    }
}


function renderBuildZone() {

    const buildZone =
        document.getElementById("buildZone");

    if (gatheredParts.length === 0) {

        buildZone.innerHTML =
            `<p class="build-zone-empty">No parts gathered yet.</p>`;

        return;
    }

    buildZone.innerHTML =
        gatheredParts.map(function (partId) {

            const part =
                partsCatalog[partId];

            return `
                <div class="build-part">
                    <span class="build-part-icon">${part.icon}</span>
                    <span class="build-part-name">${part.name}</span>
                </div>
            `;

        }).join("");
}


function renderTray() {

    const tileGrid =
        document.getElementById("tileGrid");

    tileGrid.innerHTML = "";

    const remainingCorrect =
        CORRECT_PART_IDS.filter(function (partId) {
            return gatheredParts.indexOf(partId) === -1;
        });

    const trayIds =
        shuffleArray(remainingCorrect.concat(DECOY_PART_IDS));

    trayIds.forEach(function (partId) {

        const part =
            partsCatalog[partId];

        const tile =
            document.createElement("button");

        tile.type = "button";
        tile.className = "game-tile";
        tile.dataset.partId = partId;

        tile.innerHTML = `
            <span class="game-tile-emoji part-tile-icon">${part.icon}</span>
            <span class="game-tile-label">${part.name}</span>
        `;

        tile.addEventListener("click", function () {
            handlePartClick(partId, tile);
        });

        tileGrid.appendChild(tile);
    });
}


function handlePartClick(partId, tileEl) {

    const part =
        partsCatalog[partId];

    if (part.correct) {

        gatheredParts.push(partId);

        renderBuildZone();
        renderTray();
        updateProgress();

        if (gatheredParts.length === CORRECT_PART_IDS.length) {

            showPhaseComplete();

        } else {

            setFeedback(
                `${part.name} added. ${CORRECT_PART_IDS.length - gatheredParts.length} to go.`
            );
        }

    } else {

        mistakeCount++;

        tileEl.classList.add("wrong");

        setFeedback(
            `${part.name} isn't part of a MEMS accelerometer — that's from ${part.actualPlace}.`
        );

        setTimeout(function () {
            tileEl.classList.remove("wrong");
        }, 400);
    }
}


function showPhaseComplete() {

    document.getElementById("tileGrid").innerHTML = "";

    setFeedback("");

    document.getElementById("phaseCompletePanel").hidden = false;
}


function advancePhase() {

    document.getElementById("gameBoard").hidden = true;
    document.getElementById("tunePhase").hidden = false;

    updateTuning();
    updateProgress();
}


function computeReadings(massNg, springK, gapUm) {

    const mass =
        massNg * 1e-12;

    const gap =
        gapUm * 1e-6;

    const omega0 =
        Math.sqrt(springK / mass);

    const f0 =
        omega0 / (2 * Math.PI);

    const damping =
        (AIR_VISCOSITY * PROOF_MASS_AREA) / gap;

    const q =
        (mass * omega0) / damping;

    const sensitivitySI =
        mass / springK;

    const sensitivityNmPerG =
        sensitivitySI * 9.81 * 1e9;

    const tneaSI =
        Math.sqrt(4 * KB * TEMP_K * damping) / mass;

    const tneaMicroG =
        (tneaSI / 9.81) * 1e6;

    return {
        f0: f0,
        q: q,
        sensitivity: sensitivityNmPerG,
        tnea: tneaMicroG
    };
}


function currentTuneValues() {

    const massNg =
        parseFloat(document.getElementById("massSlider").value);

    const springK =
        parseFloat(document.getElementById("springSlider").value);

    const gapUm =
        parseFloat(document.getElementById("gapSlider2").value);

    return { massNg, springK, gapUm };
}


function formatFreq(hz) {

    if (hz >= 1000) {
        return `${(hz / 1000).toFixed(1)} kHz`;
    }

    return `${hz.toFixed(0)} Hz`;
}


function updateTuning() {

    const { massNg, springK, gapUm } =
        currentTuneValues();

    document.getElementById("massValue").textContent =
        `${massNg.toFixed(0)} ng`;

    document.getElementById("springValue").textContent =
        `${springK.toFixed(1)} N/m`;

    document.getElementById("gapValue2").textContent =
        `${gapUm.toFixed(1)} µm`;

    document.getElementById("accelGapText").textContent =
        `air gap: ${gapUm.toFixed(1)} µm`;

    const massMin = 50;
    const massMax = 500;
    const widthMin = 50;
    const widthMax = 115;
    const heightMin = 26;
    const heightMax = 58;

    const massFrac =
        (massNg - massMin) / (massMax - massMin);

    const rectWidth =
        widthMin + massFrac * (widthMax - widthMin);

    const rectHeight =
        heightMin + massFrac * (heightMax - heightMin);

    const massRect =
        document.getElementById("accelMassRect");

    massRect.setAttribute("width", rectWidth.toFixed(1));
    massRect.setAttribute("height", rectHeight.toFixed(1));
    massRect.setAttribute("x", (150 - rectWidth / 2).toFixed(1));
    massRect.setAttribute("y", (85 - rectHeight / 2).toFixed(1));

    const gapMin = 0.5;
    const gapMax = 5;
    const gapHeightMin = 4;
    const gapHeightMax = 32;

    const gapFrac =
        (gapUm - gapMin) / (gapMax - gapMin);

    const gapRectHeight =
        gapHeightMin + gapFrac * (gapHeightMax - gapHeightMin);

    document.getElementById("accelGapRect").setAttribute(
        "height",
        gapRectHeight.toFixed(1)
    );

    const kMin = 1;
    const kMax = 20;
    const ampMax = 15;
    const ampMin = 3;

    const kFrac =
        (springK - kMin) / (kMax - kMin);

    const amplitude =
        ampMax - kFrac * (ampMax - ampMin);

    document.getElementById("springLeft").setAttribute(
        "d",
        `M32 24 L${32 - amplitude} 34 L${32 + amplitude} 46 L32 60`
    );

    document.getElementById("springRight").setAttribute(
        "d",
        `M268 24 L${268 - amplitude} 34 L${268 + amplitude} 46 L268 60`
    );

    const readings =
        computeReadings(massNg, springK, gapUm);

    document.getElementById("freqReadout").textContent =
        formatFreq(readings.f0);

    document.getElementById("qReadout").textContent =
        readings.q.toFixed(0);

    document.getElementById("sensReadout").textContent =
        `${readings.sensitivity.toFixed(2)} nm/g`;

    document.getElementById("tneaReadout").textContent =
        `${readings.tnea.toFixed(1)} µg/√Hz`;

    return readings;
}


function handleTuneLockIn() {

    const { massNg, springK, gapUm } =
        currentTuneValues();

    const readings =
        computeReadings(massNg, springK, gapUm);

    const freqLower =
        TARGET_FREQ_HZ * (1 - FREQ_TOLERANCE);

    const freqUpper =
        TARGET_FREQ_HZ * (1 + FREQ_TOLERANCE);

    const qLower =
        TARGET_Q * (1 - Q_TOLERANCE);

    const qUpper =
        TARGET_Q * (1 + Q_TOLERANCE);

    const freqOK =
        readings.f0 >= freqLower && readings.f0 <= freqUpper;

    const qOK =
        readings.q >= qLower && readings.q <= qUpper;

    if (freqOK && qOK) {

        tuneLocked = true;

        setTuneFeedback(
            `Locked in — ${formatFreq(readings.f0)}, Q ≈ ${readings.q.toFixed(0)}. That's a working accelerometer.`
        );

        completeGame(readings);
        return;
    }

    mistakeCount++;

    const tuneLockInButton =
        document.getElementById("tuneLockInButton");

    if (tuneLockInButton) {

        tuneLockInButton.classList.add("wrong");

        setTimeout(function () {
            tuneLockInButton.classList.remove("wrong");
        }, 400);
    }

    if (!freqOK) {

        if (readings.f0 > freqUpper) {

            setTuneFeedback(
                "Frequency's too high — try more mass, or a softer spring."
            );

        } else {

            setTuneFeedback(
                "Frequency's too low — try less mass, or a stiffer spring."
            );
        }

        return;
    }

    if (readings.q > qUpper) {

        setTuneFeedback(
            "Q is too high — close the air gap a bit for more damping."
        );

    } else {

        setTuneFeedback(
            "Q is too low — open the air gap a bit to cut the damping."
        );
    }
}


function completeGame(finalReadings) {

    const gameComplete =
        document.getElementById("gameComplete");

    const tunePhase =
        document.getElementById("tunePhase");

    if (tunePhase) {
        tunePhase.hidden = true;
    }

    if (gameComplete) {
        gameComplete.hidden = false;
    }

    updateProgress();

    const gameCompleteStats =
        document.getElementById("gameCompleteStats");

    if (gameCompleteStats) {

        gameCompleteStats.textContent =
            mistakeCount === 0
                ? "6 parts assembled and the design nailed on the first try."
                : `6 parts assembled, with ${mistakeCount} wrong pick${mistakeCount === 1 ? "" : "s"} or off-target lock-in${mistakeCount === 1 ? "" : "s"} along the way.`;
    }

    const accelFinalGrid =
        document.getElementById("accelFinalGrid");

    if (accelFinalGrid && finalReadings) {

        accelFinalGrid.innerHTML = `
            <div class="accel-readout-box">
                <p class="accel-readout-label">Natural frequency</p>
                <p class="accel-readout-value">${formatFreq(finalReadings.f0)}</p>
            </div>
            <div class="accel-readout-box">
                <p class="accel-readout-label">Quality factor</p>
                <p class="accel-readout-value">${finalReadings.q.toFixed(0)}</p>
            </div>
            <div class="accel-readout-box">
                <p class="accel-readout-label">Sensitivity</p>
                <p class="accel-readout-value">${finalReadings.sensitivity.toFixed(2)} nm/g</p>
            </div>
            <div class="accel-readout-box">
                <p class="accel-readout-label">TNEA (noise floor)</p>
                <p class="accel-readout-value">${finalReadings.tnea.toFixed(1)} µg/√Hz</p>
            </div>
        `;
    }

    const gameRecap =
        document.getElementById("gameRecap");

    if (gameRecap) {

        const rows =
            CORRECT_PART_IDS.map(function (partId) {

                const part =
                    partsCatalog[partId];

                return `
                    <div class="game-recap-row">
                        <span class="game-recap-emoji">${part.icon}</span>
                        <span class="game-recap-label">${part.name}</span>
                    </div>
                `;

            }).join("");

        gameRecap.innerHTML = `
            <div class="recap-category-group">
                <p class="recap-category-title">
                    🛠️ Sensor cell parts
                </p>
                ${rows}
            </div>
        `;
    }

    const alreadyComplete =
        localStorage.getItem(GAME5_COMPLETE_KEY) === "true";

    const gameCompleteXP =
        document.getElementById("gameCompleteXP");

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

    gatheredParts = [];
    mistakeCount = 0;
    tuneLocked = false;

    document.getElementById("gameBoard").hidden = false;
    document.getElementById("tunePhase").hidden = true;
    document.getElementById("gameComplete").hidden = true;
    document.getElementById("phaseCompletePanel").hidden = true;

    document.getElementById("massSlider").value = 150;
    document.getElementById("springSlider").value = 10;
    document.getElementById("gapSlider2").value = 3;

    setFeedback(
        "Tap the parts that belong in a comb-finger accelerometer."
    );

    setTuneFeedback(
        "Adjust mass, spring constant, and air gap, then lock in when you're close to the real design."
    );

    renderBuildZone();
    renderTray();
    updateProgress();
    updateTuning();
}


function initAccelDesignGame() {

    const tileGrid =
        document.getElementById("tileGrid");

    if (!tileGrid) {
        return;
    }

    resetGame();

    document
        .getElementById("continueButton")
        .addEventListener("click", advancePhase);

    document
        .getElementById("massSlider")
        .addEventListener("input", updateTuning);

    document
        .getElementById("springSlider")
        .addEventListener("input", updateTuning);

    document
        .getElementById("gapSlider2")
        .addEventListener("input", updateTuning);

    document
        .getElementById("tuneLockInButton")
        .addEventListener("click", handleTuneLockIn);

    const playAgainButton =
        document.getElementById("playAgainButton");

    if (playAgainButton) {

        playAgainButton.addEventListener(
            "click",
            resetGame
        );
    }
}


initAccelDesignGame();
