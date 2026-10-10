/* ========================================
   NEUROTRANSMITTERS COURSE ENGINE
   Self-contained: progress tracking, path
   rendering, and quiz logic for the
   Neural Interface Chip course. Namespaced with
   "fabPathNt" localStorage keys and
   "nt"-prefixed element ids so it
   never collides with the MEMS course's
   script.js, which is loaded on the same
   pages for the shared streak/XP header.
======================================== */

function isNtLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            `fabPathNtLesson${lessonId}Complete`
        ) === "true"
    );
}


function isNtUnitStudyComplete(unitId) {

    if (
        localStorage.getItem(
            `fabPathNtUnit${unitId}StudyComplete`
        ) === "true"
    ) {
        return true;
    }

    /* Units were split into smaller ones after some progress was saved,
       so a finished lesson also counts as a finished study module. */

    const unit =
        ntCourseData.find(function (u) {
            return u.id === unitId;
        });

    return (
        !!unit &&
        unit.lessons.some(function (lesson) {
            return isNtLessonComplete(lesson.id);
        })
    );
}


function isNtUnitUnlocked(unitIndex) {

    if (unitIndex === 0) {
        return true;
    }

    const previousUnit =
        ntCourseData[unitIndex - 1];

    const lastLesson =
        previousUnit.lessons[previousUnit.lessons.length - 1];

    return isNtLessonComplete(lastLesson.id);
}


function isNtLessonUnlocked(unit, lessonIndex) {

    if (lessonIndex === 0) {
        return isNtUnitStudyComplete(unit.id);
    }

    return isNtLessonComplete(
        unit.lessons[lessonIndex - 1].id
    );
}


function getNtAllLessons() {

    const lessons = [];

    ntCourseData.forEach(function (unit) {
        unit.lessons.forEach(function (lesson) {
            lessons.push(lesson);
        });
    });

    return lessons;
}


function getNtCompletedLessonCount() {

    return getNtAllLessons().filter(function (lesson) {
        return isNtLessonComplete(lesson.id);
    }).length;
}


/* ========================================
   MISTAKE TRACKING
   Powers the Neural Interface Chip "questions you
   get wrong most" practice sessions. Uses
   its own localStorage blob so lesson ids
   never collide with the MEMS course's
   mistake tracking (both courses start
   numbering lessons at 1).
======================================== */

function getNtMistakeCounts() {

    return (
        JSON.parse(
            localStorage.getItem("fabPathNtMistakes")
        ) || {}
    );
}


function adjustNtMistakeCount(lessonId, questionIndex, delta) {

    const mistakes =
        getNtMistakeCounts();

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
        "fabPathNtMistakes",
        JSON.stringify(mistakes)
    );
}


function getNtMistakeCount(lessonId, questionIndex) {

    const mistakes =
        getNtMistakeCounts();

    return mistakes[`${lessonId}_${questionIndex}`] || 0;
}


function createNtStudyNode(unit, unitIndex) {

    const complete =
        isNtUnitStudyComplete(unit.id);

    const unlocked =
        isNtUnitUnlocked(unitIndex);

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


function createNtLessonNode(unit, lesson, lessonIndex) {

    const complete =
        isNtLessonComplete(lesson.id);

    const unlocked =
        isNtLessonUnlocked(unit, lessonIndex);

    let statusClass = "locked";
    let circleContent = "🔒";
    let href = "#";

    if (complete) {

        statusClass = "complete";
        circleContent = "✓";
        href = `ntlesson${lesson.id}.html`;

    } else if (unlocked) {

        statusClass = "available";
        circleContent = lesson.id;
        href = `ntlesson${lesson.id}.html`;
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


function renderNtLearningPath() {

    const container =
        document.getElementById("ntLearningPath");

    if (!container) {
        return;
    }

    let html = "";

    ntCourseData.forEach(function (unit, unitIndex) {

        const part =
            ntCourseParts.find(function (p) {
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

        html += createNtStudyNode(unit, unitIndex);
        html += `<div class="vertical-path"></div>`;

        unit.lessons.forEach(function (lesson, lessonIndex) {

            html += createNtLessonNode(unit, lesson, lessonIndex);

            const isLast =
                lessonIndex === unit.lessons.length - 1;

            if (!isLast) {
                html += `<div class="vertical-path"></div>`;
            }
        });
    });

    container.innerHTML = html;

    updateNtCourseProgress();
}


function updateNtCourseProgress() {

    const progressFill =
        document.getElementById("ntProgressFill");

    const progressText =
        document.getElementById("ntProgressText");

    const total =
        getNtAllLessons().length;

    const completed =
        getNtCompletedLessonCount();

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
        document.getElementById("ntCertificateLink");

    if (certLink) {

        certLink.hidden = percent < 100;

        if (!certLink.dataset.wired) {

            certLink.dataset.wired = "true";

            certLink.addEventListener("click", function (event) {

                event.preventDefault();

                if (window.FabCertificate) {

                    window.FabCertificate.showCourseComplete({
                        courseTitle: "Neural Interface Chip",
                        courseSlug: "neurotransmitters",
                        lessonCount: getNtAllLessons().length
                    });
                }
            });
        }
    }
}


renderNtLearningPath();


/* ========================================
   FAB CHALLENGE QUIZZES
   Shared logic for any ntlessonN.html
   page. Elements use a "nt" prefix so
   they never collide with script.js's own
   (MEMS-only) quiz element lookups.
======================================== */

function shuffleNtArray(array) {

    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function initNtLessonQuiz(lessonId, questions) {

    const questionText =
        document.getElementById("ntQuestionText");

    if (!questionText) {
        return;
    }

    const questionNumber =
        document.getElementById("ntQuestionNumber");

    const answerGrid =
        document.getElementById("ntAnswerGrid");

    const checkButton =
        document.getElementById("ntCheckButton");

    const feedbackMessage =
        document.getElementById("ntFeedbackMessage");

    const lessonProgress =
        document.getElementById("ntLessonProgress");

    const xpDisplay =
        document.getElementById("ntXpDisplay");

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
            shuffleNtArray(
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
                    .querySelectorAll("#ntAnswerGrid .answer-button")
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
                document.querySelectorAll("#ntAnswerGrid .answer-button");

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

                adjustNtMistakeCount(
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
                `fabPathNtLesson${lessonId}Complete`;

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

            /* nt-course-data.js isn't loaded on lesson pages,
               only on nt-learn.html, so this is a literal. */

            const NT_FINAL_LESSON_ID = 17;

            if (lessonId === NT_FINAL_LESSON_ID && window.FabCertificate) {

                window.FabCertificate.showCourseComplete({
                    courseTitle: "Neural Interface Chip",
                    courseSlug: "neurotransmitters",
                    lessonCount: NT_FINAL_LESSON_ID,
                    onContinue: function () {
                        window.location.href = "nt-learn.html";
                    }
                });

            } else {

                window.location.href = "nt-learn.html";
            }
        }
    });

    loadQuestion();
}
