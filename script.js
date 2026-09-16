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
            "Which of these is a real accelerometer application mentioned in the lecture?",

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
            "About what is the noise floor of the ADXL accelerometer discussed in the lecture?",

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
