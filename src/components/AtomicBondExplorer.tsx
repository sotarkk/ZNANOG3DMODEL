import React, { useState, useMemo, useEffect } from 'react';
import { AtomData, BondData, DefectSite, FocusTarget, ElementType, LayerFilter } from '../types';
import { ModelData } from '../utils/atomisticGenerator';
import { NANOCOMPOSITE_BINDING_PARTS } from '../data/nanocompositeBindingParts';
import { NanocompositeBindingExplorer } from './NanocompositeBindingExplorer';
import {
  Atom,
  Search,
  ZoomIn,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  Filter,
  Eye,
  Zap,
  Flame,
  Maximize2,
  Layers,
  Ruler,
  Activity,
  Link2,
  ExternalLink,
  Play,
  Pause,
} from 'lucide-react';

interface AtomicBondExplorerProps {
  model: ModelData;
  selectedBond: BondData | null;
  onSelectBond: (bond: BondData | null) => void;
  onZoomToBond: (bond: BondData, preset?: 'closeup' | 'axial' | 'coordination' | 'macro') => void;
  onZoomToTarget?: (target: FocusTarget) => void;
  onSelectAtom?: (atom: AtomData | null) => void;
  highlightBridges: boolean;
  setHighlightBridges: (val: boolean) => void;
  highlightDefects: boolean;
  setHighlightDefects: (val: boolean) => void;
  showElectronFlow: boolean;
  setShowElectronFlow: (val: boolean) => void;
  setLayerFilter?: (filter: LayerFilter) => void;
  onOpenFormationExplorer?: () => void;
}

export type ElementFilter = 'ALL' | 'Zn' | 'O' | 'C';

/**
 * Authoritative, single description for each primary bond type in the ZnO-GNP nanocomposite
 */
export const BOND_TYPE_DESCRIPTIONS: Record<
  'Zn' | 'O' | 'C',
  {
    title: string;
    subtitle: string;
    description: string;
    keyMetrics: string;
    badgeColor: string;
    dotColor: string;
    borderColor: string;
  }
> = {
  Zn: {
    title: 'Zinc (Zn) Bonds',
    subtitle: 'Tetrahedral Wurtzite & Bridge Coordination',
    description:
      'Tetrahedral coordinated polar covalent bonds (predominantly Zn²⁺–O²⁻ at 1.973 Å and Zn–O–C bridge anchors at 1.430 Å) that construct the wurtzite semiconductor lattice, providing the 3.37 eV direct bandgap core for UV absorption and photogenerated exciton generation.',
    keyMetrics: 'Zn²⁺–O²⁻: 1.973 Å | Ed ~2.88 eV | Polar [0001] c-axis columns',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dotColor: 'bg-amber-400',
    borderColor: 'border-amber-500/30',
  },
  O: {
    title: 'Oxygen (O) Bonds',
    subtitle: 'Polar Bridging, Terminal & Defect Links',
    description:
      'High-electronegativity bridging and terminal covalent bonds (including Zn–O–C alkoxide links, edge C–O/O–H functional groups, and catalytic oxygen vacancy sites) that mediate interfacial electron transfer, Lewis-acid analyte binding, and defect-driven charge separation.',
    keyMetrics: 'Zn–O–C: 1.430 Å | C–O: 1.32 Å | O–H: 0.92 Å | 14 V_O sites',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    dotColor: 'bg-rose-400',
    borderColor: 'border-rose-500/30',
  },
  C: {
    title: 'Carbon (C) Bonds',
    subtitle: 'sp² Aromatic Graphene Honeycomb Network',
    description:
      'In-plane sp² hybridized aromatic hexagonal honeycomb bonds (1.420 Å C=C) across the multi-layer graphene nanoplatelet sheets that establish ballistic Dirac fermion transport, zero effective carrier mass, and mechanical matrix reinforcement.',
    keyMetrics: 'C=C: 1.420 Å | Ed ~4.30 eV | Ballistic Dirac Fermions (μ > 15,000 cm²/Vs)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dotColor: 'bg-emerald-400',
    borderColor: 'border-emerald-500/30',
  },
};

export interface BondCategoryInfo {
  id: string;
  name: string;
  element: ElementFilter;
  filterFn: (b: BondData) => boolean;
  standardLength: number; // Å
  dissociationEnergyEv: string;
  description: string;
  quantumRole: string;
  badgeColor: string;
}

export const AtomicBondExplorer: React.FC<AtomicBondExplorerProps> = ({
  model,
  selectedBond,
  onSelectBond,
  onZoomToBond,
  onZoomToTarget,
  onSelectAtom,
  highlightBridges,
  setHighlightBridges,
  highlightDefects,
  setHighlightDefects,
  showElectronFlow,
  setShowElectronFlow,
  setLayerFilter,
  onOpenFormationExplorer,
}) => {
  // Explorer View Mode: 'bonds' (Individual atomic bonds) or 'binding_parts' (Nanocomposite binding components)
  const [explorerViewMode, setExplorerViewMode] = useState<'bonds' | 'binding_parts'>('bonds');
  // Selected Element Tab
  const [selectedElement, setSelectedElement] = useState<ElementFilter>('Zn');
  // For 'ALL' element view, active description tab to preview Zn, O, or C description
  const [allElementDescTab, setAllElementDescTab] = useState<'Zn' | 'O' | 'C'>('Zn');
  // Selected Subtype / Category
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // Search query (atom ID, layer, etc.)
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Sort order
  const [sortBy, setSortBy] = useState<'id' | 'length_asc' | 'length_desc' | 'layer'>('id');
  // Auto zoom on select toggle
  const [autoZoom, setAutoZoom] = useState<boolean>(true);
  // Camera view angle preset
  const [activeAnglePreset, setActiveAnglePreset] = useState<'closeup' | 'axial' | 'coordination' | 'macro'>('closeup');
  // Pagination
  const [page, setPage] = useState<number>(0);
  const pageSize = 25;

  // Auto-tour continuous bond stepper
  const [isTouringBonds, setIsTouringBonds] = useState<boolean>(false);

  // Define comprehensive bond categories
  const categories: BondCategoryInfo[] = useMemo(
    () => [
      {
        id: 'zn_o_c_bridge',
        name: 'Zn-O-C Interfacial Bridges (16 Sites)',
        element: 'ALL',
        filterFn: (b) => !!b.isCovalentBridge || b.type === 'zn-o-c_bridge',
        standardLength: 1.43,
        dissociationEnergyEv: '~3.65 eV',
        description: 'Covalent bridge pinning ZnO nanocrystal aggregate to top Graphene Nanoplatelet sheet.',
        quantumRole:
          'Forms direct low-resistance ohmic conduit (0.35 ns transfer lifetime), channeling photoelectrons from ZnO to ballistic graphene net and suppressing charge recombination.',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      },
      {
        id: 'zn_o_wurtzite',
        name: 'Zn-O Wurtzite Crystal Lattice',
        element: 'Zn',
        filterFn: (b) => b.type === 'zn-o' && !b.isCovalentBridge,
        standardLength: 1.973,
        dissociationEnergyEv: '~2.88 eV',
        description: 'Tetrahedral coordinated Zn²⁺–O²⁻ polar wurtzite lattice bonds along [0001] c-axis.',
        quantumRole:
          'Polar crystal field facilitates UV absorption (3.37 eV bandgap) and separation of exciton electron-hole pairs.',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      },
      {
        id: 'zn_o_coordinating',
        name: 'Interfacial Coordinating Zn-O',
        element: 'Zn',
        filterFn: (b) => b.type === 'zn-o' && b.length < 1.92 && !b.isCovalentBridge,
        standardLength: 1.86,
        dissociationEnergyEv: '~3.15 eV',
        description: 'Interfacial wurtzite coordination bonds directly proximal to the graphene hetero-junction.',
        quantumRole:
          'Strained coordination geometry lowering the interfacial charge-injection barrier into graphene.',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      },
      {
        id: 'c_c_graphene',
        name: 'C-C Graphene Honeycomb Network',
        element: 'C',
        filterFn: (b) => b.type === 'c-c',
        standardLength: 1.42,
        dissociationEnergyEv: '~4.30 eV',
        description: 'In-plane sp² covalent aromatic bonds forming the hexagonal 2D graphene nanoplatelet layers.',
        quantumRole:
          'Provides ultra-high carrier mobility with ballistic Dirac fermion transport (Fermi velocity ~10⁶ m/s) and mechanical support.',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      },
      {
        id: 'c_o_functional',
        name: 'C-O Functional Surface Groups',
        element: 'O',
        filterFn: (b) => b.type === 'c-o_edge',
        standardLength: 1.28,
        dissociationEnergyEv: '~3.70 eV',
        description: 'Basal and edge epoxide/hydroxyl oxygen functionalization on GNP sheets.',
        quantumRole:
          'Enhances aqueous dispersion and interfacial chemical anchoring sites for resource-adaptive sensor deposition.',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      },
      {
        id: 'o_h_edge',
        name: 'O-H Hydroxyl Edge Bonds',
        element: 'O',
        filterFn: (b) => b.type === 'o-h_edge',
        standardLength: 0.94,
        dissociationEnergyEv: '~4.42 eV',
        description: 'Hydrophilic terminal hydroxyl groups decorating edges and basal planes.',
        quantumRole:
          'Facilitates hydrogen bonding with aqueous analytes and stabilizes interfacial charge transfer.',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      },
    ],
    []
  );

  // Filter bonds based on active element and sub-category
  const filteredBonds = useMemo(() => {
    return model.bonds.filter((bond) => {
      const a1 = bond.atom1;
      const a2 = bond.atom2;
      if (!a1 || !a2) return false;

      const isBridge = !!bond.isCovalentBridge || bond.type === 'zn-o-c_bridge';

      // 1. Element Filter - ensure Zn-O-C bridges are included under Zn, O, C, and ALL
      if (selectedElement === 'Zn') {
        const hasZn = a1.element === 'Zn' || a2.element === 'Zn' || isBridge;
        if (!hasZn) return false;
      } else if (selectedElement === 'O') {
        const hasO = a1.element === 'O' || a2.element === 'O' || a1.element === 'VO' || a2.element === 'VO' || isBridge;
        if (!hasO) return false;
      } else if (selectedElement === 'C') {
        const hasC = a1.element === 'C' || a2.element === 'C' || isBridge;
        if (!hasC) return false;
      }

      // 2. Subcategory Filter
      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.id === selectedCategory);
        if (cat && !cat.filterFn(bond)) return false;
      }

      // 3. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName =
          a1.name.toLowerCase().includes(q) ||
          a2.name.toLowerCase().includes(q) ||
          bond.type.toLowerCase().includes(q);
        const matchesId =
          String(a1.id) === q ||
          String(a2.id) === q ||
          String(bond.id) === q ||
          (bond.bridgeIndex !== undefined && String(bond.bridgeIndex) === q);
        const matchesLayer =
          (a1.layer !== undefined && `layer ${a1.layer}`.includes(q)) ||
          (a2.layer !== undefined && `layer ${a2.layer}`.includes(q));

        if (!matchesName && !matchesId && !matchesLayer) return false;
      }

      return true;
    });
  }, [model.bonds, selectedElement, selectedCategory, searchQuery, categories]);

  // Sorted bonds
  const sortedBonds = useMemo(() => {
    const list = [...filteredBonds];
    if (sortBy === 'length_asc') {
      list.sort((a, b) => a.length - b.length);
    } else if (sortBy === 'length_desc') {
      list.sort((a, b) => b.length - a.length);
    } else if (sortBy === 'layer') {
      list.sort((a, b) => (b.atom1.layer || 0) - (a.atom1.layer || 0));
    } else {
      // Prioritize covalent bridges first, then by ID
      list.sort((a, b) => {
        if (a.isCovalentBridge && !b.isCovalentBridge) return -1;
        if (!a.isCovalentBridge && b.isCovalentBridge) return 1;
        return a.id - b.id;
      });
    }
    return list;
  }, [filteredBonds, sortBy]);

  // Paginated bonds
  const paginatedBonds = useMemo(() => {
    return sortedBonds.slice(page * pageSize, (page + 1) * pageSize);
  }, [sortedBonds, page, pageSize]);

  // If no bond selected or selected bond is outside current filtered list, initialize with first representative bond
  useEffect(() => {
    if (!selectedBond && sortedBonds.length > 0) {
      // Pick first bridge if available, otherwise first bond
      const firstBridge = sortedBonds.find((b) => b.isCovalentBridge) || sortedBonds[0];
      onSelectBond(firstBridge);
    }
  }, [sortedBonds, selectedBond, onSelectBond]);

  // Element stats - accurately count Zn, O, C including the 16 interfacial bridges
  const elementCounts = useMemo(() => {
    let znCount = 0;
    let oCount = 0;
    let cCount = 0;

    model.bonds.forEach((b) => {
      const isBridge = !!b.isCovalentBridge || b.type === 'zn-o-c_bridge';
      if (b.atom1.element === 'Zn' || b.atom2.element === 'Zn' || isBridge) znCount++;
      if (b.atom1.element === 'O' || b.atom2.element === 'O' || isBridge) oCount++;
      if (b.atom1.element === 'C' || b.atom2.element === 'C' || isBridge) cCount++;
    });

    return {
      all: model.bonds.length,
      Zn: znCount,
      O: oCount,
      C: cCount,
      bridges: model.bridges.length,
    };
  }, [model.bonds, model.bridges]);

  // Statistics for current filtered set
  const selectionStats = useMemo(() => {
    if (filteredBonds.length === 0) return { count: 0, mean: 0, min: 0, max: 0 };
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    filteredBonds.forEach((b) => {
      sum += b.length;
      if (b.length < min) min = b.length;
      if (b.length > max) max = b.length;
    });
    return {
      count: filteredBonds.length,
      mean: parseFloat((sum / filteredBonds.length).toFixed(3)),
      min: parseFloat(min.toFixed(3)),
      max: parseFloat(max.toFixed(3)),
    };
  }, [filteredBonds]);

  // Active bond for inspector
  const activeBond = selectedBond || sortedBonds[0] || null;

  // Active bond index in current sorted list
  const activeBondIndex = useMemo(() => {
    if (!activeBond) return -1;
    return sortedBonds.findIndex((b) => b.id === activeBond.id);
  }, [activeBond, sortedBonds]);

  const handleNextBond = () => {
    if (sortedBonds.length === 0) return;
    const nextIdx = (activeBondIndex + 1) % sortedBonds.length;
    const nextBond = sortedBonds[nextIdx];
    onSelectBond(nextBond);
    if (autoZoom) {
      onZoomToBond(nextBond, activeAnglePreset);
    }
  };

  const handlePrevBond = () => {
    if (sortedBonds.length === 0) return;
    const prevIdx = (activeBondIndex - 1 + sortedBonds.length) % sortedBonds.length;
    const prevBond = sortedBonds[prevIdx];
    onSelectBond(prevBond);
    if (autoZoom) {
      onZoomToBond(prevBond, activeAnglePreset);
    }
  };

  const handleSelectBondItem = (bond: BondData) => {
    onSelectBond(bond);
    if (autoZoom) {
      onZoomToBond(bond, activeAnglePreset);
    }
  };

  const handleZoomCurrent = (preset?: 'closeup' | 'axial' | 'coordination' | 'macro') => {
    if (!activeBond) return;
    const targetPreset = preset || activeAnglePreset;
    setActiveAnglePreset(targetPreset);
    onZoomToBond(activeBond, targetPreset);
  };

  // Auto-tour bonds timer: smoothly flies to and highlights each bond in sequence
  useEffect(() => {
    if (!isTouringBonds || sortedBonds.length === 0) return;
    const interval = setInterval(() => {
      const nextIdx = (activeBondIndex + 1) % sortedBonds.length;
      const nextBond = sortedBonds[nextIdx];
      onSelectBond(nextBond);
      onZoomToBond(nextBond, activeAnglePreset);
    }, 2400);
    return () => clearInterval(interval);
  }, [isTouringBonds, sortedBonds, activeBondIndex, activeAnglePreset, onSelectBond, onZoomToBond]);

  // Keyboard navigation for stepping through bonds (Left / Right Arrow & Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (e.key === 'ArrowRight') {
        handleNextBond();
      } else if (e.key === 'ArrowLeft') {
        handlePrevBond();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsTouringBonds((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedBonds, activeBondIndex, autoZoom, activeAnglePreset]);

  // Determine standard reference length and physics context for active bond
  const activeBondMeta = useMemo(() => {
    if (!activeBond) return null;
    const isBridge = activeBond.isCovalentBridge || activeBond.type === 'zn-o-c_bridge';
    const isWurtzite = activeBond.type === 'zn-o' && !isBridge;
    const isGrapheneCC = activeBond.type === 'c-c';
    const isCO = activeBond.type === 'c-o_edge';
    const isOH = activeBond.type === 'o-h_edge';

    let ideal = 1.43;
    let label = 'Interfacial Zn-O-C Bridge';
    let energy = '~3.65 eV';
    let hybrid = 'sp³–sp² Covalent Alkoxide Bridge';
    let role =
      'Ultra-fast 0.35 ns interfacial electron pathway directly bridging the wurtzite ZnO conduction band with graphene Dirac cone.';

    if (isGrapheneCC) {
      ideal = 1.42;
      label = 'sp² Aromatic Graphene Carbon';
      energy = '~4.30 eV';
      hybrid = 'sp² Aromatic Honeycomb (C=C)';
      role =
        'Hexagonal in-plane lattice supporting ballistic carrier transport with zero effective mass and 1000 W/mK thermal dissipation.';
    } else if (isWurtzite) {
      ideal = 1.973;
      label = 'Wurtzite Zn-O Polar Coordination';
      energy = '~2.88 eV';
      hybrid = 'Tetrahedral sp³ (Zn²⁺ ─ O²⁻)';
      role =
        'Polar crystal axis generating intrinsic dipole field for photocatalytic electron-hole separation (3.37 eV direct bandgap).';
    } else if (isCO) {
      ideal = 1.28;
      label = 'C-O Functional Surface Group';
      energy = '~3.70 eV';
      hybrid = 'Epoxy / Hydroxyl (C─O)';
      role =
        'Oxygenated surface groups facilitating aqueous solvation, chemical pinning, and selective gas adsorption.';
    } else if (isOH) {
      ideal = 0.94;
      label = 'O-H Hydroxyl Terminal Bond';
      energy = '~4.42 eV';
      hybrid = 'Polar Covalent (O─H)';
      role = 'Hydrophilic surface termination for hydrogen bonding and proton-coupled electron transfer.';
    }

    const delta = parseFloat((activeBond.length - ideal).toFixed(3));
    const strainPct = parseFloat(((delta / ideal) * 100).toFixed(2));

    return {
      label,
      ideal,
      delta,
      strainPct,
      energy,
      hybrid,
      role,
      isBridge,
    };
  }, [activeBond]);

  const getElementColor = (el: ElementType) => {
    switch (el) {
      case 'C':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40';
      case 'Zn':
        return 'text-amber-400 bg-amber-500/15 border-amber-500/40';
      case 'O':
        return 'text-rose-400 bg-rose-500/15 border-rose-500/40';
      case 'VO':
        return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40';
      case 'H':
        return 'text-slate-200 bg-slate-700/40 border-slate-600';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header & Primary Element Selector Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
              <Atom className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  Atomic Bond Explorer
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  3D Zoom & Focus
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Explore individual Zn, O, and C bonds, coordination geometry & charge transfer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Full Screen Formation Video Explorer Button */}
            {onOpenFormationExplorer && (
              <button
                id="btn-open-formation-explorer-sidebar"
                onClick={onOpenFormationExplorer}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold border bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 text-emerald-300 hover:text-white border-emerald-500/50 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Open Full Screen Formation Video & ISEF Panel Presentation with 3D atomic stages and defense notes"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Formation Video (Full Screen)</span>
                <span className="sm:hidden">Full Screen Video</span>
              </button>
            )}

            {/* Quick Auto-Zoom Switch */}
            <button
              onClick={() => setAutoZoom(!autoZoom)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
                autoZoom
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Automatically animate 3D camera to zoom into selected bond"
            >
              <ZoomIn className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Auto-Zoom:</span>
              <span className="font-bold">{autoZoom ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Top-Level Explorer Mode Switcher: Atomic Bonds (Zn, O, C) vs Other Nanocomposite Binding Parts */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            id="tab-mode-bonds"
            onClick={() => setExplorerViewMode('bonds')}
            className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              explorerViewMode === 'bonds'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Atomic Bonds (Zn, O, C)</span>
          </button>

          <button
            id="tab-mode-binding-parts"
            onClick={() => setExplorerViewMode('binding_parts')}
            className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              explorerViewMode === 'binding_parts'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Nanocomposite Binding Parts</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
              explorerViewMode === 'binding_parts'
                ? 'bg-slate-950 text-cyan-300 border-cyan-800'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              6
            </span>
          </button>
        </div>

        {explorerViewMode === 'bonds' && (
          <>
            {/* Primary Element Tabs: ALL | Zn | O | C */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                id="bond-filter-all"
                onClick={() => {
                  setSelectedElement('ALL');
                  setSelectedCategory('all');
                  setPage(0);
                }}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  selectedElement === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>All Bonds</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400">
                  {elementCounts.all}
                </span>
              </button>

              <button
                id="bond-filter-zn"
                onClick={() => {
                  setSelectedElement('Zn');
                  setSelectedCategory('all');
                  setPage(0);
                }}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  selectedElement === 'Zn'
                    ? 'bg-amber-500/20 text-amber-300 shadow-sm font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Zn Bonds</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400/80">
                  {elementCounts.Zn}
                </span>
              </button>

              <button
                id="bond-filter-o"
                onClick={() => {
                  setSelectedElement('O');
                  setSelectedCategory('all');
                  setPage(0);
                }}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  selectedElement === 'O'
                    ? 'bg-rose-500/20 text-rose-300 shadow-sm font-bold border border-rose-500/40'
                    : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>O Bonds</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-rose-400/80">
                  {elementCounts.O}
                </span>
              </button>

              <button
                id="bond-filter-c"
                onClick={() => {
                  setSelectedElement('C');
                  setSelectedCategory('all');
                  setPage(0);
                }}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  selectedElement === 'C'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>C Bonds</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-emerald-400/80">
                  {elementCounts.C}
                </span>
              </button>
            </div>

            {/* Bond Type Description Section: One authoritative description for Zn, O, and Carbon */}
            {selectedElement !== 'ALL' ? (
              <div
                className={`p-3 rounded-xl border bg-slate-950/80 shadow-sm flex flex-col gap-1.5 transition-all ${
                  BOND_TYPE_DESCRIPTIONS[selectedElement].borderColor
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${BOND_TYPE_DESCRIPTIONS[selectedElement].dotColor}`}
                    />
                    <h4 className="text-xs font-bold text-slate-100">
                      {BOND_TYPE_DESCRIPTIONS[selectedElement].title}
                    </h4>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      — {BOND_TYPE_DESCRIPTIONS[selectedElement].subtitle}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border ${BOND_TYPE_DESCRIPTIONS[selectedElement].badgeColor}`}
                  >
                    {selectedElement} Bond Profile
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                  {BOND_TYPE_DESCRIPTIONS[selectedElement].description}
                </p>
                <div className="text-[10px] font-mono text-cyan-300/80 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>{BOND_TYPE_DESCRIPTIONS[selectedElement].keyMetrics}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Bond Type Descriptions:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                    {(['Zn', 'O', 'C'] as const).map((el) => (
                      <button
                        key={el}
                        onClick={() => setAllElementDescTab(el)}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          allElementDescTab === el
                            ? 'bg-slate-700 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {el} Bonds
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                  {BOND_TYPE_DESCRIPTIONS[allElementDescTab].description}
                </p>
                <div className="text-[10px] font-mono text-cyan-300/80 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  {BOND_TYPE_DESCRIPTIONS[allElementDescTab].keyMetrics}
                </div>
              </div>
            )}

            {/* Quick Access Ribbon: Explore Other Parts of Nanocomposite that Bind the Bonds */}
            <div className="bg-slate-950/60 p-2 rounded-xl border border-cyan-500/20 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Explore Parts Binding the Nanocomposite:
                </span>
                <button
                  onClick={() => setExplorerViewMode('binding_parts')}
                  className="text-slate-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Open Full Binding Explorer</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                {NANOCOMPOSITE_BINDING_PARTS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => {
                      if (onZoomToTarget) onZoomToTarget(part.focusTarget);
                      if (part.id === 'interfacial_bridges') setHighlightBridges(true);
                      if (part.id === 'surface_oxygen_vacancies') setHighlightDefects(true);
                      if (part.id === 'electronic_charge_conduit') setShowElectronFlow(true);
                    }}
                    className={`px-2 py-1 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1 bg-slate-900 hover:bg-slate-800 ${part.badgeColor} active:scale-95 cursor-pointer`}
                    title={`Zoom in 3D to ${part.name}`}
                  >
                    <ZoomIn className="w-2.5 h-2.5" />
                    <span>{part.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(0);
                }}
                className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All Subtypes ({filteredBonds.length})
              </button>

              {/* Interfacial Bridges pill always highlighted */}
              <button
                onClick={() => {
                  setSelectedCategory('zn_o_c_bridge');
                  setPage(0);
                }}
                className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border flex items-center gap-1 transition-all ${
                  selectedCategory === 'zn_o_c_bridge'
                    ? 'bg-rose-500/30 text-rose-200 border-rose-400 font-bold shadow-sm'
                    : 'bg-rose-950/20 text-rose-400 border-rose-900/50 hover:bg-rose-900/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                <span>16 Zn-O-C Bridges (1.430 Å)</span>
              </button>

              {selectedElement !== 'C' && (
                <button
                  onClick={() => {
                    setSelectedCategory('zn_o_wurtzite');
                    setPage(0);
                  }}
                  className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
                    selectedCategory === 'zn_o_wurtzite'
                      ? 'bg-amber-500/30 text-amber-200 border-amber-400 font-bold shadow-sm'
                      : 'bg-amber-950/20 text-amber-400 border-amber-900/50 hover:bg-amber-900/30'
                  }`}
                >
                  Zn-O Wurtzite (~1.98 Å)
                </button>
              )}

              {selectedElement !== 'Zn' && (
                <button
                  onClick={() => {
                    setSelectedCategory('c_c_graphene');
                    setPage(0);
                  }}
                  className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
                    selectedCategory === 'c_c_graphene'
                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 font-bold shadow-sm'
                      : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/30'
                  }`}
                >
                  C-C Graphene (~1.42 Å)
                </button>
              )}

              {(selectedElement === 'O' || selectedElement === 'ALL') && (
                <>
                  <button
                    onClick={() => {
                      setSelectedCategory('c_o_functional');
                      setPage(0);
                    }}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
                      selectedCategory === 'c_o_functional'
                        ? 'bg-sky-500/30 text-sky-200 border-sky-400 font-bold shadow-sm'
                        : 'bg-sky-950/20 text-sky-400 border-sky-900/50 hover:bg-sky-900/30'
                    }`}
                  >
                    C-O Functional (~1.28 Å)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory('o_h_edge');
                      setPage(0);
                    }}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
                      selectedCategory === 'o_h_edge'
                        ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400 font-bold shadow-sm'
                        : 'bg-indigo-950/20 text-indigo-400 border-indigo-900/50 hover:bg-indigo-900/30'
                    }`}
                  >
                    O-H Hydroxyl (~0.94 Å)
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Content Area: Either Nanocomposite Binding Parts Explorer OR Atomic Bonds Directory */}
      {explorerViewMode === 'binding_parts' ? (
        <NanocompositeBindingExplorer
          model={model}
          onZoomToTarget={(target) => {
            if (onZoomToTarget) onZoomToTarget(target);
          }}
          onSelectBond={onSelectBond}
          onSelectAtom={onSelectAtom}
          onSwitchToBonds={(elem, cat) => {
            setExplorerViewMode('bonds');
            if (elem) setSelectedElement(elem);
            if (cat) setSelectedCategory(cat);
          }}
          highlightBridges={highlightBridges}
          setHighlightBridges={setHighlightBridges}
          highlightDefects={highlightDefects}
          setHighlightDefects={setHighlightDefects}
          showElectronFlow={showElectronFlow}
          setShowElectronFlow={setShowElectronFlow}
          setLayerFilter={setLayerFilter}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Selected Bond Detailed Focus Card */}
          {activeBond ? (
          <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-4 shadow-xl relative overflow-hidden flex flex-col gap-3.5">
            {/* Background Accent Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Bond Name, Stepper & Primary Zoom Button */}
            <div className="flex items-start justify-between gap-2 z-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/60">
                    Bond #{activeBond.id}
                  </span>
                  {activeBond.isCovalentBridge && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      Interfacial Bridge #{activeBond.bridgeIndex || 1}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeBondIndex + 1} of {sortedBonds.length}
                  </span>
                </div>

                {/* Bond Atoms Chemical Title */}
                <div className="flex items-center gap-2 text-lg font-bold text-slate-100 tracking-tight mt-0.5">
                  <span className={`px-2 py-0.5 rounded-lg border text-sm font-mono font-bold ${getElementColor(activeBond.atom1.element)}`}>
                    {activeBond.atom1.name}
                  </span>
                  <span className="text-slate-500 font-mono">────</span>
                  <span className={`px-2 py-0.5 rounded-lg border text-sm font-mono font-bold ${getElementColor(activeBond.atom2.element)}`}>
                    {activeBond.atom2.name}
                  </span>
                </div>
              </div>

              {/* Prev / Play-Tour / Next Nav Stepper */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  id="btn-prev-bond-stepper"
                  onClick={handlePrevBond}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                  title="Previous Bond in List (Left Arrow key)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  id="btn-tour-bonds-toggle"
                  onClick={() => setIsTouringBonds(!isTouringBonds)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                    isTouringBonds
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Auto-Cycle through each bond in current filter (Spacebar)"
                >
                  {isTouringBonds ? (
                    <>
                      <Pause className="w-3 h-3 text-slate-950 fill-current" />
                      <span className="text-[10px]">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-cyan-400 fill-current" />
                      <span className="text-[10px]">Auto-Tour</span>
                    </>
                  )}
                </button>
                <button
                  id="btn-next-bond-stepper"
                  onClick={handleNextBond}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                  title="Next Bond in List (Right Arrow key)"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metrics Ribbon: Measured Length, Ideal, Strain, Binding Energy */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  Bond Length
                </span>
                <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                  {activeBond.length.toFixed(3)} Å
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  Theoretical
                </span>
                <div className="text-sm font-semibold font-mono text-slate-300 mt-0.5">
                  {activeBondMeta?.ideal.toFixed(3)} Å
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  Lattice Strain
                </span>
                <div
                  className={`text-sm font-semibold font-mono mt-0.5 ${
                    Math.abs(activeBondMeta?.strainPct || 0) < 1.0
                      ? 'text-emerald-400'
                      : Math.abs(activeBondMeta?.strainPct || 0) < 5.0
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {activeBondMeta?.delta && activeBondMeta.delta > 0 ? '+' : ''}
                  {activeBondMeta?.strainPct}%
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  Bond Energy
                </span>
                <div className="text-sm font-semibold font-mono text-slate-200 mt-0.5">
                  {activeBondMeta?.energy}
                </div>
              </div>
            </div>

            {/* Primary Action Button: Zoom In & Inspect */}
            <div className="flex flex-col gap-2">
              <button
                id="btn-zoom-into-bond"
                onClick={() => handleZoomCurrent('closeup')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Zoom In & Inspect in 3D Canvas</span>
              </button>

              {/* Angle & Distance Presets for Zooming */}
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-semibold">
                <button
                  onClick={() => handleZoomCurrent('closeup')}
                  className={`py-1.5 px-1.5 rounded-lg border text-center transition-all ${
                    activeAnglePreset === 'closeup'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Close-up side profile framing both atoms"
                >
                  Close Focus (4.8 Å)
                </button>
                <button
                  onClick={() => handleZoomCurrent('axial')}
                  className={`py-1.5 px-1.5 rounded-lg border text-center transition-all ${
                    activeAnglePreset === 'axial'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Look straight down the bond axis"
                >
                  Axial View
                </button>
                <button
                  onClick={() => handleZoomCurrent('coordination')}
                  className={`py-1.5 px-1.5 rounded-lg border text-center transition-all ${
                    activeAnglePreset === 'coordination'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Include surrounding 1st coordination sphere"
                >
                  Coord. Sphere (8 Å)
                </button>
                <button
                  onClick={() => handleZoomCurrent('macro')}
                  className={`py-1.5 px-1.5 rounded-lg border text-center transition-all ${
                    activeAnglePreset === 'macro'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Framed within the entire ZnO-GNP nanocomposite"
                >
                  Macro Context
                </button>
              </div>
            </div>

            {/* Electronic & Quantum Role Description */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                <Zap className="w-3.5 h-3.5" />
                <span>Quantum & Electronic Transport Role:</span>
              </div>
              <p className="leading-relaxed text-slate-300 font-sans">
                {activeBondMeta?.role}
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                <span>Hybridization: {activeBondMeta?.hybrid}</span>
              </div>
            </div>

            {/* Participating Atom Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Atom 1 */}
              <div
                onClick={() => onSelectAtom && onSelectAtom(activeBond.atom1)}
                className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col gap-1"
                title="Click to select this atom in 3D viewer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Atom A</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getElementColor(activeBond.atom1.element)}`}>
                    {activeBond.atom1.element} ({activeBond.atom1.id})
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200">{activeBond.atom1.name}</div>
                <div className="text-[10px] font-mono text-slate-400">
                  [{activeBond.atom1.x.toFixed(2)}, {activeBond.atom1.y.toFixed(2)}, {activeBond.atom1.z.toFixed(2)}] Å
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeBond.atom1.layer ? `GNP Layer ${activeBond.atom1.layer}` : 'ZnO Nanocrystal Dome'}
                </div>
              </div>

              {/* Atom 2 */}
              <div
                onClick={() => onSelectAtom && onSelectAtom(activeBond.atom2)}
                className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col gap-1"
                title="Click to select this atom in 3D viewer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Atom B</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getElementColor(activeBond.atom2.element)}`}>
                    {activeBond.atom2.element} ({activeBond.atom2.id})
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200">{activeBond.atom2.name}</div>
                <div className="text-[10px] font-mono text-slate-400">
                  [{activeBond.atom2.x.toFixed(2)}, {activeBond.atom2.y.toFixed(2)}, {activeBond.atom2.z.toFixed(2)}] Å
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeBond.atom2.layer ? `GNP Layer ${activeBond.atom2.layer}` : 'ZnO Nanocrystal Dome'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
            No bonds match current search or filters. Select another element or reset filters.
          </div>
        )}

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search by atom ID (e.g. 'Zn12', 'bridge', 'layer 1')..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
          >
            <option value="id">Sort: Priority / Type</option>
            <option value="length_asc">Sort: Length (Shortest First)</option>
            <option value="length_desc">Sort: Length (Longest First)</option>
            <option value="layer">Sort: Height / Layer</option>
          </select>
        </div>

        {/* Bond List Directory with Instant Zoom Buttons */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              Showing {sortedBonds.length === 0 ? 0 : page * pageSize + 1} -{' '}
              {Math.min((page + 1) * pageSize, sortedBonds.length)} of {sortedBonds.length} bonds
            </span>
            <span className="font-mono">
              Mean: {selectionStats.mean} Å [{selectionStats.min} - {selectionStats.max} Å]
            </span>
          </div>

          <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto pr-1">
            {paginatedBonds.map((bond) => {
              const isSelected = activeBond?.id === bond.id;
              const isBridge = bond.isCovalentBridge || bond.type === 'zn-o-c_bridge';

              return (
                <div
                  key={bond.id}
                  onClick={() => handleSelectBondItem(bond)}
                  className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Element Indicators */}
                    <div className="flex items-center -space-x-1 shrink-0">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold font-mono ${getElementColor(
                          bond.atom1.element
                        )}`}
                      >
                        {bond.atom1.element}
                      </span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-bold font-mono ${getElementColor(
                          bond.atom2.element
                        )}`}
                      >
                        {bond.atom2.element}
                      </span>
                    </div>

                    {/* Bond Label & Atoms */}
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-semibold truncate">
                          {bond.atom1.name} ─ {bond.atom2.name}
                        </span>
                        {isBridge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                            Bridge #{bond.bridgeIndex || 1}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {bond.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Length & Quick Zoom Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                      {bond.length.toFixed(3)} Å
                    </span>

                    <button
                      id={`btn-zoom-bond-${bond.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBond(bond);
                        onZoomToBond(bond, activeAnglePreset);
                      }}
                      className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 hover:border-cyan-400 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                      title="Zoom camera directly into this bond"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>Zoom</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {sortedBonds.length > pageSize && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Previous Page
              </button>
              <span className="text-slate-400 font-mono text-[11px]">
                Page {page + 1} of {Math.ceil(sortedBonds.length / pageSize)}
              </span>
              <button
                disabled={(page + 1) * pageSize >= sortedBonds.length}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Next Page
              </button>
            </div>
          )}
        </div>

        {/* Quick Simulation Toggles relevant to Bonds */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => setHighlightBridges(!highlightBridges)}
            className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
              highlightBridges
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                highlightBridges ? 'bg-rose-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span>Glow 16 Bridges</span>
          </button>

          <button
            onClick={() => setShowElectronFlow(!showElectronFlow)}
            className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
              showElectronFlow
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${showElectronFlow ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
            <span>Electron Flow</span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
