/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP COURSE ENGINE
   Self-contained: progress tracking, path
   rendering, and quiz logic for the
   Blood-Brain Barrier on a Chip course. Namespaced with
   "fabPathBbb" localStorage keys and
   "bbb"-prefixed element ids so it
   never collides with the MEMS course's
   script.js, which is loaded on the same
   pages for the shared streak/XP header.
======================================== */

function isBbbLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            `fabPathBbbLesson${lessonId}Complete`
        ) === "true"
    );
}


function isBbbUnitStudyComplete(unitId) {

    if (
        localStorage.getItem(
            `fabPathBbbUnit${unitId}StudyComplete`
        ) === "true"
    ) {
        return true;
    }

    /* Units were split into smaller ones after some progress was saved,
       so a finished lesson also counts as a finished study module. */

    const unit =
        bbbCourseData.find(function (u) {
            return u.id === unitId;
        });

    return (
        !!unit &&
        unit.lessons.some(function (lesson) {
            return isBbbLessonComplete(lesson.id);
        })
    );
}


function isBbbUnitUnlocked(unitIndex) {

    if (unitIndex === 0) {
        return true;
    }

    const previousUnit =
        bbbCourseData[unitIndex - 1];

    const lastLesson =
        previousUnit.lessons[previousUnit.lessons.length - 1];

    return isBbbLessonComplete(lastLesson.id);
}


function isBbbLessonUnlocked(unit, lessonIndex) {

    if (lessonIndex === 0) {
        return isBbbUnitStudyComplete(unit.id);
    }

    return isBbbLessonComplete(
        unit.lessons[lessonIndex - 1].id
    );
}


function getBbbAllLessons() {

    const lessons = [];

    bbbCourseData.forEach(function (unit) {
        unit.lessons.forEach(function (lesson) {
            lessons.push(lesson);
        });
    });

    return lessons;
}


function getBbbCompletedLessonCount() {

    return getBbbAllLessons().filter(function (lesson) {
        return isBbbLessonComplete(lesson.id);
    }).length;
}


/* ========================================
   MISTAKE TRACKING
   Powers the Blood-Brain Barrier on a Chip "questions you
   get wrong most" practice sessions. Uses
   its own localStorage blob so lesson ids
   never collide with the MEMS course's
   mistake tracking (both courses start
   numbering lessons at 1).
======================================== */

function getBbbMistakeCounts() {

    return (
        JSON.parse(
            localStorage.getItem("fabPathBbbMistakes")
        ) || {}
    );
}


function adjustBbbMistakeCount(lessonId, questionIndex, delta) {

    const mistakes =
        getBbbMistakeCounts();

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
        "fabPathBbbMistakes",
        JSON.stringify(mistakes)
    );
}


function getBbbMistakeCount(lessonId, questionIndex) {

    const mistakes =
        getBbbMistakeCounts();

    return mistakes[`${lessonId}_${questionIndex}`] || 0;
}


function createBbbStudyNode(unit, unitIndex) {

    const complete =
        isBbbUnitStudyComplete(unit.id);

    const unlocked =
        isBbbUnitUnlocked(unitIndex);

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


function createBbbLessonNode(unit, lesson, lessonIndex) {

    const complete =
        isBbbLessonComplete(lesson.id);

    const unlocked =
        isBbbLessonUnlocked(unit, lessonIndex);

    let statusClass = "locked";
    let circleContent = "🔒";
    let href = "#";

    if (complete) {

        statusClass = "complete";
        circleContent = "✓";
        href = `bbblesson${lesson.id}.html`;

    } else if (unlocked) {

        statusClass = "available";
        circleContent = lesson.id;
        href = `bbblesson${lesson.id}.html`;
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


function renderBbbLearningPath() {

    const container =
        document.getElementById("bbbLearningPath");

    if (!container) {
        return;
    }

    let html = "";

    bbbCourseData.forEach(function (unit, unitIndex) {

        const part =
            bbbCourseParts.find(function (p) {
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

        html += createBbbStudyNode(unit, unitIndex);
        html += `<div class="vertical-path"></div>`;

        unit.lessons.forEach(function (lesson, lessonIndex) {

            html += createBbbLessonNode(unit, lesson, lessonIndex);

            const isLast =
                lessonIndex === unit.lessons.length - 1;

            if (!isLast) {
                html += `<div class="vertical-path"></div>`;
            }
        });
    });

    container.innerHTML = html;

    updateBbbCourseProgress();
}


function updateBbbCourseProgress() {

    const progressFill =
        document.getElementById("bbbProgressFill");

    const progressText =
        document.getElementById("bbbProgressText");

    const total =
        getBbbAllLessons().length;

    const completed =
        getBbbCompletedLessonCount();

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

    const certLink =
        document.getElementById("bbbCertificateLink");

    if (certLink) {

        certLink.hidden = percent < 100;

        if (!certLink.dataset.wired) {

            certLink.dataset.wired = "true";

            certLink.addEventListener("click", function (event) {

                event.preventDefault();

                if (window.FabCertificate) {

                    window.FabCertificate.showCourseComplete({
                        courseTitle: "Blood-Brain Barrier on a Chip",
                        courseSlug: "blood-brain-barrier-chip",
                        lessonCount: getBbbAllLessons().length
                    });
                }
            });
        }
    }
}


renderBbbLearningPath();


/* ========================================
   FAB CHALLENGE QUIZZES
   Shared logic for any bbblessonN.html
   page. Elements use a "bbb" prefix so
   they never collide with script.js's own
   (MEMS-only) quiz element lookups.
======================================== */

function shuffleBbbArray(array) {

    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function initBbbLessonQuiz(lessonId, questions) {

    const questionText =
        document.getElementById("bbbQuestionText");

    if (!questionText) {
        return;
    }

    const questionNumber =
        document.getElementById("bbbQuestionNumber");

    const answerGrid =
        document.getElementById("bbbAnswerGrid");

    const checkButton =
        document.getElementById("bbbCheckButton");

    const feedbackMessage =
        document.getElementById("bbbFeedbackMessage");

    const lessonProgress =
        document.getElementById("bbbLessonProgress");

    const xpDisplay =
        document.getElementById("bbbXpDisplay");

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
            shuffleBbbArray(
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
                    .querySelectorAll("#bbbAnswerGrid .answer-button")
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
                document.querySelectorAll("#bbbAnswerGrid .answer-button");

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

                adjustBbbMistakeCount(
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
                `fabPathBbbLesson${lessonId}Complete`;

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

            /* bbb-course-data.js isn't loaded on lesson pages,
               only on bbb-learn.html, so this is a literal. */

            const BBB_FINAL_LESSON_ID = 17;

            if (lessonId === BBB_FINAL_LESSON_ID && window.FabCertificate) {

                window.FabCertificate.showCourseComplete({
                    courseTitle: "Blood-Brain Barrier on a Chip",
                    courseSlug: "blood-brain-barrier-chip",
                    lessonCount: BBB_FINAL_LESSON_ID,
                    onContinue: function () {
                        window.location.href = "bbb-learn.html";
                    }
                });

            } else {

                window.location.href = "bbb-learn.html";
            }
        }
    });

    loadQuestion();
}
