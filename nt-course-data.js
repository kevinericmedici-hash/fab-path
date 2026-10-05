/* ========================================
   NEUROTRANSMITTERS COURSE DATA
   Four parts: 1 (Neurons and Synapses), 2 (The
   Messengers), 3 (Receptors and Drugs), and
   4 (Measuring Neurotransmitters).

   Structure: every unit is a short study module
   (a few slides) followed by one Fab Challenge
   quiz, and lesson ids match unit ids. Parts group
   the units for orientation.
======================================== */

const ntCourseParts = [

    {
        id: 1,
        title: "Neurons and Synapses",
        firstUnitId: 1,
        lastUnitId: 4,
        description:
            "How neurons signal, how an action potential works, what a synapse is made of, and how a message is released and cleaned up."
    },

    {
        id: 2,
        title: "The Messengers",
        firstUnitId: 5,
        lastUnitId: 9,
        description:
            "The major neurotransmitters, from glutamate and GABA to dopamine, serotonin, and acetylcholine, and what each one does."
    },

    {
        id: 3,
        title: "Receptors and Drugs",
        firstUnitId: 10,
        lastUnitId: 13,
        description:
            "How receptors respond, what binding affinity means, how drugs act at the synapse, and how neurons add up their inputs."
    },

    {
        id: 4,
        title: "Measuring Neurotransmitters",
        firstUnitId: 14,
        lastUnitId: 17,
        description:
            "Why neurotransmitters are hard to measure, and how microdialysis, voltammetry, fluorescent proteins, and transistors take on the problem."
    }

];


const ntCourseData = [

    {
        id: 1,
        title: "How Neurons Signal",
        description: "Neurons, their parts, and why signaling is part electrical and part chemical.",
        studyModule: {
            title: "How Neurons Signal",
            href: "ntunit1.html"
        },
        lessons: [
            {
                id: 1,
                title: "Fab Challenge: How Neurons Signal",
                description: "Check what you know about neuron anatomy and how neurons pass signals."
            }
        ]
    },

    {
        id: 2,
        title: "The Action Potential",
        description: "Resting potential, the spike, and how the signal travels down an axon.",
        studyModule: {
            title: "The Action Potential",
            href: "ntunit2.html"
        },
        lessons: [
            {
                id: 2,
                title: "Fab Challenge: The Action Potential",
                description: "Check what you know about resting potential, spikes, and myelin."
            }
        ]
    },

    {
        id: 3,
        title: "The Synapse",
        description: "The junction where one neuron passes a chemical message to the next.",
        studyModule: {
            title: "The Synapse",
            href: "ntunit3.html"
        },
        lessons: [
            {
                id: 3,
                title: "Fab Challenge: The Synapse",
                description: "Check what you know about the parts of a synapse."
            }
        ]
    },

    {
        id: 4,
        title: "Release and Cleanup",
        description: "How a spike triggers release, and what ends the message.",
        studyModule: {
            title: "Release and Cleanup",
            href: "ntunit4.html"
        },
        lessons: [
            {
                id: 4,
                title: "Fab Challenge: Release and Cleanup",
                description: "Check what you know about release, reuptake, and breakdown."
            }
        ]
    },

    {
        id: 5,
        title: "Meet the Messengers",
        description: "The main neurotransmitters, their families, sizes, and charges.",
        studyModule: {
            title: "Meet the Messengers",
            href: "ntunit5.html"
        },
        lessons: [
            {
                id: 5,
                title: "Fab Challenge: Meet the Messengers",
                description: "Check what you know about the main neurotransmitters and their chemistry."
            }
        ]
    },

    {
        id: 6,
        title: "Glutamate and GABA",
        description: "The excitatory and inhibitory pair that keeps brain activity in balance.",
        studyModule: {
            title: "Glutamate and GABA",
            href: "ntunit6.html"
        },
        lessons: [
            {
                id: 6,
                title: "Fab Challenge: Glutamate and GABA",
                description: "Check what you know about glutamate, GABA, and excitation-inhibition balance."
            }
        ]
    },

    {
        id: 7,
        title: "Dopamine",
        description: "How dopamine is made, where it goes, and what happens in Parkinson's disease.",
        studyModule: {
            title: "Dopamine",
            href: "ntunit7.html"
        },
        lessons: [
            {
                id: 7,
                title: "Fab Challenge: Dopamine",
                description: "Check what you know about dopamine pathways and Parkinson's disease."
            }
        ]
    },

    {
        id: 8,
        title: "Serotonin",
        description: "Where serotonin comes from, what it does, and how SSRIs act.",
        studyModule: {
            title: "Serotonin",
            href: "ntunit8.html"
        },
        lessons: [
            {
                id: 8,
                title: "Fab Challenge: Serotonin",
                description: "Check what you know about serotonin and SSRIs."
            }
        ]
    },

    {
        id: 9,
        title: "Acetylcholine and Others",
        description: "Muscle signaling, norepinephrine, and the slower messengers.",
        studyModule: {
            title: "Acetylcholine and Others",
            href: "ntunit9.html"
        },
        lessons: [
            {
                id: 9,
                title: "Fab Challenge: Acetylcholine and Others",
                description: "Check what you know about acetylcholine, norepinephrine, and neuropeptides."
            }
        ]
    },

    {
        id: 10,
        title: "Ionotropic and Metabotropic Receptors",
        description: "The two main receptor families and how fast each one acts.",
        studyModule: {
            title: "Ionotropic and Metabotropic Receptors",
            href: "ntunit10.html"
        },
        lessons: [
            {
                id: 10,
                title: "Fab Challenge: Ionotropic and Metabotropic Receptors",
                description: "Check what you know about ionotropic and metabotropic receptors."
            }
        ]
    },

    {
        id: 11,
        title: "Binding and Affinity",
        description: "How tightly a transmitter or drug binds a receptor, and what Kd means.",
        studyModule: {
            title: "Binding and Affinity",
            href: "ntunit11.html"
        },
        lessons: [
            {
                id: 11,
                title: "Fab Challenge: Binding and Affinity",
                description: "Check what you know about receptor binding, occupancy, and Kd."
            }
        ]
    },

    {
        id: 12,
        title: "Drugs at the Synapse",
        description: "Four levers a drug can pull, with real examples.",
        studyModule: {
            title: "Drugs at the Synapse",
            href: "ntunit12.html"
        },
        lessons: [
            {
                id: 12,
                title: "Fab Challenge: Drugs at the Synapse",
                description: "Check what you know about how common drugs act at the synapse."
            }
        ]
    },

    {
        id: 13,
        title: "Adding Up Signals",
        description: "How a neuron weighs thousands of inputs and decides whether to fire.",
        studyModule: {
            title: "Adding Up Signals",
            href: "ntunit13.html"
        },
        lessons: [
            {
                id: 13,
                title: "Fab Challenge: Adding Up Signals",
                description: "Check what you know about EPSPs, IPSPs, and summation."
            }
        ]
    },

    {
        id: 14,
        title: "Why Measuring Is Hard",
        description: "The speed, size, and chemistry problems that make neurotransmitters hard to catch.",
        studyModule: {
            title: "Why Measuring Is Hard",
            href: "ntunit14.html"
        },
        lessons: [
            {
                id: 14,
                title: "Fab Challenge: Why Measuring Is Hard",
                description: "Check what you know about the challenges of measuring neurotransmitters."
            }
        ]
    },

    {
        id: 15,
        title: "Microdialysis",
        description: "Sampling the fluid around neurons with a tiny membrane probe.",
        studyModule: {
            title: "Microdialysis",
            href: "ntunit15.html"
        },
        lessons: [
            {
                id: 15,
                title: "Fab Challenge: Microdialysis",
                description: "Check what you know about how microdialysis works and what it can and cannot do."
            }
        ]
    },

    {
        id: 16,
        title: "Fast-Scan Cyclic Voltammetry",
        description: "Reading dopamine from a carbon fiber with a rapidly sweeping voltage.",
        studyModule: {
            title: "Fast-Scan Cyclic Voltammetry",
            href: "ntunit16.html"
        },
        lessons: [
            {
                id: 16,
                title: "Fab Challenge: Fast-Scan Cyclic Voltammetry",
                description: "Check what you know about carbon-fiber electrodes and voltammetry."
            }
        ]
    },

    {
        id: 17,
        title: "Light, Transistors, and What's Next",
        description: "Fluorescent protein sensors, transistor sensors, and how to judge a claim.",
        studyModule: {
            title: "Light, Transistors, and What's Next",
            href: "ntunit17.html"
        },
        lessons: [
            {
                id: 17,
                title: "Fab Challenge: Light, Transistors, and What's Next",
                description: "Check what you know about optical and transistor neurotransmitter sensors."
            }
        ]
    }

];
