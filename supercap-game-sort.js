/* ========================================
   SUPERCAPACITOR GAMES — CATEGORY SORT
   One card at a time, tap the category it
   belongs to. Used by the Unit 2, 3, 4, and
   5 games; the data lives in
   supercap-games-data.js.
======================================== */

(function () {

    function startSort(cfg) {

        let deck = [];
        let index = 0;
        let mistakes = 0;

        const grid =
            document.getElementById("categoryGrid");

        if (!grid) {
            return;
        }


        function categoryFor(id) {

            return cfg.categories.find(function (cat) {
                return cat.id === id;
            });
        }


        function renderButtons() {

            grid.innerHTML = "";

            cfg.categories.forEach(function (cat) {

                const button =
                    document.createElement("button");

                button.type = "button";
                button.className = "category-button";

                button.innerHTML = `
                    <span class="category-button-icon">${cat.icon}</span>
                    <span class="category-button-label">${cat.label}</span>
                `;

                button.addEventListener("click", function () {
                    handlePick(cat.id, button);
                });

                grid.appendChild(button);
            });
        }


        function renderCard() {

            const item = deck[index];

            document.getElementById("equipmentIcon").innerHTML =
                `<span class="sc-emoji-icon">${item.icon}</span>`;

            document.getElementById("equipmentName").textContent =
                item.name;

            document.getElementById("equipmentDesc").textContent =
                item.desc;

            SCGames.setProgress(index + 1, deck.length);
            SCGames.setFeedback(cfg.prompt);

            grid.querySelectorAll(".category-button")
                .forEach(function (btn) {
                    btn.classList.remove("correct", "wrong", "disabled");
                });
        }


        function handlePick(categoryId, button) {

            if (button.classList.contains("disabled")) {
                return;
            }

            const item = deck[index];

            if (categoryId === item.category) {

                button.classList.add("correct");

                grid.querySelectorAll(".category-button")
                    .forEach(function (btn) {
                        btn.classList.add("disabled");
                    });

                SCGames.setFeedback(
                    `Correct — ${item.why}`
                );

                setTimeout(function () {

                    index++;

                    if (index >= deck.length) {
                        complete();
                    } else {
                        renderCard();
                    }

                }, 1500);

            } else {

                mistakes++;

                button.classList.add("wrong");

                SCGames.setFeedback(cfg.wrong);

                setTimeout(function () {
                    button.classList.remove("wrong");
                }, 400);
            }
        }


        function complete() {

            const total = deck.length;

            const recap =
                cfg.categories.map(function (cat) {

                    const rows =
                        cfg.items
                            .filter(function (item) {
                                return item.category === cat.id;
                            })
                            .map(function (item) {
                                return SCGames.recapRow(item.icon, item.name);
                            })
                            .join("");

                    return SCGames.recapGroup(
                        `${cat.icon} ${cat.label}`,
                        rows
                    );

                }).join("");

            SCGames.finish({
                key: cfg.key,
                xp: cfg.xp,
                recap: recap,
                stats:
                    mistakes === 0
                        ? `${total} for ${total} — perfect run, no mistakes.`
                        : `${total} for ${total}, with ${SCGames.plural(mistakes, "mistake")} along the way.`
            });
        }


        function reset() {

            deck = SCGames.shuffle(cfg.items);
            index = 0;
            mistakes = 0;

            SCGames.showBoard();
            renderCard();
        }


        renderButtons();
        reset();

        SCGames.onPlayAgain(reset);
    }


    window.SCGames.startSort = startSort;

})();
