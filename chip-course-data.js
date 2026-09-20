/* ========================================
   SAND TO CHIP COURSE DATA
   Unit 1 is built. Planned units, in order:
   layers (oxidation, deposition, etch, CMP),
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
    }

];
