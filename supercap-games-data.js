/* ========================================
   SUPERCAPACITOR GAMES — DATA
   One entry per game, keyed by name. The
   engines (supercap-game-*.js) read these.
======================================== */

const supercapGameData = {

    /* ---------- UNIT 2: EDLC, pseudocapacitor, or hybrid? ---------- */

    mechanisms: {

        key: "fabPathSupercapGame2Complete",
        xp: 40,

        prompt: "Tap the kind of supercapacitor this describes.",
        wrong: "Not quite — think about whether electrons cross the interface.",

        categories: [
            { id: "edlc", icon: "🧲", label: "EDLC" },
            { id: "pseudo", icon: "⚛️", label: "Pseudocapacitor" },
            { id: "hybrid", icon: "🤝", label: "Hybrid" }
        ],

        items: [
            { icon: "🧲", name: "Ions line up at the surface", desc: "Ions gather on the electrode surface, and no electrons cross the interface.", category: "edlc", why: "no electron transfer means pure electrostatic storage in the double layer." },
            { icon: "♾️", name: "Millions of cycles, almost no fade", desc: "Nothing reacts chemically, so the electrode barely wears out.", category: "edlc", why: "with no chemical change, there is little wear." },
            { icon: "▭", name: "Box-shaped CV", desc: "Current stays flat across the voltage window, with no peaks.", category: "edlc", why: "flat, rectangular current is the capacitive signature of a double layer." },
            { icon: "🕳️", name: "Activated carbon electrode", desc: "A porous carbon network with an enormous surface area.", category: "edlc", why: "EDLCs depend on surface area, which porous carbon supplies." },
            { icon: "📐", name: "Capacitance grows with accessible area", desc: "More surface that ions can reach means more stored charge.", category: "edlc", why: "double-layer charge sits on the surface ions can reach." },

            { icon: "⚛️", name: "Fast surface redox reactions", desc: "Electrons transfer across the interface in quick, reversible reactions.", category: "pseudo", why: "reversible surface redox is the definition of pseudocapacitance." },
            { icon: "⛰️", name: "Broad humps on the CV", desc: "Redox activity shows up as bumps on top of the box shape.", category: "pseudo", why: "humps mark redox reactions adding to the capacitive current." },
            { icon: "📉", name: "Higher capacitance, shorter life", desc: "Repeated redox cycling gradually wears the material down.", category: "pseudo", why: "more storage comes at the cost of endurance." },
            { icon: "🧪", name: "MnO₂ or a conducting polymer", desc: "Materials that store charge through surface redox reactions.", category: "pseudo", why: "these materials store charge by redox at or near the surface." },
            { icon: "🔁", name: "Charge crosses the interface", desc: "Unlike a pure double layer, electrons actually move between electrode and ion.", category: "pseudo", why: "electron transfer across the interface is faradaic, not electrostatic." },

            { icon: "🤝", name: "Capacitive and battery-type electrodes together", desc: "Two different storage mechanisms in one cell.", category: "hybrid", why: "combining mechanisms is what makes it a hybrid." },
            { icon: "🔋", name: "Lithium-ion capacitor", desc: "Pre-lithiated graphite paired with an activated-carbon electrode.", category: "hybrid", why: "a battery-type electrode plus a capacitive one is a hybrid." },
            { icon: "⚡", name: "More energy, at some cost to cycle life", desc: "The battery-type side adds energy but wears faster.", category: "hybrid", why: "the battery-type electrode buys energy at the expense of lifetime." },
            { icon: "⚖️", name: "Oxide positive, carbon negative", desc: "One electrode stores charge by redox, the other by a double layer.", category: "hybrid", why: "mixing mechanisms across the two electrodes makes a hybrid." }
        ]
    },


    /* ---------- UNIT 3: which electrode family? ---------- */

    electrodes: {

        key: "fabPathSupercapGame3Complete",
        xp: 40,

        prompt: "Tap the electrode family this belongs to.",
        wrong: "Not quite — think about what the material is made of.",

        categories: [
            { id: "carbon", icon: "⚫", label: "Carbon-based" },
            { id: "oxide", icon: "🪨", label: "Metal oxide" },
            { id: "polymer", icon: "🧵", label: "Conducting polymer" }
        ],

        items: [
            { icon: "🥥", name: "Activated carbon", desc: "The commercial standard, with a huge surface area from a porous structure.", category: "carbon", why: "it's a carbon material, the workhorse of double-layer devices." },
            { icon: "🕸️", name: "Graphene", desc: "A one-atom-thick sheet with high conductivity, prone to restacking.", category: "carbon", why: "graphene is a form of carbon." },
            { icon: "🧬", name: "Carbon nanotubes", desc: "Conductive highways, but they bundle together and cost more.", category: "carbon", why: "nanotubes are rolled-up carbon." },
            { icon: "☁️", name: "Carbon aerogel", desc: "An ultra-light, porous network of carbon.", category: "carbon", why: "aerogels here are carbon networks." },
            { icon: "🔮", name: "Glassy carbon", desc: "Baked from a polymer, chemically inert, and patternable with lithography.", category: "carbon", why: "pyrolysis of a polymer leaves glassy carbon, a non-graphitizing carbon." },

            { icon: "💎", name: "Ruthenium oxide (RuO₂)", desc: "The benchmark: excellent conductivity and capacitance, but costly and scarce.", category: "oxide", why: "RuO₂ is the classic pseudocapacitive metal oxide." },
            { icon: "🧱", name: "Manganese dioxide (MnO₂)", desc: "Cheap and abundant, but poorly conductive.", category: "oxide", why: "MnO₂ is a low-cost metal oxide." },
            { icon: "🔩", name: "Nickel or cobalt oxide", desc: "High theoretical capacitance, with structural damage from repeated redox.", category: "oxide", why: "transition-metal oxides store charge by redox and suffer for it." },
            { icon: "🟡", name: "Vanadium oxide", desc: "Multiple oxidation states give high capacitance, with limited stability.", category: "oxide", why: "V₂O₅ is another redox-active metal oxide." },

            { icon: "🔵", name: "Polyaniline (PANI)", desc: "Stores charge by doping, and swells during cycling.", category: "polymer", why: "PANI is a classic conducting polymer." },
            { icon: "🟣", name: "Polypyrrole (PPy)", desc: "Flexible and cheap, but it degrades as it swells and shrinks.", category: "polymer", why: "polypyrrole is a conducting polymer." },
            { icon: "🖨️", name: "PEDOT:PSS", desc: "A printable, flexible polymer with good conductivity.", category: "polymer", why: "PEDOT is a conducting polymer, popular for printed devices." },
            { icon: "🟠", name: "Polythiophene", desc: "A polymer backbone that stores charge as it is doped and undoped.", category: "polymer", why: "polythiophenes are conducting polymers." }
        ]
    },


    /* ---------- UNIT 4: shape for the job ---------- */

    geometry: {

        key: "fabPathSupercapGame4Complete",
        xp: 40,

        prompt: "Tap the geometry that fits this job best.",
        wrong: "Not quite — think about the size, the shape, and how much it must bend.",

        categories: [
            { id: "coin", icon: "🪙", label: "Coin cell" },
            { id: "cylinder", icon: "🌀", label: "Wound cylinder" },
            { id: "pouch", icon: "🗂️", label: "Pouch stack" },
            { id: "micro", icon: "🔬", label: "On-chip micro" },
            { id: "fiber", icon: "🧵", label: "Fiber / textile" },
            { id: "film", icon: "🩹", label: "Stretch / fold film" }
        ],

        items: [
            { icon: "⏰", name: "Clock and settings backup", desc: "Keeps a small gadget's memory alive through short power loss.", category: "coin", why: "a coin cell is the simplest sealed sandwich, ideal for tiny backup power." },
            { icon: "🧫", name: "Lab test of a new electrode material", desc: "The everyday test vehicle for comparing electrode materials.", category: "coin", why: "coin cells are cheap and easy to assemble, so they're the standard lab format." },
            { icon: "🚌", name: "Burst power for a bus", desc: "Big cells with wound electrodes, catching braking energy again and again.", category: "cylinder", why: "wound cylinders pack a huge electrode area into a sturdy sealed can." },
            { icon: "🌀", name: "Jelly-roll cell in a metal can", desc: "Two long foil strips and a separator wound into a tight spiral.", category: "cylinder", why: "winding folds a very large electrode area into a compact, rugged cylinder." },
            { icon: "📱", name: "Thin pack for a tablet or drone", desc: "A flat, light energy source that fits a slim rectangular space.", category: "pouch", why: "stacked plates in a foil pouch make thin, light, flat packs." },
            { icon: "📦", name: "Rectangular product with tight thickness", desc: "A device that must fit a slim, boxy compartment.", category: "pouch", why: "pouch and prismatic stacks pack neatly into rectangular spaces." },
            { icon: "📡", name: "On-chip power for a sensor node", desc: "Storage that sits on the same silicon as the sensor.", category: "micro", why: "in-plane micro-devices are patterned directly on the chip." },
            { icon: "🪮", name: "Tall interleaved electrodes in a tiny footprint", desc: "Two combs whose fingers interleave, growing upward for more area.", category: "micro", why: "interdigitated micro architectures maximize area per footprint." },
            { icon: "👕", name: "Smart clothing that flexes and washes", desc: "Energy storage woven right into the fabric.", category: "fiber", why: "fiber supercapacitors can be woven or knitted into textiles." },
            { icon: "🧶", name: "Sensor thread in a wearable", desc: "A long, thin strand that carries both signals and energy.", category: "fiber", why: "coaxial or twisted fibers are wires that store energy." },
            { icon: "🩹", name: "Skin patch that stretches with movement", desc: "A thin device that follows the skin without cracking.", category: "film", why: "stretchable films tolerate bending and stretching." },
            { icon: "📖", name: "Foldable display power", desc: "Storage that folds along creases, origami-style.", category: "film", why: "origami and kirigami designs let a device fold and unfold." }
        ]
    },


    /* ---------- UNIT 5: pick the electrolyte ---------- */

    electrolytes: {

        key: "fabPathSupercapGame5Complete",
        xp: 40,

        prompt: "Tap the electrolyte family that fits.",
        wrong: "Not quite — think about the voltage window, the safety, and the packaging.",

        categories: [
            { id: "aqueous", icon: "💧", label: "Aqueous" },
            { id: "organic", icon: "⚗️", label: "Organic" },
            { id: "ionic", icon: "🧂", label: "Ionic liquid" },
            { id: "gel", icon: "🧴", label: "Gel / solid" }
        ],

        items: [
            { icon: "🧪", name: "Cheap lab cell assembled in open air", desc: "It must be safe, inexpensive, and forgiving to build.", category: "aqueous", why: "water-based electrolytes need no dry room and don't burn." },
            { icon: "⚡", name: "Lowest resistance, cost first", desc: "Small, mobile ions and very high conductivity matter most here.", category: "aqueous", why: "aqueous electrolytes are the most conductive and cheapest." },
            { icon: "🧂", name: "Water-in-salt", desc: "So much salt is dissolved that little free water remains to split.", category: "aqueous", why: "it's a water-based electrolyte with a stretched voltage window." },

            { icon: "🚌", name: "Commercial cell that must reach about 2.7 V", desc: "It needs a window well beyond water's 1.23 V ceiling.", category: "organic", why: "organic electrolytes reach about 2.5 to 2.7 V." },
            { icon: "🧯", name: "TEABF₄ in acetonitrile", desc: "A salt dissolved in a common organic solvent.", category: "organic", why: "that pairing is the classic organic electrolyte." },
            { icon: "🏭", name: "Sealed dry because trace water causes gas", desc: "Moisture at high voltage forms gas and speeds up aging.", category: "organic", why: "organic cells must be assembled dry and tightly sealed." },

            { icon: "🔥", name: "Stable and non-flammable at high heat", desc: "It needs almost no vapor pressure and a 3 to 4 V window.", category: "ionic", why: "ionic liquids are non-volatile and non-flammable, with wide windows." },
            { icon: "🥶", name: "Viscous and slow in the cold, but wide window", desc: "Expensive, with large ions that need large pores.", category: "ionic", why: "ionic liquids thicken sharply as temperature falls." },
            { icon: "🧊", name: "A salt that is liquid on its own", desc: "No solvent at all: the liquid is made of ions.", category: "ionic", why: "that's the definition of an ionic liquid." },

            { icon: "👕", name: "Fiber device that must not leak when bent", desc: "A flexible strand with the electrolyte held in place.", category: "gel", why: "gel electrolytes stay put and bend with the device." },
            { icon: "🔬", name: "In-plane micro device where the electrolyte doubles as separator", desc: "The gap between electrodes is filled and insulated by the electrolyte.", category: "gel", why: "gels and solids fill the gap and replace the separator." },
            { icon: "🍮", name: "PVA with H₂SO₄ or H₃PO₄", desc: "A polymer holds an acidic solution in a soft, solid-like block.", category: "gel", why: "PVA-acid mixtures are the standard hydrogel electrolytes." }
        ]
    },


    /* ---------- UNIT 7: order the process ---------- */

    fabrication: {

        key: "fabPathSupercapGame7Complete",
        xp: 55,

        rounds: [

            {
                icon: "🥣",
                title: "Slurry electrode",
                lead: "Turn powder into a finished electrode, from mixing to assembly.",
                steps: [
                    { icon: "🥣", name: "Mix the slurry", why: "powder, additive, binder, and solvent become a uniform paste." },
                    { icon: "🧈", name: "Cast with a doctor blade", why: "a uniform film gets spread onto the foil." },
                    { icon: "♨️", name: "Dry off the solvent", why: "the film has to set before it can be handled." },
                    { icon: "🗜️", name: "Press the film", why: "rolling densifies it and improves contact." },
                    { icon: "✂️", name: "Punch out discs", why: "the pressed sheet is cut to size." },
                    { icon: "🪙", name: "Assemble the cell", why: "discs, separator, and electrolyte go in the case." }
                ]
            },

            {
                icon: "🔦",
                title: "Photolithography and pyrolysis",
                lead: "Pattern a polymer with light, then bake it into carbon.",
                steps: [
                    { icon: "🧼", name: "Clean the substrate", why: "the surface must be clean before coating." },
                    { icon: "🌀", name: "Spin-coat the resist", why: "resist goes on to a set thickness." },
                    { icon: "♨️", name: "Soft bake", why: "it drives off the solvent before exposure." },
                    { icon: "🔦", name: "Expose through the mask", why: "UV light transfers the pattern." },
                    { icon: "🧪", name: "Develop", why: "the unwanted resist washes away." },
                    { icon: "🔥", name: "Pyrolyze in inert gas", why: "the patterned polymer converts to carbon." }
                ]
            },

            {
                icon: "🪞",
                title: "Lift-off metal pattern",
                lead: "Make a metal current collector without etching it.",
                steps: [
                    { icon: "🎨", name: "Pattern the resist", why: "the resist marks where metal must not stay." },
                    { icon: "🪞", name: "Deposit metal over everything", why: "metal coats both the resist and the substrate." },
                    { icon: "🧴", name: "Dissolve the resist", why: "the metal on top of the resist lifts away with it." },
                    { icon: "💧", name: "Rinse clean", why: "only the metal that touched the substrate remains." }
                ]
            },

            {
                icon: "🔴",
                title: "Laser-written graphene device",
                lead: "Write an electrode pattern with a laser, no mask needed.",
                steps: [
                    { icon: "🎞️", name: "Mount a polyimide film", why: "the polymer is the raw material." },
                    { icon: "🖥️", name: "Draw the comb pattern", why: "the design lives in software." },
                    { icon: "🔴", name: "Scan with the infrared laser", why: "heat converts the surface into porous graphene." },
                    { icon: "🍮", name: "Cast the gel electrolyte", why: "gel fills the gap between the electrodes." },
                    { icon: "📦", name: "Seal the device", why: "sealing keeps the electrolyte from drying out." }
                ]
            },

            {
                icon: "🧵",
                title: "Electrospun carbon nanofibers",
                lead: "Spin polymer nanofibers, then convert them into carbon.",
                steps: [
                    { icon: "🥛", name: "Prepare the polymer solution", why: "the jet needs a spinnable solution." },
                    { icon: "⚡", name: "Electrospin a nanofiber mat", why: "a high-voltage jet dries into fibers." },
                    { icon: "🌬️", name: "Stabilize in air", why: "a gentle heat treatment locks the fibers in shape." },
                    { icon: "🔥", name: "Carbonize in inert gas", why: "the stabilized polymer becomes carbon nanofibers." }
                ]
            }
        ]
    },


    /* ---------- UNIT 1: find the spot on the Ragone plot ---------- */

    ragone: {

        key: "fabPathSupercapGame1Complete",
        xp: 35,

        zones: [
            { id: "capacitor", label: "Capacitors" },
            { id: "supercap", label: "Supercaps" },
            { id: "battery", label: "Batteries" },
            { id: "fuelcell", label: "Fuel cells" }
        ],

        items: [
            { icon: "🔌", name: "Aluminum electrolytic capacitor", desc: "Found inside power supplies.", zone: "capacitor", stats: "well under 0.1 Wh/kg, but enormous power for its size." },
            { icon: "🟫", name: "Ceramic chip capacitor", desc: "Millions sit on a phone's circuit board.", zone: "capacitor", stats: "tiny energy, extremely fast delivery." },
            { icon: "🎞️", name: "Film capacitor", desc: "Used in power electronics.", zone: "capacitor", stats: "very low energy, very high power." },

            { icon: "🚌", name: "Supercapacitor bus module", desc: "Catches braking energy in seconds.", zone: "supercap", stats: "a few Wh/kg with kilowatts per kilogram." },
            { icon: "🪙", name: "Coin-cell backup supercapacitor", desc: "Keeps a device's memory alive.", zone: "supercap", stats: "a few Wh/kg, with very fast charging." },
            { icon: "💎", name: "RuO₂ pseudocapacitor", desc: "A redox-based capacitor.", zone: "supercap", stats: "more energy than a double-layer cell, still a supercapacitor." },

            { icon: "📱", name: "Lithium-ion phone battery", desc: "Powers a phone for a day.", zone: "battery", stats: "roughly 100–250 Wh/kg, with modest power." },
            { icon: "🚗", name: "Lead-acid car battery", desc: "Starts the engine.", zone: "battery", stats: "about 30–40 Wh/kg, cheap and heavy." },
            { icon: "🔋", name: "Nickel–metal hydride cell", desc: "An older rechargeable cell.", zone: "battery", stats: "roughly 60–120 Wh/kg, in the battery band." },

            { icon: "🚀", name: "Hydrogen fuel cell system", desc: "Turns hydrogen and air into electricity.", zone: "fuelcell", stats: "very high energy from the fuel, but low power." },
            { icon: "🧴", name: "Direct-methanol fuel cell", desc: "Runs on liquid methanol.", zone: "fuelcell", stats: "lots of stored energy, slow delivery." }
        ]
    },


    /* ---------- UNIT 6: name that curve ---------- */

    curves: {

        key: "fabPathSupercapGame6Complete",
        xp: 55,

        pools: {

            cv: [
                "Ideal double-layer capacitor",
                "Pseudocapacitive redox contribution",
                "High series resistance",
                "Electrolyte breaking down",
                "Battery-like diffusion-limited peaks"
            ],

            gcd: [
                "Ideal double-layer capacitor",
                "Pseudocapacitive or battery-like plateau",
                "Large series resistance (IR drop)",
                "Poor coulombic efficiency"
            ],

            eis: [
                "Low-resistance capacitor",
                "High series resistance",
                "Charge-transfer semicircle",
                "Diffusion (Warburg) region"
            ]
        },

        questions: {
            cv: "Which behavior does this CV show?",
            gcd: "Which behavior does this charge–discharge curve show?",
            eis: "What does this Nyquist plot show?"
        },

        wrongHints: {
            cv: "Not quite — look at the outline: corners, humps, and the ends.",
            gcd: "Not quite — check the slopes and the switch points.",
            eis: "Not quite — check the intercept, any semicircle, and the tail."
        },

        items: [
            { type: "cv", model: "ideal", answer: "Ideal double-layer capacitor", why: "a near-perfect rectangle means flat capacitive current." },
            { type: "cv", model: "pseudo", answer: "Pseudocapacitive redox contribution", why: "broad humps on the box shape are redox reactions adding current." },
            { type: "cv", model: "leaf", answer: "High series resistance", why: "a tilted, leaf-like loop means resistance slows the charging." },
            { type: "cv", model: "breakdown", answer: "Electrolyte breaking down", why: "current shooting up at the end of the window means side reactions." },
            { type: "cv", model: "peaks", answer: "Battery-like diffusion-limited peaks", why: "sharp, separated peaks are bulk redox, not capacitive storage." },

            { type: "gcd", model: "ideal", answer: "Ideal double-layer capacitor", why: "a straight, symmetric triangle means capacitive behavior." },
            { type: "gcd", model: "ir", answer: "Large series resistance (IR drop)", why: "the sudden drop at discharge start is ΔV = I × ESR." },
            { type: "gcd", model: "plateau", answer: "Pseudocapacitive or battery-like plateau", why: "curved, flattened sections mean redox reactions are at work." },
            { type: "gcd", model: "lowce", answer: "Poor coulombic efficiency", why: "discharge is much shorter than charge, so charge is being lost." },

            { type: "eis", model: "ideal", answer: "Low-resistance capacitor", why: "a near-vertical line close to the origin means low ESR and capacitive behavior." },
            { type: "eis", model: "highrs", answer: "High series resistance", why: "the whole plot is shifted right, so the ESR intercept is large." },
            { type: "eis", model: "semicircle", answer: "Charge-transfer semicircle", why: "a semicircle is charge-transfer resistance at the interface." },
            { type: "eis", model: "warburg", answer: "Diffusion (Warburg) region", why: "the 45° line is ions diffusing before the capacitive rise." }
        ]
    },


    /* ---------- UNIT 8: size the supercapacitor ---------- */

    sizing: {

        key: "fabPathSupercapGame8Complete",
        xp: 65,

        parts: [
            { c: 0.047, esr: 5.0 },
            { c: 0.1, esr: 2.5 },
            { c: 0.22, esr: 1.2 },
            { c: 0.47, esr: 0.6 },
            { c: 1, esr: 0.3 },
            { c: 2.2, esr: 0.16 },
            { c: 4.7, esr: 0.08 },
            { c: 10, esr: 0.05 }
        ],

        rounds: [
            {
                icon: "📡",
                title: "Wireless sensor burst",
                text: "A sensor node transmits with a steady 20 mA draw for 5 seconds. The supercapacitor starts at 3.3 V and the electronics stop at 2.0 V.",
                vmax: 3.3, vmin: 2.0, current: 0.02, seconds: 5
            },
            {
                icon: "💾",
                title: "Drive power-loss hold-up",
                text: "A storage drive pulls 0.5 A for 4 seconds while it finishes writing data. The rail starts at 5 V and must stay above 3 V.",
                vmax: 5, vmin: 3, current: 0.5, seconds: 4
            },
            {
                icon: "🏗️",
                title: "Crane energy pulse",
                text: "A crane drive draws 10 A for half a second. The cell starts at 2.7 V and the drive drops out at 1.35 V.",
                vmax: 2.7, vmin: 1.35, current: 10, seconds: 0.5
            },
            {
                icon: "📸",
                title: "Camera flash",
                text: "A flash pulls 2 A for 0.2 seconds. The capacitor starts at 5 V and the flash driver needs at least 2.5 V.",
                vmax: 5, vmin: 2.5, current: 2, seconds: 0.2
            },
            {
                icon: "⏰",
                title: "Clock backup",
                text: "A real-time clock draws 100 µA for 2 hours after the main power fails. The backup starts at 3.0 V and must stay above 1.8 V.",
                vmax: 3.0, vmin: 1.8, current: 0.0001, seconds: 7200
            }
        ]
    }
};
