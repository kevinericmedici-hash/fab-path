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
    }
};
