/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP GAMES — DATA
   Read by the shared sort and step-ordering
   engines (supercap-game-sort.js and
   supercap-game-order.js).
======================================== */

const bbbGameData = {

    routes: {
        "key": "fabPathBbbGame1Complete",
        "xp": 45,
        "prompt": "Tap how this molecule meets the barrier.",
        "wrong": "Not quite. Small and oily diffuses, nutrients use carriers, big cargo uses receptor vesicles, and efflux pumps return drugs to the blood.",
        "categories": [
            {
                "id": "diffuse",
                "icon": "💨",
                "label": "Diffuses through"
            },
            {
                "id": "carrier",
                "icon": "🚚",
                "label": "Carrier protein"
            },
            {
                "id": "vesicle",
                "icon": "🫧",
                "label": "Vesicle shuttle"
            },
            {
                "id": "pumped",
                "icon": "⛔",
                "label": "Pumped back out"
            }
        ],
        "items": [
            {
                "icon": "🫁",
                "name": "Oxygen",
                "desc": "A small gas.",
                "category": "diffuse",
                "why": "Small gases dissolve through the cell membrane."
            },
            {
                "icon": "☕",
                "name": "Caffeine",
                "desc": "A small, lipid-soluble molecule.",
                "category": "diffuse",
                "why": "Small and fat-soluble, so it passes by diffusion."
            },
            {
                "icon": "🫧",
                "name": "Carbon dioxide",
                "desc": "A small gas leaving the brain.",
                "category": "diffuse",
                "why": "Small gases diffuse freely."
            },
            {
                "icon": "🍬",
                "name": "Glucose",
                "desc": "The brain's main fuel.",
                "category": "carrier",
                "why": "GLUT1 carries glucose across."
            },
            {
                "icon": "💊",
                "name": "Levodopa",
                "desc": "A Parkinson's drug.",
                "category": "carrier",
                "why": "It rides the LAT1 amino-acid carrier."
            },
            {
                "icon": "🥩",
                "name": "Large neutral amino acids",
                "desc": "Such as leucine.",
                "category": "carrier",
                "why": "LAT1 carries large neutral amino acids."
            },
            {
                "icon": "🧲",
                "name": "Transferrin carrying iron",
                "desc": "Binds the transferrin receptor.",
                "category": "vesicle",
                "why": "Receptor-mediated transcytosis moves it in a vesicle."
            },
            {
                "icon": "🔑",
                "name": "An antibody with a transferrin-receptor shuttle",
                "desc": "Designed to hitch a ride.",
                "category": "vesicle",
                "why": "A shuttle uses the receptor's vesicle route."
            },
            {
                "icon": "💉",
                "name": "Insulin binding its receptor",
                "desc": "A large hormone.",
                "category": "vesicle",
                "why": "Receptor-mediated transcytosis is the route for large cargo."
            },
            {
                "icon": "🚑",
                "name": "Loperamide",
                "desc": "An opioid-like drug that does not reach the brain well.",
                "category": "pumped",
                "why": "P-glycoprotein pushes it back into the blood."
            },
            {
                "icon": "🎗️",
                "name": "Paclitaxel",
                "desc": "A chemotherapy drug.",
                "category": "pumped",
                "why": "Efflux pumps such as P-glycoprotein eject it."
            },
            {
                "icon": "↩️",
                "name": "A drug that BCRP recognizes",
                "desc": "Another efflux pump.",
                "category": "pumped",
                "why": "BCRP pumps its substrates back to the blood."
            }
        ]
    },

    transwell: {
        "key": "fabPathBbbGame2Complete",
        "xp": 55,
        "rounds": [
            {
                "icon": "🧫",
                "title": "Set up the model",
                "lead": "Grow a barrier on a porous membrane.",
                "steps": [
                    {
                        "icon": "🧴",
                        "name": "Coat the membrane with matrix protein",
                        "why": "the cells need something to attach to."
                    },
                    {
                        "icon": "🧱",
                        "name": "Seed endothelial cells on the top",
                        "why": "they will form the barrier."
                    },
                    {
                        "icon": "⭐",
                        "name": "Add astrocytes to the bottom well",
                        "why": "they send tightening signals."
                    },
                    {
                        "icon": "⏳",
                        "name": "Let the layer mature for several days",
                        "why": "junctions take time to form."
                    },
                    {
                        "icon": "🔬",
                        "name": "Check junction staining or TEER",
                        "why": "it confirms the barrier before testing."
                    }
                ]
            },
            {
                "icon": "⚡",
                "title": "Measure TEER",
                "lead": "Turn a resistance reading into Ω·cm².",
                "steps": [
                    {
                        "icon": "🌡️",
                        "name": "Bring the plate to a steady temperature",
                        "why": "resistance changes with temperature."
                    },
                    {
                        "icon": "⬜",
                        "name": "Read an empty insert with the same medium",
                        "why": "this is the blank."
                    },
                    {
                        "icon": "🧫",
                        "name": "Read the insert with cells",
                        "why": "this is the sample."
                    },
                    {
                        "icon": "➖",
                        "name": "Subtract the blank from the sample",
                        "why": "it removes the insert's own resistance."
                    },
                    {
                        "icon": "✖️",
                        "name": "Multiply by the membrane area",
                        "why": "the result is in Ω·cm²."
                    }
                ]
            },
            {
                "icon": "🧪",
                "title": "Run a tracer test",
                "lead": "Measure how fast a marker leaks across.",
                "steps": [
                    {
                        "icon": "🟡",
                        "name": "Add the tracer to the top compartment",
                        "why": "it starts on the blood side."
                    },
                    {
                        "icon": "⏱️",
                        "name": "Sample the bottom compartment at set times",
                        "why": "you need the leak over time."
                    },
                    {
                        "icon": "🔦",
                        "name": "Measure tracer in each sample",
                        "why": "fluorescence gives the amount."
                    },
                    {
                        "icon": "📈",
                        "name": "Work out the rate of crossing",
                        "why": "the slope is dQ/dt."
                    },
                    {
                        "icon": "🧮",
                        "name": "Divide by area and starting concentration",
                        "why": "that gives Papp."
                    }
                ]
            }
        ]
    },

    shear: {
        "key": "fabPathBbbGame3Complete",
        "xp": 50,
        "prompt": "Tap what happens to the wall shear stress.",
        "wrong": "Not quite. τ = 6μQ ÷ (w h²): it rises with flow Q and viscosity μ, and falls with width w and the square of height h.",
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
                "icon": "🚰",
                "name": "Double the flow rate",
                "desc": "Same channel, same medium.",
                "category": "up",
                "why": "τ is proportional to Q, so it doubles."
            },
            {
                "icon": "📏",
                "name": "Halve the channel height",
                "desc": "Same flow rate.",
                "category": "up",
                "why": "τ depends on 1 ÷ h², so it becomes four times larger."
            },
            {
                "icon": "↔️",
                "name": "Halve the channel width",
                "desc": "Same flow rate.",
                "category": "up",
                "why": "τ depends on 1 ÷ w, so it doubles."
            },
            {
                "icon": "🍯",
                "name": "Make the medium more viscous",
                "desc": "Same flow and channel.",
                "category": "up",
                "why": "τ is proportional to μ, so more viscosity means more shear."
            },
            {
                "icon": "🐢",
                "name": "Halve the flow rate",
                "desc": "Same channel, same medium.",
                "category": "down",
                "why": "τ is proportional to Q, so it halves."
            },
            {
                "icon": "📐",
                "name": "Double the channel height",
                "desc": "Same flow rate.",
                "category": "down",
                "why": "τ depends on 1 ÷ h², so it falls to a quarter."
            },
            {
                "icon": "🛣️",
                "name": "Double the channel width",
                "desc": "Same flow rate.",
                "category": "down",
                "why": "τ depends on 1 ÷ w, so it halves."
            },
            {
                "icon": "🌡️",
                "name": "Warm the medium so its viscosity drops",
                "desc": "Same flow and channel.",
                "category": "down",
                "why": "τ is proportional to μ, so lower viscosity means less shear."
            },
            {
                "icon": "📏",
                "name": "Make the channel twice as long",
                "desc": "Same w, h, and flow rate.",
                "category": "hold",
                "why": "Length does not appear in the formula for fully developed flow."
            },
            {
                "icon": "🔬",
                "name": "Image the cells under a microscope",
                "desc": "Nothing about the flow changes.",
                "category": "hold",
                "why": "Watching does not change Q, w, h, or μ."
            },
            {
                "icon": "🧵",
                "name": "Swap the tubing for a different color",
                "desc": "Same flow rate and medium.",
                "category": "hold",
                "why": "Q, w, h, and μ are unchanged."
            },
            {
                "icon": "♻️",
                "name": "Replace the medium with fresh medium of the same kind",
                "desc": "Same viscosity.",
                "category": "hold",
                "why": "μ is unchanged, so τ is too."
            }
        ]
    },

    cast: {
        "key": "fabPathBbbGame4Complete",
        "xp": 55,
        "rounds": [
            {
                "icon": "🧱",
                "title": "Make the master",
                "lead": "Pattern ridges in photoresist on a silicon wafer.",
                "steps": [
                    {
                        "icon": "🌀",
                        "name": "Spin-coat SU-8 photoresist onto the wafer",
                        "why": "it makes an even layer, and the layer's thickness sets the channel height."
                    },
                    {
                        "icon": "🔥",
                        "name": "Soft-bake the coated wafer",
                        "why": "it drives off solvent."
                    },
                    {
                        "icon": "💡",
                        "name": "Expose it through a photomask",
                        "why": "light defines the channel pattern."
                    },
                    {
                        "icon": "♨️",
                        "name": "Bake again after exposure",
                        "why": "it completes the cross-linking."
                    },
                    {
                        "icon": "🧪",
                        "name": "Develop away the unexposed resist",
                        "why": "only the raised ridges remain."
                    }
                ]
            },
            {
                "icon": "🫗",
                "title": "Mold the PDMS",
                "lead": "Turn the master into a rubbery slab with channels.",
                "steps": [
                    {
                        "icon": "🥄",
                        "name": "Mix PDMS base with curing agent",
                        "why": "the agent makes it set."
                    },
                    {
                        "icon": "🫧",
                        "name": "Remove bubbles under vacuum",
                        "why": "bubbles would leave voids in the channels."
                    },
                    {
                        "icon": "🫗",
                        "name": "Pour it over the master",
                        "why": "it flows around the ridges."
                    },
                    {
                        "icon": "🔥",
                        "name": "Cure it in an oven",
                        "why": "the liquid sets into rubber."
                    },
                    {
                        "icon": "✂️",
                        "name": "Peel it off and punch the port holes",
                        "why": "tubing will connect here."
                    }
                ]
            },
            {
                "icon": "🧫",
                "title": "Seal and seed",
                "lead": "Close the channels and put living cells in.",
                "steps": [
                    {
                        "icon": "⚡",
                        "name": "Treat the PDMS and glass with oxygen plasma",
                        "why": "it activates their surfaces."
                    },
                    {
                        "icon": "🤝",
                        "name": "Press the layers together to bond",
                        "why": "activated surfaces bond permanently."
                    },
                    {
                        "icon": "🧴",
                        "name": "Coat the channels with matrix protein",
                        "why": "the cells need something to attach to."
                    },
                    {
                        "icon": "🧱",
                        "name": "Seed endothelial cells and let them attach",
                        "why": "they form the barrier."
                    },
                    {
                        "icon": "🌊",
                        "name": "Start a slow flow of medium",
                        "why": "flow gives the cells shear and keeps them fed."
                    }
                ]
            }
        ]
    },

    cells: {
        "key": "fabPathBbbGame5Complete",
        "xp": 45,
        "prompt": "Tap the cell source this fact describes.",
        "wrong": "Not quite. Primary cells come straight from tissue, lines keep dividing and tend to be leaky, and iPSC-derived cells are grown from reprogrammed stem cells.",
        "categories": [
            {
                "id": "primary",
                "icon": "🧪",
                "label": "Primary cells"
            },
            {
                "id": "line",
                "icon": "♾️",
                "label": "Immortalized line"
            },
            {
                "id": "ipsc",
                "icon": "🌱",
                "label": "iPSC-derived"
            }
        ],
        "items": [
            {
                "icon": "🧠",
                "name": "Isolated straight from brain tissue",
                "desc": "Then grown for a short time.",
                "category": "primary",
                "why": "Primary cells come directly from tissue."
            },
            {
                "icon": "📉",
                "name": "Scarce, and varies between preparations",
                "desc": "Every batch differs.",
                "category": "primary",
                "why": "Tissue supply and donor variation limit primary cells."
            },
            {
                "icon": "🏆",
                "name": "Closest to native, but hard to get in quantity",
                "desc": "Realistic and rare.",
                "category": "primary",
                "why": "Primary cells are realistic but scarce."
            },
            {
                "icon": "🐖",
                "name": "Pig or rodent brain endothelial cells",
                "desc": "Prepared fresh from animal tissue.",
                "category": "primary",
                "why": "These are primary cells taken from animal tissue."
            },
            {
                "icon": "🔬",
                "name": "hCMEC/D3",
                "desc": "A widely used human cell line.",
                "category": "line",
                "why": "hCMEC/D3 is a standard immortalized human line."
            },
            {
                "icon": "💲",
                "name": "Easy and cheap to grow",
                "desc": "Divides again and again.",
                "category": "line",
                "why": "Lines are convenient and inexpensive."
            },
            {
                "icon": "💧",
                "name": "Tends to form a leaky barrier",
                "desc": "Low TEER.",
                "category": "line",
                "why": "Immortalized lines usually give weak barriers."
            },
            {
                "icon": "♻️",
                "name": "Can be passaged many times",
                "desc": "Without aging out.",
                "category": "line",
                "why": "Immortalized lines keep dividing."
            },
            {
                "icon": "🧬",
                "name": "Reprogrammed from a patient's skin or blood cells",
                "desc": "Then guided to a new fate.",
                "category": "ipsc",
                "why": "iPSCs are made by reprogramming adult cells."
            },
            {
                "icon": "🎯",
                "name": "Can become brain endothelial-like cells",
                "desc": "With the right signals.",
                "category": "ipsc",
                "why": "Stem cells can be differentiated toward brain endothelial cells."
            },
            {
                "icon": "🩺",
                "name": "Lets a chip carry a patient's own mutation",
                "desc": "Models that person's disease.",
                "category": "ipsc",
                "why": "Patient-derived iPSCs preserve genetic background."
            },
            {
                "icon": "⚠️",
                "name": "Protocols vary, and cell identity can be mixed",
                "desc": "So checking is essential.",
                "category": "ipsc",
                "why": "iPSC-derived cells are not yet standardized."
            }
        ]
    }
};
