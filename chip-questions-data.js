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


const chipLesson13Questions = [

    {
        question: "What does photoresist do after it is exposed to light?",
        answers: [
            "Its solubility in developer changes",
            "It grows a layer of silicon dioxide",
            "It becomes a permanent metal film",
            "It evaporates and leaves the wafer"
        ],
        correct: 0
    },

    {
        question: "What is the pattern-carrying plate in a scanner called?",
        answers: [
            "A reticle, or photomask",
            "A gas-distribution plate",
            "A vacuum wafer chuck",
            "A polishing carrier"
        ],
        correct: 0
    },

    {
        question: "With a positive resist, which part dissolves in the developer?",
        answers: [
            "Only the very top surface layer",
            "The area that stayed in the dark",
            "The area that was exposed to light",
            "The whole coating in every case"
        ],
        correct: 2
    },

    {
        question: "Why does a fab use a different reticle for each layer?",
        answers: [
            "Each layer needs its own pattern",
            "A reticle can hold only one chip",
            "Reticles wear out after one exposure",
            "Each layer uses a different wavelength"
        ],
        correct: 0
    },

    {
        question: "Besides etching, what is a resist pattern used for?",
        answers: [
            "Sawing the wafers into separate dies",
            "Blocking dopant ions during implantation",
            "Growing epitaxial silicon layers on top",
            "Polishing copper flat after plating"
        ],
        correct: 1
    },

    {
        question: "What does the 'develop' step do?",
        answers: [
            "Washes away the soluble resist",
            "Bakes the wafer until it turns black",
            "Bonds the wafer to a carrier plate",
            "Grows more resist under the mask"
        ],
        correct: 0
    }

];


const chipLesson14Questions = [

    {
        question: "Why is HMDS applied before the resist is spun on?",
        answers: [
            "It helps the resist stick to the wafer",
            "It etches away the native oxide",
            "It cools the wafer before baking",
            "It makes the resist sensitive to light"
        ],
        correct: 0
    },

    {
        question: "What mainly sets the resist thickness in spin coating?",
        answers: [
            "The temperature of the cleanroom air",
            "The size of the reticle image",
            "Spin speed and resist viscosity",
            "The wavelength of the exposure light"
        ],
        correct: 2
    },

    {
        question: "What does a post-exposure bake do in chemically amplified resists?",
        answers: [
            "Hardens the resist before it is exposed",
            "Grows a thin oxide under the resist",
            "Washes away the unexposed regions",
            "Lets photoacid spread and amplify the change"
        ],
        correct: 3
    },

    {
        question: "Which is the standard developer for most positive resists?",
        answers: [
            "Piranha solution",
            "Dilute TMAH solution",
            "Buffered oxide etch",
            "Hot phosphoric acid"
        ],
        correct: 1
    },

    {
        question: "What is the 'track' in a lithography cell?",
        answers: [
            "The rails the reticle stage slides on",
            "The path light takes through the lens",
            "The belt that carries finished dies off",
            "The coater and developer line by the scanner"
        ],
        correct: 3
    },

    {
        question: "How is leftover resist usually removed after etching?",
        answers: [
            "Polishing it off with slurry",
            "Baking it until it turns to metal",
            "Oxygen plasma ashing plus a wet clean",
            "Growing oxide over the top of it"
        ],
        correct: 2
    }

];


const chipLesson15Questions = [

    {
        question: "In CD = k₁λ/NA, what does a shorter wavelength do?",
        answers: [
            "It enlarges the reticle pattern",
            "It raises the depth of focus",
            "It shrinks the smallest printable feature",
            "It makes the lens numerical aperture bigger"
        ],
        correct: 2
    },

    {
        question: "Which wavelength does ArF immersion lithography use?",
        answers: [
            "365 nm",
            "193 nm",
            "436 nm",
            "13.5 nm"
        ],
        correct: 1
    },

    {
        question: "What does numerical aperture (NA) describe?",
        answers: [
            "How wide a cone of light the lens collects",
            "How thick the resist film has to be",
            "How fast the wafer stage is able to move",
            "How brightly the light source is burning"
        ],
        correct: 0
    },

    {
        question: "Why does immersion lithography put water under the lens?",
        answers: [
            "Water cools the reticle while it scans",
            "Water dissolves the exposed resist",
            "Water's higher index allows a larger NA",
            "Water rinses particles off the mask"
        ],
        correct: 2
    },

    {
        question: "What happens to depth of focus as NA increases?",
        answers: [
            "It gets larger",
            "It gets smaller",
            "It stays the same",
            "It becomes unlimited"
        ],
        correct: 1
    },

    {
        question: "What is the theoretical minimum k₁ for a single exposure?",
        answers: [
            "0.05",
            "2.50",
            "1.00",
            "0.25"
        ],
        correct: 3
    }

];


const chipLesson16Questions = [

    {
        question: "Why is the reticle image four times larger than what prints?",
        answers: [
            "Light travels four times faster there",
            "The resist enlarges the image by 4×",
            "The wafer is four times thicker",
            "The lens shrinks it 4× onto the wafer"
        ],
        correct: 3
    },

    {
        question: "During a scan with 4× reduction, how do the two stages move?",
        answers: [
            "The reticle moves four times faster",
            "Only the projection lens moves",
            "Both stay perfectly still",
            "Both spin like a record"
        ],
        correct: 0
    },

    {
        question: "What is overlay?",
        answers: [
            "How accurately one layer aligns to the last",
            "How much light the projection lens absorbs",
            "How thick the finished resist coating is",
            "How many separate layers a chip contains"
        ],
        correct: 0
    },

    {
        question: "What does optical proximity correction (OPC) do?",
        answers: [
            "Speeds up the post-exposure resist bake",
            "Aligns the wafer to the scanner stage",
            "Cleans particles off the reticle surface",
            "Pre-distorts mask shapes to print correctly"
        ],
        correct: 3
    },

    {
        question: "Why is a pellicle placed over a reticle?",
        answers: [
            "It reflects the light back onto the wafer",
            "It cools the chrome pattern on the mask",
            "It focuses the light into a finer spot",
            "Dust lands out of focus and does not print"
        ],
        correct: 3
    },

    {
        question: "Why can one reticle defect be so costly?",
        answers: [
            "It stops the scanner permanently",
            "It only affects the first exposure",
            "It prints on every die of every wafer",
            "It changes the wafer's crystal orientation"
        ],
        correct: 2
    }

];


const chipLesson17Questions = [

    {
        question: "About what limits single-exposure 193 nm immersion lithography?",
        answers: [
            "About 400 nm half-pitch",
            "About 4 nm half-pitch",
            "About 40 nm half-pitch",
            "It has no real limit at all"
        ],
        correct: 2
    },

    {
        question: "What is the idea of multi-patterning?",
        answers: [
            "Build a dense pattern in simpler steps",
            "Use a larger reticle for every layer",
            "Expose the same layer with longer light",
            "Print each die at a separate time"
        ],
        correct: 0
    },

    {
        question: "In self-aligned double patterning, what sets the final line spacing?",
        answers: [
            "The size of the scanner's main lens",
            "A second reticle stacked on the first",
            "Spacers formed on the sides of mandrels",
            "The temperature of the developer bath"
        ],
        correct: 2
    },

    {
        question: "How is EUV light made in a production scanner?",
        answers: [
            "An LED array emits extreme ultraviolet",
            "A laser hits tin droplets to form a plasma",
            "A mercury lamp is filtered to 13.5 nm",
            "Sunlight is focused through a lens"
        ],
        correct: 1
    },

    {
        question: "Why does an EUV scanner use mirrors in a vacuum?",
        answers: [
            "Mirrors are always cheaper than lenses",
            "Air and glass absorb 13.5 nm light",
            "Lenses cannot be made larger than 300 mm",
            "Vacuum makes the resist more sensitive"
        ],
        correct: 1
    },

    {
        question: "About what fraction of EUV source light reaches the wafer?",
        answers: [
            "Nearly all of it",
            "About half of it",
            "More than the source emits",
            "Only a small fraction"
        ],
        correct: 3
    }

];


const chipLesson18Questions = [

    {
        question: "What is a lithography process window?",
        answers: [
            "The time a wafer spends in the track",
            "The focus and dose range that stays in spec",
            "The size of the scanner's exposure field",
            "The opening in the reticle pellicle"
        ],
        correct: 1
    },

    {
        question: "Which instrument commonly measures printed feature size?",
        answers: [
            "A mass spectrometer",
            "A four-point probe",
            "A profilometer stylus",
            "A CD-SEM"
        ],
        correct: 3
    },

    {
        question: "Why is EUV prone to stochastic defects?",
        answers: [
            "Fewer photons per dose means random noise",
            "The reticle is drawn on cheap paper stock",
            "The light is too dim for detectors to see",
            "EUV resist never manages to fully develop"
        ],
        correct: 0
    },

    {
        question: "What is unique about lithography compared with etch or implant?",
        answers: [
            "Bad resist patterns can be stripped, redone",
            "It can never be inspected after printing",
            "It only ever needs doing once per chip",
            "It changes the wafer permanently, like etch"
        ],
        correct: 0
    },

    {
        question: "What is e-beam direct writing mainly used for today?",
        answers: [
            "Growing epitaxial silicon layers",
            "Making masks and research patterns",
            "High-volume wafer production lines",
            "Cleaning resist residue off wafers"
        ],
        correct: 1
    },

    {
        question: "What is line-edge roughness (LER)?",
        answers: [
            "The tilt of a wafer in the scanner",
            "Random waviness along a printed line's edge",
            "The thickness variation across a wafer",
            "The overlay error between two layers"
        ],
        correct: 1
    }

];


/*
    Looked up by numeric lesson id, the same
    pattern the other courses use.
*/


const chipLesson19Questions = [

    {
        question: "Why does a fab purify silicon to nine nines before doping it?",
        answers: [
            "So the finished wafer weighs noticeably less than before",
            "So the only impurity present is the kind added on purpose",
            "So the crystal no longer needs any doping at all",
            "So the wafer conducts current on its own, unaided"
        ],
        correct: 1
    },

    {
        question: "What does an n-type dopant such as phosphorus add to silicon?",
        answers: [
            "An extra hole that is free to move",
            "A neutral atom with no charge",
            "An extra electron that is free to move",
            "A second, identical silicon atom"
        ],
        correct: 2
    },

    {
        question: "In p-type silicon, which carrier is the minority carrier?",
        answers: [
            "Holes, present only in trace amounts",
            "Phosphorus ions fixed in the lattice",
            "Photons absorbed at the surface",
            "Electrons, present only in trace amounts"
        ],
        correct: 3
    },

    {
        question: "What forms at the boundary between p-type and n-type silicon?",
        answers: [
            "A depletion region with almost no carriers",
            "A region with double the usual carriers",
            "A layer of pure, undoped silicon",
            "A permanent short between the sides"
        ],
        correct: 0
    },

    {
        question: "What kind of well does a MOSFET's source and drain sit inside?",
        answers: [
            "A well of the matching doping type",
            "A well of the opposite doping type",
            "A layer of pure silicon dioxide",
            "A block of undoped polysilicon"
        ],
        correct: 1
    }

];


const chipLesson20Questions = [

    {
        question: "What drives dopant atoms into silicon during diffusion doping?",
        answers: [
            "Heat, carrying dopant from high to low concentration",
            "A beam of ions accelerated through a field",
            "A strong magnetic field placed near the wafer",
            "Vacuum pressure pulling steadily on the surface"
        ],
        correct: 0
    },

    {
        question: "What is the purpose of the predeposition step?",
        answers: [
            "Push the loaded dopant to its final depth",
            "Load a fixed dose of dopant at the surface",
            "Strip the patterned photoresist mask off",
            "Anneal out damage left in the lattice"
        ],
        correct: 1
    },

    {
        question: "What does drive-in do that predeposition does not?",
        answers: [
            "Set the total dose that will be delivered",
            "Filter out the wrong dopant species entirely",
            "Push the dopant deeper and shape its profile",
            "Tilt the wafer for the whole implant step"
        ],
        correct: 2
    },

    {
        question: "What shape does a diffused dopant profile have?",
        answers: [
            "A sharp, box-like step at one fixed depth",
            "A flat line that is even at every depth",
            "A single spike at just one exact point",
            "A smooth gradient, peaking at the surface"
        ],
        correct: 3
    },

    {
        question: "Why did ion implantation replace diffusion for small transistors?",
        answers: [
            "Diffusion spreads sideways as much as down",
            "Diffusion only works on n-type silicon",
            "Diffusion needs a sealed vacuum chamber",
            "Diffusion cannot dope silicon at all"
        ],
        correct: 0
    }

];


const chipLesson21Questions = [

    {
        question: "What does an ion implanter's mass-analyzing magnet do?",
        answers: [
            "Heats the wafer to activate the dopant",
            "Strips the patterned resist mask off",
            "Grows a fresh oxide layer on top",
            "Bends the beam so only the right ion passes"
        ],
        correct: 3
    },

    {
        question: "What does implant dose control?",
        answers: [
            "How much dopant lands, per square centimeter",
            "How deep the dopant finally comes to rest",
            "Which element is being implanted today",
            "How long the later anneal runs for"
        ],
        correct: 0
    },

    {
        question: "What does implant energy control?",
        answers: [
            "How many ions land in total",
            "How deep the ions come to rest",
            "Which material masks the implant",
            "The tilt angle of the wafer"
        ],
        correct: 1
    },

    {
        question: "Why does a thick layer of resist mask an implant?",
        answers: [
            "It reflects the ions back to the source",
            "It chemically neutralizes the dopant",
            "It physically blocks the ions from silicon",
            "It cools the wafer during the implant"
        ],
        correct: 2
    },

    {
        question: "Why is the wafer tilted a few degrees during implantation?",
        answers: [
            "To make the beam spot noticeably larger",
            "To keep the whole wafer from overheating",
            "To match the fixed tilt of the mask",
            "To keep ions from channeling down the lattice"
        ],
        correct: 3
    }

];


const chipLesson22Questions = [

    {
        question: "What does implantation do to the lattice besides add dopant?",
        answers: [
            "It polishes the surface smoother",
            "It removes the native oxide film",
            "It knocks silicon atoms out of place",
            "It cools the wafer below room heat"
        ],
        correct: 2
    },

    {
        question: "What does 'activating' a dopant atom actually mean?",
        answers: [
            "Removing it from the silicon entirely for good",
            "Turning it into an entirely different element",
            "Bonding it permanently to the gate oxide",
            "Moving it into a substitutional lattice site"
        ],
        correct: 3
    },

    {
        question: "What is the main risk of annealing at high temperature?",
        answers: [
            "The dopant diffuses and smears the profile",
            "The wafer turns electrically neutral",
            "The silicon reverts back into sand",
            "The implant dose doubles by itself"
        ],
        correct: 0
    },

    {
        question: "What makes a spike anneal different from a furnace anneal?",
        answers: [
            "It never rises above plain room temperature",
            "It sits at peak temperature for about a second",
            "It uses an ion beam instead of any heat",
            "It only anneals the wafer's outer edge"
        ],
        correct: 1
    },

    {
        question: "Why do smaller transistors generally need faster anneals?",
        answers: [
            "Smaller transistors hold no dopant at all",
            "Faster anneals are simply cheaper to run",
            "The same spread eats more of a short channel",
            "Smaller wafers heat up more slowly"
        ],
        correct: 2
    }

];


const chipLesson23Questions = [

    {
        question: "Why does CMOS fabrication need both n-wells and p-wells?",
        answers: [
            "Wells are decorative and don't affect it",
            "NMOS and PMOS need opposite well types",
            "One well type covers both transistors",
            "Wells replace the need for a gate"
        ],
        correct: 1
    },

    {
        question: "What sits between the source and drain in a MOSFET?",
        answers: [
            "A second, entirely unconnected transistor",
            "A solid, uninterrupted block of metal",
            "The channel, controlled by the gate above",
            "An open, completely empty vacuum gap"
        ],
        correct: 2
    },

    {
        question: "What does a lightly-doped drain (LDD) implant do?",
        answers: [
            "Doubles the drain's total doping level",
            "Removes the need for a gate oxide",
            "Insulates the drain from the channel",
            "Softens the electric field at the drain"
        ],
        correct: 3
    },

    {
        question: "What is a halo implant's doping type relative to its well?",
        answers: [
            "The same type as the well it sits in",
            "The opposite type of the well",
            "Always intrinsic, undoped silicon",
            "The same type as the source and drain"
        ],
        correct: 0
    },

    {
        question: "Why is the gate stack built before the source and drain?",
        answers: [
            "Because the gate can't be patterned later",
            "So the gate aligns the implants to itself",
            "Because implants would damage the oxide",
            "Because wells are implanted after it"
        ],
        correct: 1
    }

];


const chipLesson24Questions = [

    {
        question: "Which comes first: the well implant or the gate stack?",
        answers: [
            "The well implant",
            "The gate stack",
            "Both happen in one step",
            "Neither one is doped"
        ],
        correct: 0
    },

    {
        question: "Why can the LDD implant skip an extra alignment mask?",
        answers: [
            "LDD implants never need any mask",
            "It aligns to the edge the gate defines",
            "It happens before the gate exists",
            "Resist aligns itself automatically"
        ],
        correct: 1
    },

    {
        question: "What does the sidewall spacer do before the deeper implant?",
        answers: [
            "Insulates the gate from the well for good",
            "Takes the place of the anneal step",
            "Sets that implant back from the gate",
            "Removes the gate oxide completely"
        ],
        correct: 2
    },

    {
        question: "Roughly how short can a modern logic transistor's gate be?",
        answers: [
            "About 1 millimeter across",
            "About 500 micrometers across",
            "About 1 centimeter across",
            "Well under 20 nanometers"
        ],
        correct: 3
    },

    {
        question: "Why does a few-nanometer error matter so much at that scale?",
        answers: [
            "It is a large share of the device's margin",
            "It has no effect at such small sizes",
            "Transistors at that size tolerate anything",
            "Errors that small always cancel out"
        ],
        correct: 0
    }

];


const chipLesson25Questions = [

    {
        question: "What does FEOL, front-end-of-line, build?",
        answers: [
            "The metal wiring layers above the transistors",
            "Only the final protective passivation layer",
            "Only the package around the finished chip",
            "The transistors themselves, up to the contacts"
        ],
        correct: 3
    },

    {
        question: "What does BEOL, back-end-of-line, build?",
        answers: [
            "The metal wiring that connects the transistors",
            "The wells and implants inside the transistors",
            "The crystal that the whole wafer is cut from",
            "The furnace used to grow the gate oxide"
        ],
        correct: 0
    },

    {
        question: "Which of these belongs to the front-end of the flow?",
        answers: [
            "Adding the third layer of copper wiring",
            "Implanting and annealing the source and drain",
            "Attaching a wire bond to a metal pad",
            "Filling a via between two metal layers"
        ],
        correct: 1
    },

    {
        question: "Which of these belongs to the back-end of the flow?",
        answers: [
            "Growing the transistor's gate oxide",
            "Implanting dopant into the well",
            "Filling a contact hole with tungsten",
            "Annealing the wafer to activate dopant"
        ],
        correct: 2
    },

    {
        question: "Why do FEOL and BEOL steps generally run at different temperatures?",
        answers: [
            "Metal wiring actually requires more heat than silicon",
            "Temperature has no real effect on either half",
            "BEOL steps always run hotter than FEOL ones",
            "High heat later would damage finished transistors"
        ],
        correct: 3
    }

];


const chipLesson26Questions = [

    {
        question: "Why can't a wire connect directly to bare silicon efficiently?",
        answers: [
            "Bare silicon reflects too much light to be probed",
            "Metal simply cannot physically touch silicon",
            "Bare silicon resists current more than can be afforded",
            "Bare silicon slowly dissolves any metal placed on it"
        ],
        correct: 2
    },

    {
        question: "What is silicide?",
        answers: [
            "A high-resistance form of pure silicon",
            "A type of photoresist used in lithography",
            "A gas used to etch the contact holes",
            "A low-resistance metal-silicon compound"
        ],
        correct: 3
    },

    {
        question: "Why is silicide formation described as self-aligned?",
        answers: [
            "It only forms where the metal touches bare silicon",
            "It forms across the entire wafer surface evenly",
            "It requires a separate alignment mask to form",
            "It forms only on the back side of the wafer"
        ],
        correct: 0
    },

    {
        question: "What fills the narrow contact hole down to the silicide?",
        answers: [
            "Copper",
            "Tungsten",
            "Aluminum",
            "Gold"
        ],
        correct: 1
    },

    {
        question: "Why does the contact use a different metal than the layers above it?",
        answers: [
            "That metal is simply cheaper to buy in bulk",
            "The layers above never actually use metal",
            "It must survive a narrow, deep, hot process step",
            "Copper cannot conduct electricity at all"
        ],
        correct: 2
    }

];


const chipLesson27Questions = [

    {
        question: "Why does a chip need more than one metal layer?",
        answers: [
            "A single metal layer cannot conduct current",
            "Too many wires to route on a single flat plane",
            "Transistors physically require several layers",
            "One layer would make the chip too thin"
        ],
        correct: 1
    },

    {
        question: "How does wire width generally change from lower to upper metal layers?",
        answers: [
            "It shrinks thinner the higher up you go",
            "It stays exactly the same at every layer",
            "It grows wider, farther apart, and longer-range",
            "It alternates randomly from layer to layer"
        ],
        correct: 2
    },

    {
        question: "Why do lower metal layers stay thin and densely packed?",
        answers: [
            "Thin wires are simply cheaper to deposit",
            "They must match the width of the transistor gate",
            "Thin metal conducts better than thick metal",
            "They mainly carry short, local connections"
        ],
        correct: 3
    },

    {
        question: "What problem does a low-k dielectric mainly address?",
        answers: [
            "Unwanted capacitance between neighboring wires",
            "Unwanted resistance inside the metal itself",
            "The color of light reflected off the wafer",
            "The mechanical strength of the whole stack"
        ],
        correct: 0
    },

    {
        question: "What does a via connect?",
        answers: [
            "A transistor directly to the package pins",
            "One metal layer to the metal layer above it",
            "Two separate dies on the same wafer",
            "The wafer to the reference electrode"
        ],
        correct: 1
    }

];


const chipLesson28Questions = [

    {
        question: "In a CMOS inverter, what pulls the output high?",
        answers: [
            "The PMOS transistor, when the input is low",
            "The NMOS transistor, when the input is low",
            "Both transistors together, at all times",
            "Neither transistor; a resistor does"
        ],
        correct: 0
    },

    {
        question: "How is a NAND gate related to an inverter?",
        answers: [
            "It uses no transistors at all, only resistors",
            "It extends the same pull-up/pull-down pattern",
            "It is a completely unrelated kind of structure",
            "It replaces PMOS and NMOS with a single type"
        ],
        correct: 1
    },

    {
        question: "What is a standard-cell library?",
        answers: [
            "A physical shelf that stores finished wafers",
            "A list of every transistor ever fabricated",
            "Pre-designed, pre-verified layouts for gates",
            "A backup copy of the fab's design rules"
        ],
        correct: 2
    },

    {
        question: "What does place-and-route software do?",
        answers: [
            "Grows the gate oxide on every transistor",
            "Cuts the finished wafer into individual dies",
            "Tests each die's electrical performance",
            "Arranges and wires standard cells across the die"
        ],
        correct: 3
    },

    {
        question: "Roughly how many standard cells can a modern processor design use?",
        answers: [
            "Billions, placed automatically by software",
            "Around a dozen, placed by hand instead",
            "Exactly one cell, repeated at every location",
            "About a thousand cells, at the very most"
        ],
        correct: 0
    }

];


const chipLesson29Questions = [

    {
        question: "What do design rules actually describe?",
        answers: [
            "A designer's personal drawing preferences",
            "The chip's final electrical test results",
            "The chemical formula of the photoresist",
            "The fab's real manufacturing limits, as numbers"
        ],
        correct: 3
    },

    {
        question: "What does a design rule check (DRC) do?",
        answers: [
            "Compares each layout shape against the rule book",
            "Physically etches the wafer in a test run",
            "Measures the finished chip's clock speed",
            "Bonds wires onto the finished package"
        ],
        correct: 0
    },

    {
        question: "What does a DRC violation usually mean?",
        answers: [
            "The chip will definitely run faster than planned",
            "That shape likely won't manufacture correctly",
            "The design has already been sent to the fab",
            "The layout uses too few standard cells"
        ],
        correct: 1
    },

    {
        question: "Roughly how many masks can a modern logic chip need?",
        answers: [
            "Only a single mask, reused each time",
            "About 3 to 5 masks in total",
            "Around 30 to over 80 separate masks",
            "Several thousand separate masks"
        ],
        correct: 2
    },

    {
        question: "Why does mask cost matter so much for chip economics?",
        answers: [
            "Masks are reused forever across every chip design",
            "Masks cost less than the silicon wafers themselves",
            "Mask cost has no real effect on chip pricing",
            "It's a fixed cost spread across every chip made"
        ],
        correct: 3
    }

];


const chipLesson30Questions = [

    {
        question: "In the overall flow, what comes right after front-end fabrication?",
        answers: [
            "Dicing the wafer into its individual chips",
            "Packaging the finished chip in plastic",
            "Back-end fabrication: contacts and the metal stack",
            "Shipping the finished chip to a customer"
        ],
        correct: 2
    },

    {
        question: "When does wafer test happen in the flow?",
        answers: [
            "Only after the chip is fully packaged",
            "Before any transistors have been built",
            "It never happens; customers test the chips",
            "While every die still sits on the wafer"
        ],
        correct: 3
    },

    {
        question: "What happens during dicing?",
        answers: [
            "The wafer is cut apart into individual chips",
            "The wafer is polished to its final thickness",
            "Dopant is implanted into the substrate",
            "The gate oxide is grown for the first time"
        ],
        correct: 0
    },

    {
        question: "Roughly how many process steps can a leading-edge chip pass through?",
        answers: [
            "Usually fewer than ten steps in total",
            "Often well over a thousand separate steps",
            "Exactly one hundred steps, by convention",
            "Around twenty-five steps, on average"
        ],
        correct: 1
    },

    {
        question: "What does this closing unit mainly add that's new?",
        answers: [
            "An entirely new fabrication technique",
            "A brand new class of transistor",
            "Almost nothing new: it's the earlier units, in order",
            "A different material for the whole wafer"
        ],
        correct: 2
    }

];


const chipLesson31Questions = [

    {
        question: "How is yield defined?",
        answers: [
            "The total number of die on one wafer",
            "The fraction of die on a wafer that pass",
            "The number of wafers made per hour",
            "The thickness of the finished wafer"
        ],
        correct: 1
    },

    {
        question: "Why does low yield raise the cost of each good chip?",
        answers: [
            "Low-yield wafers are simply thicker to make",
            "Fabs charge more only for low-yield designs",
            "A wafer costs about the same regardless of yield",
            "Low yield always means a smaller wafer"
        ],
        correct: 2
    },

    {
        question: "Why do die near the wafer's edge often get discarded?",
        answers: [
            "They are always physically the wrong shape",
            "Edge die are never actually tested at all",
            "Edge die contain no transistors at all",
            "Their pattern there is usually incomplete"
        ],
        correct: 3
    },

    {
        question: "Which of these is a parametric failure, not a defect?",
        answers: [
            "A working die that runs too slowly",
            "A particle bridging two metal lines",
            "A pattern printed with the wrong shape",
            "A void left inside a deposited film"
        ],
        correct: 0
    },

    {
        question: "What does a wafer map show?",
        answers: [
            "The exact chemical formula of the wafer",
            "Every die, colored by whether it passed",
            "A single number summarizing the whole lot",
            "The price paid for that specific wafer"
        ],
        correct: 1
    }

];


const chipLesson32Questions = [

    {
        question: "What makes a physical flaw count as a real defect?",
        answers: [
            "It changes the circuit's electrical behavior",
            "It is visible under an ordinary light microscope",
            "It appears on more than one die at once",
            "It happens during the very first process step"
        ],
        correct: 0
    },

    {
        question: "Which of these is a common source of defects?",
        answers: [
            "A wafer that was cleaned one extra time",
            "A stray particle landing mid-process",
            "A mask that was verified before use",
            "A die that passed every earlier test"
        ],
        correct: 1
    },

    {
        question: "What separates a killer defect from a non-killer one?",
        answers: [
            "Killer defects are always larger in size",
            "Non-killer defects never physically exist",
            "Whether it sits on a feature that matters",
            "Killer defects only occur on odd-numbered wafers"
        ],
        correct: 2
    },

    {
        question: "In the diagram, what does the stray particle cause?",
        answers: [
            "A permanent open circuit on one line",
            "A change in the wafer's overall color",
            "A new transistor forming by accident",
            "An unwanted short between two metal lines"
        ],
        correct: 3
    },

    {
        question: "What does D_0 represent?",
        answers: [
            "Defects per unit area of wafer",
            "The total defect count on one die",
            "The diameter of the wafer itself",
            "The number of masks used per layer"
        ],
        correct: 0
    }

];


const chipLesson33Questions = [

    {
        question: "What is the main purpose of metrology in a fab?",
        answers: [
            "Designing the next generation of chips",
            "Cleaning particles off the wafer surface",
            "Cutting the finished wafer into die",
            "Catching a process drifting off target early"
        ],
        correct: 3
    },

    {
        question: "What does critical dimension (CD) measure?",
        answers: [
            "The width of the smallest key features",
            "The overall diameter of the wafer",
            "The total number of layers on a chip",
            "The thickness of the finished package"
        ],
        correct: 0
    },

    {
        question: "What does a CD-SEM use to measure a feature's width?",
        answers: [
            "A beam of visible light only",
            "A scanned beam of electrons",
            "A physical mechanical probe",
            "A chemical etch that removes it"
        ],
        correct: 1
    },

    {
        question: "Why does CD-SEM typically sample only a few sites per wafer?",
        answers: [
            "It can only measure the wafer's outer edge",
            "It destroys every die it touches",
            "Its high resolution comes at the cost of speed",
            "It only works on unpatterned, bare wafers"
        ],
        correct: 2
    },

    {
        question: "What does overlay measure?",
        answers: [
            "How thick a single deposited film is",
            "How many particles landed on a wafer",
            "How fast a finished chip runs overall",
            "How well one layer aligns to the one below"
        ],
        correct: 3
    }

];


const chipLesson34Questions = [

    {
        question: "What does a random scatter of failures on a wafer map usually suggest?",
        answers: [
            "A single tool malfunctioning consistently",
            "A design that is fundamentally too small",
            "Particles, landing unpredictably",
            "A wafer that was never actually tested"
        ],
        correct: 2
    },

    {
        question: "What does a center-clustered failure pattern often point to?",
        answers: [
            "A particle that landed only once",
            "A perfectly healthy, on-target process",
            "A problem with the wafer's packaging",
            "A CMP step polishing unevenly"
        ],
        correct: 3
    },

    {
        question: "What might an edge-ring failure pattern suggest?",
        answers: [
            "A deposition or etch step uneven near the edge",
            "A defect that occurred at the wafer's center",
            "A completely random particle event",
            "A mask that was aligned perfectly"
        ],
        correct: 0
    },

    {
        question: "What do streaks across a wafer map often indicate?",
        answers: [
            "A chemical reaction inside the silicon itself",
            "A mechanical scan issue or handling scratch",
            "A perfectly uniform, defect-free process",
            "An error in the final electrical test"
        ],
        correct: 1
    },

    {
        question: "Why does an engineer look at a map's shape before counting failures?",
        answers: [
            "Shape has no real diagnostic value at all",
            "Counting failures is always done first instead",
            "The shape points toward which tool to check first",
            "Maps never actually show any shape"
        ],
        correct: 2
    }

];


const chipLesson35Questions = [

    {
        question: "What is the main goal of statistical process control?",
        answers: [
            "Replace final testing entirely with charts",
            "Catch a process drifting before wafers are ruined",
            "Increase the number of masks used per layer",
            "Slow down the whole wafer fabrication schedule"
        ],
        correct: 1
    },

    {
        question: "What does a control chart plot?",
        answers: [
            "The total cost of the finished wafer",
            "A single average taken once a year",
            "A measurement, in the order it was taken",
            "The names of the engineers on shift"
        ],
        correct: 2
    },

    {
        question: "Where do a control chart's limits come from?",
        answers: [
            "A fixed number set once and never changed",
            "The customer's final product specification",
            "The price of the raw silicon wafer",
            "The process's own normal variation"
        ],
        correct: 3
    },

    {
        question: "Which of these would most likely get its own control chart?",
        answers: [
            "Film thickness after every deposition step",
            "The color of the fab's warning lights",
            "The number of engineers on a shift",
            "The brand of chemicals in storage"
        ],
        correct: 0
    },

    {
        question: "What does an out-of-control signal actually mean?",
        answers: [
            "The wafer is definitely unusable now",
            "Something changed, and needs investigating",
            "The chart itself is broken and useless",
            "No further action is ever required"
        ],
        correct: 1
    }

];


const chipLesson36Questions = [

    {
        question: "How does yield typically behave right after a process launches?",
        answers: [
            "It starts lower, then climbs as it matures",
            "It starts at its highest point immediately",
            "It stays exactly flat for its entire life",
            "It has no relationship to process age"
        ],
        correct: 0
    },

    {
        question: "In the simple yield model, what does a bigger die area do to yield?",
        answers: [
            "It has no effect on yield whatsoever",
            "It lowers the odds of avoiding every defect",
            "It always raises yield by a fixed amount",
            "It only matters if D_0 equals zero"
        ],
        correct: 1
    },

    {
        question: "With D_0 = 0.2 per cm² and a 1 cm² die, roughly what yield results?",
        answers: [
            "About 20%",
            "About 99%",
            "About 82%",
            "About 50%"
        ],
        correct: 2
    },

    {
        question: "What happens to yield in that model if the die area doubles?",
        answers: [
            "Yield rises to nearly 100% instead",
            "Yield stays exactly the same as before",
            "Yield becomes impossible to calculate",
            "Yield falls further, to around 67%"
        ],
        correct: 3
    },

    {
        question: "What actually drives the yield 'learning curve' upward over time?",
        answers: [
            "Repeated cycles of diagnosing and fixing root causes",
            "Simply waiting, with no process changes made",
            "Switching to a completely different wafer size",
            "Ignoring wafer maps once a product ships"
        ],
        correct: 0
    }

];


const chipLesson37Questions = [

    {
        question: "What is one of the three main jobs of a chip's package?",
        answers: [
            "Increasing the number of transistors on it",
            "Doping the silicon a second time over",
            "Growing a fresh new layer of gate oxide",
            "Protecting the die from damage and moisture"
        ],
        correct: 3
    },

    {
        question: "Why can't a bare die be used directly on a circuit board?",
        answers: [
            "Its pads and structure are too fragile and fine",
            "Bare die contain no electrical connections",
            "Bare die are electrically identical to sand",
            "Circuit boards cannot conduct any current"
        ],
        correct: 0
    },

    {
        question: "What does a package mainly provide for heat generated inside a die?",
        answers: [
            "A way to generate even more heat",
            "A path for that heat to escape",
            "A method to cool the die to freezing",
            "No effect on heat whatsoever"
        ],
        correct: 1
    },

    {
        question: "In the overall flow, when does a die typically get its first electrical test?",
        answers: [
            "Only after it ships to a customer",
            "Before any transistors are built",
            "While still whole, on the wafer",
            "It is never tested before shipping"
        ],
        correct: 2
    },

    {
        question: "What happens to a die right after wafer-level test and dicing?",
        answers: [
            "Every single die is immediately discarded",
            "The whole wafer is regrown from scratch",
            "Packaging happens before dicing instead",
            "Good die move on into packaging"
        ],
        correct: 3
    }

];


const chipLesson38Questions = [

    {
        question: "What does wire bonding connect a die's pads with?",
        answers: [
            "A grid of solder bumps underneath",
            "A direct weld to the package lid",
            "A fine looped wire to the substrate",
            "A layer of conductive adhesive only"
        ],
        correct: 2
    },

    {
        question: "What does flip-chip do differently from wire bonding?",
        answers: [
            "It removes the die's pads entirely",
            "It uses no substrate at all",
            "It bonds two dies directly together",
            "It flips the die face down onto bumps"
        ],
        correct: 3
    },

    {
        question: "Why can flip-chip support far more connections than wire bonding?",
        answers: [
            "Bumps can cover the whole die face",
            "Wire bonding physically has no pad limit",
            "Flip-chip uses larger pads than wire bonding",
            "Flip-chip removes the need for pads"
        ],
        correct: 0
    },

    {
        question: "What is a common electrical advantage of flip-chip over wire bonding?",
        answers: [
            "It requires no electrical connection at all",
            "Shorter connections add less inductance",
            "It eliminates the need for a substrate",
            "It always runs at a lower voltage"
        ],
        correct: 1
    },

    {
        question: "Why did high I/O counts push chips toward flip-chip?",
        answers: [
            "Wire bonding stopped being physically possible",
            "Flip-chip is always the cheaper option",
            "Perimeter pads run out of room around the edge",
            "I/O count has no effect on package choice"
        ],
        correct: 2
    }

];


const chipLesson39Questions = [

    {
        question: "What limited how many pins a DIP or QFP package could offer?",
        answers: [
            "The die itself could hold no more pads",
            "Connections could only run along the perimeter",
            "Silicon could not conduct enough current",
            "Packages were not yet electrically tested"
        ],
        correct: 1
    },

    {
        question: "What makes a ball grid array (BGA) different from a QFP?",
        answers: [
            "It carries no electrical connections at all",
            "It uses only two connections in total",
            "It spreads connections across the whole underside",
            "It removes the need for any substrate"
        ],
        correct: 2
    },

    {
        question: "Why does a BGA support more connections than a leaded package?",
        answers: [
            "BGAs are always physically much larger",
            "Leaded packages use no metal connections",
            "Area has no relationship to connection count",
            "Its connections scale with area, not just edge"
        ],
        correct: 3
    },

    {
        question: "If a package's side length doubles, what happens to its area?",
        answers: [
            "It roughly quadruples",
            "It stays exactly the same",
            "It also roughly doubles",
            "It is cut in half instead"
        ],
        correct: 0
    },

    {
        question: "What general trend drove packages from DIP toward BGA?",
        answers: [
            "A steady decline in I/O connection counts",
            "Steadily rising I/O connection counts",
            "A ban on through-hole packages",
            "Wafers becoming smaller over time"
        ],
        correct: 1
    }

];


const chipLesson40Questions = [

    {
        question: "Why is a die tested both on the wafer and after packaging?",
        answers: [
            "Packaging itself can introduce new failures",
            "Wafer-level testing is purely optional",
            "Final test replaces wafer sort entirely",
            "Testing twice is required only by law"
        ],
        correct: 0
    },

    {
        question: "Which of these is an example of parametric test?",
        answers: [
            "Checking whether the package looks shiny",
            "Measuring the maximum speed a chip runs at",
            "Counting how many pins the package has",
            "Measuring the weight of the finished chip"
        ],
        correct: 1
    },

    {
        question: "What does binning actually do?",
        answers: [
            "Physically destroys every failed chip made",
            "Redesigns the chip for each new customer",
            "Sorts identical designs into different grades",
            "Combines several designs into one single part"
        ],
        correct: 2
    },

    {
        question: "What is infant mortality, in this context?",
        answers: [
            "A failure that only appears after decades",
            "A defect found only during initial design",
            "A type of failure that never actually occurs",
            "An early failure, soon after first use"
        ],
        correct: 3
    },

    {
        question: "What is the main purpose of burn-in?",
        answers: [
            "Force early failures to happen before shipping",
            "Permanently disable half of every chip",
            "Increase a chip's clock speed permanently",
            "Replace final electrical testing entirely"
        ],
        correct: 0
    }

];


const chipLesson41Questions = [

    {
        question: "What path does heat take out of a working chip?",
        answers: [
            "Directly from the case back into the junction",
            "It has no path and just steadily accumulates",
            "From the ambient air inward into the junction",
            "From the junction, through the case, to the air"
        ],
        correct: 3
    },

    {
        question: "What does a lower thermal resistance value mean?",
        answers: [
            "A smaller temperature rise for the same power",
            "A larger temperature rise for the same power",
            "The chip draws less electrical current",
            "The chip contains fewer total transistors"
        ],
        correct: 0
    },

    {
        question: "What does the HAST reliability test combine?",
        answers: [
            "Extreme cold with total vacuum",
            "High heat and high humidity together",
            "Bright light with total darkness",
            "High voltage with zero current"
        ],
        correct: 1
    },

    {
        question: "What does temperature cycling testing mainly stress?",
        answers: [
            "The chip's maximum possible clock speed rating",
            "The wafer's original silicon crystal orientation",
            "The package's ability to survive repeated swings",
            "The total number of masks used to build it"
        ],
        correct: 2
    },

    {
        question: "In the bathtub curve, what does the first, high phase represent?",
        answers: [
            "Steady, low failure during useful life",
            "Wear-out failures very late in life",
            "A phase where failure is impossible",
            "Infant mortality, early in the chip's life"
        ],
        correct: 3
    }

];


const chipLesson42Questions = [

    {
        question: "Why might a design be split into several chiplets instead of one large die?",
        answers: [
            "Chiplets always run at a higher voltage",
            "Splitting a die removes it from testing",
            "Smaller dies yield better than one huge die",
            "One large die always yields better"
        ],
        correct: 2
    },

    {
        question: "What sits between chiplets in a 2.5D package?",
        answers: [
            "Nothing; chiplets touch each other directly",
            "A second complete package substrate",
            "A layer of ordinary circuit board material",
            "A silicon interposer with fine wiring"
        ],
        correct: 3
    },

    {
        question: "What does a through-silicon via (TSV) do?",
        answers: [
            "Carries a signal vertically through silicon",
            "Carries a signal only across the surface",
            "Removes the need for any wiring at all",
            "Converts a signal from digital to analog"
        ],
        correct: 0
    },

    {
        question: "What is a practical advantage of 2.5D over true 3D stacking?",
        answers: [
            "2.5D packages need no interposer at all",
            "Each chiplet can be tested independently",
            "2.5D always has a smaller footprint",
            "3D stacking cannot use TSVs at all"
        ],
        correct: 1
    },

    {
        question: "What is a practical advantage of 3D stacking over 2.5D?",
        answers: [
            "It requires no through-silicon vias at all",
            "It fully eliminates the need for chiplets",
            "Shorter connections and a smaller footprint",
            "It removes the need for any testing at all"
        ],
        correct: 2
    }

];


const chipLesson43Questions = [

    {
        question: "What does an IDM do that a fabless company does not?",
        answers: [
            "Designs chips using its own engineers",
            "Builds chips in fabs that it owns",
            "Sells finished chips to customers",
            "Writes the software used to test chips"
        ],
        correct: 1
    },

    {
        question: "What is the defining trait of a fabless company?",
        answers: [
            "It builds chips but does not design them",
            "It only makes design software, not chips",
            "It designs chips but does not build them",
            "It owns fabs but never designs anything"
        ],
        correct: 2
    },

    {
        question: "What does a foundry do for a fabless company?",
        answers: [
            "Designs new chips on that company's behalf",
            "Sells that company's chips to customers",
            "Writes the marketing for that company's chips",
            "Builds the chips that company designed"
        ],
        correct: 3
    },

    {
        question: "Why did the foundry model emerge in the first place?",
        answers: [
            "Fabs became too costly for most companies to own",
            "Foundries became legally required by regulation",
            "Chip design stopped needing any fabrication",
            "IDMs were banned from designing new chips"
        ],
        correct: 0
    },

    {
        question: "In the three-model comparison, what do a fabless company and a foundry together add up to?",
        answers: [
            "Far more total work than one IDM does",
            "Roughly what one IDM does alone",
            "Nothing at all resembling an IDM's role",
            "Exactly one foundry's normal operation"
        ],
        correct: 1
    }

];


const chipLesson44Questions = [

    {
        question: "Roughly what does a leading-edge fab cost to build?",
        answers: [
            "On the order of $10 billion to $20 billion",
            "On the order of $10 million to $20 million",
            "Under one million dollars total",
            "Roughly $500,000, similar to a small factory"
        ],
        correct: 0
    },

    {
        question: "What is one major cost inside a fab, beyond the building itself?",
        answers: [
            "The land the building sits on, alone",
            "The tools, such as a single EUV scanner",
            "The electricity bill for the parking lot",
            "The paint used on the exterior walls"
        ],
        correct: 1
    },

    {
        question: "Why do only a handful of companies operate leading-edge fabs?",
        answers: [
            "Government law strictly limits the number allowed",
            "Leading-edge fabs require no real investment",
            "The entry cost filters out almost everyone",
            "Every company already owns one by default"
        ],
        correct: 2
    },

    {
        question: "Why must a fab run at very high volume once it's built?",
        answers: [
            "Regulations require a fixed minimum output",
            "High volume makes each wafer heavier",
            "Running slowly would improve its yield instead",
            "To earn back its enormous construction cost"
        ],
        correct: 3
    },

    {
        question: "How are yield and fab cost related, as this unit frames it?",
        answers: [
            "The same economic problem, seen two ways",
            "They are completely unrelated concepts",
            "Yield only matters in fabless companies",
            "Fab cost has no connection to output at all"
        ],
        correct: 0
    }

];


const chipLesson45Questions = [

    {
        question: "What is true of the tools and materials a fab uses?",
        answers: [
            "A fab manufactures every single one itself",
            "A fab needs no outside tools or materials at all",
            "Every fab designs and builds its own unique scanner",
            "A fab buys them from outside specialized suppliers"
        ],
        correct: 3
    },

    {
        question: "What does ASML specifically supply to the industry?",
        answers: [
            "Production EUV lithography scanners",
            "Ultra-pure silicon wafers for every fab",
            "The photoresist used in most fabs",
            "Finished, packaged chips ready to sell"
        ],
        correct: 0
    },

    {
        question: "Which of these is an example of a materials supplier, not a tool maker?",
        answers: [
            "A company that builds plasma etch chambers",
            "A company that grows and polishes silicon wafers",
            "A company that builds deposition equipment",
            "A company that builds CD-SEM systems for fabs"
        ],
        correct: 1
    },

    {
        question: "Why might losing access to one key supplier stall the whole industry?",
        answers: [
            "Every supplier has dozens of equal competitors",
            "Fabs keep years of spare tools in storage",
            "Many of these suppliers have very few competitors",
            "Suppliers matter only for older, legacy fabs"
        ],
        correct: 2
    },

    {
        question: "What role do photomasks play in this supply chain?",
        answers: [
            "Fabs always design and etch their own masks",
            "Masks are supplied only by EDA software firms",
            "Masks are grown the same way silicon wafers are",
            "Specialized shops build them from a fab's design files"
        ],
        correct: 3
    }

];


const chipLesson46Questions = [

    {
        question: "When does chip design mostly happen, relative to fabrication?",
        answers: [
            "Only after the chip has already been built",
            "At the exact same time as fabrication",
            "Almost entirely before any wafer enters a fab",
            "Design and fabrication are the same single step"
        ],
        correct: 2
    },

    {
        question: "What does EDA stand for?",
        answers: [
            "Electronic device assembly",
            "Extreme design accuracy",
            "Engineering data analysis",
            "Electronic design automation"
        ],
        correct: 3
    },

    {
        question: "What happens during the 'synthesis' step of chip design?",
        answers: [
            "Logic is converted into specific standard cells",
            "The finished chip is diced from its wafer",
            "The design rule check runs for the last time",
            "Silicon is grown into a crystal ingot"
        ],
        correct: 0
    },

    {
        question: "What happens at tapeout?",
        answers: [
            "The chip is packaged for the first time",
            "The verified design is sent to the fab as mask data",
            "The wafer is polished to its final thickness",
            "The chip receives its very first electrical test"
        ],
        correct: 1
    },

    {
        question: "Which two companies dominate the EDA software industry?",
        answers: [
            "ASML and Applied Materials",
            "TSMC and Samsung",
            "Synopsys and Cadence",
            "Intel and GlobalFoundries"
        ],
        correct: 2
    }

];


const chipLesson47Questions = [

    {
        question: "Who first observed the trend behind Moore's Law, and when?",
        answers: [
            "Gordon Moore, but in 1995",
            "Gordon Moore, back in 1965",
            "A committee of fab CEOs, in 1980",
            "A government agency, back in the 1950s"
        ],
        correct: 1
    },

    {
        question: "Roughly how often did transistor count per chip double, historically?",
        answers: [
            "Roughly every twenty years",
            "Roughly once per decade",
            "Roughly every one to two years",
            "Roughly once every six months"
        ],
        correct: 2
    },

    {
        question: "Why did shrinking transistors improve so many things at once?",
        answers: [
            "They only ever got cheaper, nothing else changed",
            "Shrinking made them slower and less efficient",
            "Size never actually affected performance at all",
            "They got faster, cheaper, and used less power together"
        ],
        correct: 3
    },

    {
        question: "Which of these is a real reason Moore's Law is slowing today?",
        answers: [
            "Features are now only tens of atoms wide",
            "Fabs have simply stopped hiring new engineers",
            "Silicon has become completely unavailable now",
            "Customers no longer want faster chips at all"
        ],
        correct: 0
    },

    {
        question: "What does 'More than Moore' generally refer to?",
        answers: [
            "A newer, faster version of Moore's Law itself",
            "Improving chips through means other than shrinking",
            "Abandoning transistors in favor of a new device",
            "A law requiring even faster annual doubling"
        ],
        correct: 1
    }

];


const chipLesson48Questions = [

    {
        question: "What does this unit emphasize about the process covered in this course?",
        answers: [
            "Real people and careers run every step of it",
            "It runs entirely without human involvement",
            "It was only ever theoretical, not real work",
            "Only a single engineer runs the whole flow"
        ],
        correct: 0
    },

    {
        question: "Which role would most likely chase down a wafer map's root cause?",
        answers: [
            "A photomask delivery driver",
            "A yield engineer, in the fab",
            "A retail store sales associate",
            "A patent licensing attorney"
        ],
        correct: 1
    },

    {
        question: "Which part of this course does packaging engineering connect back to?",
        answers: [
            "Part 1, on wafer preparation",
            "Part 3, on lithography",
            "Part 7, on packaging and test",
            "Part 6, on yield and metrology"
        ],
        correct: 2
    },

    {
        question: "What point does 'a closing number' make about the industry's scale?",
        answers: [
            "Exactly one person performs this entire flow",
            "The industry employs fewer than a hundred people",
            "Scale has no real connection to career variety",
            "One simplified course scales up to millions of careers"
        ],
        correct: 3
    },

    {
        question: "What does the final unit suggest as a next step?",
        answers: [
            "Picking one area from the course and going deeper",
            "Considering the course fully complete forever",
            "Avoiding every career this course described",
            "Forgetting everything covered in earlier parts"
        ],
        correct: 0
    }

];

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
    12: chipLesson12Questions,
    13: chipLesson13Questions,
    14: chipLesson14Questions,
    15: chipLesson15Questions,
    16: chipLesson16Questions,
    17: chipLesson17Questions,
    18: chipLesson18Questions,
    19: chipLesson19Questions,
    20: chipLesson20Questions,
    21: chipLesson21Questions,
    22: chipLesson22Questions,
    23: chipLesson23Questions,
    24: chipLesson24Questions,
    25: chipLesson25Questions,
    26: chipLesson26Questions,
    27: chipLesson27Questions,
    28: chipLesson28Questions,
    29: chipLesson29Questions,
    30: chipLesson30Questions,
    31: chipLesson31Questions,
    32: chipLesson32Questions,
    33: chipLesson33Questions,
    34: chipLesson34Questions,
    35: chipLesson35Questions,
    36: chipLesson36Questions,
    37: chipLesson37Questions,
    38: chipLesson38Questions,
    39: chipLesson39Questions,
    40: chipLesson40Questions,
    41: chipLesson41Questions,
    42: chipLesson42Questions,
    43: chipLesson43Questions,
    44: chipLesson44Questions,
    45: chipLesson45Questions,
    46: chipLesson46Questions,
    47: chipLesson47Questions,
    48: chipLesson48Questions
};
