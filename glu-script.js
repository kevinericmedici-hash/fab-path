/* ========================================
   GLUCOSE SENSORS COURSE ENGINE
   Self-contained: progress tracking, path
   rendering, and quiz logic for the
   Glucose Sensors course. Namespaced with
   "fabPathGlu" localStorage keys and
   "glu"-prefixed element ids so it
   never collides with the MEMS course's
   script.js, which is loaded on the same
   pages for the shared streak/XP header.
======================================== */

function isGluLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            `fabPathGluLesson${lessonId}Complete`
        ) === "true"
    );
}


function isGluUnitStudyComplete(unitId) {

    if (
        localStorage.getItem(
            `fabPathGluUnit${unitId}StudyComplete`
        ) === "true"
    ) {
        return true;
    }

    /* Units were split into smaller ones after some progress was saved,
       so a finished lesson also counts as a finished study module. */

    const unit =
        gluCourseData.find(function (u) {
            return u.id === unitId;
        });

    return (
        !!unit &&
        unit.lessons.some(function (lesson) {
            return isGluLessonComplete(lesson.id);
        })
    );
}


function isGluUnitUnlocked(unitIndex) {

    if (unitIndex === 0) {
        return true;
    }

    const previousUnit =
        gluCourseData[unitIndex - 1];

    const lastLesson =
        previousUnit.lessons[previousUnit.lessons.length - 1];

    return isGluLessonComplete(lastLesson.id);
}


function isGluLessonUnlocked(unit, lessonIndex) {

    if (lessonIndex === 0) {
        return isGluUnitStudyComplete(unit.id);
    }

    return isGluLessonComplete(
        unit.lessons[lessonIndex - 1].id
    );
}


function getGluAllLessons() {

    const lessons = [];

    gluCourseData.forEach(function (unit) {
        unit.lessons.forEach(function (lesson) {
            lessons.push(lesson);
        });
    });

    return lessons;
}


function getGluCompletedLessonCount() {

    return getGluAllLessons().filter(function (lesson) {
        return isGluLessonComplete(lesson.id);
    }).length;
}


/* ========================================
   MISTAKE TRACKING
   Powers the Glucose Sensors "questions you
   get wrong most" practice sessions. Uses
   its own localStorage blob so lesson ids
   never collide with the MEMS course's
   mistake tracking (both courses start
   numbering lessons at 1).
======================================== */

function getGluMistakeCounts() {

    return (
        JSON.parse(
            localStorage.getItem("fabPathGluMistakes")
        ) || {}
    );
}


function adjustGluMistakeCount(lessonId, questionIndex, delta) {

    const mistakes =
        getGluMistakeCounts();

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
        "fabPathGluMistakes",
        JSON.stringify(mistakes)
    );
}


function getGluMistakeCount(lessonId, questionIndex) {

    const mistakes =
        getGluMistakeCounts();

    return mistakes[`${lessonId}_${questionIndex}`] || 0;
}


function createGluStudyNode(unit, unitIndex) {

    const complete =
        isGluUnitStudyComplete(unit.id);

    const unlocked =
        isGluUnitUnlocked(unitIndex);

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


function createGluLessonNode(unit, lesson, lessonIndex) {

    const complete =
        isGluLessonComplete(lesson.id);

    const unlocked =
        isGluLessonUnlocked(unit, lessonIndex);

    let statusClass = "locked";
    let circleContent = "🔒";
    let href = "#";

    if (complete) {

        statusClass = "complete";
        circleContent = "✓";
        href = `glulesson${lesson.id}.html`;

    } else if (unlocked) {

        statusClass = "available";
        circleContent = lesson.id;
        href = `glulesson${lesson.id}.html`;
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


function renderGluLearningPath() {

    const container =
        document.getElementById("gluLearningPath");

    if (!container) {
        return;
    }

    let html = "";

    gluCourseData.forEach(function (unit, unitIndex) {

        const part =
            gluCourseParts.find(function (p) {
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

        html += createGluStudyNode(unit, unitIndex);
        html += `<div class="vertical-path"></div>`;

        unit.lessons.forEach(function (lesson, lessonIndex) {

            html += createGluLessonNode(unit, lesson, lessonIndex);

            const isLast =
                lessonIndex === unit.lessons.length - 1;

            if (!isLast) {
                html += `<div class="vertical-path"></div>`;
            }
        });
    });

    container.innerHTML = html;

    updateGluCourseProgress();
}


function updateGluCourseProgress() {

    const progressFill =
        document.getElementById("gluProgressFill");

    const progressText =
        document.getElementById("gluProgressText");

    const total =
        getGluAllLessons().length;

    const completed =
        getGluCompletedLessonCount();

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
        document.getElementById("gluCertificateLink");

    if (certLink) {

        certLink.hidden = percent < 100;

        if (!certLink.dataset.wired) {

            certLink.dataset.wired = "true";

            certLink.addEventListener("click", function (event) {

                event.preventDefault();

                if (window.FabCertificate) {

                    window.FabCertificate.showCourseComplete({
                        courseTitle: "Glucose Sensors",
                        courseSlug: "glucose-sensors",
                        lessonCount: getGluAllLessons().length
                    });
                }
            });
        }
    }
}


renderGluLearningPath();


/* ========================================
   FAB CHALLENGE QUIZZES
   Shared logic for any glulessonN.html
   page. Elements use a "glu" prefix so
   they never collide with script.js's own
   (MEMS-only) quiz element lookups.
======================================== */

function shuffleGluArray(array) {

    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


function initGluLessonQuiz(lessonId, questions) {

    const questionText =
        document.getElementById("gluQuestionText");

    if (!questionText) {
        return;
    }

    const questionNumber =
        document.getElementById("gluQuestionNumber");

    const answerGrid =
        document.getElementById("gluAnswerGrid");

    const checkButton =
        document.getElementById("gluCheckButton");

    const feedbackMessage =
        document.getElementById("gluFeedbackMessage");

    const lessonProgress =
        document.getElementById("gluLessonProgress");

    const xpDisplay =
        document.getElementById("gluXpDisplay");

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
            shuffleGluArray(
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
                    .querySelectorAll("#gluAnswerGrid .answer-button")
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
                document.querySelectorAll("#gluAnswerGrid .answer-button");

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

                adjustGluMistakeCount(
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
                `fabPathGluLesson${lessonId}Complete`;

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

            /* glu-course-data.js isn't loaded on lesson pages,
               only on glu-learn.html, so this is a literal. */

            const GLU_FINAL_LESSON_ID = 17;

            if (lessonId === GLU_FINAL_LESSON_ID && window.FabCertificate) {

                window.FabCertificate.showCourseComplete({
                    courseTitle: "Glucose Sensors",
                    courseSlug: "glucose-sensors",
                    lessonCount: GLU_FINAL_LESSON_ID,
                    onContinue: function () {
                        window.location.href = "glu-learn.html";
                    }
                });

            } else {

                window.location.href = "glu-learn.html";
            }
        }
    });

    loadQuestion();
}
