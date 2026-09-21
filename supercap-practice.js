/* ========================================
   SUPERCAPACITORS PRACTICE PAGE
   One "questions you miss most" session
   per part of the course (a part is a group
   of units), scoped to this course's own
   progress and mistake data.
======================================== */

const SUPERCAP_PRACTICE_SESSION_SIZE = 8;
const SUPERCAP_PRACTICE_XP_PER_CORRECT = 5;

let supercapPracticeQuestions = [];
let supercapPracticeIndex = 0;
let supercapPracticeCorrectIndex = null;
let supercapPracticeSelected = null;
let supercapPracticeChecked = false;
let supercapPracticeSessionCorrect = 0;


function shuffleSupercapPractice(items) {

    const result = items.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function supercapPartAsUnit(part) {

    const lessons = [];

    supercapCourseData.forEach(function (unit) {

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


function supercapUnitCompletedLessonCount(unit) {

    return unit.lessons.filter(function (lesson) {
        return isSupercapLessonComplete(lesson.id);
    }).length;
}


function supercapUnitMissedCount(unit) {

    let count = 0;

    unit.lessons.forEach(function (lesson) {

        const questions =
            supercapAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            if (getSupercapMistakeCount(lesson.id, index) > 0) {
                count++;
            }
        });
    });

    return count;
}


function buildSupercapPracticePool(unit) {

    const missed = [];
    const all = [];

    unit.lessons.forEach(function (lesson) {

        const questions =
            supercapAllLessonQuestions[lesson.id] || [];

        questions.forEach(function (question, index) {

            const entry = {
                lessonId: lesson.id,
                questionIndex: index,
                question: question
            };

            all.push(entry);

            const mistakeCount =
                getSupercapMistakeCount(lesson.id, index);

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

        return missed.slice(0, SUPERCAP_PRACTICE_SESSION_SIZE);
    }

    return shuffleSupercapPractice(all).slice(0, SUPERCAP_PRACTICE_SESSION_SIZE);
}


function renderSupercapPracticeHub() {

    const grid =
        document.getElementById("supercapPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        supercapCourseParts.map(supercapPartAsUnit).map(function (unit) {

            const completedCount =
                supercapUnitCompletedLessonCount(unit);

            const missedCount =
                supercapUnitMissedCount(unit);

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

            startSupercapPracticeSession(
                parseInt(button.dataset.unitId)
            );
        });
    });
}


function startSupercapPracticeSession(unitId) {

    const part =
        supercapCourseParts.find(function (p) {
            return p.id === unitId;
        });

    if (!part) {
        return;
    }

    const unit = supercapPartAsUnit(part);

    supercapPracticeQuestions =
        buildSupercapPracticePool(unit);

    supercapPracticeIndex = 0;
    supercapPracticeSessionCorrect = 0;

    document.getElementById("supercapPracticeHub").hidden = true;
    document.getElementById("supercapPracticeSession").hidden = false;
    document.getElementById("supercapPracticeQuizArea").hidden = false;
    document.getElementById("supercapPracticeSessionComplete").hidden = true;

    document.getElementById("supercapPracticeSessionTitle").textContent =
        `PART ${unit.id}`;

    loadSupercapPracticeQuestion();
}


function loadSupercapPracticeQuestion() {

    const entry =
        supercapPracticeQuestions[supercapPracticeIndex];

    const question =
        entry.question;

    document.getElementById("supercapPracticeQuestionNumber").textContent =
        `QUESTION ${supercapPracticeIndex + 1} OF ${supercapPracticeQuestions.length}`;

    document.getElementById("supercapPracticeQuestionText").innerHTML =
        fabFormatMath(question.question);

    const answerGrid =
        document.getElementById("supercapPracticeAnswerGrid");

    answerGrid.innerHTML = "";

    const answerOrder =
        shuffleSupercapPractice(
            question.answers.map(function (_, index) {
                return index;
            })
        );

    supercapPracticeCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach(function (originalIndex, displayIndex) {

        const button =
            document.createElement("button");

        button.className = "answer-button";

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

        button.addEventListener("click", function () {

            if (supercapPracticeChecked) {
                return;
            }

            document
                .querySelectorAll("#supercapPracticeAnswerGrid .answer-button")
                .forEach(function (b) {
                    b.classList.remove("selected");
                });

            button.classList.add("selected");

            supercapPracticeSelected = displayIndex;

            document.getElementById("supercapPracticeCheckButton").disabled = false;

            document.getElementById("supercapPracticeFeedbackMessage").textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });

    document.getElementById("supercapPracticeProgressFill").style.width =
        `${((supercapPracticeIndex + 1) / supercapPracticeQuestions.length) * 100}%`;

    document.getElementById("supercapPracticeProgressText").textContent =
        `${supercapPracticeIndex + 1} / ${supercapPracticeQuestions.length}`;

    document.getElementById("supercapPracticeCheckButton").textContent =
        "Check Answer";

    document.getElementById("supercapPracticeCheckButton").disabled = true;

    supercapPracticeSelected = null;
    supercapPracticeChecked = false;

    document.getElementById("supercapPracticeFeedbackMessage").textContent =
        "Select an answer to continue.";
}


function handleSupercapPracticeCheck() {

    if (supercapPracticeSelected === null) {
        return;
    }

    const checkButton =
        document.getElementById("supercapPracticeCheckButton");

    const feedbackMessage =
        document.getElementById("supercapPracticeFeedbackMessage");

    const entry =
        supercapPracticeQuestions[supercapPracticeIndex];

    if (!supercapPracticeChecked) {

        supercapPracticeChecked = true;

        const buttons =
            document.querySelectorAll("#supercapPracticeAnswerGrid .answer-button");

        if (supercapPracticeSelected === supercapPracticeCorrectIndex) {

            buttons[supercapPracticeSelected].classList.add("correct");

            feedbackMessage.textContent =
                `Correct! +${SUPERCAP_PRACTICE_XP_PER_CORRECT} XP`;

            supercapPracticeSessionCorrect++;

            adjustSupercapMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                -1
            );

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const newXP =
                previousXP + SUPERCAP_PRACTICE_XP_PER_CORRECT;

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

            buttons[supercapPracticeSelected].classList.add("incorrect");

            buttons[supercapPracticeCorrectIndex].classList.add("correct");

            feedbackMessage.textContent =
                "Not quite. The correct answer is highlighted.";

            adjustSupercapMistakeCount(
                entry.lessonId,
                entry.questionIndex,
                1
            );
        }

        checkButton.textContent =
            supercapPracticeIndex === supercapPracticeQuestions.length - 1
                ? "Finish Practice"
                : "Continue";

        return;
    }

    if (supercapPracticeIndex < supercapPracticeQuestions.length - 1) {

        supercapPracticeIndex++;

        loadSupercapPracticeQuestion();

    } else {

        finishSupercapPracticeSession();
    }
}


function finishSupercapPracticeSession() {

    document.getElementById("supercapPracticeQuizArea").hidden = true;
    document.getElementById("supercapPracticeSessionComplete").hidden = false;

    const total =
        supercapPracticeQuestions.length;

    document.getElementById("supercapPracticeSessionStats").textContent =
        `${supercapPracticeSessionCorrect} / ${total} correct this round.`;
}


function backToSupercapPracticeHub() {

    document.getElementById("supercapPracticeSession").hidden = true;
    document.getElementById("supercapPracticeHub").hidden = false;

    renderSupercapPracticeHub();
}


function initSupercapPracticePage() {

    const grid =
        document.getElementById("supercapPracticeUnitsGrid");

    if (!grid) {
        return;
    }

    renderSupercapPracticeHub();

    document
        .getElementById("supercapPracticeCheckButton")
        .addEventListener("click", handleSupercapPracticeCheck);

    document
        .getElementById("supercapPracticeBackButton")
        .addEventListener("click", backToSupercapPracticeHub);

    document
        .getElementById("supercapPracticeDoneButton")
        .addEventListener("click", backToSupercapPracticeHub);
}


initSupercapPracticePage();
