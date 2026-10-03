/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP QUIZ QUESTIONS
   Five questions per unit. "correct" is the
   0-based index of the right answer; the quiz
   shuffles the answer order when it renders.
======================================== */

const bbbLesson1Questions = [
    {
        question: "What forms the blood-brain barrier?",
        answers: [
            "Sealed endothelial cells lining brain capillaries",
            "A thin plate of bone surrounding the whole brain",
            "A layer of fat tissue beneath the skull bone",
            "A mesh of nerve fibers on the brain surface"
        ],
        correct: 0
    },
    {
        question: "Roughly what share of the body's energy does the brain use?",
        answers: [
            "About 20%",
            "About 2%",
            "About 50%",
            "About 80%"
        ],
        correct: 0
    },
    {
        question: "Which best describes the job of the barrier?",
        answers: [
            "Controls what moves from blood into brain tissue",
            "Pumps blood from the heart up into the head",
            "Stores spare glucose for the brain overnight",
            "Makes the fluid that cushions the brain"
        ],
        correct: 0
    },
    {
        question: "Why is the barrier a problem for drug developers?",
        answers: [
            "It speeds up how fast the liver clears drugs",
            "It blocks many drugs from reaching the brain",
            "It makes drugs stick to the walls of veins",
            "It lowers the dose a patient can swallow"
        ],
        correct: 1
    },
    {
        question: "Compared with most organs, brain capillary walls are...",
        answers: [
            "Far leakier, with gaps between cells",
            "About the same as muscle capillaries",
            "Missing, leaving the cells bare",
            "Much more tightly sealed"
        ],
        correct: 3
    }
];

const bbbLesson2Questions = [
    {
        question: "Which cells form the actual barrier layer?",
        answers: [
            "Astrocytes",
            "Pericytes",
            "Neurons",
            "Endothelial cells"
        ],
        correct: 3
    },
    {
        question: "What do astrocyte end-feet do?",
        answers: [
            "Pump blood along the whole length of the capillary",
            "Wrap the vessel and send it support signals",
            "Make red blood cells for the bloodstream",
            "Digest the basement membrane around the vessel"
        ],
        correct: 1
    },
    {
        question: "The thin protein sheet that wraps brain capillary cells is the...",
        answers: [
            "Myelin sheath",
            "Cell nucleus",
            "Basement membrane",
            "Tight junction"
        ],
        correct: 2
    },
    {
        question: "What does the term neurovascular unit describe?",
        answers: [
            "A single large artery running deep inside the brain",
            "A device that counts the signals from neurons",
            "Vessel cells and nearby brain cells acting together",
            "A scanner that makes images of blood flow"
        ],
        correct: 2
    },
    {
        question: "Why do many barrier models add astrocytes or pericytes?",
        answers: [
            "Endothelial cells alone make a weaker barrier",
            "They make the cells grow faster in culture",
            "They are needed to sterilize the dish",
            "They make the barrier leakier on purpose"
        ],
        correct: 0
    }
];

const bbbLesson3Questions = [
    {
        question: "What is the paracellular route?",
        answers: [
            "Passing through the gap between neighboring cells",
            "Passing through the cell's own transport proteins",
            "Traveling along a nerve fiber",
            "Being carried in a vesicle across the cell"
        ],
        correct: 0
    },
    {
        question: "Which protein is the key sealing protein in brain endothelial tight junctions?",
        answers: [
            "Albumin",
            "Keratin",
            "Myosin",
            "Claudin-5"
        ],
        correct: 3
    },
    {
        question: "What does ZO-1 do?",
        answers: [
            "Pumps drugs back out of the cell into the blood",
            "Links the junction to the cell's inner skeleton",
            "Carries glucose into the cell from the blood",
            "Stores calcium ions inside the cell"
        ],
        correct: 1
    },
    {
        question: "In a healthy layer stained for ZO-1, what should you see?",
        answers: [
            "Scattered dots with wide gaps between cells",
            "A solid fill of the whole cell body",
            "A continuous outline around each cell",
            "No signal anywhere in the layer"
        ],
        correct: 2
    },
    {
        question: "Why do tight junctions raise a layer's electrical resistance?",
        answers: [
            "They add metal to the cell membrane",
            "They make the cells physically larger",
            "They increase the blood flow rate",
            "They stop ions from slipping between cells"
        ],
        correct: 3
    }
];

const bbbLesson4Questions = [
    {
        question: "Which route lets oxygen and caffeine cross?",
        answers: [
            "Receptor-mediated transcytosis in vesicles",
            "Efflux by P-glycoprotein",
            "Passive diffusion through the cell membrane",
            "Squeezing between tight junctions"
        ],
        correct: 2
    },
    {
        question: "What is GLUT1's job at the barrier?",
        answers: [
            "Pumps drugs back into the blood",
            "Carries glucose into the brain",
            "Seals the gap between cells",
            "Builds new endothelial cells"
        ],
        correct: 1
    },
    {
        question: "What does P-glycoprotein do at the barrier?",
        answers: [
            "Pushes many drugs back into the blood",
            "Carries glucose across the cell",
            "Builds tight junction strands",
            "Moves antibodies into the brain"
        ],
        correct: 0
    },
    {
        question: "Receptor-mediated transcytosis moves cargo...",
        answers: [
            "Inside vesicles across the cell",
            "Between cells through the junctions",
            "Along the nerve fibers",
            "Only along the blood side"
        ],
        correct: 0
    },
    {
        question: "Which properties help a drug cross by passive diffusion?",
        answers: [
            "Large size and a strong charge",
            "Many bonds to water molecules",
            "A very high molecular weight",
            "Small size and lipid solubility"
        ],
        correct: 3
    }
];

const bbbLesson5Questions = [
    {
        question: "Roughly what share of small-molecule drugs is often quoted as failing to cross the barrier?",
        answers: [
            "More than 98%",
            "About 10%",
            "About 40%",
            "About 70%"
        ],
        correct: 0
    },
    {
        question: "Roughly how much of an injected antibody reaches the brain?",
        answers: [
            "Around 25%",
            "About 50%",
            "About 90%",
            "Under 1%"
        ],
        correct: 3
    },
    {
        question: "Why test barrier crossing early in drug development?",
        answers: [
            "Crossing tests make drugs cheaper to manufacture",
            "Regulators ban any lab work before it",
            "A drug can fail late if it never reaches the brain",
            "It extends the shelf life of the finished drug"
        ],
        correct: 2
    },
    {
        question: "Which is a strategy for getting around the barrier?",
        answers: [
            "Attach the drug to a receptor-binding shuttle",
            "Make the drug molecule much larger than before",
            "Add extra tight junction proteins to the barrier",
            "Give the same drug in a much larger pill"
        ],
        correct: 0
    },
    {
        question: "Where does a typical antibody sit relative to the passive-diffusion limit?",
        answers: [
            "Far above it, near 150,000 daltons",
            "Far below it, near 150 daltons",
            "Right at it, near 450 daltons",
            "Just under it, near 300 daltons"
        ],
        correct: 0
    }
];

const bbbLesson6Questions = [
    {
        question: "What is a main reason animal data may not predict human results?",
        answers: [
            "Animal brains have no endothelial cells at all",
            "Transporters and pumps differ between species",
            "Mice cannot receive any drugs by injection",
            "Rats are too small for brain tissue to be measured"
        ],
        correct: 1
    },
    {
        question: "What do the 3Rs stand for?",
        answers: [
            "Record, repeat, review",
            "Reduce, refine, replace",
            "Reduce, reuse, recycle",
            "Read, report, revise"
        ],
        correct: 1
    },
    {
        question: "Which is a typical advantage of a cell-based model over an animal?",
        answers: [
            "It shows how the whole organism behaves in the body",
            "It needs no cells and no culture medium at all",
            "Many compounds can be tested quickly and cheaply",
            "It never needs any validation against real data"
        ],
        correct: 2
    },
    {
        question: "What did the 2022 FDA Modernization Act 2.0 allow?",
        answers: [
            "Skipping all safety testing for any new drug at all",
            "Organ-chips and cell tests instead of some animal tests",
            "Banning every clinical trial in human volunteers",
            "Testing drugs on animals only after human trials end"
        ],
        correct: 1
    },
    {
        question: "What advantage does a model made of human cells have?",
        answers: [
            "It can be kept at room temperature for months",
            "Human transporters and receptors are present",
            "It removes the need to test any drug",
            "It is always larger than an animal model"
        ],
        correct: 1
    }
];

const bbbLesson7Questions = [
    {
        question: "In a Transwell, which compartment usually stands in for the blood?",
        answers: [
            "The bottom (basolateral) compartment",
            "The plastic wall of the well",
            "The top (apical) compartment",
            "The lid of the plate"
        ],
        correct: 2
    },
    {
        question: "About how wide are the pores in a typical Transwell membrane?",
        answers: [
            "About 0.4 to 3 nanometers",
            "About 0.4 to 3 millimeters",
            "About 40 to 300 micrometers",
            "About 0.4 to 3 micrometers"
        ],
        correct: 3
    },
    {
        question: "What does a co-culture add to the endothelial cells?",
        answers: [
            "A pump that circulates the medium",
            "A second membrane under the first",
            "An electrical source for the cells",
            "Support cells that send signals to them"
        ],
        correct: 3
    },
    {
        question: "What is the main thing a standard Transwell lacks?",
        answers: [
            "Flowing fluid and shear stress",
            "A porous membrane at the bottom of the insert",
            "Any living cells on the membrane",
            "A top compartment for the medium"
        ],
        correct: 0
    },
    {
        question: "Why are Transwells so widely used?",
        answers: [
            "They match the living brain exactly in every way",
            "They include built-in blood flow like a vessel",
            "They need no culture medium to keep cells alive",
            "They are simple, standard, and run many wells at once"
        ],
        correct: 3
    }
];

const bbbLesson8Questions = [
    {
        question: "What does a higher TEER value indicate?",
        answers: [
            "A leakier barrier with more ion flow",
            "More cells growing in the dish",
            "A warmer culture medium",
            "A tighter barrier with less ion leak"
        ],
        correct: 3
    },
    {
        question: "A 12-well insert (1.12 cm²) reads 250 Ω and the blank reads 90 Ω. What is the TEER?",
        answers: [
            "About 160 Ω·cm²",
            "About 280 Ω·cm²",
            "About 179 Ω·cm²",
            "About 100 Ω·cm²"
        ],
        correct: 2
    },
    {
        question: "Why subtract the blank insert's resistance?",
        answers: [
            "To cool the electrodes before the reading is taken",
            "To count how many cells are present on the membrane",
            "To remove the resistance of the empty insert and medium",
            "To make sure the final value always comes out positive"
        ],
        correct: 2
    },
    {
        question: "Which substance is commonly used as a permeability tracer?",
        answers: [
            "Sodium fluorescein",
            "Pure distilled water",
            "Collagen IV",
            "Glucose oxidase"
        ],
        correct: 0
    },
    {
        question: "What does a tight barrier show in a tracer test?",
        answers: [
            "Most tracer reaches the bottom quickly",
            "Very little tracer reaches the bottom compartment",
            "The tracer changes into another molecule",
            "The cells dissolve into the medium"
        ],
        correct: 1
    }
];

const bbbLesson9Questions = [
    {
        question: "What is an organ-on-a-chip?",
        answers: [
            "A computer chip that stores a patient's medical data",
            "A tiny robot that repairs damaged organs from inside",
            "A transplant organ made entirely from silicon",
            "A small device holding living cells that mimic an organ function"
        ],
        correct: 3
    },
    {
        question: "Which feature does a chip offer that a static dish does not?",
        answers: [
            "Flow of fluid past the cells",
            "A guaranteed perfect copy of the brain",
            "Cells that never need any nutrients",
            "A built-in way to cure disease"
        ],
        correct: 0
    },
    {
        question: "Which tools does chip building borrow from?",
        answers: [
            "Wood carving",
            "Deep-sea drilling",
            "Textile weaving",
            "Microfabrication"
        ],
        correct: 3
    },
    {
        question: "Why does a barrier suit a chip layout?",
        answers: [
            "It is a perfectly round organ",
            "It contains no cells that need care",
            "It never changes with disease",
            "It is a thin layer between two fluids"
        ],
        correct: 3
    },
    {
        question: "What is the honest description of a chip?",
        answers: [
            "A complete replacement for a human brain",
            "A device that predicts every drug response",
            "A model that reproduces selected features of a tissue",
            "A guaranteed substitute for all clinical trials"
        ],
        correct: 2
    }
];

const bbbLesson10Questions = [
    {
        question: "What does laminar flow mean?",
        answers: [
            "Fluid swirls and mixes rapidly in eddies",
            "Fluid stops moving completely in the channel",
            "Fluid is forced to flow upward against gravity",
            "Fluid layers slide past each other smoothly"
        ],
        correct: 3
    },
    {
        question: "A channel with a Reynolds number near 0.1 is...",
        answers: [
            "Fully turbulent",
            "Borderline turbulent",
            "Impossible to build",
            "Strongly laminar"
        ],
        correct: 3
    },
    {
        question: "Which change would increase the Reynolds number?",
        answers: [
            "Faster flow velocity",
            "Higher fluid viscosity",
            "Stronger surface tension",
            "A thicker membrane"
        ],
        correct: 0
    },
    {
        question: "How do molecules mainly mix between two laminar streams?",
        answers: [
            "By turbulent eddies in the middle",
            "By diffusion across the interface",
            "By the pump's pulses",
            "By gravity pulling them together"
        ],
        correct: 1
    },
    {
        question: "Why are air bubbles a problem in a chip?",
        answers: [
            "They make the medium too thick to flow at all",
            "They can block channels and damage the cell layer",
            "They cool the channel walls below body temperature",
            "They dissolve the porous membrane over a few hours"
        ],
        correct: 1
    }
];

const bbbLesson11Questions = [
    {
        question: "What force does flowing fluid exert along a vessel wall?",
        answers: [
            "Shear stress",
            "Osmotic pressure",
            "Surface tension",
            "Buoyancy"
        ],
        correct: 0
    },
    {
        question: "In τ = 6μQ/(wh²), what happens if the channel height is halved at the same flow?",
        answers: [
            "The shear becomes half as large",
            "The shear doubles",
            "The shear stays the same",
            "The shear becomes four times larger"
        ],
        correct: 3
    },
    {
        question: "What happens to wall shear if you double the flow rate Q?",
        answers: [
            "It halves",
            "It stays the same",
            "It quadruples",
            "It doubles"
        ],
        correct: 3
    },
    {
        question: "Why do chip designers add flow for barrier cells?",
        answers: [
            "It removes the need for any culture medium at all",
            "Cells sense shear and tend to form a tighter barrier",
            "It makes the porous membrane dissolve gently",
            "It replaces the living cells with a plastic film"
        ],
        correct: 1
    },
    {
        question: "Which unit measures wall shear stress?",
        answers: [
            "Ohms",
            "Pascals",
            "Daltons",
            "Micrometers"
        ],
        correct: 1
    }
];

const bbbLesson12Questions = [
    {
        question: "What is the master used for in soft lithography?",
        answers: [
            "A counter that tallies the cells in each channel",
            "The pump that drives the flow through the chip",
            "A mold whose pattern is cast into PDMS",
            "A chamber used for sterilizing the tubing"
        ],
        correct: 2
    },
    {
        question: "Which property makes PDMS good for living cells?",
        answers: [
            "It is an excellent electrical conductor",
            "It is rigid like a sheet of glass",
            "It kills every cell that touches it",
            "It is clear and permeable to oxygen"
        ],
        correct: 3
    },
    {
        question: "Which PDMS drawback matters for drug tests?",
        answers: [
            "It can absorb small hydrophobic molecules",
            "It dissolves in water over time",
            "It blocks all oxygen from the cells",
            "It conducts electricity too strongly"
        ],
        correct: 0
    },
    {
        question: "What is oxygen plasma used for in assembly?",
        answers: [
            "Staining the cells so they show under a microscope",
            "Activating surfaces so PDMS bonds to glass",
            "Warming the medium up to 37 °C in the channels",
            "Counting the bubbles that form in the channels"
        ],
        correct: 1
    },
    {
        question: "What does the ridge height on the master set?",
        answers: [
            "The number of cells in the chip",
            "The color of the medium",
            "The pump brand to use",
            "The height of the finished channel"
        ],
        correct: 3
    }
];

const bbbLesson13Questions = [
    {
        question: "In a sandwich layout, what separates the two channels?",
        answers: [
            "A thin porous membrane",
            "A thick wall of glass",
            "A layer of air",
            "A third stream of medium"
        ],
        correct: 0
    },
    {
        question: "What is a main benefit of hydrogel lanes?",
        answers: [
            "They always give the highest possible TEER values",
            "They need no living cells to work at all",
            "No plastic membrane, and cells can organize in 3D",
            "They are the cheapest option in every case"
        ],
        correct: 2
    },
    {
        question: "Which layout is the most vessel-like but the hardest to build?",
        answers: [
            "A perfused 3D tube",
            "A flat Transwell insert",
            "A single static dish",
            "A sandwich without cells"
        ],
        correct: 0
    },
    {
        question: "Why is TEER harder to read in a hydrogel layout?",
        answers: [
            "Electrodes are harder to place across the cell layer",
            "Hydrogels conduct electricity perfectly, hiding the cells",
            "The cells in a hydrogel never form any junctions",
            "Hydrogel chips are built without any channels"
        ],
        correct: 0
    },
    {
        question: "Why do sandwich chips suit imaging well?",
        answers: [
            "The channels are always much wider than in other layouts",
            "They are built without any liquid inside",
            "The cells sit as a flat layer in one plane",
            "The cells are larger than in other layouts"
        ],
        correct: 2
    }
];

const bbbLesson14Questions = [
    {
        question: "What does iPSC stand for?",
        answers: [
            "Internal protein signaling complex",
            "Isolated primary stem cell",
            "Induced pluripotent stem cell",
            "Inert polymer-supported culture"
        ],
        correct: 2
    },
    {
        question: "Why are iPSC-derived cells attractive for barrier models?",
        answers: [
            "They are human and can be made patient-specific",
            "They never vary between batches",
            "They need no culture medium",
            "They always give the highest possible TEER"
        ],
        correct: 0
    },
    {
        question: "What is a common downside of immortalized lines such as hCMEC/D3?",
        answers: [
            "They cannot be grown in a dish at all",
            "They require a living animal for every use",
            "They usually form a leaky barrier",
            "They have no outer cell membrane"
        ],
        correct: 2
    },
    {
        question: "Which cells are typically added as support cells?",
        answers: [
            "Red blood cells and platelets",
            "Astrocytes and pericytes",
            "Skin keratinocytes only",
            "Muscle fibers"
        ],
        correct: 1
    },
    {
        question: "Which checks help confirm a good barrier model?",
        answers: [
            "Counting the cells per square meter of bench space",
            "Claudin-5 staining, TEER, and transporter function",
            "Measuring the total weight of the finished chip",
            "Judging the color of the culture medium by eye"
        ],
        correct: 1
    }
];

const bbbLesson15Questions = [
    {
        question: "Why use a four-electrode setup for TEER on a chip?",
        answers: [
            "It makes the cell layer physically thicker in the channel",
            "It reduces errors from electrode contact and uneven current",
            "It keeps the medium warmer while the readings are taken",
            "It counts the cells in the channel automatically"
        ],
        correct: 1
    },
    {
        question: "Which steps can pattern thin-film electrodes on a chip?",
        answers: [
            "Photolithography and metal deposition",
            "Weaving and sewing of conductive threads",
            "Casting thick blocks in concrete molds",
            "Painting thin lines with a brush by hand"
        ],
        correct: 0
    },
    {
        question: "Why can chip TEER differ from Transwell TEER with the same cells?",
        answers: [
            "Cells in chips never form any junction proteins at all",
            "Electrode placement and channel shape change the reading",
            "Transwell readings are always reported only in volts",
            "Chips always use cells from a different species"
        ],
        correct: 1
    },
    {
        question: "What does live fluorescent tracer imaging add?",
        answers: [
            "A permanent cure for a leaky barrier",
            "A way to remove the membrane",
            "A real-time view of where leakage occurs",
            "A count of the daltons in a drug"
        ],
        correct: 2
    },
    {
        question: "Which electrode materials are common in chips?",
        answers: [
            "Wood, paper, or cotton, coated with ink",
            "Plastic, rubber, or glass, with no metal",
            "Lead, tin, or sodium, as soft metals",
            "Gold, platinum, or silver/silver chloride"
        ],
        correct: 3
    }
];

const bbbLesson16Questions = [
    {
        question: "How are benchmark compounds used?",
        answers: [
            "Known crossers and blockers show if the model ranks drugs correctly",
            "They sterilize the channels before any cells are added",
            "They set the pump speed through the chip",
            "They color the nuclei of the cells for imaging"
        ],
        correct: 0
    },
    {
        question: "What does a shuttle antibody target?",
        answers: [
            "The tight junction strands themselves",
            "The PDMS wall of the chip",
            "Glucose in the culture medium",
            "A receptor such as the transferrin receptor"
        ],
        correct: 3
    },
    {
        question: "Why test a plain antibody beside the shuttle version?",
        answers: [
            "To check how well the PDMS bonds to the glass",
            "To measure the pump's flow rate in the channel",
            "To see if the shuttle actually increases crossing",
            "To prove that every barrier blocks all antibodies"
        ],
        correct: 2
    },
    {
        question: "Why build a chip from a patient's iPSCs?",
        answers: [
            "To avoid needing any living cells in the chip",
            "To make the chip cheaper to print on a machine",
            "To model that person's own barrier and disease",
            "To skip the step of growing the cells at all"
        ],
        correct: 2
    },
    {
        question: "Which condition can disrupt the barrier and be modeled on a chip?",
        answers: [
            "Stroke or neuroinflammation",
            "A simple broken arm",
            "A mild case of sunburn",
            "Tooth decay in the gums"
        ],
        correct: 0
    }
];

const bbbLesson17Questions = [
    {
        question: "What is a typical limit of today's barrier chips?",
        answers: [
            "They cannot hold any liquid inside the channels",
            "Cell sources and barrier tightness vary between labs",
            "They are built without any living cells in them",
            "They always match human TEER values exactly"
        ],
        correct: 1
    },
    {
        question: "What does validation mean for a barrier model?",
        answers: [
            "Checking that it predicts known real-world results",
            "Sterilizing it with ethanol before each use",
            "Registering its product name with an office",
            "Painting its channel walls with a protective coat"
        ],
        correct: 0
    },
    {
        question: "Which question helps judge a chip claim?",
        answers: [
            "How many people work in the lab?",
            "Which language was the paper written in?",
            "Which benchmark drugs were tested?",
            "What color was the chip?"
        ],
        correct: 2
    },
    {
        question: "Why are multi-organ chips of interest?",
        answers: [
            "They replace the need for any living cells",
            "Drugs can be followed through several linked organs",
            "They make PDMS unnecessary in every design",
            "They stop all leakage across the barrier"
        ],
        correct: 1
    },
    {
        question: "Compared with a Transwell, what do chips mainly add?",
        answers: [
            "Many more wells per plate",
            "Flow and shear stress",
            "Cheaper plastic than any alternative",
            "Whole animal organs"
        ],
        correct: 1
    }
];

const bbbAllLessonQuestions = {
    1: bbbLesson1Questions,
    2: bbbLesson2Questions,
    3: bbbLesson3Questions,
    4: bbbLesson4Questions,
    5: bbbLesson5Questions,
    6: bbbLesson6Questions,
    7: bbbLesson7Questions,
    8: bbbLesson8Questions,
    9: bbbLesson9Questions,
    10: bbbLesson10Questions,
    11: bbbLesson11Questions,
    12: bbbLesson12Questions,
    13: bbbLesson13Questions,
    14: bbbLesson14Questions,
    15: bbbLesson15Questions,
    16: bbbLesson16Questions,
    17: bbbLesson17Questions
};
