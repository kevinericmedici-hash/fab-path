/* ========================================
   TRANSISTORS COURSE DATA
   Nine parts: the MOSFET fundamentals, real
   transistors and scaling, CMOS circuits and
   memory, modern architectures, the wider
   transistor family, beyond silicon and
   reliability, then the sensing parts (the
   ISFET, biofunctionalization, biosensing).

   Structure: every unit is a short study module
   (a few slides) followed by one Fab Challenge
   quiz, and lesson ids match unit ids. Parts group
   the units for orientation.

   Ids are permanent because saved progress keys
   off them. Units 26 to 45 were added later and
   sit after unit 7 in the array, so the path
   numbers units by position (see fet-script.js).
======================================== */

const fetCourseParts = [

    {
        id: 1,
        title: "MOSFET Fundamentals",
        firstUnitId: 1,
        lastUnitId: 7,
        description:
            "How a transistor works: semiconductor basics, the MOS structure, threshold voltage, and the I–V behavior that every later device builds on."
    },

    {
        id: 2,
        title: "Real Transistors: Beyond the Ideal Model",
        firstUnitId: 26,
        lastUnitId: 28,
        description:
            "Short channels, leakage, and scaling: why a real transistor departs from the textbook square law, and how Moore's law shrank it."
    },

    {
        id: 3,
        title: "CMOS Circuits & Memory",
        firstUnitId: 29,
        lastUnitId: 33,
        description:
            "From one transistor to billions: the inverter, logic gates, analog amplifiers, and the SRAM, DRAM and Flash cells that store bits."
    },

    {
        id: 4,
        title: "Modern Transistor Architecture",
        firstUnitId: 34,
        lastUnitId: 37,
        description:
            "Strain, high-k metal gates, FinFETs, nanosheets, and the process flow that builds a transistor a few dozen atoms wide."
    },

    {
        id: 5,
        title: "The Wider Transistor Family",
        firstUnitId: 38,
        lastUnitId: 41,
        description:
            "Not every transistor is a silicon MOSFET: bipolar, JFET and HEMT, power devices, and the thin-film transistors behind every display."
    },

    {
        id: 6,
        title: "Beyond Silicon & Staying Reliable",
        firstUnitId: 42,
        lastUnitId: 45,
        description:
            "Two-dimensional materials, nanotubes and steep-slope devices, then the aging and variability that decide whether chips survive."
    },

    {
        id: 7,
        title: "Sensing Ions: The ISFET",
        firstUnitId: 8,
        lastUnitId: 13,
        description:
            "Swap the metal gate for a solution: surface charge, the double layer, pH response, reference electrodes, and the real-world limits of an ion-sensitive FET."
    },

    {
        id: 8,
        title: "Biofunctionalization: Teaching the Surface",
        firstUnitId: 14,
        lastUnitId: 19,
        description:
            "Give the gate a recognition layer: receptors, silane and thiol chemistry, linkers, blocking, binding equilibrium, and how to prove each step worked."
    },

    {
        id: 9,
        title: "Biosensing: From Molecules to Measurements",
        firstUnitId: 20,
        lastUnitId: 25,
        description:
            "Put the sensor to work: Debye screening, protein and DNA detection, limit of detection, device formats, and what it takes to measure real samples."
    }

];

const fetCourseData = [

    {
        id: 1,

        title: "Transistors: Switches & Amplifiers",

        description:
            "What a transistor does, and why the field-effect version dominates.",

        studyModule: {
            title: "Transistors: Switches & Amplifiers",
            href: "fetunit1.html"
        },

        lessons: [

            {
                id: 1,
                title: "Transistors: Switches & Amplifiers",
                description:
                    "What a transistor does, and why the field-effect version dominates."
            }

        ]
    },

    {
        id: 2,

        title: "A Semiconductor Refresher",

        description:
            "Electrons, holes, doping, and the p–n junction.",

        studyModule: {
            title: "A Semiconductor Refresher",
            href: "fetunit2.html"
        },

        lessons: [

            {
                id: 2,
                title: "A Semiconductor Refresher",
                description:
                    "Electrons, holes, doping, and the p–n junction."
            }

        ]
    },

    {
        id: 3,

        title: "Anatomy of a MOSFET",

        description:
            "Gate, oxide, source, drain, body, and the NMOS and PMOS pair.",

        studyModule: {
            title: "Anatomy of a MOSFET",
            href: "fetunit3.html"
        },

        lessons: [

            {
                id: 3,
                title: "Anatomy of a MOSFET",
                description:
                    "Gate, oxide, source, drain, body, and the NMOS and PMOS pair."
            }

        ]
    },

    {
        id: 4,

        title: "The MOS Capacitor",

        description:
            "The gate-oxide-silicon capacitor and its three surface states.",

        studyModule: {
            title: "The MOS Capacitor",
            href: "fetunit4.html"
        },

        lessons: [

            {
                id: 4,
                title: "The MOS Capacitor",
                description:
                    "The gate-oxide-silicon capacitor and its three surface states."
            }

        ]
    },

    {
        id: 5,

        title: "Threshold Voltage",

        description:
            "What sets the switch-on voltage, and how charge shifts it.",

        studyModule: {
            title: "Threshold Voltage",
            href: "fetunit5.html"
        },

        lessons: [

            {
                id: 5,
                title: "Threshold Voltage",
                description:
                    "What sets the switch-on voltage, and how charge shifts it."
            }

        ]
    },

    {
        id: 6,

        title: "Current–Voltage Behavior",

        description:
            "Cutoff, triode, and saturation, with the square-law equations.",

        studyModule: {
            title: "Current–Voltage Behavior",
            href: "fetunit6.html"
        },

        lessons: [

            {
                id: 6,
                title: "Current–Voltage Behavior",
                description:
                    "Cutoff, triode, and saturation, with the square-law equations."
            }

        ]
    },

    {
        id: 7,

        title: "Transfer Curves & Sensitivity",

        description:
            "Transconductance, subthreshold swing, and why sensing lives on the transfer curve.",

        studyModule: {
            title: "Transfer Curves & Sensitivity",
            href: "fetunit7.html"
        },

        lessons: [

            {
                id: 7,
                title: "Transfer Curves & Sensitivity",
                description:
                    "Transconductance, subthreshold swing, and why sensing lives on the transfer curve."
            }

        ]
    },

    /*NEW-UNITS-START*/
    {
        id: 26,

        title: "Short-Channel Effects",

        description:
            "Why a tiny transistor leaves the textbook: the speed limit, the tilted saturation, and the drain that reaches across.",

        studyModule: {
            title: "Short-Channel Effects",
            href: "fetunit26.html"
        },

        lessons: [

            {
                id: 26,
                title: "Short-Channel Effects",
                description:
                    "Why a tiny transistor leaves the textbook: the speed limit, the tilted saturation, and the drain that reaches across."
            }

        ]
    },

    {
        id: 27,

        title: "Leakage & the Off State",

        description:
            "A transistor never turns fully off: subthreshold leakage, gate tunneling, and the speed-versus-leakage trade.",

        studyModule: {
            title: "Leakage & the Off State",
            href: "fetunit27.html"
        },

        lessons: [

            {
                id: 27,
                title: "Leakage & the Off State",
                description:
                    "A transistor never turns fully off: subthreshold leakage, gate tunneling, and the speed-versus-leakage trade."
            }

        ]
    },

    {
        id: 28,

        title: "Scaling & Moore's Law",

        description:
            "Why transistors kept shrinking, what Dennard scaling promised, and how the power wall ended the free ride.",

        studyModule: {
            title: "Scaling & Moore's Law",
            href: "fetunit28.html"
        },

        lessons: [

            {
                id: 28,
                title: "Scaling & Moore's Law",
                description:
                    "Why transistors kept shrinking, what Dennard scaling promised, and how the power wall ended the free ride."
            }

        ]
    },

    {
        id: 29,

        title: "The CMOS Inverter",

        description:
            "Pair an NMOS with a PMOS and get a gate that draws almost no current at rest and cleans up noisy signals.",

        studyModule: {
            title: "The CMOS Inverter",
            href: "fetunit29.html"
        },

        lessons: [

            {
                id: 29,
                title: "The CMOS Inverter",
                description:
                    "Pair an NMOS with a PMOS and get a gate that draws almost no current at rest and cleans up noisy signals."
            }

        ]
    },

    {
        id: 30,

        title: "Logic Gates & Power",

        description:
            "Series and parallel transistor networks make NAND and NOR, and one equation says where a chip's power goes.",

        studyModule: {
            title: "Logic Gates & Power",
            href: "fetunit30.html"
        },

        lessons: [

            {
                id: 30,
                title: "Logic Gates & Power",
                description:
                    "Series and parallel transistor networks make NAND and NOR, and one equation says where a chip's power goes."
            }

        ]
    },

    {
        id: 31,

        title: "Analog: Amplifiers & Current Mirrors",

        description:
            "Use the sloped middle of the transfer curve: a common-source amplifier, its gain, and a current mirror.",

        studyModule: {
            title: "Analog: Amplifiers & Current Mirrors",
            href: "fetunit31.html"
        },

        lessons: [

            {
                id: 31,
                title: "Analog: Amplifiers & Current Mirrors",
                description:
                    "Use the sloped middle of the transfer curve: a common-source amplifier, its gain, and a current mirror."
            }

        ]
    },

    {
        id: 32,

        title: "SRAM & DRAM",

        description:
            "The six-transistor latch and the one-transistor bucket: how chips store bits that must be read in nanoseconds.",

        studyModule: {
            title: "SRAM & DRAM",
            href: "fetunit32.html"
        },

        lessons: [

            {
                id: 32,
                title: "SRAM & DRAM",
                description:
                    "The six-transistor latch and the one-transistor bucket: how chips store bits that must be read in nanoseconds."
            }

        ]
    },

    {
        id: 33,

        title: "Flash & Nonvolatile Memory",

        description:
            "A second, floating gate traps charge and shifts the threshold, so a transistor can remember without power.",

        studyModule: {
            title: "Flash & Nonvolatile Memory",
            href: "fetunit33.html"
        },

        lessons: [

            {
                id: 33,
                title: "Flash & Nonvolatile Memory",
                description:
                    "A second, floating gate traps charge and shifts the threshold, so a transistor can remember without power."
            }

        ]
    },

    {
        id: 34,

        title: "Strain, High-k & Metal Gates",

        description:
            "Three materials upgrades that kept scaling alive: strained channels, high-k dielectrics, and metal gates.",

        studyModule: {
            title: "Strain, High-k & Metal Gates",
            href: "fetunit34.html"
        },

        lessons: [

            {
                id: 34,
                title: "Strain, High-k & Metal Gates",
                description:
                    "Three materials upgrades that kept scaling alive: strained channels, high-k dielectrics, and metal gates."
            }

        ]
    },

    {
        id: 35,

        title: "The FinFET",

        description:
            "Stand the channel on edge so the gate wraps three sides, and short channels stay under control.",

        studyModule: {
            title: "The FinFET",
            href: "fetunit35.html"
        },

        lessons: [

            {
                id: 35,
                title: "The FinFET",
                description:
                    "Stand the channel on edge so the gate wraps three sides, and short channels stay under control."
            }

        ]
    },

    {
        id: 36,

        title: "Nanosheets & Gate-All-Around",

        description:
            "Wrap the gate around every side of stacked silicon ribbons, then stack the n-type and p-type devices too.",

        studyModule: {
            title: "Nanosheets & Gate-All-Around",
            href: "fetunit36.html"
        },

        lessons: [

            {
                id: 36,
                title: "Nanosheets & Gate-All-Around",
                description:
                    "Wrap the gate around every side of stacked silicon ribbons, then stack the n-type and p-type devices too."
            }

        ]
    },

    {
        id: 37,

        title: "Making a Transistor",

        description:
            "Isolation, wells, gate, spacers, source and drain, contacts: the process flow that builds a transistor on a wafer.",

        studyModule: {
            title: "Making a Transistor",
            href: "fetunit37.html"
        },

        lessons: [

            {
                id: 37,
                title: "Making a Transistor",
                description:
                    "Isolation, wells, gate, spacers, source and drain, contacts: the process flow that builds a transistor on a wafer."
            }

        ]
    },

    {
        id: 38,

        title: "The Bipolar Transistor",

        description:
            "The original transistor: a thin base steers a large current, and the exponential makes it the gain champion.",

        studyModule: {
            title: "The Bipolar Transistor",
            href: "fetunit38.html"
        },

        lessons: [

            {
                id: 38,
                title: "The Bipolar Transistor",
                description:
                    "The original transistor: a thin base steers a large current, and the exponential makes it the gain champion."
            }

        ]
    },

    {
        id: 39,

        title: "JFETs, MESFETs & HEMTs",

        description:
            "Control a channel with a junction, a Schottky contact, or a heterojunction: the field-effect cousins of the MOSFET.",

        studyModule: {
            title: "JFETs, MESFETs & HEMTs",
            href: "fetunit39.html"
        },

        lessons: [

            {
                id: 39,
                title: "JFETs, MESFETs & HEMTs",
                description:
                    "Control a channel with a junction, a Schottky contact, or a heterojunction: the field-effect cousins of the MOSFET."
            }

        ]
    },

    {
        id: 40,

        title: "Power Transistors",

        description:
            "Block a thousand volts and carry amps: the drift region, the IGBT, and why silicon carbide and gallium nitride matter.",

        studyModule: {
            title: "Power Transistors",
            href: "fetunit40.html"
        },

        lessons: [

            {
                id: 40,
                title: "Power Transistors",
                description:
                    "Block a thousand volts and carry amps: the drift region, the IGBT, and why silicon carbide and gallium nitride matter."
            }

        ]
    },

    {
        id: 41,

        title: "Thin-Film Transistors",

        description:
            "The transistors behind every display: deposited on glass, with a leaky-bucket pixel and four very different semiconductors.",

        studyModule: {
            title: "Thin-Film Transistors",
            href: "fetunit41.html"
        },

        lessons: [

            {
                id: 41,
                title: "Thin-Film Transistors",
                description:
                    "The transistors behind every display: deposited on glass, with a leaky-bucket pixel and four very different semiconductors."
            }

        ]
    },

    {
        id: 42,

        title: "2D Materials & Carbon Nanotubes",

        description:
            "When silicon gets too thin to carry current, rolled-up and layered carbon and sulfide channels take over.",

        studyModule: {
            title: "2D Materials & Carbon Nanotubes",
            href: "fetunit42.html"
        },

        lessons: [

            {
                id: 42,
                title: "2D Materials & Carbon Nanotubes",
                description:
                    "When silicon gets too thin to carry current, rolled-up and layered carbon and sulfide channels take over."
            }

        ]
    },

    {
        id: 43,

        title: "Steep-Slope Devices",

        description:
            "The 60 mV per decade limit and two ways around it: tunneling, and a ferroelectric that amplifies the gate.",

        studyModule: {
            title: "Steep-Slope Devices",
            href: "fetunit43.html"
        },

        lessons: [

            {
                id: 43,
                title: "Steep-Slope Devices",
                description:
                    "The 60 mV per decade limit and two ways around it: tunneling, and a ferroelectric that amplifies the gate."
            }

        ]
    },

    {
        id: 44,

        title: "Reliability: Aging Transistors",

        description:
            "Bias-temperature instability, hot carriers and oxide breakdown: how transistors wear out, and why sensors drift too.",

        studyModule: {
            title: "Reliability: Aging Transistors",
            href: "fetunit44.html"
        },

        lessons: [

            {
                id: 44,
                title: "Reliability: Aging Transistors",
                description:
                    "Bias-temperature instability, hot carriers and oxide breakdown: how transistors wear out, and why sensors drift too."
            }

        ]
    },

    {
        id: 45,

        title: "Variability & the Road Ahead",

        description:
            "Why no two small transistors match, how that shapes yield and design, and where the transistor goes next.",

        studyModule: {
            title: "Variability & the Road Ahead",
            href: "fetunit45.html"
        },

        lessons: [

            {
                id: 45,
                title: "Variability & the Road Ahead",
                description:
                    "Why no two small transistors match, how that shapes yield and design, and where the transistor goes next."
            }

        ]
    },

    /*NEW-UNITS-END*/

    {
        id: 8,

        title: "From MOSFET to ISFET",

        description:
            "Swap the metal gate for a solution and a reference electrode.",

        studyModule: {
            title: "From MOSFET to ISFET",
            href: "fetunit8.html"
        },

        lessons: [

            {
                id: 8,
                title: "From MOSFET to ISFET",
                description:
                    "Swap the metal gate for a solution and a reference electrode."
            }

        ]
    },

    {
        id: 9,

        title: "Surface Charge & Site Binding",

        description:
            "How an oxide in water picks up charge, and why that charge depends on pH.",

        studyModule: {
            title: "Surface Charge & Site Binding",
            href: "fetunit9.html"
        },

        lessons: [

            {
                id: 9,
                title: "Surface Charge & Site Binding",
                description:
                    "How an oxide in water picks up charge, and why that charge depends on pH."
            }

        ]
    },

    {
        id: 10,

        title: "The Electrical Double Layer",

        description:
            "How ions in the solution screen the surface charge, and how far the screening reaches.",

        studyModule: {
            title: "The Electrical Double Layer",
            href: "fetunit10.html"
        },

        lessons: [

            {
                id: 10,
                title: "The Electrical Double Layer",
                description:
                    "How ions in the solution screen the surface charge, and how far the screening reaches."
            }

        ]
    },

    {
        id: 11,

        title: "pH Response & the Nernst Limit",

        description:
            "How much threshold shift you get per pH unit, and why 59 mV is the ceiling.",

        studyModule: {
            title: "pH Response & the Nernst Limit",
            href: "fetunit11.html"
        },

        lessons: [

            {
                id: 11,
                title: "pH Response & the Nernst Limit",
                description:
                    "How much threshold shift you get per pH unit, and why 59 mV is the ceiling."
            }

        ]
    },

    {
        id: 12,

        title: "Reference Electrodes & Readout",

        description:
            "The stable reference that sets the gate potential, and the two ways to read the signal.",

        studyModule: {
            title: "Reference Electrodes & Readout",
            href: "fetunit12.html"
        },

        lessons: [

            {
                id: 12,
                title: "Reference Electrodes & Readout",
                description:
                    "The stable reference that sets the gate potential, and the two ways to read the signal."
            }

        ]
    },

    {
        id: 13,

        title: "Drift, Hysteresis & Noise",

        description:
            "The real-world limits that separate a lab demo from a dependable sensor.",

        studyModule: {
            title: "Drift, Hysteresis & Noise",
            href: "fetunit13.html"
        },

        lessons: [

            {
                id: 13,
                title: "Drift, Hysteresis & Noise",
                description:
                    "The real-world limits that separate a lab demo from a dependable sensor."
            }

        ]
    },

    {
        id: 14,

        title: "Receptors on the Gate",

        description:
            "How a recognition layer turns an ISFET into a sensor for molecules.",

        studyModule: {
            title: "Receptors on the Gate",
            href: "fetunit14.html"
        },

        lessons: [

            {
                id: 14,
                title: "Receptors on the Gate",
                description:
                    "How a recognition layer turns an ISFET into a sensor for molecules."
            }

        ]
    },

    {
        id: 15,

        title: "Silanes & Self-Assembled Monolayers",

        description:
            "How a bare oxide gets a chemical handle, one molecular layer thick.",

        studyModule: {
            title: "Silanes & Self-Assembled Monolayers",
            href: "fetunit15.html"
        },

        lessons: [

            {
                id: 15,
                title: "Silanes & Self-Assembled Monolayers",
                description:
                    "How a bare oxide gets a chemical handle, one molecular layer thick."
            }

        ]
    },

    {
        id: 16,

        title: "Linkers & Immobilization",

        description:
            "The crosslinkers that tie receptors to the surface, and why orientation matters.",

        studyModule: {
            title: "Linkers & Immobilization",
            href: "fetunit16.html"
        },

        lessons: [

            {
                id: 16,
                title: "Linkers & Immobilization",
                description:
                    "The crosslinkers that tie receptors to the surface, and why orientation matters."
            }

        ]
    },

    {
        id: 17,

        title: "Blocking & Non-Specific Binding",

        description:
            "How to keep everything except the target off the surface.",

        studyModule: {
            title: "Blocking & Non-Specific Binding",
            href: "fetunit17.html"
        },

        lessons: [

            {
                id: 17,
                title: "Blocking & Non-Specific Binding",
                description:
                    "How to keep everything except the target off the surface."
            }

        ]
    },

    {
        id: 18,

        title: "Binding Affinity & Kinetics",

        description:
            "How much target binds at a given concentration, and how fast.",

        studyModule: {
            title: "Binding Affinity & Kinetics",
            href: "fetunit18.html"
        },

        lessons: [

            {
                id: 18,
                title: "Binding Affinity & Kinetics",
                description:
                    "How much target binds at a given concentration, and how fast."
            }

        ]
    },

    {
        id: 19,

        title: "Verifying the Layer",

        description:
            "How to prove each chemical step worked before trusting the sensor.",

        studyModule: {
            title: "Verifying the Layer",
            href: "fetunit19.html"
        },

        lessons: [

            {
                id: 19,
                title: "Verifying the Layer",
                description:
                    "How to prove each chemical step worked before trusting the sensor."
            }

        ]
    },

    {
        id: 20,

        title: "Debye Screening & Charge Detection",

        description:
            "Why salty samples hide bound charge, and what designers do about it.",

        studyModule: {
            title: "Debye Screening & Charge Detection",
            href: "fetunit20.html"
        },

        lessons: [

            {
                id: 20,
                title: "Debye Screening & Charge Detection",
                description:
                    "Why salty samples hide bound charge, and what designers do about it."
            }

        ]
    },

    {
        id: 21,

        title: "Protein Detection",

        description:
            "How antibody-based BioFETs read a protein, and why buffer pH matters.",

        studyModule: {
            title: "Protein Detection",
            href: "fetunit21.html"
        },

        lessons: [

            {
                id: 21,
                title: "Protein Detection",
                description:
                    "How antibody-based BioFETs read a protein, and why buffer pH matters."
            }

        ]
    },

    {
        id: 22,

        title: "DNA Hybridization Sensing",

        description:
            "How a probe strand captures its match, and why DNA is a natural charge signal.",

        studyModule: {
            title: "DNA Hybridization Sensing",
            href: "fetunit22.html"
        },

        lessons: [

            {
                id: 22,
                title: "DNA Hybridization Sensing",
                description:
                    "How a probe strand captures its match, and why DNA is a natural charge signal."
            }

        ]
    },

    {
        id: 23,

        title: "Signal, Noise & Limit of Detection",

        description:
            "How small a concentration a BioFET can see, and what limits it.",

        studyModule: {
            title: "Signal, Noise & Limit of Detection",
            href: "fetunit23.html"
        },

        lessons: [

            {
                id: 23,
                title: "Signal, Noise & Limit of Detection",
                description:
                    "How small a concentration a BioFET can see, and what limits it."
            }

        ]
    },

    {
        id: 24,

        title: "Nanowires, Graphene & Arrays",

        description:
            "Beyond the planar FET: the device designs used for biosensing.",

        studyModule: {
            title: "Nanowires, Graphene & Arrays",
            href: "fetunit24.html"
        },

        lessons: [

            {
                id: 24,
                title: "Nanowires, Graphene & Arrays",
                description:
                    "Beyond the planar FET: the device designs used for biosensing."
            }

        ]
    },

    {
        id: 25,

        title: "Real Samples & Reliability",

        description:
            "What it takes to turn a working prototype into a dependable measurement.",

        studyModule: {
            title: "Real Samples & Reliability",
            href: "fetunit25.html"
        },

        lessons: [

            {
                id: 25,
                title: "Real Samples & Reliability",
                description:
                    "What it takes to turn a working prototype into a dependable measurement."
            }

        ]
    }

];
