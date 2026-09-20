/* ========================================
   COURSE CATALOG
   Every course on the platform. "mems" is
   the only one built out today; the rest
   are announced but not yet live.
======================================== */

const coursesData = [

    {
        id: "sand-to-chip",
        title: "Sand to Chip",
        tagline: "How a chip gets made",
        description:
            "From quartz sand to a finished chip: pure silicon, crystal growth, wafers, and the cleanroom, with lithography, the CMOS process flow, yield, and packaging on the way.",
        icon: "🏭",
        status: "live",
        growing: true,
        href: "chip-learn.html"
    },

    {
        id: "mems",
        title: "MEMS & Microfabrication",
        tagline: "Cleanroom to shipped chip",
        description:
            "Cleanroom processes, photolithography, etching, deposition, accelerometers, optical MEMS, microfluidics, and packaging.",
        icon: "🔬",
        status: "live",
        href: "learn.html"
    },

    {
        id: "supercapacitors",
        title: "Supercapacitors",
        tagline: "Energy storage at the electrode interface",
        description:
            "Electric double-layer capacitance, pseudocapacitance, electrode materials, and the fabrication choices that push energy density higher. Grounded in original thesis research on 3D interdigitated glassy-carbon devices.",
        icon: "⚡",
        status: "live",
        href: "supercap-learn.html"
    },

    {
        id: "biofets",
        title: "BioFETs & MOSFETs",
        tagline: "Sensing biology with transistors",
        description:
            "MOSFET fundamentals, ion-sensitive FETs, biofunctionalization, and how a transistor becomes a biosensor.",
        icon: "🧪",
        status: "live",
        growing: true,
        href: "fet-learn.html"
    },

    {
        id: "bbb-chip",
        title: "Blood-Brain Barrier on a Chip",
        tagline: "Modeling the body's most selective barrier",
        description:
            "Organ-on-chip design, endothelial cell culture, microfluidic BBB models, and what they reveal about drug delivery to the brain.",
        icon: "🧠",
        status: "coming-soon"
    },

    {
        id: "neurotransmitters",
        title: "Neurotransmitters",
        tagline: "The chemistry of neural signaling",
        description:
            "Synaptic transmission, receptor binding, neurotransmitter detection, and the sensors built to measure them.",
        icon: "🧬",
        status: "coming-soon"
    },

    {
        id: "carbon-materials",
        title: "Carbon-Based Materials",
        tagline: "Graphene, nanotubes, and beyond",
        description:
            "The structure-property relationships behind graphene and carbon nanotubes, and how they're synthesized and integrated into devices.",
        icon: "⬡",
        status: "coming-soon"
    }

];
