/* ========================================
   BIOFETS & MOSFETS PRACTICE PAGE
   One "questions you miss most" session
   per part of the course (a part is a group
   of units), scoped to this course's own
   progress and mistake data.
======================================== */

const FET_PRACTICE_SESSION_SIZE = 8;
const FET_PRACTICE_XP_PER_CORRECT = 5;

let fetPracticeQuestions = [];
let fetPracticeIndex = 0;
let fetPracticeCorrectIndex = null;
let fetPracticeSelected = null;
let fetPracticeChecked = false;
let fetPracticeSessionCorrect = 0;


function shuffleFetPractice(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function fetPartAsUnit(part) {

    const lessons = [];

    fetCourseData.forEach(function (unit) {

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


function fetUnitCompletedLessonCount(unit) {

    return unit.lessons.filter(function (lesson) {
        return isFetLessonComplete(lesson.id);
    }).length;
}


function fetUnitMissedCount(unit) {

    let count = 0;

    unit.lessons.forEach(function (lesson) {

        const questions =
            fetAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            if (getFetMistakeCount(lesson.id, index) > 0) {
                count++;
            }
        });
    });

    return count;
}


function buildFetPracticePool(unit) {

    const missed = [];
    const all = [];

    unit.lessons.forEach(function (lesson) {

        const questions =
            fetAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            const entry = {
                lessonId: lesson.id,
                questionIndex: index,
                question: question
            };

            all.push(entry);

            const mistakeCount =
                getFetMistakeCount(lesson.id, index);

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

        return missed.slice(0, FET_PRACTICE_SESSION_SIZE);
    }

    return shuffleFetPractice(all).slice(0, FET_PRACTICE_SESSION_SIZE);
}


function renderFetPracticeHub() {

    const grid =
        document.getElementById("fetPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        fetCourseParts.map(fetPartAsUnit).map(function (unit) {

            const completedCount =
                fetUnitCompletedLessonCount(unit);

            const missedCount =
                fetUnitMissedCount(unit);

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

            startFetPracticeSession(
                parseInt(button.dataset.unitId)
            );
        });
    });
}


function startFetPracticeSession(unitId) {

    const part =
        fetCourseParts.find(function (p) {
            return p.id === unitId;
        });

    if (!part) {
        return;
    }

    const unit = fetPartAsUnit(part);

    fetPracticeQuestions =
        buildFetPracticePool(unit);

    fetPracticeIndex = 0;
    fetPracticeSessionCorrect = 0;

    document.getElementById("fetPracticeHub").hidden = true;
    document.getElementById("fetPracticeSession").hidden = false;
    document.getElementById("fetPracticeQuizArea").hidden = false;
    document.getElementById("fetPracticeSessionComplete").hidden = true;

    document.getElementById("fetPracticeSessionTitle").textContent =
        `PART ${unit.id}`;

    loadFetPracticeQuestion();
}


function loadFetPracticeQuestion() {

    const entry =
        fetPracticeQuestions[fetPracticeIndex];

    const question =
        entry.question;

    document.getElementById("fetPracticeQuestionNumber").textContent =
        `QUESTION ${fetPracticeIndex + 1} OF ${fetPracticeQuestions.length}`;

    document.getElementById("fetPracticeQuestionText").innerHTML =
        fabFormatMath(question.question);

    const answerGrid =
        document.getElementById("fetPracticeAnswerGrid");

    answerGrid.innerHTML = "";

    const answerOrder =
        shuffleFetPractice(
            question.answers.map(function (_, index) {
                return index;
            })
        );

    fetPracticeCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach(function (originalIndex, displayIndex) {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

        button.addEventListener("click", function () {

            if (fetPracticeChecked) {
                return;
            }

            document
                .querySelectorAll("#fetPracticeAnswerGrid .answer-button")
                .forEach(function (b) {
                    b.classList.remove("selected");
                });

            button.classList.add("selected");

            fetPracticeSelected = displayIndex;

            document.getElementById("fetPracticeCheckButton").disabled = false;

            document.getElementById("fetPracticeFeedbackMessage").textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });

    document.getElementById("fetPracticeProgressFill").style.width =
        `${((fetPracticeIndex + 1) / fetPracticeQuestions.length) * 100}%`;

    document.getElementById("fetPracticeProgressText").textContent =
        `${fetPracticeIndex + 1} / ${fetPracticeQuestions.length}`;

    document.getElementById("fetPracticeCheckButton").textContent =
        "Check Answer";

    document.getElementById("fetPracticeCheckButton").disabled = true;

    fetPracticeSelected = null;
    fetPracticeChecked = false;

    document.getElementById("fetPracticeFeedbackMessage").textContent =
        "Select an answer to continue.";
}


function handleFetPracticeCheck() {

    if (fetPracticeSelected === null) {
        return;
    }

    const checkButton =
        document.getElementById("fetPracticeCheckButton");

    const feedbackMessage =
        document.getElementById("fetPracticeFeedbackMessage");

    const entry =
        fetPracticeQuestions[fetPracticeIndex];

    if (!fetPracticeChecked) {

        fetPracticeChecked = true;

        const buttons =
            document.querySelectorAll("#fetPracticeAnswerGrid .answer-button");

        if (fetPracticeSelected === fetPracticeCorrectIndex) {

            buttons[fetPracticeSelected].classList.add("correct");

            feedbackMessage.textContent =
                `Correct! +${FET_PRACTICE_XP_PER_CORRECT} XP`;

            fetPracticeSessionCorrect++;

            adjustFetMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                -1
            );

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const newXP =
                previousXP + FET_PRACTICE_XP_PER_CORRECT;

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

            buttons[fetPracticeSelected].classList.add("incorrect");

            buttons[fetPracticeCorrectIndex].classList.add("correct");

            feedbackMessage.textContent =
                "Not quite. The correct answer is highlighted.";

            adjustFetMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                1
            );
        }

        checkButton.textContent =
            fetPracticeIndex === fetPracticeQuestions.length - 1
                ? "Finish Practice"
                : "Continue";

        return;
    }

    if (fetPracticeIndex < fetPracticeQuestions.length - 1) {

        fetPracticeIndex++;

        loadFetPracticeQuestion();

    } else {

        finishFetPracticeSession();
    }
}


function finishFetPracticeSession() {

    document.getElementById("fetPracticeQuizArea").hidden = true;
    document.getElementById("fetPracticeSessionComplete").hidden = false;

    const total =
        fetPracticeQuestions.length;

    document.getElementById("fetPracticeSessionStats").textContent =
        `${fetPracticeSessionCorrect} / ${total} correct this round.`;
}


function backToFetPracticeHub() {

    document.getElementById("fetPracticeSession").hidden = true;
    document.getElementById("fetPracticeHub").hidden = false;

    renderFetPracticeHub();
}


function initFetPracticePage() {

    const grid =
        document.getElementById("fetPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    renderFetPracticeHub();

    document
        .getElementById("fetPracticeCheckButton")
        .addEventListener("click", handleFetPracticeCheck);

    document
        .getElementById("fetPracticeBackButton")
        .addEventListener("click", backToFetPracticeHub);

    document
        .getElementById("fetPracticeDoneButton")
        .addEventListener("click", backToFetPracticeHub);
}


initFetPracticePage();
