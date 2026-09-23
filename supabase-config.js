/* ========================================
   FAB PATH ACCOUNTS: SUPABASE SETTINGS

   Sign-in stays switched off until both values
   below are filled in. Find them in Supabase under
   Project Settings > API Keys:

     url      the "Project URL"
     anonKey  the "Publishable key" (Supabase's
              newer name for what used to be
              called the "anon" key)

   The publishable key is meant to be public: it
   can only do what the row-level security rules
   in supabase-setup.sql allow. Never paste a
   "Secret key" or the old "service_role" key here.
======================================== */

window.FAB_SUPABASE = {
    url: "https://xcftpdlniahvxpxtkdaq.supabase.co",
    anonKey: "sb_publishable_dZz5oyFseXY3Tf7s91c2nQ_SBnGUCQa"
};
