/* ========================================
   PRACTICE PAGE
   One "questions you miss most" session
   per part of the course (a part is a group
   of units).
======================================== */

const PRACTICE_SESSION_SIZE = 8;
const PRACTICE_XP_PER_CORRECT = 5;

let practiceQuestions = [];
let practiceIndex = 0;
let practiceCorrectIndex = null;
let practiceSelected = null;
let practiceChecked = false;
let practiceSessionCorrect = 0;


function shufflePractice(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function partAsUnit(part) {

    const lessons = [];

    courseData.forEach(function (unit) {

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


function unitCompletedLessonCount(unit) {

    return unit.lessons.filter(function (lesson) {
        return isLessonComplete(lesson.id);
    }).length;
}


function unitMissedCount(unit) {

    let count = 0;

    unit.lessons.forEach(function (lesson) {

        const questions =
            allLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            if (getMistakeCount(lesson.id, index) > 0) {
                count++;
            }
        });
    });

    return count;
}


function buildPracticePool(unit) {

    const missed = [];
    const all = [];

    unit.lessons.forEach(function (lesson) {

        const questions =
            allLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            const entry = {
                lessonId: lesson.id,
                questionIndex: index,
                question: question
            };

            all.push(entry);

            const mistakeCount =
                getMistakeCount(lesson.id, index);

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

        return missed.slice(0, PRACTICE_SESSION_SIZE);
    }

    return shufflePractice(all).slice(0, PRACTICE_SESSION_SIZE);
}


function renderPracticeHub() {

    const grid =
        document.getElementById("practiceUnitsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        courseParts.map(partAsUnit).map(function (unit) {

            const completedCount =
                unitCompletedLessonCount(unit);

            const missedCount =
                unitMissedCount(unit);

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

            startPracticeSession(
                parseInt(button.dataset.unitId)
            );
        });
    });
}


function startPracticeSession(unitId) {

    const part =
        courseParts.find(function (p) {
            return p.id === unitId;
        });

    if (!part) {
        return;
    }

    const unit = partAsUnit(part);

    practiceQuestions =
        buildPracticePool(unit);

    practiceIndex = 0;
    practiceSessionCorrect = 0;

    document.getElementById("practiceHub").hidden = true;
    document.getElementById("practiceSession").hidden = false;
    document.getElementById("practiceQuizArea").hidden = false;
    document.getElementById("practiceSessionComplete").hidden = true;

    document.getElementById("practiceSessionTitle").textContent =
        `PART ${unit.id}`;

    loadPracticeQuestion();
}


function loadPracticeQuestion() {

    const entry =
        practiceQuestions[practiceIndex];

    const question =
        entry.question;

    document.getElementById("practiceQuestionNumber").textContent =
        `QUESTION ${practiceIndex + 1} OF ${practiceQuestions.length}`;

    document.getElementById("practiceQuestionText").innerHTML =
        fabFormatMath(question.question);

    const answerGrid =
        document.getElementById("practiceAnswerGrid");

    answerGrid.innerHTML = "";

    const answerOrder =
        shufflePractice(
            question.answers.map(function (_, index) {
                return index;
            })
        );

    practiceCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach(function (originalIndex, displayIndex) {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

        button.addEventListener("click", function () {

            if (practiceChecked) {
                return;
            }

            document
                .querySelectorAll("#practiceAnswerGrid .answer-button")
                .forEach(function (b) {
                    b.classList.remove("selected");
                });

            button.classList.add("selected");

            practiceSelected = displayIndex;

            document.getElementById("practiceCheckButton").disabled = false;

            document.getElementById("practiceFeedbackMessage").textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });

    document.getElementById("practiceProgressFill").style.width =
        `${((practiceIndex + 1) / practiceQuestions.length) * 100}%`;

    document.getElementById("practiceProgressText").textContent =
        `${practiceIndex + 1} / ${practiceQuestions.length}`;

    document.getElementById("practiceCheckButton").textContent =
        "Check Answer";

    document.getElementById("practiceCheckButton").disabled = true;

    practiceSelected = null;
    practiceChecked = false;

    document.getElementById("practiceFeedbackMessage").textContent =
        "Select an answer to continue.";
}


function handlePracticeCheck() {

    if (practiceSelected === null) {
        return;
    }

    const checkButton =
        document.getElementById("practiceCheckButton");

    const feedbackMessage =
        document.getElementById("practiceFeedbackMessage");

    const entry =
        practiceQuestions[practiceIndex];

    if (!practiceChecked) {

        practiceChecked = true;

        const buttons =
            document.querySelectorAll("#practiceAnswerGrid .answer-button");

        if (practiceSelected === practiceCorrectIndex) {

            buttons[practiceSelected].classList.add("correct");

            feedbackMessage.textContent =
                `Correct! +${PRACTICE_XP_PER_CORRECT} XP`;

            practiceSessionCorrect++;

            adjustMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                -1
            );

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const newXP =
                previousXP + PRACTICE_XP_PER_CORRECT;

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

            buttons[practiceSelected].classList.add("incorrect");

            buttons[practiceCorrectIndex].classList.add("correct");

            feedbackMessage.textContent =
                "Not quite. The correct answer is highlighted.";

            adjustMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                1
            );
        }

        checkButton.textContent =
            practiceIndex === practiceQuestions.length - 1
                ? "Finish Practice"
                : "Continue";

        return;
    }

    if (practiceIndex < practiceQuestions.length - 1) {

        practiceIndex++;

        loadPracticeQuestion();

    } else {

        finishPracticeSession();
    }
}


function finishPracticeSession() {

    document.getElementById("practiceQuizArea").hidden = true;
    document.getElementById("practiceSessionComplete").hidden = false;

    const total =
        practiceQuestions.length;

    document.getElementById("practiceSessionStats").textContent =
        `${practiceSessionCorrect} / ${total} correct this round.`;
}


function backToPracticeHub() {

    document.getElementById("practiceSession").hidden = true;
    document.getElementById("practiceHub").hidden = false;

    renderPracticeHub();
}


function initPracticePage() {

    const grid =
        document.getElementById("practiceUnitsGrid");

    if (!grid) {
        return;
    }

    renderPracticeHub();

    document
        .getElementById("practiceCheckButton")
        .addEventListener("click", handlePracticeCheck);

    document
        .getElementById("practiceBackButton")
        .addEventListener("click", backToPracticeHub);

    document
        .getElementById("practiceDoneButton")
        .addEventListener("click", backToPracticeHub);
}


initPracticePage();
