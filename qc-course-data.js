/* ========================================
   QUANTUM COMPUTING CHIPS COURSE DATA
   Built so far: Part 1 (Quantum Basics) and Part 2 (What
   Makes a Good Qubit). Parts 3-9 (superconducting circuits,
   fabrication, materials and loss, silicon spin qubits,
   other platforms, scaling up, and quantum and the world)
   are planned.

   Structure: every unit is a short study module followed by
   one Fab Challenge quiz, and lesson ids match unit ids.
   Parts group the units for orientation.
======================================== */

const qcCourseParts = [

    {
        id: 1,
        title: "Quantum Basics",
        firstUnitId: 1,
        lastUnitId: 8,
        description:
            "What bits, qubits and quantum physics are, the Bloch sphere, superposition and measurement, entanglement, interference, and what quantum computers are really good for."
    },

    {
        id: 2,
        title: "What Makes a Good Qubit",
        firstUnitId: 9,
        lastUnitId: 14,
        description:
            "The recipe for a qubit, energy levels, coherence, gates and fidelity, error correction, and the qubit zoo."
    }

];


const qcCourseData = [

    {
        id: 1,
        title: "Bits, Qubits and Quantum Physics",
        description: "Start here: what a bit is, what quantum physics is, and what makes a qubit different.",
        studyModule: {
            title: "Bits, Qubits and Quantum Physics",
            href: "qcunit1.html"
        },
        lessons: [
            {
                id: 1,
                title: "Fab Challenge: Bits, Qubits and Quantum Physics",
                description: "Six questions on Bits, Qubits and Quantum Physics."
            }
        ]
    },

    {
        id: 2,
        title: "Why Quantum?",
        description: "Why ordinary computers struggle with nature, and how quantum chips could help.",
        studyModule: {
            title: "Why Quantum?",
            href: "qcunit2.html"
        },
        lessons: [
            {
                id: 2,
                title: "Fab Challenge: Why Quantum?",
                description: "Six questions on Why Quantum?"
            }
        ]
    },

    {
        id: 3,
        title: "Bits vs Qubits",
        description: "What a qubit is, how it differs from a bit, and why n qubits carry 2ⁿ amplitudes.",
        studyModule: {
            title: "Bits vs Qubits",
            href: "qcunit3.html"
        },
        lessons: [
            {
                id: 3,
                title: "Fab Challenge: Bits vs Qubits",
                description: "Six questions on Bits vs Qubits."
            }
        ]
    },

    {
        id: 4,
        title: "The Bloch Sphere: A Map of a Qubit",
        description: "What the Bloch sphere is (and isn't), what the north and south poles mean, and how latitude and longitude describe a qubit.",
        studyModule: {
            title: "The Bloch Sphere: A Map of a Qubit",
            href: "qcunit4.html"
        },
        lessons: [
            {
                id: 4,
                title: "Fab Challenge: The Bloch Sphere: A Map of a Qubit",
                description: "Six questions on The Bloch Sphere: A Map of a Qubit."
            }
        ]
    },

    {
        id: 5,
        title: "Superposition and Measurement",
        description: "Amplitudes and phase, what measurement does, and why qubits are so fragile.",
        studyModule: {
            title: "Superposition and Measurement",
            href: "qcunit5.html"
        },
        lessons: [
            {
                id: 5,
                title: "Fab Challenge: Superposition and Measurement",
                description: "Six questions on Superposition and Measurement."
            }
        ]
    },

    {
        id: 6,
        title: "Entanglement",
        description: "Two-qubit states, Bell pairs, correlations no classical link can copy, and why computers need them.",
        studyModule: {
            title: "Entanglement",
            href: "qcunit6.html"
        },
        lessons: [
            {
                id: 6,
                title: "Fab Challenge: Entanglement",
                description: "Six questions on Entanglement."
            }
        ]
    },

    {
        id: 7,
        title: "Interference: How Quantum Algorithms Win",
        description: "Waves adding and cancelling, single-qubit interference, Grover's search and where speedups come from.",
        studyModule: {
            title: "Interference: How Quantum Algorithms Win",
            href: "qcunit7.html"
        },
        lessons: [
            {
                id: 7,
                title: "Fab Challenge: Interference: How Quantum Algorithms Win",
                description: "Six questions on Interference: How Quantum Algorithms Win."
            }
        ]
    },

    {
        id: 8,
        title: "What Quantum Computers Are Good For, and What They're Not",
        description: "Chemistry, materials, cryptography and sensing, the limits, and how big a machine useful problems need.",
        studyModule: {
            title: "What Quantum Computers Are Good For, and What They're Not",
            href: "qcunit8.html"
        },
        lessons: [
            {
                id: 8,
                title: "Fab Challenge: What Quantum Computers Are Good For, and What They're Not",
                description: "Six questions on What Quantum Computers Are Good For, and What They're Not."
            }
        ]
    },

    {
        id: 9,
        title: "The Recipe for a Qubit",
        description: "DiVincenzo's checklist: well-defined qubits, reset, coherence, gates and measurement.",
        studyModule: {
            title: "The Recipe for a Qubit",
            href: "qcunit9.html"
        },
        lessons: [
            {
                id: 9,
                title: "Fab Challenge: The Recipe for a Qubit",
                description: "Six questions on The Recipe for a Qubit."
            }
        ]
    },

    {
        id: 10,
        title: "Energy Levels and Two-Level Systems",
        description: "Quantised energy levels, uneven ladders, the microwave band, why qubits must be cold, and Rabi oscillations.",
        studyModule: {
            title: "Energy Levels and Two-Level Systems",
            href: "qcunit10.html"
        },
        lessons: [
            {
                id: 10,
                title: "Fab Challenge: Energy Levels and Two-Level Systems",
                description: "Six questions on Energy Levels and Two-Level Systems."
            }
        ]
    },

    {
        id: 11,
        title: "Coherence: T₁ and T₂",
        description: "Energy decay, losing the phase, the spin echo, the enemies of coherence and how platforms compare.",
        studyModule: {
            title: "Coherence: T₁ and T₂",
            href: "qcunit11.html"
        },
        lessons: [
            {
                id: 11,
                title: "Fab Challenge: Coherence: T₁ and T₂",
                description: "Six questions on Coherence: T₁ and T₂."
            }
        ]
    },

    {
        id: 12,
        title: "Quantum Gates and Fidelity",
        description: "Gates as rotations, two-qubit gates, why fidelity compounds, and shaping microwave pulses.",
        studyModule: {
            title: "Quantum Gates and Fidelity",
            href: "qcunit12.html"
        },
        lessons: [
            {
                id: 12,
                title: "Fab Challenge: Quantum Gates and Fidelity",
                description: "Six questions on Quantum Gates and Fidelity."
            }
        ]
    },

    {
        id: 13,
        title: "Errors and Error Correction",
        description: "Kinds of error, the repetition code, decoding syndromes, the threshold, and physical vs logical qubits.",
        studyModule: {
            title: "Errors and Error Correction",
            href: "qcunit13.html"
        },
        lessons: [
            {
                id: 13,
                title: "Fab Challenge: Errors and Error Correction",
                description: "Six questions on Errors and Error Correction."
            }
        ]
    },

    {
        id: 14,
        title: "The Qubit Zoo",
        description: "Superconducting circuits, silicon spins, trapped ions, neutral atoms and photons: five ways to build a qubit.",
        studyModule: {
            title: "The Qubit Zoo",
            href: "qcunit14.html"
        },
        lessons: [
            {
                id: 14,
                title: "Fab Challenge: The Qubit Zoo",
                description: "Six questions on The Qubit Zoo."
            }
        ]
    }

];
