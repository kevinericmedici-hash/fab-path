/* ========================================
   SAND TO CHIP PRACTICE PAGE
   One "questions you miss most" session
   per part of the course (a part is a group
   of units), scoped to this course's own
   progress and mistake data.
======================================== */

const CHIP_PRACTICE_SESSION_SIZE = 8;
const CHIP_PRACTICE_XP_PER_CORRECT = 5;

let chipPracticeQuestions = [];
let chipPracticeIndex = 0;
let chipPracticeCorrectIndex = null;
let chipPracticeSelected = null;
let chipPracticeChecked = false;
let chipPracticeSessionCorrect = 0;


function shuffleChipPractice(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function chipPartAsUnit(part) {

    const lessons = [];

    chipCourseData.forEach(function (unit) {

        if (
            unit.id >= part.firstUnitId &&
            unit.id <= part.lastUnitId
        ) {
            unit.lessons.forEach(function (lesson) {
                lessons.push(lesson);
            });
        }
    });

    return {
        id: part.id,
        title: part.title,
        lessons: lessons
    };
}


function chipUnitCompletedLessonCount(unit) {

    return unit.lessons.filter(function (lesson) {
        return isChipLessonComplete(lesson.id);
    }).length;
}


function chipUnitMissedCount(unit) {

    let count = 0;

    unit.lessons.forEach(function (lesson) {

        const questions =
            chipAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            if (getChipMistakeCount(lesson.id, index) > 0) {
                count++;
            }
        });
    });

    return count;
}


function buildChipPracticePool(unit) {

    const missed = [];
    const all = [];

    unit.lessons.forEach(function (lesson) {

        const questions =
            chipAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            const entry = {
                lessonId: lesson.id,
                questionIndex: index,
                question: question
            };

            all.push(entry);

            const mistakeCount =
                getChipMistakeCount(lesson.id, index);

            if (mistakeCount > 0) {

                entry.mistakeCount = mistakeCount;

                missed.push(entry);
            }
        });
    });

    if (missed.length > 0) {

        missed.sort(function (a, b) {
            return b.mistakeCount - a.mistakeCount;
        });

        return missed.slice(0, CHIP_PRACTICE_SESSION_SIZE);
    }

    return shuffleChipPractice(all).slice(0, CHIP_PRACTICE_SESSION_SIZE);
}


function renderChipPracticeHub() {

    const grid =
        document.getElementById("chipPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        chipCourseParts.map(chipPartAsUnit).map(function (unit) {

            const completedCount =
                chipUnitCompletedLessonCount(unit);

            const missedCount =
                chipUnitMissedCount(unit);

            let statusText =
                "✅ Nothing missed yet — review anytime";

            if (missedCount > 0) {

                statusText =
                    `🎯 ${missedCount} question${missedCount === 1 ? "" : "s"} to review`;

            } else if (completedCount === 0) {

                statusText =
                    "No lessons finished yet — practice pulls from the whole part.";
            }

            return `
                <div class="practice-card">

                    <span>PART ${unit.id}</span>

                    <h2>${unit.title}</h2>

                    <p>${statusText}</p>

                    <button
                        type="button"
                        class="practice-button"
                        data-unit-id="${unit.id}"
                    >
                        Practice this part
                    </button>

                </div>
            `;

        }).join("");

    grid.querySelectorAll("button[data-unit-id]").forEach(function (button) {

        button.addEventListener("click", function () {

            startChipPracticeSession(
                parseInt(button.dataset.unitId)
            );
        });
    });
}


function startChipPracticeSession(unitId) {

    const part =
        chipCourseParts.find(function (p) {
            return p.id === unitId;
        });

    if (!part) {
        return;
    }

    const unit = chipPartAsUnit(part);

    chipPracticeQuestions =
        buildChipPracticePool(unit);

    chipPracticeIndex = 0;
    chipPracticeSessionCorrect = 0;

    document.getElementById("chipPracticeHub").hidden = true;
    document.getElementById("chipPracticeSession").hidden = false;
    document.getElementById("chipPracticeQuizArea").hidden = false;
    document.getElementById("chipPracticeSessionComplete").hidden = true;

    document.getElementById("chipPracticeSessionTitle").textContent =
        `PART ${unit.id}`;

    loadChipPracticeQuestion();
}


function loadChipPracticeQuestion() {

    const entry =
        chipPracticeQuestions[chipPracticeIndex];

    const question =
        entry.question;

    document.getElementById("chipPracticeQuestionNumber").textContent =
        `QUESTION ${chipPracticeIndex + 1} OF ${chipPracticeQuestions.length}`;

    document.getElementById("chipPracticeQuestionText").innerHTML =
        fabFormatMath(question.question);

    const answerGrid =
        document.getElementById("chipPracticeAnswerGrid");

    answerGrid.innerHTML = "";

    const answerOrder =
        shuffleChipPractice(
            question.answers.map(function (_, index) {
                return index;
            })
        );

    chipPracticeCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach(function (originalIndex, displayIndex) {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

        button.addEventListener("click", function () {

            if (chipPracticeChecked) {
                return;
            }

            document
                .querySelectorAll("#chipPracticeAnswerGrid .answer-button")
                .forEach(function (b) {
                    b.classList.remove("selected");
                });

            button.classList.add("selected");

            chipPracticeSelected = displayIndex;

            document.getElementById("chipPracticeCheckButton").disabled = false;

            document.getElementById("chipPracticeFeedbackMessage").textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });

    document.getElementById("chipPracticeProgressFill").style.width =
        `${((chipPracticeIndex + 1) / chipPracticeQuestions.length) * 100}%`;

    document.getElementById("chipPracticeProgressText").textContent =
        `${chipPracticeIndex + 1} / ${chipPracticeQuestions.length}`;

    document.getElementById("chipPracticeCheckButton").textContent =
        "Check Answer";

    document.getElementById("chipPracticeCheckButton").disabled = true;

    chipPracticeSelected = null;
    chipPracticeChecked = false;

    document.getElementById("chipPracticeFeedbackMessage").textContent =
        "Select an answer to continue.";
}


function handleChipPracticeCheck() {

    if (chipPracticeSelected === null) {
        return;
    }

    const checkButton =
        document.getElementById("chipPracticeCheckButton");

    const feedbackMessage =
        document.getElementById("chipPracticeFeedbackMessage");

    const entry =
        chipPracticeQuestions[chipPracticeIndex];

    if (!chipPracticeChecked) {

        chipPracticeChecked = true;

        const buttons =
            document.querySelectorAll("#chipPracticeAnswerGrid .answer-button");

        if (chipPracticeSelected === chipPracticeCorrectIndex) {

            buttons[chipPracticeSelected].classList.add("correct");

            feedbackMessage.textContent =
                `Correct! +${CHIP_PRACTICE_XP_PER_CORRECT} XP`;

            chipPracticeSessionCorrect++;

            adjustChipMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                -1
            );

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const newXP =
                previousXP + CHIP_PRACTICE_XP_PER_CORRECT;

            localStorage.setItem(
                "fabPathXP",
                newXP.toString()
            );

            const totalXPDisplay =
                document.getElementById("totalXPDisplay");

            if (totalXPDisplay) {

                totalXPDisplay.textContent =
                    newXP;
            }

        } else {

            buttons[chipPracticeSelected].classList.add("incorrect");

            buttons[chipPracticeCorrectIndex].classList.add("correct");

            feedbackMessage.textContent =
                "Not quite. The correct answer is highlighted.";

            adjustChipMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                1
            );
        }

        checkButton.textContent =
            chipPracticeIndex === chipPracticeQuestions.length - 1
                ? "Finish Practice"
                : "Continue";

        return;
    }

    if (chipPracticeIndex < chipPracticeQuestions.length - 1) {

        chipPracticeIndex++;

        loadChipPracticeQuestion();

    } else {

        finishChipPracticeSession();
    }
}


function finishChipPracticeSession() {

    document.getElementById("chipPracticeQuizArea").hidden = true;
    document.getElementById("chipPracticeSessionComplete").hidden = false;

    const total =
        chipPracticeQuestions.length;

    document.getElementById("chipPracticeSessionStats").textContent =
        `${chipPracticeSessionCorrect} / ${total} correct this round.`;
}


function backToChipPracticeHub() {

    document.getElementById("chipPracticeSession").hidden = true;
    document.getElementById("chipPracticeHub").hidden = false;

    renderChipPracticeHub();
}


function initChipPracticePage() {

    const grid =
        document.getElementById("chipPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    renderChipPracticeHub();

    document
        .getElementById("chipPracticeCheckButton")
        .addEventListener("click", handleChipPracticeCheck);

    document
        .getElementById("chipPracticeBackButton")
        .addEventListener("click", backToChipPracticeHub);

    document
        .getElementById("chipPracticeDoneButton")
        .addEventListener("click", backToChipPracticeHub);
}


initChipPracticePage();
