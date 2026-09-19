/* ========================================
   BIOFETS & MOSFETS COURSE DATA
   Unit 1 is built. Later units (ion-sensitive
   FETs, biofunctionalization, and biosensing)
   are added here as they go live.
======================================== */

const fetCourseData = [

    /* =====================================
       UNIT 1
    ===================================== */

    {
        id: 1,

        title: "MOSFET Fundamentals",

        description:
            "How a transistor works: semiconductor basics, the MOS structure, threshold voltage, and the I–V behavior that later becomes a sensor.",

        studyModule: {
            title: "MOSFET Fundamentals",
            href: "fetunit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "Transistors: Switches & Amplifiers",
                description:
                    "What a transistor does, and why the field-effect version dominates."
            },

            {
                id: 2,
                title: "A Semiconductor Refresher",
                description:
                    "Electrons, holes, doping, and the p–n junction."
            },

            {
                id: 3,
                title: "Anatomy of a MOSFET",
                description:
                    "Gate, oxide, source, drain, body, and the NMOS and PMOS pair."
            },

            {
                id: 4,
                title: "The MOS Capacitor",
                description:
                    "The gate-oxide-silicon capacitor and its three surface states."
            },

            {
                id: 5,
                title: "Threshold Voltage",
                description:
                    "What sets the switch-on voltage, and how charge shifts it."
            },

            {
                id: 6,
                title: "Current–Voltage Behavior",
                description:
                    "Cutoff, triode, and saturation, with the square-law equations."
            },

            {
                id: 7,
                title: "Transfer Curves & Sensitivity",
                description:
                    "Transconductance, subthreshold swing, and why sensing lives on the transfer curve."
            }

        ]
    }

];
