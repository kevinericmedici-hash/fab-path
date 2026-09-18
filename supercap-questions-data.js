/* ========================================
   SUPERCAPACITORS QUESTION BANK
   Shared by every supercaplessonN.html page
   and by supercap-practice.html, which pulls
   from these same arrays for missed-question
   review.
======================================== */

const supercapLesson1Questions = [

    {
        question: "What does a Ragone plot compare?",
        answers: [
            "Cost vs. weight",
            "Energy density vs. power density",
            "Voltage vs. current",
            "Temperature vs. pressure"
        ],
        correct: 1
    },

    {
        question: "Why do batteries typically have lower power density than capacitors?",
        answers: [
            "They use more expensive materials",
            "Their energy storage relies on slower, diffusion-controlled chemical reactions",
            "They require larger dielectrics",
            "They operate at lower voltages"
        ],
        correct: 1
    },

    {
        question: "Where do supercapacitors sit on a Ragone plot relative to batteries and capacitors?",
        answers: [
            "Below both",
            "In between, bridging the gap",
            "Above both",
            "Exactly on top of batteries"
        ],
        correct: 1
    },

    {
        question: "Roughly how much power does a cardiac pacemaker need to operate?",
        answers: [
            "10–100 µW",
            "10–100 mW",
            "1–10 W",
            "100–1000 W"
        ],
        correct: 0
    },

    {
        question: "What makes supercapacitors attractive for implantable devices that need frequent charging?",
        answers: [
            "Very low cost",
            "Long cycle life with minimal degradation over many charge-discharge cycles",
            "They require no electrolyte",
            "They only work at room temperature"
        ],
        correct: 1
    }

];


const supercapLesson2Questions = [

    {
        question: "Capacitance is mathematically defined as the ratio of what to what?",
        answers: [
            "Stored charge to applied voltage",
            "Current to resistance",
            "Energy to power",
            "Area to volume"
        ],
        correct: 0
    },

    {
        question: "In C = εA/d, what happens to capacitance if the electrode spacing (d) decreases?",
        answers: [
            "It decreases",
            "It increases",
            "It stays the same",
            "It becomes negative"
        ],
        correct: 1
    },

    {
        question: "Areal capacitance normalizes charge storage by which two things?",
        answers: [
            "Time and temperature",
            "Voltage window and electrode area",
            "Mass and volume",
            "Current and resistance"
        ],
        correct: 1
    },

    {
        question: "How does stored energy scale with voltage in E = ½C(ΔV)²?",
        answers: [
            "Linearly",
            "Inversely",
            "With the square of voltage",
            "It doesn't depend on voltage"
        ],
        correct: 2
    },

    {
        question: "Which of these is NOT one of the four ways to raise capacitance discussed in this unit?",
        answers: [
            "Increasing electrode surface area",
            "Reducing electrode spacing",
            "Increasing the dielectric's melting point",
            "Adding reversible redox reactions"
        ],
        correct: 2
    }

];


const supercapLesson3Questions = [

    {
        question: "What separates the two conductive plates in a capacitor?",
        answers: [
            "A vacuum tube",
            "An insulating dielectric material",
            "A semiconductor wire",
            "A magnetic coil"
        ],
        correct: 1
    },

    {
        question: "Why can capacitors charge and discharge extremely fast compared to batteries?",
        answers: [
            "They use higher voltages",
            "Energy storage is electrostatic charge separation, not a chemical reaction",
            "They are smaller in size",
            "They use liquid electrolytes"
        ],
        correct: 1
    },

    {
        question: "What primarily limits a capacitor's power delivery capability?",
        answers: [
            "Its internal resistance",
            "Its color",
            "The ambient humidity",
            "Its weight"
        ],
        correct: 0
    },

    {
        question: "Which of these is a common capacitor dielectric material?",
        answers: [
            "Activated carbon",
            "Mica",
            "Glassy carbon",
            "Graphene"
        ],
        correct: 1
    },

    {
        question: "Why do conventional capacitors have low energy density compared to batteries or supercapacitors?",
        answers: [
            "They operate at very low temperatures",
            "Charge storage is limited to simple electrostatic separation on a relatively small electrode area",
            "They can't hold any voltage",
            "They require rare materials"
        ],
        correct: 1
    }

];


const supercapLesson4Questions = [

    {
        question: "What does the Randles-Ševčík equation calculate?",
        answers: [
            "The total energy stored",
            "The peak current on a CV curve",
            "The device's operating temperature",
            "The electrode's weight"
        ],
        correct: 1
    },

    {
        question: "In the Randles-Ševčík equation, what does 'v' represent?",
        answers: [
            "Voltage window",
            "The scan rate — how fast the potential is swept",
            "Volume of electrolyte",
            "Number of electrons"
        ],
        correct: 1
    },

    {
        question: "If electrode surface area (A) increases and everything else stays constant, what happens to peak current?",
        answers: [
            "It decreases",
            "It stays the same",
            "It increases",
            "It becomes zero"
        ],
        correct: 2
    },

    {
        question: "What does the area enclosed by a cyclic voltammogram (CV) loop represent?",
        answers: [
            "The device's resistance",
            "Areal charge storage",
            "The scan rate",
            "The electrode's thickness"
        ],
        correct: 1
    },

    {
        question: "According to the Randles-Ševčík equation, increasing the concentration of the redox-active species does what to peak current?",
        answers: [
            "Decreases it",
            "Has no effect",
            "Increases it",
            "Makes it negative"
        ],
        correct: 2
    }

];


const supercapLesson5Questions = [

    {
        question: "Supercapacitors are generally classified into which three categories, based on how they store charge?",
        answers: [
            "Ceramic, electrolytic, and film capacitors",
            "Electric double-layer capacitors, pseudocapacitors, and hybrid capacitors",
            "Planar, stacked, and wound capacitors",
            "Primary, secondary, and tertiary capacitors"
        ],
        correct: 1
    },

    {
        question: "How does a supercapacitor's charge storage differ from a battery's?",
        answers: [
            "Supercapacitors rely on bulk diffusion-controlled reactions; batteries use surface processes",
            "Supercapacitors store charge inside a solid dielectric layer; batteries do not",
            "Supercapacitors use surface-based processes at the electrode-electrolyte interface; batteries rely on diffusion-controlled bulk reactions",
            "There is no meaningful difference in how they store charge"
        ],
        correct: 2
    },

    {
        question: "An electric double-layer capacitor (EDLC) stores charge through what?",
        answers: [
            "Fast reversible redox reactions at the electrode surface",
            "Electrostatic accumulation of ions at the electrode-electrolyte interface",
            "Bulk chemical reactions inside the electrode",
            "Heat generated during charging"
        ],
        correct: 1
    },

    {
        question: "Which type of supercapacitor typically reaches higher capacitance and energy density by using electrochemical charge-transfer reactions?",
        answers: [
            "Pseudocapacitors",
            "Electric double-layer capacitors",
            "Ceramic capacitors",
            "Film capacitors"
        ],
        correct: 0
    },

    {
        question: "What is the goal of a hybrid capacitor?",
        answers: [
            "To eliminate the electrolyte entirely",
            "To combine both charge-storage mechanisms, boosting energy storage while keeping good power characteristics",
            "To store charge only in the bulk of the electrode",
            "To operate without any electrodes"
        ],
        correct: 1
    }

];


const supercapLesson6Questions = [

    {
        question: "When voltage is applied to an electric double-layer capacitor, what happens to the ions in the electrolyte?",
        answers: [
            "They are destroyed",
            "They move toward and adhere to the surface of the oppositely charged porous electrodes",
            "They leave the device through the current collector",
            "They turn into a solid dielectric"
        ],
        correct: 1
    },

    {
        question: "Why are EDLC electrodes typically made of highly porous activated carbon?",
        answers: [
            "It is transparent to light",
            "Its very large surface area provides more room to store charge",
            "It reacts chemically with the electrolyte",
            "It is the cheapest insulator available"
        ],
        correct: 1
    },

    {
        question: "What is the thin, dense region of charge that forms at the boundary between an electrode and the electrolyte commonly called?",
        answers: [
            "The Helmholtz double layer",
            "The dielectric shell",
            "The Faraday cage",
            "The diffusion wedge"
        ],
        correct: 0
    },

    {
        question: "Roughly how quickly can an EDLC charge and discharge?",
        answers: [
            "Over several days",
            "Over many hours",
            "In seconds",
            "Only after a rest period of weeks"
        ],
        correct: 2
    },

    {
        question: "Why can an EDLC cycle millions of times with virtually no degradation?",
        answers: [
            "Its electrodes are replaced during each cycle",
            "Charge is stored by ions physically adsorbing and releasing, with no chemical change to the electrode",
            "It is always operated at zero volts",
            "Its electrolyte is renewed after every cycle"
        ],
        correct: 1
    }

];


const supercapLesson7Questions = [

    {
        question: "What distinguishes pseudocapacitance from double-layer capacitance?",
        answers: [
            "Pseudocapacitance involves no charge at all",
            "Pseudocapacitance involves electron transfer through fast, reversible faradaic reactions at or near the electrode surface",
            "Pseudocapacitance only happens in the bulk of the electrode",
            "Pseudocapacitance requires a solid dielectric"
        ],
        correct: 1
    },

    {
        question: "Which of these is a common pseudocapacitive electrode material?",
        answers: [
            "Mica",
            "Activated carbon",
            "Manganese oxide (MnO₂)",
            "Polyethylene"
        ],
        correct: 2
    },

    {
        question: "Why can pseudocapacitive reactions stay fast even though they involve redox chemistry?",
        answers: [
            "They only occur in the near-surface region rather than deep in the bulk material",
            "They run at extremely high temperatures",
            "They skip the electrolyte entirely",
            "They only occur once per device lifetime"
        ],
        correct: 0
    },

    {
        question: "What is a common drawback of pseudocapacitive electrodes compared with double-layer ones?",
        answers: [
            "They store far less charge",
            "They cannot be charged quickly",
            "Repeated redox reactions and structural changes tend to reduce their cycling stability",
            "They are not affected by the electrolyte"
        ],
        correct: 2
    },

    {
        question: "Which of these is an electrically conducting polymer used as a pseudocapacitive electrode material?",
        answers: [
            "Polyaniline (PANI)",
            "Ruthenium oxide (RuO₂)",
            "Graphene",
            "Mica"
        ],
        correct: 0
    }

];


const supercapLesson8Questions = [

    {
        question: "In an interdigitated electrode array, what roles do adjacent electrodes play in redox amplification?",
        answers: [
            "Both act only as insulators",
            "One acts as a generator and the neighboring one as a collector that regenerates the opposite oxidation state",
            "Both electrodes only oxidize the species",
            "Neither electrode takes part in electron transfer"
        ],
        correct: 1
    },

    {
        question: "What happens to redox-active species diffusing between closely spaced electrodes in redox amplification?",
        answers: [
            "They are consumed permanently on the first reaction",
            "They are repeatedly oxidized and reduced, producing an amplified current",
            "They stop moving entirely",
            "They turn into a solid film"
        ],
        correct: 1
    },

    {
        question: "How does narrowing the spacing between interdigitated electrodes affect redox amplification?",
        answers: [
            "It increases amplification by shortening the diffusion distance and allowing more redox cycles",
            "It decreases amplification by blocking the electrolyte",
            "It has no effect",
            "It removes the need for a redox-active species"
        ],
        correct: 0
    },

    {
        question: "Which redox couple is one of the most extensively studied for interdigitated electrodes because of its rapid, highly reversible electron transfer?",
        answers: [
            "Ferri/ferrocyanide",
            "Sodium chloride",
            "Distilled water",
            "Atmospheric oxygen"
        ],
        correct: 0
    },

    {
        question: "In one study of carbon interdigitated electrodes, the redox amplification factor rose from about 9 to about 37. What change produced this?",
        answers: [
            "Doubling the electrolyte temperature",
            "Increasing electrode height from about 0.22 µm to about 1.1 µm",
            "Removing the current collector",
            "Reducing the scan rate to zero"
        ],
        correct: 1
    }

];


/*
    Looked up by numeric lesson id, the same
    pattern script.js uses for the MEMS course's
    allLessonQuestions map.
*/

const supercapAllLessonQuestions = {
    1: supercapLesson1Questions,
    2: supercapLesson2Questions,
    3: supercapLesson3Questions,
    4: supercapLesson4Questions,
    5: supercapLesson5Questions,
    6: supercapLesson6Questions,
    7: supercapLesson7Questions,
    8: supercapLesson8Questions
};
