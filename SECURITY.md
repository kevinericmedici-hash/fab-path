# Security policy

## Reporting a problem

If you find a security problem on fab-path.com or in the Fab Path app, please
report it privately through GitHub:
<https://github.com/kevinericmedici-hash/fab-path/security/advisories/new>

Please don't open a public issue for a vulnerability, and don't access other
people's data. We aim to reply within a few days.

## How the site is protected (short version)

- **No secrets in the site.** The only key in the repository is Supabase's
  *publishable* key, which is public by design and can only do what row-level
  security allows. Every real secret (the Claude API key, the service-role
  key, the CAPTCHA secret) lives in Supabase and is read only by Edge
  Functions.
- **Strict Content-Security-Policy** on every page (inline scripts allowed only
  by hash), plus a referrer policy and a clickjacking guard.
- **Row-level security** on every table, rate limiting on every Edge Function,
  fixed error messages, and a sign-in speed bump.

The full audit, with an OWASP Top 10 and CWE Top 25 checklist and the setup
steps that cannot live in code, is kept privately by the maintainer.

## For maintainers

- After editing any inline `<script>` in an HTML page, run
  `node tools/apply-security-meta.mjs` (CI runs it with `--check`).
- Never commit a `.env` file, a service-role key, or an API key. CI scans for
  them (`.gitleaks.toml`).
- Edge Functions: `supabase functions deploy tutor --no-verify-jwt` and
  `supabase functions deploy feedback --no-verify-jwt`.
