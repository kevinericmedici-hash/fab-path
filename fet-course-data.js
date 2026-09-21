/* ========================================
   BIOFETS & MOSFETS COURSE DATA
   All four parts are built: 1 (MOSFET Fundamentals),
   2 (Sensing Ions), 3 (Biofunctionalization), and
   4 (Biosensing).

   Structure: every unit is a short study module
   (a few slides) followed by one Fab Challenge
   quiz, and lesson ids match unit ids. Parts group
   the units for orientation.
======================================== */

const fetCourseParts = [

    {
        id: 1,
        title: "MOSFET Fundamentals",
        firstUnitId: 1,
        lastUnitId: 7,
        description:
            "How a transistor works: semiconductor basics, the MOS structure, threshold voltage, and the I–V behavior that later becomes a sensor."
    },

    {
        id: 2,
        title: "Sensing Ions: The ISFET",
        firstUnitId: 8,
        lastUnitId: 13,
        description:
            "Swap the metal gate for a solution: surface charge, the double layer, pH response, reference electrodes, and the real-world limits of an ion-sensitive FET."
    },

    {
        id: 3,
        title: "Biofunctionalization: Teaching the Surface",
        firstUnitId: 14,
        lastUnitId: 19,
        description:
            "Give the gate a recognition layer: receptors, silane and thiol chemistry, linkers, blocking, binding equilibrium, and how to prove each step worked."
    },

    {
        id: 4,
        title: "Biosensing: From Molecules to Measurements",
        firstUnitId: 20,
        lastUnitId: 25,
        description:
            "Put the sensor to work: Debye screening, protein and DNA detection, limit of detection, device formats, and what it takes to measure real samples."
    }

];

const fetCourseData = [

    {
        id: 1,

        title: "Transistors: Switches & Amplifiers",

        description:
            "What a transistor does, and why the field-effect version dominates.",

        studyModule: {
            title: "Transistors: Switches & Amplifiers",
            href: "fetunit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "Transistors: Switches & Amplifiers",
                description:
                    "What a transistor does, and why the field-effect version dominates."
            }

        ]
    },

    {
        id: 2,

        title: "A Semiconductor Refresher",

        description:
            "Electrons, holes, doping, and the p–n junction.",

        studyModule: {
            title: "A Semiconductor Refresher",
            href: "fetunit2.html"
        },

        lessons: [

            {
                id: 2,
                title: "A Semiconductor Refresher",
                description:
                    "Electrons, holes, doping, and the p–n junction."
            }

        ]
    },

    {
        id: 3,

        title: "Anatomy of a MOSFET",

        description:
            "Gate, oxide, source, drain, body, and the NMOS and PMOS pair.",

        studyModule: {
            title: "Anatomy of a MOSFET",
            href: "fetunit3.html"
        },

        lessons: [

            {
                id: 3,
                title: "Anatomy of a MOSFET",
                description:
                    "Gate, oxide, source, drain, body, and the NMOS and PMOS pair."
            }

        ]
    },

    {
        id: 4,

        title: "The MOS Capacitor",

        description:
            "The gate-oxide-silicon capacitor and its three surface states.",

        studyModule: {
            title: "The MOS Capacitor",
            href: "fetunit4.html"
        },

        lessons: [

            {
                id: 4,
                title: "The MOS Capacitor",
                description:
                    "The gate-oxide-silicon capacitor and its three surface states."
            }

        ]
    },

    {
        id: 5,

        title: "Threshold Voltage",

        description:
            "What sets the switch-on voltage, and how charge shifts it.",

        studyModule: {
            title: "Threshold Voltage",
            href: "fetunit5.html"
        },

        lessons: [

            {
                id: 5,
                title: "Threshold Voltage",
                description:
                    "What sets the switch-on voltage, and how charge shifts it."
            }

        ]
    },

    {
        id: 6,

        title: "Current–Voltage Behavior",

        description:
            "Cutoff, triode, and saturation, with the square-law equations.",

        studyModule: {
            title: "Current–Voltage Behavior",
            href: "fetunit6.html"
        },

        lessons: [

            {
                id: 6,
                title: "Current–Voltage Behavior",
                description:
                    "Cutoff, triode, and saturation, with the square-law equations."
            }

        ]
    },

    {
        id: 7,

        title: "Transfer Curves & Sensitivity",

        description:
            "Transconductance, subthreshold swing, and why sensing lives on the transfer curve.",

        studyModule: {
            title: "Transfer Curves & Sensitivity",
            href: "fetunit7.html"
        },

        lessons: [

            {
                id: 7,
                title: "Transfer Curves & Sensitivity",
                description:
                    "Transconductance, subthreshold swing, and why sensing lives on the transfer curve."
            }

        ]
    },

    {
        id: 8,

        title: "From MOSFET to ISFET",

        description:
            "Swap the metal gate for a solution and a reference electrode.",

        studyModule: {
            title: "From MOSFET to ISFET",
            href: "fetunit8.html"
        },

        lessons: [

            {
                id: 8,
                title: "From MOSFET to ISFET",
                description:
                    "Swap the metal gate for a solution and a reference electrode."
            }

        ]
    },

    {
        id: 9,

        title: "Surface Charge & Site Binding",

        description:
            "How an oxide in water picks up charge, and why that charge depends on pH.",

        studyModule: {
            title: "Surface Charge & Site Binding",
            href: "fetunit9.html"
        },

        lessons: [

            {
                id: 9,
                title: "Surface Charge & Site Binding",
                description:
                    "How an oxide in water picks up charge, and why that charge depends on pH."
            }

        ]
    },

    {
        id: 10,

        title: "The Electrical Double Layer",

        description:
            "How ions in the solution screen the surface charge, and how far the screening reaches.",

        studyModule: {
            title: "The Electrical Double Layer",
            href: "fetunit10.html"
        },

        lessons: [

            {
                id: 10,
                title: "The Electrical Double Layer",
                description:
                    "How ions in the solution screen the surface charge, and how far the screening reaches."
            }

        ]
    },

    {
        id: 11,

        title: "pH Response & the Nernst Limit",

        description:
            "How much threshold shift you get per pH unit, and why 59 mV is the ceiling.",

        studyModule: {
            title: "pH Response & the Nernst Limit",
            href: "fetunit11.html"
        },

        lessons: [

            {
                id: 11,
                title: "pH Response & the Nernst Limit",
                description:
                    "How much threshold shift you get per pH unit, and why 59 mV is the ceiling."
            }

        ]
    },

    {
        id: 12,

        title: "Reference Electrodes & Readout",

        description:
            "The stable reference that sets the gate potential, and the two ways to read the signal.",

        studyModule: {
            title: "Reference Electrodes & Readout",
            href: "fetunit12.html"
        },

        lessons: [

            {
                id: 12,
                title: "Reference Electrodes & Readout",
                description:
                    "The stable reference that sets the gate potential, and the two ways to read the signal."
            }

        ]
    },

    {
        id: 13,

        title: "Drift, Hysteresis & Noise",

        description:
            "The real-world limits that separate a lab demo from a dependable sensor.",

        studyModule: {
            title: "Drift, Hysteresis & Noise",
            href: "fetunit13.html"
        },

        lessons: [

            {
                id: 13,
                title: "Drift, Hysteresis & Noise",
                description:
                    "The real-world limits that separate a lab demo from a dependable sensor."
            }

        ]
    },

    {
        id: 14,

        title: "Receptors on the Gate",

        description:
            "How a recognition layer turns an ISFET into a sensor for molecules.",

        studyModule: {
            title: "Receptors on the Gate",
            href: "fetunit14.html"
        },

        lessons: [

            {
                id: 14,
                title: "Receptors on the Gate",
                description:
                    "How a recognition layer turns an ISFET into a sensor for molecules."
            }

        ]
    },

    {
        id: 15,

        title: "Silanes & Self-Assembled Monolayers",

        description:
            "How a bare oxide gets a chemical handle, one molecular layer thick.",

        studyModule: {
            title: "Silanes & Self-Assembled Monolayers",
            href: "fetunit15.html"
        },

        lessons: [

            {
                id: 15,
                title: "Silanes & Self-Assembled Monolayers",
                description:
                    "How a bare oxide gets a chemical handle, one molecular layer thick."
            }

        ]
    },

    {
        id: 16,

        title: "Linkers & Immobilization",

        description:
            "The crosslinkers that tie receptors to the surface, and why orientation matters.",

        studyModule: {
            title: "Linkers & Immobilization",
            href: "fetunit16.html"
        },

        lessons: [

            {
                id: 16,
                title: "Linkers & Immobilization",
                description:
                    "The crosslinkers that tie receptors to the surface, and why orientation matters."
            }

        ]
    },

    {
        id: 17,

        title: "Blocking & Non-Specific Binding",

        description:
            "How to keep everything except the target off the surface.",

        studyModule: {
            title: "Blocking & Non-Specific Binding",
            href: "fetunit17.html"
        },

        lessons: [

            {
                id: 17,
                title: "Blocking & Non-Specific Binding",
                description:
                    "How to keep everything except the target off the surface."
            }

        ]
    },

    {
        id: 18,

        title: "Binding Affinity & Kinetics",

        description:
            "How much target binds at a given concentration, and how fast.",

        studyModule: {
            title: "Binding Affinity & Kinetics",
            href: "fetunit18.html"
        },

        lessons: [

            {
                id: 18,
                title: "Binding Affinity & Kinetics",
                description:
                    "How much target binds at a given concentration, and how fast."
            }

        ]
    },

    {
        id: 19,

        title: "Verifying the Layer",

        description:
            "How to prove each chemical step worked before trusting the sensor.",

        studyModule: {
            title: "Verifying the Layer",
            href: "fetunit19.html"
        },

        lessons: [

            {
                id: 19,
                title: "Verifying the Layer",
                description:
                    "How to prove each chemical step worked before trusting the sensor."
            }

        ]
    },

    {
        id: 20,

        title: "Debye Screening & Charge Detection",

        description:
            "Why salty samples hide bound charge, and what designers do about it.",

        studyModule: {
            title: "Debye Screening & Charge Detection",
            href: "fetunit20.html"
        },

        lessons: [

            {
                id: 20,
                title: "Debye Screening & Charge Detection",
                description:
                    "Why salty samples hide bound charge, and what designers do about it."
            }

        ]
    },

    {
        id: 21,

        title: "Protein Detection",

        description:
            "How antibody-based BioFETs read a protein, and why buffer pH matters.",

        studyModule: {
            title: "Protein Detection",
            href: "fetunit21.html"
        },

        lessons: [

            {
                id: 21,
                title: "Protein Detection",
                description:
                    "How antibody-based BioFETs read a protein, and why buffer pH matters."
            }

        ]
    },

    {
        id: 22,

        title: "DNA Hybridization Sensing",

        description:
            "How a probe strand captures its match, and why DNA is a natural charge signal.",

        studyModule: {
            title: "DNA Hybridization Sensing",
            href: "fetunit22.html"
        },

        lessons: [

            {
                id: 22,
                title: "DNA Hybridization Sensing",
                description:
                    "How a probe strand captures its match, and why DNA is a natural charge signal."
            }

        ]
    },

    {
        id: 23,

        title: "Signal, Noise & Limit of Detection",

        description:
            "How small a concentration a BioFET can see, and what limits it.",

        studyModule: {
            title: "Signal, Noise & Limit of Detection",
            href: "fetunit23.html"
        },

        lessons: [

            {
                id: 23,
                title: "Signal, Noise & Limit of Detection",
                description:
                    "How small a concentration a BioFET can see, and what limits it."
            }

        ]
    },

    {
        id: 24,

        title: "Nanowires, Graphene & Arrays",

        description:
            "Beyond the planar FET: the device designs used for biosensing.",

        studyModule: {
            title: "Nanowires, Graphene & Arrays",
            href: "fetunit24.html"
        },

        lessons: [

            {
                id: 24,
                title: "Nanowires, Graphene & Arrays",
                description:
                    "Beyond the planar FET: the device designs used for biosensing."
            }

        ]
    },

    {
        id: 25,

        title: "Real Samples & Reliability",

        description:
            "What it takes to turn a working prototype into a dependable measurement.",

        studyModule: {
            title: "Real Samples & Reliability",
            href: "fetunit25.html"
        },

        lessons: [

            {
                id: 25,
                title: "Real Samples & Reliability",
                description:
                    "What it takes to turn a working prototype into a dependable measurement."
            }

        ]
    }

];
