/* ========================================
   FAB VALLEY ADVENTURE: THE CAFÉS
   Opens the two cafés:
     - Ion Café (Ion City): an electrolyte
       bar. Customers order solutions, and the
       player mixes cations and anions. Every
       drink must balance its charges; a bulb
       shows conductivity and the beaker's tint
       shows pH. Orders: saline (NaCl), de-icing
       brine (CaCl₂), Epsom bath salts (MgSO₄),
       a sports drink (Na⁺, K⁺, Cl⁻), battery
       electrolyte (LiPF₆), something sour (an
       acid) and baking soda (NaHCO₃).
     - Bucky Café (Carbon City): a coffee bar
       built from carbon molecules. Roast level
       trades chlorogenic acids (bright, sour)
       for melanoidins (dark, bitter); decaf
       uses an activated-carbon water process or
       supercritical CO₂; add-ins are real
       molecules (sucrose, lactose, vanillin,
       cinnamaldehyde, theobromine, extra
       caffeine).
   Formulas: caffeine C₈H₁₀N₄O₂, theobromine
   C₇H₈N₂O₂, sucrose and lactose both
   C₁₂H₂₂O₁₁, vanillin C₈H₈O₃,
   cinnamaldehyde C₉H₈O.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.ioncafe = { label: "Ion Café", icon: "🥤" };
        api.TYPES.buckycafe = { label: "Bucky Café", icon: "☕" };

        function cs() {
            const s = api.save();
            if (!s.cafes) {
                s.cafes = { ion: {}, bucky: {} };
            }
            return s.cafes;
        }

        const SUB = "₀₁₂₃₄₅₆₇₈₉";

        function sub(n) {
            return n === 1 ? "" : String(n).split("").map((d) => SUB[Number(d)]).join("");
        }

        function gcd(a, b) {
            return b ? gcd(b, a % b) : a;
        }

        function label(c, text, x, y, color, align, bold, size) {
            c.fillStyle = color || "#a9b2d0";
            c.font = `${bold ? "bold " : ""}${size || 11}px sans-serif`;
            c.textAlign = align || "left";
            c.fillText(text, x, y);
        }

        function dot(c, x, y, r, col) {
            c.fillStyle = col;
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
        }

        function bg(c) {
            c.clearRect(0, 0, 460, 230);
            c.fillStyle = "#0b1020";
            c.fillRect(0, 0, 460, 230);
        }

        function served(shop, id, total) {
            const st = cs()[shop];
            const first = !st[id];
            st[id] = true;
            const all = Object.keys(st).filter((k) => k !== "regular").length >= total;
            api.writeSave();
            if (first) {
                api.gainXP(15);
            }
            if (all && !st.regular) {
                st.regular = true;
                api.writeSave();
                api.gainXP(40);
                api.awardSiteXP("cafe_" + shop, 40);
                return true;
            }
            return false;
        }


        /* ---------- Ion Café ---------- */

        const IONS = [
            { id: "na", sym: "Na", ch: 1, col: "#ffd84a", name: "sodium" },
            { id: "k", sym: "K", ch: 1, col: "#c97fe0", name: "potassium" },
            { id: "li", sym: "Li", ch: 1, col: "#ff8aa8", name: "lithium" },
            { id: "h", sym: "H", ch: 1, col: "#ffb84a", name: "hydrogen" },
            { id: "ca", sym: "Ca", ch: 2, col: "#f5f7ff", name: "calcium" },
            { id: "mg", sym: "Mg", ch: 2, col: "#9be37a", name: "magnesium" },
            { id: "cl", sym: "Cl", ch: -1, col: "#5be38a", name: "chloride" },
            { id: "oh", sym: "OH", ch: -1, col: "#7fb2ff", name: "hydroxide", poly: true },
            { id: "so4", sym: "SO₄", ch: -2, col: "#ffe066", name: "sulfate", poly: true },
            { id: "pf6", sym: "PF₆", ch: -1, col: "#b8c0cf", name: "hexafluorophosphate", poly: true },
            { id: "hco3", sym: "HCO₃", ch: -1, col: "#c8a27a", name: "bicarbonate", poly: true }
        ];

        function ionLabel(ion) {
            const n = Math.abs(ion.ch);
            return ion.sym + (n > 1 ? "⁰¹²³⁴⁵⁶⁷⁸⁹"[n] : "") + (ion.ch > 0 ? "⁺" : "⁻");
        }

        function present(counts) {
            return IONS.filter((ion) => counts[ion.id] > 0);
        }

        function netCharge(counts) {
            return IONS.reduce((s, ion) => s + ion.ch * (counts[ion.id] || 0), 0);
        }

        const SET = (counts) => present(counts).map((x) => x.id).sort().join(",");

        function formula(counts) {
            const p = present(counts);
            const cat = p.filter((x) => x.ch > 0);
            const an = p.filter((x) => x.ch < 0);
            if (SET(counts) === "h,oh" && counts.h === counts.oh) {
                return "H₂O (just water!)";
            }
            if (cat.length === 1 && an.length === 1 && netCharge(counts) === 0) {
                const a = counts[cat[0].id];
                const b = counts[an[0].id];
                const g = gcd(a, b);
                const part = (ion, n) => (ion.poly && n > 1 ? `(${ion.sym})${sub(n)}` : ion.sym + sub(n));
                return part(cat[0], a / g) + part(an[0], b / g);
            }
            return p.map((ion) => `${ionLabel(ion)} ×${counts[ion.id]}`).join(", ") || "plain water";
        }

        const ION_ORDERS = [
            { id: "saline", who: "Nurse Ana", want: "IV saline for the clinic", hint: "Saline is table salt dissolved in water.", ok: (c) => SET(c) === "cl,na", why: "NaCl: one Na⁺ for every Cl⁻. Hospital saline is 0.9% NaCl, about as salty as your blood." },
            { id: "cacl2", who: "Rocco from the road crew", want: "de-icing brine: calcium chloride", hint: "Ca²⁺ carries two charges. How many Cl⁻ does it need?", ok: (c) => SET(c) === "ca,cl", why: "CaCl₂: each Ca²⁺ needs two Cl⁻ to balance. Dissolved ions get in the way of water freezing, so brine melts ice." },
            { id: "mgso4", who: "Sore-muscle Sue", want: "Epsom bath salts: magnesium sulfate", hint: "Both ions carry a double charge.", ok: (c) => SET(c) === "mg,so4", why: "MgSO₄: Mg²⁺ and SO₄²⁻ balance one-to-one. Sulfate is a polyatomic ion: a group of atoms that stays together with a shared charge." },
            { id: "sports", who: "Coach Lyte", want: "a sports drink with sodium AND potassium, balanced with chloride", hint: "You lose both Na⁺ and K⁺ when you sweat.", ok: (c) => SET(c) === "cl,k,na", why: "Na⁺, K⁺ and Cl⁻: the ions you sweat out. Your nerves and muscles run on them, which is why sports drinks put them back." },
            { id: "lipf6", who: "Volta from Ampfield", want: "lithium-ion battery electrolyte", hint: "Lithium batteries use a lithium salt with a big, stable anion.", ok: (c) => SET(c) === "li,pf6", why: "LiPF₆, dissolved in an organic solvent, is the classic lithium-ion battery electrolyte: Li⁺ shuttles between the electrodes as the battery charges and discharges." },
            { id: "sour", who: "Chef Basil", want: "something sour: an acid, pH well below 7", hint: "Sourness is H⁺. Pair it with an anion, and no OH⁻!", ok: (c) => present(c).filter((x) => x.ch > 0).every((x) => x.id === "h") && c.h > 0 && !c.oh && !c.hco3, why: "An acid is a solution with extra H⁺. HCl in water is hydrochloric acid, the same acid in your stomach. Lemons get their sourness from H⁺ too." },
            { id: "soda", who: "Baker Bea", want: "baking soda for her muffins", hint: "Baking soda is sodium bicarbonate.", ok: (c) => SET(c) === "hco3,na", why: "NaHCO₃: Na⁺ and HCO₃⁻. In batter, bicarbonate reacts with acids and releases CO₂ bubbles that make muffins rise. It's slightly basic, about pH 8." }
        ];

        function phOf(c) {
            const h = c.h || 0;
            const oh = c.oh || 0;
            if (h > oh) {
                return Math.max(1, 3 - (h - oh));
            }
            if (oh > h) {
                return Math.min(13, 11 + (oh - h));
            }
            return c.hco3 ? 8.3 : 7;
        }

        const PH_COL = ["#e2263b", "#e2263b", "#f05a28", "#f7941d", "#ffc20e", "#d7df23", "#8dc63f", "#39b54a", "#00a99d", "#0f75bc", "#2e3192", "#662d91", "#92278f", "#7a1f6e", "#5b1a5e"];

        function openIonBar() {
            const st = cs().ion;
            const counts = {};
            let order = ION_ORDERS.find((o) => !st[o.id]) || ION_ORDERS[0];
            let busy = false;
            const m = api.openModal(`
                ${api.head("ioncafe", "Ion Café Electrolyte Bar")}
                <p class="adv-lead">An electrolyte is a liquid full of free ions. Mix cations (+) and anions (−) to fill each order. One rule is never broken: the charges in a drink must add up to zero.</p>
                <p class="adv-round">Orders</p>
                <div class="adv-chips" id="icOrders"></div>
                <div class="adv-card" id="icOrder"></div>
                <canvas id="icCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="icCap">Add ions with the buttons below.</p>
                <div class="adv-ion-grid" id="icIons"></div>
                <div class="adv-button-row">
                    <button type="button" class="adv-btn secondary" id="icClear">Empty the glass</button>
                    <button type="button" class="adv-btn" id="icServe" data-autofocus>Stir and serve</button>
                </div>
                <p class="adv-result" id="icRes" aria-live="polite"></p>`);
            const c = $("icCv").getContext("2d");
            const seeds = Array.from({ length: 80 }, (_, i) => [(i * 97) % 360, (i * 53) % 130, (i * 0.37) % 6.28]);

            function renderOrders() {
                $("icOrders").innerHTML = ION_ORDERS.map((o) => `<button type="button" class="adv-chip${o === order ? " on" : ""}" data-io="${o.id}">${st[o.id] ? "✓ " : ""}${o.who}</button>`).join("");
                $("icOrder").innerHTML = `<p class="adv-card-title">🧾 ${order.who} would like…</p><ul><li><strong>${order.want}</strong></li><li>Tip: ${order.hint}</li></ul>`;
                api.modalBody().querySelectorAll("[data-io]").forEach((b) => b.addEventListener("click", () => {
                    order = ION_ORDERS.find((o) => o.id === b.dataset.io);
                    $("icRes").innerHTML = "";
                    renderOrders();
                }));
            }

            function renderIons() {
                $("icIons").innerHTML = IONS.map((ion) => `
                    <div class="adv-ion">
                        <span class="adv-ion-dot" style="background:${ion.col}">${ionLabel(ion)}</span>
                        <small>${ion.name}</small>
                        <span class="adv-ion-step">
                            <button type="button" class="adv-chip" data-dec="${ion.id}" aria-label="Remove ${ion.name}">−</button>
                            <strong>${counts[ion.id] || 0}</strong>
                            <button type="button" class="adv-chip" data-inc="${ion.id}" aria-label="Add ${ion.name}">+</button>
                        </span>
                    </div>`).join("");
                api.modalBody().querySelectorAll("[data-inc]").forEach((b) => b.addEventListener("click", () => {
                    counts[b.dataset.inc] = Math.min(6, (counts[b.dataset.inc] || 0) + 1);
                    renderIons();
                }));
                api.modalBody().querySelectorAll("[data-dec]").forEach((b) => b.addEventListener("click", () => {
                    counts[b.dataset.dec] = Math.max(0, (counts[b.dataset.dec] || 0) - 1);
                    renderIons();
                }));
                const q = netCharge(counts);
                $("icCap").innerHTML = `Glass: <strong>${formula(counts)}</strong> · net charge <strong style="color:${q === 0 ? "#5be38a" : "#ff9aa6"}">${q > 0 ? "+" : ""}${q}</strong>${q === 0 ? " (balanced)" : q > 0 ? " (add anions)" : " (add cations)"}`;
            }

            function draw(now, stir) {
                bg(c);
                const total = IONS.reduce((s, ion) => s + (counts[ion.id] || 0), 0);
                const ph = phOf(counts);
                // glass of water tinted by pH indicator
                c.fillStyle = "rgba(220, 235, 255, 0.5)";
                c.fillRect(40, 30, 280, 180);
                const tint = total ? PH_COL[Math.round(ph)] : "#7fb2ff";
                c.globalAlpha = 0.28;
                c.fillStyle = tint;
                c.fillRect(44, 50, 272, 156);
                c.globalAlpha = 1;
                // ions drifting in the glass
                let k = 0;
                IONS.forEach((ion) => {
                    for (let i = 0; i < (counts[ion.id] || 0); i++) {
                        const sd = seeds[k++ % seeds.length];
                        const sp = stir ? 3 : 1;
                        const x = 60 + ((sd[0] + now / (40 / sp) * Math.cos(sd[2])) % 240 + 240) % 240;
                        const y = 66 + ((sd[1] + now / (60 / sp) * Math.sin(sd[2])) % 130 + 130) % 130;
                        dot(c, x, y, 9, "#1a2033");
                        dot(c, x, y, 8, ion.col);
                        c.fillStyle = "#1a2033";
                        c.font = "bold 7px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText(ionLabel(ion), x, y + 0.5);
                        c.textBaseline = "alphabetic";
                    }
                });
                // conductivity bulb: more free ions, brighter light
                const glow = Math.min(1, total / 10);
                c.fillStyle = `rgba(255, 230, 120, ${0.1 + 0.6 * glow})`;
                c.beginPath();
                c.arc(390, 70, 16 + 18 * glow, 0, Math.PI * 2);
                c.fill();
                dot(c, 390, 70, 14, total ? `rgba(255, 236, 150, ${0.35 + 0.65 * glow})` : "#3b4458");
                rect(c, 383, 84, 14, 10, "#8f98aa");
                rect(c, 340, 40, 2, 100, "#5d6577");
                rect(c, 340, 40, 50, 2, "#5d6577");
                label(c, "conductivity", 390, 120, "#a9b2d0", "center", false, 10);
                label(c, total ? (glow > 0.6 ? "bright!" : "glowing") : "pure water: dark", 390, 134, "#f5f7ff", "center", true, 10);
                label(c, `pH ≈ ${total ? Math.round(ph * 10) / 10 : 7}`, 390, 170, tint, "center", true);
                label(c, ph < 7 ? "acidic" : ph > 7 ? "basic" : "neutral", 390, 184, "#a9b2d0", "center", false, 10);
            }

            const live = () => ui.animate(m, 60000, (k, now) => { if (!busy) { draw(now, false); } }, live);
            live();
            renderOrders();
            renderIons();

            $("icClear").addEventListener("click", () => {
                Object.keys(counts).forEach((key) => { counts[key] = 0; });
                $("icRes").innerHTML = "";
                renderIons();
            });

            $("icServe").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                const q = netCharge(counts);
                if (!present(counts).length) {
                    ui.result("icRes", "The glass is just water. Add some ions first!", false);
                    return;
                }
                busy = true;
                $("icCap").innerHTML = `Stirring ${formula(counts)}… the ions spread out evenly through the water.`;
                ui.animate(m, 6500, (k, now) => draw(now, true), () => {
                    busy = false;
                    renderIons();
                    if (q !== 0) {
                        ui.result("icRes", `✗ Net charge ${q > 0 ? "+" : ""}${q}. A real solution can't have extra charge: every + must be matched by a −. ${q > 0 ? "Add anions or remove cations." : "Add cations or remove anions."}`, false);
                        return;
                    }
                    if (counts.h && counts.oh) {
                        ui.result("icRes", "✗ H⁺ and OH⁻ together just make water (H⁺ + OH⁻ → H₂O): they cancel each other out. That's neutralization!", false);
                        return;
                    }
                    if (!order.ok(counts)) {
                        ui.result("icRes", `✗ ${formula(counts)} is a fine, balanced electrolyte, but ${order.who} wanted ${order.want}.`, false);
                        return;
                    }
                    const regular = served("ion", order.id, ION_ORDERS.length);
                    ui.result("icRes", `✓ ${order.who} loves it! ${order.why}${regular ? " 🥤 That's every order on the menu: you're an Ion Café regular!" : ""}`, true);
                    const next = ION_ORDERS.find((o) => !cs().ion[o.id]);
                    if (next) {
                        order = next;
                    }
                    renderOrders();
                });
            });
        }


        /* ---------- Bucky Café ---------- */

        const ROASTS = [
            { id: "light", label: "Light roast", acid: 3, bitter: 1, note: "Light roasts keep more chlorogenic acids: bright, fruity and a little sour." },
            { id: "medium", label: "Medium roast", acid: 2, bitter: 2, note: "Medium roasts balance acids with the first brown, toasty melanoidins." },
            { id: "dark", label: "Dark roast", acid: 1, bitter: 3, note: "Dark roasts break down most chlorogenic acids and build up melanoidins: brown, bitter and smoky." }
        ];

        const DECAF = [
            { id: "none", label: "Regular (with caffeine)" },
            { id: "water", label: "Decaf: water + activated-carbon filter" },
            { id: "co2", label: "Decaf: supercritical CO₂" }
        ];

        const ADDINS = [
            { id: "shot", label: "Extra espresso shot", mol: "Caffeine", f: "C₈H₁₀N₄O₂", col: "#ffd84a", fact: "Caffeine keeps you alert by blocking adenosine, the molecule that builds up and makes you feel sleepy. It's also bitter." },
            { id: "milk", label: "Steamed milk", mol: "Lactose", f: "C₁₂H₂₂O₁₁", col: "#f5f7ff", fact: "Milk's sugar, lactose, has exactly the same formula as table sugar, but its atoms are arranged differently, so it's only mildly sweet. Milk fats and proteins also soften bitterness." },
            { id: "sugar", label: "Sugar", mol: "Sucrose", f: "C₁₂H₂₂O₁₁", col: "#ffffff", fact: "Table sugar: two smaller sugars, glucose and fructose, linked together." },
            { id: "vanilla", label: "Vanilla", mol: "Vanillin", f: "C₈H₈O₃", col: "#ffe9a8", fact: "Vanillin is the main flavor molecule of vanilla: a benzene ring with a few extra groups attached." },
            { id: "cinnamon", label: "Cinnamon", mol: "Cinnamaldehyde", f: "C₉H₈O", col: "#d9853b", fact: "Cinnamaldehyde gives cinnamon its warm, spicy smell. It's another benzene-ring molecule." },
            { id: "cocoa", label: "Cocoa", mol: "Theobromine", f: "C₇H₈N₂O₂", col: "#8a5a3b", fact: "Theobromine, chocolate's cousin of caffeine, has one fewer CH₂ group and a much gentler kick." }
        ];

        const COFFEE_ORDERS = [
            { id: "black", who: "Cee", want: "a light roast, black: no add-ins at all", roast: "light", decaf: "none", add: [], why: "Light and black: you can taste the chlorogenic acids, bright and fruity." },
            { id: "darkvan", who: "Glassy", want: "a dark roast with vanilla", roast: "dark", decaf: "any", add: ["vanilla"], why: "Dark roast melanoidins plus vanillin's sweet, creamy smell." },
            { id: "mocha", who: "Graphy", want: "a mocha: cocoa and steamed milk", roast: "any", decaf: "any", add: ["cocoa", "milk"], why: "A mocha: theobromine and caffeine together, softened by milk." },
            { id: "cinlatte", who: "Dr. Bucky", want: "a cinnamon latte", roast: "any", decaf: "any", add: ["milk", "cinnamon"], why: "Lactose and milk proteins smooth it out, and cinnamaldehyde adds the spice." },
            { id: "decafsweet", who: "Diamond Dee", want: "a decaf with sugar (it's late!)", roast: "any", decaf: "yes", add: ["sugar"], why: "Decaf still has its flavor molecules: only the caffeine was removed, before roasting." },
            { id: "buzz", who: "Night-shift Nora", want: "maximum caffeine: an extra shot, nothing else, not decaf", roast: "any", decaf: "none", add: ["shot"], why: "Double the caffeine. Fun fact: light and dark roasts end up with about the same caffeine per bean." }
        ];

        function openCoffeeBar() {
            const st = cs().bucky;
            let order = COFFEE_ORDERS.find((o) => !st[o.id]) || COFFEE_ORDERS[0];
            let roast = null;
            let decaf = null;
            const adds = {};
            let busy = false;
            const m = api.openModal(`
                ${api.head("buckycafe", "Bucky Café Coffee Bar")}
                <p class="adv-lead">Coffee is a soup of carbon molecules. Roasting changes which ones are in the bean, and every add-in brings its own molecule. Build each customer's drink, molecule by molecule.</p>
                <p class="adv-round">Orders</p>
                <div class="adv-chips" id="bcOrders"></div>
                <div class="adv-card" id="bcOrder"></div>
                <canvas id="bcCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="bcCap">Pick a roast, decaf or not, and add-ins.</p>
                <p class="adv-round">Roast</p>
                ${ui.chips("roast", ROASTS.map((r) => ({ id: r.id, label: r.label })), null)}
                <p class="adv-round">Caffeine</p>
                ${ui.chips("decaf", DECAF.map((d) => ({ id: d.id, label: d.label })), null)}
                <p class="adv-round">Add-ins (tap to add or remove)</p>
                <div class="adv-chips">${ADDINS.map((a) => `<button type="button" class="adv-chip" data-add="${a.id}">${a.label}</button>`).join("")}</div>
                <div class="adv-takeaway" id="bcMol"><p>Tap an add-in to see its molecule.</p></div>
                <div class="adv-button-row">
                    <button type="button" class="adv-btn" id="bcBrew" data-autofocus>Brew and serve</button>
                </div>
                <p class="adv-result" id="bcRes" aria-live="polite"></p>`);
            const c = $("bcCv").getContext("2d");

            function renderOrders() {
                $("bcOrders").innerHTML = COFFEE_ORDERS.map((o) => `<button type="button" class="adv-chip${o === order ? " on" : ""}" data-co="${o.id}">${st[o.id] ? "✓ " : ""}${o.who}</button>`).join("");
                $("bcOrder").innerHTML = `<p class="adv-card-title">🧾 ${order.who} would like…</p><ul><li><strong>${order.want}</strong></li></ul>`;
                api.modalBody().querySelectorAll("[data-co]").forEach((b) => b.addEventListener("click", () => {
                    order = COFFEE_ORDERS.find((o) => o.id === b.dataset.co);
                    $("bcRes").innerHTML = "";
                    renderOrders();
                }));
            }
            renderOrders();

            ui.wireChips("roast", (v) => {
                roast = v;
                $("bcCap").innerHTML = ROASTS.find((r) => r.id === v).note;
            });
            ui.wireChips("decaf", (v) => {
                decaf = v;
                $("bcCap").innerHTML = v === "none" ? "Regular: the caffeine stays in." : v === "water" ? "Water process: green beans soak in water, and activated carbon (a sponge of carbon pores) traps the caffeine molecules while the flavor stays behind." : "Supercritical CO₂: under high pressure, carbon dioxide acts like a liquid and dissolves caffeine right out of the green beans.";
            });
            api.modalBody().querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => {
                const id = b.dataset.add;
                adds[id] = !adds[id];
                b.classList.toggle("on", adds[id]);
                const a = ADDINS.find((x) => x.id === id);
                $("bcMol").innerHTML = `<p><strong>${a.mol}, ${a.f}</strong>${adds[id] ? "" : " (removed)"}</p><p>${a.fact}</p>`;
            }));

            function taste() {
                const r = ROASTS.find((x) => x.id === roast);
                let acid = r.acid;
                let bitter = r.bitter;
                let sweet = 0;
                let caff = decaf === "none" ? 2 : 0.1;
                if (adds.shot) {
                    bitter += 1;
                    caff += decaf === "none" ? 2 : 0.1;
                }
                if (adds.milk) {
                    bitter -= 1;
                    acid -= 1;
                    sweet += 1;
                }
                if (adds.sugar) {
                    sweet += 3;
                }
                if (adds.vanilla) {
                    sweet += 1;
                }
                if (adds.cocoa) {
                    bitter += 0.5;
                    sweet += 0.5;
                }
                if (adds.cinnamon) {
                    sweet += 0.5;
                }
                const clamp = (v) => Math.max(0, Math.min(4, v));
                return { acid: clamp(acid), bitter: clamp(bitter), sweet: clamp(sweet), caff: clamp(caff) };
            }

            function draw(k, now, phase) {
                bg(c);
                // the cup
                const fill = phase === 0 ? k : 1;
                const roastCol = { light: "#a8703f", medium: "#6e4223", dark: "#3b2212" }[roast || "medium"];
                c.fillStyle = "#f5f7ff";
                c.beginPath();
                c.moveTo(70, 60);
                c.lineTo(250, 60);
                c.lineTo(232, 200);
                c.lineTo(88, 200);
                c.closePath();
                c.fill();
                c.strokeStyle = "#f5f7ff";
                c.lineWidth = 8;
                c.beginPath();
                c.arc(255, 120, 22, -Math.PI / 2, Math.PI / 2);
                c.stroke();
                const top = 196 - 128 * fill;
                c.fillStyle = adds.milk && phase === 1 ? `rgba(196, 150, 105, ${0.5 + 0.5 * k})` : roastCol;
                c.beginPath();
                c.moveTo(76 + (196 - top) * 0.13, top);
                c.lineTo(244 - (196 - top) * 0.13, top);
                c.lineTo(232, 196);
                c.lineTo(88, 196);
                c.closePath();
                c.fill();
                if (phase === 1 && adds.milk) {
                    c.fillStyle = roastCol;
                    c.globalAlpha = 1 - 0.6 * k;
                    c.fillRect(100, top + 10, 120, 170 - top);
                    c.globalAlpha = 1;
                }
                // molecules swirling: coffee's own, then the add-ins
                const mols = [];
                if (decaf === "none") {
                    mols.push(["caffeine", "#ffd84a"]);
                }
                mols.push([roast === "light" ? "chlorogenic acid" : "melanoidins", roast === "light" ? "#ff8a5c" : "#8a5a3b"], ["CO₂", "#cfe8ff"]);
                if (phase === 1) {
                    ADDINS.filter((a) => adds[a.id]).forEach((a) => mols.push([a.mol.toLowerCase(), a.col]));
                }
                mols.forEach(([name, col], i) => {
                    const a = now / 900 + i * 1.7;
                    const x = 160 + Math.cos(a) * 52;
                    const y = Math.max(top + 12, 150 + Math.sin(a * 1.3) * 30) - (phase === 1 && i >= 3 ? (1 - k) * 90 : 0);
                    dot(c, x, y, 5, "#1a2033");
                    dot(c, x, y, 4, col);
                    label(c, name, x + 8, y + 4, "#f5f7ff", "left", false, 9);
                });
                // steam
                for (let i = 0; i < 3; i++) {
                    c.strokeStyle = "rgba(255,255,255,0.35)";
                    c.lineWidth = 2;
                    c.beginPath();
                    const x0 = 130 + i * 30;
                    for (let y = 0; y < 40; y += 4) {
                        const x = x0 + Math.sin((y + now / 60) / 8) * 4;
                        if (y) {
                            c.lineTo(x, 50 - y);
                        } else {
                            c.moveTo(x, 50 - y);
                        }
                    }
                    c.stroke();
                }
                // taste meter
                if (phase === 1) {
                    const t = taste();
                    [["acidity", t.acid, "#ff8a5c"], ["bitterness", t.bitter, "#8a5a3b"], ["sweetness", t.sweet, "#ff8aa8"], ["caffeine", t.caff, "#ffd84a"]].forEach(([name, v, col], i) => {
                        const y = 60 + i * 34;
                        label(c, name, 310, y, "#a9b2d0", "left", false, 10);
                        rect(c, 310, y + 5, 130, 10, "#1a2033");
                        rect(c, 310, y + 5, 130 * (v / 4) * k, 10, col);
                    });
                }
            }
            const idle = () => ui.animate(m, 60000, (k, now) => { if (!busy) { bg(c); label(c, "Your cup will appear here when you brew.", 230, 118, "#5d6577", "center"); } }, idle);
            idle();

            $("bcBrew").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!roast || !decaf) {
                    ui.result("bcRes", "Pick a roast and choose regular or decaf first.", false);
                    return;
                }
                busy = true;
                $("bcRes").innerHTML = "";
                $("bcCap").innerHTML = `Brewing: hot water pulls ${decaf === "none" ? "caffeine, " : ""}${roast === "light" ? "chlorogenic acids" : "melanoidins and the leftover acids"} and aroma molecules out of the grounds. The bubbles are CO₂ the roasted beans still hold.`;
                ui.animate(m, 6500, (k, now) => draw(k, now, 0), () => {
                    const added = ADDINS.filter((a) => adds[a.id]);
                    $("bcCap").innerHTML = added.length ? `Adding ${added.map((a) => `${a.mol} (${a.f})`).join(", ")}.` : "Served black: nothing but coffee's own molecules.";
                    ui.animate(m, 6500, (k, now) => draw(k, now, 1), () => {
                        busy = false;
                        const want = order.add.slice().sort().join(",");
                        const got = added.map((a) => a.id).sort().join(",");
                        const roastOk = order.roast === "any" || order.roast === roast;
                        const decafOk = order.decaf === "any" || (order.decaf === "yes" ? decaf !== "none" : decaf === order.decaf);
                        if (!roastOk) {
                            ui.result("bcRes", `✗ ${order.who} asked for a ${order.roast} roast.`, false);
                        } else if (!decafOk) {
                            ui.result("bcRes", order.decaf === "yes" ? `✗ ${order.who} wanted decaf: try a decaf process.` : `✗ ${order.who} wants the caffeine left in!`, false);
                        } else if (want !== got) {
                            const missing = order.add.filter((id) => !adds[id]).map((id) => ADDINS.find((a) => a.id === id).label.toLowerCase());
                            const extra = added.filter((a) => !order.add.includes(a.id)).map((a) => a.label.toLowerCase());
                            ui.result("bcRes", `✗ Close! ${missing.length ? `Missing: ${missing.join(", ")}. ` : ""}${extra.length ? `${order.who} didn't ask for: ${extra.join(", ")}.` : ""}`, false);
                        } else {
                            const regular = served("bucky", order.id, COFFEE_ORDERS.length);
                            ui.result("bcRes", `✓ ${order.who} takes a sip and smiles. ${order.why}${regular ? " ☕ Every order served: you're a Bucky Café regular!" : ""}`, true);
                            const next = COFFEE_ORDERS.find((o) => !cs().bucky[o.id]);
                            if (next) {
                                order = next;
                            }
                            renderOrders();
                        }
                    });
                });
            });
        }


        /* ---------- Drawing the cafés ---------- */

        function drawBar(c, X, Y, W, H, t, kind) {
            api.box(X, Y + 4, W, H - 4, kind === "ion" ? "#5d8fd6" : "#8a5a3b");
            rect(c, X + 2, Y + 4, W - 4, 3, kind === "ion" ? "#9cc4ff" : "#c08a5b");
            if (kind === "ion") {
                const cols = ["#ffd84a", "#c97fe0", "#5be38a", "#7fb2ff", "#ff8aa8", "#f5f7ff"];
                for (let i = 0; i < 6; i++) {
                    const x = X + 8 + i * ((W - 16) / 5);
                    rect(c, x - 3, Y - 6, 6, 10, "rgba(220, 235, 255, 0.7)");
                    rect(c, x - 3, Y - 2, 6, 6, cols[i]);
                }
            } else {
                // espresso machine and a steaming cup
                rect(c, X + 10, Y - 10, 22, 14, "#c8ceda");
                rect(c, X + 14, Y - 6, 14, 4, "#1a2033");
                const k = (t / 700) % 1;
                c.fillStyle = "rgba(255,255,255,0.5)";
                c.fillRect(X + W - 26, Y - 4 - k * 8, 2, 4);
                rect(c, X + W - 30, Y - 2, 10, 6, "#f5f7ff");
                rect(c, X + W - 29, Y - 1, 8, 2, "#6e4223");
            }
            const ay = Y - 30 + Math.round(Math.sin(t / 250) * 2);
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.moveTo(X + W / 2 - 5, ay - 1);
            c.lineTo(X + W / 2 + 5, ay - 1);
            c.lineTo(X + W / 2, ay + 6);
            c.fill();
            c.fillStyle = "#ffd84a";
            c.beginPath();
            c.moveTo(X + W / 2 - 3.5, ay);
            c.lineTo(X + W / 2 + 3.5, ay);
            c.lineTo(X + W / 2, ay + 4.5);
            c.fill();
        }

        function drawTable(c, X, Y, W, H, t, cup) {
            rect(c, X + 3, Y + 12, 10, 3, "rgba(0,0,0,0.2)");
            dot(c, X + 8, Y + 7, 7, "#1a2033");
            dot(c, X + 8, Y + 7, 6, "#e3c9a0");
            rect(c, X + 7, Y + 12, 2, 4, "#6b4a2f");
            rect(c, X + 5, Y + 4, 5, 4, "#f5f7ff");
            rect(c, X + 6, Y + 5, 3, 1, cup);
        }

        function drawMenu(c, X, Y, W, H, t, lines) {
            api.box(X, Y, W, H - 2, "#24365a");
            c.fillStyle = "#f5f7ff";
            c.font = "bold 5px sans-serif";
            c.textAlign = "left";
            c.textBaseline = "top";
            lines.forEach((ln, i) => c.fillText(ln, X + 3, Y + 3 + i * 6));
            c.textBaseline = "alphabetic";
        }

        function table(x, y, cup, lines) {
            return { kind: "table", x: x, y: y, w: 1, h: 1, prompt: "A: Look", draw: (c, X, Y, W, H, t) => drawTable(c, X, Y, W, H, t, cup), lines: lines };
        }

        // patrons are drawn as plain people
        function patron(id, name, x, y, look, lines) {
            return { id: id, name: name, x: x, y: y, dir: "down", look: look, talk: () => lines };
        }

        api.SCENES.ioncafe = {
            id: "ioncafe",
            label: "Ion Café",
            grid: api.interiorRows(),
            floor: "#e3f0f7",
            exitTo: { scene: "carbon", x: 15, y: 6 },
            objects: [
                {
                    kind: "ionbar", x: 4, y: 3, w: 12, h: 2, label: "Electrolyte bar",
                    prompt: "A: Mix a drink at the electrolyte bar",
                    draw: (c, X, Y, W, H, t) => drawBar(c, X, Y, W, H, t, "ion"),
                    use: openIonBar
                },
                {
                    kind: "menu", x: 1, y: 1, w: 3, h: 2, prompt: "A: Read the menu",
                    draw: (c, X, Y, W, H, t) => drawMenu(c, X, Y, W, H, t, ["NaCl ... saline", "CaCl2 .. brine", "MgSO4 ... bath", "LiPF6 . battery"]),
                    lines: ["MENU: saline (NaCl), de-icing brine (CaCl₂), Epsom bath salts (MgSO₄), sports drinks (Na⁺, K⁺, Cl⁻), battery electrolyte (LiPF₆), something sour, and baking soda (NaHCO₃).", "\"All drinks served charge-balanced. Please do not drink the battery electrolyte.\""]
                },
                table(4, 9, "#7fb2ff", ["A glass of salt water on the table. Dissolved salt splits into Na⁺ and Cl⁻ ions, so this water conducts electricity."]),
                table(6, 11, "#ffd84a", ["Somebody's half-finished sports drink. The label lists sodium and potassium: electrolytes."]),
                table(14, 9, "#5be38a", ["A glass of mineral water. \"Hard\" water has lots of Ca²⁺ and Mg²⁺ dissolved in it, which leave scale in kettles."])
            ],
            npcs: [
                patron("ionna", "Barista Ionna", 9, 6, { suit: "#e8f2ff", accent: "#3d6fd8", visor: "#54e0c7" }, [
                    "Welcome to the Ion Café! Step up to the bar and I'll show you how to mix.",
                    "Every drink here is an electrolyte: water full of ions. Just remember, the charges always have to balance. Nature insists!"
                ]),
                patron("coach", "Coach Lyte", 3, 11, { suit: "#ffd1dc", accent: "#ff6b9d", visor: "#33405c" }, [
                    "When you sweat, you lose water AND ions: mostly Na⁺ and Cl⁻, plus some K⁺.",
                    "That's why sports drinks add electrolytes back. Can you mix me one at the bar?"
                ]),
                patron("bea", "Baker Bea", 15, 11, { suit: "#fff2d6", accent: "#d9853b", visor: "#5d6577" }, [
                    "Baking soda is sodium bicarbonate, NaHCO₃. Mix it with something acidic and it fizzes out CO₂.",
                    "Those bubbles are what make my muffins rise!"
                ])
            ]
        };

        api.SCENES.buckycafe = {
            id: "buckycafe",
            label: "Bucky Café",
            grid: api.interiorRows(),
            floor: "#efe2cf",
            exitTo: { scene: "carboncity", x: 13, y: 6 },
            objects: [
                {
                    kind: "coffeebar", x: 4, y: 3, w: 12, h: 2, label: "Coffee bar",
                    prompt: "A: Make coffee at the bar",
                    draw: (c, X, Y, W, H, t) => drawBar(c, X, Y, W, H, t, "bucky"),
                    use: openCoffeeBar
                },
                {
                    kind: "menu", x: 1, y: 1, w: 3, h: 2, prompt: "A: Read the menu",
                    draw: (c, X, Y, W, H, t) => drawMenu(c, X, Y, W, H, t, ["C8H10N4O2", "light/med/dark", "mocha . latte", "decaf . black"]),
                    lines: ["MENU: light, medium or dark roast; decaf by water + activated carbon or supercritical CO₂; add-ins: milk, sugar, vanilla, cinnamon, cocoa, extra shot.", "The house logo is the caffeine formula, C₈H₁₀N₄O₂."]
                },
                {
                    kind: "roaster", x: 16, y: 7, w: 2, h: 2, prompt: "A: Look",
                    draw: (c, X, Y, W, H, t) => { api.box(X + 2, Y + 4, W - 4, H - 6, "#5d6577"); dot(c, X + W / 2, Y + 12, 7, "#3b2212"); rect(c, X + W / 2 - 1, Y - 2, 2, 8, "#8f98aa"); },
                    lines: ["A coffee roaster. Green coffee beans go in; heat sets off the Maillard reaction between sugars and amino acids, building hundreds of brown, toasty molecules.", "The longer the roast, the more melanoidins form and the more chlorogenic acids break down. That's the difference between a light and a dark roast."]
                },
                table(4, 9, "#6e4223", ["A cup of black coffee. Each sip holds caffeine, chlorogenic acids, melanoidins and hundreds of aroma molecules."]),
                table(6, 11, "#c4966a", ["A latte. Milk proteins grab onto some bitter molecules, which is part of why milk makes coffee taste smoother."])
            ],
            npcs: [
                patron("roasty", "Barista Roasty", 9, 6, { suit: "#f3e3c3", accent: "#8a5a3b", visor: "#54e0c7" }, [
                    "Welcome to the Bucky Café! Every coffee here is a carbon chemistry experiment.",
                    "Pick a roast, decide on caffeine, then add molecules. Step up to the bar and take an order!"
                ]),
                patron("nora", "Night-shift Nora", 14, 11, { suit: "#33405c", accent: "#ffd84a", visor: "#7fb2ff" }, [
                    "I need caffeine, C₈H₁₀N₄O₂. Lots of it.",
                    "Did you know caffeine is a natural pesticide? Coffee plants make it to keep bugs away."
                ])
            ]
        };

        // open the café doors
        const ionCafe = api.SCENES.carbon.buildings.find((b) => b.id === "cafe");
        ionCafe.scene = "ioncafe";
        ionCafe.locked = () => false;
        const buckyCafe = api.SCENES.carboncity.buildings.find((b) => b.id === "bucky-cafe");
        buckyCafe.scene = "buckycafe";
        buckyCafe.locked = () => false;
    });

})();
