/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP COURSE DATA
   Four parts: 1 (The Barrier), 2 (Why Model It),
   3 (Building the Chip), and 4 (Cells, Sensing,
   and Using It).

   Structure: every unit is a short study module
   (a few slides) followed by one Fab Challenge
   quiz, and lesson ids match unit ids. Parts group
   the units for orientation.
======================================== */

const bbbCourseParts = [

    {
        id: 1,
        title: "The Barrier",
        firstUnitId: 1,
        lastUnitId: 4,
        description:
            "What the blood-brain barrier is, the cells that build it, the tight junctions that seal it, and the routes molecules take across."
    },

    {
        id: 2,
        title: "Why Model It",
        firstUnitId: 5,
        lastUnitId: 8,
        description:
            "Why most drugs fail to cross, what animal models can't show, how a Transwell works, and how barrier quality is measured."
    },

    {
        id: 3,
        title: "Building the Chip",
        firstUnitId: 9,
        lastUnitId: 13,
        description:
            "What an organ-on-a-chip is, how fluid and shear stress behave in microchannels, how soft lithography builds the device, and the main layouts."
    },

    {
        id: 4,
        title: "Cells, Sensing, and Using It",
        firstUnitId: 14,
        lastUnitId: 17,
        description:
            "Which cells go in, how sensors watch the barrier, how chips test drugs and model disease, and how to judge a claim."
    }

];


const bbbCourseData = [

    {
        id: 1,
        title: "Why the Brain Needs a Barrier",
        description: "What the blood-brain barrier is, how big it is, and what it protects.",
        studyModule: {
            title: "Why the Brain Needs a Barrier",
            href: "bbbunit1.html"
        },
        lessons: [
            {
                id: 1,
                title: "Fab Challenge: Why the Brain Needs a Barrier",
                description: "Check what you know about what the barrier is made of and why it exists."
            }
        ]
    },

    {
        id: 2,
        title: "The Neurovascular Unit",
        description: "Endothelial cells, pericytes, astrocytes, and the neighborhood that maintains the barrier.",
        studyModule: {
            title: "The Neurovascular Unit",
            href: "bbbunit2.html"
        },
        lessons: [
            {
                id: 2,
                title: "Fab Challenge: The Neurovascular Unit",
                description: "Check what you know about the cells around a brain capillary."
            }
        ]
    },

    {
        id: 3,
        title: "Tight Junctions",
        description: "The protein seals between endothelial cells that make the barrier tight.",
        studyModule: {
            title: "Tight Junctions",
            href: "bbbunit3.html"
        },
        lessons: [
            {
                id: 3,
                title: "Fab Challenge: Tight Junctions",
                description: "Check what you know about tight junctions and the proteins that build them."
            }
        ]
    },

    {
        id: 4,
        title: "How Things Cross",
        description: "Passive diffusion, carriers, vesicles, and the efflux pumps that push drugs back out.",
        studyModule: {
            title: "How Things Cross",
            href: "bbbunit4.html"
        },
        lessons: [
            {
                id: 4,
                title: "Fab Challenge: How Things Cross",
                description: "Check what you know about the routes molecules take across the barrier."
            }
        ]
    },

    {
        id: 5,
        title: "The Drug Delivery Problem",
        description: "Why most drugs fail to cross the barrier and what that costs.",
        studyModule: {
            title: "The Drug Delivery Problem",
            href: "bbbunit5.html"
        },
        lessons: [
            {
                id: 5,
                title: "Fab Challenge: The Drug Delivery Problem",
                description: "Check what you know about why drugs struggle to reach the brain."
            }
        ]
    },

    {
        id: 6,
        title: "Animal Models and Their Limits",
        description: "What rodent studies do well, where they fall short, and what a better model needs.",
        studyModule: {
            title: "Animal Models and Their Limits",
            href: "bbbunit6.html"
        },
        lessons: [
            {
                id: 6,
                title: "Fab Challenge: Animal Models and Their Limits",
                description: "Check what you know about animal models and the case for alternatives."
            }
        ]
    },

    {
        id: 7,
        title: "Transwell Models",
        description: "The standard lab insert for growing a barrier, and what it can't do.",
        studyModule: {
            title: "Transwell Models",
            href: "bbbunit7.html"
        },
        lessons: [
            {
                id: 7,
                title: "Fab Challenge: Transwell Models",
                description: "Check what you know about Transwell inserts and co-culture."
            }
        ]
    },

    {
        id: 8,
        title: "Measuring a Barrier: TEER and Permeability",
        description: "The two standard checks of barrier quality.",
        studyModule: {
            title: "Measuring a Barrier: TEER and Permeability",
            href: "bbbunit8.html"
        },
        lessons: [
            {
                id: 8,
                title: "Fab Challenge: Measuring a Barrier: TEER and Permeability",
                description: "Check what you know about TEER, permeability, and what the numbers mean."
            }
        ]
    },

    {
        id: 9,
        title: "What Is an Organ-on-a-Chip?",
        description: "A small device that recreates one function of an organ with living human cells.",
        studyModule: {
            title: "What Is an Organ-on-a-Chip?",
            href: "bbbunit9.html"
        },
        lessons: [
            {
                id: 9,
                title: "Fab Challenge: What Is an Organ-on-a-Chip?",
                description: "Check what you know about what an organ-on-a-chip is and is not."
            }
        ]
    },

    {
        id: 10,
        title: "Microfluidics Basics",
        description: "How fluid behaves in channels the width of a hair.",
        studyModule: {
            title: "Microfluidics Basics",
            href: "bbbunit10.html"
        },
        lessons: [
            {
                id: 10,
                title: "Fab Challenge: Microfluidics Basics",
                description: "Check what you know about laminar flow and the Reynolds number."
            }
        ]
    },

    {
        id: 11,
        title: "Shear Stress",
        description: "The force of flowing blood on vessel walls, and how to set it in a chip.",
        studyModule: {
            title: "Shear Stress",
            href: "bbbunit11.html"
        },
        lessons: [
            {
                id: 11,
                title: "Fab Challenge: Shear Stress",
                description: "Check what you know about wall shear stress and how it is calculated."
            }
        ]
    },

    {
        id: 12,
        title: "Building the Chip: PDMS and Soft Lithography",
        description: "How a channel pattern becomes a sealed, cell-ready device.",
        studyModule: {
            title: "Building the Chip: PDMS and Soft Lithography",
            href: "bbbunit12.html"
        },
        lessons: [
            {
                id: 12,
                title: "Fab Challenge: Building the Chip: PDMS and Soft Lithography",
                description: "Check what you know about soft lithography, PDMS, and chip assembly."
            }
        ]
    },

    {
        id: 13,
        title: "Chip Layouts",
        description: "Sandwich, hydrogel, and 3D tube designs, and the trade-offs of each.",
        studyModule: {
            title: "Chip Layouts",
            href: "bbbunit13.html"
        },
        lessons: [
            {
                id: 13,
                title: "Fab Challenge: Chip Layouts",
                description: "Check what you know about the main ways to lay out a barrier chip."
            }
        ]
    },

    {
        id: 14,
        title: "Cells for the Chip",
        description: "Primary cells, cell lines, and stem-cell derived cells for building a barrier.",
        studyModule: {
            title: "Cells for the Chip",
            href: "bbbunit14.html"
        },
        lessons: [
            {
                id: 14,
                title: "Fab Challenge: Cells for the Chip",
                description: "Check what you know about the cell sources used in barrier models."
            }
        ]
    },

    {
        id: 15,
        title: "Sensing on a Chip",
        description: "Building electrodes and optics into the chip to watch the barrier continuously.",
        studyModule: {
            title: "Sensing on a Chip",
            href: "bbbunit15.html"
        },
        lessons: [
            {
                id: 15,
                title: "Fab Challenge: Sensing on a Chip",
                description: "Check what you know about built-in electrodes and optical readouts."
            }
        ]
    },

    {
        id: 16,
        title: "Testing Drugs and Modeling Disease",
        description: "Benchmarks, shuttles, and patient-derived chips.",
        studyModule: {
            title: "Testing Drugs and Modeling Disease",
            href: "bbbunit16.html"
        },
        lessons: [
            {
                id: 16,
                title: "Fab Challenge: Testing Drugs and Modeling Disease",
                description: "Check what you know about using a barrier chip to test drugs and study disease."
            }
        ]
    },

    {
        id: 17,
        title: "Limits, Validation, and What's Next",
        description: "Where today's barrier chips fall short and how to judge a claim.",
        studyModule: {
            title: "Limits, Validation, and What's Next",
            href: "bbbunit17.html"
        },
        lessons: [
            {
                id: 17,
                title: "Fab Challenge: Limits, Validation, and What's Next",
                description: "Check what you know about the limits of barrier chips and what comes next."
            }
        ]
    }

];
