/* ========================================
   SUPERCAPACITOR GAMES — SHARED HELPERS
   Everything lives on window.SCGames so it
   can't collide with script.js globals.
======================================== */

(function () {

    const XP_KEY = "fabPathXP";


    function shuffle(items) {

        const result = items.slice();

        for (let i = result.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }


    function setFeedback(text) {

        const feedback =
            document.getElementById("gameFeedback");

        if (feedback) {
            feedback.textContent = text;
        }
    }


    function setProgress(current, total) {

        const fill =
            document.getElementById("gameProgressFill");

        const label =
            document.getElementById("gameProgressText");

        if (fill) {

            fill.style.width =
                `${(current / total) * 100}%`;
        }

        if (label) {

            label.textContent =
                `${current} / ${total}`;
        }
    }


    function isComplete(key) {

        return localStorage.getItem(key) === "true";
    }


    function awardXP(key, xp) {

        if (isComplete(key)) {
            return false;
        }

        const previousXP =
            parseInt(localStorage.getItem(XP_KEY)) || 0;

        localStorage.setItem(
            XP_KEY,
            (previousXP + xp).toString()
        );

        localStorage.setItem(key, "true");

        const totalXPDisplay =
            document.getElementById("totalXPDisplay");

        if (totalXPDisplay) {

            totalXPDisplay.textContent =
                previousXP + xp;
        }

        return true;
    }


    function recapGroup(title, rowsHtml) {

        return `
            <div class="recap-category-group">
                <p class="recap-category-title">
                    ${title}
                </p>
                ${rowsHtml}
            </div>
        `;
    }


    function recapRow(icon, label, detail) {

        return `
            <div class="game-recap-row">
                <span class="game-recap-emoji">${icon}</span>
                <span class="game-recap-label">${label}</span>
                ${detail ? `<span class="game-recap-size">${detail}</span>` : ""}
            </div>
        `;
    }


    /*
        opts: { key, xp, stats, recap }
        Hides the board, reveals the completion
        card, awards XP once, and fills in recap.
    */

    function finish(opts) {

        const board =
            document.getElementById("gameBoard");

        const complete =
            document.getElementById("gameComplete");

        if (board) {
            board.hidden = true;
        }

        if (complete) {
            complete.hidden = false;
        }

        const stats =
            document.getElementById("gameCompleteStats");

        if (stats && opts.stats) {
            stats.textContent = opts.stats;
        }

        const xpEl =
            document.getElementById("gameCompleteXP");

        const earned =
            awardXP(opts.key, opts.xp);

        if (xpEl) {

            xpEl.textContent =
                earned
                    ? `+${opts.xp} XP`
                    : "Already earned — nice replay!";
        }

        const recap =
            document.getElementById("gameRecap");

        if (recap && opts.recap) {
            recap.innerHTML = opts.recap;
        }
    }


    function showBoard() {

        const board =
            document.getElementById("gameBoard");

        const complete =
            document.getElementById("gameComplete");

        if (board) {
            board.hidden = false;
        }

        if (complete) {
            complete.hidden = true;
        }
    }


    function onPlayAgain(handler) {

        const button =
            document.getElementById("playAgainButton");

        if (button) {
            button.addEventListener("click", handler);
        }
    }


    function plural(count, word) {

        return `${count} ${word}${count === 1 ? "" : "s"}`;
    }


    window.SCGames = {
        shuffle: shuffle,
        setFeedback: setFeedback,
        setProgress: setProgress,
        isComplete: isComplete,
        awardXP: awardXP,
        recapGroup: recapGroup,
        recapRow: recapRow,
        finish: finish,
        showBoard: showBoard,
        onPlayAgain: onPlayAgain,
        plural: plural
    };

})();
