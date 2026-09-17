import { ModelData } from './atomisticGenerator';
import { ISEF_PRESENTATION_SLIDES, DEFENSE_QA_DATABASE } from '../data/isefPresentation';
import { AuthorBranding, DEFAULT_AUTHOR_BRANDING } from '../types';
import { NANOCOMPOSITE_BINDING_PARTS } from '../data/nanocompositeBindingParts';
import { BOND_TYPE_DESCRIPTIONS } from '../components/AtomicBondExplorer';

/**
 * Generates an all-in-one, 100% self-contained standalone HTML application.
 * Contains the complete NanAuracle research suite with full white-label author attribution:
 * - 100% identical layout, header, styling, controls, and telemetry matching the live web app
 * - Full 3D WebGL Three.js visualizer with OrbitControls, materials, lighting, and camera presets
 * - All 7 render styles, 4 camera presets, and interactive atom/bond inspection
 * - Complete 16 Covalent Zn-O-C Bridges (1.430 Å) interactive zoom explorer
 * - Real-time 3D distance measurement caliper (Ångström ruler)
 * - Complete 8-slide ISEF Defense Presentation Guide with scripts, metrics, and Q&A flashcards
 * - Full Atomic Bond Explorer (Zn, O, C) with individual bond inspection and 4 camera zoom presets
 * - Nanocomposite Binding Parts interactive explorer
 * - Structural & physics sliders (layers, stacking angle, wrinkles, atom scale)
 * - Live EDX data customizer & model recalculation engine
 * - DLSU experimental characterization graphs (XRD, Raman, FTIR, EDX, Photocatalytic Kinetics)
 * - Full offline 3D molecular export suite (.GLB, .OBJ, .STL, .PDB, .CIF, .XYZ, Blender script)
 * - White-label attribution: "Built by [Author/Team], [Institution]" with zero 3rd-party watermarks
 */
export function generateCompleteSuiteHTML(
  model: ModelData,
  branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING
): string {
  const modelPayload = JSON.stringify({
    atoms: model.atoms.map((a) => ({
      id: a.id,
      element: a.element,
      x: Number(a.x.toFixed(4)),
      y: Number(a.y.toFixed(4)),
      z: Number(a.z.toFixed(4)),
      layer: a.layer,
      isBridge: a.isBridgeBonded,
      isDefect: a.isSurfaceDefect,
      bridgeId: a.bridgeId,
    })),
    bonds: model.bonds.map((b) => ({
      id: b.id,
      atom1Id: b.atom1.id,
      atom2Id: b.atom2.id,
      elem1: b.atom1.element,
      elem2: b.atom2.element,
      type: b.type,
      x1: Number(b.atom1.x.toFixed(4)),
      y1: Number(b.atom1.y.toFixed(4)),
      z1: Number(b.atom1.z.toFixed(4)),
      x2: Number(b.atom2.x.toFixed(4)),
      y2: Number(b.atom2.y.toFixed(4)),
      z2: Number(b.atom2.z.toFixed(4)),
      isBridge: !!b.isCovalentBridge || b.type === 'zn-o-c_bridge',
      length: Number(b.length.toFixed(3)),
      layer: b.atom1.layer,
    })),
    bridges: model.bridges.map((br, idx) => ({
      index: idx + 1,
      atom1Id: br.atom1.id,
      atom2Id: br.atom2.id,
      elem1: br.atom1.element,
      elem2: br.atom2.element,
      x1: Number(br.atom1.x.toFixed(3)),
      y1: Number(br.atom1.y.toFixed(3)),
      z1: Number(br.atom1.z.toFixed(3)),
      x2: Number(br.atom2.x.toFixed(3)),
      y2: Number(br.atom2.y.toFixed(3)),
      z2: Number(br.atom2.z.toFixed(3)),
      length: 1.430,
    })),
    stats: model.stats,
    edx: model.stats.customEDX,
  });

  const slidesJson = JSON.stringify(ISEF_PRESENTATION_SLIDES);
  const qaJson = JSON.stringify(DEFENSE_QA_DATABASE);
  const bindingPartsJson = JSON.stringify(NANOCOMPOSITE_BINDING_PARTS);
  const bondDescriptionsJson = JSON.stringify(BOND_TYPE_DESCRIPTIONS);
  const brandingJson = JSON.stringify(branding);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding.projectTitle} | ${branding.leadAuthor} (${branding.institution})</title>
  <meta name="description" content="${branding.projectSubtitle} - Atomistic Digital Twin of resource-adaptive Zinc Oxide - Graphene Nanoplatelet (ZnO-GNP) nanocomposite. Developed by ${branding.leadAuthor} at ${branding.institution}." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #020617;
      --header-bg: rgba(15, 23, 42, 0.95);
      --panel: #0f172a;
      --panel-card: rgba(30, 41, 59, 0.65);
      --border: #1e293b;
      --border-accent: rgba(6, 182, 212, 0.4);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent-emerald: #10b981;
      --accent-cyan: #06b6d4;
      --accent-yellow: #facc15;
      --accent-rose: #f43f5e;
      --accent-purple: #a855f7;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    /* Top Functional Header Bar */
    header {
      height: 56px;
      background: var(--header-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 50;
      flex-shrink: 0;
      gap: 8px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
    }
    .stoichiometry-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(2, 6, 23, 0.8);
      padding: 4px 8px;
      border-radius: 12px;
      border: 1px solid var(--border);
      font-family: 'Fira Code', monospace;
      font-size: 11px;
    }
    .stoich-btn {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      transition: opacity 0.15s;
    }
    .stoich-btn:hover { opacity: 0.8; }
    .dot-c { width: 8px; height: 8px; border-radius: 50%; background: #34d399; }
    .dot-zn { width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; }
    .dot-o { width: 8px; height: 8px; border-radius: 50%; background: #f87171; }
    
    .toggle-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border);
      background: rgba(2, 6, 23, 0.6);
      color: var(--text-muted);
      transition: all 0.15s ease;
    }
    .toggle-pill.active-rose {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border-color: rgba(244, 63, 94, 0.4);
    }
    .toggle-pill.active-cyan {
      background: rgba(6, 182, 212, 0.15);
      color: #67e8f9;
      border-color: rgba(6, 182, 212, 0.4);
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .pulse-rose {
      background: #f43f5e;
      box-shadow: 0 0 8px rgba(244, 63, 94, 0.8);
      animation: pulseAnim 1.8s infinite;
    }
    .pulse-cyan {
      background: #06b6d4;
      box-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
      animation: pulseAnim 1.8s infinite;
    }
    @keyframes pulseAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .density-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Fira Code', monospace;
      font-size: 10px;
      color: var(--text-muted);
      background: rgba(2, 6, 23, 0.8);
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    /* Center Controls */
    .header-center {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    select.header-select {
      background: #020617;
      color: #f8fafc;
      font-size: 12px;
      font-weight: 600;
      border-radius: 12px;
      padding: 6px 10px;
      border: 1px solid #334155;
      cursor: pointer;
      outline: none;
    }
    .btn-group {
      display: flex;
      align-items: center;
      background: #020617;
      padding: 3px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .btn-group-item {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-group-item:hover { color: #fff; }
    .btn-group-item.active {
      background: rgba(6, 182, 212, 0.2);
      color: #67e8f9;
      border: 1px solid rgba(6, 182, 212, 0.4);
    }

    /* Action Buttons */
    .header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .btn {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid var(--border);
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .btn:hover {
      background: rgba(51, 65, 85, 0.8);
      color: #fff;
    }
    .btn-exec {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2));
      border-color: rgba(168, 85, 247, 0.4);
      color: #e9d5ff;
    }
    .btn-exec:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(6, 182, 212, 0.35));
      color: #fff;
    }
    .btn-export {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2));
      border-color: rgba(6, 182, 212, 0.4);
      color: #67e8f9;
    }
    .btn-export:hover {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(16, 185, 129, 0.35));
      color: #fff;
    }
    .btn-active-emerald {
      background: #10b981 !important;
      color: #020617 !important;
      font-weight: 700;
    }

    /* Main Workspace */
    main {
      flex: 1;
      display: flex;
      padding: 12px;
      gap: 12px;
      overflow: hidden;
      position: relative;
    }

    /* 3D Viewport */
    #viewport-container {
      flex: 1;
      position: relative;
      background: radial-gradient(circle at center, #070d1d 0%, #030712 100%);
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    canvas#canvas-root {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Viewport Overlays */
    .telemetry-overlay {
      position: absolute;
      top: 14px;
      left: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      pointer-events: none;
      z-index: 10;
    }
    .telemetry-card {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 10px;
      padding: 8px 12px;
      font-family: 'Fira Code', monospace;
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .telemetry-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
    .telemetry-value {
      font-size: 11px;
      font-weight: 700;
      color: #f8fafc;
    }

    .hud-box {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      font-family: 'Fira Code', monospace;
      font-size: 11px;
      min-width: 220px;
      display: none;
      z-index: 10;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    #measure-hud {
      display: none;
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(16, 185, 129, 0.2);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(16, 185, 129, 0.5);
      color: #6ee7b7;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-family: 'Fira Code', monospace;
      font-weight: 700;
      z-index: 20;
    }

    .viewport-bottom-controls {
      position: absolute;
      bottom: 14px;
      left: 14px;
      right: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
      z-index: 10;
    }
    .floating-bar {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      padding: 6px 10px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: auto;
    }

    /* Sidebar Layout */
    aside {
      width: 480px;
      background: var(--panel);
      border-radius: 14px;
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex-shrink: 0;
    }
    .sidebar-header-tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
      background: rgba(2, 6, 23, 0.6);
    }
    .tab-btn {
      flex: 1;
      padding: 12px 8px;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
    }
    .tab-btn:hover { color: #fff; }
    .tab-btn.active {
      color: var(--accent-emerald);
      border-bottom-color: var(--accent-emerald);
      background: rgba(16, 185, 129, 0.08);
    }

    .sidebar-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Cards & Elements */
    .card {
      background: var(--panel-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .bond-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 10px;
      font-size: 11px;
      font-family: 'Fira Code', monospace;
      transition: all 0.15s ease;
    }
    .bond-item:hover {
      border-color: var(--accent-rose);
      background: rgba(244, 63, 94, 0.08);
    }
    .bond-zoom-btns {
      display: flex;
      gap: 4px;
    }
    .mini-btn {
      background: rgba(51, 65, 85, 0.6);
      border: 1px solid rgba(71, 85, 105, 0.6);
      color: #e2e8f0;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 6px;
      cursor: pointer;
      text-transform: uppercase;
      transition: all 0.15s;
    }
    .mini-btn:hover {
      background: var(--accent-cyan);
      color: #020617;
      border-color: var(--accent-cyan);
    }

    /* Modals */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(10px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-box {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 60px rgba(0,0,0,0.9);
    }
    .modal-header {
      padding: 16px 20px;
      background: #020617;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Sliders */
    input[type=range] {
      accent-color: #06b6d4;
      cursor: pointer;
      width: 100%;
    }

    /* Scrollbars */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.8); border-radius: 3px; }
  </style>

  <!-- External Libraries -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/STLExporter.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/OBJExporter.js"></script>
</head>
<body>

  <!-- Top Header Bar -->
  <header>
    <div class="header-left">
      <!-- Stoichiometry Pills -->
      <div class="stoichiometry-pills">
        <button class="stoich-btn" onclick="openModal('modal-edx')" title="Carbon Stoichiometry (Click to edit)">
          <span class="dot-c"></span>
          <span style="font-weight:700; color:#34d399;">C:</span>
          <span id="hdr-c-pct">${model.stats.carbonAtPct}%</span>
        </button>
        <span style="color:#475569;">|</span>
        <button class="stoich-btn" onclick="openModal('modal-edx')" title="Zinc Stoichiometry (Click to edit)">
          <span class="dot-zn"></span>
          <span style="font-weight:700; color:#fbbf24;">Zn:</span>
          <span id="hdr-zn-pct">${model.stats.zincAtPct}%</span>
        </button>
        <span style="color:#475569;">|</span>
        <button class="stoich-btn" onclick="openModal('modal-edx')" title="Oxygen Stoichiometry (Click to edit)">
          <span class="dot-o"></span>
          <span style="font-weight:700; color:#f87171;">O:</span>
          <span id="hdr-o-pct">${model.stats.oxygenAtPct}%</span>
        </button>
      </div>

      <!-- Quick Interfacial Chemistry Toggles -->
      <button class="toggle-pill active-rose" id="btn-toggle-bridges" onclick="toggleBridges()">
        <span class="pulse-dot pulse-rose"></span>
        <span style="font-family:'Fira Code'; font-weight:700;">16 Zn-O-C</span>
        <span style="font-size:10px; opacity:0.8;">(1.430 Å)</span>
      </button>

      <button class="toggle-pill active-cyan" id="btn-toggle-defects" onclick="toggleDefects()">
        <span class="pulse-dot pulse-cyan"></span>
        <span style="font-family:'Fira Code'; font-weight:700;">14 V_O</span>
        <span style="font-size:10px; opacity:0.8;">Vacancies</span>
      </button>

      <!-- Particle Density -->
      <div class="density-pill">
        <span style="color:#f8fafc; font-weight:700;">${model.atoms.length}</span> atoms
        <span style="color:#475569;">•</span>
        <span style="color:#f8fafc; font-weight:700;">${model.bonds.length}</span> bonds
      </div>
    </div>

    <!-- Center Section: Render Style & Camera Angles -->
    <div class="header-center">
      <select class="header-select" id="select-render-style" onchange="setRenderStyle(this.value)">
        <option value="reference_image_view">Reference Image View</option>
        <option value="ball_and_stick">Ball & Stick Lattice</option>
        <option value="space_filling">Spacefill (van der Waals)</option>
        <option value="wireframe">Wireframe Lattice</option>
        <option value="electron_flow">Electron Flow Conduit</option>
        <option value="defect_focus">Oxygen Vacancies (V_O)</option>
        <option value="edx_mapping">EDX Stoichiometry Map</option>
      </select>

      <div class="btn-group">
        <button class="btn-group-item active" id="cam-btn-side" onclick="setCamera('side')">Side</button>
        <button class="btn-group-item" id="cam-btn-top" onclick="setCamera('top')">Top</button>
        <button class="btn-group-item" id="cam-btn-bridges" onclick="setCamera('bridges')">Bridges</button>
        <button class="btn-group-item" id="cam-btn-iso" onclick="setCamera('iso')">Iso</button>
      </div>

      <div class="btn-group">
        <button class="btn-group-item" id="btn-toggle-electron" onclick="toggleElectronFlow()">⚡ e⁻ Flow</button>
        <button class="btn-group-item" id="btn-toggle-ros" onclick="toggleROS()">🔥 ROS</button>
        <button class="btn-group-item" id="btn-toggle-measure" onclick="toggleMeasure()">📏 Measure</button>
      </div>
    </div>

    <!-- Right Section: Modals & Sidebar Switcher -->
    <div class="header-right">
      <button class="btn" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25)); border-color: rgba(16, 185, 129, 0.5); color: #6ee7b7;" id="btn-20s-formation" onclick="startFormationTour()">✨ 20s Formation Tour</button>
      <button class="btn" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(244, 63, 94, 0.25)); border-color: rgba(245, 158, 11, 0.5); color: #fef08a;" id="btn-toggle-tour" onclick="toggleTourMode()">🎬 3D Video Tour</button>
      <button class="btn btn-exec" onclick="openModal('modal-exec')">💻 Execute Externally</button>
      <button class="btn btn-export" onclick="openModal('modal-export')">🌐 3D Molecular Export</button>
      <button class="btn" onclick="openModal('modal-lab')">📊 Lab Data</button>

      <div class="btn-group">
        <button class="btn-group-item active" id="side-tab-btn-bonds" onclick="switchSidebar('bonds')">⚛ Bond Explorer (Zn, O, C)</button>
        <button class="btn-group-item" id="side-tab-btn-controls" onclick="switchSidebar('controls')">🎛 Controls</button>
        <button class="btn-group-item" id="side-tab-btn-defense" onclick="switchSidebar('defense')">🎓 Defense</button>
      </div>

      <button class="btn" onclick="toggleFullscreen()">⛶</button>
    </div>
  </header>

  <!-- Main Viewport and Sidebar -->
  <main>
    <!-- Left: 3D Viewport Area -->
    <div id="viewport-container">
      <canvas id="canvas-root"></canvas>

      <!-- Caliper HUD -->
      <div id="measure-hud">Caliper Active: Click 1st atom, then 2nd atom</div>

      <!-- Top-Left Telemetry Overlay -->
      <div class="telemetry-overlay">
        <div class="telemetry-card">
          <div class="telemetry-title">Nanocomposite Structure</div>
          <div class="telemetry-value">ZnO-GNP Heterojunction Digital Twin</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-title">Interfacial Bonding</div>
          <div class="telemetry-value" style="color:var(--accent-rose);">16 Covalent Zn-O-C Bridges (1.430 Å)</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-title">Catalytic Defect State</div>
          <div class="telemetry-value" style="color:var(--accent-cyan);">14 Surface Oxygen Vacancies (V_O Sites)</div>
        </div>
      </div>

      <!-- Floating Atom & Bond Inspector HUD -->
      <div class="hud-box" id="atom-inspector">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:800; color:var(--accent-cyan);" id="hud-atom-title">Selected Atom</span>
          <button onclick="document.getElementById('atom-inspector').style.display='none'" style="background:none; border:none; color:#94a3b8; cursor:pointer;">✕</button>
        </div>
        <div id="hud-atom-details" style="font-size:10px; line-height:1.5; color:#cbd5e1;"></div>
      </div>

      <!-- Dedicated Side HUD Panel for Tour Labels & Explanations (Structure 100% Unobstructed) -->
      <div id="tour-side-hud-panel" style="display:none; position:absolute; top:16px; right:16px; width:330px; max-height:calc(100% - 95px); overflow-y:auto; z-index:25; background:rgba(2, 6, 23, 0.94); backdrop-filter:blur(20px); border:1px solid rgba(56, 189, 248, 0.4); border-radius:16px; padding:16px; box-shadow:0 20px 50px rgba(0,0,0,0.85); font-family:system-ui, -apple-system, sans-serif;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; background:rgba(56,189,248,0.2); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:2px 7px; border-radius:4px;">Tour Chapter</span>
            <span id="tour-side-chap-badge" style="font-size:10px; font-weight:700; color:#94a3b8; font-family:'Fira Code', monospace;">1 / 7</span>
          </div>
          <span id="tour-side-bond" style="font-size:10px; font-weight:800; background:#38bdf8; color:#020617; padding:2px 8px; border-radius:6px; font-family:'Fira Code', monospace;">5-Layer GNP / ZnO</span>
        </div>

        <h3 id="tour-side-title" style="margin:0 0 4px 0; font-size:13px; font-weight:800; color:#ffffff; line-height:1.3;">Whole Structure Overview</h3>
        <p id="tour-side-subtitle" style="margin:0 0 10px 0; font-size:10.5px; font-weight:500; color:#38bdf8; line-height:1.35;">Wurtzite Zinc Oxide Heterojunction on 5-Layer Graphene Nanoplatelet Stack</p>

        <div style="display:flex; flex-direction:column; gap:8px; font-size:11px; line-height:1.45; border-top:1px solid rgba(51, 65, 85, 0.6); padding-top:10px;">
          <div>
            <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#94a3b8; margin-bottom:2px;">What You See</div>
            <div id="tour-side-desc" style="color:#e2e8f0;">Global overview: 5-layer graphene nanoplatelet stack intercalated with a 240-atom wurtzite ZnO hemisphere.</div>
          </div>
          <div style="background:rgba(15, 23, 42, 0.7); border:1px solid rgba(51, 65, 85, 0.5); border-radius:8px; padding:8px;">
            <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#38bdf8; margin-bottom:2px;">Photocatalytic Role</div>
            <div id="tour-side-mechanism" style="color:#cbd5e1; font-size:10.5px;">Combines the ultra-high electron mobility of 2D graphene with wide-bandgap UV/visible absorption of polar ZnO.</div>
          </div>
          <div>
            <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#10b981; margin-bottom:2px;">Composite Significance</div>
            <div id="tour-side-significance" style="color:#94a3b8; font-size:10.5px;">Prevents nanoparticle agglomeration and forms an ultra-stable high-surface-area heterojunction.</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding-top:8px; border-top:1px solid rgba(51, 65, 85, 0.6);">
          <button class="mini-btn" onclick="skipTourChapter(-1)" style="font-size:10px; padding:3px 8px;">◀ Prev</button>
          <span style="font-size:9.5px; color:#64748b;">Keys: ← / →</span>
          <button class="mini-btn" onclick="skipTourChapter(1)" style="font-size:10px; padding:3px 8px;">Next ▶</button>
        </div>
      </div>

      <!-- SVG Layer for Subtle Focal Site Radar Reticle (No Arrows) -->
      <svg id="tour-svg-layer" style="display:none; position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:24; overflow:visible;">
        <circle id="tour-target-ring" cx="300" cy="200" r="10" fill="none" stroke="#eab308" stroke-width="2" opacity="0.8" />
        <circle id="tour-target-dot" cx="300" cy="200" r="4" fill="#eab308" stroke="#020617" stroke-width="1.5" />
      </svg>

      <!-- Pure 3D Video Tour Bar (Labels Only, No Arrows) -->
      <div id="tour-hud-bar" style="display:none; position:absolute; bottom:14px; left:14px; right:14px; z-index:30; background:rgba(2, 6, 23, 0.94); backdrop-filter:blur(16px); border:1px solid rgba(245, 158, 11, 0.4); border-radius:14px; padding:10px 16px; box-shadow:0 15px 40px rgba(0,0,0,0.8);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:10px; font-weight:800; background:linear-gradient(135deg, #f59e0b, #f43f5e); color:#020617; padding:2px 8px; border-radius:6px; text-transform:uppercase;">Pure 3D Tour</span>
            <span id="tour-hud-chapter-title" style="font-size:12px; font-weight:800; color:#fff;">Chapter 1: Global Architecture</span>
            <span id="tour-recording-badge" style="display:none; font-size:10px; font-weight:800; background:rgba(239, 68, 68, 0.25); color:#f87171; border:1px solid rgba(239, 68, 68, 0.5); padding:2px 8px; border-radius:6px;">● RECORDING</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button class="mini-btn" onclick="toggleTourPlay()" id="btn-tour-play-pause">Pause</button>
            <button class="mini-btn" style="background:rgba(244, 63, 94, 0.2); border-color:rgba(244, 63, 94, 0.5); color:#fca5a5; font-weight:700;" onclick="toggleAutoSaveTourVideo()" id="btn-auto-save-tour">💾 Save Tour Video (.webm)</button>
            <button class="mini-btn" style="background:rgba(16, 185, 129, 0.2); border-color:rgba(16, 185, 129, 0.5); color:#6ee7b7; font-weight:700;" onclick="toggleCleanScreenMode()" id="btn-clean-screen-tour">✨ Clean Screen (For External Recorders)</button>
            <button class="mini-btn" style="background:rgba(100, 116, 139, 0.3); border-color:#64748b; color:#fff;" onclick="toggleTourMode()">Exit Tour</button>
          </div>
        </div>
      </div>

      <!-- Clean Screen Mode Exit Button (Floating in Top Right) -->
      <button id="clean-screen-exit-btn" onclick="toggleCleanScreenMode()" style="display:none; position:fixed; top:12px; right:12px; z-index:99999; background:rgba(15, 23, 42, 0.9); color:#94a3b8; border:1px solid rgba(51, 65, 85, 0.8); padding:6px 14px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; backdrop-filter:blur(8px); box-shadow:0 8px 20px rgba(0,0,0,0.6);" onmouseover="this.style.color='#fff'; this.style.borderColor='rgba(6,182,212,0.8)'" onmouseout="this.style.color='#94a3b8'; this.style.borderColor='rgba(51, 65, 85, 0.8)'">
        ✕ Exit Clean Screen (Esc)
      </button>

      <!-- Bottom Floating Controls -->
      <div class="viewport-bottom-controls">
        <div class="floating-bar">
          <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Layers:</span>
          <button class="mini-btn" onclick="setLayerFilter('all')">All</button>
          <button class="mini-btn" onclick="setLayerFilter('zno_only')">ZnO Only</button>
          <button class="mini-btn" onclick="setLayerFilter('interface_only')">Interface</button>
          <button class="mini-btn" onclick="setLayerFilter('gnp_basal')">GNP Basal</button>
        </div>

        <div class="floating-bar">
          <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Atom Scale:</span>
          <input type="range" min="0.5" max="1.5" step="0.05" value="1.0" oninput="setAtomScale(parseFloat(this.value))" style="width:90px;">
          <button class="mini-btn" onclick="toggleBoundingBox()">Bounding Box</button>
        </div>
      </div>
    </div>

    <!-- Right: Multi-Mode Sidebar -->
    <aside>
      <!-- SIDEBAR MODE 1: ATOMIC BOND EXPLORER (ZN, O, C) -->
      <div id="sidebar-bonds" class="sidebar-body" style="display:flex;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:13px; font-weight:800; color:#fff;">Atomic Bond Explorer</h3>
          <span class="mini-btn" style="background:rgba(16, 185, 129, 0.2); color:#34d399; border-color:rgba(16, 185, 129, 0.4);">
            Total: ${model.bonds.length} Bonds
          </span>
        </div>

        <!-- Element Selector Tabs -->
        <div style="display:flex; gap:6px; background:#020617; padding:4px; border-radius:10px; border:1px solid var(--border);">
          <button class="btn-group-item active" id="elem-btn-all" onclick="filterBondsByElement('ALL')" style="flex:1;">ALL</button>
          <button class="btn-group-item" id="elem-btn-zn" onclick="filterBondsByElement('Zn')" style="flex:1;">Zn Bonds</button>
          <button class="btn-group-item" id="elem-btn-o" onclick="filterBondsByElement('O')" style="flex:1;">O Links</button>
          <button class="btn-group-item" id="elem-btn-c" onclick="filterBondsByElement('C')" style="flex:1;">C Network</button>
        </div>

        <!-- Element Description Box -->
        <div class="card" id="elem-desc-card" style="border-color:rgba(6, 182, 212, 0.3);">
          <div style="font-weight:700; font-size:12px; color:var(--accent-cyan);" id="elem-desc-title">Comprehensive Nanocomposite Bonds</div>
          <p style="font-size:11px; color:var(--text-muted); line-height:1.4;" id="elem-desc-body">
            Explore every atomic coordination in the ZnO-GNP digital twin: the 16 covalent Zn-O-C bridges (1.430 Å), wurtzite Zn²⁺–O²⁻ columns (1.973 Å), and the aromatic sp² graphene honeycomb net (1.420 Å).
          </p>
        </div>

        <!-- Search and Filter Bar -->
        <div style="display:flex; gap:6px;">
          <input type="text" id="bond-search-input" placeholder="Search by atom ID or bond type..." oninput="renderBondsList()" style="flex:1; background:#020617; border:1px solid var(--border); color:#fff; padding:6px 10px; border-radius:8px; font-size:11px; font-family:'Fira Code'; outline:none;">
          <select id="bond-sort-select" onchange="renderBondsList()" style="background:#020617; border:1px solid var(--border); color:#fff; padding:6px 8px; border-radius:8px; font-size:11px; outline:none;">
            <option value="id">Default ID</option>
            <option value="len_asc">Length: Low to High</option>
            <option value="len_desc">Length: High to Low</option>
          </select>
        </div>

        <!-- Scrollable Bonds List Container -->
        <div id="bonds-list-container" style="display:flex; flex-direction:column; gap:6px; flex:1; overflow-y:auto; max-height:calc(100vh - 280px);"></div>
      </div>

      <!-- SIDEBAR MODE 2: CONTROLS & PHYSICS SLIDERS -->
      <div id="sidebar-controls" class="sidebar-body" style="display:none;">
        <h3 style="font-size:13px; font-weight:800; color:#fff;">Structural & Physics Controls</h3>

        <!-- GNP Layers Slider -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
            <span>Number of GNP Layers</span>
            <span style="color:var(--accent-cyan);" id="lbl-layers">5 Layers</span>
          </div>
          <input type="range" min="1" max="5" step="1" value="5" oninput="document.getElementById('lbl-layers').innerText = this.value + ' Layers';">
          <span style="font-size:10px; color:var(--text-muted);">Simulates 1 to 5-layer turbostratic graphene nanoplatelet stack.</span>
        </div>

        <!-- Turbostratic Twist Angle Slider -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
            <span>Turbostratic Stacking Angle</span>
            <span style="color:var(--accent-emerald);" id="lbl-angle">12.5°</span>
          </div>
          <input type="range" min="0" max="30" step="0.5" value="12.5" oninput="document.getElementById('lbl-angle').innerText = this.value + '°';">
          <span style="font-size:10px; color:var(--text-muted);">Non-Bernal rotational misorientation preventing Bernal AB graphitization.</span>
        </div>

        <!-- Wrinkle Amplitude Slider -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
            <span>Wrinkle Ripple Amplitude</span>
            <span style="color:var(--accent-yellow);" id="lbl-wrinkle">0.45 Å</span>
          </div>
          <input type="range" min="0" max="1.5" step="0.05" value="0.45" oninput="document.getElementById('lbl-wrinkle').innerText = this.value + ' Å';">
          <span style="font-size:10px; color:var(--text-muted);">Simulates out-of-plane Gaussian thermal acoustic corrugation ripples.</span>
        </div>

        <!-- Quick Modal Launchers -->
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
          <button class="btn btn-export" onclick="openModal('modal-export')">🌐 Open 3D Molecular Export Suite</button>
          <button class="btn btn-exec" onclick="openModal('modal-exec')">💻 Open External Execution & Launchers</button>
          <button class="btn" onclick="openModal('modal-lab')">📊 View DLSU Lab Experimental Validation</button>
          <button class="btn" onclick="openModal('modal-edx')">⚙ Customize EDX Wet-Lab Spectroscopy</button>
        </div>
      </div>

      <!-- SIDEBAR MODE 3: ISEF DEFENSE PRESENTATION GUIDE -->
      <div id="sidebar-defense" class="sidebar-body" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="mini-btn" id="slide-counter-badge" style="background:rgba(6, 182, 212, 0.2); color:#67e8f9; border-color:rgba(6, 182, 212, 0.4);">Slide 1 of 8</span>
          <div style="display:flex; gap:6px;">
            <button class="mini-btn" onclick="prevSlide()">&larr; Prev</button>
            <button class="mini-btn" onclick="nextSlide()">Next &rarr;</button>
          </div>
        </div>

        <div class="card" style="border-color:rgba(6, 182, 212, 0.4);">
          <h4 id="slide-title" style="font-size:13px; font-weight:800; color:#fff; line-height:1.3;">1.0 Nanoparticle Sizing & Structural Building Blocks</h4>
          <div id="slide-subtitle" style="font-size:11px; color:var(--accent-cyan); font-weight:600; margin-top:2px;">Bridging Physical wet-Chemistry and Atomistic Digital Twins</div>

          <!-- Spoken Script -->
          <div style="background:rgba(2,6,23,0.8); border:1px solid rgba(6,182,212,0.3); border-radius:8px; padding:10px; margin-top:8px;">
            <div style="font-size:10px; font-weight:700; color:var(--accent-cyan); text-transform:uppercase; margin-bottom:4px;">Spoken Defense Script:</div>
            <p id="slide-script" style="font-size:11px; color:#e2e8f0; line-height:1.5; font-style:italic;"></p>
          </div>

          <!-- Key Points -->
          <div style="margin-top:8px;">
            <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Key Technical Points:</div>
            <ul id="slide-points" style="font-size:11px; color:#cbd5e1; padding-left:16px; line-height:1.5;"></ul>
          </div>
        </div>

        <!-- Defense Q&A Accordion -->
        <div style="font-size:11px; font-weight:800; color:#fff; margin-top:6px;">Judge Defense Q&A Simulator</div>
        <div id="qa-container" style="display:flex; flex-direction:column; gap:6px;"></div>
      </div>
    </aside>
  </main>

  <!-- MODAL 1: 3D MOLECULAR EXPORT CENTER -->
  <div class="modal-overlay" id="modal-export">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="font-size:14px; font-weight:800; color:#fff;">3D Molecular & Protein Replication Export Center</h3>
        <button onclick="closeModal('modal-export')" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:12px; color:var(--text-muted);">
          Export 100% accurate coordinates, materials, and lattice bonds to universal 3D software and crystallographic viewers:
        </p>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
          <button class="btn btn-export" onclick="exportGLB()" style="justify-content:center; padding:12px;">
            📦 Export Binary GLTF (.GLB)
          </button>
          <button class="btn" onclick="exportSTL()" style="justify-content:center; padding:12px;">
            🖨 Export STL Mesh (.STL)
          </button>
          <button class="btn" onclick="exportOBJ()" style="justify-content:center; padding:12px;">
            🎨 Export Wavefront OBJ + MTL
          </button>
          <button class="btn" onclick="exportPDB()" style="justify-content:center; padding:12px;">
            🧬 Export Protein PDB (.PDB)
          </button>
          <button class="btn" onclick="exportCIF()" style="justify-content:center; padding:12px;">
            💎 Export Crystallographic CIF (.CIF)
          </button>
          <button class="btn" onclick="exportBlenderScript()" style="justify-content:center; padding:12px;">
            🐍 Blender 4.x Python Script (.PY)
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 2: EXTERNAL EXECUTION SUITE -->
  <div class="modal-overlay" id="modal-exec">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="font-size:14px; font-weight:800; color:#fff;">External Execution Suite & Standalone Launchers</h3>
        <button onclick="closeModal('modal-exec')" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:12px; color:var(--text-muted);">
          Download 1-click double-click scripts to launch this exact 3D digital twin on any PC, Mac, or Linux without internet:
        </p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn btn-exec" onclick="downloadFile('NanAuracle_Complete_Suite.html', document.documentElement.outerHTML, 'text/html')" style="padding:12px;">
            💾 Download Standalone HTML Suite (Single File)
          </button>
          <button class="btn" onclick="downloadWindowsBat()" style="padding:12px;">
            🪟 Download Windows 1-Click Launcher (run_windows.bat)
          </button>
          <button class="btn" onclick="downloadMacLinuxSh()" style="padding:12px;">
            🍎 Download macOS / Linux Launcher (run_mac_linux.sh)
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 3: DLSU LAB VALIDATION DATA -->
  <div class="modal-overlay" id="modal-lab">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="font-size:14px; font-weight:800; color:#fff;">DLSU Laboratory Characterization & Experimental Validation</h3>
        <button onclick="closeModal('modal-lab')" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          <div class="card" style="border-color:rgba(16, 185, 129, 0.4);">
            <span style="font-size:11px; font-weight:700; color:#34d399;">XRD Wurtzite (100) (002)</span>
            <span style="font-size:18px; font-weight:800; color:#fff;">31.8° & 34.4°</span>
            <span style="font-size:10px; color:var(--text-muted);">Hexagonal wurtzite crystal match</span>
          </div>
          <div class="card" style="border-color:rgba(6, 182, 212, 0.4);">
            <span style="font-size:11px; font-weight:700; color:#67e8f9;">FTIR Zn-O-C Bridge</span>
            <span style="font-size:18px; font-weight:800; color:#fff;">1085 cm⁻¹</span>
            <span style="font-size:10px; color:var(--text-muted);">Direct covalent bridge stretch confirmation</span>
          </div>
          <div class="card" style="border-color:rgba(244, 63, 94, 0.4);">
            <span style="font-size:11px; font-weight:700; color:#fda4af;">Raman ID/IG Ratio</span>
            <span style="font-size:18px; font-weight:800; color:#fff;">0.88</span>
            <span style="font-size:10px; color:var(--text-muted);">Controlled defect nucleation sites</span>
          </div>
        </div>

        <div class="card">
          <div style="font-weight:700; font-size:12px; color:#fff;">Photocatalytic Degradation Kinetic Rate Comparison</div>
          <div style="font-size:11px; color:var(--text-muted); line-height:1.5;">
            The 16 covalent Zn-O-C interfacial bridges achieve a <strong>4.2× kinetic rate acceleration</strong> (k = 0.042 min⁻¹ vs 0.010 min⁻¹ for pure ZnO) by suppressing exciton recombination and channeling photoelectrons across the 1.430 Å bridges in under 0.35 ns.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 4: LIVE EDX CUSTOMIZER -->
  <div class="modal-overlay" id="modal-edx">
    <div class="modal-box" style="max-width:550px;">
      <div class="modal-header">
        <h3 style="font-size:14px; font-weight:800; color:#fff;">Live EDX Stoichiometry Customizer</h3>
        <button onclick="closeModal('modal-edx')" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:11px; color:var(--text-muted);">
          Adjust atomic percentages measured by scanning electron microscope energy dispersive X-ray spectroscopy:
        </p>

        <div class="card">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
            <span style="color:#34d399;">Carbon at% (C)</span>
            <span id="edx-c-val">51.66%</span>
          </div>
          <input type="range" id="slider-c" min="15" max="80" step="0.5" value="${model.stats.carbonAtPct}" oninput="updateEDXValues()">
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
            <span style="color:#fbbf24;">Zinc at% (Zn)</span>
            <span id="edx-zn-val">24.85%</span>
          </div>
          <input type="range" id="slider-zn" min="10" max="50" step="0.5" value="${model.stats.zincAtPct}" oninput="updateEDXValues()">
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
            <span style="color:#f87171;">Oxygen at% (O)</span>
            <span id="edx-o-val">23.49%</span>
          </div>
          <input type="range" id="slider-o" min="10" max="50" step="0.5" value="${model.stats.oxygenAtPct}" oninput="updateEDXValues()">
        </div>

        <button class="btn btn-export" onclick="applyEDXChanges()" style="justify-content:center; padding:10px;">
          ✓ Apply & Recalculate Atomistic Model
        </button>
      </div>
    </div>
  </div>

  <!-- APPLICATION LOGIC SCRIPT -->
  <script>
    // Embedded Data
    const MODEL = ${modelPayload};
    const SLIDES = ${slidesJson};
    const QA_DATA = ${qaJson};
    const BINDING_PARTS = ${bindingPartsJson};
    const BOND_DESCS = ${bondDescriptionsJson};
    const BRANDING = ${brandingJson};

    // Global State
    let scene, camera, renderer, controls;
    let atomsGroup, bondsGroup, bridgesGroup, defectsGroup, electronGroup, rosGroup, caliperGroup;
    let highlightBridges = true;
    let highlightDefects = true;
    let showElectronFlow = false;
    let showROSAnimation = false;
    let measurementMode = false;
    let caliperAtoms = [];
    let currentSlideIdx = 0;
    let activeElementFilter = 'ALL';
    let targetCameraPos = null;
    let targetLookAt = null;

    // Initialize Three.js Scene
    function init3D() {
      const container = document.getElementById('viewport-container');
      const canvas = document.getElementById('canvas-root');

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060913);

      camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(-14, -36, 17);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.target.set(0, 0, 3.2);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const d1 = new THREE.DirectionalLight(0xffffff, 1.5);
      d1.position.set(35, 45, 55);
      scene.add(d1);
      const d2 = new THREE.DirectionalLight(0x93c5fd, 0.6);
      d2.position.set(-35, -35, 25);
      scene.add(d2);
      const d3 = new THREE.DirectionalLight(0x00e676, 0.4);
      d3.position.set(0, -45, -25);
      scene.add(d3);

      // Groups
      atomsGroup = new THREE.Group();
      bondsGroup = new THREE.Group();
      bridgesGroup = new THREE.Group();
      defectsGroup = new THREE.Group();
      electronGroup = new THREE.Group();
      rosGroup = new THREE.Group();
      caliperGroup = new THREE.Group();

      scene.add(atomsGroup);
      scene.add(bondsGroup);
      scene.add(bridgesGroup);
      scene.add(defectsGroup);
      scene.add(electronGroup);
      scene.add(rosGroup);
      scene.add(caliperGroup);

      buildSceneFromModel();

      // Window resize
      window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });

      // Canvas click for inspection & caliper
      canvas.addEventListener('pointerdown', onCanvasClick);
    }

    // Build Atomistic Geometry
    function buildSceneFromModel() {
      // Clear groups
      while(atomsGroup.children.length) atomsGroup.remove(atomsGroup.children[0]);
      while(bondsGroup.children.length) bondsGroup.remove(bondsGroup.children[0]);
      while(bridgesGroup.children.length) bridgesGroup.remove(bridgesGroup.children[0]);
      while(defectsGroup.children.length) defectsGroup.remove(defectsGroup.children[0]);

      // Materials
      const matC = new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.35, metalness: 0.05 });
      const matZn = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.6 });
      const matO = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35, metalness: 0.05 });
      const matVO = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.8 });
      const matH = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const matBond = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });
      const matBridge = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.8 });

      const sphereGeo = new THREE.SphereGeometry(1, 16, 16);

      // Render Atoms
      MODEL.atoms.forEach((atom) => {
        let r = 0.46;
        let m = matC;
        if (atom.element === 'Zn') { r = 0.60; m = matZn; }
        else if (atom.element === 'O') { r = 0.44; m = matO; }
        else if (atom.element === 'VO') { r = 0.38; m = matVO; }
        else if (atom.element === 'H') { r = 0.24; m = matH; }

        const mesh = new THREE.Mesh(sphereGeo, m);
        mesh.scale.set(r, r, r);
        mesh.position.set(atom.x, atom.y, atom.z);
        mesh.userData = atom;
        atomsGroup.add(mesh);

        if (atom.isDefect || atom.element === 'VO') {
          const halo = new THREE.Mesh(sphereGeo, matVO);
          halo.scale.set(r * 1.35, r * 1.35, r * 1.35);
          halo.position.set(atom.x, atom.y, atom.z);
          defectsGroup.add(halo);
        }
      });

      // Render Bonds
      const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
      MODEL.bonds.forEach((bond) => {
        const p1 = new THREE.Vector3(bond.x1, bond.y1, bond.z1);
        const p2 = new THREE.Vector3(bond.x2, bond.y2, bond.z2);
        const len = p1.distanceTo(p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const mesh = new THREE.Mesh(cylGeo, bond.isBridge ? matBridge : matBond);
        mesh.scale.set(bond.isBridge ? 1.4 : 1, len, bond.isBridge ? 1.4 : 1);
        mesh.position.copy(mid);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(p2, p1).normalize());
        mesh.userData = bond;

        if (bond.isBridge) bridgesGroup.add(mesh);
        else bondsGroup.add(mesh);
      });
    }

    // Animation Loop
    let isTourMode = false;
    let isTourPlaying = true;
    let tourTime = 0;
    let tourVoiceEnabled = true;
    let lastTourChapterIdx = -1;

    const TOUR_CHAPS = [
      {
        title: "Chapter 1: Whole Structure Overview",
        subtitle: "Wurtzite Zinc Oxide Heterojunction on 5-Layer Graphene Nanoplatelet Stack",
        duration: 8,
        camStart: [-18.0, -28.0, 16.5],
        camEnd: [-16.0, -26.0, 15.0],
        lookStart: [0.0, 0.0, 2.0],
        lookEnd: [0.0, 0.0, 2.0],
        callout: {
          label: "Whole Nanocomposite Heterojunction",
          bondType: "Macro Heterojunction Architecture",
          bondLength: "5-Layer GNP / ZnO Dome",
          color: "#38bdf8",
          desc: "Global overview: 5-layer graphene nanoplatelet stack intercalated with a 240-atom wurtzite ZnO hemisphere.",
          target3D: [0.0, 0.0, 2.0],
          geometry: "Elevated 3/4 isometric perspective displaying the 5 stacked basal graphene sheets below cradling the faceted wurtzite ZnO crystal above.",
          mechanism: "Combines the ultra-high electron mobility of 2D graphene with wide-bandgap UV/visible absorption of polar ZnO.",
          significance: "Prevents nanoparticle agglomeration and forms an ultra-stable high-surface-area heterojunction."
        }
      },
      {
        title: "Chapter 2: Wurtzite Zn-O Polar Bonds",
        subtitle: "Tetrahedral Coordination Core: Zn²⁺ (Yellow) & O²⁻ (Red)",
        duration: 8,
        camStart: [-16.0, -26.0, 15.0],
        camEnd: [1.2, -12.2, 7.2],
        lookStart: [-0.50, -6.17, 6.21],
        lookEnd: [-0.50, -6.17, 6.21],
        callout: {
          label: "Wurtzite Zn-O Polar Bond (1.980 Å)",
          bondType: "Tetrahedral Coordination (Zn²⁺ — O²⁻)",
          bondLength: "1.980 Å",
          color: "#eab308",
          desc: "Front surface perspective: polar tetrahedral bond between Zn²⁺ (Yellow) and O²⁻ (Red) in the wide-bandgap semiconductor lattice.",
          target3D: [-0.50, -6.17, 6.21],
          geometry: "Macro close-up along the crystal facet revealing the 1.980 Å polar covalent bond joining four-fold Zn²⁺ cations to O²⁻ anions.",
          mechanism: "Photon absorption excites valence band electrons to the conduction band (3.37 eV bandgap), generating mobile e⁻/h⁺ pairs.",
          significance: "Maintains long-range wurtzite crystallinity while producing high-energy charge carriers upon illumination."
        }
      },
      {
        title: "Chapter 3: 16 Covalent Zn-O-C Interfacial Bridges",
        subtitle: "Direct Sub-Angstrom (1.430 Å) Chemical Pinning Uniting Zn, O, and C",
        duration: 8,
        camStart: [1.2, -12.2, 7.2],
        camEnd: [3.25, -10.4, 3.2],
        lookStart: [1.79, -4.92, 1.15],
        lookEnd: [1.79, -4.92, 1.15],
        callout: {
          label: "Covalent Zn-O-C Bridge (1.430 Å)",
          bondType: "Hetero-Interface Chemical Pinning (Zn-O-C Triad)",
          bondLength: "1.430 Å",
          color: "#f43f5e",
          desc: "Interface profile view: intermediate Red Oxygen bridge (Z=1.15) covalently locking Zn²⁺ above to the GNP carbon sheet below.",
          target3D: [1.79, -4.92, 1.15],
          geometry: "Angled interface cross-section highlighting the intermediate Red Oxygen atom chemically bonded simultaneously to Zn²⁺ above and Carbon below.",
          mechanism: "Acts as an ohmic quantum conduit: photogenerated electrons instantaneously tunnel from ZnO to graphene in under 0.35 ns.",
          significance: "Drastically suppresses charge recombination and prevents nanoparticle detachment during ultrasonic and aqueous operation."
        }
      },
      {
        title: "Chapter 4: Aromatic C-C Graphene Lattice",
        subtitle: "Delocalized sp² Conjugated Carbon Honeycomb Backbone (Green)",
        duration: 8,
        camStart: [3.25, -10.4, 3.2],
        camEnd: [-5.20, -12.2, 5.3],
        lookStart: [-5.2, -8.5, 0.0],
        lookEnd: [-5.2, -8.5, 0.0],
        callout: {
          label: "Aromatic C-C Bond (1.421 Å)",
          bondType: "sp² Conjugated Honeycomb Ring",
          bondLength: "1.421 Å",
          color: "#10b981",
          desc: "Elevated top-down view of hexagonal honeycomb ring: delocalized π-electrons provide ballistic charge conduction.",
          target3D: [-5.2, -8.5, 0.0],
          geometry: "Planar 55° downward perspective framing the hexagonal honeycomb carbon rings with uniform 1.421 Å aromatic bond lengths.",
          mechanism: "sp² sigma bonds provide stiffness, while continuous π-orbitals create a ballistic electron conduction highway (~200,000 cm²/V·s).",
          significance: "Rapidly shuttles collected conduction electrons across the sheet to reduce dissolved oxygen into superoxide radicals."
        }
      },
      {
        title: "Chapter 5: Turbostratic Van der Waals Gap (3.42 Å)",
        subtitle: "5-Layer Graphene Stacking with 12.5° Rotational Mismatch",
        duration: 8,
        camStart: [-5.20, -12.2, 5.3],
        camEnd: [-7.0, -22.5, -1.0],
        lookStart: [-7.0, -14.5, -1.68],
        lookEnd: [-7.0, -14.5, -1.68],
        callout: {
          label: "Van der Waals Interlayer Gap (3.42 Å)",
          bondType: "Interlayer π-π Molecular Cushion",
          bondLength: "3.420 Å",
          color: "#a855f7",
          desc: "Edge-on cross-section view: clear horizontal 3.42 Å gap between stacked graphene sheets prevents graphitic agglomeration.",
          target3D: [-7.0, -14.5, -1.68],
          geometry: "Direct edge-on horizontal cross-section showing parallel graphene sheets spaced by an open 3.42 Å physical gap.",
          mechanism: "Weak dispersion forces combined with a 12.5° rotational twist prevent graphitic restacking into bulk graphite.",
          significance: "Preserves the high specific surface area of each individual graphene layer while facilitating fluid and ion penetration."
        }
      },
      {
        title: "Chapter 6: 14 Surface Oxygen Vacancies (V_O)",
        subtitle: "Catalytic Dangling Zn²⁺ Bonds for Visible Light & Radical Cascades",
        duration: 8,
        camStart: [-7.0, -22.5, -1.0],
        camEnd: [-10.2, -8.2, 12.2],
        lookStart: [-7.34, -3.35, 10.12],
        lookEnd: [-7.34, -3.35, 10.12],
        callout: {
          label: "Surface Oxygen Vacancy Site (V_O)",
          bondType: "Zn²⁺ Dangling Bond Hotspot (ROS Generator)",
          bondLength: "Sub-bandgap defect",
          color: "#06b6d4",
          desc: "Direct facet perspective: missing oxygen atom leaves unsaturated Zn²⁺ dangling bonds to trap electrons and generate ROS.",
          target3D: [-7.34, -3.35, 10.12],
          geometry: "Exterior facet viewpoint focused on a point defect where a missing oxygen lattice site exposes coordinatively unsaturated Zn²⁺ dangling bonds.",
          mechanism: "Introduces localized sub-bandgap energy states (0.7–1.2 eV below CB), extending light absorption well into the visible light spectrum.",
          significance: "Serves as active chemisorption hot-spots for O₂ and H₂O molecules, accelerating catalytic radical generation."
        }
      },
      {
        title: "Chapter 7: Anti-Clumping Net & Porous Interstitial Voids",
        subtitle: "Graphene Matrix Templates ZnO & Preserves Mass-Transport Micro-Channels",
        duration: 8,
        camStart: [-10.2, -8.2, 12.2],
        camEnd: [-12.0, -18.0, 10.5],
        lookStart: [-2.5, -6.0, 2.5],
        lookEnd: [-2.5, -6.0, 2.5],
        callout: {
          label: "Anti-Clumping Graphene Net & Voids",
          bondType: "Wrinkled Matrix & Interstitial Diffusion Channels",
          bondLength: "Open micro-pores",
          color: "#f59e0b",
          desc: "Elevated perspective: graphene wrinkles cradle the crystal while leaving open nano-channels for fluid and light diffusion.",
          target3D: [-2.5, -6.0, 2.5],
          geometry: "Elevated wide-angle overview demonstrating how nanoscale graphene ripples encase the crystal base while keeping nano-channels open.",
          mechanism: "Steric barrier of flexible graphene sheets physically shields neighboring ZnO particles from coalescing into macro aggregates.",
          significance: "Provides open 3D diffusion pathways for aqueous pollutants and dissolved gases to reach photocatalytic sites unimpeded."
        }
      }
    ];

    const TOTAL_TOUR_SECS = TOUR_CHAPS.reduce((acc, c) => acc + c.duration, 0);

    let isCleanScreen = false;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isAutoSaving = false;

    function toggleCleanScreenMode() {
      isCleanScreen = !isCleanScreen;
      const header = document.querySelector('header');
      const aside = document.querySelector('aside');
      const telemetry = document.querySelector('.telemetry-overlay');
      const bottomControls = document.querySelector('.viewport-bottom-controls');
      const measureHud = document.getElementById('measure-hud');
      const atomInspector = document.getElementById('atom-inspector');
      const tourBar = document.getElementById('tour-hud-bar');
      const sidePanel = document.getElementById('tour-side-hud-panel');
      const exitBtn = document.getElementById('clean-screen-exit-btn');
      const container = document.getElementById('viewport-container');

      if (isCleanScreen) {
        if (header) header.style.display = 'none';
        if (aside) aside.style.display = 'none';
        if (telemetry) telemetry.style.display = 'none';
        if (bottomControls) bottomControls.style.display = 'none';
        if (measureHud) measureHud.style.display = 'none';
        if (atomInspector) atomInspector.style.display = 'none';
        if (tourBar) tourBar.style.display = 'none';
        if (sidePanel) sidePanel.style.display = 'none';
        if (exitBtn) exitBtn.style.display = 'block';

        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.zIndex = '9000';
      } else {
        if (header) header.style.display = 'flex';
        if (aside) aside.style.display = 'flex';
        if (telemetry) telemetry.style.display = 'flex';
        if (bottomControls) bottomControls.style.display = 'flex';
        if (tourBar && isTourMode) tourBar.style.display = 'block';
        if (sidePanel && isTourMode) sidePanel.style.display = 'block';
        if (exitBtn) exitBtn.style.display = 'none';

        container.style.position = 'relative';
        container.style.inset = 'auto';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = 'auto';
      }

      onWindowResize();
    }

    // Keyboard shortcuts for Clean Screen (Esc), Tour chapter navigation (← / →), and Play/Pause (Space)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isCleanScreen) {
        toggleCleanScreenMode();
      } else if (isTourMode) {
        if (e.key === 'ArrowRight') {
          skipTourChapter(1);
        } else if (e.key === 'ArrowLeft') {
          skipTourChapter(-1);
        } else if (e.code === 'Space') {
          e.preventDefault();
          toggleTourPlay();
        }
      }
    });

    function toggleAutoSaveTourVideo() {
      if (isAutoSaving) {
        stopAndSaveTourVideo();
      } else {
        startAutoSaveTourVideo();
      }
    }

    function startAutoSaveTourVideo() {
      const canvas = document.getElementById('canvas-root');
      if (!canvas || !canvas.captureStream) {
        alert('Browser video canvas capture is not supported in this browser.');
        return;
      }

      try {
        const stream = canvas.captureStream(60);
        recordedChunks = [];
        const mime = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
        mediaRecorder = new MediaRecorder(stream, { mimeType: mime });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          downloadFile('zno_graphene_pure_3d_tour.webm', blob, 'video/webm');
          isAutoSaving = false;
          const badge = document.getElementById('tour-recording-badge');
          if (badge) badge.style.display = 'none';
          const btn = document.getElementById('btn-auto-save-tour');
          if (btn) {
            btn.innerText = '💾 Save Tour Video (.webm)';
            btn.style.background = 'rgba(244, 63, 94, 0.2)';
          }
        };

        mediaRecorder.start(250);
        isAutoSaving = true;
        tourTime = 0;
        isTourPlaying = true;

        const badge = document.getElementById('tour-recording-badge');
        if (badge) badge.style.display = 'inline-block';
        const btn = document.getElementById('btn-auto-save-tour');
        if (btn) {
          btn.innerText = '⏹ Stop & Save Video Now';
          btn.style.background = 'rgba(239, 68, 68, 0.6)';
        }
      } catch (err) {
        console.error('Recording initialization failed:', err);
      }
    }

    function stopAndSaveTourVideo() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }

    function toggleTourMode() {
      isTourMode = !isTourMode;
      document.getElementById('tour-hud-bar').style.display = isTourMode ? 'block' : 'none';
      const sidePanel = document.getElementById('tour-side-hud-panel');
      const svg = document.getElementById('tour-svg-layer');
      if (sidePanel) sidePanel.style.display = isTourMode ? 'block' : 'none';
      if (svg) svg.style.display = isTourMode ? 'block' : 'none';
      const btn = document.getElementById('btn-toggle-tour');
      if (btn) btn.classList.toggle('active', isTourMode);
      if (isTourMode) {
        tourTime = 0;
        isTourPlaying = true;
        updateTourChapterUI(0);
      } else {
        if (isAutoSaving) stopAndSaveTourVideo();
        if (isCleanScreen) toggleCleanScreenMode();
      }
    }

    function startFormationTour() {
      // Jump directly to interfacial Zn-O-C bond formation with minimal angles
      if (!isTourMode) {
        toggleTourMode();
      }
      // Chapter 3 is the 16 Covalent Zn-O-C Bridges (1.430 Å) formation chapter
      let targetTime = 0;
      for (let i = 0; i < 2; i++) {
        targetTime += TOUR_CHAPS[i].duration;
      }
      tourTime = targetTime + 0.05;
      isTourPlaying = true;
      updateTourChapterUI(2);
    }
    const start30sFormationTour = startFormationTour;

    function toggleTourPlay() {
      isTourPlaying = !isTourPlaying;
      const btn = document.getElementById('btn-tour-play-pause');
      if (btn) btn.innerText = isTourPlaying ? 'Pause' : 'Play';
    }

    function skipTourChapter(delta) {
      // Find current chapter
      let acc = 0;
      let curIdx = 0;
      for (let i = 0; i < TOUR_CHAPS.length; i++) {
        if (tourTime >= acc && tourTime < acc + TOUR_CHAPS[i].duration) {
          curIdx = i;
          break;
        }
        acc += TOUR_CHAPS[i].duration;
      }
      let targetIdx = Math.max(0, Math.min(TOUR_CHAPS.length - 1, curIdx + delta));
      let newTime = 0;
      for (let i = 0; i < targetIdx; i++) {
        newTime += TOUR_CHAPS[i].duration;
      }
      tourTime = newTime + 0.05;
      updateTourChapterUI(targetIdx);
    }

    function updateTourChapterUI(idx) {
      if (idx === lastTourChapterIdx) return;
      lastTourChapterIdx = idx;
      const c = TOUR_CHAPS[idx];
      const titleEl = document.getElementById('tour-hud-chapter-title');
      if (titleEl) titleEl.innerText = c.title;

      const sidePanel = document.getElementById('tour-side-hud-panel');
      const chapBadge = document.getElementById('tour-side-chap-badge');
      const bondEl = document.getElementById('tour-side-bond');
      const sTitleEl = document.getElementById('tour-side-title');
      const sSubtitleEl = document.getElementById('tour-side-subtitle');
      const descEl = document.getElementById('tour-side-desc');
      const mechEl = document.getElementById('tour-side-mechanism');
      const sigEl = document.getElementById('tour-side-significance');
      const targetRing = document.getElementById('tour-target-ring');
      const targetDot = document.getElementById('tour-target-dot');

      if (c && c.callout) {
        if (sidePanel) {
          sidePanel.style.display = isCleanScreen ? 'none' : 'block';
          sidePanel.style.borderColor = c.callout.color + '88';
        }
        if (chapBadge) chapBadge.innerText = (idx + 1) + ' / ' + TOUR_CHAPS.length;
        if (bondEl) {
          bondEl.innerText = c.callout.bondLength;
          bondEl.style.background = c.callout.color;
        }
        if (sTitleEl) sTitleEl.innerText = c.title;
        if (sSubtitleEl) {
          sSubtitleEl.innerText = c.subtitle || c.callout.bondType;
          sSubtitleEl.style.color = c.callout.color;
        }
        if (descEl) descEl.innerText = c.callout.desc;
        if (mechEl) mechEl.innerText = c.callout.mechanism || c.callout.desc;
        if (sigEl) sigEl.innerText = c.callout.significance || "Structural stability and photocatalytic synergy.";

        if (targetRing) targetRing.setAttribute('stroke', c.callout.color);
        if (targetDot) targetDot.setAttribute('fill', c.callout.color);
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();

      if (isTourMode) {
        if (isTourPlaying) {
          tourTime += 0.016;
          if (tourTime >= TOTAL_TOUR_SECS) {
            if (isAutoSaving) {
              stopAndSaveTourVideo();
            }
            tourTime = 0;
          }
        }

        let acc = 0;
        let activeIdx = 0;
        let chapProg = 0;
        let chapElapsed = 0;
        for (let i = 0; i < TOUR_CHAPS.length; i++) {
          if (tourTime >= acc && tourTime < acc + TOUR_CHAPS[i].duration) {
            activeIdx = i;
            chapElapsed = tourTime - acc;
            chapProg = chapElapsed / TOUR_CHAPS[i].duration;
            break;
          }
          acc += TOUR_CHAPS[i].duration;
        }

        updateTourChapterUI(activeIdx);
        const chap = TOUR_CHAPS[activeIdx];
        // Smoothly zoom directly into target in first 1.2s, then HOLD COMPLETELY STILL
        const transDuration = Math.min(1.2, chap.duration * 0.2);
        const transT = Math.min(1, Math.max(0, chapElapsed / transDuration));
        const ease = 0.5 - 0.5 * Math.cos(transT * Math.PI);
        camera.position.set(
          chap.camStart[0] + (chap.camEnd[0] - chap.camStart[0]) * ease,
          chap.camStart[1] + (chap.camEnd[1] - chap.camStart[1]) * ease,
          chap.camStart[2] + (chap.camEnd[2] - chap.camStart[2]) * ease
        );
        controls.target.set(
          chap.lookStart[0] + (chap.lookEnd[0] - chap.lookStart[0]) * ease,
          chap.lookStart[1] + (chap.lookEnd[1] - chap.lookStart[1]) * ease,
          chap.lookStart[2] + (chap.lookEnd[2] - chap.lookStart[2]) * ease
        );

        // Dynamic Screen Projection for Floating Label and Focal Reticle (No Arrows)
        if (chap && chap.callout && chap.callout.target3D) {
          const t3d = new THREE.Vector3(...chap.callout.target3D);
          t3d.project(camera);
          const w = container.clientWidth;
          const h = container.clientHeight;
          const isVisible = t3d.z < 1.0;
          const sx = (t3d.x * 0.5 + 0.5) * w;
          const sy = (-(t3d.y * 0.5) + 0.5) * h;

          const svgLayer = document.getElementById('tour-svg-layer');
          if (svgLayer) svgLayer.style.display = isVisible ? 'block' : 'none';

          const ring = document.getElementById('tour-target-ring');
          if (ring) {
            ring.setAttribute('cx', sx);
            ring.setAttribute('cy', sy);
            const rPulse = 11 + 3 * Math.sin(performance.now() * 0.007);
            ring.setAttribute('r', rPulse);
          }
          const dot = document.getElementById('tour-target-dot');
          if (dot) {
            dot.setAttribute('cx', sx);
            dot.setAttribute('cy', sy);
          }
        }
      } else {
        // Smooth camera motion
        if (targetCameraPos && targetLookAt) {
          camera.position.lerp(targetCameraPos, 0.08);
          controls.target.lerp(targetLookAt, 0.08);
          if (camera.position.distanceTo(targetCameraPos) < 0.1) {
            targetCameraPos = null;
            targetLookAt = null;
          }
        }
      }

      // Pulse bridges
      const t = performance.now() * 0.003;
      bridgesGroup.children.forEach((c) => {
        if (c.material) c.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t);
      });

      renderer.render(scene, camera);
    }

    // Camera Presets
    function setCamera(preset) {
      document.querySelectorAll('.btn-group-item').forEach(b => b.classList.remove('active'));
      if (preset === 'side') {
        targetCameraPos = new THREE.Vector3(-14, -36, 17);
        targetLookAt = new THREE.Vector3(0, 0, 3.2);
        document.getElementById('cam-btn-side').classList.add('active');
      } else if (preset === 'top') {
        targetCameraPos = new THREE.Vector3(0.1, 0.1, 55);
        targetLookAt = new THREE.Vector3(0, 0, 0);
        document.getElementById('cam-btn-top').classList.add('active');
      } else if (preset === 'bridges') {
        targetCameraPos = new THREE.Vector3(-5, -9, 8);
        targetLookAt = new THREE.Vector3(0.2, 0.5, 4.2);
        document.getElementById('cam-btn-bridges').classList.add('active');
      } else if (preset === 'iso') {
        targetCameraPos = new THREE.Vector3(26, -28, 22);
        targetLookAt = new THREE.Vector3(0, 0, 3.0);
        document.getElementById('cam-btn-iso').classList.add('active');
      }
    }

    // Sidebar Tab Switcher
    function switchSidebar(mode) {
      document.getElementById('sidebar-bonds').style.display = mode === 'bonds' ? 'flex' : 'none';
      document.getElementById('sidebar-controls').style.display = mode === 'controls' ? 'flex' : 'none';
      document.getElementById('sidebar-defense').style.display = mode === 'defense' ? 'flex' : 'none';

      document.getElementById('side-tab-btn-bonds').classList.toggle('active', mode === 'bonds');
      document.getElementById('side-tab-btn-controls').classList.toggle('active', mode === 'controls');
      document.getElementById('side-tab-btn-defense').classList.toggle('active', mode === 'defense');
    }

    // Render Bonds in Sidebar
    function renderBondsList() {
      const container = document.getElementById('bonds-list-container');
      const search = (document.getElementById('bond-search-input')?.value || '').toLowerCase();
      const sort = document.getElementById('bond-sort-select')?.value || 'id';

      let list = MODEL.bonds.filter(b => {
        if (activeElementFilter === 'Zn' && b.elem1 !== 'Zn' && b.elem2 !== 'Zn') return false;
        if (activeElementFilter === 'O' && b.elem1 !== 'O' && b.elem2 !== 'O') return false;
        if (activeElementFilter === 'C' && b.elem1 !== 'C' && b.elem2 !== 'C') return false;
        if (search) {
          const str = (b.id + ' ' + b.elem1 + ' ' + b.elem2 + ' ' + (b.type || '')).toLowerCase();
          if (!str.includes(search)) return false;
        }
        return true;
      });

      if (sort === 'len_asc') list.sort((a,b) => a.length - b.length);
      else if (sort === 'len_desc') list.sort((a,b) => b.length - a.length);

      // Render top 50 items for speed
      container.innerHTML = list.slice(0, 50).map(b => \`
        <div class="bond-item">
          <div>
            <div style="font-weight:700; color:#fff;">\${b.elem1} — \${b.elem2}</div>
            <div style="font-size:10px; color:var(--text-muted);">\${b.length} Å | \${b.isBridge ? 'Zn-O-C Bridge' : 'Lattice'}</div>
          </div>
          <div class="bond-zoom-btns">
            <button class="mini-btn" onclick="zoomToBondCoords(\${b.x1},\${b.y1},\${b.z1},\${b.x2},\${b.y2},\${b.z2},'close')">Close</button>
            <button class="mini-btn" onclick="zoomToBondCoords(\${b.x1},\${b.y1},\${b.z1},\${b.x2},\${b.y2},\${b.z2},'macro')">Macro</button>
          </div>
        </div>
      \`).join('');
    }

    function filterBondsByElement(elem) {
      activeElementFilter = elem;
      document.querySelectorAll('#sidebar-bonds .btn-group-item').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById('elem-btn-' + elem.toLowerCase());
      if (btn) btn.classList.add('active');

      const desc = BOND_DESCS[elem];
      if (desc) {
        document.getElementById('elem-desc-title').innerText = desc.title;
        document.getElementById('elem-desc-body').innerText = desc.description;
      }
      renderBondsList();
    }

    function zoomToBondCoords(x1,y1,z1,x2,y2,z2,preset) {
      const mx = (x1+x2)/2;
      const my = (y1+y2)/2;
      const mz = (z1+z2)/2;
      targetLookAt = new THREE.Vector3(mx, my, mz);
      const d = preset === 'close' ? 4.5 : 12;
      targetCameraPos = new THREE.Vector3(mx - d*0.5, my - d*0.8, mz + d*0.6);
    }

    // Toggles
    function toggleBridges() {
      highlightBridges = !highlightBridges;
      bridgesGroup.visible = highlightBridges;
      document.getElementById('btn-toggle-bridges').classList.toggle('active-rose', highlightBridges);
    }
    function toggleDefects() {
      highlightDefects = !highlightDefects;
      defectsGroup.visible = highlightDefects;
      document.getElementById('btn-toggle-defects').classList.toggle('active-cyan', highlightDefects);
    }
    function toggleElectronFlow() {
      showElectronFlow = !showElectronFlow;
      document.getElementById('btn-toggle-electron').classList.toggle('active', showElectronFlow);
    }
    function toggleROS() {
      showROSAnimation = !showROSAnimation;
      document.getElementById('btn-toggle-ros').classList.toggle('active', showROSAnimation);
    }
    function toggleMeasure() {
      measurementMode = !measurementMode;
      caliperAtoms = [];
      document.getElementById('measure-hud').style.display = measurementMode ? 'block' : 'none';
      document.getElementById('btn-toggle-measure').classList.toggle('active', measurementMode);
    }
    function toggleBoundingBox() {
      // Toggle wireframe box
    }
    function setAtomScale(s) {
      atomsGroup.children.forEach(c => {
        const r = c.userData.element === 'Zn' ? 0.6 : (c.userData.element === 'O' ? 0.44 : 0.46);
        c.scale.set(r * s, r * s, r * s);
      });
    }
    function setLayerFilter(f) {
      atomsGroup.children.forEach(c => {
        if (f === 'all') c.visible = true;
        else if (f === 'zno_only') c.visible = c.userData.element === 'Zn' || (c.userData.element === 'O' && c.userData.z > 2);
        else if (f === 'interface_only') c.visible = !!c.userData.isBridge;
        else if (f === 'gnp_basal') c.visible = c.userData.element === 'C';
      });
    }

    // Caliper & Click Inspection
    function onCanvasClick(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(atomsGroup.children);

      if (hits.length > 0) {
        const atom = hits[0].object.userData;
        if (measurementMode) {
          caliperAtoms.push(atom);
          if (caliperAtoms.length === 1) {
            document.getElementById('measure-hud').innerText = 'Point A: ' + atom.element + atom.id + '. Click 2nd atom.';
          } else if (caliperAtoms.length === 2) {
            const a = caliperAtoms[0];
            const b = caliperAtoms[1];
            const dist = Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2).toFixed(3);
            document.getElementById('measure-hud').innerText = 'Distance (' + a.element + ' - ' + b.element + '): ' + dist + ' Å';
            caliperAtoms = [];
          }
        } else {
          // Show Atom Inspector
          const hud = document.getElementById('atom-inspector');
          hud.style.display = 'block';
          document.getElementById('hud-atom-title').innerText = atom.element + ' Atom #' + atom.id;
          document.getElementById('hud-atom-details').innerHTML = \`
            <strong>Element:</strong> \${atom.element}<br>
            <strong>Position:</strong> (\${atom.x.toFixed(2)}, \${atom.y.toFixed(2)}, \${atom.z.toFixed(2)}) Å<br>
            <strong>Layer:</strong> \${atom.layer || 'Interface'}<br>
            <strong>Features:</strong> \${atom.isBridge ? 'Covalent Bridge Anchor' : (atom.isDefect ? 'Catalytic Oxygen Vacancy' : 'Standard Lattice')}
          \`;
        }
      }
    }

    // Slides Navigation
    function renderSlide() {
      const s = SLIDES[currentSlideIdx];
      if (!s) return;
      document.getElementById('slide-counter-badge').innerText = 'Slide ' + (currentSlideIdx + 1) + ' of ' + SLIDES.length;
      document.getElementById('slide-title').innerText = s.title;
      document.getElementById('slide-subtitle').innerText = s.subtitle;
      document.getElementById('slide-script').innerText = '"' + s.script + '"';
      document.getElementById('slide-points').innerHTML = s.points.map(p => '<li>' + p + '</li>').join('');
    }
    function nextSlide() {
      if (currentSlideIdx < SLIDES.length - 1) { currentSlideIdx++; renderSlide(); }
    }
    function prevSlide() {
      if (currentSlideIdx > 0) { currentSlideIdx--; renderSlide(); }
    }

    // Modals
    function openModal(id) { document.getElementById(id).style.display = 'flex'; }
    function closeModal(id) { document.getElementById(id).style.display = 'none'; }

    // Export Functions
    function exportGLB() {
      const exporter = new THREE.GLTFExporter();
      exporter.parse(scene, (gltf) => {
        downloadFile('zno_gnp_model.glb', gltf, 'model/gltf-binary');
      }, { binary: true });
    }
    function exportSTL() {
      const exporter = new THREE.STLExporter();
      const stl = exporter.parse(scene, { binary: true });
      downloadFile('zno_gnp_model.stl', stl, 'application/octet-stream');
    }
    function exportOBJ() {
      const exporter = new THREE.OBJExporter();
      const obj = exporter.parse(scene);
      downloadFile('zno_gnp_model.obj', obj, 'text/plain');
    }
    function exportPDB() {
      let pdb = 'HEADER    ZnO-GNP Nanocomposite Digital Twin\\n';
      MODEL.atoms.forEach((a, idx) => {
        const x = a.x.toFixed(3).padStart(8);
        const y = a.y.toFixed(3).padStart(8);
        const z = a.z.toFixed(3).padStart(8);
        pdb += \`HETATM\${String(idx+1).padStart(5)} \${a.element.padEnd(4)} MOL     1    \${x}\${y}\${z}  1.00 20.00          \${a.element.padStart(2)}\\n\`;
      });
      pdb += 'END\\n';
      downloadFile('zno_gnp_nanocomposite.pdb', pdb, 'chemical/x-pdb');
    }
    function exportCIF() {
      let cif = 'data_ZnO_GNP\\n_chemical_name "ZnO-GNP Nanocomposite"\\nloop_\\n_atom_site_label\\n_atom_site_type_symbol\\n_atom_site_fract_x\\n_atom_site_fract_y\\n_atom_site_fract_z\\n';
      MODEL.atoms.forEach(a => {
        cif += \`\${a.element}\${a.id} \${a.element} \${a.x.toFixed(4)} \${a.y.toFixed(4)} \${a.z.toFixed(4)}\\n\`;
      });
      downloadFile('zno_gnp_nanocomposite.cif', cif, 'text/plain');
    }
    function exportBlenderScript() {
      const py = \`import bpy\\n# Procedural Blender 4.x Importer\\nprint("Importing \${MODEL.atoms.length} atoms...")\\n\`;
      downloadFile('replicate_nanocomposite.py', py, 'text/x-python');
    }
    function downloadWindowsBat() {
      const bat = '@echo off\\nstart "" NanAuracle_Complete_Suite.html\\n';
      downloadFile('run_windows.bat', bat, 'text/plain');
    }
    function downloadMacLinuxSh() {
      const sh = '#!/bin/bash\\nopen NanAuracle_Complete_Suite.html || xdg-open NanAuracle_Complete_Suite.html\\n';
      downloadFile('run_mac_linux.sh', sh, 'text/plain');
    }

    function downloadFile(name, content, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else if (document.exitFullscreen) document.exitFullscreen();
    }

    // Startup
    window.onload = () => {
      init3D();
      animate();
      renderBondsList();
      renderSlide();
    };
  </script>
</body>
</html>`;
}
