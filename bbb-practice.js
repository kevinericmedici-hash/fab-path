/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP PRACTICE PAGE
   One "questions you miss most" session
   per part of the course (a part is a group
   of units), scoped to this course's own
   progress and mistake data.
======================================== */

const BBB_PRACTICE_SESSION_SIZE = 8;
const BBB_PRACTICE_XP_PER_CORRECT = 5;

let bbbPracticeQuestions = [];
let bbbPracticeIndex = 0;
let bbbPracticeCorrectIndex = null;
let bbbPracticeSelected = null;
let bbbPracticeChecked = false;
let bbbPracticeSessionCorrect = 0;


function shuffleBbbPractice(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function bbbPartAsUnit(part) {

    const lessons = [];

    bbbCourseData.forEach(function (unit) {

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


function bbbUnitCompletedLessonCount(unit) {

    return unit.lessons.filter(function (lesson) {
        return isBbbLessonComplete(lesson.id);
    }).length;
}


function bbbUnitMissedCount(unit) {

    let count = 0;

    unit.lessons.forEach(function (lesson) {

        const questions =
            bbbAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            if (getBbbMistakeCount(lesson.id, index) > 0) {
                count++;
            }
        });
    });

    return count;
}


function buildBbbPracticePool(unit) {

    const missed = [];
    const all = [];

    unit.lessons.forEach(function (lesson) {

        const questions =
            bbbAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            const entry = {
                lessonId: lesson.id,
                questionIndex: index,
                question: question
            };

            all.push(entry);

            const mistakeCount =
                getBbbMistakeCount(lesson.id, index);

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

        return missed.slice(0, BBB_PRACTICE_SESSION_SIZE);
    }

    return shuffleBbbPractice(all).slice(0, BBB_PRACTICE_SESSION_SIZE);
}


function renderBbbPracticeHub() {

    const grid =
        document.getElementById("bbbPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        bbbCourseParts.map(bbbPartAsUnit).map(function (unit) {

            const completedCount =
                bbbUnitCompletedLessonCount(unit);

            const missedCount =
                bbbUnitMissedCount(unit);

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

            startBbbPracticeSession(
                parseInt(button.dataset.unitId)
            );
        });
    });
}


function startBbbPracticeSession(unitId) {

    const part =
        bbbCourseParts.find(function (p) {
            return p.id === unitId;
        });

    if (!part) {
        return;
    }

    const unit = bbbPartAsUnit(part);

    bbbPracticeQuestions =
        buildBbbPracticePool(unit);

    bbbPracticeIndex = 0;
    bbbPracticeSessionCorrect = 0;

    document.getElementById("bbbPracticeHub").hidden = true;
    document.getElementById("bbbPracticeSession").hidden = false;
    document.getElementById("bbbPracticeQuizArea").hidden = false;
    document.getElementById("bbbPracticeSessionComplete").hidden = true;

    document.getElementById("bbbPracticeSessionTitle").textContent =
        `PART ${unit.id}`;

    loadBbbPracticeQuestion();
}


function loadBbbPracticeQuestion() {

    const entry =
        bbbPracticeQuestions[bbbPracticeIndex];

    const question =
        entry.question;

    document.getElementById("bbbPracticeQuestionNumber").textContent =
        `QUESTION ${bbbPracticeIndex + 1} OF ${bbbPracticeQuestions.length}`;

    document.getElementById("bbbPracticeQuestionText").innerHTML =
        fabFormatMath(question.question);

    const answerGrid =
        document.getElementById("bbbPracticeAnswerGrid");

    answerGrid.innerHTML = "";

    const answerOrder =
        shuffleBbbPractice(
            question.answers.map(function (_, index) {
                return index;
            })
        );

    bbbPracticeCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach(function (originalIndex, displayIndex) {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

        button.addEventListener("click", function () {

            if (bbbPracticeChecked) {
                return;
            }

            document
                .querySelectorAll("#bbbPracticeAnswerGrid .answer-button")
                .forEach(function (b) {
                    b.classList.remove("selected");
                });

            button.classList.add("selected");

            bbbPracticeSelected = displayIndex;

            document.getElementById("bbbPracticeCheckButton").disabled = false;

            document.getElementById("bbbPracticeFeedbackMessage").textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });

    document.getElementById("bbbPracticeProgressFill").style.width =
        `${((bbbPracticeIndex + 1) / bbbPracticeQuestions.length) * 100}%`;

    document.getElementById("bbbPracticeProgressText").textContent =
        `${bbbPracticeIndex + 1} / ${bbbPracticeQuestions.length}`;

    document.getElementById("bbbPracticeCheckButton").textContent =
        "Check Answer";

    document.getElementById("bbbPracticeCheckButton").disabled = true;

    bbbPracticeSelected = null;
    bbbPracticeChecked = false;

    document.getElementById("bbbPracticeFeedbackMessage").textContent =
        "Select an answer to continue.";
}


function handleBbbPracticeCheck() {

    if (bbbPracticeSelected === null) {
        return;
    }

    const checkButton =
        document.getElementById("bbbPracticeCheckButton");

    const feedbackMessage =
        document.getElementById("bbbPracticeFeedbackMessage");

    const entry =
        bbbPracticeQuestions[bbbPracticeIndex];

    if (!bbbPracticeChecked) {

        bbbPracticeChecked = true;

        const buttons =
            document.querySelectorAll("#bbbPracticeAnswerGrid .answer-button");

        if (bbbPracticeSelected === bbbPracticeCorrectIndex) {

            buttons[bbbPracticeSelected].classList.add("correct");

            feedbackMessage.textContent =
                `Correct! +${BBB_PRACTICE_XP_PER_CORRECT} XP`;

            bbbPracticeSessionCorrect++;

            adjustBbbMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                -1
            );

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const newXP =
                previousXP + BBB_PRACTICE_XP_PER_CORRECT;

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

            buttons[bbbPracticeSelected].classList.add("incorrect");

            buttons[bbbPracticeCorrectIndex].classList.add("correct");

            feedbackMessage.textContent =
                "Not quite. The correct answer is highlighted.";

            adjustBbbMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                1
            );
        }

        checkButton.textContent =
            bbbPracticeIndex === bbbPracticeQuestions.length - 1
                ? "Finish Practice"
                : "Continue";

        return;
    }

    if (bbbPracticeIndex < bbbPracticeQuestions.length - 1) {

        bbbPracticeIndex++;

        loadBbbPracticeQuestion();

    } else {

        finishBbbPracticeSession();
    }
}


function finishBbbPracticeSession() {

    document.getElementById("bbbPracticeQuizArea").hidden = true;
    document.getElementById("bbbPracticeSessionComplete").hidden = false;

    const total =
        bbbPracticeQuestions.length;

    document.getElementById("bbbPracticeSessionStats").textContent =
        `${bbbPracticeSessionCorrect} / ${total} correct this round.`;
}


function backToBbbPracticeHub() {

    document.getElementById("bbbPracticeSession").hidden = true;
    document.getElementById("bbbPracticeHub").hidden = false;

    renderBbbPracticeHub();
}


function initBbbPracticePage() {

    const grid =
        document.getElementById("bbbPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    renderBbbPracticeHub();

    document
        .getElementById("bbbPracticeCheckButton")
        .addEventListener("click", handleBbbPracticeCheck);

    document
        .getElementById("bbbPracticeBackButton")
        .addEventListener("click", backToBbbPracticeHub);

    document
        .getElementById("bbbPracticeDoneButton")
        .addEventListener("click", backToBbbPracticeHub);
}


initBbbPracticePage();
