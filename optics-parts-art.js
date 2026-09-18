/* ========================================
   OPTICS PARTS ART
   Schematic illustrations used by
   Game 6 — Build the Display
======================================== */

const opticsPartsArt = {

    torsionBeam: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="20" y1="50" x2="80" y2="50" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
            <circle cx="20" cy="50" r="7" stroke="var(--text)" stroke-width="3"/>
            <circle cx="80" cy="50" r="7" stroke="var(--text)" stroke-width="3"/>
            <path d="M42 44 Q50 50 58 56" stroke="var(--muted)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        </svg>
    `,

    mirrorSupport: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="30" y1="28" x2="30" y2="72" stroke="var(--text)" stroke-width="4" stroke-linecap="round"/>
            <line x1="70" y1="28" x2="70" y2="72" stroke="var(--text)" stroke-width="4" stroke-linecap="round"/>
            <line x1="30" y1="50" x2="70" y2="50" stroke="var(--text)" stroke-width="4" stroke-linecap="round"/>
            <rect x="37" y="16" width="26" height="9" rx="2" fill="var(--accent)"/>
        </svg>
    `,

    centralPost: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="45" y="38" width="10" height="38" fill="var(--text)"/>
            <rect x="22" y="24" width="56" height="11" rx="2" fill="var(--accent)"/>
            <line x1="18" y1="78" x2="82" y2="78" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `,

    actuationElectrodes: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="64" width="28" height="11" rx="2" fill="var(--text)"/>
            <rect x="54" y="64" width="28" height="11" rx="2" fill="var(--text)"/>
            <path d="M32 58 L32 34 M68 58 L68 34" stroke="var(--accent)" stroke-width="2.2" stroke-dasharray="3 4" stroke-linecap="round"/>
            <path d="M28 38 L32 34 L36 38 M64 38 L68 34 L72 38" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
    `,

    landingPads: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="24" y="52" width="20" height="12" rx="3" fill="var(--accent)"/>
            <rect x="56" y="52" width="20" height="12" rx="3" fill="var(--accent)"/>
            <line x1="18" y1="70" x2="82" y2="70" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `,

    diffractionRibbons: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="28" y1="22" x2="28" y2="78" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>
            <line x1="42" y1="22" x2="42" y2="78" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
            <line x1="56" y1="22" x2="56" y2="78" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>
            <line x1="70" y1="22" x2="70" y2="78" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
        </svg>
    `,

    reflectiveSubstrate: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="16" y="60" width="68" height="15" rx="2" fill="var(--text)"/>
            <line x1="26" y1="50" x2="38" y2="38" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="48" y1="50" x2="60" y2="38" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="70" y1="50" x2="80" y2="40" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
    `,

    deformableMembrane: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 44 Q34 28 50 48 Q66 70 86 44" stroke="var(--accent)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <line x1="14" y1="44" x2="14" y2="62" stroke="var(--text)" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="86" y1="44" x2="86" y2="62" stroke="var(--text)" stroke-width="3.5" stroke-linecap="round"/>
        </svg>
    `,

    thinFilmStack: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="32" width="64" height="7" fill="var(--accent)"/>
            <rect x="18" y="43" width="64" height="7" fill="var(--muted)"/>
            <rect x="18" y="54" width="64" height="7" fill="var(--accent)"/>
            <rect x="18" y="65" width="64" height="7" fill="var(--muted)"/>
        </svg>
    `,

    transparentSubstrate: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="16" y="28" width="68" height="47" rx="4" stroke="var(--text)" stroke-width="3" fill="none"/>
            <line x1="24" y1="68" x2="46" y2="34" stroke="var(--muted)" stroke-width="2.2"/>
            <line x1="46" y1="68" x2="68" y2="34" stroke="var(--muted)" stroke-width="2.2"/>
            <line x1="68" y1="68" x2="80" y2="46" stroke="var(--muted)" stroke-width="2.2"/>
        </svg>
    `

};
