/* ========================================
   GLUCOSE SENSORS GAMES — DATA
   Read by the shared sort and step-ordering
   engines (supercap-game-sort.js and
   supercap-game-order.js).
======================================== */

const gluGameData = {

    range: {
        "key": "fabPathGluGame1Complete",
        "xp": 40,
        "prompt": "Tap where this reading falls against the 70 to 180 mg/dL target range.",
        "wrong": "Not quite. Low is under 70 mg/dL, in range is 70 to 180, and high is over 180. Multiply mmol/L by about 18 to convert.",
        "categories": [
            {
                "id": "low",
                "icon": "⬇️",
                "label": "Low"
            },
            {
                "id": "range",
                "icon": "✅",
                "label": "In range"
            },
            {
                "id": "high",
                "icon": "⬆️",
                "label": "High"
            }
        ],
        "items": [
            {
                "icon": "🥶",
                "name": "62 mg/dL",
                "desc": "A reading before breakfast.",
                "category": "low",
                "why": "62 is under 70 mg/dL, so it counts as low."
            },
            {
                "icon": "🥶",
                "name": "3.1 mmol/L",
                "desc": "A reading shown in mmol/L.",
                "category": "low",
                "why": "3.1 × 18 ≈ 56 mg/dL, which is under 70."
            },
            {
                "icon": "🥶",
                "name": "68 mg/dL",
                "desc": "A reading during a walk.",
                "category": "low",
                "why": "68 is just under 70 mg/dL, so it is low."
            },
            {
                "icon": "🥶",
                "name": "52 mg/dL",
                "desc": "A reading overnight.",
                "category": "low",
                "why": "52 is under 54 mg/dL, which is an urgent low."
            },
            {
                "icon": "🎯",
                "name": "95 mg/dL",
                "desc": "A reading before lunch.",
                "category": "range",
                "why": "95 sits between 70 and 180 mg/dL."
            },
            {
                "icon": "🎯",
                "name": "5.5 mmol/L",
                "desc": "A reading shown in mmol/L.",
                "category": "range",
                "why": "5.5 × 18 ≈ 99 mg/dL, which is in range."
            },
            {
                "icon": "🎯",
                "name": "130 mg/dL",
                "desc": "A reading after a meal.",
                "category": "range",
                "why": "130 is within the 70 to 180 target band."
            },
            {
                "icon": "🎯",
                "name": "178 mg/dL",
                "desc": "A reading an hour after dinner.",
                "category": "range",
                "why": "178 is just under the 180 limit, so it is in range."
            },
            {
                "icon": "🍰",
                "name": "195 mg/dL",
                "desc": "A reading after dessert.",
                "category": "high",
                "why": "195 is above 180 mg/dL, so it is high."
            },
            {
                "icon": "🍰",
                "name": "11.5 mmol/L",
                "desc": "A reading shown in mmol/L.",
                "category": "high",
                "why": "11.5 × 18 ≈ 207 mg/dL, which is above 180."
            },
            {
                "icon": "🍰",
                "name": "240 mg/dL",
                "desc": "A reading mid-afternoon.",
                "category": "high",
                "why": "240 is above 180 mg/dL, so it is high."
            },
            {
                "icon": "🍰",
                "name": "310 mg/dL",
                "desc": "A reading during an illness.",
                "category": "high",
                "why": "310 is well above 250 mg/dL, which is very high."
            }
        ]
    },

    generation: {
        "key": "fabPathGluGame2Complete",
        "xp": 45,
        "prompt": "Tap the generation of sensor design this fact describes.",
        "wrong": "Not quite. First generation uses oxygen and peroxide, second adds a mediator, and third connects the enzyme directly to the electrode.",
        "categories": [
            {
                "id": "g1",
                "icon": "1️⃣",
                "label": "First generation"
            },
            {
                "id": "g2",
                "icon": "2️⃣",
                "label": "Second generation"
            },
            {
                "id": "g3",
                "icon": "3️⃣",
                "label": "Third generation"
            }
        ],
        "items": [
            {
                "icon": "💨",
                "name": "Detects hydrogen peroxide",
                "desc": "The electrode oxidizes a byproduct of the enzyme reaction.",
                "category": "g1",
                "why": "Peroxide made when oxygen takes the electrons is the signal in a first-generation design."
            },
            {
                "icon": "🫁",
                "name": "Depends on oxygen",
                "desc": "Oxygen must be available for the reaction.",
                "category": "g1",
                "why": "First-generation sensors use oxygen as the electron acceptor."
            },
            {
                "icon": "⚡",
                "name": "Needs a fairly high voltage",
                "desc": "Other molecules can react at the electrode too.",
                "category": "g1",
                "why": "Oxidizing peroxide takes a higher voltage, which invites interference."
            },
            {
                "icon": "🔷",
                "name": "Glucose oxidase on platinum",
                "desc": "The classic enzyme electrode, as in Dexcom's labeling.",
                "category": "g1",
                "why": "Peroxide detected at platinum is a first-generation approach."
            },
            {
                "icon": "🚕",
                "name": "A mediator shuttles electrons",
                "desc": "A small redox molecule, such as an osmium complex.",
                "category": "g2",
                "why": "A mediator carries electrons from the enzyme to the electrode."
            },
            {
                "icon": "🔋",
                "name": "Works at a low voltage",
                "desc": "Which helps limit interfering signals.",
                "category": "g2",
                "why": "Mediated designs run at a low voltage."
            },
            {
                "icon": "🌬️",
                "name": "Much less dependent on oxygen",
                "desc": "The mediator replaces oxygen as the go-between.",
                "category": "g2",
                "why": "A mediator replaces oxygen, so oxygen matters far less."
            },
            {
                "icon": "🟠",
                "name": "A wired enzyme with osmium",
                "desc": "The approach Abbott describes for FreeStyle Libre.",
                "category": "g2",
                "why": "Linking the enzyme to an osmium mediator is a second-generation design."
            },
            {
                "icon": "🔌",
                "name": "Enzyme passes electrons straight to the electrode",
                "desc": "No go-between at all.",
                "category": "g3",
                "why": "Direct electron transfer is the defining feature of third generation."
            },
            {
                "icon": "🚫",
                "name": "No oxygen and no mediator needed",
                "desc": "The simplest wiring in principle.",
                "category": "g3",
                "why": "Third-generation designs aim to remove both oxygen and mediators."
            },
            {
                "icon": "🧪",
                "name": "Often explored with nanomaterials",
                "desc": "Used to get close enough to the enzyme's core.",
                "category": "g3",
                "why": "Nanomaterials are a common route to direct electron transfer."
            },
            {
                "icon": "🔬",
                "name": "Mostly still in research",
                "desc": "Not yet the commercial standard.",
                "category": "g3",
                "why": "Direct transfer is hard with glucose oxidase and remains an active research area."
            }
        ]
    },

    whose: {
        "key": "fabPathGluGame3Complete",
        "xp": 50,
        "prompt": "Tap the sensor this clue describes.",
        "wrong": "Not quite. Dexcom: peroxide at platinum. Libre: osmium-wired enzyme. Eversense: fluorescent implant. Guardian: built for Medtronic's insulin systems.",
        "categories": [
            {
                "id": "dexcom",
                "icon": "🟦",
                "label": "Dexcom"
            },
            {
                "id": "libre",
                "icon": "🟧",
                "label": "FreeStyle Libre"
            },
            {
                "id": "eversense",
                "icon": "💎",
                "label": "Eversense"
            },
            {
                "id": "guardian",
                "icon": "🟪",
                "label": "Medtronic Guardian"
            }
        ],
        "items": [
            {
                "icon": "🚨",
                "name": "A fixed urgent-low alert at 55 mg/dL",
                "desc": "It cannot be turned off.",
                "category": "dexcom",
                "why": "Dexcom's labeling describes an urgent low alert fixed at 55 mg/dL."
            },
            {
                "icon": "🕛",
                "name": "A 12-hour grace period after the session ends",
                "desc": "On the G7.",
                "category": "dexcom",
                "why": "The Dexcom G7 adds a 12-hour grace period."
            },
            {
                "icon": "🧷",
                "name": "Applicator places a hair-thin filament",
                "desc": "Peroxide is detected at platinum.",
                "category": "dexcom",
                "why": "A glucose oxidase sensor on platinum is Dexcom's design."
            },
            {
                "icon": "🦾",
                "name": "Worn on the back of the upper arm for 14 days",
                "desc": "A small integrated disc.",
                "category": "libre",
                "why": "FreeStyle Libre sensors are worn about 14 days."
            },
            {
                "icon": "⚪",
                "name": "A wired enzyme linked to an osmium mediator",
                "desc": "Works at a low voltage.",
                "category": "libre",
                "why": "Abbott describes a wired enzyme design with an osmium mediator."
            },
            {
                "icon": "⏱️",
                "name": "Libre 3 streams a new reading about every minute",
                "desc": "Faster than most.",
                "category": "libre",
                "why": "Libre 3 updates about once a minute."
            },
            {
                "icon": "🩺",
                "name": "A clinician inserts it under the skin",
                "desc": "A small cylinder in the upper arm.",
                "category": "eversense",
                "why": "Eversense is an implant placed by a clinician."
            },
            {
                "icon": "💡",
                "name": "A fluorescent polymer, with no enzyme",
                "desc": "An LED lights it and a photodiode reads the glow.",
                "category": "eversense",
                "why": "Eversense senses glucose with a glucose-indicating polymer, not an enzyme."
            },
            {
                "icon": "📳",
                "name": "A removable transmitter that can vibrate",
                "desc": "The sensor stays in place when it comes off.",
                "category": "eversense",
                "why": "Eversense uses a removable on-skin transmitter."
            },
            {
                "icon": "📅",
                "name": "About 7 days of wear",
                "desc": "The shortest of the four.",
                "category": "guardian",
                "why": "Guardian sensors last about 7 days."
            },
            {
                "icon": "🔗",
                "name": "Designed to work with automated insulin delivery",
                "desc": "Part of a closed loop with the maker's pumps.",
                "category": "guardian",
                "why": "Medtronic designs Guardian sensors for its automated insulin systems."
            },
            {
                "icon": "🔌",
                "name": "A glucose oxidase electrode with a separate reusable transmitter",
                "desc": "Older versions especially.",
                "category": "guardian",
                "why": "Guardian uses a glucose oxidase electrode like Dexcom, with a separate transmitter in many versions."
            }
        ]
    },

    build: {
        "key": "fabPathGluGame4Complete",
        "xp": 55,
        "rounds": [
            {
                "icon": "🔧",
                "title": "Build the electrode",
                "lead": "Form a thin, patterned electrode on a film.",
                "steps": [
                    {
                        "icon": "🧼",
                        "name": "Clean the substrate",
                        "why": "dirt would spoil the metal film."
                    },
                    {
                        "icon": "✨",
                        "name": "Deposit a thin metal film",
                        "why": "this becomes the electrode."
                    },
                    {
                        "icon": "📐",
                        "name": "Pattern it with photolithography",
                        "why": "it defines the electrode shape."
                    },
                    {
                        "icon": "⚪",
                        "name": "Add a silver/silver chloride reference",
                        "why": "the sensor needs a stable reference."
                    },
                    {
                        "icon": "✂️",
                        "name": "Cut the film into individual sensors",
                        "why": "each one is now a separate part."
                    }
                ]
            },
            {
                "icon": "🧪",
                "title": "Add the layers",
                "lead": "Build the chemistry from the electrode outward.",
                "steps": [
                    {
                        "icon": "🛡️",
                        "name": "Apply an interference-rejecting layer",
                        "why": "it blocks unwanted molecules from the electrode."
                    },
                    {
                        "icon": "🧬",
                        "name": "Coat on the glucose oxidase layer",
                        "why": "this is the part that reacts with glucose."
                    },
                    {
                        "icon": "🚪",
                        "name": "Add a glucose-limiting membrane",
                        "why": "it keeps oxygen and glucose in balance."
                    },
                    {
                        "icon": "🧴",
                        "name": "Add a biocompatible outer layer",
                        "why": "it faces the body."
                    },
                    {
                        "icon": "♨️",
                        "name": "Cure the finished stack",
                        "why": "it locks the layers in place."
                    }
                ]
            },
            {
                "icon": "📦",
                "title": "Package and release",
                "lead": "Turn a coated filament into a safe, calibrated product.",
                "steps": [
                    {
                        "icon": "🔩",
                        "name": "Assemble the sensor into its applicator",
                        "why": "it must be ready for the user."
                    },
                    {
                        "icon": "📦",
                        "name": "Seal it in packaging",
                        "why": "the package protects it and keeps it sterile."
                    },
                    {
                        "icon": "☢️",
                        "name": "Sterilize it",
                        "why": "sensors go under the skin and must be sterile."
                    },
                    {
                        "icon": "🎯",
                        "name": "Test a sample from the batch to set factory calibration",
                        "why": "calibration depends on how that batch behaves."
                    },
                    {
                        "icon": "🏷️",
                        "name": "Label it with an expiry date and ship",
                        "why": "the enzyme has a limited shelf life."
                    }
                ]
            }
        ]
    }
};
