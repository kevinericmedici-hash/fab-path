/* ========================================
   FAB PATH COURSE DATA: MEMS & MICROFABRICATION

   Structure: every unit is a short study module
   (a few slides) followed by one to three Fab
   Challenge quizzes. The eight parts group the
   units for orientation, and lesson ids are the
   same ones the quizzes and saved progress use.
======================================== */

const courseParts = [

    {
        id: 1,
        title: "MEMS Foundations",
        firstUnitId: 1,
        lastUnitId: 3,
        description:
            "Understand what MEMS are, how microscale systems behave, and where they are used."
    },

    {
        id: 2,
        title: "Cleanroom Fundamentals",
        firstUnitId: 4,
        lastUnitId: 6,
        description:
            "Learn contamination control, wafer handling, and cleanroom process discipline."
    },

    {
        id: 3,
        title: "Microfabrication Technology",
        firstUnitId: 7,
        lastUnitId: 12,
        description:
            "Learn semiconductor fabrication, MEMS materials, micromachining, lithography, deposition and etching."
    },

    {
        id: 4,
        title: "PolyMUMPs Fabrication",
        firstUnitId: 13,
        lastUnitId: 16,
        description:
            "Explore a real, commercially available MEMS foundry process — from shared wafers to a released three-layer polysilicon device."
    },

    {
        id: 5,
        title: "MEMS Accelerometer Design",
        firstUnitId: 17,
        lastUnitId: 20,
        description:
            "Study the physics, sensing, and real-world design of the most widely produced MEMS sensor — the accelerometer."
    },

    {
        id: 6,
        title: "Optical MEMS Design",
        firstUnitId: 21,
        lastUnitId: 24,
        description:
            "Explore how MEMS structures control and sense light, from TI's Digital Micromirror Device to modern optical switches."
    },

    {
        id: 7,
        title: "Microfluidics Device Design",
        firstUnitId: 25,
        lastUnitId: 28,
        description:
            "Learn how MEMS-scale channels and acoustic waves manipulate individual cells, through a real acoustophoresis cell-separation chip."
    },

    {
        id: 8,
        title: "MEMS Packaging",
        firstUnitId: 29,
        lastUnitId: 33,
        description:
            "Learn how a finished MEMS die is protected, wired up, and sealed into a real, shippable device."
    }

];

const courseData = [

    {
        id: 1,

        title: "MEMS & the Microscale",

        description:
            "Introduction to microscale mechanical and electrical systems. Understand scale, dimensions, and why size matters.",

        studyModule: {
            title: "MEMS & the Microscale",
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
            }

        ]
    },

    {
        id: 2,

        title: "Scaling Laws",

        description:
            "See how physical forces change at the microscale.",

        studyModule: {
            title: "Scaling Laws",
            href: "unit2.html"
        },

        lessons: [

            {
                id: 3,
                title: "Scaling Laws",
                description:
                    "See how physical forces change at the microscale."
            }

        ]
    },

    {
        id: 3,

        title: "MEMS Applications",

        description:
            "Explore sensors, actuators, biomedical devices and more.",

        studyModule: {
            title: "MEMS Applications",
            href: "unit3.html"
        },

        lessons: [

            {
                id: 4,
                title: "MEMS Applications",
                description:
                    "Explore sensors, actuators, biomedical devices and more."
            }

        ]
    },

    {
        id: 4,

        title: "Cleanroom Basics & Wafer Cleaning",

        description:
            "Learn why cleanrooms are necessary for microfabrication. Learn how wafers are cleaned and why contamination control matters.",

        studyModule: {
            title: "Cleanroom Basics & Wafer Cleaning",
            href: "unit4.html"
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
            }

        ]
    },

    {
        id: 5,

        title: "Gowning & Wafer Handling",

        description:
            "Learn proper gowning, handling, and cleanroom behavior.",

        studyModule: {
            title: "Gowning & Wafer Handling",
            href: "unit5.html"
        },

        lessons: [

            {
                id: 7,
                title: "Gowning & Wafer Handling",
                description:
                    "Learn proper gowning, handling, and cleanroom behavior."
            }

        ]
    },

    {
        id: 6,

        title: "Process Flow & Inspection",

        description:
            "Check the wafer between steps and follow the fabrication sequence.",

        studyModule: {
            title: "Process Flow & Inspection",
            href: "unit6.html"
        },

        lessons: [

            {
                id: 8,
                title: "Inspection & Process Discipline",
                description:
                    "Check the wafer between steps and follow the fabrication sequence."
            }

        ]
    },

    {
        id: 7,

        title: "From ICs to MEMS & Semiconductors",

        description:
            "See how integrated-circuit fabrication became the foundation for MEMS. Learn intrinsic silicon, P-type material, N-type material, holes and electrons.",

        studyModule: {
            title: "From ICs to MEMS & Semiconductors",
            href: "unit7.html"
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
            }

        ]
    },

    {
        id: 8,

        title: "CMOS & Silicon as a MEMS Material",

        description:
            "Understand CMOS devices and repeated layer-by-layer fabrication. Explore why silicon works so well for both electrical and mechanical devices.",

        studyModule: {
            title: "CMOS & Silicon as a MEMS Material",
            href: "unit8.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 9,

        title: "Bulk vs. Surface Micromachining",

        description:
            "Compare the two major approaches to manufacturing MEMS structures.",

        studyModule: {
            title: "Bulk vs. Surface Micromachining",
            href: "unit9.html"
        },

        lessons: [

            {
                id: 13,
                title: "Bulk vs. Surface Micromachining",
                description:
                    "Compare the two major approaches to manufacturing MEMS structures."
            }

        ]
    },

    {
        id: 10,

        title: "Oxidation, Doping & Deposition",

        description:
            "Learn how wafer properties can be modified through oxidation and dopant introduction. Explore CVD, LPCVD, evaporation, sputtering and material-layer formation.",

        studyModule: {
            title: "Oxidation, Doping & Deposition",
            href: "unit10.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 11,

        title: "Lithography & Etching",

        description:
            "Learn how masks and photoresist define microscale patterns. Compare material removal techniques and pattern-transfer behavior.",

        studyModule: {
            title: "Lithography & Etching",
            href: "unit11.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 12,

        title: "Process Integration & a MEMS Build",

        description:
            "Understand surface topography and how fabrication steps work together. Follow a MEMS structure layer by layer from substrate to released device.",

        studyModule: {
            title: "Process Integration & a MEMS Build",
            href: "unit12.html"
        },

        lessons: [

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

    {
        id: 13,

        title: "Multi-User Foundries & the MUMPs Family",

        description:
            "Learn why shared wafer services like MUMPs exist and how they make MEMS prototyping affordable. Compare PolyMUMPs, SOIMUMPs, PiezoMUMPs, and MetalMUMPs, and see PolyMUMPs by the numbers.",

        studyModule: {
            title: "Multi-User Foundries & the MUMPs Family",
            href: "unit13.html"
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
            }

        ]
    },

    {
        id: 14,

        title: "Building the Base & Sacrificial Layers",

        description:
            "Follow the starting wafer through doping, nitride isolation, and the Poly0 ground layer. Learn how PSG sacrificial layers, dimples, and anchor cuts set up moving structures.",

        studyModule: {
            title: "Building the Base & Sacrificial Layers",
            href: "unit14.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 15,

        title: "Structural Layers, Metal & Release",

        description:
            "See how the two structural polysilicon layers are deposited, annealed, and patterned. Learn how the metal layer is added and how an HF bath releases the finished structure.",

        studyModule: {
            title: "Structural Layers, Metal & Release",
            href: "unit15.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 16,

        title: "Build a PolyMUMPs Device",

        description:
            "Trace a complete PolyMUMPs cross-section from substrate to released structure.",

        studyModule: {
            title: "Build a PolyMUMPs Device",
            href: "unit16.html"
        },

        lessons: [

            {
                id: 26,
                title: "Build a PolyMUMPs Device",
                description:
                    "Trace a complete PolyMUMPs cross-section from substrate to released structure."
            }

        ]
    },

    {
        id: 17,

        title: "What Are Accelerometers?",

        description:
            "Learn what accelerometers measure, their history, and where they show up in everyday life.",

        studyModule: {
            title: "What Are Accelerometers?",
            href: "unit17.html"
        },

        lessons: [

            {
                id: 27,
                title: "What Are Accelerometers?",
                description:
                    "Learn what accelerometers measure, their history, and where they show up in everyday life."
            }

        ]
    },

    {
        id: 18,

        title: "Sensing Physics, Sensitivity & Noise",

        description:
            "Model the proof mass as a spring-mass-damper system and learn natural frequency and quality factor. Learn how sensitivity trades off against bandwidth, and what limits an accelerometer's noise floor.",

        studyModule: {
            title: "Sensing Physics, Sensitivity & Noise",
            href: "unit18.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 19,

        title: "Capacitive Position Sensing",

        description:
            "See how displacement becomes a measurable electrical signal through capacitance change.",

        studyModule: {
            title: "Capacitive Position Sensing",
            href: "unit19.html"
        },

        lessons: [

            {
                id: 30,
                title: "Capacitive Position Sensing",
                description:
                    "See how displacement becomes a measurable electrical signal through capacitance change."
            }

        ]
    },

    {
        id: 20,

        title: "Inside the ADXL150",

        description:
            "Study a real commercial accelerometer's structure, die layout, and design specifications. Work through the real capacitance, spring constant, frequency, and quality factor calculations. Bring the physics, sensing, and fabrication together into one complete design.",

        studyModule: {
            title: "Inside the ADXL150",
            href: "unit20.html"
        },

        lessons: [

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

    {
        id: 21,

        title: "Why Optical MEMS & Display Approaches",

        description:
            "Learn why MEMS scales so well for optics, and where optical MEMS show up in the real world. Compare reflective, diffractive, and interferometric approaches to MEMS-based displays.",

        studyModule: {
            title: "Why Optical MEMS & Display Approaches",
            href: "unit21.html"
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
            }

        ]
    },

    {
        id: 22,

        title: "Inside TI's DMD",

        description:
            "See how a Digital Micromirror Device turns a tilting mirror into a projected pixel. Learn the real specs and fabrication process behind TI's Digital Micromirror Device.",

        studyModule: {
            title: "Inside TI's DMD",
            href: "unit22.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 23,

        title: "Tilting Mirrors & Gratings",

        description:
            "Understand the torque balance and pull-in behavior that tips a torsion mirror. Explore the Grating Light Valve and Qualcomm's mirasol as alternatives to tilting mirrors.",

        studyModule: {
            title: "Tilting Mirrors & Gratings",
            href: "unit23.html"
        },

        lessons: [

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
            }

        ]
    },

    {
        id: 24,

        title: "Optical MEMS Beyond Displays",

        description:
            "Discover optical MEMS switches, sensors, and where the technology is headed next.",

        studyModule: {
            title: "Optical MEMS Beyond Displays",
            href: "unit24.html"
        },

        lessons: [

            {
                id: 40,
                title: "Optical MEMS Beyond Displays",
                description:
                    "Discover optical MEMS switches, sensors, and where the technology is headed next."
            }

        ]
    },

    {
        id: 25,

        title: "Microfluidics & Sorting Cells with Sound",

        description:
            "See why MEMS-scale devices are a natural fit for interacting with living cells. Learn how standing acoustic waves separate particles by size inside a microfluidic channel.",

        studyModule: {
            title: "Microfluidics & Sorting Cells with Sound",
            href: "unit25.html"
        },

        lessons: [

            {
                id: 41,
                title: "Why Microfluidics?",
                description:
                    "See why MEMS-scale devices are a natural fit for interacting with living cells."
            },

            {
                id: 42,
                title: "Sorting Cells with Sound",
                description:
                    "Learn how standing acoustic waves separate particles by size inside a microfluidic channel."
            }

        ]
    },

    {
        id: 26,

        title: "The Physics of Acoustic Forces",

        description:
            "Study the acoustic and viscous forces that determine where a particle ends up.",

        studyModule: {
            title: "The Physics of Acoustic Forces",
            href: "unit26.html"
        },

        lessons: [

            {
                id: 43,
                title: "The Physics of Acoustic Forces",
                description:
                    "Study the acoustic and viscous forces that determine where a particle ends up."
            }

        ]
    },

    {
        id: 27,

        title: "Designing & Simulating the Chip",

        description:
            "Work through the real electrode and microchannel dimensions of a working design. See how a finite-element simulation verifies a device's behavior before it's built.",

        studyModule: {
            title: "Designing & Simulating the Chip",
            href: "unit27.html"
        },

        lessons: [

            {
                id: 44,
                title: "Designing the IDT & Channel",
                description:
                    "Work through the real electrode and microchannel dimensions of a working design."
            },

            {
                id: 45,
                title: "Simulating Before Fabricating",
                description:
                    "See how a finite-element simulation verifies a device's behavior before it's built."
            }

        ]
    },

    {
        id: 28,

        title: "Building the Chip",

        description:
            "Learn how metal lift-off patterns electrodes onto a piezoelectric substrate. Bring design, simulation, and fabrication together into one complete device.",

        studyModule: {
            title: "Building the Chip",
            href: "unit28.html"
        },

        lessons: [

            {
                id: 46,
                title: "Building the Chip",
                description:
                    "Learn how metal lift-off patterns electrodes onto a piezoelectric substrate."
            },

            {
                id: 47,
                title: "Build an Acoustophoresis Chip",
                description:
                    "Bring design, simulation, and fabrication together into one complete device."
            }

        ]
    },

    {
        id: 29,

        title: "Why MEMS Packaging & the Big Picture",

        description:
            "Learn the two jobs every MEMS package has to do, and what makes packaging so demanding. See the nine-step process that turns a wafer into finished packages, and how wafer bonding works.",

        studyModule: {
            title: "Why MEMS Packaging & the Big Picture",
            href: "unit29.html"
        },

        lessons: [

            {
                id: 48,
                title: "Why MEMS Packaging?",
                description:
                    "Learn the two jobs every MEMS package has to do, and what makes packaging so demanding."
            },

            {
                id: 49,
                title: "From Die to Shipped Chip",
                description:
                    "See the nine-step process that turns a wafer into finished packages, and how wafer bonding works."
            }

        ]
    },

    {
        id: 30,

        title: "Cutting, Placing & Attaching",

        description:
            "Learn how dies are diced apart, placed into packages, and attached to their substrate.",

        studyModule: {
            title: "Cutting, Placing & Attaching",
            href: "unit30.html"
        },

        lessons: [

            {
                id: 50,
                title: "Cutting, Placing, Attaching",
                description:
                    "Learn how dies are diced apart, placed into packages, and attached to their substrate."
            }

        ]
    },

    {
        id: 31,

        title: "Wiring & Flip-Chip",

        description:
            "Compare wire bonding and flip-chip bonding as ways to connect a die electrically.",

        studyModule: {
            title: "Wiring & Flip-Chip",
            href: "unit31.html"
        },

        lessons: [

            {
                id: 51,
                title: "Wiring & Flip-Chip",
                description:
                    "Compare wire bonding and flip-chip bonding as ways to connect a die electrically."
            }

        ]
    },

    {
        id: 32,

        title: "Encapsulation & Testing",

        description:
            "See how a device is sealed from the environment, then tested before it ships.",

        studyModule: {
            title: "Encapsulation & Testing",
            href: "unit32.html"
        },

        lessons: [

            {
                id: 52,
                title: "Encapsulation & Testing",
                description:
                    "See how a device is sealed from the environment, then tested before it ships."
            }

        ]
    },

    {
        id: 33,

        title: "Wafer-Level Packaging Case Study",

        description:
            "Walk through a real four-phase process for packaging a MEMS device on the wafer itself. Bring fabrication and packaging together into one complete, shippable device.",

        studyModule: {
            title: "Wafer-Level Packaging Case Study",
            href: "unit33.html"
        },

        lessons: [

            {
                id: 53,
                title: "Case Study: Wafer-Level Membrane Packaging",
                description:
                    "Walk through a real four-phase process for packaging a MEMS device on the wafer itself."
            },

            {
                id: 54,
                title: "Build a Packaged MEMS Device",
                description:
                    "Bring fabrication and packaging together into one complete, shippable device."
            }

        ]
    }

];
