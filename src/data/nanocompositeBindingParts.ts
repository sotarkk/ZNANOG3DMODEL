import { NanocompositeBindingPart } from '../types';

export const NANOCOMPOSITE_BINDING_PARTS: NanocompositeBindingPart[] = [
  {
    id: 'interfacial_bridges',
    name: '16 Interfacial Covalent Zn-O-C Bridges (1.43 Å)',
    shortName: 'Zn-O-C Bridges',
    category: 'covalent',
    simpleSummary:
      '16 super-strong chemical "glue" bonds (1.43 Å) that lock the zinc oxide crystal firmly onto the graphene base.',
    description:
      'These are 16 direct chemical links formed between zinc (Zn), oxygen (O), and carbon (C) atoms right where the crystal dome touches the top graphene sheet.',
    bindingRole:
      'They act like atomic rivets that prevent the crystal from peeling off during vibrations, while opening a high-speed electrical roadway between the two materials.',
    howItBinds: [
      {
        role: 'Strong Mechanical Anchor',
        whyItMatters:
          'Prevents the zinc oxide crystal from tearing off the graphene base even under intense ultrasonic vibration.',
      },
      {
        role: 'Ultra-Fast Electrical Bridge',
        whyItMatters:
          'Lets light-generated electrons leap across into graphene in only 0.35 nanoseconds (over 10× faster than unbonded mixtures).',
      },
    ],
    keyTakeaway:
      'Without these 16 bridges, the crystal would easily slide off, and electrical signals could not reach the graphene circuit.',
    physicalParameters: [
      { metric: 'Number of Bridge Bonds', value: '16 Covalent Anchors' },
      { metric: 'Bridge Bond Length', value: '1.430 Å (Tight chemical fit)' },
      { metric: 'Bond Strength', value: '3.65 eV (Very difficult to break)' },
      { metric: 'Electron Leap Time', value: '0.35 ns (Ultra-rapid transfer)' },
      { metric: 'Interface Stability', value: '100% Sonic-shear resistant' },
    ],
    focusTarget: {
      position: [-5.8, -11.5, 4.2],
      lookAt: [-0.6, 0.4, 1.4],
      key: 'bridges_focus',
    },
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    accentColor: '#f43f5e',
    layerHighlight: 'interface_only',
  },
  {
    id: 'van_der_waals_gap',
    name: '5-Layer Turbostratic Van der Waals Gap (3.42 Å)',
    shortName: 'GNP Interlayer Gap',
    category: 'van_der_waals',
    simpleSummary:
      'A natural 3.42 Å molecular cushioning gap that holds 5 graphene sheets together into a flexible, highly conductive stack.',
    description:
      'Instead of being fused like solid stone, the 5 graphene sheets are neatly stacked with a microscopic 3.42 Å gap, held together by gentle molecular attraction (Van der Waals forces).',
    bindingRole:
      'Binds multiple carbon sheets into one durable plate while maintaining a gentle ~12° twist between layers so electrons can glide across every sheet without getting stuck.',
    howItBinds: [
      {
        role: 'Flexible Multi-Layer Stacking',
        whyItMatters:
          'Keeps all 5 carbon layers bound together so the material is mechanically strong yet thin and flexible.',
      },
      {
        role: 'Slight Layer Twist (~12°)',
        whyItMatters:
          'Prevents the sheets from freezing into dense pencil lead (graphite), keeping huge surface area and open electrical lanes.',
      },
    ],
    keyTakeaway:
      'It holds the graphene foundation together like a flexible deck of cards while keeping individual layers slick and super-conductive.',
    physicalParameters: [
      { metric: 'Interlayer Spacing', value: '3.42 Å (Natural cushion gap)' },
      { metric: 'Graphene Layer Count', value: '5 Stacked Sheets' },
      { metric: 'Twist Angle Between Sheets', value: '~12.0° (Prevents re-graphitization)' },
      { metric: 'Total Base Thickness', value: '1.71 nm (Ultra-thin)' },
      { metric: 'Electrical Conductivity', value: '>15,000 cm²/V·s (High speed)' },
    ],
    focusTarget: {
      position: [22.0, -14.0, -3.5],
      lookAt: [0.0, 0.0, -6.8],
      key: 'vdw_gap_focus',
    },
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981',
    layerHighlight: 'gnp_only',
  },
  {
    id: 'surface_oxygen_vacancies',
    name: '14 Catalytic Surface Oxygen Vacancies (V_O Sites)',
    shortName: 'V_O Catalytic Spots',
    category: 'defect',
    simpleSummary:
      '14 intentional atomic "empty pockets" on the crystal surface that act like magnetic docking stations for molecules.',
    description:
      'These are 14 spots on the outer zinc oxide crystal where oxygen atoms were deliberately left out during synthesis to create active reaction centers.',
    bindingRole:
      'They bind target analyte molecules (such as chemical vapors or biological markers) and trap free electrons so the sensor can detect changes instantly.',
    howItBinds: [
      {
        role: 'Chemical Docking Stations',
        whyItMatters:
          'Grabs onto chemical vapors, gases, or water molecules that land on the sensor surface for rapid chemical sensing.',
      },
      {
        role: 'Electron Trapping Centers',
        whyItMatters:
          'Catches photogenerated electrons before they can recombine and disappear, keeping electrical signals strong and clear.',
      },
    ],
    keyTakeaway:
      'These open pockets are the active "chemical hands" of the nanocomposite that capture target molecules and trigger electrical signals.',
    physicalParameters: [
      { metric: 'Active Pocket Count', value: '14 Surface Reaction Sites' },
      { metric: 'Location', value: 'Top (0001) Zinc Face of Crystal' },
      { metric: 'Chemical Role', value: 'Lewis-Acid Docking (Binds target molecules)' },
      { metric: 'Active Radicals Produced', value: 'Superoxide (•O₂⁻) & •OH' },
      { metric: 'Signal Trapping Time', value: '~2.40 ns (Prevents loss of charge)' },
    ],
    focusTarget: {
      position: [-8.5, 9.5, 15.5],
      lookAt: [-0.6, 0.4, 7.2],
      key: 'defects_focus',
    },
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentColor: '#06b6d4',
    layerHighlight: 'zno_only',
  },
  {
    id: 'zno_nanocrystal_dome',
    name: 'Wurtzite ZnO Nanocrystal Aggregate Core (12 nm)',
    shortName: 'ZnO Crystal Dome',
    category: 'nanocrystal',
    simpleSummary:
      'A 12-nanometer dome-shaped zinc oxide crystal that acts as the light-absorbing engine of the nanocomposite.',
    description:
      'This is the rounded nanoparticle cluster resting on top of the graphene sheets, measuring just 12 billionths of a meter across.',
    bindingRole:
      'Provides the solid physical foundation where all 16 interfacial bonds attach, while absorbing light to generate electrical charges.',
    howItBinds: [
      {
        role: 'Central Physical Anchor',
        whyItMatters:
          'Holds the upper half of all 16 bridge bonds in a stable hexagonal crystal structure.',
      },
      {
        role: 'Light-Powered Charge Engine',
        whyItMatters:
          'Absorbs UV and visible light to create energetic electrons and positive charges that power sensing and chemical reactions.',
      },
    ],
    keyTakeaway:
      'It is the solar powerhouse of the composite, converting light into electrical current that flows through the bonds.',
    physicalParameters: [
      { metric: 'Dome Diameter', value: '12.0 nm (Nanoscale dome)' },
      { metric: 'Crystal Architecture', value: 'Hexagonal Wurtzite (P6₃mc)' },
      { metric: 'Light Energy Threshold', value: '3.37 eV (Absorbs UV / near-visible)' },
      { metric: 'Internal Crystal Tilt', value: '~22° (Enhances charge separation)' },
      { metric: 'Anchor Capacity', value: 'Anchors all 16 interfacial bridge bonds' },
    ],
    focusTarget: {
      position: [-13.5, -20.5, 13.0],
      lookAt: [-0.6, 0.4, 5.0],
      key: 'zno_dome_focus',
    },
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentColor: '#f59e0b',
    layerHighlight: 'zno_only',
  },
  {
    id: 'edge_functional_groups',
    name: 'Perimeter Edge Functional Groups (-COOH / -OH)',
    shortName: 'Edge Chemical Caps',
    category: 'functional_group',
    simpleSummary:
      'Chemical "caps" (-COOH and -OH) lining the outer borders of the graphene sheets to help them dissolve in water and bind securely.',
    description:
      'Clusters of oxygen and hydrogen atoms attached along the outer perimeter edges of each graphene sheet.',
    bindingRole:
      'They bind the nanocomposite chemically to liquids, polymers, or testing electrodes, stopping the sheets from sticking together into useless clumps.',
    howItBinds: [
      {
        role: 'Water-Friendly Shield',
        whyItMatters:
          'Allows the nanocomposite to disperse evenly in water or sensor fluids without clumping into sludge.',
      },
      {
        role: 'Molecular Velcro for Sensors',
        whyItMatters:
          'Provides convenient chemical hooks where antibodies, biological markers, or sensor electrodes can attach.',
      },
    ],
    keyTakeaway:
      'Acts like protective bumpers and molecular Velcro on the outer rims of the graphene sheets.',
    physicalParameters: [
      { metric: 'Edge Border Coverage', value: '~60% of perimeter passivated' },
      { metric: 'Carbon-Oxygen (C-O) Bond', value: '1.32 Å' },
      { metric: 'Oxygen-Hydrogen (O-H) Bond', value: '0.92 Å' },
      { metric: 'Dispersion Quality', value: 'Completely stable in aqueous solutions' },
      { metric: 'Surface Charge (Zeta)', value: '-38.4 mV (Repels clumping)' },
    ],
    focusTarget: {
      position: [19.5, 3.5, 2.5],
      lookAt: [13.5, 0.0, 0.0],
      key: 'edge_groups_focus',
    },
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    accentColor: '#6366f1',
    layerHighlight: 'gnp_only',
  },
  {
    id: 'electronic_charge_conduit',
    name: 'Heterojunction Electronic Charge Conduit',
    shortName: 'Ohmic Fast Highway',
    category: 'electronic',
    simpleSummary:
      'An ultra-low resistance (<10 Ω) electrical roadway connecting the zinc oxide crystal directly into graphene.',
    description:
      'The seamless electronic gateway formed where zinc oxide and graphene touch, matching their energy levels perfectly.',
    bindingRole:
      'Binds the electrical systems of both materials into one continuous circuit, letting electrical signals flow 4.2× faster with virtually zero resistance.',
    howItBinds: [
      {
        role: 'Frictionless Electron Highway',
        whyItMatters:
          'Reduces contact resistance to under 10 Ohms, so electrons glide smoothly across with almost no heat loss or bottleneck.',
      },
      {
        role: '4.2× Faster Charge Separation',
        whyItMatters:
          'Pulls positive and negative charges apart before they cancel each other out, boosting electrical sensor signal by +340%.',
      },
    ],
    keyTakeaway:
      'Unifies two completely different materials into a single, high-speed electrical circuit.',
    physicalParameters: [
      { metric: 'Electrical Contact Type', value: 'Ohmic Heterojunction (Frictionless)' },
      { metric: 'Interface Resistance', value: '<10 Ω (Almost zero resistance)' },
      { metric: 'Charge Separation Efficiency', value: '94.6% (Near-perfect efficiency)' },
      { metric: 'Carrier Speed Multiplier', value: '4.2× Faster than bare ZnO' },
      { metric: 'Signal Current Boost', value: '+340% Sensitivity enhancement' },
    ],
    focusTarget: {
      position: [-9.5, -16.5, 7.5],
      lookAt: [-0.6, 0.4, 2.0],
      key: 'charge_conduit_focus',
    },
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    accentColor: '#14b8a6',
    layerHighlight: 'interface_only',
  },
];
