/* ========================================
   NEUROTRANSMITTERS GAMES — DATA
   Read by the shared sort and step-ordering
   engines (supercap-game-sort.js and
   supercap-game-order.js).
======================================== */

const ntGameData = {

    fire: {
        "key": "fabPathNtGame1Complete",
        "xp": 55,
        "rounds": [
            {
                "icon": "📤",
                "title": "Release",
                "lead": "From spike to transmitter in the cleft.",
                "steps": [
                    {
                        "icon": "⚡",
                        "name": "A spike reaches the terminal",
                        "why": "it starts the whole sequence."
                    },
                    {
                        "icon": "🚪",
                        "name": "Voltage-gated calcium channels open",
                        "why": "the voltage change opens them."
                    },
                    {
                        "icon": "🧂",
                        "name": "Calcium flows into the terminal",
                        "why": "calcium is the release trigger."
                    },
                    {
                        "icon": "🫧",
                        "name": "Vesicles fuse with the membrane",
                        "why": "calcium triggers exocytosis."
                    },
                    {
                        "icon": "💧",
                        "name": "Transmitter spills into the cleft",
                        "why": "the vesicle contents are now outside the cell."
                    }
                ]
            },
            {
                "icon": "📥",
                "title": "Reception",
                "lead": "From transmitter to a new voltage change.",
                "steps": [
                    {
                        "icon": "🌫️",
                        "name": "Transmitter diffuses across the cleft",
                        "why": "the gap is only tens of nanometers."
                    },
                    {
                        "icon": "🔒",
                        "name": "It binds receptors on the postsynaptic cell",
                        "why": "receptors recognize it."
                    },
                    {
                        "icon": "🚪",
                        "name": "Ion channels open",
                        "why": "binding opens ionotropic channels."
                    },
                    {
                        "icon": "📈",
                        "name": "The voltage shifts toward or away from threshold",
                        "why": "ions change the membrane potential."
                    },
                    {
                        "icon": "🔥",
                        "name": "A spike starts if threshold is reached",
                        "why": "summed inputs decide."
                    }
                ]
            },
            {
                "icon": "🧹",
                "title": "Cleanup",
                "lead": "Clear the cleft so the next message can start fresh.",
                "steps": [
                    {
                        "icon": "🔓",
                        "name": "Transmitter lets go of the receptors",
                        "why": "binding is reversible."
                    },
                    {
                        "icon": "♻️",
                        "name": "Transporters pump it back in",
                        "why": "reuptake removes much of it."
                    },
                    {
                        "icon": "✂️",
                        "name": "Enzymes or astrocytes clear the rest",
                        "why": "nothing should linger."
                    },
                    {
                        "icon": "🫗",
                        "name": "Vesicles are refilled",
                        "why": "the terminal restocks."
                    },
                    {
                        "icon": "✅",
                        "name": "The terminal is ready for the next spike",
                        "why": "the cycle can repeat."
                    }
                ]
            }
        ]
    },

    messenger: {
        "key": "fabPathNtGame2Complete",
        "xp": 45,
        "prompt": "Tap the neurotransmitter this clue describes.",
        "wrong": "Not quite. Glutamate excites, GABA inhibits, dopamine links to reward and Parkinson's, and serotonin links to SSRIs and the gut.",
        "categories": [
            {
                "id": "glu",
                "icon": "🔥",
                "label": "Glutamate"
            },
            {
                "id": "gaba",
                "icon": "🧊",
                "label": "GABA"
            },
            {
                "id": "da",
                "icon": "🎯",
                "label": "Dopamine"
            },
            {
                "id": "ht",
                "icon": "🌙",
                "label": "Serotonin"
            }
        ],
        "items": [
            {
                "icon": "🔥",
                "name": "The main excitatory transmitter",
                "desc": "Used at most excitatory synapses.",
                "category": "glu",
                "why": "Glutamate is the main excitatory transmitter."
            },
            {
                "icon": "🧠",
                "name": "Acts on AMPA and NMDA receptors",
                "desc": "Ionotropic receptors for fast signals.",
                "category": "glu",
                "why": "AMPA and NMDA are glutamate receptors."
            },
            {
                "icon": "🌩️",
                "name": "Overload in a stroke causes excitotoxicity",
                "desc": "Neurons are damaged.",
                "category": "glu",
                "why": "Too much glutamate over-excites and damages neurons."
            },
            {
                "icon": "🧊",
                "name": "The main inhibitory transmitter",
                "desc": "It quiets neurons.",
                "category": "gaba",
                "why": "GABA is the main inhibitory transmitter."
            },
            {
                "icon": "🏭",
                "name": "Made from glutamate by the enzyme GAD",
                "desc": "One step of chemistry.",
                "category": "gaba",
                "why": "Glutamate decarboxylase turns glutamate into GABA."
            },
            {
                "icon": "😴",
                "name": "Benzodiazepines boost its receptor",
                "desc": "Sedating drugs.",
                "category": "gaba",
                "why": "Benzodiazepines enhance GABA-A receptor activity."
            },
            {
                "icon": "🧩",
                "name": "Lost from the substantia nigra in Parkinson's disease",
                "desc": "Movement becomes slow and stiff.",
                "category": "da",
                "why": "Parkinson's involves loss of dopamine neurons in the substantia nigra."
            },
            {
                "icon": "🧪",
                "name": "Made from tyrosine, via L-DOPA",
                "desc": "L-DOPA is its precursor.",
                "category": "da",
                "why": "Tyrosine becomes L-DOPA, then dopamine."
            },
            {
                "icon": "🎁",
                "name": "Fires more for better-than-expected outcomes",
                "desc": "A learning signal.",
                "category": "da",
                "why": "Dopamine neurons signal reward that beats expectation."
            },
            {
                "icon": "🍃",
                "name": "Made from the amino acid tryptophan",
                "desc": "A dietary precursor.",
                "category": "ht",
                "why": "Serotonin is made from tryptophan."
            },
            {
                "icon": "💊",
                "name": "SSRIs block its transporter",
                "desc": "They slow its cleanup.",
                "category": "ht",
                "why": "SSRIs block the serotonin transporter, SERT."
            },
            {
                "icon": "🫃",
                "name": "Most of the body's supply is made in the gut",
                "desc": "Only a small share is in the brain.",
                "category": "ht",
                "why": "Most serotonin is made in the gut."
            }
        ]
    },

    drugs: {
        "key": "fabPathNtGame3Complete",
        "xp": 50,
        "prompt": "Tap the lever this drug pulls.",
        "wrong": "Not quite. Agonists activate receptors, antagonists block them, reuptake blockers stop the pump, and enzyme inhibitors stop breakdown.",
        "categories": [
            {
                "id": "agonist",
                "icon": "🟢",
                "label": "Agonist"
            },
            {
                "id": "antagonist",
                "icon": "🔴",
                "label": "Antagonist"
            },
            {
                "id": "reuptake",
                "icon": "♻️",
                "label": "Reuptake blocker"
            },
            {
                "id": "enzyme",
                "icon": "✂️",
                "label": "Enzyme inhibitor"
            }
        ],
        "items": [
            {
                "icon": "🚬",
                "name": "Nicotine",
                "desc": "Acts at nicotinic receptors.",
                "category": "agonist",
                "why": "Nicotine activates nicotinic acetylcholine receptors."
            },
            {
                "icon": "🧩",
                "name": "Pramipexole",
                "desc": "A Parkinson's drug that acts on D2 and D3 receptors.",
                "category": "agonist",
                "why": "It activates dopamine D2 and D3 receptors."
            },
            {
                "icon": "😴",
                "name": "Muscimol",
                "desc": "A compound from certain mushrooms.",
                "category": "agonist",
                "why": "Muscimol activates GABA-A receptors."
            },
            {
                "icon": "🧠",
                "name": "Haloperidol",
                "desc": "An antipsychotic drug.",
                "category": "antagonist",
                "why": "It blocks dopamine D2 receptors."
            },
            {
                "icon": "🏹",
                "name": "Curare",
                "desc": "A classic arrow poison.",
                "category": "antagonist",
                "why": "It blocks nicotinic receptors at the muscle."
            },
            {
                "icon": "⚠️",
                "name": "Ketamine",
                "desc": "An anesthetic.",
                "category": "antagonist",
                "why": "It blocks NMDA glutamate receptors."
            },
            {
                "icon": "🌙",
                "name": "Fluoxetine",
                "desc": "An SSRI.",
                "category": "reuptake",
                "why": "It blocks the serotonin transporter."
            },
            {
                "icon": "🚫",
                "name": "Cocaine",
                "desc": "A stimulant.",
                "category": "reuptake",
                "why": "It blocks the dopamine transporter."
            },
            {
                "icon": "🎯",
                "name": "Methylphenidate",
                "desc": "An ADHD medicine.",
                "category": "reuptake",
                "why": "It blocks the dopamine and norepinephrine transporters."
            },
            {
                "icon": "🧓",
                "name": "Donepezil",
                "desc": "An Alzheimer's drug.",
                "category": "enzyme",
                "why": "It inhibits acetylcholinesterase."
            },
            {
                "icon": "🧩",
                "name": "Selegiline",
                "desc": "A Parkinson's drug.",
                "category": "enzyme",
                "why": "It inhibits the enzyme MAO-B, which breaks down dopamine."
            },
            {
                "icon": "💪",
                "name": "Neostigmine",
                "desc": "Used for myasthenia gravis.",
                "category": "enzyme",
                "why": "It inhibits acetylcholinesterase."
            }
        ]
    },

    receptors: {
        "key": "fabPathNtGame4Complete",
        "xp": 45,
        "prompt": "Tap the receptor family this receptor belongs to.",
        "wrong": "Not quite. Nicotinic, AMPA, NMDA, GABA-A, glycine, and 5-HT3 are channels. Dopamine, mGluR, GABA-B, muscarinic, and most 5-HT receptors are G-protein coupled.",
        "categories": [
            {
                "id": "iono",
                "icon": "🚪",
                "label": "Ionotropic (channel)"
            },
            {
                "id": "meta",
                "icon": "🔔",
                "label": "Metabotropic (G protein)"
            }
        ],
        "items": [
            {
                "icon": "💪",
                "name": "Nicotinic acetylcholine receptor",
                "desc": "At the neuromuscular junction.",
                "category": "iono",
                "why": "It is a ligand-gated ion channel."
            },
            {
                "icon": "🔥",
                "name": "AMPA receptor",
                "desc": "Fast glutamate signaling.",
                "category": "iono",
                "why": "It is a glutamate-gated ion channel."
            },
            {
                "icon": "🧠",
                "name": "NMDA receptor",
                "desc": "Involved in learning.",
                "category": "iono",
                "why": "It is a glutamate-gated ion channel."
            },
            {
                "icon": "🧊",
                "name": "GABA-A receptor",
                "desc": "Lets chloride in.",
                "category": "iono",
                "why": "It is a ligand-gated chloride channel."
            },
            {
                "icon": "🚰",
                "name": "Glycine receptor",
                "desc": "Inhibitory in the spinal cord.",
                "category": "iono",
                "why": "It is a ligand-gated chloride channel."
            },
            {
                "icon": "🌙",
                "name": "Serotonin 5-HT3 receptor",
                "desc": "The one channel among serotonin receptors.",
                "category": "iono",
                "why": "5-HT3 is the ionotropic serotonin receptor."
            },
            {
                "icon": "🎯",
                "name": "Dopamine D1 receptor",
                "desc": "One of five dopamine receptors.",
                "category": "meta",
                "why": "Dopamine receptors are G-protein coupled."
            },
            {
                "icon": "🎯",
                "name": "Dopamine D2 receptor",
                "desc": "Target of antipsychotics.",
                "category": "meta",
                "why": "D2 is a G-protein-coupled receptor."
            },
            {
                "icon": "🔥",
                "name": "Metabotropic glutamate receptor (mGluR)",
                "desc": "A slower glutamate receptor.",
                "category": "meta",
                "why": "mGluRs signal through G proteins."
            },
            {
                "icon": "🧊",
                "name": "GABA-B receptor",
                "desc": "Slow inhibition.",
                "category": "meta",
                "why": "GABA-B is G-protein coupled."
            },
            {
                "icon": "💪",
                "name": "Muscarinic acetylcholine receptor",
                "desc": "Found in many organs and in the brain.",
                "category": "meta",
                "why": "Muscarinic receptors are G-protein coupled."
            },
            {
                "icon": "🌙",
                "name": "Serotonin 5-HT1A receptor",
                "desc": "A common serotonin target.",
                "category": "meta",
                "why": "5-HT1A is G-protein coupled."
            }
        ]
    },

    methods: {
        "key": "fabPathNtGame5Complete",
        "xp": 50,
        "prompt": "Tap the method this clue describes.",
        "wrong": "Not quite. Microdialysis: fluid and HPLC. Voltammetry: current from a swept carbon fiber. Fluorescent sensors: glowing proteins. Transistors: charge on a gate.",
        "categories": [
            {
                "id": "md",
                "icon": "🧪",
                "label": "Microdialysis"
            },
            {
                "id": "fscv",
                "icon": "⚡",
                "label": "Voltammetry"
            },
            {
                "id": "fluor",
                "icon": "💡",
                "label": "Fluorescent sensor"
            },
            {
                "id": "fet",
                "icon": "🔌",
                "label": "Transistor sensor"
            }
        ],
        "items": [
            {
                "icon": "🧪",
                "name": "Collects fluid and analyzes it with HPLC",
                "desc": "A probe with a porous tip.",
                "category": "md",
                "why": "Microdialysis samples fluid for analysis elsewhere."
            },
            {
                "icon": "⏳",
                "name": "Each sample covers minutes",
                "desc": "Slow, but broad.",
                "category": "md",
                "why": "Microdialysis has minute-scale time resolution."
            },
            {
                "icon": "🧬",
                "name": "Can measure glutamate and GABA from one sample",
                "desc": "Many molecules at once.",
                "category": "md",
                "why": "Samples can be analyzed for many molecules."
            },
            {
                "icon": "🪡",
                "name": "A carbon fiber a few micrometers wide",
                "desc": "The voltage ramps ten times a second.",
                "category": "fscv",
                "why": "Fast-scan cyclic voltammetry uses a carbon-fiber microelectrode."
            },
            {
                "icon": "🔋",
                "name": "Only detects molecules that oxidize",
                "desc": "Dopamine, but not glutamate.",
                "category": "fscv",
                "why": "It needs an electrochemically active molecule."
            },
            {
                "icon": "⏱️",
                "name": "Sub-second timing and nanomolar sensitivity",
                "desc": "Fast and sensitive.",
                "category": "fscv",
                "why": "FSCV resolves changes in under a second."
            },
            {
                "icon": "🧫",
                "name": "Cells must carry the sensor gene",
                "desc": "Mainly a research tool.",
                "category": "fluor",
                "why": "Genetically encoded sensors are built into the cells."
            },
            {
                "icon": "✨",
                "name": "The glow brightens when the transmitter binds",
                "desc": "iGluSnFR is an example.",
                "category": "fluor",
                "why": "These proteins change fluorescence on binding."
            },
            {
                "icon": "🔬",
                "name": "Read with a microscope at cell-level detail",
                "desc": "It shows where the molecule is.",
                "category": "fluor",
                "why": "Imaging gives spatial detail."
            },
            {
                "icon": "🔌",
                "name": "Receptors on a gate shift the current",
                "desc": "A cousin of the BioFET.",
                "category": "fet",
                "why": "A transistor sensor reads binding as a change in current."
            },
            {
                "icon": "🧂",
                "name": "Held back by Debye screening in salt",
                "desc": "Charge farther than a nanometer is hidden.",
                "category": "fet",
                "why": "Salt screens charge beyond the Debye length."
            },
            {
                "icon": "🧵",
                "name": "Aptamers or short receptors help it work",
                "desc": "They keep the target near the surface.",
                "category": "fet",
                "why": "Short receptors bring the charge within the Debye length."
            }
        ]
    },

    fscv: {
        "key": "fabPathNtGame6Complete",
        "xp": 55,
        "rounds": [
            {
                "icon": "🪡",
                "title": "Set up",
                "lead": "Get a clean, stable electrode in the right place.",
                "steps": [
                    {
                        "icon": "🧵",
                        "name": "Seal a carbon fiber in a glass capillary",
                        "why": "it makes a rigid, insulated probe."
                    },
                    {
                        "icon": "✂️",
                        "name": "Trim the exposed tip to a short length",
                        "why": "a short tip keeps the signal local."
                    },
                    {
                        "icon": "⚪",
                        "name": "Place the silver/silver chloride reference electrode",
                        "why": "it completes the circuit."
                    },
                    {
                        "icon": "⬇️",
                        "name": "Lower the electrode to the target site",
                        "why": "it must be where the dopamine is."
                    },
                    {
                        "icon": "⏳",
                        "name": "Wait for the background current to settle",
                        "why": "an unstable background hides the signal."
                    }
                ]
            },
            {
                "icon": "🌊",
                "title": "Scan",
                "lead": "Sweep the voltage, over and over.",
                "steps": [
                    {
                        "icon": "➖",
                        "name": "Hold the electrode near −0.4 V",
                        "why": "it is the resting voltage between scans."
                    },
                    {
                        "icon": "⬆️",
                        "name": "Ramp the voltage up to about +1.3 V",
                        "why": "dopamine oxidizes on the way up."
                    },
                    {
                        "icon": "⬇️",
                        "name": "Ramp it back down to −0.4 V",
                        "why": "this completes one scan."
                    },
                    {
                        "icon": "🔁",
                        "name": "Repeat about ten times a second",
                        "why": "this gives sub-second snapshots."
                    },
                    {
                        "icon": "💾",
                        "name": "Record the current from every scan",
                        "why": "each scan is one data point."
                    }
                ]
            },
            {
                "icon": "🧮",
                "title": "Analyze",
                "lead": "Turn raw current into dopamine over time.",
                "steps": [
                    {
                        "icon": "➖",
                        "name": "Subtract the background current",
                        "why": "it is much larger than the signal."
                    },
                    {
                        "icon": "🖐️",
                        "name": "Check the voltammogram shape",
                        "why": "the shape is the molecule's fingerprint."
                    },
                    {
                        "icon": "📏",
                        "name": "Convert current to concentration with a calibration",
                        "why": "calibration links current to dopamine."
                    },
                    {
                        "icon": "📈",
                        "name": "Plot concentration against time",
                        "why": "this shows the release event."
                    },
                    {
                        "icon": "🔗",
                        "name": "Compare it with the stimulus",
                        "why": "it links the signal to the event."
                    }
                ]
            }
        ]
    }
};
