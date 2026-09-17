import React from 'react';
import { CameraPreset, RenderStyle, AtomData, LayerFilter } from '../types';
import { ModelData } from '../utils/atomisticGenerator';
import {
  generateGLBFile,
  generateInteractiveHTML,
  generateBlenderScript,
  generateOBJFile,
  generatePDBFile,
  generateCIFFile,
  generateXYZFile,
  generatePyMOLScript,
  generateChimeraXScript,
} from '../utils/exportGenerators';
import {
  Layers,
  Zap,
  Flame,
  Activity,
  Eye,
  Sliders,
  Download,
  Info,
  Check,
  Target,
  Sparkles,
  RefreshCw,
  Maximize2,
  Atom,
  Boxes,
  HelpCircle,
  Box,
  Compass,
  FileText,
  SlidersHorizontal,
  Globe,
  FileCode,
  Terminal,
  Monitor,
  Laptop,
} from 'lucide-react';

interface ControlPanelProps {
  model: ModelData;
  renderMode: RenderStyle;
  setRenderMode: (mode: RenderStyle) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  highlightBridges: boolean;
  setHighlightBridges: (val: boolean) => void;
  highlightDefects: boolean;
  setHighlightDefects: (val: boolean) => void;
  showElectronFlow: boolean;
  setShowElectronFlow: (val: boolean) => void;
  showROSAnimation: boolean;
  setShowROSAnimation: (val: boolean) => void;
  selectedAtom: AtomData | null;
  numLayers: number;
  setNumLayers: (val: number) => void;
  stackingAngle: number;
  setStackingAngle: (val: number) => void;
  wrinkleAmp: number;
  setWrinkleAmp: (val: number) => void;
  onOpenDataModal: () => void;
  layerFilter: LayerFilter;
  setLayerFilter: (filter: LayerFilter) => void;
  atomScale: number;
  setAtomScale: (scale: number) => void;
  showBoundingBox: boolean;
  setShowBoundingBox: (val: boolean) => void;
  onOpenEDXModal: () => void;
  onOpenReplicationModal?: () => void;
  onOpenExternalModal?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  model,
  renderMode,
  setRenderMode,
  cameraPreset,
  setCameraPreset,
  highlightBridges,
  setHighlightBridges,
  highlightDefects,
  setHighlightDefects,
  showElectronFlow,
  setShowElectronFlow,
  showROSAnimation,
  setShowROSAnimation,
  selectedAtom,
  numLayers,
  setNumLayers,
  stackingAngle,
  setStackingAngle,
  wrinkleAmp,
  setWrinkleAmp,
  onOpenDataModal,
  layerFilter,
  setLayerFilter,
  atomScale,
  setAtomScale,
  showBoundingBox,
  setShowBoundingBox,
  onOpenEDXModal,
  onOpenReplicationModal,
  onOpenExternalModal,
}) => {
  const [activeTab, setActiveTab] = React.useState<'display' | 'camera' | 'structure' | 'layers' | 'inspector' | 'export'>('display');

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDB = () => {
    const pdbContent = generatePDBFile(model);
    downloadFile(pdbContent, 'zno_graphene_nanocomposite.pdb', 'chemical/x-pdb');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              3D Simulation Control Center
            </h3>
            <p className="text-[10px] text-slate-400">Atomistic Configuration & Physics</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenReplicationModal && (
            <button
              id="btn-open-replication-suite"
              onClick={onOpenReplicationModal}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="Open full 3D protein & molecular replication suite (PDB, CIF, XYZ, PyMOL, ChimeraX)"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Suite</span>
            </button>
          )}

          <button
            id="btn-download-pdb"
            onClick={handleDownloadPDB}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95"
            title="Export standard PDB file (zno_graphene_nanocomposite.pdb)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>.PDB</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-slate-950 px-2 py-1.5 border-b border-slate-800 text-xs gap-1 overflow-x-auto">
        <button
          id="tab-control-display"
          onClick={() => setActiveTab('display')}
          className={`flex-1 min-w-[60px] py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'display'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Visual
        </button>
        <button
          id="tab-control-camera"
          onClick={() => setActiveTab('camera')}
          className={`flex-1 min-w-[60px] py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'camera'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Angles
        </button>
        <button
          id="tab-control-layers"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 min-w-[60px] py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'layers'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Layers
        </button>
        <button
          id="tab-control-structure"
          onClick={() => setActiveTab('structure')}
          className={`flex-1 min-w-[60px] py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'structure'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tuning
        </button>
        <button
          id="tab-control-inspector"
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 min-w-[60px] py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'inspector'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Inspector
        </button>
        <button
          id="tab-control-export"
          onClick={() => setActiveTab('export')}
          className={`flex-1 min-w-[60px] py-1.5 rounded-lg font-medium transition-all text-center ${
            activeTab === 'export'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm border border-cyan-500/40'
              : 'text-cyan-400/80 hover:text-cyan-300'
          }`}
        >
          Export
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: DISPLAY & RENDERING MODES */}
        {activeTab === 'display' && (
          <div className="space-y-3.5">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Color Schemes & Representations
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'reference_image_view',
                    label: 'Reference Match',
                    desc: 'C: Green | Zn: Yellow | O: Red',
                    icon: Target,
                  },
                  {
                    id: 'ball_and_stick',
                    label: 'Ball & Stick',
                    desc: 'Covalent & ionic lattice bonds',
                    icon: Atom,
                  },
                  {
                    id: 'space_filling',
                    label: 'Space Filling (CPK)',
                    desc: 'Van der Waals packing radii',
                    icon: Boxes,
                  },
                  {
                    id: 'edx_mapping',
                    label: 'DLSU EDX Mapping',
                    desc: '51.66% C | 24.85% Zn | 23.49% O',
                    icon: Sparkles,
                  },
                  {
                    id: 'electron_flow',
                    label: 'Electron Transport',
                    desc: '7.9 ns carrier transfer paths',
                    icon: Zap,
                  },
                  {
                    id: 'strain_map',
                    label: 'Interfacial Strain',
                    desc: 'Lattice mismatch relaxation',
                    icon: Activity,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = renderMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setRenderMode(item.id as RenderStyle)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-cyan-400' : 'text-slate-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-slate-100' : 'text-slate-300'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Adjustments (Atom Size & Bounding Box) */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Viewport Mesh & Scale Settings
              </div>

              {/* Atom Sphere Size Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Atom Radius Multiplier:</span>
                  <span className="font-mono text-cyan-400 font-bold">{atomScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.6}
                  step={0.05}
                  value={atomScale}
                  onChange={(e) => setAtomScale(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0.5x (Slender)</span>
                  <span>1.0x (Default)</span>
                  <span>1.6x (Dense Packing)</span>
                </div>
              </div>

              {/* Show 3D Bounding Box */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200">Show 3D Coordinate Bounding Cage</span>
                </div>
                <input
                  type="checkbox"
                  checked={showBoundingBox}
                  onChange={(e) => setShowBoundingBox(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Dynamic Physical Simulation Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Dynamic Physics Engines
              </div>

              {/* Electron flow toggle */}
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Photoinduced Electron Flow
                    </div>
                    <div className="text-[10px] text-slate-400">
                      7.9 ns lifetime transport across 16 Zn-O-C bridges
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showElectronFlow}
                  onChange={(e) => setShowElectronFlow(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* ROS Animation toggle */}
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Photocatalytic ROS Generation
                    </div>
                    <div className="text-[10px] text-slate-400">
                      •O₂⁻ and •OH radical emission at V_O sites
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showROSAnimation}
                  onChange={(e) => setShowROSAnimation(e.target.checked)}
                  className="w-4 h-4 accent-red-400 rounded cursor-pointer"
                />
              </div>

              {/* 16 Bridges Highlight */}
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Highlight 16 Covalent Bridges
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Strict 1.430 Å interfacial pinning bonds
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={highlightBridges}
                  onChange={(e) => setHighlightBridges(e.target.checked)}
                  className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                />
              </div>

              {/* 14 Oxygen Vacancies Highlight */}
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Highlight 14 V_O Defect Sites
                    </div>
                    <div className="text-[10px] text-slate-400">
                      pH 10.01 active catalytic dangling bonds
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={highlightDefects}
                  onChange={(e) => setHighlightDefects(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMERA & FIGURE PRESETS */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Research Defense Figure Perspectives
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'reference_exact',
                  title: 'Figure 1: Exact Reference Angle (Default)',
                  subtitle: 'Match to defense graphic orientation',
                  details: '5-layer GNP sheet with porous wurtzite ZnO cluster',
                },
                {
                  id: 'figure2_topdown',
                  title: 'Figure 2: Top-Down Orthographic View',
                  subtitle: 'Angle 2: DLSU EDX Elemental Mapping Projection',
                  details: 'Demonstrates uniform dispersion across green basal plane',
                },
                {
                  id: 'figure3_closeup',
                  title: 'Figure 3: Interfacial Close-Up',
                  subtitle: 'Angle 3: 16 Covalent Zn-O-C Bridges at 1.430 Å',
                  details: 'Sub-angstrom pinning & electron transfer conduit',
                },
                {
                  id: 'cross_section',
                  title: 'Micro-Porous Cross Section',
                  subtitle: 'Gas & Fluid Diffusion Channels',
                  details: 'Shows micro-pores preventing dense boulder agglomeration',
                },
                {
                  id: 'defect_angle',
                  title: 'Surface Defect Focus',
                  subtitle: '14 Active Oxygen Vacancies (V_O)',
                  details: 'pH 10.01 dangling Zn²⁺ catalytic reaction centers',
                },
                {
                  id: 'overview',
                  title: '3D Free Orbit Overview',
                  subtitle: 'Global Perspective of Heterostructure',
                  details: 'Full interactive rotation and inspection',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCameraPreset(item.id as CameraPreset)}
                  className={`w-full p-3 rounded-xl text-left border transition-all ${
                    cameraPreset === item.id
                      ? 'bg-slate-800 border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        cameraPreset === item.id ? 'text-cyan-300' : 'text-slate-200'
                      }`}
                    >
                      {item.title}
                    </span>
                    {cameraPreset === item.id && (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-300">{item.subtitle}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.details}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LAYER ISOLATION & HIERARCHY */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Component Isolation & Dissection
            </div>
            <p className="text-[11px] text-slate-400">
              Isolate specific sub-assemblies to inspect inner interfaces and turbostratic stacking.
            </p>

            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'Complete Heterojunction (All Components)', count: `${model.atoms.length} Atoms` },
                { id: 'zno_only', label: 'ZnO Wurtzite Nanocluster Only', count: 'Zn + O Atoms' },
                { id: 'gnp_only', label: 'GNP 5-Layer Crumpled Sheet Only', count: 'Carbon + Functional Groups' },
                { id: 'interface_only', label: 'Interfacial Contact Zone (16 Pinning Bridges)', count: '1.430 Å Bonds' },
                { id: 'layer_5', label: 'Top GNP Layer 5 (Direct ZnO Interface)', count: 'Topmost Sheet' },
                { id: 'layer_4', label: 'Internal GNP Layer 4', count: 'Intermediate' },
                { id: 'layer_3', label: 'Internal GNP Layer 3', count: 'Intermediate' },
                { id: 'layer_2', label: 'Internal GNP Layer 2', count: 'Intermediate' },
                { id: 'layer_1', label: 'Bottom GNP Layer 1 (Basal Support)', count: 'Substrate Face' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLayerFilter(opt.id as LayerFilter)}
                  className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                    layerFilter === opt.id
                      ? 'bg-slate-800 border-cyan-400 text-cyan-300 font-bold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    {opt.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PARAMETER TUNING */}
        {activeTab === 'structure' && (
          <div className="space-y-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Nanoscale Structural Tuning
            </div>

            {/* Graphene Layers Slider */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Graphene Layer Count:</span>
                <span className="font-mono text-cyan-400 font-bold">{numLayers} Layers (88.18 nm)</span>
              </div>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={numLayers}
                onChange={(e) => setNumLayers(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                Matches turbostratic GNP synthesized with local 600 RPM centrifuge limits.
              </div>
            </div>

            {/* Turbostratic Stacking Fault Angle Slider */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Stacking Fault Rotation:</span>
                <span className="font-mono text-cyan-400 font-bold">±{stackingAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={stackingAngle}
                onChange={(e) => setStackingAngle(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                Figure 1 Table 4.5 specifies ±12° turbostratic rotation between layers.
              </div>
            </div>

            {/* Wrinkle Corrugation Amplitude */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Wrinkle Corrugation:</span>
                <span className="font-mono text-cyan-400 font-bold">{(wrinkleAmp * 10).toFixed(1)} Å</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.1}
                value={wrinkleAmp}
                onChange={(e) => setWrinkleAmp(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                Simulates ultrasonic crumpled morphology acting as a mechanical anchoring net.
              </div>
            </div>

            {/* Open Experimental Data Dialog */}
            <button
              onClick={onOpenDataModal}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all shadow-md"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Open Experimental Correlation Dashboard</span>
            </button>
          </div>
        )}

        {/* TAB 5: ATOM INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sub-Angstrom Atom Inspector
            </div>

            {selectedAtom ? (
              <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-950"
                      style={{ backgroundColor: selectedAtom.color }}
                    >
                      {selectedAtom.element}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{selectedAtom.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Atom ID: #{selectedAtom.id}</div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {selectedAtom.element === 'C'
                      ? 'Carbon'
                      : selectedAtom.element === 'Zn'
                      ? 'Zinc'
                      : selectedAtom.element === 'H'
                      ? 'Hydrogen (-OH/-COOH)'
                      : selectedAtom.element === 'VO'
                      ? 'V_O Defect'
                      : 'Oxygen'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Oxidation / State</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedAtom.charge || 'Neutral'}</span>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Coordination No.</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedAtom.coordination || 4}-fold</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-400 mb-1">Sub-Angstrom Coordinates (X, Y, Z):</div>
                  <div className="font-mono text-emerald-400 font-semibold">
                    X: {selectedAtom.x.toFixed(4)} Å | Y: {selectedAtom.y.toFixed(4)} Å | Z: {selectedAtom.z.toFixed(4)} Å
                  </div>
                </div>

                {selectedAtom.isBridgeBonded && (
                  <div className="p-2.5 bg-cyan-950/60 rounded-lg border border-cyan-500/40 text-xs text-cyan-200">
                    <div className="font-bold flex items-center gap-1.5 mb-0.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>16 Covalent Pinning Bridge #{selectedAtom.bridgeId}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Strict covalent bond length: <strong className="text-cyan-300 font-mono">1.430 Å</strong>. Facilitates ultrafast electron transfer to graphene basal plane.
                    </p>
                  </div>
                )}

                {selectedAtom.isSurfaceDefect && (
                  <div className="p-2.5 bg-red-950/60 rounded-lg border border-red-500/40 text-xs text-red-200">
                    <div className="font-bold flex items-center gap-1.5 mb-0.5">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span>Active Surface Oxygen Vacancy (V_O)</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Synthesized at pH 10.01. Unsaturated Zn²⁺ dangling bond serves as catalytic reaction center for •O₂⁻ / •OH generation.
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 italic">
                  {selectedAtom.description}
                </p>
              </div>
            ) : (
              <div className="p-6 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                <Target className="w-6 h-6 text-slate-500 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">No Atom Selected</div>
                <p className="text-[11px] text-slate-500">
                  Click any atom on the 3D model to inspect its exact spatial coordinates, coordination number, and interfacial bond states.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: EXPORT & 3D REPLICATION SUITE */}
        {activeTab === 'export' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Exact 3D Protein & Molecular Files
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                100% Match
              </span>
            </div>

            {/* External Execution Suite Banner */}
            <div className="p-3 bg-gradient-to-br from-purple-950/40 via-slate-950 to-indigo-950/40 rounded-xl border border-purple-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Laptop className="w-4 h-4 text-purple-400" />
                  <span>Execute App Externally & Standalone</span>
                </div>
                <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                  Full Portability
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Run this complete application offline in any browser via a single self-contained HTML file, or launch locally via Python, Node.js, Docker, or Cloud Run.
              </p>
              {onOpenExternalModal && (
                <button
                  id="btn-open-external-modal-tab"
                  onClick={onOpenExternalModal}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 mt-1"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Open External Execution Hub & Launchers</span>
                </button>
              )}
            </div>

            <div className="p-3 bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-900 rounded-xl border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Upload to Any 3D Molecular Viewer</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Download coordinates with full HETATM topography, exact 16 Zn-O-C covalent bridge connectivity, and 14 V_O active defect sites.
              </p>
              {onOpenReplicationModal && (
                <button
                  id="btn-open-full-export-suite"
                  onClick={onOpenReplicationModal}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 mt-1"
                >
                  <Box className="w-4 h-4" />
                  <span>Open Full 3D Replication Suite & Guide</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Box className="w-3 h-3" />
                  <span>3D Modeling & Mesh Downloads</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Pre-baked Colors
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-dl-glb-tab"
                  onClick={async () => {
                    try {
                      const glbBuffer = await generateGLBFile(model);
                      const blob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'zno_graphene_nanocomposite.glb';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Box className="w-4 h-4 text-cyan-400" />
                    <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-cyan-300">Binary .GLB (3D)</div>
                  <div className="text-[10px] text-slate-300">Sketchfab, Three.js, Blender</div>
                </button>

                <button
                  id="btn-dl-html-tab"
                  onClick={() => {
                    const html = generateInteractiveHTML(model);
                    downloadFile(html, 'zno_gnp_interactive_3d.html', 'text/html');
                  }}
                  className="p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-emerald-300">Offline .HTML</div>
                  <div className="text-[10px] text-slate-300">Standalone 3D Player</div>
                </button>

                <button
                  id="btn-dl-obj-tab"
                  onClick={() => {
                    const { obj, mtl } = generateOBJFile(model);
                    downloadFile(obj, 'zno_graphene_nanocomposite.obj', 'text/plain');
                    setTimeout(() => downloadFile(mtl, 'zno_graphene_nanocomposite.mtl', 'text/plain'), 200);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-yellow-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-300" />
                  </div>
                  <div className="text-xs font-bold text-slate-100">Wavefront .OBJ</div>
                  <div className="text-[10px] text-slate-400">Includes .MTL Materials</div>
                </button>

                <button
                  id="btn-dl-blender-tab"
                  onClick={() => {
                    const py = generateBlenderScript(model);
                    downloadFile(py, 'generate_exact_zno_gnp.py', 'text/x-python');
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-300" />
                  </div>
                  <div className="text-xs font-bold text-slate-100">Blender Script (.py)</div>
                  <div className="text-[10px] text-slate-400">Cycles/EEVEE procedural</div>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Atom className="w-3 h-3" />
                <span>Molecular & Protein Viewers</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-dl-pdb-tab"
                  onClick={handleDownloadPDB}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300" />
                  </div>
                  <div className="text-xs font-bold text-slate-100">Standard .PDB</div>
                  <div className="text-[10px] text-slate-400">Mol*, PyMOL, ChimeraX</div>
                </button>

                <button
                  id="btn-dl-cif-tab"
                  onClick={() => {
                    const cif = generateCIFFile(model);
                    downloadFile(cif, 'zno_graphene_nanocomposite.cif', 'text/plain');
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300" />
                  </div>
                  <div className="text-xs font-bold text-slate-100">IUCr mmCIF (.cif)</div>
                  <div className="text-[10px] text-slate-400">RCSB PDB, Mol* Viewer</div>
                </button>

                <button
                  id="btn-dl-xyz-tab"
                  onClick={() => {
                    const xyz = generateXYZFile(model);
                    downloadFile(xyz, 'zno_graphene_nanocomposite.xyz', 'chemical/x-xyz');
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-yellow-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Atom className="w-4 h-4 text-yellow-400" />
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-300" />
                  </div>
                  <div className="text-xs font-bold text-slate-100">Cartesian .XYZ</div>
                  <div className="text-[10px] text-slate-400">VESTA, Avogadro</div>
                </button>

                <button
                  id="btn-dl-pymol-tab"
                  onClick={() => {
                    const pml = generatePyMOLScript(model);
                    downloadFile(pml, 'replicate_exact_pymol.pml', 'text/plain');
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300" />
                  </div>
                  <div className="text-xs font-bold text-slate-100">PyMOL Script (.pml)</div>
                  <div className="text-[10px] text-slate-400">Exact RGB colors & view</div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verified Presentation Parameters
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">C (Carbon):</span>
                  <span className="font-mono text-emerald-400 font-bold">#00e676 (Green)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zn (Zinc):</span>
                  <span className="font-mono text-yellow-400 font-bold">#facc15 (Yellow)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">O (Oxygen):</span>
                  <span className="font-mono text-red-400 font-bold">#ef4444 (Red)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">H (Hydrogen Edge):</span>
                  <span className="font-mono text-slate-100 font-bold">#ffffff (White)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
