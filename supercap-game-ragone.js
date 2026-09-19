/* ========================================
   SUPERCAPACITOR GAMES — FIND THE SPOT
   Tap the region of the Ragone plot where
   each energy-storage device lives.
======================================== */

(function () {

    /*
        Zone centers along the plot's diagonal
        (schematic, not to scale). The ellipses
        are drawn tilted 28 degrees.
    */

    const ZONE_LAYOUT = {
        capacitor: { cx: 84, cy: 52 },
        supercap: { cx: 136, cy: 84 },
        battery: { cx: 190, cy: 116 },
        fuelcell: { cx: 246, cy: 148 }
    };

    const TILT_DEGREES = 28;
    const SVG_NS = "http://www.w3.org/2000/svg";


    function startRagone(cfg) {

        const zonesGroup =
            document.getElementById("ragoneZones");

        const dotsGroup =
            document.getElementById("ragoneDots");

        if (!zonesGroup || !dotsGroup) {
            return;
        }

        let deck = [];
        let index = 0;
        let mistakes = 0;
        let placedInZone = {};
        let locked = false;


        function buildZones() {

            zonesGroup.innerHTML = "";

            cfg.zones.forEach(function (zone) {

                const spot = ZONE_LAYOUT[zone.id];

                const group =
                    document.createElementNS(SVG_NS, "g");

                group.setAttribute("class", "sc-zone");
                group.setAttribute("data-zone", zone.id);

                const ellipse =
                    document.createElementNS(SVG_NS, "ellipse");

                ellipse.setAttribute("cx", spot.cx);
                ellipse.setAttribute("cy", spot.cy);
                ellipse.setAttribute("rx", 30);
                ellipse.setAttribute("ry", 15);

                ellipse.setAttribute(
                    "transform",
                    `rotate(${TILT_DEGREES} ${spot.cx} ${spot.cy})`
                );

                const label =
                    document.createElementNS(SVG_NS, "text");

                label.setAttribute("x", spot.cx + 22);
                label.setAttribute("y", spot.cy - 22);
                label.setAttribute("text-anchor", "middle");
                label.textContent = zone.label;

                group.appendChild(ellipse);
                group.appendChild(label);

                group.addEventListener("click", function () {
                    handlePick(zone.id, group);
                });

                zonesGroup.appendChild(group);
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

            SCGames.setFeedback(
                "Tap the region of the plot where this device sits."
            );

            zonesGroup.querySelectorAll(".sc-zone")
                .forEach(function (zone) {
                    zone.classList.remove("correct", "wrong");
                });

            locked = false;
        }


        function addDot(zoneId) {

            const spot = ZONE_LAYOUT[zoneId];

            const n = placedInZone[zoneId] || 0;

            placedInZone[zoneId] = n + 1;

            const along = ((n % 5) - 2) * 10;
            const across = (n % 2 === 0) ? -4 : 4;

            const angle = TILT_DEGREES * Math.PI / 180;

            const x =
                spot.cx + along * Math.cos(angle) - across * Math.sin(angle);

            const y =
                spot.cy + along * Math.sin(angle) + across * Math.cos(angle);

            const dot =
                document.createElementNS(SVG_NS, "circle");

            dot.setAttribute("cx", x.toFixed(1));
            dot.setAttribute("cy", y.toFixed(1));
            dot.setAttribute("r", 3.2);

            dotsGroup.appendChild(dot);
        }


        function handlePick(zoneId, zoneEl) {

            if (locked) {
                return;
            }

            const item = deck[index];

            if (zoneId === item.zone) {

                locked = true;

                zoneEl.classList.add("correct");
                addDot(zoneId);

                SCGames.setFeedback(
                    `Correct — ${item.name}: ${item.stats}`
                );

                setTimeout(function () {

                    index++;

                    if (index >= deck.length) {
                        complete();
                    } else {
                        renderCard();
                    }

                }, 1700);

            } else {

                mistakes++;

                zoneEl.classList.add("wrong");

                SCGames.setFeedback(
                    "Not quite — think energy versus power. Capacitors are all power, fuel cells are all energy."
                );

                setTimeout(function () {
                    zoneEl.classList.remove("wrong");
                }, 400);
            }
        }


        function complete() {

            const recap =
                cfg.zones.map(function (zone) {

                    const rows =
                        cfg.items
                            .filter(function (item) {
                                return item.zone === zone.id;
                            })
                            .map(function (item) {
                                return SCGames.recapRow(item.icon, item.name);
                            })
                            .join("");

                    return SCGames.recapGroup(zone.label, rows);

                }).join("");

            const total = deck.length;

            SCGames.finish({
                key: cfg.key,
                xp: cfg.xp,
                recap: recap,
                stats:
                    mistakes === 0
                        ? `${total} for ${total} — every device placed on the first try.`
                        : `${total} for ${total}, with ${SCGames.plural(mistakes, "mistake")} along the way.`
            });
        }


        function reset() {

            deck = SCGames.shuffle(cfg.items);
            index = 0;
            mistakes = 0;
            placedInZone = {};

            dotsGroup.innerHTML = "";

            SCGames.showBoard();
            renderCard();
        }


        buildZones();
        reset();

        SCGames.onPlayAgain(reset);
    }


    window.SCGames.startRagone = startRagone;

})();
