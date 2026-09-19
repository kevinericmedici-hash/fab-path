/* ========================================
   SUPERCAPACITORS COURSE DATA
   Grounded in Kevin Medici's MS thesis:
   "New Generation of High-Power Density 3D
   Interdigitated Supercapacitors" (SDSU, 2026)
======================================== */

const supercapCourseData = [

    /* =====================================
       UNIT 1
    ===================================== */

    {
        id: 1,

        title: "Supercapacitor Fundamentals",

        description:
            "Where supercapacitors fit between batteries and capacitors, and the equations that govern charge storage.",

        studyModule: {
            title: "Supercapacitor Fundamentals",
            href: "supercapunit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "Why Supercapacitors?",
                description:
                    "The Ragone plot, and why batteries, capacitors, and supercapacitors trade off energy against power."
            },

            {
                id: 2,
                title: "Charge, Capacitance & Energy",
                description:
                    "The core equations behind how much charge and energy an electrode can store."
            },

            {
                id: 3,
                title: "Inside a Conventional Capacitor",
                description:
                    "Dielectrics, plates, and why ordinary capacitors trade energy density for speed."
            },

            {
                id: 4,
                title: "Reading a CV Curve",
                description:
                    "The Randles-Ševčík equation and what a cyclic voltammogram's peak current tells you."
            }

        ]
    },


    /* =====================================
       UNIT 2
    ===================================== */

    {
        id: 2,

        title: "Charge Storage Mechanisms",

        description:
            "How supercapacitors actually store charge: double layers, fast surface redox reactions, and redox amplification.",

        studyModule: {
            title: "Charge Storage Mechanisms",
            href: "supercapunit2.html"
        },

        lessons: [

            {
                id: 5,
                title: "Three Kinds of Supercapacitor",
                description:
                    "EDLCs, pseudocapacitors, and hybrids — and how surface storage differs from a battery."
            },

            {
                id: 6,
                title: "The Electric Double Layer",
                description:
                    "How ions pile up at an electrode surface to store charge electrostatically."
            },

            {
                id: 7,
                title: "Pseudocapacitance",
                description:
                    "Fast, reversible redox reactions that store more charge — at a cost."
            },

            {
                id: 8,
                title: "Redox Amplification",
                description:
                    "How closely spaced interdigitated electrodes recycle redox species to amplify current."
            }

        ]
    },


    /* =====================================
       UNIT 3
    ===================================== */

    {
        id: 3,

        title: "Electrode Materials",

        description:
            "What an electrode needs to do, the three material families, and why glassy carbon stands out for micro devices.",

        studyModule: {
            title: "Electrode Materials",
            href: "supercapunit3.html"
        },

        lessons: [

            {
                id: 9,
                title: "What Makes a Good Electrode",
                description:
                    "The properties an ideal electrode needs, and the three families of materials to choose from."
            },

            {
                id: 10,
                title: "Metal Oxides & Conducting Polymers",
                description:
                    "High-capacitance pseudocapacitive materials, and what they cost you in stability."
            },

            {
                id: 11,
                title: "The Carbon Family",
                description:
                    "Activated carbon, graphene, nanotubes, and aerogels — strengths and catches of each."
            },

            {
                id: 12,
                title: "Glassy Carbon",
                description:
                    "A pyrolyzed, non-graphitizing carbon that can be patterned with photolithography."
            }

        ]
    },


    /* =====================================
       UNIT 4
    ===================================== */

    {
        id: 4,

        title: "Device Geometries",

        description:
            "From wound cylinders and coin cells to combs, fibers, and stretchable films: how shape sets what a supercapacitor can do.",

        studyModule: {
            title: "Device Geometries",
            href: "supercapunit4.html"
        },

        lessons: [

            {
                id: 13,
                title: "Macro Form Factors",
                description:
                    "Cylindrical, coin/button, and pouch cells, and how cells combine into modules."
            },

            {
                id: 14,
                title: "Sandwich vs. In-Plane",
                description:
                    "Stacked electrodes with a separator, or side-by-side electrodes with a gap."
            },

            {
                id: 15,
                title: "Interdigitated Micro Architectures",
                description:
                    "Combs, spirals, and 3D fingers for on-chip energy storage."
            },

            {
                id: 16,
                title: "Fiber, Wire & Textile",
                description:
                    "Parallel, twisted, and coaxial fibers that can be woven into fabric."
            },

            {
                id: 17,
                title: "Shape-Shifting Devices",
                description:
                    "Stretchable, origami, printed, transparent, structural, and implantable forms."
            },

            {
                id: 18,
                title: "Symmetric vs. Asymmetric",
                description:
                    "Why pairing the same or different electrodes changes voltage, capacity, and mass balance."
            }

        ]
    },

    /* =====================================
       UNIT 5
    ===================================== */

    {
        id: 5,

        title: "Electrolytes",

        description:
            "The ions between the electrodes: what an electrolyte does, where its voltage window ends, and how water, organic, ionic-liquid, and gel families compare.",

        studyModule: {
            title: "Electrolytes",
            href: "supercapunit5.html"
        },

        lessons: [

            {
                id: 19,
                title: "What the Electrolyte Does",
                description:
                    "Ion source, ion highway, and electron blocker, and how conductivity steers power."
            },

            {
                id: 20,
                title: "The Voltage Window",
                description:
                    "Why voltage is worth more than capacitance, and what limits it."
            },

            {
                id: 21,
                title: "Aqueous Electrolytes",
                description:
                    "Acidic, alkaline, and neutral water-based electrolytes, and the 1.23 V ceiling."
            },

            {
                id: 22,
                title: "Organic Electrolytes & Ionic Liquids",
                description:
                    "Wider windows from solvents that don't split and salts that stay liquid."
            },

            {
                id: 23,
                title: "Gel & Solid-State Electrolytes",
                description:
                    "Leak-free, bendable electrolytes that double as the separator."
            },

            {
                id: 24,
                title: "Choosing an Electrolyte",
                description:
                    "Ion and pore size, temperature, redox-active electrolytes, and a decision guide."
            }

        ]
    },

    /* =====================================
       UNIT 6
    ===================================== */

    {
        id: 6,

        title: "Testing & Metrics",

        description:
            "How supercapacitors are measured: cyclic voltammetry, charge-discharge, impedance, and the formulas and pitfalls behind every reported number.",

        studyModule: {
            title: "Testing & Metrics",
            href: "supercapunit6.html"
        },

        lessons: [

            {
                id: 25,
                title: "How Supercapacitors Get Tested",
                description:
                    "Potentiostats, three- vs. two-electrode cells, and the factor of four."
            },

            {
                id: 26,
                title: "Cyclic Voltammetry in Depth",
                description:
                    "Reading CV shapes, computing capacitance, and scan-rate fingerprints."
            },

            {
                id: 27,
                title: "Charge–Discharge Curves",
                description:
                    "Constant-current cycling: capacitance, IR drop, and coulombic efficiency."
            },

            {
                id: 28,
                title: "Impedance Spectroscopy",
                description:
                    "Nyquist plots, series resistance, diffusion, and the knee frequency."
            },

            {
                id: 29,
                title: "Energy, Power & Normalization",
                description:
                    "Turning data into Wh, W, and Ragone points, per gram, per cm², or per cm³."
            },

            {
                id: 30,
                title: "Stability, Self-Discharge & Honest Reporting",
                description:
                    "Cycle life, leakage, and a checklist for spotting shaky claims."
            }

        ]
    },

    /* =====================================
       UNIT 7
    ===================================== */

    {
        id: 7,

        title: "Fabrication Methods",

        description:
            "How electrodes and devices actually get made: slurries, lithography and pyrolysis, thin films, printing, lasers, growth, and how to choose among them.",

        studyModule: {
            title: "Fabrication Methods",
            href: "supercapunit7.html"
        },

        lessons: [

            {
                id: 31,
                title: "Slurries, Binders & Coating",
                description:
                    "Slurry recipes, doctor-blade casting, and the thickness trade-off."
            },

            {
                id: 32,
                title: "Photolithography & Pyrolysis",
                description:
                    "Patterning polymer with light, then baking it into 3D glassy carbon."
            },

            {
                id: 33,
                title: "Deposition, Etching & Templates",
                description:
                    "Thin films, lift-off, deep etching, and anodized templates."
            },

            {
                id: 34,
                title: "Printing & Laser Writing",
                description:
                    "Mask-free inks, laser-written graphene, and roll-to-roll production."
            },

            {
                id: 35,
                title: "Growing, Plating & Spinning",
                description:
                    "Electrodeposition, direct growth, electrospinning, and fiber devices."
            },

            {
                id: 36,
                title: "Assembly & Choosing a Method",
                description:
                    "Sealing devices, scale-up trade-offs, and a guide to picking a method."
            }

        ]
    },

    /* =====================================
       UNIT 8
    ===================================== */

    {
        id: 8,

        title: "Applications & Frontiers",

        description:
            "Where supercapacitors earn their place: vehicles, grids, electronics, harvesting, the body, and the hybrid devices coming next.",

        studyModule: {
            title: "Applications & Frontiers",
            href: "supercapunit8.html"
        },

        lessons: [

            {
                id: 37,
                title: "Where Supercapacitors Win",
                description:
                    "Power, cycle life, and cost per cycle, compared with batteries."
            },

            {
                id: 38,
                title: "Vehicles & the Grid",
                description:
                    "Regenerative braking, hybrid packs, and grid support."
            },

            {
                id: 39,
                title: "Electronics, IoT & Harvesting",
                description:
                    "Pulse loads, backup power, and buffering tiny harvested energy."
            },

            {
                id: 40,
                title: "Sizing a Supercapacitor",
                description:
                    "Usable energy, hold-up time, and the ESR drop, with worked examples."
            },

            {
                id: 41,
                title: "Wearables & Biomedical",
                description:
                    "Flexible, body-safe power, and how wearables and implants recharge."
            },

            {
                id: 42,
                title: "Hybrids & the Frontier",
                description:
                    "Lithium-ion capacitors, new materials, open problems, and how to choose storage."
            }

        ]
    }

];
