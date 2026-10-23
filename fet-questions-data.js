/* ========================================
   TRANSISTORS COURSE QUESTIONS
   Same shape as the other courses: the
   answer order is shuffled at render time.
======================================== */


const fetLesson1Questions = [

    {
        question: "Which terminal controls the current between source and drain?",
        answers: [
            "The drain",
            "The source",
            "None of them",
            "The gate"
        ],
        correct: 3
    },

    {
        question: "What does 'field effect' mean in a field-effect transistor?",
        answers: [
            "An electric field from the gate sets the channel",
            "A magnetic field around the gate drives the current",
            "A field of transistors sharing a single gate",
            "Light falling on the field opens the channel"
        ],
        correct: 0
    },

    {
        question: "Why does a MOSFET gate draw almost no DC current?",
        answers: [
            "The gate is made of a superconducting metal",
            "An insulating oxide separates gate and channel",
            "The gate is wired straight to the ground rail",
            "The channel repels every electron at the gate"
        ],
        correct: 1
    },

    {
        question: "Besides switching, what can a MOSFET do?",
        answers: [
            "Store energy like a battery",
            "Emit light like an LED",
            "Amplify a small voltage change",
            "Produce heat like a resistor"
        ],
        correct: 2
    },

    {
        question: "What makes the insulated gate attractive for sensing?",
        answers: [
            "It generates its own power from ambient light",
            "It emits a signal that needs no circuit at all",
            "It is immune to any changes at its surface",
            "It responds to charge near the gate surface"
        ],
        correct: 3
    }

];


const fetLesson2Questions = [

    {
        question: "What does n-type doping add to silicon?",
        answers: [
            "Extra holes from acceptor atoms",
            "Extra neutrons in the lattice",
            "Extra free electrons from donors",
            "Extra oxide grown on the surface"
        ],
        correct: 2
    },

    {
        question: "Which dopants make holes the majority carrier?",
        answers: [
            "Donors such as phosphorus",
            "Donors such as arsenic",
            "Insulators such as oxygen",
            "Acceptors such as boron"
        ],
        correct: 3
    },

    {
        question: "In p-type silicon with N_A = 10¹⁶ cm⁻³ and nᵢ = 10¹⁰ cm⁻³, about how many electrons are there per cm³?",
        answers: [
            "About 10⁴",
            "About 10¹⁶",
            "About 10¹⁰",
            "About 10²²"
        ],
        correct: 0
    },

    {
        question: "What is the depletion region of a p–n junction?",
        answers: [
            "A region packed with extra free carriers",
            "A zone with few carriers and fixed ions",
            "A metal layer that joins the two sides",
            "An oxide film grown over the junction"
        ],
        correct: 1
    },

    {
        question: "Why are electrons generally faster than holes in silicon?",
        answers: [
            "Their charge magnitude is larger",
            "They are heavier, so carry more current",
            "Their mobility is higher in silicon",
            "They are attracted to the oxide"
        ],
        correct: 2
    }

];


const fetLesson3Questions = [

    {
        question: "What separates the gate from the silicon in a MOSFET?",
        answers: [
            "A thin layer of metal",
            "A very thin insulating oxide",
            "A reverse-biased p–n junction",
            "A wide gap filled with air"
        ],
        correct: 1
    },

    {
        question: "In an NMOS transistor, what type are the source and drain regions?",
        answers: [
            "Heavily doped p-type, or p⁺",
            "Undoped intrinsic silicon",
            "Heavily doped n-type, or n⁺",
            "Lightly doped p-type silicon"
        ],
        correct: 2
    },

    {
        question: "What carries current in the channel of a PMOS transistor?",
        answers: [
            "Electrons",
            "Protons",
            "Photons",
            "Holes"
        ],
        correct: 3
    },

    {
        question: "How does a larger W/L change the drain current at the same bias?",
        answers: [
            "It increases the current",
            "It decreases the current",
            "It has no effect at all",
            "It reverses the current direction"
        ],
        correct: 0
    },

    {
        question: "What does CMOS combine on one chip?",
        answers: [
            "Metal and plastic transistors",
            "NMOS and PMOS transistors",
            "Two identical NMOS transistors",
            "Bipolar and vacuum devices"
        ],
        correct: 1
    }

];


const fetLesson4Questions = [

    {
        question: "What is the oxide capacitance per unit area?",
        answers: [
            "C_ox = ε_ox / t_ox",
            "C_ox = ε_ox · t_ox",
            "C_ox = t_ox / ε_ox",
            "C_ox = ε_ox / t_ox²"
        ],
        correct: 0
    },

    {
        question: "What happens to C_ox if the oxide thickness is halved?",
        answers: [
            "It halves",
            "It doubles",
            "It stays put",
            "It quadruples"
        ],
        correct: 1
    },

    {
        question: "In a p-type MOS capacitor, which state occurs at a strongly negative gate voltage?",
        answers: [
            "Depletion",
            "Inversion",
            "Accumulation",
            "Breakdown"
        ],
        correct: 2
    },

    {
        question: "What gathers at the surface of a p-type body in inversion?",
        answers: [
            "Holes forming a p-type layer",
            "Dopant atoms pulled from the lattice",
            "Oxide molecules from the gate",
            "Electrons forming an n-type layer"
        ],
        correct: 3
    },

    {
        question: "About how much band bending marks strong inversion?",
        answers: [
            "Twice the Fermi potential",
            "Zero, at the flat-band point",
            "Half the Fermi potential",
            "Five times the band gap"
        ],
        correct: 0
    }

];


const fetLesson5Questions = [

    {
        question: "What is the threshold voltage of an NMOS transistor?",
        answers: [
            "The drain voltage where the device breaks down",
            "The gate voltage where the oxide melts",
            "The source voltage where the current reverses",
            "The gate voltage where an inversion channel forms"
        ],
        correct: 3
    },

    {
        question: "What happens to an NMOS threshold when positive charge is added at the oxide–silicon interface?",
        answers: [
            "It shifts lower",
            "It shifts higher",
            "It doesn't change",
            "It becomes infinite"
        ],
        correct: 0
    },

    {
        question: "With Q = 10¹² e/cm² at the interface and C_ox = 0.345 µF/cm², about what is |ΔVth|?",
        answers: [
            "About 4.6 V",
            "About 0.46 V",
            "About 0.046 V",
            "About 46 V"
        ],
        correct: 1
    },

    {
        question: "Which change raises the threshold voltage of an NMOS transistor?",
        answers: [
            "Adding positive oxide charge",
            "Raising the chip temperature",
            "Raising the substrate doping",
            "Making the gate oxide thinner"
        ],
        correct: 2
    },

    {
        question: "What is a depletion-mode MOSFET?",
        answers: [
            "One that never forms any channel",
            "One with no gate terminal at all",
            "One that only works in the dark",
            "One with a channel at zero gate bias"
        ],
        correct: 3
    }

];


const fetLesson6Questions = [

    {
        question: "In which region is the channel pinched off, with the current roughly flat against VDS?",
        answers: [
            "Cutoff",
            "Triode",
            "Saturation",
            "Breakdown"
        ],
        correct: 2
    },

    {
        question: "In saturation, doubling the overdrive (VGS − Vth) changes the current by what factor?",
        answers: [
            "Two times",
            "Eight times",
            "No change",
            "Four times"
        ],
        correct: 3
    },

    {
        question: "With μC_ox = 100 µA/V², W/L = 10, and 0.5 V of overdrive, what is the saturation current?",
        answers: [
            "125 µA",
            "250 µA",
            "62.5 µA",
            "500 µA"
        ],
        correct: 0
    },

    {
        question: "In the triode region, a MOSFET behaves most like what?",
        answers: [
            "A constant current source",
            "A gate-tuned resistor",
            "A fixed open circuit",
            "An ideal voltage source"
        ],
        correct: 1
    },

    {
        question: "An NMOS is in saturation when VDS is at least what?",
        answers: [
            "VGS + Vth",
            "Vth alone",
            "VGS − Vth",
            "Twice VGS"
        ],
        correct: 2
    }

];


const fetLesson7Questions = [

    {
        question: "What is transconductance?",
        answers: [
            "The change in gate voltage per change in drain current",
            "The change in drain current per change in gate voltage",
            "The ratio of drain voltage to source voltage",
            "The total power delivered by the gate"
        ],
        correct: 1
    },

    {
        question: "With μC_ox = 100 µA/V², W/L = 10, and 0.5 V of overdrive, what is g_m in saturation?",
        answers: [
            "5 mS",
            "0.05 mS",
            "0.5 mS",
            "50 mS"
        ],
        correct: 2
    },

    {
        question: "What is the best-case subthreshold swing of a conventional MOSFET at room temperature?",
        answers: [
            "About 6 mV per decade",
            "About 600 mV per decade",
            "About 6 V per decade",
            "About 60 mV per decade"
        ],
        correct: 3
    },

    {
        question: "On a transfer curve, what does surface charge binding at the gate do?",
        answers: [
            "Slides the curve sideways along VGS",
            "Flips the whole curve upside down",
            "Deletes the subthreshold region",
            "Turns the NMOS into a PMOS device"
        ],
        correct: 0
    },

    {
        question: "Why is the subthreshold region attractive for sensing?",
        answers: [
            "The current is largest of all there",
            "Current responds exponentially to the gate",
            "The transistor is fully off, so silent",
            "Noise disappears completely in that region"
        ],
        correct: 1
    }

];



const fetLesson8Questions = [

    {
        question: "What replaces the metal gate in an ISFET?",
        answers: [
            "A solution with a reference electrode",
            "A second layer of doped silicon",
            "A thin film of pure water alone",
            "A vacuum gap with a metal probe"
        ],
        correct: 0
    },

    {
        question: "What sets the gate voltage in an ISFET measurement?",
        answers: [
            "A metal plate bonded to the drain",
            "A reference electrode in solution",
            "The solution's pH by itself",
            "The source's own doping profile"
        ],
        correct: 1
    },

    {
        question: "Which part of an ISFET touches the solution?",
        answers: [
            "The heavily doped source junction",
            "The silicon body contact",
            "The sensing insulator surface",
            "The metal drain interconnect"
        ],
        correct: 2
    },

    {
        question: "Which term in an ISFET's threshold voltage depends on the solution's pH?",
        answers: [
            "The silicon's intrinsic work function",
            "The fixed thickness of the oxide",
            "The channel length of the device",
            "The surface potential ψ_0 at the oxide"
        ],
        correct: 3
    },

    {
        question: "Why can ordinary MOSFET equations still describe an ISFET?",
        answers: [
            "The channel is the same; only the gate differs",
            "The solution behaves as a perfect metal wire",
            "ISFETs have no threshold voltage of any kind",
            "The equations never depend on the gate voltage"
        ],
        correct: 0
    }

];


const fetLesson9Questions = [

    {
        question: "What covers an oxide surface in water?",
        answers: [
            "Bare silicon atoms with no bonds at all",
            "A dense layer of free surface electrons",
            "A film of frozen water molecules only",
            "Hydroxyl groups that gain or lose protons"
        ],
        correct: 3
    },

    {
        question: "Above its point of zero charge, an oxide surface is on average what?",
        answers: [
            "Negatively charged",
            "Positively charged",
            "Electrically neutral",
            "Fully hydrogen-terminated"
        ],
        correct: 0
    },

    {
        question: "Compared with the bulk, what is the proton concentration next to a negatively charged surface?",
        answers: [
            "Lower, because protons are repelled",
            "Higher, because protons are attracted",
            "Exactly the same as the bulk",
            "Zero, because protons cannot enter"
        ],
        correct: 1
    },

    {
        question: "Which reaction gives a silica surface a negative charge?",
        answers: [
            "SiOH + H⁺ → SiOH₂⁺",
            "SiO⁻ + H⁺ → SiOH",
            "SiOH → SiO⁻ + H⁺",
            "SiOH₂⁺ → SiOH + H⁺"
        ],
        correct: 2
    },

    {
        question: "About how many hydroxyl sites does a fully hydroxylated silica surface hold per square nanometer?",
        answers: [
            "About 500",
            "About 0.05",
            "Exactly 1",
            "About 5"
        ],
        correct: 3
    }

];


const fetLesson10Questions = [

    {
        question: "What does the Debye length describe?",
        answers: [
            "The thickness of the insulating gate oxide",
            "The distance between source and drain contacts",
            "The reach of a surface's potential in solution",
            "The depth of the silicon depletion region"
        ],
        correct: 2
    },

    {
        question: "What happens to the Debye length as the salt concentration rises?",
        answers: [
            "It gets longer",
            "It stays the same",
            "It flips sign",
            "It gets shorter"
        ],
        correct: 3
    },

    {
        question: "At room temperature, about what is the Debye length in a 100 mM solution of a simple 1:1 salt?",
        answers: [
            "About 1 nm",
            "About 10 nm",
            "About 100 nm",
            "About 0.01 nm"
        ],
        correct: 0
    },

    {
        question: "Which part of the double layer is the compact layer of ions right at the surface?",
        answers: [
            "The diffuse layer",
            "The Stern layer",
            "The depletion layer",
            "The inversion layer"
        ],
        correct: 1
    },

    {
        question: "Why does the double layer add little to an ISFET's total gate capacitance?",
        answers: [
            "Its capacitance is far smaller than the oxide's",
            "It carries no electric charge whatsoever",
            "Its capacitance is far larger than the oxide's",
            "It is wired in parallel with the source"
        ],
        correct: 2
    }

];


const fetLesson11Questions = [

    {
        question: "What is the Nernst limit for pH sensitivity at 25 °C?",
        answers: [
            "About 5.9 mV per pH unit",
            "About 59 mV per pH unit",
            "About 590 mV per pH unit",
            "About 1.2 V per pH unit"
        ],
        correct: 1
    },

    {
        question: "An ISFET has α = 0.8. About how sensitive is it at 25 °C?",
        answers: [
            "About 74 mV per pH unit",
            "About 59 mV per pH unit",
            "About 47 mV per pH unit",
            "About 0.8 mV per pH unit"
        ],
        correct: 2
    },

    {
        question: "For an NMOS ISFET, what happens to the threshold voltage as pH rises?",
        answers: [
            "It falls, as the surface turns more positive",
            "It stays at one fixed value at every pH",
            "It flips sign as the pH crosses 7",
            "It rises, as the surface turns more negative"
        ],
        correct: 3
    },

    {
        question: "A sensor responds at 53 mV per pH unit. How far does Vth move when pH goes from 7.0 to 7.4?",
        answers: [
            "About 21 mV",
            "About 53 mV",
            "About 130 mV",
            "About 2 mV"
        ],
        correct: 0
    },

    {
        question: "Which sensing insulator typically responds closest to the Nernst limit?",
        answers: [
            "Silicon dioxide, SiO₂",
            "Tantalum pentoxide, Ta₂O₅",
            "Bare, unoxidized silicon",
            "A thick polymer film"
        ],
        correct: 1
    }

];


const fetLesson12Questions = [

    {
        question: "What is the reference electrode's job in an ISFET measurement?",
        answers: [
            "Hold the solution at a stable, known potential",
            "Supply the current that flows to the drain",
            "Measure the temperature of the solution",
            "Grow a fresh oxide layer on the gate"
        ],
        correct: 0
    },

    {
        question: "Which electrode is a common stable reference?",
        answers: [
            "Copper/copper oxide (Cu/CuO)",
            "Silver/silver chloride (Ag/AgCl)",
            "Aluminum/aluminum oxide (Al/Al₂O₃)",
            "Carbon/carbon dioxide (C/CO₂)"
        ],
        correct: 1
    },

    {
        question: "In constant-current mode, what does the circuit report?",
        answers: [
            "The drain current at a fixed gate voltage",
            "The temperature of the sample chip",
            "The gate voltage needed to hold ID fixed",
            "The thickness of the sensing insulator"
        ],
        correct: 2
    },

    {
        question: "Why is a bare-wire pseudo-reference attractive despite being less stable?",
        answers: [
            "It is more stable than Ag/AgCl",
            "It is immune to chloride changes",
            "It needs no solution to work",
            "It is tiny and easy to integrate"
        ],
        correct: 3
    },

    {
        question: "With a swing of 70 mV per decade, a 21 mV threshold shift changes ID by about what factor?",
        answers: [
            "About 2×",
            "About 20×",
            "About 200×",
            "About 1.02×"
        ],
        correct: 0
    }

];


const fetLesson13Questions = [

    {
        question: "What is drift in an ISFET?",
        answers: [
            "A sudden jump when the pH changes",
            "Random noise on the drain current",
            "A shift in the sensor's color",
            "A slow one-way creep at constant pH"
        ],
        correct: 3
    },

    {
        question: "What does hysteresis mean for a pH reading?",
        answers: [
            "The reading depends on the pH the sensor saw before",
            "The reading is the same whichever way pH moves",
            "The reading is always exactly 59 mV per pH",
            "The reading disappears in buffered water"
        ],
        correct: 0
    },

    {
        question: "A sensor drifts 2 mV per hour and responds at 53 mV per pH unit. About how much pH error builds up over 10 hours?",
        answers: [
            "About 4 pH units",
            "About 0.4 pH units",
            "About 0.04 pH units",
            "About 40 pH units"
        ],
        correct: 1
    },

    {
        question: "How does the Nernst slope change from 25 °C to 37 °C?",
        answers: [
            "It falls from about 61.5 to 59 mV/pH",
            "It stays at exactly 59.2 mV/pH",
            "It rises from about 59 to 61.5 mV/pH",
            "It reverses sign above 30 °C"
        ],
        correct: 2
    },

    {
        question: "How does an ISFET–REFET pair reduce drift?",
        answers: [
            "The REFET doubles the sensor's pH sensitivity",
            "The REFET replaces the reference electrode",
            "The REFET heats the sensor to burn off drift",
            "The REFET ignores pH, so subtracting cancels drift"
        ],
        correct: 3
    }

];



const fetLesson14Questions = [

    {
        question: "What does a receptor layer add to an ISFET?",
        answers: [
            "A larger source and drain region",
            "A second independent reference electrode",
            "Selectivity for one target molecule",
            "Extra silicon for the channel"
        ],
        correct: 2
    },

    {
        question: "Which receptor is a Y-shaped protein about 10 nm across?",
        answers: [
            "An aptamer",
            "A DNA probe",
            "An enzyme",
            "An antibody"
        ],
        correct: 3
    },

    {
        question: "In a BioFET, what produces the electrical signal when the target binds?",
        answers: [
            "Its charge shifting the threshold voltage",
            "The target's color changing the oxide",
            "The target heating the source and drain",
            "The target dissolving the gate insulator"
        ],
        correct: 0
    },

    {
        question: "A negatively charged target binds to an NMOS BioFET. What happens to Vth?",
        answers: [
            "It falls, since negative charge lowers Vth",
            "It rises, since negative charge raises Vth",
            "It stays the same, since the FET ignores charge",
            "It flips sign, since NMOS becomes PMOS"
        ],
        correct: 1
    },

    {
        question: "About how much charge does each nucleotide of a DNA strand carry?",
        answers: [
            "About one positive charge",
            "About ten negative charges",
            "About one negative charge",
            "No charge at all"
        ],
        correct: 2
    }

];


const fetLesson15Questions = [

    {
        question: "What anchors a silane to an oxide surface?",
        answers: [
            "Attraction to free electrons in the oxide",
            "Reaction with surface hydroxyl groups",
            "Melting into the oxide at high heat",
            "Magnetic attraction to the silicon"
        ],
        correct: 1
    },

    {
        question: "What is the reactive tail of APTES?",
        answers: [
            "A thiol, –SH",
            "A carboxyl group, –COOH",
            "A primary amine, –NH₂",
            "A methyl group, –CH₃"
        ],
        correct: 2
    },

    {
        question: "Roughly how thick is a single APTES layer?",
        answers: [
            "About 100 nm",
            "About 10 µm",
            "About 0.01 nm",
            "About 1 nm"
        ],
        correct: 3
    },

    {
        question: "Which molecules form a self-assembled monolayer on gold?",
        answers: [
            "Thiols that bond to the gold",
            "Silanes that bond to the gold",
            "Esters that bond to the gold",
            "Salts that bond to the gold"
        ],
        correct: 0
    },

    {
        question: "At neutral pH an APTES layer is partly protonated. What does that do to an NMOS threshold?",
        answers: [
            "Raises it, from added negative charge",
            "Lowers it, from added positive charge",
            "Leaves it exactly unchanged",
            "Turns the transistor into a PMOS"
        ],
        correct: 1
    }

];


const fetLesson16Questions = [

    {
        question: "What does biotin–streptavidin binding offer as a linker?",
        answers: [
            "An extremely strong, near-permanent bond",
            "A bond that breaks at the slightest rinse",
            "A bond that only forms at 500 °C",
            "A bond that carries no specificity"
        ],
        correct: 0
    },

    {
        question: "Which crosslinker joins amine groups on the surface to amine groups on the receptor?",
        answers: [
            "Bovine serum albumin, a blocker",
            "Glutaraldehyde, a dialdehyde",
            "Tween-20, a mild detergent",
            "A gold–thiol bond, on metal"
        ],
        correct: 1
    },

    {
        question: "Why can amine coupling leave some antibodies facing the wrong way?",
        answers: [
            "Every amine sits right at the binding site",
            "The linker repels every antibody",
            "It binds at any lysine, not a set site",
            "Antibodies lack any amine groups at all"
        ],
        correct: 2
    },

    {
        question: "What does Protein A or G do for an antibody layer?",
        answers: [
            "Destroys antibodies that face the wrong way",
            "Adds a negative charge to every antibody",
            "Turns antibodies into aptamers",
            "Holds antibodies upright, binding sites out"
        ],
        correct: 3
    },

    {
        question: "What happens if receptors are packed too densely?",
        answers: [
            "Targets cannot reach all the binding sites",
            "The sensor becomes immune to noise",
            "The threshold voltage becomes exactly zero",
            "The receptors turn into a solid oxide"
        ],
        correct: 0
    }

];


const fetLesson17Questions = [

    {
        question: "What is non-specific binding?",
        answers: [
            "The target binding to its own receptor",
            "Receptors binding to each other in solution",
            "The reference electrode sticking to the wall",
            "Non-target molecules sticking to the surface"
        ],
        correct: 3
    },

    {
        question: "What does BSA do after the receptors are attached?",
        answers: [
            "Covers bare spots so less sticks",
            "Adds more receptors to the surface",
            "Dissolves the receptor layer",
            "Increases the target's charge"
        ],
        correct: 0
    },

    {
        question: "Which coating forms a hydrated brush that resists proteins?",
        answers: [
            "A bare gold film",
            "PEG or OEG chains",
            "A dry silane layer",
            "A thick oxide crust"
        ],
        correct: 1
    },

    {
        question: "How does a no-receptor twin FET help?",
        answers: [
            "It doubles the specific signal it sees",
            "It replaces the reference electrode",
            "It shows the background signal, to subtract",
            "It heats the sample to remove background"
        ],
        correct: 2
    },

    {
        question: "Why is serum harder to measure in than clean buffer?",
        answers: [
            "It contains no ions at all in solution",
            "It has a much longer Debye length",
            "It cannot conduct any current at all",
            "It holds many proteins that can stick"
        ],
        correct: 3
    }

];


const fetLesson18Questions = [

    {
        question: "What does a smaller K_D mean?",
        answers: [
            "Weaker binding",
            "Faster drift",
            "Tighter binding",
            "A larger sensor"
        ],
        correct: 2
    },

    {
        question: "At c = K_D, what fraction of receptors is occupied?",
        answers: [
            "All of them",
            "One tenth",
            "None of them",
            "One half"
        ],
        correct: 3
    },

    {
        question: "With K_D = 1 nM and c = 5 nM, about what fraction of receptors is bound?",
        answers: [
            "About 83%",
            "About 20%",
            "About 50%",
            "About 99%"
        ],
        correct: 0
    },

    {
        question: "At very low concentration, the binding time constant is roughly what?",
        answers: [
            "1 / k_on",
            "1 / k_off",
            "K_D × c",
            "Zero"
        ],
        correct: 1
    },

    {
        question: "If a full layer of bound target would shift Vth by 60 mV, what shift does 83% coverage give?",
        answers: [
            "About 60 mV",
            "About 83 mV",
            "About 50 mV",
            "About 5 mV"
        ],
        correct: 2
    }

];


const fetLesson19Questions = [

    {
        question: "Why check each functionalization step?",
        answers: [
            "Every step changes the color of the chip",
            "A failed step gives no visible sign",
            "Regulators forbid skipping any layer",
            "The transistor cannot switch otherwise"
        ],
        correct: 1
    },

    {
        question: "Roughly what water contact angle does a clean oxide show?",
        answers: [
            "About 90°, like a plain film",
            "About 150°, like a lotus leaf",
            "Under about 10°, nearly flat",
            "About 180°, a perfect bead"
        ],
        correct: 2
    },

    {
        question: "Which technique measures layer thickness to a fraction of a nanometer?",
        answers: [
            "Contact angle (water droplets)",
            "Fluorescence microscopy (glow)",
            "Continuity testing (a meter)",
            "Ellipsometry (light polarization)"
        ],
        correct: 3
    },

    {
        question: "Why is the FET's own threshold voltage a useful check?",
        answers: [
            "Each layer changes charge, so Vth steps",
            "Vth never changes during functionalization",
            "Vth only responds to the temperature",
            "Vth reports the color of each layer"
        ],
        correct: 0
    },

    {
        question: "What does XPS reveal about a surface?",
        answers: [
            "The water contact angle",
            "Which elements are present",
            "The layer's electrical noise",
            "The reference electrode potential"
        ],
        correct: 1
    }

];



const fetLesson20Questions = [

    {
        question: "As a bound charge sits higher above the surface, how does its effect on the gate change?",
        answers: [
            "It falls off exponentially",
            "It grows exponentially",
            "It stays constant at every height",
            "It flips sign after one nanometer"
        ],
        correct: 0
    },

    {
        question: "About what is the Debye length in 150 mM saline?",
        answers: [
            "About 8 nm",
            "About 0.8 nm",
            "About 80 nm",
            "About 0.08 nm"
        ],
        correct: 1
    },

    {
        question: "Which change lengthens the Debye length?",
        answers: [
            "Adding more salt to the sample",
            "Making the receptor larger",
            "Diluting the sample's salt",
            "Raising the gate voltage"
        ],
        correct: 2
    },

    {
        question: "Why do Fab fragments and nanobodies help BioFET sensing?",
        answers: [
            "They carry a much larger charge",
            "They remove ions from the sample",
            "They lengthen the Debye length directly",
            "They hold targets nearer the surface"
        ],
        correct: 3
    },

    {
        question: "A charge sits 5 nm up in 10 mM salt, where λ_D ≈ 3 nm. About how much of its effect does it keep?",
        answers: [
            "About 19%",
            "About 2%",
            "About 50%",
            "About 90%"
        ],
        correct: 0
    }

];


const fetLesson21Questions = [

    {
        question: "What is a protein's isoelectric point, pI?",
        answers: [
            "The pH where it falls apart",
            "The salt level where it precipitates",
            "The temperature where it binds best",
            "The pH where its net charge is zero"
        ],
        correct: 3
    },

    {
        question: "A protein with pI 5 binds to an NMOS BioFET in pH 7.4 buffer. What happens to Vth?",
        answers: [
            "It rises, because the protein is net negative",
            "It falls, because the protein is net positive",
            "It stays constant, because the protein is neutral",
            "It flips sign, because binding is reversible"
        ],
        correct: 0
    },

    {
        question: "Why is biotin–streptavidin a common test system?",
        answers: [
            "The pair carries no electric charge",
            "The binding is strong and highly specific",
            "The pair only binds at very high salt",
            "The pair replaces the receptor layer"
        ],
        correct: 1
    },

    {
        question: "If ΔV_max = 80 mV and c = K_D, what shift do you expect?",
        answers: [
            "About 80 mV",
            "About 8 mV",
            "About 40 mV",
            "About 160 mV"
        ],
        correct: 2
    },

    {
        question: "What should you check when a paper claims femtomolar detection?",
        answers: [
            "Which brand of chip the authors used",
            "How many authors wrote the paper",
            "Whether the plots use a log axis",
            "The sample and salt it was measured in"
        ],
        correct: 3
    }

];


const fetLesson22Questions = [

    {
        question: "What decides whether a DNA target binds a probe strongly?",
        answers: [
            "How long the wafer was baked beforehand",
            "The color of the target strand's label",
            "How closely the two sequences pair up",
            "The thickness of the gate oxide alone"
        ],
        correct: 2
    },

    {
        question: "About how much charge does a 20-nucleotide DNA strand add?",
        answers: [
            "About 20 positive charges",
            "About 2 negative charges",
            "About 200 positive charges",
            "About 20 negative charges"
        ],
        correct: 3
    },

    {
        question: "Why are measured DNA signals far smaller than the unscreened estimate?",
        answers: [
            "Ions in the sample screen the charge",
            "DNA loses its charge when it binds",
            "The gate oxide cancels the charge",
            "Hybridization removes charge from the probe"
        ],
        correct: 0
    },

    {
        question: "What does lowering the salt do to hybridization stringency?",
        answers: [
            "It lowers it, strengthening loose pairing",
            "It raises it, weakening loose pairing",
            "It has no effect on pairing",
            "It makes every strand neutral"
        ],
        correct: 1
    },

    {
        question: "What is a benefit of a PNA probe?",
        answers: [
            "Its extra negative charge doubles the signal",
            "It dissolves the gate insulator layer",
            "Its uncharged backbone suits low salt",
            "It only binds proteins and never DNA"
        ],
        correct: 2
    }

];


const fetLesson23Questions = [

    {
        question: "How is the limit of detection usually defined?",
        answers: [
            "The highest concentration the sensor can ever measure",
            "The concentration giving three times the blank noise",
            "The concentration that fills exactly half the receptors",
            "The noise level measured while the chip is unpowered"
        ],
        correct: 1
    },

    {
        question: "ΔV_max = 60 mV and σ = 0.5 mV. What fraction of receptors must be bound to reach 3σ?",
        answers: [
            "0.25",
            "0.0025",
            "0.025",
            "0.5"
        ],
        correct: 2
    },

    {
        question: "With K_D = 1 nM, a bound fraction of 0.025 corresponds to about what concentration?",
        answers: [
            "About 25 nM",
            "About 2.6 pM",
            "About 260 pM",
            "About 26 pM"
        ],
        correct: 3
    },

    {
        question: "What is the main source of low-frequency noise in FET sensors?",
        answers: [
            "Charge traps at the oxide (flicker noise)",
            "Thermal expansion of the silicon wafer",
            "Light reflecting off the gate metal",
            "Magnetic fields from the reference electrode"
        ],
        correct: 0
    },

    {
        question: "How does a larger gate area change flicker noise?",
        answers: [
            "It raises the noise level",
            "It lowers the noise level",
            "It leaves the noise unchanged",
            "It turns noise into drift"
        ],
        correct: 1
    }

];


const fetLesson24Questions = [

    {
        question: "Why are nanowire FETs sensitive to bound charge?",
        answers: [
            "Almost the whole channel is near the surface",
            "Their gates are made of solid gold metal",
            "They operate with no oxide layer at all",
            "They carry far more current than planar FETs"
        ],
        correct: 0
    },

    {
        question: "What is special about graphene as a FET channel?",
        answers: [
            "It is a thick block of doped silicon",
            "One atom thick, so all of it is surface",
            "It is a polymer gel between electrodes",
            "It is a metal wire buried in oxide"
        ],
        correct: 1
    },

    {
        question: "What is the main idea of an extended-gate design?",
        answers: [
            "The transistor is submerged in the sample",
            "The gate is extended into the drain",
            "A sensing pad in liquid wired to a dry gate",
            "The reference electrode replaces the transistor"
        ],
        correct: 2
    },

    {
        question: "How do semiconductor DNA sequencers detect a nucleotide being added?",
        answers: [
            "A camera records a bright fluorescent flash",
            "A laser measures the length of the strand",
            "A magnet lifts a tagged bead off the chip",
            "An ISFET senses the hydrogen ion released"
        ],
        correct: 3
    },

    {
        question: "Why can CMOS ISFET arrays hold so many sensors?",
        answers: [
            "They use standard chip manufacturing",
            "Each sensor is just a single molecule",
            "They need neither source nor drain",
            "They are printed on plain paper sheets"
        ],
        correct: 0
    }

];


const fetLesson25Questions = [

    {
        question: "Why is blood serum harder for a BioFET than clean buffer?",
        answers: [
            "It has no ions to conduct any current at all",
            "It is far too cold for any receptor to work",
            "It strips the oxide layer off the gate",
            "It adds proteins and salts as background"
        ],
        correct: 3
    },

    {
        question: "Which prep step lowers both the salt and the background proteins?",
        answers: [
            "Diluting the sample",
            "Concentrating the sample",
            "Filtering out particles",
            "Boiling the sample"
        ],
        correct: 0
    },

    {
        question: "Why put reference sensors on the same chip?",
        answers: [
            "They generate the gate voltage",
            "They track shared drift and variation",
            "They remove the need for any calibration",
            "They make the chip waterproof"
        ],
        correct: 1
    },

    {
        question: "What do the ASSURED criteria describe?",
        answers: [
            "How to grow a clean gate oxide layer",
            "How to choose the right silane",
            "What a good point-of-care test needs",
            "How to build a reference electrode"
        ],
        correct: 2
    },

    {
        question: "Which result best shows a BioFET responds to the target itself?",
        answers: [
            "A large signal for every sample tested",
            "A signal that appears only after the chip dries",
            "A signal that tracks the gate voltage exactly",
            "A signal for the target but not for blanks"
        ],
        correct: 3
    }

];


/*NEW-QUESTIONS-START*/
const fetLesson26Questions = [

    {
        question: "What happens to electrons in a very strong field inside a short channel?",
        answers: [
            "They keep speeding up without limit",
            "They stop moving altogether",
            "Their speed saturates near 10⁷ cm/s",
            "They turn into holes"
        ],
        correct: 2
    },


    {
        question: "In a velocity-saturated device, drain current rises with gate overdrive roughly …",
        answers: [
            "With the square",
            "Exponentially at every bias",
            "Not at all",
            "Linearly"
        ],
        correct: 3
    },


    {
        question: "How does channel-length modulation show up in output curves?",
        answers: [
            "The saturation current is perfectly flat",
            "The saturation current keeps rising slowly with V_DS",
            "The curves are shifted to negative V_DS",
            "The current falls as V_DS rises"
        ],
        correct: 1
    },


    {
        question: "What does DIBL stand for, and what does it do?",
        answers: [
            "Drain-isolated body leakage: it cuts off the drain",
            "Doped-interface bias loss: it lowers the doping",
            "Drain-induced barrier lowering: a larger V_DS lowers V_th",
            "Dielectric-induced band leveling: it flattens the bands"
        ],
        correct: 2
    },


    {
        question: "Which change helps the gate keep control of a short channel?",
        answers: [
            "A thinner gate dielectric",
            "A thicker gate dielectric",
            "Deeper, wider source and drain junctions",
            "A higher drain voltage"
        ],
        correct: 0
    }

];

const fetLesson27Questions = [

    {
        question: "What is the smallest subthreshold swing a MOSFET can have at room temperature?",
        answers: [
            "About 6 mV per decade",
            "About 60 mV per decade",
            "About 600 mV per decade",
            "Zero, if the oxide is thin enough"
        ],
        correct: 1
    },


    {
        question: "Lowering V_th by 60 mV at S = 60 mV/dec changes the off current by about …",
        answers: [
            "10 times smaller",
            "A factor of 2",
            "10 times larger",
            "It stays the same"
        ],
        correct: 2
    },


    {
        question: "Why does gate-oxide leakage rise sharply as the oxide gets thinner?",
        answers: [
            "Electrons tunnel through a thin barrier",
            "The oxide melts and becomes a conductor",
            "The gate voltage rises as the oxide thins",
            "The silicon changes to metal"
        ],
        correct: 0
    },


    {
        question: "Which technique saves leakage by cutting off a whole idle block?",
        answers: [
            "Clock gating alone",
            "Power gating",
            "Raising V_DD",
            "Lowering the oxide thickness"
        ],
        correct: 1
    },


    {
        question: "What generally happens to subthreshold leakage when a chip heats up?",
        answers: [
            "It falls to zero",
            "It does not change",
            "It reverses direction",
            "It rises quickly"
        ],
        correct: 3
    }

];

const fetLesson28Questions = [

    {
        question: "What does Moore's law describe?",
        answers: [
            "Transistor counts on a chip doubling roughly every two years",
            "The speed of light in silicon",
            "The maximum voltage of a gate oxide",
            "Electron mobility doubling every year"
        ],
        correct: 0
    },


    {
        question: "Under ideal Dennard scaling by a factor κ, what happens to power per unit chip area?",
        answers: [
            "It rises as κ cubed",
            "It stays about the same",
            "It falls as κ squared",
            "It doubles every generation"
        ],
        correct: 1
    },


    {
        question: "Why did supply voltages stop shrinking?",
        answers: [
            "Wires could not carry the lower voltage",
            "Batteries cannot supply a lower voltage",
            "Lower voltage makes oxides thicker",
            "Lowering V_th further would make leakage explode"
        ],
        correct: 3
    },


    {
        question: "What does a node name such as \"5 nm\" mean today?",
        answers: [
            "A marketing label, not a measured gate length",
            "The exact physical gate length",
            "The width of a metal wire",
            "The thickness of the gate oxide"
        ],
        correct: 0
    },


    {
        question: "What was the main response to the clock-speed plateau?",
        answers: [
            "Doubling the supply voltage",
            "Doubling the chip size",
            "More cores and specialised accelerators",
            "Cooling chips with liquid nitrogen"
        ],
        correct: 2
    }

];

const fetLesson29Questions = [

    {
        question: "In a CMOS inverter with the input held high, which transistor conducts?",
        answers: [
            "The PMOS, pulling the output high",
            "Both equally",
            "Neither",
            "The NMOS, pulling the output low"
        ],
        correct: 3
    },


    {
        question: "Why does a CMOS gate draw almost no current in a steady state?",
        answers: [
            "One of the two transistors is always off",
            "The gate oxide is a perfect insulator",
            "The supply voltage is zero",
            "Both transistors are always on"
        ],
        correct: 0
    },


    {
        question: "What does a noise margin describe?",
        answers: [
            "How loud the clock is",
            "How fast the gate switches",
            "How far an input may stray before it is misread",
            "How thick the oxide is"
        ],
        correct: 2
    },


    {
        question: "Why is the PMOS usually drawn wider than the NMOS?",
        answers: [
            "PMOS has a higher threshold",
            "PMOS needs a bigger oxide",
            "Holes carry more charge",
            "Holes are less mobile than electrons"
        ],
        correct: 3
    },


    {
        question: "When does a CMOS inverter draw its largest current?",
        answers: [
            "When the input is held at 0",
            "Briefly, when the input crosses the middle",
            "When the input is held at V_DD",
            "Only when the chip is off"
        ],
        correct: 1
    }

];

const fetLesson30Questions = [

    {
        question: "In a two-input NAND gate, how are the NMOS transistors connected?",
        answers: [
            "In parallel",
            "Not connected to each other",
            "In series",
            "Only one of them is used"
        ],
        correct: 2
    },


    {
        question: "In a two-input NOR gate, how are the PMOS transistors connected?",
        answers: [
            "In parallel",
            "Each in its own gate",
            "They are not used",
            "In series"
        ],
        correct: 3
    },


    {
        question: "Why is NAND called a universal gate?",
        answers: [
            "It is the fastest gate",
            "Any logic function can be built from NANDs alone",
            "It uses the fewest transistors",
            "It never leaks"
        ],
        correct: 1
    },


    {
        question: "How does dynamic power change if V_DD is halved at the same frequency?",
        answers: [
            "It halves",
            "It stays the same",
            "It falls to about a quarter",
            "It doubles"
        ],
        correct: 2
    },


    {
        question: "What does clock gating save?",
        answers: [
            "Dynamic power in idle blocks",
            "Leakage in every block",
            "Silicon area",
            "Wire resistance"
        ],
        correct: 0
    }

];

const fetLesson31Questions = [

    {
        question: "In a common-source amplifier, what is the sign of the voltage gain?",
        answers: [
            "Positive: the output follows the input",
            "Negative: the output is inverted",
            "Zero in saturation",
            "Always exactly one"
        ],
        correct: 1
    },


    {
        question: "What must the bias do for an amplifier to work?",
        answers: [
            "Keep the transistor in cutoff",
            "Hold the drain at ground",
            "Keep the transistor in saturation through the whole signal swing",
            "Remove all current from the channel"
        ],
        correct: 2
    },


    {
        question: "Which change raises the gain A_v = −g_m·R_D?",
        answers: [
            "A larger g_m or a larger load resistor",
            "A smaller g_m and a smaller load resistor",
            "A thicker gate oxide only",
            "Removing the bias entirely"
        ],
        correct: 0
    },


    {
        question: "How does a current mirror copy a current?",
        answers: [
            "A capacitor stores the current and releases it",
            "Two matched transistors share a gate voltage, and current scales with width",
            "A resistor splits the current into equal parts",
            "A diode flips the current direction"
        ],
        correct: 1
    },


    {
        question: "Why does the intrinsic gain g_m·r_o fall in very short transistors?",
        answers: [
            "The gate oxide becomes a conductor",
            "The threshold voltage becomes negative",
            "The source and drain merge into one",
            "Channel-length modulation lowers the output resistance"
        ],
        correct: 3
    }

];

const fetLesson32Questions = [

    {
        question: "How many transistors are in a standard SRAM cell?",
        answers: [
            "Six",
            "One",
            "Two",
            "Twelve"
        ],
        correct: 0
    },


    {
        question: "Why does a DRAM cell need to be refreshed?",
        answers: [
            "Its transistor wears out every second",
            "Its stored charge leaks away",
            "The bit lines drift in voltage",
            "The word line forgets its address"
        ],
        correct: 1
    },


    {
        question: "What is the main memory of most computers made of?",
        answers: [
            "SRAM",
            "Flash",
            "Magnetic tape",
            "DRAM"
        ],
        correct: 3
    },


    {
        question: "What does the word line do in an SRAM cell?",
        answers: [
            "Turns on the access transistors that connect the cell to the bit lines",
            "Supplies power to the cell",
            "Stores the bit",
            "Cools the transistors"
        ],
        correct: 0
    },


    {
        question: "What happens to DRAM retention time as the chip heats up?",
        answers: [
            "It gets longer",
            "It stays the same",
            "It gets shorter, so refresh must be more frequent",
            "It becomes infinite"
        ],
        correct: 2
    }

];

const fetLesson33Questions = [

    {
        question: "What stores the bit in a floating-gate Flash cell?",
        answers: [
            "A tiny capacitor that leaks away",
            "A latch of six transistors",
            "A magnetised metal layer",
            "Electrons trapped on a floating gate"
        ],
        correct: 3
    },


    {
        question: "How does stored charge change the transistor?",
        answers: [
            "It shifts the threshold voltage",
            "It changes the gate length",
            "It swaps the source and drain",
            "It thickens the oxide"
        ],
        correct: 0
    },


    {
        question: "Why does storing more bits per cell shorten its life?",
        answers: [
            "More bits need more voltage, which melts the cell",
            "The cell gets physically larger",
            "The levels are closer together, so wear causes errors sooner",
            "Extra bits are stored in the wires"
        ],
        correct: 2
    },


    {
        question: "What is 3D NAND?",
        answers: [
            "A flat sheet of memory that rotates",
            "A memory made of three separate chips",
            "A cell with three gates side by side",
            "Cells stacked vertically in tall strings"
        ],
        correct: 3
    },


    {
        question: "How is a Flash cell erased?",
        answers: [
            "The chip is heated above 400 °C",
            "A reversed field pulls electrons off the gate",
            "Only the drain is grounded",
            "The oxide is thinned"
        ],
        correct: 1
    }

];

const fetLesson34Questions = [

    {
        question: "Why replace SiO₂ with a high-k dielectric?",
        answers: [
            "It lowers the gate capacitance",
            "It makes the gate transparent to light",
            "It gives the same capacitance with a thicker, less leaky film",
            "It raises the supply voltage"
        ],
        correct: 2
    },


    {
        question: "What does EOT mean?",
        answers: [
            "The total thickness of the wafer",
            "The edge of the transistor",
            "The energy of tunneling",
            "The thickness of SiO₂ that would give the same capacitance"
        ],
        correct: 3
    },


    {
        question: "Why do metal gates beat polysilicon gates in thin-oxide devices?",
        answers: [
            "They are cheaper to deposit",
            "They have no depletion layer, and their work function can be tuned",
            "They conduct no current",
            "They are transparent"
        ],
        correct: 1
    },


    {
        question: "Which kind of strain helps PMOS transistors?",
        answers: [
            "Tensile",
            "None at all",
            "Compressive",
            "Shear only"
        ],
        correct: 2
    },


    {
        question: "Why was hafnium oxide chosen as the standard high-k material?",
        answers: [
            "It has a high k and is stable on silicon",
            "It is the cheapest oxide of all",
            "It conducts like a metal",
            "It is a superconductor"
        ],
        correct: 0
    }

];

const fetLesson35Questions = [

    {
        question: "How many sides of the channel does a FinFET gate cover?",
        answers: [
            "One",
            "Three",
            "Two",
            "Four"
        ],
        correct: 1
    },


    {
        question: "What gives a FinFET its drive width?",
        answers: [
            "The thickness of the wafer",
            "The length of the gate only",
            "The number of fins times (2H + W)",
            "The supply voltage"
        ],
        correct: 2
    },


    {
        question: "Why must the fin stay thin?",
        answers: [
            "So the gate can control the middle of the fin too",
            "So it uses less silicon",
            "So it conducts through its top only",
            "So the oxide can be omitted"
        ],
        correct: 0
    },


    {
        question: "What is quantized in FinFET design?",
        answers: [
            "The gate length",
            "The channel width, in whole fins",
            "The oxide thickness",
            "The supply voltage"
        ],
        correct: 1
    },


    {
        question: "What problem did the FinFET address?",
        answers: [
            "Wires that were too thin",
            "Chips that were too cold",
            "Wafers that were too thick",
            "Poor gate control and leakage in short planar channels"
        ],
        correct: 3
    }

];

const fetLesson36Questions = [

    {
        question: "How many sides of a nanosheet does a gate-all-around gate surround?",
        answers: [
            "All four",
            "One",
            "Two",
            "Three"
        ],
        correct: 0
    },


    {
        question: "How are nanosheets formed?",
        answers: [
            "Each sheet is cut from a block with a laser",
            "Alternating Si and SiGe layers are grown, then the SiGe is etched away",
            "They are grown as free wires in a solution",
            "They are printed with an inkjet"
        ],
        correct: 1
    },


    {
        question: "What advantage do nanosheets have over fins for drive current?",
        answers: [
            "They have no gate at all",
            "They need no silicon",
            "They conduct only through their top",
            "The sheet width can be tuned continuously"
        ],
        correct: 3
    },


    {
        question: "What does a CFET do?",
        answers: [
            "Stacks an n-type device on top of a p-type device",
            "Replaces silicon with copper",
            "Doubles the gate oxide thickness",
            "Removes the source and drain"
        ],
        correct: 0
    },


    {
        question: "What is backside power delivery?",
        answers: [
            "Powering the chip from a battery on the back",
            "Cooling the back of the wafer",
            "Running power rails under the transistors, freeing the front for signals",
            "A second supply for the gate only"
        ],
        correct: 2
    }

];

const fetLesson37Questions = [

    {
        question: "Why is the gate used as a mask for the source and drain implant?",
        answers: [
            "The gate is the only part that can be implanted",
            "It makes the implant deeper",
            "It removes the need for any lithography",
            "The source and drain edges then line up with the gate automatically"
        ],
        correct: 3
    },


    {
        question: "What does chemical-mechanical polishing (CMP) do?",
        answers: [
            "It polishes the surface flat",
            "It implants dopants",
            "It grows epitaxial layers",
            "It prints patterns with light"
        ],
        correct: 0
    },


    {
        question: "Why is a replacement-metal-gate flow used?",
        answers: [
            "Metals are easier to etch than polysilicon",
            "It saves a deposition step",
            "High-k and metal gates cannot survive the hottest anneals, so a placeholder is swapped in later",
            "It removes the need for spacers"
        ],
        correct: 2
    },


    {
        question: "Which structures set the distance between the gate and the source or drain?",
        answers: [
            "The wells",
            "The substrate",
            "The metal wiring",
            "The spacers"
        ],
        correct: 3
    },


    {
        question: "What is atomic layer deposition (ALD) used for?",
        answers: [
            "Etching deep holes in silicon",
            "Depositing films one atomic layer at a time",
            "Printing the pattern",
            "Measuring the wafer"
        ],
        correct: 1
    }

];

const fetLesson38Questions = [

    {
        question: "What are the three regions of an NPN bipolar transistor called?",
        answers: [
            "Source, gate and drain",
            "Anode, cathode and gate",
            "Emitter, base and collector",
            "Substrate, well and body"
        ],
        correct: 2
    },


    {
        question: "What controls the collector current of a bipolar transistor?",
        answers: [
            "The thickness of the gate oxide",
            "The drain length",
            "The substrate doping only",
            "The base-emitter voltage, through the injected base current"
        ],
        correct: 3
    },


    {
        question: "Why is the base made very thin?",
        answers: [
            "So it can store more charge",
            "So most injected carriers cross to the collector instead of recombining",
            "So the emitter can be larger",
            "So the collector can be omitted"
        ],
        correct: 1
    },


    {
        question: "How does collector current vary with V_BE?",
        answers: [
            "Linearly",
            "With the square of V_BE",
            "Exponentially: about ten times per 60 mV",
            "It does not vary"
        ],
        correct: 2
    },


    {
        question: "Which device gives more transconductance per unit current?",
        answers: [
            "The bipolar transistor",
            "A MOSFET in strong inversion",
            "They are exactly equal",
            "Neither has a transconductance"
        ],
        correct: 0
    }

];

const fetLesson39Questions = [

    {
        question: "How does a JFET's gate control the channel?",
        answers: [
            "A thin oxide capacitor inverts the surface",
            "A reverse-biased p–n junction widens its depletion layer",
            "A magnet deflects the carriers",
            "Electrons tunnel through the gate"
        ],
        correct: 1
    },


    {
        question: "What is a JFET doing at zero gate voltage?",
        answers: [
            "It is off",
            "It is oscillating",
            "It is on: it conducts at its maximum",
            "It is broken"
        ],
        correct: 2
    },


    {
        question: "What forms the two-dimensional electron gas in an AlGaN/GaN HEMT?",
        answers: [
            "Polarization at the interface, with no dopants needed",
            "Heavy donor doping in the GaN",
            "An external magnetic field",
            "Implanted boron"
        ],
        correct: 0
    },


    {
        question: "Why can electrons in a HEMT move so fast?",
        answers: [
            "They are lighter in GaN than anywhere else",
            "There are no dopant atoms in the channel to scatter them",
            "The gate pushes them along",
            "They travel in a vacuum"
        ],
        correct: 1
    },


    {
        question: "Where are GaN HEMTs commonly used?",
        answers: [
            "Digital memory arrays",
            "Fiber-optic cables",
            "Solar panel glass",
            "5G base stations, radar and fast chargers"
        ],
        correct: 3
    }

];

const fetLesson40Questions = [

    {
        question: "Why does a power transistor have a thick, lightly doped drift region?",
        answers: [
            "To hold the off-state voltage below the material's critical field",
            "To reduce the gate capacitance",
            "To make it easier to bond wires",
            "To increase the threshold voltage"
        ],
        correct: 0
    },


    {
        question: "Why do wide-bandgap materials give a lower ideal on-resistance at the same blocking voltage?",
        answers: [
            "They have no drift region at all",
            "A higher critical field allows a thinner, more heavily doped drift layer",
            "They are metals when on",
            "They have lower mobility"
        ],
        correct: 1
    },


    {
        question: "What does an IGBT combine?",
        answers: [
            "Two MOSFETs in series",
            "A JFET and a thyristor",
            "A capacitor and a diode",
            "A MOS gate controlling a bipolar output stage"
        ],
        correct: 3
    },


    {
        question: "What does the switching loss of a power switch scale with?",
        answers: [
            "The switching frequency and the energy lost per event",
            "Only the wafer thickness",
            "Only the room temperature",
            "The color of the package"
        ],
        correct: 0
    },


    {
        question: "Which device is the best match for an 800 V electric-vehicle traction inverter?",
        answers: [
            "A 5 V logic MOSFET",
            "A JFET input stage",
            "A silicon carbide MOSFET",
            "A DRAM cell"
        ],
        correct: 2
    }

];

const fetLesson41Questions = [

    {
        question: "What is a thin-film transistor deposited on?",
        answers: [
            "A silicon wafer",
            "A ceramic crucible",
            "A copper sheet",
            "Glass or plastic"
        ],
        correct: 3
    },


    {
        question: "Why does the off current of a pixel TFT matter?",
        answers: [
            "The storage capacitor has to keep its voltage between refreshes",
            "It sets the color of the pixel",
            "It makes the display lighter",
            "It controls the backlight directly"
        ],
        correct: 0
    },


    {
        question: "Which TFT material allows very low refresh rates because of its tiny off current?",
        answers: [
            "Low-temperature poly-Si",
            "A silicon wafer",
            "Oxide semiconductor (IGZO)",
            "A metal film"
        ],
        correct: 2
    },


    {
        question: "Why is crystalline silicon not used for large LCD TFTs?",
        answers: [
            "It is too fast",
            "It is transparent",
            "It cannot be doped",
            "It cannot be deposited as a crystal on glass at the low temperatures glass tolerates"
        ],
        correct: 3
    },


    {
        question: "What is the typical mobility of an amorphous-silicon TFT?",
        answers: [
            "About 1,400 cm²/V·s",
            "About 0.5 to 1 cm²/V·s",
            "About 50,000 cm²/V·s",
            "Exactly zero"
        ],
        correct: 1
    }

];

const fetLesson42Questions = [

    {
        question: "What is the rule for the band gap of a semiconducting nanotube?",
        answers: [
            "About 0.84 eV times the diameter",
            "The same for every tube",
            "About 0.84 eV divided by the diameter in nanometers",
            "Zero for all semiconducting tubes"
        ],
        correct: 2
    },


    {
        question: "When is a carbon nanotube with indices (n, m) metallic?",
        answers: [
            "When n equals 1",
            "When m equals 0 only",
            "Never",
            "When n − m is a multiple of 3"
        ],
        correct: 3
    },


    {
        question: "Why does silicon lose mobility when thinner than about 5 nm?",
        answers: [
            "It becomes a metal",
            "Carriers scatter off its rough surfaces and are confined",
            "It melts",
            "Its dopants leave"
        ],
        correct: 1
    },


    {
        question: "What makes a monolayer of MoS₂ attractive as a transistor channel?",
        answers: [
            "It has no band gap",
            "It is a metal",
            "It is about 0.65 nm thick and has a real band gap",
            "It is magnetic"
        ],
        correct: 2
    },


    {
        question: "What is a major obstacle for 2D transistors?",
        answers: [
            "High contact resistance and wafer-scale growth",
            "They are too thick",
            "They cannot be gated",
            "They are too fast to use"
        ],
        correct: 0
    }

];

const fetLesson43Questions = [

    {
        question: "Why can't a conventional MOSFET switch more steeply than about 60 mV per decade at room temperature?",
        answers: [
            "The oxide is too thick",
            "Carriers follow a thermal distribution, so current grows only so fast",
            "The gate is too short",
            "The source is too hot"
        ],
        correct: 1
    },


    {
        question: "How does a tunnel FET inject carriers?",
        answers: [
            "By thermal emission over the barrier",
            "By light absorption",
            "By band-to-band tunneling from the source valence band into the channel",
            "By ion implantation"
        ],
        correct: 2
    },


    {
        question: "What is a drawback of tunnel FETs today?",
        answers: [
            "Their on current is low",
            "They leak far more than a MOSFET",
            "They need a thicker oxide",
            "They cannot be switched off"
        ],
        correct: 0
    },


    {
        question: "What does the ferroelectric layer do in a negative-capacitance FET?",
        answers: [
            "It stores the drain current",
            "It amplifies the internal gate voltage, so S can drop below 60 mV/dec",
            "It makes the channel metallic",
            "It removes the gate"
        ],
        correct: 1
    },


    {
        question: "Why does lowering the supply voltage matter so much for power?",
        answers: [
            "Lower voltage makes transistors larger",
            "It makes wires thicker",
            "It has no effect",
            "Dynamic energy scales with the square of the voltage"
        ],
        correct: 3
    }

];

const fetLesson44Questions = [

    {
        question: "What does bias-temperature instability do to a transistor over time?",
        answers: [
            "It shifts the threshold voltage",
            "It shortens the gate",
            "It adds a terminal",
            "It turns the transistor into a diode"
        ],
        correct: 0
    },


    {
        question: "Which conditions speed up bias-temperature instability?",
        answers: [
            "Low voltage and low temperature",
            "High gate voltage and high temperature",
            "A strong magnetic field only",
            "A vacuum"
        ],
        correct: 1
    },


    {
        question: "What sets the oxide-breakdown life of a large chip?",
        answers: [
            "The average oxide",
            "The thickest oxide",
            "The wiring only",
            "The weakest oxide, like the weakest link in a chain"
        ],
        correct: 3
    },


    {
        question: "What is burn-in for?",
        answers: [
            "Stressing chips early so the weak ones fail before they ship",
            "Cleaning the wafer",
            "Printing the pattern",
            "Doping the source"
        ],
        correct: 0
    },


    {
        question: "Why does ISFET drift resemble bias-temperature instability?",
        answers: [
            "Both are caused by cosmic rays",
            "Both come from the supply wire",
            "Both involve slow charge trapping near an insulator surface",
            "Both disappear after one second"
        ],
        correct: 2
    }

];

const fetLesson45Questions = [

    {
        question: "According to Pelgrom's law, what happens to the threshold-voltage spread as the gate area increases?",
        answers: [
            "It rises with the area",
            "It does not change",
            "It vanishes at any size",
            "It falls as one over the square root of the area"
        ],
        correct: 3
    },


    {
        question: "What is random dopant fluctuation?",
        answers: [
            "The random number and positions of dopant atoms in a tiny channel",
            "A change in the supply voltage",
            "Fluctuation of the room temperature",
            "A wiring defect"
        ],
        correct: 0
    },


    {
        question: "Why do SRAM cells limit the minimum supply voltage?",
        answers: [
            "SRAM needs a high voltage to hold a bit",
            "Low voltage melts the cell",
            "Mismatch makes the weakest cells fail first at low voltage",
            "Cells are shorted at low voltage"
        ],
        correct: 2
    },


    {
        question: "Which transistor architecture comes after FinFETs in today's roadmap?",
        answers: [
            "Planar bulk transistors",
            "Vacuum tubes",
            "Bipolar junction transistors",
            "Nanosheet gate-all-around transistors"
        ],
        correct: 3
    },


    {
        question: "What does the phrase \"more than Moore\" mean?",
        answers: [
            "Doubling the clock speed",
            "Adding functions such as sensing, radio and power, not just shrinking",
            "Making transistors larger",
            "A law of thermodynamics"
        ],
        correct: 1
    }

];

/*NEW-QUESTIONS-END*/


/*
    Looked up by numeric lesson id, the same
    pattern the other courses use.
*/

const fetAllLessonQuestions = {
    1: fetLesson1Questions,
    2: fetLesson2Questions,
    3: fetLesson3Questions,
    4: fetLesson4Questions,
    5: fetLesson5Questions,
    6: fetLesson6Questions,
    7: fetLesson7Questions,
    8: fetLesson8Questions,
    9: fetLesson9Questions,
    10: fetLesson10Questions,
    11: fetLesson11Questions,
    12: fetLesson12Questions,
    13: fetLesson13Questions,
    14: fetLesson14Questions,
    15: fetLesson15Questions,
    16: fetLesson16Questions,
    17: fetLesson17Questions,
    18: fetLesson18Questions,
    19: fetLesson19Questions,
    20: fetLesson20Questions,
    21: fetLesson21Questions,
    22: fetLesson22Questions,
    23: fetLesson23Questions,
    24: fetLesson24Questions,
    25: fetLesson25Questions,
    /*NEW-MAP-START*/
    26: fetLesson26Questions,
    27: fetLesson27Questions,
    28: fetLesson28Questions,
    29: fetLesson29Questions,
    30: fetLesson30Questions,
    31: fetLesson31Questions,
    32: fetLesson32Questions,
    33: fetLesson33Questions,
    34: fetLesson34Questions,
    35: fetLesson35Questions,
    36: fetLesson36Questions,
    37: fetLesson37Questions,
    38: fetLesson38Questions,
    39: fetLesson39Questions,
    40: fetLesson40Questions,
    41: fetLesson41Questions,
    42: fetLesson42Questions,
    43: fetLesson43Questions,
    44: fetLesson44Questions,
    45: fetLesson45Questions,
    /*NEW-MAP-END*/
};
