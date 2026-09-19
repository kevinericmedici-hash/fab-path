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
    7: fetLesson7Questions
};
