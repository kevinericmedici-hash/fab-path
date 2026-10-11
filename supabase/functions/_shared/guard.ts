// Shared safety helpers for every Fab Path Edge Function.
//
//   * CORS: only the real site and the mobile app may call from a browser.
//   * Rate limiting: one atomic counter per key, in Postgres (see
//     supabase-security.sql), so limits hold across every function instance.
//   * Safe replies: JSON only, never cached, never a stack trace.
//   * Bounded input: the body is capped before it is parsed.
//
// Secrets (the Claude key, the service-role key) are read from Edge Function
// secrets with Deno.env. They are never sent to the browser and never appear
// in any file in this repository.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_ORIGINS = [
    "https://fab-path.com",
    "https://www.fab-path.com",
    "capacitor://localhost",   // iOS app
    "https://localhost"        // Android app
];

// For local testing set the secret ALLOWED_ORIGINS to a comma-separated list
// that includes http://localhost:5737.
function allowedOrigins(): string[] {

    const env = Deno.env.get("ALLOWED_ORIGINS");

    return env
        ? env.split(",").map((s) => s.trim()).filter(Boolean)
        : DEFAULT_ORIGINS;
}

export function originAllowed(req: Request): boolean {

    const origin = req.headers.get("Origin");

    // Calls with no Origin (curl, server to server) are not a browser
    // attack vector; they are still rate limited and authenticated below.
    return !origin || allowedOrigins().includes(origin);
}

function corsHeaders(req: Request): Record<string, string> {

    const origin = req.headers.get("Origin");
    const h: Record<string, string> = {
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "600",
        "Vary": "Origin"
    };

    if (origin && allowedOrigins().includes(origin)) {

        h["Access-Control-Allow-Origin"] = origin;
    }

    return h;
}

export function reply(req: Request, status: number, body: Record<string, unknown>): Response {

    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders(req),
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
        }
    });
}

export function preflight(req: Request): Response {

    return new Response(null, { status: originAllowed(req) ? 204 : 403, headers: corsHeaders(req) });
}

export function serviceClient() {

    return createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    );
}

export function clientIp(req: Request): string {

    const raw =
        req.headers.get("cf-connecting-ip") ||
        (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "";

    return /^[0-9a-fA-F:.]{3,45}$/.test(raw) ? raw : "unknown";
}

export async function sha256(text: string): Promise<string> {

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));

    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// true = this call is allowed. Fails closed: if the limiter cannot be
// reached the call is refused rather than waved through.
export async function allow(
    admin: ReturnType<typeof serviceClient>,
    key: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {

    const { data, error } = await admin.rpc("rate_limit_hit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds
    });

    if (error) {

        console.error("rate limiter unavailable");

        return false;
    }

    return data === true;
}

// Reads at most maxBytes of JSON; returns null for anything malformed.
export async function readJson(req: Request, maxBytes: number): Promise<any | null> {

    const declared = Number(req.headers.get("content-length") || 0);

    if (declared > maxBytes) { return null; }

    const reader = req.body?.getReader();

    if (!reader) { return null; }

    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {

        const { done, value } = await reader.read();

        if (done) { break; }

        total += value.length;

        if (total > maxBytes) { await reader.cancel(); return null; }

        chunks.push(value);
    }

    try {

        const all = new Uint8Array(total);
        let off = 0;

        for (const c of chunks) { all.set(c, off); off += c.length; }

        const parsed = JSON.parse(new TextDecoder().decode(all));

        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;

    } catch {

        return null;
    }
}

// Removes control characters (keeps newlines and tabs) and trims.
export function clean(text: unknown, max: number): string {

    return String(text ?? "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .trim()
        .slice(0, max);
}

// The signed-in user for this request, or null. The token is checked by
// Supabase Auth itself, never decoded by hand.
export async function userFor(admin: ReturnType<typeof serviceClient>, req: Request) {

    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");

    // The publishable key is not a user token.
    if (!token || token.startsWith("sb_")) { return null; }

    const { data } = await admin.auth.getUser(token);

    return data?.user ?? null;
}
