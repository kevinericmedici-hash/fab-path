/* ========================================
   EQUIPMENT ART
   Schematic line-art illustrations used by
   Game 2 — Spot the Equipment
======================================== */

const equipmentArt = {

    bunnySuit: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="18" r="11" stroke="var(--accent)" stroke-width="3.5"/>
            <path d="M39 27 L33 34 L28 86 Q28 90 32 90 L68 90 Q72 90 72 86 L67 34 L61 27"
                  stroke="var(--text)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
            <path d="M33 34 L16 48 L16 58 M67 34 L84 48 L84 58"
                  stroke="var(--text)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="50" y1="30" x2="50" y2="88" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="4 4"/>
            <line x1="40" y1="60" x2="60" y2="60" stroke="var(--muted)" stroke-width="2"/>
        </svg>
    `,

    gloves: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 88 L26 46 Q26 38 33 38 Q40 38 40 46 L40 60 L46 60 L46 32 Q46 25 52 25 Q58 25 58 32 L58 60"
                  stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
            <path d="M40 60 L40 88 L26 88" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round"/>
            <path d="M58 88 L58 50 Q58 43 64 43 Q70 43 70 50 L70 88 Z"
                  stroke="var(--text)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
    `,

    hoodBooties: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 42 Q22 16 50 16 Q78 16 78 42" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M18 42 L82 42" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="50" cy="30" r="3" fill="var(--muted)"/>
            <path d="M28 70 Q28 62 38 62 L66 62 Q74 62 74 70 Q74 82 58 82 L34 82 Q28 82 28 76 Z"
                  stroke="var(--text)" stroke-width="3.5" stroke-linejoin="round"/>
            <line x1="34" y1="70" x2="66" y2="70" stroke="var(--muted)" stroke-width="2" stroke-dasharray="3 3"/>
        </svg>
    `,

    hepaFilter: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="18" width="60" height="44" rx="4" stroke="var(--accent)" stroke-width="3.5"/>
            <polyline points="28,60 34,22 40,60 46,22 52,60 58,22 64,60 70,22 72,60"
                      stroke="var(--text)" stroke-width="2.5" stroke-linejoin="round"/>
            <line x1="35" y1="72" x2="35" y2="86" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
            <line x1="50" y1="72" x2="50" y2="90" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
            <line x1="65" y1="72" x2="65" y2="86" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
            <path d="M31 82 L35 88 L39 82 M46 86 L50 92 L54 86 M61 82 L65 88 L69 82"
                  stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,

    laminarHood: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 20 L84 20 L78 40 L22 40 Z" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round"/>
            <line x1="30" y1="46" x2="30" y2="62" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="43" y1="46" x2="43" y2="68" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="57" y1="46" x2="57" y2="68" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="70" y1="46" x2="70" y2="62" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M26 62 L30 70 L34 62 M39 68 L43 76 L47 68 M53 68 L57 76 L61 68 M66 62 L70 70 L74 62"
                  stroke="var(--text)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="14" y1="86" x2="86" y2="86" stroke="var(--muted)" stroke-width="3" stroke-linecap="round"/>
        </svg>
    `,

    airShower: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="14" width="64" height="72" rx="4" stroke="var(--accent)" stroke-width="3.5"/>
            <circle cx="50" cy="38" r="8" stroke="var(--text)" stroke-width="3"/>
            <line x1="50" y1="46" x2="50" y2="66" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
            <line x1="50" y1="52" x2="38" y2="62" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
            <line x1="50" y1="52" x2="62" y2="62" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
            <line x1="50" y1="66" x2="42" y2="80" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
            <line x1="50" y1="66" x2="58" y2="80" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
            <path d="M26 30 L34 34 M26 42 L34 44 M26 54 L34 54" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M74 30 L66 34 M74 42 L66 44 M74 54 L66 54" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `,

    spinCoater: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="55" r="32" stroke="var(--accent)" stroke-width="3.5"/>
            <circle cx="50" cy="55" r="16" stroke="var(--text)" stroke-width="3"/>
            <circle cx="50" cy="55" r="3" fill="var(--muted)"/>
            <path d="M50 23 Q64 30 66 44" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M62 40 L66 44 L70 39" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="30" cy="28" r="2.5" fill="var(--muted)"/>
            <circle cx="22" cy="40" r="2" fill="var(--muted)"/>
            <circle cx="74" cy="70" r="2.5" fill="var(--muted)"/>
        </svg>
    `,

    maskAligner: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="42" y="10" width="16" height="16" rx="2" stroke="var(--accent)" stroke-width="3"/>
            <circle cx="50" cy="18" r="3" fill="var(--muted)"/>
            <line x1="50" y1="26" x2="50" y2="40" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
            <rect x="30" y="40" width="40" height="8" stroke="var(--text)" stroke-width="3" stroke-linejoin="round"/>
            <line x1="50" y1="48" x2="50" y2="62" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 4"/>
            <rect x="24" y="62" width="52" height="10" rx="2" stroke="var(--text)" stroke-width="3"/>
            <line x1="36" y1="72" x2="30" y2="86" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
            <line x1="64" y1="72" x2="70" y2="86" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
        </svg>
    `,

    wetBench: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 18 L78 18 L70 32 L30 32 Z" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round"/>
            <line x1="50" y1="10" x2="50" y2="18" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
            <rect x="26" y="40" width="48" height="28" rx="3" stroke="var(--text)" stroke-width="3.5"/>
            <path d="M32 52 Q38 48 44 52 Q50 56 56 52 Q62 48 68 52" stroke="var(--muted)" stroke-width="2.2" fill="none"/>
            <line x1="34" y1="68" x2="30" y2="86" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
            <line x1="66" y1="68" x2="70" y2="86" stroke="var(--text)" stroke-width="3" stroke-linecap="round"/>
        </svg>
    `,

    plasmaEtcher: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="16" width="56" height="68" rx="8" stroke="var(--accent)" stroke-width="3.5"/>
            <rect x="32" y="34" width="36" height="6" rx="2" fill="var(--text)"/>
            <rect x="32" y="60" width="36" height="6" rx="2" fill="var(--text)"/>
            <path d="M40 44 L44 50 L38 54 L46 58" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            <path d="M56 44 L52 50 L58 54 L50 58" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            <circle cx="50" cy="50" r="3" fill="var(--accent)"/>
        </svg>
    `,

    lpcvdFurnace: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="38" width="80" height="26" rx="13" stroke="var(--accent)" stroke-width="3.5"/>
            <line x1="26" y1="44" x2="26" y2="58" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="36" y1="44" x2="36" y2="58" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="46" y1="44" x2="46" y2="58" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="56" y1="44" x2="56" y2="58" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="66" y1="44" x2="66" y2="58" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M14 24 Q22 30 14 36 M14 66 Q22 72 14 78 M86 24 Q78 30 86 36 M86 66 Q78 72 86 78"
                  stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        </svg>
    `,

    opticalMicroscope: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="18" r="8" stroke="var(--accent)" stroke-width="3.5"/>
            <path d="M60 26 L44 58" stroke="var(--text)" stroke-width="5" stroke-linecap="round"/>
            <path d="M44 58 L34 68" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
            <line x1="20" y1="72" x2="60" y2="72" stroke="var(--text)" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M18 88 Q18 78 30 78 L54 78 Q66 78 66 88" stroke="var(--text)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
            <circle cx="42" cy="70" r="2.5" fill="var(--muted)"/>
        </svg>
    `,

    sem: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="42" width="46" height="40" rx="5" stroke="var(--accent)" stroke-width="3.5"/>
            <circle cx="37" cy="62" r="10" stroke="var(--text)" stroke-width="3"/>
            <rect x="30" y="16" width="14" height="26" rx="3" stroke="var(--accent)" stroke-width="3.5"/>
            <line x1="37" y1="42" x2="37" y2="52" stroke="var(--text)" stroke-width="2.5" stroke-dasharray="2 3"/>
            <rect x="68" y="50" width="22" height="18" rx="2" stroke="var(--text)" stroke-width="3"/>
            <line x1="73" y1="56" x2="85" y2="56" stroke="var(--muted)" stroke-width="1.8"/>
            <line x1="73" y1="61" x2="85" y2="61" stroke="var(--muted)" stroke-width="1.8"/>
        </svg>
    `,

    profilometer: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 74 L34 74 L40 60 L52 60 L58 74 L86 74"
                  stroke="var(--text)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
            <line x1="80" y1="24" x2="46" y2="62" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="80" cy="24" r="5" stroke="var(--accent)" stroke-width="3"/>
            <circle cx="46" cy="62" r="2.5" fill="var(--accent)"/>
            <line x1="14" y1="80" x2="86" y2="80" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `,

    fumeHood: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="16" width="60" height="66" rx="4" stroke="var(--accent)" stroke-width="3.5"/>
            <line x1="20" y1="42" x2="66" y2="24" stroke="var(--text)" stroke-width="3.5" stroke-linecap="round"/>
            <rect x="30" y="52" width="40" height="24" stroke="var(--muted)" stroke-width="2.2"/>
            <path d="M40 10 L40 4 M50 10 L50 2 M60 10 L60 4" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    `,

    eyewash: `
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 62 Q26 78 50 78 Q74 78 74 62 Z" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round"/>
            <line x1="50" y1="78" x2="50" y2="90" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="38" y1="90" x2="62" y2="90" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M38 58 Q34 40 44 28" stroke="var(--text)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M62 58 Q66 40 56 28" stroke="var(--text)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="44" cy="28" r="2.5" fill="var(--muted)"/>
            <circle cx="56" cy="28" r="2.5" fill="var(--muted)"/>
        </svg>
    `

};
