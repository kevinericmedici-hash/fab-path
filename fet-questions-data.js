/* ========================================
   BIOFETS & MOSFETS COURSE QUESTIONS
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
    19: fetLesson19Questions
};
