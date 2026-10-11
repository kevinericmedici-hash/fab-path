/* ========================================
   FAB PATH: CLICKJACKING GUARD

   GitHub Pages cannot send the X-Frame-Options or
   frame-ancestors headers, so this is the fallback:
   if another website has put this page inside a
   frame, hide it and break out of the frame.

   A page framed by this same site (as the preview
   tools do) is left alone.
======================================== */

(function () {

    try {

        if (window.top === window.self) {

            return;
        }

        let sameSite = false;

        try {

            sameSite = window.top.location.hostname === window.location.hostname;

        } catch (e) {

            sameSite = false;   // reading it was blocked: a different site
        }

        if (!sameSite) {

            document.documentElement.style.display = "none";

            try {

                window.top.location = window.self.location;

            } catch (e) {}
        }

    } catch (e) {}

})();
