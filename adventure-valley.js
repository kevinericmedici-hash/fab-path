/* ========================================
   FAB VALLEY ADVENTURE: FAB VALLEY EXTRAS
   Adds to the starting valley:
     - A working scanning electron microscope
       in MEMS Works: pick a sample, set the
       beam voltage, magnification, focus and
       stigmator, gold-coat insulators, then
       capture and measure. Three tasks: a
       DRIE trench (measure its depth), a KOH
       V-groove (name the etch) and SU-8
       pillars (image them without charging).
     - A Moore's Law billboard with an
       animated chart of transistor counts.
     - Dusty the Particle and Photon Phil,
       a giant wafer sculpture and a cleanroom
       bunny-suit statue.
     - The Foundry wet bench back in service.

   Facts: KOH etches silicon's (111) planes
   slowly, leaving 54.7° walls; DRIE (the
   Bosch process) leaves scallops; ISO class
   5 allows 3,520 particles ≥0.5 µm per m³;
   the i-line is 365 nm. Transistor counts:
   4004 (1971) 2,300 · 8086 (1978) 29,000 ·
   386 (1985) 275,000 · Pentium (1993)
   3.1 M · Pentium 4 (2000) 42 M · Core 2
   Duo (2006) 291 M · M1 Ultra (2022) 114 B.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.sem = { label: "Microscopy", icon: "🔬" };

        function vs() {
            const s = api.save();
            if (!s.valley) {
                s.valley = { sem: {}, moore: false };
            }
            return s.valley;
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


        /* ---------- Scanning electron microscope ---------- */

        const MAGS = [100, 200, 500, 1000, 2000, 5000, 10000];

        const SAMPLES = [
            { id: "drie", label: "DRIE trench (cross-section)", insulator: false, task: "Measure the trench depth" },
            { id: "koh", label: "Wet-etched groove (cross-section)", insulator: false, task: "Work out which etch made it" },
            { id: "su8", label: "SU-8 pillars (tilted view)", insulator: true, task: "Get a clean image without charging" }
        ];

        // field of view across the 460 px image, in µm
        function fieldUm(mag) {
            return 230000 / mag;
        }

        function niceBar(pxPerUm) {
            const options = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
            return options.find((um) => um * pxPerUm >= 60) || 1000;
        }

        // Draw the sample in SEM grays: edges glow brighter (the edge effect).
        function drawSample(c, id, mag, depth, opts) {
            const ppu = 460 / fieldUm(mag);
            c.fillStyle = "#08090c";
            c.fillRect(0, 0, 460, 230);
            if (id === "drie") {
                const w = 20 * ppu;
                const d = depth * ppu;
                // at high magnification, look at the left wall halfway down
                const zoomWall = mag >= 5000;
                const cx = zoomWall ? 230 + w / 2 + 60 : 230;
                const top = zoomWall ? 115 - d / 2 : 20;
                c.fillStyle = "#6d727c";
                c.fillRect(0, top, 460, 230 - top);
                c.fillStyle = "#08090c";
                c.fillRect(cx - w / 2, top, w, d);
                c.fillStyle = "#c9ced6";
                c.fillRect(0, top, cx - w / 2, 2);
                c.fillRect(cx + w / 2, top, 460 - cx - w / 2, 2);
                // bright sidewalls with Bosch scallops every ~1 µm
                const sc = Math.max(1, ppu);
                c.fillStyle = "#d9dde4";
                for (let y = top; y < top + d; y += sc) {
                    const bulge = ppu >= 3 ? sc * 0.35 : 0;
                    c.beginPath();
                    c.arc(cx - w / 2, y + sc / 2, Math.max(0.8, bulge), -Math.PI / 2, Math.PI / 2);
                    c.fill();
                    c.beginPath();
                    c.arc(cx + w / 2, y + sc / 2, Math.max(0.8, bulge), Math.PI / 2, Math.PI * 1.5);
                    c.fill();
                }
                c.fillRect(cx - w / 2, top + d - 1, w, 2);
            } else if (id === "koh") {
                const wTop = 60 * ppu;
                const d = 30 * Math.tan(54.7 * Math.PI / 180) * ppu;
                const top = 50;
                c.fillStyle = "#6d727c";
                c.fillRect(0, top, 460, 230 - top);
                c.fillStyle = "#08090c";
                c.beginPath();
                c.moveTo(230 - wTop / 2, top);
                c.lineTo(230 + wTop / 2, top);
                c.lineTo(230, top + d);
                c.closePath();
                c.fill();
                c.strokeStyle = "#e3e7ee";
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(0, top);
                c.lineTo(230 - wTop / 2, top);
                c.lineTo(230, top + d);
                c.lineTo(230 + wTop / 2, top);
                c.lineTo(460, top);
                c.stroke();
            } else {
                // SU-8 pillars seen at a tilt: tall bright-edged columns
                const pw = 15 * ppu;
                const ph = 50 * ppu * 0.8;
                const pitch = 40 * ppu;
                c.fillStyle = "#3a3f48";
                c.fillRect(0, 150, 460, 80);
                for (let x = 230 - pitch * 6; x < 460 + pitch; x += pitch) {
                    c.fillStyle = "#8a909a";
                    c.fillRect(x - pw / 2, 150 - ph, pw, ph);
                    c.fillStyle = "#c9ced6";
                    c.beginPath();
                    c.ellipse(x, 150 - ph, pw / 2, pw / 5, 0, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = "#e6e9ee";
                    c.fillRect(x - pw / 2, 150 - ph, 1.5, ph);
                    c.fillRect(x + pw / 2 - 1.5, 150 - ph, 1.5, ph);
                }
                if (opts.charging) {
                    // charge builds up on the insulator: glaring blooms and streaks
                    for (let x = 230 - pitch * 6; x < 460 + pitch; x += pitch) {
                        c.fillStyle = "rgba(255, 255, 255, 0.85)";
                        c.beginPath();
                        c.ellipse(x, 150 - ph, pw * 0.9, pw * 0.5, 0, 0, Math.PI * 2);
                        c.fill();
                    }
                    for (let i = 0; i < 9; i++) {
                        c.fillStyle = `rgba(255, 255, 255, ${0.25 + (i % 3) * 0.15})`;
                        c.fillRect(0, 20 + i * 22 + (opts.t / 40 % 10), 460, 3);
                    }
                }
                if (opts.coat) {
                    c.fillStyle = "rgba(255, 216, 120, 0.06)";
                    c.fillRect(0, 0, 460, 230);
                }
            }
            // scale bar and data strip
            const bar = niceBar(ppu);
            c.fillStyle = "rgba(0,0,0,0.7)";
            c.fillRect(0, 206, 460, 24);
            c.fillStyle = "#ffffff";
            c.fillRect(14, 216, bar * ppu, 4);
            c.font = "10px monospace";
            c.textAlign = "left";
            c.fillText(`${bar} µm`, 20 + bar * ppu, 222);
            c.textAlign = "right";
            c.fillText(`${opts.kv} kV   ×${mag.toLocaleString()}   SE`, 452, 222);
        }

        function openSem() {
            const st = vs();
            st.sem = st.sem || {};
            // each session the optimum focus and stigmator sit somewhere new
            const best = { wd: Math.round(Math.random() * 60 - 30), stig: Math.round(Math.random() * 30 - 15) };
            const depth = 50 + Math.round(Math.random() * 8) * 5;
            let sample = null;
            let busy = false;
            const m = api.openModal(`
                ${api.head("sem", "Scanning Electron Microscope")}
                <p class="adv-lead">An SEM scans a focused beam of electrons across the sample. Electrons knocked out of the surface (secondary electrons) build up the picture, so edges and steep walls glow brightest. It sees details far smaller than light can.</p>
                <div class="adv-card"><p class="adv-card-title">📋 Etch Tech Bo's card</p><ul>
                    <li><strong>Focus</strong> until edges are crisp, then fine-tune the <strong>stigmator</strong>, which fixes a stretched, smeared beam.</li>
                    <li>Insulators like SU-8 trap the beam's charge and <strong>glare</strong>. Sputter-coat them with a few nm of gold, or drop to about <strong>1–2 kV</strong>.</li>
                    <li>To measure, zoom out until the whole feature fits, then compare it to the scale bar.</li>
                </ul></div>
                <canvas id="smCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="smCap">Choose a sample to load into the chamber.</p>
                ${ui.chips("smp", SAMPLES.map((x) => ({ id: x.id, label: `${st.sem[x.id] ? "✓ " : ""}${x.label}` })), null)}
                <label class="adv-check"><input type="checkbox" id="smCoat"> Sputter-coat the sample with 5 nm of gold first</label>
                ${ui.slider("smKv", "Beam voltage", "kV", 1, 30, 1, 15)}
                ${ui.slider("smMag", "Magnification", "", 0, MAGS.length - 1, 1, 0)}
                ${ui.slider("smWd", "Focus", "", -50, 50, 1, 0)}
                ${ui.slider("smStig", "Stigmator", "", -25, 25, 1, 0)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="smGo" data-autofocus>Capture a slow, sharp scan</button></div>
                <div id="smQ"></div>`);
            const c = $("smCv").getContext("2d");
            const off = document.createElement("canvas");
            off.width = 460;
            off.height = 230;
            const oc = off.getContext("2d");
            let kvEl = null;
            let magEl = null;
            let wdEl = null;
            let stEl = null;
            kvEl = ui.wireSlider("smKv");
            magEl = ui.wireSlider("smMag", (v) => `×${MAGS[v].toLocaleString()}`);
            wdEl = ui.wireSlider("smWd");
            stEl = ui.wireSlider("smStig");

            function settings() {
                const kv = Number(kvEl.value);
                const coat = $("smCoat").checked;
                const smp = SAMPLES.find((x) => x.id === sample);
                return {
                    kv: kv,
                    mag: MAGS[Number(magEl.value)],
                    blur: Math.abs(Number(wdEl.value) - best.wd) * 0.22 + Math.abs(Number(stEl.value) - best.stig) * 0.16,
                    noise: kv <= 2 ? 0.5 : kv <= 5 ? 0.25 : 0.1,
                    charging: !!smp && smp.insulator && !coat && kv > 2,
                    coat: coat
                };
            }

            // the live "TV-rate" view: fast, noisy, refreshed continuously
            function frame(now, revealRow, slow) {
                if (!sample) {
                    c.fillStyle = "#08090c";
                    c.fillRect(0, 0, 460, 230);
                    label(c, "No sample loaded", 230, 118, "#5d6577", "center");
                    return;
                }
                const s = settings();
                drawSample(oc, sample, s.mag, depth, { charging: s.charging, coat: s.coat, kv: s.kv, t: now });
                c.save();
                c.filter = `blur(${s.blur.toFixed(1)}px)`;
                c.drawImage(off, 0, 0);
                c.restore();
                const grain = Math.round((slow ? 0.3 : 1) * s.noise * 1400);
                for (let i = 0; i < grain; i++) {
                    const g = Math.floor(Math.random() * 255);
                    c.fillStyle = `rgba(${g}, ${g}, ${g}, 0.35)`;
                    c.fillRect(Math.random() * 460, Math.random() * 206, 1.5, 1.5);
                }
                if (revealRow !== undefined) {
                    c.fillStyle = "#08090c";
                    c.fillRect(0, revealRow, 460, 230 - revealRow);
                    c.fillStyle = "rgba(127, 255, 160, 0.8)";
                    c.fillRect(0, revealRow, 460, 1);
                }
            }

            function live() {
                ui.animate(m, 60000, (k, now) => {
                    if (!busy) {
                        frame(now);
                    }
                }, live);
            }
            live();

            ui.wireChips("smp", (v) => {
                sample = v;
                $("smQ").innerHTML = "";
                const smp = SAMPLES.find((x) => x.id === v);
                $("smCap").innerHTML = `Loaded: <strong>${smp.label}</strong>. Task: ${smp.task}. Pump down, then focus.`;
            });

            $("smGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!sample) {
                    $("smCap").innerHTML = "Load a sample first.";
                    return;
                }
                busy = true;
                const s = settings();
                $("smCap").innerHTML = "Slow scan: the beam sweeps line by line from top to bottom, averaging away the noise…";
                ui.animate(m, 6500, (k, now) => frame(now, Math.round(230 * k), true), () => {
                    busy = false;
                    if (s.charging) {
                        $("smCap").innerHTML = "⚠️ The image glares and streaks. SU-8 is an insulator: the beam's electrons pile up on it with nowhere to go. Gold-coat it, or drop to 1–2 kV.";
                        return;
                    }
                    if (s.blur > 1.6) {
                        $("smCap").innerHTML = `⚠️ Too blurry to use. Sweep the focus until edges sharpen, then nudge the stigmator. (Blur: ${s.blur.toFixed(1)} px.)`;
                        return;
                    }
                    $("smCap").innerHTML = "✓ A crisp image!";
                    ask(s);
                });
            });

            function ask(s) {
                let q;
                if (sample === "drie") {
                    const sees = s.mag <= 1000;
                    if (!sees) {
                        $("smCap").innerHTML = s.mag >= 5000
                            ? "✓ Crisp! At this magnification you can see the sidewall's tiny ripples: scallops left by the DRIE (Bosch) process, which alternates etching and coating every second or so. Zoom out to ×1,000 or less to see the whole trench and measure it."
                            : "✓ Crisp, but the trench runs off the bottom of the screen. Zoom out to ×1,000 or less to measure its depth.";
                        return;
                    }
                    q = {
                        text: "Use the scale bar: about how deep is the trench?",
                        opts: [depth, Math.round(depth / 2), depth * 2, depth + 25].map((v) => `${v} µm`),
                        right: `${depth} µm`,
                        why: `About ${depth} µm deep and 20 µm wide: a high-aspect-ratio trench with nearly vertical walls, the hallmark of DRIE.`
                    };
                } else if (sample === "koh") {
                    q = {
                        text: "This groove has flat, angled walls meeting in a V. Which etch made it?",
                        opts: ["KOH wet etch: it stops on silicon's (111) planes at 54.7°", "DRIE: straight vertical walls", "Isotropic plasma etch: rounded bowl", "Nothing: it's a scratch"],
                        right: "KOH wet etch: it stops on silicon's (111) planes at 54.7°",
                        why: "KOH etches silicon's (111) crystal planes very slowly, so on a standard (100) wafer it leaves walls at exactly 54.7°. The crystal itself shapes the groove."
                    };
                } else {
                    q = {
                        text: "No glare this time. What stopped the charging?",
                        opts: [s.coat ? "The gold coating carried the charge away to ground" : "The low beam voltage: about as many electrons leave as arrive", "Making the image brighter", "Turning the stigmator", "Zooming in"],
                        right: s.coat ? "The gold coating carried the charge away to ground" : "The low beam voltage: about as many electrons leave as arrive",
                        why: "Insulators can't drain the beam's charge. A thin metal coat gives it a path to ground, and at very low voltage the sample emits about as many electrons as it receives."
                    };
                }
                const opts = window.SCGames ? window.SCGames.shuffle(q.opts) : q.opts;
                $("smQ").innerHTML = `
                    <div class="adv-takeaway">
                        <p><strong>${q.text}</strong></p>
                        <div class="adv-chips">${opts.map((o, i) => `<button type="button" class="adv-chip" data-sq="${i}">${o}</button>`).join("")}</div>
                        <p class="adv-result" id="sqRes"></p>
                    </div>`;
                let answered = false;
                api.modalBody().querySelectorAll("[data-sq]").forEach((b) => b.addEventListener("click", () => {
                    if (answered) {
                        return;
                    }
                    const ok = opts[Number(b.dataset.sq)] === q.right;
                    b.classList.add("on");
                    if (!ok) {
                        ui.result("sqRes", "✗ Not quite. Look again and try another answer.", false);
                        setTimeout(() => b.classList.remove("on"), 900);
                        return;
                    }
                    answered = true;
                    ui.result("sqRes", `✓ ${q.why}`, true);
                    const st2 = vs();
                    const first = !st2.sem[sample];
                    st2.sem[sample] = true;
                    api.writeSave();
                    if (first) {
                        api.gainXP(20);
                    }
                    const all = SAMPLES.every((x) => st2.sem[x.id]);
                    if (all && !st2.semMastered) {
                        st2.semMastered = true;
                        api.writeSave();
                        api.gainXP(60);
                        api.awardSiteXP("sem", 60);
                        $("smQ").insertAdjacentHTML("beforeend", '<div class="adv-takeaway"><p>🔬 <strong>SEM mastered!</strong> You imaged a DRIE trench, a KOH groove and insulating SU-8. Real fabs check every critical step like this.</p></div>');
                    } else if (!all) {
                        $("smQ").insertAdjacentHTML("beforeend", `<p class="adv-keys" style="text-align:left">Samples done: ${SAMPLES.filter((x) => st2.sem[x.id]).length} of ${SAMPLES.length}. Pick another sample above.</p>`);
                    }
                }));
            }
        }

        const mems = api.SCENES.mems.objects.find((o) => o.kind === "sem");
        mems.label = "SEM";
        mems.prompt = "A: Use the SEM";
        mems.use = openSem;
        delete mems.lines;


        /* ---------- Foundry wet bench, back in service ---------- */

        const wet = api.SCENES.foundry.objects.find((o) => o.kind === "bench" && o.x === 3);
        wet.lines = [
            "The wet bench, freshly serviced! Wafers get cleaned here in chemical baths before every critical step.",
            "Even one particle under the photoresist can ruin a chip. That's why cleanrooms filter their air so hard. Ask Dusty out in the valley."
        ];


        /* ---------- Moore's Law billboard ---------- */

        const CHIPS = [
            { year: 1971, n: 2300, name: "Intel 4004" },
            { year: 1978, n: 29000, name: "Intel 8086" },
            { year: 1985, n: 275000, name: "Intel 386" },
            { year: 1993, n: 3.1e6, name: "Pentium" },
            { year: 2000, n: 42e6, name: "Pentium 4" },
            { year: 2006, n: 291e6, name: "Core 2 Duo" },
            { year: 2022, n: 114e9, name: "Apple M1 Ultra" }
        ];

        function fmt(n) {
            return n >= 1e9 ? `${+(n / 1e9).toFixed(1)} billion` : n >= 1e6 ? `${+(n / 1e6).toFixed(1)} million` : n.toLocaleString();
        }

        function openMoore() {
            const m = api.openModal(`
                ${api.head("litho", "Moore's Law")}
                <p class="adv-lead">In 1965 Gordon Moore noticed that the number of transistors on a chip kept doubling at a steady pace. In 1975 he settled on about every two years, and the industry kept it up for decades.</p>
                <canvas id="moCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="moCap">Watch the chips arrive, one per era. The vertical axis is logarithmic: each gridline is 10× more transistors.</p>
                <div id="moQ"></div>`);
            const c = $("moCv").getContext("2d");
            const L = 56;
            const R = 446;
            const T = 14;
            const B = 196;
            const sx = (y) => L + (y - 1970) / (2024 - 1970) * (R - L);
            const sy = (n) => B - (Math.log10(n) - 3) / (12 - 3) * (B - T);

            ui.animate(m, 6500, (k) => {
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 230);
                c.strokeStyle = "#2c365a";
                for (let e = 3; e <= 12; e++) {
                    c.beginPath();
                    c.moveTo(L, sy(Math.pow(10, e)));
                    c.lineTo(R, sy(Math.pow(10, e)));
                    c.stroke();
                    if (e % 3 === 0) {
                        label(c, ["1 thousand", "1 million", "1 billion", "1 trillion"][e / 3 - 1], L - 4, sy(Math.pow(10, e)) + 4, "#a9b2d0", "right", false, 9);
                    }
                }
                [1970, 1980, 1990, 2000, 2010, 2020].forEach((y) => label(c, String(y), sx(y), B + 16, "#a9b2d0", "center", false, 10));
                // doubling every two years, from the 4004
                c.strokeStyle = "rgba(255, 216, 74, 0.5)";
                c.setLineDash([4, 4]);
                c.beginPath();
                c.moveTo(sx(1971), sy(2300));
                const yEnd = 1971 + (2023 - 1971) * k;
                c.lineTo(sx(yEnd), sy(2300 * Math.pow(2, (yEnd - 1971) / 2)));
                c.stroke();
                c.setLineDash([]);
                CHIPS.forEach((chip) => {
                    if (chip.year <= yEnd) {
                        dot(c, sx(chip.year), sy(chip.n), 4.5, "#54e0c7");
                        const late = chip.year > 2015;
                        label(c, chip.name, sx(chip.year) + (late ? -7 : 7), sy(chip.n) + 4, "#f5f7ff", late ? "right" : "left", false, 9);
                    }
                });
            }, () => {
                $("moCap").innerHTML = "From 2,300 transistors in 1971 to 114 billion in 2022: about 50 million times more. The dashed line doubles every two years.";
                const opts = window.SCGames ? window.SCGames.shuffle(["About every 2 years", "Every 10 years", "Every month", "It never changed"]) : ["About every 2 years"];
                $("moQ").innerHTML = `
                    <div class="adv-takeaway">
                        <p><strong>Following Moore's Law, about how often did transistor counts double?</strong></p>
                        <div class="adv-chips">${opts.map((o, i) => `<button type="button" class="adv-chip" data-mq="${i}">${o}</button>`).join("")}</div>
                        <p class="adv-result" id="mqRes"></p>
                    </div>`;
                api.modalBody().querySelectorAll("[data-mq]").forEach((b) => b.addEventListener("click", () => {
                    const ok = opts[Number(b.dataset.mq)] === "About every 2 years";
                    b.classList.add("on");
                    ui.result("mqRes", ok ? "✓ About every two years. Shrinking transistors made chips cheaper, faster and more efficient at the same time. Today the pace has slowed, and chipmakers stack and package dies in 3D to keep going." : "✗ Look at the dashed line: it doubles every two years.", ok);
                    if (ok && !vs().moore) {
                        vs().moore = true;
                        api.writeSave();
                        api.gainXP(30);
                    }
                }));
            });
        }


        /* ---------- Valley decorations and people ---------- */

        function drawBillboard(c, X, Y, W, H, t) {
            rect(c, X + 4, Y + 6, 2, 10, "#6b4a2f");
            rect(c, X + W - 6, Y + 6, 2, 10, "#6b4a2f");
            api.box(X, Y - 10, W, 18, "#f5f7ff");
            c.strokeStyle = "#3d6fd8";
            c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(X + 3, Y + 5);
            for (let i = 1; i <= 8; i++) {
                c.lineTo(X + 3 + i * (W - 6) / 8, Y + 5 - Math.pow(1.45, i) * 0.6);
            }
            c.stroke();
            c.fillStyle = "#1a2033";
            c.font = "bold 5px sans-serif";
            c.textAlign = "left";
            c.textBaseline = "middle";
            c.fillText("MOORE'S LAW", X + 3, Y - 6);
        }

        function drawWafer(c, X, Y, W, H, t) {
            const cx = X + W / 2;
            const cy = Y + H / 2 - 2;
            const r = W / 2 - 2;
            rect(c, X + 4, Y + H - 4, W - 8, 4, "#8f98aa");
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx, cy, r + 1, 0, Math.PI * 2);
            c.fill();
            const g = c.createLinearGradient(X, Y, X + W, Y + H);
            g.addColorStop(0, "#9fb3d9");
            g.addColorStop(0.5, "#e3e9f2");
            g.addColorStop(1, "#7f95c0");
            c.fillStyle = g;
            c.beginPath();
            c.arc(cx, cy, r, 0, Math.PI * 2);
            c.fill();
            // dies on the wafer
            c.strokeStyle = "rgba(61, 111, 216, 0.6)";
            c.lineWidth = 0.6;
            for (let x = cx - r; x <= cx + r; x += 4) {
                c.beginPath();
                c.moveTo(x, cy - r);
                c.lineTo(x, cy + r);
                c.stroke();
            }
            for (let y = cy - r; y <= cy + r; y += 4) {
                c.beginPath();
                c.moveTo(cx - r, y);
                c.lineTo(cx + r, y);
                c.stroke();
            }
            // notch and a moving glint
            rect(c, cx - 1.5, cy + r - 2, 3, 2, "#1a2033");
            const k = (t / 1800) % 1;
            c.fillStyle = "rgba(255,255,255,0.35)";
            c.fillRect(cx - r + k * 2 * r, cy - r + 3, 3, 2 * r - 6);
        }

        function drawBunnySuit(c, X, Y, W, H, t) {
            rect(c, X + 3, Y + 13, 10, 3, "#8f98aa");
            rect(c, X + 5, Y + 1, 6, 6, "#f5f7ff");
            rect(c, X + 6, Y + 3, 4, 2, "#3d6fd8");
            rect(c, X + 4, Y + 6, 8, 7, "#f5f7ff");
            rect(c, X + 3, Y + 7, 1, 4, "#f5f7ff");
            rect(c, X + 12, Y + 7, 1, 4, "#f5f7ff");
            rect(c, X + 5, Y + 6, 6, 1, "#c8ceda");
        }

        function drawDusty(c, X, Y, t) {
            const bob = Math.round(Math.sin(t / 300 + X) * 1.5);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            for (let i = 0; i < 14; i++) {
                const a = i * 0.9 + t / 1500;
                dot(c, cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 2.4, i % 2 ? "#8f98aa" : "#a9b2c4");
            }
            dot(c, cx, cy, 4.5, "#b8c0cf");
            rect(c, cx - 3, cy - 2, 2, 2, "#1a2033");
            rect(c, cx + 1, cy - 2, 2, 2, "#1a2033");
            rect(c, cx - 1, cy + 2, 2, 1, "#1a2033");
        }

        function drawPhoton(c, X, Y, t) {
            const bob = Math.round(Math.sin(t / 200 + X) * 2);
            const cx = X + 8;
            const cy = Y + 7 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            c.strokeStyle = "#b47bff";
            c.lineWidth = 1.5;
            c.beginPath();
            for (let i = 0; i <= 16; i++) {
                const x = X + i;
                const y = cy + Math.sin(i * 1.2 + t / 120) * 3;
                if (i) {
                    c.lineTo(x, y);
                } else {
                    c.moveTo(x, y);
                }
            }
            c.stroke();
            dot(c, cx, cy, 4, "#d7b8ff");
            rect(c, cx - 2, cy - 1, 1, 1, "#1a2033");
            rect(c, cx + 1, cy - 1, 1, 1, "#1a2033");
        }

        const world = api.SCENES.world;
        world.objects.push(
            {
                kind: "moore", x: 14, y: 12, w: 2, h: 1, draw: drawBillboard, label: "Moore's Law",
                prompt: "A: Read the billboard",
                use: openMoore
            },
            {
                kind: "wafersculpture", x: 6, y: 10, w: 2, h: 2, draw: drawWafer, prompt: "A: Look",
                lines: [
                    "A giant wafer sculpture, checkered with dies: each little square becomes one chip.",
                    "Fabs today mostly use 300 mm wafers. One wafer can hold hundreds of processor dies, or thousands of tiny sensor chips.",
                    "See the notch at the bottom? It marks the crystal direction, so every tool lines the wafer up the same way."
                ]
            },
            {
                kind: "bunnysuit", x: 17, y: 10, w: 1, h: 1, draw: drawBunnySuit, prompt: "A: Look",
                lines: [
                    "A statue of a cleanroom \"bunny suit\": hood, mask, gloves, boots and a full coverall.",
                    "It isn't to protect the engineer from the fab. It's to protect the wafers from the engineer: people shed millions of skin flakes and particles every hour."
                ]
            }
        );
        world.npcs.push(
            {
                id: "dusty", name: "Dusty the Particle", x: 4, y: 12, dir: "down",
                draw: (c, X, Y, t) => drawDusty(c, X, Y, t),
                talk: () => [
                    "Psst! I'm a dust particle. Out here I've got millions of friends in every cubic meter of air.",
                    "In an ISO class 5 cleanroom, only 3,520 particles 0.5 µm or bigger are allowed per cubic meter. Land one of us on a wafer and we can block a whole pattern.",
                    "That's why fabs filter their air nonstop and everyone wears bunny suits. Rude, if you ask me."
                ]
            },
            {
                id: "photon", name: "Photon Phil", x: 16, y: 9, dir: "down",
                draw: (c, X, Y, t) => drawPhoton(c, X, Y, t),
                talk: () => [
                    "Zip! I'm an ultraviolet photon from the Foundry's mercury lamp. My wavelength is 365 nanometers. Engineers call that the i-line.",
                    "I'm the one who changes the photoresist when I hit it. Shorter wavelengths can print smaller features. The newest fabs use extreme ultraviolet light at just 13.5 nm!"
                ]
            }
        );

        // Microscopes in the Foundry and MEMS Works. Fab Valley has no
        // recipe, so the stage follows the machines you've mastered.
        const VALLEY_STEPS = [
            { id: "spin", short: "Spin coat" },
            { id: "align", short: "Align, expose and develop" },
            { id: "drie", short: "Deep reactive ion etch" }
        ];

        api.addScope({
            type: "litho", title: "Dr. Ingot's Microscope",
            places: [["foundry", 17, 1], ["mems", 2, 1]],
            steps: VALLEY_STEPS,
            empty: "The microscope stage is empty. Master the spin coater, and your wafer will show up here.",
            state: () => {
                const m = api.save().mastered || {};
                return { recipe: true, step: m.spin ? (m.align ? (m.drie ? 3 : 2) : 1) : 0, defects: {} };
            },
            view: (n) => {
                const open = [[0.2, 0.32], [0.5, 0.62], [0.8, 0.86]];
                const solid = [[0, 0.2], [0.32, 0.5], [0.62, 0.8], [0.86, 1]];
                const layers = [
                    { name: "Silicon wafer", color: "#6f7890", h: 60 },
                    { name: "Silicon wafer", color: "#6f7890", h: 80, seg: n >= 3 ? solid : undefined },
                    { name: "Photoresist", color: "#e05a8a", h: 18, seg: n >= 2 ? solid : undefined }
                ];
                return {
                    layers: layers,
                    caption: [
                        "An even photoresist film from the spin coater.",
                        "Exposed through the mask and developed: the resist is gone where the mask let light through.",
                        "DRIE cut deep, straight-walled trenches into the silicon wherever the resist was open."
                    ][n - 1]
                };
            }
        });

    });

})();
