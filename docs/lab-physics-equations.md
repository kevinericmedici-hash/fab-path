# Virtual Fab Lab: the equations behind every test

Written 2026-10-14 by reading the model code. Every equation below is what the code actually computes, with the file it lives in.

Each entry is tagged:

- **[physics]**: a textbook law or a numerical solution of one.
- **[fit]**: a simplified or empirical formula chosen to give realistic trends. It is not derived from first principles.
- **[luck]**: seeded random variation, so the devices in a batch scatter like real ones. The same seed always gives the same batch.

All models describe themselves as teaching-grade. They give the right trends and orders of magnitude, but the individual numbers are not validated against measurements. Property values are rounded textbook estimates; see the fact-check list in HANDOFF.md.

Symbols: F = 96,485 C/mol, R = 8.314 J/(mol·K), T = 310 K (37 °C) unless noted, k_B = Boltzmann's constant, ε₀ = 8.854×10⁻¹² F/m, ω = 2πf.

---

## 1. From your drawing to a device (all labs)

File: `lab-engine.js`, `fabricate()`, plus `lab-geometry.js`.

| Step | What is computed | Tag |
|---|---|---|
| Lithography bias | Each shape grows or shrinks by b/2 on every side (b is set by the resist, dose and develop). Cut shapes (holes) take −b/2. | [physics]-ish + [luck] |
| Misalignment | Each layer shifts by (dx, dy), drawn from the aligner's accuracy | [luck] |
| Holes | Cut shapes are subtracted exactly with polygon Boolean operations (Clipper) | [physics] (geometry) |
| Pixel grid | Every layer is rasterised; the pixel size is chosen from the smallest feature | numerical |
| Areas, gaps, features | Union area and perimeter from the raster; smallest feature and gap from polygon distances | geometry |
| Connectivity | Connected-component labelling finds which pieces touch: nets, shorts and opens | geometry |
| Conductor resistance | Sheet conductance g = σ·t per pixel; the current-flow (Laplace) equation is solved on the grid between two contacts (`solveSheet`, `solveTwoTerminal`) | [physics] (numerical) |
| Pattern quality | Resolution, dose, develop, aspect ratio and bake each give a 0–1 factor, multiplied into a quality score that scales conductivity, capacitance and short risk | [fit] |

So site area, trace length and width, comb gaps and channel shape all come from the mask you drew, after the process changes them.

---

## 2. Neural probe (Neural Interface Chip lab)

Files: `lab-neural-engine.js` (geometry), `lab-neural-model.js` (tests).

### Geometry fed into the tests
- Site area A = exposed metal pixels (not under insulation) × pixel area. Equivalent radius r = √(A/π). [geometry]
- Trace resistance R_trace = numerical sheet-resistance solve from the site to its pad. [physics]
- Trace parasitic capacitance C_par = ε₀·ε_ins·A_trace / t_ins. [physics]
- Pinhole chance p = 1 − exp(−defect density × trace area). [physics] (Poisson)
- Crosstalk coupling ≈ 0.35·ε₀·ε_eff × (facing trace length); crosstalk fraction = C_x / (C_x + C_amp + C_par). [fit]

### Electrode interface (shared by every test)
- Capacitance density q = q_metal·roughness·(1 − coating cover) + Σ coatings (q per µm × thickness, capped at a saturation thickness). [fit]
- Constant-phase exponent α = area-weighted average, clamped to 0.7–0.98. [fit]
- Material table (per metal): q, α, charge storage capacity (CSC), peroxide activity, dopamine sensitivity, k⁰, roughness. [fit] (textbook-scale values)

### EIS
Equivalent circuit at each frequency:

- Double layer (constant-phase element): Y_CPE = Q·A·(jω)^α. [physics]
- Charge-transfer resistance, in a redox solution: R_ct = RT / (F²·k⁰·C·A_true) (linearised Butler–Volmer, written in the code as 1/(F²/RT·k⁰·5×10⁻⁶·A)/4). With no redox couple R_ct ≈ 5×10⁶ / A (a large leak). [physics] / [fit]
- Spreading resistance of a disk: R_s = ρ / (4r) (Newman). [physics]
- Total: Z = R_s + R_trace + 1/(Y_CPE + 1/R_ct), then in parallel with the trace's parasitic C: Z / (1 + jωC_par·Z). C_par grows 2% per day of soaking. [physics]
- Measurement noise: 1% (3% below 10 Hz). [luck]

### Cyclic voltammetry (CV)
- Charging current i = C_eff·ν·(±1), with C_eff = Q·A·ω_eq^(α−1) and ω_eq = 2π·ν / (2·ΔE). [physics]
- **Ferri/ferrocyanide redox (the "ferro" solution):** a finite-difference solution of Fick's second law, ∂c/∂t = D·∂²c/∂x², for both forms at once, with Butler–Volmer kinetics at the surface:
  k_f = k⁰·exp(−0.5·f·(E − E⁰)), k_b = k⁰·exp(+0.5·f·(E − E⁰)), f = F/RT, flux j = k_b·c_R − k_f·c_O.
  The applied potential is corrected by iR drop (R_s + R_trace). Values used: D = 7×10⁻⁶ cm²/s, 5 mM of each form, E⁰ = 0.22 V. Two cycles are run and the second is kept. [physics] (numerical)
- Platinum and gold oxide and hydrogen features, and iridium oxide redox: Gaussian peaks scaled by the charge storage capacity. [fit]
- Water splitting: an exponential current beyond −0.7 V and +1.0 V. [fit]
- Measured CSC = ∫ cathodic |i| dE / ν ÷ A. [physics] (data analysis)

**Check against Randles–Sevcik (run 2026-10-14, silicon probe, 333 µm² glassy carbon site):**

| Scan rate (V/s) | Simulated peak (nA) | Randles–Sevcik (nA) | Ratio | ΔE_p (mV) |
|---|---|---|---|---|
| 0.01 | 2.79 | 1.51 | 1.85 | 58 |
| 0.1 | 8.48 | 4.76 | 1.78 | 70 |
| 1 | 25.2 | 15.1 | 1.67 | 93 |

- The peaks scale as ν^0.48 (theory: ν^0.5), and ΔE_p widens with scan rate the way Nicholson's theory predicts for a quasi-reversible couple (k⁰ = 0.02 cm/s).
- The absolute peaks are about 1.7–1.85× the plain Randles–Sevcik value, i_p = 0.4463·n·F·A·C·√(nFνD/RT). The likely reason is that the simulated solution holds both forms at 5 mM, and the reverse sweep piles extra reduced species next to the electrode, whereas Randles–Sevcik assumes only one form is present at the start. The peak is also read from zero current rather than from an extrapolated baseline.
- The model does not include radial (edge) diffusion. At disks below about 10 µm radius and slow scans, real electrodes give more current than this.

### Dopamine
- **Constant-potential amperometry:** steady-state current of a disk, i = 4·n·F·D·r·C, with n = 2, D = 6×10⁻⁶ cm²/s and r_eff = r·√(roughness, capped at 40). It is then multiplied by the coating's blocking factor and a material factor (0.5 + 0.5·min(da/90, 5)). [physics] × [fit]
- **Fast-scan cyclic voltammetry (FSCV):** sensitivity S = da (material or coating constant, µA/µM/cm²) × A × blocking factor. [fit]
  - Background charging current i_bg = C_eff·400 V/s, with C_eff from the constant-phase element at the scan's frequency. [physics]
  - Noise σ = √((100 pA)² + (0.0006·i_bg)²). [fit]
  - Calibration: i = S·c / (1 + c/25 µM) (saturation) + noise, fitted with a straight line through the low points. Limit of detection = 3σ / slope. [fit] + [physics] (analysis)
  - Voltammogram shape: Gaussian oxidation peak at +0.6 V and reduction peak at −0.2 V, shifted by iR drop. [fit]
  - Release event: dc/dt = −V_max·c/(K_m + c) (Michaelis–Menten uptake), V_max = 4 µM/s, K_m = 0.2 µM. [physics]
  - Interferents: ascorbate seen at 1% in FSCV (80% in amperometry), multiplied by the coating's anion pass-through. [fit]

### Glutamate (enzyme sensor with a sentinel)
- Sensitivity = 3·A·peroxide activity·enzyme activity (× √roughness/2 when roughness > 1.8). [fit]
- Ascorbate current on any site: disk equation 4nFDrC × roughness × 0.4 × anion pass-through. [physics] × [fit]
- Response time τ = 3 s + 20 s × enzyme thickness (µm), applied as first-order steps, 1 − exp(−t/τ). [fit]
- Enzyme activity halves every 14 days. [fit]
- Sentinel subtraction and line fit as a lab would do. [analysis]

### Recording spikes
- Thermal noise: v_n² = ∫ 4·k_B·T·Re(Z(f)) df over 300–6,000 Hz, using tissue resistivity. Total noise adds 3 µV and 9 µV terms in quadrature. [physics]
- Amplifier divider: |Z_in| / |Z_in + Z_electrode|, with Z_in = R_amp ∥ (C_amp + C_par). [physics]
- Spike amplitude vs distance: 400 µV / (1 + d/12 µm), times a site-size averaging factor 1/(1 + (r/(d+10))²). [fit]
- Spike times: Poisson process with a 2 ms dead time. Detection uses a 4.5σ threshold, σ = median|x| / 0.6745. [physics] / [analysis]
- Scar thickness: (8 + 45·stiffness factor·√size)·(1 − e^(−weeks/2.2)) µm, added to the neuron distance. [fit]

### A month in saline
- Insulation lift time: exponential with hazard ∝ (1.4 − adhesion·quality) / √thickness × (1 + 4·pinhole chance). [fit] + [luck]
- When lifted, |Z| falls by 1/(1 + days since lift); a corroded base metal goes open (|Z| × 30). [fit]

### Insertion
- Euler buckling P_cr = π²·E·I / L², with I = w·t³/12. [physics]
- Insertion force = 5×10⁵ N/m² × tip cross-section + 30 µN. [fit]
- Buckles if P_cr < insertion force.

---

## 3. Supercapacitor

File: `supercap-lab-model.js`.

### Build
- Mass = density × N·w·t·L. [physics]
- Specific capacitance = double-layer part + pseudocapacitance:
  C_EDL = specific surface area × utilisation × areal capacitance of the electrolyte × ion access (1 − micropore fraction × ion size × 0.9). [physics] (simplified) × [fit]
- Cell capacitance (two symmetric electrodes in series) C_cell = C_spec·m·quality / 4. [physics]
- Resistances (equivalent series resistance, ESR):
  - finger R_f = L / (σ_eff·w·t), electrode R_el = 4·R_f / (3N) [physics]
  - electrolyte gap R_gap = ρ·g / (L·t_c·(N − 1)) [physics]
  - pore resistance R_pore = 6·ρ·path / (L·N·(w + t)) [fit]
  - ESR = R_contact + R_el + R_gap + R_pore/3 [physics] (porous-electrode convention)
- Voltage window: set by the electrolyte, and by the material's limit in water. [fit]
- Cycle life: material × electrolyte × exp(−(t − 15 µm)/30) for thick films × adhesion. [fit]

### Tests
- **CV:** an RC circuit driven by a triangle wave, dV_c/dt = (V_applied − V_c) / (ESR·C(V)). C(V) is flat for a double layer, with a Gaussian hump for pseudocapacitance. A leak R_leak = τ_sd/C is included. Current i = C·dV_c/dt + V_c/R_leak. [physics] + [fit] (shape)
- **Capacitance from CV:** C = ∫|i|dV / (2·ν·ΔV). [physics] (standard analysis)
- **Charge-discharge (GCD):** dV_c/dt = ±I / C(V); terminal voltage V = V_c ± I·ESR; IR drop = 2·I·ESR; C = I·t_discharge / ΔV. [physics]
- **EIS:** de Levie transmission line for a porous electrode,
  Z = R_s + (R_p/√(jωR_pC))·coth√(jωR_pC) + R_ct ∥ C_i (pseudocapacitive charge transfer). [physics]
- **Cycling:** retention = 100%·exp(−n / life), shortened above 90% of the voltage window. [fit]
- **Metrics:** energy E = ½·C·V², power P = V²/(4·ESR), coulombic efficiency t_dis/t_ch, all per footprint area. Ragone plot from GCD runs at several currents. [physics]

### Stacked cell formats: coin, pouch and jelly roll

File: `supercap-cells.js`. These are chosen in the Process step or picked as a starting template. The drawing is one electrode sheet (the coating on its foil). The cell uses two identical sheets with a separator between them.

- **Facing area:** A_f = A_sheet × faces. Coin: 1 face. Pouch with n sheets per electrode: 2n − 1 faces. Jelly roll: 2 faces (both sides of each strip are coated and touch the separator). [geometry]
- **Capacitance:** C = c_spec × m_electrode × quality / 2. The two electrodes are in series. c_spec comes from the same material and electrolyte model as the planar chip. [physics]
- **Separator:** R_sep = ρ × N_M × t_sep / A_f. N_M is the MacMullin number (tortuosity² / porosity): about 2 for glass fibre, 4 for cellulose, 8–10 for polyolefin membranes. N_M is multiplied by 2.5 when a hydrophobic separator is used with a water-based electrolyte. [physics] + [fit]
- **Pores:** R_pore = 2ρ × N_film × t_film / A_f, with N_film = 3(1 + 2 × micropore fraction × ion size). It enters the ESR as R_pore / 3, the de Levie low-frequency limit. [physics] + [fit]
- **Through the film:** R_film = 2 t_film / (σ_film × A_f). [physics]
- **Foil to tab:** R_col = 2 × R_sheet × (path / width) / 3, assuming current is picked up evenly along the sheet. Pouch: the path runs down the sheet height, and the sheets are in parallel (÷ n). Jelly roll: the path is the strip length, with one tab at the end. Coin: the current passes straight into the case. Without a foil, the film's own sheet resistance carries the current. [physics]
- **Contacts:** coin 0.4 Ω (spring, spacer and case; +0.6 Ω with no foil), pouch 10 mΩ, jelly roll 10 mΩ. [fit]
- **ESR** = contacts + R_col + R_film + R_sep + R_pore / 3.
- **Size:**
  - Coin: a CR2032 case (20 mm × 3.2 mm, 2.6 g).
  - Pouch: stack thickness = 2n·t_foil + faces × (2 t_film + t_sep), plus 5 mm seals and the laminate walls.
  - Jelly roll: D = √(D_mandrel² + 4 × L × t_turn / π), with t_turn = 2 t_foil + 4 t_film + 2 t_sep. Height = strip width + 8 mm.
  - [geometry]
- **Cell mass:** active film + aluminium foil + separator + electrolyte (1.2 g/cm³ filling 60% of the film and the separator's pores) + case. Reported as Wh/L, Wh/kg and W/kg. [physics] (estimate)
- **Shorts:** p = 1 − exp(−defects × A_f × (1 + t_film / 100 µm)). Defects per cm²: cellulose 2×10⁻⁵, polypropylene 5×10⁻⁵, thin polyethylene 5×10⁻⁴, glass fibre 0. A coin electrode wider than the 19 mm separator always shorts. [fit] + [luck]
- **Life:** material × electrolyte, cut for films over 150 µm. Non-noble foil in a water-based electrolyte corrodes (×0.1 in acid, ×0.4 otherwise). [fit]

Default templates (activated carbon 80 µm on 20 µm aluminium, organic electrolyte) come out at about 0.15 F and 1.3 Ω (coin), 33 F and about 13 mΩ (pouch, 10 sheets), and 21 F and 21 mΩ (jelly roll, 14 × 48 mm can). A commercial 18650-size cell is 25–50 F and about 20 mΩ. The energy density is roughly half that of commercial cells, because the activated-carbon model gives about 45 F/g per electrode against the real 100–120 F/g.

---

## 4. Glucose sensor (CGM)

File: `lab-cgm-model.js`.

- **Diffusion through the films:** each film is a mass-transfer resistance R = Σ cover·t/D (glucose and oxygen separately), plus a stagnant boundary layer, the fibrous capsule and fouling. Permeability P = 1/R. [physics]
- **Enzyme kinetics:** ping-pong glucose oxidase, rate = V·G_e/(K_g + G_e)·O_e/(K_o + O_e). For the osmium-wired enzyme: rate = V·G_e/(K_g + G_e)·(1 − 0.25·O/(O + 0.05)). V = capacity per µm × thickness × activity. [physics]
- **Steady state:** the code solves (by bisection) for the rate at which diffusion supply balances consumption: G_e = G − rate/P_g, O_e = O − rate/P_o. [physics] (numerical)
- **Current:** i = 2·F·A·roughness·rate·η. The collection efficiency η is a sigmoid in potential around the metal's peroxide onset (or the mediator's), times peroxide pass-through of inner films. [physics] × [fit]
- **Interferents:** diffusion conductance k = 1/(1/k_s + R) through the films × film rejection (1 − rej·(1 − e^(−t/t_ref))) × a sigmoid potential gate; i = 2F·A·roughness·activity·k·c. [physics] × [fit]
- **Response time:** τ = Σ t²/(2D) over the films, capsule and boundary layer. [physics]
- **Counter electrode limit:** the current saturates as i_lim·tanh(i/i_lim) when the counter is too small. [fit]
- **Noise:** σ = √((20 pA)² + (0.3%·i)²). [fit]
- **Wear:** enzyme half-life, capsule growth, first-day oxygen dip, insulation lift and reference drift over days. [fit]
- **Calibration and accuracy:** a linear fit; mean absolute relative difference (MARD) against a simulated blood glucose day; two-point fingerstick calibration. [analysis]

---

## 5. Blood-brain barrier chip

File: `lab-bbb-model.js`.

- **Wall shear stress:** parallel-plate flow, τ = 6·μ·Q / (w·h²). [physics]
- **Flow:** pressure drop ΔP = R_hyd·Q; Reynolds number Re = ρ·v·D_h/μ with D_h = 2wh/(w + h). [physics]
- **Cell response to shear:** tightness boosted around the ideal shear (log-normal bump), reduced above 40 dyn/cm². [fit]
- **TEER over the days:** coverage follows a logistic curve around the confluence day; tight junctions mature as 1 − e^(−t/τ_tj). Cells and bare membrane conduct in parallel: 1/TEER = cover/T_cells + (1 − cover)/R_open. Contamination and bubbles happen at random. [fit] + [physics] (parallel conductance) + [luck]
- **EIS:** Z = R_s + Z_CPE,A + Z_CPE,B + (R_b ∥ C_b). The series resistance includes the medium and the membrane pores, ρ·t_m/(porosity·A). The code then fits R_s, R_b, C_b and Q to the noisy spectrum with a simplex search, as a lab would. [physics]
- **Permeability:** three barriers in series: unstirred water (D/δ), membrane pores with Renkin hindrance φ = (1 − λ)²·(1 − 2.104λ + 2.09λ³ − 0.95λ⁵), λ = Stokes radius / pore radius, and the cell layer (paracellular part scaled by 1/TEER). Plus P-gp efflux and pressure-driven flow through the pores (Poiseuille, L_p = porosity·r²/(8μt)). Stokes–Einstein gives the solute radius. [physics] + [fit]

---

## 6. MOSFET and BioFET

File: `lab-fet-model.js`, plus `lab-fet-engine.js`.

- **Gate capacitance:** the drawn layers in series, 1/C_g = Σ t/(ε₀ε). [physics]
- **In liquid:** Debye length λ_D = 0.304/√I nm (I = ionic strength in M). Double layer = Stern (0.2 F/m²) in series with diffuse (ε₀·78/λ_D). [physics]
- **Threshold:** from the work-function difference (gate metal vs semiconductor), oxide fixed charge divided by C_g, and interface traps. [physics]
- **Drain current:** smooth above- and below-threshold model.
  - Overdrive V_ov = n·φ_T·softplus(V_GS/(n·φ_T)); subthreshold factor n from interface traps.
  - Mobility μ_eff = μ₀/(1 + 0.1·V_ov).
  - I_D = G_ch·(V_sat/2)·tanh(2·V_DS/V_sat)·(1 + λ·V_DS).
  - G_ch is computed over the actual drawn channel shape on the pixel grid (non-uniform gating is solved numerically).
  - Source and drain series resistance are included by iteration.
  - [physics] (compact model) + numerical.
- **Contact barrier:** set by the metal work function against the semiconductor's electron affinity. [fit]
- **Extraction:** peak transconductance, linear-extrapolated threshold, field-effect mobility from the drawn W/L, subthreshold swing. [analysis]
- **BioFET sensing:** pH and charge shift the surface potential (Nernst/site-binding behaviour, screened by the Debye length). Trap noise ∝ 1/√area. Detection limit = first concentration beating 3σ. Drift from ion uptake and charge trapping. [physics] + [fit]

---

## 7. MEMS (accelerometer, gyroscope, micromirror)

Files: `lab-mems-solver.js` (finite elements), `lab-mems-model.js` (sensing), `lab-mems-engine.js` (fabrication and release).

- **Structure:** a 3D frame finite-element model. Every thin spring is an Euler–Bernoulli beam element (12×12 stiffness: axial, torsion, bending in two planes). Blocks that touch are rigid bodies, comb fingers add mass, and anchors are fixed. [physics] (FEM)
- **Modes:** K·φ = ω²·M·φ, solved with Jacobi eigenvalues after condensing massless freedoms. f = ω/2π. [physics]
- **Static response:** K·u = F for an acceleration or a force. Stress in each beam from its end displacements; failure at fracture strength. [physics]
- **Release:** HF etches a limited distance from open edges and release holes (etch rate × time). Unreleased oxide holds parts down. Stiction during drying depends on the meniscus, the drying method and dimples. [physics] (simplified) + [luck]
- **Sensing capacitance:** facing finger edges summed as parallel plates, C = ε₀·A/g, with differential near and far gaps. Gas slip correction for micron gaps. [physics]
- **Electrostatic spring softening:** −½·V²·∂²C/∂x². Large-motion stiffening as beams stretch. [physics]
- **Air damping:** squeeze film across the gap and Couette shear along it (with slip correction), giving the quality factor Q. [physics]
- **Accelerometer:** displacement x = a/ω₀²; bandwidth = the −3 dB point of the second-order response; Brownian noise √(4·k_B·T·b)/m plus electronics. [physics]
- **Gyroscope:** comb drive force F = V_dc·V_ac·dC/dx; Coriolis force F = 2·m·Ω·v_x; sense response at the drive frequency; quadrature from cross-stiffness; rate noise √(4k_BTb)/(2mAω). [physics]
- **Micromirror:** torque τ = ½·V²·dC/dθ integrated over the electrode cells; pull-in when the electrostatic torque curve overtakes the torsion spring; dynamics J·θ'' + c·θ' + k·θ = τ(V, θ) integrated in time with a hard landing stop. Curl from film stress (Stoney). Hinge fatigue from stress amplitude. [physics] + [fit] (fatigue)

---

## Where the physics could be tightened

1. **FSCV dopamine is the most empirical test.** At carbon electrodes, dopamine in FSCV is adsorption-controlled, so its peak follows the surface-confined (Laviron) relation i_p = n²·F²·ν·A·Γ / (4RT), where Γ is the adsorbed amount (from an isotherm). The current scales with ν, not √ν. Replacing the material constant "da" with Γ from a Langmuir isotherm would make FSCV derive from physics like the ferri/ferrocyanide CV already does.
2. **Radial diffusion at small disks.** Adding the steady-state disk term (4nFDrC) to the planar finite-difference CV would make microelectrodes behave correctly at slow scans.
3. **Calibrate against real data.** One measured impedance at 1 kHz and one CV per material and site size would let the material tables (q, α, CSC, da) be fitted rather than estimated.
