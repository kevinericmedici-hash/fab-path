/* ========================================
   MATH FORMATTING
   Turns plain-text notation into real
   subscripts and superscripts:

     x_static  ->  x<sub>static</sub>
     C_{ox}    ->  C<sub>ox</sub>
     n^(3/2)   ->  n<sup>3/2</sup>

   The text is HTML-escaped first, so the
   result is safe to assign to innerHTML.
   Only a one- or two-letter symbol right
   before the underscore counts, so names
   like POLY1_POLY2_VIA are left alone.
======================================== */

function fabFormatMath(text) {

    const escaped =
        String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    return escaped
        .replace(
            /(^|[^A-Za-z0-9])([A-Za-z\u0391-\u03C9]{1,2})_(?:\{([^}]+)\}|([A-Za-z0-9]+))/g,
            function (match, before, base, braced, plain) {
                return `${before}${base}<sub>${braced || plain}</sub>`;
            }
        )
        .replace(
            /\^(?:\(([^)]+)\)|\{([^}]+)\}|([-\u2212+]?[A-Za-z0-9.]+))/g,
            function (match, paren, braced, plain) {
                return `<sup>${paren || braced || plain}</sup>`;
            }
        );
}


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
            "A microscale device combining mechanical and electrical parts",
            "A software-only simulation of a mechanical machine",
            "A type of high-voltage transformer used on power lines"
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
            "Centimeters",
            "Micrometers",
            "Nautical miles"
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
            "Physical forces scale differently at smaller sizes",
            "Microscale devices stop obeying the laws of physics",
            "Electrical forces vanish entirely at small scales",
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
            "It stays the same",
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
            "Because electrostatic effects stay significant as sizes shrink",
            "Because gravity becomes far stronger as devices get smaller",
            "Because electric charge cannot exist at very small scales",
            "Because all materials turn magnetic below a few microns"
        ],
        correct: 0
    },

    {
        question: "Which force generally becomes less dominant relative to surface forces as devices become smaller?",
        answers: [
            "Electrostatic force",
            "Surface adhesion force",
            "Gravitational force",
            "Capillary force"
        ],
        correct: 2
    },

    {
        question: "Why are scaling laws important in MEMS design?",
        answers: [
            "They predict which physical effects grow or shrink in importance",
            "They eliminate the need for detailed engineering calculations",
            "They only matter for the design of very large machines",
            "They make all microscale devices behave in identical ways"
        ],
        correct: 0
    }

];

const lesson4Questions = [

    {
        question: "Which is a common MEMS application?",
        answers: [
            "Accelerometers in smartphones",
            "Steel bridge support beams",
            "Large hydraulic cylinders",
            "Large industrial storage tanks"
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
            "Large steel turbine blade",
            "Structural steel I-beam",
            "Large hydraulic piston"
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
            "Angular rotation rate",
            "Chemical concentration",
            "Fluid viscosity changes",
            "Surface roughness levels"
        ],
        correct: 0
    },

    {
        question: "Why are MEMS useful in consumer electronics?",
        answers: [
            "They provide sensing and actuation in tiny packages",
            "They always require large mechanical assemblies",
            "They cannot be mass-produced at any reasonable cost",
            "They only operate above several hundred degrees"
        ],
        correct: 0
    }

];

const lesson5Questions = [

    {
        question: "Why are cleanrooms used in microfabrication?",
        answers: [
            "To reduce contamination that damages small features",
            "To keep the room colder for equipment and staff",
            "To remove the need for personal protective equipment",
            "To increase mechanical vibration during processing"
        ],
        correct: 0
    },

    {
        question: "What is one of the main contaminants controlled in a cleanroom?",
        answers: [
            "Airborne particles",
            "Sunlight from windows",
            "Loud sound waves",
            "Earth's gravity"
        ],
        correct: 0
    },

    {
        question: "Why can a small particle be a serious problem during MEMS fabrication?",
        answers: [
            "It may be comparable in size to critical device features",
            "It always melts the silicon it lands on instantly",
            "It significantly increases the overall wafer thickness",
            "It automatically changes the silicon crystal orientation"
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
            "Moving carefully and limiting particle generation",
            "Hurrying quickly between the tools to save time",
            "Bringing cardboard boxes into processing areas",
            "Touching wafer surfaces with bare uncovered hands"
        ],
        correct: 0
    },

    {
        question: "Why is airflow important in many cleanrooms?",
        answers: [
            "It helps remove and control airborne contamination",
            "It increases the overall mass of each wafer",
            "It eliminates all chemical hazards in the room",
            "It converts the silicon surface into glass"
        ],
        correct: 0
    }

];

const lesson6Questions = [

    {
        question: "What is the goal of wafer cleaning before a fabrication step?",
        answers: [
            "Remove particles, organic residue, and contaminants",
            "Slightly increase the wafer's overall diameter",
            "Create the pattern for a photolithography mask",
            "Make the wafer thinner and more mechanically flexible"
        ],
        correct: 0
    },

    {
        question: "Which type of contamination can interfere with thin-film adhesion?",
        answers: [
            "Surface residue or particles",
            "Gravitational pull on the wafer",
            "Bright ambient room lighting",
            "A normal room-temperature setting"
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
            "The wafer will immediately crack under finger pressure",
            "The wafer will lose all of its electrical properties",
            "The wafer will absorb too much UV light afterward"
        ],
        correct: 0
    },

    {
        question: "A wafer has visible particles on its surface before photoresist coating. What is the best action?",
        answers: [
            "Stop and clean or inspect the wafer before continuing",
            "Coat the photoresist directly over the particles",
            "Increase the exposure time to compensate for them",
            "Skip the coating and proceed directly to etching"
        ],
        correct: 0
    },

    {
        question: "Why is cleanliness especially important before deposition or lithography?",
        answers: [
            "Contaminants create defects in later layers",
            "Cleaning makes the wafer noticeably thicker",
            "Cleaning removes the need for patterning masks",
            "Contaminants slightly improve feature resolution"
        ],
        correct: 0
    }

];

const lesson7Questions = [

    {
        question: "What is the primary reason for following a specific gowning procedure?",
        answers: [
            "To keep contaminants from entering the cleanroom",
            "To make fabrication equipment operate faster",
            "To slightly increase the room humidity level",
            "To prevent wafers from being exposed to light"
        ],
        correct: 0
    },

    {
        question: "Which item should typically be covered before entering a clean fabrication area?",
        answers: [
            "Hair and exposed clothing",
            "Only shoes and shoe soles",
            "Only hands and fingernails",
            "Only the safety glasses"
        ],
        correct: 0
    },

    {
        question: "Why are gloves important during wafer handling?",
        answers: [
            "They limit oils, salts, and particles from the hands",
            "They increase the wafer's electrical conductivity",
            "They make the wafer more resistant to etching",
            "They replace the need for wafer-handling tweezers"
        ],
        correct: 0
    },

    {
        question: "What is the safest way to handle a wafer when possible?",
        answers: [
            "Use wafer-handling tools and avoid touching device areas",
            "Hold it flat with bare fingers across the wafer center",
            "Slide it across the work surface to reposition it",
            "Stack it directly on top of another wafer to save space"
        ],
        correct: 0
    },

    {
        question: "Why should movement be controlled inside a cleanroom?",
        answers: [
            "Fast movement can generate and stir up particles",
            "Movement changes the wafer crystal orientation",
            "Movement causes photoresist to chemically harden",
            "Movement noticeably increases silicon oxidation"
        ],
        correct: 0
    },

    {
        question: "Which sequence best represents good cleanroom practice?",
        answers: [
            "Prepare → gown → enter clean area → handle wafers carefully → process",
            "Enter cleanroom → gown afterward → clean wafer → design device",
            "Handle wafer → remove gloves → enter cleanroom → process → inspect",
            "Process wafer → clean work area → gown up → leave the cleanroom"
        ],
        correct: 0
    }

];

const lesson8Questions = [

    {
        question: "Why is wafer inspection performed between fabrication steps?",
        answers: [
            "To catch defects before they carry into later steps",
            "To increase the thickness of the wafer between steps",
            "To improve electrical conductivity automatically",
            "To eliminate the need for process documentation"
        ],
        correct: 0
    },

    {
        question: "A patterned wafer shows broken or missing features under a microscope. What should you do?",
        answers: [
            "Investigate the defect before continuing",
            "Ignore it and continue with the next step",
            "Increase every later process time by 50 percent",
            "Immediately dice and package the device"
        ],
        correct: 0
    },

    {
        question: "Which tool is commonly useful for inspecting small surface features?",
        answers: [
            "Optical microscope",
            "Torque wrench set",
            "Bench drill press",
            "Hydraulic floor pump"
        ],
        correct: 0
    },

    {
        question: "Why is process discipline important in microfabrication?",
        answers: [
            "Small deviations can cause defects or shift performance",
            "All fabrication steps produce identical results automatically",
            "MEMS devices are largely insensitive to process variation",
            "The order of the process steps does not matter at all"
        ],
        correct: 0
    },

    {
        question: "Why is it important to follow the correct fabrication sequence?",
        answers: [
            "Later steps depend on structures made in earlier steps",
            "The order only affects how fast the process feels",
            "Every process step can be performed in any order",
            "Sequence only matters during the final packaging stage"
        ],
        correct: 0
    },

    {
        question: "Which is the best response when a process result looks abnormal?",
        answers: [
            "Stop, inspect, document, and find the cause first",
            "Continue because later steps will always fix it",
            "Change several process settings at once to compensate",
            "Discard all of the process records and restart"
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
            "They are sliced from a large silicon single crystal",
            "They are stamped from thin sheets of pure metal",
            "They are molded from cured photoresist polymer",
            "They are deposited directly onto a glass photomask"
        ],

        correct: 0
    },


    {
        question:
            "Which statement best describes how integrated circuits are fabricated?",

        answers: [
            "The entire circuit is formed in one machining operation",
            "Devices are assembled only after the wafer is cut apart",
            "The wafer undergoes successive patterning and fabrication steps",
            "Only mechanical cutting and grinding of the wafer are used"
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
            "It can only ever be used as a passive electrical conductor",
            "It combines electrical and mechanical properties and can be micromachined",
            "It cannot be patterned using semiconductor fabrication methods",
            "Its mechanical properties prevent thin structures from ever moving"
        ],

        correct: 1
    },


    {
        question:
            "Which statement best captures the relationship between IC fabrication and MEMS fabrication?",

        answers: [
            "They are completely unrelated technologies that share no common fabrication methods",
            "MEMS builds on semiconductor fabrication methods, extending them to mechanical parts",
            "MEMS fabrication replaces all lithography with conventional machining",
            "Integrated circuits are manufactured using large arrays of MEMS devices"
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
            "To make the wafer physically thicker and stronger",
            "To remove all charge carriers from the material",
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
            "Free neutrons in the lattice",
            "Holes (positive carriers)",
            "Bound protons in the nucleus",
            "Mobile negative ions (anions)"
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
            "Holes (positive carriers)",
            "Mobile electrons (negative)",
            "Bound protons in the nucleus",
            "Neutral atoms in the lattice"
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
            "P-type semiconductor",
            "N-type semiconductor",
            "Intrinsic (undoped) silicon",
            "Fully insulating silicon"
        ],

        correct: 1
    },


    {
        question:
            "A silicon region has an abundance of holes. Which type of semiconductor is it most likely to be?",

        answers: [
            "N-type semiconductor",
            "P-type semiconductor",
            "Undoped metallic film",
            "Insulating oxide layer"
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
            "Many repeated steps build up patterned layers",
            "Only metal layers are deposited on the wafer",
            "The wafer is shaped only by mechanical cutting"
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
            "Complex devices need multiple patterned material layers",
            "Every wafer must be physically cut apart after each step",
            "Only one material can exist on a wafer at a time",
            "The silicon substrate is replaced after each layer"
        ],

        correct: 0
    },


    {
        question:
            "Which sequence best represents the general idea of layer-based microfabrication?",

        answers: [
            "Deposit material → pattern it → remove selected material → repeat",
            "Cut the wafer → weld it → paint the wafer surface → repeat",
            "Melt silicon → machine the entire device → polish it once",
            "Deposit one layer → dice it → package the device immediately"
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
            "It combines electrical and mechanical properties",
            "It has essentially no mechanical strength at all",
            "It cannot be integrated with on-chip electronics",
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
            "It behaves like a soft rubber that stretches easily",
            "It permanently deforms even under very small loads",
            "It is highly elastic, with a modulus comparable to steel",
            "It has essentially no stiffness against bending or pulling"
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
            "To serve as the final electrical contact layer",
            "To be removed so the structure becomes free-standing",
            "To permanently replace the structural layer above it"
        ],

        correct: 2
    },


    {
        question:
            "A thin mechanical beam is built above a wafer using deposited films. Material underneath the beam is later removed so the beam can move. What process does this describe?",

        answers: [
            "Bulk micromachining",
            "Surface micromachining",
            "Optical wafer inspection",
            "Thermal oxidation growth"
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
            "Both techniques require the entire silicon substrate to be removed",
            "Bulk uses only deposition, while surface micromachining uses only etching",
            "Surface micromachining must always etch deep trenches into the wafer",
            "Bulk forms features in the substrate; surface builds thin-film structures above it"
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
            "A thin layer of pure gold metal",
            "A thin layer of cured photoresist",
            "A thin layer of doped polysilicon"
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
            "To make the wafer optically transparent to UV light",
            "To increase its overall physical thickness",
            "To remove all remaining photoresist from it"
        ],

        correct: 0
    },


    {
        question:
            "Why might a wafer be oxidized before pattern transfer begins?",

        answers: [
            "Wafer-level processing can modify the wafer before patterning",
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
            "Selective doping",
            "Planarization (CMP)",
            "Metal evaporation",
            "Wafer inspection"
        ],

        correct: 0
    },


    {
        question:
            "Which statement correctly distinguishes wafer-level processes from pattern-transfer processes?",

        answers: [
            "Wafer-level steps (oxidation, doping) modify the wafer; pattern-transfer steps (lithography, etching) define regions",
            "Wafer-level processes only remove material, while pattern-transfer processes only ever add new material",
            "Pattern-transfer processes always happen before any wafer-level process, in every sequence",
            "There is no meaningful difference, since both classes change the wafer in exactly the same way"
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
            "Photolithography",
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
            "Polysilicon (Poly1 layer)",
            "Photoresist (soft-baked)",
            "Gold (Cr/Au metal layer)"
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
            "To create material layers that are later patterned into structures",
            "To permanently remove material from across the wafer surface",
            "To inspect the wafer for defects before the next step",
            "To dope the silicon substrate with a controlled dose of atoms"
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
            "To form the final mechanical structure all by itself",
            "To dope the whole wafer with impurity atoms",
            "To deposit the electrical contact metal layer"
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
            "They become soluble and wash away in the developer",
            "They evaporate away under the UV exposure light",
            "They are removed by an RCA cleaning step afterward"
        ],

        correct: 0
    },


    {
        question:
            "Shipley resist is a common example of which type of photoresist?",

        answers: [
            "Positive-tone resist",
            "Negative-tone resist",
            "Neither type of resist",
            "A sacrificial oxide layer"
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
            "It matches the pattern on the mask",
            "It is inverted from the mask",
            "It has no relation to the mask pattern",
            "It is always larger than the mask pattern"
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
            "Liquid chemical acid baths",
            "Spin-coating of liquid resist",
            "Thermal oxidation in a furnace"
        ],

        correct: 0
    },


    {
        question:
            "Wet and dry etching are both classified under which broader micromachining category?",

        answers: [
            "Pattern-transfer methods",
            "Wafer-level process methods",
            "Chip packaging methods",
            "Wafer inspection methods"
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
            "Metallization of the wafer surface",
            "Wafer dicing into individual dies",
            "Final SEM inspection of the wafer"
        ],

        correct: 0
    },


    {
        question:
            "What typically happens to the photoresist after etching is complete?",

        answers: [
            "It is stripped away, leaving the patterned film",
            "It remains in place as the final structural layer",
            "It is converted into a layer of silicon dioxide",
            "It is reused as-is for the next lithography step"
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
            "Ion-implant doping",
            "Thermal oxidation",
            "Thin-film deposition"
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
            "Managing surface topography from earlier steps",
            "Introducing dopants deep into the substrate",
            "Removing the entire photoresist layer at once",
            "Cutting the finished wafer into individual dies"
        ],

        correct: 0
    },


    {
        question:
            "Why can't a complex microdevice usually be made in a single fabrication operation?",

        answers: [
            "It is built through many add, pattern, and remove steps",
            "Silicon cannot be patterned more than once per wafer",
            "Only one material can ever exist on a single wafer",
            "Every layer requires a brand-new substrate wafer"
        ],

        correct: 0
    },


    {
        question:
            "When analyzing a MEMS fabrication sequence, which questions should you be asking at each step?",

        answers: [
            "What exists now, what should stay, what goes, and what is added",
            "What the final selling price of each finished device will be",
            "How many wafers are currently waiting in the cleanroom",
            "Which company manufactured each piece of equipment"
        ],

        correct: 0
    },


    {
        question:
            "Which statement best describes the relationship between fabrication layers?",

        answers: [
            "Each layer changes the starting point for the next layer",
            "Layers are completely independent of every other layer",
            "Later layers never affect earlier ones or vice versa",
            "Only the very first layer affects the final device"
        ],

        correct: 0
    },


    {
        question:
            "Planarization belongs to which part of the microfabrication toolbox?",

        answers: [
            "Pattern-transfer and micromachining",
            "Crystal and wafer growth methods",
            "Cleanroom certification and audit steps",
            "Final electrical and functional testing methods"
        ],

        correct: 0
    },


    {
        question:
            "Which sequence best describes the general repeating cycle of layer-based microfabrication?",

        answers: [
            "Deposit, pattern, etch, modify, repeat",
            "Cut, weld, paint, inspect, repeat",
            "Package, ship, test, return, repeat",
            "Melt, mold, cool, trim, repeat"
        ],

        correct: 0
    },


    {
        question:
            "Fabrication is best understood as:",

        answers: [
            "An interconnected sequence where each step builds on the last",
            "A set of completely isolated steps with no dependencies",
            "A single long operation performed once for the whole wafer",
            "A loose process with no defined order between steps"
        ],

        correct: 0
    },


    {
        question:
            "After a new layer is deposited and patterned, what must the next process step account for?",

        answers: [
            "The changed surface geometry that layer leaves behind",
            "Only the original bare silicon surface of the wafer",
            "The wafer's serial number and lot tracking label",
            "The photomask shop's typical delivery turnaround time"
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
            "A base process layer",
            "The final metal contacts",
            "A layer of photoresist",
            "A sacrificial layer only"
        ],

        correct: 0
    },


    {
        question:
            "What is added on top of the process layer to later form the air gap beneath the finished structure?",

        answers: [
            "Sacrificial material",
            "A gold metal layer",
            "A photoresist layer",
            "A silicon nitride layer"
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
            "It is converted into a layer of silicon dioxide",
            "It is deposited a second time over the structure"
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
            "To remove organic and metallic contamination",
            "To pattern the photoresist for the first mask",
            "To deposit the first polysilicon structural layer",
            "To etch away the sacrificial layer at the start"
        ],

        correct: 0
    },


    {
        question:
            "Which films are deposited during the LPCVD step of the cleanroom example?",

        answers: [
            "Nitride, polysilicon, and PSG",
            "Gold, chromium, and platinum",
            "Photoresist and developer liquids",
            "Quartz, glass, and sapphire"
        ],

        correct: 0
    },


    {
        question:
            "What is the final step in the cleanroom fabrication example?",

        answers: [
            "Metallization: depositing and lifting off Au/Cr contacts",
            "A final RCA clean of the finished, released chip",
            "Design and layout of the next set of photomasks",
            "Spin-coating photoresist onto the bare substrate"
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
            "Micro-Unit Mask Production",
            "Metal-Underlay Micro Process",
            "Multi-Use Mold Prototyping"
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
            "Economical MEMS prototyping without owning a fab",
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
            "CPU (Central Processor Unit) and GPU (Graphics Unit)",
            "RIE (Reactive Ion Etch) and LPCVD (Low-Pressure CVD)",
            "SOI (Silicon On Insulator) and CMOS (Complementary MOS)"
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
            "To reduce charge feed-through from electrostatic devices",
            "To make the wafer optically transparent to infrared",
            "To increase the wafer's thickness during later etching",
            "To remove the need for any nitride insulating layer"
        ],

        correct: 0
    },


    {
        question:
            "What is deposited to electrically insulate later structures from the substrate?",

        answers: [
            "A 0.6 µm low-stress silicon nitride layer",
            "A 0.5 µm chromium and gold metal layer",
            "A 1.5 µm layer of positive photoresist",
            "A 2.0 µm layer of sacrificial PSG"
        ],

        correct: 0
    },


    {
        question:
            "What deposition method is used for the nitride and Poly0 layers?",

        answers: [
            "LPCVD (low-pressure CVD)",
            "Electrodeposition (plating)",
            "Anodic bonding to glass",
            "Wet chemical etching"
        ],

        correct: 0
    },


    {
        question:
            "What is Poly0 commonly used for?",

        answers: [
            "Wiring and fixed electrodes under moving structures",
            "The final reflective mirror surface of the device",
            "The sacrificial release layer under the beams",
            "The wire bonding pads placed along the chip edge"
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
            "The eighth and final mask in the sequence",
            "The DIMPLES mask, used after PSG1 is coated",
            "The METAL mask, near the end of the run"
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
            "Polysilicon (Poly1 layer)",
            "Silicon nitride (Si3N4 layer)",
            "Gold (Cr/Au metal layer)"
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
            "Etch shallow dimples so beams don't stick flat against Poly0",
            "Cut deep trenches all the way through to the substrate",
            "Pattern the final metal contacts and bonding pads",
            "Define the wafer's outer edge and alignment marks"
        ],

        correct: 0
    },


    {
        question:
            "What is the purpose of the ANCHOR1 mask?",

        answers: [
            "Etch holes through PSG1 to Poly0, later filled by Poly1",
            "Etch shallow dimples into the Poly1 structural layer",
            "Pattern the metal lift-off layer for the bond pads",
            "Dope the substrate with phosphorous before the nitride"
        ],

        correct: 0
    },


    {
        question:
            "When is the First Oxide sacrificial layer finally removed?",

        answers: [
            "At the very end of the process, during release",
            "Immediately after it is deposited and patterned",
            "Before the Poly0 layer is deposited on the nitride",
            "It is never removed and stays as an insulator"
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
            "So Poly1 gets standoff bumps that keep it from sticking to Poly0",
            "So Poly1 can be deposited at a much lower temperature than usual",
            "So the wafer can be diced apart earlier in the process run",
            "So the silicon nitride insulating layer can be skipped entirely"
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
            "A 200 nm PSG cap serving as a hard mask and dopant source",
            "A 200 nm metal cap that acts as a mirror and a heater",
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
            "Melts it and fuses it into the silicon substrate",
            "Converts the film entirely into silicon nitride",
            "Removes all of the dopants from the polysilicon film"
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
            "Etches holes down to Poly1 so Poly2 can connect to it",
            "Etches completely through the substrate wafer itself",
            "Deposits and patterns the final metal layer on top",
            "Dopes the whole wafer with phosphorous at the start"
        ],

        correct: 0
    },


    {
        question:
            "How does the ANCHOR2 mask differ from POLY1_POLY2_VIA?",

        answers: [
            "It etches through PSG1 and PSG2 in one step, avoiding misalignment",
            "It only etches through the silicon nitride insulating layer",
            "It is used before any polysilicon has been deposited at all",
            "It removes the Poly0 layer entirely from the whole wafer"
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
            "It allows an independent second moving layer, like a hinged mirror",
            "It replaces the need for any sacrificial layers in the stack",
            "It eliminates the need for any anchoring to the substrate",
            "It is only used as an alignment marker during inspection"
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
            "Using RIE plasma etching, with the first mask",
            "By hand polishing after the final HF release",
            "By anodic bonding with a glass cover wafer"
        ],

        correct: 0
    },


    {
        question:
            "What does the metal layer provide in a finished PolyMUMPs device?",

        answers: [
            "Probing pads, wire bonding, routing, and reflective surfaces",
            "The main sacrificial support structure under the beams",
            "Electrical insulation between the layers and the substrate",
            "The dopant source that dopes the Poly2 structural layer"
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
            "24 hours in an oven at 1050°C",
            "10 minutes in a bath at 100°C",
            "8–12 weeks at room temperature"
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
            "As a single uncut full wafer",
            "Submerged in HF and unrinsed"
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
            "Depositing the metal layer on the bare wafer",
            "Etching the ANCHOR2 holes into the first oxide",
            "Immersing the bare wafer in HF for release"
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
            "Nitride"
        ],

        correct: 0
    },


    {
        question:
            "Which two mask features are patterned into PSG2?",

        answers: [
            "POLY1_POLY2_VIA and ANCHOR2",
            "DIMPLES and ANCHOR1 holes",
            "METAL and POLY0 patterns",
            "Nitride and Poly1 layers"
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
            "Nitride"
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
            "Nitride"
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
            "Absolute position relative to the ground",
            "Ambient temperature change over time",
            "Magnetic field strength and direction"
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
            "About 500 thousand",
            "About 50 billion",
            "About 5 thousand"
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
            "Sound pressure level",
            "Air humidity level"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is a real-world accelerometer application?",

        answers: [
            "Seismic activity sensing in buildings and bridges",
            "Measuring internet bandwidth in office buildings",
            "Detecting Wi-Fi signal strength inside phones",
            "Reading barcodes on packages at a checkout"
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
            "It is displaced in the sensing direction, held by the spring",
            "It instantly matches the housing's velocity with no lag",
            "It disappears from the structure whenever the device moves",
            "It becomes electrically charged and sticks to the housing"
        ],

        correct: 0
    },


    {
        question:
            "What are the two common ways to sense the proof mass's displacement?",

        answers: [
            "Piezoelectrically or capacitively",
            "Acoustically or chemically",
            "By weighing it directly on a scale",
            "By measuring its color and shape"
        ],

        correct: 0
    },


    {
        question:
            "Which law is the physical starting point for accelerometer operation?",

        answers: [
            "Newton's second law, F = ma",
            "Ohm's law of circuits, V = IR",
            "Boyle's law, P₁V₁ = P₂V₂",
            "Coulomb's law, F = kq₁q₂/r²"
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
            "The total mass of the moving sensor structure",
            "The overall die size of the accelerometer chip",
            "The supply voltage required to run the sensor"
        ],

        correct: 0
    },


    {
        question:
            "All else being equal, what happens to resonant frequency if the spring constant increases?",

        answers: [
            "It increases",
            "It decreases",
            "It stays the same",
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
            "S = F_static / m = k / m = ω²",
            "S = a_static / x = k / m = ω²",
            "S = m·a / b = m / b = 1 / ω"
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
            "Manufacturing defects in the sensor die itself",
            "Random variations in the supply voltage over time"
        ],

        correct: 0
    },


    {
        question:
            "Which two design choices reduce mechanical (TNEA) noise?",

        answers: [
            "Increasing quality factor and increasing mass",
            "Decreasing quality factor and decreasing mass",
            "Increasing the supply voltage and die area",
            "Decreasing the die size and spring stiffness"
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
            "It should exceed the highest frequency in the measured signal",
            "It should always equal exactly 1000 Hz for every design",
            "It should be as low as physically possible for max gain",
            "It does not matter at all as long as the die is small"
        ],

        correct: 0
    },


    {
        question:
            "Why is that resonant-frequency design rule important?",

        answers: [
            "Operating near resonance distorts the measured signal",
            "It mainly reduces the manufacturing cost of the die",
            "It has no real effect on sensor performance at all",
            "It only matters for optical MEMS sensors and mirrors"
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
            "Capacitance change, inductance change, optical, scanning-probe tips",
            "Voltage change, current change, resistance change, temperature change",
            "Weight change, volume change, density change, and color shift",
            "Sound change, light change, heat change, pressure change"
        ],

        correct: 0
    },


    {
        question:
            "Which two capacitor configurations are common in MEMS position sensing?",

        answers: [
            "Parallel plate and interdigitated (comb)",
            "Cylindrical and spherical (coaxial)",
            "Single-plate and triangular (wedge) plate",
            "Wireless radio and inductive coil types"
        ],

        correct: 0
    },


    {
        question:
            "In Q = C(x)V, what does C(x) represent?",

        answers: [
            "Capacitance as a function of position",
            "A constant current source in the circuit",
            "The supply voltage across the sensor",
            "The damping factor of the proof mass"
        ],

        correct: 0
    },


    {
        question:
            "What circuit converts the sensing capacitor's current into an output voltage?",

        answers: [
            "A transimpedance amplifier",
            "A passive voltage divider",
            "A simple series resistor",
            "An inductor coil network"
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
            "Adding an integrator, or using an AC excitation source",
            "Removing the feedback capacitor from the circuit entirely",
            "Increasing the DC supply voltage across the sensor",
            "Switching to an optical position sensor instead"
        ],

        correct: 0
    },


    {
        question:
            "With an AC excitation source and a feedback capacitor, what does the output voltage become approximately proportional to?",

        answers: [
            "C(x), the sensing capacitance, and so position",
            "The square of the DC supply voltage applied",
            "The damping factor b of the air under the mass",
            "The physical size of the whole die and its package"
        ],

        correct: 0
    },


    {
        question:
            "Why is a feedback capacitor added to the transimpedance amplifier circuit?",

        answers: [
            "To convert the sensed current into a voltage tracking capacitance",
            "To physically drive the proof mass back to its center",
            "To increase the resonant frequency of the proof mass",
            "To reduce the overall size of the die and the package"
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
            "A sealed chamber filled with a viscous liquid",
            "A single rigid metal rod clamped at both ends"
        ],

        correct: 0
    },


    {
        question:
            "How is the ADXL150's proof-mass displacement measured?",

        answers: [
            "Capacitively, against stationary polysilicon fingers",
            "By directly weighing the proof mass in real time",
            "Using a laser interferometer built into the die",
            "By measuring the change in the die's temperature"
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
            "All 3 sets fixed (anchored 1 µm above the base)",
            "All 3 sets movable (suspended 1 µm above the base)",
            "1 fixed, 2 movable (suspended 1 µm above the base)"
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
            "The proof mass is displaced, then the capacitance changes",
            "The capacitance changes on its own, causing the mass to move",
            "The supply voltage changes first, then the mass moves",
            "The die temperature changes first, then the mass moves"
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
            "Deposition, patterning, oxide/nitride CVD, and metallization",
            "Wafer dicing, sawing, and sorting of the finished dies",
            "Optical inspection, imaging, and defect-map review",
            "Wire bonding, die attach, and lead-frame trimming"
        ],

        correct: 0
    },


    {
        question:
            "Which concept from earlier fabrication units also appears in building an accelerometer?",

        answers: [
            "Polysilicon structural layers with a final sacrificial release",
            "Silicon-on-insulator wafers joined by fusion bonding",
            "Piezoelectric thin-film deposition with electrical poling",
            "Electroplated metal structural layers with a resist mold"
        ],

        correct: 0
    },


    {
        question:
            "According to S = m/k, what increases an accelerometer's sensitivity?",

        answers: [
            "A larger mass or a softer (lower k) spring",
            "A smaller mass or a stiffer (higher k) spring",
            "A higher supply voltage or a smaller mass",
            "A smaller die size or a thinner package"
        ],

        correct: 0
    },


    {
        question:
            "Why might a designer choose a stiffer spring despite lower sensitivity?",

        answers: [
            "To raise resonant frequency and widen usable bandwidth",
            "To make the die deliberately more expensive to produce",
            "To reduce the number of signal ports that are needed",
            "Stiffness has no effect on frequency or bandwidth"
        ],

        correct: 0
    },


    {
        question:
            "What is the overall design tension every accelerometer designer must balance?",

        answers: [
            "Sensitivity versus bandwidth, and noise versus mass/stiffness",
            "Die color and marking style versus package size choice",
            "Supply voltage versus number of signal ports on the die",
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
            "Light's wavelength is similar in scale to MEMS device dimensions",
            "Light cannot interact with anything smaller than a millimeter",
            "MEMS devices are too large to interact with light at all",
            "Optics never requires any moving parts of any kind in a system"
        ],

        correct: 0
    },


    {
        question:
            "Which properties make MEMS switches attractive for routing optical signals?",

        answers: [
            "Low optical insertion loss and low crosstalk",
            "High weight and high power consumption",
            "Very large physical size and heavy mass",
            "A requirement for liquid nitrogen cooling"
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
            "A small displacement can produce a large optical effect",
            "They require no electrical power in any operating mode",
            "They can only ever switch light off, and never back on",
            "They must be replaced after every single use cycle"
        ],

        correct: 0
    },


    {
        question:
            "Optical MEMS technology has evolved over roughly four decades, from early projection displays to which modern application?",

        answers: [
            "LiDAR beam scanning",
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
            "Electrical, magnetic, and thermal modulation of light",
            "Analog, digital, and hybrid electronic modulation",
            "Wired, wireless, and optical-fiber light modulation"
        ],

        correct: 0
    },


    {
        question:
            "Which display technology uses the reflective approach?",

        answers: [
            "TI's Digital Micromirror Device (DMD)",
            "Qualcomm's mirasol color display",
            "The Grating Light Valve (GLV)",
            "Backlit liquid-crystal LCD panels"
        ],

        correct: 0
    },


    {
        question:
            "Which display technology uses the diffractive approach?",

        answers: [
            "The Grating Light Valve (GLV)",
            "TI's Digital Micromirror (DMD)",
            "Qualcomm's mirasol color display",
            "Organic OLED emissive panels"
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
            "Bought by Cypress in 2000, then Dainippon in 2008, then Sony",
            "It was never sold or transferred to any other company",
            "It was immediately discontinued right after its invention",
            "It was purchased by Apple in the 1990s, then re-sold"
        ],

        correct: 0
    },


    {
        question:
            "In a reflective display, what determines whether light reaches the viewer?",

        answers: [
            "The physical tilt position of a micromirror",
            "The color of the incoming light only",
            "The operating temperature of the chip",
            "The thickness of the glass substrate"
        ],

        correct: 0
    },


    {
        question:
            "In a diffractive display, what optical property does the effect strongly depend on?",

        answers: [
            "Light wavelength",
            "Polarization state",
            "Sound frequency",
            "Air pressure level"
        ],

        correct: 0
    },


    {
        question:
            "Which of the three display approaches works by forming an optically resonant cavity?",

        answers: [
            "Interferometric modulation (mirasol)",
            "Reflective micromirror modulation (DMD)",
            "Diffractive grating modulation (GLV)",
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
            "A circuit board converting image data into digital signals",
            "A permanent magnet that levitates the chip above it",
            "A small speaker that produces sound for the projector",
            "A battery that keeps the mirrors permanently charged"
        ],

        correct: 0
    },


    {
        question:
            "What determines whether incident light is reflected toward the image or deflected away in a DMD?",

        answers: [
            "Which of two positions the micromirror tilts to",
            "The color of the mirror's reflective coating",
            "The ambient room temperature around the chip",
            "The speed of the projector's cooling fan"
        ],

        correct: 0
    },


    {
        question:
            "What are two advantages of DMD-based projection?",

        answers: [
            "High brightness and contrast in a compact, low-power package",
            "Extremely high cost and a bulky, heavy physical size",
            "Requires no electrical power at all to hold an image",
            "Cannot produce color images or any grayscale shading"
        ],

        correct: 0
    },


    {
        question:
            "About how many pixels does DLP 1080p technology deliver?",

        answers: [
            "More than 2 million, for 1920 × 1080 resolution",
            "About 100 thousand, for 320 × 320 resolution",
            "Exactly 1,080, one per horizontal row of pixels",
            "About 500 thousand, for 800 × 600 resolution"
        ],

        correct: 0
    },


    {
        question:
            "What shape is the mirror support structure in a typical DMD pixel?",

        answers: [
            "H-shaped support",
            "Perfectly circular",
            "Triangular frame",
            "Star-shaped hub"
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
            "It lifts the mirror above the support structure plane",
            "It permanently glues the mirror in a fixed position",
            "It conducts heat away from the chip to a heat sink",
            "It blocks stray light from reaching the mirror surface"
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
            "About 10 thousand",
            "About 2 thousand",
            "About 90 million"
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
            "About 100 thousand contacts",
            "Exactly one contact",
            "450 million contacts"
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
            "Hand-carving each mirror under a high-power microscope",
            "3D printing each part from molten metal droplets",
            "Injection molding of small plastic mirror parts"
        ],

        correct: 0
    },


    {
        question:
            "What type of sacrificial layer does the DMD process use, and how is it removed?",

        answers: [
            "An organic sacrificial layer, dry-etched at the wafer level",
            "A permanent oxide layer that is never removed at all",
            "A liquid layer removed by hand with a small syringe",
            "A metal layer removed by melting the entire wafer"
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
            "Gravitational torque and magnetic (restoring) torque",
            "Thermal (expansion) torque and optical radiation torque",
            "There is only one torque, and it needs no balancing"
        ],

        correct: 0
    },


    {
        question:
            "What provides the mechanical restoring torque in a torsion mirror?",

        answers: [
            "The twisting of the torsion beam (spring)",
            "A small electric motor beneath the mirror",
            "Air pressure from a tiny built-in pump",
            "Gravity acting on the mirror mass alone"
        ],

        correct: 0
    },


    {
        question:
            "What provides the electrostatic torque that tips the mirror?",

        answers: [
            "Voltage applied between the mirror support and an electrode",
            "Sunlight striking the mirror surface from a fixed angle",
            "A magnetic field produced by an external electromagnet coil",
            "Friction from the surrounding air as the mirror tilts"
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
            "The mirror from ever moving at all during operation",
            "Light from reflecting off the mirror surface at all",
            "The torsion beam from twisting under electric load"
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
            "It stops moving permanently at the current angle",
            "It reverses direction and returns to its flat position",
            "It melts due to the heat of the applied voltage"
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
            "An array of electrostatically actuated grating ribbons",
            "A single large rotating disc with reflective facets",
            "A liquid crystal layer with a color-filter array",
            "A single row of tiny red, green, and blue LEDs"
        ],

        correct: 0
    },


    {
        question:
            "How does a GLV display create different colors?",

        answers: [
            "By using different spacing between the ribbons",
            "By heating different regions of the chip surface",
            "By changing the chip's supply voltage alone",
            "By rotating the entire display panel mechanically"
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
            "Diffractive (ribbon grating)",
            "Reflective (tilting mirror)",
            "Both are equally fast overall",
            "Neither has a measurable speed"
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
            "A vibrating speaker cone and a microphone stack",
            "A battery cell and a thin-film capacitor stack"
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
            "Fujitsu Limited",
            "Qualcomm Inc.",
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
            "Confocal microscopy imaging",
            "GLV projection displays",
            "DMD projection displays",
            "Mirasol reflective displays"
        ],

        correct: 0
    },


    {
        question:
            "Besides displacement, what other physical quantities can optical MEMS sensors measure?",

        answers: [
            "Pressure, flow, and acceleration",
            "Electrical voltage and current",
            "Sound volume and musical pitch",
            "Nothing beyond simple displacement"
        ],

        correct: 0
    },


    {
        question:
            "What does MEMS-nanophotonics integration refer to as a development trend?",

        answers: [
            "Combining MEMS with nanoscale photonic components",
            "Removing all optical components from MEMS devices",
            "Replacing MEMS with purely electronic circuits",
            "Making MEMS devices much larger and heavier"
        ],

        correct: 0
    },


    {
        question:
            "What does a \"single-chip optical MEMS system\" refer to as a development trend?",

        answers: [
            "Putting the whole optical MEMS system and electronics on one chip",
            "Using a separate chip for every individual mirror in the array",
            "Removing all electronics from optical MEMS devices entirely",
            "Building optical MEMS devices without any silicon at all"
        ],

        correct: 0
    },


    {
        question:
            "Which underlying fabrication concepts, familiar from earlier microfabrication topics, also apply to building a device like the DMD?",

        answers: [
            "Deposition, patterning, sacrificial release, and metallization",
            "Hand assembly of each part with no fabrication steps at all",
            "Optical polishing and grinding, with no deposition at all",
            "3D printing in plastic, with no lithography or etching steps"
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
            "Replace the need for any further biological studies",
            "Convert incoming light into digital image signals",
            "Measure the acceleration of a moving vehicle"
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
            "Wood, paper, and cotton fabric",
            "Gold, silver, and platinum foil",
            "Rubber, leather, and cardboard"
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
            "Pure aluminum foil",
            "Natural rubber sheet",
            "Woven glass fiber"
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
            "A single traveling wave of light",
            "A steady magnetic field pattern"
        ],

        correct: 0
    },


    {
        question:
            "Where is the SSAW positioned in an acoustophoresis device?",

        answers: [
            "Between the channels of the microfluidic device",
            "Outside of the chip, in the surrounding air space",
            "Inside the power supply and signal generator unit",
            "Above the computer display screen used for imaging"
        ],

        correct: 0
    },


    {
        question:
            "What happens to larger particles in the standing wave field?",

        answers: [
            "They are funneled into the center, at the pressure node",
            "They are destroyed immediately by the acoustic field",
            "They float out of the channel entirely and are lost",
            "They stick permanently to the piezoelectric substrate"
        ],

        correct: 0
    },


    {
        question:
            "What happens to smaller particles in the standing wave field?",

        answers: [
            "They stay toward the channel edges, near the antinodes",
            "They are funneled into the exact center of the channel",
            "They become strongly electrically charged in the field",
            "They disappear from the channel and cannot be seen"
        ],

        correct: 0
    },


    {
        question:
            "What generates the surface acoustic waves on the piezoelectric substrate?",

        answers: [
            "An interdigitated transducer (IDT)",
            "A small rotating electric motor",
            "A focused pulsed laser beam",
            "A chemical reaction in the fluid"
        ],

        correct: 0
    },


    {
        question:
            "What material is the microfluidic channel typically made from in this design?",

        answers: [
            "PDMS (a soft polymer)",
            "Solid stainless steel",
            "Polished pure diamond",
            "Sealed liquid mercury"
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
            "Rayleigh wave velocity divided by the IDT wavelength",
            "The color and surface finish of the substrate crystal",
            "The number of cells flowing through the channel",
            "The ambient room temperature during the experiment"
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
            "Whether particles migrate toward nodes or antinodes",
            "The exact color and amplitude of the acoustic wave",
            "The total voltage supplied to the chip electrodes",
            "The number of inlets and outlets on the device"
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
            "Gravitational force",
            "Magnetic force",
            "Nuclear force"
        ],

        correct: 0
    },


    {
        question:
            "Which three properties determine the viscous drag force on a particle?",

        answers: [
            "The particle's radius, velocity, and the fluid's viscosity",
            "The particle's color, weight, and surface temperature",
            "The chip's supply voltage, overall size, and cost",
            "The number of electrodes and their material type"
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
            "The microchannel and SSAW device, mirrored about a centerline",
            "The color of the substrate on each half of the whole chip",
            "The supply voltage applied to each electrode, randomly",
            "Nothing in the layout is deliberately kept symmetric at all"
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
            "A 50-inch single-crystal silicon wafer",
            "A 1-inch borosilicate glass wafer",
            "A 12-inch stainless steel wafer"
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
            "Standard Futurrex resist protocol with a light-field mask",
            "No photoresist is used, with a light-field mask alone",
            "A photoresist made entirely of metal and a clear mask",
            "A dark-field mask used without any photoresist layer"
        ],

        correct: 0
    },


    {
        question:
            "What two metals are deposited to form the IDT electrodes?",

        answers: [
            "Chromium and gold (Cr/Au)",
            "Iron and lead (Fe/Pb)",
            "Copper and tin (Cu/Sn)",
            "Silver and zinc (Ag/Zn)"
        ],

        correct: 0
    },


    {
        question:
            "What happens during the \"lift-off\" step of fabrication?",

        answers: [
            "Photoresist and the excess metal on it are removed, leaving the electrodes",
            "The entire substrate is physically lifted off the carrier wafer beneath it",
            "New photoresist is added on top of the existing metal to protect it",
            "The chip is heated until the substrate melts and reflows into place"
        ],

        correct: 0
    },


    {
        question:
            "What substrate material is patterned in this fabrication process?",

        answers: [
            "Lithium niobate",
            "Pure copper sheet",
            "Plain window glass",
            "Coated cardboard"
        ],

        correct: 0
    },


    {
        question:
            "After the IDT/SSAW device is fabricated, what is bonded onto it to complete the chip?",

        answers: [
            "The microfluidic PDMS device",
            "A second lithium niobate wafer",
            "A rechargeable battery pack",
            "A small piezo audio speaker"
        ],

        correct: 0
    },


    {
        question:
            "What does the final assembled chip combine?",

        answers: [
            "A piezoelectric SSAW substrate and a microfluidic PDMS channel",
            "Two identical PDMS channels stacked on top of a glass slide",
            "A rechargeable battery and a small color display screen",
            "A camera lens assembly and a small electret microphone"
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
            "Design by rule, design by analysis, fabrication, bonding, testing",
            "Fabrication first, then bonding, then design, and testing last",
            "Testing first, then design, then fabrication, then bonding",
            "There is no meaningful sequence, so steps can be done in any order"
        ],

        correct: 0
    },


    {
        question:
            "What two tests does the finished device undergo?",

        answers: [
            "Particle focusing and particle separation",
            "Sound volume and light brightness levels",
            "Battery life and battery charging speed",
            "Screen resolution and screen refresh rate"
        ],

        correct: 0
    },


    {
        question:
            "What is the underlying reason larger and smaller particles end up in different locations within the channel?",

        answers: [
            "They feel different acoustic forces relative to drag, based on size",
            "Larger particles are magnetically attracted to the channel walls",
            "Smaller particles slowly evaporate during the testing period",
            "The channel randomly assigns each particle to a position"
        ],

        correct: 0
    },


    {
        question:
            "Which two chip components must be fabricated separately before being joined?",

        answers: [
            "The piezoelectric IDT substrate and the PDMS channel",
            "Two identical copies of the same electrode pattern",
            "A rechargeable battery and a mechanical power switch",
            "A glass focusing lens and a silvered surface mirror"
        ],

        correct: 0
    },


    {
        question:
            "What real-world problem can an acoustophoresis chip like this help solve?",

        answers: [
            "Sorting cells by size, such as from a blood sample",
            "Increasing the top speed of a gasoline car engine",
            "Projecting a high-resolution image onto a screen",
            "Storing large amounts of digital data on a hard drive"
        ],

        correct: 0
    },


    {
        question:
            "What is the benefit of simulating the SAW device (design by analysis) before fabricating it?",

        answers: [
            "It lets you verify frequency and displacement before fabricating",
            "It eliminates the need for any later fabrication at all",
            "It guarantees the chip will never fail once it is built",
            "It replaces the need for any design rules or analysis"
        ],

        correct: 0
    },


    {
        question:
            "Which physical quantity most directly sets the device's operating frequency?",

        answers: [
            "The wavelength of the IDT",
            "The color of the PDMS channel",
            "The number of cells in the sample",
            "The thickness of the packaging"
        ],

        correct: 0
    },


    {
        question:
            "What core principle links every step of this device, from IDT design to final testing?",

        answers: [
            "Controlling an acoustic standing wave to apply size-dependent forces",
            "Minimizing the total cost of the chip at any expense to quality",
            "Maximizing the number of inlets on the chip regardless of function",
            "Avoiding the use of any piezoelectric material in the design"
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
            "Connecting the die to the outside world, passing only what matters",
            "Making the die permanently inaccessible, even to its own signals",
            "Replacing the need for any of the earlier fabrication steps",
            "Increasing the die's overall footprint by a factor of about ten"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is a way packaging protects the device from the environment?",

        answers: [
            "Electrical and magnetic isolation from moisture and electrolytes",
            "Exposing the die directly to open air and moisture at all times",
            "Removing all of the electrical connections from the die",
            "Coating the die in a material that conducts electricity"
        ],

        correct: 0
    },


    {
        question:
            "Which of these is a way packaging protects the environment from the device?",

        answers: [
            "Reducing host responses, or containing toxic products",
            "Making the device louder so that it can be heard",
            "Increasing the device's power consumption when active",
            "Removing the device's protective coating before use"
        ],

        correct: 0
    },


    {
        question:
            "Why might a BioMEMS device specifically require sterilization as part of its packaging?",

        answers: [
            "To protect the environment, like a patient, from the device",
            "To make the device heavier so it stays in place",
            "To increase its overall electrical resistance in the body",
            "Sterilization is never required for BioMEMS devices"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement is especially important for accelerometers and resonators?",

        answers: [
            "Hermetic, vacuum sealing / media compatibility",
            "Bright, colorful packaging materials and finish",
            "Maximum possible package size and internal volume",
            "Zero electrical connections of any kind to the die"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement addresses cross-talk, voltage drop, and capacitive loading?",

        answers: [
            "Acceptable electrical interconnection",
            "Precision optical alignment tolerance",
            "Chemical isolation from the environment",
            "Device sterilization before implantation"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement is especially critical for optical MEMS devices?",

        answers: [
            "Precision optical alignment",
            "Maximum electrical resistance",
            "Total absence of any package",
            "Bright decorative coloring"
        ],

        correct: 0
    },


    {
        question:
            "Which packaging requirement addresses mounting the device without applying undue stress to it?",

        answers: [
            "Acceptable mechanical interconnection",
            "Device sterilization before use",
            "Precision optical alignment tolerance",
            "Low electrical resistance contacts"
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
            "Final electrical testing",
            "Plastic overmolding",
            "Lead-frame trimming"
        ],

        correct: 0
    },


    {
        question:
            "Which wafer-bonding type uses temperatures between 800 and 1200°C to form a stable Si-Si or Si-SiO2 bond?",

        answers: [
            "Direct wafer bonding",
            "Anodic wafer bonding",
            "Flip-chip die bonding",
            "Gold wire bonding"
        ],

        correct: 0
    },


    {
        question:
            "Which wafer-bonding type is also called electrostatic bonding, and bonds silicon to glass?",

        answers: [
            "Anodic wafer bonding",
            "Direct wafer bonding",
            "Flip-chip die bonding",
            "Thermocompression bonding"
        ],

        correct: 0
    },


    {
        question:
            "What temperature and voltage range does anodic bonding typically use?",

        answers: [
            "180–500°C, 200–1000 volts",
            "10–30°C, 1–5 volts (ambient)",
            "5000°C, 1,000,000 volts",
            "60–90°C, 5–20 volts applied"
        ],

        correct: 0
    },


    {
        question:
            "What is a common application of wafer-level bonding that creates a sealed vacuum reference?",

        answers: [
            "Absolute pressure sensors",
            "Wire bonding pad layers",
            "Photoresist spin coating",
            "Wafer dicing and sorting"
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
            "A shallow pool of liquid nitrogen",
            "A bed of loose quartz sand",
            "A sheet of thin aluminum foil"
        ],

        correct: 0
    },


    {
        question:
            "Why must the dicing adhesive be both strong and mild?",

        answers: [
            "Strong enough to hold the die while sawing, but mild enough for pick-and-place",
            "Strong enough to hold the die while sawing, and equally strong afterward",
            "Mild enough to release the die instantly, before sawing even begins",
            "Conductive enough to carry current through the die during sawing"
        ],

        correct: 0
    },


    {
        question:
            "Besides diamond sawing, what are two other dicing techniques mentioned?",

        answers: [
            "Laser cutting and diamond wire cutting",
            "Hand-cutting with scissors and biting",
            "Melting and re-freezing the wafer edge",
            "Dissolving it entirely in strong acid"
        ],

        correct: 0
    },


    {
        question:
            "What does the \"pick and place\" process do?",

        answers: [
            "Mounts dies from the wafer onto a lead-frame or package",
            "Removes all of the dies from the wafer permanently",
            "Cleans the wafer surface with solvent and a brush",
            "Anneals the wafer at a high temperature in a furnace"
        ],

        correct: 0
    },


    {
        question:
            "Why can pick and place be risky for some MEMS devices?",

        answers: [
            "It can damage delicate, already-released structures like accelerometers",
            "It always destroys the entire wafer, so it is never used on MEMS",
            "It requires no physical contact with the die, so it is risk-free",
            "It only works on devices with no moving parts, so it is never risky"
        ],

        correct: 0
    },


    {
        question:
            "What alternative technique is being explored to reduce pick-and-place damage?",

        answers: [
            "Self-assembly techniques",
            "Manual assembly by hand",
            "Skipping packaging entirely",
            "Wire bonding for every device"
        ],

        correct: 0
    },


    {
        question:
            "What happens during die attach?",

        answers: [
            "Adhesive is put on the substrate, the die is placed, then it is cured",
            "The die is wire-bonded to the package directly, with no adhesive",
            "The die is submerged in acid, then rinsed and dried in place",
            "The die is diced into many smaller pieces and re-sorted by size"
        ],

        correct: 0
    },


    {
        question:
            "Does die attach happen before or after wire bonding?",

        answers: [
            "Before the wire bonding step",
            "After the wire bonding step",
            "Simultaneously with wire bonding",
            "It is the same step as wire bonding"
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
            "Painting, gluing, and mechanical stapling",
            "Welding, riveting, and threaded screwing",
            "Freezing, boiling, and vapor evaporating"
        ],

        correct: 0
    },


    {
        question:
            "What is thermocompression bonding, in the context of wire bonding?",

        answers: [
            "A metal bond made with heat and pressure, often with gold wire",
            "A bond formed using only very cold temperatures and vacuum",
            "A chemical adhesive cured with no heat or pressure involved",
            "A bond formed by submerging the wire in salt water overnight"
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
            "In the middle of the lead frame, away from the die",
            "Inside the silicon wafer itself before it is diced",
            "On the outside of the finished package casing"
        ],

        correct: 0
    },


    {
        question:
            "What is a major advantage of flip-chip bonding over wire bonding?",

        answers: [
            "It eliminates leads, improving electrical and density performance",
            "It requires more fine wires per connection than wire bonding",
            "It only works on very large devices, bigger than a coin",
            "It eliminates the need for any substrate under the die"
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
            "By freezing the entire assembly to shatter the solder",
            "By applying a strong magnetic field across the solder bumps",
            "By submerging the whole assembly in a bath of hot oil"
        ],

        correct: 0
    },


    {
        question:
            "In the flip-chip MEMS glass-substrate example, what is deposited on the movable polysilicon MEMS plate first?",

        answers: [
            "A layer of photopolymer",
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
            "The sacrificial etch channels",
            "The final color of the package",
            "The overall thickness of the die",
            "The wire-bonding pad locations"
        ],

        correct: 0
    },


    {
        question:
            "What is deposited to form the protective shell in this encapsulation process?",

        answers: [
            "A nitride shell layer",
            "A layer of pure aluminum",
            "A thick layer of rubber",
            "A thin layer of wood"
        ],

        correct: 0
    },


    {
        question:
            "What happens after all sacrificial PSG inside the shell is removed?",

        answers: [
            "Supercritical CO2 drying, then a global LPCVD seal",
            "The entire wafer is discarded and the run restarted",
            "The shell is immediately shattered by the pressure",
            "Nothing further happens, and the wafer is left as-is"
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
            "Wafer-level packaging via thermally released membranes",
            "Standard plastic injection overmolding of each finished die",
            "Manual hand-soldering of each package by a technician",
            "Room-temperature adhesive bonding of a separate glass lid"
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
            "A rigid, opaque, positive-tone metal-filled polymer",
            "A polymer that conducts electricity like copper",
            "A polymer that dissolves instantly in plain water"
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
            "The sacrificial polymer decomposes, forming the air cavity",
            "The wafer is diced into individual chips and sorted",
            "Wire bonding is performed on every die on the wafer",
            "The final metal layer is removed from the whole wafer"
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
            "A conformal metal coating hermetically seals it; the insulator maintains isolation",
            "It strips the package away to save weight; the insulator glues the die down",
            "It dissolves the MEMS device on purpose; the insulator speeds up the etch",
            "It converts the device to a purely optical one; the insulator acts as a lens"
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
            "Packaging (dicing, attach, interconnection, encapsulation, testing)",
            "Nothing further is needed once the wafer has been fabricated",
            "The device must be entirely re-fabricated from scratch again",
            "The device is immediately discarded once fabrication is done"
        ],

        correct: 0
    },


    {
        question:
            "Which comes first in a typical packaging flow: die attach or wire bonding?",

        answers: [
            "Die attach comes first",
            "Wire bonding comes first",
            "They always happen together",
            "Neither step is ever required"
        ],

        correct: 0
    },


    {
        question:
            "Why might a designer choose flip-chip bonding over wire bonding for a MEMS device?",

        answers: [
            "Better electrical performance, lower cost, and faster prototyping",
            "Because it requires far more wires per connection than wire bonding",
            "Because it is always more expensive and slower to prototype",
            "Because it eliminates the need for a substrate entirely"
        ],

        correct: 0
    },


    {
        question:
            "Which wafer-bonding approach is well suited to creating a sealed vacuum reference for a pressure sensor?",

        answers: [
            "Wafer-level bonding, such as direct wafer bonding",
            "Wire bonding with gold wire to the die pads",
            "Flip-chip bonding of the die onto solder bumps",
            "Pick and place of the die onto a lead-frame post"
        ],

        correct: 0
    },


    {
        question:
            "In the metal-organic membrane case study, which phase actually forms the air cavity that lets the MEMS structure move freely?",

        answers: [
            "Phase 3, thermal decomposition of the sacrificial polymer",
            "Phase 1, cavity formation using a sacrificial layer",
            "Phase 2, polymer cap formation over the cavity layer",
            "Phase 4, metallization to hermetically seal the cap"
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
            "A poorly packaged device can fail even if it was fabricated correctly",
            "Packaging has no real effect on a device's performance or lifetime",
            "Fabrication quality becomes irrelevant once packaging begins",
            "Packaging is always simpler and less important than fabrication"
        ],

        correct: 0
    },


    {
        question:
            "What overall theme connects wafer bonding, encapsulation, and the metal-organic membrane case study?",

        answers: [
            "Sealing sensitive parts from the environment while still connecting electrically",
            "Making every MEMS device as large and heavy as physically possible",
            "Avoiding any form of electrical connection to the outside world",
            "Eliminating the need for any sacrificial layers in every process"
        ],

        correct: 0
    }

];


/*
    Looked up by numeric lesson id - lets the practice
    page pull any lesson's questions without a giant
    if/else chain.
*/

const allLessonQuestions = {
    1: lesson1Questions,
    2: lesson2Questions,
    3: lesson3Questions,
    4: lesson4Questions,
    5: lesson5Questions,
    6: lesson6Questions,
    7: lesson7Questions,
    8: lesson8Questions,
    9: lesson9Questions,
    10: lesson10Questions,
    11: lesson11Questions,
    12: lesson12Questions,
    13: lesson13Questions,
    14: lesson14Questions,
    15: lesson15Questions,
    16: lesson16Questions,
    17: lesson17Questions,
    18: lesson18Questions,
    19: lesson19Questions,
    20: lesson20Questions,
    21: lesson21Questions,
    22: lesson22Questions,
    23: lesson23Questions,
    24: lesson24Questions,
    25: lesson25Questions,
    26: lesson26Questions,
    27: lesson27Questions,
    28: lesson28Questions,
    29: lesson29Questions,
    30: lesson30Questions,
    31: lesson31Questions,
    32: lesson32Questions,
    33: lesson33Questions,
    34: lesson34Questions,
    35: lesson35Questions,
    36: lesson36Questions,
    37: lesson37Questions,
    38: lesson38Questions,
    39: lesson39Questions,
    40: lesson40Questions,
    41: lesson41Questions,
    42: lesson42Questions,
    43: lesson43Questions,
    44: lesson44Questions,
    45: lesson45Questions,
    46: lesson46Questions,
    47: lesson47Questions,
    48: lesson48Questions,
    49: lesson49Questions,
    50: lesson50Questions,
    51: lesson51Questions,
    52: lesson52Questions,
    53: lesson53Questions,
    54: lesson54Questions
};

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

    questionText.innerHTML =
        fabFormatMath(question.question);

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

        button.innerHTML =
            fabFormatMath(question.answers[originalIndex]);

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


/* ========================================
   MISTAKE TRACKING
   Powers the "questions you get wrong most"
   practice sessions.
======================================== */

function getMistakeCounts() {

    return (
        JSON.parse(
            localStorage.getItem("fabPathMistakes")
        ) || {}
    );
}


function adjustMistakeCount(lessonId, questionIndex, delta) {

    const mistakes =
        getMistakeCounts();

    const key =
        `${lessonId}_${questionIndex}`;

    const current =
        mistakes[key] || 0;

    const next =
        Math.max(0, current + delta);

    if (next === 0) {

        delete mistakes[key];

    } else {

        mistakes[key] = next;
    }

    localStorage.setItem(
        "fabPathMistakes",
        JSON.stringify(mistakes)
    );
}


function getMistakeCount(lessonId, questionIndex) {

    const mistakes =
        getMistakeCounts();

    return mistakes[`${lessonId}_${questionIndex}`] || 0;
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

                adjustMistakeCount(
                    currentLesson,
                    currentQuestion,
                    1
                );
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

    return `fabPathStudy${unitId}Complete`;
}


function isLessonComplete(lessonId) {

    return (
        localStorage.getItem(
            getLessonCompletionKey(lessonId)
        ) === "true"
    );
}


function isUnitStudyComplete(unitId) {

    if (
        localStorage.getItem(
            getUnitStudyCompletionKey(unitId)
        ) === "true"
    ) {
        return true;
    }

    /*
        Study modules were split into shorter units after
        some progress was saved. Finished lessons count as a
        finished study module, and so does the old
        whole-part study module.
    */

    const unit =
        courseData.find(function (u) {
            return u.id === unitId;
        });

    if (!unit) {

        return false;
    }

    if (
        unit.lessons.some(function (lesson) {
            return isLessonComplete(lesson.id);
        })
    ) {
        return true;
    }

    const part =
        typeof courseParts === "undefined"
            ? null
            : courseParts.find(function (p) {
                return unitId >= p.firstUnitId && unitId <= p.lastUnitId;
            });

    return (
        !!part &&
        localStorage.getItem(
            `fabPathUnit${part.id}StudyComplete`
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
                    UNIT ${unit.id} · STUDY
                </span>

                <h3>
                    ${unit.studyModule.title}
                </h3>

                <p>
                    A few quick slides, then the
                    Fab Challenge${unit.lessons.length > 1 ? "s" : ""}.
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
                    FAB CHALLENGE ${lesson.id}
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

            const part =
                typeof courseParts === "undefined"
                    ? null
                    : courseParts.find(function (p) {
                        return p.firstUnitId === unit.id;
                    });

            if (part) {

                html += `
                    <div class="unit-banner">

                        <span>
                            PART ${part.id} · UNITS ${part.firstUnitId}–${part.lastUnitId}
                        </span>

                        <h2>
                            ${part.title}
                        </h2>

                        <p>
                            ${part.description}
                        </p>

                    </div>
                `;

            } else {

                html += `<div class="vertical-path"></div>`;
            }


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


    let completedLessons = 0;
    let totalLessons = 0;

    if (typeof courseData !== "undefined") {

        completedLessons +=
            getCompletedLessonCount();

        totalLessons +=
            getAllLessons().length;
    }

    if (typeof supercapCourseData !== "undefined") {

        completedLessons +=
            getSupercapCompletedLessonCount();

        totalLessons +=
            getSupercapAllLessons().length;
    }

    if (typeof fetCourseData !== "undefined") {

        completedLessons +=
            getFetCompletedLessonCount();

        totalLessons +=
            getFetAllLessons().length;
    }

    if (typeof chipCourseData !== "undefined") {

        completedLessons +=
            getChipCompletedLessonCount();

        totalLessons +=
            getChipAllLessons().length;
    }

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


/* ========================================
   GAMES HUB PAGE
======================================== */

function loadGamesPage() {

    /*
        Every game is playable right away - no lesson
        gating. Just point each card at its game page.
    */

    for (let gameNumber = 1; gameNumber <= 8; gameNumber++) {

        const card =
            document.getElementById(`game${gameNumber}Card`);

        if (!card) {
            continue;
        }

        const badge =
            document.getElementById(`game${gameNumber}Badge`);

        const cta =
            document.getElementById(`game${gameNumber}CTA`);

        card.classList.remove("locked");
        card.classList.add("playable");

        card.href =
            `game${gameNumber}.html`;

        if (badge) {

            badge.textContent =
                "PLAY";
        }

        if (cta) {

            cta.textContent =
                "Play now →";
        }
    }
}

loadGamesPage();

/* ========================================
   INDEX PAGE - COURSE CATALOG
======================================== */

function loadIndexPage() {

    const grid =
        document.getElementById("courseCatalogGrid");

    if (!grid) {
        return;
    }

    if (typeof coursesData === "undefined") {
        return;
    }

    grid.innerHTML =
        coursesData.map(function (course) {

            if (course.status !== "live") {

                return `
                    <div class="game-hub-card coming-soon">

                        <span class="game-hub-badge">
                            COMING SOON
                        </span>

                        <div class="game-hub-icon">
                            ${course.icon}
                        </div>

                        <h3>${course.title}</h3>

                        <p>${course.description}</p>

                        <span class="game-hub-cta">
                            Coming soon
                        </span>

                    </div>
                `;
            }

            let percent = 0;

            if (
                course.id === "mems" &&
                typeof courseData !== "undefined"
            ) {

                const totalLessons =
                    getAllLessons().length;

                const completedLessons =
                    getCompletedLessonCount();

                percent =
                    totalLessons === 0
                        ? 0
                        : Math.round(
                            (completedLessons / totalLessons) * 100
                        );

            } else if (
                course.id === "supercapacitors" &&
                typeof supercapCourseData !== "undefined"
            ) {

                const totalLessons =
                    getSupercapAllLessons().length;

                const completedLessons =
                    getSupercapCompletedLessonCount();

                percent =
                    totalLessons === 0
                        ? 0
                        : Math.round(
                            (completedLessons / totalLessons) * 100
                        );

            } else if (
                course.id === "biofets" &&
                typeof fetCourseData !== "undefined"
            ) {

                const totalLessons =
                    getFetAllLessons().length;

                const completedLessons =
                    getFetCompletedLessonCount();

                percent =
                    totalLessons === 0
                        ? 0
                        : Math.round(
                            (completedLessons / totalLessons) * 100
                        );

            } else if (
                course.id === "sand-to-chip" &&
                typeof chipCourseData !== "undefined"
            ) {

                const totalLessons =
                    getChipAllLessons().length;

                const completedLessons =
                    getChipCompletedLessonCount();

                percent =
                    totalLessons === 0
                        ? 0
                        : Math.round(
                            (completedLessons / totalLessons) * 100
                        );
            }

            let badge = "START";
            let cta = "Start Learning →";

            if (percent === 100) {

                /*
                    A course flagged "growing" has more units
                    on the way, so finishing everything built
                    so far isn't the same as finishing it.
                */

                badge = course.growing ? "CAUGHT UP" : "COMPLETE";
                cta = "Review →";

            } else if (percent > 0) {

                badge = `${percent}% COMPLETE`;
                cta = "Continue Learning →";
            }

            return `
                <a
                    href="${course.href}"
                    class="game-hub-card playable lesson-link"
                >
                    <span class="game-hub-badge">
                        ${badge}
                    </span>

                    <div class="game-hub-icon">
                        ${course.icon}
                    </div>

                    <h3>${course.title}</h3>

                    <p>${course.description}</p>

                    <span class="game-hub-cta">
                        ${cta}
                    </span>

                </a>
            `;

        }).join("");
}

loadIndexPage();


/* ========================================
   START EVERY PAGE AT THE TOP
   The site has smooth scrolling turned on,
   and browsers like to restore the old scroll
   position. Together those left learners stuck
   partway down a page after leaving a unit or
   a Fab Challenge, and on the middle of the
   next slide or question. Every page now
   starts at the top, and moving to the next
   slide or question scrolls back up.
======================================== */

function fabScrollToTop() {

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
    });
}

if ("scrollRestoration" in history) {

    history.scrollRestoration = "manual";
}

if (!window.location.hash) {

    fabScrollToTop();
}

window.addEventListener("pageshow", function (event) {

    if (event.persisted && !window.location.hash) {

        fabScrollToTop();
    }
});

/*
    Capture phase, so the button's label is read
    before its own handler changes it. "Check Answer"
    stays where it is, so the feedback is still in
    view; "Continue" and "Finish" move on.
*/

document.addEventListener("click", function (event) {

    const button =
        event.target.closest &&
        event.target.closest(
            "#moduleNextButton, #moduleBackButton, .check-button"
        );

    if (!button) {

        return;
    }

    if (
        button.classList.contains("check-button") &&
        !/^(Continue|Finish)/.test(button.textContent.trim())
    ) {

        return;
    }

    fabScrollToTop();

}, true);
