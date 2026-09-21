/* ========================================
   SUPERCAPACITORS COURSE DATA
   Grounded in Kevin Medici's MS thesis:
   "New Generation of High-Power Density 3D
   Interdigitated Supercapacitors" (SDSU, 2026)

   Structure: every unit is a short study module
   (a few slides) followed by one Fab Challenge
   quiz, and lesson ids match unit ids. The eight
   parts group the 42 units for orientation.
======================================== */

const supercapCourseParts = [

    {
        id: 1,
        title: "Supercapacitor Fundamentals",
        firstUnitId: 1,
        lastUnitId: 4,
        description:
            "Where supercapacitors fit between batteries and capacitors, and the equations that govern charge storage."
    },

    {
        id: 2,
        title: "Charge Storage Mechanisms",
        firstUnitId: 5,
        lastUnitId: 8,
        description:
            "How supercapacitors actually store charge: double layers, fast surface redox reactions, and redox amplification."
    },

    {
        id: 3,
        title: "Electrode Materials",
        firstUnitId: 9,
        lastUnitId: 12,
        description:
            "What an electrode needs to do, the three material families, and why glassy carbon stands out for micro devices."
    },

    {
        id: 4,
        title: "Device Geometries",
        firstUnitId: 13,
        lastUnitId: 18,
        description:
            "From wound cylinders and coin cells to combs, fibers, and stretchable films: how shape sets what a supercapacitor can do."
    },

    {
        id: 5,
        title: "Electrolytes",
        firstUnitId: 19,
        lastUnitId: 24,
        description:
            "The ions between the electrodes: what an electrolyte does, where its voltage window ends, and how water, organic, ionic-liquid, and gel families compare."
    },

    {
        id: 6,
        title: "Testing & Metrics",
        firstUnitId: 25,
        lastUnitId: 30,
        description:
            "How supercapacitors are measured: cyclic voltammetry, charge-discharge, impedance, and the formulas and pitfalls behind every reported number."
    },

    {
        id: 7,
        title: "Fabrication Methods",
        firstUnitId: 31,
        lastUnitId: 36,
        description:
            "How electrodes and devices actually get made: slurries, lithography and pyrolysis, thin films, printing, lasers, growth, and how to choose among them."
    },

    {
        id: 8,
        title: "Applications & Frontiers",
        firstUnitId: 37,
        lastUnitId: 42,
        description:
            "Where supercapacitors earn their place: vehicles, grids, electronics, harvesting, the body, and the hybrid devices coming next."
    }

];

const supercapCourseData = [

    {
        id: 1,

        title: "Why Supercapacitors?",

        description:
            "The Ragone plot, and why batteries, capacitors, and supercapacitors trade off energy against power.",

        studyModule: {
            title: "Why Supercapacitors?",
            href: "supercapunit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "Why Supercapacitors?",
                description:
                    "The Ragone plot, and why batteries, capacitors, and supercapacitors trade off energy against power."
            }

        ]
    },

    {
        id: 2,

        title: "Inside a Conventional Capacitor",

        description:
            "Dielectrics, plates, and why ordinary capacitors trade energy density for speed.",

        studyModule: {
            title: "Inside a Conventional Capacitor",
            href: "supercapunit2.html"
        },

        lessons: [

            {
                id: 2,
                title: "Inside a Conventional Capacitor",
                description:
                    "Dielectrics, plates, and why ordinary capacitors trade energy density for speed."
            }

        ]
    },

    {
        id: 3,

        title: "Charge, Capacitance & Energy",

        description:
            "The core equations behind how much charge and energy an electrode can store.",

        studyModule: {
            title: "Charge, Capacitance & Energy",
            href: "supercapunit3.html"
        },

        lessons: [

            {
                id: 3,
                title: "Charge, Capacitance & Energy",
                description:
                    "The core equations behind how much charge and energy an electrode can store."
            }

        ]
    },

    {
        id: 4,

        title: "Reading a CV Curve",

        description:
            "The Randles-Ševčík equation and what a cyclic voltammogram's peak current tells you.",

        studyModule: {
            title: "Reading a CV Curve",
            href: "supercapunit4.html"
        },

        lessons: [

            {
                id: 4,
                title: "Reading a CV Curve",
                description:
                    "The Randles-Ševčík equation and what a cyclic voltammogram's peak current tells you."
            }

        ]
    },

    {
        id: 5,

        title: "Three Kinds of Supercapacitor",

        description:
            "EDLCs, pseudocapacitors, and hybrids — and how surface storage differs from a battery.",

        studyModule: {
            title: "Three Kinds of Supercapacitor",
            href: "supercapunit5.html"
        },

        lessons: [

            {
                id: 5,
                title: "Three Kinds of Supercapacitor",
                description:
                    "EDLCs, pseudocapacitors, and hybrids — and how surface storage differs from a battery."
            }

        ]
    },

    {
        id: 6,

        title: "The Electric Double Layer",

        description:
            "How ions pile up at an electrode surface to store charge electrostatically.",

        studyModule: {
            title: "The Electric Double Layer",
            href: "supercapunit6.html"
        },

        lessons: [

            {
                id: 6,
                title: "The Electric Double Layer",
                description:
                    "How ions pile up at an electrode surface to store charge electrostatically."
            }

        ]
    },

    {
        id: 7,

        title: "Pseudocapacitance",

        description:
            "Fast, reversible redox reactions that store more charge — at a cost.",

        studyModule: {
            title: "Pseudocapacitance",
            href: "supercapunit7.html"
        },

        lessons: [

            {
                id: 7,
                title: "Pseudocapacitance",
                description:
                    "Fast, reversible redox reactions that store more charge — at a cost."
            }

        ]
    },

    {
        id: 8,

        title: "Redox Amplification",

        description:
            "How closely spaced interdigitated electrodes recycle redox species to amplify current.",

        studyModule: {
            title: "Redox Amplification",
            href: "supercapunit8.html"
        },

        lessons: [

            {
                id: 8,
                title: "Redox Amplification",
                description:
                    "How closely spaced interdigitated electrodes recycle redox species to amplify current."
            }

        ]
    },

    {
        id: 9,

        title: "What Makes a Good Electrode",

        description:
            "The properties an ideal electrode needs, and the three families of materials to choose from.",

        studyModule: {
            title: "What Makes a Good Electrode",
            href: "supercapunit9.html"
        },

        lessons: [

            {
                id: 9,
                title: "What Makes a Good Electrode",
                description:
                    "The properties an ideal electrode needs, and the three families of materials to choose from."
            }

        ]
    },

    {
        id: 10,

        title: "Metal Oxides & Conducting Polymers",

        description:
            "High-capacitance pseudocapacitive materials, and what they cost you in stability.",

        studyModule: {
            title: "Metal Oxides & Conducting Polymers",
            href: "supercapunit10.html"
        },

        lessons: [

            {
                id: 10,
                title: "Metal Oxides & Conducting Polymers",
                description:
                    "High-capacitance pseudocapacitive materials, and what they cost you in stability."
            }

        ]
    },

    {
        id: 11,

        title: "The Carbon Family",

        description:
            "Activated carbon, graphene, nanotubes, and aerogels — strengths and catches of each.",

        studyModule: {
            title: "The Carbon Family",
            href: "supercapunit11.html"
        },

        lessons: [

            {
                id: 11,
                title: "The Carbon Family",
                description:
                    "Activated carbon, graphene, nanotubes, and aerogels — strengths and catches of each."
            }

        ]
    },

    {
        id: 12,

        title: "Glassy Carbon",

        description:
            "A pyrolyzed, non-graphitizing carbon that can be patterned with photolithography.",

        studyModule: {
            title: "Glassy Carbon",
            href: "supercapunit12.html"
        },

        lessons: [

            {
                id: 12,
                title: "Glassy Carbon",
                description:
                    "A pyrolyzed, non-graphitizing carbon that can be patterned with photolithography."
            }

        ]
    },

    {
        id: 13,

        title: "Macro Form Factors",

        description:
            "Cylindrical, coin/button, and pouch cells, and how cells combine into modules.",

        studyModule: {
            title: "Macro Form Factors",
            href: "supercapunit13.html"
        },

        lessons: [

            {
                id: 13,
                title: "Macro Form Factors",
                description:
                    "Cylindrical, coin/button, and pouch cells, and how cells combine into modules."
            }

        ]
    },

    {
        id: 14,

        title: "Sandwich vs. In-Plane",

        description:
            "Stacked electrodes with a separator, or side-by-side electrodes with a gap.",

        studyModule: {
            title: "Sandwich vs. In-Plane",
            href: "supercapunit14.html"
        },

        lessons: [

            {
                id: 14,
                title: "Sandwich vs. In-Plane",
                description:
                    "Stacked electrodes with a separator, or side-by-side electrodes with a gap."
            }

        ]
    },

    {
        id: 15,

        title: "Interdigitated Micro Architectures",

        description:
            "Combs, spirals, and 3D fingers for on-chip energy storage.",

        studyModule: {
            title: "Interdigitated Micro Architectures",
            href: "supercapunit15.html"
        },

        lessons: [

            {
                id: 15,
                title: "Interdigitated Micro Architectures",
                description:
                    "Combs, spirals, and 3D fingers for on-chip energy storage."
            }

        ]
    },

    {
        id: 16,

        title: "Fiber, Wire & Textile",

        description:
            "Parallel, twisted, and coaxial fibers that can be woven into fabric.",

        studyModule: {
            title: "Fiber, Wire & Textile",
            href: "supercapunit16.html"
        },

        lessons: [

            {
                id: 16,
                title: "Fiber, Wire & Textile",
                description:
                    "Parallel, twisted, and coaxial fibers that can be woven into fabric."
            }

        ]
    },

    {
        id: 17,

        title: "Shape-Shifting Devices",

        description:
            "Stretchable, origami, printed, transparent, structural, and implantable forms.",

        studyModule: {
            title: "Shape-Shifting Devices",
            href: "supercapunit17.html"
        },

        lessons: [

            {
                id: 17,
                title: "Shape-Shifting Devices",
                description:
                    "Stretchable, origami, printed, transparent, structural, and implantable forms."
            }

        ]
    },

    {
        id: 18,

        title: "Symmetric vs. Asymmetric",

        description:
            "Why pairing the same or different electrodes changes voltage, capacity, and mass balance.",

        studyModule: {
            title: "Symmetric vs. Asymmetric",
            href: "supercapunit18.html"
        },

        lessons: [

            {
                id: 18,
                title: "Symmetric vs. Asymmetric",
                description:
                    "Why pairing the same or different electrodes changes voltage, capacity, and mass balance."
            }

        ]
    },

    {
        id: 19,

        title: "What the Electrolyte Does",

        description:
            "Ion source, ion highway, and electron blocker, and how conductivity steers power.",

        studyModule: {
            title: "What the Electrolyte Does",
            href: "supercapunit19.html"
        },

        lessons: [

            {
                id: 19,
                title: "What the Electrolyte Does",
                description:
                    "Ion source, ion highway, and electron blocker, and how conductivity steers power."
            }

        ]
    },

    {
        id: 20,

        title: "The Voltage Window",

        description:
            "Why voltage is worth more than capacitance, and what limits it.",

        studyModule: {
            title: "The Voltage Window",
            href: "supercapunit20.html"
        },

        lessons: [

            {
                id: 20,
                title: "The Voltage Window",
                description:
                    "Why voltage is worth more than capacitance, and what limits it."
            }

        ]
    },

    {
        id: 21,

        title: "Aqueous Electrolytes",

        description:
            "Acidic, alkaline, and neutral water-based electrolytes, and the 1.23 V ceiling.",

        studyModule: {
            title: "Aqueous Electrolytes",
            href: "supercapunit21.html"
        },

        lessons: [

            {
                id: 21,
                title: "Aqueous Electrolytes",
                description:
                    "Acidic, alkaline, and neutral water-based electrolytes, and the 1.23 V ceiling."
            }

        ]
    },

    {
        id: 22,

        title: "Organic Electrolytes & Ionic Liquids",

        description:
            "Wider windows from solvents that don't split and salts that stay liquid.",

        studyModule: {
            title: "Organic Electrolytes & Ionic Liquids",
            href: "supercapunit22.html"
        },

        lessons: [

            {
                id: 22,
                title: "Organic Electrolytes & Ionic Liquids",
                description:
                    "Wider windows from solvents that don't split and salts that stay liquid."
            }

        ]
    },

    {
        id: 23,

        title: "Gel & Solid-State Electrolytes",

        description:
            "Leak-free, bendable electrolytes that double as the separator.",

        studyModule: {
            title: "Gel & Solid-State Electrolytes",
            href: "supercapunit23.html"
        },

        lessons: [

            {
                id: 23,
                title: "Gel & Solid-State Electrolytes",
                description:
                    "Leak-free, bendable electrolytes that double as the separator."
            }

        ]
    },

    {
        id: 24,

        title: "Choosing an Electrolyte",

        description:
            "Ion and pore size, temperature, redox-active electrolytes, and a decision guide.",

        studyModule: {
            title: "Choosing an Electrolyte",
            href: "supercapunit24.html"
        },

        lessons: [

            {
                id: 24,
                title: "Choosing an Electrolyte",
                description:
                    "Ion and pore size, temperature, redox-active electrolytes, and a decision guide."
            }

        ]
    },

    {
        id: 25,

        title: "How Supercapacitors Get Tested",

        description:
            "Potentiostats, three- vs. two-electrode cells, and the factor of four.",

        studyModule: {
            title: "How Supercapacitors Get Tested",
            href: "supercapunit25.html"
        },

        lessons: [

            {
                id: 25,
                title: "How Supercapacitors Get Tested",
                description:
                    "Potentiostats, three- vs. two-electrode cells, and the factor of four."
            }

        ]
    },

    {
        id: 26,

        title: "Cyclic Voltammetry in Depth",

        description:
            "Reading CV shapes, computing capacitance, and scan-rate fingerprints.",

        studyModule: {
            title: "Cyclic Voltammetry in Depth",
            href: "supercapunit26.html"
        },

        lessons: [

            {
                id: 26,
                title: "Cyclic Voltammetry in Depth",
                description:
                    "Reading CV shapes, computing capacitance, and scan-rate fingerprints."
            }

        ]
    },

    {
        id: 27,

        title: "Charge–Discharge Curves",

        description:
            "Constant-current cycling: capacitance, IR drop, and coulombic efficiency.",

        studyModule: {
            title: "Charge–Discharge Curves",
            href: "supercapunit27.html"
        },

        lessons: [

            {
                id: 27,
                title: "Charge–Discharge Curves",
                description:
                    "Constant-current cycling: capacitance, IR drop, and coulombic efficiency."
            }

        ]
    },

    {
        id: 28,

        title: "Impedance Spectroscopy",

        description:
            "Nyquist plots, series resistance, diffusion, and the knee frequency.",

        studyModule: {
            title: "Impedance Spectroscopy",
            href: "supercapunit28.html"
        },

        lessons: [

            {
                id: 28,
                title: "Impedance Spectroscopy",
                description:
                    "Nyquist plots, series resistance, diffusion, and the knee frequency."
            }

        ]
    },

    {
        id: 29,

        title: "Energy, Power & Normalization",

        description:
            "Turning data into Wh, W, and Ragone points, per gram, per cm², or per cm³.",

        studyModule: {
            title: "Energy, Power & Normalization",
            href: "supercapunit29.html"
        },

        lessons: [

            {
                id: 29,
                title: "Energy, Power & Normalization",
                description:
                    "Turning data into Wh, W, and Ragone points, per gram, per cm², or per cm³."
            }

        ]
    },

    {
        id: 30,

        title: "Stability, Self-Discharge & Honest Reporting",

        description:
            "Cycle life, leakage, and a checklist for spotting shaky claims.",

        studyModule: {
            title: "Stability, Self-Discharge & Honest Reporting",
            href: "supercapunit30.html"
        },

        lessons: [

            {
                id: 30,
                title: "Stability, Self-Discharge & Honest Reporting",
                description:
                    "Cycle life, leakage, and a checklist for spotting shaky claims."
            }

        ]
    },

    {
        id: 31,

        title: "Slurries, Binders & Coating",

        description:
            "Slurry recipes, doctor-blade casting, and the thickness trade-off.",

        studyModule: {
            title: "Slurries, Binders & Coating",
            href: "supercapunit31.html"
        },

        lessons: [

            {
                id: 31,
                title: "Slurries, Binders & Coating",
                description:
                    "Slurry recipes, doctor-blade casting, and the thickness trade-off."
            }

        ]
    },

    {
        id: 32,

        title: "Photolithography & Pyrolysis",

        description:
            "Patterning polymer with light, then baking it into 3D glassy carbon.",

        studyModule: {
            title: "Photolithography & Pyrolysis",
            href: "supercapunit32.html"
        },

        lessons: [

            {
                id: 32,
                title: "Photolithography & Pyrolysis",
                description:
                    "Patterning polymer with light, then baking it into 3D glassy carbon."
            }

        ]
    },

    {
        id: 33,

        title: "Deposition, Etching & Templates",

        description:
            "Thin films, lift-off, deep etching, and anodized templates.",

        studyModule: {
            title: "Deposition, Etching & Templates",
            href: "supercapunit33.html"
        },

        lessons: [

            {
                id: 33,
                title: "Deposition, Etching & Templates",
                description:
                    "Thin films, lift-off, deep etching, and anodized templates."
            }

        ]
    },

    {
        id: 34,

        title: "Printing & Laser Writing",

        description:
            "Mask-free inks, laser-written graphene, and roll-to-roll production.",

        studyModule: {
            title: "Printing & Laser Writing",
            href: "supercapunit34.html"
        },

        lessons: [

            {
                id: 34,
                title: "Printing & Laser Writing",
                description:
                    "Mask-free inks, laser-written graphene, and roll-to-roll production."
            }

        ]
    },

    {
        id: 35,

        title: "Growing, Plating & Spinning",

        description:
            "Electrodeposition, direct growth, electrospinning, and fiber devices.",

        studyModule: {
            title: "Growing, Plating & Spinning",
            href: "supercapunit35.html"
        },

        lessons: [

            {
                id: 35,
                title: "Growing, Plating & Spinning",
                description:
                    "Electrodeposition, direct growth, electrospinning, and fiber devices."
            }

        ]
    },

    {
        id: 36,

        title: "Assembly & Choosing a Method",

        description:
            "Sealing devices, scale-up trade-offs, and a guide to picking a method.",

        studyModule: {
            title: "Assembly & Choosing a Method",
            href: "supercapunit36.html"
        },

        lessons: [

            {
                id: 36,
                title: "Assembly & Choosing a Method",
                description:
                    "Sealing devices, scale-up trade-offs, and a guide to picking a method."
            }

        ]
    },

    {
        id: 37,

        title: "Where Supercapacitors Win",

        description:
            "Power, cycle life, and cost per cycle, compared with batteries.",

        studyModule: {
            title: "Where Supercapacitors Win",
            href: "supercapunit37.html"
        },

        lessons: [

            {
                id: 37,
                title: "Where Supercapacitors Win",
                description:
                    "Power, cycle life, and cost per cycle, compared with batteries."
            }

        ]
    },

    {
        id: 38,

        title: "Vehicles & the Grid",

        description:
            "Regenerative braking, hybrid packs, and grid support.",

        studyModule: {
            title: "Vehicles & the Grid",
            href: "supercapunit38.html"
        },

        lessons: [

            {
                id: 38,
                title: "Vehicles & the Grid",
                description:
                    "Regenerative braking, hybrid packs, and grid support."
            }

        ]
    },

    {
        id: 39,

        title: "Electronics, IoT & Harvesting",

        description:
            "Pulse loads, backup power, and buffering tiny harvested energy.",

        studyModule: {
            title: "Electronics, IoT & Harvesting",
            href: "supercapunit39.html"
        },

        lessons: [

            {
                id: 39,
                title: "Electronics, IoT & Harvesting",
                description:
                    "Pulse loads, backup power, and buffering tiny harvested energy."
            }

        ]
    },

    {
        id: 40,

        title: "Sizing a Supercapacitor",

        description:
            "Usable energy, hold-up time, and the ESR drop, with worked examples.",

        studyModule: {
            title: "Sizing a Supercapacitor",
            href: "supercapunit40.html"
        },

        lessons: [

            {
                id: 40,
                title: "Sizing a Supercapacitor",
                description:
                    "Usable energy, hold-up time, and the ESR drop, with worked examples."
            }

        ]
    },

    {
        id: 41,

        title: "Wearables & Biomedical",

        description:
            "Flexible, body-safe power, and how wearables and implants recharge.",

        studyModule: {
            title: "Wearables & Biomedical",
            href: "supercapunit41.html"
        },

        lessons: [

            {
                id: 41,
                title: "Wearables & Biomedical",
                description:
                    "Flexible, body-safe power, and how wearables and implants recharge."
            }

        ]
    },

    {
        id: 42,

        title: "Hybrids & the Frontier",

        description:
            "Lithium-ion capacitors, new materials, open problems, and how to choose storage.",

        studyModule: {
            title: "Hybrids & the Frontier",
            href: "supercapunit42.html"
        },

        lessons: [

            {
                id: 42,
                title: "Hybrids & the Frontier",
                description:
                    "Lithium-ion capacitors, new materials, open problems, and how to choose storage."
            }

        ]
    }

];
