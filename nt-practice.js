/* ========================================
   NEUROTRANSMITTERS PRACTICE PAGE
   One "questions you miss most" session
   per part of the course (a part is a group
   of units), scoped to this course's own
   progress and mistake data.
======================================== */

const NT_PRACTICE_SESSION_SIZE = 8;
const NT_PRACTICE_XP_PER_CORRECT = 5;

let ntPracticeQuestions = [];
let ntPracticeIndex = 0;
let ntPracticeCorrectIndex = null;
let ntPracticeSelected = null;
let ntPracticeChecked = false;
let ntPracticeSessionCorrect = 0;


function shuffleNtPractice(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function ntPartAsUnit(part) {

    const lessons = [];

    ntCourseData.forEach(function (unit) {

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


function ntUnitCompletedLessonCount(unit) {

    return unit.lessons.filter(function (lesson) {
        return isNtLessonComplete(lesson.id);
    }).length;
}


function ntUnitMissedCount(unit) {

    let count = 0;

    unit.lessons.forEach(function (lesson) {

        const questions =
            ntAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            if (getNtMistakeCount(lesson.id, index) > 0) {
                count++;
            }
        });
    });

    return count;
}


function buildNtPracticePool(unit) {

    const missed = [];
    const all = [];

    unit.lessons.forEach(function (lesson) {

        const questions =
            ntAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            const entry = {
                lessonId: lesson.id,
                questionIndex: index,
                question: question
            };

            all.push(entry);

            const mistakeCount =
                getNtMistakeCount(lesson.id, index);

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

        return missed.slice(0, NT_PRACTICE_SESSION_SIZE);
    }

    return shuffleNtPractice(all).slice(0, NT_PRACTICE_SESSION_SIZE);
}


function renderNtPracticeHub() {

    const grid =
        document.getElementById("ntPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        ntCourseParts.map(ntPartAsUnit).map(function (unit) {

            const completedCount =
                ntUnitCompletedLessonCount(unit);

            const missedCount =
                ntUnitMissedCount(unit);

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

            startNtPracticeSession(
                parseInt(button.dataset.unitId)
            );
        });
    });
}


function startNtPracticeSession(unitId) {

    const part =
        ntCourseParts.find(function (p) {
            return p.id === unitId;
        });

    if (!part) {
        return;
    }

    const unit = ntPartAsUnit(part);

    ntPracticeQuestions =
        buildNtPracticePool(unit);

    ntPracticeIndex = 0;
    ntPracticeSessionCorrect = 0;

    document.getElementById("ntPracticeHub").hidden = true;
    document.getElementById("ntPracticeSession").hidden = false;
    document.getElementById("ntPracticeQuizArea").hidden = false;
    document.getElementById("ntPracticeSessionComplete").hidden = true;

    document.getElementById("ntPracticeSessionTitle").textContent =
        `PART ${unit.id}`;

    loadNtPracticeQuestion();
}


function loadNtPracticeQuestion() {

    const entry =
        ntPracticeQuestions[ntPracticeIndex];

    const question =
        entry.question;

    document.getElementById("ntPracticeQuestionNumber").textContent =
        `QUESTION ${ntPracticeIndex + 1} OF ${ntPracticeQuestions.length}`;

    document.getElementById("ntPracticeQuestionText").innerHTML =
        fabFormatMath(question.question);

    const answerGrid =
        document.getElementById("ntPracticeAnswerGrid");

    answerGrid.innerHTML = "";

    const answerOrder =
        shuffleNtPractice(
            question.answers.map(function (_, index) {
                return index;
            })
        );

    ntPracticeCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach(function (originalIndex, displayIndex) {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

        button.addEventListener("click", function () {

            if (ntPracticeChecked) {
                return;
            }

            document
                .querySelectorAll("#ntPracticeAnswerGrid .answer-button")
                .forEach(function (b) {
                    b.classList.remove("selected");
                });

            button.classList.add("selected");

            ntPracticeSelected = displayIndex;

            document.getElementById("ntPracticeCheckButton").disabled = false;

            document.getElementById("ntPracticeFeedbackMessage").textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });

    document.getElementById("ntPracticeProgressFill").style.width =
        `${((ntPracticeIndex + 1) / ntPracticeQuestions.length) * 100}%`;

    document.getElementById("ntPracticeProgressText").textContent =
        `${ntPracticeIndex + 1} / ${ntPracticeQuestions.length}`;

    document.getElementById("ntPracticeCheckButton").textContent =
        "Check Answer";

    document.getElementById("ntPracticeCheckButton").disabled = true;

    ntPracticeSelected = null;
    ntPracticeChecked = false;

    document.getElementById("ntPracticeFeedbackMessage").textContent =
        "Select an answer to continue.";
}


function handleNtPracticeCheck() {

    if (ntPracticeSelected === null) {
        return;
    }

    const checkButton =
        document.getElementById("ntPracticeCheckButton");

    const feedbackMessage =
        document.getElementById("ntPracticeFeedbackMessage");

    const entry =
        ntPracticeQuestions[ntPracticeIndex];

    if (!ntPracticeChecked) {

        ntPracticeChecked = true;

        const buttons =
            document.querySelectorAll("#ntPracticeAnswerGrid .answer-button");

        if (ntPracticeSelected === ntPracticeCorrectIndex) {

            buttons[ntPracticeSelected].classList.add("correct");

            feedbackMessage.textContent =
                `Correct! +${NT_PRACTICE_XP_PER_CORRECT} XP`;

            ntPracticeSessionCorrect++;

            adjustNtMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                -1
            );

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const newXP =
                previousXP + NT_PRACTICE_XP_PER_CORRECT;

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

            buttons[ntPracticeSelected].classList.add("incorrect");

            buttons[ntPracticeCorrectIndex].classList.add("correct");

            feedbackMessage.textContent =
                "Not quite. The correct answer is highlighted.";

            adjustNtMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                1
            );
        }

        checkButton.textContent =
            ntPracticeIndex === ntPracticeQuestions.length - 1
                ? "Finish Practice"
                : "Continue";

        return;
    }

    if (ntPracticeIndex < ntPracticeQuestions.length - 1) {

        ntPracticeIndex++;

        loadNtPracticeQuestion();

    } else {

        finishNtPracticeSession();
    }
}


function finishNtPracticeSession() {

    document.getElementById("ntPracticeQuizArea").hidden = true;
    document.getElementById("ntPracticeSessionComplete").hidden = false;

    const total =
        ntPracticeQuestions.length;

    document.getElementById("ntPracticeSessionStats").textContent =
        `${ntPracticeSessionCorrect} / ${total} correct this round.`;
}


function backToNtPracticeHub() {

    document.getElementById("ntPracticeSession").hidden = true;
    document.getElementById("ntPracticeHub").hidden = false;

    renderNtPracticeHub();
}


function initNtPracticePage() {

    const grid =
        document.getElementById("ntPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    renderNtPracticeHub();

    document
        .getElementById("ntPracticeCheckButton")
        .addEventListener("click", handleNtPracticeCheck);

    document
        .getElementById("ntPracticeBackButton")
        .addEventListener("click", backToNtPracticeHub);

    document
        .getElementById("ntPracticeDoneButton")
        .addEventListener("click", backToNtPracticeHub);
}


initNtPracticePage();
