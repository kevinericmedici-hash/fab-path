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
