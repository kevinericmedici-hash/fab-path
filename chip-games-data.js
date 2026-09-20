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
}
};
