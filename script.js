const lesson1Questions = [
    {
        question: "What does MEMS stand for?",
        answers: [
            "Microelectronic Manufacturing Systems",
            "Microelectromechanical Systems",
            "Mechanical Electronics Measurement Systems",
            "Micro Energy Management Systems"
        ],
        correct: 1
    },

    {
        question: "Which best describes a MEMS device?",
        answers: [
            "A large mechanical machine controlled by a computer",
            "A microscale device combining mechanical and electrical elements",
            "A software-only simulation of a mechanical system",
            "A type of high-voltage power transformer"
        ],
        correct: 1
    },

    {
        question: "Which device is commonly manufactured using MEMS technology?",
        answers: [
            "Automobile accelerometer",
            "Steel I-beam",
            "Hydraulic excavator arm",
            "Industrial storage tank"
        ],
        correct: 0
    },

    {
        question: "MEMS structures are commonly measured on what scale?",
        answers: [
            "Kilometers",
            "Meters",
            "Micrometers",
            "Miles"
        ],
        correct: 2
    },

    {
        question: "Which field commonly uses MEMS devices?",
        answers: [
            "Biomedical engineering",
            "Automotive systems",
            "Consumer electronics",
            "All of the above"
        ],
        correct: 3
    }
];


const lesson2Questions = [
    {
        question: "How many micrometers are in one millimeter?",
        answers: [
            "10",
            "100",
            "1,000",
            "10,000"
        ],
        correct: 2
    },

    {
        question: "Which is the smallest measurement?",
        answers: [
            "1 millimeter",
            "500 micrometers",
            "50 micrometers",
            "1 micrometer"
        ],
        correct: 3
    },

    {
        question: "Which sequence is ordered from largest to smallest?",
        answers: [
            "Meter → millimeter → micrometer → nanometer",
            "Nanometer → micrometer → millimeter → meter",
            "Millimeter → meter → nanometer → micrometer",
            "Micrometer → nanometer → meter → millimeter"
        ],
        correct: 0
    },

    {
        question: "One micrometer is equal to:",
        answers: [
            "10⁻³ meters",
            "10⁻⁶ meters",
            "10⁻⁹ meters",
            "10⁻¹² meters"
        ],
        correct: 1
    },

    {
        question: "A MEMS structure that is 100 µm wide is how many millimeters wide?",
        answers: [
            "0.001 mm",
            "0.01 mm",
            "0.1 mm",
            "1 mm"
        ],
        correct: 2
    },

    {
        question: "Why does size matter in MEMS design?",
        answers: [
            "Physical forces can scale differently as devices become smaller",
            "Microscale devices stop obeying physics",
            "Electrical forces disappear at small scales",
            "Material properties are always identical at every scale"
        ],
        correct: 0
    }
];

const lesson3Questions = [

    {
        question: "What happens to surface-area-to-volume ratio as size decreases?",
        answers: [
            "It decreases",
            "It increases",
            "It stays exactly the same",
            "It becomes zero"
        ],
        correct: 1
    },

    {
        question: "If the characteristic length of an object is reduced by a factor of 10, its volume scales by approximately:",
        answers: [
            "1/10",
            "1/100",
            "1/1,000",
            "1/10,000"
        ],
        correct: 2
    },

    {
        question: "Which quantity typically scales with length squared?",
        answers: [
            "Volume",
            "Area",
            "Mass",
            "Time"
        ],
        correct: 1
    },

    {
        question: "Why can electrostatic forces become especially useful in MEMS?",
        answers: [
            "Because electrostatic effects can remain significant as device dimensions shrink",
            "Because gravity becomes stronger at the microscale",
            "Because electric charge disappears at small scales",
            "Because all materials become magnetic"
        ],
        correct: 0
    },

    {
        question: "Which force generally becomes less dominant relative to surface forces as devices become smaller?",
        answers: [
            "Electrostatic force",
            "Surface adhesion",
            "Gravity",
            "Capillary force"
        ],
        correct: 2
    },

    {
        question: "Why are scaling laws important in MEMS design?",
        answers: [
            "They help predict which physical effects become more or less important as dimensions change",
            "They eliminate the need for engineering calculations",
            "They only matter for very large machines",
            "They make all microscale devices behave identically"
        ],
        correct: 0
    }

];

const lesson4Questions = [

    {
        question: "Which is a common MEMS application?",
        answers: [
            "Accelerometers in smartphones",
            "Steel bridge beams",
            "Large hydraulic cylinders",
            "Industrial storage tanks"
        ],
        correct: 0
    },

    {
        question: "What does a MEMS accelerometer measure?",
        answers: [
            "Temperature only",
            "Acceleration or motion",
            "Fluid color",
            "Electrical resistance only"
        ],
        correct: 1
    },

    {
        question: "Which MEMS device is commonly used in pressure sensing?",
        answers: [
            "Micromachined diaphragm",
            "Large turbine blade",
            "Steel I-beam",
            "Hydraulic piston"
        ],
        correct: 0
    },

    {
        question: "Which field commonly uses BioMEMS devices?",
        answers: [
            "Medical diagnostics",
            "Aircraft runway paving",
            "Steel manufacturing only",
            "Bridge construction only"
        ],
        correct: 0
    },

    {
        question: "A MEMS gyroscope is commonly used to detect:",
        answers: [
            "Rotation",
            "Chemical concentration only",
            "Fluid viscosity only",
            "Surface roughness only"
        ],
        correct: 0
    },

    {
        question: "Why are MEMS useful in consumer electronics?",
        answers: [
            "They can provide sensing and actuation in very small packages",
            "They always require large mechanical assemblies",
            "They cannot be mass-produced",
            "They only work at very high temperatures"
        ],
        correct: 0
    }

];

const lesson5Questions = [

    {
        question: "Why are cleanrooms used in microfabrication?",
        answers: [
            "To reduce contamination that could damage small device features",
            "To make the room colder",
            "To eliminate the need for safety equipment",
            "To increase mechanical vibration"
        ],
        correct: 0
    },

    {
        question: "What is one of the main contaminants controlled in a cleanroom?",
        answers: [
            "Airborne particles",
            "Visible light",
            "Sound waves",
            "Gravity"
        ],
        correct: 0
    },

    {
        question: "Why can a small particle be a serious problem during MEMS fabrication?",
        answers: [
            "It may be comparable in size to critical device features",
            "It always melts silicon",
            "It increases wafer thickness",
            "It automatically changes crystal orientation"
        ],
        correct: 0
    },

    {
        question: "Cleanroom classifications are primarily related to:",
        answers: [
            "The number and size of airborne particles",
            "The number of workers in the building",
            "The temperature of the wafer",
            "The electrical resistance of the floor"
        ],
        correct: 0
    },

    {
        question: "Which behavior is appropriate inside a cleanroom?",
        answers: [
            "Moving carefully and minimizing unnecessary particle generation",
            "Running between tools",
            "Bringing cardboard boxes into processing areas",
            "Touching wafer surfaces with bare hands"
        ],
        correct: 0
    },

    {
        question: "Why is airflow important in many cleanrooms?",
        answers: [
            "It helps remove and control airborne contamination",
            "It increases wafer mass",
            "It eliminates all chemical hazards",
            "It changes silicon into glass"
        ],
        correct: 0
    }

];

const lesson6Questions = [

    {
        question: "What is the goal of wafer cleaning before a fabrication step?",
        answers: [
            "Remove unwanted particles, organic residue, and other contaminants",
            "Increase the wafer diameter",
            "Create a photolithography mask",
            "Make the wafer mechanically flexible"
        ],
        correct: 0
    },

    {
        question: "Which type of contamination can interfere with thin-film adhesion?",
        answers: [
            "Surface residue or particles",
            "Gravity",
            "Visible light",
            "Room temperature"
        ],
        correct: 0
    },

    {
        question: "Why should a cleaned wafer be handled carefully after cleaning?",
        answers: [
            "It can be easily re-contaminated",
            "Its crystal structure becomes unstable",
            "It becomes permanently magnetic",
            "Its diameter begins to shrink"
        ],
        correct: 0
    },

    {
        question: "Which is the best reason to avoid touching the active surface of a wafer?",
        answers: [
            "Fingerprints can leave oils, particles, and residues",
            "The wafer will immediately fracture",
            "The wafer will lose all electrical properties",
            "The wafer will absorb too much UV light"
        ],
        correct: 0
    },

    {
        question: "A wafer has visible particles on its surface before photoresist coating. What is the best action?",
        answers: [
            "Stop and clean or inspect the wafer before continuing",
            "Coat photoresist over the particles",
            "Increase exposure time",
            "Proceed directly to etching"
        ],
        correct: 0
    },

    {
        question: "Why is cleanliness especially important before deposition or lithography?",
        answers: [
            "Contaminants can create defects in later layers and patterns",
            "Cleaning makes the wafer thicker",
            "Cleaning replaces the need for masks",
            "Contaminants improve feature resolution"
        ],
        correct: 0
    }

];

const lesson7Questions = [

    {
        question: "What is the primary reason for following a specific gowning procedure?",
        answers: [
            "To prevent contaminants from being carried into the cleanroom",
            "To make fabrication equipment operate faster",
            "To increase room humidity",
            "To prevent wafers from being exposed to light"
        ],
        correct: 0
    },

    {
        question: "Which item should typically be covered before entering a clean fabrication area?",
        answers: [
            "Hair and exposed clothing",
            "Only shoes",
            "Only hands",
            "Only safety glasses"
        ],
        correct: 0
    },

    {
        question: "Why are gloves important during wafer handling?",
        answers: [
            "They reduce transfer of oils, salts, and particles from the hands",
            "They increase wafer conductivity",
            "They make the wafer more resistant to etching",
            "They replace the need for wafer tweezers"
        ],
        correct: 0
    },

    {
        question: "What is the safest way to handle a wafer when possible?",
        answers: [
            "Use appropriate wafer-handling tools and avoid touching device areas",
            "Hold it flat with bare fingers across the center",
            "Slide it across the work surface",
            "Stack it directly on another wafer"
        ],
        correct: 0
    },

    {
        question: "Why should movement be controlled inside a cleanroom?",
        answers: [
            "Fast or unnecessary movement can generate and disturb particles",
            "Movement changes the wafer crystal orientation",
            "Movement causes photoresist to chemically harden",
            "Movement increases silicon oxidation"
        ],
        correct: 0
    },

    {
        question: "Which sequence best represents good cleanroom practice?",
        answers: [
            "Prepare → gown correctly → enter clean area → handle wafers carefully → process",
            "Enter cleanroom → gown afterward → clean wafer → design device",
            "Handle wafer → remove gloves → process → inspect",
            "Process wafer → clean work area → gown"
        ],
        correct: 0
    }

];

const lesson8Questions = [

    {
        question: "Why is wafer inspection performed between fabrication steps?",
        answers: [
            "To detect defects before they are carried into later processing",
            "To increase the wafer thickness",
            "To improve electrical conductivity automatically",
            "To eliminate the need for process documentation"
        ],
        correct: 0
    },

    {
        question: "A patterned wafer shows broken or missing features under a microscope. What should you do?",
        answers: [
            "Investigate the defect before continuing to the next step",
            "Ignore it and continue processing",
            "Increase every process time by 50%",
            "Immediately package the device"
        ],
        correct: 0
    },

    {
        question: "Which tool is commonly useful for inspecting small surface features?",
        answers: [
            "Optical microscope",
            "Torque wrench",
            "Drill press",
            "Hydraulic pump"
        ],
        correct: 0
    },

    {
        question: "Why is process discipline important in microfabrication?",
        answers: [
            "Small deviations can create defects or change device performance",
            "All fabrication steps produce identical results automatically",
            "MEMS devices are insensitive to process variation",
            "Process order does not matter"
        ],
        correct: 0
    },

    {
        question: "Why is it important to follow the correct fabrication sequence?",
        answers: [
            "Later steps often depend on structures created during earlier steps",
            "The order only affects how fast the process feels",
            "Every process step can be performed in any order",
            "Sequence only matters during packaging"
        ],
        correct: 0
    },

    {
        question: "Which is the best response when a process result looks abnormal?",
        answers: [
            "Stop, inspect, document the issue, and determine the cause before continuing",
            "Continue because later steps will always fix it",
            "Change several process settings at once",
            "Discard all process records"
        ],
        correct: 0
    }

];

/* ========================================
   LESSON 9 — FROM ICs TO MEMS
======================================== */

const lesson9Questions = [

    {
        question:
            "What does IC stand for?",

        answers: [
            "Integrated Circuit",
            "Internal Conductor",
            "Insulated Component",
            "Integrated Crystal"
        ],

        correct: 0
    },


    {
        question:
            "What commonly serves as the starting substrate for IC and MEMS fabrication?",

        answers: [
            "A polymer sheet",
            "A silicon wafer",
            "A steel plate",
            "A glass fiber panel"
        ],

        correct: 1
    },


    {
        question:
            "How are silicon wafers produced for semiconductor fabrication?",

        answers: [
            "They are cut from a large single-crystal silicon structure",
            "They are stamped from metal sheets",
            "They are molded from photoresist",
            "They are deposited directly onto a photomask"
        ],

        correct: 0
    },


    {
        question:
            "Which statement best describes how integrated circuits are fabricated?",

        answers: [
            "The entire circuit is formed in one machining operation",
            "Devices are assembled only after the wafer is cut apart",
            "The wafer passes through successive fabrication and patterning steps",
            "Only mechanical cutting is used"
        ],

        correct: 2
    },


    {
        question:
            "What important capability did MEMS add to technologies inherited from integrated-circuit fabrication?",

        answers: [
            "The ability to create microscale mechanical structures",
            "The ability to eliminate silicon completely",
            "The ability to manufacture devices without patterning",
            "The ability to avoid all thin-film processing"
        ],

        correct: 0
    },


    {
        question:
            "Why is silicon especially useful as a bridge between microelectronics and MEMS?",

        answers: [
            "It can only be used as an electrical conductor",
            "It combines useful electrical and mechanical properties and can be micromachined",
            "It cannot be patterned using semiconductor fabrication methods",
            "Its mechanical properties prevent structures from moving"
        ],

        correct: 1
    },


    {
        question:
            "Which statement best captures the relationship between IC fabrication and MEMS fabrication?",

        answers: [
            "They are completely unrelated manufacturing technologies",
            "MEMS uses many semiconductor fabrication methods while extending them to mechanical structures",
            "MEMS fabrication replaces all lithography with conventional machining",
            "Integrated circuits are manufactured using MEMS devices"
        ],

        correct: 1
    }

];

/* ========================================
   FAB CHALLENGE 10 — SEMICONDUCTORS & DOPING
======================================== */

const lesson10Questions = [

    {
        question:
            "What is the purpose of doping a semiconductor?",

        answers: [
            "To intentionally change its electrical properties",
            "To make the wafer physically thicker",
            "To remove all charge carriers",
            "To prevent the material from being patterned"
        ],

        correct: 0
    },


    {
        question:
            "Which type of dopant is used to create P-type silicon?",

        answers: [
            "A Group III element such as boron",
            "A Group V element such as phosphorus",
            "A noble gas such as argon",
            "A metal such as copper"
        ],

        correct: 0
    },


    {
        question:
            "What type of charge carrier is abundant in P-type semiconductor material?",

        answers: [
            "Free neutrons",
            "Holes",
            "Protons",
            "Mobile negative ions"
        ],

        correct: 1
    },


    {
        question:
            "Which dopant is commonly associated with N-type silicon?",

        answers: [
            "Boron",
            "Phosphorus",
            "Carbon",
            "Aluminum oxide"
        ],

        correct: 1
    },


    {
        question:
            "What type of charge carrier is abundant in N-type semiconductor material?",

        answers: [
            "Holes",
            "Mobile electrons",
            "Protons",
            "Neutral atoms"
        ],

        correct: 1
    },


    {
        question:
            "Which pairing is correct?",

        answers: [
            "P-type → phosphorus → electrons",
            "N-type → boron → holes",
            "P-type → boron → holes",
            "N-type → boron → electrons"
        ],

        correct: 2
    },


    {
        question:
            "A silicon wafer is doped with phosphorus. What type of semiconductor is produced?",

        answers: [
            "P-type",
            "N-type",
            "Intrinsic silicon",
            "Insulating silicon"
        ],

        correct: 1
    },


    {
        question:
            "A silicon region has an abundance of holes. Which type of semiconductor is it most likely to be?",

        answers: [
            "N-type",
            "P-type",
            "Undoped metal",
            "Insulating oxide"
        ],

        correct: 1
    }

];

/* ========================================
   FAB CHALLENGE 11 — CMOS FABRICATION
======================================== */

const lesson11Questions = [

    {
        question:
            "What does CMOS stand for?",

        answers: [
            "Complementary Metal-Oxide-Semiconductor",
            "Controlled Micro-Optical System",
            "Conductive Metal Oxide Structure",
            "Complementary Mechanical Output Sensor"
        ],

        correct: 0
    },


    {
        question:
            "Which statement best describes CMOS fabrication?",

        answers: [
            "A device is created in one machining step",
            "Many processing steps are repeated to build patterned layers",
            "Only metal layers are deposited on the wafer",
            "The silicon wafer is shaped only by mechanical cutting"
        ],

        correct: 1
    },


    {
        question:
            "Which of the following is a common CMOS processing step?",

        answers: [
            "Photolithography",
            "Injection molding",
            "Sand casting",
            "Arc welding"
        ],

        correct: 0
    },


    {
        question:
            "Which process can be used to form material layers during CMOS fabrication?",

        answers: [
            "Chemical vapor deposition",
            "Mechanical polishing only",
            "Laser cutting only",
            "Waterjet machining"
        ],

        correct: 0
    },


    {
        question:
            "Which pair consists of processes used to introduce dopants into semiconductor material?",

        answers: [
            "Diffusion and ion implantation",
            "Etching and polishing",
            "Evaporation and lithography",
            "Oxidation and sputtering"
        ],

        correct: 0
    },


    {
        question:
            "Which pair is associated with depositing material onto a wafer?",

        answers: [
            "Evaporation and sputtering",
            "Diffusion and etching",
            "Photolithography and inspection",
            "Oxidation and development"
        ],

        correct: 0
    },


    {
        question:
            "Why does CMOS fabrication require many repeated process steps?",

        answers: [
            "Complex devices are built from multiple patterned material layers",
            "Every wafer must be physically cut after each step",
            "Only one material can exist on a wafer at a time",
            "The silicon substrate is replaced after each layer"
        ],

        correct: 0
    },


    {
        question:
            "Which sequence best represents the general idea of layer-based microfabrication?",

        answers: [
            "Form or deposit material → pattern it → remove selected material → repeat",
            "Cut wafer → weld wafer → paint wafer → repeat",
            "Melt silicon → machine entire device → polish once",
            "Deposit one layer → package immediately"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 12 — SILICON AS A MEMS MATERIAL
======================================== */

const lesson12Questions = [

    {
        question:
            "Why is silicon especially useful for MEMS devices?",

        answers: [
            "It combines useful electrical and mechanical properties",
            "It has no mechanical strength",
            "It cannot be integrated with electronics",
            "It can only be used as an insulating material"
        ],

        correct: 0
    },


    {
        question:
            "Which property makes silicon particularly compatible with MEMS manufacturing?",

        answers: [
            "It melts at room temperature",
            "It cannot be patterned",
            "It is amenable to micromachining",
            "It must always be machined using conventional cutting tools"
        ],

        correct: 2
    },


    {
        question:
            "What is an important advantage of using silicon for systems that combine sensors and electronics?",

        answers: [
            "Silicon can only form mechanical structures",
            "Silicon eliminates the need for any fabrication processes",
            "Silicon prevents electrical components from being fabricated",
            "Silicon allows convenient integration with electronics"
        ],

        correct: 3
    },


    {
        question:
            "Why does the existing semiconductor industry make silicon attractive for MEMS fabrication?",

        answers: [
            "Established silicon fabrication methods and facilities already exist",
            "Silicon wafers are unavailable at high purity",
            "Silicon cannot use microelectronics fabrication methods",
            "Silicon requires completely new manufacturing equipment for every device"
        ],

        correct: 0
    },


    {
        question:
            "Which statement best describes the elasticity of single-crystal silicon?",

        answers: [
            "It behaves like a soft rubber",
            "It permanently deforms under very small loads",
            "It has high elasticity and can have an elastic modulus comparable to steel",
            "It has essentially no stiffness"
        ],

        correct: 2
    },


    {
        question:
            "Which combination describes useful mechanical characteristics of silicon for MEMS?",

        answers: [
            "Low strength, high density, and extreme softness",
            "Low stiffness, high ductility, and low hardness",
            "No elasticity, high density, and low strength",
            "High yield strength, low density, and high hardness"
        ],

        correct: 3
    },


    {
        question:
            "What is one advantage of single-crystal silicon for mechanical MEMS structures?",

        answers: [
            "It cannot support vibrating structures",
            "It can exhibit high mechanical quality factor (Q)",
            "It behaves only as an electrical insulator",
            "It cannot withstand elastic deformation"
        ],

        correct: 1
    },


    {
        question:
            "An engineer wants a material for a microsensor that can be micromachined, has strong mechanical properties, and integrates well with electronics. Which material best matches these requirements?",

        answers: [
            "Paper",
            "Wood",
            "Silicon",
            "Structural foam"
        ],

        correct: 2
    }

];

/* ========================================
   FAB CHALLENGE 13 — BULK VS. SURFACE MICROMACHINING
======================================== */

const lesson13Questions = [

    {
        question:
            "Which description best defines bulk micromachining?",

        answers: [
            "Building structures entirely from deposited thin films",
            "Etching deeply into the substrate to form mechanical features",
            "Removing only photoresist from the wafer surface",
            "Depositing sacrificial layers without removing them"
        ],

        correct: 1
    },


    {
        question:
            "What is a defining feature of surface micromachining?",

        answers: [
            "The entire silicon wafer is dissolved",
            "Mechanical structures are cut using conventional milling",
            "Features are formed only by deep substrate etching",
            "Structures are fabricated layer-by-layer using thin films"
        ],

        correct: 3
    },


    {
        question:
            "An engineer creates a cavity by etching deeply into a silicon wafer. Which fabrication approach is being used?",

        answers: [
            "Bulk micromachining",
            "Surface micromachining",
            "Wafer bonding",
            "Metallization"
        ],

        correct: 0
    },


    {
        question:
            "What is the purpose of a sacrificial layer in surface micromachining?",

        answers: [
            "To permanently strengthen the silicon substrate",
            "To serve as the final electrical contact",
            "To be removed so a mechanical structure can become free-standing",
            "To replace the structural layer"
        ],

        correct: 2
    },


    {
        question:
            "A thin mechanical beam is built above a wafer using deposited films. Material underneath the beam is later removed so the beam can move. What process does this describe?",

        answers: [
            "Bulk micromachining",
            "Surface micromachining",
            "Wafer inspection",
            "Oxidation"
        ],

        correct: 1
    },


    {
        question:
            "Which material is identified as a mechanical structural layer in the fabrication example?",

        answers: [
            "PSG",
            "Photoresist",
            "Polysilicon",
            "Solvent"
        ],

        correct: 2
    },


    {
        question:
            "In the fabrication example, what role does PSG serve?",

        answers: [
            "It acts as a sacrificial layer",
            "It becomes the permanent mechanical structure",
            "It serves as the silicon substrate",
            "It replaces photolithography"
        ],

        correct: 0
    },


    {
        question:
            "Which statement correctly compares bulk and surface micromachining?",

        answers: [
            "Both techniques require the substrate to be completely removed",
            "Bulk micromachining uses only deposition, while surface micromachining uses only etching",
            "Surface micromachining must always etch deeply into the silicon wafer",
            "Bulk micromachining forms features in the substrate, while surface micromachining builds thin-film structures above it"
        ],

        correct: 3
    }

];

/* ========================================
   FAB CHALLENGE 14 — OXIDATION & DOPING
======================================== */

const lesson14Questions = [

    {
        question:
            "What does oxidation produce on the surface of a silicon wafer?",

        answers: [
            "A layer of silicon dioxide (SiO2)",
            "A layer of pure gold",
            "A layer of photoresist",
            "A layer of polysilicon"
        ],

        correct: 0
    },


    {
        question:
            "Which two processes are used to introduce dopants into silicon?",

        answers: [
            "Diffusion and ion implantation",
            "Evaporation and sputtering",
            "Wet etching and dry etching",
            "Oxidation and planarization"
        ],

        correct: 0
    },


    {
        question:
            "Oxidation, doping, and thin-film deposition are all examples of which class of micromachining methods?",

        answers: [
            "Pattern-transfer methods",
            "Wafer-level methods",
            "Assembly methods",
            "Packaging methods"
        ],

        correct: 1
    },


    {
        question:
            "What is the purpose of doping a silicon wafer?",

        answers: [
            "To deliberately change its electrical properties",
            "To make the wafer optically transparent",
            "To increase its physical thickness",
            "To remove all photoresist"
        ],

        correct: 0
    },


    {
        question:
            "Why might a wafer be oxidized before pattern transfer begins?",

        answers: [
            "Wafer-level processing can modify the wafer itself before patterning starts",
            "Oxidation always happens after the final metallization step",
            "Oxidation replaces the need for a silicon substrate",
            "Oxidation removes the need for photolithography entirely"
        ],

        correct: 0
    },


    {
        question:
            "A designer wants two regions of the same wafer to have different electrical behavior. Which process family accomplishes this?",

        answers: [
            "Doping",
            "Planarization",
            "Evaporation",
            "Wafer inspection"
        ],

        correct: 0
    },


    {
        question:
            "Which statement correctly distinguishes wafer-level processes from pattern-transfer processes?",

        answers: [
            "Wafer-level processes like oxidation and doping change the wafer itself; pattern-transfer processes like lithography and etching define and remove specific regions",
            "Wafer-level processes only remove material; pattern-transfer processes only add material",
            "Pattern-transfer processes always happen before any wafer-level process",
            "There is no meaningful difference between the two classes"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 15 — THIN-FILM DEPOSITION
======================================== */

const lesson15Questions = [

    {
        question:
            "Which deposition method commonly forms thin films such as polysilicon?",

        answers: [
            "CVD / LPCVD",
            "RCA cleaning",
            "Optical lithography",
            "Wet etching"
        ],

        correct: 0
    },


    {
        question:
            "What does LPCVD stand for?",

        answers: [
            "Low-Pressure Chemical Vapor Deposition",
            "Liquid-Phase Circuit Vapor Deposition",
            "Layered Polysilicon Chemical Vapor Diffusion",
            "Low-Power Contact Vapor Development"
        ],

        correct: 0
    },


    {
        question:
            "Which two techniques deposit material through primarily physical, rather than chemical, processes?",

        answers: [
            "Evaporation and sputtering",
            "Diffusion and ion implantation",
            "Oxidation and doping",
            "Wet etching and dry etching"
        ],

        correct: 0
    },


    {
        question:
            "In a typical surface-micromachined stack, which deposited film commonly serves as the sacrificial layer?",

        answers: [
            "PSG (phosphosilicate glass)",
            "Polysilicon",
            "Photoresist",
            "Gold"
        ],

        correct: 0
    },


    {
        question:
            "Which deposited film commonly serves as the mechanical structural layer?",

        answers: [
            "Polysilicon",
            "PSG",
            "Photoresist",
            "Silicon dioxide only"
        ],

        correct: 0
    },


    {
        question:
            "Why might a nitride film be deposited during fabrication?",

        answers: [
            "For electrical and chemical isolation",
            "To serve as the final electrical contact",
            "To act as a photomask",
            "To replace the silicon substrate"
        ],

        correct: 0
    },


    {
        question:
            "What is the general purpose of thin-film deposition in a microfabrication sequence?",

        answers: [
            "To create material layers that can later be patterned into functional structures",
            "To permanently remove material from the wafer",
            "To inspect the wafer for defects",
            "To dope the substrate with impurity atoms"
        ],

        correct: 0
    },


    {
        question:
            "Microfabrication generally alternates between depositing material and ______.",

        answers: [
            "Removing material",
            "Melting the substrate",
            "Repackaging the wafer",
            "Reversing doping"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 16 — OPTICAL LITHOGRAPHY
======================================== */

const lesson16Questions = [

    {
        question:
            "What is the primary purpose of lithography in a fabrication sequence?",

        answers: [
            "To define where later fabrication operations should occur",
            "To permanently form the final mechanical structure by itself",
            "To dope the wafer with impurity atoms",
            "To deposit the electrical contact metal"
        ],

        correct: 0
    },


    {
        question:
            "What light-sensitive layer is applied to the wafer before exposure?",

        answers: [
            "Photoresist",
            "Polysilicon",
            "PSG",
            "Silicon nitride"
        ],

        correct: 0
    },


    {
        question:
            "With positive photoresist, what happens to the regions exposed to light during development?",

        answers: [
            "They become soluble and wash away",
            "They become insoluble and remain",
            "They turn into silicon dioxide",
            "They are unaffected by development"
        ],

        correct: 0
    },


    {
        question:
            "With negative photoresist, what happens to the regions exposed to light during development?",

        answers: [
            "They become insoluble and remain after development",
            "They become soluble and wash away",
            "They evaporate under UV light",
            "They are removed by RCA cleaning"
        ],

        correct: 0
    },


    {
        question:
            "Shipley resist is a common example of which type of photoresist?",

        answers: [
            "Positive resist",
            "Negative resist",
            "Neither positive nor negative",
            "A sacrificial layer, not a resist"
        ],

        correct: 0
    },


    {
        question:
            "SU-8 is a common example of which type of photoresist?",

        answers: [
            "Negative resist",
            "Positive resist",
            "A wet etchant",
            "A dry etch gas"
        ],

        correct: 0
    },


    {
        question:
            "If a process uses positive photoresist, how does the final pattern in the film relate to the photomask?",

        answers: [
            "It matches the mask",
            "It is inverted from the mask",
            "It has no relationship to the mask",
            "It is always larger than the mask"
        ],

        correct: 0
    },


    {
        question:
            "In the lithography sequence (film, photoresist, exposure, development, etch, resist removal), which step comes immediately after exposure?",

        answers: [
            "Development",
            "Etching",
            "Resist removal",
            "Film deposition"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 17 — WET & DRY ETCHING
======================================== */

const lesson17Questions = [

    {
        question:
            "What does wet etching use to remove material?",

        answers: [
            "Liquid chemistry",
            "Gas or plasma",
            "Mechanical polishing",
            "UV light exposure"
        ],

        correct: 0
    },


    {
        question:
            "What does dry etching use to remove material?",

        answers: [
            "Gas or plasma-based processes",
            "Liquid acid baths",
            "Spin-coating",
            "Thermal oxidation"
        ],

        correct: 0
    },


    {
        question:
            "Wet and dry etching are both classified under which broader micromachining category?",

        answers: [
            "Pattern-transfer methods",
            "Wafer-level methods",
            "Packaging methods",
            "Inspection methods"
        ],

        correct: 0
    },


    {
        question:
            "Why does the choice between wet and dry etching matter for a design?",

        answers: [
            "It affects the geometry that can be fabricated",
            "It has no effect on the final device",
            "It only changes the color of the wafer",
            "It determines the wafer's electrical doping type"
        ],

        correct: 0
    },


    {
        question:
            "In a typical lithography-to-etch sequence, etching happens immediately after which step?",

        answers: [
            "Development of the exposed photoresist",
            "Metallization",
            "Wafer dicing",
            "SEM inspection"
        ],

        correct: 0
    },


    {
        question:
            "What typically happens to the photoresist after etching is complete?",

        answers: [
            "It is stripped away, leaving the patterned film behind",
            "It becomes the final structural layer",
            "It is converted into silicon dioxide",
            "It is reused for the next lithography step"
        ],

        correct: 0
    },


    {
        question:
            "An engineer removes silicon using an acid bath rather than a plasma chamber. Which technique are they using?",

        answers: [
            "Wet etching",
            "Dry etching",
            "Sputtering",
            "Ion implantation"
        ],

        correct: 0
    },


    {
        question:
            "Along with etching, which other process is grouped under pattern-transfer methods?",

        answers: [
            "Optical lithography",
            "Doping",
            "Oxidation",
            "Thin-film deposition alone"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 18 — PLANARIZATION & PROCESS INTEGRATION
======================================== */

const lesson18Questions = [

    {
        question:
            "What problem does planarization address in multi-layer fabrication?",

        answers: [
            "Managing the surface topography created by earlier steps",
            "Introducing dopants into the substrate",
            "Removing the entire photoresist layer",
            "Cutting the wafer into individual dies"
        ],

        correct: 0
    },


    {
        question:
            "Why can't a complex microdevice usually be made in a single fabrication operation?",

        answers: [
            "It is built through many sequential add, pattern, and remove steps",
            "Silicon cannot be patterned more than once",
            "Only one material can ever exist on a wafer",
            "Every layer requires a brand-new substrate"
        ],

        correct: 0
    },


    {
        question:
            "When analyzing a MEMS fabrication sequence, which questions should you be asking at each step?",

        answers: [
            "What exists now, what should remain, what should be removed, and what must be added next",
            "Only what the final selling price of the device will be",
            "Only how many wafers are in the cleanroom",
            "Only which company manufactures the equipment"
        ],

        correct: 0
    },


    {
        question:
            "Which statement best describes the relationship between fabrication layers?",

        answers: [
            "Each layer changes the starting condition for the layer that follows",
            "Layers are completely independent of one another",
            "Later layers never affect earlier ones or vice versa",
            "Only the first layer affects the final device"
        ],

        correct: 0
    },


    {
        question:
            "Planarization belongs to which part of the microfabrication toolbox?",

        answers: [
            "Pattern-transfer and micromachining methods",
            "Wafer growth methods",
            "Cleanroom certification steps",
            "Electrical testing methods"
        ],

        correct: 0
    },


    {
        question:
            "Which sequence best describes the general repeating cycle of layer-based microfabrication?",

        answers: [
            "Deposit, pattern, etch, modify, repeat",
            "Cut, weld, paint, repeat",
            "Package, ship, test, repeat",
            "Melt, mold, cool, repeat"
        ],

        correct: 0
    },


    {
        question:
            "Fabrication is best understood as:",

        answers: [
            "An interconnected sequence, where each step depends on the ones before it",
            "A set of completely isolated, unrelated steps",
            "A single operation performed once per wafer",
            "A process with no defined order"
        ],

        correct: 0
    },


    {
        question:
            "After a new layer is deposited and patterned, what must the next process step account for?",

        answers: [
            "The changed surface geometry left behind by that layer",
            "Only the original bare silicon surface",
            "The wafer's serial number",
            "The mask shop's turnaround time"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 19 — BUILD A MEMS DEVICE
======================================== */

const lesson19Questions = [

    {
        question:
            "In the layer-by-layer surface-micromachining example, what is deposited onto the silicon substrate first?",

        answers: [
            "A process layer",
            "The final metal contacts",
            "Photoresist only",
            "A sacrificial layer only, with nothing structural"
        ],

        correct: 0
    },


    {
        question:
            "What is added on top of the process layer to later form the air gap beneath the finished structure?",

        answers: [
            "Sacrificial material",
            "Gold",
            "Photoresist",
            "Silicon nitride"
        ],

        correct: 0
    },


    {
        question:
            "What is added and patterned to form the final free-standing mechanical structure?",

        answers: [
            "The structural layer",
            "The sacrificial layer",
            "The RCA clean",
            "The mask shop layout"
        ],

        correct: 0
    },


    {
        question:
            "What happens to the sacrificial material at the end of the surface-micromachining sequence?",

        answers: [
            "It is removed, releasing the free-standing structure",
            "It becomes the permanent structural layer",
            "It is converted into silicon dioxide",
            "It is deposited a second time"
        ],

        correct: 0
    },


    {
        question:
            "In the cleanroom worked example, what file format is the CAD layout converted to before being sent to a mask shop?",

        answers: [
            "GDSII",
            "PDF",
            "STL",
            "DXF"
        ],

        correct: 0
    },


    {
        question:
            "What is the purpose of the RCA clean step early in the fabrication run?",

        answers: [
            "To remove organic and metallic contamination from the wafer",
            "To pattern the photoresist",
            "To deposit the structural layer",
            "To etch the sacrificial layer"
        ],

        correct: 0
    },


    {
        question:
            "Which films are deposited during the LPCVD step of the cleanroom example?",

        answers: [
            "Nitride, polysilicon, and PSG",
            "Gold and chromium only",
            "Photoresist and developer",
            "Quartz and glass only"
        ],

        correct: 0
    },


    {
        question:
            "What is the final step in the cleanroom fabrication example?",

        answers: [
            "Metallization — depositing and lifting off the Au/Cr contact layer",
            "RCA cleaning",
            "Design and layout",
            "Spin-coating photoresist"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 20 — MULTI-USER FOUNDRIES
======================================== */

const lesson20Questions = [

    {
        question:
            "What does MUMPs stand for?",

        answers: [
            "Multi-User MEMS Processes",
            "Micro-Unit Mask Production System",
            "Metal-Underlay Microfabrication Process",
            "Multi-Use Mold Prototyping Service"
        ],

        correct: 0
    },


    {
        question:
            "In what year did the MUMPs program start?",

        answers: [
            "1992",
            "1959",
            "2005",
            "1978"
        ],

        correct: 0
    },


    {
        question:
            "What is the main benefit of a multi-user foundry service like MUMPs?",

        answers: [
            "Economical access to MEMS prototyping without owning a fab",
            "It eliminates the need for any design rules",
            "It guarantees a device works without testing",
            "It replaces the need for photolithography"
        ],

        correct: 0
    },


    {
        question:
            "What size is a single die location, or tile, a customer purchases on a MUMPs run?",

        answers: [
            "1 cm × 1 cm",
            "150 mm × 150 mm",
            "1 mm × 1 mm",
            "10 cm × 10 cm"
        ],

        correct: 0
    },


    {
        question:
            "What must a customer's design follow before it can be submitted to a MUMPs run?",

        answers: [
            "The foundry's process design rules",
            "No rules — any layout is accepted",
            "A rule set chosen by the customer",
            "Only the customer's own internal standards"
        ],

        correct: 0
    },


    {
        question:
            "About how long does a typical MUMPs run take from submission to delivery?",

        answers: [
            "8 to 12 weeks",
            "24 hours",
            "2 to 3 years",
            "1 to 2 days"
        ],

        correct: 0
    },


    {
        question:
            "How many identical chips does a customer typically receive from a MUMPs run?",

        answers: [
            "15",
            "1",
            "1,000",
            "150"
        ],

        correct: 0
    },


    {
        question:
            "In the semiconductor industry, what are the equivalent shared-wafer services called?",

        answers: [
            "MPC (Multi-Project Chip) and MPW (Multi-Project Wafer)",
            "CPU and GPU",
            "RIE and LPCVD",
            "SOI and CMOS"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 21 — THE MUMPS FAMILY
======================================== */

const lesson21Questions = [

    {
        question:
            "Which MUMPs process is a three-layer polysilicon surface micromachining process?",

        answers: [
            "PolyMUMPs",
            "SOIMUMPs",
            "PiezoMUMPs",
            "MetalMUMPs"
        ],

        correct: 0
    },


    {
        question:
            "Which MUMPs process is built on a silicon-on-insulator wafer?",

        answers: [
            "SOIMUMPs",
            "PolyMUMPs",
            "MetalMUMPs",
            "PiezoMUMPs"
        ],

        correct: 0
    },


    {
        question:
            "Which MUMPs process adds a piezoelectric material for sensing and actuation?",

        answers: [
            "PiezoMUMPs",
            "PolyMUMPs",
            "SOIMUMPs",
            "MetalMUMPs"
        ],

        correct: 0
    },


    {
        question:
            "Which MUMPs process uses an electroplated metal structural layer instead of polysilicon?",

        answers: [
            "MetalMUMPs",
            "PolyMUMPs",
            "SOIMUMPs",
            "PiezoMUMPs"
        ],

        correct: 0
    },


    {
        question:
            "How many mask levels does PolyMUMPs use?",

        answers: [
            "8",
            "3",
            "2",
            "15"
        ],

        correct: 0
    },


    {
        question:
            "How many physical layers does PolyMUMPs build from its mask levels?",

        answers: [
            "7",
            "8",
            "3",
            "2"
        ],

        correct: 0
    },


    {
        question:
            "What is the minimum feature size in PolyMUMPs?",

        answers: [
            "2 µm",
            "2 mm",
            "20 nm",
            "150 mm"
        ],

        correct: 0
    },


    {
        question:
            "How many sacrificial layers does PolyMUMPs use?",

        answers: [
            "2",
            "0",
            "3",
            "8"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 22 — BUILDING THE BASE
======================================== */

const lesson22Questions = [

    {
        question:
            "What size is the starting PolyMUMPs wafer?",

        answers: [
            "150 mm",
            "2 µm",
            "300 mm",
            "1 cm"
        ],

        correct: 0
    },


    {
        question:
            "What type of silicon is the starting PolyMUMPs wafer?",

        answers: [
            "n-type (100), 1–2 Ohm-cm",
            "p-type (111), 10–20 Ohm-cm",
            "Undoped intrinsic silicon",
            "n-type glass composite"
        ],

        correct: 0
    },


    {
        question:
            "Why is the wafer surface doped with phosphorous early in the process?",

        answers: [
            "To reduce charge feed-through to the substrate from electrostatic devices",
            "To make the wafer transparent",
            "To increase the wafer's thickness",
            "To remove the need for a nitride layer"
        ],

        correct: 0
    },


    {
        question:
            "What is deposited to electrically insulate later structures from the substrate?",

        answers: [
            "A 0.6 µm low-stress silicon nitride layer",
            "A 2.0 µm metal layer",
            "A layer of photoresist",
            "A layer of PSG"
        ],

        correct: 0
    },


    {
        question:
            "What deposition method is used for the nitride and Poly0 layers?",

        answers: [
            "LPCVD",
            "Electrodeposition",
            "Anodic bonding",
            "Wet etching"
        ],

        correct: 0
    },


    {
        question:
            "What is Poly0 commonly used for?",

        answers: [
            "Wiring and stationary electrodes beneath moving structures",
            "The final reflective mirror surface",
            "The sacrificial release layer",
            "Wire bonding pads"
        ],

        correct: 0
    },


    {
        question:
            "What is the thickness of the Poly0 layer?",

        answers: [
            "0.5 µm",
            "2.0 µm",
            "0.6 µm",
            "1.5 µm"
        ],

        correct: 0
    },


    {
        question:
            "Which mask is used to pattern the Poly0 layer?",

        answers: [
            "The first mask in the PolyMUMPs sequence",
            "The eighth and final mask",
            "The DIMPLES mask",
            "The METAL mask"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 23 — SACRIFICIAL LAYERS & ANCHORS
======================================== */

const lesson23Questions = [

    {
        question:
            "What material forms PolyMUMPs' sacrificial layers?",

        answers: [
            "PSG (phosphosilicate glass)",
            "Polysilicon",
            "Silicon nitride",
            "Gold"
        ],

        correct: 0
    },


    {
        question:
            "What is the thickness of the First Oxide (PSG1) sacrificial layer?",

        answers: [
            "2.0 µm",
            "0.5 µm",
            "0.75 µm",
            "0.6 µm"
        ],

        correct: 0
    },


    {
        question:
            "At what temperature and for how long is PSG1 annealed?",

        answers: [
            "1050°C for 1 hour, in argon",
            "Room temperature for 24 hours",
            "100°C for 10 minutes",
            "1050°C for 10 minutes, in HF vapor"
        ],

        correct: 0
    },


    {
        question:
            "What is the purpose of the DIMPLES mask?",

        answers: [
            "Etch shallow standoff dimples (~750 nm) so beams don't stick flat against Poly0",
            "Cut all the way through to the substrate",
            "Pattern the final metal contacts",
            "Define the wafer's outer edge"
        ],

        correct: 0
    },


    {
        question:
            "What is the purpose of the ANCHOR1 mask?",

        answers: [
            "Etch holes through PSG1 down to Poly0, later filled by Poly1",
            "Etch dimples into Poly1",
            "Pattern the metal lift-off layer",
            "Dope the substrate with phosphorous"
        ],

        correct: 0
    },


    {
        question:
            "When is the First Oxide sacrificial layer finally removed?",

        answers: [
            "At the very end of the process, during release",
            "Immediately after it is deposited",
            "Before Poly0 is deposited",
            "It is never removed"
        ],

        correct: 0
    },


    {
        question:
            "What fills the ANCHOR1 holes during the next deposition step?",

        answers: [
            "Poly1",
            "Metal",
            "Poly2",
            "Photoresist"
        ],

        correct: 0
    },


    {
        question:
            "Why must dimples be etched into PSG1 before Poly1 is deposited?",

        answers: [
            "So Poly1 takes on small standoff bumps that help prevent it from sticking flat against Poly0",
            "So Poly1 can be deposited at a lower temperature",
            "So the wafer can be diced early",
            "So the nitride layer can be skipped"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 24 — POLY1 & POLY2: THE STRUCTURAL LAYERS
======================================== */

const lesson24Questions = [

    {
        question:
            "What is the thickness of the Poly1 layer?",

        answers: [
            "2.0 µm",
            "0.5 µm",
            "1.5 µm",
            "0.75 µm"
        ],

        correct: 0
    },


    {
        question:
            "What thin layer caps Poly1 during deposition, and what two jobs does it do?",

        answers: [
            "A 200 nm PSG cap that acts as a hard mask and a dopant source",
            "A 200 nm metal cap that acts as a mirror",
            "A photoresist cap that permanently insulates Poly1",
            "A nitride cap that anchors Poly1 to the substrate"
        ],

        correct: 0
    },


    {
        question:
            "What does the 1050°C anneal do to the Poly1 layer?",

        answers: [
            "Dopes it with phosphorous and relieves internal stress",
            "Melts it into the substrate",
            "Converts it into silicon nitride",
            "Removes all dopants from it"
        ],

        correct: 0
    },


    {
        question:
            "What is the thickness of the Second Oxide (PSG2) sacrificial layer?",

        answers: [
            "0.75 µm",
            "2.0 µm",
            "0.5 µm",
            "1.5 µm"
        ],

        correct: 0
    },


    {
        question:
            "What does the POLY1_POLY2_VIA mask do?",

        answers: [
            "Etches holes down to Poly1, connecting it mechanically and electrically to Poly2",
            "Etches through the substrate itself",
            "Deposits the final metal layer",
            "Doped the wafer with phosphorous"
        ],

        correct: 0
    },


    {
        question:
            "How does the ANCHOR2 mask differ from POLY1_POLY2_VIA?",

        answers: [
            "It etches through both PSG1 and PSG2 in one step, avoiding misalignment between separate cuts",
            "It only etches through the nitride layer",
            "It is used before any polysilicon is deposited",
            "It removes the Poly0 layer entirely"
        ],

        correct: 0
    },


    {
        question:
            "What is the thickness of the Poly2 layer?",

        answers: [
            "1.5 µm",
            "2.0 µm",
            "0.5 µm",
            "0.6 µm"
        ],

        correct: 0
    },


    {
        question:
            "Why is a second structural layer (Poly2) useful in addition to Poly1?",

        answers: [
            "It allows structures that need an independent second moving layer, like a mirror on a hinge",
            "It replaces the need for any sacrificial layers",
            "It eliminates the need for anchoring",
            "It is only used for wafer inspection"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 25 — METAL & RELEASE
======================================== */

const lesson25Questions = [

    {
        question:
            "What is the thickness of the final metal layer in PolyMUMPs?",

        answers: [
            "0.5 µm",
            "2.0 µm",
            "1.5 µm",
            "0.75 µm"
        ],

        correct: 0
    },


    {
        question:
            "How is the metal layer deposited and patterned?",

        answers: [
            "Using lift-off, with the eighth and final mask",
            "Using RIE, with the first mask",
            "By hand polishing",
            "By anodic bonding"
        ],

        correct: 0
    },


    {
        question:
            "What does the metal layer provide in a finished PolyMUMPs device?",

        answers: [
            "Probing pads, wire bonding, electrical routing, and reflective mirror surfaces",
            "The main sacrificial support structure",
            "Electrical insulation from the substrate",
            "The dopant source for Poly2"
        ],

        correct: 0
    },


    {
        question:
            "What solution releases the sacrificial PSG layers at the end of the process?",

        answers: [
            "49% hydrofluoric acid (HF)",
            "Deionized water alone",
            "Potassium hydroxide (KOH)",
            "Isopropyl alcohol"
        ],

        correct: 0
    },


    {
        question:
            "How long is the chip immersed in the HF release bath?",

        answers: [
            "1.5–2 minutes at room temperature",
            "24 hours at 1050°C",
            "10 minutes at 100°C",
            "8–12 weeks"
        ],

        correct: 0
    },


    {
        question:
            "What rinse step follows the HF bath, and why?",

        answers: [
            "DI water, then alcohol, to reduce stiction",
            "Only acetone, to dope the wafer",
            "Only argon gas, to anneal the metal",
            "A second HF bath, to double-check the release"
        ],

        correct: 0
    },


    {
        question:
            "What is the final step of the release process?",

        answers: [
            "10 minutes in an oven at 100°C",
            "A second RIE etch",
            "Re-depositing the sacrificial oxide",
            "Re-annealing at 1050°C"
        ],

        correct: 0
    },


    {
        question:
            "In what state are PolyMUMPs wafers shipped to the customer, before release?",

        answers: [
            "Diced, sorted, and unreleased",
            "Fully released and packaged",
            "As a single uncut wafer",
            "Submerged in HF"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 26 — BUILD A POLYMUMPS DEVICE
======================================== */

const lesson26Questions = [

    {
        question:
            "What is the very first fabrication step in a PolyMUMPs run?",

        answers: [
            "Starting with a doped 150 mm n-type silicon wafer",
            "Depositing the metal layer",
            "Etching the ANCHOR2 holes",
            "Immersing the chip in HF"
        ],

        correct: 0
    },


    {
        question:
            "Which layer is deposited immediately after the silicon nitride insulation layer?",

        answers: [
            "Poly0",
            "Poly1",
            "PSG2",
            "Metal"
        ],

        correct: 0
    },


    {
        question:
            "Which two features must exist in PSG1 before Poly1 is deposited?",

        answers: [
            "Dimples and ANCHOR1 holes",
            "The METAL pattern and probing pads",
            "POLY1_POLY2_VIA and ANCHOR2",
            "The wafer's dicing lines"
        ],

        correct: 0
    },


    {
        question:
            "Which layer anchors to Poly0 through the ANCHOR1 holes?",

        answers: [
            "Poly1",
            "Poly2",
            "Metal",
            "Silicon nitride"
        ],

        correct: 0
    },


    {
        question:
            "Which two mask features are patterned into PSG2?",

        answers: [
            "POLY1_POLY2_VIA and ANCHOR2",
            "DIMPLES and ANCHOR1",
            "METAL and POLY0",
            "Nitride and Poly1"
        ],

        correct: 0
    },


    {
        question:
            "Which layer is deposited immediately after PSG2 is patterned?",

        answers: [
            "Poly2",
            "Poly0",
            "Metal",
            "Silicon nitride"
        ],

        correct: 0
    },


    {
        question:
            "What is the last physical layer added before release?",

        answers: [
            "Metal",
            "Poly2",
            "PSG2",
            "Silicon nitride"
        ],

        correct: 0
    },


    {
        question:
            "What removes the sacrificial oxide layers and frees the moving structure?",

        answers: [
            "The HF release bath",
            "The 1050°C anneal",
            "The RIE etch of ANCHOR1",
            "The LPCVD deposition step"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 27 — WHAT ARE ACCELEROMETERS?
======================================== */

const lesson27Questions = [

    {
        question:
            "What physical quantity does an accelerometer measure?",

        answers: [
            "Acceleration (the change in velocity)",
            "Absolute position",
            "Temperature",
            "Magnetic field strength"
        ],

        correct: 0
    },


    {
        question:
            "Where and when was the first MEMS accelerometer micromachined?",

        answers: [
            "Stanford, in 1979",
            "MIT, in 1995",
            "Bell Labs, in 1958",
            "SDSU, in 2005"
        ],

        correct: 0
    },


    {
        question:
            "About how long did it take MEMS accelerometers to reach a commercial breakthrough in automotive and avionics?",

        answers: [
            "Nearly 20 years",
            "About 2 years",
            "Over a century",
            "Less than 6 months"
        ],

        correct: 0
    },


    {
        question:
            "About how many MEMS accelerometers are produced per year today?",

        answers: [
            "About 50 million",
            "About 500",
            "About 50 billion",
            "About 5,000"
        ],

        correct: 0
    },


    {
        question:
            "About how much does a typical MEMS accelerometer cost?",

        answers: [
            "$3 to $10",
            "$500 to $1,000",
            "$0.01",
            "$10,000"
        ],

        correct: 0
    },


    {
        question:
            "In pacemaker control applications, what does the accelerometer measure?",

        answers: [
            "Human activity level",
            "Blood pressure",
            "Body temperature",
            "Heart electrical signals"
        ],

        correct: 0
    },


    {
        question:
            "In tilt-sensing applications, what does the accelerometer measure?",

        answers: [
            "Angle of inclination",
            "Ambient light level",
            "Sound pressure",
            "Air humidity"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is a real-world accelerometer application?",

        answers: [
            "Seismic activity sensing in buildings and bridges",
            "Measuring internet bandwidth",
            "Detecting Wi-Fi signal strength",
            "Reading barcodes"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 28 — THE PHYSICS OF SENSING
======================================== */

const lesson28Questions = [

    {
        question:
            "When an accelerometer accelerates, what happens to the proof mass?",

        answers: [
            "It is displaced in the direction of sensing, restrained by the spring",
            "It instantly matches the housing's velocity with no lag",
            "It disappears from the structure",
            "It becomes electrically charged"
        ],

        correct: 0
    },


    {
        question:
            "What are the two common ways to sense the proof mass's displacement?",

        answers: [
            "Piezoelectrically or capacitively",
            "Optically or thermally only",
            "By weighing it directly",
            "By measuring its color"
        ],

        correct: 0
    },


    {
        question:
            "Which law is the physical starting point for accelerometer operation?",

        answers: [
            "Newton's second law, F = ma",
            "Ohm's law, V = IR",
            "Boyle's law",
            "Coulomb's law"
        ],

        correct: 0
    },


    {
        question:
            "In the mass-spring-damper model, what does 'k' represent?",

        answers: [
            "The spring constant",
            "The damping factor",
            "The proof mass",
            "The resonant frequency"
        ],

        correct: 0
    },


    {
        question:
            "In the mass-spring-damper model, what does 'b' represent?",

        answers: [
            "The damping factor",
            "The spring constant",
            "The proof mass",
            "The applied force"
        ],

        correct: 0
    },


    {
        question:
            "What is the formula for the system's natural (resonant) frequency?",

        answers: [
            "ω₀ = √(k / m)",
            "ω₀ = k × m",
            "ω₀ = m / b",
            "ω₀ = b × k"
        ],

        correct: 0
    },


    {
        question:
            "What does the quality factor (Q) describe?",

        answers: [
            "How underdamped an oscillator or resonator is",
            "The total mass of the sensor",
            "The die size of the chip",
            "The supply voltage required"
        ],

        correct: 0
    },


    {
        question:
            "All else being equal, what happens to resonant frequency if the spring constant increases?",

        answers: [
            "It increases",
            "It decreases",
            "It stays exactly the same",
            "It becomes zero"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 29 — SENSITIVITY & NOISE
======================================== */

const lesson29Questions = [

    {
        question:
            "What is the formula for an accelerometer's sensitivity (S)?",

        answers: [
            "S = x_static / a = m / k = 1 / ω²",
            "S = m × a",
            "S = k / b",
            "S = V / R"
        ],

        correct: 0
    },


    {
        question:
            "In the ADI 50g example accelerometer running at 24.7 kHz, what is the maximum static displacement at full scale?",

        answers: [
            "20 nm",
            "20 mm",
            "1.2 m",
            "50 µm"
        ],

        correct: 0
    },


    {
        question:
            "What does TNEA stand for?",

        answers: [
            "Total Noise Equivalent Acceleration",
            "Total Nitride Etch Area",
            "Thermal Nitride Emission Analysis",
            "Transimpedance Noise Elimination Amplifier"
        ],

        correct: 0
    },


    {
        question:
            "What fundamentally causes the noise floor described by TNEA?",

        answers: [
            "Air molecules randomly colliding with the proof mass",
            "Electromagnetic interference from nearby phones",
            "Manufacturing defects in the die",
            "Variations in supply voltage"
        ],

        correct: 0
    },


    {
        question:
            "Which two design choices reduce mechanical (TNEA) noise?",

        answers: [
            "Increasing quality factor and increasing mass",
            "Decreasing quality factor and decreasing mass",
            "Increasing supply voltage only",
            "Decreasing the die size only"
        ],

        correct: 0
    },


    {
        question:
            "About what is the noise floor of a real ADXL accelerometer?",

        answers: [
            "0.005 g/√Hz",
            "5 g/√Hz",
            "500 g/√Hz",
            "0.005 V/√Hz"
        ],

        correct: 0
    },


    {
        question:
            "What is the design rule of thumb for choosing resonant frequency?",

        answers: [
            "It should be higher than the maximum frequency component of the signal being measured",
            "It should always equal exactly 1000 Hz",
            "It should be as low as physically possible",
            "It doesn't matter as long as the die is small"
        ],

        correct: 0
    },


    {
        question:
            "Why is that resonant-frequency design rule important?",

        answers: [
            "Getting too close to resonance distorts the very signal being measured",
            "It reduces the cost of the die",
            "It has no real effect on performance",
            "It only matters for optical sensors"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 30 — CAPACITIVE POSITION SENSING
======================================== */

const lesson30Questions = [

    {
        question:
            "Which four methods can be used for electrical position measurement?",

        answers: [
            "Capacitance change, inductance change, optical method, scanning probe tips",
            "Voltage change, current change, resistance change, temperature change",
            "Weight, volume, density, and color",
            "Sound, light, heat, and pressure only"
        ],

        correct: 0
    },


    {
        question:
            "Which two capacitor configurations are common in MEMS position sensing?",

        answers: [
            "Parallel plate and interdigitated (comb)",
            "Cylindrical and spherical",
            "Single-plate and triangular",
            "Wireless and inductive"
        ],

        correct: 0
    },


    {
        question:
            "In Q = C(x)V, what does C(x) represent?",

        answers: [
            "Capacitance as a function of position",
            "A constant current source",
            "The supply voltage",
            "The damping factor"
        ],

        correct: 0
    },


    {
        question:
            "What circuit converts the sensing capacitor's current into an output voltage?",

        answers: [
            "A transimpedance amplifier",
            "A voltage divider only",
            "A simple resistor",
            "An inductor coil"
        ],

        correct: 0
    },


    {
        question:
            "If the excitation voltage is DC, what is the output voltage proportional to?",

        answers: [
            "Velocity (dx/dt), not directly to position",
            "Position directly, with no further circuitry needed",
            "Temperature",
            "Nothing — a DC source always gives zero output"
        ],

        correct: 0
    },


    {
        question:
            "What can recover position instead of velocity from a capacitive sensing circuit?",

        answers: [
            "Adding an integrator, or using a time-varying (AC) excitation source",
            "Removing the feedback capacitor entirely",
            "Increasing the DC supply voltage",
            "Switching to an optical sensor instead"
        ],

        correct: 0
    },


    {
        question:
            "With an AC excitation source and a feedback capacitor, what does the output voltage become approximately proportional to?",

        answers: [
            "C(x), the sensing capacitance (and therefore position)",
            "The square of the supply voltage",
            "The damping factor b",
            "The die's physical size"
        ],

        correct: 0
    },


    {
        question:
            "Why is a feedback capacitor added to the transimpedance amplifier circuit?",

        answers: [
            "To convert the sensed current into an output voltage proportional to capacitance/position",
            "To physically move the proof mass",
            "To increase the resonant frequency of the mass",
            "To reduce the die's overall size"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 31 — INSIDE THE ADXL150
======================================== */

const lesson31Questions = [

    {
        question:
            "Which company designed the ADXL150 accelerometer?",

        answers: [
            "Analog Devices",
            "Intel",
            "STMicroelectronics",
            "Texas Instruments"
        ],

        correct: 0
    },


    {
        question:
            "What forms the inertial (proof) mass in the ADXL150?",

        answers: [
            "A comb-like plate suspended from folded springs",
            "A solid block of silicon glued to the substrate",
            "A liquid-filled chamber",
            "A single rigid metal rod"
        ],

        correct: 0
    },


    {
        question:
            "How is the ADXL150's proof-mass displacement measured?",

        answers: [
            "Capacitively, relative to stationary polysilicon finger electrodes",
            "By directly weighing the mass in real time",
            "Using a laser interferometer built into the die",
            "By measuring the die's temperature change"
        ],

        correct: 0
    },


    {
        question:
            "What is the approximate die size of the ADXL150?",

        answers: [
            "1.94 mm × 1.94 mm",
            "1.94 m × 1.94 m",
            "19.4 mm × 19.4 mm",
            "194 µm × 194 µm"
        ],

        correct: 0
    },


    {
        question:
            "How many signal ports does the ADXL150 include?",

        answers: [
            "8",
            "2",
            "50",
            "1"
        ],

        correct: 0
    },


    {
        question:
            "In the related ADXL-50 device, how many sets of polysilicon finger electrodes are there, and how thick are they?",

        answers: [
            "3 sets, 2 µm thick",
            "10 sets, 50 µm thick",
            "1 set, 0.5 µm thick",
            "42 sets, 100 nm thick"
        ],

        correct: 0
    },


    {
        question:
            "In the ADXL-50, how many finger-electrode sets are fixed versus movable?",

        answers: [
            "2 fixed, 1 movable (suspended 1 µm above the base)",
            "All 3 sets are fixed",
            "All 3 sets move together",
            "1 fixed, 2 movable"
        ],

        correct: 0
    },


    {
        question:
            "In the sensor layout, how many cells make up the position sense region and the self-test region?",

        answers: [
            "42 cells for position sense, 12 cells for self-test",
            "8 cells for position sense, 1 cell for self-test",
            "100 cells for position sense, 100 for self-test",
            "1 cell for position sense, 42 for self-test"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 32 — DESIGNING THE SPRINGS
======================================== */

const lesson32Questions = [

    {
        question:
            "In the spring-design example, what polysilicon thickness is used?",

        answers: [
            "2 µm",
            "0.5 µm",
            "20 µm",
            "150 mm"
        ],

        correct: 0
    },


    {
        question:
            "What is the nominal gap between the sensing fingers?",

        answers: [
            "1.3 µm",
            "13 µm",
            "0.13 µm",
            "130 µm"
        ],

        correct: 0
    },


    {
        question:
            "What is the overlap length of the sensing fingers in the example?",

        answers: [
            "104 µm",
            "10.4 µm",
            "1.04 µm",
            "1040 µm"
        ],

        correct: 0
    },


    {
        question:
            "Roughly what sense capacitance results from this finger geometry, including fringe effects?",

        answers: [
            "About 100 fF",
            "About 100 µF",
            "About 100 pF",
            "About 1 F"
        ],

        correct: 0
    },


    {
        question:
            "Using the beam-bending formula with two folded beams (L1 = L2 = 75 µm), what is the total spring constant?",

        answers: [
            "About 5.6 N/m",
            "About 560 N/m",
            "About 0.056 N/m",
            "About 5,600,000 N/m"
        ],

        correct: 0
    },


    {
        question:
            "How closely did this calculated spring constant match Analog Devices' own estimate?",

        answers: [
            "Very closely — ADI estimated 5.4 N/m",
            "It was off by a factor of 1000",
            "ADI's estimate was negative",
            "They were not comparable at all"
        ],

        correct: 0
    },


    {
        question:
            "What resonant frequency results from the calculated mass and spring constant?",

        answers: [
            "About 24.7 kHz",
            "About 24.7 Hz",
            "About 1 kHz",
            "About 247 MHz"
        ],

        correct: 0
    },


    {
        question:
            "Using the Couette flow damping model for the proof mass's geometry, what quality factor results?",

        answers: [
            "About 120",
            "About 1.2",
            "About 12,000",
            "About 0.12"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 33 — BUILD AN ACCELEROMETER
======================================== */

const lesson33Questions = [

    {
        question:
            "In sensing an acceleration signal, which happens first?",

        answers: [
            "The proof mass is displaced, which then changes the sensing capacitance",
            "The capacitance changes on its own, causing the mass to move",
            "The supply voltage changes first",
            "The die temperature changes first"
        ],

        correct: 0
    },


    {
        question:
            "In the ADXL150, is the 1000 Hz operating bandwidth safely below or dangerously close to the 24.7 kHz resonant frequency?",

        answers: [
            "Safely below, with a large margin",
            "Dangerously close, right at resonance",
            "Above the resonant frequency",
            "Exactly equal to it"
        ],

        correct: 0
    },


    {
        question:
            "According to the TNEA formula, which two design levers reduce noise without changing the underlying physics?",

        answers: [
            "Increasing quality factor and mass",
            "Decreasing quality factor and mass",
            "Increasing supply voltage only",
            "Decreasing the number of signal ports"
        ],

        correct: 0
    },


    {
        question:
            "What fabrication processes finish an accelerometer once its mechanical design is set?",

        answers: [
            "Deposition, patterning, CVD oxide and nitride, and metallization",
            "Only wafer dicing",
            "Only optical inspection",
            "Only wire bonding"
        ],

        correct: 0
    },


    {
        question:
            "Which concept from earlier fabrication units also appears in building an accelerometer?",

        answers: [
            "Polysilicon structural layers and a final sacrificial release, like a PolyMUMPs device",
            "Silicon-on-insulator wafer bonding",
            "Piezoelectric material deposition",
            "Electroplated metal structural layers"
        ],

        correct: 0
    },


    {
        question:
            "According to S = m/k, what increases an accelerometer's sensitivity?",

        answers: [
            "A larger mass or a softer (lower k) spring",
            "A smaller mass or a stiffer spring",
            "A higher supply voltage only",
            "A smaller die size only"
        ],

        correct: 0
    },


    {
        question:
            "Why might a designer choose a stiffer spring despite lower sensitivity?",

        answers: [
            "To raise the resonant frequency and increase usable bandwidth",
            "To make the die more expensive to produce",
            "To reduce the number of signal ports needed",
            "Stiffness has no effect on frequency or bandwidth"
        ],

        correct: 0
    },


    {
        question:
            "What is the overall design tension every accelerometer designer must balance?",

        answers: [
            "Sensitivity versus bandwidth, and noise versus mass/stiffness",
            "Die color versus package size",
            "Supply voltage versus number of signal ports only",
            "There is no meaningful trade-off in accelerometer design"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 34 — WHY MEMS FOR OPTICS?
======================================== */

const lesson34Questions = [

    {
        question:
            "Why is MEMS technology well-suited for optical applications?",

        answers: [
            "The wavelength of light is on the same order of magnitude as MEMS device dimensions",
            "Light cannot interact with anything smaller than a millimeter",
            "MEMS devices are too large to interact with light at all",
            "Optics requires no moving parts of any kind"
        ],

        correct: 0
    },


    {
        question:
            "Which properties make MEMS switches attractive for routing optical signals?",

        answers: [
            "Low optical insertion loss and low crosstalk",
            "High weight and high power consumption",
            "Very large physical size",
            "A requirement for liquid cooling"
        ],

        correct: 0
    },


    {
        question:
            "How many micromirrors can a high-resolution DMD chip contain, demonstrating how well MEMS scales?",

        answers: [
            "Over 1 million",
            "About 10",
            "About 1,000",
            "Exactly 2"
        ],

        correct: 0
    },


    {
        question:
            "Why are MEMS devices considered ideal for optical switching?",

        answers: [
            "A small mechanical displacement can produce a large optical effect",
            "They require no electrical power whatsoever",
            "They can only switch light off, never on",
            "They must be replaced after every use"
        ],

        correct: 0
    },


    {
        question:
            "Optical MEMS technology has evolved over roughly four decades, from early projection displays to which modern application?",

        answers: [
            "LiDAR scanning",
            "Vinyl record players",
            "Mechanical typewriters",
            "Analog television"
        ],

        correct: 0
    },


    {
        question:
            "Which optical MEMS application area includes scanners and projection displays?",

        answers: [
            "Light control",
            "Sensing",
            "Fabrication",
            "None of these"
        ],

        correct: 0
    },


    {
        question:
            "Which optical MEMS application area includes fiber-optic sensors and confocal microscopes?",

        answers: [
            "Sensing",
            "Light control",
            "Fabrication",
            "None of these"
        ],

        correct: 0
    },


    {
        question:
            "Which optical MEMS application area includes Fabry-Perot mirrors and micro-lenses?",

        answers: [
            "Fabrication",
            "Sensing",
            "Light control",
            "None of these"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 35 — THREE WAYS TO BUILD A MEMS DISPLAY
======================================== */

const lesson35Questions = [

    {
        question:
            "What are the three basic approaches to MEMS-based projection displays?",

        answers: [
            "Reflective, diffractive, and interferometric modulation",
            "Electrical, magnetic, and thermal",
            "Analog, digital, and hybrid",
            "Wired, wireless, and optical-fiber"
        ],

        correct: 0
    },


    {
        question:
            "Which display technology uses the reflective approach?",

        answers: [
            "TI's Digital Micromirror Device (DMD)",
            "Qualcomm's mirasol display",
            "The Grating Light Valve",
            "LCD panels"
        ],

        correct: 0
    },


    {
        question:
            "Which display technology uses the diffractive approach?",

        answers: [
            "The Grating Light Valve (GLV)",
            "TI's DMD",
            "Qualcomm's mirasol display",
            "OLED panels"
        ],

        correct: 0
    },


    {
        question:
            "Which company developed the interferometric modulation display technology known as mirasol?",

        answers: [
            "Qualcomm",
            "Texas Instruments",
            "Fujitsu",
            "Intel"
        ],

        correct: 0
    },


    {
        question:
            "What ownership changes did the Grating Light Valve technology go through?",

        answers: [
            "Bought by Cypress Semiconductor in 2000, then Dainippon in 2008, then eventually Sony",
            "It was never sold or transferred to another company",
            "It was immediately discontinued after invention",
            "It was purchased by Apple in the 1990s"
        ],

        correct: 0
    },


    {
        question:
            "In a reflective display, what determines whether light reaches the viewer?",

        answers: [
            "The physical tilt position of a micromirror",
            "The color of the incoming light only",
            "The temperature of the chip",
            "The thickness of the glass substrate"
        ],

        correct: 0
    },


    {
        question:
            "In a diffractive display, what optical property does the effect strongly depend on?",

        answers: [
            "Wavelength",
            "Polarization only",
            "Sound frequency",
            "Air pressure"
        ],

        correct: 0
    },


    {
        question:
            "Which of the three display approaches works by forming an optically resonant cavity?",

        answers: [
            "Interferometric modulation (mirasol)",
            "Reflective (DMD)",
            "Diffractive (GLV)",
            "None of them use a resonant cavity"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 36 — INSIDE TI'S DMD
======================================== */

const lesson36Questions = [

    {
        question:
            "Roughly how many mirrors can a high-resolution DMD chip contain?",

        answers: [
            "Over 1 million",
            "About 100",
            "Exactly 1",
            "About 4"
        ],

        correct: 0
    },


    {
        question:
            "What does the DMD chip sit on, and what does that component do?",

        answers: [
            "A circuit board that converts incoming image data into digital signals",
            "A magnet that levitates the chip",
            "A speaker that produces sound",
            "A battery that charges the mirrors permanently"
        ],

        correct: 0
    },


    {
        question:
            "What determines whether incident light is reflected toward the image or deflected away in a DMD?",

        answers: [
            "Which of the two positions the micromirror is tilted to",
            "The color of the mirror's coating",
            "The ambient room temperature",
            "The speed of the projector's fan"
        ],

        correct: 0
    },


    {
        question:
            "What are two advantages of DMD-based projection?",

        answers: [
            "High brightness and contrast, with compact size, low weight, and low power",
            "Extremely high cost and large physical size",
            "Requires no electrical power at all",
            "Cannot produce color images"
        ],

        correct: 0
    },


    {
        question:
            "About how many pixels does DLP 1080p technology deliver?",

        answers: [
            "More than 2 million, for 1920 × 1080 resolution",
            "About 100",
            "Exactly 1,080",
            "About 50,000"
        ],

        correct: 0
    },


    {
        question:
            "What shape is the mirror support structure in a typical DMD pixel?",

        answers: [
            "H-shaped",
            "Perfectly circular",
            "Triangular",
            "Star-shaped"
        ],

        correct: 0
    },


    {
        question:
            "What suspends the mirror support above the substrate in a DMD pixel?",

        answers: [
            "A thin torsional spring",
            "A permanent magnet",
            "A column of compressed air",
            "A drop of liquid adhesive"
        ],

        correct: 0
    },


    {
        question:
            "What is the purpose of the central post beneath the mirror?",

        answers: [
            "It elevates the mirror above the plane of the support structure",
            "It permanently glues the mirror in place",
            "It conducts heat away from the chip",
            "It blocks light from reaching the mirror"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 37 — DMD BY THE NUMBERS
======================================== */

const lesson37Questions = [

    {
        question:
            "About how many moving parts does a TI DMD chip contain?",

        answers: [
            "0.5 to 1.2 million",
            "About 10",
            "Exactly 1",
            "About 4"
        ],

        correct: 0
    },


    {
        question:
            "What kind of mechanical motion do DMD mirrors make?",

        answers: [
            "Discrete contacts, or \"landings\"",
            "Continuous smooth rotation with no stopping points",
            "Linear sliding motion only",
            "No motion — they are fixed in place"
        ],

        correct: 0
    },


    {
        question:
            "What is the lifetime requirement for a single DMD moving part?",

        answers: [
            "450 billion contacts",
            "About 100 contacts",
            "Exactly 1 contact",
            "450 contacts"
        ],

        correct: 0
    },


    {
        question:
            "What limits the DMD's address voltage?",

        answers: [
            "5-volt CMOS technology",
            "A 500-volt power supply",
            "There is no voltage limit at all",
            "A single AA battery"
        ],

        correct: 0
    },


    {
        question:
            "What material are the DMD's mechanical elements made from?",

        answers: [
            "Aluminum",
            "Pure gold",
            "Glass",
            "Rubber"
        ],

        correct: 0
    },


    {
        question:
            "What fabrication process forms the DMD's mechanical elements?",

        answers: [
            "Low-temperature sputter deposition and plasma etch",
            "Hand-carving under a microscope",
            "3D printing with molten metal",
            "Injection molding"
        ],

        correct: 0
    },


    {
        question:
            "What type of sacrificial layer does the DMD process use, and how is it removed?",

        answers: [
            "An organic sacrificial layer, dry-etched and removed at the wafer level",
            "A permanent layer that is never removed",
            "A liquid layer removed by hand with a syringe",
            "A metal layer removed by melting the whole wafer"
        ],

        correct: 0
    },


    {
        question:
            "When does die separation happen in the DMD fabrication process?",

        answers: [
            "After the sacrificial layer is removed",
            "Before any layers are deposited",
            "Die separation never happens",
            "Immediately after the wafer is doped"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 38 — THE PHYSICS OF TILTING MIRRORS
======================================== */

const lesson38Questions = [

    {
        question:
            "What two torques must balance to determine a torsion mirror's tilt angle?",

        answers: [
            "Electrostatic torque and mechanical (restoring) torque",
            "Gravitational torque and magnetic torque",
            "Thermal torque and optical torque",
            "There is only one torque involved"
        ],

        correct: 0
    },


    {
        question:
            "What provides the mechanical restoring torque in a torsion mirror?",

        answers: [
            "The twisting of the torsion beam (spring)",
            "A small electric motor",
            "Air pressure from a built-in pump",
            "Gravity acting on the mirror alone"
        ],

        correct: 0
    },


    {
        question:
            "What provides the electrostatic torque that tips the mirror?",

        answers: [
            "The voltage applied between the mirror support and a bottom electrode",
            "Sunlight striking the mirror directly",
            "A magnetic field from an external coil",
            "Friction from the surrounding air"
        ],

        correct: 0
    },


    {
        question:
            "What is a common structural material used for MEMS torsion mirrors?",

        answers: [
            "Polysilicon",
            "Rubber",
            "Wood",
            "Glass fiber"
        ],

        correct: 0
    },


    {
        question:
            "What is the name for the critical voltage moment when electrostatic torque overwhelms mechanical torque?",

        answers: [
            "Pull-in",
            "Push-out",
            "Lock-up",
            "Drop-off"
        ],

        correct: 0
    },


    {
        question:
            "What do landing pads prevent in a torsion mirror structure?",

        answers: [
            "Short circuits between the mirror and the electrode",
            "The mirror from ever moving at all",
            "Light from reflecting off the mirror",
            "The torsion beam from twisting"
        ],

        correct: 0
    },


    {
        question:
            "What simplifying assumption is commonly made when modeling a torsion mirror electrostatically?",

        answers: [
            "Fringing electric fields are neglected",
            "The mirror is assumed to be infinitely heavy",
            "Voltage is assumed to have no effect",
            "The torsion beam is assumed to be liquid"
        ],

        correct: 0
    },


    {
        question:
            "What happens to the mirror once pull-in occurs?",

        answers: [
            "It snaps the rest of the way to its landing position",
            "It stops moving permanently",
            "It reverses direction and returns to flat",
            "It melts due to the applied voltage"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 39 — GRATINGS & INTERFEROMETRIC DISPLAYS
======================================== */

const lesson39Questions = [

    {
        question:
            "What replaces individual tilting mirrors in a Grating Light Valve (GLV) display?",

        answers: [
            "An array of electrostatically actuated diffraction-grating ribbons",
            "A single large rotating disc",
            "A liquid crystal layer",
            "A row of LEDs"
        ],

        correct: 0
    },


    {
        question:
            "How does a GLV display create different colors?",

        answers: [
            "By using different spacing between the ribbons",
            "By heating different parts of the chip",
            "By changing the chip's supply voltage only",
            "By rotating the entire display"
        ],

        correct: 0
    },


    {
        question:
            "Roughly how many ribbons form one pixel in a GLV display?",

        answers: [
            "About 6",
            "About 1,000",
            "Exactly 1",
            "About 42"
        ],

        correct: 0
    },


    {
        question:
            "Compared to a tilting mirror, how large is the displacement needed to operate a GLV ribbon?",

        answers: [
            "Much smaller — about a quarter wavelength",
            "Much larger — about a full centimeter",
            "Identical to the mirror's displacement",
            "There is no displacement in a GLV"
        ],

        correct: 0
    },


    {
        question:
            "Which display technology has a nanosecond-scale response time due to its very small displacement?",

        answers: [
            "Diffractive (GLV)",
            "Reflective (tilting mirror)",
            "Both are equally fast",
            "Neither has a measurable response time"
        ],

        correct: 0
    },


    {
        question:
            "Which display technology has a millisecond-scale response time due to its larger displacement?",

        answers: [
            "Reflective (tilting mirror)",
            "Diffractive (GLV)",
            "Both are equally slow",
            "Neither has a measurable response time"
        ],

        correct: 0
    },


    {
        question:
            "In Qualcomm's mirasol display, what two components form the optically resonant cavity?",

        answers: [
            "A deformable reflective membrane and a thin-film stack",
            "Two identical rigid mirrors bonded together",
            "A speaker and a microphone",
            "A battery and a capacitor"
        ],

        correct: 0
    },


    {
        question:
            "What type of substrate holds both mirror components in a mirasol display?",

        answers: [
            "A transparent substrate",
            "An opaque metal substrate",
            "A liquid-filled substrate",
            "No substrate is used at all"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 40 — OPTICAL MEMS BEYOND DISPLAYS
======================================== */

const lesson40Questions = [

    {
        question:
            "Besides displays, what other major category of optical MEMS device exists for routing light signals?",

        answers: [
            "Optical MEMS switches",
            "Optical MEMS speakers",
            "Optical MEMS batteries",
            "Optical MEMS keyboards"
        ],

        correct: 0
    },


    {
        question:
            "Which company is associated with 3D MEMS optical switches?",

        answers: [
            "Fujitsu",
            "Qualcomm",
            "Silicon Light Machines",
            "Texas Instruments"
        ],

        correct: 0
    },


    {
        question:
            "What is a waveguide sensor an example of?",

        answers: [
            "An optical MEMS sensing application",
            "A purely mechanical switch",
            "A type of projection display",
            "A fabrication tool used to build mirrors"
        ],

        correct: 0
    },


    {
        question:
            "Which optical MEMS sensing application is used in high-resolution biological imaging?",

        answers: [
            "Confocal microscopy",
            "Grating Light Valve displays",
            "DMD projection",
            "Mirasol interferometric displays"
        ],

        correct: 0
    },


    {
        question:
            "Besides displacement, what other physical quantities can optical MEMS sensors measure?",

        answers: [
            "Pressure, flow, and acceleration",
            "Only electrical voltage",
            "Only sound volume",
            "Nothing besides displacement"
        ],

        correct: 0
    },


    {
        question:
            "What does MEMS-nanophotonics integration refer to as a development trend?",

        answers: [
            "Combining MEMS structures with nanoscale photonic components",
            "Removing all optical components from MEMS devices",
            "Replacing MEMS with purely electronic circuits",
            "Making MEMS devices larger and heavier"
        ],

        correct: 0
    },


    {
        question:
            "What does a \"single-chip optical MEMS system\" refer to as a development trend?",

        answers: [
            "Integrating a complete optical MEMS system, including electronics, onto one chip",
            "Using a separate chip for every individual mirror",
            "Removing all electronics from optical MEMS entirely",
            "Building optical MEMS devices without any silicon"
        ],

        correct: 0
    },


    {
        question:
            "Which underlying fabrication concepts, familiar from earlier microfabrication topics, also apply to building a device like the DMD?",

        answers: [
            "Deposition, patterning, sacrificial-layer release, and metallization",
            "Only hand assembly with no fabrication steps",
            "Only optical polishing, with no deposition at all",
            "Only 3D printing in plastic"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 41 — WHY MICROFLUIDICS?
======================================== */

const lesson41Questions = [

    {
        question:
            "Why are MEMS-scale devices a natural fit for interacting with biological cells?",

        answers: [
            "They are on the same size scale as cells",
            "They are much larger than cells and easier to see",
            "They only work with non-living materials",
            "They require no electrical power to operate"
        ],

        correct: 0
    },


    {
        question:
            "About how large are red blood cells, white blood cells, and platelets?",

        answers: [
            "6 to 8 µm in diameter",
            "6 to 8 mm in diameter",
            "6 to 8 nm in diameter",
            "6 to 8 cm in diameter"
        ],

        correct: 0
    },


    {
        question:
            "What size range do neuron cells typically fall into?",

        answers: [
            "4 µm to 100 µm",
            "4 mm to 100 mm",
            "4 nm to 100 nm",
            "4 cm to 100 cm"
        ],

        correct: 0
    },


    {
        question:
            "What is one key benefit of using MEMS-scale devices to interface with living cells?",

        answers: [
            "It minimizes damage to the cells",
            "It destroys the cells for easier disposal",
            "It makes the cells grow larger",
            "It eliminates the need for any fluid at all"
        ],

        correct: 0
    },


    {
        question:
            "What does a \"lung-on-a-chip\" device aim to do?",

        answers: [
            "Mimic organ and tissue functionality at a small scale",
            "Replace the need for any biological studies",
            "Convert light into digital signals",
            "Measure acceleration of a moving vehicle"
        ],

        correct: 0
    },


    {
        question:
            "Which electrokinetic method uses acoustic waves to manipulate bio-particles?",

        answers: [
            "Acoustophoresis",
            "Electroosmosis",
            "Capillary action",
            "Electromagnetics"
        ],

        correct: 0
    },


    {
        question:
            "Besides silicon, what other materials have been used as substrates for BioMEMS/biochips?",

        answers: [
            "Plastics, glass, and carbon",
            "Only wood and paper",
            "Only pure gold",
            "Only rubber"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is an electrokinetic force used by BioMEMS to manipulate bio-particles?",

        answers: [
            "Dielectrophoresis",
            "Gravitational lensing",
            "Nuclear fission",
            "Radioactive decay"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 42 — SORTING CELLS WITH SOUND
======================================== */

const lesson42Questions = [

    {
        question:
            "What piezoelectric material commonly drives the acoustic waves in an acoustophoresis device?",

        answers: [
            "Lithium niobate",
            "Pure aluminum",
            "Rubber",
            "Glass fiber"
        ],

        correct: 0
    },


    {
        question:
            "What does SAW stand for?",

        answers: [
            "Surface Acoustic Wave",
            "Silicon Anchor Weld",
            "Static Air Wafer",
            "Sequential Analog Waveform"
        ],

        correct: 0
    },


    {
        question:
            "What is formed when two surface acoustic waves travel toward each other and combine?",

        answers: [
            "A Standing Surface Acoustic Wave (SSAW)",
            "A permanent electrical short circuit",
            "A single traveling light wave",
            "A magnetic field"
        ],

        correct: 0
    },


    {
        question:
            "Where is the SSAW positioned in an acoustophoresis device?",

        answers: [
            "Between the channels of the microfluidic device",
            "Outside the chip entirely",
            "Inside the power supply",
            "Above the display screen"
        ],

        correct: 0
    },


    {
        question:
            "What happens to larger particles in the standing wave field?",

        answers: [
            "They are funneled into the center, at the pressure node",
            "They are destroyed immediately",
            "They float out of the channel entirely",
            "They stick permanently to the substrate"
        ],

        correct: 0
    },


    {
        question:
            "What happens to smaller particles in the standing wave field?",

        answers: [
            "They remain on the outside of the channel, near the antinodes",
            "They are funneled into the exact center",
            "They are electrically charged",
            "They disappear from the channel"
        ],

        correct: 0
    },


    {
        question:
            "What generates the surface acoustic waves on the piezoelectric substrate?",

        answers: [
            "An interdigitated transducer (IDT)",
            "A rotating motor",
            "A laser beam",
            "A chemical reaction"
        ],

        correct: 0
    },


    {
        question:
            "What material is the microfluidic channel typically made from in this design?",

        answers: [
            "PDMS (a polymer)",
            "Solid steel",
            "Pure diamond",
            "Liquid mercury"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 43 — THE PHYSICS OF ACOUSTIC FORCES
======================================== */

const lesson43Questions = [

    {
        question:
            "What determines the resonant frequency of the surface acoustic wave?",

        answers: [
            "The Rayleigh wave velocity divided by the IDT wavelength",
            "The color of the substrate",
            "The number of cells in the channel",
            "The ambient room temperature only"
        ],

        correct: 0
    },


    {
        question:
            "About what is the Rayleigh wave velocity used for the lithium niobate substrate in this design?",

        answers: [
            "About 3980 m/s",
            "About 3.98 m/s",
            "About 3,980,000 m/s",
            "About 39.8 m/s"
        ],

        correct: 0
    },


    {
        question:
            "What does the acoustic contrast factor determine?",

        answers: [
            "The direction particles migrate — toward nodes or antinodes",
            "The exact color of the acoustic wave",
            "The total voltage supplied to the chip",
            "The number of inlets on the device"
        ],

        correct: 0
    },


    {
        question:
            "When the acoustic contrast factor is positive, which direction does the force on a particle point?",

        answers: [
            "From the antinodes toward the pressure nodes",
            "From the pressure nodes toward the antinodes",
            "Directly upward, out of the channel",
            "There is no force when the factor is positive"
        ],

        correct: 0
    },


    {
        question:
            "What force opposes and balances the acoustic force acting on a particle in the fluid?",

        answers: [
            "Viscous force",
            "Gravitational force only",
            "Magnetic force",
            "Nuclear force"
        ],

        correct: 0
    },


    {
        question:
            "Which three properties determine the viscous drag force on a particle?",

        answers: [
            "The particle's radius, its velocity, and the fluid's viscosity",
            "The particle's color, weight, and temperature",
            "The chip's supply voltage, size, and cost",
            "The number of electrodes and their material only"
        ],

        correct: 0
    },


    {
        question:
            "What sets the \"period\" — the spacing and width — of the IDT's electrode fingers?",

        answers: [
            "A quarter of the acoustic wavelength",
            "The full acoustic wavelength times ten",
            "The size of the largest cell being sorted",
            "The thickness of the PDMS channel"
        ],

        correct: 0
    },


    {
        question:
            "Roughly what is the smallest practical IDT wavelength, due to manufacturing limits?",

        answers: [
            "About 240 µm",
            "About 2.4 mm",
            "About 24 nm",
            "About 2.4 m"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 44 — DESIGNING THE IDT & CHANNEL
======================================== */

const lesson44Questions = [

    {
        question:
            "About how long and wide is each IDT transducer in this design?",

        answers: [
            "3 cm long, 1 cm wide",
            "3 mm long, 1 mm wide",
            "30 cm long, 10 cm wide",
            "3 m long, 1 m wide"
        ],

        correct: 0
    },


    {
        question:
            "What is the finger length used in the IDT design?",

        answers: [
            "25 mm",
            "2.5 mm",
            "250 mm",
            "25 µm"
        ],

        correct: 0
    },


    {
        question:
            "What is the aperture, or finger overlap, in the IDT design?",

        answers: [
            "20 mm",
            "2 mm",
            "200 mm",
            "20 µm"
        ],

        correct: 0
    },


    {
        question:
            "What are the electrode width and spacing in the IDT design?",

        answers: [
            "40 µm width, 80 µm spacing",
            "4 mm width, 8 mm spacing",
            "400 nm width, 800 nm spacing",
            "40 mm width, 80 mm spacing"
        ],

        correct: 0
    },


    {
        question:
            "How many total fingers make up the IDT design, and how are they grouped?",

        answers: [
            "168 fingers, in 42 groups of 4",
            "4 fingers total, in 1 group",
            "1,680 fingers, in 4 groups of 420",
            "42 fingers, in 168 groups"
        ],

        correct: 0
    },


    {
        question:
            "How many opposing IDT sets does this design use?",

        answers: [
            "Two",
            "One",
            "Eight",
            "Forty-two"
        ],

        correct: 0
    },


    {
        question:
            "How many inlets does the microfluidic channel design use, and what is their diameter?",

        answers: [
            "3 inlets, 40 µm in diameter",
            "1 inlet, 400 µm in diameter",
            "10 inlets, 4 µm in diameter",
            "3 inlets, 4 mm in diameter"
        ],

        correct: 0
    },


    {
        question:
            "What layout property does the design deliberately keep symmetric?",

        answers: [
            "The microchannel and the SSAW device, mirrored about a centerline",
            "The color of the substrate on each half of the chip",
            "The supply voltage on each electrode randomly",
            "Nothing in the layout is kept symmetric"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 45 — SIMULATING BEFORE FABRICATING
======================================== */

const lesson45Questions = [

    {
        question:
            "What two physics domains are combined in this device's finite-element simulation?",

        answers: [
            "Solid mechanics and electrostatics",
            "Thermodynamics and optics",
            "Fluid dynamics and magnetism only",
            "Chemistry and acoustics only"
        ],

        correct: 0
    },


    {
        question:
            "What crystal cut of lithium niobate is used as the piezoelectric substrate?",

        answers: [
            "128° Y-cut, X-propagating",
            "A random, uncontrolled cut",
            "45° Z-cut, Y-propagating",
            "0° X-cut, Z-propagating"
        ],

        correct: 0
    },


    {
        question:
            "What size wafer is used to fabricate the device?",

        answers: [
            "A 4-inch lithium niobate wafer",
            "A 50-inch silicon wafer",
            "A 1-inch glass wafer",
            "A 12-inch steel wafer"
        ],

        correct: 0
    },


    {
        question:
            "What thickness are the gold electrodes modeled at in the simulation?",

        answers: [
            "250 nm",
            "250 µm",
            "25 mm",
            "2.5 cm"
        ],

        correct: 0
    },


    {
        question:
            "What voltage is applied to the drive electrode in the simulation's boundary conditions?",

        answers: [
            "+10 V",
            "+10,000 V",
            "+0.001 V",
            "0 V"
        ],

        correct: 0
    },


    {
        question:
            "What modal frequency did the simulation find for this device?",

        answers: [
            "16.473 MHz",
            "16.473 Hz",
            "16.473 GHz",
            "1.6473 kHz"
        ],

        correct: 0
    },


    {
        question:
            "What voltage peak did the electrostatics simulation results show?",

        answers: [
            "5 V",
            "500 V",
            "0.5 mV",
            "50 kV"
        ],

        correct: 0
    },


    {
        question:
            "What does the displacement field in the simulation results represent?",

        answers: [
            "The propagation of the acoustic wave",
            "The chip's total electrical resistance",
            "The number of cells in the channel",
            "The temperature distribution across the chip"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 46 — BUILDING THE CHIP
======================================== */

const lesson46Questions = [

    {
        question:
            "What fabrication technique is used to pattern the IDT electrodes onto the substrate?",

        answers: [
            "Metal lift-off",
            "3D printing",
            "Hand engraving",
            "Injection molding"
        ],

        correct: 0
    },


    {
        question:
            "What photoresist protocol and mask type are used in the photolithography step?",

        answers: [
            "Standard Futurrex photoresist protocol with a light-field mask",
            "No photoresist is used at all",
            "A photoresist made entirely of metal",
            "A dark-field mask with no photoresist"
        ],

        correct: 0
    },


    {
        question:
            "What two metals are deposited to form the IDT electrodes?",

        answers: [
            "Chromium and gold (Cr/Au)",
            "Iron and lead",
            "Copper and tin",
            "Silver and zinc"
        ],

        correct: 0
    },


    {
        question:
            "What happens during the \"lift-off\" step of fabrication?",

        answers: [
            "The photoresist, along with excess metal on top of it, is removed, leaving the patterned electrodes",
            "The entire substrate is physically lifted off the wafer",
            "New photoresist is added on top of the existing metal",
            "The chip is heated until it melts"
        ],

        correct: 0
    },


    {
        question:
            "What substrate material is patterned in this fabrication process?",

        answers: [
            "Lithium niobate",
            "Pure copper",
            "Plain glass",
            "Cardboard"
        ],

        correct: 0
    },


    {
        question:
            "After the IDT/SSAW device is fabricated, what is bonded onto it to complete the chip?",

        answers: [
            "The microfluidic PDMS device",
            "A second lithium niobate wafer",
            "A battery pack",
            "A speaker"
        ],

        correct: 0
    },


    {
        question:
            "What does the final assembled chip combine?",

        answers: [
            "A piezoelectric SSAW-generating substrate and a microfluidic PDMS channel",
            "Two identical PDMS channels stacked together",
            "A battery and a display screen",
            "A camera lens and a microphone"
        ],

        correct: 0
    },


    {
        question:
            "What is the correct order of the fabrication sequence for the IDT device?",

        answers: [
            "Photolithography, then metal deposition, then lift-off",
            "Lift-off, then metal deposition, then photolithography",
            "Metal deposition, then lift-off, then photolithography",
            "All three steps happen simultaneously"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 47 — BUILD AN ACOUSTOPHORESIS CHIP
======================================== */

const lesson47Questions = [

    {
        question:
            "What is the overall design sequence for building an acoustophoresis cell-separation chip?",

        answers: [
            "Design by rule, then design by analysis, then fabrication, then bonding, then testing",
            "Fabrication first, then design afterward",
            "Testing first, then design, then fabrication",
            "There is no meaningful sequence to follow"
        ],

        correct: 0
    },


    {
        question:
            "What two tests does the finished device undergo?",

        answers: [
            "Particle focusing and particle separation",
            "Sound volume and light brightness",
            "Battery life and charging speed",
            "Screen resolution and refresh rate"
        ],

        correct: 0
    },


    {
        question:
            "What is the underlying reason larger and smaller particles end up in different locations within the channel?",

        answers: [
            "They experience different acoustic forces relative to viscous drag, based on their size",
            "Larger particles are magnetically attracted to the walls",
            "Smaller particles evaporate during testing",
            "The channel randomly assigns particle positions"
        ],

        correct: 0
    },


    {
        question:
            "Which two chip components must be fabricated separately before being joined?",

        answers: [
            "The piezoelectric SSAW/IDT substrate and the PDMS microfluidic channel",
            "Two identical copies of the same electrode pattern",
            "A battery and a power switch",
            "A lens and a mirror"
        ],

        correct: 0
    },


    {
        question:
            "What real-world problem can an acoustophoresis chip like this help solve?",

        answers: [
            "Separating or isolating cells by size, such as from a blood sample",
            "Increasing the speed of a car engine",
            "Projecting a high-resolution image",
            "Storing digital data on a hard drive"
        ],

        correct: 0
    },


    {
        question:
            "What is the benefit of simulating the SAW device (design by analysis) before fabricating it?",

        answers: [
            "It lets you verify the frequency and displacement behavior before committing to fabrication",
            "It eliminates the need for any fabrication at all",
            "It guarantees the chip will never fail once built",
            "It replaces the need for any design rules"
        ],

        correct: 0
    },


    {
        question:
            "Which physical quantity most directly sets the device's operating frequency?",

        answers: [
            "The IDT wavelength",
            "The color of the PDMS channel",
            "The number of blood cells in the sample",
            "The thickness of the packaging"
        ],

        correct: 0
    },


    {
        question:
            "What core principle links every step of this device, from IDT design to final testing?",

        answers: [
            "Precisely controlling an acoustic standing wave to apply size-dependent forces on particles",
            "Minimizing the total cost of the chip at any expense",
            "Maximizing the number of inlets regardless of function",
            "Avoiding the use of any piezoelectric material"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 48 — WHY MEMS PACKAGING?
======================================== */

const lesson48Questions = [

    {
        question:
            "What is the basic function of MEMS packaging?",

        answers: [
            "Building a connection between the die and the outside world, while selectively letting through what matters",
            "Making the die permanently inaccessible to everything, including its own signals",
            "Replacing the need for any fabrication steps",
            "Increasing the die's size by a factor of ten"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is a way packaging protects the device from the environment?",

        answers: [
            "Electrical and magnetic isolation from moisture and electrolytes",
            "Exposing the die directly to open air at all times",
            "Removing all electrical connections",
            "Coating the die in a material that conducts electricity everywhere"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is a way packaging protects the environment from the device?",

        answers: [
            "Reducing or eliminating host responses, or containing toxic products",
            "Making the device louder",
            "Increasing the device's power consumption",
            "Removing the device's protective coating"
        ],

        correct: 0
    },


    {
        question:
            "Why might a BioMEMS device specifically require sterilization as part of its packaging?",

        answers: [
            "To protect the environment, such as a patient, from the device",
            "To make the device heavier",
            "To increase its electrical resistance",
            "Sterilization is never required for BioMEMS devices"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement is especially important for accelerometers and resonators?",

        answers: [
            "Hermetic, vacuum sealing / media compatibility",
            "Bright, colorful packaging materials",
            "Maximum possible package size",
            "Zero electrical connections of any kind"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement addresses cross-talk, voltage drop, and capacitive loading?",

        answers: [
            "Acceptable electrical interconnection",
            "Precision optical alignment",
            "Chemical isolation",
            "Device sterilization"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement is especially critical for optical MEMS devices?",

        answers: [
            "Precision alignment",
            "Maximum electrical resistance",
            "Total absence of any package",
            "Bright surface coloring"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement addresses mounting the device without applying undue stress to it?",

        answers: [
            "Acceptable mechanical interconnection",
            "Device sterilization",
            "Precision optical alignment",
            "Low electrical resistance"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 49 — FROM DIE TO SHIPPED CHIP
======================================== */

const lesson49Questions = [

    {
        question:
            "How many major process steps are commonly involved in going from wafer to a finished packaged device?",

        answers: [
            "9",
            "2",
            "50",
            "1"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging process typically comes right after bonding, when preparing individual dies?",

        answers: [
            "Wafer sawing (dicing)",
            "Final testing",
            "Overmolding",
            "Trimming"
        ],

        correct: 0
    },


    {
        question:
            "Which wafer-bonding type uses temperatures between 800 and 1200°C to form a stable Si-Si or Si-SiO2 bond?",

        answers: [
            "Direct wafer bonding",
            "Anodic bonding",
            "Flip-chip bonding",
            "Wire bonding"
        ],

        correct: 0
    },


    {
        question:
            "Which wafer-bonding type is also called electrostatic bonding, and bonds silicon to glass?",

        answers: [
            "Anodic bonding",
            "Direct wafer bonding",
            "Flip-chip bonding",
            "Thermocompression bonding"
        ],

        correct: 0
    },


    {
        question:
            "What temperature and voltage range does anodic bonding typically use?",

        answers: [
            "180–500°C, 200–1000 volts",
            "0°C, 0 volts",
            "5000°C, 1,000,000 volts",
            "20°C, 1 volt"
        ],

        correct: 0
    },


    {
        question:
            "What is a common application of wafer-level bonding that creates a sealed vacuum reference?",

        answers: [
            "Absolute pressure sensors",
            "Wire bonding pads",
            "Photoresist coating",
            "Wafer dicing"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is one of the 9 common packaging processes?",

        answers: [
            "Encapsulation",
            "Photosynthesis",
            "Radioactive decay",
            "Nuclear fusion"
        ],

        correct: 0
    },


    {
        question:
            "What are the last two steps in the typical 9-step packaging process list?",

        answers: [
            "Trimming and final testing",
            "Bonding and wafer sawing",
            "Pick and place and die attach",
            "Wire bonding and encapsulation"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 50 — CUTTING, PLACING, ATTACHING
======================================== */

const lesson50Questions = [

    {
        question:
            "What is the wafer placed on during dicing to hold it in place?",

        answers: [
            "A mylar film with light adhesive",
            "A pool of liquid nitrogen",
            "A bed of loose sand",
            "A sheet of aluminum foil"
        ],

        correct: 0
    },


    {
        question:
            "Why must the dicing adhesive be both strong and mild?",

        answers: [
            "Strong enough to hold the die during sawing, but mild enough to allow pick-and-place afterward",
            "So it can be eaten safely if needed",
            "So it changes color during the process",
            "So it conducts electricity during sawing"
        ],

        correct: 0
    },


    {
        question:
            "Besides diamond sawing, what are two other dicing techniques mentioned?",

        answers: [
            "Laser cutting and diamond wire cutting",
            "Hand-cutting with scissors and biting",
            "Melting and re-freezing",
            "Dissolving in acid entirely"
        ],

        correct: 0
    },


    {
        question:
            "What does the \"pick and place\" process do?",

        answers: [
            "Mounts dies from a wafer onto a lead-frame or into a package",
            "Removes all dies from the wafer permanently",
            "Cleans the wafer surface with solvent",
            "Anneals the wafer at high temperature"
        ],

        correct: 0
    },


    {
        question:
            "Why can pick and place be risky for some MEMS devices?",

        answers: [
            "It can damage sensitive, already-released structures like surface-micromachined accelerometers",
            "It always destroys the entire wafer",
            "It requires no physical contact at all",
            "It only works on devices with no moving parts, so it's never risky"
        ],

        correct: 0
    },


    {
        question:
            "What alternative technique is being explored to reduce pick-and-place damage?",

        answers: [
            "Self-assembly techniques",
            "Manual assembly by hand only",
            "Skipping packaging entirely",
            "Using only wire bonding for every device"
        ],

        correct: 0
    },


    {
        question:
            "What happens during die attach?",

        answers: [
            "An adhesive bond layer is deposited on the substrate, the die is placed on it, then cured, annealed, or fired",
            "The die is wire-bonded directly with no adhesive",
            "The die is submerged in acid",
            "The die is diced into smaller pieces"
        ],

        correct: 0
    },


    {
        question:
            "Does die attach happen before or after wire bonding?",

        answers: [
            "Before wire bonding",
            "After wire bonding",
            "At the exact same time as wire bonding",
            "Die attach and wire bonding are the same step"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 51 — WIRING & FLIP-CHIP
======================================== */

const lesson51Questions = [

    {
        question:
            "What are three common types of electrical interconnection used in packaging?",

        answers: [
            "Wire-bonding, flip-chip, and ball bonding",
            "Painting, gluing, and stapling",
            "Welding, riveting, and screwing",
            "Freezing, boiling, and evaporating"
        ],

        correct: 0
    },


    {
        question:
            "What is thermocompression bonding, in the context of wire bonding?",

        answers: [
            "A metal-to-metal bond created using heat and pressure, usually with gold wire",
            "A bond formed using only cold temperatures",
            "A chemical adhesive with no heat or pressure involved",
            "A bond formed by submerging the wire in water"
        ],

        correct: 0
    },


    {
        question:
            "What is the typical wire-bonding technique called?",

        answers: [
            "Ball-wedge bonding",
            "Flip-flop bonding",
            "Square-triangle bonding",
            "Straight-line bonding"
        ],

        correct: 0
    },


    {
        question:
            "In ball-wedge bonding, where is the ball initially formed?",

        answers: [
            "At the end of the wire, on the die's bond pad",
            "In the middle of the lead frame",
            "Inside the wafer itself before dicing",
            "On the outside of the package casing"
        ],

        correct: 0
    },


    {
        question:
            "What is a major advantage of flip-chip bonding over wire bonding?",

        answers: [
            "It eliminates leads entirely, improving electrical and density performance",
            "It requires more wires per connection",
            "It only works on devices larger than a coin",
            "It eliminates the need for any substrate"
        ],

        correct: 0
    },


    {
        question:
            "What connects the flipped die to the substrate in flip-chip bonding?",

        answers: [
            "Solder bumps",
            "Wire loops",
            "Magnetic clamps",
            "Adhesive tape only"
        ],

        correct: 0
    },


    {
        question:
            "How is a flip-chip die attached or removed from its substrate?",

        answers: [
            "By locally heating the substrate to reflow the solder",
            "By freezing the entire assembly",
            "By applying a strong magnetic field",
            "By submerging it in oil"
        ],

        correct: 0
    },


    {
        question:
            "In the flip-chip MEMS glass-substrate example, what is deposited on the movable polysilicon MEMS plate first?",

        answers: [
            "A photopolymer",
            "A layer of pure gold",
            "A layer of liquid mercury",
            "Nothing is deposited on it"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 52 — ENCAPSULATION & TESTING
======================================== */

const lesson52Questions = [

    {
        question:
            "What two problems does encapsulation and overmolding protect a MEMS device from?",

        answers: [
            "Corrosion and mechanical damage",
            "Overheating and underheating only",
            "Too much light exposure only",
            "Excess electrical conductivity"
        ],

        correct: 0
    },


    {
        question:
            "What thermal issue can arise from encapsulation materials with different coefficients of thermal expansion (CTE)?",

        answers: [
            "Bimetallic action, causing thermal stress",
            "Instant melting at room temperature",
            "Permanent loss of all electrical conductivity",
            "Spontaneous combustion"
        ],

        correct: 0
    },


    {
        question:
            "In the LPCVD/PSG encapsulation process, what does the thick PSG deposition define?",

        answers: [
            "The encapsulation regions",
            "The final metal contact pads",
            "The wafer's crystal orientation",
            "The wire-bonding locations"
        ],

        correct: 0
    },


    {
        question:
            "What does the thin PSG deposition define in this encapsulation process?",

        answers: [
            "The etch channels",
            "The final package color",
            "The die's overall thickness",
            "The wire-bonding pads"
        ],

        correct: 0
    },


    {
        question:
            "What is deposited to form the protective shell in this encapsulation process?",

        answers: [
            "A nitride shell",
            "A layer of pure aluminum only",
            "A layer of rubber",
            "A layer of wood"
        ],

        correct: 0
    },


    {
        question:
            "What happens after all sacrificial PSG inside the shell is removed?",

        answers: [
            "Supercritical CO2 drying, followed by a global LPCVD sealing step",
            "The entire wafer is discarded",
            "The shell is immediately shattered",
            "Nothing further happens"
        ],

        correct: 0
    },


    {
        question:
            "What special equipment does accelerometer testing typically require?",

        answers: [
            "A shaker table",
            "A telescope",
            "A microwave oven",
            "A wind tunnel"
        ],

        correct: 0
    },


    {
        question:
            "Why is it often better to test microfluidics systems at the component level (valves, pumps) rather than as a whole system?",

        answers: [
            "Full-system testing is too expensive",
            "Component-level testing is illegal",
            "Whole-system testing is always faster and cheaper",
            "Components cannot be tested individually"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 53 — CASE STUDY: WAFER-LEVEL MEMBRANE PACKAGING
======================================== */

const lesson53Questions = [

    {
        question:
            "What is the general name of this case-study packaging technique?",

        answers: [
            "Wafer-level MEMS packaging via thermally released metal-organic membranes",
            "Standard plastic injection overmolding",
            "Manual hand-soldering packaging",
            "Room-temperature adhesive bonding only"
        ],

        correct: 0
    },


    {
        question:
            "What does Phase 1 of this process form, and using what?",

        answers: [
            "A cavity, using a sacrificial layer",
            "A wire bond, using gold thread",
            "A solder bump, using tin",
            "A final metal seal, using copper"
        ],

        correct: 0
    },


    {
        question:
            "About what height range does the cavity formed in Phase 1 typically have?",

        answers: [
            "1 to 100 µm",
            "1 to 100 mm",
            "1 to 100 nm",
            "1 to 100 m"
        ],

        correct: 0
    },


    {
        question:
            "What kind of polymer is used to form the cap in Phase 2?",

        answers: [
            "A compliant, negative-tone, photo-definable polymer",
            "A rigid, opaque metal polymer",
            "A polymer that conducts electricity like copper",
            "A polymer that dissolves instantly in water"
        ],

        correct: 0
    },


    {
        question:
            "How are the bond pads opened in Phase 2?",

        answers: [
            "By patterning the polymer overcoat",
            "By manually drilling holes with a needle",
            "By submerging the wafer in acid for a week",
            "Bond pads are not opened in Phase 2"
        ],

        correct: 0
    },


    {
        question:
            "What happens during Phase 3 of this process?",

        answers: [
            "The sacrificial polymer thermally decomposes, forming the air cavity",
            "The wafer is diced into individual chips",
            "Wire bonding is performed",
            "The final metal layer is removed"
        ],

        correct: 0
    },


    {
        question:
            "What temperature range is used for the thermal decomposition in Phase 3?",

        answers: [
            "180 to 260°C",
            "0 to 10°C",
            "1000 to 2000°C",
            "-50 to 0°C"
        ],

        correct: 0
    },


    {
        question:
            "What does Phase 4 (metallization) accomplish, and why is a thin insulator layer needed?",

        answers: [
            "It creates a hermetic seal with a conformal metal coating; the insulator maintains isolation between the package and the MEMS device",
            "It removes the entire package to save weight",
            "It dissolves the MEMS device intentionally",
            "It converts the device into a purely optical component"
        ],

        correct: 0
    }

];

/* ========================================
   FAB CHALLENGE 54 — BUILD A PACKAGED MEMS DEVICE
======================================== */

const lesson54Questions = [

    {
        question:
            "Once a MEMS device is fabricated, what is the next general category of steps it must go through?",

        answers: [
            "Packaging (bonding, dicing, attach, interconnection, encapsulation, testing)",
            "Nothing further is needed after fabrication",
            "The device must be re-fabricated from scratch",
            "The device is immediately discarded"
        ],

        correct: 0
    },


    {
        question:
            "Which comes first in a typical packaging flow: die attach or wire bonding?",

        answers: [
            "Die attach",
            "Wire bonding",
            "They always happen at the exact same time",
            "Neither step is ever required"
        ],

        correct: 0
    },


    {
        question:
            "Why might a designer choose flip-chip bonding over wire bonding for a MEMS device?",

        answers: [
            "For better electrical/density performance, lower cost, and faster prototyping",
            "Because it requires far more wires than wire bonding",
            "Because it is always more expensive and slower",
            "Because it eliminates the need for a substrate entirely"
        ],

        correct: 0
    },


    {
        question:
            "Which wafer-bonding approach is well suited to creating a sealed vacuum reference for a pressure sensor?",

        answers: [
            "Wafer-level bonding, such as direct wafer bonding",
            "Wire bonding",
            "Flip-chip bonding",
            "Pick and place"
        ],

        correct: 0
    },


    {
        question:
            "In the metal-organic membrane case study, which phase actually forms the air cavity that lets the MEMS structure move freely?",

        answers: [
            "Phase 3, thermal decomposition of the sacrificial polymer",
            "Phase 1, cavity formation using a sacrificial layer",
            "Phase 2, polymer cap formation",
            "Phase 4, metallization"
        ],

        correct: 0
    },


    {
        question:
            "What is the final step before a packaged MEMS device ships to a customer?",

        answers: [
            "Final testing",
            "Wafer sawing",
            "Die attach",
            "Pick and place"
        ],

        correct: 0
    },


    {
        question:
            "Why does packaging matter just as much as the MEMS device's own fabrication?",

        answers: [
            "A poorly packaged device can fail from the environment even if the underlying structure was fabricated correctly",
            "Packaging has no real effect on a device's performance or lifetime",
            "Fabrication quality is irrelevant once packaging begins",
            "Packaging is always simpler and less important than fabrication"
        ],

        correct: 0
    },


    {
        question:
            "What overall theme connects wafer bonding, encapsulation, and the metal-organic membrane case study?",

        answers: [
            "Sealing a MEMS device's sensitive parts from the environment while still connecting it electrically to the outside world",
            "Making every MEMS device as large and heavy as possible",
            "Avoiding any form of electrical connection entirely",
            "Eliminating the need for any sacrificial layers"
        ],

        correct: 0
    }

];

function loadUnit1StudyModule() {

    const completeButton =
        document.getElementById("completeUnit1Button");


    if (!completeButton) {
        return;
    }


    const alreadyComplete =
        localStorage.getItem(
            "fabPathUnit1StudyComplete"
        ) === "true";


    if (alreadyComplete) {

        completeButton.textContent =
            "Module Complete ✓";
    }


    completeButton.addEventListener(
        "click",
        function () {

            localStorage.setItem(
                "fabPathUnit1StudyComplete",
                "true"
            );

            window.location.href =
                "learn.html";
        }
    );
}


loadUnit1StudyModule();

let lessonQuestions = [];
let currentLesson = 0;


if (window.location.pathname.includes("lesson1.html")) {

    lessonQuestions = lesson1Questions;
    currentLesson = 1;

}


if (window.location.pathname.includes("lesson2.html")) {

    lessonQuestions = lesson2Questions;
    currentLesson = 2;

}

if (window.location.pathname.includes("lesson3.html")) {

    lessonQuestions = lesson3Questions;
    currentLesson = 3;

}

if (window.location.pathname.includes("lesson4.html")) {

    lessonQuestions = lesson4Questions;
    currentLesson = 4;

}

if (window.location.pathname.includes("lesson5.html")) {

    lessonQuestions = lesson5Questions;
    currentLesson = 5;

}

if (window.location.pathname.includes("lesson6.html")) {
    lessonQuestions = lesson6Questions;
    currentLesson = 6;
}

if (window.location.pathname.includes("lesson7.html")) {
    lessonQuestions = lesson7Questions;
    currentLesson = 7;
}

if (window.location.pathname.includes("lesson8.html")) {
    lessonQuestions = lesson8Questions;
    currentLesson = 8;
}

if (window.location.pathname.includes("lesson9.html")) {

    lessonQuestions =
        lesson9Questions;

    currentLesson =
        9;
}

if (window.location.pathname.includes("lesson10.html")) {

    lessonQuestions =
        lesson10Questions;

    currentLesson =
        10;
}

if (window.location.pathname.includes("lesson11.html")) {

    lessonQuestions =
        lesson11Questions;

    currentLesson =
        11;
}

if (window.location.pathname.includes("lesson12.html")) {

    lessonQuestions =
        lesson12Questions;

    currentLesson =
        12;
}

if (window.location.pathname.includes("lesson13.html")) {

    lessonQuestions =
        lesson13Questions;

    currentLesson =
        13;
}

if (window.location.pathname.includes("lesson14.html")) {

    lessonQuestions =
        lesson14Questions;

    currentLesson =
        14;
}

if (window.location.pathname.includes("lesson15.html")) {

    lessonQuestions =
        lesson15Questions;

    currentLesson =
        15;
}

if (window.location.pathname.includes("lesson16.html")) {

    lessonQuestions =
        lesson16Questions;

    currentLesson =
        16;
}

if (window.location.pathname.includes("lesson17.html")) {

    lessonQuestions =
        lesson17Questions;

    currentLesson =
        17;
}

if (window.location.pathname.includes("lesson18.html")) {

    lessonQuestions =
        lesson18Questions;

    currentLesson =
        18;
}

if (window.location.pathname.includes("lesson19.html")) {

    lessonQuestions =
        lesson19Questions;

    currentLesson =
        19;
}

if (window.location.pathname.includes("lesson20.html")) {

    lessonQuestions =
        lesson20Questions;

    currentLesson =
        20;
}

if (window.location.pathname.includes("lesson21.html")) {

    lessonQuestions =
        lesson21Questions;

    currentLesson =
        21;
}

if (window.location.pathname.includes("lesson22.html")) {

    lessonQuestions =
        lesson22Questions;

    currentLesson =
        22;
}

if (window.location.pathname.includes("lesson23.html")) {

    lessonQuestions =
        lesson23Questions;

    currentLesson =
        23;
}

if (window.location.pathname.includes("lesson24.html")) {

    lessonQuestions =
        lesson24Questions;

    currentLesson =
        24;
}

if (window.location.pathname.includes("lesson25.html")) {

    lessonQuestions =
        lesson25Questions;

    currentLesson =
        25;
}

if (window.location.pathname.includes("lesson26.html")) {

    lessonQuestions =
        lesson26Questions;

    currentLesson =
        26;
}

if (window.location.pathname.includes("lesson27.html")) {

    lessonQuestions =
        lesson27Questions;

    currentLesson =
        27;
}

if (window.location.pathname.includes("lesson28.html")) {

    lessonQuestions =
        lesson28Questions;

    currentLesson =
        28;
}

if (window.location.pathname.includes("lesson29.html")) {

    lessonQuestions =
        lesson29Questions;

    currentLesson =
        29;
}

if (window.location.pathname.includes("lesson30.html")) {

    lessonQuestions =
        lesson30Questions;

    currentLesson =
        30;
}

if (window.location.pathname.includes("lesson31.html")) {

    lessonQuestions =
        lesson31Questions;

    currentLesson =
        31;
}

if (window.location.pathname.includes("lesson32.html")) {

    lessonQuestions =
        lesson32Questions;

    currentLesson =
        32;
}

if (window.location.pathname.includes("lesson33.html")) {

    lessonQuestions =
        lesson33Questions;

    currentLesson =
        33;
}

if (window.location.pathname.includes("lesson34.html")) {

    lessonQuestions =
        lesson34Questions;

    currentLesson =
        34;
}

if (window.location.pathname.includes("lesson35.html")) {

    lessonQuestions =
        lesson35Questions;

    currentLesson =
        35;
}

if (window.location.pathname.includes("lesson36.html")) {

    lessonQuestions =
        lesson36Questions;

    currentLesson =
        36;
}

if (window.location.pathname.includes("lesson37.html")) {

    lessonQuestions =
        lesson37Questions;

    currentLesson =
        37;
}

if (window.location.pathname.includes("lesson38.html")) {

    lessonQuestions =
        lesson38Questions;

    currentLesson =
        38;
}

if (window.location.pathname.includes("lesson39.html")) {

    lessonQuestions =
        lesson39Questions;

    currentLesson =
        39;
}

if (window.location.pathname.includes("lesson40.html")) {

    lessonQuestions =
        lesson40Questions;

    currentLesson =
        40;
}

if (window.location.pathname.includes("lesson41.html")) {

    lessonQuestions =
        lesson41Questions;

    currentLesson =
        41;
}

if (window.location.pathname.includes("lesson42.html")) {

    lessonQuestions =
        lesson42Questions;

    currentLesson =
        42;
}

if (window.location.pathname.includes("lesson43.html")) {

    lessonQuestions =
        lesson43Questions;

    currentLesson =
        43;
}

if (window.location.pathname.includes("lesson44.html")) {

    lessonQuestions =
        lesson44Questions;

    currentLesson =
        44;
}

if (window.location.pathname.includes("lesson45.html")) {

    lessonQuestions =
        lesson45Questions;

    currentLesson =
        45;
}

if (window.location.pathname.includes("lesson46.html")) {

    lessonQuestions =
        lesson46Questions;

    currentLesson =
        46;
}

if (window.location.pathname.includes("lesson47.html")) {

    lessonQuestions =
        lesson47Questions;

    currentLesson =
        47;
}

if (window.location.pathname.includes("lesson48.html")) {

    lessonQuestions =
        lesson48Questions;

    currentLesson =
        48;
}

if (window.location.pathname.includes("lesson49.html")) {

    lessonQuestions =
        lesson49Questions;

    currentLesson =
        49;
}

if (window.location.pathname.includes("lesson50.html")) {

    lessonQuestions =
        lesson50Questions;

    currentLesson =
        50;
}

if (window.location.pathname.includes("lesson51.html")) {

    lessonQuestions =
        lesson51Questions;

    currentLesson =
        51;
}

if (window.location.pathname.includes("lesson52.html")) {

    lessonQuestions =
        lesson52Questions;

    currentLesson =
        52;
}

if (window.location.pathname.includes("lesson53.html")) {

    lessonQuestions =
        lesson53Questions;

    currentLesson =
        53;
}

if (window.location.pathname.includes("lesson54.html")) {

    lessonQuestions =
        lesson54Questions;

    currentLesson =
        54;
}

let currentQuestion = 0;
let selectedAnswer = null;
let currentCorrectIndex = null;
let xp = 0;
let answerChecked = false;


function shuffleArray(array) {

    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


const questionText =
    document.getElementById("questionText");

const questionNumber =
    document.getElementById("questionNumber");

const answerGrid =
    document.getElementById("answerGrid");

const checkButton =
    document.getElementById("checkButton");

const feedbackMessage =
    document.getElementById("feedbackMessage");

const lessonProgress =
    document.getElementById("lessonProgress");

const xpDisplay =
    document.getElementById("xpDisplay");


function loadQuestion() {

    if (!questionText) {
        return;
    }

    const question =
        lessonQuestions[currentQuestion];

    questionText.textContent =
        question.question;

    questionNumber.textContent =
        `QUESTION ${currentQuestion + 1} OF ${lessonQuestions.length}`;

    answerGrid.innerHTML = "";

    const answerOrder =
        shuffleArray(
            question.answers.map((_, index) => index)
        );

    currentCorrectIndex =
        answerOrder.indexOf(question.correct);

    answerOrder.forEach((originalIndex, displayIndex) => {

        const button =
            document.createElement("button");

        button.className =
            "answer-button";

        button.textContent =
            question.answers[originalIndex];

        button.addEventListener("click", function () {

            if (answerChecked) {
                return;
            }

            document
                .querySelectorAll(".answer-button")
                .forEach(btn => {
                    btn.classList.remove("selected");
                });

            button.classList.add("selected");

            selectedAnswer = displayIndex;

            checkButton.disabled = false;

            feedbackMessage.textContent =
                "Ready to check your answer.";
        });

        answerGrid.appendChild(button);
    });


    const progress =
        ((currentQuestion + 1) /
        lessonQuestions.length) * 100;

    lessonProgress.style.width =
        `${progress}%`;

    checkButton.textContent =
        "Check Answer";

    checkButton.disabled = true;

    selectedAnswer = null;

    answerChecked = false;

    feedbackMessage.textContent =
        "Select an answer to continue.";
}


if (checkButton) {

    checkButton.addEventListener("click", function () {

        if (selectedAnswer === null) {
            return;
        }


        if (!answerChecked) {

            answerChecked = true;

            const question =
                lessonQuestions[currentQuestion];

            const buttons =
                document.querySelectorAll(
                    ".answer-button"
                );


            if (
                selectedAnswer ===
                currentCorrectIndex
            ) {

                buttons[selectedAnswer]
                    .classList.add("correct");

                feedbackMessage.textContent =
                    "Correct! +10 XP";

                xp += 10;

                xpDisplay.textContent =
                    xp;

            } else {

                buttons[selectedAnswer]
                    .classList.add("incorrect");

                buttons[currentCorrectIndex]
                    .classList.add("correct");

                feedbackMessage.textContent =
                    "Not quite. The correct answer is highlighted.";
            }


            if (
                currentQuestion ===
                lessonQuestions.length - 1
            ) {

                checkButton.textContent =
                    "Finish Fab Challenge";

            } else {

                checkButton.textContent =
                    "Continue";
            }

            return;
        }


        if (
            currentQuestion <
            lessonQuestions.length - 1
        ) {

            currentQuestion++;

            loadQuestion();

        } else {

const previousXP =
    parseInt(
        localStorage.getItem("fabPathXP")
    ) || 0;


const completionKey =
    `fabPathLesson${currentLesson}Complete`;


const lessonAlreadyComplete =
    localStorage.getItem(
        completionKey
    ) === "true";


if (!lessonAlreadyComplete) {

    localStorage.setItem(
        "fabPathXP",
        (previousXP + xp).toString()
    );
}


localStorage.setItem(
    completionKey,
    "true"
);


updateStreakOnLessonComplete();


window.location.href =
    "learn.html";

        }

    });
}


loadQuestion();

/* ========================================
   LEARN PAGE PROGRESS
======================================== */

/* ========================================
   COURSE HELPERS
======================================== */

function getLessonCompletionKey(lessonId) {

    return `fabPathLesson${lessonId}Complete`;
}


function getUnitStudyCompletionKey(unitId) {

    return `fabPathUnit${unitId}StudyComplete`;
}


function isLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            getLessonCompletionKey(lessonId)
        ) === "true"
    );
}


function isUnitStudyComplete(unitId) {

    return (
        localStorage.getItem(
            getUnitStudyCompletionKey(unitId)
        ) === "true"
    );
}


/* ========================================
   GET ALL LESSONS
======================================== */

function getAllLessons() {

    const lessons = [];

    courseData.forEach(function (unit) {

        unit.lessons.forEach(function (lesson) {

            lessons.push(lesson);
        });

    });

    return lessons;
}


/* ========================================
   COURSE PROGRESS
======================================== */

function getCompletedLessonCount() {

    const lessons =
        getAllLessons();

    let completed = 0;


    lessons.forEach(function (lesson) {

        if (isLessonComplete(lesson.id)) {

            completed++;
        }

    });


    return completed;
}


/* ========================================
   UNIT UNLOCKING
======================================== */

function isUnitUnlocked(unitIndex) {

    /*
        Unit 1 is always available.
    */

    if (unitIndex === 0) {

        return true;
    }


    const previousUnit =
        courseData[unitIndex - 1];


    const previousLessons =
        previousUnit.lessons;


    const finalLesson =
        previousLessons[
            previousLessons.length - 1
        ];


    return isLessonComplete(
        finalLesson.id
    );
}


/* ========================================
   LESSON UNLOCKING
======================================== */

function isLessonUnlocked(
    unit,
    lessonIndex
) {

    /*
        First lesson requires study
        module completion.
    */

    if (lessonIndex === 0) {

        return isUnitStudyComplete(
            unit.id
        );
    }


    /*
        Every later lesson requires
        previous lesson completion.
    */

    const previousLesson =
        unit.lessons[
            lessonIndex - 1
        ];


    return isLessonComplete(
        previousLesson.id
    );
}


/* ========================================
   CREATE STUDY MODULE NODE
======================================== */

function createStudyNode(
    unit,
    unitIndex
) {

    const complete =
        isUnitStudyComplete(unit.id);

    const unlocked =
        isUnitUnlocked(unitIndex);


    let statusClass =
        "locked";

    let icon =
        "🔒";

    let href =
        "#";


    if (complete) {

        statusClass =
            "complete";

        icon =
            "✓";

        href =
            unit.studyModule.href;

    } else if (unlocked) {

        statusClass =
            "available";

        icon =
            "📖";

        href =
            unit.studyModule.href;
    }


    return `
        <a
            href="${href}"
            class="path-node node-left ${statusClass} lesson-link"
        >

            <div class="node-circle">
                ${icon}
            </div>

            <div class="node-info">

                <span>
                    STUDY MODULE
                </span>

                <h3>
                    ${unit.studyModule.title}
                </h3>

                <p>
                    Learn the concepts you need
                    before beginning this unit.
                </p>

            </div>

        </a>

        <div class="vertical-path"></div>
    `;
}


/* ========================================
   CREATE LESSON NODE
======================================== */

function createLessonNode(
    unit,
    lesson,
    lessonIndex
) {

    const complete =
        isLessonComplete(
            lesson.id
        );

    const unlocked =
        isLessonUnlocked(
            unit,
            lessonIndex
        );


    let statusClass =
        "locked";

    let circleContent =
        "🔒";

    let href =
        "#";


    if (complete) {

        statusClass =
            "complete";

        circleContent =
            "✓";

        href =
            `lesson${lesson.id}.html`;

    } else if (unlocked) {

        statusClass =
            "available";

        circleContent =
            lesson.id;

        href =
            `lesson${lesson.id}.html`;
    }


    /*
        Automatically alternate
        left / right.
    */

    const positionClass =
        lessonIndex % 2 === 0
            ? "node-right"
            : "node-left";


    return `
        <a
            href="${href}"
            class="path-node ${positionClass} ${statusClass} lesson-link"
            id="lesson${lesson.id}Node"
        >

            <div
                class="node-circle"
                id="lesson${lesson.id}Circle"
            >
                ${circleContent}
            </div>

            <div class="node-info">

                <span>
                    LESSON ${lesson.id}
                </span>

                <h3>
                    ${lesson.title}
                </h3>

                <p>
                    ${lesson.description}
                </p>

            </div>

        </a>
    `;
}


/* ========================================
   BUILD LEARNING PATH
======================================== */

function renderLearningPath() {

    const learningPath =
        document.getElementById(
            "learningPath"
        );


    if (!learningPath) {

        return;
    }


    let html = "";


    courseData.forEach(
        function (unit, unitIndex) {


            /*
                UNIT BANNER
            */

            html += `
                <div class="unit-banner">

                    <span>
                        UNIT ${unit.id}
                    </span>

                    <h2>
                        ${unit.title}
                    </h2>

                    <p>
                        ${unit.description}
                    </p>

                </div>
            `;


            /*
                STUDY MODULE
            */

            html +=
                createStudyNode(
                    unit,
                    unitIndex
                );


            /*
                LESSONS
            */

            unit.lessons.forEach(
                function (
                    lesson,
                    lessonIndex
                ) {

                    html +=
                        createLessonNode(
                            unit,
                            lesson,
                            lessonIndex
                        );


                    const isLastLesson =
                        lessonIndex ===
                        unit.lessons.length - 1;


                    if (!isLastLesson) {

                        html += `
                            <div class="vertical-path"></div>
                        `;
                    }

                }
            );

        }
    );


    learningPath.innerHTML =
        html;


    updateCourseProgress();
}


/* ========================================
   UPDATE COURSE PROGRESS
======================================== */

function updateCourseProgress() {

    const progressFill =
        document.getElementById(
            "courseProgressFill"
        );

    const progressText =
        document.getElementById(
            "courseProgressText"
        );


    const totalLessons =
        getAllLessons().length;


    const completedLessons =
        getCompletedLessonCount();


    const percent =
        totalLessons === 0
            ? 0
            : Math.round(
                (
                    completedLessons /
                    totalLessons
                ) * 100
            );


    if (progressFill) {

        progressFill.style.width =
            `${percent}%`;
    }


    if (progressText) {

        progressText.textContent =
            `${percent}% complete`;
    }
}


renderLearningPath();

/* ========================================
   LEARN PAGE PROGRESS
   Units 1 and 2
======================================== */

function loadLearnPageProgress() {

    const totalXPDisplay =
        document.getElementById("totalXPDisplay");

    const courseProgressFill =
        document.getElementById("courseProgressFill");

    const courseProgressText =
        document.getElementById("courseProgressText");


    /* =====================================
       XP
    ===================================== */

    const savedXP =
        parseInt(
            localStorage.getItem("fabPathXP")
        ) || 0;

    if (totalXPDisplay) {
        totalXPDisplay.textContent =
            savedXP;
    }


    /* =====================================
       HELPERS
    ===================================== */

    function lessonComplete(id) {

        return (
            localStorage.getItem(
                `fabPathLesson${id}Complete`
            ) === "true"
        );
    }


    function unlockLesson(id) {

        const node =
            document.getElementById(
                `lesson${id}Node`
            );

        const circle =
            document.getElementById(
                `lesson${id}Circle`
            );


        if (!node || !circle) {
            return;
        }


        /*
            Don't overwrite a completed lesson.
        */

        if (lessonComplete(id)) {
            return;
        }


        node.classList.remove("locked");
        node.classList.add("available");

        node.href =
            `lesson${id}.html`;

        circle.textContent =
            id;
    }


    function completeLessonNode(id) {

        const node =
            document.getElementById(
                `lesson${id}Node`
            );

        const circle =
            document.getElementById(
                `lesson${id}Circle`
            );


        if (!node || !circle) {
            return;
        }


        node.classList.remove(
            "locked",
            "available"
        );

        node.classList.add("complete");

        node.href =
            `lesson${id}.html`;

        circle.textContent =
            "✓";
    }


    /* =====================================
       COMPLETED LESSONS
    ===================================== */

    let completedLessons = 0;


    for (let id = 1; id <= 8; id++) {

        if (lessonComplete(id)) {

            completedLessons++;

            completeLessonNode(id);
        }

    }


    /* =====================================
       UNIT 1 STUDY MODULE
    ===================================== */

    const unit1StudyComplete =
        localStorage.getItem(
            "fabPathUnit1StudyComplete"
        ) === "true";


    const unit1StudyNode =
        document.getElementById(
            "unit1StudyNode"
        );

    const unit1StudyCircle =
        document.getElementById(
            "unit1StudyCircle"
        );


    if (unit1StudyComplete) {

        if (unit1StudyNode) {

            unit1StudyNode.classList.remove(
                "locked",
                "available"
            );

            unit1StudyNode.classList.add(
                "complete"
            );

            unit1StudyNode.href =
                "unit1.html";
        }


        if (unit1StudyCircle) {

            unit1StudyCircle.textContent =
                "✓";
        }


        unlockLesson(1);
    }


    /* =====================================
       UNIT 1 LESSON CHAIN
    ===================================== */

    if (lessonComplete(1)) {
        unlockLesson(2);
    }

    if (lessonComplete(2)) {
        unlockLesson(3);
    }

    if (lessonComplete(3)) {
        unlockLesson(4);
    }


    /* =====================================
       UNIT 2 STUDY MODULE
    ===================================== */

    const unit2StudyNode =
        document.getElementById(
            "unit2StudyNode"
        );

    const unit2StudyCircle =
        document.getElementById(
            "unit2StudyCircle"
        );

    const unit2StudyComplete =
        localStorage.getItem(
            "fabPathUnit2StudyComplete"
        ) === "true";


    /*
        Lesson 4 unlocks Unit 2.
    */

    if (
        lessonComplete(4) &&
        !unit2StudyComplete
    ) {

        if (unit2StudyNode) {

            unit2StudyNode.classList.remove(
                "locked"
            );

            unit2StudyNode.classList.add(
                "available"
            );

            unit2StudyNode.href =
                "unit2.html";
        }


        if (unit2StudyCircle) {

            unit2StudyCircle.textContent =
                "📖";
        }

    }


    if (unit2StudyComplete) {

        if (unit2StudyNode) {

            unit2StudyNode.classList.remove(
                "locked",
                "available"
            );

            unit2StudyNode.classList.add(
                "complete"
            );

            unit2StudyNode.href =
                "unit2.html";
        }


        if (unit2StudyCircle) {

            unit2StudyCircle.textContent =
                "✓";
        }


        unlockLesson(5);
    }


    /* =====================================
       UNIT 2 LESSON CHAIN
    ===================================== */

    if (lessonComplete(5)) {
        unlockLesson(6);
    }

    if (lessonComplete(6)) {
        unlockLesson(7);
    }

    if (lessonComplete(7)) {
        unlockLesson(8);
    }


    /* =====================================
       COURSE PROGRESS
    ===================================== */

    let totalLessons = 8;


    /*
        Once course-data.js exists,
        use the real total automatically.
    */

    if (typeof courseData !== "undefined") {

        totalLessons =
            courseData.reduce(
                function (total, unit) {

                    return (
                        total +
                        unit.lessons.length
                    );
                },
                0
            );
    }


    const percent =
        Math.round(
            (
                completedLessons /
                totalLessons
            ) * 100
        );


    if (courseProgressFill) {

        courseProgressFill.style.width =
            `${percent}%`;
    }


    if (courseProgressText) {

        courseProgressText.textContent =
            `${percent}% complete`;
    }

}


loadLearnPageProgress();

/* ========================================
   FAB PATH STREAK SYSTEM
======================================== */

function getTodayKey() {

    const today = new Date();

    const year = today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getDaysBetween(date1, date2) {

    const first =
        new Date(date1 + "T00:00:00");

    const second =
        new Date(date2 + "T00:00:00");

    const difference =
        second - first;

    return Math.round(
        difference / (1000 * 60 * 60 * 24)
    );
}


function updateStreakOnLessonComplete() {

    const today =
        getTodayKey();


    const lastActiveDate =
        localStorage.getItem(
            "fabPathLastActiveDate"
        );


    let streak =
        parseInt(
            localStorage.getItem(
                "fabPathStreak"
            )
        ) || 0;


    // First day ever using Fab Path

    if (!lastActiveDate) {

        streak = 1;

    } else {

        const daysApart =
            getDaysBetween(
                lastActiveDate,
                today
            );


        // Already completed something today

        if (daysApart === 0) {

            return streak;
        }


        // Consecutive day

        if (daysApart === 1) {

            streak++;

        } else {

            // Missed at least one day

            streak = 1;
        }
    }


    localStorage.setItem(
        "fabPathStreak",
        streak.toString()
    );


    localStorage.setItem(
        "fabPathLastActiveDate",
        today
    );


    return streak;
}
function loadFabPathStats() {

    const streakDisplay =
        document.getElementById(
            "streakDisplay"
        );


    const totalXPDisplay =
        document.getElementById(
            "totalXPDisplay"
        );


    let streak =
        parseInt(
            localStorage.getItem(
                "fabPathStreak"
            )
        ) || 0;


    const lastActiveDate =
        localStorage.getItem(
            "fabPathLastActiveDate"
        );


    const today =
        getTodayKey();


    /*
       If the learner has missed more
       than one full day, show 0.
    */

    if (lastActiveDate) {

        const daysApart =
            getDaysBetween(
                lastActiveDate,
                today
            );


        if (daysApart > 1) {

            streak = 0;

            localStorage.setItem(
                "fabPathStreak",
                "0"
            );
        }
    }


    const xp =
        parseInt(
            localStorage.getItem(
                "fabPathXP"
            )
        ) || 0;


    if (streakDisplay) {

        streakDisplay.textContent =
            streak;
    }


    if (totalXPDisplay) {

        totalXPDisplay.textContent =
            xp;
    }
}


loadFabPathStats();

/* ========================================
   PRACTICE PAGE
======================================== */

function loadPracticePage() {

    const lesson1Practice =
        document.getElementById(
            "practiceLesson1"
        );

    const lesson2Practice =
        document.getElementById(
            "practiceLesson2"
        );

    const lesson3Practice =
        document.getElementById(
            "practiceLesson3"
        );
    const lesson4Practice =
        document.getElementById(
            "practiceLesson4"
        );

    // Only run on Practice page
    if (!lesson1Practice) {
        return;
    }


    const lesson1Complete =
        localStorage.getItem(
            "fabPathLesson1Complete"
        ) === "true";

    const lesson2Complete =
        localStorage.getItem(
            "fabPathLesson2Complete"
        ) === "true";

    const lesson3Complete =
        localStorage.getItem(
            "fabPathLesson3Complete"
        ) === "true";
    
        const lesson4Complete =
        localStorage.getItem(
            "fabPathLesson4Complete"
        ) === "true";

    if (!lesson1Complete) {

        lesson1Practice.style.display =
            "none";
    }


    if (
        lesson2Complete &&
        lesson2Practice
    ) {

        lesson2Practice.classList.remove(
            "locked-practice"
        );
    }


    if (
        lesson3Complete &&
        lesson3Practice
    ) {

        lesson3Practice.classList.remove(
            "locked-practice"
        );
    }
    if (
        lesson4Complete &&
        lesson4Practice
    ) {

        lesson4Practice.classList.remove(
            "locked-practice"
    );
    }

}


loadPracticePage();
/* ========================================
   PROGRESS PAGE
======================================== */

function loadProgressPage() {

    const progressXP =
        document.getElementById(
            "progressXP"
        );


    if (!progressXP) {
        return;
    }


    const xp =
        parseInt(
            localStorage.getItem(
                "fabPathXP"
            )
        ) || 0;


    const streak =
        parseInt(
            localStorage.getItem(
                "fabPathStreak"
            )
        ) || 0;


    const completedLessons =
        getCompletedLessonCount();

    const totalLessons =
        getAllLessons().length;

    const percent =
        totalLessons === 0
            ? 0
            : Math.round(
                (completedLessons / totalLessons) * 100
            );


    document.getElementById(
        "progressXP"
    ).textContent = xp;


    document.getElementById(
        "progressStreak"
    ).textContent = streak;


    document.getElementById(
        "lessonsCompleted"
    ).textContent =
        completedLessons;


    document.getElementById(
        "progressPercent"
    ).textContent =
        `${percent}%`;
}


loadProgressPage();

function renderUnit3() {

    const container =
        document.getElementById("unit3Container");

    if (!container) {
        return;
    }

    const unit =
        courseData.find(function (item) {
            return item.id === 3;
        });

    if (!unit) {
        return;
    }

    const unitUnlocked =
        localStorage.getItem("fabPathLesson8Complete") === "true";

    const studyComplete =
        localStorage.getItem("fabPathUnit3StudyComplete") === "true";

    let html = `
        <div class="unit-banner">
            <span>UNIT 3</span>
            <h2>${unit.title}</h2>
            <p>${unit.description}</p>
        </div>
    `;

    let studyClass = "locked";
    let studyIcon = "🔒";
    let studyHref = "#";

    if (studyComplete) {
        studyClass = "complete";
        studyIcon = "✓";
        studyHref = unit.studyModule.href;
    } else if (unitUnlocked) {
        studyClass = "available";
        studyIcon = "📖";
        studyHref = unit.studyModule.href;
    }

    html += `
        <a href="${studyHref}"
           class="path-node node-left ${studyClass} lesson-link">

            <div class="node-circle">
                ${studyIcon}
            </div>

            <div class="node-info">
                <span>STUDY MODULE</span>
                <h3>${unit.studyModule.title}</h3>
                <p>Learn the concepts before beginning Unit 3.</p>
            </div>

        </a>

        <div class="vertical-path"></div>
    `;

    unit.lessons.forEach(function (lesson, index) {

        const lessonComplete =
            localStorage.getItem(
                `fabPathLesson${lesson.id}Complete`
            ) === "true";

        let unlocked = false;

        if (index === 0) {
            unlocked = studyComplete;
        } else {
            const previousLesson =
                unit.lessons[index - 1];

            unlocked =
                localStorage.getItem(
                    `fabPathLesson${previousLesson.id}Complete`
                ) === "true";
        }

        let statusClass = "locked";
        let icon = "🔒";
        let href = "#";

        if (lessonComplete) {
            statusClass = "complete";
            icon = "✓";
            href = `lesson${lesson.id}.html`;
        } else if (unlocked) {
            statusClass = "available";
            icon = lesson.id;
            href = `lesson${lesson.id}.html`;
        }

        const positionClass =
            index % 2 === 0
                ? "node-right"
                : "node-left";

        html += `
            <a href="${href}"
               class="path-node ${positionClass} ${statusClass} lesson-link"
               id="lesson${lesson.id}Node">

                <div class="node-circle"
                     id="lesson${lesson.id}Circle">
                    ${icon}
                </div>

                <div class="node-info">
                    <span>FAB CHALLENGE ${lesson.id}</span>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                </div>

            </a>
        `;

        if (index < unit.lessons.length - 1) {
            html += `
                <div class="vertical-path"></div>
            `;
        }

    });

    container.innerHTML = html;
}

renderUnit3();

function renderUnit4() {

    const container =
        document.getElementById("unit4Container");

    if (!container) {
        return;
    }

    const unit =
        courseData.find(function (item) {
            return item.id === 4;
        });

    if (!unit) {
        return;
    }

    const unitUnlocked =
        localStorage.getItem("fabPathLesson19Complete") === "true";

    const studyComplete =
        localStorage.getItem("fabPathUnit4StudyComplete") === "true";

    let html = `
        <div class="unit-banner">
            <span>UNIT 4</span>
            <h2>${unit.title}</h2>
            <p>${unit.description}</p>
        </div>
    `;

    let studyClass = "locked";
    let studyIcon = "🔒";
    let studyHref = "#";

    if (studyComplete) {
        studyClass = "complete";
        studyIcon = "✓";
        studyHref = unit.studyModule.href;
    } else if (unitUnlocked) {
        studyClass = "available";
        studyIcon = "📖";
        studyHref = unit.studyModule.href;
    }

    html += `
        <a href="${studyHref}"
           class="path-node node-left ${studyClass} lesson-link">

            <div class="node-circle">
                ${studyIcon}
            </div>

            <div class="node-info">
                <span>STUDY MODULE</span>
                <h3>${unit.studyModule.title}</h3>
                <p>Learn the concepts before beginning Unit 4.</p>
            </div>

        </a>

        <div class="vertical-path"></div>
    `;

    unit.lessons.forEach(function (lesson, index) {

        const lessonComplete =
            localStorage.getItem(
                `fabPathLesson${lesson.id}Complete`
            ) === "true";

        let unlocked = false;

        if (index === 0) {
            unlocked = studyComplete;
        } else {
            const previousLesson =
                unit.lessons[index - 1];

            unlocked =
                localStorage.getItem(
                    `fabPathLesson${previousLesson.id}Complete`
                ) === "true";
        }

        let statusClass = "locked";
        let icon = "🔒";
        let href = "#";

        if (lessonComplete) {
            statusClass = "complete";
            icon = "✓";
            href = `lesson${lesson.id}.html`;
        } else if (unlocked) {
            statusClass = "available";
            icon = lesson.id;
            href = `lesson${lesson.id}.html`;
        }

        const positionClass =
            index % 2 === 0
                ? "node-right"
                : "node-left";

        html += `
            <a href="${href}"
               class="path-node ${positionClass} ${statusClass} lesson-link"
               id="lesson${lesson.id}Node">

                <div class="node-circle"
                     id="lesson${lesson.id}Circle">
                    ${icon}
                </div>

                <div class="node-info">
                    <span>FAB CHALLENGE ${lesson.id}</span>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                </div>

            </a>
        `;

        if (index < unit.lessons.length - 1) {
            html += `
                <div class="vertical-path"></div>
            `;
        }

    });

    container.innerHTML = html;
}

renderUnit4();

function renderUnit5() {

    const container =
        document.getElementById("unit5Container");

    if (!container) {
        return;
    }

    const unit =
        courseData.find(function (item) {
            return item.id === 5;
        });

    if (!unit) {
        return;
    }

    const unitUnlocked =
        localStorage.getItem("fabPathLesson26Complete") === "true";

    const studyComplete =
        localStorage.getItem("fabPathUnit5StudyComplete") === "true";

    let html = `
        <div class="unit-banner">
            <span>UNIT 5</span>
            <h2>${unit.title}</h2>
            <p>${unit.description}</p>
        </div>
    `;

    let studyClass = "locked";
    let studyIcon = "🔒";
    let studyHref = "#";

    if (studyComplete) {
        studyClass = "complete";
        studyIcon = "✓";
        studyHref = unit.studyModule.href;
    } else if (unitUnlocked) {
        studyClass = "available";
        studyIcon = "📖";
        studyHref = unit.studyModule.href;
    }

    html += `
        <a href="${studyHref}"
           class="path-node node-left ${studyClass} lesson-link">

            <div class="node-circle">
                ${studyIcon}
            </div>

            <div class="node-info">
                <span>STUDY MODULE</span>
                <h3>${unit.studyModule.title}</h3>
                <p>Learn the concepts before beginning Unit 5.</p>
            </div>

        </a>

        <div class="vertical-path"></div>
    `;

    unit.lessons.forEach(function (lesson, index) {

        const lessonComplete =
            localStorage.getItem(
                `fabPathLesson${lesson.id}Complete`
            ) === "true";

        let unlocked = false;

        if (index === 0) {
            unlocked = studyComplete;
        } else {
            const previousLesson =
                unit.lessons[index - 1];

            unlocked =
                localStorage.getItem(
                    `fabPathLesson${previousLesson.id}Complete`
                ) === "true";
        }

        let statusClass = "locked";
        let icon = "🔒";
        let href = "#";

        if (lessonComplete) {
            statusClass = "complete";
            icon = "✓";
            href = `lesson${lesson.id}.html`;
        } else if (unlocked) {
            statusClass = "available";
            icon = lesson.id;
            href = `lesson${lesson.id}.html`;
        }

        const positionClass =
            index % 2 === 0
                ? "node-right"
                : "node-left";

        html += `
            <a href="${href}"
               class="path-node ${positionClass} ${statusClass} lesson-link"
               id="lesson${lesson.id}Node">

                <div class="node-circle"
                     id="lesson${lesson.id}Circle">
                    ${icon}
                </div>

                <div class="node-info">
                    <span>FAB CHALLENGE ${lesson.id}</span>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                </div>

            </a>
        `;

        if (index < unit.lessons.length - 1) {
            html += `
                <div class="vertical-path"></div>
            `;
        }

    });

    container.innerHTML = html;
}

renderUnit5();

function renderUnit6() {

    const container =
        document.getElementById("unit6Container");

    if (!container) {
        return;
    }

    const unit =
        courseData.find(function (item) {
            return item.id === 6;
        });

    if (!unit) {
        return;
    }

    const unitUnlocked =
        localStorage.getItem("fabPathLesson33Complete") === "true";

    const studyComplete =
        localStorage.getItem("fabPathUnit6StudyComplete") === "true";

    let html = `
        <div class="unit-banner">
            <span>UNIT 6</span>
            <h2>${unit.title}</h2>
            <p>${unit.description}</p>
        </div>
    `;

    let studyClass = "locked";
    let studyIcon = "🔒";
    let studyHref = "#";

    if (studyComplete) {
        studyClass = "complete";
        studyIcon = "✓";
        studyHref = unit.studyModule.href;
    } else if (unitUnlocked) {
        studyClass = "available";
        studyIcon = "📖";
        studyHref = unit.studyModule.href;
    }

    html += `
        <a href="${studyHref}"
           class="path-node node-left ${studyClass} lesson-link">

            <div class="node-circle">
                ${studyIcon}
            </div>

            <div class="node-info">
                <span>STUDY MODULE</span>
                <h3>${unit.studyModule.title}</h3>
                <p>Learn the concepts before beginning Unit 6.</p>
            </div>

        </a>

        <div class="vertical-path"></div>
    `;

    unit.lessons.forEach(function (lesson, index) {

        const lessonComplete =
            localStorage.getItem(
                `fabPathLesson${lesson.id}Complete`
            ) === "true";

        let unlocked = false;

        if (index === 0) {
            unlocked = studyComplete;
        } else {
            const previousLesson =
                unit.lessons[index - 1];

            unlocked =
                localStorage.getItem(
                    `fabPathLesson${previousLesson.id}Complete`
                ) === "true";
        }

        let statusClass = "locked";
        let icon = "🔒";
        let href = "#";

        if (lessonComplete) {
            statusClass = "complete";
            icon = "✓";
            href = `lesson${lesson.id}.html`;
        } else if (unlocked) {
            statusClass = "available";
            icon = lesson.id;
            href = `lesson${lesson.id}.html`;
        }

        const positionClass =
            index % 2 === 0
                ? "node-right"
                : "node-left";

        html += `
            <a href="${href}"
               class="path-node ${positionClass} ${statusClass} lesson-link"
               id="lesson${lesson.id}Node">

                <div class="node-circle"
                     id="lesson${lesson.id}Circle">
                    ${icon}
                </div>

                <div class="node-info">
                    <span>FAB CHALLENGE ${lesson.id}</span>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                </div>

            </a>
        `;

        if (index < unit.lessons.length - 1) {
            html += `
                <div class="vertical-path"></div>
            `;
        }

    });

    container.innerHTML = html;
}

renderUnit6();

function renderUnit7() {

    const container =
        document.getElementById("unit7Container");

    if (!container) {
        return;
    }

    const unit =
        courseData.find(function (item) {
            return item.id === 7;
        });

    if (!unit) {
        return;
    }

    const unitUnlocked =
        localStorage.getItem("fabPathLesson40Complete") === "true";

    const studyComplete =
        localStorage.getItem("fabPathUnit7StudyComplete") === "true";

    let html = `
        <div class="unit-banner">
            <span>UNIT 7</span>
            <h2>${unit.title}</h2>
            <p>${unit.description}</p>
        </div>
    `;

    let studyClass = "locked";
    let studyIcon = "🔒";
    let studyHref = "#";

    if (studyComplete) {
        studyClass = "complete";
        studyIcon = "✓";
        studyHref = unit.studyModule.href;
    } else if (unitUnlocked) {
        studyClass = "available";
        studyIcon = "📖";
        studyHref = unit.studyModule.href;
    }

    html += `
        <a href="${studyHref}"
           class="path-node node-left ${studyClass} lesson-link">

            <div class="node-circle">
                ${studyIcon}
            </div>

            <div class="node-info">
                <span>STUDY MODULE</span>
                <h3>${unit.studyModule.title}</h3>
                <p>Learn the concepts before beginning Unit 7.</p>
            </div>

        </a>

        <div class="vertical-path"></div>
    `;

    unit.lessons.forEach(function (lesson, index) {

        const lessonComplete =
            localStorage.getItem(
                `fabPathLesson${lesson.id}Complete`
            ) === "true";

        let unlocked = false;

        if (index === 0) {
            unlocked = studyComplete;
        } else {
            const previousLesson =
                unit.lessons[index - 1];

            unlocked =
                localStorage.getItem(
                    `fabPathLesson${previousLesson.id}Complete`
                ) === "true";
        }

        let statusClass = "locked";
        let icon = "🔒";
        let href = "#";

        if (lessonComplete) {
            statusClass = "complete";
            icon = "✓";
            href = `lesson${lesson.id}.html`;
        } else if (unlocked) {
            statusClass = "available";
            icon = lesson.id;
            href = `lesson${lesson.id}.html`;
        }

        const positionClass =
            index % 2 === 0
                ? "node-right"
                : "node-left";

        html += `
            <a href="${href}"
               class="path-node ${positionClass} ${statusClass} lesson-link"
               id="lesson${lesson.id}Node">

                <div class="node-circle"
                     id="lesson${lesson.id}Circle">
                    ${icon}
                </div>

                <div class="node-info">
                    <span>FAB CHALLENGE ${lesson.id}</span>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                </div>

            </a>
        `;

        if (index < unit.lessons.length - 1) {
            html += `
                <div class="vertical-path"></div>
            `;
        }

    });

    container.innerHTML = html;
}

renderUnit7();

function renderUnit8() {

    const container =
        document.getElementById("unit8Container");

    if (!container) {
        return;
    }

    const unit =
        courseData.find(function (item) {
            return item.id === 8;
        });

    if (!unit) {
        return;
    }

    const unitUnlocked =
        localStorage.getItem("fabPathLesson47Complete") === "true";

    const studyComplete =
        localStorage.getItem("fabPathUnit8StudyComplete") === "true";

    let html = `
        <div class="unit-banner">
            <span>UNIT 8</span>
            <h2>${unit.title}</h2>
            <p>${unit.description}</p>
        </div>
    `;

    let studyClass = "locked";
    let studyIcon = "🔒";
    let studyHref = "#";

    if (studyComplete) {
        studyClass = "complete";
        studyIcon = "✓";
        studyHref = unit.studyModule.href;
    } else if (unitUnlocked) {
        studyClass = "available";
        studyIcon = "📖";
        studyHref = unit.studyModule.href;
    }

    html += `
        <a href="${studyHref}"
           class="path-node node-left ${studyClass} lesson-link">

            <div class="node-circle">
                ${studyIcon}
            </div>

            <div class="node-info">
                <span>STUDY MODULE</span>
                <h3>${unit.studyModule.title}</h3>
                <p>Learn the concepts before beginning Unit 8.</p>
            </div>

        </a>

        <div class="vertical-path"></div>
    `;

    unit.lessons.forEach(function (lesson, index) {

        const lessonComplete =
            localStorage.getItem(
                `fabPathLesson${lesson.id}Complete`
            ) === "true";

        let unlocked = false;

        if (index === 0) {
            unlocked = studyComplete;
        } else {
            const previousLesson =
                unit.lessons[index - 1];

            unlocked =
                localStorage.getItem(
                    `fabPathLesson${previousLesson.id}Complete`
                ) === "true";
        }

        let statusClass = "locked";
        let icon = "🔒";
        let href = "#";

        if (lessonComplete) {
            statusClass = "complete";
            icon = "✓";
            href = `lesson${lesson.id}.html`;
        } else if (unlocked) {
            statusClass = "available";
            icon = lesson.id;
            href = `lesson${lesson.id}.html`;
        }

        const positionClass =
            index % 2 === 0
                ? "node-right"
                : "node-left";

        html += `
            <a href="${href}"
               class="path-node ${positionClass} ${statusClass} lesson-link"
               id="lesson${lesson.id}Node">

                <div class="node-circle"
                     id="lesson${lesson.id}Circle">
                    ${icon}
                </div>

                <div class="node-info">
                    <span>FAB CHALLENGE ${lesson.id}</span>
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                </div>

            </a>
        `;

        if (index < unit.lessons.length - 1) {
            html += `
                <div class="vertical-path"></div>
            `;
        }

    });

    container.innerHTML = html;
}

renderUnit8();

/* ========================================
   GAMES HUB PAGE
======================================== */

function loadGamesPage() {

    const game1Card =
        document.getElementById("game1Card");

    if (!game1Card) {
        return;
    }

    const game1Badge =
        document.getElementById("game1Badge");

    const game1CTA =
        document.getElementById("game1CTA");

    const lesson4Complete =
        localStorage.getItem(
            "fabPathLesson4Complete"
        ) === "true";

    if (lesson4Complete) {

        game1Card.classList.remove("locked");
        game1Card.classList.add("playable");

        game1Card.href =
            "game1.html";

        if (game1Badge) {

            game1Badge.textContent =
                "PLAY";
        }

        if (game1CTA) {

            game1CTA.textContent =
                "Play now →";
        }
    }


    const game2Card =
        document.getElementById("game2Card");

    if (game2Card) {

        const game2Badge =
            document.getElementById("game2Badge");

        const game2CTA =
            document.getElementById("game2CTA");

        const lesson8Complete =
            localStorage.getItem(
                "fabPathLesson8Complete"
            ) === "true";

        if (lesson8Complete) {

            game2Card.classList.remove("locked");
            game2Card.classList.add("playable");

            game2Card.href =
                "game2.html";

            if (game2Badge) {

                game2Badge.textContent =
                    "PLAY";
            }

            if (game2CTA) {

                game2CTA.textContent =
                    "Play now →";
            }
        }
    }


    const game3Card =
        document.getElementById("game3Card");

    if (game3Card) {

        const game3Badge =
            document.getElementById("game3Badge");

        const game3CTA =
            document.getElementById("game3CTA");

        const lesson19Complete =
            localStorage.getItem(
                "fabPathLesson19Complete"
            ) === "true";

        if (lesson19Complete) {

            game3Card.classList.remove("locked");
            game3Card.classList.add("playable");

            game3Card.href =
                "game3.html";

            if (game3Badge) {

                game3Badge.textContent =
                    "PLAY";
            }

            if (game3CTA) {

                game3CTA.textContent =
                    "Play now →";
            }
        }
    }


    const game4Card =
        document.getElementById("game4Card");

    if (game4Card) {

        const game4Badge =
            document.getElementById("game4Badge");

        const game4CTA =
            document.getElementById("game4CTA");

        const lesson26Complete =
            localStorage.getItem(
                "fabPathLesson26Complete"
            ) === "true";

        if (lesson26Complete) {

            game4Card.classList.remove("locked");
            game4Card.classList.add("playable");

            game4Card.href =
                "game4.html";

            if (game4Badge) {

                game4Badge.textContent =
                    "PLAY";
            }

            if (game4CTA) {

                game4CTA.textContent =
                    "Play now →";
            }
        }
    }
}

loadGamesPage();
