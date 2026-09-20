/* ========================================
   SAND TO CHIP COURSE QUESTIONS
   Same shape as the other courses: the
   answer order is shuffled at render time.
======================================== */


const chipLesson1Questions = [

    {
        question: "What is a die?",
        answers: [
            "A thin disc of pure silicon crystal",
            "The plastic housing around a chip",
            "A single transistor inside a chip",
            "One rectangular chip cut from a wafer"
        ],
        correct: 3
    },

    {
        question: "About how many transistors are on a leading-edge processor?",
        answers: [
            "Tens of billions",
            "Only a few thousand",
            "Just a few million",
            "Roughly a trillion"
        ],
        correct: 0
    },

    {
        question: "What does a node name like '3 nm' tell you today?",
        answers: [
            "The exact gate length of every transistor",
            "A generation label, not one measured feature",
            "The width of the thinnest metal wire",
            "The thickness of the silicon wafer"
        ],
        correct: 1
    },

    {
        question: "Which four actions do fabs repeat to build a chip layer by layer?",
        answers: [
            "Melt, cast, machine, and polish metal",
            "Print, fold, glue, and package boards",
            "Add, pattern, remove, and modify material",
            "Grow, harvest, mill, and sort crystals"
        ],
        correct: 2
    },

    {
        question: "What is Moore's observation?",
        answers: [
            "Chip prices double about every two years",
            "Wafer sizes double roughly every single year",
            "Clock speeds triple about every three years",
            "Transistors per chip double every two years"
        ],
        correct: 3
    },

    {
        question: "Why can't a fab build a chip in a single step?",
        answers: [
            "A chip is many patterned layers, built in turn",
            "Chips are cut whole from natural crystals",
            "Each transistor is placed by hand, one at a time",
            "Silicon can only be worked one atom at a time"
        ],
        correct: 0
    }

];


const chipLesson2Questions = [

    {
        question: "About what fraction of Earth's crust is silicon, by mass?",
        answers: [
            "About 0.3 percent",
            "About 2 percent",
            "About 28 percent",
            "About 70 percent"
        ],
        correct: 2
    },

    {
        question: "What lets silicon form a high-quality insulator on its own surface?",
        answers: [
            "It is a perfect electrical insulator itself",
            "It conducts better than copper does",
            "It dissolves in water to form glass",
            "It grows a stable native oxide, SiO₂"
        ],
        correct: 3
    },

    {
        question: "Why is silicon a poor choice for LEDs and lasers?",
        answers: [
            "Its indirect band gap emits light poorly",
            "Its band gap is too large to emit light",
            "It melts at too low a temperature",
            "It cannot be doped n-type or p-type"
        ],
        correct: 0
    },

    {
        question: "Which materials are used mainly for high-voltage, high-temperature power devices?",
        answers: [
            "Germanium and pure copper wire",
            "Silicon carbide and gallium nitride",
            "Amorphous carbon and window glass",
            "Pure aluminum and cast iron"
        ],
        correct: 1
    },

    {
        question: "Why did germanium lose out to silicon after the first transistors?",
        answers: [
            "It is far rarer than gold is on Earth",
            "It cannot be grown as a single crystal",
            "Its oxide is unstable and it leaks heavily",
            "It has a wider band gap than silicon does"
        ],
        correct: 2
    }

];


const chipLesson3Questions = [

    {
        question: "What is the raw material for silicon?",
        answers: [
            "Silicon carbide abrasive powder",
            "Quartz sand, or silicon dioxide",
            "Naturally occurring pure silicon",
            "Common table salt from the sea"
        ],
        correct: 1
    },

    {
        question: "What does the first furnace step produce?",
        answers: [
            "Electronic-grade silicon, 11 nines pure",
            "A finished single-crystal ingot",
            "Metallurgical silicon, ~98–99% pure",
            "Trichlorosilane gas and hydrogen"
        ],
        correct: 2
    },

    {
        question: "Why is silicon converted to trichlorosilane (SiHCl₃)?",
        answers: [
            "It is a solid that can be cut to shape",
            "It is a metal that conducts current well",
            "It is a gas that cannot react with impurities",
            "It is a liquid, so distillation can purify it"
        ],
        correct: 3
    },

    {
        question: "In the Siemens process, where does the polysilicon deposit?",
        answers: [
            "On thin silicon rods held near 1,100 °C",
            "On sand grains held at room temperature",
            "On a spinning wafer at about 200 °C",
            "On a copper plate cooled with water"
        ],
        correct: 0
    },

    {
        question: "About how pure is electronic-grade polysilicon?",
        answers: [
            "About two nines (99%)",
            "Nine to eleven nines pure",
            "About four nines (99.99%)",
            "Exactly 100 percent pure"
        ],
        correct: 1
    },

    {
        question: "Why must the silicon be so pure before doping?",
        answers: [
            "Impurities make silicon melt at a lower temperature",
            "Impurities are invisible to the crystal puller",
            "Parts-per-billion impurities can change how it conducts",
            "Pure silicon is easier to cut into wafers"
        ],
        correct: 2
    }

];


const chipLesson4Questions = [

    {
        question: "Why do chips need single-crystal silicon?",
        answers: [
            "Grain boundaries scatter moving charges",
            "Polycrystalline silicon cannot be doped",
            "Single crystals are cheaper to grow",
            "Only single crystals will melt cleanly"
        ],
        correct: 0
    },

    {
        question: "In the Czochralski method, what is pulled out of the melt?",
        answers: [
            "A sheet of molten glass or quartz",
            "A seed crystal that grows an ingot",
            "A finished wafer, ready to use",
            "A copper rod coated in silicon"
        ],
        correct: 1
    },

    {
        question: "What is the purpose of the thin 'neck' at the start of the pull?",
        answers: [
            "It sets the final thickness of each wafer",
            "It lets dopants escape from the melt",
            "It stops seed dislocations from spreading",
            "It cools the walls of the crucible"
        ],
        correct: 2
    },

    {
        question: "How is n-type or p-type behavior usually set in a CZ ingot?",
        answers: [
            "The ingot is painted with dopant after cooling",
            "The seed crystal is made from doped glass",
            "The saw blade chooses the dopant type",
            "Dopant atoms are added to the melt"
        ],
        correct: 3
    },

    {
        question: "What is a benefit of float-zone growth over Czochralski?",
        answers: [
            "No crucible, so far less oxygen",
            "It produces the largest-diameter ingots",
            "It is much faster and cheaper to run",
            "It needs no heating source at all"
        ],
        correct: 0
    },

    {
        question: "About how hot must the melt be for CZ growth?",
        answers: [
            "About 100 °C, like boiling water",
            "Above 1,414 °C, silicon's melting point",
            "About 500 °C, like a pizza oven",
            "About 5,000 °C, like the sun's surface"
        ],
        correct: 1
    }

];


const chipLesson5Questions = [

    {
        question: "What is the correct order of the first wafer-making steps?",
        answers: [
            "Slice, grind to diameter, then crop the ends",
            "Polish, slice, then crop the ends",
            "Slice, polish, then grind to diameter",
            "Crop the ends, grind to diameter, then slice"
        ],
        correct: 3
    },

    {
        question: "What is used to slice an ingot into wafers?",
        answers: [
            "A diamond-coated wire saw",
            "A hot steel knife",
            "A beam of water at 50 °C",
            "A hand-held rotary blade"
        ],
        correct: 0
    },

    {
        question: "Why are wafers polished to a mirror finish?",
        answers: [
            "To make the wafers reflect heat away",
            "Lithography needs a very flat surface",
            "To remove the silicon crystal structure",
            "To make each wafer weigh a bit less"
        ],
        correct: 1
    },

    {
        question: "About how thick is a standard 300 mm wafer?",
        answers: [
            "About 7.75 µm",
            "About 77 µm",
            "About 775 µm",
            "About 7.75 mm"
        ],
        correct: 2
    },

    {
        question: "How much more area does a 300 mm wafer have than a 200 mm wafer?",
        answers: [
            "About 1.5 times",
            "About 3 times",
            "About 4 times",
            "About 2.25 times"
        ],
        correct: 3
    },

    {
        question: "What does the notch on a 300 mm wafer mark?",
        answers: [
            "The orientation of the crystal",
            "The grade of the wafer's price",
            "The side that has been polished",
            "The place where the first die is cut"
        ],
        correct: 0
    }

];


const chipLesson6Questions = [

    {
        question: "Roughly how much cleaner is ISO 5 air than ordinary room air?",
        answers: [
            "About twice as clean",
            "About ten times cleaner",
            "About 10,000 times cleaner",
            "About a hundred times cleaner"
        ],
        correct: 2
    },

    {
        question: "What does BEOL stand for, and what does it build?",
        answers: [
            "Bottom edge of layer: the wafer backside",
            "Bulk etch of oxide: the gate stack",
            "Basic electrical output line: the pins",
            "Back end of line: the metal wiring layers"
        ],
        correct: 3
    },

    {
        question: "What does FEOL build?",
        answers: [
            "The transistors in the silicon itself",
            "The metal wiring between transistors",
            "The plastic package around a die",
            "The silicon ingot before slicing"
        ],
        correct: 0
    },

    {
        question: "Why are lithography rooms often lit with yellow light?",
        answers: [
            "Yellow light kills bacteria on wafers",
            "Photoresist reacts to shorter wavelengths",
            "Yellow light keeps the room cooler",
            "Yellow light makes wafers easier to polish"
        ],
        correct: 1
    },

    {
        question: "About how many 100 mm² dies fit on a 300 mm wafer, edge loss included?",
        answers: [
            "About 70",
            "About 1,500",
            "About 640",
            "About 6,400"
        ],
        correct: 2
    },

    {
        question: "About how long does advanced logic take from bare wafer to finished wafer?",
        answers: [
            "Roughly one full day",
            "Roughly one full week",
            "Roughly two full years",
            "Two to three months"
        ],
        correct: 3
    }

];


/*
    Looked up by numeric lesson id, the same
    pattern the other courses use.
*/

const chipAllLessonQuestions = {
    1: chipLesson1Questions,
    2: chipLesson2Questions,
    3: chipLesson3Questions,
    4: chipLesson4Questions,
    5: chipLesson5Questions,
    6: chipLesson6Questions
};
