/* ========================================
   BIOFETS & MOSFETS GAMES — DATA
   Read by the shared sort and step-ordering
   engines (supercap-game-sort.js and
   supercap-game-order.js).
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
},

    isfetVth: {
            "key": "fabPathFetGame2Complete",
            "xp": 45,
            "prompt": "Tap what happens to an NMOS ISFET's threshold voltage.",
            "wrong": "Not quite. Negative charge at the surface raises an NMOS threshold, and positive charge lowers it.",
            "categories": [
                    {
                            "id": "up",
                            "icon": "⬆️",
                            "label": "Rises"
                    },
                    {
                            "id": "down",
                            "icon": "⬇️",
                            "label": "Falls"
                    },
                    {
                            "id": "hold",
                            "icon": "⏸️",
                            "label": "Stays put"
                    }
            ],
            "items": [
                    {
                            "icon": "📈",
                            "name": "pH 7 → pH 9",
                            "desc": "An NMOS ISFET with an ideal oxide.",
                            "category": "up",
                            "why": "Higher pH makes the surface more negative, which raises an NMOS threshold."
                    },
                    {
                            "icon": "➖",
                            "name": "Surface turns more negative",
                            "desc": "Site binding shifts toward SiO⁻.",
                            "category": "up",
                            "why": "Negative surface charge pushes electrons away, so the NMOS needs more gate voltage."
                    },
                    {
                            "icon": "🧬",
                            "name": "A negatively charged molecule binds",
                            "desc": "It sticks to the sensing insulator.",
                            "category": "up",
                            "why": "Added negative charge raises an NMOS threshold."
                    },
                    {
                            "icon": "📈",
                            "name": "pH 4 → pH 6",
                            "desc": "The same NMOS ISFET.",
                            "category": "up",
                            "why": "Any rise in pH makes the surface more negative and raises the threshold."
                    },
                    {
                            "icon": "📉",
                            "name": "pH 7 → pH 5",
                            "desc": "An NMOS ISFET with an ideal oxide.",
                            "category": "down",
                            "why": "Lower pH makes the surface more positive, which lowers an NMOS threshold."
                    },
                    {
                            "icon": "➕",
                            "name": "Surface turns more positive",
                            "desc": "Site binding shifts toward SiOH₂⁺.",
                            "category": "down",
                            "why": "Positive surface charge pulls electrons in, so the NMOS turns on at a lower gate voltage."
                    },
                    {
                            "icon": "🧴",
                            "name": "A protonated amine layer forms",
                            "desc": "APTES picks up protons at neutral pH.",
                            "category": "down",
                            "why": "The added positive charge lowers an NMOS threshold."
                    },
                    {
                            "icon": "📉",
                            "name": "pH 9 → pH 8",
                            "desc": "The same NMOS ISFET.",
                            "category": "down",
                            "why": "The surface becomes less negative, so the threshold drops."
                    },
                    {
                            "icon": "⏱️",
                            "name": "Steady pH 7 for a minute",
                            "desc": "A drift-free ISFET in a stable buffer.",
                            "category": "hold",
                            "why": "Nothing at the surface changed, so the threshold holds."
                    },
                    {
                            "icon": "👯",
                            "name": "pH 7 → pH 9 on a REFET",
                            "desc": "A twin whose surface ignores pH.",
                            "category": "hold",
                            "why": "A REFET's surface does not respond to protons, so its threshold holds."
                    },
                    {
                            "icon": "📊",
                            "name": "Gate voltage swept from 0 to 2 V",
                            "desc": "Reading a transfer curve at a fixed pH.",
                            "category": "hold",
                            "why": "Sweeping the gate moves along the curve. It does not shift the threshold."
                    },
                    {
                            "icon": "🥄",
                            "name": "Solution stirred, pH unchanged",
                            "desc": "Nothing at the surface changes.",
                            "category": "hold",
                            "why": "The surface potential stays the same, so the threshold does too."
                    }
            ]
    },

    surfaceBuild: {
            "key": "fabPathFetGame3Complete",
            "xp": 55,
            "rounds": [
                    {
                            "icon": "🧴",
                            "title": "Silanize the oxide",
                            "lead": "Give a clean oxide an amine tail, one molecular layer thick.",
                            "steps": [
                                    {
                                            "icon": "🧼",
                                            "name": "Clean with solvents and oxygen plasma",
                                            "why": "it removes residue and leaves fresh –OH groups."
                                    },
                                    {
                                            "icon": "🔥",
                                            "name": "Bake off loose surface water",
                                            "why": "it keeps the silane from clumping."
                                    },
                                    {
                                            "icon": "🧴",
                                            "name": "Soak in APTES solution",
                                            "why": "the silane bonds to the surface hydroxyls."
                                    },
                                    {
                                            "icon": "🚿",
                                            "name": "Rinse off unbound silane",
                                            "why": "it prevents thick, uneven multilayers."
                                    },
                                    {
                                            "icon": "♨️",
                                            "name": "Cure with a gentle bake",
                                            "why": "it locks in the Si–O–Si bonds."
                                    }
                            ]
                    },
                    {
                            "icon": "🛡️",
                            "title": "Attach the receptors",
                            "lead": "Tie antibodies to the amine layer, then cover the gaps.",
                            "steps": [
                                    {
                                            "icon": "🔗",
                                            "name": "Activate the amines with glutaraldehyde",
                                            "why": "it leaves a reactive end for the antibody."
                                    },
                                    {
                                            "icon": "🚿",
                                            "name": "Rinse away extra linker",
                                            "why": "loose linker would grab antibodies in solution."
                                    },
                                    {
                                            "icon": "🛡️",
                                            "name": "Flow the antibody solution over the surface",
                                            "why": "the antibodies bond to the linker."
                                    },
                                    {
                                            "icon": "💧",
                                            "name": "Rinse off unbound antibody",
                                            "why": "only tethered receptors should remain."
                                    },
                                    {
                                            "icon": "🥛",
                                            "name": "Block bare spots with BSA",
                                            "why": "it stops other proteins from sticking later."
                                    }
                            ]
                    },
                    {
                            "icon": "📈",
                            "title": "Run the measurement",
                            "lead": "Read the threshold shift from a single sample.",
                            "steps": [
                                    {
                                            "icon": "📉",
                                            "name": "Record the baseline Vth in buffer",
                                            "why": "you need a starting point to measure a shift."
                                    },
                                    {
                                            "icon": "💉",
                                            "name": "Introduce the sample",
                                            "why": "the target can now reach the receptors."
                                    },
                                    {
                                            "icon": "⏳",
                                            "name": "Wait for binding to settle",
                                            "why": "the signal approaches equilibrium gradually."
                                    },
                                    {
                                            "icon": "🚿",
                                            "name": "Rinse with clean buffer",
                                            "why": "it washes off loosely stuck molecules."
                                    },
                                    {
                                            "icon": "📊",
                                            "name": "Read the final Vth and subtract the baseline",
                                            "why": "the difference is the signal."
                                    }
                            ]
                    }
            ]
    },

    debye: {
            "key": "fabPathFetGame4Complete",
            "xp": 45,
            "prompt": "Tap how well the gate can feel charge at the top of this receptor.",
            "wrong": "Not quite. Estimate λD ≈ 0.3 nm ÷ √c, then compare it with the height of the charge.",
            "categories": [
                    {
                            "id": "sensed",
                            "icon": "✅",
                            "label": "Sensed"
                    },
                    {
                            "id": "faded",
                            "icon": "🌫️",
                            "label": "Faded"
                    },
                    {
                            "id": "screened",
                            "icon": "🚫",
                            "label": "Screened"
                    }
            ],
            "items": [
                    {
                            "icon": "🛡️",
                            "name": "Antibody · 0.1 mM buffer",
                            "desc": "Bound charge sits about 10 nm above the surface.",
                            "category": "sensed",
                            "why": "λD ≈ 30 nm here, so 10 nm is inside one Debye length: about 72% of the charge is felt."
                    },
                    {
                            "icon": "🧵",
                            "name": "Aptamer · 5 mM buffer",
                            "desc": "Bound charge sits about 3 nm above the surface.",
                            "category": "sensed",
                            "why": "λD ≈ 4.3 nm here, so 3 nm is inside one Debye length: about 50% of the charge is felt."
                    },
                    {
                            "icon": "🧬",
                            "name": "DNA probe · 1 mM buffer",
                            "desc": "Bound charge sits about 5 nm above the surface.",
                            "category": "sensed",
                            "why": "λD ≈ 9.6 nm here, so 5 nm is inside one Debye length: about 59% of the charge is felt."
                    },
                    {
                            "icon": "✂️",
                            "name": "Fab fragment · 0.1 mM buffer",
                            "desc": "Bound charge sits about 5 nm above the surface.",
                            "category": "sensed",
                            "why": "λD ≈ 30 nm here, so 5 nm is inside one Debye length: about 85% of the charge is felt."
                    },
                    {
                            "icon": "🛡️",
                            "name": "Antibody · 5 mM buffer",
                            "desc": "Bound charge sits about 10 nm above the surface.",
                            "category": "faded",
                            "why": "λD ≈ 4.3 nm here, so 10 nm is between one and three Debye lengths: about 10% of the charge is felt."
                    },
                    {
                            "icon": "✂️",
                            "name": "Fab fragment · 10 mM buffer",
                            "desc": "Bound charge sits about 5 nm above the surface.",
                            "category": "faded",
                            "why": "λD ≈ 3.0 nm here, so 5 nm is between one and three Debye lengths: about 19% of the charge is felt."
                    },
                    {
                            "icon": "🧵",
                            "name": "Aptamer · 50 mM buffer",
                            "desc": "Bound charge sits about 3 nm above the surface.",
                            "category": "faded",
                            "why": "λD ≈ 1.4 nm here, so 3 nm is between one and three Debye lengths: about 11% of the charge is felt."
                    },
                    {
                            "icon": "🧬",
                            "name": "DNA probe · 20 mM buffer",
                            "desc": "Bound charge sits about 5 nm above the surface.",
                            "category": "faded",
                            "why": "λD ≈ 2.1 nm here, so 5 nm is between one and three Debye lengths: about 10% of the charge is felt."
                    },
                    {
                            "icon": "🛡️",
                            "name": "Antibody · 150 mM saline",
                            "desc": "Bound charge sits about 10 nm above the surface.",
                            "category": "screened",
                            "why": "λD ≈ 0.8 nm here, so 10 nm is beyond three Debye lengths: under 0.1% of the charge is felt."
                    },
                    {
                            "icon": "✂️",
                            "name": "Fab fragment · 100 mM saline",
                            "desc": "Bound charge sits about 5 nm above the surface.",
                            "category": "screened",
                            "why": "λD ≈ 1.0 nm here, so 5 nm is beyond three Debye lengths: about 0.6% of the charge is felt."
                    },
                    {
                            "icon": "🔹",
                            "name": "Nanobody · 150 mM saline",
                            "desc": "Bound charge sits about 3 nm above the surface.",
                            "category": "screened",
                            "why": "λD ≈ 0.8 nm here, so 3 nm is beyond three Debye lengths: about 2% of the charge is felt."
                    },
                    {
                            "icon": "🧬",
                            "name": "DNA probe · 50 mM buffer",
                            "desc": "Bound charge sits about 5 nm above the surface.",
                            "category": "screened",
                            "why": "λD ≈ 1.4 nm here, so 5 nm is beyond three Debye lengths: about 3% of the charge is felt."
                    }
            ]
    }
};
