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


const chipLesson7Questions = [

    {
        question: "What happens when silicon is heated in oxygen or steam?",
        answers: [
            "The surface converts to silicon dioxide",
            "It melts into a smooth liquid film",
            "It hardens into silicon carbide",
            "Its dopants boil off into the air"
        ],
        correct: 0
    },

    {
        question: "Why is thermal oxide such a good insulator on silicon?",
        answers: [
            "It is deposited far thicker than any other film",
            "It grows from the silicon, so the interface is clean",
            "It carries extra dopants that block all current flow",
            "It forms a crystal that matches every metal above"
        ],
        correct: 1
    },

    {
        question: "About how much silicon is consumed when 100 nm of oxide is grown?",
        answers: [
            "About 10 nm",
            "About 44 nm",
            "About 100 nm",
            "About 200 nm"
        ],
        correct: 1
    },

    {
        question: "Which oxidation is typically used for a thin gate oxide?",
        answers: [
            "Wet oxidation in steam",
            "Sputtering an oxide target",
            "Dry oxidation in oxygen",
            "Room-temperature air exposure"
        ],
        correct: 2
    },

    {
        question: "As an oxide grows thicker, what happens to its growth rate?",
        answers: [
            "It speeds up as the surface gets rougher",
            "It stays exactly constant at any thickness",
            "It stops abruptly once the oxide reaches 1 nm",
            "It slows, since oxygen must diffuse through it"
        ],
        correct: 3
    },

    {
        question: "Why did fabs move from SiO₂ to hafnium-based gate dielectrics?",
        answers: [
            "Hafnium oxide is easier to etch than SiO₂",
            "Ultra-thin SiO₂ leaks current by tunneling",
            "SiO₂ can no longer be grown on silicon",
            "SiO₂ melts during the metal-wiring steps"
        ],
        correct: 1
    }

];


const chipLesson8Questions = [

    {
        question: "How does deposition differ from thermal oxidation?",
        answers: [
            "It removes silicon from the wafer surface",
            "It only works on single-crystal wafers",
            "It adds material without consuming the wafer",
            "It always requires temperatures above 1,000 °C"
        ],
        correct: 2
    },

    {
        question: "In CVD, where does the solid film come from?",
        answers: [
            "A solid target hit by argon ions",
            "Gases that react on the heated wafer",
            "Silicon dissolved out of the wafer",
            "Liquid copper poured across the surface"
        ],
        correct: 1
    },

    {
        question: "Why is PECVD used once metal is on the wafer?",
        answers: [
            "It only sticks to copper and aluminum surfaces",
            "It grows perfect single crystals at high heat",
            "The plasma allows film growth at low temperature",
            "It needs no gases or chemical reactions at all"
        ],
        correct: 2
    },

    {
        question: "Which material does CVD typically deposit to fill contact plugs?",
        answers: [
            "Gold, from a sputter target",
            "Silver, from a plating bath",
            "Lead, from a molten bath",
            "Tungsten, from WF₆ gas"
        ],
        correct: 3
    },

    {
        question: "What does poor step coverage look like in a deep trench?",
        answers: [
            "A perfectly even film on every surface",
            "Film only on the trench floor",
            "Thick film on top, thin film and voids below",
            "The trench filling with single-crystal silicon"
        ],
        correct: 2
    },

    {
        question: "What is epitaxy?",
        answers: [
            "Etching a repeating pattern into the crystal surface",
            "Growing a layer that continues the wafer's crystal",
            "Polishing the wafer until it is perfectly smooth",
            "Spraying a rough polycrystalline coating on top"
        ],
        correct: 1
    }

];


const chipLesson9Questions = [

    {
        question: "How does sputtering release atoms from a metal target?",
        answers: [
            "Argon ions from a plasma knock them loose",
            "A chemical bath dissolves the target",
            "Electroplating current strips them away",
            "A laser vaporizes the whole target"
        ],
        correct: 0
    },

    {
        question: "Why is a tantalum-based barrier put under copper?",
        answers: [
            "Copper cannot stick to any other metal",
            "Tantalum makes the copper conduct better",
            "Copper diffuses into silicon and ruins devices",
            "It turns the copper into an insulator"
        ],
        correct: 2
    },

    {
        question: "How is copper deposited into damascene trenches?",
        answers: [
            "Evaporating it from a hot crucible in vacuum",
            "Electroplating it onto a sputtered seed layer",
            "Growing it from silicon in a furnace tube",
            "Etching it out of a thick solid copper wafer"
        ],
        correct: 1
    },

    {
        question: "What is the key idea of ALD?",
        answers: [
            "A plasma sputters atoms at very high rates",
            "Gases flow nonstop to build thick films fast",
            "Self-limiting reactions add one layer per cycle",
            "Current drives plating onto a copper seed"
        ],
        correct: 2
    },

    {
        question: "About how thick is a film after 20 ALD cycles at 0.1 nm per cycle?",
        answers: [
            "About 0.2 nm",
            "About 20 nm",
            "About 200 nm",
            "About 2 nm"
        ],
        correct: 3
    },

    {
        question: "What is a main drawback of ALD?",
        answers: [
            "It cannot coat deep trenches evenly",
            "It only works on copper",
            "It needs temperatures above 1,500 °C",
            "It deposits slowly, so it suits thin films"
        ],
        correct: 3
    }

];


const chipLesson10Questions = [

    {
        question: "What does an isotropic etch do?",
        answers: [
            "Cuts only straight down, with vertical walls",
            "Etches in every direction and undercuts the mask",
            "Etches only where light has struck the film",
            "Adds new material beneath the mask edges"
        ],
        correct: 1
    },

    {
        question: "Which chemical is the standard wet etchant for SiO₂?",
        answers: [
            "Hot phosphoric acid",
            "Sodium hydroxide solution",
            "Isopropyl alcohol",
            "Hydrofluoric acid (HF)"
        ],
        correct: 3
    },

    {
        question: "Why does reactive ion etching give vertical sidewalls?",
        answers: [
            "An electric field drives ions straight down",
            "The wafer is spun edge-on to the gas",
            "The mask absorbs all sideways etching",
            "Gas only ever reaches the top of the film"
        ],
        correct: 0
    },

    {
        question: "What does a 20:1 selectivity mean?",
        answers: [
            "The etch always finishes in 20 seconds",
            "The target etches about 20 times faster",
            "The etch removes only 20 percent of the film",
            "The mask must be exactly 20 nm thick"
        ],
        correct: 1
    },

    {
        question: "Which gases are typically used to plasma-etch silicon dioxide?",
        answers: [
            "Fluorine-based gases such as CF₄",
            "Pure helium at low pressure",
            "Water vapor at room temperature",
            "Pure nitrogen at high pressure"
        ],
        correct: 0
    },

    {
        question: "How do etch tools often know when to stop?",
        answers: [
            "They run a fixed hour every time",
            "They watch the plasma's light for a change",
            "The wafer cools to room temperature",
            "An operator inspects each wafer by eye"
        ],
        correct: 1
    }

];


const chipLesson11Questions = [

    {
        question: "Why must a wafer be flat before lithography?",
        answers: [
            "Bumps change the transistor's doping type",
            "Flat wafers are needed to cut the dies apart",
            "Lithography has a very small depth of focus",
            "Bumps make the silicon conduct electricity"
        ],
        correct: 2
    },

    {
        question: "Which two actions combine in CMP?",
        answers: [
            "Plasma etching and dopant ion implantation",
            "Chemical softening and mechanical abrasion",
            "Rapid heating followed by fast cooling",
            "Photolithography and metal electroplating"
        ],
        correct: 1
    },

    {
        question: "What is a CMP slurry?",
        answers: [
            "A light-sensitive resist coating",
            "A hot plasma of charged argon ions",
            "Abrasive grit in a chemical solution",
            "A bath of molten metal for plating"
        ],
        correct: 2
    },

    {
        question: "In shallow trench isolation, the CMP step stops on what?",
        answers: [
            "The bare silicon wafer",
            "A silicon nitride layer",
            "A layer of electroplated copper",
            "The remaining photoresist"
        ],
        correct: 1
    },

    {
        question: "What is dishing?",
        answers: [
            "The whole wafer bending into a bowl shape",
            "Slurry pooling at the center of the wafer",
            "A wide metal line polishing below the insulator",
            "Dense line arrays wearing the insulator thin"
        ],
        correct: 2
    },

    {
        question: "Why do designers add dummy fill patterns?",
        answers: [
            "To make the whole layout look symmetrical",
            "To store extra bits of hidden data",
            "To shield the wires from stray radiation",
            "To even out pattern density for polishing"
        ],
        correct: 3
    }

];


const chipLesson12Questions = [

    {
        question: "In an RCA clean, what does SC-1 mainly remove?",
        answers: [
            "Dissolved metal ions only",
            "Native oxide from silicon",
            "Particles and organic residue",
            "Hardened photoresist layers"
        ],
        correct: 2
    },

    {
        question: "Why is copper damascene used instead of etching copper lines?",
        answers: [
            "Copper cannot be patterned with light",
            "Copper leaves no volatile etch products",
            "Copper dissolves in every etch gas",
            "Copper wires have to be grown from silicon"
        ],
        correct: 1
    },

    {
        question: "In STI, what fills the etched trench?",
        answers: [
            "Sputtered aluminum",
            "Grown single-crystal silicon",
            "Deposited silicon dioxide",
            "Electroplated copper"
        ],
        correct: 2
    },

    {
        question: "Which tool typically deposits a high-k gate dielectric like HfO₂?",
        answers: [
            "Wet thermal oxidation in steam",
            "Electroplating from a bath",
            "Evaporation in open air",
            "Atomic layer deposition"
        ],
        correct: 3
    },

    {
        question: "Why do steps late in the flow run cooler than early ones?",
        answers: [
            "Furnaces are never allowed near any metal",
            "Cooler films are always higher quality",
            "Metal wiring and insulators cannot take the heat",
            "Cooler steps make the wafers slightly thinner"
        ],
        correct: 2
    },

    {
        question: "Which order describes copper damascene?",
        answers: [
            "Plate copper, etch trench, grow oxide, sputter seed",
            "Insulator, etch trench, barrier and seed, plate, polish",
            "Polish, etch trench, sputter seed, then deposit insulator",
            "Grow oxide, plate copper, strip nitride, then anneal"
        ],
        correct: 1
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
    6: chipLesson6Questions,
    7: chipLesson7Questions,
    8: chipLesson8Questions,
    9: chipLesson9Questions,
    10: chipLesson10Questions,
    11: chipLesson11Questions,
    12: chipLesson12Questions
};
