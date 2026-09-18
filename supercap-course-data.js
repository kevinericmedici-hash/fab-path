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
    }

];
