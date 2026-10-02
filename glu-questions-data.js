/* ========================================
   GLUCOSE SENSORS QUIZ QUESTIONS
   Five questions per unit. "correct" is the
   0-based index of the right answer; the quiz
   shuffles the answer order when it renders.
======================================== */

const gluLesson1Questions = [
    {
        question: "Which hormone helps cells take in glucose and lowers blood glucose?",
        answers: [
            "Glucagon",
            "Cortisol",
            "Insulin",
            "Thyroxine"
        ],
        correct: 2
    },
    {
        question: "Glucose below which value is generally defined as low (hypoglycemia)?",
        answers: [
            "100 mg/dL",
            "70 mg/dL",
            "126 mg/dL",
            "180 mg/dL"
        ],
        correct: 1
    },
    {
        question: "What is the common time-in-range target band for glucose?",
        answers: [
            "70 to 180 mg/dL",
            "40 to 100 mg/dL",
            "100 to 126 mg/dL",
            "180 to 250 mg/dL"
        ],
        correct: 0
    },
    {
        question: "Why is a single fingerstick reading limited?",
        answers: [
            "It measures a different sugar than glucose",
            "It is one snapshot of a value that keeps changing",
            "It needs a doctor to read the result",
            "It averages glucose over the past month"
        ],
        correct: 1
    },
    {
        question: "Roughly what do you divide a mg/dL glucose value by to get mmol/L?",
        answers: [
            "18",
            "2",
            "100",
            "1000"
        ],
        correct: 0
    }
];

const gluLesson2Questions = [
    {
        question: "Where does a CGM filament actually sit?",
        answers: [
            "In the interstitial fluid just under the skin",
            "In a major vein in the arm",
            "In the muscle layer under the skin",
            "Inside the bloodstream near the heart"
        ],
        correct: 0
    },
    {
        question: "How does glucose get from the blood into interstitial fluid?",
        answers: [
            "By diffusing through capillary walls",
            "It is pumped there by the heart",
            "Skin cells produce it",
            "Only red blood cells can carry it"
        ],
        correct: 0
    },
    {
        question: "Roughly how large is the physiological lag between blood and interstitial glucose?",
        answers: [
            "Under one second, effectively instant",
            "A few minutes, commonly 5 to 15",
            "About a full hour or more",
            "None, readings match blood exactly"
        ],
        correct: 1
    },
    {
        question: "When is the difference between CGM and blood glucose usually largest?",
        answers: [
            "When glucose has been flat for hours",
            "Only when the sensor is first inserted",
            "When glucose is rising or falling quickly",
            "When the person is sleeping"
        ],
        correct: 2
    },
    {
        question: "What does a CGM trend arrow show?",
        answers: [
            "How much insulin is still active",
            "The rate and direction of glucose change",
            "How many days remain on the sensor",
            "The strength of the Bluetooth signal"
        ],
        correct: 1
    }
];

const gluLesson3Questions = [
    {
        question: "Who proposed the enzyme electrode idea in 1962?",
        answers: [
            "Frederick Banting",
            "Alexander Fleming",
            "Thomas Edison",
            "Leland Clark"
        ],
        correct: 3
    },
    {
        question: "What was special about the first FDA-approved CGM in 1999?",
        answers: [
            "Its data was reviewed afterward rather than shown live",
            "It was the first sensor to be fully implanted",
            "It required no enzyme or electrode at all",
            "It could be bought over the counter"
        ],
        correct: 0
    },
    {
        question: "What does factory calibration mean?",
        answers: [
            "The sensor never needs to be replaced",
            "The reading is always exactly correct",
            "The user must calibrate it twice an hour",
            "No routine fingerstick calibration is needed"
        ],
        correct: 3
    },
    {
        question: "What was new about the 2024 Stelo and Lingo sensors?",
        answers: [
            "They were the first sensors small enough to implant",
            "They were cleared only for use in hospitals",
            "They measured glucose from sweat instead",
            "They were cleared to be sold without a prescription"
        ],
        correct: 3
    },
    {
        question: "What core idea has most CGMs kept since the 1960s?",
        answers: [
            "An enzyme reaction that makes a signal at an electrode",
            "Infrared light passing through the fingertip",
            "Counting glucose molecules in a sweat sample",
            "A lancet and strip checked every minute"
        ],
        correct: 0
    }
];

const gluLesson4Questions = [
    {
        question: "Which two properties matter most for a glucose sensor in tissue?",
        answers: [
            "Large size and a very high operating voltage",
            "Low cost and resistance to sunlight only",
            "Fast battery charging and a wide screen",
            "Selectivity for glucose and stability over time"
        ],
        correct: 3
    },
    {
        question: "What does the enzyme in an enzymatic sensor provide?",
        answers: [
            "Power: it supplies energy to the transmitter",
            "Adhesion: it keeps the sensor on the skin",
            "Range: it extends the Bluetooth signal",
            "Selectivity: it reacts with glucose and little else"
        ],
        correct: 3
    },
    {
        question: "Which type of glucose sensing do most commercial CGMs use?",
        answers: [
            "Raman spectroscopy through the skin",
            "Breath analysis",
            "Microwave imaging",
            "Enzymatic electrochemical sensing"
        ],
        correct: 3
    },
    {
        question: "What does a fluorescent glucose sensor change as glucose varies?",
        answers: [
            "The voltage of the battery cell",
            "How brightly a material glows",
            "The thickness of the sensor wire",
            "The strength of the skin adhesive"
        ],
        correct: 1
    },
    {
        question: "Which commercial CGM is fluorescence-based and implanted?",
        answers: [
            "Dexcom G7",
            "Senseonics Eversense",
            "FreeStyle Libre 3",
            "Medtronic Guardian"
        ],
        correct: 1
    }
];

const gluLesson5Questions = [
    {
        question: "What does glucose oxidase produce along with gluconolactone?",
        answers: [
            "Carbon dioxide",
            "Hydrogen peroxide",
            "Pure oxygen",
            "Insulin"
        ],
        correct: 1
    },
    {
        question: "Which molecule is the natural electron acceptor for glucose oxidase?",
        answers: [
            "Nitrogen",
            "Sodium",
            "Oxygen",
            "Helium"
        ],
        correct: 2
    },
    {
        question: "Why is an enzyme such as GOx so selective?",
        answers: [
            "Its shape fits glucose and little else",
            "It contains platinum that attracts sugar",
            "It glows when it meets any molecule",
            "It is large enough to trap every sugar"
        ],
        correct: 0
    },
    {
        question: "What is a known drawback of some glucose dehydrogenase enzymes?",
        answers: [
            "They cannot be used with any electrode",
            "Some versions also react with other sugars",
            "They only work in strong sunlight",
            "They require a battery inside the sensor"
        ],
        correct: 1
    },
    {
        question: "What limits how long an enzyme layer works?",
        answers: [
            "The enzyme runs out of light to absorb",
            "The enzyme slowly loses activity over time",
            "Skin cells digest it within a few minutes",
            "The electrode becomes magnetic after use"
        ],
        correct: 1
    }
];

const gluLesson6Questions = [
    {
        question: "What does amperometry measure?",
        answers: [
            "The color change of the surrounding fluid",
            "The current from a reaction at an electrode",
            "The temperature change of the skin",
            "The weight change of the enzyme layer"
        ],
        correct: 1
    },
    {
        question: "What is the job of the reference electrode?",
        answers: [
            "To store the data until it is sent",
            "To heat the fluid around the sensor",
            "To hold the enzyme in place",
            "To provide a stable voltage standard"
        ],
        correct: 3
    },
    {
        question: "About what voltage oxidizes hydrogen peroxide at a platinum electrode?",
        answers: [
            "About -5 V",
            "About +100 V",
            "About +0.6 V",
            "Exactly 0 V"
        ],
        correct: 2
    },
    {
        question: "In i = n · F · A · J, what does n stand for?",
        answers: [
            "The number of sensors in the array",
            "The amount of noise in the signal",
            "The number of days the sensor is worn",
            "Electrons released per molecule"
        ],
        correct: 3
    },
    {
        question: "What happens to the calibration curve at very high glucose?",
        answers: [
            "It turns negative as glucose rises",
            "It becomes a perfect circle at the top",
            "It flattens as the sensor saturates",
            "It doubles in slope above the range"
        ],
        correct: 2
    }
];

const gluLesson7Questions = [
    {
        question: "In a first-generation sensor, what carries electrons from the enzyme?",
        answers: [
            "Oxygen, which becomes hydrogen peroxide",
            "A mediator molecule such as osmium",
            "Nothing; the electrons transfer directly",
            "A copper wire built into the enzyme"
        ],
        correct: 0
    },
    {
        question: "What does a second-generation sensor add?",
        answers: [
            "A battery to power the enzyme",
            "A second skin layer for adhesion",
            "A larger transmitter for range",
            "A mediator that shuttles electrons"
        ],
        correct: 3
    },
    {
        question: "What is a main benefit of using a mediator?",
        answers: [
            "It removes the need for an electrode",
            "Much less dependence on oxygen",
            "It lets sensors last for decades",
            "It makes the sensor wireless"
        ],
        correct: 1
    },
    {
        question: "What defines a third-generation design?",
        answers: [
            "Direct electron transfer to the electrode",
            "Two enzymes working in series",
            "A thicker outer membrane layer",
            "A fluorescent dye as the signal"
        ],
        correct: 0
    },
    {
        question: "What is a drawback of first-generation sensors?",
        answers: [
            "They cannot produce any measurable current",
            "They depend on oxygen and can pick up interference",
            "They need an external battery for each enzyme",
            "They only work in distilled water"
        ],
        correct: 1
    }
];

const gluLesson8Questions = [
    {
        question: "Why does a first-generation sensor need a glucose-limiting membrane?",
        answers: [
            "Tissue has far more oxygen than glucose",
            "The enzyme needs sunlight",
            "The skin blocks all glucose",
            "Tissue has far less oxygen than glucose"
        ],
        correct: 3
    },
    {
        question: "What does an interference-blocking layer do?",
        answers: [
            "Blocks acetaminophen from reaching the electrode",
            "Makes the sensor fully waterproof in the shower",
            "Supplies the electrical power to the transmitter",
            "Glues the sensor firmly to the skin"
        ],
        correct: 0
    },
    {
        question: "What is biofouling?",
        answers: [
            "Proteins and cells building up on the surface",
            "The battery running down inside the sensor",
            "The enzyme turning into a solid metal",
            "The adhesive patch peeling off the skin"
        ],
        correct: 0
    },
    {
        question: "What happens when a sensor's membrane is made thinner?",
        answers: [
            "The sensor stops responding to glucose",
            "It becomes immune to oxygen changes",
            "The signal is stronger but saturates earlier",
            "It will last about a year in tissue"
        ],
        correct: 2
    },
    {
        question: "Why do the body's reactions limit sensor life?",
        answers: [
            "They change how glucose reaches the sensor",
            "They melt the electrode after a few days",
            "They make glucose vanish from the blood",
            "They convert the electrode into an enzyme"
        ],
        correct: 0
    }
];

const gluLesson9Questions = [
    {
        question: "What causes a compression low?",
        answers: [
            "The transmitter battery overheating while asleep",
            "Pressure squeezes tissue so less glucose reaches the sensor",
            "The enzyme layer expiring before its labeled date",
            "Dehydration lowering the glucose in the blood"
        ],
        correct: 1
    },
    {
        question: "What does factory calibration remove?",
        answers: [
            "The need for any electrode at all",
            "The need to replace the sensor",
            "The need for user fingerstick calibration",
            "The need for a smartphone to read it"
        ],
        correct: 2
    },
    {
        question: "What does MARD stand for?",
        answers: [
            "Maximum allowed reading drift",
            "Median average rate of decay",
            "Mean absolute relative difference",
            "Measured arterial reading data"
        ],
        correct: 2
    },
    {
        question: "A reference of 200 and a CGM reading of 190 gives what absolute relative difference?",
        answers: [
            "10%",
            "50%",
            "5%",
            "0.5%"
        ],
        correct: 2
    },
    {
        question: "Why should you look at an error grid and not just MARD?",
        answers: [
            "MARD is mathematically wrong for sensors",
            "Error grids only measure battery life",
            "An average can hide occasional large errors",
            "MARD can only be used on indoor sensors"
        ],
        correct: 2
    }
];

const gluLesson10Questions = [
    {
        question: "How often does a Dexcom CGM typically produce a new reading?",
        answers: [
            "Once an hour, on the hour",
            "About every 5 minutes",
            "Once a day in the morning",
            "Every second, continuously"
        ],
        correct: 1
    },
    {
        question: "What is different about Dexcom G7 compared with earlier designs?",
        answers: [
            "It dropped the sensor wire entirely",
            "Sensor and transmitter are one disposable",
            "It needs fingerstick calibration hourly",
            "It can only be worn overnight"
        ],
        correct: 1
    },
    {
        question: "What is the fixed Urgent Low alert level?",
        answers: [
            "100 mg/dL",
            "55 mg/dL",
            "180 mg/dL",
            "250 mg/dL"
        ],
        correct: 1
    },
    {
        question: "What does the applicator do?",
        answers: [
            "Places the filament and withdraws the needle",
            "Charges the transmitter battery wirelessly",
            "Sterilizes the skin before wear",
            "Calibrates the sensor against blood"
        ],
        correct: 0
    },
    {
        question: "What do the transmitter electronics do?",
        answers: [
            "Measure the tiny current and send data wirelessly",
            "Generate glucose from sweat on the skin surface",
            "Keep the enzyme layer refrigerated while worn",
            "Replace the sensor automatically every single day"
        ],
        correct: 0
    }
];

const gluLesson11Questions = [
    {
        question: "What does the platinum working electrode oxidize in a Dexcom-style sensor?",
        answers: [
            "Water in the surrounding tissue",
            "Insulin circulating in the fluid",
            "Hydrogen peroxide made by the enzyme",
            "Oils on the skin surface"
        ],
        correct: 2
    },
    {
        question: "Which generation does a peroxide-detecting design belong to?",
        answers: [
            "First generation",
            "Second generation",
            "Third generation",
            "None of these"
        ],
        correct: 0
    },
    {
        question: "Which drug does Dexcom labeling warn can falsely raise readings?",
        answers: [
            "Aspirin",
            "Water",
            "Caffeine-free tea",
            "Hydroxyurea"
        ],
        correct: 3
    },
    {
        question: "Why is there a warm-up period after insertion?",
        answers: [
            "The battery must charge to full first",
            "The skin adhesive must dry completely",
            "The app must download an update",
            "The sensor and tissue need time to settle"
        ],
        correct: 3
    },
    {
        question: "What is the main job of the algorithm?",
        answers: [
            "Increase the voltage across the electrode",
            "Replace the electrode when it wears out",
            "Turn a noisy current into a smooth glucose trend",
            "Push the sensor current higher as glucose rises"
        ],
        correct: 2
    }
];

const gluLesson12Questions = [
    {
        question: "Where is a FreeStyle Libre sensor typically worn?",
        answers: [
            "On the forehead",
            "On the back of the upper arm",
            "Inside the stomach",
            "On the sole of the foot"
        ],
        correct: 1
    },
    {
        question: "What does Abbott's wired enzyme design use to carry electrons?",
        answers: [
            "Oxygen alone, as in first generation",
            "A copper wire through the enzyme",
            "An osmium-based mediator",
            "Visible light from a tiny LED"
        ],
        correct: 2
    },
    {
        question: "Which generation does the wired enzyme design resemble?",
        answers: [
            "Second generation",
            "First generation",
            "Third generation",
            "Optical generation"
        ],
        correct: 0
    },
    {
        question: "How often does Libre 3 produce a reading?",
        answers: [
            "Once a day",
            "Every hour",
            "Every 10 minutes",
            "About every minute"
        ],
        correct: 3
    },
    {
        question: "What can labeling for earlier Libre versions warn about?",
        answers: [
            "Sunlight turning the sensor filament brittle",
            "Swimming dissolving the sensor adhesive",
            "Coffee draining the sensor battery",
            "Large amounts of vitamin C raising readings"
        ],
        correct: 3
    }
];

const gluLesson13Questions = [
    {
        question: "Who places an Eversense sensor?",
        answers: [
            "The user, with a spring-loaded applicator on the abdomen",
            "A nurse, through a vein in the wrist",
            "The user, by swallowing it with water",
            "A clinician, under the skin of the upper arm"
        ],
        correct: 3
    },
    {
        question: "What does a fluorescent glucose sensor measure?",
        answers: [
            "The temperature of the surrounding blood",
            "How strongly the polymer conducts current",
            "The weight of the polymer layer",
            "How brightly a glucose-binding polymer glows"
        ],
        correct: 3
    },
    {
        question: "What is an advantage of a fluorescence sensor?",
        answers: [
            "It never needs any light source",
            "It requires no transmitter at all",
            "It has no enzyme to wear out",
            "It works without any polymer"
        ],
        correct: 2
    },
    {
        question: "What is a cost of an implanted sensor?",
        answers: [
            "It can only be worn during sleep",
            "It is far cheaper to make than other sensors",
            "It cannot send any data at all",
            "A small procedure to insert and remove it"
        ],
        correct: 3
    },
    {
        question: "About how long is a typical Medtronic Guardian sensor worn?",
        answers: [
            "About 3 years",
            "About 20 minutes",
            "About 1 hour",
            "About 7 days"
        ],
        correct: 3
    }
];

const gluLesson14Questions = [
    {
        question: "Which CGM uses a fluorescent polymer instead of an enzyme?",
        answers: [
            "Dexcom",
            "FreeStyle Libre",
            "Medtronic Guardian",
            "Eversense"
        ],
        correct: 3
    },
    {
        question: "Which sensor streams a new reading about every minute?",
        answers: [
            "Medtronic Guardian",
            "Eversense",
            "Dexcom G6",
            "FreeStyle Libre 3"
        ],
        correct: 3
    },
    {
        question: "Which CGM design offers the longest wear time?",
        answers: [
            "Medtronic Guardian",
            "Dexcom G7",
            "FreeStyle Libre 3",
            "Eversense"
        ],
        correct: 3
    },
    {
        question: "Which chemistry do Dexcom and Medtronic sensors share?",
        answers: [
            "Fluorescence from a polymer",
            "Glucose oxidase with peroxide detection",
            "Raman scattering through the skin",
            "Microwave absorption by tissue"
        ],
        correct: 1
    },
    {
        question: "Which is a sensible way to choose a CGM?",
        answers: [
            "Pick whichever sensor is the smallest",
            "Choose the one with the shortest wear time",
            "Weigh accuracy, wear time, cost, and compatibility",
            "Choose by brand name alone"
        ],
        correct: 2
    }
];

const gluLesson15Questions = [
    {
        question: "Why is platinum widely used in these sensors?",
        answers: [
            "It oxidizes peroxide efficiently and stably",
            "It is soft, cheap, and easy to print as ink",
            "It makes the sensor glow when it gets wet",
            "It dissolves slowly to release the enzyme"
        ],
        correct: 0
    },
    {
        question: "Which method prints electrode inks through a mesh?",
        answers: [
            "Dip coating",
            "Screen printing",
            "Sputtering",
            "Spin drying"
        ],
        correct: 1
    },
    {
        question: "Why does batch uniformity matter?",
        answers: [
            "It makes every sensor in the box the same color",
            "It lowers the cost of building the transmitter",
            "Factory calibration assumes a batch behaves alike",
            "It increases the voltage across each electrode"
        ],
        correct: 2
    },
    {
        question: "Which manufacturing step must not destroy the enzyme?",
        answers: [
            "Labeling",
            "Boxing",
            "Sterilization",
            "Shipping the empty box"
        ],
        correct: 2
    },
    {
        question: "What does layer thickness mainly control?",
        answers: [
            "The color of the patch",
            "Sensitivity and linear range",
            "The brand of phone supported",
            "The adhesive strength"
        ],
        correct: 1
    }
];

const gluLesson16Questions = [
    {
        question: "How long are microneedles meant to be?",
        answers: [
            "Hundreds of microns, enough to reach fluid",
            "Several centimeters, to reach a vein",
            "Long enough to touch the bone",
            "Exactly one millimeter in every design"
        ],
        correct: 0
    },
    {
        question: "Why is sweat glucose hard to use?",
        answers: [
            "It is thicker and richer than blood",
            "It always matches blood glucose exactly",
            "It is very dilute and highly variable",
            "It contains no water or glucose"
        ],
        correct: 2
    },
    {
        question: "What is the main difficulty of optical non-invasive sensing?",
        answers: [
            "The glucose signal is tiny next to the noise",
            "Light cannot pass through human skin at all",
            "Glucose is invisible to every optical method",
            "The lasers needed are too heavy to wear"
        ],
        correct: 0
    },
    {
        question: "What did the FDA warn about in 2024?",
        answers: [
            "Phone screens that emit blue light at night",
            "Metal foil patches placed over CGM sensors",
            "Using tap water to clean the sensor skin",
            "Smartwatches claiming non-invasive glucose readings"
        ],
        correct: 3
    },
    {
        question: "Why have minimally invasive CGMs beaten non-invasive methods so far?",
        answers: [
            "They are always the cheapest option available",
            "They meet accuracy, lag, and selectivity together",
            "They are built entirely from solid gold wire",
            "They never need a phone in order to work"
        ],
        correct: 1
    }
];

const gluLesson17Questions = [
    {
        question: "In a closed-loop system, what does the algorithm do?",
        answers: [
            "Charges the sensor from the pump battery",
            "Measures blood pressure through the skin",
            "Uses CGM readings to adjust insulin dosing",
            "Prints a report for the clinic"
        ],
        correct: 2
    },
    {
        question: "What is a hybrid closed loop?",
        answers: [
            "A sensor made of two different metal layers",
            "Insulin adjusts automatically, but meals are still announced",
            "An insulin pump that works with no sensor at all",
            "A sensor that is implanted inside the stomach wall"
        ],
        correct: 1
    },
    {
        question: "Who were the first over-the-counter CGMs cleared for?",
        answers: [
            "Only hospital patients",
            "Only children under five",
            "Adults who do not use insulin",
            "Only athletes in competition"
        ],
        correct: 2
    },
    {
        question: "Which is an area of ongoing sensor development?",
        answers: [
            "Multi-analyte sensors that add ketones or lactate",
            "Sensors powered entirely by a hand crank",
            "Sensors that need a new enzyme each hour",
            "Sensors that last exactly one minute"
        ],
        correct: 0
    },
    {
        question: "Which question helps you judge a sensor claim?",
        answers: [
            "What is the MARD, and how was it measured?",
            "What color is the sensor packaging?",
            "How loud is the default alert tone?",
            "Which artist designed the company logo?"
        ],
        correct: 0
    }
];

const gluAllLessonQuestions = {
    1: gluLesson1Questions,
    2: gluLesson2Questions,
    3: gluLesson3Questions,
    4: gluLesson4Questions,
    5: gluLesson5Questions,
    6: gluLesson6Questions,
    7: gluLesson7Questions,
    8: gluLesson8Questions,
    9: gluLesson9Questions,
    10: gluLesson10Questions,
    11: gluLesson11Questions,
    12: gluLesson12Questions,
    13: gluLesson13Questions,
    14: gluLesson14Questions,
    15: gluLesson15Questions,
    16: gluLesson16Questions,
    17: gluLesson17Questions
};
