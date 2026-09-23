/* ========================================
   SAND TO CHIP GAMES: DATA
   Read by the shared step-ordering engine
   (supercap-game-order.js).
======================================== */

const chipGameData = {

    sandToWafer: {
        "key": "fabPathChipGame1Complete",
        "xp": 55,
        "rounds": [
                {
                        "icon": "🏖️",
                        "title": "Sand to polysilicon",
                        "lead": "Purify sand step by step, from rough silicon to electronic grade.",
                        "steps": [
                                {
                                        "icon": "⛏️",
                                        "name": "Start with quartz sand",
                                        "why": "silicon dioxide is the raw material."
                                },
                                {
                                        "icon": "🔥",
                                        "name": "Reduce it with carbon in an arc furnace",
                                        "why": "the carbon strips off the oxygen."
                                },
                                {
                                        "icon": "🧪",
                                        "name": "React the silicon with HCl gas",
                                        "why": "it forms liquid trichlorosilane."
                                },
                                {
                                        "icon": "⚗️",
                                        "name": "Distill the trichlorosilane",
                                        "why": "distillation leaves the impurities behind."
                                },
                                {
                                        "icon": "🌡️",
                                        "name": "Deposit silicon on hot rods (Siemens)",
                                        "why": "pure polysilicon grows on the rods."
                                }
                        ]
                },
                {
                        "icon": "🧊",
                        "title": "Pull a crystal (Czochralski)",
                        "lead": "Grow one perfect crystal from molten silicon.",
                        "steps": [
                                {
                                        "icon": "🫕",
                                        "name": "Melt polysilicon and dopant",
                                        "why": "the charge melts in a quartz crucible."
                                },
                                {
                                        "icon": "🪡",
                                        "name": "Dip the seed into the melt",
                                        "why": "the seed sets the crystal orientation."
                                },
                                {
                                        "icon": "📏",
                                        "name": "Pull a thin neck",
                                        "why": "a narrow neck sheds dislocations."
                                },
                                {
                                        "icon": "🔺",
                                        "name": "Widen into the crown",
                                        "why": "the crystal grows out to full diameter."
                                },
                                {
                                        "icon": "🧱",
                                        "name": "Grow the constant-diameter body",
                                        "why": "this is the bulk of the ingot."
                                },
                                {
                                        "icon": "🔻",
                                        "name": "Taper the tail and cool",
                                        "why": "tapering lets it cool without cracking."
                                }
                        ]
                },
                {
                        "icon": "💿",
                        "title": "Ingot to wafer",
                        "lead": "In a typical flow, turn a crystal ingot into a polished wafer.",
                        "steps": [
                                {
                                        "icon": "✂️",
                                        "name": "Crop the ends and test",
                                        "why": "the ends are removed and the crystal is checked."
                                },
                                {
                                        "icon": "⚙️",
                                        "name": "Grind to diameter and add the notch",
                                        "why": "the ingot gets its exact size and orientation mark."
                                },
                                {
                                        "icon": "🪚",
                                        "name": "Slice with a wire saw",
                                        "why": "each slice becomes a wafer."
                                },
                                {
                                        "icon": "🔘",
                                        "name": "Round the edges and lap",
                                        "why": "rounding prevents chipping; lapping flattens."
                                },
                                {
                                        "icon": "🧴",
                                        "name": "Etch away damage",
                                        "why": "chemistry removes the sawn surface layer."
                                },
                                {
                                        "icon": "🪞",
                                        "name": "Polish to a mirror finish",
                                        "why": "lithography needs an atomically smooth surface."
                                },
                                {
                                        "icon": "🫧",
                                        "name": "Clean and inspect",
                                        "why": "particles and flaws must be found before the fab."
                                }
                        ]
                }
        ]
},

    buildingLayers: {
            "key": "fabPathChipGame2Complete",
            "xp": 50,
            "rounds": [
                    {
                            "icon": "🕳️",
                            "title": "Shallow trench isolation",
                            "lead": "Build oxide walls between transistors, the modern way.",
                            "steps": [
                                    {
                                            "icon": "🧱",
                                            "name": "Grow pad oxide and deposit nitride",
                                            "why": "the nitride will act as a polish stop."
                                    },
                                    {
                                            "icon": "⛏️",
                                            "name": "Pattern and etch the trench",
                                            "why": "plasma etching cuts down into the silicon."
                                    },
                                    {
                                            "icon": "🔥",
                                            "name": "Grow a thin liner oxide",
                                            "why": "it heals etch damage on the trench walls."
                                    },
                                    {
                                            "icon": "🫗",
                                            "name": "Overfill with CVD oxide",
                                            "why": "the trench must be filled completely."
                                    },
                                    {
                                            "icon": "🪞",
                                            "name": "Polish flat with CMP",
                                            "why": "the nitride layer stops the polish."
                                    },
                                    {
                                            "icon": "🧴",
                                            "name": "Strip the nitride",
                                            "why": "hot phosphoric acid removes it."
                                    }
                            ]
                    },
                    {
                            "icon": "🪙",
                            "title": "Copper damascene",
                            "lead": "Copper is hard to etch, so cut the trench first and fill it after.",
                            "steps": [
                                    {
                                            "icon": "🧱",
                                            "name": "Deposit the insulator",
                                            "why": "CVD oxide sits between metal layers."
                                    },
                                    {
                                            "icon": "⛏️",
                                            "name": "Etch trenches into it",
                                            "why": "the trenches become the wires."
                                    },
                                    {
                                            "icon": "🛡️",
                                            "name": "Sputter a barrier and copper seed",
                                            "why": "the barrier blocks copper diffusion."
                                    },
                                    {
                                            "icon": "⚡",
                                            "name": "Electroplate copper",
                                            "why": "copper fills the trenches and overflows."
                                    },
                                    {
                                            "icon": "🪞",
                                            "name": "Polish off the excess with CMP",
                                            "why": "copper stays only inside the trenches."
                                    }
                            ]
                    },
                    {
                            "icon": "🚪",
                            "title": "Polysilicon gate",
                            "lead": "Make the classic transistor gate: oxide, poly, then shape it.",
                            "steps": [
                                    {
                                            "icon": "🫧",
                                            "name": "Clean the wafer surface",
                                            "why": "particles and native oxide must go first."
                                    },
                                    {
                                            "icon": "🔥",
                                            "name": "Grow a thin gate oxide",
                                            "why": "dry oxidation gives the best insulator."
                                    },
                                    {
                                            "icon": "☁️",
                                            "name": "Deposit polysilicon by LPCVD",
                                            "why": "the poly becomes the gate electrode."
                                    },
                                    {
                                            "icon": "🖨️",
                                            "name": "Pattern photoresist on top",
                                            "why": "the resist marks where the gate stays."
                                    },
                                    {
                                            "icon": "⛏️",
                                            "name": "Etch the exposed polysilicon",
                                            "why": "the etch stops on the thin gate oxide."
                                    },
                                    {
                                            "icon": "🧹",
                                            "name": "Strip the resist",
                                            "why": "oxygen plasma ashes away the mask."
                                    }
                            ]
                    }
            ]
    },

    printThePattern: {
            "key": "fabPathChipGame3Complete",
            "xp": 50,
            "rounds": [
                    {
                            "icon": "🧴",
                            "title": "The litho loop",
                            "lead": "Coat, expose, and develop a wafer, in the order the process needs.",
                            "steps": [
                                    {
                                            "icon": "💨",
                                            "name": "Prime the wafer with HMDS",
                                            "why": "it helps the resist stick."
                                    },
                                    {
                                            "icon": "🌀",
                                            "name": "Spin coat the photoresist",
                                            "why": "spinning spreads a thin, even film."
                                    },
                                    {
                                            "icon": "♨️",
                                            "name": "Soft bake the resist",
                                            "why": "it drives off the solvent."
                                    },
                                    {
                                            "icon": "🔦",
                                            "name": "Align and expose through the reticle",
                                            "why": "light prints the pattern."
                                    },
                                    {
                                            "icon": "🔥",
                                            "name": "Post-exposure bake",
                                            "why": "photoacid spreads and amplifies the change."
                                    },
                                    {
                                            "icon": "🧪",
                                            "name": "Develop in TMAH",
                                            "why": "the soluble resist washes away."
                                    }
                            ]
                    },
                    {
                            "icon": "✌️",
                            "title": "Self-aligned double patterning",
                            "lead": "Turn a coarse printed pattern into twice as many lines.",
                            "steps": [
                                    {
                                            "icon": "🖨️",
                                            "name": "Print and etch the mandrels",
                                            "why": "they are a coarse pattern of lines."
                                    },
                                    {
                                            "icon": "🧴",
                                            "name": "Deposit a conformal spacer film",
                                            "why": "it coats the top and both sidewalls."
                                    },
                                    {
                                            "icon": "⛏️",
                                            "name": "Etch back the spacer film",
                                            "why": "only the sidewall spacers remain."
                                    },
                                    {
                                            "icon": "🧹",
                                            "name": "Remove the mandrels",
                                            "why": "the spacers are left standing."
                                    },
                                    {
                                            "icon": "🎯",
                                            "name": "Etch the layer using the spacers",
                                            "why": "twice as many lines at half the pitch."
                                    }
                            ]
                    },
                    {
                            "icon": "✨",
                            "title": "The EUV light path",
                            "lead": "Follow 13.5 nm light from a tin droplet to the wafer.",
                            "steps": [
                                    {
                                            "icon": "🔫",
                                            "name": "A CO₂ laser hits a tin droplet",
                                            "why": "it turns the droplet into plasma."
                                    },
                                    {
                                            "icon": "💥",
                                            "name": "The plasma emits 13.5 nm light",
                                            "why": "this is the EUV source."
                                    },
                                    {
                                            "icon": "🥄",
                                            "name": "The collector mirror gathers it",
                                            "why": "the light is sent into the scanner."
                                    },
                                    {
                                            "icon": "🔆",
                                            "name": "Illuminator mirrors shape the beam",
                                            "why": "they aim it at the reticle."
                                    },
                                    {
                                            "icon": "🎭",
                                            "name": "It reflects off the reticle",
                                            "why": "the mask is a mirror, too."
                                    },
                                    {
                                            "icon": "🔭",
                                            "name": "Projection mirrors shrink the image",
                                            "why": "the pattern lands on the wafer."
                                    }
                            ]
                    }
            ]
    },

    dopingTransistor: {
        "key": "fabPathChipGame4Complete",
        "xp": 50,
        "rounds": [
                {
                        "icon": "🌡️",
                        "title": "Diffusion doping",
                        "lead": "Push dopant into a wafer the oldest way, with heat.",
                        "steps": [
                                {
                                        "icon": "🧼",
                                        "name": "Clean the wafer surface",
                                        "why": "any residue would block even, uniform doping."
                                },
                                {
                                        "icon": "🧪",
                                        "name": "Load the dopant source",
                                        "why": "a solid, liquid, or gas source supplies the surface."
                                },
                                {
                                        "icon": "🌡️",
                                        "name": "Predeposit at moderate heat",
                                        "why": "this step loads a fixed, controlled dose."
                                },
                                {
                                        "icon": "🔥",
                                        "name": "Drive in at higher heat",
                                        "why": "longer, hotter heat pushes dopant to its final depth."
                                },
                                {
                                        "icon": "🧴",
                                        "name": "Strip the leftover glass",
                                        "why": "the used dopant source must come off before the next step."
                                }
                        ]
                },
                {
                        "icon": "⚡",
                        "title": "Ion implantation",
                        "lead": "Fire dopant in as a beam, the way modern fabs do it.",
                        "steps": [
                                {
                                        "icon": "🎭",
                                        "name": "Pattern the resist mask",
                                        "why": "lithography decides where dopant is allowed to land."
                                },
                                {
                                        "icon": "🔋",
                                        "name": "Generate ions at the source",
                                        "why": "dopant atoms are stripped of electrons first."
                                },
                                {
                                        "icon": "🚀",
                                        "name": "Accelerate and mass-select them",
                                        "why": "a magnet filters out every ion but the right one."
                                },
                                {
                                        "icon": "📐",
                                        "name": "Implant into the tilted wafer",
                                        "why": "tilting avoids channeling down the open lattice."
                                },
                                {
                                        "icon": "🧴",
                                        "name": "Strip the resist mask",
                                        "why": "its job is done once the beam has passed."
                                }
                        ]
                },
                {
                        "icon": "🔌",
                        "title": "Build a transistor",
                        "lead": "Put doping, the gate, and an anneal together into one device.",
                        "steps": [
                                {
                                        "icon": "🧫",
                                        "name": "Implant the well",
                                        "why": "the well sets up the opposite type for source and drain."
                                },
                                {
                                        "icon": "🧱",
                                        "name": "Grow the gate oxide",
                                        "why": "this thin film insulates the gate from the channel."
                                },
                                {
                                        "icon": "🎭",
                                        "name": "Deposit and pattern the gate",
                                        "why": "the gate will align every implant that follows."
                                },
                                {
                                        "icon": "📏",
                                        "name": "Implant the LDD",
                                        "why": "it self-aligns to the gate edge, softening the field."
                                },
                                {
                                        "icon": "🧊",
                                        "name": "Form the sidewall spacer",
                                        "why": "it sets back the deeper implant that comes next."
                                },
                                {
                                        "icon": "🧫",
                                        "name": "Implant the source and drain",
                                        "why": "these heavier, deeper implants form the switch itself."
                                },
                                {
                                        "icon": "♨️",
                                        "name": "Spike-anneal the whole device",
                                        "why": "one fast anneal activates every implant made so far."
                                }
                        ]
                }
        ]
    },

    processFlow: {
        "key": "fabPathChipGame5Complete",
        "xp": 50,
        "rounds": [
                {
                        "icon": "🔗",
                        "title": "Build a contact",
                        "lead": "Get a low-resistance path out of a freshly built transistor.",
                        "steps": [
                                {
                                        "icon": "🧴",
                                        "name": "Deposit the silicide metal",
                                        "why": "a thin film blankets the whole wafer first."
                                },
                                {
                                        "icon": "♨️",
                                        "name": "Heat it to react with silicon",
                                        "why": "silicide forms only where metal touches bare silicon."
                                },
                                {
                                        "icon": "🧪",
                                        "name": "Strip the unreacted metal",
                                        "why": "it never touched silicon, so it never became silicide."
                                },
                                {
                                        "icon": "⛏️",
                                        "name": "Etch the contact hole",
                                        "why": "a narrow opening reaches down through the oxide."
                                },
                                {
                                        "icon": "🔩",
                                        "name": "Fill it with tungsten",
                                        "why": "tungsten survives the narrow, hot fill this deep."
                                },
                                {
                                        "icon": "🪞",
                                        "name": "Polish flat with CMP",
                                        "why": "the surface must be flat before the next layer."
                                }
                        ]
                },
                {
                        "icon": "🧵",
                        "title": "Build one metal layer",
                        "lead": "Add a single layer to the stack, the damascene way.",
                        "steps": [
                                {
                                        "icon": "🧱",
                                        "name": "Deposit the low-k dielectric",
                                        "why": "this insulator will surround the finished wires."
                                },
                                {
                                        "icon": "🎭",
                                        "name": "Pattern and etch the wire trenches",
                                        "why": "copper cannot be etched, so a trench is cut instead."
                                },
                                {
                                        "icon": "🧲",
                                        "name": "Line it with a barrier and seed",
                                        "why": "copper would otherwise diffuse into the dielectric."
                                },
                                {
                                        "icon": "⚡",
                                        "name": "Electroplate copper to fill it",
                                        "why": "plating fills the trench from the bottom up."
                                },
                                {
                                        "icon": "🪞",
                                        "name": "Polish flat with CMP",
                                        "why": "excess copper is removed before the next layer starts."
                                }
                        ]
                },
                {
                        "icon": "📐",
                        "title": "From design to tapeout",
                        "lead": "Turn a logic design into a manufacturable set of masks.",
                        "steps": [
                                {
                                        "icon": "🧩",
                                        "name": "Choose standard cells for the logic",
                                        "why": "each gate comes from a pre-verified library."
                                },
                                {
                                        "icon": "🗺️",
                                        "name": "Place and route the design",
                                        "why": "software arranges and wires up every cell."
                                },
                                {
                                        "icon": "🔍",
                                        "name": "Run the design rule check",
                                        "why": "every shape gets compared against the fab's limits."
                                },
                                {
                                        "icon": "🛠️",
                                        "name": "Fix any violations found",
                                        "why": "a shape that fails DRC won't manufacture correctly."
                                },
                                {
                                        "icon": "📤",
                                        "name": "Send the finished masks to the fab",
                                        "why": "tapeout hands the fab everything it needs to build."
                                }
                        ]
                }
        ]
    },

    yieldMetrology: {
        "key": "fabPathChipGame6Complete",
        "xp": 50,
        "rounds": [
                {
                        "icon": "🗺️",
                        "title": "Diagnose a wafer map",
                        "lead": "Go from a drop in yield to a confirmed root cause.",
                        "steps": [
                                {
                                        "icon": "📉",
                                        "name": "Notice yield has dropped",
                                        "why": "final test data is what flags the problem first."
                                },
                                {
                                        "icon": "🗺️",
                                        "name": "Pull up the wafer map",
                                        "why": "the map shows where on the wafer die are failing."
                                },
                                {
                                        "icon": "🔎",
                                        "name": "Read the shape of the pattern",
                                        "why": "a center cluster, edge ring, or scatter points differently."
                                },
                                {
                                        "icon": "🛠️",
                                        "name": "Match the shape to a likely tool",
                                        "why": "each shape is a fingerprint for a specific process step."
                                },
                                {
                                        "icon": "📈",
                                        "name": "Check that tool's control charts",
                                        "why": "a drifting chart confirms which tool actually slipped."
                                },
                                {
                                        "icon": "✅",
                                        "name": "Confirm the root cause and fix it",
                                        "why": "only a confirmed cause tells you what to actually change."
                                }
                        ]
                },
                {
                        "icon": "🚨",
                        "title": "Respond to an SPC alarm",
                        "lead": "A control chart just went out of limits. Now what?",
                        "steps": [
                                {
                                        "icon": "🚨",
                                        "name": "A point falls outside the control limits",
                                        "why": "this is the signal that starts the whole response."
                                },
                                {
                                        "icon": "⏸️",
                                        "name": "Hold that tool from running more lots",
                                        "why": "running more wafers now would only risk more of them."
                                },
                                {
                                        "icon": "🔍",
                                        "name": "Investigate the tool's recent history",
                                        "why": "something changed, and the history usually shows when."
                                },
                                {
                                        "icon": "🛠️",
                                        "name": "Find and fix the root cause",
                                        "why": "the alarm only says something's wrong, not what is."
                                },
                                {
                                        "icon": "✅",
                                        "name": "Requalify the tool",
                                        "why": "a test run confirms the fix actually worked."
                                },
                                {
                                        "icon": "▶️",
                                        "name": "Release the hold and resume",
                                        "why": "production only continues once the tool is trusted again."
                                }
                        ]
                },
                {
                        "icon": "📏",
                        "title": "Take a wafer through metrology",
                        "lead": "Check a freshly processed layer before moving on.",
                        "steps": [
                                {
                                        "icon": "🎯",
                                        "name": "Sample die across the wafer",
                                        "why": "a few sites stand in for the whole wafer's result."
                                },
                                {
                                        "icon": "📏",
                                        "name": "Measure critical dimension",
                                        "why": "this checks whether features printed at the right size."
                                },
                                {
                                        "icon": "🎯",
                                        "name": "Measure overlay to the layer below",
                                        "why": "this checks whether the new layer landed in place."
                                },
                                {
                                        "icon": "📐",
                                        "name": "Measure film thickness",
                                        "why": "this checks whether the deposition hit its target."
                                },
                                {
                                        "icon": "📊",
                                        "name": "Compare every result to its control limits",
                                        "why": "a single number means nothing without a limit to judge it by."
                                },
                                {
                                        "icon": "✅",
                                        "name": "Pass the lot, or flag it for review",
                                        "why": "this is the gate that decides if the lot moves forward."
                                }
                        ]
                }
        ]
    },

    packagingTest: {
        "key": "fabPathChipGame7Complete",
        "xp": 50,
        "rounds": [
                {
                        "icon": "🔗",
                        "title": "Wire-bond a package",
                        "lead": "Take a diced die from bare silicon to a finished part.",
                        "steps": [
                                {
                                        "icon": "🧫",
                                        "name": "Attach the die to the substrate",
                                        "why": "the die needs something solid to sit on first."
                                },
                                {
                                        "icon": "🔗",
                                        "name": "Wire bond every pad to the substrate",
                                        "why": "each pad needs its own path to the outside."
                                },
                                {
                                        "icon": "🧴",
                                        "name": "Encapsulate in mold compound",
                                        "why": "the wires and die both need protection now."
                                },
                                {
                                        "icon": "🖊️",
                                        "name": "Mark the finished package",
                                        "why": "a label identifies the part before it ships."
                                },
                                {
                                        "icon": "✂️",
                                        "name": "Singulate into individual units",
                                        "why": "packages are built in a panel, then separated."
                                }
                        ]
                },
                {
                        "icon": "🧱",
                        "title": "Build a flip-chip BGA",
                        "lead": "Connect a die face-down, then give it a grid of balls.",
                        "steps": [
                                {
                                        "icon": "🔄",
                                        "name": "Flip the die and align its bumps",
                                        "why": "the bumps must land exactly on the substrate pads."
                                },
                                {
                                        "icon": "🔥",
                                        "name": "Reflow the solder bumps",
                                        "why": "heat melts the bumps to bond die to substrate."
                                },
                                {
                                        "icon": "🧪",
                                        "name": "Underfill beneath the die",
                                        "why": "it spreads stress evenly across every bump."
                                },
                                {
                                        "icon": "⚪",
                                        "name": "Attach solder balls underneath",
                                        "why": "this grid is how the package meets the board."
                                },
                                {
                                        "icon": "✂️",
                                        "name": "Singulate and test the finished part",
                                        "why": "each unit is separated, then proven to work."
                                }
                        ]
                },
                {
                        "icon": "✅",
                        "title": "Take a chip through test",
                        "lead": "Follow one chip from wafer sort to a shipped, binned product.",
                        "steps": [
                                {
                                        "icon": "🔬",
                                        "name": "Wafer sort while still on the wafer",
                                        "why": "bad die are caught before they're ever packaged."
                                },
                                {
                                        "icon": "✂️",
                                        "name": "Dice the good die apart",
                                        "why": "only die that passed sort are worth packaging."
                                },
                                {
                                        "icon": "📦",
                                        "name": "Package the die",
                                        "why": "packaging protects it and connects it to a board."
                                },
                                {
                                        "icon": "🔍",
                                        "name": "Run final test on the finished part",
                                        "why": "packaging can introduce failures of its own."
                                },
                                {
                                        "icon": "🌡️",
                                        "name": "Burn it in under stress",
                                        "why": "this forces early failures out before shipping."
                                },
                                {
                                        "icon": "🏷️",
                                        "name": "Bin it by measured speed and power",
                                        "why": "the same design becomes several graded products."
                                }
                        ]
                }
        ]
    }
};
