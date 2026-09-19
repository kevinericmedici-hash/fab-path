/* ========================================
   BIOFETS & MOSFETS GAMES — DATA
   Read by the shared sort engine
   (supercap-game-sort.js).
======================================== */

const fetGameData = {

    regions: {
        "key": "fabPathFetGame1Complete",
        "xp": 40,
        "prompt": "Tap the operating region this bias puts the NMOS in.",
        "wrong": "Not quite. Compare VGS with Vth first, then VDS with VGS − Vth.",
        "categories": [
                {
                        "id": "cutoff",
                        "icon": "⛔",
                        "label": "Cutoff"
                },
                {
                        "id": "triode",
                        "icon": "🎚️",
                        "label": "Triode (linear)"
                },
                {
                        "id": "sat",
                        "icon": "🚿",
                        "label": "Saturation"
                }
        ],
        "items": [
                {
                        "icon": "⛔",
                        "name": "VGS = 0.4 V · VDS = 2.0 V",
                        "desc": "An NMOS with Vth = 0.7 V.",
                        "category": "cutoff",
                        "why": "VGS (0.4 V) is below Vth (0.7 V), so no channel forms."
                },
                {
                        "icon": "⛔",
                        "name": "VGS = 0.0 V · VDS = 1.2 V",
                        "desc": "An NMOS with Vth = 0.5 V.",
                        "category": "cutoff",
                        "why": "VGS (0.0 V) is below Vth (0.5 V), so no channel forms."
                },
                {
                        "icon": "⛔",
                        "name": "VGS = 0.8 V · VDS = 0.1 V",
                        "desc": "An NMOS with Vth = 1.0 V.",
                        "category": "cutoff",
                        "why": "VGS (0.8 V) is below Vth (1.0 V), so no channel forms."
                },
                {
                        "icon": "⛔",
                        "name": "VGS = 0.3 V · VDS = 3.0 V",
                        "desc": "An NMOS with Vth = 0.6 V.",
                        "category": "cutoff",
                        "why": "VGS (0.3 V) is below Vth (0.6 V), so no channel forms."
                },
                {
                        "icon": "🎚️",
                        "name": "VGS = 2.0 V · VDS = 0.3 V",
                        "desc": "An NMOS with Vth = 0.5 V.",
                        "category": "triode",
                        "why": "VDS (0.3 V) is below the overdrive VGS − Vth (1.5 V), so the channel reaches the drain."
                },
                {
                        "icon": "🎚️",
                        "name": "VGS = 3.0 V · VDS = 1.0 V",
                        "desc": "An NMOS with Vth = 0.7 V.",
                        "category": "triode",
                        "why": "VDS (1.0 V) is below the overdrive VGS − Vth (2.3 V), so the channel reaches the drain."
                },
                {
                        "icon": "🎚️",
                        "name": "VGS = 2.5 V · VDS = 0.5 V",
                        "desc": "An NMOS with Vth = 1.0 V.",
                        "category": "triode",
                        "why": "VDS (0.5 V) is below the overdrive VGS − Vth (1.5 V), so the channel reaches the drain."
                },
                {
                        "icon": "🎚️",
                        "name": "VGS = 1.2 V · VDS = 0.4 V",
                        "desc": "An NMOS with Vth = 0.4 V.",
                        "category": "triode",
                        "why": "VDS (0.4 V) is below the overdrive VGS − Vth (0.8 V), so the channel reaches the drain."
                },
                {
                        "icon": "🚿",
                        "name": "VGS = 1.5 V · VDS = 1.5 V",
                        "desc": "An NMOS with Vth = 0.5 V.",
                        "category": "sat",
                        "why": "VDS (1.5 V) is at least the overdrive VGS − Vth (1.0 V), so the channel pinches off."
                },
                {
                        "icon": "🚿",
                        "name": "VGS = 2.0 V · VDS = 3.0 V",
                        "desc": "An NMOS with Vth = 0.7 V.",
                        "category": "sat",
                        "why": "VDS (3.0 V) is at least the overdrive VGS − Vth (1.3 V), so the channel pinches off."
                },
                {
                        "icon": "🚿",
                        "name": "VGS = 1.8 V · VDS = 1.2 V",
                        "desc": "An NMOS with Vth = 1.0 V.",
                        "category": "sat",
                        "why": "VDS (1.2 V) is at least the overdrive VGS − Vth (0.8 V), so the channel pinches off."
                },
                {
                        "icon": "🚿",
                        "name": "VGS = 1.0 V · VDS = 2.5 V",
                        "desc": "An NMOS with Vth = 0.4 V.",
                        "category": "sat",
                        "why": "VDS (2.5 V) is at least the overdrive VGS − Vth (0.6 V), so the channel pinches off."
                }
        ]
}
};
