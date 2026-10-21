/* ========================================
   QUANTUM COMPUTING CHIPS: LEARNING PATH AND QUIZZES
   Same engine as the other courses, with "fabPathQc"
   localStorage keys and "qc"-prefixed element ids.
======================================== */

function isQcLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            `fabPathQcLesson${lessonId}Complete`
        ) === "true"
    );
}


function isQcUnitStudyComplete(unitId) {

    if (
        localStorage.getItem(
            `fabPathQcUnit${unitId}StudyComplete`
        ) === "true"
    ) {
        return true;
    }

    /* Units were split into smaller ones after some progress was saved,
       so a finished lesson also counts as a finished study module. */

    const unit =
        qcCourseData.find(function (u) {
            return u.id === unitId;
        });

    return (
        !!unit &&
        unit.lessons.some(function (lesson) {
            return isQcLessonComplete(lesson.id);
        })
    );
}


function isQcUnitUnlocked(unitIndex) {

    if (unitIndex === 0) {
        return true;
    }

    const previousUnit =
        qcCourseData[unitIndex - 1];

    const lastLesson =
        previousUnit.lessons[previousUnit.lessons.length - 1];

    return isQcLessonComplete(lastLesson.id);
}


function isQcLessonUnlocked(unit, lessonIndex) {

    if (lessonIndex === 0) {
        return isQcUnitStudyComplete(unit.id);
    }

    return isQcLessonComplete(
        unit.lessons[lessonIndex - 1].id
    );
}


function getQcAllLessons() {

    const lessons = [];

    qcCourseData.forEach(function (unit) {
        unit.lessons.forEach(function (lesson) {
            lessons.push(lesson);
        });
    });

    return lessons;
}


function getQcCompletedLessonCount() {

    return getQcAllLessons().filter(function (lesson) {
        return isQcLessonComplete(lesson.id);
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

function getQcMistakeCounts() {

    return (
        JSON.parse(
            localStorage.getItem("fabPathQcMistakes")
        ) || {}
    );
}


function adjustQcMistakeCount(lessonId, questionIndex, delta) {

    const mistakes =
        getQcMistakeCounts();

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
        "fabPathQcMistakes",
        JSON.stringify(mistakes)
    );
}


function getQcMistakeCount(lessonId, questionIndex) {

    const mistakes =
        getQcMistakeCounts();

    return mistakes[`${lessonId}_${questionIndex}`] || 0;
}


function createQcStudyNode(unit, unitIndex) {

    const complete =
        isQcUnitStudyComplete(unit.id);

    const unlocked =
        isQcUnitUnlocked(unitIndex);

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


function createQcLessonNode(unit, lesson, lessonIndex) {

    const complete =
        isQcLessonComplete(lesson.id);

    const unlocked =
        isQcLessonUnlocked(unit, lessonIndex);

    let statusClass = "locked";
    let circleContent = "🔒";
    let href = "#";

    if (complete) {

        statusClass = "complete";
        circleContent = "✓";
        href = `qclesson${lesson.id}.html`;

    } else if (unlocked) {

        statusClass = "available";
        circleContent = lesson.id;
        href = `qclesson${lesson.id}.html`;
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


function renderQcLearningPath() {

    const container =
        document.getElementById("qcLearningPath");

    if (!container) {
        return;
    }

    let html = "";

    qcCourseData.forEach(function (unit, unitIndex) {

        const part =
            qcCourseParts.find(function (p) {
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

        html += createQcStudyNode(unit, unitIndex);
        html += `<div class="vertical-path"></div>`;

        unit.lessons.forEach(function (lesson, lessonIndex) {

            html += createQcLessonNode(unit, lesson, lessonIndex);

            const isLast =
                lessonIndex === unit.lessons.length - 1;

            if (!isLast) {
                html += `<div class="vertical-path"></div>`;
            }
        });
    });

    container.innerHTML = html;

    updateQcCourseProgress();
}


function updateQcCourseProgress() {

    const progressFill =
        document.getElementById("qcProgressFill");

    const progressText =
        document.getElementById("qcProgressText");

    const total =
        getQcAllLessons().length;

    const completed =
        getQcCompletedLessonCount();

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
        document.getElementById("qcCertificateLink");

    if (certLink) {

        // Parts 3-9 are still being built, so no certificate until all 54 lessons exist.
        certLink.hidden = percent < 100 || total < 54;

        if (!certLink.dataset.wired) {

            certLink.dataset.wired = "true";

            certLink.addEventListener("click", function (event) {

                event.preventDefault();

                if (window.FabCertificate) {

                    window.FabCertificate.showCourseComplete({
                        courseTitle: "Quantum Computing Chips",
                        courseSlug: "quantum-chips",
                        lessonCount: getQcAllLessons().length
                    });
                }
            });
        }
    }
}


renderQcLearningPath();


/* ========================================
   FAB CHALLENGE QUIZZES
   Shared logic for any qclessonN.html
   page. Elements use a "qc" prefix so
   they never collide with script.js's own
   (MEMS-only) quiz element lookups.
======================================== */

function shuffleQcArray(array) {

    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function initQcLessonQuiz(lessonId, questions) {

    const questionText =
        document.getElementById("qcQuestionText");

    if (!questionText) {
        return;
    }

    const questionNumber =
        document.getElementById("qcQuestionNumber");

    const answerGrid =
        document.getElementById("qcAnswerGrid");

    const checkButton =
        document.getElementById("qcCheckButton");

    const feedbackMessage =
        document.getElementById("qcFeedbackMessage");

    const lessonProgress =
        document.getElementById("qcLessonProgress");

    const xpDisplay =
        document.getElementById("qcXpDisplay");

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
            shuffleQcArray(
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
                    .querySelectorAll("#qcAnswerGrid .answer-button")
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
                document.querySelectorAll("#qcAnswerGrid .answer-button");

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

                adjustQcMistakeCount(
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
                `fabPathQcLesson${lessonId}Complete`;

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

            /* qc-course-data.js isn't loaded on lesson pages,
               only on qc-learn.html, so this is a literal. */

            const QC_FINAL_LESSON_ID = 54;

            if (lessonId === QC_FINAL_LESSON_ID && window.FabCertificate) {

                window.FabCertificate.showCourseComplete({
                    courseTitle: "Quantum Computing Chips",
                    courseSlug: "quantum-chips",
                    lessonCount: QC_FINAL_LESSON_ID,
                    onContinue: function () {
                        window.location.href = "qc-learn.html";
                    }
                });

            } else {

                window.location.href = "qc-learn.html";
            }
        }
    });

    loadQuestion();
}
