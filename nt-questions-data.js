/* ========================================
   NEUROTRANSMITTERS QUIZ QUESTIONS
   Five questions per unit. "correct" is the
   0-based index of the right answer; the quiz
   shuffles the answer order when it renders.
======================================== */

const ntLesson1Questions = [
    {
        question: "Which part of a neuron usually receives incoming signals?",
        answers: [
            "The axon terminals",
            "The myelin sheath",
            "The dendrites",
            "The synaptic vesicles"
        ],
        correct: 2
    },
    {
        question: "How does a signal travel along an axon?",
        answers: [
            "As an electrical pulse called an action potential",
            "As a chemical released along the whole length",
            "As a flow of blood through the axon",
            "As a sound wave in the membrane"
        ],
        correct: 0
    },
    {
        question: "How do signals usually cross from one neuron to the next?",
        answers: [
            "Blood carries the signal between the cells",
            "The two cells swap their nuclei",
            "Light flashes between the cells",
            "Neurotransmitters cross a tiny gap"
        ],
        correct: 3
    },
    {
        question: "Roughly how many neurons are in a human brain?",
        answers: [
            "About 86 thousand",
            "About 86 million",
            "About 86 billion",
            "About 86 trillion"
        ],
        correct: 2
    },
    {
        question: "Why is a chemical step useful in signaling?",
        answers: [
            "It lets signals travel faster than light",
            "It stops neurons from ever firing",
            "It allows many signal types and fine adjustment",
            "It removes the need for a gap"
        ],
        correct: 2
    }
];

const ntLesson2Questions = [
    {
        question: "Which ion rushes into the neuron during the rising phase?",
        answers: [
            "Potassium (K⁺)",
            "Sodium (Na⁺)",
            "Calcium (Ca²⁺)",
            "Chloride (Cl⁻)"
        ],
        correct: 1
    },
    {
        question: "About what is a neuron's resting potential?",
        answers: [
            "+70 mV",
            "−70 mV",
            "+40 mV",
            "0 mV"
        ],
        correct: 1
    },
    {
        question: "What does all or none mean for a spike?",
        answers: [
            "Every neuron in the brain fires together",
            "A neuron fires a full spike or none at all",
            "A spike gets bigger with a stronger stimulus",
            "A spike cannot travel along an axon"
        ],
        correct: 1
    },
    {
        question: "How does a neuron signal a stronger stimulus?",
        answers: [
            "With more spikes per second",
            "With taller spikes",
            "With wider spikes",
            "With a different ion"
        ],
        correct: 0
    },
    {
        question: "What does myelin do?",
        answers: [
            "Speeds conduction by insulating the axon",
            "Makes the neuron fire more often",
            "Stores neurotransmitter for release",
            "Pumps ions across the membrane"
        ],
        correct: 0
    }
];

const ntLesson3Questions = [
    {
        question: "What fills synaptic vesicles?",
        answers: [
            "Sodium ions in a salt solution",
            "Strands of myelin from the axon",
            "Blood plasma from nearby vessels",
            "Neurotransmitter molecules"
        ],
        correct: 3
    },
    {
        question: "About how wide is the synaptic cleft?",
        answers: [
            "About 20 to 40 µm",
            "About 20 to 40 mm",
            "About 20 to 40 nm",
            "About 2 to 4 nm"
        ],
        correct: 2
    },
    {
        question: "Where are the receptors at a synapse?",
        answers: [
            "Inside the vesicles",
            "On the postsynaptic membrane",
            "On the myelin sheath",
            "Inside the presynaptic nucleus"
        ],
        correct: 1
    },
    {
        question: "Why is crossing the cleft so fast?",
        answers: [
            "Neurotransmitters travel faster than light",
            "The distance is only tens of nanometers",
            "Blood pumps them across the gap",
            "The cleft contains no fluid"
        ],
        correct: 1
    },
    {
        question: "Which cells help clear neurotransmitter near synapses?",
        answers: [
            "Astrocytes",
            "Red blood cells",
            "Skin cells",
            "Muscle fibers"
        ],
        correct: 0
    }
];

const ntLesson4Questions = [
    {
        question: "What triggers vesicle release at the terminal?",
        answers: [
            "Sodium leaving the cell",
            "Chloride entering the cell",
            "Potassium leaving the vesicle",
            "Calcium entering the terminal"
        ],
        correct: 3
    },
    {
        question: "How is acetylcholine mainly cleared from the cleft?",
        answers: [
            "It is pumped back through the serotonin transporter",
            "It is taken up by dopamine transporters",
            "An enzyme, acetylcholinesterase, breaks it down",
            "It drifts into the bloodstream only"
        ],
        correct: 2
    },
    {
        question: "What does reuptake do?",
        answers: [
            "Pumps transmitter back into a cell",
            "Releases more transmitter from vesicles",
            "Breaks down the receptors",
            "Opens calcium channels"
        ],
        correct: 0
    },
    {
        question: "What does blocking reuptake do to transmitter in the cleft?",
        answers: [
            "Keeps more of it there for longer",
            "Removes it much faster",
            "Turns it into another transmitter",
            "Stops its release completely"
        ],
        correct: 0
    },
    {
        question: "What is the fusion of vesicles with the membrane called?",
        answers: [
            "Endocytosis",
            "Osmosis",
            "Exocytosis",
            "Phagocytosis"
        ],
        correct: 2
    }
];

const ntLesson5Questions = [
    {
        question: "Which is the main inhibitory neurotransmitter in the brain?",
        answers: [
            "Glutamate",
            "Dopamine",
            "Acetylcholine",
            "GABA"
        ],
        correct: 3
    },
    {
        question: "Which pair are both monoamines?",
        answers: [
            "Glutamate and GABA",
            "Dopamine and serotonin",
            "GABA and glycine",
            "Glutamate and acetylcholine"
        ],
        correct: 1
    },
    {
        question: "About how heavy are the main neurotransmitters?",
        answers: [
            "Under 200 daltons",
            "Over 20,000 daltons",
            "About 150,000 daltons",
            "About 5 million daltons"
        ],
        correct: 0
    },
    {
        question: "Why can one transmitter excite one cell and inhibit another?",
        answers: [
            "The transmitter changes color",
            "The receptors on each cell differ",
            "The vesicles differ in size",
            "The axons differ in length"
        ],
        correct: 1
    },
    {
        question: "Which neurotransmitter is permanently positively charged?",
        answers: [
            "Glutamate",
            "GABA",
            "Acetylcholine",
            "Glycine"
        ],
        correct: 2
    }
];

const ntLesson6Questions = [
    {
        question: "Which enzyme turns glutamate into GABA?",
        answers: [
            "Glutamate decarboxylase (GAD)",
            "Acetylcholinesterase (AChE)",
            "Monoamine oxidase (MAO)",
            "Tyrosine hydroxylase (TH)"
        ],
        correct: 0
    },
    {
        question: "Which ion flows in through an open GABA-A channel?",
        answers: [
            "Sodium",
            "Calcium",
            "Chloride",
            "Hydrogen"
        ],
        correct: 2
    },
    {
        question: "What can glutamate overload cause in a stroke?",
        answers: [
            "Faster growth of myelin on axons",
            "Excitotoxicity that damages neurons",
            "Greater GABA release from terminals",
            "Stronger reuptake of glutamate"
        ],
        correct: 1
    },
    {
        question: "Which of these is a glutamate receptor?",
        answers: [
            "GABA-A",
            "Nicotinic",
            "D2",
            "NMDA"
        ],
        correct: 3
    },
    {
        question: "How do benzodiazepines act?",
        answers: [
            "They enhance GABA-A receptor activity",
            "They block glutamate release",
            "They block dopamine reuptake",
            "They break down acetylcholine"
        ],
        correct: 0
    }
];

const ntLesson7Questions = [
    {
        question: "Which amino acid does the body convert into L-DOPA?",
        answers: [
            "Tryptophan",
            "Glutamine",
            "Choline",
            "Tyrosine"
        ],
        correct: 3
    },
    {
        question: "Parkinson's disease involves loss of dopamine neurons in the...",
        answers: [
            "Cerebellum",
            "Spinal cord",
            "Retina",
            "Substantia nigra"
        ],
        correct: 3
    },
    {
        question: "Why is L-DOPA given instead of dopamine itself?",
        answers: [
            "L-DOPA can cross the blood-brain barrier, but dopamine cannot",
            "L-DOPA is a much stronger poison than dopamine is",
            "Dopamine cannot be made by the body at all",
            "L-DOPA blocks the dopamine transporter in the cleft"
        ],
        correct: 0
    },
    {
        question: "Which brain area is central to the reward pathway?",
        answers: [
            "The cerebellum",
            "The occipital cortex",
            "The respiratory center",
            "The nucleus accumbens"
        ],
        correct: 3
    },
    {
        question: "Dopamine neurons fire more when an outcome is...",
        answers: [
            "Better than expected",
            "Worse than expected",
            "Exactly the same as yesterday",
            "Never rewarding at all"
        ],
        correct: 0
    }
];

const ntLesson8Questions = [
    {
        question: "Which amino acid is serotonin made from?",
        answers: [
            "Tyrosine",
            "Glutamine",
            "Tryptophan",
            "Glycine"
        ],
        correct: 2
    },
    {
        question: "Where is most of the body's serotonin made?",
        answers: [
            "In the brain",
            "In the gut",
            "In the blood plasma",
            "In the skin"
        ],
        correct: 1
    },
    {
        question: "What do SSRIs block?",
        answers: [
            "The serotonin transporter (SERT)",
            "The dopamine D2 receptor itself",
            "The enzyme acetylcholinesterase",
            "The release of glutamate from vesicles"
        ],
        correct: 0
    },
    {
        question: "What does an SSRI do to serotonin in the cleft?",
        answers: [
            "Keeps more of it there for longer",
            "Removes it from the cleft much faster",
            "Converts it into dopamine at once",
            "Stops its release from the terminal"
        ],
        correct: 0
    },
    {
        question: "Why are SSRIs not instantly effective for mood?",
        answers: [
            "They only work at night",
            "They must first turn into dopamine",
            "Benefits often take weeks to appear",
            "They stop working after a single dose"
        ],
        correct: 2
    }
];

const ntLesson9Questions = [
    {
        question: "Which receptors does acetylcholine activate on a muscle fiber?",
        answers: [
            "Dopamine D2 receptors",
            "Nicotinic receptors",
            "GABA-A receptors",
            "NMDA receptors"
        ],
        correct: 1
    },
    {
        question: "What do acetylcholinesterase inhibitors do?",
        answers: [
            "Stop its release from the vesicles",
            "Let acetylcholine last longer in the cleft",
            "Convert it into dopamine in the terminal",
            "Block its receptors on the muscle"
        ],
        correct: 1
    },
    {
        question: "Norepinephrine is made from...",
        answers: [
            "Serotonin",
            "Glutamate",
            "Dopamine",
            "Choline"
        ],
        correct: 2
    },
    {
        question: "Compared with classic transmitters, neuropeptides are...",
        answers: [
            "Larger and slower acting",
            "Smaller and faster acting",
            "Identical in size",
            "Found only in muscle"
        ],
        correct: 0
    },
    {
        question: "Why are nerve agents so dangerous?",
        answers: [
            "They block calcium channels in the bloodstream",
            "They destroy the myelin on every axon at once",
            "They mimic dopamine at its receptors",
            "They block acetylcholinesterase and flood the synapse"
        ],
        correct: 3
    }
];

const ntLesson10Questions = [
    {
        question: "Which receptor type opens an ion channel directly?",
        answers: [
            "Ionotropic",
            "Metabotropic",
            "A reuptake transporter",
            "An enzyme in the cleft"
        ],
        correct: 0
    },
    {
        question: "Which receptor type is generally faster?",
        answers: [
            "Metabotropic",
            "Both act at identical speeds",
            "Ionotropic",
            "Neither responds within a second"
        ],
        correct: 2
    },
    {
        question: "Dopamine receptors D1 to D5 are mostly...",
        answers: [
            "Ligand-gated ion channels",
            "G-protein-coupled (metabotropic)",
            "Reuptake pumps in the membrane",
            "Enzymes that sit in the cleft"
        ],
        correct: 1
    },
    {
        question: "What does an activated G protein do?",
        answers: [
            "Opens a pore through the membrane like a channel",
            "Breaks down the transmitter in the cleft",
            "Starts a signaling cascade inside the cell",
            "Pumps ions out of the cell body"
        ],
        correct: 2
    },
    {
        question: "Why can drugs be selective for one serotonin effect?",
        answers: [
            "Serotonin has many receptor subtypes",
            "Serotonin has only one receptor",
            "All subtypes respond to every drug",
            "Receptors differ only in color"
        ],
        correct: 0
    }
];

const ntLesson11Questions = [
    {
        question: "At what ligand concentration are half the receptors occupied?",
        answers: [
            "When [L] is zero",
            "When [L] is ten times Kd",
            "When [L] is twice the receptor count",
            "When [L] equals Kd"
        ],
        correct: 3
    },
    {
        question: "A ligand with Kd = 10 nM is at 10 nM. What is the occupancy?",
        answers: [
            "10%",
            "90%",
            "100%",
            "50%"
        ],
        correct: 3
    },
    {
        question: "The same ligand (Kd = 10 nM) is at 100 nM. About what is the occupancy?",
        answers: [
            "About 91%",
            "About 50%",
            "About 10%",
            "About 99.9%"
        ],
        correct: 0
    },
    {
        question: "What does a lower Kd mean?",
        answers: [
            "Weaker binding (lower affinity)",
            "No binding to the receptor at all",
            "Faster reuptake from the cleft",
            "Tighter binding (higher affinity)"
        ],
        correct: 3
    },
    {
        question: "What does an antagonist do?",
        answers: [
            "Binds a receptor and fully activates it",
            "Binds a receptor and blocks activation",
            "Breaks the transmitter down in the cleft",
            "Releases vesicles from the terminal"
        ],
        correct: 1
    }
];

const ntLesson12Questions = [
    {
        question: "Fluoxetine is an example of a...",
        answers: [
            "Reuptake blocker",
            "Muscle receptor antagonist",
            "Precursor",
            "Vesicle toxin"
        ],
        correct: 0
    },
    {
        question: "How does donepezil work?",
        answers: [
            "It inhibits acetylcholinesterase",
            "It blocks dopamine receptors",
            "It releases serotonin",
            "It opens GABA channels"
        ],
        correct: 0
    },
    {
        question: "Haloperidol is mainly a...",
        answers: [
            "Serotonin reuptake blocker",
            "Dopamine D2 receptor antagonist",
            "GABA-A modulator",
            "Acetylcholine precursor"
        ],
        correct: 1
    },
    {
        question: "Where do benzodiazepines bind?",
        answers: [
            "The GABA site itself, replacing GABA",
            "The dopamine transporter in the terminal",
            "The inside of the synaptic vesicles",
            "A separate site on GABA-A, boosting GABA's effect"
        ],
        correct: 3
    },
    {
        question: "L-DOPA acts as a...",
        answers: [
            "A precursor that becomes dopamine",
            "A reuptake blocker at the transporter",
            "A receptor antagonist at D2 receptors",
            "An inhibitor of the enzyme MAO-B"
        ],
        correct: 0
    }
];

const ntLesson13Questions = [
    {
        question: "What is an EPSP?",
        answers: [
            "A complete action potential spike",
            "A pump that removes sodium ions",
            "A vesicle filled with transmitter",
            "A small depolarization toward threshold"
        ],
        correct: 3
    },
    {
        question: "What does an IPSP do to a neuron?",
        answers: [
            "Forces it to fire immediately",
            "Moves it away from threshold",
            "Doubles its spike size",
            "Disconnects its axon"
        ],
        correct: 1
    },
    {
        question: "What is temporal summation?",
        answers: [
            "Inputs from different neurons cancel",
            "Spikes get slower over time",
            "Transmitter reuptake speeds up",
            "Inputs close together in time add up"
        ],
        correct: 3
    },
    {
        question: "Where does a neuron usually start an action potential?",
        answers: [
            "At the tips of the dendrites",
            "At the axon initial segment",
            "At the axon terminals",
            "On the myelin sheath"
        ],
        correct: 1
    },
    {
        question: "What is long-term potentiation?",
        answers: [
            "Permanent loss of a neuron from disease",
            "Faster reuptake of dopamine in the cleft",
            "Lasting strengthening of a synapse with use",
            "A drug class that blocks receptors"
        ],
        correct: 2
    }
];

const ntLesson14Questions = [
    {
        question: "How long does a synaptic release event last?",
        answers: [
            "About an hour",
            "About a day",
            "About a minute",
            "About a millisecond"
        ],
        correct: 3
    },
    {
        question: "What are phasic dopamine signals?",
        answers: [
            "Slow shifts that build over many hours",
            "Constant levels that never change at all",
            "Signals seen only during deep sleep",
            "Fast bursts lasting about a second or less"
        ],
        correct: 3
    },
    {
        question: "Which molecule is much more abundant than dopamine and can also react at an electrode?",
        answers: [
            "Sodium chloride (table salt)",
            "Hemoglobin from red blood cells",
            "Pure water in the tissue",
            "Ascorbic acid (vitamin C)"
        ],
        correct: 3
    },
    {
        question: "Why is the small size of synapses a problem for sensors?",
        answers: [
            "The cleft and terminals are far smaller than most probes",
            "Neurons are too large for any probe to reach",
            "The brain contains no fluid to sample",
            "Probes are always smaller than a single synapse"
        ],
        correct: 0
    },
    {
        question: "Baseline extracellular dopamine is roughly...",
        answers: [
            "In the molar range",
            "Equal to blood glucose",
            "Always exactly zero",
            "In the nanomolar range"
        ],
        correct: 3
    }
];

const ntLesson15Questions = [
    {
        question: "What is the usual time resolution of microdialysis?",
        answers: [
            "Microseconds",
            "Milliseconds",
            "Minutes",
            "Under one second"
        ],
        correct: 2
    },
    {
        question: "What carries molecules from tissue into the probe fluid?",
        answers: [
            "Pressure from the pump",
            "Diffusion across the membrane",
            "An electric field",
            "Gravity"
        ],
        correct: 1
    },
    {
        question: "What does a slower flow rate give?",
        answers: [
            "Lower relative recovery",
            "No change in recovery",
            "Higher relative recovery",
            "Faster time resolution"
        ],
        correct: 2
    },
    {
        question: "What is a strength of microdialysis?",
        answers: [
            "It follows release millisecond by millisecond",
            "It needs no probe at all",
            "It can measure many molecules from the same sample",
            "It causes no tissue disturbance"
        ],
        correct: 2
    },
    {
        question: "How are the collected samples usually analyzed?",
        answers: [
            "A stopwatch and a ruler held beside the vial",
            "A pH strip dipped into each collected sample",
            "Direct visual inspection of the vial by eye",
            "HPLC with electrochemical or mass spectrometry detection"
        ],
        correct: 3
    }
];

const ntLesson16Questions = [
    {
        question: "About how wide is a carbon-fiber microelectrode?",
        answers: [
            "About 5 to 7 micrometers",
            "About 5 to 7 millimeters",
            "About 5 to 7 nanometers",
            "About 5 to 7 centimeters"
        ],
        correct: 0
    },
    {
        question: "Near what voltage does dopamine oxidize in FSCV?",
        answers: [
            "About +0.6 V",
            "About −0.6 V",
            "About +6 V",
            "About 0 V"
        ],
        correct: 0
    },
    {
        question: "How many electrons does dopamine release when it is oxidized?",
        answers: [
            "Two",
            "One",
            "Four",
            "Eight"
        ],
        correct: 0
    },
    {
        question: "Why is the background current subtracted?",
        answers: [
            "To cool the electrode during the scan",
            "To count the neurons near the probe",
            "To lower the voltage that is applied",
            "It is much larger than the dopamine signal"
        ],
        correct: 3
    },
    {
        question: "Which neurotransmitter can FSCV not detect directly?",
        answers: [
            "Dopamine",
            "Glutamate",
            "Serotonin",
            "Norepinephrine"
        ],
        correct: 1
    }
];

const ntLesson17Questions = [
    {
        question: "What does the sensor iGluSnFR detect?",
        answers: [
            "Dopamine",
            "GABA",
            "Glutamate",
            "Acetylcholine"
        ],
        correct: 2
    },
    {
        question: "How does a genetically encoded sensor report a transmitter?",
        answers: [
            "It changes its fluorescence when it binds",
            "It heats the tissue around it",
            "It releases an electrical pulse",
            "It changes the electrode voltage"
        ],
        correct: 0
    },
    {
        question: "About how long is the Debye length in body-like salt solution?",
        answers: [
            "About 100 nm",
            "About 10 µm",
            "Under about 1 nm",
            "About 1 mm"
        ],
        correct: 2
    },
    {
        question: "Why is Debye screening a problem for transistor sensors?",
        answers: [
            "The transistor dissolves away in salt water",
            "Salt blocks all electric current in the fluid",
            "Neurotransmitters carry no charge at all",
            "Charge beyond a nanometer or so is screened by salt"
        ],
        correct: 3
    },
    {
        question: "Which is a good question to ask about a sensor claim?",
        answers: [
            "How shiny is the packaging, and is the logo blue?",
            "How selective is it, and was it tested in living tissue?",
            "How long is the brochure, and is it in color?",
            "How many sensors were sold in the first year?"
        ],
        correct: 1
    }
];

const ntAllLessonQuestions = {
    1: ntLesson1Questions,
    2: ntLesson2Questions,
    3: ntLesson3Questions,
    4: ntLesson4Questions,
    5: ntLesson5Questions,
    6: ntLesson6Questions,
    7: ntLesson7Questions,
    8: ntLesson8Questions,
    9: ntLesson9Questions,
    10: ntLesson10Questions,
    11: ntLesson11Questions,
    12: ntLesson12Questions,
    13: ntLesson13Questions,
    14: ntLesson14Questions,
    15: ntLesson15Questions,
    16: ntLesson16Questions,
    17: ntLesson17Questions
};
