/* ========================================
   FAB PATH FEEDBACK
   Sends feedback to the "feedback" Edge Function
   (see supabase/functions/feedback). The page never
   writes to the database itself: the function checks
   the message, rate limits by network address, and
   fills in the sender from the verified login, so
   nobody can flood it or pose as someone else.

   Errors shown here are always fixed, friendly
   sentences. Raw server text is never displayed.
======================================== */

(function () {

    const CFG =
        window.FAB_SUPABASE || {};

    const ENABLED =
        !!(CFG.url && CFG.anonKey);

    const ENDPOINT =
        `${CFG.url}/functions/v1/feedback`;

    const GENERIC =
        "Could not send that. Try again in a moment.";


    async function submitFeedback(category, message, email, website) {

        const session =
            window.FabAccount &&
            window.FabAccount.getSession();

        let res;

        try {

            res = await fetch(
                ENDPOINT,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        apikey: CFG.anonKey,
                        Authorization:
                            "Bearer " +
                            (session ? session.access_token : CFG.anonKey)
                    },
                    body: JSON.stringify({
                        category: category,
                        message: message,
                        email: email || null,
                        website: website
                    })
                }
            );

        } catch (e) {

            throw new Error(GENERIC);
        }

        if (res.status === 429) {

            throw new Error(
                "You've sent a lot of feedback. Please try again later."
            );
        }

        if (!res.ok) {

            throw new Error(GENERIC);
        }
    }


    function showError(message) {

        const el =
            document.getElementById("feedbackError");

        if (!el) {

            return;
        }

        el.textContent = message;
        el.hidden = !message;
    }


    function initForm() {

        const form =
            document.getElementById("feedbackForm");

        if (!form) {

            return;
        }

        if (!ENABLED) {

            form.hidden = true;

            const notice =
                document.getElementById("feedbackDisabled");

            if (notice) {

                notice.hidden = false;
            }

            return;
        }

        form.addEventListener("submit", async function (event) {

            event.preventDefault();

            const button =
                document.getElementById("feedbackSubmitButton");

            if (button.disabled) {

                return;
            }

            const category =
                document.getElementById("feedbackCategory").value;

            const message =
                document.getElementById("feedbackMessage").value.trim();

            const email =
                document.getElementById("feedbackEmail").value.trim();

            const website =
                document.getElementById("feedbackWebsite")
                    ? document.getElementById("feedbackWebsite").value
                    : "";

            showError("");

            if (!message) {

                showError("Say a little about what's on your mind.");

                return;
            }

            if (message.length > 4000) {

                showError("Please keep it under 4,000 characters.");

                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                showError("That email doesn't look right.");

                return;
            }

            button.disabled = true;
            button.textContent = "Sending…";

            try {

                await submitFeedback(category, message, email, website);

                form.hidden = true;

                document.getElementById("feedbackThanks").hidden = false;

            } catch (e) {

                showError(e.message);

                button.disabled = false;
                button.textContent = "Send feedback";
            }
        });
    }


    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", initForm);

    } else {

        initForm();
    }

})();
