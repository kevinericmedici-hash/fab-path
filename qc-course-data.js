/* ========================================
   QUANTUM COMPUTING CHIPS COURSE DATA
   Built so far: Part 1 (Quantum Basics), Part 2 (What Makes
   a Good Qubit), Part 3 (Superconducting Circuits) and Part 4
   (Fabricating a Superconducting Qubit). Parts 5-9 (materials
   and loss, silicon spin qubits, other platforms, scaling up,
   and quantum and the world) are planned.

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
    },

    {
        id: 3,
        title: "Superconducting Circuits",
        firstUnitId: 15,
        lastUnitId: 20,
        description:
            "Superconductivity, Cooper pairs and the energy gap, the Josephson junction, from LC circuit to transmon, resonators and readout, and the dilution refrigerator."
    },

    {
        id: 4,
        title: "Fabricating a Superconducting Qubit",
        firstUnitId: 21,
        lastUnitId: 27,
        description:
            "The substrate, superconducting films, patterning, making the Josephson junction, hitting the target frequency, airbridges, and 3D integration."
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
    },

    {
        id: 15,
        title: "Superconductivity: Zero Resistance",
        description: "Resistance that vanishes, currents that never stop, the Meissner effect, the metals, and why the chip must be so cold.",
        studyModule: {
            title: "Superconductivity: Zero Resistance",
            href: "qcunit15.html"
        },
        lessons: [
            {
                id: 15,
                title: "Fab Challenge: Superconductivity: Zero Resistance",
                description: "Six questions on Superconductivity: Zero Resistance."
            }
        ]
    },

    {
        id: 16,
        title: "Cooper Pairs and the Energy Gap",
        description: "How electrons pair up, one shared quantum wave, the energy gap, quasiparticles and the flux quantum.",
        studyModule: {
            title: "Cooper Pairs and the Energy Gap",
            href: "qcunit16.html"
        },
        lessons: [
            {
                id: 16,
                title: "Fab Challenge: Cooper Pairs and the Energy Gap",
                description: "Six questions on Cooper Pairs and the Energy Gap."
            }
        ]
    },

    {
        id: 17,
        title: "The Josephson Junction",
        description: "Tunnelling through a thin barrier, current with no voltage, a nonlinear inductor, and the tunable SQUID.",
        studyModule: {
            title: "The Josephson Junction",
            href: "qcunit17.html"
        },
        lessons: [
            {
                id: 17,
                title: "Fab Challenge: The Josephson Junction",
                description: "Six questions on The Josephson Junction."
            }
        ]
    },

    {
        id: 18,
        title: "From LC Circuit to Transmon",
        description: "An LC oscillator, why uneven steps matter, taming charge noise, designing a transmon, and its many shapes.",
        studyModule: {
            title: "From LC Circuit to Transmon",
            href: "qcunit18.html"
        },
        lessons: [
            {
                id: 18,
                title: "Fab Challenge: From LC Circuit to Transmon",
                description: "Six questions on From LC Circuit to Transmon."
            }
        ]
    },

    {
        id: 19,
        title: "Resonators and Readout",
        description: "On-chip resonators, quality factor, dispersive readout, single-shot measurement and the amplifier chain.",
        studyModule: {
            title: "Resonators and Readout",
            href: "qcunit19.html"
        },
        lessons: [
            {
                id: 19,
                title: "Fab Challenge: Resonators and Readout",
                description: "Six questions on Resonators and Readout."
            }
        ]
    },

    {
        id: 20,
        title: "The Dilution Refrigerator",
        description: "Inside the fridge, the cooldown, how dilution cooling works, the cooling-power budget and noise-blocking attenuators.",
        studyModule: {
            title: "The Dilution Refrigerator",
            href: "qcunit20.html"
        },
        lessons: [
            {
                id: 20,
                title: "Fab Challenge: The Dilution Refrigerator",
                description: "Six questions on The Dilution Refrigerator."
            }
        ]
    },

    {
        id: 21,
        title: "The Substrate",
        description: "Silicon or sapphire, the loss tangent, preparing the surface, cleanliness and chips per wafer.",
        studyModule: {
            title: "The Substrate",
            href: "qcunit21.html"
        },
        lessons: [
            {
                id: 21,
                title: "Fab Challenge: The Substrate",
                description: "Six questions on The Substrate."
            }
        ]
    },

    {
        id: 22,
        title: "Superconducting Films",
        description: "Sputtering and evaporation, choosing aluminium, niobium, tantalum or TiN, native oxides, thickness and tantalum's crystal phases.",
        studyModule: {
            title: "Superconducting Films",
            href: "qcunit22.html"
        },
        lessons: [
            {
                id: 22,
                title: "Fab Challenge: Superconducting Films",
                description: "Six questions on Superconducting Films."
            }
        ]
    },

    {
        id: 23,
        title: "Patterning the Circuit",
        description: "Lithography, wet and dry etching, liftoff, designing a 50-ohm line and finding fab defects.",
        studyModule: {
            title: "Patterning the Circuit",
            href: "qcunit23.html"
        },
        lessons: [
            {
                id: 23,
                title: "Fab Challenge: Patterning the Circuit",
                description: "Six questions on Patterning the Circuit."
            }
        ]
    },

    {
        id: 24,
        title: "Making the Josephson Junction",
        description: "Shadow evaporation through a Dolan bridge, growing the barrier, Manhattan junctions and junction-to-junction spread.",
        studyModule: {
            title: "Making the Josephson Junction",
            href: "qcunit24.html"
        },
        lessons: [
            {
                id: 24,
                title: "Fab Challenge: Making the Josephson Junction",
                description: "Six questions on Making the Josephson Junction."
            }
        ]
    },

    {
        id: 25,
        title: "Hitting the Target Frequency",
        description: "Predicting frequency from room-temperature resistance, frequency collisions, laser trimming, and fixed versus tunable qubits.",
        studyModule: {
            title: "Hitting the Target Frequency",
            href: "qcunit25.html"
        },
        lessons: [
            {
                id: 25,
                title: "Fab Challenge: Hitting the Target Frequency",
                description: "Six questions on Hitting the Target Frequency."
            }
        ]
    },

    {
        id: 26,
        title: "Airbridges and Crossovers",
        description: "Unwanted slotline modes, building airbridges, crosstalk, bridge mechanics and where bridges go.",
        studyModule: {
            title: "Airbridges and Crossovers",
            href: "qcunit26.html"
        },
        lessons: [
            {
                id: 26,
                title: "Fab Challenge: Airbridges and Crossovers",
                description: "Six questions on Airbridges and Crossovers."
            }
        ]
    },

    {
        id: 27,
        title: "3D Integration",
        description: "Flip-chip stacks, running out of edge, indium bump bonds, through-silicon vias and box modes.",
        studyModule: {
            title: "3D Integration",
            href: "qcunit27.html"
        },
        lessons: [
            {
                id: 27,
                title: "Fab Challenge: 3D Integration",
                description: "Six questions on 3D Integration."
            }
        ]
    }

];
