export type ElementType = 'C' | 'Zn' | 'O' | 'VO' | 'H';

export interface AtomData {
  id: number;
  element: ElementType;
  x: number;
  y: number;
  z: number;
  layer?: number;
  isSurfaceDefect?: boolean;
  isBridgeBonded?: boolean;
  bridgeId?: number;
  isEdgeFunctionalGroup?: boolean;
  functionalGroupType?: 'hydroxyl' | 'carboxyl' | 'epoxy';
  radius: number;
  color: string;
  name: string;
  charge?: string;
  coordination?: number;
  description?: string;
}

export interface BondData {
  id: number;
  atom1: AtomData;
  atom2: AtomData;
  type: 'c-c' | 'zn-o' | 'zn-o-c_bridge' | 'defect_dangling' | 'c-o_edge' | 'o-h_edge';
  length: number; // in Angstroms
  isCovalentBridge?: boolean;
  bridgeIndex?: number;
}

export interface DefectSite {
  id: number;
  x: number;
  y: number;
  z: number;
  associatedZnId: number;
  description: string;
  reactionType: 'ROS_superoxide' | 'ROS_hydroxyl';
}

export interface FocusTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
  key?: string | number;
}

export interface NanocompositeBindingPart {
  id: string;
  name: string;
  shortName: string;
  category: 'covalent' | 'van_der_waals' | 'defect' | 'nanocrystal' | 'functional_group' | 'electronic';
  simpleSummary: string;
  description: string;
  bindingRole: string;
  howItBinds: {
    role: string;
    whyItMatters: string;
  }[];
  keyTakeaway: string;
  physicalParameters: {
    metric: string;
    value: string;
  }[];
  focusTarget: FocusTarget;
  badgeColor: string;
  accentColor: string;
  layerHighlight?: LayerFilter;
}

export type RenderStyle =
  | 'ball_and_stick'
  | 'space_filling'
  | 'wireframe'
  | 'edx_mapping'
  | 'electron_flow'
  | 'defect_focus'
  | 'strain_map'
  | 'reference_image_view';

export type CameraPreset =
  | 'figure1_side'
  | 'figure2_topdown'
  | 'figure3_closeup'
  | 'reference_exact'
  | 'overview'
  | 'cross_section'
  | 'defect_angle';

export type LayerFilter =
  | 'all'
  | 'zno_only'
  | 'gnp_only'
  | 'interface_only'
  | 'layer_1'
  | 'layer_2'
  | 'layer_3'
  | 'layer_4'
  | 'layer_5';

export interface CustomEDXData {
  sampleName: string;
  sourceDescription: string;
  carbonAtPct: number;
  zincAtPct: number;
  oxygenAtPct: number;
  traceAtPct?: number;
  traceElementName?: string;
  carbonErrorPct: number;
  zincErrorPct: number;
  oxygenErrorPct: number;
  macroCarbonAtPct: number;
  macroZincAtPct: number;
  macroOxygenAtPct: number;
  microCarbonAtPct: number;
  microZincAtPct: number;
  microOxygenAtPct: number;
  acceleratingVoltageKv: number;
  workingDistanceMm: number;
  lastUpdated: string;
}

export interface PresentationSlide {
  id: number;
  title: string;
  subtitle: string;
  figureRef?: string;
  cameraPreset: CameraPreset;
  renderMode: RenderStyle;
  highlightBridges?: boolean;
  highlightDefects?: boolean;
  showElectronFlow?: boolean;
  showROSAnimation?: boolean;
  script: string;
  bulletPoints: string[];
  scientificValidation: {
    labMetric: string;
    modelValue: string;
    expValue: string;
  }[];
}

export interface AuthorBranding {
  leadAuthor: string;
  teamMembers: string;
  institution: string;
  departmentOrLab: string;
  projectTitle: string;
  projectSubtitle: string;
  contactEmail: string;
  defenseYear: string;
}

export const DEFAULT_AUTHOR_BRANDING: AuthorBranding = {
  leadAuthor: 'Zion Dominic',
  teamMembers: 'Research Team',
  institution: 'Tuguegarao City Science High School',
  departmentOrLab: 'Nanotechnology & Materials Science Research Group',
  projectTitle: 'NanAuracle: ZnO-GNP Nanocomposite 3D Digital Twin',
  projectSubtitle: 'Intel ISEF 2026 Grand Award Finalist & Research Showcase',
  contactEmail: 'ziondominic0410@gmail.com',
  defenseYear: '2026',
};
