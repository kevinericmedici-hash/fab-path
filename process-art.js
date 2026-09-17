/* ========================================
   PROCESS ART
   Schematic wafer cross-section illustrations
   used by Game 3 — Match the Process
======================================== */

const processArt = {

    lpcvdNitride: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="58" width="64" height="8" fill="var(--accent)" opacity="0.85"/>
            <path d="M30 20 L30 52 M30 48 L26 52 M30 48 L34 52" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M50 20 L50 52 M50 48 L46 52 M50 48 L54 52" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M70 20 L70 52 M70 48 L66 52 M70 48 L74 52" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,

    sputteredMetal: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="60" width="64" height="6" fill="var(--text)"/>
            <rect x="30" y="14" width="40" height="8" rx="2" stroke="var(--accent)" stroke-width="3"/>
            <path d="M35 24 L28 58 M50 24 L50 58 M65 24 L72 58" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"/>
        </svg>
    `,

    evaporatedAluminum: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="60" width="64" height="6" fill="var(--text)"/>
            <path d="M38 90 L62 90 L58 98 L42 98 Z" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>
            <path d="M44 88 Q40 76 46 58 M50 88 Q50 74 50 50 M56 88 Q60 76 54 58"
                  stroke="var(--accent)" stroke-width="2" stroke-linecap="round" fill="none"/>
        </svg>
    `,

    polysiliconDeposit: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="56" width="64" height="10" fill="var(--accent)" opacity="0.45"/>
            <circle cx="28" cy="60" r="2.2" fill="var(--accent)"/>
            <circle cx="40" cy="62" r="2.2" fill="var(--accent)"/>
            <circle cx="52" cy="59" r="2.2" fill="var(--accent)"/>
            <circle cx="64" cy="61" r="2.2" fill="var(--accent)"/>
            <circle cx="74" cy="60" r="2.2" fill="var(--accent)"/>
        </svg>
    `,

    photoresistCoat: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="58" width="64" height="8" fill="var(--muted)" opacity="0.6"/>
            <path d="M50 34 A14 14 0 1 1 49.9 34" stroke="var(--accent)" stroke-width="2.5" fill="none"/>
            <path d="M58 30 L64 34 L58 38" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
    `,

    maskAlignment: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="22" y="20" width="56" height="6" stroke="var(--accent)" stroke-width="3"/>
            <line x1="35" y1="26" x2="35" y2="64" stroke="var(--muted)" stroke-width="1.8" stroke-dasharray="2 3"/>
            <line x1="65" y1="26" x2="65" y2="64" stroke="var(--muted)" stroke-width="1.8" stroke-dasharray="2 3"/>
            <path d="M30 40 L40 40 M35 35 L35 45" stroke="var(--accent)" stroke-width="2"/>
            <path d="M60 40 L70 40 M65 35 L65 45" stroke="var(--accent)" stroke-width="2"/>
        </svg>
    `,

    uvExposure: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="58" width="64" height="8" fill="var(--muted)" opacity="0.5"/>
            <rect x="22" y="24" width="56" height="6" fill="var(--text)"/>
            <line x1="20" y1="12" x2="80" y2="12" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
            <path d="M30 16 L30 22 M45 16 L45 22 M60 16 L60 22 M75 16 L75 22" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
            <path d="M32 30 L28 58 M52 30 L48 58 M72 30 L68 58" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="2 2"/>
        </svg>
    `,

    resistDevelop: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="58" width="22" height="8" fill="var(--muted)" opacity="0.6"/>
            <rect x="60" y="58" width="22" height="8" fill="var(--muted)" opacity="0.6"/>
            <path d="M50 40 L50 54 M50 54 L46 50 M50 54 L54 50" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,

    wetEtch: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 66 L38 66 Q50 66 50 78 Q50 66 62 66 L82 66 L82 80 L18 80 Z"
                  fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M25 48 Q30 44 35 48 Q40 52 45 48 Q50 44 55 48 Q60 52 65 48 Q70 44 75 48"
                  stroke="var(--accent)" stroke-width="2" fill="none"/>
        </svg>
    `,

    dryEtch: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="44" y="66" width="12" height="14" fill="var(--panel)"/>
            <line x1="44" y1="66" x2="44" y2="80" stroke="var(--text)" stroke-width="2"/>
            <line x1="56" y1="66" x2="56" y2="80" stroke="var(--text)" stroke-width="2"/>
            <path d="M40 46 L44 50 L40 54 M60 46 L56 50 L60 54" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="50" cy="42" r="2.2" fill="var(--accent)"/>
        </svg>
    `,

    resistStrip: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="58" width="64" height="8" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="4 3"/>
            <path d="M50 50 L50 26 M50 26 L44 34 M50 26 L56 34" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,

    sacrificialRelease: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="30" y="52" width="40" height="6" fill="var(--accent)"/>
            <line x1="30" y1="58" x2="30" y2="66" stroke="var(--accent)" stroke-width="2.5"/>
            <line x1="70" y1="58" x2="70" y2="66" stroke="var(--accent)" stroke-width="2.5"/>
            <circle cx="40" cy="62" r="1.8" fill="var(--muted)"/>
            <circle cx="50" cy="64" r="1.4" fill="var(--muted)"/>
            <circle cx="60" cy="61" r="1.8" fill="var(--muted)"/>
        </svg>
    `,

    thermalOxidation: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <rect x="18" y="62" width="64" height="6" fill="var(--accent)" opacity="0.7"/>
            <path d="M30 92 Q33 88 30 84 Q27 88 30 92 M50 94 Q53 90 50 86 Q47 90 50 94 M70 92 Q73 88 70 84 Q67 88 70 92"
                  stroke="var(--muted)" stroke-width="2" fill="none"/>
        </svg>
    `,

    diffusionDoping: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <circle cx="28" cy="71" r="1.8" fill="var(--accent)"/>
            <circle cx="36" cy="75" r="1.5" fill="var(--accent)"/>
            <circle cx="44" cy="70" r="1.8" fill="var(--accent)"/>
            <circle cx="52" cy="76" r="1.4" fill="var(--accent)"/>
            <circle cx="60" cy="71" r="1.8" fill="var(--accent)"/>
            <circle cx="68" cy="74" r="1.5" fill="var(--accent)"/>
            <circle cx="74" cy="70" r="1.8" fill="var(--accent)"/>
            <path d="M30 56 L30 48 M50 56 L50 44 M70 56 L70 48" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/>
        </svg>
    `,

    ionImplant: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <path d="M30 28 L30 68 M30 64 L26 68 M30 64 L34 68" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M50 24 L50 68 M50 64 L46 68 M50 64 L54 68" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M70 28 L70 68 M70 64 L66 68 M70 64 L74 68" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="20" y1="74" x2="80" y2="74" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 2"/>
        </svg>
    `,

    anneal: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="66" width="64" height="14" rx="2" fill="var(--panel-light)" stroke="var(--text)" stroke-width="2.5"/>
            <circle cx="35" cy="72" r="1.8" fill="var(--accent)"/>
            <circle cx="50" cy="73" r="1.8" fill="var(--accent)"/>
            <circle cx="65" cy="72" r="1.8" fill="var(--accent)"/>
            <path d="M16 40 Q20 36 16 32 Q12 36 16 40 M84 40 Q88 36 84 32 Q80 36 84 40"
                  stroke="var(--muted)" stroke-width="2" fill="none"/>
            <path d="M30 22 Q33 18 30 14 Q27 18 30 22 M50 20 Q53 16 50 12 Q47 16 50 20 M70 22 Q73 18 70 14 Q67 18 70 22"
                  stroke="var(--muted)" stroke-width="2" fill="none"/>
        </svg>
    `

};
