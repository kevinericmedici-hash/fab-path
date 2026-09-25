/* ========================================
   FAB PATH FEEDBACK
   Submits straight to the "feedback" table
   in Supabase (see supabase-setup.sql).
   Anyone can submit, signed in or not;
   nobody can read submissions back through
   the API, so this never needs a session.
======================================== */

(function () {

    const CFG =
        window.FAB_SUPABASE || {};

    const ENABLED =
        !!(CFG.url && CFG.anonKey);


    async function submitFeedback(category, message, email) {

        const session =
            window.FabAccount &&
            window.FabAccount.getSession();

        const res = await fetch(
            `${CFG.url}/rest/v1/feedback`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: CFG.anonKey,
                    Authorization: "Bearer " + CFG.anonKey,
                    Prefer: "return=minimal"
                },
                body: JSON.stringify({
                    category: category,
                    message: message,
                    email: email || null,
                    user_id: session ? session.user.id : null
                })
            }
        );

        if (!res.ok) {

            const body =
                await res.json().catch(function () {
                    return {};
                });

            throw new Error(
                body.message ||
                "Could not send that. Try again in a moment."
            );
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

            const category =
                document.getElementById("feedbackCategory").value;

            const message =
                document.getElementById("feedbackMessage").value.trim();

            const email =
                document.getElementById("feedbackEmail").value.trim();

            showError("");

            if (!message) {

                showError("Say a little about what's on your mind.");

                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                showError("That email doesn't look right.");

                return;
            }

            button.disabled = true;
            button.textContent = "Sending…";

            try {

                await submitFeedback(category, message, email);

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
