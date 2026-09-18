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


/*
    Looked up by numeric lesson id, the same
    pattern script.js uses for the MEMS course's
    allLessonQuestions map.
*/

const supercapAllLessonQuestions = {
    1: supercapLesson1Questions,
    2: supercapLesson2Questions,
    3: supercapLesson3Questions,
    4: supercapLesson4Questions
};
