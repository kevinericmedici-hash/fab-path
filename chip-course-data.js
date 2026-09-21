/* ========================================
   SAND TO CHIP COURSE DATA
   Units 1 and 2 are built. Planned units, in order:
   lithography, doping and the transistor,
   the CMOS process flow, yield and metrology,
   packaging and test, and the industry.
   They are added here as they go live.
======================================== */

const chipCourseData = [

    /* =====================================
       UNIT 1
    ===================================== */

    {
        id: 1,

        title: "From Sand to Wafer",

        description:
            "How quartz sand becomes a flawless silicon wafer: why silicon, purification, crystal growth, wafer finishing, and the cleanroom.",

        studyModule: {
            title: "From Sand to Wafer",
            href: "chipunit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "What Is a Chip?",
                description:
                    "Wafers, dies, transistors, node names, and the four verbs of a fab."
            },

            {
                id: 2,
                title: "Why Silicon?",
                description:
                    "Why silicon beats the alternatives, and where other materials still win."
            },

            {
                id: 3,
                title: "Sand to Polysilicon",
                description:
                    "Turning quartz sand into ultra-pure polysilicon."
            },

            {
                id: 4,
                title: "Growing the Crystal",
                description:
                    "Czochralski crystal growth, doping the melt, and float-zone silicon."
            },

            {
                id: 5,
                title: "Ingot to Wafer",
                description:
                    "Slicing, lapping, and polishing an ingot into a finished wafer."
            },

            {
                id: 6,
                title: "Inside the Fab",
                description:
                    "Cleanrooms, the FEOL-to-BEOL stack, cycle time, and dies per wafer."
            }

        ]
    },

    /* =====================================
       UNIT 2
    ===================================== */

    {
        id: 2,

        title: "Building the Layers",

        description:
            "How a fab adds, removes, and smooths thin films: oxidation, chemical and physical deposition, atomic layer deposition, etching, and chemical mechanical polishing.",

        studyModule: {
            title: "Building the Layers",
            href: "chipunit2.html"
        },

        lessons: [

            {
                id: 7,
                title: "Growing Oxide",
                description:
                    "Thermal oxidation, dry versus wet growth, and why the gate oxide had to change."
            },

            {
                id: 8,
                title: "Chemical Vapor Deposition",
                description:
                    "Building films from gases: CVD, LPCVD, PECVD, epitaxy, and step coverage."
            },

            {
                id: 9,
                title: "Metals and Atomic Layers",
                description:
                    "Sputtering, evaporation, copper plating, and atomic layer deposition."
            },

            {
                id: 10,
                title: "Etching",
                description:
                    "Wet and dry etch, isotropic and anisotropic profiles, and selectivity."
            },

            {
                id: 11,
                title: "Planarization (CMP)",
                description:
                    "Why wafers get polished mid-process, and what dishing and erosion are."
            },

            {
                id: 12,
                title: "Layers in Action",
                description:
                    "Cleans, shallow trench isolation, copper damascene, and matching tool to film."
            }

        ]
    }

];
