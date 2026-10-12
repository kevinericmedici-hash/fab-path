/* ========================================
   SAND TO CHIP: LIVE ANIMATIONS, PART 2

   The crystal puller you steer by hand, the wire saw and polisher, the
   transistor being built step by step, the lithography image, the wafer
   probe, the package with its heat flow, and the sand-to-chip funnel.

   Needs window.ChipLab and chip-lab-anim.js (window.ChipAnim).
======================================== */

(function (root) {

    "use strict";

    const C = root.ChipLab;
    const A = root.ChipAnim;

    const U = A.util;
    const LW = U.LW;
    const hash = U.hash;
    const clamp = U.clamp;
    const lerp = U.lerp;
    const heat = U.heat;
    const ease = U.ease;
    const text = U.text;
    const rrect = U.rrect;
    const mix = U.mix;


    /* ------------------------------------------------
       4. CRYSTAL PULLER YOU STEER
       get(): { R, c }   onDone(result)
    ------------------------------------------------ */

    function crystal(canvas, get, onInfo, onDone) {

        let sim = fresh();

        function fresh() { return { running: false, len: 0, segs: [], lost: false, lostAt: -1, done: false, wob: 0, t: 0, reported: false }; }

        const lp = A.makeLoop(canvas, { ratio: 0.6, draw: draw });

        function params() {

            const g = get();
            const cr = g.R.cr;

            return { x: g.c.crystal.pull / cr.vcrit, v: g.c.crystal.pull, vmax: cr.vmax, vcrit: cr.vcrit, L: Math.max(20, cr.lengthCm / Math.max(cr.runs, 1)), d: g.c.crystal.size, usable: cr.usable };
        }

        function step(dt) {

            const p = params();

            sim.t += dt;

            const rate = p.L / 16 * p.x;                            // cm per second of animation
            const dL = Math.min(rate * dt, p.L - sim.len);
            const segLen = p.L / 220;

            const hazard = Math.pow(p.v / p.vmax, 4) / p.L;

            sim.wob += (Math.random() - 0.5) * dt * (p.x > 1.25 ? (p.x - 1.25) * 8 : 0.4);
            sim.wob *= 0.97;

            let left = dL;

            while (left > 0 && !sim.done) {

                const d = Math.min(left, segLen);

                left -= d;

                const was = sim.len;

                sim.len += d;

                if (!sim.lost && Math.random() < 1 - Math.exp(-hazard * d)) { sim.lost = true; sim.lostAt = sim.len; }

                const st = sim.lost ? "lost" : p.x > 1.08 ? "vacancy" : p.x < 0.92 ? "interstitial" : "perfect";

                if (Math.floor(sim.len / segLen) > Math.floor(was / segLen) || !sim.segs.length) { sim.segs.push({ x: p.x, st: st, w: sim.wob }); }
            }

            if (sim.len >= p.L - 1e-6 || (sim.lost && sim.len - sim.lostAt > p.L * 0.06)) {

                sim.running = false;
                sim.done = true;
            }
        }

        function tally() {

            const t = { perfect: 0, defect: 0, lost: 0 };

            sim.segs.forEach(function (s) { if (s.st === "perfect") { t.perfect += 1; } else if (s.st === "lost") { t.lost += 1; } else { t.defect += 1; } });

            const n = Math.max(sim.segs.length, 1);

            return { perfect: t.perfect / n, defect: t.defect / n, lost: t.lost / n, len: sim.len, lostAt: sim.lostAt };
        }

        function draw(ctx, t, dt, LH) {

            const p = params();

            if (sim.running) { step(dt); }

            if (sim.done && !sim.reported) { sim.reported = true; onDone(Object.assign(tally(), { lost: sim.lost })); }

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            const cx = 230;
            const wPx = 38 + p.d / 300 * 56;
            const pxPerCm = 220 / p.L;

            // The crucible, heater glow and the melt.
            const meltY = 292 + (sim.len / p.L) * 14;

            const gl = ctx.createRadialGradient(cx, 330, 10, cx, 330, 190);

            gl.addColorStop(0, "rgba(255,130,40,0.35)");
            gl.addColorStop(1, "rgba(255,130,40,0)");
            ctx.fillStyle = gl;
            ctx.fillRect(0, 200, 460, 160);

            ctx.beginPath();
            ctx.moveTo(cx - 100, 270);
            ctx.lineTo(cx + 100, 270);
            ctx.lineTo(cx + 78, 350);
            ctx.lineTo(cx - 78, 350);
            ctx.closePath();
            ctx.fillStyle = "#6f7488";
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(cx - 94, meltY);
            ctx.lineTo(cx + 94, meltY);
            ctx.lineTo(cx + 74, 346);
            ctx.lineTo(cx - 74, 346);
            ctx.closePath();
            ctx.fillStyle = heat(0.62);
            ctx.fill();

            // Ripples on the melt, spinning the other way from the crystal.
            ctx.strokeStyle = "rgba(255,240,200,0.5)";
            ctx.lineWidth = 1;

            for (let k = 0; k < 3; k++) {

                ctx.beginPath();
                ctx.ellipse(cx, meltY + 2, 20 + k * 22 + Math.sin(t * 2 + k) * 2, 4 + k * 1.5, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // The crystal: oldest part (near the seed) at the top, newest at the melt.
            const top = meltY - sim.len * pxPerCm - 4;

            ctx.strokeStyle = "#9aa3bb";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, Math.max(top - 14, 2));
            ctx.stroke();
            ctx.fillStyle = "#b8c0d0";
            ctx.fillRect(cx - 8, Math.max(top - 14, 2), 16, 10);

            const nSeg = sim.segs.length;

            for (let i = 0; i < nSeg; i++) {

                const sg = sim.segs[i];
                const y = top + (i / Math.max(nSeg, 1)) * (meltY - 4 - top);
                const hh = Math.max(1.5, (meltY - 4 - top) / Math.max(nSeg, 1) + 0.6);

                // Shoulder first, then the full diameter.
                const sh = clamp(i / Math.max(14, nSeg * 0.06), 0.05, 1);
                const w = wPx * sh * (1 + sg.w * 0.35);

                let col;

                if (sg.st === "perfect") { col = "#8fb6a6"; }
                else if (sg.st === "vacancy") { col = "#6f93c9"; }
                else if (sg.st === "interstitial") { col = "#c9a76f"; }
                else { col = "#6a6a74"; }

                ctx.fillStyle = col;
                ctx.fillRect(cx - w / 2, y, w, hh);
            }

            // Rotation stripes sliding across the ingot, and defect specks.
            if (nSeg > 2) {

                ctx.save();
                ctx.beginPath();
                ctx.rect(cx - wPx, top, wPx * 2, meltY - top);
                ctx.clip();

                ctx.fillStyle = "rgba(255,255,255,0.13)";

                for (let k = -4; k < 5; k++) { ctx.fillRect(cx + ((k * 11 + t * 22) % (wPx + 22)) - wPx / 2 - 11, top, 3, meltY - top); }

                for (let i = 0; i < nSeg; i += 3) {

                    const sg = sim.segs[i];

                    if (sg.st === "perfect") { continue; }

                    const y = top + (i / nSeg) * (meltY - 4 - top);

                    ctx.fillStyle = sg.st === "vacancy" ? "rgba(20,40,90,0.7)" : sg.st === "interstitial" ? "rgba(110,70,10,0.7)" : "rgba(30,30,36,0.6)";
                    ctx.fillRect(cx - wPx * 0.4 + hash(i) * wPx * 0.8, y, 2.4, 2.4);
                }

                ctx.restore();
            }

            if (sim.lost) {

                const yl = top + (sim.lostAt / Math.max(sim.len, 0.01)) * (meltY - 4 - top);

                ctx.strokeStyle = "#ff6464";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.moveTo(cx - wPx, yl);
                ctx.lineTo(cx + wPx, yl);
                ctx.stroke();
                ctx.setLineDash([]);
                text(ctx, "lost the single crystal here", cx + wPx + 6, yl + 4, "#ff9a9a", 11);
            }

            // Strip chart of v / vcrit along the crystal, with the defect-free window shaded.
            const gx0 = 420;
            const gx1 = 590;
            const toX = function (x) { return lerp(gx0, gx1, clamp((x - 0.4) / 1.4, 0, 1)); };

            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fillRect(gx0, 20, gx1 - gx0, 290);

            ctx.fillStyle = "rgba(62,207,142,0.25)";
            ctx.fillRect(toX(0.92), 20, toX(1.08) - toX(0.92), 290);

            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 1;
            ctx.strokeRect(gx0, 20, gx1 - gx0, 290);

            text(ctx, "pull speed ÷ critical", (gx0 + gx1) / 2, 14, "#cbd2e3", 10, "center");
            text(ctx, "too slow", gx0 + 4, 322, "#c9a76f", 9);
            text(ctx, "too fast", gx1 - 4, 322, "#6f93c9", 9, "right");

            if (nSeg > 1) {

                ctx.strokeStyle = "#54e0c7";
                ctx.lineWidth = 1.6;
                ctx.beginPath();

                for (let i = 0; i < nSeg; i++) {

                    const y = lerp(20, 20 + 290 * (sim.len / p.L), i / Math.max(nSeg - 1, 1));

                    if (i === 0) { ctx.moveTo(toX(sim.segs[i].x), y); } else { ctx.lineTo(toX(sim.segs[i].x), y); }
                }

                ctx.stroke();
            }

            // The live marker of where the slider is right now.
            ctx.strokeStyle = "#e0a070";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(toX(p.x), 20);
            ctx.lineTo(toX(p.x), 310);
            ctx.stroke();

            // Heads-up readout.
            const state = p.x > 1.08 ? "vacancy voids" : p.x < 0.92 ? "interstitial loops" : "defect-free";

            text(ctx, "v ÷ vcrit = " + p.x.toFixed(2), 10, 22, p.x > 1.08 ? "#8fb2ff" : p.x < 0.92 ? "#e0c080" : "#7be0b0", 13);
            text(ctx, state, 10, 40, "#cbd2e3", 11);
            text(ctx, "length " + sim.len.toFixed(1) + " cm of " + p.L.toFixed(0), 10, 58, "#cbd2e3", 11);

            if (p.v > p.vmax * 0.85 && sim.running) { text(ctx, "risk of losing the crystal!", 10, 76, "#ff9a9a", 11); }

            if (!sim.running && !sim.done && !nSeg) { text(ctx, "press “Start pulling”, then drag the pull speed slider", cx, 150, "#9fb2c8", 12, "center"); }

            if (sim.done) { text(ctx, sim.lost ? "Crystal lost: cut it off and re-melt" : "Crystal complete", cx, 18, sim.lost ? "#ff9a9a" : "#7be0b0", 13, "center"); }
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);

            if (m.x > 420) { onInfo("The green band is the defect-free window. Keep the pull speed inside it while the crystal grows."); }
            else if (m.y > 270) { onInfo("The quartz crucible holds the melt at 1,420 °C. As the crystal grows, the melt level drops."); }
            else if (m.x > 150 && m.x < 320) { onInfo("The growing single crystal turns slowly as it rises. Blue means vacancy voids, amber means interstitial loops, grey means the crystal was lost."); }
            else { onInfo("Hover over the puller to see what each part does."); }
        });

        return {
            start: function () { if (sim.done) { sim = fresh(); } sim.running = true; lp.wake(20); },
            reset: function () { sim = fresh(); lp.wake(2); },
            stop: lp.stop,
            running: function () { return sim.running; },
            result: tally
        };
    }


    /* ------------------------------------------------
       5. WIRE SAW AND POLISHER
    ------------------------------------------------ */

    function wafering(canvas, get, onInfo) {

        const dust = [];
        const lp = A.makeLoop(canvas, { ratio: 0.55, draw: draw });

        function draw(ctx, t, dt, LH) {

            const g = get();
            const R = g.R;
            const w = R.wf;
            const tool = g.c.fab.tool;
            const dof = R.chip.dof;

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            const T = 14;
            const ph = t % T;

            // Units of the ingot: wafer + ground-away layer + kerf, in their true proportions.
            const NV = 14;
            const x0 = 24;
            const x1 = 330;
            const cell = (x1 - x0) / NV;
            const pitch = w.pitch;
            const wT = cell * w.t / pitch;
            const wG = cell * (w.polish + 40) / pitch;
            const wK = cell * w.wire.kerf / pitch;
            const cy = 100;
            const rad = 46;

            const sawP = clamp(ph / 4.5, 0, 1);
            const spread = ease((ph - 4.5) / 1.5) * 7;
            const wireY = lerp(cy + rad + 6, cy - rad - 6, ease(sawP));

            text(ctx, "1  Saw the ingot", x0, 20, "#cbd2e3", 12);

            for (let i = 0; i < NV; i++) {

                const bx = x0 + i * cell + (i - NV / 2) * spread * 0.5;

                ctx.fillStyle = "#8fb6a6";
                ctx.fillRect(bx, cy - rad, wT, rad * 2);

                // The material that will be ground away is drawn as a paler band.
                ctx.fillStyle = "#b9d6c8";
                ctx.fillRect(bx + wT, cy - rad, wG, rad * 2);

                // The kerf: dark where the wire has already passed.
                ctx.fillStyle = "#0d1020";

                const ky = clamp(wireY, cy - rad, cy + rad);

                ctx.fillRect(bx + wT + wG, ky, wK, cy + rad - ky);
                ctx.fillStyle = "#8fb6a6";
                ctx.fillRect(bx + wT + wG, cy - rad, wK, Math.max(0, ky - (cy - rad)));
            }

            ctx.strokeStyle = "#e9edf7";
            ctx.lineWidth = 1.4;
            ctx.strokeRect(x0, cy - rad, x1 - x0 + (NV - 1) * 0, rad * 2);

            // The wire web: a row of wire cross-sections moving up through the ingot.
            if (ph < 6) {

                const wr = clamp(w.wire.wire / 160 * 2.4, 1.6, 4);

                for (let i = 0; i < NV; i++) {

                    const bx = x0 + i * cell + wT + wG + wK / 2 + (i - NV / 2) * spread * 0.5;

                    ctx.fillStyle = "#e8c06a";
                    ctx.beginPath();
                    ctx.arc(bx, wireY, wr, 0, Math.PI * 2);
                    ctx.fill();

                    if (sawP > 0 && sawP < 1 && Math.random() < 0.3) { dust.push({ x: bx + (Math.random() - 0.5) * 2, y: ky(wireY, cy, rad) + rad * 0.2, v: 20 + Math.random() * 30, life: 1 }); }
                }
            }

            for (let i = dust.length - 1; i >= 0; i--) {

                const d = dust[i];

                d.y += d.v * dt;
                d.life -= dt;

                ctx.fillStyle = "rgba(190,150,100," + Math.max(0, d.life) + ")";
                ctx.fillRect(d.x, d.y, 1.6, 1.6);

                if (d.life <= 0) { dust.splice(i, 1); }
            }

            // The stack of finished wafers dropping into the cassette.
            const nShow = clamp(Math.round(w.wafers / 60), 3, 18);
            const stackX = 150;
            const stackY = 218;

            text(ctx, "wafers: " + (w.wafers >= 1000 ? Math.round(w.wafers).toLocaleString("en-US") : w.wafers), x0, 200, "#cbd2e3", 12);

            for (let k = 0; k < nShow; k++) {

                const drop = ease((ph - 6 - k * 0.06) / 0.6);
                const y = lerp(120, stackY + (nShow - k) * 3, clamp(drop, 0, 1));

                if (ph > 4.6) {

                    ctx.fillStyle = k % 2 ? "#a7c8bb" : "#8fb6a6";
                    ctx.beginPath();
                    ctx.ellipse(stackX + 80, y + 12, 44, 7, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.4)";
                    ctx.stroke();
                }
            }

            text(ctx, "sawdust: " + Math.round(w.kerfLoss * 100) + "% of the crystal", x0, 258, "#e0a070", 11);
            text(ctx, "broken: " + (w.brk * 100).toFixed(1) + "%", x0, 274, "#e0a070", 11);

            // The polisher, right side: a spinning pad over one wafer, and a side view of its surface.
            text(ctx, "2  Polish one wafer", 372, 20, "#cbd2e3", 12);

            const pg = clamp((ph - 6.5) / 6, 0, 1);
            const pe = ease(pg);
            const wcx = 468;
            const wcy = 100;

            ctx.fillStyle = "#8fb6a6";
            ctx.beginPath();
            ctx.arc(wcx, wcy, 52, 0, Math.PI * 2);
            ctx.fill();

            // Spinning pad with a spiral of grooves.
            if (pg > 0 && pg < 1) {

                ctx.save();
                ctx.translate(wcx + 10, wcy);
                ctx.rotate(t * 5);
                ctx.strokeStyle = "rgba(60,70,100,0.8)";
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.arc(0, 0, 36, 0, Math.PI * 2);
                ctx.stroke();

                for (let k = 0; k < 6; k++) {

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(k * 1.05) * 36, Math.sin(k * 1.05) * 36);
                    ctx.stroke();
                }

                ctx.restore();
            }

            // Side view: thickness shrinks to the final value and the surface smooths out to the achieved flatness.
            const sx0 = 380;
            const sx1 = 560;
            const baseY = 232;
            const total = w.t + w.polish + 40;
            const thick = lerp(total, w.t, pe) / total * 46;
            const amp = lerp(w.flat * 3, w.flat, pe) * 0.05;

            ctx.fillStyle = "#8fb6a6";
            ctx.beginPath();
            ctx.moveTo(sx0, baseY);

            for (let x = sx0; x <= sx1; x += 3) { ctx.lineTo(x, baseY - thick - Math.sin(x * 0.09 + 1) * amp * 0.5 - Math.sin(x * 0.23) * amp * 0.5); }

            ctx.lineTo(sx1, baseY);
            ctx.closePath();
            ctx.fill();

            // The scanner's depth of focus: the surface has to stay inside this band.
            const band = dof * 0.05;
            const ok = w.flat <= dof;

            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = ok ? "rgba(62,207,142,0.9)" : "rgba(255,100,100,0.9)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(sx0, baseY - thick - band / 2);
            ctx.lineTo(sx1, baseY - thick - band / 2);
            ctx.moveTo(sx0, baseY - thick + band / 2);
            ctx.lineTo(sx1, baseY - thick + band / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            text(ctx, "thickness " + Math.round(lerp(total, w.t, pe)) + " µm", sx0, baseY + 14, "#cbd2e3", 11);
            text(ctx, "surface bumps ±" + Math.round(lerp(w.flat * 3, w.flat, pe) / 2) + " nm", sx0, baseY + 29, "#cbd2e3", 11);
            text(ctx, "scanner focus band " + dof + " nm: " + (ok ? "fits" : "too bumpy"), sx0, baseY + 46, ok ? "#7be0b0" : "#ff9a9a", 11);
            void tool;
        }

        function ky(wireY, cy, rad) { return clamp(wireY, cy - rad, cy + rad); }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);
            const w = get().R.wf;

            if (m.x < 340 && m.y < 160) { onInfo("Each wafer needs " + Math.round(w.pitch) + " µm of crystal: " + w.t + " µm of wafer, about " + (w.polish + 40) + " µm that is ground away, and a " + w.wire.kerf + " µm slot that becomes dust."); }
            else if (m.x > 370) { onInfo("Polishing makes the surface flat enough for the scanner to focus. The dashed band is the scanner's depth of focus: the bumps must stay inside it."); }
            else { onInfo("Hover to see where the crystal goes."); }
        });

        return { stop: lp.stop };
    }


    /* ------------------------------------------------
       6a. TRANSISTOR CROSS-SECTION, BUILT STEP BY STEP
    ------------------------------------------------ */

    const STEPS = [
        "Start with a polished silicon wafer.",
        "Grow the gate oxide: oxygen at high temperature turns the surface into a thin glass.",
        "Deposit a layer of polysilicon, the gate material, over everything.",
        "Print and etch the gate: resist is exposed through a mask, then everything but the gate is etched away.",
        "Implant the source and drain: dopant ions are fired in. The gate stops them, so the channel lines up automatically.",
        "Anneal: heat repairs the damage and activates the dopant, which also spreads it deeper.",
        "Add contacts and layers of metal wiring, insulated from each other."
    ];

    function transistor(canvas, get, onInfo, onStep) {

        let step = 0;
        let sp = 0;
        let playing = false;
        let hold = 0;
        const ions = [];

        const lp = A.makeLoop(canvas, { ratio: 0.66, draw: draw });

        function set(k) {

            step = clamp(k, 0, STEPS.length - 1);
            sp = 0;
            hold = 0;
            ions.length = 0;
            onStep(step, STEPS[step]);
            lp.wake(8);
        }

        function draw(ctx, t, dt, LH) {

            const g = get();
            const f = g.R.fab;
            const o = g.c.fab;
            const node = f.node;

            sp = Math.min(1, sp + dt / 2.6);

            if (playing && sp >= 1) { hold += dt; if (hold > 0.8) { if (step < STEPS.length - 1) { set(step + 1); } else { playing = false; onStep(step, STEPS[step], true); } } }

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            const y0 = 258;                                                    // wafer surface
            const gw = 130;                                                    // gate length in pixels
            const s = gw / node.lg;                                           // pixels per nanometre
            const cx = 300;
            const gx0 = cx - gw / 2;
            const gx1 = cx + gw / 2;

            // Silicon with a faint lattice.
            ctx.fillStyle = "#6c7590";
            ctx.fillRect(0, y0, LW, LH - y0);
            ctx.fillStyle = "rgba(255,255,255,0.09)";

            for (let x = 8; x < LW; x += 16) { for (let y = y0 + 8; y < LH; y += 16) { ctx.fillRect(x, y, 2, 2); } }

            const eotPx = clamp(f.tPhys * s, 2.5, 16);
            const polyH = 54;

            // Step 1: oxide, growing from nothing, with oxygen molecules above it.
            const oxP = step === 1 ? ease(sp) : step > 1 ? 1 : 0;

            if (oxP > 0) {

                ctx.fillStyle = "#cfe3f5";
                ctx.fillRect(0, y0 - eotPx * oxP, LW, eotPx * oxP);

                if (step === 1 && sp < 1) {

                    ctx.fillStyle = "rgba(120,200,255,0.8)";

                    for (let k = 0; k < 18; k++) {

                        const x = (k * 37 + t * 30) % LW;
                        const y = y0 - 14 - ((t * 24 + k * 19) % 60);

                        ctx.beginPath();
                        ctx.arc(x, y, 2, 0, Math.PI * 2);
                        ctx.arc(x + 4, y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    const hg = ctx.createLinearGradient(0, y0 - 80, 0, y0);

                    hg.addColorStop(0, "rgba(255,150,60,0)");
                    hg.addColorStop(1, "rgba(255,150,60," + (0.18 + 0.1 * Math.sin(t * 4)) + ")");
                    ctx.fillStyle = hg;
                    ctx.fillRect(0, y0 - 80, LW, 80);
                    text(ctx, Math.round(o.oxT) + " °C", 14, y0 - 62, "#ffb070", 12);
                }
            }

            const top = y0 - eotPx * oxP;

            // Step 2 and 3: the polysilicon layer, then the etched gate.
            const polyP = step === 2 ? ease(sp) : step > 2 ? 1 : 0;

            if (polyP > 0) {

                const full = step === 2 || (step === 3 && sp < 0.65);

                ctx.fillStyle = "#b0867a";

                if (full) { ctx.fillRect(0, top - polyH * polyP, LW, polyH * polyP); }
                else { ctx.fillRect(gx0, top - polyH, gw, polyH); }

                // Parts being etched away fade out during step 3.
                if (step === 3 && sp >= 0.65) {

                    const fade = 1 - clamp((sp - 0.65) / 0.3, 0, 1);

                    ctx.globalAlpha = fade;
                    ctx.fillRect(0, top - polyH, gx0, polyH);
                    ctx.fillRect(gx1, top - polyH, LW - gx1, polyH);
                    ctx.globalAlpha = 1;
                }
            }

            // Step 3: the exposure. Resist, mask and light.
            if (step === 3 && sp < 0.9) {

                const toolInfo = C.TOOLS[o.tool] || C.TOOLS.arf;
                const uvCol = toolInfo.lambda < 20 ? "rgba(255,120,200," : toolInfo.lambda < 250 ? "rgba(150,110,255," : "rgba(120,90,230,";

                if (sp < 0.65) {

                    ctx.fillStyle = "rgba(190,90,210,0.8)";
                    ctx.fillRect(gx0 - 20, top - polyH - 12, gw + 40, 12);
                }

                // The mask above with one clear opening over the gate.
                const my = 56;

                ctx.fillStyle = "#2b2f3d";
                ctx.fillRect(0, my, gx0 - 20, 8);
                ctx.fillRect(gx1 + 20, my, LW - gx1 - 20, 8);

                ctx.setLineDash([6, 5]);
                ctx.lineDashOffset = -t * 40;
                ctx.strokeStyle = uvCol + "0.85)";
                ctx.lineWidth = 2;

                for (let k = 0; k < 6; k++) {

                    const x = gx0 - 14 + (gw + 28) * k / 5;

                    ctx.beginPath();
                    ctx.moveTo(x, my + 8);
                    ctx.lineTo(lerp(cx, x, 0.9), top - polyH - 12);
                    ctx.stroke();
                }

                ctx.setLineDash([]);
                ctx.lineDashOffset = 0;

                text(ctx, "mask", 12, my + 6, "#aab3c7", 11);
                text(ctx, "UV light (" + toolInfo.lambda + " nm)", cx, 40, "#c8b8ff", 12, "center");
            }

            // Step 4: the implant. Ions rain down, stopped by the gate, or reaching depth Rp in the silicon.
            if (step >= 4) {

                const rpPx = clamp(f.rp * s, 3, 90);
                const sig = clamp(f.drp * s, 2, 40);

                if (step === 4) {

                    const nNew = Math.round(40 * dt * clamp(Math.log10(o.implDose / 1e14 + 1) + 0.6, 0.4, 2.2));

                    for (let k = 0; k < nNew; k++) { ions.push({ x: Math.random() * LW, y: 40 + Math.random() * 20, vy: 220 + o.implE * 3, stop: 0 }); }
                }

                for (let i = ions.length - 1; i >= 0; i--) {

                    const p = ions[i];

                    if (!p.stop) {

                        p.y += p.vy * dt;

                        const inGate = p.x > gx0 && p.x < gx1;
                        const hitY = inGate ? top - polyH + 8 + Math.random() * 14 : y0 + rpPx + (Math.random() - 0.5) * sig * 2;

                        if (p.y >= (inGate ? top - polyH : y0)) { p.y = hitY; p.stop = 1; p.inGate = inGate; }
                    }

                    if (step > 4) { continue; }

                    ctx.fillStyle = p.stop ? (p.inGate ? "rgba(255,200,120,0.5)" : "#ffb347") : "rgba(255,220,150,0.9)";
                    ctx.fillRect(p.x, p.y, 2.4, 2.4);
                }

                // The dopant cloud after the anneal: from the surface down to the junction, spreading a little under the gate.
                if (step >= 5) {

                    const an = step === 5 ? ease(sp) : 1;
                    const xjPx = clamp(f.xj * s, 4, 120) * lerp(0.35, 1, an);
                    const lat = xjPx * 0.7;

                    [[0, gx0 + lat * an * 0.6], [gx1 - lat * an * 0.6, LW]].forEach(function (reg) {

                        const gr = ctx.createLinearGradient(0, y0, 0, y0 + xjPx);

                        gr.addColorStop(0, "rgba(255,160,60,0.95)");
                        gr.addColorStop(1, "rgba(255,160,60,0.15)");
                        ctx.fillStyle = gr;
                        ctx.fillRect(reg[0], y0, reg[1] - reg[0], xjPx);
                    });

                    ctx.setLineDash([4, 3]);
                    ctx.strokeStyle = "rgba(255,230,180,0.9)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(30, y0 + xjPx);
                    ctx.lineTo(gx0 - 6, y0 + xjPx);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    text(ctx, "junction depth " + Math.round(f.xj) + " nm", 30, y0 + xjPx + 15, "#ffe0b0", 11);

                    if (step === 5 && sp < 1) {

                        ctx.fillStyle = "rgba(255,140,50," + (0.12 + 0.08 * Math.sin(t * 6)) + ")";
                        ctx.fillRect(0, y0 - 40, LW, 100);
                        text(ctx, Math.round(o.annT) + " °C for " + (o.annSec < 10 ? o.annSec.toFixed(1) : Math.round(o.annSec)) + " s", LW - 14, y0 - 24, "#ffb070", 12, "right");
                    }

                    // Remaining implant dots drift into the cloud.
                    if (step === 5) { for (let i = 0; i < ions.length; i++) { ions[i].y += (y0 + xjPx * 0.5 - ions[i].y) * dt * 0.8 * (ions[i].inGate ? 0 : 1); } }
                }
            }

            // Step 6: contacts and the stack of wiring layers.
            if (step === 6) {

                const wp = ease(sp);
                const nM = clamp(o.metals, 2, 8);
                const metalCol = o.metal === "cu" ? "#d98a4a" : "#b7bcc9";
                const ildCol = o.ild === "air" ? "#3a4a66" : o.ild === "sicoh" ? "#51608a" : o.ild === "fsg" ? "#5d6f9a" : "#6b7ea8";

                // Insulating layer around the gate, and tungsten plugs to the source, drain and gate.
                ctx.fillStyle = ildCol;
                ctx.fillRect(0, top - polyH - 30 * wp, LW, 30 * wp + polyH - 0 + 0);
                ctx.fillStyle = "#b0867a";
                ctx.fillRect(gx0, top - polyH, gw, polyH);

                ctx.fillStyle = "#9aa3b5";

                [[gx0 - 58, 16], [cx - 6, 12], [gx1 + 42, 16]].forEach(function (pl) { ctx.fillRect(pl[0], top - polyH - 30 * wp, pl[1], 30 * wp + polyH * 0.9); });

                let y = top - polyH - 30;

                for (let k = 0; k < nM; k++) {

                    const lp2 = clamp(wp * (nM + 1) - k, 0, 1);

                    if (lp2 <= 0) { break; }

                    const hh = 12;

                    y -= hh + 4;

                    ctx.fillStyle = ildCol;
                    ctx.globalAlpha = lp2;
                    ctx.fillRect(0, y - 2, LW, hh + 4);
                    ctx.fillStyle = metalCol;

                    const wiresN = 9;

                    for (let w2 = 0; w2 < wiresN; w2++) {

                        const wx = 24 + w2 * 66 + (k % 2) * 30;
                        const ww = 28 + hash(k * 9 + w2) * 22;

                        ctx.fillRect(wx, y, ww, hh - 2);
                    }

                    ctx.globalAlpha = 1;

                    if (y < 6) { break; }
                }

                text(ctx, nM + " layer" + (nM > 1 ? "s" : "") + " of " + (o.metal === "cu" ? "copper" : "aluminium") + " wiring", LW - 12, 18, "#e0c0a0", 12, "right");
            }

            // Labels with the true numbers.
            if (step >= 1) { text(ctx, "gate oxide " + f.eot.toFixed(1) + " nm" + (o.dielectric === "hfo2" ? " (equivalent)" : ""), 14, 18, "#cfe3f5", 11); }
            if (step >= 3) { text(ctx, "gate length " + node.lg + " nm", 14, 34, "#e0c0b0", 11); }

            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = 1;

            if (step >= 3) {

                ctx.beginPath();
                ctx.moveTo(gx0, y0 + 18);
                ctx.lineTo(gx1, y0 + 18);
                ctx.moveTo(gx0, y0 + 13);
                ctx.lineTo(gx0, y0 + 23);
                ctx.moveTo(gx1, y0 + 13);
                ctx.lineTo(gx1, y0 + 23);
                ctx.stroke();
                text(ctx, "channel", cx, y0 + 36, "#d8dff2", 11, "center");
            }

            text(ctx, "silicon wafer", LW - 12, LH - 8, "#c8d0e6", 11, "right");

            if (step >= 4) { text(ctx, "source", 70, y0 + 14, "#3a2410", 11); text(ctx, "drain", LW - 70, y0 + 14, "#3a2410", 11, "right"); }
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);

            if (m.y > 258) { onInfo("The silicon wafer. The source and drain are the dopant-rich regions on each side of the gate."); }
            else if (m.y > 200) { onInfo("The gate. A voltage on it creates a channel in the silicon below, switching current between source and drain."); }
            else { onInfo("Step through the process with the buttons. The sizes are drawn to scale for this node."); }
        });

        set(0);

        return {
            goto: set,
            next: function () { set(step + 1); },
            prev: function () { set(step - 1); },
            play: function () { playing = true; if (step >= STEPS.length - 1) { set(0); } lp.wake(40); onStep(step, STEPS[step]); },
            pause: function () { playing = false; },
            step: function () { return step; },
            playing: function () { return playing; },
            stop: lp.stop
        };
    }


    /* ------------------------------------------------
       6b. LITHOGRAPHY: THE LIGHT PATTERN
    ------------------------------------------------ */

    function erf(x) {

        const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
        const sg = x < 0 ? -1 : 1;
        const z = Math.abs(x);
        const tt = 1 / (1 + 0.3275911 * z);

        return sg * (1 - (((((a[4] * tt + a[3]) * tt) + a[2]) * tt + a[1]) * tt + a[0]) * tt * Math.exp(-z * z));
    }

    function phi(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }

    function litho(canvas, get, onInfo) {

        const lp = A.makeLoop(canvas, { ratio: 0.55, draw: draw });

        function draw(ctx, t, dt, LH) {

            const g = get();
            const o = g.c.fab;
            const node = C.NODES[o.node];
            const tool = C.TOOLS[o.tool] || C.TOOLS.arf;

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            const lam = tool.lambda;
            const rayCol = lam < 20 ? [255, 120, 200] : lam < 250 ? [150, 120, 255] : [120, 130, 255];

            // The half-pitch in pixels: it keeps the pattern four periods wide, so each node looks the same size on screen.
            const px = 28;                                                    // pixels per half-pitch
            const nmPerPx = node.nm / px;
            const sigma = 0.35 * tool.res / nmPerPx;                         // blur of the image in pixels
            const x0 = 165;
            const nPer = 5;

            // The mask openings: every second half-pitch is clear.
            const open = [];

            for (let k = 0; k < nPer; k++) { open.push([x0 + k * 2 * px, x0 + k * 2 * px + px]); }

            const xEnd = x0 + nPer * 2 * px;

            // Optics, drawn schematically: lamp, mask, lens, resist.
            const lampY = 14;
            const maskY = 52;
            const lensY = 94;
            const waferY = 136;

            ctx.fillStyle = "rgba(" + rayCol.join(",") + "," + (0.55 + 0.25 * Math.sin(t * 5)) + ")";
            rrect(ctx, x0, lampY, xEnd - x0, 8, 4);
            ctx.fill();
            text(ctx, tool.lambda + " nm light", x0 - 8, lampY + 8, "#cbd2e3", 11, "right");

            ctx.fillStyle = "#2b2f3d";
            ctx.fillRect(x0 - 20, maskY, xEnd - x0 + 40, 8);

            ctx.fillStyle = "#1c2132";

            open.forEach(function (op) { ctx.fillRect(op[0], maskY - 1, op[1] - op[0], 10); });

            text(ctx, "mask", x0 - 24, maskY + 8, "#aab3c7", 11, "right");

            // The lens: a flat trapezoid. Immersion adds a drop of water; EUV uses a mirror instead.
            if (lam < 20) {

                ctx.fillStyle = "#7d879f";
                ctx.beginPath();
                ctx.moveTo(x0 - 10, lensY + 12);
                ctx.lineTo(xEnd + 10, lensY - 8);
                ctx.lineTo(xEnd + 10, lensY + 2);
                ctx.lineTo(x0 - 10, lensY + 22);
                ctx.closePath();
                ctx.fill();
                text(ctx, "mirror", x0 - 14, lensY + 18, "#aab3c7", 11, "right");

            } else {

                ctx.fillStyle = "rgba(190,215,255,0.35)";
                ctx.beginPath();
                ctx.moveTo(x0 + 40, lensY - 8);
                ctx.lineTo(xEnd - 40, lensY - 8);
                ctx.lineTo(xEnd + 10, lensY + 14);
                ctx.lineTo(x0 - 10, lensY + 14);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "rgba(190,215,255,0.8)";
                ctx.stroke();
                text(ctx, "lens", x0 - 14, lensY + 10, "#aab3c7", 11, "right");

                if (tool.nodes[0] <= 90 && o.tool.indexOf("arfi") === 0 || o.tool === "arfdp") {

                    ctx.fillStyle = "rgba(90,170,255,0.45)";
                    ctx.fillRect(x0 - 10, lensY + 14, xEnd - x0 + 20, waferY - lensY - 14);
                    text(ctx, "water", xEnd + 18, lensY + 30, "#8fc4ff", 11);
                }
            }

            // Rays focus from the mask openings down to the wafer.
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -t * 40;
            ctx.strokeStyle = "rgba(" + rayCol.join(",") + ",0.85)";
            ctx.lineWidth = 1.6;

            open.forEach(function (op) {

                const mx = (op[0] + op[1]) / 2;

                ctx.beginPath();
                ctx.moveTo(mx, maskY + 8);
                ctx.lineTo(mx, waferY);
                ctx.stroke();
            });

            ctx.setLineDash([]);
            ctx.lineDashOffset = 0;

            // The wafer with resist.
            ctx.fillStyle = "#6c7590";
            ctx.fillRect(x0 - 20, waferY + 8, xEnd - x0 + 40, 14);
            ctx.fillStyle = "rgba(190,90,210,0.8)";
            ctx.fillRect(x0 - 20, waferY, xEnd - x0 + 40, 8);

            // The image of the mask on the wafer: the clear openings, blurred by the lens.
            const base = 215;
            const hgt = 56;

            const inten = function (x) {

                let s = 0;

                open.forEach(function (op) { s += phi((x - op[0]) / sigma) - phi((x - op[1]) / sigma); });

                return clamp(s, 0, 1);
            };

            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x0 - 20, base - hgt - 6, xEnd - x0 + 40, hgt + 12);

            // Contrast across the middle periods.
            let imax = 0;
            let imin = 1;

            for (let x = x0 + 2 * px; x < xEnd - 2 * px; x += 1) { const v = inten(x); imax = Math.max(imax, v); imin = Math.min(imin, v); }

            const contrast = (imax - imin) / Math.max(imax + imin, 1e-6);

            ctx.fillStyle = "rgba(" + rayCol.join(",") + ",0.22)";
            ctx.beginPath();
            ctx.moveTo(x0 - 20, base);

            for (let x = x0 - 20; x <= xEnd + 20; x += 1) { ctx.lineTo(x, base - inten(x) * hgt); }

            ctx.lineTo(xEnd + 20, base);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "rgb(" + rayCol.join(",") + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = x0 - 20; x <= xEnd + 20; x += 1) { const y = base - inten(x) * hgt; if (x === x0 - 20) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }

            ctx.stroke();

            // The threshold at which the resist reacts.
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = "rgba(255,255,255,0.7)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0 - 20, base - 0.5 * hgt);
            ctx.lineTo(xEnd + 20, base - 0.5 * hgt);
            ctx.stroke();
            ctx.setLineDash([]);

            text(ctx, "light on the wafer", x0 - 24, base - hgt / 2 + 4, "#cbd2e3", 11, "right");
            text(ctx, "resist threshold", xEnd + 26, base - hgt / 2 + 4, "#cbd2e3", 11);

            // What prints: resist is removed where the light is above the threshold.
            const ry = 248;

            ctx.fillStyle = "rgba(190,90,210,0.8)";
            ctx.fillRect(x0 - 20, ry, xEnd - x0 + 40, 12);

            if (contrast > 0.12) {

                ctx.fillStyle = "#1c2132";

                let runStart = null;

                for (let x = x0 - 20; x <= xEnd + 20; x += 1) {

                    const on = inten(x) > 0.5;

                    if (on && runStart === null) { runStart = x; }
                    if ((!on || x === xEnd + 20) && runStart !== null) { ctx.fillRect(runStart, ry, x - runStart, 12); runStart = null; }
                }
            }

            const verdict = contrast > 0.5 ? "prints cleanly" : contrast > 0.25 ? "prints, but blurry and risky" : "the lines merge: this tool can't print this node";
            const col = contrast > 0.5 ? "#7be0b0" : contrast > 0.25 ? "#f2c060" : "#ff9a9a";

            text(ctx, "resist after development", x0 - 24, ry + 10, "#cbd2e3", 11, "right");
            text(ctx, "feature " + node.nm + " nm, tool resolves about " + tool.res + " nm: " + verdict, LW / 2, LH - 10, col, 12, "center");
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);

            if (m.y < 60) { onInfo("The light source. Shorter wavelengths can print finer lines."); }
            else if (m.y < 150) { onInfo("The light passes through the openings of the mask and is focused onto the wafer. The lens can only focus so sharply: that limits the smallest line."); }
            else { onInfo("The pattern of light on the wafer. If the dips and peaks stay far apart the lines print cleanly. If they blur together, the pattern is lost."); }
        });

        return { stop: lp.stop };
    }


    /* ------------------------------------------------
       7. THE WAFER UNDER THE PROBE CARD
    ------------------------------------------------ */

    const STATE_COLOR = { fast: "#2fd0b0", pass: "#3ecf8e", slow: "#f2b84b", dead: "#d9484f", fail: "#6b7280" };

    function waferProbe(canvas, get, onInfo) {

        let dies = [];
        let order = [];
        let t0 = 0;
        let prog = 0;
        let hover = -1;

        const lp = A.makeLoop(canvas, { ratio: 1, maxW: 520, draw: draw });

        function load(newDies) {

            dies = newDies.map(function (d, i) { return Object.assign({}, d, { i: i }); });

            // Test row by row, snaking back and forth, like a prober.
            order = dies.slice().sort(function (a, b) { return a.y === b.y ? 0 : a.y - b.y; });

            const rows = {};

            order.forEach(function (d) { (rows[d.y] = rows[d.y] || []).push(d); });

            order = [];

            Object.keys(rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (y, k) {

                const r = rows[y].sort(function (a, b) { return a.x - b.x; });

                if (k % 2) { r.reverse(); }

                order = order.concat(r);
            });

            order.forEach(function (d, k) { d.rank = k; });

            t0 = lp.time();
            prog = 0;
            lp.wake(6);
        }

        function draw(ctx, t, dt, LH) {

            const R = get().R;
            const W = LW;
            const H = LH;

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, W, H);

            const d = R.cr.size.d;
            const s = (W - 24) / d;
            const cx = W / 2;
            const cy = H / 2;

            ctx.beginPath();
            ctx.arc(cx, cy, d / 2 * s, 0, Math.PI * 2);
            ctx.fillStyle = "#59627a";
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#aeb8d0";
            ctx.stroke();

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(cx - 14, cy + d / 2 * s - 3, 28, 8);

            const n = Math.max(order.length, 1);
            const dur = clamp(n / 500, 1.8, 4.5);

            prog = clamp((t - t0) / dur, 0, 1);

            const tested = Math.floor(prog * n);

            let good = 0;
            let seen = 0;

            dies.forEach(function (die) {

                const done = die.rank < tested;
                const side = die.side * s;
                const x = cx + die.x * s - side / 2;
                const y = cy + die.y * s - side / 2;

                if (done) {

                    seen += 1;

                    if (die.state === "pass" || die.state === "fast") { good += 1; }

                    const age = (tested - die.rank) / n * dur;

                    ctx.fillStyle = age < 0.12 && prog < 1 ? "#ffffff" : STATE_COLOR[die.state];

                } else { ctx.fillStyle = "#3a4156"; }

                ctx.fillRect(x + 0.5, y + 0.5, Math.max(1, side - 1), Math.max(1, side - 1));

                if (hover === die.i) {

                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x - 1, y - 1, side + 2, side + 2);
                }
            });

            // The probe card over the die being tested.
            if (prog < 1 && order[tested]) {

                const cur = order[tested];
                const side = Math.max(cur.side * s * 3, 18);
                const px = cx + cur.x * s;
                const py = cy + cur.y * s;

                ctx.strokeStyle = "#ffdf70";
                ctx.lineWidth = 2;
                ctx.strokeRect(px - side / 2, py - side / 2, side, side);

                for (let k = 0; k < 6; k++) {

                    ctx.beginPath();
                    ctx.moveTo(px - side / 2 + k * side / 5, py - side / 2);
                    ctx.lineTo(px - side / 2 + k * side / 5 + 2, py - side / 2 - 8);
                    ctx.stroke();
                }
            }

            text(ctx, "tested " + seen + " of " + dies.length + "  ·  working " + (seen ? Math.round(good / seen * 100) : 0) + "%", 14, 20, "#e8edf8", 13);
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);
            const R = get().R;
            const s = (LW - 24) / R.cr.size.d;
            const wx = (m.x - LW / 2) / s;
            const wy = (m.y - lp.LH / 2) / s;

            let found = -1;

            dies.forEach(function (d) { if (Math.abs(wx - d.x) <= d.side / 2 && Math.abs(wy - d.y) <= d.side / 2) { found = d.i; } });

            if (found !== hover) {

                hover = found;
                lp.wake(1);

                if (found < 0) { onInfo("Hover over a die to see its result."); return; }

                const d = dies[found];
                const rr = Math.hypot(d.x, d.y) / (R.cr.size.d / 2);

                const txt = {
                    fast: "Works, and runs faster than needed: sold in the fast bin.",
                    pass: "Works and meets the speed and power spec.",
                    slow: "Works, but not fast enough for the product: sold as a lower grade.",
                    fail: "Leaky or off target: the threshold voltage or leakage is out of range.",
                    dead: "Dead: a killer defect landed on this die." + (rr > 0.8 ? " It is near the edge, where the wafer is dirtiest." : "")
                }[d.state];

                onInfo("Die " + Math.round(d.x) + ", " + Math.round(d.y) + " mm from the centre. " + txt);
            }
        });

        canvas.addEventListener("mouseleave", function () { hover = -1; });

        return { load: load, replay: function () { t0 = lp.time(); lp.wake(6); }, stop: lp.stop };
    }


    /* ------------------------------------------------
       8. PACKAGE AND HEAT
    ------------------------------------------------ */

    function packaging(canvas, get, onInfo) {

        let load = 1;
        let tj = 25;
        const lp = A.makeLoop(canvas, { ratio: 0.58, draw: draw });

        function draw(ctx, t, dt, LH) {

            const g = get();
            const R = g.R;
            const pk = R.fin.pkg;
            const type = g.c.pkg.pkg;
            const ch = R.chip;

            const T = 14;
            const ph = t % T;

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            const cx = 270;
            const baseY = 220;
            const dw = clamp(40 + Math.sqrt(ch.areaMm2) * 3, 44, 110);                      // die width in pixels

            const place = ease(ph / 2.5);                                                    // the die is picked and placed
            const connect = clamp((ph - 2.5) / 2.5, 0, 1);                                   // bonds, bumps or balls appear
            const cover = ease((ph - 5) / 1.4);                                              // the lid or mould closes
            const thermal = clamp((ph - 6.5) / 1.5, 0, 1);                                   // heat starts to flow

            const p = ch.pDyn * load + ch.pLeak;
            const tjTarget = 25 + p * pk.theta;

            tj += (tjTarget - tj) * clamp(dt * 1.4, 0, 1) * (thermal > 0 ? 1 : 0);

            if (thermal <= 0) { tj = lerp(tj, 25, clamp(dt * 3, 0, 1)); }

            const hotU = clamp((tj - 25) / 110, 0, 1);

            // Where the die comes from: a pick-and-place tip carrying it down.
            const dieY = lerp(60, baseY - 24, place);
            const dieX = cx;

            function die(x, y, flip) {

                ctx.fillStyle = thermal > 0 ? mix([90, 100, 130], [255, 120, 60], hotU) : "#6c7590";
                ctx.fillRect(x - dw / 2, y, dw, 12);
                ctx.fillStyle = "rgba(255,255,255,0.25)";

                for (let k = 0; k < 5; k++) { ctx.fillRect(x - dw / 2 + 5 + k * (dw - 10) / 5, y + (flip ? 8 : 2), (dw - 10) / 7, 2); }
            }

            // Substrate or leadframe.
            if (type === "qfn") {

                ctx.fillStyle = "#9aa0b4";
                ctx.fillRect(cx - dw / 2 - 8, baseY - 8, dw + 16, 8);

                for (let k = 0; k < 6; k++) {

                    ctx.fillRect(cx - dw / 2 - 52, baseY - 6 + 0, 36, 6);
                    ctx.fillRect(cx + dw / 2 + 16, baseY - 6, 36, 6);
                    void k;
                }

                die(dieX, dieY, false);

                if (connect > 0) {

                    ctx.strokeStyle = "#e8c06a";
                    ctx.lineWidth = 1.2;

                    for (let k = 0; k < 6; k++) {

                        const left = k % 2 === 0;
                        const sx = dieX + (left ? -dw / 2 : dw / 2);
                        const ex = dieX + (left ? -dw / 2 - 30 : dw / 2 + 30);
                        const prog = clamp(connect * 6 - k, 0, 1);

                        ctx.beginPath();
                        ctx.moveTo(sx, dieY + 2 + (k % 3) * 2);
                        ctx.quadraticCurveTo((sx + ex) / 2, dieY - 14 + (k % 3) * 2, lerp(sx, ex, prog), lerp(dieY + 2, baseY - 6, prog));
                        ctx.stroke();
                    }
                }

                if (cover > 0) {

                    ctx.fillStyle = "rgba(40,44,60," + (0.9 * cover) + ")";
                    rrect(ctx, cx - dw / 2 - 40, baseY - 66 - (1 - cover) * 30, dw + 80, 66, 8);
                    ctx.fill();
                }

            } else if (type === "bga" || type === "flip") {

                ctx.fillStyle = "#2f7d57";
                ctx.fillRect(cx - dw / 2 - 40, baseY - 6, dw + 80, 8);

                // Solder balls under the board.
                if (connect > 0) {

                    ctx.fillStyle = "#cfd3de";

                    for (let k = 0; k < 8; k++) {

                        const bx = cx - dw / 2 - 30 + k * (dw + 60) / 7;

                        ctx.globalAlpha = clamp(connect * 8 - k, 0, 1);
                        ctx.beginPath();
                        ctx.arc(bx, baseY + 8, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    ctx.globalAlpha = 1;
                }

                if (type === "bga") {

                    die(dieX, dieY, false);

                    if (connect > 0) {

                        ctx.strokeStyle = "#e8c06a";
                        ctx.lineWidth = 1.2;

                        for (let k = 0; k < 6; k++) {

                            const left = k % 2 === 0;
                            const sx = dieX + (left ? -dw / 2 : dw / 2);
                            const ex = dieX + (left ? -dw / 2 - 16 - k * 4 : dw / 2 + 16 + k * 4);
                            const prog = clamp(connect * 6 - k, 0, 1);

                            ctx.beginPath();
                            ctx.moveTo(sx, dieY + 2);
                            ctx.quadraticCurveTo((sx + ex) / 2, dieY - 12, lerp(sx, ex, prog), lerp(dieY + 2, baseY - 6, prog));
                            ctx.stroke();
                        }
                    }

                    if (cover > 0) {

                        ctx.fillStyle = "rgba(40,44,60," + (0.9 * cover) + ")";
                        rrect(ctx, cx - dw / 2 - 30, baseY - 60 - (1 - cover) * 30, dw + 60, 56, 10);
                        ctx.fill();
                    }

                } else {

                    // Flip-chip: the die is turned over and sits on tiny bumps. A copper lid carries the heat away.
                    const fy = connect > 0 ? baseY - 22 : dieY;

                    die(dieX, fy, true);

                    ctx.fillStyle = "#e8c06a";

                    if (connect > 0) { for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(dieX - dw / 2 + 6 + k * (dw - 12) / 6, baseY - 8, 2.2, 0, Math.PI * 2); ctx.fill(); } }

                    if (cover > 0) {

                        ctx.fillStyle = "rgba(205,130,70," + cover + ")";
                        ctx.fillRect(cx - dw / 2 - 34, baseY - 52 - (1 - cover) * 34, dw + 68, 8);
                        ctx.fillStyle = "rgba(160,170,190," + cover + ")";
                        ctx.fillRect(cx - dw / 2, baseY - 44 - (1 - cover) * 34, dw, 22);

                        for (let k = 0; k < 7; k++) { ctx.fillStyle = "rgba(205,130,70," + cover + ")"; ctx.fillRect(cx - dw / 2 - 28 + k * (dw + 56) / 7, baseY - 74 - (1 - cover) * 34, 6, 22); }
                    }
                }

            } else {

                // Wafer-level package: the balls sit right on the die.
                die(dieX, dieY, false);

                if (connect > 0) {

                    ctx.fillStyle = "#cfd3de";

                    for (let k = 0; k < 5; k++) {

                        ctx.globalAlpha = clamp(connect * 5 - k, 0, 1);
                        ctx.beginPath();
                        ctx.arc(dieX - dw / 2 + 8 + k * (dw - 16) / 4, dieY + 20, 5, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    ctx.globalAlpha = 1;
                }
            }

            // The pick-and-place tip and the source wafer.
            if (place < 1) {

                ctx.strokeStyle = "#9aa3bb";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(dieX, 0);
                ctx.lineTo(dieX, dieY);
                ctx.stroke();
            }

            // Heat flows from the die up and out, and into the board.
            if (thermal > 0) {

                const n = clamp(Math.round(30 / pk.theta * 2.4), 2, 8);
                const strength = clamp(p / Math.max(ch.prod.pMax, 0.001), 0.2, 1.6);

                for (let k = 0; k < n; k++) {

                    const ax = cx - 55 + k * 110 / Math.max(n - 1, 1);

                    for (let q = 0; q < 3; q++) {

                        const u = ((t * 0.5 * (0.6 + strength) + q / 3 + k * 0.13) % 1);
                        const y = baseY - 70 - u * 80;

                        ctx.strokeStyle = "rgba(255," + Math.round(180 - 120 * hotU) + ",70," + (1 - u) * 0.8 * thermal + ")";
                        ctx.lineWidth = 2 + 2 * strength;
                        ctx.beginPath();
                        ctx.moveTo(ax - 4, y + 12);
                        ctx.lineTo(ax, y);
                        ctx.lineTo(ax + 4, y + 12);
                        ctx.stroke();
                    }
                }
            }

            // The thermometer.
            const tx = 500;
            const ty0 = 40;
            const ty1 = 250;
            const toY = function (temp) { return lerp(ty1, ty0, clamp((temp - 25) / 115, 0, 1)); };

            ctx.fillStyle = "rgba(255,255,255,0.08)";
            rrect(ctx, tx - 9, ty0 - 6, 18, ty1 - ty0 + 12, 9);
            ctx.fill();

            ctx.fillStyle = heat(0.25 + hotU * 0.75);
            ctx.fillRect(tx - 5, toY(tj), 10, ty1 - toY(tj));

            ctx.strokeStyle = "#ff6464";
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(tx - 26, toY(105));
            ctx.lineTo(tx + 26, toY(105));
            ctx.stroke();
            ctx.setLineDash([]);

            text(ctx, "105 °C limit", tx - 30, toY(105) + 4, "#ff9a9a", 10, "right");
            text(ctx, Math.round(tj) + " °C", tx, ty1 + 24, tj > 105 ? "#ff9a9a" : "#cbd2e3", 14, "center");

            const throttle = tj > 105 + 0.5 ? clamp((105 - 25) / Math.max(p * pk.theta, 1e-9), 0.05, 1) : 1;

            text(ctx, pk.name, 14, 20, "#cbd2e3", 12);
            text(ctx, "running at " + Math.round(load * 100) + "% speed: " + (p >= 10 ? p.toFixed(1) : p.toFixed(2)) + " W", 14, 38, "#cbd2e3", 11);
            text(ctx, "heat resistance " + pk.theta + " °C per watt", 14, 56, "#9fb2c8", 11);

            if (thermal > 0 && tjTarget < 35) { text(ctx, "this tiny chip barely warms up. Try the laptop processor in station 7.", cx, 76, "#9fb2c8", 11, "center"); }

            if (throttle < 1) { text(ctx, "too hot: it throttles to " + Math.round(throttle * 100) + "% of its speed", cx, LH - 16, "#ff9a9a", 12, "center"); }
            else if (thermal > 0) { text(ctx, "cool enough to run flat out", cx, LH - 16, "#7be0b0", 12, "center"); }

            const label = ph < 2.5 ? "1  Pick and place the die" : ph < 5 ? "2  Connect it to the outside world" : ph < 6.5 ? "3  Seal it" : "4  Run it and watch the heat";

            text(ctx, label, cx, LH - 36, "#e8edf8", 12, "center");
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);

            if (m.x > 460) { onInfo("The junction temperature of the silicon. Above 105 °C it must slow down to protect itself."); }
            else if (m.y < 130) { onInfo("Heat flows up through the package into the air. A package with a lower heat resistance has more and wider paths for the heat."); }
            else { onInfo("The package protects the die, connects it to a circuit board and carries away heat."); }
        });

        return { setLoad: function (v) { load = clamp(v, 0.1, 1.2); lp.wake(4); }, stop: lp.stop };
    }


    /* ------------------------------------------------
       9. THE FUNNEL FROM SAND TO CHIPS
    ------------------------------------------------ */

    function funnel(canvas, get, onInfo) {

        const parts = [];
        let hover = -1;
        const lp = A.makeLoop(canvas, { ratio: 0.52, draw: draw });

        function stages(R, c) {

            const si0 = Math.max(R.sand.kg * R.sand.sio2 * 28.086 / 60.084, 1e-9);
            const area = Math.PI * Math.pow(R.cr.size.d / 20, 2);
            const waferKg = R.wf.wafers * area * R.wf.t * 1e-4 * 2.33 / 1000;
            const waferAreaMm2 = R.wf.wafers * Math.PI * Math.pow(R.cr.size.d / 2, 2);
            const chipMm2 = R.fin.goodChips * R.chip.areaMm2;

            return [
                { name: "Silicon in the sand", v: 1, text: Math.round(si0) + " kg of silicon" },
                { name: "Metallurgical silicon", v: R.mg.kgSi / si0, text: Math.round(R.mg.kgSi) + " kg", loss: "slag, silicon monoxide gas, unreacted silica" },
                { name: "Polysilicon", v: R.poly.kgPoly / si0, text: Math.round(R.poly.kgPoly) + " kg", loss: "waste from distillation and the rods" },
                { name: "Good crystal", v: R.cr.kgUsable / si0, text: Math.round(R.cr.kgUsable) + " kg", loss: "crown, tail, lost crystal, off-spec ends" },
                { name: "Wafers", v: waferKg / si0, text: R.wf.wafers + " wafers", loss: "sawdust, polish and broken wafers" },
                { name: "Working chips", v: chipMm2 / Math.max(waferAreaMm2, 1) * waferKg / si0, text: Math.round(R.fin.goodChips).toLocaleString("en-US") + " chips", loss: "dead dies, wafer edge, cutting lanes, test and package losses" }
            ];
        }

        function draw(ctx, t, dt, LH) {

            const g = get();
            const st = stages(g.R, g.c);

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            const n = st.length;
            const colW = 54;
            const gap = (LW - 40 - n * colW) / (n - 1);
            const top = 40;
            const hMax = 190;
            const base = top + hMax;

            const pos = st.map(function (s, k) {

                // The height of each column is the share of silicon that survives, drawn on a log-ish scale so small shares stay visible.
                const h = Math.max(6, hMax * (Math.log10(Math.max(s.v, 1e-4)) + 4) / 4);

                return { x: 20 + k * (colW + gap), h: s.v > 0 ? h : 4 };
            });

            // Bands between columns and the particles flowing along them.
            for (let k = 0; k < n - 1; k++) {

                const a = pos[k];
                const b = pos[k + 1];

                ctx.fillStyle = hover === k || hover === k + 1 ? "rgba(84,224,199,0.28)" : "rgba(84,224,199,0.14)";
                ctx.beginPath();
                ctx.moveTo(a.x + colW, base - a.h);
                ctx.lineTo(b.x, base - b.h);
                ctx.lineTo(b.x, base);
                ctx.lineTo(a.x + colW, base);
                ctx.closePath();
                ctx.fill();

                // The lost share falls away below the baseline.
                const lost = a.h - b.h;

                if (lost > 4 && Math.random() < dt * 14) { parts.push({ x: a.x + colW + gap * (0.2 + 0.6 * Math.random()), y: base - 2 - Math.random() * lost * 0.5, v: 0, loss: true }); }

                if (Math.random() < dt * 10) { parts.push({ k: k, u: 0, off: Math.random(), loss: false }); }
            }

            for (let i = parts.length - 1; i >= 0; i--) {

                const p = parts[i];

                if (p.loss) {

                    p.v += dt * 90;
                    p.y += p.v * dt;

                    ctx.fillStyle = "rgba(224,160,112," + Math.max(0, 1 - (p.y - base) / 14) + ")";
                    ctx.fillRect(p.x, p.y, 2.4, 2.4);

                    if (p.y > base + 14) { parts.splice(i, 1); }

                    continue;
                }

                p.u += dt * 0.7;

                if (p.u >= 1) { parts.splice(i, 1); continue; }

                const a = pos[p.k];
                const b = pos[p.k + 1];
                const x = lerp(a.x + colW, b.x, p.u);
                const hTop = lerp(base - a.h, base - b.h, p.u);
                const y = lerp(hTop, base, p.off);

                ctx.fillStyle = mix([232, 228, 214], [160, 210, 255], p.u);
                ctx.beginPath();
                ctx.arc(x, y, 1.7, 0, Math.PI * 2);
                ctx.fill();
            }

            st.forEach(function (s, k) {

                const p = pos[k];
                const act = hover === k;

                const gr = ctx.createLinearGradient(0, base - p.h, 0, base);

                gr.addColorStop(0, act ? "#8ef0dc" : "#54e0c7");
                gr.addColorStop(1, act ? "#4a9eff" : "#2a7aa8");
                ctx.fillStyle = gr;
                rrect(ctx, p.x, base - p.h, colW, p.h, 5);
                ctx.fill();

                const pct = s.v >= 0.1 ? Math.round(s.v * 100) + "%" : s.v >= 0.001 ? (s.v * 100).toFixed(1) + "%" : s.v > 0 ? "<0.1%" : "0%";

                text(ctx, k === 0 ? "100%" : pct, p.x + colW / 2, base - p.h - 6, "#e8edf8", 12, "center");
                text(ctx, s.name.split(" ").slice(0, 2).join(" "), p.x + colW / 2, base + 16, act ? "#ffffff" : "#cbd2e3", 10, "center");
                text(ctx, s.name.split(" ").slice(2).join(" "), p.x + colW / 2, base + 28, act ? "#ffffff" : "#cbd2e3", 10, "center");
                text(ctx, s.text, p.x + colW / 2, base + 46, "#9fb2c8", 10, "center");
            });

            text(ctx, "share of the silicon that makes it to each stage (log scale)", LW / 2, 22, "#cbd2e3", 11, "center");
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);
            const g = get();
            const st = stages(g.R, g.c);
            const n = st.length;
            const colW = 54;
            const gap = (LW - 40 - n * colW) / (n - 1);

            let found = -1;

            for (let k = 0; k < n; k++) { const x = 20 + k * (colW + gap); if (m.x >= x - gap / 2 && m.x <= x + colW + gap / 2) { found = k; } }

            if (found !== hover) {

                hover = found;
                lp.wake(1);

                onInfo(found < 0 ? "Hover over a stage." : found === 0 ? st[0].name + ": " + st[0].text + ". Everything after this is what you kept." : st[found].name + ": " + st[found].text + ". Lost on the way here: " + st[found].loss + ".");
            }
        });

        canvas.addEventListener("mouseleave", function () { hover = -1; });

        return { stop: lp.stop };
    }


    Object.assign(A, { crystal: crystal, wafering: wafering, transistor: transistor, litho: litho, waferProbe: waferProbe, packaging: packaging, funnel: funnel, STEPS: STEPS });

}(typeof window !== "undefined" ? window : globalThis));
