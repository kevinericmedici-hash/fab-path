/* ========================================
   GLUCOSE SENSORS PRACTICE PAGE
   One "questions you miss most" session
   per part of the course (a part is a group
   of units), scoped to this course's own
   progress and mistake data.
======================================== */

const GLU_PRACTICE_SESSION_SIZE = 8;
const GLU_PRACTICE_XP_PER_CORRECT = 5;

let gluPracticeQuestions = [];
let gluPracticeIndex = 0;
let gluPracticeCorrectIndex = null;
let gluPracticeSelected = null;
let gluPracticeChecked = false;
let gluPracticeSessionCorrect = 0;


function shuffleGluPractice(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function gluPartAsUnit(part) {

    const lessons = [];

    gluCourseData.forEach(function (unit) {

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


function gluUnitCompletedLessonCount(unit) {

    return unit.lessons.filter(function (lesson) {
        return isGluLessonComplete(lesson.id);
    }).length;
}


function gluUnitMissedCount(unit) {

    let count = 0;

    unit.lessons.forEach(function (lesson) {

        const questions =
            gluAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            if (getGluMistakeCount(lesson.id, index) > 0) {
                count++;
            }
        });
    });

    return count;
}


function buildGluPracticePool(unit) {

    const missed = [];
    const all = [];

    unit.lessons.forEach(function (lesson) {

        const questions =
            gluAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            const entry = {
                lessonId: lesson.id,
                questionIndex: index,
                question: question
            };

            all.push(entry);

            const mistakeCount =
                getGluMistakeCount(lesson.id, index);

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

        return missed.slice(0, GLU_PRACTICE_SESSION_SIZE);
    }

    return shuffleGluPractice(all).slice(0, GLU_PRACTICE_SESSION_SIZE);
}


function renderGluPracticeHub() {

    const grid =
        document.getElementById("gluPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        gluCourseParts.map(gluPartAsUnit).map(function (unit) {

            const completedCount =
                gluUnitCompletedLessonCount(unit);

            const missedCount =
                gluUnitMissedCount(unit);

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

            startGluPracticeSession(
                parseInt(button.dataset.unitId)
            );
        });
    });
}


function startGluPracticeSession(unitId) {

    const part =
        gluCourseParts.find(function (p) {
            return p.id === unitId;
        });

    if (!part) {
        return;
    }

    const unit = gluPartAsUnit(part);

    gluPracticeQuestions =
        buildGluPracticePool(unit);

    gluPracticeIndex = 0;
    gluPracticeSessionCorrect = 0;

    document.getElementById("gluPracticeHub").hidden = true;
    document.getElementById("gluPracticeSession").hidden = false;
    document.getElementById("gluPracticeQuizArea").hidden = false;
    document.getElementById("gluPracticeSessionComplete").hidden = true;

    document.getElementById("gluPracticeSessionTitle").textContent =
        `PART ${unit.id}`;

    loadGluPracticeQuestion();
}


function loadGluPracticeQuestion() {

    const entry =
        gluPracticeQuestions[gluPracticeIndex];

    const question =
        entry.question;

    document.getElementById("gluPracticeQuestionNumber").textContent =
        `QUESTION ${gluPracticeIndex + 1} OF ${gluPracticeQuestions.length}`;

    document.getElementById("gluPracticeQuestionText").innerHTML =
        fabFormatMath(question.question);

    const answerGrid =
        document.getElementById("gluPracticeAnswerGrid");

    answerGrid.innerHTML = "";

    const answerOrder =
        shuffleGluPractice(
            question.answers.map(function (_, index) {
                return index;
            })
        );

    gluPracticeCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach(function (originalIndex, displayIndex) {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

        button.addEventListener("click", function () {

            if (gluPracticeChecked) {
                return;
            }

            document
                .querySelectorAll("#gluPracticeAnswerGrid .answer-button")
                .forEach(function (b) {
                    b.classList.remove("selected");
                });

            button.classList.add("selected");

            gluPracticeSelected = displayIndex;

            document.getElementById("gluPracticeCheckButton").disabled = false;

            document.getElementById("gluPracticeFeedbackMessage").textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });

    document.getElementById("gluPracticeProgressFill").style.width =
        `${((gluPracticeIndex + 1) / gluPracticeQuestions.length) * 100}%`;

    document.getElementById("gluPracticeProgressText").textContent =
        `${gluPracticeIndex + 1} / ${gluPracticeQuestions.length}`;

    document.getElementById("gluPracticeCheckButton").textContent =
        "Check Answer";

    document.getElementById("gluPracticeCheckButton").disabled = true;

    gluPracticeSelected = null;
    gluPracticeChecked = false;

    document.getElementById("gluPracticeFeedbackMessage").textContent =
        "Select an answer to continue.";
}


function handleGluPracticeCheck() {

    if (gluPracticeSelected === null) {
        return;
    }

    const checkButton =
        document.getElementById("gluPracticeCheckButton");

    const feedbackMessage =
        document.getElementById("gluPracticeFeedbackMessage");

    const entry =
        gluPracticeQuestions[gluPracticeIndex];

    if (!gluPracticeChecked) {

        gluPracticeChecked = true;

        const buttons =
            document.querySelectorAll("#gluPracticeAnswerGrid .answer-button");

        if (gluPracticeSelected === gluPracticeCorrectIndex) {

            buttons[gluPracticeSelected].classList.add("correct");

            feedbackMessage.textContent =
                `Correct! +${GLU_PRACTICE_XP_PER_CORRECT} XP`;

            gluPracticeSessionCorrect++;

            adjustGluMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                -1
            );

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const newXP =
                previousXP + GLU_PRACTICE_XP_PER_CORRECT;

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

            buttons[gluPracticeSelected].classList.add("incorrect");

            buttons[gluPracticeCorrectIndex].classList.add("correct");

            feedbackMessage.textContent =
                "Not quite. The correct answer is highlighted.";

            adjustGluMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                1
            );
        }

        checkButton.textContent =
            gluPracticeIndex === gluPracticeQuestions.length - 1
                ? "Finish Practice"
                : "Continue";

        return;
    }

    if (gluPracticeIndex < gluPracticeQuestions.length - 1) {

        gluPracticeIndex++;

        loadGluPracticeQuestion();

    } else {

        finishGluPracticeSession();
    }
}


function finishGluPracticeSession() {

    document.getElementById("gluPracticeQuizArea").hidden = true;
    document.getElementById("gluPracticeSessionComplete").hidden = false;

    const total =
        gluPracticeQuestions.length;

    document.getElementById("gluPracticeSessionStats").textContent =
        `${gluPracticeSessionCorrect} / ${total} correct this round.`;
}


function backToGluPracticeHub() {

    document.getElementById("gluPracticeSession").hidden = true;
    document.getElementById("gluPracticeHub").hidden = false;

    renderGluPracticeHub();
}


function initGluPracticePage() {

    const grid =
        document.getElementById("gluPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    renderGluPracticeHub();

    document
        .getElementById("gluPracticeCheckButton")
        .addEventListener("click", handleGluPracticeCheck);

    document
        .getElementById("gluPracticeBackButton")
        .addEventListener("click", backToGluPracticeHub);

    document
        .getElementById("gluPracticeDoneButton")
        .addEventListener("click", backToGluPracticeHub);
}


initGluPracticePage();
