/* ========================================
   ACCELEROMETER PART ART
   Unit 5: MEMS Accelerometer Design
   Schematic icons for the ADXL150-style sensor cell
======================================== */

const accelPartsArt = {

    proofMass: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="35" width="45" height="30" rx="3" fill="var(--accent)"/>
            <line x1="63" y1="40" x2="80" y2="40" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
            <line x1="63" y1="50" x2="80" y2="50" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
            <line x1="63" y1="60" x2="80" y2="60" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,

    anchor: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="18" width="20" height="37" fill="var(--text)"/>
            <rect x="18" y="55" width="64" height="10" rx="2" fill="var(--muted)"/>
            <line x1="24" y1="65" x2="30" y2="76" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>
            <line x1="40" y1="65" x2="46" y2="76" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>
            <line x1="56" y1="65" x2="62" y2="76" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>
            <line x1="72" y1="65" x2="78" y2="76" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>
        </svg>
    `,

    foldedSprings: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M18 28 L18 72 L50 72 L50 28 L82 28 L82 72"
                stroke="var(--accent)"
                stroke-width="5"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    `,

    fixedFingers: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="62" width="70" height="10" rx="2" fill="var(--text)"/>
            <line x1="25" y1="20" x2="25" y2="62" stroke="var(--text)" stroke-width="6" stroke-linecap="round"/>
            <line x1="45" y1="20" x2="45" y2="62" stroke="var(--text)" stroke-width="6" stroke-linecap="round"/>
            <line x1="65" y1="20" x2="65" y2="62" stroke="var(--text)" stroke-width="6" stroke-linecap="round"/>
        </svg>
    `,

    positionSenseRegion: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="18" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="41" y="18" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="64" y="18" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="18" y="41" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="41" y="41" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="64" y="41" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="18" y="64" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="41" y="64" width="18" height="18" rx="2" fill="var(--accent)"/>
            <rect x="64" y="64" width="18" height="18" rx="2" fill="var(--accent)"/>
        </svg>
    `,

    selfTestRegion: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="58" width="22" height="13" rx="2" fill="var(--muted)"/>
            <rect x="56" y="58" width="22" height="13" rx="2" fill="var(--muted)"/>
            <path d="M52 16 L42 46 L51 46 L44 82 L64 42 L53 42 Z" fill="var(--accent)"/>
        </svg>
    `

};
