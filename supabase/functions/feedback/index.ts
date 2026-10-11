// Fab Path feedback: the only way a message reaches the feedback table.
//
// The browser used to insert straight into the table with the public key.
// That let anyone flood it or claim to be another user. Now the page calls
// this function, which checks the origin, rate limits by network address,
// validates every field, and fills in user_id from the verified login
// (never from the request body).
//
// Deploy with:  supabase functions deploy feedback --no-verify-jwt

import {
    allow, clean, clientIp, originAllowed, preflight, readJson, reply,
    serviceClient, sha256, userFor
} from "../_shared/guard.ts";

const CATEGORIES = ["bug", "feature", "content", "other"];
const PER_IP_HOUR = 5;
const PER_IP_DAY = 15;
const GLOBAL_DAILY = 500;
const MAX_BODY_BYTES = 8000;

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

Deno.serve(async (req) => {

    if (req.method === "OPTIONS") {
        return preflight(req);
    }

    if (!originAllowed(req)) {
        return reply(req, 403, { error: "Not allowed." });
    }

    if (req.method !== "POST") {
        return reply(req, 405, { error: "Use POST." });
    }

    const admin = serviceClient();
    const ip = clientIp(req);
    const day = new Date().toISOString().slice(0, 10);

    if (!(await allow(admin, `feedback:ip:hour:${ip}`, PER_IP_HOUR, 3600)) ||
        !(await allow(admin, `feedback:ip:day:${ip}`, PER_IP_DAY, 86400))) {

        return reply(req, 429, { error: "You've sent a lot of feedback. Please try again later." });
    }

    const body = await readJson(req, MAX_BODY_BYTES);

    if (!body) {
        return reply(req, 400, { error: "That could not be read. Try again." });
    }

    // A hidden form field that people never fill in but simple bots do.
    // Pretend it worked so the bot learns nothing.
    if (clean(body.website, 200)) {
        return reply(req, 200, { ok: true });
    }

    const category = String(body.category ?? "");
    const message = clean(body.message, 4000);
    const email = clean(body.email, 254);

    if (!CATEGORIES.includes(category) || message.length < 1) {
        return reply(req, 400, { error: "Please pick a category and write a message." });
    }

    if (email && !EMAIL.test(email)) {
        return reply(req, 400, { error: "That email doesn't look right." });
    }

    if (!(await allow(admin, `feedback:global:${day}`, GLOBAL_DAILY, 86400))) {
        return reply(req, 503, { error: "Feedback is paused for today. Please try again tomorrow." });
    }

    // Signed-in senders are attributed from the verified token only.
    const user = await userFor(admin, req);

    const { error } = await admin.from("feedback").insert({
        category,
        message,
        email: email || null,
        user_id: user ? user.id : null,
        ip_hash: await sha256(`${Deno.env.get("IP_HASH_SALT") ?? ""}|${ip}`)
    });

    if (error) {

        console.error("feedback insert failed");

        return reply(req, 500, { error: "Could not send that. Try again in a moment." });
    }

    return reply(req, 200, { ok: true });
});
