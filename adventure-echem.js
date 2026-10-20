/* ========================================
   FAB VALLEY ADVENTURE: ION CITY EAST
   The Echem Lab, across town from Dr.
   Carbon's lab. Devices built there are
   tested here: continuity, cyclic
   voltammetry and extended-gate FET
   transconductance. Then a boss: The
   Biofouler.

   How a device behaves comes from the
   defects recorded while it was made
   (save.carbon.device.effects).
   Electrochemistry values are rounded
   teaching values: ferri/ferrocyanide
   E°' ≈ +0.22 V vs Ag/AgCl, ideal
   ΔEp 59 mV, Randles-Ševčík peak
   current, Nernstian 59 mV/pH.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const rect = api.rect;
        const $ = (id) => document.getElementById(id);

        api.TYPES.echem = { label: "Electrochemistry", icon: "🔋" };

        function es() {
            const s = api.save();
            if (!s.echem) {
                s.echem = { boss: false, xp: {} };
            }
            return s.echem;
        }

        function device() {
            return api.carbon ? api.carbon.state().device : null;
        }

        function esc(s) {
            return String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
        }


        /* ---------- Device model ---------- */

        function sevOf(fx, keys) {
            let worst = null;
            keys.forEach((k) => {
                if (fx[k] === "major") {
                    worst = "major";
                } else if (fx[k] === "minor" && !worst) {
                    worst = "minor";
                }
            });
            return worst;
        }

        // Turn the recorded defects into what the test gear sees.
        function model(dev) {
            const fx = dev.effects || {};
            const pyro = (api.carbon.PYRO[dev.gcPeak] || { sigma: 1 }).sigma;
            const open = sevOf(fx, ["open", "peel", "pads", "cracks", "lifting"]);
            const highR = ["highR", "resist", "thickness"].filter((k) => fx[k]).length + (fx.peel === "minor" ? 1 : 0);
            const gcFlaws = ["particles", "rough", "residue", "smear", "streaks", "wide", "overlay"].filter((k) => fx[k]).length;
            return {
                open: open,
                covered: fx.covered || null,
                short: fx.short || null,
                leak: sevOf(fx, ["leak", "swell", "blister"]),
                swell: fx.swell || null,
                corrode: fx.corrode || null,
                sigma: Math.max(0.003, pyro),
                highR: highR,
                dEp: Math.round(66 + (1 - Math.min(1, pyro)) * 110 + gcFlaws * 12 + highR * 18),
                nernst: fx.covered === "major" || open === "major" ? 0 : Math.round(54 - (fx.leak === "major" ? 30 : fx.leak ? 12 : 0) - (fx.swell ? 8 : 0) - gcFlaws * 2)
            };
        }

        function needDevice() {
            api.say([
                "The test gear needs a device to measure.",
                "Build one in Dr. Carbon's Ion Lab first: it has to go all the way through release."
            ], "Dr. Redox");
        }

        function markTested(key, xp) {
            const dev = device();
            dev.tested[key] = true;
            const e = es();
            if (!e.xp[key]) {
                e.xp[key] = true;
                api.gainXP(xp);
            }
            api.writeSave();
        }

        function allTested(dev) {
            return !!dev && dev.tested.cont && dev.tested.cv && dev.tested.fet;
        }

        // shared bits of station UI, same look as the Carbon Lab
        function chips(name, options, selected) {
            return `<div class="adv-chips" role="radiogroup" aria-label="${esc(name)}">` + options.map((o) => `
                <button type="button" class="adv-chip${o.id === selected ? " on" : ""}" role="radio"
                    aria-checked="${o.id === selected}" data-chip="${esc(name)}" data-val="${esc(o.id)}">${o.label}</button>`).join("") + "</div>";
        }

        function wireChips(name, onPick) {
            const btns = api.modalBody().querySelectorAll(`[data-chip="${name}"]`);
            btns.forEach((b) => {
                b.addEventListener("click", () => {
                    btns.forEach((x) => {
                        x.classList.toggle("on", x === b);
                        x.setAttribute("aria-checked", x === b);
                    });
                    onPick(b.dataset.val);
                });
            });
        }

        function slider(id, labelText, unit, min, max, step, value) {
            return `
                <label for="${id}">${labelText}: <strong id="${id}Out">${value}</strong> ${unit}</label>
                <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">`;
        }

        function wireSlider(id, fmt, onChange) {
            const el = $(id);
            const out = $(id + "Out");
            const update = () => {
                out.textContent = fmt ? fmt(Number(el.value)) : el.value;
                if (onChange) {
                    onChange(Number(el.value));
                }
            };
            el.addEventListener("input", update);
            update();
            return el;
        }

        function result(id, html, good) {
            const el = $(id);
            el.className = "adv-result" + (good === true ? " good" : good === false ? " bad" : "");
            el.innerHTML = html;
        }

        function animate(m, dur, frame, done) {
            const start = performance.now();
            const tick = (now) => {
                if (m.dead) {
                    return;
                }
                const k = Math.min(1, (now - start) / dur);
                frame(k, now);
                if (k < 1) {
                    requestAnimationFrame(tick);
                } else if (done) {
                    done();
                }
            };
            requestAnimationFrame(tick);
        }

        // a simple x/y plot that can be drawn partially (k = 0..1)
        function plot(c, W, H, series, opts, k) {
            c.clearRect(0, 0, W, H);
            c.fillStyle = "#0b1020";
            c.fillRect(0, 0, W, H);
            const L = 54;
            const R = 14;
            const T = 14;
            const B = 34;
            const all = series.reduce((a, s) => a.concat(s.pts), []);
            let ymin = Math.min(0, ...all.map((p) => p[1]));
            let ymax = Math.max(0, ...all.map((p) => p[1]));
            if (ymax - ymin < (opts.minSpan || 1e-9)) {
                const mid = (ymax + ymin) / 2;
                ymin = mid - opts.minSpan / 2;
                ymax = mid + opts.minSpan / 2;
            }
            const pad = (ymax - ymin) * 0.08;
            ymin -= pad;
            ymax += pad;
            const sx = (x) => L + (x - opts.x0) / (opts.x1 - opts.x0) * (W - L - R);
            const sy = (y) => T + (ymax - y) / (ymax - ymin) * (H - T - B);

            c.strokeStyle = "#2c365a";
            c.lineWidth = 1;
            c.strokeRect(L, T, W - L - R, H - T - B);
            if (ymin < 0 && ymax > 0) {
                c.setLineDash([3, 4]);
                c.beginPath();
                c.moveTo(L, sy(0));
                c.lineTo(W - R, sy(0));
                c.stroke();
                c.setLineDash([]);
            }

            c.fillStyle = "#a9b2d0";
            c.font = "11px sans-serif";
            c.textAlign = "center";
            c.fillText(opts.xLabel, (L + W - R) / 2, H - 6);
            c.fillText(opts.x0.toFixed(1), L, H - 20);
            c.fillText(opts.x1.toFixed(1), W - R, H - 20);
            c.save();
            c.translate(14, (T + H - B) / 2);
            c.rotate(-Math.PI / 2);
            c.fillText(opts.yLabel, 0, 0);
            c.restore();
            c.textAlign = "right";
            c.fillText(opts.fmtY(ymax - pad), L - 4, T + 10);
            c.fillText(opts.fmtY(ymin + pad), L - 4, H - B);

            series.forEach((s) => {
                const n = Math.max(2, Math.floor(s.pts.length * k));
                c.strokeStyle = s.color;
                c.lineWidth = 2;
                c.beginPath();
                for (let i = 0; i < n; i++) {
                    const [x, y] = s.pts[i];
                    if (i) {
                        c.lineTo(sx(x), sy(y));
                    } else {
                        c.moveTo(sx(x), sy(y));
                    }
                }
                c.stroke();
            });
        }

        function noise(a) {
            return (Math.random() - 0.5) * 2 * a;
        }


        /* ---------- Test 1: continuity at the probe station ---------- */

        const PROBES = [
            { id: "trace", label: "Pad → its electrode (each channel)" },
            { id: "neighbor", label: "Pad → neighboring pad" },
            { id: "insul", label: "Pad → drop of saline on the insulation" }
        ];

        function openContinuity() {

            const dev = device();
            const md = model(dev);
            const judged = {};
            let probe = null;

            const m = api.openModal(`
                ${api.head("echem", "Probe Station: Continuity")}
                <p class="adv-lead">Before anything wet, check the wiring with a multimeter. Probe from a contact pad to different places, then decide whether each reading is a pass.</p>
                <div class="adv-machine">
                    <canvas id="ctCanvas" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Probe between</p>
                        ${chips("probe", PROBES, null)}
                        <div class="adv-lcd" id="ctMeter" style="min-width:180px">– – –</div>
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="ctGo" data-autofocus>Measure</button></div>
                        <div id="ctJudge"></div>
                        <p class="adv-result" id="ctResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("ctCanvas").getContext("2d");
            wireChips("probe", (v) => { probe = v; draw(v); });

            function draw(which) {
                c.clearRect(0, 0, 220, 200);
                rect(c, 20, 30, 180, 140, "#c98a3a");
                for (let i = 0; i < 4; i++) {
                    const x = 44 + i * 40;
                    rect(c, x - 2, 60, 4, 90, "#e8c34a");
                    rect(c, x - 9, 140, 18, 18, "#e8c34a");
                    c.fillStyle = "#2b2f3a";
                    c.beginPath();
                    c.arc(x, 56, 8, 0, Math.PI * 2);
                    c.fill();
                }
                if (which === "insul") {
                    c.fillStyle = "rgba(120, 190, 255, 0.6)";
                    c.beginPath();
                    c.ellipse(130, 100, 22, 12, 0, 0, Math.PI * 2);
                    c.fill();
                }
                const tip = (x, y, col) => {
                    c.strokeStyle = col;
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(x + 30, y - 40);
                    c.lineTo(x, y);
                    c.stroke();
                };
                if (which === "trace") {
                    tip(44, 149, "#ff6b7d");
                    tip(44, 56, "#1a2033");
                } else if (which === "neighbor") {
                    tip(44, 149, "#ff6b7d");
                    tip(84, 149, "#1a2033");
                } else if (which === "insul") {
                    tip(44, 149, "#ff6b7d");
                    tip(130, 100, "#1a2033");
                }
            }

            draw(null);

            function reading(which) {
                const fmt = (ohm) => ohm >= 1e6 ? (ohm / 1e6).toFixed(1) + " MΩ" : ohm >= 1e3 ? (ohm / 1e3).toFixed(2) + " kΩ" : Math.round(ohm) + " Ω";
                if (which === "trace") {
                    const base = 30 + md.highR * 60 + 180 / md.sigma;
                    const vals = [0, 1, 2, 3].map((i) => {
                        if (md.open === "major" || (md.open === "minor" && i === 2)) {
                            return "OL";
                        }
                        return fmt(base * (0.95 + i * 0.04));
                    });
                    return { text: vals.map((v, i) => `Ch ${i + 1}: ${v}`).join("<br>"), ok: !md.open && base < 2000 };
                }
                if (which === "neighbor") {
                    if (md.short === "major") {
                        return { text: "Ch 1–2: 14 Ω<br>Ch 3–4: 22 Ω", ok: false };
                    }
                    if (md.short === "minor") {
                        return { text: "Ch 1–2: OL<br>Ch 2–3: 41 Ω", ok: false };
                    }
                    return { text: "OL (open)", ok: true };
                }
                if (md.leak === "major") {
                    return { text: fmt(52e3), ok: false };
                }
                if (md.leak === "minor") {
                    return { text: fmt(2.4e6), ok: false };
                }
                return { text: "OL (over 1 GΩ)", ok: true };
            }

            const EXPECT = {
                trace: "Each pad should connect to its electrode with a modest resistance (hundreds of ohms here, mostly from the carbon). \"OL\" (open loop) means a broken path.",
                neighbor: "Neighboring traces should NOT be connected: OL is good. A few ohms means metal is bridging them, a short.",
                insul: "The polyimide should insulate: the meter should read OL (more than a gigaohm). Kilo- or megaohms mean the saline is leaking through pinholes."
            };

            $("ctGo").addEventListener("click", () => {

                if (!probe) {
                    result("ctResult", "Choose where to put the probes first.", false);
                    return;
                }

                const r = reading(probe);
                $("ctMeter").innerHTML = r.text;
                result("ctResult", "");
                $("ctJudge").innerHTML = `
                    <p class="adv-round" style="margin-top:6px">Is this reading a pass?</p>
                    <div class="adv-button-row">
                        <button type="button" class="adv-btn" data-j="pass">✓ Pass</button>
                        <button type="button" class="adv-btn secondary" data-j="fail">✗ Problem</button>
                    </div>`;

                const which = probe;

                api.modalBody().querySelectorAll("[data-j]").forEach((b) => {
                    b.addEventListener("click", () => {
                        const said = b.dataset.j === "pass";
                        const right = said === r.ok;
                        judged[which] = right;
                        $("ctJudge").innerHTML = "";
                        result("ctResult", `${right ? "✓ Right call." : "✗ Not quite."} ${EXPECT[which]} This one is ${r.ok ? "a pass" : "a problem"}.`, right);

                        if (PROBES.every((p) => p.id in judged)) {
                            const score = Object.values(judged).filter(Boolean).length;
                            markTested("cont", 30);
                            $("ctJudge").innerHTML = `
                                <div class="adv-takeaway"><p><strong>Continuity check done.</strong> ${score} of 3 calls right.</p></div>
                                <button type="button" class="adv-btn" data-close>Done</button>`;
                        }
                    });
                });
            });
        }


        /* ---------- Test 2: cyclic voltammetry ---------- */

        const ELECTROLYTES = [
            { id: "ferri", label: "5 mM K₃[Fe(CN)₆] in 1 M KCl" },
            { id: "pbs", label: "PBS, pH 7.4" },
            { id: "h2so4", label: "0.5 M H₂SO₄" },
            { id: "di", label: "DI water" }
        ];

        const RATES = [10, 25, 50, 100, 250, 500];

        // diffusion-shaped peak, normalized so its maximum is 1
        const DUCK = (() => {
            const f = (x) => (1 / (1 + Math.exp(-x * 1.8))) / Math.sqrt(1 + Math.max(0, x) * 0.55);
            let mx = 0;
            for (let x = -10; x < 20; x += 0.01) {
                mx = Math.max(mx, f(x));
            }
            return (x) => f(x) / mx;
        })();

        function cvRun(md, p) {

            const E0 = 0.22;
            const dEp = md.dEp / 1000;
            const v = p.rate / 1000;
            let ip = p.elec === "ferri" ? 11 * Math.sqrt(v / 0.1) : 0;
            let scale = 1;
            const notes = [];

            if (md.open === "major") {
                scale = 0;
            } else if (md.covered === "major") {
                scale = 0.04;
            } else if (md.covered === "minor" || md.open === "minor") {
                scale = 0.6;
            }
            if (p.elec === "di") {
                scale *= 0.03;
            }

            const cdl = 0.6 * v / 0.1;
            const rLeak = md.leak === "major" ? 0.05 : md.leak === "minor" ? 0.6 : 0;
            const series = [];
            const cycles = md.swell ? 3 : 1;

            for (let cyc = 0; cyc < cycles; cyc++) {
                const pts = [];
                const drift = cyc * (md.swell === "major" ? 1.2 : 0.5);
                const N = 220;
                for (let pass = 0; pass < 2; pass++) {
                    for (let i = 0; i <= N; i++) {
                        const fwd = pass === 0;
                        const E = fwd ? p.lo + (p.hi - p.lo) * i / N : p.hi - (p.hi - p.lo) * i / N;
                        let iF = 0;
                        if (ip) {
                            iF = fwd ? ip * DUCK((E - (E0 + dEp / 2)) / 0.026) : -0.95 * ip * DUCK(((E0 - dEp / 2) - E) / 0.026);
                        }
                        let iC = (fwd ? 1 : -1) * (cdl + drift * 0.6);
                        if (p.elec === "h2so4") {
                            const hump = 1.2 * (v / 0.1) * Math.exp(-Math.pow((E - (fwd ? 0.38 : 0.32)) / 0.08, 2));
                            iC += fwd ? hump : -hump;
                        }
                        let iB = 0;
                        if (rLeak) {
                            iB += (E - 0.1) / rLeak * 4;
                        }
                        if (p.hi > 1.2) {
                            iB += 25 * Math.exp((E - 1.2) / 0.07) * (E > 1.0 ? 1 : 0);
                        }
                        if (p.lo < -1.0) {
                            iB -= 25 * Math.exp((-1.0 - E) / 0.07) * (E < -0.8 ? 1 : 0);
                        }
                        if (md.corrode && p.elec !== "di" && E > 0.4) {
                            iB += Math.min(80, 6 * Math.exp((E - 0.4) / 0.06));
                        }
                        const i_ = scale * (iF + iC + iB) + noise(scale ? 0.08 : 0.02);
                        pts.push([E, i_]);
                    }
                }
                series.push({ pts: pts, color: ["#54e0c7", "#ffd84a", "#ff8a5c"][cyc] });
            }

            // what an expert would say about this run
            const window = p.lo <= 0 && p.hi >= 0.5;
            const safe = p.hi <= 1.2 && p.lo >= -1.0;
            let good = false;

            if (md.open === "major") {
                notes.push("Flat line, just noise: no current reaches the electrode. Something in the wiring is broken (check continuity).");
            } else if (md.covered === "major") {
                notes.push("Almost nothing: the electrode is still covered by polyimide, so the solution can't touch the carbon.");
            } else if (p.elec === "di") {
                notes.push("DI water has almost no ions, so it barely conducts. Electrochemistry needs a supporting electrolyte.");
            } else if (p.elec === "pbs") {
                notes.push("Just a thin rectangle: that's double-layer charging. PBS has no redox-active molecule, so there are no peaks.");
            } else if (p.elec === "h2so4") {
                notes.push("Mostly charging current, plus small bumps near +0.35 V from oxygen groups on the carbon surface. Acid is great for cleaning carbon but not for this test.");
            } else if (!window) {
                notes.push(`The window (${p.lo.toFixed(1)} to ${p.hi.toFixed(1)} V) doesn't cover ferricyanide's redox potential near +0.22 V vs Ag/AgCl, so you missed the peaks. Sweep from about −0.2 to +0.6 V.`);
            } else {
                good = true;
                notes.push(`Peak separation ΔE<sub>p</sub> = <strong>${md.dEp} mV</strong> (ideal for a fast one-electron couple: 59 mV). ${md.dEp < 90 ? "Fast electron transfer: nice carbon!" : md.dEp < 140 ? "A bit sluggish: the carbon or wiring adds resistance." : "Very sluggish: poorly conductive carbon or a resistive path."}`);
                notes.push(`Anodic peak current: <strong>${(ip * scale).toFixed(1)} µA</strong> at ${p.rate} mV/s.`);
            }
            if (!safe) {
                notes.push(`Careful: past ${p.hi > 1.2 ? "+1.2 V you're splitting water into oxygen" : "−1.0 V you're splitting water into hydrogen"}. That steep tail is bubbles forming on the electrode.`);
            }
            if (md.leak && md.open !== "major") {
                notes.push("The whole curve is tilted: current is leaking through pinholes in the insulation to the traces underneath.");
            }
            if (md.corrode && p.elec !== "di" && p.hi > 0.45) {
                notes.push("That huge current above +0.4 V is aluminum dissolving in chloride. The traces are corroding!");
            }
            if (md.swell) {
                notes.push("Each cycle drifts away from the last: the under-cured polyimide is soaking up water and swelling.");
            }

            return { series: series, notes: notes, good: good && safe && !md.corrode, ip: ip * scale };
        }

        function openCV() {

            const dev = device();
            const md = model(dev);
            const runs = {};
            let elec = null;
            let rate = 100;
            let busy = false;

            const m = api.openModal(`
                ${api.head("echem", "Potentiostat: Cyclic Voltammetry")}
                <p class="adv-lead">Dip the device in a beaker with an Ag/AgCl reference electrode and a platinum counter electrode. The potentiostat sweeps your carbon electrode's voltage up and back while measuring the current.</p>
                <p class="adv-calib">Dr. Redox's task: get clean ferricyanide peaks at <strong>two different scan rates</strong>. For a diffusion-controlled couple, peak current grows with the square root of scan rate.</p>
                <canvas id="cvCanvas" width="460" height="260" class="adv-wide-canvas"></canvas>
                <div class="adv-furnace-grid">
                    <div>
                        <p class="adv-round">Electrolyte</p>
                        ${chips("elec", ELECTROLYTES, null)}
                        <p class="adv-round" style="margin-top:12px">Scan rate (mV/s)</p>
                        ${chips("rate", RATES.map((r) => ({ id: String(r), label: String(r) })), "100")}
                    </div>
                    <div>
                        ${slider("cvLo", "Low potential", "V vs Ag/AgCl", -1.4, 0.4, 0.1, -0.6)}
                        ${slider("cvHi", "High potential", "V vs Ag/AgCl", 0, 1.6, 0.1, 1.4)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="cvGo" data-autofocus>Run CV</button></div>
                    </div>
                </div>
                <div class="adv-takeaway" id="cvNotes" hidden></div>
                <div id="cvDone"></div>`);

            const c = $("cvCanvas").getContext("2d");
            const loEl = wireSlider("cvLo", (v) => v.toFixed(1));
            const hiEl = wireSlider("cvHi", (v) => v.toFixed(1));
            wireChips("elec", (v) => { elec = v; });
            wireChips("rate", (v) => { rate = Number(v); });

            plot(c, 460, 260, [], { x0: -0.6, x1: 1.4, xLabel: "E (V vs Ag/AgCl)", yLabel: "i (µA)", fmtY: (y) => y.toFixed(1), minSpan: 2 }, 1);

            $("cvGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!elec) {
                    $("cvNotes").hidden = false;
                    $("cvNotes").innerHTML = "<p>Pick an electrolyte first.</p>";
                    return;
                }

                const lo = Number(loEl.value);
                const hi = Number(hiEl.value);
                if (hi - lo < 0.3) {
                    $("cvNotes").hidden = false;
                    $("cvNotes").innerHTML = "<p>Make the window at least 0.3 V wide.</p>";
                    return;
                }

                busy = true;
                const r = cvRun(md, { elec: elec, rate: rate, lo: lo, hi: hi });
                const opts = { x0: lo, x1: hi, xLabel: "E (V vs Ag/AgCl)", yLabel: "i (µA)", fmtY: (y) => y.toFixed(1), minSpan: 2 };
                $("cvNotes").hidden = true;

                animate(m, 3500, (k) => plot(c, 460, 260, r.series, opts, k), () => {

                    busy = false;
                    $("cvNotes").hidden = false;
                    $("cvNotes").innerHTML = r.notes.map((n) => `<p>${n}</p>`).join("");

                    if (r.good) {
                        runs[rate] = r.ip;
                    }

                    const rates = Object.keys(runs).map(Number);
                    if (rates.length >= 2 && !$("cvFinish")) {
                        rates.sort((a, b) => a - b);
                        const a = rates[0];
                        const b = rates[rates.length - 1];
                        const ratio = runs[b] / runs[a];
                        const expect = Math.sqrt(b / a);
                        markTested("cv", 40);
                        $("cvDone").innerHTML = `
                            <div class="adv-takeaway">
                                <p><strong>Task complete!</strong> Going from ${a} to ${b} mV/s, the peak current grew ${ratio.toFixed(2)}×. √(${b}/${a}) = ${expect.toFixed(2)}. ${Math.abs(ratio / expect - 1) < 0.1 ? "It matches: the reaction is limited by diffusion of ferricyanide to the electrode, just like the Randles–Ševčík equation says." : "Close enough, given the noise."}</p>
                            </div>
                            <button type="button" class="adv-btn" id="cvFinish" data-close>Done</button>`;
                    }
                });
            });
        }


        /* ---------- Test 3: extended-gate FET transconductance ---------- */

        const BUFFERS = [
            { id: "4", label: "pH 4 buffer" },
            { id: "7", label: "pH 7 buffer" },
            { id: "10", label: "pH 10 buffer" },
            { id: "di", label: "DI water" }
        ];

        function openFET() {

            const dev = device();
            const md = model(dev);
            const runs = {};
            let buffer = null;
            let busy = false;
            let drift = 0;

            const m = api.openModal(`
                ${api.head("echem", "FET Analyzer: Transconductance")}
                <p class="adv-lead">Your glassy carbon electrode is wired to the gate of a MOSFET on the test board (an <strong>extended-gate</strong> ISFET). The Ag/AgCl reference electrode in the buffer sets the gate voltage. Ions in the solution shift the carbon's surface potential, so the transistor's threshold moves with pH.</p>
                <p class="adv-calib">Dr. Redox's task: sweep the gate in <strong>two different pH buffers</strong> and measure the pH sensitivity. The ideal (Nernstian) limit is 59 mV/pH at 25 °C.</p>
                <canvas id="fetCanvas" width="460" height="260" class="adv-wide-canvas"></canvas>
                <div class="adv-furnace-grid">
                    <div>
                        <p class="adv-round">Buffer</p>
                        ${chips("buf", BUFFERS, null)}
                    </div>
                    <div>
                        ${slider("fetVds", "Drain voltage V<sub>DS</sub>", "V", 0.05, 0.5, 0.05, 0.1)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="fetGo" data-autofocus>Sweep gate 0 → 3 V</button></div>
                    </div>
                </div>
                <div class="adv-takeaway" id="fetNotes" hidden></div>
                <div id="fetDone"></div>`);

            const c = $("fetCanvas").getContext("2d");
            const vdsEl = wireSlider("fetVds", (v) => v.toFixed(2));
            wireChips("buf", (v) => { buffer = v; });

            const opts = { x0: 0, x1: 3, xLabel: "Gate voltage V_G (V vs Ag/AgCl)", yLabel: "I_D (µA)", fmtY: (y) => y.toFixed(0), minSpan: 10 };
            plot(c, 460, 260, [], opts, 1);

            const colors = { 4: "#ff8a5c", 7: "#54e0c7", 10: "#7fb2ff", di: "#a9b2d0" };
            const series = {};

            $("fetGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!buffer) {
                    $("fetNotes").hidden = false;
                    $("fetNotes").innerHTML = "<p>Pick a buffer first.</p>";
                    return;
                }

                busy = true;
                const vds = Number(vdsEl.value);
                const k = 1000; // µA/V²
                const floating = md.open === "major" || md.covered === "major";
                const pH = buffer === "di" ? 7 : Number(buffer);

                if (md.swell) {
                    drift += md.swell === "major" ? 0.06 : 0.025;
                }
                let vt = 1.0 + md.nernst / 1000 * (pH - 7) + drift;
                if (buffer === "di") {
                    vt += noise(0.25);
                }
                if (floating) {
                    vt = 1.0 + noise(0.8);
                }

                const pts = [];
                for (let i = 0; i <= 150; i++) {
                    const vg = 3 * i / 150;
                    const ov = vg - vt;
                    // subthreshold, saturation (V_DS > overdrive), then linear
                    let id = ov <= 0
                        ? 0.05 * Math.exp(ov / 0.08)
                        : ov < vds ? k * ov * ov / 2
                        : k * (ov * vds - vds * vds / 2);
                    id += noise(floating || buffer === "di" ? 12 : 0.6);
                    pts.push([vg, id]);
                }
                series[buffer] = { pts: pts, color: colors[buffer] };

                const gm = k * vds;
                $("fetNotes").hidden = true;

                animate(m, 3000, (kk) => plot(c, 460, 260, Object.values(series), opts, kk), () => {

                    busy = false;
                    const notes = [];

                    if (floating) {
                        notes.push("The curve jumps around: the gate is floating. The MOSFET isn't really connected to the solution through your electrode (check continuity, and whether the electrode openings were cleared).");
                    } else if (buffer === "di") {
                        notes.push("Unstable threshold: DI water has no buffer and almost no ions, so the surface potential wanders. Use a pH buffer.");
                    } else {
                        runs[buffer] = vt;
                        notes.push(`Threshold V<sub>T</sub> ≈ <strong>${vt.toFixed(3)} V</strong> in pH ${buffer}. Transconductance g<sub>m</sub> = ΔI<sub>D</sub>/ΔV<sub>G</sub> ≈ <strong>${Math.round(gm)} µS</strong> at V<sub>DS</sub> = ${vds.toFixed(2)} V (it scales with V<sub>DS</sub> in this linear region).`);
                    }
                    if (md.swell && !floating) {
                        notes.push("The threshold creeps a little every sweep: the under-cured polyimide is swelling, so the device drifts.");
                    }

                    $("fetNotes").hidden = false;
                    $("fetNotes").innerHTML = notes.map((n) => `<p>${n}</p>`).join("");

                    const keys = Object.keys(runs);
                    if (keys.length >= 2 && !$("fetFinish")) {
                        keys.sort((a, b) => Number(a) - Number(b));
                        const a = keys[0];
                        const b = keys[keys.length - 1];
                        const s = Math.round((runs[b] - runs[a]) / (Number(b) - Number(a)) * 1000);
                        markTested("fet", 40);
                        $("fetDone").innerHTML = `
                            <div class="adv-takeaway">
                                <p><strong>Task complete!</strong> From pH ${a} to pH ${b}, the threshold moved ${((runs[b] - runs[a]) * 1000).toFixed(0)} mV: a sensitivity of <strong>${s} mV/pH</strong>.</p>
                                <p>${s >= 50 ? "Close to the 59 mV/pH Nernstian limit. Excellent sensing surface!" : s >= 35 ? "Sub-Nernstian, which is common for carbon surfaces. Leaks or a rough surface lower it further." : "Low sensitivity: something (leaky insulation, swelling, a damaged surface) is eating the signal."}</p>
                            </div>
                            <button type="button" class="adv-btn" id="fetFinish" data-close>Done</button>`;
                    }
                });
            });
        }


        /* ---------- Boss: The Biofouler ---------- */

        function drawBiofouler(c, ox, oy, s, t) {
            const bob = Math.sin(t / 420) * 1;
            const px = (x, y, w, h, col) => rect(c, ox + x * s, oy + (y + bob) * s, w * s, h * s, col);
            const wob = (i) => Math.round(Math.sin(t / 300 + i) * 1);

            px(4, 30, 24, 2, "rgba(0,0,0,0.25)");
            // slimy body
            px(5, 8, 22, 21, "#173a1c");
            px(3, 12, 26, 15, "#173a1c");
            px(6, 9, 20, 19, "#4caf50");
            px(4, 13, 24, 13, "#4caf50");
            px(8, 10, 8, 3, "#8be38f");
            // drips
            for (let i = 0; i < 4; i++) {
                px(7 + i * 6, 27, 3, 2 + Math.abs(wob(i)) + (i % 2), "#4caf50");
            }
            // protein strands stuck to it
            const strands = [[4, 11], [24, 9], [27, 18], [2, 20], [14, 6]];
            strands.forEach(([x, y], i) => {
                px(x, y + wob(i), 2, 1, "#f2d58a");
                px(x + 1, y + 1 + wob(i), 1, 2, "#f2d58a");
                px(x + 2, y + 2 + wob(i), 2, 1, "#f2d58a");
            });
            // eyes and grin
            const blink = Math.floor(t / 2300) % 5 === 0 && (t % 2300) < 150;
            px(10, 14, 5, 5, "#ffffff");
            px(18, 14, 5, 5, "#ffffff");
            if (blink) {
                px(10, 14, 5, 5, "#4caf50");
                px(18, 14, 5, 5, "#4caf50");
            } else {
                px(12, 16, 2, 2, "#173a1c");
                px(20, 16, 2, 2, "#173a1c");
            }
            px(11, 21, 11, 2, "#173a1c");
            px(12, 23, 9, 1, "#173a1c");
            px(13, 21, 2, 2, "#ffffff");
            px(18, 21, 2, 2, "#ffffff");
        }

        const ECHEM_QUESTIONS = {
            cv: [
                {
                    q: "In cyclic voltammetry, what do you sweep and what do you measure?",
                    a: ["Sweep the electrode potential up and back, measure the current", "Sweep the current, measure the voltage", "Sweep the temperature, measure resistance", "Sweep the frequency, measure impedance"],
                    why: "CV ramps the working electrode's potential back and forth against a reference and records the current that flows."
                },
                {
                    q: "For a reversible couple like ferri/ferrocyanide, the peak current grows with…",
                    a: ["The square root of the scan rate", "The scan rate itself", "The square of the scan rate", "Nothing; it's constant"],
                    why: "Diffusion-controlled peaks follow the Randles–Ševčík equation: i<sub>p</sub> ∝ √v. Surface-bound species scale with v instead."
                },
                {
                    q: "What is the ideal peak separation ΔEp for a fast one-electron couple at 25 °C?",
                    a: ["About 59 mV", "About 590 mV", "About 5.9 mV", "Exactly 0 mV"],
                    why: "Fast (reversible) one-electron transfer gives ~59 mV. Bigger gaps mean slower electron transfer or extra resistance."
                },
                {
                    q: "Why is 1 M KCl added to the ferricyanide test solution?",
                    a: ["It's a supporting electrolyte: it carries current and cuts solution resistance", "It reacts with the carbon to make peaks", "It keeps the solution cold", "It's the redox probe"],
                    why: "Lots of inert ions let current flow easily, so the measured peaks come from the redox probe, not from the solution's resistance."
                }
            ],
            eis: [
                {
                    q: "What does electrochemical impedance spectroscopy (EIS) measure?",
                    a: ["Impedance across many frequencies, using a small AC voltage", "Resistance at one DC voltage", "Peak currents during a voltage sweep", "Temperature of the electrolyte"],
                    why: "EIS applies a small sine wave at many frequencies and records how the current responds in size and phase."
                },
                {
                    q: "In a Nyquist plot, a bigger semicircle usually means…",
                    a: ["Higher charge-transfer resistance, like a fouled surface", "Faster electron transfer", "More electrolyte", "A shorter cable"],
                    why: "The semicircle's diameter is the charge-transfer resistance. Proteins blocking the surface make it grow."
                },
                {
                    q: "Why is the EIS perturbation kept small (around 10 mV)?",
                    a: ["So the system responds linearly", "To save battery", "So the electrode heats up", "Large signals are illegal"],
                    why: "Electrochemical systems are nonlinear. A small signal keeps the response linear, so the impedance math holds."
                },
                {
                    q: "At very high frequency, the impedance mostly reflects…",
                    a: ["The solution (ohmic) resistance", "Diffusion of the redox probe", "The reference electrode's age", "The color of the solution"],
                    why: "At high frequency the double layer acts like a short, leaving just the solution resistance."
                }
            ],
            cell: [
                {
                    q: "Why use a reference electrode like Ag/AgCl?",
                    a: ["It holds a stable, known potential to measure against", "It carries most of the current", "It cleans the working electrode", "It heats the solution"],
                    why: "The potentiostat controls the working electrode's potential relative to the reference, which barely changes."
                },
                {
                    q: "What does the counter (auxiliary) electrode do?",
                    a: ["It carries the current so none has to flow through the reference", "It sets the reference potential", "It measures pH", "It stores charge"],
                    why: "Current flows between working and counter electrodes. The reference only senses voltage."
                },
                {
                    q: "Why cycle a carbon electrode in dilute H₂SO₄ before measuring?",
                    a: ["To clean and activate the surface by stripping adsorbed contaminants", "To make it thicker", "To dissolve the carbon", "To add more gold"],
                    why: "Electrochemical cycling in acid strips adsorbed organics and refreshes the surface, giving cleaner, faster responses."
                },
                {
                    q: "Why purge some solutions with nitrogen before measuring?",
                    a: ["To remove dissolved oxygen, which adds its own reduction current", "To cool the solution", "To add nitrogen ions", "To stop evaporation"],
                    why: "Dissolved O<sub>2</sub> gets reduced at negative potentials, adding background current that hides your signal."
                }
            ],
            fet: [
                {
                    q: "In an extended-gate ISFET, what does the sensing electrode connect to?",
                    a: ["The gate of a regular MOSFET", "The drain of a battery", "The reference electrode", "Nothing; it floats"],
                    why: "The sensing surface sits in the solution, wired to a MOSFET gate. Surface potential changes shift the transistor's threshold."
                },
                {
                    q: "Transconductance g<sub>m</sub> is…",
                    a: ["How much drain current changes per volt of gate voltage", "The resistance of the gate oxide", "The leakage current", "The pH of the buffer"],
                    why: "g<sub>m</sub> = ΔI<sub>D</sub>/ΔV<sub>G</sub>. Higher g<sub>m</sub> turns a small surface-potential change into a bigger current change."
                },
                {
                    q: "What is the ideal (Nernstian) pH sensitivity at 25 °C?",
                    a: ["About 59 mV per pH unit", "About 5.9 mV per pH unit", "About 590 mV per pH unit", "1 V per pH unit"],
                    why: "The Nernst limit is 2.303RT/F ≈ 59 mV per decade of H⁺ activity at 25 °C."
                },
                {
                    q: "Why measure at the gate bias where g<sub>m</sub> is highest?",
                    a: ["Small surface-potential shifts then cause the biggest current change", "It uses the least power", "The device is off there", "It avoids needing a reference"],
                    why: "Sensitivity in current terms is g<sub>m</sub> times the potential shift, so biasing at peak g<sub>m</sub> maximizes signal."
                }
            ]
        };

        function biofoulerBattle() {
            return {
                foeName: "The Biofouler",
                foeTag: "Sensor fouling · Lv 14",
                foeSize: 32,
                fieldClass: "adv-field-echem",
                drawFoe: (c, t) => drawBiofouler(c, 0, 0, 1, t),
                foeMax: 260,
                foePower: 0.95,
                meMax: 120,
                moves: [
                    { type: "cv", name: "CV Sweep", mult: 1.5, label: "Voltammetry", icon: "〰️", special: "dep", cls: "dep", effect: "It's effective! Sweeping the potential knocks loose some of the protein film." },
                    { type: "cell", name: "Acid Clean", mult: 1.75, label: "Cell & cleaning", icon: "🧪", special: "etch", cls: "etch", effect: "Direct hit! Cycling in dilute acid strips the adsorbed proteins off the carbon." },
                    { type: "eis", name: "Impedance Probe", mult: 0.5, focus: true, label: "Impedance", icon: "📈", special: "inspect", cls: "inspect", effect: "The Nyquist plot shows exactly where it's stuck. Your next hit does 1.5× damage!" },
                    { type: "fet", name: "Gate Sweep", mult: 1, label: "Transistors", icon: "🔌", special: "litho", cls: "litho", effect: "A clean gate sweep cuts through its drift." }
                ],
                questions: ECHEM_QUESTIONS,
                attacks: [
                    { name: "Protein Coat", text: "Sticky proteins smothered your electrode, and charge transfer slowed!" },
                    { name: "Drift Wave", text: "Your baseline drifted right off the screen!" },
                    { name: "Noise Burst", text: "60 Hz mains noise flooded your signal! Close the Faraday cage!" }
                ],
                intro: [
                    "Something oozes off the electrode… It's <strong>The Biofouler</strong>!",
                    "It coats sensors in proteins until they go blind. Answer electrochemistry questions to fight back!"
                ],
                runText: "You backed away. The Biofouler is still gumming up the test bench…",
                loseTitle: "The Biofouler got away",
                loseTip: "Tip: The Biofouler is weak to <strong>Acid Clean</strong> and <strong>CV Sweep</strong>. An <strong>Impedance Probe</strong> first makes your next hit 1.5× stronger.",
                winLines: [
                    "The Biofouler dissolved! Your electrode is spotless.",
                    "📜 Dr. Redox hands you the Echem Lab Certificate of Completion!"
                ],
                onWin: () => {
                    const e = es();
                    const first = !e.boss;
                    e.boss = true;
                    api.save().badges.echem = true;
                    api.writeSave();
                    api.updateHud();
                    if (first) {
                        api.gainXP(150);
                        api.awardSiteXP("echemboss", 150);
                    }
                    api.afterModal(() => api.say([
                        "You beat The Biofouler! That's the biggest enemy of every real sensor.",
                        "In real devices we fight fouling with antifouling coatings, membranes and electrochemical cleaning. Here's your Echem Lab Certificate of Completion!"
                    ], "Dr. Redox"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">SENSOR SAVED</p>
                            <h2>${first ? "📜 Certificate of Completion" : "🔋 Rematch Won"}</h2>${first ? api.certificate("echem") : ""}
                            ${first ? '<p class="adv-xp-big">+150 XP</p>' : ""}
                            <div class="adv-takeaway">
                                <p><strong>Biofouling</strong> is when proteins, cells and other gunk from a sample stick to a sensor. They block the electrode, raise the charge-transfer resistance and make readings drift.</p>
                                <p>Engineers fight it with antifouling coatings (like PEG or zwitterionic films), protective membranes, and electrochemical cleaning between measurements, then check the result with CV and EIS.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the Echem Lab</button>
                        </div>`;
                }
            };
        }


        /* ---------- Drawing: east district ---------- */

        function drawLemon(c, X, Y, W, H, t) {
            api.box(X + 6, Y + 24, 20, 7, "#aab2c3");
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.ellipse(X + 16, Y + 15, 13, 10, -0.2, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#ffe14d";
            c.beginPath();
            c.ellipse(X + 16, Y + 15, 12, 9, -0.2, 0, Math.PI * 2);
            c.fill();
            rect(c, X + 9, Y + 10, 4, 2, "#fff5a8");
            c.fillStyle = "#4caf50";
            c.beginPath();
            c.ellipse(X + 26, Y + 6, 4, 2, -0.6, 0, Math.PI * 2);
            c.fill();
            // copper and zinc electrodes, wired to a little LED
            rect(c, X + 10, Y + 1, 2, 9, "#d9824a");
            rect(c, X + 19, Y + 1, 2, 9, "#a9b2c3");
            c.strokeStyle = "#1a2033";
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(X + 11, Y + 1);
            c.quadraticCurveTo(X + 15, Y - 9, X + 20, Y + 1);
            c.stroke();
            const on = 0.5 + 0.5 * Math.sin(t / 400);
            c.fillStyle = `rgba(255, 90, 110, ${0.4 + on * 0.6})`;
            c.beginPath();
            c.arc(X + 15.5, Y - 5, 2, 0, Math.PI * 2);
            c.fill();
        }

        function drawVolta(c, X, Y) {
            api.box(X + 3, Y + 11, 10, 4, "#aab2c3");
            for (let i = 0; i < 7; i++) {
                const col = ["#d9824a", "#f3e3c3", "#a9b2c3"][i % 3];
                rect(c, X + 4, Y + 9 - i * 3, 8, 2, col);
            }
            rect(c, X + 3, Y - 14, 1, 24, "#5d6577");
            rect(c, X + 12, Y - 14, 1, 24, "#5d6577");
        }

        function drawIon(c, X, Y, t, color, sign) {
            const bob = Math.round(Math.sin(t / 280 + X) * 1);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx, cy, 6.5, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = color;
            c.beginPath();
            c.arc(cx, cy, 5.5, 0, Math.PI * 2);
            c.fill();
            rect(c, cx - 3, cy - 2, 2, 2, "#ffffff");
            rect(c, cx + 1, cy - 2, 2, 2, "#ffffff");
            rect(c, cx - 2, cy - 1, 1, 1, "#1a2033");
            rect(c, cx + 2, cy - 1, 1, 1, "#1a2033");
            // charge badge
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx + 6, cy - 6, 3.5, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#ffffff";
            c.font = "bold 7px sans-serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(sign, cx + 6, cy - 5.5);
        }

        function drawElectron(c, X, Y, t) {
            const cx = X + 8 + Math.sin(t / 200) * 1.5;
            const cy = Y + 7 + Math.cos(t / 260) * 1.5;
            c.fillStyle = "rgba(127, 178, 255, 0.35)";
            c.beginPath();
            c.arc(cx, cy, 7, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#7fb2ff";
            c.beginPath();
            c.arc(cx, cy, 4, 0, Math.PI * 2);
            c.fill();
            rect(c, cx - 2, cy - 1, 1, 1, "#1a2033");
            rect(c, cx + 1, cy - 1, 1, 1, "#1a2033");
            for (let i = 0; i < 3; i++) {
                const a = t / 300 + i * 2.1;
                rect(c, cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, 1.5, 1.5, "#e8f1ff");
            }
        }

        function echemTool(kind, label, x, y, w, h, use, draw) {
            return {
                kind: kind,
                x: x, y: y, w: w, h: h,
                label: label,
                draw: draw,
                prompt: "A: Use " + label,
                use: () => {
                    if (!device()) {
                        needDevice();
                        return;
                    }
                    use();
                }
            };
        }

        const DRAW = {
            probe(c, X, Y, W, H) {
                api.box(X + 2, Y + 6, W - 4, H - 7, "#c9cfdb");
                rect(c, X + 10, Y + 14, W - 20, 8, "#c98a3a");
                rect(c, X + 6, Y - 4, 3, 16, "#3b4458");
                rect(c, X + W - 9, Y - 4, 3, 16, "#3b4458");
                rect(c, X + W / 2 - 4, Y - 8, 8, 12, "#1a2033");
                rect(c, X + W - 18, Y + H - 9, 10, 5, "#2a3448");
                rect(c, X + W - 16, Y + H - 8, 6, 2, "#ff8a5c");
            },
            pstat(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 4, 26, H - 5, "#3b4458");
                rect(c, X + 5, Y + 7, 20, 10, "#0b1020");
                c.strokeStyle = "#54e0c7";
                c.lineWidth = 1;
                c.beginPath();
                for (let i = 0; i < 18; i++) {
                    const y = Y + 12 - Math.sin(i / 3 + t / 300) * 3;
                    if (i) {
                        c.lineTo(X + 6 + i, y);
                    } else {
                        c.moveTo(X + 6 + i, y);
                    }
                }
                c.stroke();
                // beaker with three electrodes
                rect(c, X + 36, Y + 10, 22, 20, "#d9e2f0");
                rect(c, X + 38, Y + 16, 18, 13, "#e8c34a");
                rect(c, X + 41, Y + 2, 2, 20, "#2b2f3a");
                rect(c, X + 46, Y + 2, 2, 20, "#c8ceda");
                rect(c, X + 51, Y + 2, 2, 20, "#9aa6bb");
            },
            fet(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 4, W - 4, H - 5, "#3b4458");
                rect(c, X + 6, Y + 8, W - 12, 12, "#0b1020");
                c.strokeStyle = "#ffd84a";
                c.lineWidth = 1;
                c.beginPath();
                c.moveTo(X + 7, Y + 18);
                c.lineTo(X + 18, Y + 18);
                c.lineTo(X + W - 8, Y + 9);
                c.stroke();
                rect(c, X + 8, Y + 24, 4, 3, "#5be38a");
                rect(c, X + 16, Y + 24, 4, 3, `rgba(255, 138, 92, ${0.5 + 0.5 * Math.sin(t / 300)})`);
            },
            shelf(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                ["#e8c34a", "#b9dcf5", "#ff8aa8", "#e3f6ff", "#c8f0c0"].forEach((col, i) => {
                    rect(c, X + 3 + i * 9, Y - 4, 6, 10, "#d9e2f0");
                    rect(c, X + 4 + i * 9, Y, 4, 5, col);
                });
            },
            cage(c, X, Y, W, H) {
                c.strokeStyle = "#8f98aa";
                c.lineWidth = 1;
                for (let i = 0; i <= W; i += 4) {
                    c.beginPath();
                    c.moveTo(X + i, Y - 6);
                    c.lineTo(X + i, Y + H);
                    c.stroke();
                }
                for (let j = -6; j <= H; j += 4) {
                    c.beginPath();
                    c.moveTo(X, Y + j);
                    c.lineTo(X + W, Y + j);
                    c.stroke();
                }
                rect(c, X + W / 2 - 6, Y + 10, 12, 8, "#d9e2f0");
            }
        };


        /* ---------- Scenes ---------- */

        api.SCENES.carboneast = {
            id: "carboneast",
            label: "Ion City · East Side",
            outdoor: true,
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T.f.......f......f.T",
                "T...BBBBBBBB.......T",
                "T...BBBBBBBB..ww...T",
                "T...BBBBBBBB.wwww..T",
                "T...BBBBDBBB..ww...T",
                "T.......p..........T",
                "pppppppppppp.......T",
                "T..........p.......T",
                "T..........p..f....T",
                "T....hhhhhhhhhh....T",
                "T....hhhhhhhhhh....T",
                "T....hhhhhhhhhh....T",
                "T.f..............f.T",
                "TTTTTTTTTTTTTTTTTTTT"
            ],
            drawTile: (c, x, y, ch, t) => {
                if (ch === "h") {
                    api.carbon.hexTile(c, x, y);
                } else {
                    api.drawWorldTile(x, y, ch, t);
                }
            },
            edges: {
                left: { scene: "carbon", x: 19, y: 7 }
            },
            signs: [],
            buildings: [
                {
                    id: "echemlab",
                    sign: "ECHEM LAB",
                    x: 4, y: 2, w: 8, h: 4,
                    door: { x: 8, y: 5 },
                    wall: "#d8f0ec",
                    roof: "#1f8a7a",
                    locked: () => false
                }
            ],
            npcs: [
                {
                    id: "elle",
                    name: "Elle the Electron",
                    x: 16, y: 8,
                    dir: "down",
                    draw: (c, X, Y, t) => drawElectron(c, X, Y, t),
                    talk: () => [
                        "Zip zip! I'm an electron!",
                        "In your carbon electrode I flow through the wires. At the surface I hop onto molecules in the solution. That hop is what a potentiostat measures as current!"
                    ]
                },
                {
                    id: "sodi",
                    name: "Sodi (Na⁺)",
                    x: 13, y: 11,
                    dir: "down",
                    draw: (c, X, Y, t) => drawIon(c, X, Y, t, "#b48cff", "+"),
                    talk: () => [
                        "I'm a sodium ion! I lost an electron, so I'm positively charged.",
                        "Electrons can't swim through water, so ions like me carry the current through the electrolyte instead."
                    ]
                },
                {
                    id: "chlori",
                    name: "Chlori (Cl⁻)",
                    x: 9, y: 12,
                    dir: "down",
                    draw: (c, X, Y, t) => drawIon(c, X, Y, t, "#5be38a", "−"),
                    talk: () => [
                        "Chloride ion here, with one extra electron!",
                        "I'm great for carrying current, but I'm rough on aluminum. I help corrode it. Gold and platinum just ignore me."
                    ]
                }
            ],
            objects: [
                {
                    kind: "lemon", x: 6, y: 11, w: 2, h: 2, draw: drawLemon, prompt: "A: Look",
                    lines: [
                        "The Lemon Battery sculpture! Copper and zinc stuck into a lemon light a tiny LED.",
                        "The zinc gives up electrons more easily than copper, and the lemon juice is the electrolyte that lets ions move between them."
                    ]
                },
                {
                    kind: "volta", x: 12, y: 11, w: 1, h: 1, draw: drawVolta, prompt: "A: Look",
                    lines: [
                        "A model of Volta's pile from 1800: stacked copper and zinc discs with brine-soaked cloth between them. It was the first battery."
                    ]
                },
                {
                    kind: "pond", x: 13, y: 3, w: 4, h: 3, prompt: "A: Look",
                    draw: () => {},
                    lines: [
                        "The Electrolyte Pond. The sign says: \"Salty water: conducts electricity because its dissolved ions can move. No swimming!\""
                    ]
                }
            ]
        };

        api.SCENES.echemlab = {
            id: "echemlab",
            label: "Echem Lab · Dr. Redox",
            grid: api.interiorRows(),
            floor: "#dbe7e4",
            exitTo: { scene: "carboneast", x: 8, y: 6 },
            objects: [
                echemTool("probe", "Probe station", 2, 2, 3, 2, openContinuity, DRAW.probe),
                echemTool("pstat", "Potentiostat", 8, 2, 4, 2, openCV, DRAW.pstat),
                echemTool("fet", "FET analyzer", 15, 2, 3, 2, openFET, DRAW.fet),
                {
                    kind: "shelf", x: 2, y: 8, w: 3, h: 1, label: "Electrolytes", draw: DRAW.shelf, prompt: "A: Look",
                    lines: [
                        "Bottles of ferricyanide in KCl, PBS, sulfuric acid, pH buffers and DI water.",
                        "Choosing the right electrolyte is half of electrochemistry."
                    ]
                },
                {
                    kind: "cage", x: 15, y: 8, w: 3, h: 2, label: "Faraday cage", draw: DRAW.cage, prompt: "A: Look",
                    lines: [
                        "A Faraday cage: a grounded metal mesh box that blocks electrical noise, like 60 Hz from the building's wiring, so tiny currents can be measured."
                    ]
                },
                {
                    kind: "biofouler", x: 9, y: 6, w: 2, h: 2,
                    active: () => allTested(device()) && !es().boss,
                    draw: (c, X, Y, W, H, t) => drawBiofouler(c, X, Y - 2, 1, t),
                    prompt: "A: Battle The Biofouler",
                    use: () => api.say(
                        ["A slimy blob is oozing off your test bench, coating everything in protein…", "Get ready to battle!"],
                        "",
                        () => api.openBattle(biofoulerBattle())
                    )
                }
            ],
            npcs: [
                {
                    id: "redox",
                    name: "Dr. Redox",
                    x: 11, y: 10,
                    dir: "down",
                    look: { suit: "#e9f6f3", accent: "#1f8a7a", visor: "#ffd84a" },
                    talk: redoxTalk
                }
            ]
        };

        function redoxTalk() {

            const dev = device();
            const name = api.currentChar() ? api.currentChar().name : "engineer";

            if (!dev) {
                return [
                    `Hello, ${name}! I'm Dr. Redox. Welcome to the Echem Lab.`,
                    "We test sensors here: wiring, electrochemistry and transistor response.",
                    "Bring me a finished device from Dr. Carbon's lab, released from the wafer, and we'll see how it performs!"
                ];
            }

            if (es().boss) {
                return [
                    "Our benches have never been cleaner, thanks to you!",
                    "Build another device any time and test it here. Better fabrication shows up right away in the CV and the pH sensitivity."
                ];
            }

            if (allTested(dev)) {
                return [
                    "Wait… do you see that? Something is growing on the test bench!",
                    "It's The Biofouler! It coats sensors in proteins. Go stop it before it spreads!"
                ];
            }

            const left = [];
            if (!dev.tested.cont) {
                left.push("the probe station for continuity");
            }
            if (!dev.tested.cv) {
                left.push("the potentiostat for cyclic voltammetry");
            }
            if (!dev.tested.fet) {
                left.push("the FET analyzer for transconductance and pH sensitivity");
            }

            return [
                `A ${"★".repeat(dev.stars)}${"☆".repeat(3 - dev.stars)} device from Dr. Carbon's lab. Let's see how it performs!`,
                `Still to test: ${left.join("; ")}.`,
                "Start with continuity. If the wiring is broken, nothing else will work."
            ];
        }
    });

})();
