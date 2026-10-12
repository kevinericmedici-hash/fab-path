/* ========================================
   SUPERCAPACITOR THESIS LAB: CHARTS AND DRAWINGS

   Small canvas helpers: labelled line charts, bar charts with
   error bars, the photomask preview and a simulated micrograph
   of the patterned resist. Lives on window.SCLabDraw.
======================================== */

(function () {

    "use strict";

    const THEMES = {

        dark: {
            bg: "#10172b", fg: "#f5f7ff", muted: "#aab3cf",
            grid: "rgba(255,255,255,0.09)", axis: "rgba(255,255,255,0.35)"
        },

        light: {
            bg: "#ffffff", fg: "#161a26", muted: "#555d73",
            grid: "rgba(0,0,0,0.10)", axis: "rgba(0,0,0,0.55)"
        }
    };

    const PALETTE = [
        "#54e0c7", "#ffb86b", "#7aa2ff", "#ff7a90",
        "#c792ff", "#9be15d", "#ffd84d", "#4dd0ff"
    ];

    const PALETTE_LIGHT = [
        "#0f9d86", "#d97706", "#2f5bd8", "#d6264a",
        "#7c3aed", "#4d9a14", "#b58900", "#0e86b4"
    ];


    function color(index, theme) {

        const list = theme === "light" ? PALETTE_LIGHT : PALETTE;

        return list[index % list.length];
    }


    function setup(canvas, width, height) {

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = "100%";
        canvas.style.maxWidth = width + "px";
        canvas.style.aspectRatio = width + " / " + height;
        canvas.style.height = "auto";

        const ctx = canvas.getContext("2d");

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        return ctx;
    }


    function niceTicks(lo, hi, count) {

        if (!(hi > lo)) { hi = lo + 1; }

        const raw = (hi - lo) / count;
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const norm = raw / mag;

        const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;

        const out = [];

        for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) {
            out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
        }

        return { ticks: out, step: step };
    }


    function fmt(v, step) {

        if (v === 0) { return "0"; }

        const a = Math.abs(v);

        if (a >= 10000 || a < 0.01) {

            const e = v.toExponential(0).replace("e+", "e").replace("e-0", "e-");

            return e;
        }

        const d = step < 1 ? Math.min(3, Math.ceil(-Math.log10(step))) : 0;

        return v.toFixed(d);
    }


    // Tick labels on a log axis: 0.001, 0.01, 0.1, 1, 10, 100, 1e4.
    function fmtLog(v) {

        if (v >= 10000) { return v.toExponential(0).replace("e+", "e"); }
        if (v >= 1) { return String(Math.round(v)); }
        if (v >= 0.001) { return String(parseFloat(v.toFixed(3))); }

        return v.toExponential(0).replace("e-0", "e-");
    }


    function logTicks(lo, hi) {

        const out = [];

        for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
            out.push(Math.pow(10, e));
        }

        return out;
    }


    /*
        cfg: {
            width, height, theme, title, xLabel, yLabel,
            xLog, yLog, equal, xMin, xMax, yMin, yMax,
            series: [{ label, color, x[], y[], width, alpha, dash, dots }]
        }
    */
    function line(canvas, cfg) {

        const W = cfg.width || 560;
        const H = cfg.height || 340;
        const th = THEMES[cfg.theme || "dark"];

        const ctx = setup(canvas, W, H);

        ctx.fillStyle = th.bg;
        ctx.fillRect(0, 0, W, H);

        const hasLegend = cfg.series.filter(function (s) { return s.label; }).length > 1;

        const padL = 64;
        const padR = 16;
        const padT = cfg.title ? 34 : 14;
        const padB = 48 + (hasLegend ? 22 : 0);

        const pw = W - padL - padR;
        const ph = H - padT - padB;

        let xs = [];
        let ys = [];

        cfg.series.forEach(function (s) {

            s.x.forEach(function (v, k) {

                if (isFinite(v) && isFinite(s.y[k]) && (!cfg.xLog || v > 0) && (!cfg.yLog || s.y[k] > 0)) {
                    xs.push(v);
                    ys.push(s.y[k]);
                }
            });
        });

        if (!xs.length) {

            ctx.fillStyle = th.muted;
            ctx.font = "14px Inter, Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("No data yet", W / 2, H / 2);

            return;
        }

        let x0 = cfg.xMin !== undefined ? cfg.xMin : Math.min.apply(null, xs);
        let x1 = cfg.xMax !== undefined ? cfg.xMax : Math.max.apply(null, xs);
        let y0 = cfg.yMin !== undefined ? cfg.yMin : Math.min.apply(null, ys);
        let y1 = cfg.yMax !== undefined ? cfg.yMax : Math.max.apply(null, ys);

        if (cfg.yMin === undefined && !cfg.yLog) {

            const span = (y1 - y0) || Math.abs(y1) || 1;

            y0 -= span * 0.06;
            y1 += span * 0.06;
        }

        if (cfg.xLog) { x0 = Math.pow(10, Math.floor(Math.log10(x0))); x1 = Math.pow(10, Math.ceil(Math.log10(x1))); }
        if (cfg.yLog) { y0 = Math.pow(10, Math.floor(Math.log10(y0))); y1 = Math.pow(10, Math.ceil(Math.log10(y1))); }

        if (x1 === x0) { x1 = x0 + 1; }
        if (y1 === y0) { y1 = y0 + 1; }

        if (cfg.equal && cfg.xMax !== undefined && cfg.yMax === undefined) {

            // Zoomed view: the y range follows the x range, so the long capacitive tail is clipped.
            y1 = y0 + (x1 - x0) * ph / pw;
        }

        if (cfg.equal) {

            const sx = (x1 - x0) / pw;
            const sy = (y1 - y0) / ph;
            const sc = Math.max(sx, sy);

            x1 = x0 + sc * pw;
            y1 = y0 + sc * ph;
        }

        const tx = function (v) {

            return padL + (cfg.xLog ?
                (Math.log10(v) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0)) :
                (v - x0) / (x1 - x0)) * pw;
        };

        const ty = function (v) {

            return padT + ph - (cfg.yLog ?
                (Math.log10(v) - Math.log10(y0)) / (Math.log10(y1) - Math.log10(y0)) :
                (v - y0) / (y1 - y0)) * ph;
        };

        // Grid and tick labels.
        ctx.font = "11px Inter, Arial, sans-serif";
        ctx.lineWidth = 1;

        const xt = cfg.xLog ? { ticks: logTicks(x0, x1), step: 1 } : niceTicks(x0, x1, 6);
        const yt = cfg.yLog ? { ticks: logTicks(y0, y1), step: 1 } : niceTicks(y0, y1, 6);

        ctx.textAlign = "center";

        xt.ticks.forEach(function (v) {

            if (v < x0 - 1e-12 || v > x1 + 1e-12) { return; }

            const px = tx(v);

            ctx.strokeStyle = th.grid;
            ctx.beginPath();
            ctx.moveTo(px, padT);
            ctx.lineTo(px, padT + ph);
            ctx.stroke();

            ctx.fillStyle = th.muted;
            ctx.fillText(cfg.xLog ? fmtLog(v) : fmt(v, xt.step), px, padT + ph + 15);
        });

        ctx.textAlign = "right";

        yt.ticks.forEach(function (v) {

            if (v < y0 - 1e-12 || v > y1 + 1e-12) { return; }

            const py = ty(v);

            ctx.strokeStyle = th.grid;
            ctx.beginPath();
            ctx.moveTo(padL, py);
            ctx.lineTo(padL + pw, py);
            ctx.stroke();

            ctx.fillStyle = th.muted;
            ctx.fillText(cfg.yLog ? fmtLog(v) : fmt(v, yt.step), padL - 7, py + 4);
        });

        ctx.strokeStyle = th.axis;
        ctx.strokeRect(padL, padT, pw, ph);

        // Axis titles. The y title is rotated.
        ctx.fillStyle = th.fg;
        ctx.font = "12px Inter, Arial, sans-serif";
        ctx.textAlign = "center";

        if (cfg.xLabel) { ctx.fillText(cfg.xLabel, padL + pw / 2, padT + ph + 36); }

        if (cfg.yLabel) {

            ctx.save();
            ctx.translate(14, padT + ph / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(cfg.yLabel, 0, 0);
            ctx.restore();
        }

        if (cfg.title) {

            ctx.font = "600 13px Inter, Arial, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(cfg.title, padL, 20);
        }

        // Data.
        ctx.save();
        ctx.beginPath();
        ctx.rect(padL, padT, pw, ph);
        ctx.clip();

        cfg.series.forEach(function (s) {

            ctx.globalAlpha = s.alpha === undefined ? 1 : s.alpha;
            ctx.strokeStyle = s.color;
            ctx.fillStyle = s.color;
            ctx.lineWidth = s.width || 2;
            ctx.setLineDash(s.dash || []);
            ctx.lineJoin = "round";

            if (!s.dotsOnly) {

                ctx.beginPath();

                let pen = false;

                s.x.forEach(function (v, k) {

                    const yv = s.y[k];

                    if (!isFinite(v) || !isFinite(yv) || (cfg.xLog && v <= 0) || (cfg.yLog && yv <= 0)) {
                        pen = false;
                        return;
                    }

                    if (pen) { ctx.lineTo(tx(v), ty(yv)); } else { ctx.moveTo(tx(v), ty(yv)); pen = true; }
                });

                ctx.stroke();
            }

            if (s.dots || s.dotsOnly) {

                ctx.setLineDash([]);

                s.x.forEach(function (v, k) {

                    const yv = s.y[k];

                    if (!isFinite(v) || !isFinite(yv) || (cfg.xLog && v <= 0) || (cfg.yLog && yv <= 0)) { return; }

                    ctx.beginPath();
                    ctx.arc(tx(v), ty(yv), 3.2, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        });

        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);

        // Legend.
        if (hasLegend) {

            let lx = padL;
            const ly = H - 14;

            ctx.font = "11px Inter, Arial, sans-serif";
            ctx.textAlign = "left";

            cfg.series.forEach(function (s) {

                if (!s.label) { return; }

                const tw = ctx.measureText(s.label).width;

                if (lx + tw + 28 > W - 6) { return; }

                ctx.fillStyle = s.color;
                ctx.fillRect(lx, ly - 8, 14, 3);

                ctx.fillStyle = th.fg;
                ctx.fillText(s.label, lx + 19, ly - 3);

                lx += tw + 34;
            });
        }
    }


    /*
        cfg: { width, height, theme, title, yLabel,
               bars: [{ label, value, error, color }] }
    */
    function bars(canvas, cfg) {

        const W = cfg.width || 560;
        const H = cfg.height || 320;
        const th = THEMES[cfg.theme || "dark"];

        const ctx = setup(canvas, W, H);

        ctx.fillStyle = th.bg;
        ctx.fillRect(0, 0, W, H);

        const padL = 64;
        const padR = 16;
        const padT = cfg.title ? 34 : 14;
        const padB = 44;

        const pw = W - padL - padR;
        const ph = H - padT - padB;

        const items = cfg.bars.filter(function (b) { return isFinite(b.value); });

        if (!items.length) {

            ctx.fillStyle = th.muted;
            ctx.font = "14px Inter, Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("No data yet", W / 2, H / 2);

            return;
        }

        let top = Math.max.apply(null, items.map(function (b) { return b.value + (b.error || 0); }));

        if (top <= 0) { top = 1; }

        const yt0 = niceTicks(0, top * 1.08, 5);
        const yMax = Math.ceil(top * 1.08 / yt0.step - 1e-9) * yt0.step || top;

        const yt = { step: yt0.step, ticks: [] };

        for (let v = 0; v <= yMax + yt0.step * 1e-9; v += yt0.step) { yt.ticks.push(v); }

        const ty = function (v) { return padT + ph - (v / yMax) * ph; };

        ctx.font = "11px Inter, Arial, sans-serif";
        ctx.textAlign = "right";

        yt.ticks.forEach(function (v) {

            const py = ty(v);

            ctx.strokeStyle = th.grid;
            ctx.beginPath();
            ctx.moveTo(padL, py);
            ctx.lineTo(padL + pw, py);
            ctx.stroke();

            ctx.fillStyle = th.muted;
            ctx.fillText(fmt(v, yt.step), padL - 7, py + 4);
        });

        ctx.strokeStyle = th.axis;
        ctx.strokeRect(padL, padT, pw, ph);

        const slot = pw / items.length;
        const bw = Math.min(64, slot * 0.6);

        items.forEach(function (b, k) {

            const cx = padL + slot * (k + 0.5);
            const y = ty(b.value);

            ctx.fillStyle = b.color;
            ctx.fillRect(cx - bw / 2, y, bw, padT + ph - y);

            if (b.error) {

                const a = ty(b.value - b.error);
                const c = ty(b.value + b.error);

                ctx.strokeStyle = th.fg;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx, a);
                ctx.lineTo(cx, c);
                ctx.moveTo(cx - 5, a);
                ctx.lineTo(cx + 5, a);
                ctx.moveTo(cx - 5, c);
                ctx.lineTo(cx + 5, c);
                ctx.stroke();
            }

            ctx.fillStyle = th.fg;
            ctx.textAlign = "center";
            ctx.fillText(b.label, cx, padT + ph + 16);
        });

        ctx.fillStyle = th.fg;
        ctx.font = "12px Inter, Arial, sans-serif";
        ctx.textAlign = "center";

        if (cfg.yLabel) {

            ctx.save();
            ctx.translate(14, padT + ph / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(cfg.yLabel, 0, 0);
            ctx.restore();
        }

        if (cfg.title) {

            ctx.font = "600 13px Inter, Arial, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(cfg.title, padL, 20);
        }
    }


    /* ------------------------------------------------
       PHOTOMASK PREVIEW
       dark-field: opaque background, clear electrodes.
       clear-field: clear background, opaque electrodes.
    ------------------------------------------------ */

    function layout(mask, canvasW, canvasH, pad) {

        const patW = mask.N * mask.w + (mask.N - 1) * mask.g;           // um
        const patH = mask.L * 1000;                                      // um

        const busH = Math.max(mask.w * 1.5, patH * 0.07);
        const totalH = patH + 2 * busH + 2 * mask.g;

        const sc = Math.min((canvasW - 2 * pad) / patW, (canvasH - 2 * pad) / totalH);

        return {
            sc: sc, patW: patW, patH: patH, busH: busH, totalH: totalH,
            x0: (canvasW - patW * sc) / 2,
            y0: (canvasH - totalH * sc) / 2
        };
    }


    // Returns the list of rectangles (um) for one electrode pattern.
    function rects(mask, widthOverride, gapOverride) {

        const w = widthOverride || mask.w;
        const g = gapOverride === undefined ? mask.g : gapOverride;
        const pitch = mask.w + mask.g;

        const patW = mask.N * mask.w + (mask.N - 1) * mask.g;
        const patH = mask.L * 1000;
        const busH = Math.max(mask.w * 1.5, patH * 0.07);

        const out = [];

        out.push({ x: 0, y: 0, w: patW, h: busH, bus: true });
        out.push({ x: 0, y: busH + mask.g + patH, w: patW, h: busH, bus: true });

        for (let k = 0; k < mask.N; k++) {

            const cx = k * pitch + mask.w / 2;
            const top = k % 2 === 0;

            out.push({
                x: cx - w / 2,
                y: top ? busH : busH + mask.g,
                w: w,
                h: patH,
                bus: false
            });
        }

        return out;
    }


    function maskPreview(canvas, mask, theme) {

        const W = 460;
        const H = 260;

        const ctx = setup(canvas, W, H);
        const lay = layout(mask, W, H, 18);

        const dark = mask.field === "dark";

        ctx.fillStyle = dark ? "#06080f" : "#dfe8ff";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = dark ? "#dfe8ff" : "#06080f";

        rects(mask).forEach(function (r) {

            ctx.fillRect(lay.x0 + r.x * lay.sc, lay.y0 + r.y * lay.sc, Math.max(r.w * lay.sc, 0.6), r.h * lay.sc);
        });

        ctx.fillStyle = dark ? "#8892b3" : "#46507a";
        ctx.font = "11px Inter, Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(dark ? "Dark-field mask: electrodes are clear" : "Clear-field mask: electrodes are opaque", 8, H - 8);
    }


    /* ------------------------------------------------
       SIMULATED MICROGRAPH OF THE PATTERNED RESIST
    ------------------------------------------------ */

    function micrograph(canvas, mask, lit, resistTone, seed) {

        const W = 460;
        const H = 260;

        const ctx = setup(canvas, W, H);
        const lay = layout(mask, W, H - 30, 14);

        const rand = window.SCLab.rng(seed || 5);

        const q = lit.quality;

        ctx.fillStyle = "#1b2238";
        ctx.fillRect(0, 0, W, H);

        // Substrate sheen.
        const grad = ctx.createLinearGradient(0, 0, W, H);

        grad.addColorStop(0, "rgba(255,255,255,0.05)");
        grad.addColorStop(1, "rgba(0,0,0,0.12)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        const resist = resistTone === "negative" ? "#c9824a" : "#b95f7a";
        const bare = "#8da0c8";

        // Draw the resist film everywhere first.
        const px0 = lay.x0 - 10;
        const py0 = lay.y0 - 10;
        const pw = lay.patW * lay.sc + 20;
        const ph = lay.totalH * lay.sc + 20;

        const pitch = mask.w + mask.g;

        const wEff = lit.wEff;

        const drawOpening = function (r, jitter) {

            const x = lay.x0 + r.x * lay.sc;
            const y = lay.y0 + r.y * lay.sc;
            const w = r.w * lay.sc;
            const h = r.h * lay.sc;

            if (w < 0.4) { return; }

            ctx.beginPath();

            const step = Math.max(h / 24, 3);
            const j = jitter * Math.max(w, 2) * 0.5;

            ctx.moveTo(x + (rand() - 0.5) * j, y);

            for (let yy = step; yy <= h; yy += step) {
                ctx.lineTo(x + (rand() - 0.5) * j, y + yy);
            }

            for (let yy = h; yy >= 0; yy -= step) {
                ctx.lineTo(x + w + (rand() - 0.5) * j, y + yy);
            }

            ctx.closePath();
            ctx.fill();
        };

        ctx.fillStyle = resist;
        ctx.fillRect(px0, py0, pw, ph);

        if (lit.status === "lost") {

            // Almost everything washed away.
            ctx.fillStyle = bare;
            ctx.fillRect(px0, py0, pw, ph);

            ctx.fillStyle = resist;

            for (let k = 0; k < 14; k++) {

                ctx.globalAlpha = 0.35;
                ctx.fillRect(px0 + rand() * pw, py0 + rand() * ph, 3 + rand() * 6, 3 + rand() * 6);
            }

            ctx.globalAlpha = 1;
            footer(ctx, W, H, "Pattern washed away", resist);

            return;
        }

        const jitter = (1 - q) * 1.4;

        const fingers = rects(mask, wEff, lit.gEff);

        if (lit.status === "inverted") {

            // Electrodes stay as resist; the gaps get opened instead.
            ctx.fillStyle = bare;
            ctx.fillRect(px0, py0, pw, ph);

            ctx.fillStyle = resist;

            rects(mask).forEach(function (r) {

                const x = lay.x0 + r.x * lay.sc;
                const y = lay.y0 + r.y * lay.sc;

                ctx.fillRect(x, y, Math.max(r.w * lay.sc, 0.6), r.h * lay.sc);
            });

        } else {

            ctx.fillStyle = bare;

            fingers.forEach(function (r) { drawOpening(r, jitter); });
        }

        // Residue speckles in the gaps.
        if (lit.residue > 0.05) {

            ctx.fillStyle = resist;
            ctx.globalAlpha = 0.8;

            const n = Math.round(lit.residue * 260);

            for (let k = 0; k < n; k++) {

                const cx = lay.x0 + rand() * lay.patW * lay.sc;
                const cy = lay.y0 + (lay.busH + rand() * lay.patH) * lay.sc;

                ctx.beginPath();
                ctx.arc(cx, cy, 0.7 + rand() * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        }

        // Bridging between fingers.
        if (lit.bridged && lit.status === "ok") {

            ctx.fillStyle = bare;

            for (let k = 0; k < mask.N - 1; k++) {

                for (let b = 0; b < 3; b++) {

                    const cx = lay.x0 + ((k + 1) * pitch - mask.g / 2) * lay.sc;
                    const cy = lay.y0 + (lay.busH + rand() * lay.patH) * lay.sc;

                    ctx.fillRect(cx - 2.5, cy - 2, 5, 4 + rand() * 6);
                }
            }
        }

        ctx.globalAlpha = 1;

        const label =
            lit.status === "inverted" ? "Pattern is inverted" :
            q > 0.85 ? "Sharp, clean edges" :
            q > 0.6 ? "Usable, some roughness" :
            q > 0.3 ? "Poor: ragged edges" : "Failing pattern";

        footer(ctx, W, H, label, bare);
    }


    function footer(ctx, W, H, text, swatch) {

        ctx.fillStyle = "rgba(6,8,15,0.7)";
        ctx.fillRect(0, H - 24, W, 24);

        ctx.fillStyle = swatch;
        ctx.fillRect(10, H - 16, 10, 8);

        ctx.fillStyle = "#f5f7ff";
        ctx.font = "11px Inter, Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(text, 28, H - 8);
    }


    window.SCLabDraw = {

        line: line,
        bars: bars,
        maskPreview: maskPreview,
        micrograph: micrograph,
        color: color,
        THEMES: THEMES
    };

}());
