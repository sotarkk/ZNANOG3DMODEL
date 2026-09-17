export interface TourCallout {
  label: string;
  bondType: string;
  bondLength: string;
  description: string;
  target3D: [number, number, number];
  arrowOffset: [number, number, number];
  badgeColor: string;
}

export interface TourMiniExplanation {
  whatYouSee: string;
  mechanism: string;
  significance: string;
}

export interface TourChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  duration: number; // duration in seconds
  startTime: number; // accumulated start time
  endTime: number;   // accumulated end time
  camStart: {
    pos: [number, number, number];
    lookAt: [number, number, number];
  };
  camEnd: {
    pos: [number, number, number];
    lookAt: [number, number, number];
  };
  curveType: 'linear' | 'zoom_in';
  highlightFocus: 'macro' | 'gnp_basal' | 'bridges' | 'defects' | 'electron_flow' | 'complete';
  badge: string;
  badgeColor: string;
  narration: string;
  metrics: { label: string; value: string }[];
  callout: TourCallout;
  explanation: TourMiniExplanation;
}

export const TOUR_CHAPTERS: TourChapter[] = [
  {
    id: 'whole_structure_overview',
    number: 1,
    title: 'Main Overview: Whole Nanocomposite Structure',
    subtitle: 'Wurtzite Zinc Oxide Heterojunction on 5-Layer Graphene Nanoplatelet Stack',
    duration: 8,
    startTime: 0,
    endTime: 8,
    camStart: {
      pos: [-18.0, -28.0, 16.5],
      lookAt: [0.0, 0.0, 2.0],
    },
    camEnd: {
      pos: [-16.0, -26.0, 15.0],
      lookAt: [0.0, 0.0, 2.0],
    },
    curveType: 'linear',
    highlightFocus: 'macro',
    badge: '1.0 Whole Structure',
    badgeColor: '#38bdf8',
    narration: '',
    metrics: [
      { label: 'Total Atoms', value: '476 Atoms' },
      { label: 'Graphene Base', value: '5-Layer Nanoplatelet' },
      { label: 'Semiconductor', value: 'Hexagonal Wurtzite ZnO' },
    ],
    callout: {
      label: 'ZnO-GNP Nanocomposite (Whole Structure)',
      bondType: 'Macro Heterojunction Architecture',
      bondLength: '5-Layer GNP / ZnO Dome',
      description: 'Global overview: 5-layer graphene nanoplatelet stack intercalated with a 240-atom wurtzite ZnO hemisphere.',
      target3D: [0.0, 0.0, 2.0],
      arrowOffset: [0, 0, 0],
      badgeColor: '#38bdf8',
    },
    explanation: {
      whatYouSee: 'Elevated 3/4 isometric perspective displaying the 5 stacked basal graphene sheets below (carbon in green/cyan) cradling the faceted hemispherical wurtzite ZnO nanocrystal above (Zn²⁺ yellow, O²⁻ red).',
      mechanism: 'Combines the ultra-high electron mobility of 2D graphene with the wide-bandgap ultraviolet/visible absorption of polar wurtzite zinc oxide.',
      significance: 'Prevents standard nanoparticle agglomeration and forms an ultra-stable, high-surface-area heterojunction.',
    },
  },
  {
    id: 'zno_polar_bonds',
    number: 2,
    title: 'Wurtzite Zn-O Polar Bonds',
    subtitle: 'Tetrahedral Coordination Core: Zn²⁺ (Yellow) & O²⁻ (Red)',
    duration: 8,
    startTime: 8,
    endTime: 16,
    camStart: {
      pos: [-16.0, -26.0, 15.0],
      lookAt: [-0.50, -6.17, 6.21],
    },
    camEnd: {
      pos: [1.2, -12.2, 7.2],
      lookAt: [-0.50, -6.17, 6.21],
    },
    curveType: 'zoom_in',
    highlightFocus: 'macro',
    badge: '2.0 Zn-O Bonds',
    badgeColor: '#eab308',
    narration: '',
    metrics: [
      { label: 'Bond Length', value: '1.980 Å' },
      { label: 'Coordination', value: 'Tetrahedral (sp³)' },
      { label: 'Bandgap', value: '3.37 eV Semiconductor' },
    ],
    callout: {
      label: 'Wurtzite Zn-O Polar Bond (1.980 Å)',
      bondType: 'Tetrahedral Coordination (Zn²⁺ — O²⁻)',
      bondLength: '1.980 Å',
      description: 'Front surface perspective: polar tetrahedral bond between Zn²⁺ (Yellow) and O²⁻ (Red) in the wide-bandgap semiconductor lattice.',
      target3D: [-0.50, -6.17, 6.21],
      arrowOffset: [0, 0, 0],
      badgeColor: '#eab308',
    },
    explanation: {
      whatYouSee: 'Macro close-up along the crystal facet revealing the 1.980 Å polar covalent bond joining four-fold coordinated Zn²⁺ cations (Yellow) to O²⁻ anions (Red).',
      mechanism: 'Photon absorption excites valence band electrons to the conduction band (3.37 eV bandgap), generating mobile electron-hole (e⁻/h⁺) pairs.',
      significance: 'Maintains long-range wurtzite crystallinity while producing high-energy charge carriers upon illumination.',
    },
  },
  {
    id: 'zn_o_c_bridges',
    number: 3,
    title: '16 Covalent Zn-O-C Interfacial Bridges',
    subtitle: 'Direct Sub-Angstrom (1.430 Å) Chemical Pinning Uniting Zn, O, and C',
    duration: 8,
    startTime: 16,
    endTime: 24,
    camStart: {
      pos: [1.2, -12.2, 7.2],
      lookAt: [1.79, -4.92, 1.15],
    },
    camEnd: {
      pos: [3.25, -10.4, 3.2],
      lookAt: [1.79, -4.92, 1.15],
    },
    curveType: 'zoom_in',
    highlightFocus: 'bridges',
    badge: '3.0 Zn-O-C Bridges',
    badgeColor: '#f43f5e',
    narration: '',
    metrics: [
      { label: 'Bridge Count', value: '16 Covalent Anchors' },
      { label: 'Bond Distance', value: '1.430 Å' },
      { label: 'Charge Transfer', value: '< 0.35 ns Ballistic Tunneling' },
    ],
    callout: {
      label: 'Covalent Zn-O-C Bridge (1.430 Å)',
      bondType: 'Hetero-Interface Chemical Pinning (Zn-O-C Triad)',
      bondLength: '1.430 Å',
      description: 'Interface profile view: intermediate Red Oxygen bridge (Z=1.15) covalently locking Zn²⁺ above to the GNP carbon sheet below.',
      target3D: [1.79, -4.92, 1.15],
      arrowOffset: [0, 0, 0],
      badgeColor: '#f43f5e',
    },
    explanation: {
      whatYouSee: 'Angled interface cross-section highlighting the intermediate Red Oxygen atom (Z=1.15) chemically bonded simultaneously to Zn²⁺ above (1.35, -5.23, 3.08) and Carbon below (2.24, -4.61, 0.47).',
      mechanism: 'Acts as an ohmic quantum conduit: photogenerated electrons instantaneously tunnel from ZnO to the graphene sheets in under 0.35 nanoseconds.',
      significance: 'Drastically suppresses charge recombination and prevents nanoparticle detachment during ultrasonic and aqueous operation.',
    },
  },
  {
    id: 'cc_graphene_bonds',
    number: 4,
    title: 'Aromatic C-C Graphene Lattice',
    subtitle: 'Delocalized sp² Conjugated Carbon Honeycomb Backbone (Green)',
    duration: 8,
    startTime: 24,
    endTime: 32,
    camStart: {
      pos: [3.25, -10.4, 3.2],
      lookAt: [-5.2, -8.5, 0.0],
    },
    camEnd: {
      pos: [-5.20, -12.2, 5.3],
      lookAt: [-5.2, -8.5, 0.0],
    },
    curveType: 'zoom_in',
    highlightFocus: 'gnp_basal',
    badge: '4.0 C-C Bonds',
    badgeColor: '#10b981',
    narration: '',
    metrics: [
      { label: 'Bond Length', value: '1.421 Å' },
      { label: 'Hybridization', value: 'Planar sp²' },
      { label: 'Mobility', value: '~200,000 cm²/V·s Highway' },
    ],
    callout: {
      label: 'Aromatic C-C Bond (1.421 Å)',
      bondType: 'sp² Conjugated Honeycomb Ring',
      bondLength: '1.421 Å',
      description: 'Elevated top-down view of hexagonal honeycomb ring: delocalized π-electrons provide ballistic charge conduction.',
      target3D: [-5.2, -8.5, 0.0],
      arrowOffset: [0, 0, 0],
      badgeColor: '#10b981',
    },
    explanation: {
      whatYouSee: 'Planar 55° downward perspective framing the hexagonal honeycomb carbon rings with uniform 1.421 Å aromatic bond lengths across the graphene sheet.',
      mechanism: 'sp² hybridized planar sigma bonds provide mechanical stiffness, while continuous out-of-plane π-orbitals create a ballistic electron conduction highway (~200,000 cm²/V·s).',
      significance: 'Rapidly shuttles collected conduction electrons across the sheet to reduce dissolved oxygen into superoxide radicals (•O₂⁻).',
    },
  },
  {
    id: 'vdw_interlayer_gap',
    number: 5,
    title: 'Turbostratic Van der Waals Gap (3.42 Å)',
    subtitle: '5-Layer Graphene Stacking with 12.5° Rotational Mismatch',
    duration: 8,
    startTime: 32,
    endTime: 40,
    camStart: {
      pos: [-5.20, -12.2, 5.3],
      lookAt: [-7.0, -14.5, -1.68],
    },
    camEnd: {
      pos: [-7.0, -22.5, -1.0],
      lookAt: [-7.0, -14.5, -1.68],
    },
    curveType: 'zoom_in',
    highlightFocus: 'gnp_basal',
    badge: '5.0 Van der Waals Gap',
    badgeColor: '#a855f7',
    narration: '',
    metrics: [
      { label: 'Layer Spacing', value: '3.42 Å' },
      { label: 'Turbostratic Angle', value: '12.5° Misorientation' },
      { label: 'Restacking', value: 'Suppressed by Twist' },
    ],
    callout: {
      label: 'Van der Waals Interlayer Gap (3.42 Å)',
      bondType: 'Interlayer π-π Molecular Cushion',
      bondLength: '3.420 Å',
      description: 'Edge-on cross-section view: clear horizontal 3.42 Å gap between stacked graphene sheets prevents graphitic agglomeration.',
      target3D: [-7.0, -14.5, -1.68],
      arrowOffset: [0, 0, 0],
      badgeColor: '#a855f7',
    },
    explanation: {
      whatYouSee: 'Direct edge-on horizontal cross-section showing parallel graphene sheets spaced by an open 3.42 Å physical gap (Z = -3.35 to 0.00).',
      mechanism: 'Weak intersheet dispersion forces (Van der Waals) combined with a 12.5° rotational twist prevent graphitic restacking into bulk graphite.',
      significance: 'Preserves the high specific surface area of each individual graphene layer while facilitating fluid and ion penetration between layers.',
    },
  },
  {
    id: 'oxygen_vacancies',
    number: 6,
    title: '14 Surface Oxygen Vacancies (V_O)',
    subtitle: 'Catalytic Dangling Zn²⁺ Bonds for Visible Light & Radical Cascades',
    duration: 8,
    startTime: 40,
    endTime: 48,
    camStart: {
      pos: [-7.0, -22.5, -1.0],
      lookAt: [-7.34, -3.35, 10.12],
    },
    camEnd: {
      pos: [-10.2, -8.2, 12.2],
      lookAt: [-7.34, -3.35, 10.12],
    },
    curveType: 'zoom_in',
    highlightFocus: 'defects',
    badge: '6.0 Catalytic Defects',
    badgeColor: '#06b6d4',
    narration: '',
    metrics: [
      { label: 'Defect Sites', value: '14 Polar Facet Vacancies' },
      { label: 'Sub-Bandgap State', value: 'Enhanced Visible Absorption' },
      { label: 'Generated Radicals', value: '•O₂⁻ & •OH Cascades' },
    ],
    callout: {
      label: 'Surface Oxygen Vacancy Site (V_O)',
      bondType: 'Zn²⁺ Dangling Bond Hotspot (ROS Generator)',
      bondLength: 'Sub-bandgap defect',
      description: 'Direct facet perspective: missing oxygen atom leaves unsaturated Zn²⁺ dangling bonds to trap electrons and generate ROS.',
      target3D: [-7.34, -3.35, 10.12],
      arrowOffset: [0, 0, 0],
      badgeColor: '#06b6d4',
    },
    explanation: {
      whatYouSee: 'Exterior facet viewpoint focused on a point defect (Defect #13 at [-7.34, -3.35, 10.12]) where a missing oxygen lattice site exposes coordinatively unsaturated Zn²⁺ dangling bonds.',
      mechanism: 'Introduces localized sub-bandgap energy states (0.7–1.2 eV below the conduction band), extending light absorption well into the visible light spectrum.',
      significance: 'Serves as active chemisorption hot-spots for O₂ and H₂O molecules, accelerating the catalytic generation of hydroxyl (•OH) and superoxide (•O₂⁻) radicals.',
    },
  },
  {
    id: 'porous_voids_net',
    number: 7,
    title: 'Anti-Clumping Net & Porous Interstitial Voids',
    subtitle: 'Graphene Matrix Templates ZnO & Preserves Mass-Transport Micro-Channels',
    duration: 8,
    startTime: 48,
    endTime: 56,
    camStart: {
      pos: [-10.2, -8.2, 12.2],
      lookAt: [-2.5, -6.0, 2.5],
    },
    camEnd: {
      pos: [-12.0, -18.0, 10.5],
      lookAt: [-2.5, -6.0, 2.5],
    },
    curveType: 'zoom_in',
    highlightFocus: 'complete',
    badge: '7.0 Anti-Clumping Net',
    badgeColor: '#f59e0b',
    narration: '',
    metrics: [
      { label: 'Morphology', value: 'Porous Interstitial Voids' },
      { label: 'Agglomeration', value: '100% Suppressed' },
      { label: 'Transport Function', value: 'Electrolyte & Gas Diffusion' },
    ],
    callout: {
      label: 'Anti-Clumping Graphene Net & Voids',
      bondType: 'Wrinkled Matrix & Interstitial Diffusion Channels',
      bondLength: 'Open micro-pores',
      description: 'Elevated perspective: graphene wrinkles cradle the crystal while leaving open nano-channels for fluid and light diffusion.',
      target3D: [-2.5, -6.0, 2.5],
      arrowOffset: [0, 0, 0],
      badgeColor: '#f59e0b',
    },
    explanation: {
      whatYouSee: 'Elevated wide-angle overview demonstrating how nanoscale graphene ripples and ripples encase the crystal base while keeping interstitial nano-channels unobstructed.',
      mechanism: 'Steric barrier of flexible graphene sheets physically shields neighboring ZnO particles from coalescing into non-reactive macroscopic aggregates.',
      significance: 'Provides open 3D diffusion pathways for aqueous pollutants and dissolved gases to reach photocatalytic sites unimpeded.',
    },
  },
];

export const TOTAL_TOUR_DURATION = 56; // total seconds

