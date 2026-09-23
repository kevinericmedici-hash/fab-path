/* ========================================
   SAND TO CHIP COURSE DATA
   Units 1 to 36 are built. Each unit is a short
   study module followed by one Fab Challenge
   quiz, and lesson ids match unit ids. Units are
   grouped into six parts. Planned next: packaging
   and test, and the industry.
======================================== */

const chipCourseParts = [

    {
        id: 1,
        title: "From Sand to Wafer",
        firstUnitId: 1,
        lastUnitId: 6,
        description:
            "How quartz sand becomes a flawless silicon wafer: what a chip is, why silicon, purification, crystal growth, wafer finishing, and the cleanroom."
    },

    {
        id: 2,
        title: "Building the Layers",
        firstUnitId: 7,
        lastUnitId: 12,
        description:
            "How a fab adds, removes, and smooths thin films: oxidation, deposition, atomic layer deposition, etching, and chemical mechanical polishing."
    },

    {
        id: 3,
        title: "Printing the Pattern",
        firstUnitId: 13,
        lastUnitId: 18,
        description:
            "How a fab prints the shapes of a chip: photoresist, masks, scanners, resolution, immersion, multi-patterning, and EUV lithography."
    },

    {
        id: 4,
        title: "Doping and the Transistor",
        firstUnitId: 19,
        lastUnitId: 24,
        description:
            "How a fab turns doped silicon into a working switch: diffusion, ion implantation, annealing, wells, junctions, and the source, drain, and gate of a real transistor."
    },

    {
        id: 5,
        title: "The CMOS Process Flow",
        firstUnitId: 25,
        lastUnitId: 30,
        description:
            "How a finished transistor becomes a working chip: front-end and back-end, contacts, the metal stack, logic gates, design rules, and the whole flow from bare wafer to a tested die."
    },

    {
        id: 6,
        title: "Yield and Metrology",
        firstUnitId: 31,
        lastUnitId: 36,
        description:
            "How a fab knows whether it built what it meant to: defects, measurement, wafer maps, statistical control, and the models that turn all of it into a yield number."
    }

];

const chipCourseData = [

    {
        id: 1,

        title: "What Is a Chip?",

        description:
            "Wafers, dies, transistors, node names, and the four verbs of a fab.",

        studyModule: {
            title: "What Is a Chip?",
            href: "chipunit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "What Is a Chip?",
                description:
                    "Wafers, dies, transistors, node names, and the four verbs of a fab."
            }

        ]
    },

    {
        id: 2,

        title: "Why Silicon?",

        description:
            "Why silicon beats the alternatives, and where other materials still win.",

        studyModule: {
            title: "Why Silicon?",
            href: "chipunit2.html"
        },

        lessons: [

            {
                id: 2,
                title: "Why Silicon?",
                description:
                    "Why silicon beats the alternatives, and where other materials still win."
            }

        ]
    },

    {
        id: 3,

        title: "Sand to Polysilicon",

        description:
            "Turning quartz sand into ultra-pure polysilicon.",

        studyModule: {
            title: "Sand to Polysilicon",
            href: "chipunit3.html"
        },

        lessons: [

            {
                id: 3,
                title: "Sand to Polysilicon",
                description:
                    "Turning quartz sand into ultra-pure polysilicon."
            }

        ]
    },

    {
        id: 4,

        title: "Growing the Crystal",

        description:
            "Czochralski crystal growth, doping the melt, and float-zone silicon.",

        studyModule: {
            title: "Growing the Crystal",
            href: "chipunit4.html"
        },

        lessons: [

            {
                id: 4,
                title: "Growing the Crystal",
                description:
                    "Czochralski crystal growth, doping the melt, and float-zone silicon."
            }

        ]
    },

    {
        id: 5,

        title: "Ingot to Wafer",

        description:
            "Slicing, lapping, and polishing an ingot into a finished wafer.",

        studyModule: {
            title: "Ingot to Wafer",
            href: "chipunit5.html"
        },

        lessons: [

            {
                id: 5,
                title: "Ingot to Wafer",
                description:
                    "Slicing, lapping, and polishing an ingot into a finished wafer."
            }

        ]
    },

    {
        id: 6,

        title: "Inside the Fab",

        description:
            "Cleanrooms, the FEOL-to-BEOL stack, cycle time, and dies per wafer.",

        studyModule: {
            title: "Inside the Fab",
            href: "chipunit6.html"
        },

        lessons: [

            {
                id: 6,
                title: "Inside the Fab",
                description:
                    "Cleanrooms, the FEOL-to-BEOL stack, cycle time, and dies per wafer."
            }

        ]
    },

    {
        id: 7,

        title: "Growing Oxide",

        description:
            "Thermal oxidation, dry versus wet growth, and why the gate oxide had to change.",

        studyModule: {
            title: "Growing Oxide",
            href: "chipunit7.html"
        },

        lessons: [

            {
                id: 7,
                title: "Growing Oxide",
                description:
                    "Thermal oxidation, dry versus wet growth, and why the gate oxide had to change."
            }

        ]
    },

    {
        id: 8,

        title: "Chemical Vapor Deposition",

        description:
            "Building films from gases: CVD, LPCVD, PECVD, epitaxy, and step coverage.",

        studyModule: {
            title: "Chemical Vapor Deposition",
            href: "chipunit8.html"
        },

        lessons: [

            {
                id: 8,
                title: "Chemical Vapor Deposition",
                description:
                    "Building films from gases: CVD, LPCVD, PECVD, epitaxy, and step coverage."
            }

        ]
    },

    {
        id: 9,

        title: "Metals and Atomic Layers",

        description:
            "Sputtering, evaporation, copper plating, and atomic layer deposition.",

        studyModule: {
            title: "Metals and Atomic Layers",
            href: "chipunit9.html"
        },

        lessons: [

            {
                id: 9,
                title: "Metals and Atomic Layers",
                description:
                    "Sputtering, evaporation, copper plating, and atomic layer deposition."
            }

        ]
    },

    {
        id: 10,

        title: "Etching",

        description:
            "Wet and dry etch, isotropic and anisotropic profiles, and selectivity.",

        studyModule: {
            title: "Etching",
            href: "chipunit10.html"
        },

        lessons: [

            {
                id: 10,
                title: "Etching",
                description:
                    "Wet and dry etch, isotropic and anisotropic profiles, and selectivity."
            }

        ]
    },

    {
        id: 11,

        title: "Planarization (CMP)",

        description:
            "Why wafers get polished mid-process, and what dishing and erosion are.",

        studyModule: {
            title: "Planarization (CMP)",
            href: "chipunit11.html"
        },

        lessons: [

            {
                id: 11,
                title: "Planarization (CMP)",
                description:
                    "Why wafers get polished mid-process, and what dishing and erosion are."
            }

        ]
    },

    {
        id: 12,

        title: "Layers in Action",

        description:
            "Cleans, shallow trench isolation, copper damascene, and matching tool to film.",

        studyModule: {
            title: "Layers in Action",
            href: "chipunit12.html"
        },

        lessons: [

            {
                id: 12,
                title: "Layers in Action",
                description:
                    "Cleans, shallow trench isolation, copper damascene, and matching tool to film."
            }

        ]
    },

    {
        id: 13,

        title: "What Is Lithography?",

        description:
            "Photoresist, masks, reticles, and the litho loop.",

        studyModule: {
            title: "What Is Lithography?",
            href: "chipunit13.html"
        },

        lessons: [

            {
                id: 13,
                title: "What Is Lithography?",
                description:
                    "Photoresist, masks, reticles, and the litho loop."
            }

        ]
    },

    {
        id: 14,

        title: "The Photoresist Process",

        description:
            "Spin coat, bake, expose, develop, and strip.",

        studyModule: {
            title: "The Photoresist Process",
            href: "chipunit14.html"
        },

        lessons: [

            {
                id: 14,
                title: "The Photoresist Process",
                description:
                    "Spin coat, bake, expose, develop, and strip."
            }

        ]
    },

    {
        id: 15,

        title: "Light, Lenses, and Resolution",

        description:
            "Wavelength, numerical aperture, k₁, and depth of focus.",

        studyModule: {
            title: "Light, Lenses, and Resolution",
            href: "chipunit15.html"
        },

        lessons: [

            {
                id: 15,
                title: "Light, Lenses, and Resolution",
                description:
                    "Wavelength, numerical aperture, k₁, and depth of focus."
            }

        ]
    },

    {
        id: 16,

        title: "Masks, Overlay, and Scanners",

        description:
            "Reticles, 4× reduction, step-and-scan, alignment, and OPC.",

        studyModule: {
            title: "Masks, Overlay, and Scanners",
            href: "chipunit16.html"
        },

        lessons: [

            {
                id: 16,
                title: "Masks, Overlay, and Scanners",
                description:
                    "Reticles, 4× reduction, step-and-scan, alignment, and OPC."
            }

        ]
    },

    {
        id: 17,

        title: "Immersion, Multi-Patterning, and EUV",

        description:
            "How fabs kept printing smaller features.",

        studyModule: {
            title: "Immersion, Multi-Patterning, and EUV",
            href: "chipunit17.html"
        },

        lessons: [

            {
                id: 17,
                title: "Immersion, Multi-Patterning, and EUV",
                description:
                    "How fabs kept printing smaller features."
            }

        ]
    },

    {
        id: 18,

        title: "Process Control and Alternatives",

        description:
            "Process window, defects, stochastics, and other ways to pattern.",

        studyModule: {
            title: "Process Control and Alternatives",
            href: "chipunit18.html"
        },

        lessons: [

            {
                id: 18,
                title: "Process Control and Alternatives",
                description:
                    "Process window, defects, stochastics, and other ways to pattern."
            }

        ]
    },

    {
        id: 19,

        title: "Why Dope Silicon?",

        description:
            "Why pure silicon needs controlled impurities, and what a p-n junction does.",

        studyModule: {
            title: "Why Dope Silicon?",
            href: "chipunit19.html"
        },

        lessons: [

            {
                id: 19,
                title: "Why Dope Silicon?",
                description:
                    "Why pure silicon needs controlled impurities, and what a p-n junction does."
            }

        ]
    },

    {
        id: 20,

        title: "Diffusion Doping",

        description:
            "The oldest way to move dopant into silicon: predeposition and drive-in.",

        studyModule: {
            title: "Diffusion Doping",
            href: "chipunit20.html"
        },

        lessons: [

            {
                id: 20,
                title: "Diffusion Doping",
                description:
                    "The oldest way to move dopant into silicon: predeposition and drive-in."
            }

        ]
    },

    {
        id: 21,

        title: "Ion Implantation",

        description:
            "The modern way to dope silicon: firing dopant atoms in as a beam of ions.",

        studyModule: {
            title: "Ion Implantation",
            href: "chipunit21.html"
        },

        lessons: [

            {
                id: 21,
                title: "Ion Implantation",
                description:
                    "The modern way to dope silicon: firing dopant atoms in as a beam of ions."
            }

        ]
    },

    {
        id: 22,

        title: "Annealing & Activation",

        description:
            "Repairing implant damage and activating dopants without letting them spread.",

        studyModule: {
            title: "Annealing & Activation",
            href: "chipunit22.html"
        },

        lessons: [

            {
                id: 22,
                title: "Annealing & Activation",
                description:
                    "Repairing implant damage and activating dopants without letting them spread."
            }

        ]
    },

    {
        id: 23,

        title: "Wells, Junctions & the MOSFET",

        description:
            "Wells, source and drain, and the extra implants a short transistor needs.",

        studyModule: {
            title: "Wells, Junctions & the MOSFET",
            href: "chipunit23.html"
        },

        lessons: [

            {
                id: 23,
                title: "Wells, Junctions & the MOSFET",
                description:
                    "Wells, source and drain, and the extra implants a short transistor needs."
            }

        ]
    },

    {
        id: 24,

        title: "Build a Transistor",

        description:
            "Putting doping, implantation, and the gate stack together into one transistor.",

        studyModule: {
            title: "Build a Transistor",
            href: "chipunit24.html"
        },

        lessons: [

            {
                id: 24,
                title: "Build a Transistor",
                description:
                    "Putting doping, implantation, and the gate stack together into one transistor."
            }

        ]
    },

    {
        id: 25,

        title: "Front-End and Back-End",

        description:
            "Why every fabrication step sorts into front-end-of-line or back-end-of-line.",

        studyModule: {
            title: "Front-End and Back-End",
            href: "chipunit25.html"
        },

        lessons: [

            {
                id: 25,
                title: "Front-End and Back-End",
                description:
                    "Why every fabrication step sorts into front-end-of-line or back-end-of-line."
            }

        ]
    },

    {
        id: 26,

        title: "Contacts & Silicide",

        description:
            "Silicide and tungsten plugs: getting current out of a transistor without much resistance.",

        studyModule: {
            title: "Contacts & Silicide",
            href: "chipunit26.html"
        },

        lessons: [

            {
                id: 26,
                title: "Contacts & Silicide",
                description:
                    "Silicide and tungsten plugs: getting current out of a transistor without much resistance."
            }

        ]
    },

    {
        id: 27,

        title: "The Metal Stack",

        description:
            "Why a chip needs up to fifteen layers of wiring, and why they grow with height.",

        studyModule: {
            title: "The Metal Stack",
            href: "chipunit27.html"
        },

        lessons: [

            {
                id: 27,
                title: "The Metal Stack",
                description:
                    "Why a chip needs up to fifteen layers of wiring, and why they grow with height."
            }

        ]
    },

    {
        id: 28,

        title: "From Transistors to Logic Gates",

        description:
            "How paired transistors become an inverter, a NAND gate, and a whole standard-cell library.",

        studyModule: {
            title: "From Transistors to Logic Gates",
            href: "chipunit28.html"
        },

        lessons: [

            {
                id: 28,
                title: "From Transistors to Logic Gates",
                description:
                    "How paired transistors become an inverter, a NAND gate, and a whole standard-cell library."
            }

        ]
    },

    {
        id: 29,

        title: "Design Rules & the Mask Count",

        description:
            "The rules a layout must obey, and how many masks a modern chip actually needs.",

        studyModule: {
            title: "Design Rules & the Mask Count",
            href: "chipunit29.html"
        },

        lessons: [

            {
                id: 29,
                title: "Design Rules & the Mask Count",
                description:
                    "The rules a layout must obey, and how many masks a modern chip actually needs."
            }

        ]
    },

    {
        id: 30,

        title: "The Full Flow: Wafer to Die",

        description:
            "The whole build, from bare wafer to a tested, diced chip, in order.",

        studyModule: {
            title: "The Full Flow: Wafer to Die",
            href: "chipunit30.html"
        },

        lessons: [

            {
                id: 30,
                title: "The Full Flow: Wafer to Die",
                description:
                    "The whole build, from bare wafer to a tested, diced chip, in order."
            }

        ]
    },

    {
        id: 31,

        title: "Why Yield Matters",

        description:
            "What yield means, and why it decides whether a fab makes money.",

        studyModule: {
            title: "Why Yield Matters",
            href: "chipunit31.html"
        },

        lessons: [

            {
                id: 31,
                title: "Why Yield Matters",
                description:
                    "What yield means, and why it decides whether a fab makes money."
            }

        ]
    },

    {
        id: 32,

        title: "Defects & Their Sources",

        description:
            "What a defect actually is, where it comes from, and which ones matter.",

        studyModule: {
            title: "Defects & Their Sources",
            href: "chipunit32.html"
        },

        lessons: [

            {
                id: 32,
                title: "Defects & Their Sources",
                description:
                    "What a defect actually is, where it comes from, and which ones matter."
            }

        ]
    },

    {
        id: 33,

        title: "Metrology: Measuring What You Made",

        description:
            "The tools that measure critical dimension, overlay, and film thickness.",

        studyModule: {
            title: "Metrology: Measuring What You Made",
            href: "chipunit33.html"
        },

        lessons: [

            {
                id: 33,
                title: "Metrology: Measuring What You Made",
                description:
                    "The tools that measure critical dimension, overlay, and film thickness."
            }

        ]
    },

    {
        id: 34,

        title: "Wafer Maps & Spatial Patterns",

        description:
            "How the shape of failures across a wafer points back to its cause.",

        studyModule: {
            title: "Wafer Maps & Spatial Patterns",
            href: "chipunit34.html"
        },

        lessons: [

            {
                id: 34,
                title: "Wafer Maps & Spatial Patterns",
                description:
                    "How the shape of failures across a wafer points back to its cause."
            }

        ]
    },

    {
        id: 35,

        title: "Statistical Process Control",

        description:
            "Catching a process drifting out of spec before it ruins a wafer.",

        studyModule: {
            title: "Statistical Process Control",
            href: "chipunit35.html"
        },

        lessons: [

            {
                id: 35,
                title: "Statistical Process Control",
                description:
                    "Catching a process drifting out of spec before it ruins a wafer."
            }

        ]
    },

    {
        id: 36,

        title: "Yield Models & the Learning Curve",

        description:
            "Turning defect density into a yield number, and how yield improves over time.",

        studyModule: {
            title: "Yield Models & the Learning Curve",
            href: "chipunit36.html"
        },

        lessons: [

            {
                id: 36,
                title: "Yield Models & the Learning Curve",
                description:
                    "Turning defect density into a yield number, and how yield improves over time."
            }

        ]
    }

];
