/* ========================================
   FAB VALLEY ADVENTURE (prototype)
   Pick an engineer, walk between fab
   facilities, master machines for XP and
   battle a process defect.

   World is a 20 x 15 tile canvas (16 px
   tiles, drawn at 2x). All UI that needs
   real text (dialog, machines, battle) is
   DOM layered on top.
======================================== */

(function () {

    "use strict";

    const TILE = 16;
    const COLS = 20;
    const ROWS = 15;
    const STEP_MS = 190;
    const XP_PER_LEVEL = 60;
    const SAVE_KEY = "fabPathAdventure";


    /* ---------- Content ---------- */

    const TYPES = {
        litho: { label: "Lithography", icon: "💡" },
        etch: { label: "Etch", icon: "⚡" },
        dep: { label: "Deposition", icon: "🧪" },
        inspect: { label: "Metrology", icon: "🔬" }
    };

    const CHARACTERS = [
        {
            id: "lena",
            name: "Lena",
            title: "Lithographer",
            type: "litho",
            blurb: "Prints patterns with light. Bonus XP on litho tools and stronger Pattern Beam.",
            look: { suit: "#f4f6fb", accent: "#ffd84a", visor: "#4cc3ff" }
        },
        {
            id: "ravi",
            name: "Ravi",
            title: "Etch Engineer",
            type: "etch",
            blurb: "Carves silicon with plasma. Bonus XP on etchers and stronger Bosch Cycle.",
            look: { suit: "#e6defa", accent: "#b46bff", visor: "#ff8ad8" }
        },
        {
            id: "mika",
            name: "Mika",
            title: "Thin-Film Engineer",
            type: "dep",
            blurb: "Grows and coats films atom by atom. Stronger Conformal Coat in battle.",
            look: { suit: "#dff6ef", accent: "#2ebfa5", visor: "#7fb2ff" }
        },
        {
            id: "sol",
            name: "Sol",
            title: "Metrologist",
            type: "inspect",
            blurb: "Measures everything twice. Stronger SEM Scan in battle.",
            look: { suit: "#fbe6da", accent: "#ff8a5c", visor: "#5be38a" }
        }
    ];

    const MACHINES = {
        spin: { name: "Spin Coater", icon: "🌀", type: "litho", xp: 40 },
        align: { name: "Mask Aligner", icon: "🎯", type: "litho", xp: 40 },
        drie: { name: "DRIE Etcher", icon: "⚡", type: "etch", xp: 50 }
    };

    const BOSS_XP = 100;

    const QUESTIONS = {

        litho: [
            {
                q: "Why is the lithography bay lit with yellow light?",
                a: [
                    "Photoresist reacts to UV and blue light, and yellow light has none",
                    "Yellow light helps the resist dry faster",
                    "It makes particles easier to see",
                    "Yellow bulbs are cheaper to run all day"
                ],
                why: "Photoresist is tuned to UV and blue wavelengths. Filtering those out keeps unexposed wafers safe."
            },
            {
                q: "In a positive photoresist, what happens to the regions exposed to UV?",
                a: [
                    "They dissolve away in the developer",
                    "They harden and stay on the wafer",
                    "They turn into silicon dioxide",
                    "Nothing happens until the wafer is baked"
                ],
                why: "Exposure breaks positive resist down so the developer washes it away. Negative resist does the opposite."
            },
            {
                q: "You spin a photoresist at a higher speed. What happens to the film?",
                a: [
                    "It gets thinner",
                    "It gets thicker",
                    "It stays the same thickness",
                    "It becomes patchy"
                ],
                why: "Film thickness goes roughly as 1/√(spin speed), so spinning faster gives a thinner film."
            },
            {
                q: "Which change lets lithography print smaller features?",
                a: [
                    "A shorter light wavelength",
                    "A longer light wavelength",
                    "A thicker photomask",
                    "Brighter yellow room lights"
                ],
                why: "The smallest printable feature scales with wavelength ÷ numerical aperture, which is why fabs moved to deep-UV and then EUV light."
            }
        ],

        etch: [
            {
                q: "What does an isotropic etch do?",
                a: [
                    "Etches equally in every direction, cutting under the mask",
                    "Etches only straight down",
                    "Etches only the mask, not the silicon",
                    "Deposits a film on the walls"
                ],
                why: "An isotropic etch eats sideways as fast as it goes down, which creates an undercut beneath the mask."
            },
            {
                q: "The Bosch process alternates between which two steps?",
                a: [
                    "SF<sub>6</sub> etching and C<sub>4</sub>F<sub>8</sub> passivation",
                    "Spin coating and baking",
                    "Oxidation and annealing",
                    "Sputtering and polishing"
                ],
                why: "Short SF<sub>6</sub> etch steps are interleaved with C<sub>4</sub>F<sub>8</sub> steps that coat the walls in polymer, keeping the trench straight."
            },
            {
                q: "What causes the tiny ripples (scallops) on DRIE sidewalls?",
                a: [
                    "Each short etch step bites a little sideways before the next coat",
                    "Vibration from the vacuum pump",
                    "Grains in the photoresist",
                    "Light reflecting off the wafer"
                ],
                why: "Every etch step is briefly isotropic, so it leaves a small curved bite. Shorter cycles mean smaller scallops."
            },
            {
                q: "Why does KOH etch (100) silicon into sloped 54.7° walls?",
                a: [
                    "It etches the (111) crystal planes far more slowly than (100)",
                    "The KOH is sprayed at an angle",
                    "The mask erodes at that angle",
                    "Gravity pulls the etchant downward"
                ],
                why: "KOH etches slowest along the (111) planes, so they are left behind as walls at 54.7° to the (100) surface."
            }
        ],

        dep: [
            {
                q: "What does a conformal coating mean?",
                a: [
                    "The film is equally thick on tops, sidewalls and bottoms",
                    "The film only covers flat tops",
                    "The film is patterned as it deposits",
                    "The film is thicker at the wafer edge"
                ],
                why: "A conformal film follows every surface evenly. LPCVD and ALD are known for it."
            },
            {
                q: "When silicon is thermally oxidized, where does the silicon in the SiO<sub>2</sub> come from?",
                a: [
                    "The wafer itself, which is consumed as the oxide grows",
                    "A silicon gas flowing through the furnace",
                    "The quartz furnace tube",
                    "The photoresist"
                ],
                why: "Oxygen reacts with the wafer surface, consuming silicon equal to about 44% of the final oxide thickness."
            },
            {
                q: "Sputtering is an example of which kind of deposition?",
                a: [
                    "Physical vapor deposition (PVD)",
                    "Chemical vapor deposition (CVD)",
                    "Electroplating",
                    "Spin coating"
                ],
                why: "Sputtering knocks atoms off a target with energetic ions, and they land on the wafer. No chemical reaction is needed."
            },
            {
                q: "How does atomic layer deposition (ALD) build a film?",
                a: [
                    "One atomic layer at a time, using self-limiting surface reactions",
                    "By melting a metal onto the wafer",
                    "By spraying droplets of liquid",
                    "By growing it out of the wafer like an oxide"
                ],
                why: "ALD pulses precursors one after another. Each reaction stops by itself once the surface is covered, giving very precise, conformal films."
            }
        ],

        inspect: [
            {
                q: "What does a scanning electron microscope (SEM) use to make an image?",
                a: [
                    "A focused beam of electrons",
                    "Visible light through glass lenses",
                    "A sharp stylus dragged across the surface",
                    "Sound waves"
                ],
                why: "Electrons have a far shorter wavelength than visible light, so an SEM can resolve features down to nanometers."
            },
            {
                q: "What does a stylus profilometer measure?",
                a: [
                    "Step heights across the surface",
                    "The electrical resistance of a film",
                    "The chemical makeup of a film",
                    "The number of particles in the air"
                ],
                why: "A fine stylus is dragged across the wafer, and its up-and-down motion traces the surface profile."
            },
            {
                q: "How does an ellipsometer measure a thin film's thickness?",
                a: [
                    "From how the film changes the polarization of reflected light",
                    "By weighing the wafer",
                    "By cutting the wafer in half",
                    "By counting atoms"
                ],
                why: "The change in polarization of the reflected light reveals the film's thickness and refractive index, without touching the wafer."
            },
            {
                q: "Why are cleanrooms rated by how many particles are in the air?",
                a: [
                    "One particle can block a pattern or short out a tiny feature",
                    "Particles make the yellow light dimmer",
                    "Particles slow down the vacuum pumps",
                    "Particles change the wafer's crystal structure"
                ],
                why: "At the micro and nano scale a dust speck is a boulder. Fewer particles per volume of air means fewer killer defects."
            }
        ]
    };

    const MOVES = [
        {
            type: "litho",
            name: "Pattern Beam",
            mult: 0.75,
            effect: "It's not very effective… the pattern is fine. The problem is the etch."
        },
        {
            type: "etch",
            name: "Bosch Cycle",
            mult: 1.75,
            effect: "Direct hit! Passivation shields the sidewalls."
        },
        {
            type: "dep",
            name: "Conformal Coat",
            mult: 1.5,
            effect: "It's effective! An even film seals the bitten sidewall."
        },
        {
            type: "inspect",
            name: "SEM Scan",
            mult: 0.5,
            effect: "You imaged the cross-section and found its weak spot. Your next hit does 1.5× damage!"
        }
    ];

    const FOE_ATTACKS = [
        { name: "Lateral Gnaw", text: "It etched sideways under your mask!" },
        { name: "Mask Lift", text: "Your photoresist started peeling up!" },
        { name: "Sidewall Bow", text: "Your trench walls bulged outward!" }
    ];


    /* ---------- Maps ---------- */

    const WORLD_ROWS = [
        "TTTTTTTTTTpTTTTTTTTT",
        "T..f......p..f.....T",
        "T.BBBBB...p..BBBBB.T",
        "T.BBBBB..fp..BBBBB.T",
        "T.BBBBB...p..BBBBB.T",
        "T.BBDBB...p..BBDBB.T",
        "T...p.....p....p...T",
        "pppppppppppppppppppp",
        "T.f.......p.....f..T",
        "T..ww.....p....T...T",
        "T.www.....p..S.....T",
        "T..ww.....p......f.T",
        "T......f..p........T",
        "T.........p..f.....T",
        "TTTTTTTTTTpTTTTTTTTT"
    ];

    function interiorRows() {

        const rows = ["W".repeat(COLS)];

        for (let y = 1; y < ROWS - 1; y++) {
            rows.push("W" + ".".repeat(COLS - 2) + "W");
        }

        rows.push("W".repeat(9) + "EE" + "W".repeat(9));

        return rows;
    }

    const LOOKS = {
        prof: { suit: "#e8dcc0", accent: "#b0413e", visor: "#33405c" },
        techA: { suit: "#f1f3f8", accent: "#3d6fd8", visor: "#4cc3ff" },
        techB: { suit: "#f1f3f8", accent: "#8a4fd8", visor: "#ff8ad8" }
    };

    const TAPE_LINES = [
        "Caution tape: DEFECT CONTAINMENT AREA.",
        "Only engineers who have mastered the DRIE etcher may enter."
    ];

    const SCENES = {

        world: {
            id: "world",
            label: "Fab Valley",
            outdoor: true,
            grid: WORLD_ROWS,
            edges: {
                right: {
                    scene: "glucose", x: 0, y: 7,
                    locked: () => !save.badges.echem,
                    lockedText: [
                        "The road east leads to Glucose Grove.",
                        "A sign says: \"Echem Lab Certificate holders only.\" Build and test your ISFET in Ion City first."
                    ]
                },
                left: {
                    scene: "silicon", x: 19, y: 7,
                    locked: () => false
                },
                up: {
                    scene: "metal", x: 10, y: 14,
                    locked: () => !save.badges.mems,
                    lockedText: [
                        "The road north climbs to Metal City, where Dr. MOS is building a new computer.",
                        "A sign says: \"MEMS Works Certificate holders only.\" Beat The Undercut in MEMS Works first."
                    ]
                },
                down: {
                    scene: "carbon", x: 10, y: 0,
                    locked: () => !save.badges.metal,
                    lockedText: [
                        "The road south leads to Ion City.",
                        "A sign says: \"Metal City Certificate holders only.\" Help Dr. MOS up north in Metal City first."
                    ]
                }
            },
            buildings: [
                {
                    id: "foundry",
                    sign: "FOUNDRY",
                    x: 2, y: 2, w: 5, h: 4,
                    door: { x: 4, y: 5 },
                    wall: "#cfd8ea",
                    roof: "#3d6fd8",
                    locked: () => false
                },
                {
                    id: "mems",
                    sign: "MEMS WORKS",
                    x: 13, y: 2, w: 5, h: 4,
                    door: { x: 15, y: 5 },
                    wall: "#ddd3ee",
                    roof: "#8a4fd8",
                    locked: () => !save.badges.foundry
                }
            ],
            npcs: [
                {
                    id: "prof",
                    name: "Dr. Ingot",
                    x: 11, y: 9,
                    dir: "down",
                    look: LOOKS.prof,
                    talk: profLines
                }
            ],
            signs: [
                {
                    x: 13, y: 10,
                    lines: [
                        "↖ Sand to Chip Foundry: lithography bay.",
                        "↗ MEMS Works: deep etching. Foundry Certificate required.",
                        "↑ Metal City: MOSFETs for Dr. MOS's computer. MEMS Works Certificate required.",
                        "↓ Ion City: ISFETs that sense ions. Metal City Certificate required.",
                        "← Silicon Beach: wafers from beach sand. Come back for more wafers any time.",
                        "→ Glucose Grove: sensors for people with diabetes. Echem Lab Certificate required."
                    ]
                }
            ],
            objects: [
                pickup({ id: "valley-su8", item: "su8", x: 17, y: 12, text: "Something sparkles in the grass… an unopened bottle of SU-8 photoresist!" })
            ]
        },

        foundry: {
            id: "foundry",
            label: "Sand to Chip Foundry · Litho Bay",
            grid: interiorRows(),
            floor: "#d9dde6",
            tint: "rgba(255, 200, 40, 0.17)",
            exitTo: { scene: "world", x: 4, y: 6 },
            objects: [
                { kind: "spin", x: 3, y: 3, w: 3, h: 2, machine: "spin" },
                stockroom({ label: "Foundry stockroom", items: ["s1813", "su8", "nlof"], x: 8, y: 2 }),
                { kind: "align", x: 13, y: 3, w: 4, h: 2, machine: "align" },
                {
                    kind: "bench", x: 3, y: 9, w: 4, h: 1,
                    lines: [
                        "A wet bench for cleaning wafers in chemical baths.",
                        "It's being serviced. Check back in a later update."
                    ]
                },
                {
                    kind: "bench", x: 13, y: 9, w: 4, h: 1,
                    lines: [
                        "A developer bench. After exposure, the developer washes away the exposed positive resist."
                    ]
                }
            ],
            npcs: [
                {
                    id: "techA",
                    name: "Litho Tech Ada",
                    x: 11, y: 7,
                    dir: "down",
                    look: LOOKS.techA,
                    talk: () => save.badges.foundry
                        ? ["Nice work. MEMS Works should let you in now, it's on the other side of the valley."]
                        : [
                            "Welcome to the litho bay! See how yellow the light is?",
                            "Photoresist reacts to UV and blue light. Yellow light has neither, so it can't expose the wafers.",
                            "Start with the spin coater on the left, then line up a mask on the aligner to the right."
                        ]
                }
            ]
        },

        mems: {
            id: "mems",
            label: "MEMS Works · Etch Hall",
            grid: interiorRows(),
            floor: "#d6d9e4",
            tint: "rgba(120, 80, 220, 0.08)",
            exitTo: { scene: "world", x: 15, y: 6 },
            objects: [
                { kind: "drie", x: 3, y: 3, w: 3, h: 2, machine: "drie" },
                { kind: "boss", x: 14, y: 3, w: 2, h: 2 },
                {
                    kind: "sem", x: 3, y: 9, w: 3, h: 2,
                    lines: [
                        "A scanning electron microscope for checking trench profiles.",
                        "It's still being installed. Check back in a later update."
                    ]
                },
                { kind: "tape", x: 12, y: 6, w: 7, h: 1, lines: TAPE_LINES },
                { kind: "tape", x: 11, y: 1, w: 1, h: 6, lines: TAPE_LINES }
            ],
            npcs: [
                {
                    id: "techB",
                    name: "Etch Tech Bo",
                    x: 8, y: 7,
                    dir: "down",
                    look: LOOKS.techB,
                    talk: () => save.bossBeaten
                        ? ["You beat The Undercut! Our trenches have never been straighter."]
                        : [
                            "Careful! A process defect called The Undercut got loose in the back.",
                            "It eats sideways under masks. Only straight-walled etching can stop it.",
                            "Master the DRIE etcher first, then step past the tape to face it."
                        ]
                }
            ]
        }
    };

    // Tape across the back room lifts once DRIE is mastered.
    function objectIsActive(o) {
        if (o.active) {
            return o.active();
        }
        if (o.kind === "tape") {
            return !save.mastered.drie;
        }
        return true;
    }

    function profLines() {

        const name = currentChar() ? currentChar().name : "engineer";

        // The order after Fab Valley: Metal City, Ion City (and its
        // East Side lab), Glucose Grove, Grey Matter, PDMS City,
        // Ampfield, then Carbon City by tram.
        if (save.badges.carboncity) {
            return [
                `Every certificate in the region, ${name}! From sand to supercapacitors to buckyballs.`,
                "Come back any time to run the machines, rematch the bosses or play at the cafés."
            ];
        }

        if (save.badges.energy) {
            return [
                `The Spark Line is running again, ${name}!`,
                "Ride the tram from the Ampfield plaza to Carbon City. Dr. Bucky has a whole lab of carbon to play with."
            ];
        }

        if (save.badges.glucose) {
            return [
                `Glucose Grove is in good hands, ${name}. Keep heading east!`,
                "Past Glucose Grove come Grey Matter, then PDMS City, then Ampfield. Each town's certificate opens the road to the next."
            ];
        }

        if (save.badges.echem) {
            return [
                `You tamed The Biofouler, ${name}! You're ready for Glucose Grove.`,
                "Take the road east. The folks there need glucose sensors, and Dr. Dex could use your help making them."
            ];
        }

        if (save.badges.carbon) {
            return [
                `Glassy carbon already, ${name}? Dr. Carbon must be thrilled.`,
                "Now test your ISFET in the Echem Lab on Ion City's east side. Beat The Biofouler there and the road east to Glucose Grove opens."
            ];
        }

        if (save.badges.metal) {
            return [
                `Dr. MOS's computer is running, ${name}!`,
                "Follow the path south out of the valley to Ion City. Dr. Carbon is expecting you in the Ion Lab."
            ];
        }

        if (save.bossBeaten) {
            return [
                `You beat The Undercut, ${name}! Both Fab Valley certificates are yours.`,
                "Take the road north out of the valley to Metal City. Dr. MOS is building a computer and needs transistors.",
                "Bring a wafer, RCA chemicals and dopant from Silicon Beach, and S1813 from the Foundry stockroom."
            ];
        }

        if (save.badges.foundry) {
            return [
                "The Foundry Certificate! MEMS Works, up on the right, is open to you now.",
                "Rumor has it a process defect is loose in there…"
            ];
        }

        return [
            `Welcome to Fab Valley, ${name}! I'm Dr. Ingot. Those wafers from Silicon Beach will come in handy.`,
            "Head into the Sand to Chip Foundry, up on the left. Grab photoresist from its stockroom, then master both machines for the Foundry Certificate.",
            "Each run on the spin coater or the DRIE etcher uses a wafer. Out of wafers? Silicon Beach is back down the road west."
        ];
    }


    /* ---------- Save ---------- */

    function defaultSave() {
        return {
            charId: null,
            xp: 0,
            mastered: {},
            badges: {},
            bossBeaten: false,
            scene: "silicon",
            x: 12,
            y: 7,
            dir: "down"
        };
    }

    function loadSave() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) {
                return Object.assign(defaultSave(), JSON.parse(raw));
            }
        } catch (e) { /* fall through */ }
        return defaultSave();
    }

    function writeSave() {
        save.scene = scene.id;
        save.x = player.x;
        save.y = player.y;
        save.dir = player.dir;
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(save));
        } catch (e) { /* storage blocked: progress lasts this visit */ }
    }

    const save = loadSave();

    // Saves from before the bag existed get a starter supply of wafers.
    const bagIsNew = !save.bag;
    if (bagIsNew) {
        save.bag = save.charId ? { wafer: 3 } : {};
    }

    function currentChar() {
        return CHARACTERS.find((c) => c.id === save.charId) || null;
    }

    function level() {
        return 1 + Math.floor(save.xp / XP_PER_LEVEL);
    }


    /* ---------- Extensions (new towns) ----------
       Files like adventure-carbon.js push a function onto
       window.FabAdventureExtensions; each gets this API and
       adds scenes, objects and keys before the game starts. */

    const extraKeys = {};

    /*
       Each town can register a recipe card. The Recipe button and
       the R key open the one for the town you're standing in, or
       else the most recent one you've been given.
    */
    const recipes = [];

    function refreshRecipe() {
        const btn = document.getElementById("advRecipe");
        if (btn) {
            btn.hidden = !recipes.some((r) => r.available());
        }
    }

    function openActiveRecipe() {
        const here = recipes.find((r) => r.available() && r.scenes.includes(scene.id));
        const any = recipes.slice().reverse().find((r) => r.available());
        const r = here || any;
        if (r) {
            r.open();
        }
    }

    extraKeys.KeyR = openActiveRecipe;


    /* ---------- Sound ----------
       The synth lives in adventure-audio.js; the engine just names
       the sound and picks the music mood for the current scene. */

    let battleActive = false;

    function snd(name) {
        if (window.FabAdventureAudio) {
            window.FabAdventureAudio.sfx(name);
        }
    }

    function moodFor(sc) {
        if (battleActive) {
            return "battle";
        }
        if (sc.id === "ioncafe" || sc.id === "buckycafe") {
            return "cafe";
        }
        if (sc.id === "silicon") {
            return "beach";
        }
        return sc.outdoor ? "town" : "lab";
    }

    function updateMusic() {
        if (window.FabAdventureAudio) {
            window.FabAdventureAudio.music(moodFor(scene), scene.id);
        }
    }

    function soundLabel() {
        const st = window.FabAdventureAudio ? window.FabAdventureAudio.state() : "off";
        return st === "on" ? "🔊 Sound" : st === "sfx" ? "🔈 Effects only" : "🔇 Muted";
    }


    /* ---------- Bag ----------
       Materials the player carries between towns. Wafers come only
       from Silicon Beach (3 per finished wafer), photoresists from
       the Foundry stockroom, and each town's own chemicals from its
       stockroom. Recipe steps that need an item take it once per run. */

    const ITEMS = {
        wafer: { icon: "💿", name: "Silicon wafer", from: "Made at Silicon Beach: every finished wafer run gives you 3.", use: "Foundry spin coater, MEMS DRIE, Ion City's Ion Lab, Grey Matter Pt arrays, PDMS City masters and Metal City MOSFETs." },
        hcl: { icon: "🧪", name: "Hydrochloric acid (HCl)", from: "Silicon Beach supply shed.", use: "Silicon Beach HCl reactor (making trichlorosilane)." },
        rca: { icon: "🫧", name: "RCA clean chemicals", from: "Silicon Beach supply shed.", use: "Silicon Beach RCA clean bench (SC-1, HF, SC-2) and the Metal City wet bench." },
        dopant: { icon: "⚛️", name: "Phosphorus dopant source", from: "Silicon Beach supply shed.", use: "Silicon Beach and Metal City ion implanters." },
        s1813: { icon: "🧴", name: "S1813 positive photoresist", from: "Foundry stockroom, Fab Valley.", use: "Foundry spin coater and Metal City gate lithography." },
        su8: { icon: "🧴", name: "SU-8 photoresist", from: "Foundry stockroom, Fab Valley.", use: "Ion Lab (glassy carbon) and PDMS City (SU-8 masters)." },
        nlof: { icon: "🧴", name: "AZ nLOF 2020 lift-off resist", from: "Foundry stockroom, Fab Valley.", use: "Ion Lab metal layer." },
        polyimide: { icon: "🟫", name: "Photo-definable polyimide", from: "Ion Lab stockroom, Ion City.", use: "Ion Lab insulation and passivation layers (one per layer)." },
        tiau: { icon: "🥇", name: "Ti and Au evaporation pellets", from: "Ion Lab stockroom, Ion City.", use: "Ion Lab metal evaporator." },
        pt: { icon: "🪙", name: "Platinum wire", from: "SensorWorks stockroom, Glucose Grove.", use: "Glucose sensor electrodes." },
        gox: { icon: "🧬", name: "Glucose oxidase (GOx)", from: "SensorWorks stockroom, Glucose Grove.", use: "Glucose sensor enzyme spotter." },
        fiber: { icon: "🧵", name: "Carbon fiber (7 µm)", from: "NeuroFab stockroom, Grey Matter.", use: "NeuroFab fiber bench." },
        nafion: { icon: "🧴", name: "Nafion solution", from: "NeuroFab stockroom, Grey Matter.", use: "NeuroFab Nafion station." },
        pdmskit: { icon: "🫙", name: "Sylgard 184 PDMS kit", from: "Soft Litho Lab stockroom, PDMS City.", use: "PDMS City mixer." },
        powder: { icon: "⚫", name: "Electrode powder kit", from: "Cell Works stockroom, Ampfield.", use: "Ampfield material shelf (activated carbon, carbon black and PVDF)." },
        elyte: { icon: "🔋", name: "Supercap electrolyte set", from: "Cell Works stockroom, Ampfield.", use: "Ampfield glove box." },
        silane: { icon: "🛢️", name: "Silane gas (SiH₄)", from: "MOS Fab stockroom, Metal City.", use: "Metal City LPCVD furnace (polysilicon gate)." },
        altarget: { icon: "🪙", name: "Aluminum sputter target", from: "MOS Fab stockroom, Metal City.", use: "Metal City sputter tool (contacts and wires)." }
    };

    const STOCK_CAP = 3;

    function bagCount(id) {
        return (save.bag && save.bag[id]) || 0;
    }

    function itemText(id, n) {
        const it = ITEMS[id];
        return `${n > 1 ? n + " × " : ""}${it.icon} ${it.name}`;
    }

    function giveItem(id, n, quiet) {
        save.bag = save.bag || {};
        save.bag[id] = bagCount(id) + n;
        writeSave();
        snd("pickup");
        if (!quiet) {
            toast(`🎒 +${n} ${ITEMS[id].icon} ${ITEMS[id].name}`);
        }
    }

    // Takes a step's items once per run. state is the town's save
    // object (it has runs); returns false (and explains) if any are missing.
    function payStep(state, stepId, uses) {
        if (!uses || !uses.length) {
            return true;
        }
        state.paid = state.paid || {};
        const key = stepId + "#" + (state.runs || 0);
        if (state.paid[key]) {
            return true;
        }
        const missing = uses.filter(([id, n]) => bagCount(id) < n);
        if (missing.length) {
            say([
                `This step needs ${uses.map(([id, n]) => itemText(id, n)).join(" and ")}, and your bag is short.`
            ].concat(missing.map(([id]) => `${ITEMS[id].icon} ${ITEMS[id].name}: ${ITEMS[id].from}`), ["Press B to look in your bag."]));
            return false;
        }
        uses.forEach(([id, n]) => {
            save.bag[id] -= n;
        });
        Object.keys(state.paid).forEach((k) => {
            if (!k.endsWith("#" + (state.runs || 0))) {
                delete state.paid[k];
            }
        });
        state.paid[key] = true;
        writeSave();
        toast(`🎒 Used ${uses.map(([id, n]) => itemText(id, n)).join(", ")}`);
        snd("use");
        return true;
    }

    // A shelf that tops each of its items up to STOCK_CAP.
    function stockroom(cfg) {
        return {
            kind: "stock",
            x: cfg.x, y: cfg.y, w: cfg.w || 3, h: cfg.h || 1,
            label: cfg.label || "Stockroom",
            prompt: "A: Take supplies",
            draw: (c, X, Y, W, H) => {
                box(X, Y + 2, W, H - 2, cfg.outdoor ? "#b8946a" : "#c9cfdb");
                rect(c, X + 3, Y + 7, W - 6, 1, "#5d6577");
                const cols = ["#ff8a5c", "#7fb2ff", "#ffd84a", "#5be38a", "#c97fe0", "#f5f7ff"];
                for (let i = 0; i < Math.floor((W - 6) / 6); i++) {
                    rect(c, X + 4 + i * 6, Y + 1, 4, 6, cols[i % cols.length]);
                    rect(c, X + 5 + i * 6, Y, 2, 1, "#1a2033");
                }
            },
            use: () => {
                const got = [];
                cfg.items.forEach((id) => {
                    const need = STOCK_CAP - bagCount(id);
                    if (need > 0) {
                        giveItem(id, need, true);
                        got.push(itemText(id, need));
                    }
                });
                say(got.length
                    ? [`${cfg.label}: you packed ${got.join(", ")}.`, `Stockrooms top you up to ${STOCK_CAP} of each. Press B to see your bag.`]
                    : [`${cfg.label}: you already have ${STOCK_CAP} of everything here (${cfg.items.map((id) => ITEMS[id].icon).join(" ")}).`]);
            }
        };
    }

    // A one-time find that sparkles on the map until picked up.
    function pickup(cfg) {
        return {
            kind: "pickup",
            x: cfg.x, y: cfg.y, w: 1, h: 1,
            active: () => !(save.picked && save.picked[cfg.id]),
            prompt: "A: Pick it up",
            draw: (c, X, Y, W, H, t) => {
                const k = (Math.sin(t / 220 + cfg.x) + 1) / 2;
                c.fillStyle = `rgba(255, 240, 160, ${0.35 + 0.4 * k})`;
                c.beginPath();
                c.arc(X + 8, Y + 9, 4 + 2 * k, 0, Math.PI * 2);
                c.fill();
                rect(c, X + 7, Y + 3, 2, 12, "#fff6c9");
                rect(c, X + 2, Y + 8, 12, 2, "#fff6c9");
            },
            use: () => {
                save.picked = save.picked || {};
                save.picked[cfg.id] = true;
                giveItem(cfg.item, cfg.n || 1, true);
                say([cfg.text, `🎒 You got ${itemText(cfg.item, cfg.n || 1)}!`]);
            }
        };
    }

    function openBag() {
        const owned = Object.keys(ITEMS).filter((id) => bagCount(id) > 0);
        const rest = Object.keys(ITEMS).filter((id) => bagCount(id) === 0);
        const card = (id) => {
            const it = ITEMS[id];
            const n = bagCount(id);
            return `
                <li class="adv-item${n ? "" : " empty"}">
                    <span class="adv-item-icon" aria-hidden="true">${it.icon}</span>
                    <span class="adv-item-text">
                        <strong>${it.name}</strong>
                        <small>Get it: ${it.from}</small>
                        <small>Used at: ${it.use}</small>
                    </span>
                    <span class="adv-item-count">×${n}</span>
                </li>`;
        };
        openModal(`
            <div class="adv-panel-head">
                <span class="adv-type bag">🎒 Bag</span>
                <h2>Your bag</h2>
                <button type="button" class="adv-close" data-close aria-label="Close">✕</button>
            </div>
            <p class="adv-lead">Fabs use up materials. Wafers come from Silicon Beach (3 per finished wafer), photoresists from the Foundry stockroom, and each town's chemicals from its own stockroom. Keep an eye out for sparkles too.</p>
            ${owned.length ? `<ul class="adv-items">${owned.map(card).join("")}</ul>` : '<p class="adv-keys">Your bag is empty.</p>'}
            ${rest.length ? `<p class="adv-round">Not in your bag yet</p><ul class="adv-items">${rest.map(card).join("")}</ul>` : ""}`);
    }

    extraKeys.KeyB = openBag;


    /* ---------- Map ----------
       A world map of every town (roads, the tram, locks, badges,
       a "you are here" marker) and a close-up of the current area. */

    const TOWNS = [
        { id: "silicon", name: "Silicon Beach", scene: "silicon", col: 0, row: 1, badge: "silicon", icon: "💠", seen: "silicon" },
        { id: "valley", name: "Fab Valley", scene: "world", col: 1, row: 1, badge: "mems", icon: "🏆", seen: null },
        { id: "metal", name: "Metal City", scene: "metal", col: 1, row: 0, badge: "metal", icon: "🔩", seen: "metal" },
        { id: "ion", name: "Ion City", scene: "carbon", col: 1, row: 2, badge: "carbon", icon: "💎", seen: "carbon" },
        { id: "ioneast", name: "Ion City East", scene: "carboneast", col: 2, row: 2, badge: "echem", icon: "🔋", seen: "echem" },
        { id: "glucose", name: "Glucose Grove", scene: "glucose", col: 2, row: 1, badge: "glucose", icon: "🩸", seen: "glucose" },
        { id: "neuro", name: "Grey Matter", scene: "neuro", col: 3, row: 1, badge: "neuro", icon: "🧠", seen: "neuro" },
        { id: "pdms", name: "PDMS City", scene: "pdms", col: 4, row: 1, badge: "pdms", icon: "🧫", seen: "pdms" },
        { id: "energy", name: "Ampfield", scene: "energy", col: 5, row: 1, badge: "energy", icon: "⚡", seen: "energy" },
        { id: "carboncity", name: "Carbon City", scene: "carboncity", col: 5, row: 2, badge: "carboncity", icon: "⚽", seen: "carboncity" }
    ];

    const ROADS = [
        ["valley", "silicon"], ["valley", "metal"], ["valley", "ion"], ["ion", "ioneast"],
        ["valley", "glucose"], ["glucose", "neuro"], ["neuro", "pdms"], ["pdms", "energy"],
        ["energy", "carboncity", "tram"]
    ];

    // the outdoor scene a scene belongs to (interiors exit to it)
    function outdoorOf(id) {
        const sc = SCENES[id];
        return sc && sc.exitTo ? sc.exitTo.scene : id;
    }

    function townOf(id) {
        return TOWNS.find((t) => t.scene === outdoorOf(id)) || TOWNS[1];
    }

    function markVisited() {
        save.visited = save.visited || {};
        save.visited[townOf(scene.id).id] = true;
    }

    function townSeen(t) {
        return t.id === "valley" || !!(save.visited && save.visited[t.id]) || !!save.badges[t.badge] || !!(t.seen && save[t.seen]);
    }

    function roadLocked(a, b, kind) {
        if (kind === "tram") {
            return !(save.energy && save.energy.powered);
        }
        const ta = TOWNS.find((t) => t.id === a);
        const tb = TOWNS.find((t) => t.id === b);
        const edgesTo = (from, to) => Object.values((SCENES[from.scene] || {}).edges || {}).filter((e) => e.scene === to.scene);
        return edgesTo(ta, tb).concat(edgesTo(tb, ta)).some((e) => e.locked && e.locked());
    }

    function openMap() {
        const here = townOf(scene.id);
        const inside = scene.id !== here.scene;
        const m = openModal(`
            <div class="adv-panel-head">
                <span class="adv-type map">🗺️ Map</span>
                <h2>Map of the region</h2>
                <button type="button" class="adv-close" data-close aria-label="Close">✕</button>
            </div>
            <p class="adv-lead">You are in <strong>${scene.label || here.name}</strong>${inside ? `, inside ${here.name}` : ""}. Roads with a 🔒 open when you earn the certificate they ask for.</p>
            <canvas id="mapWorld" width="460" height="230" class="adv-wide-canvas" aria-label="World map"></canvas>
            <p class="adv-round">Close-up: ${scene.label || here.name}</p>
            <canvas id="mapHere" width="460" height="230" class="adv-wide-canvas" aria-label="Map of this area"></canvas>
            <p class="adv-keys">Press M any time to open the map.</p>`);

        const c = $("mapWorld").getContext("2d");
        const pos = (t) => [48 + t.col * 73, 44 + t.row * 70];

        function drawWorld(now) {
            c.fillStyle = "#14361f";
            c.fillRect(0, 0, 460, 230);
            // the coast on the west
            c.fillStyle = "#2f7fd6";
            c.fillRect(0, 0, 14, 230);
            c.fillStyle = "#ecd9a0";
            c.fillRect(14, 0, 8, 230);
            ROADS.forEach(([a, b, kind]) => {
                const ta = TOWNS.find((t) => t.id === a);
                const tb = TOWNS.find((t) => t.id === b);
                const [x1, y1] = pos(ta);
                const [x2, y2] = pos(tb);
                const locked = roadLocked(a, b, kind);
                c.strokeStyle = kind === "tram" ? "#ffb84a" : "#d9bb7f";
                c.lineWidth = kind === "tram" ? 3 : 5;
                c.setLineDash(kind === "tram" ? [6, 5] : []);
                c.globalAlpha = locked ? 0.4 : 1;
                c.beginPath();
                c.moveTo(x1, y1);
                c.lineTo(x2, y2);
                c.stroke();
                c.setLineDash([]);
                c.globalAlpha = 1;
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                if (locked) {
                    c.font = "12px sans-serif";
                    c.textAlign = "center";
                    c.textBaseline = "middle";
                    c.fillText("🔒", mx, my);
                } else if (kind === "tram") {
                    c.font = "11px sans-serif";
                    c.textAlign = "center";
                    c.textBaseline = "middle";
                    c.fillText("🚋", mx + 12, my);
                }
            });
            TOWNS.forEach((t) => {
                const [x, y] = pos(t);
                const seen = townSeen(t);
                const isHere = t === here;
                if (isHere) {
                    const k = (Math.sin(now / 250) + 1) / 2;
                    c.fillStyle = `rgba(255, 216, 74, ${0.25 + 0.3 * k})`;
                    c.beginPath();
                    c.arc(x, y, 22 + 4 * k, 0, Math.PI * 2);
                    c.fill();
                }
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.arc(x, y, 17, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = seen ? "#e8edf6" : "#5d6577";
                c.beginPath();
                c.arc(x, y, 15, 0, Math.PI * 2);
                c.fill();
                c.font = "15px sans-serif";
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.globalAlpha = save.badges[t.badge] ? 1 : 0.35;
                c.fillText(seen ? t.icon : "?", x, y + 1);
                c.globalAlpha = 1;
                c.font = `${isHere ? "bold " : ""}9px sans-serif`;
                c.textBaseline = "alphabetic";
                const name = seen ? t.name : "???";
                const tw = c.measureText(name).width + 8;
                c.fillStyle = "rgba(11, 16, 32, 0.8)";
                c.fillRect(x - tw / 2, y + 20, tw, 12);
                c.fillStyle = isHere ? "#ffd84a" : seen ? "#f5f7ff" : "#a9b2d0";
                c.fillText(name, x, y + 29);
            });
            // you are here: the player's sprite above the town
            const [hx, hy] = pos(here);
            const ch = currentChar();
            if (ch) {
                drawPerson(c, hx + 10, hy - 34 + Math.round(Math.sin(now / 200) * 1.5), ch.look, "down", 0, 1);
            }
            c.font = "bold 9px sans-serif";
            c.fillStyle = "#ffd84a";
            c.textAlign = "left";
            c.fillText("YOU", hx - 22, hy - 20);
            c.textAlign = "left";
            c.fillStyle = "rgba(11, 16, 32, 0.8)";
            c.fillRect(250, 4, 206, 26);
            c.fillStyle = "#a9b2d0";
            c.font = "9px sans-serif";
            c.fillText("faded icon = certificate not earned yet", 256, 15);
            c.fillText("??? = not visited · 🚋 = tram", 256, 26);
        }

        // close-up of the current scene, one cell per tile
        const h = $("mapHere").getContext("2d");
        const cell = 11;
        const ox = (460 - COLS * cell) / 2;
        const oy = (230 - ROWS * cell) / 2;
        const TILE_COL = { T: "#1f6b34", w: "#2f7fd6", v: "#8a5a3b", p: "#d9bb7f", D: "#ffd84a", E: "#ffd84a", B: "#8f98aa", W: "#3b4458", s: "#ecd9a0", k: "#8a5a3b", r: "#8f98aa", L: "#5d6577", h: "#cdd3df", m: "#b8c0cf", f: "#4fa65a", S: "#c89a5b" };

        function drawHere(now) {
            h.fillStyle = "#0b1020";
            h.fillRect(0, 0, 460, 230);
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const ch = tileAt(scene, x, y);
                    h.fillStyle = TILE_COL[ch] || (scene.floor && !scene.outdoor ? scene.floor : "#4fa65a");
                    h.fillRect(ox + x * cell, oy + y * cell, cell - 1, cell - 1);
                }
            }
            (scene.objects || []).filter(objectIsActive).forEach((o) => {
                h.fillStyle = "rgba(26, 32, 51, 0.75)";
                h.fillRect(ox + o.x * cell, oy + o.y * cell, o.w * cell - 1, o.h * cell - 1);
            });
            h.font = "bold 8px sans-serif";
            h.textAlign = "center";
            h.textBaseline = "middle";
            (scene.buildings || []).forEach((b) => {
                h.fillStyle = "#1a2033";
                h.fillText(b.sign, ox + (b.x + b.w / 2) * cell, oy + (b.y + 1.5) * cell);
            });
            (scene.objects || []).filter((o) => objectIsActive(o) && o.label).forEach((o) => {
                h.fillStyle = "#f5f7ff";
                h.fillText(o.label, ox + (o.x + o.w / 2) * cell, oy + (o.y - 0.4) * cell);
            });
            (scene.npcs || []).forEach((n) => {
                h.fillStyle = "#54e0c7";
                h.beginPath();
                h.arc(ox + (n.x + 0.5) * cell, oy + (n.y + 0.5) * cell, 3, 0, Math.PI * 2);
                h.fill();
            });
            const k = (Math.sin(now / 200) + 1) / 2;
            h.fillStyle = `rgba(255, 216, 74, ${0.35 + 0.4 * k})`;
            h.beginPath();
            h.arc(ox + (player.x + 0.5) * cell, oy + (player.y + 0.5) * cell, 7 + 2 * k, 0, Math.PI * 2);
            h.fill();
            h.fillStyle = "#ff6b7d";
            h.beginPath();
            h.arc(ox + (player.x + 0.5) * cell, oy + (player.y + 0.5) * cell, 4, 0, Math.PI * 2);
            h.fill();
            h.textBaseline = "alphabetic";
            h.textAlign = "left";
            h.fillStyle = "#a9b2d0";
            h.font = "9px sans-serif";
            h.fillText("● you   ● people", 8, 224);
            h.fillStyle = "#ff6b7d";
            h.fillText("●", 8, 224);
        }

        const loop = () => ui.animate(m, 60000, (k, now) => {
            drawWorld(now);
            drawHere(now);
        }, loop);
        loop();
    }

    extraKeys.KeyM = openMap;


    /* ---------- Certificates ----------
       Beating a town's boss (or finishing its fab) earns a
       Certificate of Completion, signed by that town's doctor.
       Listed in play order; the ids are the save.badges keys. */

    const CERTS = [
        { id: "silicon", town: "Silicon Beach", doc: "Dr. Silica", icon: "💠", what: "turning beach sand into a tested silicon wafer and beating the Impurity Kraken" },
        { id: "foundry", town: "the Sand to Chip Foundry", doc: "Dr. Ingot", icon: "🏅", what: "mastering the spin coater and the mask aligner" },
        { id: "mems", town: "MEMS Works", doc: "Dr. Ingot", icon: "🏆", what: "deep reactive ion etching and beating The Undercut" },
        { id: "metal", town: "Metal City", doc: "Dr. MOS", icon: "🔩", what: "building an n-channel MOSFET and beating The Leakage Phantom" },
        { id: "carbon", town: "Ion City", doc: "Dr. Carbon", icon: "💎", what: "fabricating a glassy carbon ISFET in the Ion Lab" },
        { id: "echem", town: "the Ion City Echem Lab", doc: "Dr. Redox", icon: "🔋", what: "electrochemical testing and beating The Biofouler" },
        { id: "glucose", town: "Glucose Grove", doc: "Dr. Dex", icon: "🩸", what: "building continuous glucose sensors and beating The Sugar Spike" },
        { id: "neuro", town: "Grey Matter", doc: "Dr. Axon", icon: "🧠", what: "building neurochemical probes and beating The Glial Scar" },
        { id: "pdms", town: "PDMS City", doc: "Dr. Silox", icon: "🧫", what: "building organ-on-a-chip devices and beating The Bubble Beast" },
        { id: "energy", town: "Ampfield", doc: "Dr. Charge", icon: "⚡", what: "building a supercapacitor bank and beating The Short Circuit" },
        { id: "carboncity", town: "Carbon City", doc: "Dr. Bucky", icon: "⚽", what: "exploring carbon's structures and beating The Soot Golem" }
    ];

    function certificate(id) {
        const c = CERTS.find((x) => x.id === id);
        const ch = currentChar();
        if (!c) {
            return "";
        }
        return `
            <div class="adv-cert">
                <span class="adv-cert-seal" aria-hidden="true">${c.icon}</span>
                <p class="adv-cert-title">Certificate of Completion</p>
                <p class="adv-cert-body">This certifies that <strong>${ch ? ch.name : "our engineer"}</strong> has completed ${c.what} at ${c.town}.</p>
                <div class="adv-cert-sign">
                    <span class="adv-cert-signature">${c.doc}</span>
                    <span class="adv-cert-role">${c.doc}, ${c.town.replace(/^the /, "")}</span>
                </div>
            </div>`;
    }

    function openCertificates() {
        const earned = CERTS.filter((c) => save.badges[c.id]);
        openModal(`
            <div class="adv-panel-head">
                <span class="adv-type cert">📜 Certificates</span>
                <h2>Your certificates</h2>
                <button type="button" class="adv-close" data-close aria-label="Close">✕</button>
            </div>
            <p class="adv-lead">Each town's doctor signs a Certificate of Completion when you finish their challenge. ${earned.length} of ${CERTS.length} earned.</p>
            ${earned.map((c) => certificate(c.id)).join("")}
            ${earned.length < CERTS.length ? `<p class="adv-round">Still to earn</p><ul class="adv-items">${CERTS.filter((c) => !save.badges[c.id]).map((c) => `
                <li class="adv-item empty">
                    <span class="adv-item-icon" aria-hidden="true">${c.icon}</span>
                    <span class="adv-item-text"><strong>${c.town.replace(/^the /, "").replace(/^./, (x) => x.toUpperCase())}</strong><small>From ${c.doc}: ${c.what}.</small></span>
                </li>`).join("")}</ul>` : ""}`);
    }

    // Station widgets shared by the town files.
    const ui = {

        chips(name, options, selected) {
            return `<div class="adv-chips" role="radiogroup" aria-label="${name}">` + options.map((o) => `
                <button type="button" class="adv-chip${o.id === selected ? " on" : ""}" role="radio"
                    aria-checked="${o.id === selected}" data-chip="${name}" data-val="${o.id}">${o.label}</button>`).join("") + "</div>";
        },

        wireChips(name, onPick) {
            const btns = modalBody.querySelectorAll(`[data-chip="${name}"]`);
            btns.forEach((b) => {
                b.addEventListener("click", () => {
                    btns.forEach((x) => {
                        x.classList.toggle("on", x === b);
                        x.setAttribute("aria-checked", x === b);
                    });
                    snd("select");
                    onPick(b.dataset.val);
                });
            });
        },

        slider(id, labelText, unit, min, max, step, value) {
            return `
                <label for="${id}">${labelText}: <strong id="${id}Out">${value}</strong> ${unit}</label>
                <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">`;
        },

        wireSlider(id, fmt, onChange) {
            const el = document.getElementById(id);
            const out = document.getElementById(id + "Out");
            const update = () => {
                out.textContent = fmt ? fmt(Number(el.value)) : el.value;
                if (onChange) {
                    onChange(Number(el.value));
                }
            };
            el.addEventListener("input", update);
            update();
            return el;
        },

        result(id, html, good) {
            const el = document.getElementById(id);
            el.className = "adv-result" + (good === true ? " good" : good === false ? " bad" : "");
            el.innerHTML = html;
            if (good === true || good === false) {
                snd(good ? "correct" : "wrong");
            }
        },

        // Line/point plot. series: [{ pts: [[x, y]], color, dots }]; k draws a fraction.
        plot(c, W, H, series, o, k) {
            c.clearRect(0, 0, W, H);
            c.fillStyle = "#0b1020";
            c.fillRect(0, 0, W, H);
            const L = 54;
            const R = 14;
            const T = 14;
            const B = 34;
            const y0 = o.y0;
            const y1 = o.y1;
            const sx = (x) => L + (x - o.x0) / (o.x1 - o.x0) * (W - L - R);
            const sy = (y) => T + (y1 - y) / (y1 - y0) * (H - T - B);
            (o.bands || []).forEach((b) => {
                c.fillStyle = b.color;
                c.fillRect(L, sy(b.hi), W - L - R, sy(b.lo) - sy(b.hi));
            });
            c.strokeStyle = "#2c365a";
            c.lineWidth = 1;
            c.strokeRect(L, T, W - L - R, H - T - B);
            c.fillStyle = "#a9b2d0";
            c.font = "11px sans-serif";
            c.textAlign = "center";
            c.fillText(o.xLabel, (L + W - R) / 2, H - 6);
            (o.xTicks || [o.x0, o.x1]).forEach((x) => c.fillText(o.fmtX ? o.fmtX(x) : String(x), sx(x), H - 20));
            c.save();
            c.translate(14, (T + H - B) / 2);
            c.rotate(-Math.PI / 2);
            c.fillText(o.yLabel, 0, 0);
            c.restore();
            c.textAlign = "right";
            (o.yTicks || [y0, y1]).forEach((y) => c.fillText(String(y), L - 4, sy(y) + 4));
            series.forEach((s) => {
                const n = Math.max(1, Math.ceil(s.pts.length * (k === undefined ? 1 : k)));
                c.strokeStyle = s.color;
                c.fillStyle = s.color;
                c.lineWidth = 2;
                if (s.dots) {
                    s.pts.slice(0, n).forEach(([x, y]) => {
                        c.beginPath();
                        c.arc(sx(x), sy(y), 4, 0, Math.PI * 2);
                        c.fill();
                    });
                    return;
                }
                c.beginPath();
                s.pts.slice(0, n).forEach(([x, y], i) => (i ? c.lineTo(sx(x), sy(Math.max(y0, Math.min(y1, y)))) : c.moveTo(sx(x), sy(Math.max(y0, Math.min(y1, y))))));
                c.stroke();
            });
        },

        // Runs frame(k, now) for dur ms unless the modal closes first.
        animate(m, dur, frame, done) {
            const start = performance.now();
            const tick = (now) => {
                if (m.dead) {
                    return;
                }
                const k = Math.min(1, (now - start) / dur);
                frame(k, now);
                if (k < 1) {
                    requestAnimationFrame(tick);
                } else if (done) {
                    done();
                }
            };
            requestAnimationFrame(tick);
        }
    };

    const api = {
        TILE: TILE,
        COLS: COLS,
        ROWS: ROWS,
        SCENES: SCENES,
        TYPES: TYPES,
        save: () => save,
        currentChar: currentChar,
        level: level,
        writeSave: writeSave,
        updateHud: updateHud,
        gainXP: gainXP,
        awardSiteXP: awardSiteXP,
        toast: toast,
        say: say,
        openModal: openModal,
        closeModal: closeModal,
        head: head,
        focusFirst: focusFirst,
        modalBody: () => modalBody,
        afterModal: (fn) => { pendingAfterModal = fn; },
        drawPerson: drawPerson,
        drawWorldTile: drawWorldTile,
        shade: shade,
        rect: rect,
        box: box,
        label: label,
        hash: hash,
        interiorRows: interiorRows,
        openBattle: openBattle,
        ui: ui,
        sceneId: () => scene.id,
        registerRecipe: (r) => {
            recipes.push(r);
            refreshRecipe();
        },
        refreshRecipe: refreshRecipe,
        keys: extraKeys,
        // move the player to another scene (trams, warps)
        goTo: (id, x, y, dir) => changeScene(id, x, y, dir || "down"),
        certificate: certificate,
        bag: {
            ITEMS: ITEMS,
            count: bagCount,
            give: giveItem,
            pay: payStep,
            stockroom: stockroom,
            pickup: pickup,
            open: openBag
        }
    };

    (window.FabAdventureExtensions || []).forEach((ext) => ext(api));


    /* ---------- DOM ---------- */

    const $ = (id) => document.getElementById(id);

    const canvas = $("advCanvas");
    const ctx = canvas.getContext("2d");
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const dialogEl = $("advDialog");
    const dialogSpeakerEl = $("advDialogSpeaker");
    const dialogTextEl = $("advDialogText");
    const promptEl = $("advPrompt");
    const locationEl = $("advLocation");
    const fadeEl = $("advFade");
    const toastsEl = $("advToasts");
    const modalEl = $("advModal");
    const modalBody = $("advModalBody");


    /* ---------- State ---------- */

    let scene = SCENES[save.scene] || SCENES.world;

    const player = {
        x: save.x,
        y: save.y,
        tx: save.x,
        ty: save.y,
        dir: save.dir || "up",
        moving: false,
        t: 0,
        steps: 0
    };

    if (isBlocked(scene, player.x, player.y)) {
        scene = SCENES.world;
        player.x = player.tx = 10;
        player.y = player.ty = 12;
    }

    // walk | dialog | modal | transition
    let mode = "walk";

    const held = [];

    const DIRS = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
    };


    /* ---------- Map helpers ---------- */

    function inRect(o, x, y) {
        return x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h;
    }

    function tileAt(sc, x, y) {
        return (sc.grid[y] && sc.grid[y][x]) || "T";
    }

    function isBlocked(sc, x, y) {

        if (x < 0 || y < 0 || x >= COLS || y >= ROWS) {
            return true;
        }

        if ((sc.solid || "TwBSW").includes(tileAt(sc, x, y))) {
            return true;
        }

        if (sc.objects.some((o) => objectIsActive(o) && inRect(o, x, y))) {
            return true;
        }

        return (sc.npcs || []).some((n) => n.x === x && n.y === y);
    }

    function facingTile() {
        const d = DIRS[player.dir];
        return [player.x + d[0], player.y + d[1]];
    }

    function thingAt(x, y) {

        const npc = (scene.npcs || []).find((n) => n.x === x && n.y === y);
        if (npc) {
            return { kind: "npc", npc: npc };
        }

        const sign = (scene.signs || []).find((s) => s.x === x && s.y === y);
        if (sign) {
            return { kind: "sign", sign: sign };
        }

        const obj = scene.objects.find((o) => objectIsActive(o) && inRect(o, x, y));
        if (obj) {
            return { kind: "object", obj: obj };
        }

        return null;
    }

    function promptFor(thing) {

        if (!thing) {
            return "";
        }

        if (thing.kind === "npc") {
            return "A: Talk to " + thing.npc.name;
        }

        if (thing.kind === "sign") {
            return "A: Read sign";
        }

        const o = thing.obj;

        if (o.prompt) {
            return typeof o.prompt === "function" ? o.prompt() : o.prompt;
        }

        if (o.machine) {
            return "A: Use " + MACHINES[o.machine].name;
        }

        if (o.kind === "boss") {
            return save.bossBeaten ? "A: Inspect" : "A: Battle The Undercut";
        }

        return "A: Look";
    }


    /* ---------- Movement ---------- */

    function tryStep(dir) {

        const d = DIRS[dir];
        const nx = player.x + d[0];
        const ny = player.y + d[1];

        player.dir = dir;

        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) {

            const edge = scene.edges && scene.edges[dir];

            if (edge) {
                held.length = 0;
                if (edge.locked && edge.locked()) {
                    say(edge.lockedText);
                } else {
                    changeScene(edge.scene, edge.x, edge.y, dir);
                }
            }
            return;
        }

        if (scene.buildings && tileAt(scene, nx, ny) === "D") {

            const b = scene.buildings.find((bb) => bb.door.x === nx && bb.door.y === ny);

            if (b && b.locked()) {
                held.length = 0;
                say(b.lockedText || [
                    "The door to MEMS Works is locked.",
                    "A note says: \"Foundry Certificate holders only.\" Master both machines in the Sand to Chip Foundry first."
                ]);
                return;
            }
        }

        if (isBlocked(scene, nx, ny)) {
            return;
        }

        player.tx = nx;
        player.ty = ny;
        player.t = 0;
        player.moving = true;
        snd("step");
        player.steps++;
    }

    function onArrive() {

        const ch = tileAt(scene, player.x, player.y);

        if (scene.buildings && ch === "D") {
            const b = scene.buildings.find((bb) => bb.door.x === player.x && bb.door.y === player.y);
            const at = b.enter || { x: 9, y: 13 };
            changeScene(b.scene || b.id, at.x, at.y, "up");
            return;
        }

        if (ch === "E" && scene.exitTo) {
            const ex = scene.exitTo;
            changeScene(ex.scene, ex.x, ex.y, "down");
            return;
        }

        writeSave();
    }

    let locationTimer = 0;

    // Name the place on arrival, then get out of the way.
    function showLocation() {
        locationEl.textContent = scene.label;
        locationEl.classList.remove("faded");
        clearTimeout(locationTimer);
        locationTimer = setTimeout(() => locationEl.classList.add("faded"), 3500);
    }

    function changeScene(id, x, y, dir) {

        mode = "transition";
        held.length = 0;
        fadeEl.classList.add("on");
        snd("door");

        setTimeout(() => {

            scene = SCENES[id];
            player.x = player.tx = x;
            player.y = player.ty = y;
            player.dir = dir;
            player.moving = false;
            markVisited();
            updateMusic();
            showLocation();
            writeSave();

            fadeEl.classList.remove("on");

            setTimeout(() => {
                mode = "walk";
            }, 200);

        }, 260);
    }


    /* ---------- Dialog ---------- */

    let dialogQueue = [];
    let dialogDone = null;

    function say(lines, speaker, done) {

        dialogQueue = lines.slice();
        dialogDone = done || null;
        dialogSpeakerEl.textContent = speaker || "";
        mode = "dialog";
        held.length = 0;
        dialogEl.hidden = false;
        nextLine();
    }

    function nextLine() {

        if (!dialogQueue.length) {

            dialogEl.hidden = true;
            mode = "walk";

            const done = dialogDone;
            dialogDone = null;

            if (done) {
                done();
            }
            return;
        }

        dialogTextEl.textContent = dialogQueue.shift();
        snd("blip");
    }

    dialogEl.addEventListener("click", () => {
        if (mode === "dialog") {
            nextLine();
        }
    });


    /* ---------- Interaction ---------- */

    function interact() {

        const f = facingTile();
        const thing = thingAt(f[0], f[1]);

        if (!thing) {
            return;
        }

        if (thing.kind === "npc") {
            const n = thing.npc;
            n.dir = opposite(player.dir);
            const talk = n.talk();
            if (Array.isArray(talk)) {
                say(talk, n.name);
            } else {
                say(talk.lines, n.name, talk.done);
            }
            return;
        }

        if (thing.kind === "sign") {
            say(thing.sign.lines, "Sign");
            return;
        }

        const o = thing.obj;

        if (o.use) {
            o.use();
        } else if (o.machine === "spin") {
            if (payStep(machineState("spin"), "spin", [["wafer", 1], ["s1813", 1]])) {
                openSpin();
            }
        } else if (o.machine === "align") {
            openAlign();
        } else if (o.machine === "drie") {
            if (payStep(machineState("drie"), "drie", [["wafer", 1]])) {
                openDrie();
            }
        } else if (o.kind === "boss") {
            if (save.bossBeaten) {
                say(["A clean trench with straight walls. The Undercut is gone for good."]);
            } else {
                say(
                    ["The Undercut snarls and chews sideways into a wafer!", "Get ready to battle!"],
                    "",
                    () => openBattle()
                );
            }
        } else if (o.lines) {
            say(o.lines);
        }
    }

    function opposite(dir) {
        return { up: "down", down: "up", left: "right", right: "left" }[dir];
    }

    function pressA() {

        if (mode === "dialog") {
            nextLine();
        } else if (mode === "walk" && !player.moving) {
            interact();
        }
    }


    /* ---------- Input ---------- */

    const KEY_DIRS = {
        ArrowUp: "up", KeyW: "up",
        ArrowDown: "down", KeyS: "down",
        ArrowLeft: "left", KeyA: "left",
        ArrowRight: "right", KeyD: "right"
    };

    function isTyping(el) {
        return el && el.matches && el.matches("input, textarea, select");
    }

    document.addEventListener("keydown", (e) => {

        if (mode === "modal") {
            if (activeModal && activeModal.onKey) {
                activeModal.onKey(e);
            }
            if (e.key === "Escape" && activeModal && activeModal.closable) {
                closeModal();
            }
            return;
        }

        if (isTyping(e.target)) {
            return;
        }

        const dir = KEY_DIRS[e.code];

        if (dir) {
            e.preventDefault();
            if (!held.includes(dir)) {
                held.push(dir);
            }
            return;
        }

        if (extraKeys[e.code] && mode === "walk" && !e.repeat) {
            e.preventDefault();
            extraKeys[e.code]();
            return;
        }

        if (e.code === "Space" || e.code === "Enter" || e.code === "KeyZ") {

            if (e.target.closest && e.target.closest("button, a") && e.target.id !== "advA") {
                return;
            }

            e.preventDefault();

            if (!e.repeat) {
                pressA();
            }
        }
    });

    document.addEventListener("keyup", (e) => {
        const dir = KEY_DIRS[e.code];
        const i = held.indexOf(dir);
        if (i >= 0) {
            held.splice(i, 1);
        }
    });

    window.addEventListener("blur", () => {
        held.length = 0;
    });

    document.querySelectorAll(".adv-pad-btn").forEach((btn) => {

        const dir = btn.dataset.dir;

        const release = () => {
            btn.classList.remove("pressed");
            const i = held.indexOf(dir);
            if (i >= 0) {
                held.splice(i, 1);
            }
        };

        btn.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            btn.setPointerCapture(e.pointerId);
            btn.classList.add("pressed");
            if (!held.includes(dir)) {
                held.push(dir);
            }
        });

        btn.addEventListener("pointerup", release);
        btn.addEventListener("pointercancel", release);
        btn.addEventListener("lostpointercapture", release);
    });

    $("advA").addEventListener("click", pressA);

    /*
       Restart offers the process for the town you're standing in
       (back to step 1, keeping level, certificates and best scores),
       or wiping the whole game.
    */
    function openRestart() {

        if (mode !== "walk") {
            return;
        }

        const here = recipes.find((r) => r.restart && r.available() && r.scenes.includes(scene.id));
        const step = here ? here.progress() : 0;

        openModal(`
            <p class="eyebrow">RESTART</p>
            <h2>What do you want to restart?</h2>
            ${here ? `
                <div class="adv-takeaway">
                    <p><strong>${here.label}</strong></p>
                    <p>${step ? `You're on step ${Math.min(step + 1, here.total)} of ${here.total}.` : "You're at step 1 already."} This scraps the current run and sends you back to step 1. You keep your level, XP, certificates and best scores.</p>
                    <button type="button" class="adv-btn" id="rsProc" data-autofocus${step ? "" : " disabled"}>↺ Restart this process</button>
                </div>` : `
                <div class="adv-takeaway">
                    <p>No process is running around here. In a town with a recipe (Ion City, Silicon Beach or Glucose Grove), this button restarts just that process.</p>
                </div>`}
            <div class="adv-takeaway">
                <p><strong>The whole game</strong></p>
                <p>Erases your character, level, certificates and every town's progress.</p>
                <button type="button" class="adv-btn secondary" id="rsAll">Restart the whole game</button>
            </div>
            <div class="adv-button-row"><button type="button" class="adv-btn secondary" data-close>Cancel</button></div>`);

        const proc = $("rsProc");
        if (proc) {
            proc.addEventListener("click", () => {
                here.restart();
                closeModal();
                toast("Fresh start: back to step 1");
            });
        }

        $("rsAll").addEventListener("click", () => {
            if (!window.confirm("Restart your whole Fab Valley adventure? Your level, certificates and character will be erased.")) {
                return;
            }
            try {
                localStorage.removeItem(SAVE_KEY);
            } catch (e) { /* ignore */ }
            window.location.reload();
        });
    }

    $("advReset").addEventListener("click", openRestart);

    /*
       Full screen covers the whole page (not just the game frame), so
       the station pop-ups, which live outside the frame, still show.
       CSS (body.adv-fs) hides the site header and grows the frame.
    */
    const fullBtn = $("advFull");
    let expanded = false;

    function setExpanded(on) {
        expanded = on;
        document.body.classList.toggle("adv-fs", on);
        fullBtn.textContent = on ? "✕ Exit full screen" : "⛶ Full screen";
    }

    // Real full screen where the browser allows it; otherwise (embedded
    // browsers, some phones) just fill the window with the game.
    function toggleFullScreen() {
        const root = document.documentElement;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (expanded) {
            setExpanded(false);
        } else if (root.requestFullscreen) {
            root.requestFullscreen().catch(() => setExpanded(true));
            // some embedded browsers neither grant nor refuse; don't leave the player waiting
            setTimeout(() => {
                if (!document.fullscreenElement && !expanded) {
                    setExpanded(true);
                }
            }, 500);
        } else {
            setExpanded(true);
        }
    }

    fullBtn.addEventListener("click", toggleFullScreen);
    extraKeys.KeyF = toggleFullScreen;
    extraKeys.Escape = () => {
        if (expanded && !document.fullscreenElement) {
            setExpanded(false);
        }
    };

    document.addEventListener("fullscreenchange", () => setExpanded(!!document.fullscreenElement));


    /* ---------- Pixel drawing ---------- */

    function shade(hex, f) {
        const n = parseInt(hex.slice(1), 16);
        const r = Math.min(255, Math.round(((n >> 16) & 255) * f));
        const g = Math.min(255, Math.round(((n >> 8) & 255) * f));
        const b = Math.min(255, Math.round((n & 255) * f));
        return `rgb(${r},${g},${b})`;
    }

    function rect(c, x, y, w, h, color) {
        c.fillStyle = color;
        c.fillRect(x, y, w, h);
    }

    /*
       A cleanroom "bunny suit" engineer in a
       16 x 16 cell. frame 0 = standing,
       1 / 2 = alternating steps.
    */
    function drawPerson(c, ox, oy, look, dir, frame, s) {

        s = s || 1;

        const px = (x, y, w, h, color) => rect(c, ox + x * s, oy + y * s, w * s, h * s, color);

        const outline = "#1a2033";
        const suitDark = shade(look.suit, 0.78);
        const boot = "#3a4256";

        px(3, 14, 10, 2, "rgba(0,0,0,0.22)");

        // legs
        let leftUp = 0;
        let rightUp = 0;
        if (frame === 1) { leftUp = 1; }
        if (frame === 2) { rightUp = 1; }

        if (dir === "left" || dir === "right") {
            const shift = frame === 0 ? 0 : (frame === 1 ? -1 : 1);
            px(6 + shift, 11, 4, 4, outline);
            px(7 + shift, 12, 2, 3, boot);
        } else {
            px(4, 11, 4, 4 - leftUp, outline);
            px(8, 11, 4, 4 - rightUp, outline);
            px(5, 12, 2, 2 - leftUp, boot);
            px(9, 12, 2, 2 - rightUp, boot);
        }

        // body
        px(3, 6, 10, 7, outline);
        px(4, 7, 8, 5, look.suit);
        px(4, 9, 8, 1, look.accent);

        // arms
        if (dir === "left") {
            px(6, 8, 2, 3, suitDark);
        } else if (dir === "right") {
            px(8, 8, 2, 3, suitDark);
        } else {
            px(3, 7, 1, 4, suitDark);
            px(12, 7, 1, 4, suitDark);
        }

        // hood
        px(3, 0, 10, 7, outline);
        px(4, 1, 8, 5, look.suit);
        px(4, 5, 8, 1, suitDark);

        // face
        if (dir === "down") {
            px(5, 2, 6, 3, look.visor);
            px(6, 2, 2, 1, "rgba(255,255,255,0.75)");
        } else if (dir === "up") {
            px(5, 2, 6, 3, suitDark);
            px(7, 3, 2, 1, look.accent);
        } else if (dir === "left") {
            px(4, 2, 4, 3, look.visor);
            px(5, 2, 1, 1, "rgba(255,255,255,0.75)");
        } else {
            px(8, 2, 4, 3, look.visor);
            px(10, 2, 1, 1, "rgba(255,255,255,0.75)");
        }
    }

    /*
       The Undercut: a chunk of silicon whose
       mask overhangs a mouth it has eaten
       sideways. 32 x 32 units.
    */
    function drawUndercut(c, ox, oy, s, t) {

        const bob = Math.round(Math.sin(t / 350) * 1);
        const px = (x, y, w, h, color) => rect(c, ox + x * s, oy + (y + bob) * s, w * s, h * s, color);
        const blink = Math.floor(t / 2600) % 6 === 0 && (t % 2600) < 160;

        px(4, 30, 24, 2, "rgba(0,0,0,0.25)");

        // eye stalks
        px(9, 0, 7, 7, "#1a1030");
        px(18, 0, 7, 7, "#1a1030");
        px(10, 1, 5, 5, "#ffffff");
        px(19, 1, 5, 5, "#ffffff");
        if (blink) {
            px(10, 1, 5, 5, "#5b4a7a");
            px(19, 1, 5, 5, "#5b4a7a");
        } else {
            px(12, 3, 2, 2, "#e0233c");
            px(21, 3, 2, 2, "#e0233c");
        }
        px(9, 0, 6, 1, "#1a1030");
        px(20, 0, 6, 1, "#1a1030");

        // silicon body
        px(2, 9, 28, 21, "#1a1030");
        px(3, 10, 26, 19, "#6a5a8e");
        px(3, 24, 26, 5, "#584a78");

        // overhanging photoresist mask
        px(0, 6, 32, 5, "#1a1030");
        px(1, 7, 30, 3, "#e0613f");
        px(1, 7, 30, 1, "#ff8b63");

        // the undercut mouth, wider than the gap in the mask
        px(5, 11, 22, 9, "#120a1e");
        px(3, 12, 26, 6, "#120a1e");
        px(7, 20, 18, 2, "#120a1e");

        // teeth hanging from the mask lip
        for (let i = 0; i < 5; i++) {
            px(7 + i * 4, 11, 2, 3, "#f5f0e6");
        }
        px(9, 18, 2, 2, "#f5f0e6");
        px(15, 19, 2, 2, "#f5f0e6");
        px(21, 18, 2, 2, "#f5f0e6");

        // feet
        px(6, 29, 6, 2, "#1a1030");
        px(20, 29, 6, 2, "#1a1030");
    }

    function hash(x, y) {
        let h = x * 374761393 + y * 668265263;
        h = (h ^ (h >> 13)) * 1274126177;
        return ((h ^ (h >> 16)) >>> 0) % 100;
    }


    /* ---------- World rendering ---------- */

    function drawWorldTile(x, y, ch, t) {

        const X = x * TILE;
        const Y = y * TILE;
        const r = hash(x, y);

        // grass under everything
        rect(ctx, X, Y, TILE, TILE, "#4fa65a");
        if (r < 40) {
            rect(ctx, X + (r % 12) + 1, Y + (r % 7) + 3, 1, 2, "#3f8f4a");
            rect(ctx, X + ((r * 3) % 11) + 2, Y + ((r * 5) % 9) + 4, 1, 2, "#3f8f4a");
        }

        if (ch === "p" || ch === "D") {
            rect(ctx, X, Y, TILE, TILE, "#d9bb7f");
            if (r < 50) {
                rect(ctx, X + (r % 13) + 1, Y + (r % 11) + 2, 2, 1, "#c4a46a");
            }
        } else if (ch === "f") {
            const colors = ["#ff7aa2", "#ffe066", "#ffffff"];
            rect(ctx, X + 3, Y + 4, 2, 2, colors[r % 3]);
            rect(ctx, X + 10, Y + 9, 2, 2, colors[(r + 1) % 3]);
            rect(ctx, X + 6, Y + 12, 2, 2, colors[(r + 2) % 3]);
        } else if (ch === "w") {
            rect(ctx, X, Y, TILE, TILE, "#2f7fd6");
            const off = Math.floor(t / 300 + x * 2 + y) % 8;
            rect(ctx, X + off + 1, Y + 5, 5, 1, "#7cc0ff");
            rect(ctx, X + ((off + 5) % 10), Y + 11, 4, 1, "#7cc0ff");
        } else if (ch === "T") {
            rect(ctx, X + 6, Y + 11, 4, 5, "#6b4a2f");
            rect(ctx, X + 1, Y + 2, 14, 10, "#1f6b34");
            rect(ctx, X + 3, Y, 10, 13, "#1f6b34");
            rect(ctx, X + 3, Y + 2, 8, 6, "#2e8a45");
            rect(ctx, X + 4, Y + 2, 3, 2, "#4fb262");
        } else if (ch === "S") {
            rect(ctx, X + 7, Y + 8, 2, 8, "#6b4a2f");
            rect(ctx, X + 1, Y + 2, 14, 8, "#3b2a1a");
            rect(ctx, X + 2, Y + 3, 12, 6, "#c89a5b");
            rect(ctx, X + 4, Y + 5, 8, 1, "#6b4a2f");
            rect(ctx, X + 4, Y + 7, 6, 1, "#6b4a2f");
        }
    }

    function drawBuilding(b) {

        const X = b.x * TILE;
        const Y = b.y * TILE;
        const W = b.w * TILE;
        const H = b.h * TILE;

        // small two-tile houses put the name on the roof and windows lower on the wall
        const small = b.h <= 2;
        const signY = small ? 3 : 19;
        const winY = small ? 17 : 36;

        // walls
        rect(ctx, X, Y + 12, W, H - 12, "#1a2033");
        rect(ctx, X + 1, Y + 13, W - 2, H - 14, b.wall);

        // windows
        for (let i = 0; i < b.w; i++) {
            const wx = X + i * TILE + 4;
            if (i === b.door.x - b.x) {
                continue;
            }
            rect(ctx, wx, Y + winY, 8, 8, "#1a2033");
            rect(ctx, wx + 1, Y + winY + 1, 6, 6, "#ffe9a6");
            rect(ctx, wx + 1, Y + winY + 1, 6, 2, "#fff6d6");
        }

        // roof
        rect(ctx, X - 3, Y - 2, W + 6, 20, "#1a2033");
        rect(ctx, X - 2, Y - 1, W + 4, 18, b.roof);
        for (let i = 0; i < W + 4; i += 6) {
            rect(ctx, X - 2 + i, Y - 1, 3, 18, shade(b.roof, 0.85));
        }
        rect(ctx, X - 2, Y + 15, W + 4, 2, shade(b.roof, 0.6));

        // sign board
        ctx.font = "bold 7px sans-serif";
        const tw = Math.ceil(ctx.measureText(b.sign).width) + 8;
        const sx = X + Math.floor((W - tw) / 2);
        rect(ctx, sx, Y + signY, tw, 11, "#1a2033");
        rect(ctx, sx + 1, Y + signY + 1, tw - 2, 9, "#f7f4ea");
        ctx.fillStyle = "#1a2033";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(b.sign, X + W / 2, Y + signY + 6);

        // door
        const DX = b.door.x * TILE;
        const DY = b.door.y * TILE;
        rect(ctx, DX + 1, DY - 2, 14, 18, "#1a2033");
        rect(ctx, DX + 3, DY, 10, 16, "#3a4256");
        rect(ctx, DX + 3, DY, 10, 3, "#5b6680");
        rect(ctx, DX + 6, DY - 6, 4, 3, b.locked() ? "#ff4d5e" : "#5be38a");
    }

    function drawInteriorTile(x, y, ch) {

        const X = x * TILE;
        const Y = y * TILE;

        if (ch === "W") {
            rect(ctx, X, Y, TILE, TILE, "#5d6880");
            rect(ctx, X, Y, TILE, 3, "#7d88a2");
            if (y === 0) {
                rect(ctx, X, Y + 10, TILE, 6, "#4b556b");
                if (x % 3 === 1) {
                    rect(ctx, X + 2, Y + 4, 12, 5, "#9fd6ff");
                }
            }
            return;
        }

        if (ch === "E") {
            rect(ctx, X, Y, TILE, TILE, "#2a3448");
            rect(ctx, X + 1, Y + 1, TILE - 2, TILE - 2, "#3a4a66");
            rect(ctx, X + 3, Y + 6, 10, 1, "#5b6f95");
            rect(ctx, X + 3, Y + 9, 10, 1, "#5b6f95");
            return;
        }

        // raised-floor cleanroom tiles
        rect(ctx, X, Y, TILE, TILE, scene.floor);
        rect(ctx, X, Y, TILE, 1, shade(scene.floor, 0.9));
        rect(ctx, X, Y, 1, TILE, shade(scene.floor, 0.9));
        if ((x + y) % 2 === 0) {
            rect(ctx, X + 7, Y + 7, 2, 2, shade(scene.floor, 0.86));
        }
    }

    function box(x, y, w, h, color) {
        rect(ctx, x - 1, y - 1, w + 2, h + 2, "#1a2033");
        rect(ctx, x, y, w, h, color);
    }

    function label(text, cx, y) {
        ctx.font = "bold 7px sans-serif";
        const tw = Math.ceil(ctx.measureText(text).width) + 8;
        rect(ctx, cx - tw / 2, y, tw, 10, "rgba(11,16,32,0.85)");
        ctx.fillStyle = "#f5f7ff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, cx, y + 5.5);
    }

    function drawObject(o, t) {

        if (!objectIsActive(o)) {
            return;
        }

        const X = o.x * TILE;
        const Y = o.y * TILE;
        const W = o.w * TILE;
        const H = o.h * TILE;

        if (o.draw) {
            o.draw(ctx, X, Y, W, H, t);
            if (o.label) {
                label(o.label, X + W / 2, Y - 20 + (o.labelDy || 0));
            }
            return;
        }

        if (o.kind === "spin") {

            box(X + 2, Y + 2, W - 4, H - 3, "#dfe4ee");
            rect(ctx, X + 2, Y + 2, W - 4, 4, "#f2f5fa");

            const cx = X + W / 2;
            const cy = Y + 13;
            ctx.fillStyle = "#1a2033";
            ctx.beginPath();
            ctx.ellipse(cx, cy, 10, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#4b556b";
            ctx.beginPath();
            ctx.ellipse(cx, cy, 9, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#9aa6bb";
            ctx.beginPath();
            ctx.ellipse(cx, cy, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            const a = t / 120;
            rect(ctx, cx + Math.cos(a) * 4 - 1, cy + Math.sin(a) * 2 - 1, 2, 2, "#e0613f");

            rect(ctx, X + 6, Y + H - 9, 14, 5, "#2a3448");
            rect(ctx, X + 8, Y + H - 8, 2, 2, "#5be38a");
            rect(ctx, X + 12, Y + H - 8, 6, 2, "#4cc3ff");

        } else if (o.kind === "align") {

            box(X + 2, Y + 4, W - 4, H - 5, "#c9cfdb");
            rect(ctx, X + 2, Y + 4, W - 4, 3, "#e3e7ef");
            // stage
            rect(ctx, X + 8, Y + 16, W - 16, 6, "#8f98aa");
            ctx.fillStyle = "#9aa6bb";
            ctx.beginPath();
            ctx.arc(X + W / 2, Y + 19, 5, 0, Math.PI * 2);
            ctx.fill();
            // microscope head
            box(X + W / 2 - 8, Y - 4, 16, 10, "#3b4458");
            rect(ctx, X + W / 2 - 6, Y - 9, 3, 5, "#1a2033");
            rect(ctx, X + W / 2 + 3, Y - 9, 3, 5, "#1a2033");
            // UV lamp housing
            box(X + W - 16, Y - 2, 11, 9, "#5b4fa8");
            rect(ctx, X + W - 14, Y + 4, 7, 1, "#c9a6ff");

        } else if (o.kind === "drie") {

            box(X + 3, Y - 6, W - 6, H + 3, "#aab3c4");
            rect(ctx, X + 3, Y - 6, W - 6, 3, "#c8d0de");
            // plasma window
            const glow = 0.55 + 0.45 * Math.sin(t / 400);
            ctx.fillStyle = "#1a2033";
            ctx.beginPath();
            ctx.arc(X + W / 2, Y + 6, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(190, 110, 255, ${glow})`;
            ctx.beginPath();
            ctx.arc(X + W / 2, Y + 6, 6, 0, Math.PI * 2);
            ctx.fill();
            // gas lines
            rect(ctx, X + 6, Y - 12, 2, 7, "#8f98aa");
            rect(ctx, X + W - 8, Y - 12, 2, 7, "#8f98aa");
            rect(ctx, X + 6, Y + H - 9, W - 12, 4, "#2a3448");
            rect(ctx, X + 8, Y + H - 8, 3, 2, "#5be38a");

        } else if (o.kind === "bench") {

            box(X, Y + 2, W, H - 2, "#b8c2d2");
            for (let i = 0; i < o.w; i++) {
                rect(ctx, X + i * TILE + 3, Y + 5, 10, 6, "#4b556b");
                rect(ctx, X + i * TILE + 4, Y + 6, 8, 4, "#7cc0ff");
            }

        } else if (o.kind === "sem") {

            box(X + 2, Y + 10, W - 4, H - 11, "#c9cfdb");
            box(X + W / 2 - 5, Y - 10, 10, 22, "#e3e7ef");
            rect(ctx, X + W / 2 - 3, Y - 8, 6, 2, "#8f98aa");
            rect(ctx, X + 6, Y + 14, 12, 8, "#1a2033");
            rect(ctx, X + 7, Y + 15, 10, 6, "#5be38a");

        } else if (o.kind === "tape") {

            if (o.h > o.w) {
                for (let i = 0; i < H; i += 8) {
                    rect(ctx, X + 6, Y + i, 4, 4, "#ffd84a");
                    rect(ctx, X + 6, Y + i + 4, 4, 4, "#1a2033");
                }
            } else {
                for (let i = 0; i < W; i += 8) {
                    rect(ctx, X + i, Y + 6, 4, 4, "#ffd84a");
                    rect(ctx, X + i + 4, Y + 6, 4, 4, "#1a2033");
                }
                rect(ctx, X + W - 2, Y + 4, 2, 10, "#8f98aa");
            }

        } else if (o.kind === "boss") {

            if (save.bossBeaten) {
                box(X + 6, Y + 14, W - 12, 12, "#8f98aa");
                rect(ctx, X + 8, Y + 16, W - 16, 4, "#6a5a8e");
                rect(ctx, X + 13, Y + 16, 2, 8, "#1a2033");
                rect(ctx, X + 18, Y + 16, 2, 8, "#1a2033");
            } else {
                drawUndercut(ctx, X, Y - 2, 1, t);
            }
            return;
        }

        if (o.machine) {
            const m = MACHINES[o.machine];
            label((save.mastered[o.machine] ? "★ " : "") + m.name, X + W / 2, Y - 20);
        }
    }

    function render(t) {

        ctx.clearRect(0, 0, COLS * TILE, ROWS * TILE);

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const ch = scene.grid[y][x];
                if (scene.drawTile) {
                    scene.drawTile(ctx, x, y, ch, t);
                } else if (scene.outdoor) {
                    drawWorldTile(x, y, ch, t);
                } else {
                    drawInteriorTile(x, y, ch);
                }
            }
        }

        if (scene.buildings) {
            scene.buildings.forEach(drawBuilding);
        }

        // Things are drawn top to bottom so nearer ones overlap.
        const drawables = [];

        scene.objects.forEach((o) => {
            drawables.push({ y: o.y + o.h - 1, draw: () => drawObject(o, t) });
        });

        (scene.npcs || []).forEach((n) => {
            drawables.push({
                y: n.y,
                draw: () => n.draw
                    ? n.draw(ctx, n.x * TILE, n.y * TILE, t)
                    : drawPerson(ctx, n.x * TILE, n.y * TILE - 2, n.look, n.dir, 0)
            });
        });

        const ch = currentChar();
        if (ch) {
            const k = player.moving ? player.t : 0;
            const px = (player.x + (player.tx - player.x) * k) * TILE;
            const py = (player.y + (player.ty - player.y) * k) * TILE;
            const frame = player.moving && k < 0.55 ? 1 + (player.steps % 2) : 0;
            drawables.push({
                y: Math.max(player.y, player.ty),
                draw: () => drawPerson(ctx, Math.round(px), Math.round(py) - 2, ch.look, player.dir, frame)
            });
        }

        drawables.sort((a, b) => a.y - b.y).forEach((d) => d.draw());

        if (scene.tint) {
            rect(ctx, 0, 0, COLS * TILE, ROWS * TILE, scene.tint);
        }
    }

    let lastPrompt = null;

    function updatePrompt() {

        let text = "";

        if (mode === "walk" && !player.moving && currentChar()) {
            const f = facingTile();
            text = promptFor(thingAt(f[0], f[1]));
        }

        if (text !== lastPrompt) {
            lastPrompt = text;
            promptEl.textContent = text;
            promptEl.hidden = !text;
        }
    }


    /* ---------- Loop ---------- */

    let lastTime = performance.now();

    function update(dt) {

        if (player.moving) {

            player.t += dt / STEP_MS;

            if (player.t >= 1) {
                player.x = player.tx;
                player.y = player.ty;
                player.moving = false;
                player.t = 0;
                onArrive();
            }
        }

        if (!player.moving && mode === "walk" && held.length) {
            tryStep(held[held.length - 1]);
        }
    }

    function frame(now) {
        const dt = Math.min(50, now - lastTime);
        lastTime = now;
        update(dt);
        render(now);
        updatePrompt();
        requestAnimationFrame(frame);
    }


    /* ---------- HUD, XP, toasts ---------- */

    function updateHud() {

        const ch = currentChar();

        $("hudName").textContent = ch ? ch.name : "Fab Valley";
        $("hudTitle").textContent = ch ? ch.title : "Pick an engineer to begin";
        $("hudLevel").textContent = "Lv " + level();

        const into = save.xp % XP_PER_LEVEL;
        $("hudXpFill").style.width = (into / XP_PER_LEVEL * 100) + "%";
        $("hudXpText").textContent = `${into} / ${XP_PER_LEVEL} XP`;

        $("badgeFoundry").classList.toggle("earned", !!save.badges.foundry);
        $("badgeMems").classList.toggle("earned", !!save.badges.mems);
        $("badgeCarbon").classList.toggle("earned", !!save.badges.carbon);
        $("badgeEchem").classList.toggle("earned", !!save.badges.echem);
        $("badgeSilicon").classList.toggle("earned", !!save.badges.silicon);
        $("badgeGlucose").classList.toggle("earned", !!save.badges.glucose);
        $("badgeNeuro").classList.toggle("earned", !!save.badges.neuro);
        $("badgePdms").classList.toggle("earned", !!save.badges.pdms);
        $("badgeEnergy").classList.toggle("earned", !!save.badges.energy);
        $("badgeMetal").classList.toggle("earned", !!save.badges.metal);
        $("badgeCarbonCity").classList.toggle("earned", !!save.badges.carboncity);

        const av = $("hudAvatar").getContext("2d");
        av.clearRect(0, 0, 32, 32);
        if (ch) {
            drawPerson(av, 0, 0, ch.look, "down", 0, 2);
        }
    }

    function toast(text) {
        const el = document.createElement("div");
        el.className = "adv-toast";
        el.textContent = text;
        toastsEl.appendChild(el);
        setTimeout(() => el.remove(), 3300);
    }

    function gainXP(amount) {

        const before = level();
        save.xp += amount;
        writeSave();
        updateHud();
        toast(`+${amount} XP`);
        snd("xp");

        if (level() > before) {
            setTimeout(() => {
                toast(`Level up! You're now Lv ${level()}`);
                snd("levelup");
            }, 900);
        }
    }

    // Site-wide XP, once per achievement, same store as the other games.
    function awardSiteXP(key, xp) {
        if (window.SCGames) {
            window.SCGames.awardXP("fabPathAdventure_" + key, xp);
        }
    }

    // A loaded wafer stays in a machine until a run succeeds.
    function machineState(id) {
        save.machineRuns = save.machineRuns || {};
        save.machineRuns[id] = save.machineRuns[id] || { runs: 0 };
        return save.machineRuns[id];
    }

    function masterMachine(id) {

        const m = MACHINES[id];
        machineState(id).runs++;

        if (save.mastered[id]) {
            return { already: true, xp: 0, bonus: false };
        }

        const ch = currentChar();
        const bonus = !!ch && ch.type === m.type;
        const xp = Math.round(m.xp * (bonus ? 1.5 : 1));

        save.mastered[id] = true;
        gainXP(xp);
        awardSiteXP(id, m.xp);

        if (save.mastered.spin && save.mastered.align && !save.badges.foundry) {
            save.badges.foundry = true;
            writeSave();
            updateHud();
            pendingAfterModal = () => say([
                "📜 Dr. Ingot hands you the Foundry Certificate of Completion!",
                "The door to MEMS Works is unlocked. Head across the valley."
            ]);
        }

        return { already: false, xp: xp, bonus: bonus };
    }


    /* ---------- Modal ---------- */

    let activeModal = null;
    let pendingAfterModal = null;

    function openModal(html, opts) {

        snd("open");
        held.length = 0;
        mode = "modal";
        activeModal = Object.assign({ closable: true, dead: false }, opts || {});
        modalBody.innerHTML = html;
        modalEl.hidden = false;
        document.body.classList.add("adv-modal-open");
        modalBody.scrollTop = 0;
        focusFirst();
        return activeModal;
    }

    function focusFirst() {
        const el = modalBody.querySelector("[data-autofocus], .adv-btn, button");
        if (el) {
            el.focus({ preventScroll: true });
        }
    }

    function closeModal() {

        if (!activeModal) {
            return;
        }

        activeModal.dead = true;
        activeModal = null;
        modalEl.hidden = true;
        snd("close");
        if (battleActive) {
            battleActive = false;
            updateMusic();
        }
        modalBody.innerHTML = "";
        document.body.classList.remove("adv-modal-open");
        mode = "walk";
        $("advA").focus({ preventScroll: true });

        const after = pendingAfterModal;
        pendingAfterModal = null;

        if (after) {
            after();
        }
    }

    modalBody.addEventListener("click", (e) => {
        if (e.target.closest("[data-close]") && activeModal && activeModal.closable) {
            closeModal();
        }
    });

    function head(type, title, closable) {
        const ty = TYPES[type];
        return `
            <div class="adv-panel-head">
                <span class="adv-type ${type}">${ty.icon} ${ty.label}</span>
                <h2>${title}</h2>
                ${closable === false ? "" : '<button type="button" class="adv-close" data-close aria-label="Close">✕</button>'}
            </div>`;
    }

    function showMastery(id, takeaway) {

        const m = MACHINES[id];
        const res = masterMachine(id);

        modalBody.innerHTML = `
            <div class="adv-complete">
                <p class="eyebrow">${res.already ? "PRACTICE RUN COMPLETE" : "MACHINE MASTERED"}</p>
                <h2>${m.icon} ${m.name}</h2>
                <p class="adv-xp-big">${res.already ? "★ Mastered" : "+" + res.xp + " XP"}</p>
                ${res.bonus ? '<p class="adv-bonus">Specialty bonus ×1.5</p>' : ""}
                <div class="adv-takeaway">${takeaway}</div>
                <button type="button" class="adv-btn" data-close>Back to the floor</button>
            </div>`;
        modalBody.scrollTop = 0;
        focusFirst();
    }


    /* ---------- Character select ---------- */

    function openCharacterSelect() {

        const cards = CHARACTERS.map((c) => `
            <button type="button" class="adv-char" data-char="${c.id}">
                <canvas width="32" height="32" data-preview="${c.id}"></canvas>
                <span>
                    <strong>${c.name}</strong>
                    <span class="adv-type ${c.type}">${TYPES[c.type].icon} ${c.title}</span>
                    <small>${c.blurb}</small>
                </span>
            </button>`).join("");

        openModal(`
            <p class="eyebrow">FAB VALLEY</p>
            <h2>Choose your engineer</h2>
            <p class="adv-lead">Travel between fabrication facilities, run real cleanroom machines for XP and battle process defects. Your specialty earns bonus XP on matching machines and powers up one battle move.</p>
            <div class="adv-select-grid">${cards}</div>`, { closable: false });

        modalBody.querySelectorAll("[data-preview]").forEach((cv) => {
            const c = CHARACTERS.find((cc) => cc.id === cv.dataset.preview);
            drawPerson(cv.getContext("2d"), 0, 0, c.look, "down", 0, 2);
        });

        modalBody.querySelectorAll("[data-char]").forEach((btn) => {
            btn.addEventListener("click", () => {

                save.charId = btn.dataset.char;
                writeSave();
                updateHud();

                const c = currentChar();

                pendingAfterModal = () => say([
                    `Welcome to Silicon Beach, ${c.name}! Every chip in the world starts as sand like this.`,
                    "Every building is a working fab. Run the machines to earn XP, and beat each town's boss to earn a Certificate of Completion from its doctor.",
                    "Here's your bag 🎒 (press B). Fabs use up materials: wafers, photoresists, PDMS, electrolytes and more. Stockrooms and sparkles fill it back up.",
                    "No wafers yet? Then you make them! Talk to Dr. Silica on the beach. Walk with the arrows and press A (or Space) to talk or use a machine."
                ], "");

                activeModal.closable = true;
                closeModal();
            });
        });
    }


    /* ---------- Machine 1: spin coater ---------- */

    function openSpin() {

        const targets = [2.0, 1.5, 1.1];
        let round = 0;
        let misses = 0;
        let spinning = false;
        let coated = null;
        let angle = 0;

        const m = openModal(`
            ${head("litho", "Spin Coater")}
            <p class="adv-lead">Coat the wafer with photoresist at the target thickness. A faster spin flings off more resist, so the film gets thinner: thickness ∝ 1/√(spin speed).</p>
            <p class="adv-calib">Calibration for this resist: <strong>1.50 µm at 3000 rpm</strong>.</p>
            <div class="adv-machine">
                <canvas id="spinCanvas" width="220" height="220"></canvas>
                <div>
                    <p class="adv-round" id="spinRound"></p>
                    <p class="adv-target" id="spinTarget"></p>
                    <label for="spinRpm">Spin speed: <strong id="spinRpmOut">3000</strong> rpm</label>
                    <input type="range" id="spinRpm" min="500" max="6000" step="50" value="3000">
                    <div class="adv-button-row">
                        <button type="button" class="adv-btn" id="spinGo" data-autofocus>Spin</button>
                    </div>
                    <p class="adv-result" id="spinResult" aria-live="polite"></p>
                    <p class="adv-hint" id="spinHint" hidden>Hint: rpm = 3000 × (1.5 ÷ target)<sup>2</sup></p>
                </div>
            </div>`);

        const cv = $("spinCanvas");
        const c = cv.getContext("2d");
        const rpmIn = $("spinRpm");
        const goBtn = $("spinGo");
        const result = $("spinResult");

        function thicknessColor(th) {
            // thicker resist reads as a deeper amber
            const k = Math.max(0, Math.min(1, (th - 0.8) / 2));
            const r = 240 - k * 40;
            const g = 170 - k * 90;
            const b = 60 - k * 30;
            return `rgba(${r},${g},${b},${0.55 + k * 0.4})`;
        }

        function draw(spread, color) {

            c.clearRect(0, 0, 220, 220);

            // chuck bowl
            c.fillStyle = "#1b2340";
            c.beginPath();
            c.arc(110, 110, 104, 0, Math.PI * 2);
            c.fill();

            // wafer with flat
            c.save();
            c.translate(110, 110);
            c.rotate(angle);
            c.beginPath();
            c.arc(0, 0, 88, 0.35 + Math.PI / 2, Math.PI / 2 - 0.35 + Math.PI * 2);
            c.closePath();
            c.fillStyle = "#9aa6bb";
            c.fill();
            c.clip();

            if (spread > 0) {
                c.fillStyle = color;
                c.beginPath();
                c.arc(0, 0, 88 * spread, 0, Math.PI * 2);
                c.fill();
            }

            // reflections show rotation
            c.fillStyle = "rgba(255,255,255,0.22)";
            c.fillRect(-88, -4, 176, 3);
            c.fillRect(-3, -88, 3, 176);
            c.restore();
        }

        function setRound() {
            coated = null;
            misses = 0;
            $("spinHint").hidden = true;
            $("spinRound").textContent = `Wafer ${round + 1} of ${targets.length}`;
            $("spinTarget").textContent = `Target: ${targets[round].toFixed(2)} µm`;
            result.textContent = "";
            result.className = "adv-result";
            goBtn.textContent = "Spin";
            goBtn.disabled = false;
            draw(0);
        }

        rpmIn.addEventListener("input", () => {
            $("spinRpmOut").textContent = rpmIn.value;
        });

        goBtn.addEventListener("click", () => {

            if (spinning) {
                return;
            }

            if (coated === "pass") {
                round++;
                if (round >= targets.length) {
                    showMastery("spin", `
                        <p>Spin coating spreads resist into a film whose thickness depends on spin speed. The rule of thumb is thickness ∝ 1/√(rpm).</p>
                        <p>Double the speed and the film only drops to about 71% as thick, so fine adjustments mean big rpm changes.</p>`);
                    return;
                }
                setRound();
                return;
            }

            const rpm = Number(rpmIn.value);
            const th = 1.5 * Math.sqrt(3000 / rpm);
            const target = targets[round];
            const color = thicknessColor(th);
            const start = performance.now();
            const DURATION = 2600;

            spinning = true;
            goBtn.disabled = true;
            rpmIn.disabled = true;
            result.textContent = "Spinning…";
            result.className = "adv-result";

            let last = start;

            const tick = (now) => {

                if (m.dead) {
                    return;
                }

                const k = Math.min(1, (now - start) / DURATION);
                const speed = Math.sin(Math.min(1, k * 1.4) * Math.PI / 2) * (1 - Math.max(0, k - 0.85) / 0.15);
                angle += (now - last) / 1000 * (rpm / 3000) * 14 * speed;
                last = now;
                draw(0.15 + 0.85 * Math.min(1, k * 1.6), color);

                if (k < 1) {
                    requestAnimationFrame(tick);
                    return;
                }

                spinning = false;
                goBtn.disabled = false;
                rpmIn.disabled = false;

                if (Math.abs(th - target) <= 0.05) {
                    coated = "pass";
                    result.className = "adv-result good";
                    result.textContent = `✓ Measured ${th.toFixed(2)} µm. On target!`;
                    goBtn.textContent = round + 1 < targets.length ? "Next wafer" : "Finish";
                    goBtn.focus();
                } else {
                    misses++;
                    result.className = "adv-result bad";
                    result.textContent = th > target
                        ? `Measured ${th.toFixed(2)} µm: too thick. Strip it and spin faster.`
                        : `Measured ${th.toFixed(2)} µm: too thin. Strip it and spin slower.`;
                    if (misses >= 2) {
                        $("spinHint").hidden = false;
                    }
                }
            };

            requestAnimationFrame(tick);
        });

        setRound();
    }


    /* ---------- Machine 2: mask aligner ---------- */

    function openAlign() {

        const STEP_PX = 5;
        const ROT_PX = 4;
        const ranges = [
            { xy: 3, rot: 0 },
            { xy: 3, rot: 2 },
            { xy: 5, rot: 3 }
        ];

        let round = 0;
        let off = { x: 0, y: 0, r: 0 };
        let busy = false;
        let passed = false;
        let flash = 0;

        const m = openModal(`
            ${head("litho", "Mask Aligner")}
            <p class="adv-lead">Each new layer has to land exactly on the last one. Line up the <strong style="color:#ff8a9a">red mask marks</strong> with the <strong style="color:#6ff0d0">green wafer marks</strong> in both microscope views, then expose.</p>
            <p class="adv-calib">If both views are off the same way, <strong>shift</strong>. If one view is high and the other low, the mask is <strong>rotated</strong>.</p>
            <div class="adv-aligner">
                <p class="adv-round" id="alignRound" style="text-align:center"></p>
                <canvas id="alignCanvas" width="600" height="300"></canvas>
                <div class="adv-align-row">
                    <div class="adv-align-pad">
                        <button type="button" data-a="ccw" aria-label="Rotate counterclockwise">⟲</button>
                        <button type="button" data-a="up" aria-label="Move mask up">↑</button>
                        <button type="button" data-a="cw" aria-label="Rotate clockwise">⟳</button>
                        <button type="button" data-a="left" aria-label="Move mask left">←</button>
                        <button type="button" data-a="down" aria-label="Move mask down">↓</button>
                        <button type="button" data-a="right" aria-label="Move mask right">→</button>
                    </div>
                    <button type="button" class="adv-btn" id="alignGo" data-autofocus>Expose</button>
                </div>
                <p class="adv-keys">Keyboard: arrows move · Q / E rotate · Space exposes</p>
                <p class="adv-result" id="alignResult" style="text-align:center" aria-live="polite"></p>
            </div>`, {
            onKey: (e) => {
                const map = {
                    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
                    KeyQ: "ccw", KeyE: "cw"
                };
                if (map[e.code]) {
                    e.preventDefault();
                    act(map[e.code]);
                } else if ((e.code === "Space" || e.code === "Enter") && document.activeElement === document.body) {
                    e.preventDefault();
                    $("alignGo").click();
                }
            }
        });

        const cv = $("alignCanvas");
        const c = cv.getContext("2d");
        const result = $("alignResult");
        const goBtn = $("alignGo");

        function randomOffset() {
            const r = ranges[round];
            const pick = (n) => Math.floor(Math.random() * (2 * n + 1)) - n;
            let o;
            do {
                o = { x: pick(r.xy), y: pick(r.xy), r: pick(r.rot) };
            } while (Math.abs(o.x) + Math.abs(o.y) + Math.abs(o.r) < 2);
            return o;
        }

        function cross(cx, cy, len, wid) {
            c.beginPath();
            c.rect(cx - len / 2, cy - wid / 2, len, wid);
            c.rect(cx - wid / 2, cy - len / 2, wid, len);
        }

        function view(cx, cy, mx, my, title) {

            c.save();
            c.beginPath();
            c.arc(cx, cy, 120, 0, Math.PI * 2);
            c.clip();

            c.fillStyle = "#3d4a66";
            c.fillRect(cx - 120, cy - 120, 240, 240);

            // die streets on the wafer
            c.strokeStyle = "rgba(255,255,255,0.07)";
            c.lineWidth = 1;
            for (let i = -120; i <= 120; i += 30) {
                c.beginPath();
                c.moveTo(cx + i, cy - 120);
                c.lineTo(cx + i, cy + 120);
                c.moveTo(cx - 120, cy + i);
                c.lineTo(cx + 120, cy + i);
                c.stroke();
            }

            // wafer mark
            c.fillStyle = "#6ff0d0";
            cross(cx, cy, 60, 14);
            c.fill();

            // mask mark: an outlined window the wafer cross should sit inside
            c.fillStyle = "rgba(255, 90, 110, 0.18)";
            c.strokeStyle = "#ff5a6e";
            c.lineWidth = 3;
            const wx = cx + mx;
            const wy = cy + my;
            c.beginPath();
            c.moveTo(wx - 12, wy - 40);
            c.lineTo(wx + 12, wy - 40);
            c.lineTo(wx + 12, wy - 12);
            c.lineTo(wx + 40, wy - 12);
            c.lineTo(wx + 40, wy + 12);
            c.lineTo(wx + 12, wy + 12);
            c.lineTo(wx + 12, wy + 40);
            c.lineTo(wx - 12, wy + 40);
            c.lineTo(wx - 12, wy + 12);
            c.lineTo(wx - 40, wy + 12);
            c.lineTo(wx - 40, wy - 12);
            c.lineTo(wx - 12, wy - 12);
            c.closePath();
            c.fill();
            c.stroke();

            if (flash > 0) {
                c.fillStyle = `rgba(170, 110, 255, ${flash})`;
                c.fillRect(cx - 120, cy - 120, 240, 240);
            }

            c.restore();

            c.strokeStyle = "#0b1020";
            c.lineWidth = 6;
            c.beginPath();
            c.arc(cx, cy, 121, 0, Math.PI * 2);
            c.stroke();

            c.fillStyle = "#a9b2d0";
            c.font = "bold 15px sans-serif";
            c.textAlign = "center";
            c.fillText(title, cx, cy + 112);
        }

        function draw() {
            c.clearRect(0, 0, 600, 300);
            view(150, 145, off.x * STEP_PX, off.y * STEP_PX - off.r * ROT_PX, "LEFT MARK");
            view(450, 145, off.x * STEP_PX, off.y * STEP_PX + off.r * ROT_PX, "RIGHT MARK");
        }

        function act(a) {
            if (busy || passed) {
                return;
            }
            if (a === "up") { off.y--; }
            if (a === "down") { off.y++; }
            if (a === "left") { off.x--; }
            if (a === "right") { off.x++; }
            // clockwise on screen: right mark moves down, left mark up
            if (a === "cw") { off.r++; }
            if (a === "ccw") { off.r--; }
            draw();
        }

        modalBody.querySelectorAll("[data-a]").forEach((b) => {
            b.addEventListener("click", () => act(b.dataset.a));
        });

        function setRound() {
            off = randomOffset();
            passed = false;
            $("alignRound").textContent = `Layer ${round + 2} of ${ranges.length + 1}` +
                (ranges[round].rot ? " · watch for rotation" : "");
            result.textContent = "";
            result.className = "adv-result";
            goBtn.textContent = "Expose";
            draw();
        }

        goBtn.addEventListener("click", () => {

            if (busy) {
                return;
            }

            if (passed) {
                round++;
                if (round >= ranges.length) {
                    showMastery("align", `
                        <p>Chips are built layer on layer, and every layer has to land on the ones before it. How well layers line up is called <strong>overlay</strong>.</p>
                        <p>Aligners look at marks on opposite sides of the wafer. Both marks off the same way means a shift. Marks off in opposite directions means the mask is rotated.</p>`);
                    return;
                }
                setRound();
                return;
            }

            busy = true;
            const start = performance.now();

            const tick = (now) => {

                if (m.dead) {
                    return;
                }

                const k = Math.min(1, (now - start) / 1400);
                flash = k < 0.3 ? k / 0.3 * 0.7 : 0.7 * (1 - (k - 0.3) / 0.7);
                draw();

                if (k < 1) {
                    requestAnimationFrame(tick);
                    return;
                }

                flash = 0;
                draw();
                busy = false;

                if (off.x === 0 && off.y === 0 && off.r === 0) {
                    passed = true;
                    result.className = "adv-result good";
                    result.textContent = "✓ Aligned and exposed. The new layer lands right on the last one.";
                    goBtn.textContent = round + 1 < ranges.length ? "Next layer" : "Finish";
                } else {
                    const rotated = off.r !== 0;
                    result.className = "adv-result bad";
                    result.textContent = rotated
                        ? "✗ Overlay error: the views are off in opposite directions, so the mask is rotated. Strip, re-coat and try again."
                        : "✗ Overlay error: the marks aren't centered. Strip, re-coat and try again.";
                }
                goBtn.focus();
            };

            requestAnimationFrame(tick);
        });

        setRound();
    }


    /* ---------- Machine 3: DRIE (Bosch process) ---------- */

    function openDrie() {

        const TARGET = 8;
        const LEVEL_H = 22;
        const TOP = 50;

        let cycles = [];
        let passivated = false;
        let damage = 0;
        let steps = 0;
        let busy = false;
        let anim = null;
        let finished = false;

        const m = openModal(`
            ${head("etch", "DRIE Etcher")}
            <p class="adv-lead">Deep reactive ion etching cuts deep, straight trenches with the <strong>Bosch process</strong>. SF<sub>6</sub> plasma etches silicon in every direction, so each etch step must follow a C<sub>4</sub>F<sub>8</sub> passivation step that coats the walls in a protective polymer.</p>
            <p class="adv-calib">Goal: etch down <strong>${TARGET} cycles</strong> to the target line with straight walls. Two unprotected etches bow the walls too far and scrap the wafer.</p>
            <div class="adv-machine">
                <canvas id="drieCanvas" width="220" height="260"></canvas>
                <div>
                    <ul class="adv-stats">
                        <li>Depth <strong id="drieDepth">0 / ${TARGET}</strong></li>
                        <li>Steps <strong id="drieSteps">0</strong></li>
                        <li>Wall damage <strong id="drieDamage">0</strong></li>
                    </ul>
                    <div class="adv-button-row">
                        <button type="button" class="adv-btn secondary" id="drieDep" data-autofocus>🛡 Passivate (C<sub>4</sub>F<sub>8</sub>)</button>
                        <button type="button" class="adv-btn" id="drieEtch">⚡ Etch (SF<sub>6</sub>)</button>
                    </div>
                    <p class="adv-keys" style="text-align:left">Keyboard: P passivates · E etches</p>
                    <p class="adv-result" id="drieResult" aria-live="polite"></p>
                </div>
            </div>`, {
            onKey: (e) => {
                if (e.code === "KeyP") {
                    $("drieDep").click();
                } else if (e.code === "KeyE") {
                    $("drieEtch").click();
                }
            }
        });

        const cv = $("drieCanvas");
        const c = cv.getContext("2d");
        const result = $("drieResult");

        function cavity(grow) {
            c.beginPath();
            c.rect(90 + grow, TOP, 40 - grow * 2, 0);
            cycles.forEach((cy, i) => {
                const yc = TOP + i * LEVEL_H + LEVEL_H / 2;
                c.rect(90 + grow, TOP, 40 - grow * 2, yc - TOP);
                c.ellipse(110, yc, Math.max(1, 20 + cy.bite - grow), Math.max(1, LEVEL_H / 2 + 1 - grow), 0, 0, Math.PI * 2);
            });
        }

        function draw(now) {

            c.clearRect(0, 0, 220, 260);
            c.fillStyle = "#0e1424";
            c.fillRect(0, 0, 220, 260);

            // silicon
            c.fillStyle = "#7b8496";
            c.fillRect(10, TOP, 200, 250 - TOP);
            c.fillStyle = "#8a93a6";
            c.fillRect(10, TOP, 200, 3);

            // mask
            c.fillStyle = "#e0613f";
            c.fillRect(10, TOP - 10, 80, 10);
            c.fillRect(130, TOP - 10, 80, 10);

            // trench, with polymer lining when passivated
            if (cycles.length) {
                if (passivated) {
                    c.fillStyle = "#5ab8ff";
                    cavity(0);
                    c.fill();
                    c.fillStyle = "#0e1424";
                    cavity(2);
                    c.fill();
                } else {
                    c.fillStyle = "#0e1424";
                    cavity(0);
                    c.fill();
                }
            } else if (passivated) {
                c.fillStyle = "#5ab8ff";
                c.fillRect(90, TOP - 2, 40, 2);
            }

            // target line
            const ty = TOP + TARGET * LEVEL_H;
            c.strokeStyle = "#ffd84a";
            c.setLineDash([5, 4]);
            c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(14, ty);
            c.lineTo(206, ty);
            c.stroke();
            c.setLineDash([]);
            c.fillStyle = "#ffd84a";
            c.font = "bold 10px sans-serif";
            c.textAlign = "left";
            c.fillText("TARGET DEPTH", 14, ty - 4);

            // plasma
            if (anim) {
                const k = Math.min(1, (now - anim.start) / anim.dur);
                const pulse = Math.sin(k * Math.PI);
                const color = anim.kind === "etch" ? "190, 110, 255" : "90, 184, 255";
                c.fillStyle = `rgba(${color}, ${0.35 * pulse})`;
                c.fillRect(0, 0, 220, TOP - 10);
                const bottom = TOP + cycles.length * LEVEL_H;
                c.fillStyle = `rgba(${color}, ${0.6 * pulse})`;
                c.fillRect(92, TOP - 10, 36, bottom - TOP + 10);
                c.fillStyle = "#f5f7ff";
                c.font = "bold 12px sans-serif";
                c.textAlign = "center";
                c.fillText(anim.kind === "etch" ? "SF₆ plasma" : "C₄F₈ plasma", 110, 22);
            }
        }

        function refresh() {
            $("drieDepth").textContent = `${cycles.length} / ${TARGET}`;
            $("drieSteps").textContent = steps;
            $("drieDamage").textContent = damage;
            draw(performance.now());
        }

        function runAnim(kind, then) {

            busy = true;
            anim = { kind: kind, start: performance.now(), dur: 1100 };

            const tick = (now) => {

                if (m.dead) {
                    return;
                }

                draw(now);

                if (now - anim.start < anim.dur) {
                    requestAnimationFrame(tick);
                    return;
                }

                anim = null;
                busy = false;
                then();
                refresh();
            };

            requestAnimationFrame(tick);
        }

        function reset() {
            cycles = [];
            passivated = false;
            damage = 0;
            steps = 0;
            finished = false;
            $("drieDep").disabled = false;
            $("drieEtch").disabled = false;
            $("drieEtch").innerHTML = "⚡ Etch (SF<sub>6</sub>)";
            refresh();
        }

        function say2(text, good) {
            result.className = "adv-result" + (good === true ? " good" : good === false ? " bad" : "");
            result.innerHTML = text;
        }

        $("drieDep").addEventListener("click", () => {

            if (busy || finished) {
                return;
            }

            steps++;

            runAnim("dep", () => {
                if (passivated) {
                    say2("The walls were already coated, so that step only cost time.", false);
                } else {
                    passivated = true;
                    say2("Polymer now lines the walls and floor. Etch!");
                }
            });
        });

        $("drieEtch").addEventListener("click", () => {

            if (finished === "scrapped") {
                reset();
                say2("");
                return;
            }

            if (finished === "done") {
                showMastery("drie", `
                    <p>SF<sub>6</sub> plasma etches silicon <strong>isotropically</strong>: on its own it eats sideways under the mask, which is called an undercut.</p>
                    <p>The Bosch process coats the walls with C<sub>4</sub>F<sub>8</sub> polymer between short etch steps. Ions clear the polymer from the floor but not the walls, so the trench grows straight down.</p>
                    <p>The small ripples it leaves on the walls are called <strong>scallops</strong>.</p>`);
                return;
            }

            if (busy) {
                return;
            }

            steps++;

            runAnim("etch", () => {

                if (passivated) {
                    cycles.push({ bite: 3 });
                    say2("Clean cycle. The ions punched through the floor polymer while the walls stayed protected.", true);
                } else {
                    cycles.push({ bite: 13 });
                    damage++;
                    say2("Undercut! With no fresh polymer, the SF<sub>6</sub> etched sideways into the wall.", false);
                }

                passivated = false;

                if (damage >= 2) {
                    finished = "scrapped";
                    $("drieDep").disabled = true;
                    $("drieEtch").textContent = "Start a new wafer";
                    say2("✗ Wafer scrapped: the sidewalls bowed too far. Remember: passivate before every etch.", false);
                    return;
                }

                if (cycles.length >= TARGET) {
                    finished = "done";
                    $("drieDep").disabled = true;
                    $("drieEtch").textContent = "Finish";
                    say2(damage === 0
                        ? `✓ Perfect profile in ${steps} steps! Straight walls all the way down.`
                        : `✓ Target depth reached in ${steps} steps. One bowed section, but it passes inspection.`, true);
                }
            });
        });

        reset();
    }


    /* ---------- Boss battle ---------- */

    /*
       A battle is a config: foe name and art, moves (each draws
       questions from a pool), foe attacks, and what winning does.
       The Undercut is the first one; towns can pass their own.
    */
    function undercutBattle() {
        return {
            foeName: "The Undercut",
            foeTag: "Process defect · Lv 8",
            foeSize: 32,
            drawFoe: (c, t) => drawUndercut(c, 0, 0, 1, t),
            foeMax: 195,
            foePower: 0.83,
            meMax: 140,
            moves: MOVES,
            questions: QUESTIONS,
            attacks: FOE_ATTACKS,
            intro: [
                "A wild process defect appeared! It's <strong>The Undercut</strong>!",
                "Answer questions to power your moves. Wrong answers leave you open to a harder hit."
            ],
            runText: "You backed away safely. The Undercut is still in there…",
            loseTitle: "The Undercut got away",
            loseTip: "Tip: The Undercut is weak to <strong>Etch</strong> and <strong>Deposition</strong> moves. A <strong>SEM Scan</strong> first makes your next hit 1.5× stronger.",
            winLines: [
                "The Undercut was etched away! Straight walls at last.",
                "📜 Dr. Ingot hands you the MEMS Works Certificate of Completion!"
            ],
            onWin: () => {
                const first = !save.bossBeaten;
                save.bossBeaten = true;
                save.badges.mems = true;
                writeSave();
                if (first) {
                    gainXP(BOSS_XP);
                    awardSiteXP("boss", BOSS_XP);
                } else {
                    updateHud();
                }
                pendingAfterModal = () => say(profLines(), "Dr. Ingot (on the intercom)");
                return `
                    <div class="adv-complete">
                        <p class="eyebrow">DEFECT DEFEATED</p>
                        <h2>${first ? "📜 Certificate of Completion" : "🏆 Rematch Won"}</h2>${first ? certificate("mems") : ""}
                        <p class="adv-xp-big">+${BOSS_XP} XP</p>
                        <div class="adv-takeaway">
                            <p><strong>Undercut</strong> is when an etch eats sideways beneath the mask. It comes from isotropic etching: wet etches and plain SF<sub>6</sub> plasma attack every direction at once.</p>
                            <p>Fabs fight it with anisotropic processes like the Bosch cycle, sidewall passivation and directional ion bombardment, then check the profile with an SEM cross-section.</p>
                        </div>
                        <button type="button" class="adv-btn" data-close>Back to MEMS Works</button>
                    </div>`;
            }
        };
    }

    function openBattle(cfg) {

        cfg = cfg || undercutBattle();
        battleActive = true;
        updateMusic();

        const ch = currentChar();
        const FOE_MAX = cfg.foeMax;
        const ME_MAX = cfg.meMax;
        const SIZE = cfg.foeSize || 32;
        const QS = cfg.questions;
        const FOE = cfg.foeName;

        let foeHp = FOE_MAX;
        let meHp = ME_MAX;
        let focused = false;
        let anim = 0;

        const shuffle = (list) => (window.SCGames ? window.SCGames.shuffle(list) : list.slice());

        const pools = {};
        Object.keys(QS).forEach((k) => {
            pools[k] = shuffle(QS[k]);
        });

        function nextQuestion(type) {
            if (!pools[type].length) {
                pools[type] = shuffle(QS[type]);
            }
            return pools[type].shift();
        }

        function moveInfo(mv) {
            const ty = TYPES[mv.type] || {};
            return {
                icon: mv.icon || ty.icon || "",
                label: mv.label || ty.label || mv.type,
                special: (mv.special || mv.type) === ch.type
            };
        }

        const m = openModal(`
            <div class="adv-battle-field${cfg.fieldClass ? " " + cfg.fieldClass : ""}">
                <div class="adv-hpbox">
                    <strong>${FOE.toUpperCase()}</strong>
                    <span>${cfg.foeTag}</span>
                    <div class="adv-hp"><div class="adv-hp-fill" id="foeHp"></div></div>
                </div>
                <canvas id="foeCanvas" width="${SIZE}" height="${SIZE}"></canvas>
                <canvas id="meCanvas" width="16" height="16"></canvas>
                <div class="adv-hpbox">
                    <strong>${ch.name}</strong>
                    <span>${ch.title} · Lv ${level()}</span>
                    <div class="adv-hp"><div class="adv-hp-fill" id="meHp"></div></div>
                    <span id="meHpText">${ME_MAX} / ${ME_MAX} HP</span>
                </div>
            </div>
            <div class="adv-battle-log" id="battleLog" aria-live="polite"></div>
            <div id="battleActions"></div>
            <div class="adv-battle-foot">
                <button type="button" class="adv-run" id="battleRun">Run away</button>
            </div>`, { closable: false });

        const log = $("battleLog");
        const actions = $("battleActions");
        const foeCv = $("foeCanvas");
        const meCv = $("meCanvas");
        const foeCtx = foeCv.getContext("2d");
        const meCtx = meCv.getContext("2d");

        drawPerson(meCtx, 0, 0, ch.look, "up", 0, 1);

        const loop = (now) => {
            if (m.dead) {
                return;
            }
            foeCtx.clearRect(0, 0, SIZE, SIZE);
            if (foeHp > 0) {
                cfg.drawFoe(foeCtx, now);
            }
            anim = requestAnimationFrame(loop);
        };
        anim = requestAnimationFrame(loop);

        $("battleRun").addEventListener("click", () => {
            cancelAnimationFrame(anim);
            m.closable = true;
            pendingAfterModal = () => say([cfg.runText]);
            closeModal();
        });

        function setHp() {

            const f = $("foeHp");
            const me = $("meHp");
            const fk = Math.max(0, foeHp) / FOE_MAX;
            const mk = Math.max(0, meHp) / ME_MAX;

            f.style.width = fk * 100 + "%";
            me.style.width = mk * 100 + "%";
            f.className = "adv-hp-fill" + (fk < 0.25 ? " low" : fk < 0.5 ? " mid" : "");
            me.className = "adv-hp-fill" + (mk < 0.25 ? " low" : mk < 0.5 ? " mid" : "");
            $("meHpText").textContent = `${Math.max(0, meHp)} / ${ME_MAX} HP`;
        }

        function hit(el) {
            el.classList.remove("adv-shake", "adv-flash");
            void el.offsetWidth;
            el.classList.add("adv-shake", "adv-flash");
        }

        // Lines are strings or { text, fx } and advance on Continue.
        function narrate(lines, then) {

            let i = 0;

            const step = () => {

                if (i >= lines.length) {
                    then();
                    return;
                }

                const line = lines[i++];
                const text = typeof line === "string" ? line : line.text;

                log.innerHTML = text;

                if (line.fx) {
                    line.fx();
                }

                actions.innerHTML = '<div class="adv-button-row"><button type="button" class="adv-btn" id="bNext">Continue ▶</button></div>';
                const b = $("bNext");
                b.addEventListener("click", step);
                b.focus({ preventScroll: true });
            };

            step();
        }

        function showMoves() {

            log.innerHTML = `What will ${ch.name} do?`;

            actions.innerHTML = '<div class="adv-move-grid">' + cfg.moves.map((mv, i) => {
                const info = moveInfo(mv);
                return `
                <button type="button" class="adv-move ${mv.cls || mv.type}" data-move="${i}">
                    <strong>${mv.name}${info.special ? " ★" : ""}</strong>
                    <small>${info.icon} ${info.label} question</small>
                </button>`;
            }).join("") + "</div>";

            actions.querySelectorAll("[data-move]").forEach((b) => {
                b.addEventListener("click", () => ask(cfg.moves[Number(b.dataset.move)]));
            });

            actions.querySelector("button").focus({ preventScroll: true });
        }

        function ask(move) {

            const q = nextQuestion(move.type);
            const opts = shuffle(q.a);

            log.innerHTML = `<strong>${move.name}:</strong> ${q.q}`;

            actions.innerHTML = '<div class="adv-answers">' + opts.map((a, i) => `
                <button type="button" class="adv-answer" data-i="${i}">${a}</button>`).join("") + "</div>";

            actions.querySelectorAll("[data-i]").forEach((b) => {
                b.addEventListener("click", () => {
                    resolve(move, q, opts[Number(b.dataset.i)] === q.a[0]);
                });
            });

            actions.querySelector("button").focus({ preventScroll: true });
        }

        function resolve(move, q, correct) {

            const lines = [];
            snd(correct ? "correct" : "wrong");

            if (correct) {

                const special = moveInfo(move).special;
                const sets = move.focus || move.type === "inspect";
                let dmg = 24 * move.mult * (special ? 1.2 : 1);

                if (focused && !sets) {
                    dmg *= 1.5;
                    focused = false;
                }

                dmg = Math.round(dmg);

                lines.push(`<span class="good">✓ Correct!</span> ${q.why}`);
                lines.push({
                    text: `${ch.name} used <strong>${move.name}</strong>! ${FOE} took ${dmg} damage.`,
                    fx: () => {
                        foeHp -= dmg;
                        setHp();
                        hit(foeCv);
                        snd("zap");
                    }
                });
                lines.push(move.effect + (special ? " Specialty bonus!" : ""));

                if (sets) {
                    focused = true;
                }

            } else {

                lines.push(`<span class="bad">✗ Not quite.</span> The answer is: <strong>${q.a[0]}</strong>. ${q.why}`);
                lines.push(`${ch.name}'s ${move.name} missed!`);
            }

            narrate(lines, () => {
                if (foeHp <= 0) {
                    win();
                } else {
                    foeTurn(!correct);
                }
            });
        }

        function foeTurn(crit) {

            const atk = cfg.attacks[Math.floor(Math.random() * cfg.attacks.length)];
            // bosses later in the journey hit harder
            const dmg = Math.round((crit ? 20 : 12) * (cfg.foePower || 1));

            narrate([
                {
                    text: `${FOE} used <strong>${atk.name}</strong>! ${atk.text}`,
                    fx: () => {
                        meHp -= dmg;
                        setHp();
                        hit(meCv);
                        snd("hurt");
                    }
                },
                crit
                    ? `It hit hard while you were off guard: ${dmg} damage.`
                    : `${ch.name} took ${dmg} damage.`
            ], () => {
                if (meHp <= 0) {
                    lose();
                } else {
                    showMoves();
                }
            });
        }

        function win() {

            snd("victory");
            narrate(cfg.winLines, () => {

                cancelAnimationFrame(anim);
                m.closable = true;

                modalBody.innerHTML = cfg.onWin();
                modalBody.scrollTop = 0;
                focusFirst();
            });
        }

        function lose() {

            snd("lose");
            narrate([
                `${ch.name} is out of HP!`,
                "You step outside to recover. Your progress is safe."
            ], () => {

                cancelAnimationFrame(anim);
                m.closable = true;

                modalBody.innerHTML = `
                    <div class="adv-complete">
                        <p class="eyebrow">BATTLE LOST</p>
                        <h2>${cfg.loseTitle}</h2>
                        <div class="adv-takeaway">
                            <p>${cfg.loseTip}</p>
                        </div>
                        <div class="adv-button-row" style="justify-content:center">
                            <button type="button" class="adv-btn" id="battleRetry">Battle again</button>
                            <button type="button" class="adv-btn secondary" data-close>Not now</button>
                        </div>
                    </div>`;
                modalBody.scrollTop = 0;
                focusFirst();

                $("battleRetry").addEventListener("click", () => {
                    closeModal();
                    openBattle(cfg);
                });
            });
        }

        setHp();
        narrate(cfg.intro, showMoves);
    }

    /* ---------- Start ---------- */

    showLocation();
    updateHud();
    refreshRecipe();
    $("advRecipe").addEventListener("click", openActiveRecipe);
    $("advBag").addEventListener("click", openBag);
    $("advMap").addEventListener("click", openMap);
    const certStrip = document.querySelector(".adv-hud-badges");
    certStrip.addEventListener("click", openCertificates);
    certStrip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCertificates();
        }
    });
    markVisited();
    updateMusic();
    $("advSound").textContent = soundLabel();
    $("advSound").addEventListener("click", () => {
        if (window.FabAdventureAudio) {
            window.FabAdventureAudio.unlock();
            window.FabAdventureAudio.cycle();
            updateMusic();
        }
        $("advSound").textContent = soundLabel();
        snd("select");
    });
    // every finished step, exhibit or report shows an .adv-complete panel
    new MutationObserver(() => {
        const done = modalBody.querySelector(".adv-complete");
        if (done && !done.dataset.chimed && !battleActive) {
            done.dataset.chimed = "1";
            snd("done");
        }
    }).observe(modalBody, { childList: true, subtree: true });
    if (bagIsNew && save.charId) {
        setTimeout(() => toast("🎒 You got a bag! Press B. Here are 3 wafers to start."), 1200);
    }
    requestAnimationFrame(frame);

    if (!currentChar()) {
        openCharacterSelect();
    }

})();
