# Fab Path security audit and runbook

Audit date: 2026-10-11. Scope: the static site (HTML/JS/CSS), the sign-in code
(`account.js`), the Supabase project (database, Auth, Edge Functions), the
Capacitor mobile app, the GitHub repository and Pages deployment, and DNS.

How the system fits together: the site is static files on GitHub Pages
(`fab-path.com`). There is no server of ours in the request path. The browser
talks to Supabase directly for sign-in and progress sync, and to two Edge
Functions (`tutor`, `feedback`) for anything that needs a secret or
abuse protection.

## 1. Results at a glance

| Area | Before | Now |
|---|---|---|
| Secrets in the repo or its history | None found | None. CI scans every push (gitleaks). |
| Where the real secrets live | Anthropic key in an Edge Function secret | Same, plus the CAPTCHA secret in Supabase only. Nothing in the page. |
| XSS defence | No CSP | CSP on all 491 pages; inline scripts allowed by SHA-256 hash only |
| Feedback table | Anyone could insert any row, including a forged `user_id` | Only the `feedback` function writes, with validation, rate limits, and `user_id` from the verified login |
| API rate limiting | Tutor: 20 questions/day/user only | Per IP, per user, per day, and a site-wide ceiling, in Postgres, shared by all functions |
| CORS on Edge Functions | `*` | Allow-list: the site and the two app origins |
| Login errors | Raw server text shown (and `feedback` showed raw database errors) | Fixed sentences only; same answer whether or not an account exists |
| Password guessing | 6-character minimum, no brake | 12-character minimum, leaked-password check, escalating delays and a 15-minute pause on the device, and server-side limits + optional CAPTCHA (see section 4) |
| Session token in app backups | Copied into the app's plain-text backup; Android auto-backup on | Excluded from the backup; Android backup off |
| HTTPS | HTTP still served | Enforce HTTPS in GitHub Pages (section 4) |
| Clickjacking | Framable | `security.js` hides and breaks out of foreign frames |

## 2. OWASP Top 10 (2025) checklist

| # | Category | Finding and fix |
|---|---|---|
| A01 | Broken Access Control | All tables have row-level security. `progress`: own row only. `tutor_usage`, `rate_limits`: no API access at all. `feedback`: no direct API access (function only). `delete_my_account()` uses `auth.uid()` and now needs a sign-in from the last 10 minutes. No IDOR: every identifier comes from the verified token, never from the request. |
| A02 | Security Misconfiguration | CSP, referrer policy and framing guard added. CORS locked down. `.nojekyll`, `security.txt`, `SECURITY.md`. Android backup and cleartext traffic off. Enforce HTTPS is on (HTTP now redirects with a 301). GitHub Pages cannot send HSTS or `frame-ancestors` headers, so put Cloudflare in front if you want those (section 4.4). |
| A03 | Software Supply Chain Failures | No third-party scripts, fonts or CDNs: three.js is vendored (`three.module.min.js`, r160, MIT). `npm audit` shows 0 vulnerabilities in the app. Dependabot and a weekly audit in CI. Actions use pinned major versions. |
| A04 | Cryptographic Failures | TLS everywhere (Supabase, GitHub Pages). Passwords are hashed by Supabase Auth, never handled by us beyond sending them over TLS. Tokens are no longer written to the app backup. Nothing sensitive is in a URL. |
| A05 | Injection | SQL: no string-built SQL anywhere. The browser uses PostgREST with parameters; the two SQL functions take typed arguments and use `set search_path`. XSS: every dynamic `innerHTML` is built from constants; user text and model replies use `textContent`; no `eval`, no `document.write`, no URL parameters reach the page; CSP blocks inline injection. |
| A06 | Insecure Design | Abuse cases covered: free LLM use (daily, per-minute and site-wide caps), feedback flooding, account farming (per-IP limits), password guessing, enumeration. |
| A07 | Authentication Failures | See section 3. |
| A08 | Software or Data Integrity Failures | Cloud progress is treated as untrusted: key allow-list, string-only values, size caps, no prototype keys. CSP hashes pin inline code. |
| A09 | Logging and Alerting Failures | Edge Functions log only status codes (never content, tokens or emails). Review the function logs and Supabase Auth logs weekly; turn on Supabase's email alerts. |
| A10 | Mishandling of Exceptional Conditions | The rate limiter fails closed. Network and server errors map to one generic sentence. No stack traces or database messages reach a user. |

## 3. Login design (what a person sees, and what it does for security)

- **Passwordless first.** The one-time email code needs no password to guess or
  to leak. Passwords remain optional.
- **One calm message for every failure.** "That email or password didn't work."
  never says which part was wrong; sending a code always looks the same; a
  sign-up for an existing address looks like a new one.
- **Speed bump.** After a wrong password the next try waits 1, 2, 4, then 8
  seconds; five wrong tries pause that email for 15 minutes. Wrong codes work
  the same way. Honest typos cost seconds, scripts cost minutes. (This runs in
  the browser, so the real limits are the server ones below.)
- **Strong passwords.** At least 12 characters, no common words, not your email
  name, and checked against the Have I Been Pwned breach list (only the first 5
  characters of a hash leave the device).
- **No lost work.** Buttons disable while a request runs, Enter submits, Escape
  closes, typed secrets are cleared when the box closes, password managers work
  (real forms, correct `autocomplete`), and a "Show password" link helps on
  phones.
- **Sign out really signs out:** the token is revoked on the server, not just
  forgotten.
- **Deleting an account needs a recent sign-in.**

## 4. Things only you can switch on (accounts and dashboards)

These cannot be done from code. Each is a few clicks.

### 4.1 GitHub (repo `kevinericmedici-hash/fab-path`)

1. Settings, Pages: **Enforce HTTPS**. DONE 2026-10-11: `http://fab-path.com`
   now redirects to HTTPS (it used to return the page).
2. Settings, Code security: enable **Secret scanning** and **Push protection**,
   **Dependabot alerts**, and **Private vulnerability reporting** (the
   `security.txt` link uses it).
3. Settings, Branches: protect `main` (require the "Security checks" workflow).
4. Turn on two-factor authentication on your GitHub account.

### 4.2 Supabase (project `xcftpdlniahvxpxtkdaq`)

Done on 2026-10-11:

- `supabase-security.sql` ran (rate limiter, feedback and tutor_usage locked
  down, progress throttle).
- Edge Functions `tutor` and `feedback` deployed (`--no-verify-jwt`), secret
  `IP_HASH_SALT` set. Smoke test: a foreign origin gets 403, the site origin
  passes CORS, the honeypot is silently accepted, a real feedback post is stored.
- Auth, Email: **Confirm email ON**, minimum password length **12**, OTP expiry
  **600 s**, secure password change and require-current-password ON.
- Auth, Rate limits: token verifications 10 per 5 minutes per IP, sign-ups and
  sign-ins 20 per 5 minutes per IP.
- Auth, URL configuration: Site URL `https://fab-path.com`, redirect URL
  `https://fab-path.com/**` only (it was `http://localhost:3000`).

Still to do:

1. Secret `ANTHROPIC_API_KEY` (the tutor answers 503 without it): in a terminal,
   `npx supabase secrets set ANTHROPIC_API_KEY=... --project-ref xcftpdlniahvxpxtkdaq`
   or paste it in Edge Functions, Secrets. Never put it in the repo.
2. Auth, Attack Protection: turn on **CAPTCHA** with Cloudflare Turnstile
   (free). Create the widget in Cloudflare, paste the **secret** into Supabase
   only, then put the **site key** in `supabase-config.js` as `captchaSiteKey`.
3. "Prevent use of leaked passwords" needs the Pro plan. Until then the
   browser checks the Have I Been Pwned list itself.
4. Turn on two-factor authentication for your Supabase account.

### 4.3 Domain (DNS at Squarespace Domains, nameservers `nsb1-4.squarespacedns.com`)

Done on 2026-10-11 (verified with public DNS lookups): the four GitHub Pages
`A` records and the `www` CNAME were already right, SPF says "no mail", and
DMARC is `p=reject`. Added: four `AAAA` records (`2606:50c0:8000` to `8003::153`),
`CAA 0 issue "letsencrypt.org"` and `CAA 0 issuewild ";"`. DNSSEC is already
active (a DS record is published and validates) and the domain lock is on.

Not possible at Squarespace: a null `MX` record (the form rejects `.`). It is
not needed, because SPF `-all` and DMARC `p=reject` already say the domain
sends no mail.

Still yours to do: turn on two-factor authentication on the Squarespace
account (Account Settings, Security) and keep auto-renew on.

### 4.4 Optional: Cloudflare in front (recommended later)

GitHub Pages cannot send HSTS, `frame-ancestors`, `X-Content-Type-Options`
or `Permissions-Policy` headers, and cannot rate limit. Putting the domain on
Cloudflare's free plan (change the nameservers at Squarespace) adds those
headers, a WAF, bot protection, DDoS cover and edge rate limiting, and the
site keeps working unchanged. Set SSL/TLS to **Full (strict)**.

## 5. CWE Top 25 (2025) checklist

| CWE | Name | Status |
|---|---|---|
| 79 | Cross-site scripting | Mitigated: no user-controlled HTML sinks; strict CSP |
| 89 | SQL injection | Not present: no dynamic SQL; typed function arguments |
| 352 | CSRF | Not applicable: bearer tokens in headers, no cookies |
| 862 | Missing authorization | Mitigated: RLS on all tables; functions check the token |
| 787, 416, 125, 120, 121, 122, 476 | Memory-safety (out-of-bounds, use-after-free, buffer overflow, null deref) | Not applicable: JavaScript and SQL only |
| 22 | Path traversal | Not applicable: no file access by user input |
| 78, 77 | OS command injection | Not applicable: nothing runs commands |
| 94 | Code injection | Mitigated: no `eval`/`new Function` on page data; CSP forbids `unsafe-eval` |
| 434 | Unrestricted file upload | Not applicable: no uploads |
| 502 | Unsafe deserialization | Low: only `JSON.parse` of size-capped data, then filtered |
| 863 | Incorrect authorization | Mitigated: policies use `auth.uid()`; the function ignores any `user_id` in a request |
| 20 | Improper input validation | Mitigated: lengths, types, categories and email format checked on the client and again in the functions and database constraints |
| 284 | Improper access control | Mitigated: see A01 |
| 200 | Sensitive information exposure | Mitigated: fixed error messages; tokens kept out of backups; no secrets in code |
| 306 | Missing authentication for a critical function | Mitigated: tutor and delete need a verified user; feedback is anonymous by design but rate limited |
| 918 | SSRF | Not applicable: functions call one fixed URL |
| 639 | Authorization bypass via user-controlled key (IDOR) | Mitigated: keys come from the token |
| 770 | Allocation of resources without limits | Mitigated: body size caps, per-IP/user/global rate limits, JSON size check, feedback length, LLM token cap |

## 6. Residual risks (honest list)

- The sign-in token lives in the browser's `localStorage`, as in most web apps.
  The CSP is what stops a script from stealing it; keeping the policy strict
  (no `unsafe-inline` for scripts) is the protection. A cookie-based session
  through a small proxy would remove this but is a larger change.
- The device-side speed bump can be bypassed by someone calling Supabase
  directly with the public key. The server limits (4.2 steps 3 to 5) are what
  actually hold, so do them.
- On the mobile app, local progress sits in app storage that a rooted or
  jailbroken device could read. It holds no passwords.
- The `style-src 'unsafe-inline'` allowance stays because the simulators inject
  styles. It cannot run script.
