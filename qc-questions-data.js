/* ========================================
   QUANTUM COMPUTING CHIPS: FAB CHALLENGE QUESTIONS
======================================== */

const qcLesson1Questions = [
    {
        question: "What is a bit?",
        answers: [
            "The smallest piece of information: a single 0 or 1",
            "A tiny magnet",
            "A type of quantum computer",
            "A unit of electrical current"
        ],
        correct: 0
    },
    {
        question: "How many bits are in a byte?",
        answers: [
            "8",
            "2",
            "10",
            "1,000"
        ],
        correct: 0
    },
    {
        question: "What does quantum physics describe?",
        answers: [
            "The behaviour of very small things like atoms, electrons and photons",
            "Only the motion of planets",
            "How computers are programmed",
            "The chemistry of food"
        ],
        correct: 0
    },
    {
        question: "What does the word 'quantum' mean?",
        answers: [
            "A fixed amount, or packet, of something like energy",
            "Very fast",
            "Very large",
            "Random"
        ],
        correct: 0
    },
    {
        question: "In the double-slit experiment, what happens when you watch which slit each electron goes through?",
        answers: [
            "The interference stripes disappear",
            "The stripes get brighter",
            "The electrons stop",
            "Nothing changes"
        ],
        correct: 0
    },
    {
        question: "What is a qubit?",
        answers: [
            "A quantum system with two states, 0 and 1, that can be in a blend of both until measured",
            "A bit that is twice as fast",
            "Eight bits grouped together",
            "A type of transistor that is always on"
        ],
        correct: 0
    }
];

const qcLesson2Questions = [
    {
        question: "Why do classical computers struggle to simulate quantum systems?",
        answers: [
            "Every added particle doubles the numbers needed to describe the system",
            "Quantum particles move too fast for computers",
            "Classical computers can't do arithmetic with fractions",
            "Quantum systems are too small to see"
        ],
        correct: 0
    },
    {
        question: "About how many numbers are needed to describe 50 qubits exactly?",
        answers: [
            "2⁵⁰ (about 10¹⁵)",
            "50",
            "100",
            "50² = 2,500"
        ],
        correct: 0
    },
    {
        question: "Who suggested in 1982 that computers made of quantum parts could simulate nature?",
        answers: [
            "Richard Feynman",
            "Albert Einstein",
            "Alan Turing",
            "Gordon Moore"
        ],
        correct: 0
    },
    {
        question: "What did Shor's algorithm (1994) show a quantum computer could do?",
        answers: [
            "Factor large numbers exponentially faster, breaking much of today's encryption",
            "Store unlimited data",
            "Run video games faster",
            "Replace transistors in phones"
        ],
        correct: 0
    },
    {
        question: "Which of these is NOT one of the three quantum ingredients in this unit?",
        answers: [
            "Amplification of voltage",
            "Superposition",
            "Entanglement",
            "Interference"
        ],
        correct: 0
    },
    {
        question: "Why does this course treat quantum computers as a microfabrication topic?",
        answers: [
            "Quantum chips are built with cleanroom tools like lithography, deposition and etching",
            "Quantum computers are made of sand only",
            "They don't need any electronics",
            "They are printed on paper"
        ],
        correct: 0
    }
];

const qcLesson3Questions = [
    {
        question: "What happens when you read a classical bit?",
        answers: [
            "Nothing changes: you see the stored 0 or 1",
            "It becomes a blend of 0 and 1",
            "It is erased",
            "It flips"
        ],
        correct: 0
    },
    {
        question: "A qubit is in the state α|0⟩ + β|1⟩. What is the chance of reading 1?",
        answers: [
            "|β|²",
            "β",
            "α + β",
            "1/2 always"
        ],
        correct: 0
    },
    {
        question: "What is left after you measure a qubit and read 0?",
        answers: [
            "The qubit is in |0⟩",
            "The original blend",
            "Nothing: the qubit is destroyed",
            "|1⟩"
        ],
        correct: 0
    },
    {
        question: "On the Bloch sphere, where is |1⟩?",
        answers: [
            "The south pole",
            "The north pole",
            "On the equator",
            "At the centre"
        ],
        correct: 0
    },
    {
        question: "How many amplitudes do 10 qubits carry?",
        answers: [
            "1,024",
            "10",
            "20",
            "100"
        ],
        correct: 0
    },
    {
        question: "How many plain bits do you get when you measure n qubits?",
        answers: [
            "n",
            "2ⁿ",
            "1",
            "n²"
        ],
        correct: 0
    }
];

const qcLesson4Questions = [
    {
        question: "What does the Bloch sphere show?",
        answers: [
            "Every possible state of one qubit, as a point on a sphere",
            "Where an electron is inside an atom",
            "The shape of a quantum chip",
            "The Earth's magnetic field"
        ],
        correct: 0
    },
    {
        question: "What does the north pole of the Bloch sphere stand for?",
        answers: [
            "The state |0⟩",
            "The state |1⟩",
            "A 50/50 blend",
            "An error"
        ],
        correct: 0
    },
    {
        question: "What does the south pole of the Bloch sphere stand for?",
        answers: [
            "The state |1⟩",
            "The state |0⟩",
            "The centre of the atom",
            "A measurement"
        ],
        correct: 0
    },
    {
        question: "A qubit's arrow is on the equator. What is the chance of reading 0?",
        answers: [
            "50%",
            "100%",
            "0%",
            "25%"
        ],
        correct: 0
    },
    {
        question: "What does the arrow's longitude (its direction around the equator) represent?",
        answers: [
            "The phase, which shows up through interference",
            "The qubit's temperature",
            "How big the qubit is",
            "Nothing at all"
        ],
        correct: 0
    },
    {
        question: "For an atom used as a qubit, what is |1⟩?",
        answers: [
            "The electron in a higher energy level (excited state)",
            "The electron at the north pole of the atom",
            "The atom being removed",
            "Two electrons"
        ],
        correct: 0
    }
];

const qcLesson5Questions = [
    {
        question: "What does the length of an amplitude arrow tell you?",
        answers: [
            "Its length squared is the probability",
            "The qubit's temperature",
            "How fast the qubit spins",
            "Nothing at all"
        ],
        correct: 0
    },
    {
        question: "|+⟩ and |−⟩ give the same odds when measured as 0 or 1. How do they differ?",
        answers: [
            "Their phase, which shows up through interference",
            "One is heavier",
            "One is a bit, the other a qubit",
            "They don't differ at all"
        ],
        correct: 0
    },
    {
        question: "You measure a qubit, read 1, and immediately measure it again. What do you get?",
        answers: [
            "1 again",
            "0",
            "A random result",
            "A blend"
        ],
        correct: 0
    },
    {
        question: "|+⟩ is measured along the X direction. What happens?",
        answers: [
            "It gives + every time",
            "It gives 0 or 1 at random",
            "It always gives 0",
            "It can't be measured that way"
        ],
        correct: 0
    },
    {
        question: "What is decoherence?",
        answers: [
            "Information leaking to the surroundings, which acts like a measurement",
            "A qubit getting heavier",
            "A bug in quantum software",
            "Cooling a chip too fast"
        ],
        correct: 0
    },
    {
        question: "What does the no-cloning theorem say?",
        answers: [
            "An unknown quantum state can't be copied perfectly",
            "Qubits can't be manufactured twice",
            "Two qubits can't be entangled",
            "Classical bits can't be copied"
        ],
        correct: 0
    }
];

const qcLesson6Questions = [
    {
        question: "How many amplitudes describe two qubits?",
        answers: [
            "4",
            "2",
            "8",
            "1"
        ],
        correct: 0
    },
    {
        question: "Which two gates turn |00⟩ into the Bell state (|00⟩ + |11⟩)/√2?",
        answers: [
            "H on qubit A, then CNOT",
            "X on both qubits",
            "Z then Z",
            "Two SWAP gates"
        ],
        correct: 0
    },
    {
        question: "You measure many Bell pairs. What do you see?",
        answers: [
            "Each qubit is random, but the two always match",
            "Both qubits are always 0",
            "The results never match",
            "Only qubit A gives results"
        ],
        correct: 0
    },
    {
        question: "Can entanglement send a message faster than light?",
        answers: [
            "No: each side's results look random on their own",
            "Yes, instantly",
            "Yes, but only short messages",
            "Only inside a fridge"
        ],
        correct: 0
    },
    {
        question: "In the Bell (CHSH) test, what is the largest score S that hidden instructions could produce?",
        answers: [
            "2",
            "2.83",
            "4",
            "1"
        ],
        correct: 0
    },
    {
        question: "Why do quantum computers need entanglement?",
        answers: [
            "Without it they are no more powerful than classical computers",
            "It keeps them cold",
            "It makes qubits cheaper",
            "It replaces the need for measurement"
        ],
        correct: 0
    }
];

const qcLesson7Questions = [
    {
        question: "Two equal waves are shifted by 180°. What is their sum?",
        answers: [
            "Zero: they cancel",
            "Twice as big",
            "The same as one wave",
            "It depends on the colour"
        ],
        correct: 0
    },
    {
        question: "In the single-photon interferometer, what decides which detector fires?",
        answers: [
            "The phase difference between the two paths",
            "The colour of the detector",
            "Which path the photon secretly took",
            "The temperature of the room"
        ],
        correct: 0
    },
    {
        question: "What is the core trick of quantum algorithms?",
        answers: [
            "Making wrong answers cancel and right answers add up",
            "Trying every answer at once and reading all of them",
            "Running at higher clock speeds",
            "Using more memory"
        ],
        correct: 0
    },
    {
        question: "About how many steps does Grover's algorithm need to search N items?",
        answers: [
            "About √N",
            "About N",
            "About N²",
            "One"
        ],
        correct: 0
    },
    {
        question: "What happens if you run too many Grover steps?",
        answers: [
            "The chance of finding the answer falls again",
            "It always gets better",
            "The qubits overheat",
            "Nothing changes"
        ],
        correct: 0
    },
    {
        question: "Which problem has an exponential quantum speedup?",
        answers: [
            "Factoring large numbers",
            "Sorting a short list",
            "Adding two numbers",
            "Streaming video"
        ],
        correct: 0
    }
];

const qcLesson8Questions = [
    {
        question: "Why was chemistry the first reason to build quantum computers?",
        answers: [
            "Molecules are quantum systems that classical computers can't simulate exactly",
            "Chemists invented quantum computers",
            "Chemistry needs fast arithmetic",
            "Molecules are easy to simulate classically"
        ],
        correct: 0
    },
    {
        question: "What is 'harvest now, decrypt later'?",
        answers: [
            "Copying encrypted data today to decrypt it once quantum computers can",
            "Growing crops with quantum sensors",
            "Deleting old data",
            "A way to cool qubits"
        ],
        correct: 0
    },
    {
        question: "What did NIST standardise in 2024?",
        answers: [
            "Post-quantum encryption methods",
            "The first quantum computer",
            "The qubit's size",
            "Quantum internet cables"
        ],
        correct: 0
    },
    {
        question: "Which use of quantum technology already works today?",
        answers: [
            "Quantum sensing, such as very sensitive magnetometers",
            "Breaking RSA encryption",
            "Replacing laptops",
            "Training all AI models"
        ],
        correct: 0
    },
    {
        question: "How will quantum computers most likely be used?",
        answers: [
            "As specialist accelerators alongside classical computers",
            "As replacements for every computer",
            "Only for video games",
            "As phone processors"
        ],
        correct: 0
    },
    {
        question: "Roughly how many physical qubits do estimates suggest breaking RSA-2048 needs?",
        answers: [
            "About a million",
            "About 50",
            "About 1,000",
            "Exactly 2,048"
        ],
        correct: 0
    }
];

const qcLesson9Questions = [
    {
        question: "Who listed the five criteria for building a quantum computer?",
        answers: [
            "David DiVincenzo",
            "Peter Shor",
            "Richard Feynman",
            "Gordon Moore"
        ],
        correct: 0
    },
    {
        question: "Why isn't a spinning coin a qubit?",
        answers: [
            "Its 'blend' is just uncertainty, and coins never interfere",
            "It's too big",
            "It has two sides",
            "It can't be measured"
        ],
        correct: 0
    },
    {
        question: "What is active reset?",
        answers: [
            "Measuring a qubit and flipping it if it reads 1",
            "Turning the computer off and on",
            "Heating the chip",
            "Waiting for days"
        ],
        correct: 0
    },
    {
        question: "Which ratio matters most for running long calculations?",
        answers: [
            "Coherence time divided by gate time",
            "Chip area divided by qubit count",
            "Price divided by speed",
            "Temperature divided by voltage"
        ],
        correct: 0
    },
    {
        question: "Why must a qubit be cold for passive reset to work?",
        answers: [
            "Heat would randomly kick it back to 1",
            "Cold makes it smaller",
            "Cold makes gates faster",
            "It doesn't need to be cold"
        ],
        correct: 0
    },
    {
        question: "What does 'qubit-specific measurement' mean?",
        answers: [
            "Each qubit can be read out on its own",
            "All qubits are measured as a group only",
            "Qubits are never measured",
            "Only the first qubit is measured"
        ],
        correct: 0
    }
];

const qcLesson10Questions = [
    {
        question: "When is a photon absorbed by an atom?",
        answers: [
            "When its energy matches a gap between energy levels",
            "Always",
            "Only at night",
            "When the atom is moving"
        ],
        correct: 0
    },
    {
        question: "Why can't a plain LC circuit be used as a qubit?",
        answers: [
            "Its evenly spaced levels mean one pulse drives every step",
            "It is too small",
            "It doesn't conduct",
            "It has no energy levels"
        ],
        correct: 0
    },
    {
        question: "What makes a transmon's energy levels uneven?",
        answers: [
            "The Josephson junction's nonlinear inductance",
            "A magnet",
            "Its colour",
            "Heat"
        ],
        correct: 0
    },
    {
        question: "In which frequency band do superconducting qubits operate?",
        answers: [
            "Microwaves, about 4–8 GHz",
            "Visible light",
            "Audio frequencies",
            "X-rays"
        ],
        correct: 0
    },
    {
        question: "Why are superconducting qubits cooled to about 10 millikelvin?",
        answers: [
            "So heat almost never excites them, since their energy matches only about 0.24 K",
            "To make them superconduct at room temperature",
            "To make them shrink",
            "To slow down time"
        ],
        correct: 0
    },
    {
        question: "What does a π pulse do to a qubit in |0⟩?",
        answers: [
            "Flips it to |1⟩",
            "Leaves it alone",
            "Destroys it",
            "Copies it"
        ],
        correct: 0
    }
];

const qcLesson11Questions = [
    {
        question: "What does T₁ measure?",
        answers: [
            "How long a qubit stays excited before giving its energy away",
            "How fast gates are",
            "The chip's temperature",
            "The number of qubits"
        ],
        correct: 0
    },
    {
        question: "After one T₁, about what fraction of excited qubits are still excited?",
        answers: [
            "37%",
            "100%",
            "50%",
            "0%"
        ],
        correct: 0
    },
    {
        question: "What does T₂ measure?",
        answers: [
            "How long the qubit keeps its phase",
            "Its weight",
            "Its colour",
            "Its size"
        ],
        correct: 0
    },
    {
        question: "What is the largest T₂ can be?",
        answers: [
            "2 T₁",
            "T₁ / 2",
            "Unlimited",
            "Exactly T₁ always"
        ],
        correct: 0
    },
    {
        question: "What does a spin echo do?",
        answers: [
            "Flips the qubit halfway so slow noise cancels out",
            "Measures the qubit twice",
            "Heats the qubit",
            "Copies the qubit"
        ],
        correct: 0
    },
    {
        question: "Which is a major cause of energy loss in superconducting qubits?",
        answers: [
            "Defects in surface oxides and interfaces",
            "Gravity",
            "Moonlight",
            "Too much vacuum"
        ],
        correct: 0
    }
];

const qcLesson12Questions = [
    {
        question: "What is a single-qubit gate, geometrically?",
        answers: [
            "A rotation of the Bloch sphere",
            "A cut through the sphere",
            "A measurement",
            "A copy of the state"
        ],
        correct: 0
    },
    {
        question: "Which gate turns |0⟩ into |+⟩?",
        answers: [
            "H",
            "X",
            "Z",
            "S"
        ],
        correct: 0
    },
    {
        question: "What does CNOT do?",
        answers: [
            "Flips the target qubit when the control qubit is 1",
            "Swaps two qubits always",
            "Measures both qubits",
            "Resets both qubits"
        ],
        correct: 0
    },
    {
        question: "A circuit has 1,000 gates, each with 99.9% fidelity. About what is the chance of no error?",
        answers: [
            "37%",
            "99.9%",
            "90%",
            "1%"
        ],
        correct: 0
    },
    {
        question: "Why are smooth (Gaussian) pulses preferred over sharp square ones?",
        answers: [
            "Their narrow spectrum avoids kicking the qubit up to |2⟩",
            "They are cheaper",
            "They are louder",
            "They need no electronics"
        ],
        correct: 0
    },
    {
        question: "What set of gates is enough to build any quantum program?",
        answers: [
            "Single-qubit rotations plus one entangling two-qubit gate",
            "Only X gates",
            "Only measurements",
            "Only classical logic gates"
        ],
        correct: 0
    }
];

const qcLesson13Questions = [
    {
        question: "Which kind of error has no classical equivalent?",
        answers: [
            "A phase flip",
            "A bit flip",
            "A power cut",
            "A typo"
        ],
        correct: 0
    },
    {
        question: "How does the repetition code protect a qubit without copying it?",
        answers: [
            "It encodes |0⟩ as |000⟩ and uses parity checks",
            "It makes three identical copies of the unknown state",
            "It measures the qubit often",
            "It cools the qubit more"
        ],
        correct: 0
    },
    {
        question: "With three qubits and majority voting, when does the code fail?",
        answers: [
            "When two or more qubits flip",
            "When one qubit flips",
            "Never",
            "Whenever any qubit is measured"
        ],
        correct: 0
    },
    {
        question: "What is a syndrome?",
        answers: [
            "The pattern of parity checks that disagree",
            "A type of qubit",
            "A disease of chips",
            "The final answer of an algorithm"
        ],
        correct: 0
    },
    {
        question: "What is roughly the surface code's error threshold?",
        answers: [
            "About 1% per operation",
            "About 50%",
            "About 0.0001%",
            "There is no threshold"
        ],
        correct: 0
    },
    {
        question: "Below threshold, what happens as the code gets bigger?",
        answers: [
            "Logical errors get rarer",
            "Logical errors get more common",
            "Nothing changes",
            "The qubits get hotter"
        ],
        correct: 0
    }
];

const qcLesson14Questions = [
    {
        question: "Which platform uses Josephson junctions?",
        answers: [
            "Superconducting qubits",
            "Trapped ions",
            "Neutral atoms",
            "Photonic qubits"
        ],
        correct: 0
    },
    {
        question: "Which platform's qubits are single electrons under nanoscale gates?",
        answers: [
            "Silicon spin qubits",
            "Superconducting qubits",
            "Photonic qubits",
            "Trapped ions"
        ],
        correct: 0
    },
    {
        question: "Which platform holds the record for the most accurate two-qubit gates?",
        answers: [
            "Trapped ions",
            "Photonic",
            "Silicon spin",
            "None of them work"
        ],
        correct: 0
    },
    {
        question: "How are neutral-atom qubits held in place?",
        answers: [
            "Laser beams called optical tweezers",
            "Glue",
            "Gold electrodes",
            "Magnets only"
        ],
        correct: 0
    },
    {
        question: "Which platform needs superconducting nanowire single-photon detectors?",
        answers: [
            "Photonic",
            "Trapped ion",
            "Silicon spin",
            "Superconducting"
        ],
        correct: 0
    },
    {
        question: "Which platform could reuse existing chip factories most directly?",
        answers: [
            "Silicon spin qubits",
            "Neutral atoms",
            "Trapped ions",
            "Diamond NV centres"
        ],
        correct: 0
    }
];

const qcLesson15Questions = [
    {
        question: "What happens to a superconductor's resistance below its critical temperature?",
        answers: [
            "It drops to exactly zero",
            "It halves",
            "It rises sharply",
            "It stays the same"
        ],
        correct: 0
    },
    {
        question: "Which of these never becomes superconducting, however cold it gets?",
        answers: [
            "Copper",
            "Aluminium",
            "Niobium",
            "Tantalum"
        ],
        correct: 0
    },
    {
        question: "What is the Meissner effect?",
        answers: [
            "A superconductor pushing magnetic field out of itself",
            "Resistance rising with temperature",
            "Light bending in a crystal",
            "Electrons sticking to a surface"
        ],
        correct: 0
    },
    {
        question: "Roughly what is aluminium's critical temperature?",
        answers: [
            "1.2 K",
            "77 K",
            "300 K",
            "0.01 K"
        ],
        correct: 0
    },
    {
        question: "Aluminium superconducts at 1.2 K. Why do qubit chips sit at about 10 mK?",
        answers: [
            "So heat can't kick 5 GHz qubits into the 1 state",
            "Aluminium only superconducts below 10 mK",
            "To make the chip shrink",
            "To stop the metal oxidising"
        ],
        correct: 0
    },
    {
        question: "Why are quantum chips placed inside magnetic shields?",
        answers: [
            "Trapped magnetic flux vortices absorb qubit energy",
            "Magnets make the fridge colder",
            "Shields amplify the readout signal",
            "To hold the chip in place"
        ],
        correct: 0
    }
];

const qcLesson16Questions = [
    {
        question: "What is a Cooper pair?",
        answers: [
            "Two electrons bound together through the lattice",
            "A proton and an electron",
            "Two atoms sharing a bond",
            "A pair of photons"
        ],
        correct: 0
    },
    {
        question: "What charge does a Cooper pair carry?",
        answers: [
            "2e",
            "e",
            "Zero",
            "e/2"
        ],
        correct: 0
    },
    {
        question: "Why does a 5 GHz qubit photon not break Cooper pairs in aluminium?",
        answers: [
            "Its energy is far below the gap, about 90 GHz",
            "Aluminium has no energy gap",
            "Photons can't reach the metal",
            "It always breaks them"
        ],
        correct: 0
    },
    {
        question: "What is a quasiparticle?",
        answers: [
            "Half of a broken Cooper pair",
            "A type of qubit",
            "A photon in a resonator",
            "A defect in the substrate"
        ],
        correct: 0
    },
    {
        question: "How can quasiparticles cause qubit errors?",
        answers: [
            "By tunnelling across the junction and absorbing the qubit's energy",
            "By heating the fridge to room temperature",
            "By changing the chip's colour",
            "They can't cause errors"
        ],
        correct: 0
    },
    {
        question: "What is the flux quantum Φ_0?",
        answers: [
            "h/2e, about 2.07 × 10^(−15) webers",
            "The charge of an electron",
            "The temperature of the fridge",
            "The frequency of a qubit"
        ],
        correct: 0
    }
];

const qcLesson17Questions = [
    {
        question: "What is a Josephson junction?",
        answers: [
            "Two superconductors separated by a very thin insulating barrier",
            "A copper wire joint",
            "A transistor",
            "A capacitor made of glass"
        ],
        correct: 0
    },
    {
        question: "How thick is the oxide barrier in a typical qubit junction?",
        answers: [
            "About 1 to 2 nm",
            "About 1 mm",
            "About 1 µm",
            "About 1 m"
        ],
        correct: 0
    },
    {
        question: "Below the critical current, what is the voltage across the junction?",
        answers: [
            "Zero",
            "Exactly 1 volt",
            "It oscillates at 1 Hz",
            "It equals the current"
        ],
        correct: 0
    },
    {
        question: "What makes the Josephson junction so useful for qubits?",
        answers: [
            "It is a nonlinear inductor with no resistance",
            "It is very large",
            "It glows when current flows",
            "It stores charge permanently"
        ],
        correct: 0
    },
    {
        question: "Why are junctions so sensitive to fabrication?",
        answers: [
            "The tunnelling current falls exponentially with barrier thickness",
            "They are made of gold",
            "They are measured at room temperature",
            "They have no barrier"
        ],
        correct: 0
    },
    {
        question: "What does a SQUID let you do?",
        answers: [
            "Tune the junction's strength, and the qubit frequency, with magnetic flux",
            "Cool the chip",
            "Measure temperature",
            "Remove the oxide"
        ],
        correct: 0
    }
];

const qcLesson18Questions = [
    {
        question: "Why isn't a plain LC circuit a good qubit?",
        answers: [
            "Its energy levels are equally spaced, so pulses climb the whole ladder",
            "It has no energy levels",
            "It can't oscillate",
            "It's too small"
        ],
        correct: 0
    },
    {
        question: "What is anharmonicity?",
        answers: [
            "The difference between the 1→2 and 0→1 step sizes",
            "The resistance of the circuit",
            "The size of the capacitor",
            "The fridge temperature"
        ],
        correct: 0
    },
    {
        question: "What problem did the transmon solve compared with the Cooper-pair box?",
        answers: [
            "Sensitivity to stray charge noise",
            "Needing a fridge",
            "Using superconductors",
            "Having a junction"
        ],
        correct: 0
    },
    {
        question: "How did the transmon reduce charge sensitivity?",
        answers: [
            "A large shunting capacitor raises E_J/E_C to about 50",
            "It removed the junction",
            "It used copper",
            "It operates at room temperature"
        ],
        correct: 0
    },
    {
        question: "For a transmon, the qubit frequency is approximately:",
        answers: [
            "√(8 E_J E_C) − E_C",
            "E_J + E_C",
            "E_J × E_C",
            "1 / E_C"
        ],
        correct: 0
    },
    {
        question: "What sets a transmon's charging energy E_C?",
        answers: [
            "The capacitance of its pads",
            "The junction's oxide",
            "The fridge temperature",
            "The readout resonator"
        ],
        correct: 0
    }
];

const qcLesson19Questions = [
    {
        question: "What sets the frequency of a quarter-wave coplanar resonator?",
        answers: [
            "Its length",
            "Its colour",
            "The fridge temperature",
            "The qubit's state"
        ],
        correct: 0
    },
    {
        question: "What does a quality factor Q of one million tell you?",
        answers: [
            "The resonator rings for about a million cycles: very low loss",
            "It has a million qubits",
            "It is a million times too hot",
            "It reflects a million signals"
        ],
        correct: 0
    },
    {
        question: "How is a transmon usually read out?",
        answers: [
            "Through the frequency shift it causes in a coupled resonator",
            "By looking at it with a microscope",
            "By measuring its temperature",
            "By counting electrons with a voltmeter"
        ],
        correct: 0
    },
    {
        question: "Why don't longer measurements always give better readout?",
        answers: [
            "The qubit may decay from 1 to 0 during the measurement",
            "The resonator melts",
            "Noise grows with time",
            "Longer measurements are illegal"
        ],
        correct: 0
    },
    {
        question: "What is the first amplifier the readout signal meets?",
        answers: [
            "A near-quantum-limited parametric amplifier at about 10 mK",
            "A loudspeaker",
            "A room-temperature amplifier",
            "The HEMT at 300 K"
        ],
        correct: 0
    },
    {
        question: "Why are readout resonators made with fairly low Q?",
        answers: [
            "So the signal leaks out quickly for fast measurements",
            "Because high Q is impossible",
            "To heat the qubit",
            "To save metal"
        ],
        correct: 0
    }
];

const qcLesson20Questions = [
    {
        question: "About how cold is the mixing chamber plate of a dilution refrigerator?",
        answers: [
            "10 mK",
            "4 K",
            "77 K",
            "1 K"
        ],
        correct: 0
    },
    {
        question: "What cools the 50 K and 4 K plates in a modern 'dry' fridge?",
        answers: [
            "A pulse-tube cooler",
            "Liquid nitrogen",
            "Ice",
            "A fan"
        ],
        correct: 0
    },
    {
        question: "Where does the cooling in a dilution fridge happen?",
        answers: [
            "Where helium-3 crosses from the concentrated phase into the dilute phase",
            "In the pulse tube",
            "At room temperature",
            "In the coaxial cables"
        ],
        correct: 0
    },
    {
        question: "What role does the still play?",
        answers: [
            "Pumping helium-3 out of the dilute phase to drive the cycle",
            "Holding the chip",
            "Amplifying signals",
            "Filtering light"
        ],
        correct: 0
    },
    {
        question: "Why are attenuators placed on each plate of the drive lines?",
        answers: [
            "To absorb room-temperature thermal noise before it reaches the qubits",
            "To make signals louder",
            "To heat the plates",
            "To hold the cables"
        ],
        correct: 0
    },
    {
        question: "Why is wiring a problem when scaling up?",
        answers: [
            "Every line brings heat, and cooling power at 10 mK is only microwatts",
            "Wires are too expensive to buy",
            "Wires can't carry microwaves",
            "Wires block the view"
        ],
        correct: 0
    }
];

const qcLesson21Questions = [
    {
        question: "Which two substrates are most common for superconducting qubits?",
        answers: [
            "High-resistivity silicon and sapphire",
            "Glass and plastic",
            "Copper and gold",
            "Paper and wood"
        ],
        correct: 0
    },
    {
        question: "What does the loss tangent tan δ describe?",
        answers: [
            "The fraction of microwave energy a material absorbs each cycle",
            "The angle of the wafer flat",
            "The thickness of the wafer",
            "The colour of the substrate"
        ],
        correct: 0
    },
    {
        question: "What does a dilute HF dip do to a silicon wafer?",
        answers: [
            "Removes the native oxide, leaving a hydrogen-terminated surface",
            "Grows a thick oxide",
            "Deposits aluminium",
            "Cuts the wafer into chips"
        ],
        correct: 0
    },
    {
        question: "Why must a cleaned wafer go into vacuum quickly?",
        answers: [
            "The native oxide starts regrowing in air within minutes",
            "It will melt",
            "It becomes magnetic",
            "It's illegal to leave it out"
        ],
        correct: 0
    },
    {
        question: "Where does most loss in today's qubits hide?",
        answers: [
            "At surfaces and interfaces",
            "In the fridge's pumps",
            "In the room-temperature electronics",
            "In the bulk of a pure substrate"
        ],
        correct: 0
    },
    {
        question: "Why do industrial fabs prefer 200 or 300 mm wafers?",
        answers: [
            "More chips per wafer and the same automated tools as ordinary chips",
            "They are easier to break",
            "They superconduct better",
            "They are required by law"
        ],
        correct: 0
    }
];

const qcLesson22Questions = [
    {
        question: "Why is electron-beam evaporation used for junctions?",
        answers: [
            "Its atoms travel in straight lines, so resist shadows define the layers",
            "It is the only way to deposit aluminium",
            "It is the hottest method",
            "It needs no vacuum"
        ],
        correct: 0
    },
    {
        question: "Which metal forms the junction barrier in almost every superconducting qubit?",
        answers: [
            "Aluminium",
            "Copper",
            "Niobium",
            "Gold"
        ],
        correct: 0
    },
    {
        question: "What are TLS defects?",
        answers: [
            "Atoms in amorphous oxides that flip between two positions and absorb energy",
            "Gaps in the ground plane",
            "Scratches on the wafer",
            "Bubbles of helium"
        ],
        correct: 0
    },
    {
        question: "Why can tantalum make longer-lived qubits than niobium?",
        answers: [
            "Its native oxide is thinner and more benign",
            "It is cheaper",
            "It does not superconduct",
            "It has a higher critical temperature"
        ],
        correct: 0
    },
    {
        question: "Which tantalum phase do qubits want?",
        answers: [
            "Alpha (body-centred cubic), with T_c about 4.4 K",
            "Beta, with T_c under 1 K",
            "Liquid tantalum",
            "Tantalum oxide"
        ],
        correct: 0
    },
    {
        question: "How is film thickness controlled when sputtering?",
        answers: [
            "Deposition rate (set by power) times time, from a calibration",
            "By weighing the wafer",
            "By guessing",
            "By the colour of the plasma"
        ],
        correct: 0
    }
];

const qcLesson23Questions = [
    {
        question: "What is the order of a basic lithography cycle?",
        answers: [
            "Spin resist, expose, develop, etch, strip",
            "Etch, expose, spin, strip",
            "Strip, etch, develop, spin",
            "Develop, spin, etch, expose"
        ],
        correct: 0
    },
    {
        question: "Why is dry plasma etching preferred for fine qubit features?",
        answers: [
            "It is directional, giving vertical walls without undercut",
            "It uses less electricity",
            "It works without a mask",
            "It adds metal"
        ],
        correct: 0
    },
    {
        question: "In liftoff, what removes the unwanted metal?",
        answers: [
            "Dissolving the resist underneath it",
            "A plasma etch",
            "Sanding",
            "Heating to 1000 °C"
        ],
        correct: 0
    },
    {
        question: "What sets a coplanar waveguide's impedance?",
        answers: [
            "The ratio of strip width to gap, and the substrate",
            "Its length only",
            "The fridge temperature",
            "The qubit frequency"
        ],
        correct: 0
    },
    {
        question: "What symptom would resist residue left under the capacitor pads cause?",
        answers: [
            "Extra loss and a shorter T_1",
            "A short circuit",
            "An open circuit",
            "A colour change"
        ],
        correct: 0
    },
    {
        question: "Why must on-chip lines be 50 Ω?",
        answers: [
            "To match the cables, so signals don't reflect",
            "Because 50 is a lucky number",
            "To make them superconduct",
            "To slow signals down"
        ],
        correct: 0
    }
];

const qcLesson24Questions = [
    {
        question: "What is a Dolan bridge?",
        answers: [
            "A strip of resist suspended over a cavity, used to cast a shadow",
            "A bridge in a quantum computing lab",
            "A metal airbridge",
            "A type of qubit"
        ],
        correct: 0
    },
    {
        question: "In shadow evaporation, what happens between the two evaporations?",
        answers: [
            "The first aluminium layer is oxidised to form the barrier",
            "The wafer is diced",
            "The resist is removed",
            "The chip is cooled to 10 mK"
        ],
        correct: 0
    },
    {
        question: "How far does each evaporation shift the pattern?",
        answers: [
            "h · tan θ, where h is the bridge height",
            "Exactly 1 mm",
            "The bridge width",
            "Zero"
        ],
        correct: 0
    },
    {
        question: "What sets a junction's normal-state resistance?",
        answers: [
            "The barrier's resistance per area divided by the junction area",
            "The colour of the oxide",
            "The fridge temperature",
            "The substrate thickness"
        ],
        correct: 0
    },
    {
        question: "What is the main advantage of Manhattan-style junctions?",
        answers: [
            "They need no fragile suspended bridge, so they are more reproducible",
            "They use no aluminium",
            "They need no oxidation",
            "They are visible to the eye"
        ],
        correct: 0
    },
    {
        question: "A 2% spread in junction resistance gives roughly what spread in qubit frequency?",
        answers: [
            "About 1%",
            "About 20%",
            "About 0.01%",
            "About 2,000%"
        ],
        correct: 0
    }
];

const qcLesson25Questions = [
    {
        question: "How can you predict a qubit's frequency before cooling it down?",
        answers: [
            "Measure the junction's room-temperature resistance and use Ambegaokar–Baratoff",
            "Look at its colour",
            "Weigh the chip",
            "It can't be predicted"
        ],
        correct: 0
    },
    {
        question: "What is a frequency collision?",
        answers: [
            "Neighbouring qubits with frequencies too close for clean gates",
            "Two chips touching",
            "A crash in the fridge",
            "Photons bouncing off each other"
        ],
        correct: 0
    },
    {
        question: "What does laser annealing do to a junction?",
        answers: [
            "Raises its resistance, lowering the qubit frequency",
            "Lowers its resistance, raising the frequency",
            "Removes it completely",
            "Makes it superconduct at room temperature"
        ],
        correct: 0
    },
    {
        question: "Why do designers aim slightly high in frequency before trimming?",
        answers: [
            "Trimming only moves the frequency down",
            "High frequencies are always better",
            "To use less metal",
            "Because cooling raises frequency"
        ],
        correct: 0
    },
    {
        question: "What is an advantage of fixed-frequency transmons?",
        answers: [
            "No flux line and no sensitivity to flux noise",
            "They can be tuned after fabrication",
            "They need no junction",
            "They don't need a fridge"
        ],
        correct: 0
    },
    {
        question: "What does a flux-tunable qubit use instead of a single junction?",
        answers: [
            "A SQUID loop of two junctions",
            "A resistor",
            "A diode",
            "A laser"
        ],
        correct: 0
    }
];

const qcLesson26Questions = [
    {
        question: "Why are airbridges added across coplanar lines?",
        answers: [
            "To tie the ground planes together and suppress unwanted modes",
            "To make the chip look nice",
            "To cool the chip",
            "To hold the chip down"
        ],
        correct: 0
    },
    {
        question: "What is a slotline mode?",
        answers: [
            "The two ground halves carrying opposite voltages",
            "A qubit's ground state",
            "A gap in the resist",
            "A mode of the fridge pump"
        ],
        correct: 0
    },
    {
        question: "How is the arch shape of an airbridge made?",
        answers: [
            "Resist is reflowed into a hump, coated with metal, then dissolved",
            "The metal is bent by hand",
            "It is 3D printed",
            "It grows naturally"
        ],
        correct: 0
    },
    {
        question: "What is a crossover?",
        answers: [
            "An airbridge that lets one signal line pass over another",
            "A collision between two qubits",
            "A type of junction",
            "A resonator mode"
        ],
        correct: 0
    },
    {
        question: "What happens if an airbridge is too long and thin?",
        answers: [
            "It can sag and short the line underneath",
            "It becomes a qubit",
            "It gets colder",
            "Nothing"
        ],
        correct: 0
    },
    {
        question: "Which of these needs an airbridge?",
        answers: [
            "A patch of ground plane surrounded by lines",
            "A Josephson junction",
            "A bond pad",
            "The substrate"
        ],
        correct: 0
    }
];

const qcLesson27Questions = [
    {
        question: "Why do large processors need 3D integration?",
        answers: [
            "Qubits grow with area but wire bonds only fit along the edge",
            "Flat chips can't superconduct",
            "3D chips are cheaper",
            "To make them lighter"
        ],
        correct: 0
    },
    {
        question: "In a flip-chip processor, where are the qubits?",
        answers: [
            "On a separate chip, face-down above the wiring chip",
            "On the fridge plates",
            "Inside the coax cables",
            "On the room-temperature electronics"
        ],
        correct: 0
    },
    {
        question: "What material are the bump bonds usually made of?",
        answers: [
            "Indium",
            "Copper",
            "Glass",
            "Silicon"
        ],
        correct: 0
    },
    {
        question: "Why does indium work as a bump bond?",
        answers: [
            "It's soft, cold-welds under pressure, and superconducts below 3.4 K",
            "It's magnetic",
            "It's transparent",
            "It's a perfect insulator"
        ],
        correct: 0
    },
    {
        question: "What is a through-silicon via?",
        answers: [
            "A superconductor-lined hole carrying signals through the chip",
            "A gap between qubits",
            "A crack in the wafer",
            "A laser beam"
        ],
        correct: 0
    },
    {
        question: "How do vias help with box modes?",
        answers: [
            "They split the chip into small cells, pushing modes above the qubit band",
            "They lower the qubit frequency",
            "They cool the chip",
            "They don't affect box modes"
        ],
        correct: 0
    }
];
