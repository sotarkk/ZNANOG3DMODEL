import React, { useState, useMemo, useEffect } from 'react';
import { AtomData, BondData, CameraPreset, PresentationSlide, RenderStyle, CustomEDXData, LayerFilter, FocusTarget, AuthorBranding, DEFAULT_AUTHOR_BRANDING } from './types';
import { generateNanocompositeModel, DEFAULT_EDX_DATA } from './utils/atomisticGenerator';
import { ModelViewer3D } from './components/ModelViewer3D';
import { AtomicBondExplorer } from './components/AtomicBondExplorer';
import { ControlPanel } from './components/ControlPanel';
import { ExperimentalDataModal } from './components/ExperimentalDataModal';
import { EDXDataCustomizerModal } from './components/EDXDataCustomizerModal';
import { ReplicationExportModal } from './components/ReplicationExportModal';
import { ExternalExecutionModal } from './components/ExternalExecutionModal';
import { VideoTourShowcaseModal } from './components/VideoTourShowcaseModal';
import { BondFormationVideoExplorer } from './components/BondFormationVideoExplorer';
import {
  Atom,
  Sparkles,
  Sliders,
  Activity,
  Zap,
  Flame,
  Maximize2,
  Minimize2,
  Globe,
  Laptop,
  Ruler,
  Film,
} from 'lucide-react';

export default function App() {
  // Model Structural Parameters (4-layer square GNP stack matching reference image)
  const [numLayers, setNumLayers] = useState<number>(4);
  const [stackingAngle, setStackingAngle] = useState<number>(8);
  const [wrinkleAmp, setWrinkleAmp] = useState<number>(0.45);

  // Custom User EDX Data State
  const [customEDX, setCustomEDX] = useState<CustomEDXData>({ ...DEFAULT_EDX_DATA });

  // Generate atomistic model (re-evaluated whenever layers, angle, wrinkle, or custom EDX changes)
  const model = useMemo(() => {
    return generateNanocompositeModel({
      numLayers,
      stackingFaultAngle: stackingAngle,
      wrinkleAmplitude: wrinkleAmp,
      znoScale: 1.0,
      enableEdgeFunctionalGroups: true,
      customEDX,
    });
  }, [numLayers, stackingAngle, wrinkleAmp, customEDX]);

  // Simulation & Visualization State
  const [renderMode, setRenderMode] = useState<RenderStyle>('reference_image_view');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('reference_exact');
  const [highlightBridges, setHighlightBridges] = useState<boolean>(true);
  const [highlightDefects, setHighlightDefects] = useState<boolean>(true);
  const [showElectronFlow, setShowElectronFlow] = useState<boolean>(true);
  const [showROSAnimation, setShowROSAnimation] = useState<boolean>(false);
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');
  const [atomScale, setAtomScale] = useState<number>(1.0);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);

  // Selection, Bond Explorer & Measurement State
  const [selectedAtom, setSelectedAtom] = useState<AtomData | null>(null);
  const [selectedBond, setSelectedBond] = useState<BondData | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);

  // Sidebar Mode State ('bonds' for Atomic Bond Explorer vs 'controls')
  const [sidebarMode, setSidebarMode] = useState<'bonds' | 'controls'>('bonds');

  // Modal States
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [isEDXModalOpen, setIsEDXModalOpen] = useState<boolean>(false);
  const [isReplicationModalOpen, setIsReplicationModalOpen] = useState<boolean>(false);
  const [isExternalExecModalOpen, setIsExternalExecModalOpen] = useState<boolean>(false);
  const [isVideoTourShowcaseOpen, setIsVideoTourShowcaseOpen] = useState<boolean>(false);
  const [isFormationExplorerOpen, setIsFormationExplorerOpen] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [isCleanScreenMode, setIsCleanScreenMode] = useState<boolean>(false);
  const [tourSeekTarget, setTourSeekTarget] = useState<number | null>(null);
  const [tourAutoRecordRequest, setTourAutoRecordRequest] = useState<{ id: number; quality: '4k' | '1080p' } | null>(null);

  // Author & Research Branding State (white-labeled for ISEF 2026)
  const [branding, setBranding] = useState<AuthorBranding>(DEFAULT_AUTHOR_BRANDING);

  // Fullscreen state & handler
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Camera smooth zoom & focus on specific atomic bond (Zn, O, C)
  const handleZoomToBond = (bond: BondData, preset: 'closeup' | 'axial' | 'coordination' | 'macro' = 'closeup') => {
    setSelectedBond(bond);
    if (bond.atom1) setSelectedAtom(bond.atom1);

    const p1 = bond.atom1;
    const p2 = bond.atom2;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const midZ = (p1.z + p2.z) / 2;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const bondLen = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const bondDir = [dx / bondLen, dy / bondLen, dz / bondLen];

    let dist = 4.8;
    let offset = [0, -dist, dist * 0.4];

    if (preset === 'closeup') {
      // Calculate perpendicular vector for clear broadside profile view of the bond
      let perpX = -bondDir[1];
      let perpY = bondDir[0];
      let perpZ = 0;
      let perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
      if (perpLen < 0.2) {
        perpX = bondDir[2];
        perpY = 0;
        perpZ = -bondDir[0];
        perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
      }
      perpX /= perpLen;
      perpY /= perpLen;
      perpZ /= perpLen;

      dist = 4.6;
      offset = [perpX * dist, perpY * dist, perpZ * dist + 1.2];
    } else if (preset === 'axial') {
      dist = 5.2;
      offset = [bondDir[0] * dist, bondDir[1] * dist, bondDir[2] * dist];
    } else if (preset === 'coordination') {
      dist = 8.0;
      offset = [-dist * 0.35, -dist * 0.65, dist * 0.5];
    } else if (preset === 'macro') {
      dist = 16.0;
      offset = [-dist * 0.55, -dist * 0.65, dist * 0.45];
    }

    setFocusTarget({
      position: [midX + offset[0], midY + offset[1], midZ + offset[2]],
      lookAt: [midX, midY, midZ],
      key: Date.now(),
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden select-none">
      {/* Top Functional Header Bar - Dedicated to Useful Controls & Live Telemetry (Hidden in Clean Screen Tour Mode) */}
      {!isCleanScreenMode && (
        <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 md:px-4 flex items-center justify-between z-20 shrink-0 gap-2">
        {/* Left Section: Live Stoichiometry & Active Interfacial Sites */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {/* Quick Stoichiometry Trigger Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setIsEDXModalOpen(true)}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Carbon Stoichiometry: 51.66 at% (Click to customize EDX)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span className="font-semibold">C:</span>
              <span>{customEDX.carbonAtPct}%</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsEDXModalOpen(true)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
              title="Zinc Stoichiometry: 24.85 at% (Click to customize EDX)"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              <span className="font-semibold">Zn:</span>
              <span>{customEDX.zincAtPct}%</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsEDXModalOpen(true)}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
              title="Oxygen Stoichiometry: 23.49 at% (Click to customize EDX)"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
              <span className="font-semibold">O:</span>
              <span>{customEDX.oxygenAtPct}%</span>
            </button>
          </div>

          {/* Quick Interfacial Chemistry Toggles */}
          <button
            onClick={() => setHighlightBridges(!highlightBridges)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all border ${
              highlightBridges
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle 16 Covalent Zn-O-C Interfacial Bridges (1.430 Å)"
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                highlightBridges ? 'bg-rose-400 animate-pulse ring-2 ring-rose-400/40' : 'bg-slate-600'
              }`}
            ></span>
            <span className="font-mono font-bold">16 Zn-O-C</span>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">(1.430 Å)</span>
          </button>

          <button
            onClick={() => setHighlightDefects(!highlightDefects)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all border ${
              highlightDefects
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle 14 Catalytic Surface Oxygen Vacancies (V_O Sites)"
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                highlightDefects ? 'bg-cyan-400 animate-pulse ring-2 ring-cyan-400/40' : 'bg-slate-600'
              }`}
            ></span>
            <span className="font-mono font-bold">14 V_O</span>
            <span className="hidden sm:inline text-[10px] text-slate-400">Vacancies</span>
          </button>

          {/* Model Particle Density Counters */}
          <div className="hidden 2xl:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-slate-200 font-bold">{model.atoms.length}</span> atoms
            <span className="text-slate-600">•</span>
            <span className="text-slate-200 font-bold">{model.bonds.length}</span> bonds
          </div>
        </div>

        {/* Center Section: Primary Visual & Camera Quick Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Quick Render Style Selector */}
          <select
            id="header-render-style"
            value={renderMode}
            onChange={(e) => setRenderMode(e.target.value as RenderStyle)}
            className="bg-slate-950 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-sm transition-all"
            title="Switch 3D Render Mode"
          >
            <option value="reference_image_view">Reference Image View</option>
            <option value="ball_and_stick">Ball & Stick Lattice</option>
            <option value="space_filling">Spacefill (van der Waals)</option>
            <option value="wireframe">Wireframe Lattice</option>
            <option value="electron_flow">Electron Flow Conduit</option>
            <option value="defect_focus">Oxygen Vacancies (V_O)</option>
            <option value="edx_mapping">EDX Stoichiometry Map</option>
          </select>

          {/* Camera Angles Segmented Control */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCameraPreset('reference_exact')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                cameraPreset === 'reference_exact' || cameraPreset === 'figure1_side'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fig 1: Exact Experimental Side Elevation"
            >
              Side
            </button>
            <button
              onClick={() => setCameraPreset('figure2_topdown')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                cameraPreset === 'figure2_topdown'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fig 2: Top-Down Basal Plane"
            >
              Top
            </button>
            <button
              onClick={() => setCameraPreset('figure3_closeup')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                cameraPreset === 'figure3_closeup'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fig 3: Interfacial Bridges Close-Up"
            >
              Bridges
            </button>
            <button
              onClick={() => setCameraPreset('overview')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                cameraPreset === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Isometric 3D Perspective"
            >
              Iso
            </button>
          </div>

          {/* Quick Dynamic Visual Toggles */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setShowElectronFlow(!showElectronFlow)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                showElectronFlow
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Ballistic Electron Transfer Animation"
            >
              <Zap className="w-3 h-3 text-sky-400" />
              <span>e⁻ Flow</span>
            </button>

            <button
              onClick={() => setShowROSAnimation(!showROSAnimation)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                showROSAnimation
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle ROS Radical Generation Effect"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>ROS</span>
            </button>

            <button
              onClick={() => setMeasurementMode(!measurementMode)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                measurementMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Bond Distance Caliper / Measurement Tool"
            >
              <Ruler className="w-3 h-3 text-emerald-400" />
              <span>Measure</span>
            </button>
          </div>
        </div>

        {/* Right Section: Action Modals, Sidebar Modes & Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zn-O-C Bond Formation Video Explorer Button */}
          <button
            id="btn-open-formation-explorer-header"
            onClick={() => setIsFormationExplorerOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25 hover:from-emerald-500/35 hover:to-cyan-500/35 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/50 flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Zn-O-C Bond Formation Simulation • Fullscreen Panel Presentation, Step-by-Step Mechanisms & 4K/1080p Video Export"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden xl:inline">Formation Video (Full Screen &amp; Panel)</span>
            <span className="xl:hidden">Formation Video</span>
          </button>

          {/* 3D Video Tour Showcase Modal Button */}
          <button
            id="btn-open-video-tour-header"
            onClick={() => setIsVideoTourShowcaseOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-200 hover:text-white text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="3D Video Tour Showcase (6 Guided Chapters, Narration, Camera Paths & Recording)"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">3D Video Tour</span>
            <span className="xl:hidden">Tour</span>
          </button>

          {/* Standalone HTML & External Execution Modal Button */}
          <button
            id="btn-open-external-exec-header"
            onClick={() => setIsExternalExecModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 text-purple-200 hover:text-white text-xs font-bold border border-purple-500/40 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Execute App Externally (Standalone HTML, 1-Click Launchers, Docker)"
          >
            <Laptop className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Execute Externally</span>
            <span className="xl:hidden">Run</span>
          </button>

          {/* 3D Protein & Molecular Export Suite Button */}
          <button
            id="btn-open-replication-header"
            onClick={() => setIsReplicationModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="3D Molecular Export (.PDB, .CIF, .XYZ, .OBJ, .GLB, Blender)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">3D Molecular Export</span>
            <span className="xl:hidden">Export</span>
          </button>

          {/* DLSU Lab Data Comparison Modal Button */}
          <button
            id="btn-open-data-modal"
            onClick={() => setIsDataModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm hidden md:flex"
            title="Open DLSU Characterization & Validation Data"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lab Data</span>
          </button>

          {/* Sidebar Mode Tabs (Bond Explorer vs Controls) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              id="tab-toggle-bonds"
              onClick={() => setSidebarMode('bonds')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sidebarMode === 'bonds'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Select & Explore Atomic Bonds (Zn, O, C) with 3D Zoom"
            >
              <Atom className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bond Explorer (Zn, O, C)</span>
              <span className="sm:hidden">Bonds</span>
            </button>
            <button
              id="tab-toggle-controls"
              onClick={() => setSidebarMode('controls')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sidebarMode === 'controls'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Open Atomistic Structural Controls & Physics Sliders"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Controls</span>
            </button>
          </div>

          {/* Fullscreen Mode Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Presentation Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>
      )}

      {/* Main Workspace Layout */}
      <main className={`flex-1 flex flex-col lg:flex-row overflow-hidden ${isCleanScreenMode ? 'p-0 gap-0' : 'p-3 gap-3'}`}>
        {/* Left / Main Section: 3D Atomistic WebGL Canvas */}
        <div className={isCleanScreenMode ? 'fixed inset-0 z-40 bg-[#060913]' : 'flex-1 h-full min-h-[380px] flex flex-col relative'}>
          <ModelViewer3D
            model={model}
            renderMode={renderMode}
            cameraPreset={cameraPreset}
            highlightBridges={highlightBridges}
            highlightDefects={highlightDefects}
            showElectronFlow={showElectronFlow}
            showROSAnimation={showROSAnimation}
            onSelectAtom={setSelectedAtom}
            selectedAtom={selectedAtom}
            selectedBond={selectedBond}
            onSelectBond={setSelectedBond}
            onZoomToBond={handleZoomToBond}
            focusTarget={focusTarget}
            measurementMode={measurementMode}
            setMeasurementMode={setMeasurementMode}
            layerFilter={layerFilter}
            atomScale={atomScale}
            showBoundingBox={showBoundingBox}
            onOpenEDXEditor={() => setIsEDXModalOpen(true)}
            onOpenReplicationModal={() => setIsReplicationModalOpen(true)}
            isTourActive={isTourActive}
            setIsTourActive={(active) => {
              setIsTourActive(active);
              if (!active) setIsCleanScreenMode(false);
            }}
            tourSeekTarget={tourSeekTarget}
            onOpenTourShowcase={() => setIsVideoTourShowcaseOpen(true)}
            isCleanScreen={isCleanScreenMode}
            onToggleCleanScreen={() => setIsCleanScreenMode(!isCleanScreenMode)}
            tourAutoRecordRequest={tourAutoRecordRequest}
          />
        </div>

        {/* Right Section: Sidebar (Atomic Bond Explorer OR Control Center) - Hidden in Clean Screen Mode */}
        {!isCleanScreenMode && (
          <aside className="w-full lg:w-[460px] xl:w-[500px] h-[340px] lg:h-full shrink-0 flex flex-col">
            {sidebarMode === 'bonds' ? (
              <AtomicBondExplorer
                model={model}
                selectedBond={selectedBond}
                onSelectBond={(bond) => {
                  setSelectedBond(bond);
                  if (bond) setSelectedAtom(bond.atom1);
                }}
                onZoomToBond={handleZoomToBond}
                onZoomToTarget={(target) => setFocusTarget(target)}
                onSelectAtom={setSelectedAtom}
                highlightBridges={highlightBridges}
                setHighlightBridges={setHighlightBridges}
                highlightDefects={highlightDefects}
                setHighlightDefects={setHighlightDefects}
                showElectronFlow={showElectronFlow}
                setShowElectronFlow={setShowElectronFlow}
                setLayerFilter={setLayerFilter}
                onOpenFormationExplorer={() => setIsFormationExplorerOpen(true)}
              />
            ) : (
              <ControlPanel
                model={model}
                renderMode={renderMode}
                setRenderMode={setRenderMode}
                cameraPreset={cameraPreset}
                setCameraPreset={setCameraPreset}
                highlightBridges={highlightBridges}
                setHighlightBridges={setHighlightBridges}
                highlightDefects={highlightDefects}
                setHighlightDefects={setHighlightDefects}
                showElectronFlow={showElectronFlow}
                setShowElectronFlow={setShowElectronFlow}
                showROSAnimation={showROSAnimation}
                setShowROSAnimation={setShowROSAnimation}
                selectedAtom={selectedAtom}
                numLayers={numLayers}
                setNumLayers={setNumLayers}
                stackingAngle={stackingAngle}
                setStackingAngle={setStackingAngle}
                wrinkleAmp={wrinkleAmp}
                setWrinkleAmp={setWrinkleAmp}
                onOpenDataModal={() => setIsDataModalOpen(true)}
                layerFilter={layerFilter}
                setLayerFilter={setLayerFilter}
                atomScale={atomScale}
                setAtomScale={setAtomScale}
                showBoundingBox={showBoundingBox}
                setShowBoundingBox={setShowBoundingBox}
                onOpenEDXModal={() => setIsEDXModalOpen(true)}
                onOpenReplicationModal={() => setIsReplicationModalOpen(true)}
                onOpenExternalModal={() => setIsExternalExecModalOpen(true)}
              />
            )}
          </aside>
        )}
      </main>

      {/* 3D Video Tour Showcase Modal */}
      <VideoTourShowcaseModal
        isOpen={isVideoTourShowcaseOpen}
        onClose={() => setIsVideoTourShowcaseOpen(false)}
        onStartTourAtChapter={(chapter) => {
          setIsVideoTourShowcaseOpen(false);
          setIsTourActive(true);
          setTourSeekTarget(chapter.startTime);
        }}
        onStartRecordingTour={(quality = '4k') => {
          setIsVideoTourShowcaseOpen(false);
          setIsTourActive(true);
          setTourSeekTarget(0);
          setTourAutoRecordRequest({ id: Date.now(), quality });
        }}
        onOpenFormationExplorer={() => {
          setIsVideoTourShowcaseOpen(false);
          setIsFormationExplorerOpen(true);
        }}
      />

      {/* 30-Second Zn-O-C Bond Formation & Minimal Angles Video Explorer */}
      <BondFormationVideoExplorer
        isOpen={isFormationExplorerOpen}
        onClose={() => setIsFormationExplorerOpen(false)}
        model={model}
      />

      {/* External Execution Suite & Standalone Runner Modal */}
      <ExternalExecutionModal
        isOpen={isExternalExecModalOpen}
        onClose={() => setIsExternalExecModalOpen(false)}
        model={model}
        branding={branding}
        onUpdateBranding={setBranding}
      />

      {/* 3D Protein & Molecular Replication Export Center Modal */}
      <ReplicationExportModal
        isOpen={isReplicationModalOpen}
        onClose={() => setIsReplicationModalOpen(false)}
        model={model}
        branding={branding}
        onUpdateBranding={setBranding}
      />

      {/* Experimental Validation Modal */}
      <ExperimentalDataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        model={model}
        onOpenEDXEditor={() => setIsEDXModalOpen(true)}
      />

      {/* Live EDX Data Customizer Modal */}
      <EDXDataCustomizerModal
        isOpen={isEDXModalOpen}
        onClose={() => setIsEDXModalOpen(false)}
        currentEDX={customEDX}
        onSaveEDX={(newEDX) => setCustomEDX(newEDX)}
      />
    </div>
  );
}
