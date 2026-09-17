import React, { useState } from 'react';
import { ModelData } from '../utils/atomisticGenerator';
import {
  X,
  Activity,
  BarChart2,
  PieChart,
  CheckCircle2,
  FileText,
  ExternalLink,
  Award,
  Layers,
  Zap,
  Flame,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface ExperimentalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelData;
  onOpenEDXEditor?: () => void;
}

export const ExperimentalDataModal: React.FC<ExperimentalDataModalProps> = ({
  isOpen,
  onClose,
  model,
  onOpenEDXEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'edx' | 'trpl' | 'morphology' | 'defects'>('edx');

  if (!isOpen) return null;

  const edx = model.edxData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Experimental Characterization & DLSU Validation Suite
                </h2>
                <span className="text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Intel ISEF 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct correlation between wet-chemistry laboratory spectroscopy and atomistic digital twin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEDXEditor && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEDXEditor();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Edit wet-lab EDX characterization values"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customize EDX Data</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center bg-slate-950/80 px-6 border-b border-slate-800 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab('edx')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'edx'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>DLSU EDX Spectroscopy (50:50)</span>
          </button>
          <button
            onClick={() => setActiveTab('trpl')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'trpl'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>TRPL Lifetime & 16 Bridges (7.9 ns)</span>
          </button>
          <button
            onClick={() => setActiveTab('morphology')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'morphology'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>FE-SEM Sizing (88.18 nm / 146.95 nm)</span>
          </button>
          <button
            onClick={() => setActiveTab('defects')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'defects'
                ? 'border-red-400 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Defect States & ROS Kinetics</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EDX SPECTROSCOPY */}
          {activeTab === 'edx' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Carbon Card */}
                <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">Carbon (C)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                      Bright Green
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-100 font-mono">
                    {edx?.carbonAtPct || 51.66} at%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Graphene support scaffold and high-mobility conductive backbone.
                  </div>
                </div>

                {/* Zinc Card */}
                <div className="p-4 bg-yellow-950/30 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-yellow-400">Zinc (Zn)</span>
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-300 font-mono px-2 py-0.5 rounded">
                      Bright Yellow
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-100 font-mono">
                    {edx?.zincAtPct || 24.85} at%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Wurtzite crystal photoactive catalytic core.
                  </div>
                </div>

                {/* Oxygen Card */}
                <div className="p-4 bg-red-950/30 rounded-xl border border-red-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400">Oxygen (O)</span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 font-mono px-2 py-0.5 rounded">
                      Deep Red
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-100 font-mono">
                    {edx?.oxygenAtPct || 23.49} at%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Lattice coordination and 14 surface vacancy defect sites.
                  </div>
                </div>
              </div>

              {/* EDX Comparison Table */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    DLSU EDX Macro vs Micro Scan Consistency ({edx?.sampleName || 'Current Sample'})
                  </h4>
                  {edx?.lastUpdated && (
                    <span className="text-[10px] text-slate-400 font-mono">Updated: {edx.lastUpdated}</span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="pb-2">Element</th>
                        <th className="pb-2">Color in 3D Twin</th>
                        <th className="pb-2">Macro Field (26.9 µm)</th>
                        <th className="pb-2">Micro Field (13.4 µm)</th>
                        <th className="pb-2">3D Digital Twin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                      <tr>
                        <td className="py-2.5 font-bold text-emerald-400">Carbon (C)</td>
                        <td className="py-2.5 text-emerald-400">Bright Green</td>
                        <td className="py-2.5">50.66 at%</td>
                        <td className="py-2.5 font-bold">51.66 at%</td>
                        <td className="py-2.5 text-emerald-300 font-bold">{model.stats.carbonAtPct}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-yellow-400">Zinc (Zn)</td>
                        <td className="py-2.5 text-yellow-400">Bright Yellow</td>
                        <td className="py-2.5">24.54 at%</td>
                        <td className="py-2.5 font-bold">24.85 at%</td>
                        <td className="py-2.5 text-yellow-300 font-bold">{model.stats.zincAtPct}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-red-400">Oxygen (O)</td>
                        <td className="py-2.5 text-red-400">Deep Red</td>
                        <td className="py-2.5">24.43 at%</td>
                        <td className="py-2.5 font-bold">23.49 at%</td>
                        <td className="py-2.5 text-red-300 font-bold">{model.stats.oxygenAtPct}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRPL LIFETIME */}
          {activeTab === 'trpl' && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-950/30 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                    Photoexcited Exciton Lifetime
                  </span>
                  <div className="text-3xl font-black text-slate-100 font-mono mt-1">7.9 ns</div>
                  <p className="text-xs text-slate-300 mt-1">
                    Extended from 1.2 ns (bare ZnO) to 7.9 ns via 16 covalent Zn-O-C interfacial pinning bridges (1.430 Å).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                    6.58× Lifetime Extension
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-200">Bare ZnO Nanoparticles</div>
                  <div className="text-sm font-mono text-slate-400 font-semibold">τ₁ = 1.20 ns</div>
                  <p className="text-xs text-slate-400">
                    Rapid direct electron-hole radiative recombination reduces quantum efficiency.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/40 space-y-2">
                  <div className="text-xs font-bold text-cyan-300">ZnO-GNP Heterojunction Twin</div>
                  <div className="text-sm font-mono text-cyan-400 font-bold">τ₂ = 7.90 ns</div>
                  <p className="text-xs text-slate-300">
                    Electrons rapidly tunnel across 1.430 Å Zn-O-C bridges into high-conductivity graphene net.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FE-SEM MORPHOLOGY */}
          {activeTab === 'morphology' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400">GNP Apparent Edge Thickness</div>
                  <div className="text-2xl font-mono font-black text-slate-100">88.18 nm</div>
                  <p className="text-xs text-slate-400">
                    5-layer turbostratic graphene sheet with ±12° stacking faults. Thicker than 60.12 nm commercial standard due to 600 RPM centrifuge constraint, yet structurally resilient.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-yellow-400">Porous ZnO Nanocrystal Sizing</div>
                  <div className="text-2xl font-mono font-black text-slate-100">146.95 ± 28.37 nm</div>
                  <p className="text-xs text-slate-400">
                    Size distribution ranging 103 nm to 189 nm. Hierarchical aggregates form open micro-pores and interstitial voids on the graphene net.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEFECT ENGINEERING & ROS KINETICS */}
          {activeTab === 'defects' && (
            <div className="space-y-6">
              <div className="p-4 bg-red-950/30 rounded-xl border border-red-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                    Alkaline Hydrothermal Defect Engineering
                  </span>
                  <span className="text-xs font-mono font-bold bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full">
                    pH 10.01 Synthesis
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-slate-100">
                  14 Surface Oxygen Vacancies (V_O)
                </div>
                <p className="text-xs text-slate-300">
                  Surface-exposed oxygen vacancies create unsaturated Zn²⁺ dangling bonds, serving as catalytic hotspots that generate Superoxide (•O₂⁻) and Hydroxyl (•OH) radicals under ambient sunlight.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">Superoxide Radical Formation</div>
                  <div className="font-mono text-red-400 text-xs mb-1">O₂ + e⁻ → •O₂⁻</div>
                  <p className="text-slate-400 text-[11px]">
                    Photoexcited conduction band electrons trapped at V_O sites reduce dissolved oxygen.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">Hydroxyl Radical Formation</div>
                  <div className="font-mono text-purple-400 text-xs mb-1">H₂O + h⁺ → •OH + H⁺</div>
                  <p className="text-slate-400 text-[11px]">
                    Valence band photogenerated holes oxidize surface hydroxyl groups.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
