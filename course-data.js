/* ========================================
   FAB PATH COURSE DATA
======================================== */

const courseData = [

    /* =====================================
       UNIT 1
    ===================================== */

    {
        id: 1,

        title: "MEMS Foundations",

        description:
            "Understand what MEMS are, how microscale systems behave, and where they are used.",

        studyModule: {
            title: "MEMS Foundations",
            href: "unit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "What Are MEMS?",
                description:
                    "Introduction to microscale mechanical and electrical systems."
            },

            {
                id: 2,
                title: "The Microscale",
                description:
                    "Understand scale, dimensions, and why size matters."
            },

            {
                id: 3,
                title: "Scaling Laws",
                description:
                    "See how physical forces change at the microscale."
            },

            {
                id: 4,
                title: "MEMS Applications",
                description:
                    "Explore sensors, actuators, biomedical devices and more."
            }

        ]
    },


    /* =====================================
       UNIT 2
    ===================================== */

    {
        id: 2,

        title: "Cleanroom Fundamentals",

        description:
            "Learn contamination control, wafer handling, and cleanroom process discipline.",

        studyModule: {
            title: "Cleanroom Fundamentals",
            href: "unit2.html"
        },

        lessons: [

            {
                id: 5,
                title: "Cleanroom Basics",
                description:
                    "Learn why cleanrooms are necessary for microfabrication."
            },

            {
                id: 6,
                title: "Contamination & Wafer Cleaning",
                description:
                    "Learn how wafers are cleaned and why contamination control matters."
            },

            {
                id: 7,
                title: "Gowning & Wafer Handling",
                description:
                    "Learn proper gowning, handling, and cleanroom behavior."
            },

            {
                id: 8,
                title: "Cleanroom Safety",
                description:
                    "Review chemical, equipment, and laboratory safety fundamentals."
            }

        ]
    },


    /* =====================================
       UNIT 3
    ===================================== */

    {
        id: 3,

        title: "Microfabrication Technology",

        description:
            "Learn semiconductor fabrication, MEMS materials, micromachining, lithography, deposition and etching.",

        studyModule: {
            title: "Microfabrication Technology",
            href: "unit3.html"
        },

        lessons: [

            {
                id: 9,
                title: "From ICs to MEMS",
                description:
                    "See how integrated-circuit fabrication became the foundation for MEMS."
            },

            {
                id: 10,
                title: "Semiconductors & Doping",
                description:
                    "Learn intrinsic silicon, P-type material, N-type material, holes and electrons."
            },

            {
                id: 11,
                title: "CMOS Fabrication",
                description:
                    "Understand CMOS devices and repeated layer-by-layer fabrication."
            },

            {
                id: 12,
                title: "Silicon as a MEMS Material",
                description:
                    "Explore why silicon works so well for both electrical and mechanical devices."
            },

            {
                id: 13,
                title: "Bulk vs. Surface Micromachining",
                description:
                    "Compare the two major approaches to manufacturing MEMS structures."
            },

            {
                id: 14,
                title: "Oxidation & Doping",
                description:
                    "Learn how wafer properties can be modified through oxidation and dopant introduction."
            },

            {
                id: 15,
                title: "Thin-Film Deposition",
                description:
                    "Explore CVD, LPCVD, evaporation, sputtering and material-layer formation."
            },

            {
                id: 16,
                title: "Optical Lithography",
                description:
                    "Learn how masks and photoresist define microscale patterns."
            },

            {
                id: 17,
                title: "Wet & Dry Etching",
                description:
                    "Compare material removal techniques and pattern-transfer behavior."
            },

            {
                id: 18,
                title: "Planarization & Process Integration",
                description:
                    "Understand surface topography and how fabrication steps work together."
            },

            {
                id: 19,
                title: "Build a MEMS Device",
                description:
                    "Follow a MEMS structure layer by layer from substrate to released device."
            }

        ]
    },


    /* =====================================
       UNIT 4
    ===================================== */

    {
        id: 4,

        title: "PolyMUMPs Fabrication",

        description:
            "Explore a real, commercially available MEMS foundry process — from shared wafers to a released three-layer polysilicon device.",

        studyModule: {
            title: "PolyMUMPs Fabrication",
            href: "unit4.html"
        },

        lessons: [

            {
                id: 20,
                title: "Multi-User Foundries",
                description:
                    "Learn why shared wafer services like MUMPs exist and how they make MEMS prototyping affordable."
            },

            {
                id: 21,
                title: "The MUMPs Family",
                description:
                    "Compare PolyMUMPs, SOIMUMPs, PiezoMUMPs, and MetalMUMPs, and see PolyMUMPs by the numbers."
            },

            {
                id: 22,
                title: "Building the Base",
                description:
                    "Follow the starting wafer through doping, nitride isolation, and the Poly0 ground layer."
            },

            {
                id: 23,
                title: "Sacrificial Layers & Anchors",
                description:
                    "Learn how PSG sacrificial layers, dimples, and anchor cuts set up moving structures."
            },

            {
                id: 24,
                title: "Poly1 & Poly2: The Structural Layers",
                description:
                    "See how the two structural polysilicon layers are deposited, annealed, and patterned."
            },

            {
                id: 25,
                title: "Metal & Release",
                description:
                    "Learn how the metal layer is added and how an HF bath releases the finished structure."
            },

            {
                id: 26,
                title: "Build a PolyMUMPs Device",
                description:
                    "Trace a complete PolyMUMPs cross-section from substrate to released structure."
            }

        ]
    },


    /* =====================================
       UNIT 5
    ===================================== */

    {
        id: 5,

        title: "MEMS Accelerometer Design",

        description:
            "Study the physics, sensing, and real-world design of the most widely produced MEMS sensor — the accelerometer.",

        studyModule: {
            title: "MEMS Accelerometer Design",
            href: "unit5.html"
        },

        lessons: [

            {
                id: 27,
                title: "What Are Accelerometers?",
                description:
                    "Learn what accelerometers measure, their history, and where they show up in everyday life."
            },

            {
                id: 28,
                title: "The Physics of Sensing",
                description:
                    "Model the proof mass as a spring-mass-damper system and learn natural frequency and quality factor."
            },

            {
                id: 29,
                title: "Sensitivity & Noise",
                description:
                    "Learn how sensitivity trades off against bandwidth, and what limits an accelerometer's noise floor."
            },

            {
                id: 30,
                title: "Capacitive Position Sensing",
                description:
                    "See how displacement becomes a measurable electrical signal through capacitance change."
            },

            {
                id: 31,
                title: "Inside the ADXL150",
                description:
                    "Study a real commercial accelerometer's structure, die layout, and design specifications."
            },

            {
                id: 32,
                title: "Designing the Springs",
                description:
                    "Work through the real capacitance, spring constant, frequency, and quality factor calculations."
            },

            {
                id: 33,
                title: "Build an Accelerometer",
                description:
                    "Bring the physics, sensing, and fabrication together into one complete design."
            }

        ]
    },


    /* =====================================
       UNIT 6
    ===================================== */

    {
        id: 6,

        title: "Optical MEMS Design",

        description:
            "Explore how MEMS structures control and sense light, from TI's Digital Micromirror Device to modern optical switches.",

        studyModule: {
            title: "Optical MEMS Design",
            href: "unit6.html"
        },

        lessons: [

            {
                id: 34,
                title: "Why MEMS for Optics?",
                description:
                    "Learn why MEMS scales so well for optics, and where optical MEMS show up in the real world."
            },

            {
                id: 35,
                title: "Three Ways to Build a MEMS Display",
                description:
                    "Compare reflective, diffractive, and interferometric approaches to MEMS-based displays."
            },

            {
                id: 36,
                title: "Inside TI's DMD",
                description:
                    "See how a Digital Micromirror Device turns a tilting mirror into a projected pixel."
            },

            {
                id: 37,
                title: "DMD by the Numbers",
                description:
                    "Learn the real specs and fabrication process behind TI's Digital Micromirror Device."
            },

            {
                id: 38,
                title: "The Physics of Tilting Mirrors",
                description:
                    "Understand the torque balance and pull-in behavior that tips a torsion mirror."
            },

            {
                id: 39,
                title: "Gratings & Interferometric Displays",
                description:
                    "Explore the Grating Light Valve and Qualcomm's mirasol as alternatives to tilting mirrors."
            },

            {
                id: 40,
                title: "Optical MEMS Beyond Displays",
                description:
                    "Discover optical MEMS switches, sensors, and where the technology is headed next."
            }

        ]
    }

];

