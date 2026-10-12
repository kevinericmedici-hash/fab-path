/* ========================================
   SAND TO CHIP: LIVE ANIMATIONS

   One animated, interactive canvas for each station of the foundry lab.
   Every animation reads the current choices and results each frame, so
   dragging a slider changes what you see straight away.

   Part 1 (this file): the shared loop, the sand tray, the arc furnace and
   the purification plant. Part 2 (chip-lab-anim2.js): crystal, wafering,
   the transistor cross-section, the wafer probe, packaging and the funnel.

   Needs window.ChipLab.
======================================== */

(function (root) {

    "use strict";

    const C = root.ChipLab;

    const LW = 600;                                                        // logical canvas width, all drawing is done in these units

    const reduce = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const all = [];


    /* ------------------------------------------------
       SMALL TOOLS
    ------------------------------------------------ */

    function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

    function lerp(a, b, u) { return a + (b - a) * u; }

    function mix(c1, c2, u) {

        return "rgb(" + Math.round(lerp(c1[0], c2[0], u)) + "," + Math.round(lerp(c1[1], c2[1], u)) + "," + Math.round(lerp(c1[2], c2[2], u)) + ")";
    }

    // Black body style colours: dull red, orange, yellow, white-hot.
    function heat(u) {

        u = clamp(u, 0, 1);

        const stops = [[50, 20, 24], [190, 50, 24], [255, 150, 40], [255, 225, 120], [255, 250, 225]];
        const f = u * (stops.length - 1);
        const i = Math.min(stops.length - 2, Math.floor(f));

        return mix(stops[i], stops[i + 1], f - i);
    }

    function ease(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }

    function text(ctx, str, x, y, color, size, align) {

        ctx.font = (size || 12) + "px Inter, Arial, sans-serif";
        ctx.fillStyle = color || "#cbd2e3";
        ctx.textAlign = align || "left";
        ctx.fillText(str, x, y);
    }

    function rrect(ctx, x, y, w, h, r) {

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function grainPath(ctx, x, y, r, rot, seed) {

        ctx.beginPath();

        for (let k = 0; k < 7; k++) {

            const a = rot + k * Math.PI * 2 / 7;
            const rr = r * (0.82 + 0.18 * Math.sin(seed * 1.7 + k * 2.3));

            if (k === 0) { ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } else { ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        }

        ctx.closePath();
    }


    /* ------------------------------------------------
       THE LOOP: sizing, timing, pausing off screen
    ------------------------------------------------ */

    // o: { ratio (height/width), maxW, draw(ctx, t, dt, LH) }
    function makeLoop(canvas, o) {

        const holder = canvas.parentNode;
        const LH = Math.round(LW * (o.ratio || 0.5));

        let W = LW;
        let raf = 0;
        let last = 0;
        let t = 0;
        let visible = true;
        let stopped = false;
        let wake = reduce ? 2 : Infinity;                                 // with reduced motion, run only briefly after each interaction

        const ctx = canvas.getContext("2d");

        function size() {

            const w = Math.max(240, Math.min(holder && holder.clientWidth ? holder.clientWidth : LW, o.maxW || 720));
            const dpr = root.devicePixelRatio || 1;

            W = w;

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(w * LH / LW * dpr);
            canvas.style.width = w + "px";
            canvas.style.height = Math.round(w * LH / LW) + "px";
        }

        function paint(dt) {

            const dpr = root.devicePixelRatio || 1;
            const s = W / LW * dpr;

            ctx.setTransform(s, 0, 0, s, 0, 0);
            ctx.clearRect(0, 0, LW, LH);
            o.draw(ctx, t, dt, LH);
        }

        function frame(now) {

            raf = 0;

            if (stopped || !canvas.isConnected) { stop(); return; }

            // The canvas is often made before it is in the page, so pick up its real width once it is there.
            const hw = holder && holder.clientWidth ? Math.min(holder.clientWidth, o.maxW || 720) : 0;

            if (hw && Math.abs(Math.max(240, hw) - W) > 1) { size(); }

            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));

            last = now;

            const running = wake === Infinity || t < wake;

            if (visible && running) { t += dt; paint(dt); }

            if (running) { schedule(); }
        }

        function schedule() { if (!raf && !stopped) { last = performance.now(); raf = root.requestAnimationFrame(frame); } }

        function stop() { stopped = true; if (raf) { root.cancelAnimationFrame(raf); raf = 0; } }

        size();

        if (root.IntersectionObserver) {

            const io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible) { schedule(); } });

            io.observe(canvas);
        }

        if (root.ResizeObserver && holder) {

            let tm = 0;
            const ro = new ResizeObserver(function () { clearTimeout(tm); tm = setTimeout(function () { size(); paint(0); }, 40); });

            ro.observe(holder);
        }

        paint(0);
        schedule();

        const api = {
            stop: stop,
            redraw: function () { paint(0); },
            wake: function (sec) { if (reduce) { wake = t + (sec || 3); } schedule(); },
            time: function () { return t; },
            toLogical: function (e) {

                const r = canvas.getBoundingClientRect();

                return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * LH };
            },
            LH: LH
        };

        all.push(api);

        return api;
    }

    function stopAll() { all.splice(0).forEach(function (a) { a.stop(); }); }


    /* ------------------------------------------------
       1. SAND TRAY
       api: { grains(), removed(), treat(), onInfo(text), onPick(id) }
    ------------------------------------------------ */

    function sandTray(canvas, api) {

        const TRAY = { x: 14, y: 14, w: LW - 28, h: 0 };
        const view = {};                                  // grain id -> { vis, fly }
        let hover = null;
        let flights = [];
        let bubbles = [];

        const lp = makeLoop(canvas, { ratio: 0.5, draw: draw });

        TRAY.h = lp.LH - 28;

        const types = C.TREATMENTS;

        // Which treatment, if any, removes this grain from the pile (deterministic, so it looks the same each time).
        function gone(g) {

            const tr = api.treat();
            const ids = Object.keys(types);

            for (let k = 0; k < ids.length; k++) {

                if (!tr[ids[k]]) { continue; }

                const f = (types[ids[k]].rem || {})[g.type];

                if (f && hash(g.id * 7.3 + k * 13.1) < f) { return ids[k]; }
            }

            return null;
        }

        function leached(g) {

            const tr = api.treat();

            return !!(tr.leach && g.type === "iron" && hash(g.id * 3.9 + 5) < 0.88);
        }

        function pos(g) { return { x: TRAY.x + g.x * TRAY.w, y: TRAY.y + g.y * TRAY.h, r: 4.5 + g.r * 3.2 }; }

        function visibleNow(g, handGone) { return !handGone[g.id] && !gone(g); }

        // Called after the UI changes the pile: grains that just left fly away, grains that came back fade in.
        function notify() {

            const hand = {};

            api.removed().forEach(function (id) { hand[id] = true; });

            api.grains().forEach(function (g) {

                const v = view[g.id] || (view[g.id] = { vis: true, fly: null, fade: 1 });
                const nowVis = visibleNow(g, hand);

                if (v.vis && !nowVis) {

                    const cause = hand[g.id] ? "hand" : gone(g);
                    const p = pos(g);

                    flights.push({ id: g.id, g: g, cause: cause, t0: lp.time(), dur: cause === "hand" ? 0.8 : 1.1 + hash(g.id) * 0.6, from: p, ph: hash(g.id * 5) });
                }

                if (!v.vis && nowVis) { v.fade = 0; }

                v.vis = nowVis;
            });

            lp.wake(2.5);
        }

        function nearest(e) {

            const m = lp.toLogical(e);

            let best = null;
            let bd = Infinity;

            api.grains().forEach(function (g) {

                const v = view[g.id];

                if (v && !v.vis) { return; }

                const p = pos(g);
                const d = Math.hypot(p.x - m.x, p.y - m.y) - p.r;

                if (d < 4 && d < bd) { bd = d; best = g.id; }
            });

            return best;
        }

        canvas.addEventListener("mousemove", function (e) {

            const id = nearest(e);

            if (id !== hover) {

                hover = id;

                const g = id === null ? null : api.grains()[id];

                api.onInfo(g ? C.GRAINS[g.type].name + ": " + C.GRAINS[g.type].note : "Hover over a grain to see what it is.");
                lp.wake(1);
            }
        });

        canvas.addEventListener("mouseleave", function () { hover = null; });

        canvas.addEventListener("click", function (e) {

            const id = nearest(e);

            if (id === null) { return; }

            api.onPick(id);
            notify();
        });

        function dest(f) {

            switch (f.cause) {

                case "hand": return { x: TRAY.x + TRAY.w - 28, y: TRAY.y + TRAY.h + 6 };
                case "magnet": return { x: TRAY.x + TRAY.w / 2 + (hash(f.id) - 0.5) * 120, y: TRAY.y - 24 };
                case "wash": return { x: TRAY.x + TRAY.w + 40, y: f.from.y + (hash(f.id) - 0.5) * 30 };
                case "flotation": return { x: f.from.x + (hash(f.id) - 0.5) * 50, y: TRAY.y - 40 };
                default: return { x: f.from.x, y: f.from.y };
            }
        }

        function drawGrain(ctx, g, x, y, r, alpha, glow) {

            const t = C.GRAINS[leached(g) ? "quartz" : g.type];

            ctx.globalAlpha = alpha;

            grainPath(ctx, x, y, r, g.rot, g.id);
            ctx.fillStyle = t.color;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = glow ? "#54e0c7" : t.edge;
            ctx.stroke();

            if (g.type === "quartz" || leached(g)) {

                ctx.fillStyle = "rgba(255,255,255,0.35)";
                ctx.beginPath();
                ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.22, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        }

        function draw(ctx, t, dt, LH) {

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            ctx.strokeStyle = "rgba(255,255,255,0.04)";
            ctx.lineWidth = 1;

            for (let x = 0; x < LW; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, LH); ctx.stroke(); }
            for (let y = 0; y < LH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LW, y); ctx.stroke(); }

            const tr = api.treat();

            // Ambient effects of the active cleaning stages.
            if (tr.wash) {

                ctx.strokeStyle = "rgba(90,170,255,0.16)";
                ctx.lineWidth = 2;

                for (let k = 0; k < 6; k++) {

                    const y = TRAY.y + (k + 0.5) / 6 * TRAY.h;

                    ctx.beginPath();

                    for (let x = 0; x <= LW; x += 8) { const yy = y + Math.sin(x * 0.04 - t * 2 + k) * 3; if (x === 0) { ctx.moveTo(x, yy); } else { ctx.lineTo(x, yy); } }

                    ctx.stroke();
                }
            }

            if (tr.leach) {

                ctx.fillStyle = "rgba(120,230,120," + (0.05 + 0.03 * Math.sin(t * 3)) + ")";
                ctx.fillRect(0, 0, LW, LH);
            }

            if (tr.magnet) {

                // The magnet bar over the tray, with field lines.
                rrect(ctx, LW / 2 - 90, 2, 180, 10, 4);
                ctx.fillStyle = "#c04848";
                ctx.fill();
                ctx.fillStyle = "#4a6fd0";
                ctx.fillRect(LW / 2, 2, 90, 10);
                text(ctx, "N", LW / 2 - 78, 11, "#fff", 9);
                text(ctx, "S", LW / 2 + 72, 11, "#fff", 9);
            }

            // The grains that are still on the tray.
            api.grains().forEach(function (g) {

                const v = view[g.id] || (view[g.id] = { vis: true, fly: null, fade: 1 });

                if (!v.vis) { return; }

                v.fade = Math.min(1, v.fade + dt * 2);

                const p = pos(g);
                const shake = tr.magnet && (g.type === "magnetite" || g.type === "ilmenite") ? Math.sin(t * 30 + g.id) * 1.2 : 0;

                drawGrain(ctx, g, p.x + shake, p.y, p.r, v.fade, hover === g.id);
            });

            // Grains in flight.
            flights = flights.filter(function (f) {

                const u = (t - f.t0) / f.dur;

                if (u >= 1) { return false; }

                const d = dest(f);
                const e = ease(u);
                let x = lerp(f.from.x, d.x, e);
                let y = lerp(f.from.y, d.y, e);
                const p = pos(f.g);

                if (f.cause === "hand") { y -= Math.sin(u * Math.PI) * 40; }
                if (f.cause === "wash") { y += Math.sin(u * 8 + f.ph * 6) * 4; }
                if (f.cause === "flotation") { x += Math.sin(u * 10 + f.ph * 6) * 5; }

                const r = f.cause === "leach" ? p.r * (1 - u) : p.r;

                drawGrain(ctx, f.g, x, y, Math.max(r, 0.5), f.cause === "leach" ? 1 - u : 1 - Math.max(0, u - 0.7) / 0.3, false);

                if (f.cause === "flotation" && Math.random() < 0.25) { bubbles.push({ x: x, y: y, r: 1 + Math.random() * 2, life: 1 }); }
                if (f.cause === "leach" && Math.random() < 0.2) { bubbles.push({ x: p.x + (Math.random() - 0.5) * 8, y: p.y, r: 1 + Math.random() * 1.5, life: 0.8 }); }

                return true;
            });

            bubbles = bubbles.filter(function (b) {

                b.life -= dt;
                b.y -= dt * 24;

                ctx.strokeStyle = "rgba(190,230,255," + Math.max(0, b.life) + ")";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();

                return b.life > 0;
            });

            // The reject bin.
            rrect(ctx, TRAY.x + TRAY.w - 62, LH - 12, 56, 12, 3);
            ctx.fillStyle = "rgba(200,70,70,0.35)";
            ctx.fill();
            text(ctx, "rejects", TRAY.x + TRAY.w - 34, LH - 3, "#f0b0b0", 8, "center");
        }

        // Restore the view of the pile at start, with no flights.
        (function init() {

            const hand = {};

            api.removed().forEach(function (id) { hand[id] = true; });

            api.grains().forEach(function (g) { view[g.id] = { vis: visibleNow(g, hand), fly: null, fade: 1 }; });
        }());

        return { notify: notify, stop: lp.stop, redraw: lp.redraw };
    }


    /* ------------------------------------------------
       2. THE ARC FURNACE
       get(): { R, c }
    ------------------------------------------------ */

    function furnace(canvas, get, onInfo) {

        const charge = [];
        let bubbles = [];
        let fumes = [];
        let tap = -1;                                       // seconds since the tap was opened, -1 when closed

        for (let i = 0; i < 120; i++) { charge.push({ x: 175 + hash(i) * 250, y: 60 + hash(i + 50) * 120, v: 10 + hash(i + 90) * 14, k: hash(i + 130), s: 2 + hash(i + 170) * 2.4 }); }

        const lp = makeLoop(canvas, { ratio: 0.58, draw: draw });

        function draw(ctx, t, dt, LH) {

            const g = get();
            const R = g.R;
            const f = g.c.furnace;
            const T = f.temp;
            const u = clamp((T - 1700) / 600, 0, 1);
            const etaT = R.mg.etaT;
            const carbFrac = f.carbonPer100 / (100 + f.carbonPer100);

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            // Outer steel shell and the refractory lining.
            ctx.beginPath();
            ctx.moveTo(150, 52);
            ctx.lineTo(450, 52);
            ctx.lineTo(472, LH - 28);
            ctx.lineTo(128, LH - 28);
            ctx.closePath();
            ctx.fillStyle = "#4a5266";
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(166, 58);
            ctx.lineTo(434, 58);
            ctx.lineTo(452, LH - 38);
            ctx.lineTo(148, LH - 38);
            ctx.closePath();
            ctx.fillStyle = "#2a2f3f";
            ctx.fill();

            // Hot glow of the zone around the electrode tips.
            const gy = 190;
            const gr = ctx.createRadialGradient(300, gy, 4, 300, gy, 60 + 120 * u);

            gr.addColorStop(0, heat(0.55 + 0.45 * u).replace("rgb", "rgba").replace(")", "," + (0.25 + 0.6 * u) + ")"));
            gr.addColorStop(1, "rgba(255,120,30,0)");
            ctx.fillStyle = gr;
            ctx.fillRect(150, 60, 300, LH - 100);

            // The charge: sand (pale) and carbon (black) falling in from the top and melting as it nears the arc.
            charge.forEach(function (p, i) {

                const reacting = T >= 1850;

                p.y += p.v * dt * (reacting ? 1 : 0.15);

                if (p.y > 205 && reacting) { p.y = 60; p.x = 175 + hash(i + t * 0.7) * 250; p.k = hash(i * 1.3 + t); }

                if (p.y > 260) { p.y = 260; }

                const hot = clamp((p.y - 130) / 80, 0, 1);
                const isC = p.k < carbFrac * 2.2;
                const col = isC ? mix([30, 30, 36], [255, 120, 40], hot * u) : mix([232, 228, 214], [255, 170, 80], hot * u);

                ctx.fillStyle = col;
                ctx.globalAlpha = 1 - clamp((p.y - 190) / 40, 0, 0.9);
                ctx.fillRect(p.x, p.y, p.s, p.s);
                ctx.globalAlpha = 1;
            });

            // The pool of molten silicon.
            const poolTop = 214;

            ctx.beginPath();
            ctx.moveTo(150, poolTop);

            for (let x = 150; x <= 450; x += 10) { ctx.lineTo(x, poolTop + Math.sin(x * 0.06 + t * 2.4) * 2.2); }

            ctx.lineTo(448, LH - 38);
            ctx.lineTo(152, LH - 38);
            ctx.closePath();

            const pg = ctx.createLinearGradient(0, poolTop, 0, LH - 38);

            pg.addColorStop(0, heat(0.35 + 0.65 * u));
            pg.addColorStop(1, heat(0.15 + 0.5 * u));
            ctx.fillStyle = pg;
            ctx.fill();

            // Silicon carbide crust when there is too much carbon.
            if (f.carbonPer100 > 50) {

                const k = clamp((f.carbonPer100 - 50) / 10, 0, 1);

                ctx.fillStyle = "#3a3c44";

                for (let i = 0; i < 9; i++) {

                    const x = 154 + i * 33 + hash(i) * 12;
                    const w = 16 + 20 * k * hash(i + 4);

                    rrect(ctx, x, LH - 38 - 10 - 18 * k * hash(i + 8), w, 10 + 18 * k * hash(i + 8), 3);
                    ctx.fill();
                }
            }

            // Electrodes with a flickering arc to the melt.
            [240, 300, 360].forEach(function (x, i) {

                const tipY = 180 + Math.sin(t * 1.3 + i) * 2;

                ctx.fillStyle = "#2b2b30";
                ctx.fillRect(x - 9, 0, 18, tipY);
                ctx.fillStyle = "#4b4b55";
                ctx.fillRect(x - 9, 0, 5, tipY);
                ctx.fillStyle = "#3c3c46";
                ctx.fillRect(x - 12, 0, 24, 10);

                if (u > 0.05) {

                    ctx.strokeStyle = "rgba(255,255," + Math.round(180 + 70 * u) + "," + (0.35 + 0.5 * u) + ")";
                    ctx.lineWidth = 1.4 + 1.6 * u;
                    ctx.beginPath();
                    ctx.moveTo(x, tipY);

                    let ax = x;
                    let ay = tipY;

                    for (let s = 1; s <= 6; s++) { ax = x + (Math.random() - 0.5) * 16; ay = tipY + (poolTop - tipY) * s / 6; ctx.lineTo(ax, ay); }

                    ctx.stroke();
                }
            });

            // Carbon monoxide bubbles from the reaction.
            const rate = 22 * etaT * (R.mg.etaC * 0.7 + 0.3);

            if (Math.random() < rate * dt) { bubbles.push({ x: 170 + Math.random() * 260, y: LH - 50, v: 25 + Math.random() * 20, r: 2 + Math.random() * 2.4, life: 1 }); }

            bubbles = bubbles.filter(function (b) {

                b.y -= b.v * dt;
                b.x += Math.sin(b.y * 0.1 + b.r) * 0.4;

                ctx.strokeStyle = "rgba(235,235,245,0.75)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();

                if (b.y < poolTop - 4 && !b.out) { b.out = true; }

                return b.y > 50;
            });

            text(ctx, "CO gas", 300, 44, "#cbd2e3", 11, "center");

            // SiO fumes escaping when it is far too hot.
            if (T > 2050 && Math.random() < (T - 2050) / 250 * 30 * dt) { fumes.push({ x: 180 + Math.random() * 240, y: 56, v: 20 + Math.random() * 20, r: 3, life: 1 }); }

            fumes = fumes.filter(function (b) {

                b.y -= b.v * dt;
                b.r += dt * 6;
                b.life -= dt * 0.6;

                ctx.fillStyle = "rgba(255,255,255," + Math.max(0, b.life * 0.35) + ")";
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fill();

                return b.life > 0 && b.y > 0;
            });

            // The tap hole, the stream and the ladle.
            const ladleX = 20;
            const ladleY = LH - 56;
            const fill = clamp(R.mg.rho / 0.9, 0, 1) * clamp(R.mg.kgSi / Math.max(R.mg.kgSand * 0.467, 1), 0, 1.2);

            rrect(ctx, ladleX, ladleY, 96, 46, 8);
            ctx.fillStyle = "#4a5266";
            ctx.fill();

            if (tap >= 0) { tap += dt; }

            const filled = tap < 0 ? 0 : clamp((tap - 0.6) / 3.5, 0, 1);
            const level = Math.max(filled, 0) * fill * 36;

            ctx.fillStyle = heat(0.55 + 0.4 * u);
            ctx.fillRect(ladleX + 6, ladleY + 42 - level, 84, level);

            if (tap >= 0 && tap < 4.6) {

                ctx.strokeStyle = heat(0.8);
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(130, LH - 64);
                ctx.quadraticCurveTo(112, LH - 62, 70, ladleY + 4);
                ctx.stroke();
            }

            if (tap >= 4.6) { tap = -1; }

            ctx.fillStyle = "#2b2b30";
            ctx.fillRect(126, LH - 70, 26, 14);

            text(ctx, "ladle: " + (R.mg.kgSi >= 1 ? Math.round(R.mg.kgSi) + " kg of silicon" : "no silicon"), ladleX + 48, LH - 6, "#cbd2e3", 10, "center");

            // Labels.
            text(ctx, "electrodes", 492, 40, "#cbd2e3", 11);
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.beginPath();
            ctx.moveTo(488, 37);
            ctx.lineTo(372, 36);
            ctx.stroke();

            text(ctx, "sand + carbon", 492, 110, "#cbd2e3", 11);
            ctx.beginPath();
            ctx.moveTo(488, 107);
            ctx.lineTo(420, 108);
            ctx.stroke();

            text(ctx, "molten silicon", 492, 256, "#cbd2e3", 11);
            ctx.beginPath();
            ctx.moveTo(488, 253);
            ctx.lineTo(440, 250);
            ctx.stroke();

            text(ctx, Math.round(T) + " °C", 492, 200, "rgb(255," + Math.round(150 + 90 * u) + ",90)", 14);

            if (T < 1850) { text(ctx, "too cold: the charge piles up", 300, 130, "#9fb2e0", 12, "center"); }
            if (f.carbonPer100 > 52) { text(ctx, "silicon carbide crust", 300, LH - 46, "#c8c8d0", 10, "center"); }
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);

            if (m.x > 126 && m.x < 154 && m.y > lp.LH - 72 && m.y < lp.LH - 54) { onInfo("The tap hole: open it and the molten silicon runs out into the ladle."); }
            else if (m.x > 228 && m.x < 372 && m.y < 185) { onInfo("Three carbon electrodes carry thousands of amps. The arc between them and the charge makes the heat."); }
            else if (m.y > 214 && m.x > 150 && m.x < 450) { onInfo("The molten silicon pool. The carbon strips the oxygen from the silica and leaves as carbon monoxide bubbles."); }
            else { onInfo("Hover over the furnace to see what each part does."); }
        });

        return {
            tap: function () { tap = 0; lp.wake(6); },
            stop: lp.stop
        };
    }


    /* ------------------------------------------------
       3. PURIFICATION: DISTILLATION COLUMN AND SIEMENS REACTOR
    ------------------------------------------------ */

    function purify(canvas, get, onInfo) {

        const dots = [];
        const gas = [];
        let spawnT = 0;
        let gasT = 0;
        const bumps = [];

        for (let i = 0; i < 60; i++) { bumps.push({ a: hash(i) * Math.PI * 2, s: 0.5 + hash(i + 40) }); }

        const lp = makeLoop(canvas, { ratio: 0.62, draw: draw });

        function factors(R) {

            const m = R.mg;
            const load = m.ppm.fe + m.ppm.al + m.ppm.ti + m.ppm.ca;

            return { fMetal: 60 / (1 + load / 1e4), fDop: 10 / (1 + load / 4e4) };
        }

        function draw(ctx, t, dt, LH) {

            const g = get();
            const R = g.R;
            const p = g.c.poly;
            const n = p.stages;
            const fc = factors(R);

            ctx.fillStyle = "#1c2132";
            ctx.fillRect(0, 0, LW, LH);

            // The distillation column on the left.
            const cx = 70;
            const cw = 100;
            const top = 40;
            const bot = LH - 40;
            const tray = (bot - top) / (n + 0.5);

            rrect(ctx, cx, top - 12, cw, bot - top + 24, 14);
            ctx.fillStyle = "#2a2f3f";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#7d879f";
            ctx.stroke();

            for (let k = 0; k < n; k++) {

                const y = bot - (k + 1) * tray + 4;

                ctx.fillStyle = "rgba(90,160,255,0.28)";
                ctx.fillRect(cx + 3, y, cw - 6, 9);

                // Bubbling liquid on the tray.
                for (let b = 0; b < 3; b++) {

                    const bx = cx + 14 + ((t * 18 + b * 31 + k * 17) % (cw - 28));

                    ctx.strokeStyle = "rgba(190,225,255,0.55)";
                    ctx.beginPath();
                    ctx.arc(bx, y + 4 - Math.abs(Math.sin(t * 3 + b + k)) * 6, 1.6, 0, Math.PI * 2);
                    ctx.stroke();
                }

                ctx.strokeStyle = "#7d879f";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx + 3, y + 9);
                ctx.lineTo(cx + cw - 3, y + 9);
                ctx.stroke();
            }

            // The waste pipe on the right of the column.
            ctx.strokeStyle = "#7a5a3a";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx + cw, bot);
            ctx.lineTo(cx + cw + 36, bot);
            ctx.lineTo(cx + cw + 36, top + 12);
            ctx.stroke();
            text(ctx, "waste", cx + cw + 42, top + 24, "#d0a880", 10);

            // Particles: impurities rise with the gas and are skimmed off at each tray.
            spawnT += dt;

            while (spawnT > 0.045) {

                spawnT -= 0.045;

                const metal = Math.random() < 0.6;

                dots.push({ x: cx + 18 + Math.random() * (cw - 36), y: bot, metal: metal, lvl: 0, out: false, life: 0 });
            }

            for (let i = dots.length - 1; i >= 0; i--) {

                const d = dots[i];

                if (d.out) {

                    d.x += dt * 70;
                    d.y -= dt * 4;
                    d.life += dt;

                    if (d.x > cx + cw + 36) { d.x = cx + cw + 36; d.y -= dt * 60; }
                    if (d.y < top + 8 || d.life > 4) { dots.splice(i, 1); continue; }

                } else {

                    d.y -= dt * 28;

                    const lvl = Math.floor((bot - d.y) / tray);

                    if (lvl > d.lvl && lvl <= n) {

                        d.lvl = lvl;

                        const fac = d.metal ? fc.fMetal : fc.fDop;

                        if (Math.random() < 1 - 1 / fac) { d.out = true; d.x = Math.min(d.x, cx + cw - 3); d.y = bot - lvl * tray + 6; }
                    }

                    d.x += Math.sin(d.y * 0.08 + i) * 0.25;

                    if (d.y < top - 6) {

                        // Impurity that made it all the way through leaves along the clean pipe.
                        gas.push({ d: 0, imp: true, metal: d.metal });
                        dots.splice(i, 1);
                        continue;
                    }
                }

                ctx.fillStyle = d.metal ? "#e08a3c" : "#c070e0";
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.out ? 2 : 2.4, 0, Math.PI * 2);
                ctx.fill();
            }

            // The clean gas pipe from the top of the column to the reactor.
            ctx.strokeStyle = "#7d879f";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx + cw / 2, top - 12);
            ctx.lineTo(cx + cw / 2, 14);
            ctx.lineTo(330, 14);
            ctx.lineTo(330, 70);
            ctx.stroke();

            text(ctx, n + " distillation stage" + (n === 1 ? "" : "s"), cx + cw / 2, LH - 14, "#cbd2e3", 11, "center");

            gasT += dt;

            while (gasT > 0.08) { gasT -= 0.08; gas.push({ d: 0, imp: false }); }

            // Clean gas (and any leftover impurity) travels along the pipe: up, across, then down into the reactor.
            const px0 = cx + cw / 2;
            const lenA = top - 6 - 14;
            const lenB = 330 - px0;

            for (let i = gas.length - 1; i >= 0; i--) {

                const q = gas[i];

                q.d = (q.d || 0) + dt * 110;

                let gx;
                let gy;

                if (q.d < lenA) { gx = px0; gy = top - 6 - q.d; }
                else if (q.d < lenA + lenB) { gx = px0 + (q.d - lenA); gy = 14; }
                else { gx = 330; gy = 14 + (q.d - lenA - lenB); }

                if (gy > 150) { gas.splice(i, 1); continue; }

                ctx.fillStyle = q.imp ? (q.metal ? "#e08a3c" : "#c070e0") : "rgba(200,225,255,0.75)";
                ctx.beginPath();
                ctx.arc(gx, gy, q.imp ? 2.6 : 1.8, 0, Math.PI * 2);
                ctx.fill();
            }

            // The Siemens reactor: a glass bell jar with glowing silicon rods.
            const bx = 300;
            const by = LH - 30;
            const rodU = clamp((p.rodT - 900) / 300, 0, 1);

            ctx.strokeStyle = "rgba(190,215,255,0.55)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(bx + 30, by);
            ctx.lineTo(bx + 30, 120);
            ctx.quadraticCurveTo(bx + 30, 56, bx + 130, 56);
            ctx.quadraticCurveTo(bx + 230, 56, bx + 230, 120);
            ctx.lineTo(bx + 230, by);
            ctx.stroke();

            ctx.fillStyle = "#4a5266";
            ctx.fillRect(bx + 14, by, 232, 12);

            // Rod growth cycles faster with a higher deposition rate.
            const dur = 16 * 0.7 / p.rate;
            const phase = (t % dur) / dur;
            const r0 = 3;
            const rad = lerp(r0, 22, phase);
            const rough = 1 - R.poly.q;

            const rods = [bx + 90, bx + 170];

            rods.forEach(function (rx) {

                ctx.fillStyle = heat(0.35 + 0.65 * rodU);

                ctx.fillRect(rx - rad, 90, rad * 2, by - 90);

                // Popcorn lumps along the rod when it grows too fast or hot.
                if (rough > 0.15) {

                    ctx.fillStyle = heat(0.25 + 0.5 * rodU);

                    bumps.forEach(function (b, i) {

                        const yy = 96 + (i / bumps.length) * (by - 100);
                        const side = i % 2 ? 1 : -1;

                        ctx.beginPath();
                        ctx.arc(rx + side * (rad + 1), yy, 1.5 + 4.5 * rough * b.s * phase, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }
            });

            ctx.fillStyle = heat(0.35 + 0.65 * rodU);
            ctx.fillRect(rods[0] - rad, 90 - rad, rods[1] - rods[0] + rad * 2, rad * 2);

            // Glow around the hot rods.
            const gl = ctx.createRadialGradient(bx + 130, 160, 10, bx + 130, 160, 120);

            gl.addColorStop(0, "rgba(255,160,60," + (0.18 * rodU) + ")");
            gl.addColorStop(1, "rgba(255,160,60,0)");
            ctx.fillStyle = gl;
            ctx.fillRect(bx + 30, 60, 200, by - 60);

            // Gas atoms deposit on the rods.
            for (let k = 0; k < 16; k++) {

                const ang = t * 1.2 + k * 0.8;
                const tx = rods[k % 2] + Math.cos(ang) * (rad + 14 + (t * 20 + k * 9) % 20);

                ctx.fillStyle = "rgba(200,225,255,0.6)";
                ctx.beginPath();
                ctx.arc(tx, 100 + ((t * 30 + k * 40) % (by - 120)), 1.6, 0, Math.PI * 2);
                ctx.fill();
            }

            if (p.rodT > 1150) {

                ctx.fillStyle = "rgba(180,180,190,0.18)";

                for (let k = 0; k < 24; k++) { ctx.fillRect(bx + 40 + hash(k) * 180, 70 + ((t * 25 + k * 13) % (by - 90)), 2, 2); }
            }

            text(ctx, "rod: " + (rad * 2 * 3).toFixed(0) + " mm across", bx + 130, 40, "#cbd2e3", 11, "center");
            text(ctx, Math.round(p.rodT) + " °C", bx + 130, by + 28, "rgb(255," + Math.round(150 + 90 * rodU) + ",90)", 12, "center");

            if (rough > 0.3) { text(ctx, "rough 'popcorn' growth traps dirt", bx + 130, 24, "#e0a070", 11, "center"); }

            // Impurity readout.
            const pp = R.poly.ppb;

            text(ctx, "now in the silicon: iron " + (pp.fe >= 10 ? Math.round(pp.fe) : pp.fe.toFixed(2)) + " ppb, boron " + (pp.b >= 10 ? Math.round(pp.b) : pp.b.toFixed(2)) + " ppb", 8, LH - 2, "#9fb2c8", 9);
        }

        canvas.addEventListener("mousemove", function (e) {

            const m = lp.toLogical(e);
            const g = get();
            const n = g.c.poly.stages;
            const top = 40;
            const bot = lp.LH - 40;
            const tray = (bot - top) / (n + 0.5);

            if (m.x > 70 && m.x < 170 && m.y > top && m.y < bot) {

                const k = clamp(Math.round((bot - m.y) / tray), 0, n);
                const fc = factors(g.R);
                const mg = g.R.mg;
                const fe = Math.max(mg.ppm.fe * 1000 / Math.pow(fc.fMetal, k), 0.05);
                const b = Math.max(mg.ppm.b * 1000 / Math.pow(fc.fDop, k), 0.02);

                onInfo(k === 0 ? "The feed gas, straight from the furnace silicon: iron " + Math.round(mg.ppm.fe * 1000) + " ppb, boron " + Math.round(mg.ppm.b * 1000) + " ppb." :
                    "After stage " + k + ": iron " + (fe >= 10 ? Math.round(fe) : fe.toFixed(2)) + " ppb, boron " + (b >= 10 ? Math.round(b) : b.toFixed(2)) + " ppb. Each stage removes about " + Math.round((1 - 1 / fc.fMetal) * 100) + "% of the metals but only " + Math.round((1 - 1 / fc.fDop) * 100) + "% of the boron.");

            } else if (m.x > 330) { onInfo("The glass bell jar of a Siemens reactor. Electric current heats the thin silicon rods, and the gas deposits pure silicon on them."); }
            else { onInfo("Hover over the column to see how clean the gas is after each stage."); }
        });

        return { stop: lp.stop };
    }


    root.ChipAnim = { sandTray: sandTray, furnace: furnace, purify: purify, stopAll: stopAll, makeLoop: makeLoop, util: { hash: hash, clamp: clamp, lerp: lerp, mix: mix, heat: heat, ease: ease, text: text, rrect: rrect, LW: LW, reduce: reduce, register: function (api) { all.push(api); } } };

}(typeof window !== "undefined" ? window : globalThis));
