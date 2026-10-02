/* ========================================
   GLUCOSE SENSORS COURSE DATA
   Four parts: 1 (Why Glucose?), 2 (How Glucose
   Sensors Work), 3 (Inside Real CGMs), and
   4 (Making Them and What's Next).

   Structure: every unit is a short study module
   (a few slides) followed by one Fab Challenge
   quiz, and lesson ids match unit ids. Parts group
   the units for orientation.
======================================== */

const gluCourseParts = [

    {
        id: 1,
        title: "Why Glucose?",
        firstUnitId: 1,
        lastUnitId: 3,
        description:
            "What glucose is, why people with diabetes measure it, where a CGM actually reads it, and how the technology got here."
    },

    {
        id: 2,
        title: "How Glucose Sensors Work",
        firstUnitId: 4,
        lastUnitId: 9,
        description:
            "The enzyme, the electrode, the three generations of electrochemical sensing, the membranes that make it work in the body, and how accuracy is scored."
    },

    {
        id: 3,
        title: "Inside Real CGMs",
        firstUnitId: 10,
        lastUnitId: 14,
        description:
            "How Dexcom, Abbott, Senseonics, and Medtronic build their sensors, and how their chemistry, wear, and form factors compare."
    },

    {
        id: 4,
        title: "Making Them and What's Next",
        firstUnitId: 15,
        lastUnitId: 17,
        description:
            "How sensors are manufactured, the push toward needle-free sensing, closed-loop insulin delivery, and how to judge a claim."
    }

];


const gluCourseData = [

    {
        id: 1,
        title: "Why Measure Glucose?",
        description: "Glucose, insulin, diabetes, and why one number is not enough.",
        studyModule: {
            title: "Why Measure Glucose?",
            href: "gluunit1.html"
        },
        lessons: [
            {
                id: 1,
                title: "Fab Challenge: Why Measure Glucose?",
                description: "Check what you know about glucose, target ranges, and why monitoring matters."
            }
        ]
    },

    {
        id: 2,
        title: "Blood vs. the Fluid Under Your Skin",
        description: "Where a CGM actually measures, and why its reading lags behind blood.",
        studyModule: {
            title: "Blood vs. the Fluid Under Your Skin",
            href: "gluunit2.html"
        },
        lessons: [
            {
                id: 2,
                title: "Fab Challenge: Blood vs. the Fluid Under Your Skin",
                description: "Check what you know about interstitial fluid and sensor lag."
            }
        ]
    },

    {
        id: 3,
        title: "From Test Strips to CGM",
        description: "A short history from the first enzyme electrode to over-the-counter sensors.",
        studyModule: {
            title: "From Test Strips to CGM",
            href: "gluunit3.html"
        },
        lessons: [
            {
                id: 3,
                title: "Fab Challenge: From Test Strips to CGM",
                description: "Check what you know about the history of glucose sensing."
            }
        ]
    },

    {
        id: 4,
        title: "Ways to Sense Glucose",
        description: "The main ways to detect glucose, and why enzymes plus electrodes dominate.",
        studyModule: {
            title: "Ways to Sense Glucose",
            href: "gluunit4.html"
        },
        lessons: [
            {
                id: 4,
                title: "Fab Challenge: Ways to Sense Glucose",
                description: "Check what you know about the families of glucose sensing."
            }
        ]
    },

    {
        id: 5,
        title: "The Enzyme: Glucose Oxidase",
        description: "How glucose oxidase turns a sugar into a chemical you can measure.",
        studyModule: {
            title: "The Enzyme: Glucose Oxidase",
            href: "gluunit5.html"
        },
        lessons: [
            {
                id: 5,
                title: "Fab Challenge: The Enzyme: Glucose Oxidase",
                description: "Check what you know about glucose oxidase and its reaction."
            }
        ]
    },

    {
        id: 6,
        title: "Measuring Glucose With Electricity",
        description: "Amperometry: how a chemical reaction becomes a current you can read.",
        studyModule: {
            title: "Measuring Glucose With Electricity",
            href: "gluunit6.html"
        },
        lessons: [
            {
                id: 6,
                title: "Fab Challenge: Measuring Glucose With Electricity",
                description: "Check what you know about amperometric glucose sensing."
            }
        ]
    },

    {
        id: 7,
        title: "Three Generations of Sensors",
        description: "First, second, and third-generation designs and how each moves electrons.",
        studyModule: {
            title: "Three Generations of Sensors",
            href: "gluunit7.html"
        },
        lessons: [
            {
                id: 7,
                title: "Fab Challenge: Three Generations of Sensors",
                description: "Check what you know about the three generations of electrochemical sensors."
            }
        ]
    },

    {
        id: 8,
        title: "Membranes: The Unsung Hero",
        description: "The layers that make a wearable sensor accurate, selective, and safe.",
        studyModule: {
            title: "Membranes: The Unsung Hero",
            href: "gluunit8.html"
        },
        lessons: [
            {
                id: 8,
                title: "Fab Challenge: Membranes: The Unsung Hero",
                description: "Check what you know about sensor membranes, oxygen, and biofouling."
            }
        ]
    },

    {
        id: 9,
        title: "Drift, Calibration, and Accuracy",
        description: "Why sensor readings drift, how they are calibrated, and how accuracy is scored.",
        studyModule: {
            title: "Drift, Calibration, and Accuracy",
            href: "gluunit9.html"
        },
        lessons: [
            {
                id: 9,
                title: "Fab Challenge: Drift, Calibration, and Accuracy",
                description: "Check what you know about calibration, drift, and MARD."
            }
        ]
    },

    {
        id: 10,
        title: "Dexcom: Anatomy of a CGM",
        description: "The parts of a Dexcom CGM and how a reading travels from skin to screen.",
        studyModule: {
            title: "Dexcom: Anatomy of a CGM",
            href: "gluunit10.html"
        },
        lessons: [
            {
                id: 10,
                title: "Fab Challenge: Dexcom: Anatomy of a CGM",
                description: "Check what you know about how a Dexcom CGM is built and used."
            }
        ]
    },

    {
        id: 11,
        title: "Dexcom: The Sensor Chemistry",
        description: "How a Dexcom sensor chemistry makes and reads its signal.",
        studyModule: {
            title: "Dexcom: The Sensor Chemistry",
            href: "gluunit11.html"
        },
        lessons: [
            {
                id: 11,
                title: "Fab Challenge: Dexcom: The Sensor Chemistry",
                description: "Check what you know about the chemistry and signal processing in a Dexcom sensor."
            }
        ]
    },

    {
        id: 12,
        title: "Abbott FreeStyle Libre",
        description: "A small wired-enzyme CGM and how its design differs from Dexcom's.",
        studyModule: {
            title: "Abbott FreeStyle Libre",
            href: "gluunit12.html"
        },
        lessons: [
            {
                id: 12,
                title: "Fab Challenge: Abbott FreeStyle Libre",
                description: "Check what you know about FreeStyle Libre and its wired-enzyme chemistry."
            }
        ]
    },

    {
        id: 13,
        title: "Implants and Fluorescence: Eversense",
        description: "How an implanted, fluorescence-based CGM differs from wearable enzyme sensors.",
        studyModule: {
            title: "Implants and Fluorescence: Eversense",
            href: "gluunit13.html"
        },
        lessons: [
            {
                id: 13,
                title: "Fab Challenge: Implants and Fluorescence: Eversense",
                description: "Check what you know about implantable fluorescent sensors and Medtronic."
            }
        ]
    },

    {
        id: 14,
        title: "Head to Head: Comparing CGMs",
        description: "A side-by-side comparison of the leading CGM designs.",
        studyModule: {
            title: "Head to Head: Comparing CGMs",
            href: "gluunit14.html"
        },
        lessons: [
            {
                id: 14,
                title: "Fab Challenge: Head to Head: Comparing CGMs",
                description: "Check what you know about how Dexcom, Abbott, Senseonics, and Medtronic compare."
            }
        ]
    },

    {
        id: 15,
        title: "How the Sensors Are Made",
        description: "Electrodes, layers, and the manufacturing steps that turn chemistry into a product.",
        studyModule: {
            title: "How the Sensors Are Made",
            href: "gluunit15.html"
        },
        lessons: [
            {
                id: 15,
                title: "Fab Challenge: How the Sensors Are Made",
                description: "Check what you know about how glucose sensors are manufactured."
            }
        ]
    },

    {
        id: 16,
        title: "Needles, Patches, and Non-Invasive Dreams",
        description: "Microneedles, sweat and tear sensors, and the hard problem of measuring glucose without piercing skin.",
        studyModule: {
            title: "Needles, Patches, and Non-Invasive Dreams",
            href: "gluunit16.html"
        },
        lessons: [
            {
                id: 16,
                title: "Fab Challenge: Needles, Patches, and Non-Invasive Dreams",
                description: "Check what you know about less invasive ways to measure glucose."
            }
        ]
    },

    {
        id: 17,
        title: "Closed Loop and What's Next",
        description: "Automated insulin delivery, over-the-counter sensors, and where the technology is heading.",
        studyModule: {
            title: "Closed Loop and What's Next",
            href: "gluunit17.html"
        },
        lessons: [
            {
                id: 17,
                title: "Fab Challenge: Closed Loop and What's Next",
                description: "Check what you know about closed-loop systems and the future of glucose sensing."
            }
        ]
    }

];
