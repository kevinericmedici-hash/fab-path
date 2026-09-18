/* ========================================
   SUPERCAPACITORS COURSE ENGINE
   Self-contained: progress tracking, path
   rendering, and quiz logic for the
   Supercapacitors course. Namespaced with
   "fabPathSupercap" localStorage keys and
   "supercap"-prefixed element ids so it
   never collides with the MEMS course's
   script.js, which is loaded on the same
   pages for the shared streak/XP header.
======================================== */

function isSupercapLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            `fabPathSupercapLesson${lessonId}Complete`
        ) === "true"
    );
}


function isSupercapUnitStudyComplete(unitId) {

    return (
        localStorage.getItem(
            `fabPathSupercapUnit${unitId}StudyComplete`
        ) === "true"
    );
}


function isSupercapUnitUnlocked(unitIndex) {

    if (unitIndex === 0) {
        return true;
    }

    const previousUnit =
        supercapCourseData[unitIndex - 1];

    const lastLesson =
        previousUnit.lessons[previousUnit.lessons.length - 1];

    return isSupercapLessonComplete(lastLesson.id);
}


function isSupercapLessonUnlocked(unit, lessonIndex) {

    if (lessonIndex === 0) {
        return isSupercapUnitStudyComplete(unit.id);
    }

    return isSupercapLessonComplete(
        unit.lessons[lessonIndex - 1].id
    );
}


function getSupercapAllLessons() {

    const lessons = [];

    supercapCourseData.forEach(function (unit) {
        unit.lessons.forEach(function (lesson) {
            lessons.push(lesson);
        });
    });

    return lessons;
}


function getSupercapCompletedLessonCount() {

    return getSupercapAllLessons().filter(function (lesson) {
        return isSupercapLessonComplete(lesson.id);
    }).length;
}


function createSupercapStudyNode(unit, unitIndex) {

    const complete =
        isSupercapUnitStudyComplete(unit.id);

    const unlocked =
        isSupercapUnitUnlocked(unitIndex);

    let statusClass = "locked";
    let icon = "🔒";
    let href = "#";

    if (complete) {

        statusClass = "complete";
        icon = "✓";
        href = unit.studyModule.href;

    } else if (unlocked) {

        statusClass = "available";
        icon = "📖";
        href = unit.studyModule.href;
    }

    return `
        <a href="${href}" class="path-node node-left ${statusClass} lesson-link">

            <div class="node-circle">
                ${icon}
            </div>

            <div class="node-info">
                <span>STUDY MODULE</span>
                <h3>${unit.studyModule.title}</h3>
                <p>Learn the core concepts before starting the lessons.</p>
            </div>

        </a>
    `;
}


function createSupercapLessonNode(unit, lesson, lessonIndex) {

    const complete =
        isSupercapLessonComplete(lesson.id);

    const unlocked =
        isSupercapLessonUnlocked(unit, lessonIndex);

    let statusClass = "locked";
    let circleContent = "🔒";
    let href = "#";

    if (complete) {

        statusClass = "complete";
        circleContent = "✓";
        href = `supercaplesson${lesson.id}.html`;

    } else if (unlocked) {

        statusClass = "available";
        circleContent = lesson.id;
        href = `supercaplesson${lesson.id}.html`;
    }

    const positionClass =
        lessonIndex % 2 === 0
            ? "node-right"
            : "node-left";

    return `
        <a href="${href}" class="path-node ${positionClass} ${statusClass} lesson-link">

            <div class="node-circle">
                ${circleContent}
            </div>

            <div class="node-info">
                <span>FAB CHALLENGE ${lesson.id}</span>
                <h3>${lesson.title}</h3>
                <p>${lesson.description}</p>
            </div>

        </a>
    `;
}


function renderSupercapLearningPath() {

    const container =
        document.getElementById("supercapLearningPath");

    if (!container) {
        return;
    }

    let html = "";

    supercapCourseData.forEach(function (unit, unitIndex) {

        html += `
            <div class="unit-banner">
                <span>UNIT ${unit.id}</span>
                <h2>${unit.title}</h2>
                <p>${unit.description}</p>
            </div>
        `;

        html += createSupercapStudyNode(unit, unitIndex);
        html += `<div class="vertical-path"></div>`;

        unit.lessons.forEach(function (lesson, lessonIndex) {

            html += createSupercapLessonNode(unit, lesson, lessonIndex);

            const isLast =
                lessonIndex === unit.lessons.length - 1;

            if (!isLast) {
                html += `<div class="vertical-path"></div>`;
            }
        });
    });

    container.innerHTML = html;

    updateSupercapCourseProgress();
}


function updateSupercapCourseProgress() {

    const progressFill =
        document.getElementById("supercapProgressFill");

    const progressText =
        document.getElementById("supercapProgressText");

    const total =
        getSupercapAllLessons().length;

    const completed =
        getSupercapCompletedLessonCount();

    const percent =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    if (progressFill) {

        progressFill.style.width =
            `${percent}%`;
    }

    if (progressText) {

        progressText.textContent =
            `${percent}% complete`;
    }
}


renderSupercapLearningPath();


/* ========================================
   FAB CHALLENGE QUIZZES
   Shared logic for any supercaplessonN.html
   page. Elements use a "supercap" prefix so
   they never collide with script.js's own
   (MEMS-only) quiz element lookups.
======================================== */

function shuffleSupercapArray(array) {

    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function initSupercapLessonQuiz(lessonId, questions) {

    const questionText =
        document.getElementById("supercapQuestionText");

    if (!questionText) {
        return;
    }

    const questionNumber =
        document.getElementById("supercapQuestionNumber");

    const answerGrid =
        document.getElementById("supercapAnswerGrid");

    const checkButton =
        document.getElementById("supercapCheckButton");

    const feedbackMessage =
        document.getElementById("supercapFeedbackMessage");

    const lessonProgress =
        document.getElementById("supercapLessonProgress");

    const xpDisplay =
        document.getElementById("supercapXpDisplay");

    let currentQuestion = 0;
    let selectedAnswer = null;
    let currentCorrectIndex = null;
    let xp = 0;
    let answerChecked = false;


    function loadQuestion() {

        const question =
            questions[currentQuestion];

        questionText.textContent =
            question.question;

        questionNumber.textContent =
            `QUESTION ${currentQuestion + 1} OF ${questions.length}`;

        answerGrid.innerHTML = "";

        const answerOrder =
            shuffleSupercapArray(
                question.answers.map(function (_, index) {
                    return index;
                })
            );

        currentCorrectIndex =
            answerOrder.indexOf(question.correct);

        answerOrder.forEach(function (originalIndex, displayIndex) {

            const button =
                document.createElement("button");

            button.className = "answer-button";

            button.textContent =
                question.answers[originalIndex];

            button.addEventListener("click", function () {

                if (answerChecked) {
                    return;
                }

                document
                    .querySelectorAll("#supercapAnswerGrid .answer-button")
                    .forEach(function (b) {
                        b.classList.remove("selected");
                    });

                button.classList.add("selected");

                selectedAnswer = displayIndex;
                checkButton.disabled = false;

                feedbackMessage.textContent =
                    "Ready to check your answer.";
            });

            answerGrid.appendChild(button);
        });

        const progress =
            ((currentQuestion + 1) / questions.length) * 100;

        lessonProgress.style.width =
            `${progress}%`;

        checkButton.textContent = "Check Answer";
        checkButton.disabled = true;

        selectedAnswer = null;
        answerChecked = false;

        feedbackMessage.textContent =
            "Select an answer to continue.";
    }


    checkButton.addEventListener("click", function () {

        if (selectedAnswer === null) {
            return;
        }

        if (!answerChecked) {

            answerChecked = true;

            const buttons =
                document.querySelectorAll("#supercapAnswerGrid .answer-button");

            if (selectedAnswer === currentCorrectIndex) {

                buttons[selectedAnswer].classList.add("correct");

                feedbackMessage.textContent =
                    "Correct! +10 XP";

                xp += 10;

                xpDisplay.textContent = xp;

            } else {

                buttons[selectedAnswer].classList.add("incorrect");
                buttons[currentCorrectIndex].classList.add("correct");

                feedbackMessage.textContent =
                    "Not quite. The correct answer is highlighted.";
            }

            checkButton.textContent =
                currentQuestion === questions.length - 1
                    ? "Finish Fab Challenge"
                    : "Continue";

            return;
        }

        if (currentQuestion < questions.length - 1) {

            currentQuestion++;

            loadQuestion();

        } else {

            const previousXP =
                parseInt(
                    localStorage.getItem("fabPathXP")
                ) || 0;

            const completionKey =
                `fabPathSupercapLesson${lessonId}Complete`;

            const alreadyComplete =
                localStorage.getItem(completionKey) === "true";

            if (!alreadyComplete) {

                localStorage.setItem(
                    "fabPathXP",
                    (previousXP + xp).toString()
                );
            }

            localStorage.setItem(completionKey, "true");

            window.location.href = "supercap-learn.html";
        }
    });

    loadQuestion();
}
