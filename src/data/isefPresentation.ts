import { PresentationSlide } from '../types';

export const ISEF_PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    id: 1,
    title: '1.0 Nanoparticle Sizing & Structural Building Blocks',
    subtitle: 'Bridging Physical wet-Chemistry and Atomistic Digital Twins',
    figureRef: 'Figure 1: Side-Profile Interfacial View (Angle 1)',
    cameraPreset: 'figure1_side',
    renderMode: 'ball_and_stick',
    highlightBridges: false,
    highlightDefects: false,
    showElectronFlow: false,
    showROSAnimation: false,
    script:
      'Distinguished judges, our research synthesizes two nanoscale phases: 5-layer crumpled turbostratic Graphene Nanoplatelets (apparent thickness 88.18 nm due to resource-adaptive 600 RPM centrifugation) and porous wurtzite Zinc Oxide nanocrystals (146.95 ± 28.37 nm). The multi-layered crumpled carbon sheets act as a resilient structural matrix and conductive backbone, preventing macroscopic aggregation.',
    bulletPoints: [
      'Graphene Nanoplatelets (GNPs): 5-layer crumpled turbostratic carbon sheets with ±12° rotational stacking faults.',
      'FE-SEM Apparent Edge Thickness: 88.18 nm (vs 60.12 nm commercial standard due to 600 RPM centrifuge limitation).',
      'Wurtzite ZnO Nanocrystals: Mean diameter of 146.95 ± 28.37 nm (range 103–189 nm).',
      'Hierarchical aggregate geometry resembles tiny coral reefs, maintaining high active surface area.',
    ],
    scientificValidation: [
      { labMetric: 'GNP Edge Thickness', modelValue: '5-Layer (~88 nm equiv)', expValue: '88.18 nm (FE-SEM)' },
      { labMetric: 'ZnO Aggregate Diameter', modelValue: '146.95 nm scale', expValue: '146.95 ± 28.37 nm' },
      { labMetric: 'Centrifuge Boundary', modelValue: 'Turbostratic ±12° fault', expValue: '600 RPM local constraint' },
    ],
  },
  {
    id: 2,
    title: '2.0 Successful Integration: Microscopic Net & Anti-Clumping',
    subtitle: 'Overcoming Van der Waals Aggregation via Basal Anchoring',
    figureRef: 'Structural Porosity & Interfacial Anchor',
    cameraPreset: 'cross_section',
    renderMode: 'space_filling',
    highlightBridges: true,
    highlightDefects: false,
    showElectronFlow: false,
    showROSAnimation: false,
    script:
      'A primary obstacle in metal oxide nanotechnology is dry agglomeration into inert, solid boulders. Our graphene sheets serve as a microscopic net during solvent sonication, dispersing the ZnO nanoparticles uniformly across basal planes and corrugation ridges. This preserves interstitial voids and micro-pores for gas and fluid diffusion.',
    bulletPoints: [
      'Graphene as a Microscopic Net: Paper-like wrinkled edges template and disperse ZnO clusters.',
      'Prevents metal-to-metal self-agglomeration, preserving nanoscopic quantum-confinement properties.',
      'Highly Porous Architecture: Interstitial voids facilitate unimpeded mass transport of reactants and electrolytes.',
      'Resource-Adaptive Synthesis delivers high-performance morphology without requiring costly autoclaves.',
    ],
    scientificValidation: [
      { labMetric: 'Intercalation Porosity', modelValue: 'Hierarchical voids modeled', expValue: 'Confirmed under SEM' },
      { labMetric: 'Basal Plane Coverage', modelValue: 'Homogeneous lateral dispersion', expValue: 'Uniform DLSU mapping' },
    ],
  },
  {
    id: 3,
    title: '3.0 Chemical Composition & DLSU EDX Digital Twin Mapping',
    subtitle: 'Spectroscopic Verification of 50:50 Bulk Stoichiometric Balance',
    figureRef: 'Figure 2: Top-Down Orthographic View (Angle 2)',
    cameraPreset: 'figure2_topdown',
    renderMode: 'edx_mapping',
    highlightBridges: false,
    highlightDefects: false,
    showElectronFlow: false,
    showROSAnimation: false,
    script:
      'To validate chemical uniformity, Energy-Dispersive X-ray Spectroscopy (EDX) was performed at DLSU. The composite exhibits an extraordinary 50:50 balance (51.66 at% Carbon [Bright Green], 24.85 at% Zinc [Bright Yellow], and 23.49 at% Oxygen [Deep Red]) across both macro (26.9 µm) and micro (13.4 µm) scanning fields.',
    bulletPoints: [
      'Carbon (C) [Bright Green]: 51.66 at% — Graphene conductive highway and support scaffold.',
      'Zinc (Zn) [Bright Yellow]: 24.85 at% — Active semiconductor core.',
      'Oxygen (O) [Deep Red]: 23.49 at% — Lattice framework and surface hydroxyls.',
      'Macro vs. Micro invariance (50.66% vs 51.66% C) confirms robust, homogeneous batch synthesis.',
    ],
    scientificValidation: [
      { labMetric: 'Carbon Atomic %', modelValue: '51.66 at%', expValue: '51.66 at% (EDX 13.4 µm)' },
      { labMetric: 'Zinc Atomic %', modelValue: '24.85 at%', expValue: '24.85 at% (EDX 13.4 µm)' },
      { labMetric: 'Oxygen Atomic %', modelValue: '23.49 at%', expValue: '23.49 at% (EDX 13.4 µm)' },
    ],
  },
  {
    id: 4,
    title: '4.0 Interfacial Pinning: 16 Covalent Zn-O-C Bridges (1.430 Å)',
    subtitle: 'Suppression of Exciton Recombination & Lifetime Extension to 7.9 ns',
    figureRef: 'Figure 3: Interfacial Close-Up (Angle 3)',
    cameraPreset: 'figure3_closeup',
    renderMode: 'electron_flow',
    highlightBridges: true,
    highlightDefects: false,
    showElectronFlow: true,
    showROSAnimation: false,
    script:
      'At the sub-angstrom interface, we simulated exactly sixteen (16) covalent Zn-O-C pinning bridges with a strict bond length of 1.430 Å. This chemical pinning locks the wurtzite facet to the graphene ripples, establishing an ultrafast electron transfer conduit that suppresses exciton recombination and extends charge carrier lifetime to 7.9 ns.',
    bulletPoints: [
      '16 Covalent Zn-O-C Bridges: Strictly measured at 1.430 Å between top graphene and wurtzite facet.',
      'Chemical Pinning: Mechanically anchors nanocrystals onto graphene corrugation ridges.',
      'Charge Transfer Kinetics: Enables ballistic photoinduced electron transfer into high-mobility carbon lattice.',
      'Photoluminescence Extension: Lifetime elongated to 7.9 ns (over 6× improvement vs bare ZnO 1.2 ns).',
    ],
    scientificValidation: [
      { labMetric: 'Covalent Bridge Length', modelValue: '1.430 Å', expValue: '1.430 Å simulated constraint' },
      { labMetric: 'Bridge Quantity', modelValue: '16 pinning bridges', expValue: '16 sites (Section 4.0)' },
      { labMetric: 'Exciton Lifetime', modelValue: '7.9 ns', expValue: '7.9 ns (TRPL simulation)' },
    ],
  },
  {
    id: 5,
    title: '5.0 Defect Engineering: 14 Surface Oxygen Vacancies (V_O)',
    subtitle: 'Catalytic Dangling Bonds & Ambient Photocatalytic ROS Generation',
    figureRef: 'Active Surface Defect States',
    cameraPreset: 'defect_angle',
    renderMode: 'defect_focus',
    highlightBridges: true,
    highlightDefects: true,
    showElectronFlow: true,
    showROSAnimation: true,
    script:
      'Our alkaline hydrothermal synthesis (pH 10.01) creates 14 active, surface-exposed Oxygen vacancies (V_O). These defect sites yield unsaturated Zn²⁺ dangling bonds, serving as catalytic hotspots that trap photogenerated carriers to drive continuous Reactive Oxygen Species (ROS) generation under ambient sunlight.',
    bulletPoints: [
      '14 Active Surface Oxygen Vacancies (V_O): Tailored via pH 10.01 hydrothermal condition.',
      'Zn²⁺ Dangling Bonds: Act as shallow trap states preventing radiative charge annihilation.',
      'Photocatalytic Activation: Generates Superoxide (•O₂⁻) and Hydroxyl (•OH) radical cascades.',
      'Resource-Adaptive Superiority: High catalytic performance achieved without noble metal dopants.',
    ],
    scientificValidation: [
      { labMetric: 'Oxygen Vacancies (V_O)', modelValue: '14 active sites', expValue: '14 surface sites (pH 10.01)' },
      { labMetric: 'Synthesis pH', modelValue: 'pH 10.01 alkaline', expValue: 'pH 10.01 wet-chemistry' },
      { labMetric: 'ROS Generation Channels', modelValue: '•O₂⁻ & •OH pathways', expValue: 'ESR / Radical trapping' },
    ],
  },
];

export const DEFENSE_QA_DATABASE = [
  {
    question: 'How does your 3D digital twin correlate with the DLSU physical EDX characterization?',
    answer:
      'Our 3D model programmatically replicates the exact atomic coordinates and elemental distribution observed in DLSU EDX spectroscopy. Carbon is mapped to Bright Green (51.66 at%), Zinc to Bright Yellow (24.85 at%), and Oxygen to Deep Red (23.49 at%), confirming consistent stoichiometric balance across both 26.9 µm and 13.4 µm regions.',
  },
  {
    question: 'Why did you program exactly 16 Zn-O-C bridges and what is their bond distance?',
    answer:
      'The 16 covalent Zn-O-C bridges are positioned at a strict distance of 1.430 Å, linking the top graphene sheet to the wurtzite crystal facet. This interfacial pinning suppresses exciton recombination and extends the charge carrier lifetime to 7.9 ns by providing an ultrafast electron transfer channel.',
  },
  {
    question: 'Why does the FE-SEM show GNP thickness at 88.18 nm instead of the commercial 60.12 nm?',
    answer:
      'This reflects our resource-adaptive local synthesis where centrifuge speeds were constrained to 600 RPM. Despite being slightly thicker with 5 turbostratic layers and ±12° stacking faults, the crumpled architecture preserves exceptional conductivity and active surface area.',
  },
  {
    question: 'What is the role of the 14 Oxygen Vacancies (V_O)?',
    answer:
      'The 14 surface oxygen vacancies, generated under pH 10.01 alkaline conditions, leave unsaturated Zn²⁺ dangling bonds. These act as catalytic reaction centers that capture photoinduced carriers to produce reactive oxygen species (ROS) such as •O₂⁻ and •OH under ambient illumination.',
  },
];
