import React, { useState } from 'react';
import { FocusTarget, AtomData, BondData, LayerFilter } from '../types';
import { ModelData } from '../utils/atomisticGenerator';
import { NANOCOMPOSITE_BINDING_PARTS } from '../data/nanocompositeBindingParts';
import {
  Layers,
  ZoomIn,
  Zap,
  Sparkles,
  Link2,
  Shield,
  Activity,
  Flame,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

interface NanocompositeBindingExplorerProps {
  model: ModelData;
  onZoomToTarget: (target: FocusTarget) => void;
  onSelectBond: (bond: BondData | null) => void;
  onSelectAtom?: (atom: AtomData | null) => void;
  onSwitchToBonds?: (element?: 'ALL' | 'Zn' | 'O' | 'C', category?: string) => void;
  highlightBridges: boolean;
  setHighlightBridges: (val: boolean) => void;
  highlightDefects: boolean;
  setHighlightDefects: (val: boolean) => void;
  showElectronFlow: boolean;
  setShowElectronFlow: (val: boolean) => void;
  setLayerFilter?: (filter: LayerFilter) => void;
}

export const NanocompositeBindingExplorer: React.FC<NanocompositeBindingExplorerProps> = ({
  model,
  onZoomToTarget,
  onSelectBond,
  onSelectAtom,
  onSwitchToBonds,
  highlightBridges,
  setHighlightBridges,
  highlightDefects,
  setHighlightDefects,
  showElectronFlow,
  setShowElectronFlow,
  setLayerFilter,
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string>('interfacial_bridges');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedPart =
    NANOCOMPOSITE_BINDING_PARTS.find((p) => p.id === selectedPartId) ||
    NANOCOMPOSITE_BINDING_PARTS[0];

  // Filter parts
  const filteredParts = NANOCOMPOSITE_BINDING_PARTS.filter((part) => {
    if (filterCategory === 'all') return true;
    return part.category === filterCategory;
  });

  // Action: Zoom and trigger appropriate highlight modes
  const handleZoomAndHighlight = (part: typeof selectedPart) => {
    onZoomToTarget(part.focusTarget);

    if (part.id === 'interfacial_bridges') {
      setHighlightBridges(true);
      const firstBridge = model.bridges[0] || model.bonds.find((b) => b.isCovalentBridge);
      if (firstBridge) {
        onSelectBond(firstBridge);
        if (firstBridge.atom1) onSelectAtom?.(firstBridge.atom1);
      }
    } else if (part.id === 'surface_oxygen_vacancies') {
      setHighlightDefects(true);
      const firstVo = model.atoms.find((a) => a.element === 'VO' || a.isSurfaceDefect);
      if (firstVo) onSelectAtom?.(firstVo);
    } else if (part.id === 'electronic_charge_conduit') {
      setShowElectronFlow(true);
      setHighlightBridges(true);
    } else if (part.id === 'van_der_waals_gap') {
      if (setLayerFilter) setLayerFilter('gnp_only');
    } else if (part.id === 'zno_nanocrystal_dome') {
      if (setLayerFilter) setLayerFilter('zno_only');
    } else if (part.id === 'edge_functional_groups') {
      const edgeAtom = model.atoms.find((a) => a.isEdgeFunctionalGroup);
      if (edgeAtom) onSelectAtom?.(edgeAtom);
    }
  };

  const getPartIcon = (category: string) => {
    switch (category) {
      case 'covalent':
        return <Link2 className="w-4 h-4 text-rose-400" />;
      case 'van_der_waals':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'defect':
        return <Flame className="w-4 h-4 text-cyan-400" />;
      case 'nanocrystal':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'functional_group':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'electronic':
        return <Zap className="w-4 h-4 text-teal-400" />;
      default:
        return <Activity className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 text-slate-100">
      {/* Intro Header & Purpose */}
      <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-500/30 shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Link2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Nanocomposite Binding Architecture
              </h3>
              <p className="text-[11px] text-slate-400">
                The 6 core structural & quantum systems binding all atomic bonds into a functional heterojunction
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            6 Core Systems
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none text-[11px]">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Systems (6)
          </button>
          <button
            onClick={() => setFilterCategory('covalent')}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
              filterCategory === 'covalent'
                ? 'bg-rose-500/30 text-rose-200 border-rose-400 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-rose-300'
            }`}
          >
            Covalent Bridges
          </button>
          <button
            onClick={() => setFilterCategory('van_der_waals')}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
              filterCategory === 'van_der_waals'
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-emerald-300'
            }`}
          >
            VdW Interlayer Gap
          </button>
          <button
            onClick={() => setFilterCategory('defect')}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
              filterCategory === 'defect'
                ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-cyan-300'
            }`}
          >
            Oxygen Vacancies
          </button>
          <button
            onClick={() => setFilterCategory('nanocrystal')}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
              filterCategory === 'nanocrystal'
                ? 'bg-amber-500/30 text-amber-200 border-amber-400 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-300'
            }`}
          >
            ZnO Core Dome
          </button>
          <button
            onClick={() => setFilterCategory('electronic')}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all ${
              filterCategory === 'electronic'
                ? 'bg-teal-500/30 text-teal-200 border-teal-400 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-teal-300'
            }`}
          >
            Charge Conduit
          </button>
        </div>
      </div>

      {/* Selected Part Hero Inspector Card */}
      {selectedPart && (
        <div className="bg-slate-950/95 rounded-2xl border border-cyan-500/40 p-4 shadow-xl flex flex-col gap-3.5 relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
            style={{ backgroundColor: selectedPart.accentColor }}
          />

          {/* Title & Category Badge */}
          <div className="flex items-start justify-between gap-2 z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                {getPartIcon(selectedPart.category)}
              </div>
              <div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${selectedPart.badgeColor}`}>
                  {selectedPart.shortName}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-1">{selectedPart.name}</h4>
              </div>
            </div>
          </div>

          {/* Plain English "In Simple Terms" Highlight Banner */}
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 flex items-start gap-2.5 text-cyan-100 text-xs z-10">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px]">
                In Simple Terms
              </span>
              <p className="text-[12px] leading-relaxed text-cyan-100 font-medium">
                {selectedPart.simpleSummary}
              </p>
            </div>
          </div>

          {/* What is this part? */}
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              What is this part?
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedPart.description}</p>
          </div>

          {/* How it Binds the Nanocomposite (Structured & Scannable) */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5 z-10">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
              <Link2 className="w-3.5 h-3.5" />
              <span>How it binds the composite together:</span>
            </div>

            <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
              {selectedPart.bindingRole}
            </p>

            {/* Bite-sized Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {selectedPart.howItBinds.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item.role}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans pl-5">
                    {item.whyItMatters}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom-Line Takeaway */}
            <div className="text-[11px] text-emerald-300/90 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 mt-0.5">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300">Key Takeaway: </strong>
                {selectedPart.keyTakeaway}
              </span>
            </div>
          </div>

          {/* Physical Parameters Grid with Readable Labels */}
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-0.5">
              Key Measurements & Specs
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
              {selectedPart.physicalParameters.map((param, pIdx) => (
                <div key={pIdx} className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                    {param.metric}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                    {param.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons: Zoom & Explore */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 z-10">
            <button
              id="btn-zoom-binding-part"
              onClick={() => handleZoomAndHighlight(selectedPart)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
              <span>Zoom & Frame in 3D Canvas</span>
            </button>

            {onSwitchToBonds && (
              <button
                onClick={() => {
                  if (selectedPart.id === 'interfacial_bridges') {
                    onSwitchToBonds('ALL', 'zn_o_c_bridge');
                  } else if (selectedPart.id === 'van_der_waals_gap') {
                    onSwitchToBonds('C', 'c_c_graphene');
                  } else if (selectedPart.id === 'surface_oxygen_vacancies') {
                    onSwitchToBonds('O', 'all');
                  } else if (selectedPart.id === 'zno_nanocrystal_dome') {
                    onSwitchToBonds('Zn', 'zn_o_wurtzite');
                  } else if (selectedPart.id === 'edge_functional_groups') {
                    onSwitchToBonds('O', 'c_o_functional');
                  } else {
                    onSwitchToBonds('ALL', 'all');
                  }
                }}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                title="Switch back to Atomic Bond list to inspect related individual bonds"
              >
                <span>View Bonds</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Directory of all 6 Nanocomposite Binding Parts */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            All Binding Components ({filteredParts.length})
          </span>
          <span className="text-[10px]">Click card to inspect or zoom</span>
        </div>

        <div className="flex flex-col gap-2">
          {filteredParts.map((part) => {
            const isSelected = selectedPartId === part.id;
            return (
              <div
                key={part.id}
                onClick={() => {
                  setSelectedPartId(part.id);
                  handleZoomAndHighlight(part);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {getPartIcon(part.category)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">{part.name}</h5>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${part.badgeColor}`}>
                        {part.shortName}
                      </span>
                    </div>
                  </div>

                  {/* Zoom Direct Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPartId(part.id);
                      handleZoomAndHighlight(part);
                    }}
                    className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 transition-all active:scale-90"
                    title="Zoom directly to this binding part in 3D"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plain English summary */}
                <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                  {part.simpleSummary}
                </p>

                <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-300 font-mono pt-1 border-t border-slate-800/60">
                  {part.physicalParameters.slice(0, 2).map((p, i) => (
                    <span key={i} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      <span className="text-slate-500">{p.metric}:</span> {p.value}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
