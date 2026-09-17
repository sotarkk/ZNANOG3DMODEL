import { FocusTarget } from '../types';

export interface FormationMetric {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
}

export interface FormationCallout {
  title: string;
  desc: string;
  tag: string;
  color: string;
}

export interface FormationPhase {
  id: number;
  title: string;
  subtitle: string;
  startTime: number;
  endTime: number;
  duration: number;
  color: string;
  bondType: string;
  bondLength: string;
  whatYouSee: string;
  chemicalMechanism: string;
  compositeSignificance: string;
  presenterNarration: string;
  panelKeyPoints: string[];
  analyticalEvidence: string;
  quantitativeMetrics: FormationMetric[];
  calloutAnnotations: FormationCallout[];
  cameraAngle: 'side' | 'zoomBridge' | 'zoomAnchorO' | 'topdown' | 'macro' | 'horizon' | 'dome' | 'isometric';
  camera: {
    pos: [number, number, number];
    lookAt: [number, number, number];
  };
}

export const TOTAL_FORMATION_DURATION = 13.0; // Snappy, brisk timeline matching user specifications

export const MINIMAL_ANGLES = {
  side: {
    id: 'side' as const,
    label: 'Side Profile (Immediate Zinc Oxide Arrival & Integration)',
    shortLabel: 'Side View',
    desc: 'Low-elevation side profile tracking the zinc oxide crystal cluster descending and physically integrating onto the wrinkled 5-layer graphene sheets.',
    pos: [-10.0, -25.0, 5.5] as [number, number, number],
    lookAt: [-0.6, 0.4, 1.8] as [number, number, number],
  },
  zoomBridge: {
    id: 'zoomBridge' as const,
    label: 'Interface Macro: 16 Zn-O-C Covalent Bridges (1.430 Å)',
    shortLabel: 'Zn-O-C Zoom',
    desc: 'Sub-angstrom macro zoom focused directly on the zinc oxide binding to the graphene basal plane via 16 Zn-O-C bridges (1.430 Å C-O, 1.850 Å Zn-O).',
    pos: [-0.6, -4.6, 2.2] as [number, number, number],
    lookAt: [-0.6, 0.4, 1.35] as [number, number, number],
  },
  zoomAnchorO: {
    id: 'zoomAnchorO' as const,
    label: 'Anchoring Zoom: Graphene Surface & Edge Oxygen Anchors',
    shortLabel: 'Oxygen Anchors',
    desc: 'Targeted close-up of the other Oxygen atoms anchoring directly onto the graphene sheets (C-O 1.428 Å bonds, hydroxyl and edge coordination).',
    pos: [5.6, -4.8, 2.4] as [number, number, number],
    lookAt: [3.0, -0.8, 1.0] as [number, number, number],
  },
  macro: {
    id: 'macro' as const,
    label: 'Interfacial Close-Up (1.430 Å C-O & 16 Zn-O-C Bridges)',
    shortLabel: 'Bridge Macro',
    desc: 'Sub-angstrom macro zoom directly on the heterojunction boundary highlighting the 16 Zn–O–C covalent bridges (1.430 Å C-O, 1.850 Å Zn-O), dashed quantum lines, and 14 active V_O defect sites.',
    pos: [-0.6, -5.5, 2.4] as [number, number, number],
    lookAt: [-0.6, 0.4, 1.4] as [number, number, number],
  },
  horizon: {
    id: 'horizon' as const,
    label: 'Horizon Cross-Section (1.430 Å Interfacial Gap)',
    shortLabel: 'Horizon View',
    desc: 'Ground-level interface cross-section looking through the 1.430 Å gap between the basal graphene sheet and the lower wurtzite crystal facet.',
    pos: [7.2, -6.0, 1.8] as [number, number, number],
    lookAt: [-0.6, 0.4, 1.4] as [number, number, number],
  },
  topdown: {
    id: 'topdown' as const,
    label: 'Oblique Top-Down (Lateral Elemental Mapping)',
    shortLabel: 'Top-Down',
    desc: '78° oblique high-angle view mapping lateral distribution of yellow Zinc (16.78 at%), red Oxygen (21.96 at%), and green Carbon (61.27 at%).',
    pos: [-0.6, -5.5, 26.0] as [number, number, number],
    lookAt: [-0.6, 0.4, 1.5] as [number, number, number],
  },
  dome: {
    id: 'dome' as const,
    label: 'Angle 2: 78° Oblique Top-Down',
    shortLabel: 'Angle 2 (Top-Down)',
    desc: '78° oblique high-angle view mapping lateral elemental distribution across the crumpled carbon net.',
    pos: [-0.6, -5.5, 26.0] as [number, number, number],
    lookAt: [-0.6, 0.4, 1.5] as [number, number, number],
  },
  isometric: {
    id: 'isometric' as const,
    label: '3D Atomic Digital Twin Overview (Complete Heterojunction)',
    shortLabel: 'Digital Twin',
    desc: 'Complete 1,060-atom ZNano-G atomic digital twin with 16 covalent bridges, 14 defect centers, and 7.9 ns ballistic electron highway.',
    pos: [-14.0, -26.0, 15.0] as [number, number, number],
    lookAt: [-0.6, 0.4, 2.6] as [number, number, number],
  },
};

export const FORMATION_PHASES: FormationPhase[] = [
  {
    id: 1,
    title: 'Stage 1: Immediate Arrival & Side-View Integration',
    subtitle: 'ZnO Cluster Descending & Conforming to Crumpled Graphene Scaffold',
    startTime: 0.0,
    endTime: 3.0,
    duration: 3.0,
    color: '#00FF66',
    bondType: 'Pre-Bonded Wurtzite ZnO & Acoustic Physisorption',
    bondLength: 'Zn-O: 1.980 Å • C-C: 1.421 Å (Descent to 1.430 Å)',
    whatYouSee:
      'The simulation immediately initiates with the arrival of the pre-bonded zinc oxide nanoparticle cluster (yellow Zn, red O) in side profile. Under acoustic cavitation shear forces, the ZnO cluster descends dynamically from 8.5 Å and settles directly onto the exfoliated 5-layer graphene sheet (green C), conforming intimately to the wrinkled, wavy sheet corrugations.',
    chemicalMechanism:
      'Ex-situ liquid-phase protocol: Pre-crystallized 1:1 wurtzite ZnO nanocrystals rapidly disperse across high-surface-area turbostratic graphene sheets (~5 layers). The 2D crumpled topography prevents graphene restacking while seating the ZnO basal facet into intimate physical contact.',
    compositeSignificance:
      'Achieves instant nanoscale decoration across the carbon scaffold without agglomeration, setting up atomic registry for covalent pinning.',
    presenterNarration:
      'Honorable judges, our synthesis begins with ultrasonic shear forces exfoliating 5-layer graphene nanoplatelets (61.27 at% Carbon). Pre-crystallized wurtzite ZnO nanoparticles descend under acoustic cavitation and conform intimately to the wrinkled carbon substrate without restacking.',
    panelKeyPoints: [
      'Cavitation forces prevent irreversible graphene sheet restacking by depositing 1:1 ZnO clusters on basal planes.',
      'Turbostratic spacing preserved at 3.35 Å interlayer distance across the 5 exfoliated carbon layers.',
      'Sets up sub-nanometer atomic proximity (<2.0 Å) required for subsequent solid-state covalent bond formation.',
    ],
    analyticalEvidence:
      'XRD: (002) graphite peak broadening confirmed 5-layer exfoliation; TEM shows uniform 146.95 nm ZnO dispersion.',
    quantitativeMetrics: [
      { label: 'Scaffold Layers', value: '5 Layers', sub: '3.35 Å d-spacing', badge: 'GNP' },
      { label: 'Carbon Content', value: '61.27 at%', sub: 'sp² conjugated net', badge: 'Scaffold' },
      { label: 'Initial Proximity', value: '8.5 Å → 1.43 Å', sub: 'Acoustic descent', badge: 'Kinetics' },
      { label: 'Nanoparticle Size', value: '146.95 nm', sub: '0.38% SEM error', badge: 'TEM/SEM' },
    ],
    calloutAnnotations: [
      { title: 'Wurtzite ZnO Cluster', desc: '1:1 Stoichiometric pre-bonded crystal facet', tag: 'ZnO Core', color: '#fbbf24' },
      { title: '5-Layer Graphene Net', desc: 'Wrinkled sp² carbon scaffold preventing agglomeration', tag: 'GNP Sheet', color: '#10b981' },
    ],
    cameraAngle: 'side',
    camera: {
      pos: MINIMAL_ANGLES.side.pos,
      lookAt: MINIMAL_ANGLES.side.lookAt,
    },
  },
  {
    id: 2,
    title: 'Stage 2: Interface Macro Zoom — Zinc Oxide Binding to Graphene',
    subtitle: 'Thermal Pinning: 16 Covalent Zn–O–C Quantum Bridges (1.430 Å C-O, 1.850 Å Zn-O)',
    startTime: 3.0,
    endTime: 6.5,
    duration: 3.5,
    color: '#FFCC00',
    bondType: '16 Covalent Zn-O-C Interfacial Bridges',
    bondLength: '1.430 Å C-O • 1.850 Å Zn-O',
    whatYouSee:
      'Camera glides into a sub-angstrom macro zoom focused directly on the zinc oxide binding to the graphene basal plane. Thermal activation at 300°C drives solid-state chemical pinning: 16 covalent Zn–O–C quantum bridges form with bright reaction flashes and dashed quantum lines, locking the lower wurtzite facet tightly onto the top graphene layer.',
    chemicalMechanism:
      'Chemisorption pinning reaction: sp³ hybridized C-O-Zn bonds form across the 1.430 Å gap (1.430 Å C-O covalent bonds and 1.850 Å Zn-O coordination bonds). This solidifies the mechanical contact and initiates electronic coupling.',
    compositeSignificance:
      'Covalently locks the ZnO nanoparticle onto graphene, permanently preventing nanoparticle detachment during ultrasonic and thermal cycling.',
    presenterNarration:
      'Upon 300°C thermal activation, our interfacial reaction forms 16 covalent Zn-O-C chemical bridges across a precise 1.430 Å interface. These bonds permanently anchor the nanoparticle and eliminate the Schottky contact resistance barrier.',
    panelKeyPoints: [
      '16 covalent Zn-O-C bonds formed (1.430 Å C-O length; 1.850 Å Zn-O coordination length).',
      'Transforms weak van der Waals physisorption into robust solid-state chemical chemisorption.',
      'Eliminates interfacial contact resistance, enabling barrier-free charge carrier transfer into graphene.',
    ],
    analyticalEvidence:
      'XPS: Deconvoluted C 1s peak at 286.2 eV and O 1s at 531.4 eV prove covalent C-O-Zn linkages rather than simple mixing.',
    quantitativeMetrics: [
      { label: 'Covalent Bridges', value: '16 Bridges', sub: 'Interfacial Zn-O-C', badge: 'Pinning' },
      { label: 'C-O Bond Distance', value: '1.430 Å', sub: 'Sub-angstrom precision', badge: 'DFT' },
      { label: 'Zn-O Bond Distance', value: '1.850 Å', sub: 'Coordination bond', badge: 'Coordination' },
      { label: 'XPS Peak Confirmation', value: '531.4 eV', sub: 'C-O-Zn signature', badge: 'XPS' },
    ],
    calloutAnnotations: [
      { title: '16 Zn-O-C Covalent Bridges', desc: '1.430 Å C-O & 1.850 Å Zn-O chemical conduits', tag: 'Quantum Bridge', color: '#f59e0b' },
      { title: 'Interfacial Junction Gap', desc: '1.430 Å distance between basal plane and ZnO facet', tag: 'Junction', color: '#ec4899' },
    ],
    cameraAngle: 'zoomBridge',
    camera: {
      pos: MINIMAL_ANGLES.zoomBridge.pos,
      lookAt: MINIMAL_ANGLES.zoomBridge.lookAt,
    },
  },
  {
    id: 3,
    title: 'Stage 3: Targeted Zoom — Other Oxygen Atoms Anchoring to Graphene',
    subtitle: 'Edge & Surface C-O Anchors (1.428 Å) & 14 Catalytic Oxygen Vacancies',
    startTime: 6.5,
    endTime: 9.8,
    duration: 3.3,
    color: '#FF3333',
    bondType: 'Graphene Surface & Edge C-O Anchors & V_O Centers',
    bondLength: 'C-O: 1.428 Å • 14 V_O Defect Sites',
    whatYouSee:
      'Camera zooms specifically into the other oxygen atoms anchoring to the graphene sheets. Perimeter and surface oxygen atoms (deep red) dock and form robust covalent C-O bonds (1.428 Å) and hydroxyl/carboxyl terminations along the corrugated sheet edges. Simultaneously, 14 active surface oxygen vacancies (cyan V_O) activate on the ZnO crystal facets.',
    chemicalMechanism:
      'Solid-state functionalization: Peripheral oxygen atoms passivate reactive graphene armchair/zigzag carbon edges, preventing lattice degradation. Concurrently, pH 10.01 hydrothermal stabilization stabilizes 14 oxygen voids (V_O) with exposed undercoordinated Zn²⁺ cations.',
    compositeSignificance:
      'Edge functionalization stabilizes the 5-layer graphene sheets against restacking, while active V_O sites provide catalytic charge trapping and gas adsorption centers.',
    presenterNarration:
      'Simultaneously, peripheral oxygen atoms dock onto graphene edges at 1.428 Å, passivating reactive dangling bonds. On the ZnO facet, 14 oxygen vacancies (V_O) are stabilized, providing active defect centers for target gas adsorption and catalytic redox reactions.',
    panelKeyPoints: [
      'Edge-anchored oxygen atoms (1.428 Å C-O) passivate graphene boundary carbons against oxidative etching.',
      '14 surface oxygen vacancies (V_O) created via controlled alkaline conditions (pH 10.01).',
      'Exposed undercoordinated Zn²⁺ cations create active catalytic sites with reduced work function.',
    ],
    analyticalEvidence:
      'EPR / Photoluminescence: Broad green defect emission at 520 nm directly confirms high density of ionized V_O centers.',
    quantitativeMetrics: [
      { label: 'Edge C-O Distance', value: '1.428 Å', sub: 'Edge passivation', badge: 'Anchor' },
      { label: 'Active Defect Sites', value: '14 V_O Sites', sub: 'Oxygen vacancies', badge: 'Catalysis' },
      { label: 'PL Defect Emission', value: '520 nm', sub: 'Green luminescence', badge: 'Spectroscopy' },
      { label: 'Oxygen Vacancy Ratio', value: '28.4%', sub: 'O 1s XPS component', badge: 'Defect' },
    ],
    calloutAnnotations: [
      { title: 'Edge & Surface Oxygen Anchors', desc: '1.428 Å covalent bonds passivating carbon boundaries', tag: 'O-Anchor', color: '#ef4444' },
      { title: '14 Oxygen Vacancies (V_O)', desc: 'Undercoordinated Zn²⁺ active catalytic sites', tag: 'V_O Defect', color: '#06b6d4' },
    ],
    cameraAngle: 'zoomAnchorO',
    camera: {
      pos: MINIMAL_ANGLES.zoomAnchorO.pos,
      lookAt: MINIMAL_ANGLES.zoomAnchorO.lookAt,
    },
  },
  {
    id: 4,
    title: 'Stage 4: 3D Atomic Digital Twin & Extended Charge Lifetime',
    subtitle: 'Complete 1,060-Atom Integrated Nanocomposite (7.9 ns Charge Highway)',
    startTime: 9.8,
    endTime: 13.0,
    duration: 3.2,
    color: '#38bdf8',
    bondType: 'Ballistic Interfacial Electron Conduit',
    bondLength: '1,060 Atoms • 16 Bridges • 14 Defects',
    whatYouSee:
      'Smooth orbital pull-out around the complete 3D Atomic Digital Twin: 5-layer green graphene scaffold (61.27 at% C), integrated yellow/red ZnO crystal (16.78 at% Zn, 21.96 at% O), 16 covalent bridges, locked oxygen anchors, and 14 active oxygen vacancies. Photoexcited electrons channel ballistically across the 16 bridges into graphene, extending charge carrier lifetime to 7.9 nanoseconds.',
    chemicalMechanism:
      'Ohmic interfacial electron sink: The 16 covalent bridges rapidly transfer photoexcited conduction-band electrons from ZnO into high-mobility graphene, suppressing electron-hole recombination by 84.7% for superior photocatalytic and sensing performance.',
    compositeSignificance:
      'Empirically validated by NanAuracle metrology: SEM particle size 146.95 nm (0.38% error), composite EDX stoichiometry (0.18–0.50% error).',
    presenterNarration:
      'The result is a fully coupled 1,060-atom digital twin where the 16 Zn-O-C bridges act as ballistic conduits. Photoexcited electrons transfer into the graphene electron sink in sub-picoseconds, suppressing recombination by 84.7% and prolonging carrier lifetime from 1.2 to 7.9 nanoseconds.',
    panelKeyPoints: [
      'Ballistic electron extraction across 16 Zn-O-C bridges into high-mobility graphene scaffold.',
      'Carrier lifetime prolonged from 1.2 ns to 7.9 ns (+558% extension measured via TRPL).',
      'Electron-hole recombination suppressed by 84.7%, maximizing ROS generation for environmental remediation.',
    ],
    analyticalEvidence:
      'Time-Resolved Photoluminescence (TRPL): Biexponential decay demonstrates average lifetime τ_avg = 7.9 ns vs 1.2 ns for bare ZnO.',
    quantitativeMetrics: [
      { label: 'Total Atoms', value: '1,060 Atoms', sub: 'C:649, Zn:178, O:233', badge: 'Digital Twin' },
      { label: 'Carrier Lifetime', value: '7.9 ns', sub: 'vs 1.2 ns bare ZnO (+558%)', badge: 'TRPL' },
      { label: 'Recombination Suppression', value: '84.7%', sub: 'Ohmic electron sink', badge: 'Efficiency' },
      { label: 'EDX Stoichiometry', value: 'C:61.3, Zn:16.8, O:22.0', sub: '0.18–0.50% error', badge: 'EDX Metrology' },
    ],
    calloutAnnotations: [
      { title: 'Ballistic Charge Highway', desc: '16 Zn-O-C conduits draining electrons to graphene sink', tag: 'Conduction', color: '#38bdf8' },
      { title: 'Complete Heterojunction', desc: '1,060-atom structural digital twin with empirical registry', tag: 'Composite', color: '#10b981' },
    ],
    cameraAngle: 'isometric',
    camera: {
      pos: MINIMAL_ANGLES.isometric.pos,
      lookAt: MINIMAL_ANGLES.isometric.lookAt,
    },
  },
];
