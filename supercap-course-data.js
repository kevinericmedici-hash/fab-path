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
    }

];
