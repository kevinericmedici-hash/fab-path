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
            "Cost per cell vs. total weight",
            "Energy density vs. power density",
            "Operating voltage vs. current",
            "Temperature range vs. pressure"
        ],
        correct: 1
    },

    {
        question: "Why do batteries typically have lower power density than capacitors?",
        answers: [
            "Their electrodes are made from much more expensive materials",
            "They rely on slower, diffusion-controlled chemical reactions",
            "They must use larger dielectric layers between the plates",
            "They operate at much lower voltages than capacitors do"
        ],
        correct: 1
    },

    {
        question: "Where do supercapacitors sit on a Ragone plot relative to batteries and capacitors?",
        answers: [
            "Below both of them on both axes",
            "In between, bridging the gap",
            "Above both of them on both axes",
            "Exactly on top of the batteries"
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
            "Much lower material cost than batteries",
            "Very long cycle life with little degradation",
            "They can operate without any electrolyte",
            "They perform identically at any temperature"
        ],
        correct: 1
    }

];


const supercapLesson2Questions = [

    {
        question: "Capacitance is mathematically defined as the ratio of what to what?",
        answers: [
            "Stored charge to applied voltage",
            "Current to total resistance",
            "Stored energy to power output",
            "Electrode area to its volume"
        ],
        correct: 0
    },

    {
        question: "In C = εA/d, what happens to capacitance if the electrode spacing (d) decreases?",
        answers: [
            "It decreases",
            "It increases",
            "It is unchanged",
            "It drops to zero"
        ],
        correct: 1
    },

    {
        question: "Areal capacitance normalizes charge storage by which two things?",
        answers: [
            "Elapsed time and operating temperature",
            "Voltage window and electrode area",
            "Total mass and electrode volume",
            "Peak current and internal resistance"
        ],
        correct: 1
    },

    {
        question: "How does stored energy scale with voltage in E = ½C(ΔV)²?",
        answers: [
            "Linearly, in direct proportion",
            "Inversely with the voltage",
            "With the square of voltage",
            "It doesn't depend on voltage"
        ],
        correct: 2
    },

    {
        question: "Which of these is NOT one of the four ways to raise capacitance discussed in this unit?",
        answers: [
            "Increasing electrode surface area",
            "Reducing the spacing between electrodes",
            "Raising the dielectric's melting point",
            "Adding reversible redox reactions"
        ],
        correct: 2
    }

];


const supercapLesson3Questions = [

    {
        question: "What separates the two conductive plates in a capacitor?",
        answers: [
            "A sealed vacuum-filled tube",
            "An insulating dielectric",
            "A doped semiconductor strip",
            "A wound magnetic coil core"
        ],
        correct: 1
    },

    {
        question: "Why can capacitors charge and discharge extremely fast compared to batteries?",
        answers: [
            "They operate at far higher voltages than batteries ever do",
            "They store charge electrostatically, with no chemical reactions",
            "Their electrodes are much smaller and lighter overall",
            "They use thinner, more conductive liquid electrolytes"
        ],
        correct: 1
    },

    {
        question: "What primarily limits a capacitor's power delivery capability?",
        answers: [
            "Its internal resistance",
            "Its outer casing color",
            "The ambient humidity",
            "The device's total weight"
        ],
        correct: 0
    },

    {
        question: "Which of these is a common capacitor dielectric material?",
        answers: [
            "Carbon felt",
            "Mica paper",
            "Graphite",
            "Graphene"
        ],
        correct: 1
    },

    {
        question: "Why do conventional capacitors have low energy density compared to batteries or supercapacitors?",
        answers: [
            "They are limited to operating at very low temperatures",
            "Electrostatic storage on a relatively small electrode area",
            "Their plates cannot sustain more than a few millivolts",
            "They rely on rare, expensive metals for the plates"
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
            "The full voltage window being scanned",
            "The scan rate, how fast voltage is swept",
            "The volume of electrolyte in the cell",
            "The number of electrons transferred"
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
            "EDLCs, pseudocapacitors, and hybrid capacitors",
            "Planar, stacked, and wound-roll capacitors",
            "Primary, secondary, and tertiary capacitors"
        ],
        correct: 1
    },

    {
        question: "How does a supercapacitor's charge storage differ from a battery's?",
        answers: [
            "Supercapacitors rely on bulk reactions; batteries store charge at surfaces",
            "Supercapacitors store charge inside a solid dielectric layer; batteries do not",
            "Supercapacitors store charge at surfaces; batteries rely on bulk reactions",
            "Both store charge the same way, through bulk chemical reactions"
        ],
        correct: 2
    },

    {
        question: "An electric double-layer capacitor (EDLC) stores charge through what?",
        answers: [
            "Fast reversible redox reactions at the electrode surface",
            "Ions accumulating electrostatically at the electrode surface",
            "Slow bulk chemical reactions deep inside the electrode",
            "Heat that is released and reabsorbed during charging"
        ],
        correct: 1
    },

    {
        question: "Which type of supercapacitor typically reaches higher capacitance and energy density by using electrochemical charge-transfer reactions?",
        answers: [
            "Pseudocapacitive devices",
            "Double-layer capacitors",
            "Ceramic dielectric capacitors",
            "Metal-film capacitors"
        ],
        correct: 0
    },

    {
        question: "What is the goal of a hybrid capacitor?",
        answers: [
            "To eliminate the electrolyte from the cell entirely",
            "To combine both storage mechanisms in one device",
            "To store charge only deep in the bulk of the electrode",
            "To operate as a cell that has no electrodes at all"
        ],
        correct: 1
    }

];


const supercapLesson6Questions = [

    {
        question: "When voltage is applied to an electric double-layer capacitor, what happens to the ions in the electrolyte?",
        answers: [
            "They are consumed by reactions at the electrode surface",
            "They move to the oppositely charged surface and adhere",
            "They leave the device through the current collector",
            "They crystallize into a thin solid dielectric layer"
        ],
        correct: 1
    },

    {
        question: "Why are EDLC electrodes typically made of highly porous activated carbon?",
        answers: [
            "Its transparency lets light reach the electrolyte",
            "Its huge surface area gives more room to hold charge",
            "It reacts with the electrolyte to form new compounds",
            "It is the cheapest electrical insulator available"
        ],
        correct: 1
    },

    {
        question: "What is the thin, dense region of charge that forms at the boundary between an electrode and the electrolyte commonly called?",
        answers: [
            "The Helmholtz double layer",
            "The dielectric shell layer",
            "The Faraday shielding cage",
            "The diffusion depletion wedge"
        ],
        correct: 0
    },

    {
        question: "Roughly how quickly can an EDLC charge and discharge?",
        answers: [
            "Over roughly two days",
            "Over about twelve hours",
            "In just a few seconds",
            "Only after weeks of rest"
        ],
        correct: 2
    },

    {
        question: "Why can an EDLC cycle millions of times with virtually no degradation?",
        answers: [
            "Its electrodes are gradually replaced with fresh material each cycle",
            "Ions simply adsorb and release, with no chemical change at the electrode",
            "It is only ever operated at a tiny fraction of its voltage rating",
            "Its electrolyte is completely drained and replaced each cycle"
        ],
        correct: 1
    }

];


const supercapLesson7Questions = [

    {
        question: "What distinguishes pseudocapacitance from double-layer capacitance?",
        answers: [
            "It stores charge purely through ion adsorption, with no reactions",
            "It involves fast, reversible electron-transfer reactions at the surface",
            "It involves reactions that occur only deep within the bulk material",
            "It requires a solid dielectric layer between the two electrodes"
        ],
        correct: 1
    },

    {
        question: "Which of these is a common pseudocapacitive electrode material?",
        answers: [
            "Mica dielectric paper",
            "Activated carbon cloth",
            "Manganese oxide (MnO₂)",
            "Polyethylene sheeting"
        ],
        correct: 2
    },

    {
        question: "Why can pseudocapacitive reactions stay fast even though they involve redox chemistry?",
        answers: [
            "They are confined to the near-surface region, not the bulk",
            "They require operating at extremely high temperatures",
            "They take place without any contact with the electrolyte",
            "They only happen once, during the first charge cycle"
        ],
        correct: 0
    },

    {
        question: "What is a common drawback of pseudocapacitive electrodes compared with double-layer ones?",
        answers: [
            "They store far less charge per unit of surface area",
            "They cannot be charged quickly without overheating",
            "Repeated redox cycling tends to reduce cycling stability",
            "They are unaffected by the choice of electrolyte"
        ],
        correct: 2
    },

    {
        question: "Which of these is an electrically conducting polymer used as a pseudocapacitive electrode material?",
        answers: [
            "Polyaniline (PANI)",
            "Ruthenium oxide (RuO₂)",
            "Graphene oxide (GO)",
            "Silicon dioxide (SiO₂)"
        ],
        correct: 0
    }

];


const supercapLesson8Questions = [

    {
        question: "In an interdigitated electrode array, what roles do adjacent electrodes play in redox amplification?",
        answers: [
            "Both act only as passive insulating spacers between charges",
            "One acts as a generator and its neighbor as a collector",
            "Both electrodes only oxidize the species, never reduce it",
            "Neither electrode exchanges electrons with the species"
        ],
        correct: 1
    },

    {
        question: "What happens to redox-active species diffusing between closely spaced electrodes in redox amplification?",
        answers: [
            "They are consumed permanently after the first reaction they undergo",
            "They are repeatedly oxidized and reduced, amplifying the current",
            "They lose all mobility once they reach the first electrode",
            "They deposit as a solid film across the electrode fingers"
        ],
        correct: 1
    },

    {
        question: "How does narrowing the spacing between interdigitated electrodes affect redox amplification?",
        answers: [
            "It increases amplification, since shorter diffusion allows more cycles",
            "It decreases amplification, since narrow gaps block electrolyte flow",
            "It has no effect, since diffusion distance does not matter here",
            "It removes the need for any redox-active species in solution"
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
            "Doubling the electrolyte temperature during each test run",
            "Increasing electrode height from about 0.22 µm to about 1.1 µm",
            "Increasing the electrode gap from about 0.22 µm to about 1.1 µm",
            "Switching the electrolyte from water to an organic solvent"
        ],
        correct: 1
    }

];


const supercapLesson9Questions = [

    {
        question: "Which set of properties best describes an ideal supercapacitor electrode?",
        answers: [
            "High conductivity, large surface area, and chemical stability",
            "Low conductivity, small surface area, and chemical instability",
            "High density, a low melting point, and strong magnetism",
            "Very high cost, extreme rarity, and mechanical fragility"
        ],
        correct: 0
    },

    {
        question: "Which are the three main families of supercapacitor electrode materials?",
        answers: [
            "Ceramics, silica glass, and cellulose-based materials",
            "Metal oxides, conducting polymers, and carbon-based materials",
            "Copper alloys, aluminum foils, and stainless steel meshes",
            "Silicon, germanium, and gallium-arsenide semiconductors"
        ],
        correct: 1
    },

    {
        question: "Why does an electrode's electrochemically active surface area matter so much?",
        answers: [
            "More active area gives charge more places to be stored",
            "A larger area makes the electrode much lighter overall",
            "A larger area lowers the viscosity of the electrolyte",
            "A larger area removes the need for a current collector"
        ],
        correct: 0
    },

    {
        question: "Which pair of properties most directly protects an electrode from wearing out over many charge cycles?",
        answers: [
            "Bright color and a lightweight structure",
            "Chemical stability and mechanical durability",
            "High material cost and geographic rarity",
            "Low conductivity and a small active area"
        ],
        correct: 1
    },

    {
        question: "Which device characteristics are directly shaped by the choice of electrode material?",
        answers: [
            "Only the capacitance, with no effect on power or lifetime",
            "Only the electrolyte's cost and the package's appearance",
            "Capacitance, energy, power, cycling stability, and lifetime",
            "Only the shipping weight and physical size of the cell"
        ],
        correct: 2
    }

];


const supercapLesson10Questions = [

    {
        question: "What makes ruthenium oxide (RuO₂) a benchmark pseudocapacitive material?",
        answers: [
            "It is extremely cheap and abundant, so it is used everywhere",
            "Excellent conductivity, fast redox kinetics, and high capacitance",
            "It is a flexible conducting polymer that is easily printed",
            "It keeps a single fixed oxidation state through every cycle"
        ],
        correct: 1
    },

    {
        question: "Why is RuO₂ not widely used in practice despite its performance?",
        answers: [
            "It can only store charge for a few seconds at a time",
            "It is too electrically conductive to be used in a cell",
            "High cost, scarcity, and environmental concerns limit its use",
            "It dissolves quickly in every aqueous electrolyte used"
        ],
        correct: 2
    },

    {
        question: "Which of these is a lower-cost alternative transition metal oxide?",
        answers: [
            "Activated carbon cloth",
            "Manganese oxide (MnO₂)",
            "Glassy carbon plates",
            "Polytetrafluoroethylene"
        ],
        correct: 1
    },

    {
        question: "What is a typical weakness of transition metal oxide electrodes compared with carbon?",
        answers: [
            "Lower conductivity, plus structural damage from repeated redox",
            "They cannot undergo any redox reactions at their surface",
            "They have almost no accessible surface area for ions",
            "They are always liquid at normal operating temperatures"
        ],
        correct: 0
    },

    {
        question: "How do conducting polymers like PANI, PPy, and PEDOT store charge, and what commonly shortens their lifetime?",
        answers: [
            "Static ion adsorption only; loss of electrolyte by evaporation",
            "Reversible doping and dedoping; swelling that cracks the film",
            "Storage in a solid dielectric layer; corrosion of the case",
            "Slow combustion of the polymer; corrosion of the package"
        ],
        correct: 1
    }

];


const supercapLesson11Questions = [

    {
        question: "Which carbon-based electrode material is the most commercially used in supercapacitors?",
        answers: [
            "Activated carbon",
            "Diamond",
            "Carbon dioxide",
            "Charcoal briquettes"
        ],
        correct: 0
    },

    {
        question: "What specific surface area range is typical of activated carbon?",
        answers: [
            "About 1 to 10 m²/g",
            "About 10 to 100 m²/g",
            "About 1,000 to 3,000 m²/g",
            "About 100,000 m²/g or more"
        ],
        correct: 2
    },

    {
        question: "Why can the tiny pores in activated carbon limit performance at high charging rates?",
        answers: [
            "Small pores restrict ion transport, leaving surface area unused",
            "Small pores make the carbon lose its electrical conductivity",
            "Small pores cause the electrolyte to decompose immediately",
            "Small pores prevent any ions from entering at all times"
        ],
        correct: 0
    },

    {
        question: "Graphene has a very high theoretical surface area (about 2,630 m²/g). What problem often cuts into that in real electrodes?",
        answers: [
            "The sheets restack, shrinking the surface accessible to ions",
            "The sheets become magnetic and repel the electrolyte ions",
            "The sheets gradually convert into activated carbon powder",
            "The sheets are too thick for ions to reach their middle"
        ],
        correct: 0
    },

    {
        question: "Which combination describes carbon nanotubes as supercapacitor electrodes?",
        answers: [
            "Poor conductivity, very low cost, and no tendency to bundle",
            "Excellent conductivity, but lower surface area, higher cost, bundling",
            "Highest surface area of any material and no processing difficulties",
            "Insulating behavior, high density, and poor mechanical strength"
        ],
        correct: 1
    }

];


const supercapLesson12Questions = [

    {
        question: "How is glassy carbon produced?",
        answers: [
            "Pyrolyzing a polymer precursor in an inert atmosphere",
            "Mining and then crushing natural graphite deposits",
            "Melting quartz sand and quenching it in water",
            "Electroplating a carbon layer onto a silicon wafer"
        ],
        correct: 0
    },

    {
        question: "What is distinctive about glassy carbon's microstructure?",
        answers: [
            "A perfect single crystal of stacked graphene layers",
            "A disordered 3D network of curved graphitic domains",
            "A stack of flat graphite sheets that cleave easily",
            "A viscous liquid carbon phase at room temperature"
        ],
        correct: 1
    },

    {
        question: "Which photoresist is patterned with ultraviolet lithography and then pyrolyzed to make 3D glassy-carbon electrodes?",
        answers: [
            "Silver-halide photographic film",
            "SU-8 negative epoxy photoresist",
            "Silicone rubber elastomer",
            "Polytetrafluoroethylene film"
        ],
        correct: 1
    },

    {
        question: "What happens to a patterned polymer structure during pyrolysis that designers must account for?",
        answers: [
            "It swells to roughly twice its size and loses its shape",
            "It burns away completely, leaving only a thin ash film",
            "It loses mass and shrinks evenly, but keeps its overall shape",
            "It transforms into a solid metal layer of the same shape"
        ],
        correct: 2
    },

    {
        question: "Which properties make glassy carbon a good fit for devices in physiological fluids like PBS?",
        answers: [
            "High toxicity to cells, plus rapid corrosion in saline",
            "Biocompatibility, plus resistance to corrosion and biofouling",
            "Solubility in saline, plus a tendency to attract biofouling",
            "Very low conductivity, plus rapid oxidation in saline"
        ],
        correct: 1
    }

];


const supercapLesson13Questions = [

    {
        question: "How is a cylindrical supercapacitor cell typically built?",
        answers: [
            "A single solid carbon rod immersed in an open bath of electrolyte",
            "Electrode sheets and a separator wound into a spiral inside a can",
            "Two flat plates clamped together with bolts in an open frame",
            "A hollow metal tube packed with dry electrode powder"
        ],
        correct: 1
    },

    {
        question: "Why do many cylindrical cells use multiple tabs or offset foils instead of a single tab?",
        answers: [
            "To add weight to the can so that it resists vibration and shock",
            "To shorten the current path along the wound foil, cutting resistance",
            "To help the electrolyte spread through the wound layers faster",
            "To make the separator thicker between the wound electrode layers"
        ],
        correct: 1
    },

    {
        question: "What best describes the internals of a coin (button) supercapacitor?",
        answers: [
            "A long spiral of coated foil wound tightly inside a metal cylinder",
            "A single flexible fiber coated in gel electrolyte and wrapped in plastic",
            "Stacked discs of electrode, separator, and electrode in a crimped case",
            "A pair of interlocking comb patterns etched on a silicon chip"
        ],
        correct: 2
    },

    {
        question: "What is a main advantage of pouch or prismatic cells built from flat stacked plates?",
        answers: [
            "They pack efficiently into rectangular products and can be thin",
            "They cannot leak or swell under any operating condition",
            "They store charge without needing any electrolyte at all",
            "They always store more energy per volume than any other shape"
        ],
        correct: 0
    },

    {
        question: "Which application is a natural fit for a small coin-cell supercapacitor?",
        answers: [
            "Recovering the braking energy of a heavy city transit bus",
            "Holding memory or a clock alive through a brief outage",
            "Providing continuous power to a factory floor substation",
            "Delivering the cranking burst to start a locomotive engine"
        ],
        correct: 1
    },

    {
        question: "What happens when supercapacitor cells are connected in series?",
        answers: [
            "Voltage rating adds, capacitance drops, and cells need balancing",
            "Voltage stays the same, capacitance adds, and no balancing is needed",
            "Voltage and capacitance both double, with no balancing needed",
            "The cells share charge and can no longer store energy separately"
        ],
        correct: 0
    }

];


const supercapLesson14Questions = [

    {
        question: "In a sandwich (stacked) geometry, what sits between the two electrodes?",
        answers: [
            "A porous separator soaked in electrolyte",
            "A solid metal plate that blocks all ions",
            "A thin vacuum gap between the two layers",
            "Nothing, since the electrodes touch directly"
        ],
        correct: 0
    },

    {
        question: "In an in-plane (coplanar) device, what plays the role of the separator?",
        answers: [
            "A thick ceramic wall built between neighboring electrodes",
            "The electrolyte-filled lateral gap between the electrodes",
            "A second insulating wafer bonded over both electrodes",
            "A thin layer of insulating paint covering the electrodes"
        ],
        correct: 1
    },

    {
        question: "Why is in-plane geometry attractive for on-chip devices?",
        answers: [
            "Both electrodes are patterned in one step with a short ion path",
            "It needs the largest possible footprint to work well at all",
            "It requires stacking dozens of separate layers by hand, one by one",
            "It removes the need for any electrolyte inside of the device"
        ],
        correct: 0
    },

    {
        question: "How does a sandwich device typically scale up its capacity?",
        answers: [
            "By making the electrolyte more concentrated and darker in color",
            "By adding more stacked electrode layers or thicker electrodes",
            "By removing the separator so the electrodes touch directly",
            "By shrinking the electrodes to fit more of them side by side"
        ],
        correct: 1
    },

    {
        question: "What is a typical downside of a thin in-plane device?",
        answers: [
            "Ions cannot cross the narrow lateral gap between the electrodes",
            "Little active material fits per footprint unless electrodes are tall",
            "It can only function at very high operating temperatures",
            "It cannot be used with liquid, gel, or solid electrolytes at all"
        ],
        correct: 1
    }

];


const supercapLesson15Questions = [

    {
        question: "What are the two \"combs\" in an interdigitated electrode pair?",
        answers: [
            "The positive and negative electrodes",
            "The two separators on either side of the gap",
            "The two electrolytes filling the channels",
            "The two wafers bonded above and below"
        ],
        correct: 0
    },

    {
        question: "Which change shortens the ion path in an interdigitated device?",
        answers: [
            "Widening the gap between neighboring fingers",
            "Narrowing the gap between neighboring fingers",
            "Reducing the number of fingers on each comb",
            "Making the underlying substrate noticeably thicker"
        ],
        correct: 1
    },

    {
        question: "Which layout is a variation on straight, parallel combs?",
        answers: [
            "Concentric-ring, spiral, or serpentine finger patterns",
            "A single large solid block with no fingers at all",
            "A stack of round discs pressed together in a case",
            "A long wound roll of foil sealed inside a can"
        ],
        correct: 0
    },

    {
        question: "How does making interdigitated fingers taller (going 3D) help?",
        answers: [
            "It shrinks the footprint by folding the substrate",
            "It adds sidewall area without enlarging the footprint",
            "It removes the need for a gap between fingers",
            "It makes the electrodes transparent to visible light"
        ],
        correct: 1
    },

    {
        question: "Why are very narrow gaps between fingers a manufacturing challenge?",
        answers: [
            "Resolution limits and the risk of fingers shorting together",
            "Narrow gaps add too much weight to the finished device overall",
            "Narrow gaps cannot be inspected using any standard microscope",
            "Narrow gaps force ions to travel a much longer route between fingers"
        ],
        correct: 0
    }

];


const supercapLesson16Questions = [

    {
        question: "Which describes a coaxial fiber supercapacitor?",
        answers: [
            "Two flat electrode plates stacked inside of a sealed pouch case",
            "A core fiber electrode, an electrolyte sheath, and an outer electrode",
            "Two interlocking comb electrodes patterned on a silicon chip surface",
            "A tall stack of button cells wired together in series, end to end"
        ],
        correct: 1
    },

    {
        question: "How are the electrodes arranged in a twisted fiber supercapacitor?",
        answers: [
            "A single fiber cut in half and joined back with electrolyte",
            "Two electrode-coated fibers twisted together with gel between them",
            "Two fibers laid flat on opposite faces of a silicon wafer",
            "Two fibers glued side by side to the wall of a metal can"
        ],
        correct: 1
    },

    {
        question: "Why does a very long fiber supercapacitor lose power?",
        answers: [
            "The gel electrolyte freezes progressively along its whole length",
            "Charge travels farther along a thin conductor, raising resistance",
            "Longer fibers have wider gaps between their two electrodes overall",
            "Longer fibers gradually lose their ability to hold any charge at all"
        ],
        correct: 1
    },

    {
        question: "What makes fiber supercapacitors attractive for wearables?",
        answers: [
            "They can be woven or knitted into fabric while staying flexible",
            "They stay rigid, which lets them act as structural supports",
            "They are sealed in a metal can for wearable protection",
            "They must be kept flat and clamped under compression"
        ],
        correct: 0
    },

    {
        question: "Which of these is a common fiber-electrode material?",
        answers: [
            "Carbon nanotube yarn",
            "Soda-lime window glass",
            "Rock salt crystal rods",
            "Fired ceramic tile"
        ],
        correct: 0
    }

];


const supercapLesson17Questions = [

    {
        question: "How do serpentine (wavy or horseshoe) interconnects help a stretchable supercapacitor?",
        answers: [
            "They unfold when stretched, so the conductor barely strains",
            "They stiffen the device so it resists any stretching",
            "They replace the electrodes with a stretchy insulator",
            "They insulate the electrolyte from moisture in the air"
        ],
        correct: 0
    },

    {
        question: "What do origami and kirigami designs add to a supercapacitor?",
        answers: [
            "Fold and cut patterns that let it bend, stretch, or collapse",
            "A higher operating temperature range for the electrolyte",
            "Extra separator layers between every pair of folds",
            "A colorful, reflective surface finish for the device"
        ],
        correct: 0
    },

    {
        question: "What is the main tradeoff in a transparent supercapacitor?",
        answers: [
            "Thinner electrodes let more light through but store less charge",
            "Transparent devices store far more charge per unit of area",
            "Transparent devices cannot use liquid or gel electrolytes",
            "There is no tradeoff between transparency and capacity"
        ],
        correct: 0
    },

    {
        question: "What is a structural supercapacitor?",
        answers: [
            "A device that only functions when installed inside a building frame",
            "A device built into a load-bearing composite that also stores energy",
            "A supercapacitor that is made entirely of poured concrete blocks",
            "A capacitor that is built without any electrodes or electrolyte at all"
        ],
        correct: 1
    },

    {
        question: "Which manufacturing approach lets designers make lattice-like electrodes with open channels for ion transport?",
        answers: [
            "3D printing, such as direct ink writing",
            "Sanding and polishing a flat sheet by hand",
            "Winding long foil strips into a tight roll",
            "Punching coin shapes out of a flat sheet"
        ],
        correct: 0
    }

];


const supercapLesson18Questions = [

    {
        question: "What defines a symmetric supercapacitor?",
        answers: [
            "Both electrodes use the same material and mass",
            "It uses only a single electrode in the cell",
            "It has a solid electrode but no electrolyte",
            "One electrode is metal and the other is plastic"
        ],
        correct: 0
    },

    {
        question: "Two identical electrodes act like two equal capacitors in series. How does the cell capacitance compare with one electrode's?",
        answers: [
            "It is twice as large",
            "It is half as large",
            "It is exactly the same",
            "It is zero"
        ],
        correct: 1
    },

    {
        question: "Why pair two different electrode materials in an asymmetric device?",
        answers: [
            "To widen the voltage window, since energy grows with V squared",
            "To make the device heavier, which in turn raises its energy density",
            "To remove the electrolyte and simplify the device packaging",
            "To lower the capacitance so that the cell charges more slowly"
        ],
        correct: 0
    },

    {
        question: "When balancing the two electrodes of an asymmetric cell, what must be equal?",
        answers: [
            "The charge stored on each of the two electrodes",
            "The physical thickness of each electrode layer",
            "The number of current-collector tabs on each side",
            "The pore size of the separator between them"
        ],
        correct: 0
    },

    {
        question: "Which is an example of an asymmetric pairing?",
        answers: [
            "A carbon electrode paired with a metal-oxide electrode",
            "Two identical activated-carbon electrodes of equal mass",
            "Two identical carbon fibers of equal length and coating",
            "Two identical carbon discs stacked in a coin case"
        ],
        correct: 0
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
    8: supercapLesson8Questions,
    9: supercapLesson9Questions,
    10: supercapLesson10Questions,
    11: supercapLesson11Questions,
    12: supercapLesson12Questions,
    13: supercapLesson13Questions,
    14: supercapLesson14Questions,
    15: supercapLesson15Questions,
    16: supercapLesson16Questions,
    17: supercapLesson17Questions,
    18: supercapLesson18Questions
};
