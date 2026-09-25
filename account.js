/* ========================================
   FAB PATH ACCOUNTS
   Email sign-in (a one-time code, no
   password) backed by Supabase, so progress
   can follow a learner across devices.

   Off by default: everything here is inert
   until supabase-config.js has a url and an
   anonKey. Without those, the site behaves
   exactly as it did before this file existed.

   How progress moves:
   - Every localStorage key this site writes
     starts with "fabPath". Signing in loads
     the cloud copy, MERGES it with whatever
     is already on this device (see
     fabMergeProgress below), saves the result
     back to both places, and from then on
     any change to a "fabPath" key is pushed
     to the cloud a moment later.
   - Nothing here ever deletes a local key.
     Signing out just stops syncing; progress
     already on the device stays put.
======================================== */

(function () {

    const CFG =
        window.FAB_SUPABASE || {};

    const ENABLED =
        !!(CFG.url && CFG.anonKey);

    const SESSION_KEY =
        "fabPathSession";

    const LAST_SYNC_KEY =
        "fabPathLastSyncedAt";

    /* Keys the site writes that are NOT part of
       a learner's progress, so they never sync. */
    const SYNC_EXCLUDE = new Set([
        SESSION_KEY,
        LAST_SYNC_KEY
    ]);


    function isSyncedKey(key) {

        return (
            key.indexOf("fabPath") === 0 &&
            !SYNC_EXCLUDE.has(key)
        );
    }


    /* ========================================
       LOCAL SESSION
    ======================================== */

    function loadSession() {

        try {

            const raw =
                localStorage.getItem(SESSION_KEY);

            return raw ? JSON.parse(raw) : null;

        } catch (e) {

            return null;
        }
    }


    function saveSession(session) {

        try {

            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(session)
            );

        } catch (e) {}
    }


    function clearSession() {

        try {

            localStorage.removeItem(SESSION_KEY);

        } catch (e) {}
    }


    let session = ENABLED ? loadSession() : null;


    /* ========================================
       SUPABASE REST HELPERS
       Plain fetch calls, so the site doesn't
       need to load the Supabase SDK.
    ======================================== */

    function authHeaders(useAccessToken) {

        const headers = {
            "Content-Type": "application/json",
            apikey: CFG.anonKey
        };

        headers.Authorization =
            "Bearer " +
            (useAccessToken && session
                ? session.access_token
                : CFG.anonKey);

        return headers;
    }


    async function sendCode(email) {

        const res = await fetch(
            `${CFG.url}/auth/v1/otp`,
            {
                method: "POST",
                headers: authHeaders(false),
                body: JSON.stringify({
                    email: email,
                    create_user: true
                })
            }
        );

        if (!res.ok) {

            const body =
                await res.json().catch(function () {
                    return {};
                });

            throw new Error(
                body.error_description ||
                body.msg ||
                "Could not send a code. Try again in a moment."
            );
        }
    }


    async function verifyCode(email, code) {

        const res = await fetch(
            `${CFG.url}/auth/v1/verify`,
            {
                method: "POST",
                headers: authHeaders(false),
                body: JSON.stringify({
                    type: "email",
                    email: email,
                    token: code
                })
            }
        );

        const body =
            await res.json().catch(function () {
                return {};
            });

        if (!res.ok) {

            throw new Error(
                body.error_description ||
                body.msg ||
                "That code didn't work. Check it and try again."
            );
        }

        return body;
    }


    async function signUpPassword(email, password) {

        const res = await fetch(
            `${CFG.url}/auth/v1/signup`,
            {
                method: "POST",
                headers: authHeaders(false),
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const body =
            await res.json().catch(function () {
                return {};
            });

        if (!res.ok) {

            throw new Error(
                body.error_description ||
                body.msg ||
                "Could not create that account. Try again in a moment."
            );
        }

        return body;
    }


    async function signInPassword(email, password) {

        const res = await fetch(
            `${CFG.url}/auth/v1/token?grant_type=password`,
            {
                method: "POST",
                headers: authHeaders(false),
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const body =
            await res.json().catch(function () {
                return {};
            });

        if (!res.ok) {

            throw new Error(
                body.error_description ||
                body.msg ||
                "That email or password didn't work."
            );
        }

        return body;
    }


    async function refreshSession() {

        if (!session || !session.refresh_token) {

            return false;
        }

        try {

            const res = await fetch(
                `${CFG.url}/auth/v1/token?grant_type=refresh_token`,
                {
                    method: "POST",
                    headers: authHeaders(false),
                    body: JSON.stringify({
                        refresh_token: session.refresh_token
                    })
                }
            );

            if (!res.ok) {

                return false;
            }

            const body = await res.json();

            setSession(body);

            return true;

        } catch (e) {

            return false;
        }
    }


    function setSession(authResponse) {

        session = {
            access_token: authResponse.access_token,
            refresh_token: authResponse.refresh_token,
            expires_at:
                Date.now() +
                (authResponse.expires_in || 3600) * 1000,
            user: {
                id: authResponse.user.id,
                email: authResponse.user.email
            }
        };

        saveSession(session);
    }


    async function ensureFreshSession() {

        if (!session) {

            return false;
        }

        const fiveMinutes = 5 * 60 * 1000;

        if (Date.now() < session.expires_at - fiveMinutes) {

            return true;
        }

        return refreshSession();
    }


    /* ========================================
       CLOUD PROGRESS
       One row per user in the "progress" table
       (see supabase-setup.sql), a single jsonb
       column holding every "fabPath" key.
    ======================================== */

    function collectLocalProgress() {

        const data = {};

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (isSyncedKey(key)) {

                data[key] = localStorage.getItem(key);
            }
        }

        return data;
    }


    async function fetchCloudProgress() {

        const res = await fetch(
            `${CFG.url}/rest/v1/progress?select=data&user_id=eq.${session.user.id}`,
            { headers: authHeaders(true) }
        );

        if (!res.ok) {

            throw new Error("Could not load your saved progress.");
        }

        const rows = await res.json();

        return rows.length ? rows[0].data : null;
    }


    async function pushCloudProgress(data) {

        const res = await fetch(
            `${CFG.url}/rest/v1/progress`,
            {
                method: "POST",
                headers: Object.assign(
                    authHeaders(true),
                    { Prefer: "resolution=merge-duplicates" }
                ),
                body: JSON.stringify({
                    user_id: session.user.id,
                    data: data,
                    updated_at: new Date().toISOString()
                })
            }
        );

        if (res.ok) {

            try {

                localStorage.setItem(
                    LAST_SYNC_KEY,
                    Date.now().toString()
                );

            } catch (e) {}
        }

        return res.ok;
    }


    /* ========================================
       MERGE
       Runs once, right after signing in, so
       progress made on this device before
       signing in isn't lost, and progress from
       another device is picked up.
    ======================================== */

    function fabMergeProgress(local, cloud) {

        if (!cloud) {

            return local;
        }

        const merged =
            Object.assign({}, cloud, local);

        const allKeys =
            new Set(
                Object.keys(local).concat(
                    Object.keys(cloud)
                )
            );

        allKeys.forEach(function (key) {

            const a = local[key];
            const b = cloud[key];

            if (a === undefined) {

                merged[key] = b;
                return;
            }

            if (b === undefined) {

                merged[key] = a;
                return;
            }

            if (a === b) {

                merged[key] = a;
                return;
            }

            /* "...Complete" flags: true beats anything else. */

            if (/Complete$/.test(key)) {

                merged[key] =
                    a === "true" || b === "true" ? "true" : a;

                return;
            }

            /* Numeric progress (XP, streak): keep the larger one. */

            if (key === "fabPathXP" || key === "fabPathStreak") {

                const na = parseInt(a, 10) || 0;
                const nb = parseInt(b, 10) || 0;

                merged[key] = String(Math.max(na, nb));

                return;
            }

            /* The streak's date: keep whichever is more recent,
               since it decides whether the streak still counts. */

            if (key === "fabPathLastActiveDate") {

                merged[key] = a > b ? a : b;

                return;
            }

            /* Mistake-count maps: keep the larger count per question,
               so re-merging never double-counts a miss. */

            if (/Mistakes$/.test(key)) {

                try {

                    const ma = JSON.parse(a) || {};
                    const mb = JSON.parse(b) || {};
                    const out = Object.assign({}, ma);

                    Object.keys(mb).forEach(function (k) {

                        out[k] = Math.max(out[k] || 0, mb[k]);
                    });

                    merged[key] = JSON.stringify(out);

                } catch (e) {

                    merged[key] = a;
                }

                return;
            }

            /* Anything else: this device's value wins. */

            merged[key] = a;
        });

        return merged;
    }


    function applyProgress(data) {

        Object.keys(data).forEach(function (key) {

            if (isSyncedKey(key) && data[key] !== undefined) {

                rawSetItem.call(
                    localStorage,
                    key,
                    data[key]
                );
            }
        });
    }


    /* ========================================
       SYNC ON CHANGE
       localStorage.setItem is the one place
       every course script saves progress, so
       wrapping it here catches all of them
       without touching four course engines.
    ======================================== */

    const rawSetItem =
        localStorage.setItem.bind(localStorage);

    let pushTimer = null;

    function scheduleSync() {

        if (!session) {

            return;
        }

        if (pushTimer) {

            clearTimeout(pushTimer);
        }

        pushTimer = setTimeout(async function () {

            const fresh = await ensureFreshSession();

            if (!fresh) {

                return;
            }

            await pushCloudProgress(
                collectLocalProgress()
            );

        }, 1500);
    }

    localStorage.setItem = function (key, value) {

        rawSetItem(key, value);

        if (isSyncedKey(key)) {

            scheduleSync();
            renderAccountUI();
        }
    };


    /* ========================================
       PUBLIC SIGN-IN / SIGN-OUT
    ======================================== */

    const listeners = [];

    function onAccountChange(fn) {

        listeners.push(fn);
    }

    function fireAccountChange() {

        listeners.forEach(function (fn) {

            fn(session);
        });
    }


    async function afterAuth(authResponse) {

        setSession(authResponse);

        let cloud = null;

        try {

            cloud = await fetchCloudProgress();

        } catch (e) {}

        const merged =
            fabMergeProgress(
                collectLocalProgress(),
                cloud
            );

        applyProgress(merged);

        await pushCloudProgress(merged);

        fireAccountChange();
    }


    async function completeSignIn(email, code) {

        const authResponse =
            await verifyCode(email, code);

        await afterAuth(authResponse);
    }


    async function completeSignInWithPassword(email, password) {

        const authResponse =
            await signInPassword(email, password);

        await afterAuth(authResponse);
    }


    async function completeSignUpWithPassword(email, password) {

        const authResponse =
            await signUpPassword(email, password);

        if (!authResponse.access_token) {

            throw new Error(
                "We sent a confirmation link to your email. " +
                "Click it, then come back and sign in."
            );
        }

        await afterAuth(authResponse);
    }


    function signOut() {

        session = null;

        clearSession();

        fireAccountChange();
    }


    window.FabAccount = {
        enabled: ENABLED,
        getSession: function () {
            return session;
        },
        sendCode: sendCode,
        completeSignIn: completeSignIn,
        completeSignInWithPassword: completeSignInWithPassword,
        completeSignUpWithPassword: completeSignUpWithPassword,
        signOut: signOut,
        onChange: onAccountChange
    };


    /* ========================================
       TOP BAR UI
       A single button per page: "Sign in" when
       signed out, the learner's email when
       signed in. Everything else (the modal,
       the menu) is built on demand so every
       page only needs one extra element.
    ======================================== */

    function renderAccountUI() {

        const button =
            document.getElementById("fabAccountButton");

        if (!button) {

            return;
        }

        if (session) {

            button.textContent = session.user.email;
            button.classList.add("signed-in");

        } else {

            button.textContent = "Sign in";
            button.classList.remove("signed-in");
        }
    }


    function buildModal() {

        const overlay =
            document.createElement("div");

        overlay.className = "account-overlay";
        overlay.id = "fabAccountOverlay";
        overlay.hidden = true;

        overlay.innerHTML = `
            <div class="account-modal" role="dialog" aria-label="Sign in">

                <button type="button" class="account-modal-close" id="fabAccountClose">
                    ✕
                </button>

                <div class="account-step" id="fabStepAuth">

                    <h2 id="fabAuthTitle">Sign in</h2>

                    <p id="fabAuthLead">
                        Sign in to sync your progress across devices.
                    </p>

                    <input
                        type="email"
                        id="fabAuthEmailInput"
                        class="account-input"
                        placeholder="you@example.com"
                        autocomplete="email"
                    >

                    <input
                        type="password"
                        id="fabAuthPasswordInput"
                        class="account-input"
                        placeholder="Password"
                        autocomplete="current-password"
                    >

                    <button type="button" class="start-button account-submit" id="fabAuthSubmitButton">
                        Sign in
                    </button>

                    <p class="account-error" id="fabAuthError" hidden></p>

                    <button type="button" class="account-link" id="fabAuthToggleModeButton">
                        New here? Create an account
                    </button>

                    <button type="button" class="account-link" id="fabUseCodeButton">
                        Email me a one-time code instead
                    </button>

                </div>

                <div class="account-step" id="fabStepEmailCode" hidden>

                    <h2>Sign in with a code</h2>

                    <p>
                        Get a one-time code by email. No password
                        needed, and it signs you into this account
                        on any device.
                    </p>

                    <input
                        type="email"
                        id="fabEmailInput"
                        class="account-input"
                        placeholder="you@example.com"
                        autocomplete="email"
                    >

                    <button type="button" class="start-button account-submit" id="fabSendCodeButton">
                        Send code
                    </button>

                    <p class="account-error" id="fabEmailError" hidden></p>

                    <button type="button" class="account-link" id="fabUsePasswordButton">
                        Use a password instead
                    </button>

                </div>

                <div class="account-step" id="fabStepCode" hidden>

                    <h2>Check your email</h2>

                    <p>
                        Enter the code sent to
                        <strong id="fabCodeEmail"></strong>.
                    </p>

                    <input
                        type="text"
                        id="fabCodeInput"
                        class="account-input account-code-input"
                        placeholder="Code from your email"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        maxlength="12"
                    >

                    <button type="button" class="start-button account-submit" id="fabVerifyButton">
                        Sign in
                    </button>

                    <button type="button" class="account-link" id="fabBackButton">
                        Use a different email
                    </button>

                    <p class="account-error" id="fabCodeError" hidden></p>

                </div>

                <div class="account-step" id="fabStepSignedIn" hidden>

                    <h2>Signed in</h2>

                    <p id="fabSignedInEmail"></p>

                    <p class="account-hint">
                        Progress on this device is synced to your
                        account and will follow you to any device
                        you sign into.
                    </p>

                    <button type="button" class="module-nav-button secondary-button" id="fabSignOutButton">
                        Sign out
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        return overlay;
    }


    function showStep(overlay, stepId) {

        overlay
            .querySelectorAll(".account-step")
            .forEach(function (step) {

                step.hidden = step.id !== stepId;
            });
    }


    function openModal() {

        let overlay =
            document.getElementById("fabAccountOverlay");

        if (!overlay) {

            overlay = buildModal();
            wireModal(overlay);
        }

        overlay.hidden = false;

        if (session) {

            document.getElementById("fabSignedInEmail").textContent =
                session.user.email;

            showStep(overlay, "fabStepSignedIn");

        } else {

            setAuthMode(overlay, "signin");
            showStep(overlay, "fabStepAuth");

            const input =
                document.getElementById("fabAuthEmailInput");

            document.getElementById("fabAuthPasswordInput").value = "";
            showError("fabAuthError", "");

            if (input) {

                input.value = "";
                input.focus();
            }
        }
    }


    function closeModal() {

        const overlay =
            document.getElementById("fabAccountOverlay");

        if (overlay) {

            overlay.hidden = true;
        }
    }


    function showError(id, message) {

        const el = document.getElementById(id);

        if (!el) {

            return;
        }

        el.textContent = message;
        el.hidden = !message;
    }


    function setAuthMode(overlay, mode) {

        overlay.dataset.authMode = mode;

        const title =
            document.getElementById("fabAuthTitle");

        const lead =
            document.getElementById("fabAuthLead");

        const submit =
            document.getElementById("fabAuthSubmitButton");

        const toggle =
            document.getElementById("fabAuthToggleModeButton");

        const passwordInput =
            document.getElementById("fabAuthPasswordInput");

        if (mode === "signup") {

            title.textContent = "Create an account";
            lead.textContent =
                "Pick a password so progress on this device follows " +
                "you to any device you sign into.";
            submit.textContent = "Create account";
            toggle.textContent = "Already have an account? Sign in";
            passwordInput.setAttribute("autocomplete", "new-password");

        } else {

            title.textContent = "Sign in";
            lead.textContent =
                "Sign in to sync your progress across devices.";
            submit.textContent = "Sign in";
            toggle.textContent = "New here? Create an account";
            passwordInput.setAttribute("autocomplete", "current-password");
        }
    }


    function wireModal(overlay) {

        overlay.addEventListener("click", function (event) {

            if (event.target === overlay) {

                closeModal();
            }
        });

        document
            .getElementById("fabAccountClose")
            .addEventListener("click", closeModal);

        let pendingEmail = "";

        setAuthMode(overlay, "signin");

        document
            .getElementById("fabAuthToggleModeButton")
            .addEventListener("click", function () {

                showError("fabAuthError", "");

                setAuthMode(
                    overlay,
                    overlay.dataset.authMode === "signup" ?
                        "signin" : "signup"
                );
            });

        async function submitAuth() {

            const button =
                document.getElementById("fabAuthSubmitButton");

            const email =
                document.getElementById("fabAuthEmailInput").value.trim();

            const password =
                document.getElementById("fabAuthPasswordInput").value;

            const mode = overlay.dataset.authMode;

            showError("fabAuthError", "");

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                showError("fabAuthError", "Enter a valid email address.");

                return;
            }

            if (password.length < 6) {

                showError(
                    "fabAuthError",
                    "Password needs to be at least 6 characters."
                );

                return;
            }

            button.disabled = true;
            button.textContent =
                mode === "signup" ? "Creating account…" : "Signing in…";

            try {

                if (mode === "signup") {

                    await completeSignUpWithPassword(email, password);

                } else {

                    await completeSignInWithPassword(email, password);
                }

                closeModal();

            } catch (e) {

                showError("fabAuthError", e.message);

            } finally {

                button.disabled = false;
                setAuthMode(overlay, mode);
            }
        }

        document
            .getElementById("fabAuthSubmitButton")
            .addEventListener("click", submitAuth);

        document
            .getElementById("fabAuthPasswordInput")
            .addEventListener("keydown", function (event) {

                if (event.key === "Enter") {

                    submitAuth();
                }
            });

        document
            .getElementById("fabAuthEmailInput")
            .addEventListener("keydown", function (event) {

                if (event.key === "Enter") {

                    document
                        .getElementById("fabAuthPasswordInput")
                        .focus();
                }
            });

        document
            .getElementById("fabUseCodeButton")
            .addEventListener("click", function () {

                document.getElementById("fabEmailInput").value =
                    document.getElementById("fabAuthEmailInput").value;

                showError("fabAuthError", "");
                showStep(overlay, "fabStepEmailCode");
                document.getElementById("fabEmailInput").focus();
            });

        document
            .getElementById("fabUsePasswordButton")
            .addEventListener("click", function () {

                document.getElementById("fabAuthEmailInput").value =
                    document.getElementById("fabEmailInput").value;

                showError("fabEmailError", "");
                setAuthMode(overlay, "signin");
                showStep(overlay, "fabStepAuth");
                document.getElementById("fabAuthEmailInput").focus();
            });

        document
            .getElementById("fabSendCodeButton")
            .addEventListener("click", async function () {

                const button = this;
                const email =
                    document.getElementById("fabEmailInput").value.trim();

                showError("fabEmailError", "");

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                    showError(
                        "fabEmailError",
                        "Enter a valid email address."
                    );

                    return;
                }

                button.disabled = true;
                button.textContent = "Sending…";

                try {

                    await sendCode(email);

                    pendingEmail = email;

                    document.getElementById("fabCodeEmail").textContent =
                        email;

                    document.getElementById("fabCodeInput").value = "";

                    showStep(overlay, "fabStepCode");

                    document.getElementById("fabCodeInput").focus();

                } catch (e) {

                    showError("fabEmailError", e.message);

                } finally {

                    button.disabled = false;
                    button.textContent = "Send code";
                }
            });

        document
            .getElementById("fabBackButton")
            .addEventListener("click", function () {

                showError("fabCodeError", "");
                showStep(overlay, "fabStepEmailCode");
            });

        async function submitCode() {

            const button =
                document.getElementById("fabVerifyButton");

            const code =
                document.getElementById("fabCodeInput").value.trim();

            showError("fabCodeError", "");

            if (!code) {

                showError("fabCodeError", "Enter the code from your email.");

                return;
            }

            button.disabled = true;
            button.textContent = "Signing in…";

            try {

                await completeSignIn(pendingEmail, code);

                closeModal();

            } catch (e) {

                showError("fabCodeError", e.message);

            } finally {

                button.disabled = false;
                button.textContent = "Sign in";
            }
        }

        document
            .getElementById("fabVerifyButton")
            .addEventListener("click", submitCode);

        document
            .getElementById("fabCodeInput")
            .addEventListener("keydown", function (event) {

                if (event.key === "Enter") {

                    submitCode();
                }
            });

        document
            .getElementById("fabEmailInput")
            .addEventListener("keydown", function (event) {

                if (event.key === "Enter") {

                    document.getElementById("fabSendCodeButton").click();
                }
            });

        document
            .getElementById("fabSignOutButton")
            .addEventListener("click", function () {

                signOut();
                closeModal();
            });
    }


    function initUI() {

        const button =
            document.getElementById("fabAccountButton");

        if (!button) {

            return;
        }

        if (!ENABLED) {

            /* No Supabase project configured yet: hide the
               button rather than show one that always fails. */

            button.hidden = true;

            return;
        }

        renderAccountUI();

        button.addEventListener("click", openModal);

        onAccountChange(renderAccountUI);
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initUI
        );

    } else {

        initUI();
    }


    /* ========================================
       STARTUP
       If a session is already saved, refresh it
       if needed, then pull the cloud copy in and
       merge it with anything saved locally since
       the last sync (another tab, or time spent
       signed out on this device).
    ======================================== */

    if (ENABLED && session) {

        (async function () {

            const fresh = await ensureFreshSession();

            if (!fresh) {

                signOut();

                return;
            }

            try {

                const cloud = await fetchCloudProgress();

                const merged =
                    fabMergeProgress(
                        collectLocalProgress(),
                        cloud
                    );

                applyProgress(merged);

                await pushCloudProgress(merged);

                fireAccountChange();

            } catch (e) {}

        })();
    }

})();


/* ========================================
   NATIVE APP INTEGRATION
   Inert on the live website: window.Capacitor
   only exists inside the wrapped iOS/Android
   app, so none of this runs in a browser.
======================================== */

(function () {

    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {

        return;
    }

    const Plugins = window.Capacitor.Plugins;

    if (Plugins.StatusBar) {

        Plugins.StatusBar.setBackgroundColor({ color: "#0b1020" }).catch(function () {});
        Plugins.StatusBar.setStyle({ style: "DARK" }).catch(function () {});
    }

    if (Plugins.Network) {

        const banner = document.createElement("div");

        banner.textContent = "Offline — progress sync is paused.";
        banner.style.cssText =
            "position:fixed;left:0;right:0;bottom:0;z-index:9999;" +
            "background:#ffb86b;color:#0b1020;font:600 13px system-ui, sans-serif;" +
            "text-align:center;padding:8px 12px;display:none;";

        document.addEventListener("DOMContentLoaded", function () {

            document.body.appendChild(banner);
        });

        function updateBanner(status) {

            banner.style.display = status.connected ? "none" : "block";
        }

        Plugins.Network.getStatus().then(updateBanner).catch(function () {});
        Plugins.Network.addListener("networkStatusChange", updateBanner);
    }

})();
