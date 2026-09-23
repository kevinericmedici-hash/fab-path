/* ========================================
   SAND TO CHIP COURSE ENGINE
   Self-contained: progress tracking, path
   rendering, and quiz logic for the
   Sand to Chip course. Namespaced with
   "fabPathChip" localStorage keys and
   "chip"-prefixed element ids so it
   never collides with the MEMS course's
   script.js, which is loaded on the same
   pages for the shared streak/XP header.
======================================== */

function isChipLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            `fabPathChipLesson${lessonId}Complete`
        ) === "true"
    );
}


function isChipUnitStudyComplete(unitId) {

    if (
        localStorage.getItem(
            `fabPathChipUnit${unitId}StudyComplete`
        ) === "true"
    ) {
        return true;
    }

    /* Units were split into smaller ones after some progress was saved,
       so a finished lesson also counts as a finished study module. */

    const unit =
        chipCourseData.find(function (u) {
            return u.id === unitId;
        });

    return (
        !!unit &&
        unit.lessons.some(function (lesson) {
            return isChipLessonComplete(lesson.id);
        })
    );
}


function isChipUnitUnlocked(unitIndex) {

    if (unitIndex === 0) {
        return true;
    }

    const previousUnit =
        chipCourseData[unitIndex - 1];

    const lastLesson =
        previousUnit.lessons[previousUnit.lessons.length - 1];

    return isChipLessonComplete(lastLesson.id);
}


function isChipLessonUnlocked(unit, lessonIndex) {

    if (lessonIndex === 0) {
        return isChipUnitStudyComplete(unit.id);
    }

    return isChipLessonComplete(
        unit.lessons[lessonIndex - 1].id
    );
}


function getChipAllLessons() {

    const lessons = [];

    chipCourseData.forEach(function (unit) {
        unit.lessons.forEach(function (lesson) {
            lessons.push(lesson);
        });
    });

    return lessons;
}


function getChipCompletedLessonCount() {

    return getChipAllLessons().filter(function (lesson) {
        return isChipLessonComplete(lesson.id);
    }).length;
}


/* ========================================
   MISTAKE TRACKING
   Powers the Sand to Chip "questions you
   get wrong most" practice sessions. Uses
   its own localStorage blob so lesson ids
   never collide with the MEMS course's
   mistake tracking (both courses start
   numbering lessons at 1).
======================================== */

function getChipMistakeCounts() {

    return (
        JSON.parse(
            localStorage.getItem("fabPathChipMistakes")
        ) || {}
    );
}


function adjustChipMistakeCount(lessonId, questionIndex, delta) {

    const mistakes =
        getChipMistakeCounts();

    const key =
        `${lessonId}_${questionIndex}`;

    const current =
        mistakes[key] || 0;

    const next =
        Math.max(0, current + delta);

    if (next === 0) {

        delete mistakes[key];

    } else {

        mistakes[key] = next;
    }

    localStorage.setItem(
        "fabPathChipMistakes",
        JSON.stringify(mistakes)
    );
}


function getChipMistakeCount(lessonId, questionIndex) {

    const mistakes =
        getChipMistakeCounts();

    return mistakes[`${lessonId}_${questionIndex}`] || 0;
}


function createChipStudyNode(unit, unitIndex) {

    const complete =
        isChipUnitStudyComplete(unit.id);

    const unlocked =
        isChipUnitUnlocked(unitIndex);

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
                <span>UNIT ${unit.id} · STUDY</span>
                <h3>${unit.studyModule.title}</h3>
                <p>A few quick slides, then the Fab Challenge.</p>
            </div>

        </a>
    `;
}


function createChipLessonNode(unit, lesson, lessonIndex) {

    const complete =
        isChipLessonComplete(lesson.id);

    const unlocked =
        isChipLessonUnlocked(unit, lessonIndex);

    let statusClass = "locked";
    let circleContent = "🔒";
    let href = "#";

    if (complete) {

        statusClass = "complete";
        circleContent = "✓";
        href = `chiplesson${lesson.id}.html`;

    } else if (unlocked) {

        statusClass = "available";
        circleContent = lesson.id;
        href = `chiplesson${lesson.id}.html`;
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


function renderChipLearningPath() {

    const container =
        document.getElementById("chipLearningPath");

    if (!container) {
        return;
    }

    let html = "";

    chipCourseData.forEach(function (unit, unitIndex) {

        const part =
            chipCourseParts.find(function (p) {
                return p.firstUnitId === unit.id;
            });

        if (part) {

            html += `
                <div class="unit-banner">
                    <span>PART ${part.id} · UNITS ${part.firstUnitId}–${part.lastUnitId}</span>
                    <h2>${part.title}</h2>
                    <p>${part.description}</p>
                </div>
            `;

        } else {

            html += `<div class="vertical-path"></div>`;
        }

        html += createChipStudyNode(unit, unitIndex);
        html += `<div class="vertical-path"></div>`;

        unit.lessons.forEach(function (lesson, lessonIndex) {

            html += createChipLessonNode(unit, lesson, lessonIndex);

            const isLast =
                lessonIndex === unit.lessons.length - 1;

            if (!isLast) {
                html += `<div class="vertical-path"></div>`;
            }
        });
    });

    container.innerHTML = html;

    updateChipCourseProgress();
}


function updateChipCourseProgress() {

    const progressFill =
        document.getElementById("chipProgressFill");

    const progressText =
        document.getElementById("chipProgressText");

    const total =
        getChipAllLessons().length;

    const completed =
        getChipCompletedLessonCount();

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


renderChipLearningPath();


/* ========================================
   FAB CHALLENGE QUIZZES
   Shared logic for any chiplessonN.html
   page. Elements use a "chip" prefix so
   they never collide with script.js's own
   (MEMS-only) quiz element lookups.
======================================== */

function shuffleChipArray(array) {

    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function initChipLessonQuiz(lessonId, questions) {

    const questionText =
        document.getElementById("chipQuestionText");

    if (!questionText) {
        return;
    }

    const questionNumber =
        document.getElementById("chipQuestionNumber");

    const answerGrid =
        document.getElementById("chipAnswerGrid");

    const checkButton =
        document.getElementById("chipCheckButton");

    const feedbackMessage =
        document.getElementById("chipFeedbackMessage");

    const lessonProgress =
        document.getElementById("chipLessonProgress");

    const xpDisplay =
        document.getElementById("chipXpDisplay");

    let currentQuestion = 0;
    let selectedAnswer = null;
    let currentCorrectIndex = null;
    let xp = 0;
    let answerChecked = false;


    function loadQuestion() {

        const question =
            questions[currentQuestion];

        questionText.innerHTML =
            fabFormatMath(question.question);

        questionNumber.textContent =
            `QUESTION ${currentQuestion + 1} OF ${questions.length}`;

        answerGrid.innerHTML = "";

        const answerOrder =
            shuffleChipArray(
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

            button.innerHTML =
                fabFormatMath(question.answers[originalIndex]);

            button.addEventListener("click", function () {

                if (answerChecked) {
                    return;
                }

                document
                    .querySelectorAll("#chipAnswerGrid .answer-button")
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
                document.querySelectorAll("#chipAnswerGrid .answer-button");

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

                adjustChipMistakeCount(
                    lessonId,
                    currentQuestion,
                    1
                );
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
                `fabPathChipLesson${lessonId}Complete`;

            const alreadyComplete =
                localStorage.getItem(completionKey) === "true";

            if (!alreadyComplete) {

                localStorage.setItem(
                    "fabPathXP",
                    (previousXP + xp).toString()
                );
            }

            localStorage.setItem(completionKey, "true");

            /* The streak is shared across all courses. */

            if (typeof updateStreakOnLessonComplete === "function") {
                updateStreakOnLessonComplete();
            }

            window.location.href = "chip-learn.html";
        }
    });

    loadQuestion();
}
