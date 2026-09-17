import React, { useState } from 'react';
import { ModelData } from '../utils/atomisticGenerator';
import {
  generateGLBFile,
  generateOBJFile,
  generateSTLFile,
  generateInteractiveHTML,
  generateBlenderScript,
  generatePDBFile,
  generateCIFFile,
  generateXYZFile,
  generatePyMOLScript,
  generateChimeraXScript,
  generateMolStarGuide,
} from '../utils/exportGenerators';
import { AuthorBranding, DEFAULT_AUTHOR_BRANDING } from '../types';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Sparkles,
  ExternalLink,
  Layers,
  Zap,
  Globe,
  Share2,
  Atom,
  CheckCircle2,
  Sliders,
  Terminal,
  FileText,
  Info,
  Box,
  Monitor,
  CheckCircle,
  HelpCircle,
  Flame,
  UserCheck,
  Edit3,
  ShieldCheck,
} from 'lucide-react';

interface ReplicationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelData;
  branding?: AuthorBranding;
  onUpdateBranding?: (branding: AuthorBranding) => void;
}

type FileTab =
  | 'glb'
  | 'stl'
  | 'obj'
  | 'html'
  | 'blender'
  | 'pdb'
  | 'cif'
  | 'xyz'
  | 'pymol'
  | 'chimerax'
  | 'molstar';

export const ReplicationExportModal: React.FC<ReplicationExportModalProps> = ({
  isOpen,
  onClose,
  model,
  branding = DEFAULT_AUTHOR_BRANDING,
  onUpdateBranding,
}) => {
  const [activeTab, setActiveTab] = useState<FileTab>('glb');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadingGLB, setDownloadingGLB] = useState<boolean>(false);
  const [downloadingSTL, setDownloadingSTL] = useState<boolean>(false);
  const [downloadAllSuccess, setDownloadAllSuccess] = useState<boolean>(false);
  const [showBrandingEditor, setShowBrandingEditor] = useState<boolean>(false);
  const [brandingForm, setBrandingForm] = useState<AuthorBranding>({ ...branding });

  if (!isOpen) return null;

  const currentBranding = brandingForm;

  // Generate file strings dynamically based on the current exact model state and branding
  const pdbContent = generatePDBFile(model, currentBranding);
  const cifContent = generateCIFFile(model, currentBranding);
  const xyzContent = generateXYZFile(model, currentBranding);
  const pymolContent = generatePyMOLScript(model, currentBranding);
  const chimeraxContent = generateChimeraXScript(model, currentBranding);
  const molstarGuide = generateMolStarGuide(model);
  const htmlContent = generateInteractiveHTML(model, currentBranding);
  const blenderContent = generateBlenderScript(model, currentBranding);
  const { obj: objContent, mtl: mtlContent } = generateOBJFile(model, currentBranding);

  const handleSaveBranding = () => {
    if (onUpdateBranding) {
      onUpdateBranding(brandingForm);
    }
    setShowBrandingEditor(false);
  };

  const getActiveContent = (): string => {
    switch (activeTab) {
      case 'glb':
        return `# Binary GLTF (.GLB) - 100% Exact 3D Geometry, PBR Materials & Custom Attribution
# ---------------------------------------------------------------------------------
# Research Title: ${currentBranding.projectTitle}
# Lead Author:    ${currentBranding.leadAuthor} (${currentBranding.institution})
# Subtitle:       ${currentBranding.projectSubtitle}
#
# This binary 3D package includes pre-baked:
# - All ${model.atoms.length} Atom Spheres with exact radius & PBR Materials
# - Emerald Green (#00e676) Carbon Basal Lattice
# - Golden Yellow (#facc15) Zinc Cation Centers (Metallic: 0.55)
# - Scarlet Red (#ef4444) Oxygen Anion Centers
# - Glowing Cyan (#06b6d4) 14 Surface Oxygen Vacancies (V_O)
# - Pure White (#ffffff) Edge Functional Hydrogen Atoms
# - All ${model.bonds.length} Lattice Bonds + 16 Highlighted Zn-O-C Covalent Bridges (1.430 Å)
#
# Direct Compatibility:
# - Sketchfab (sketchfab.com/upload) -> Drag & Drop for 100% exact instant 3D render
# - Three.js Editor (threejs.org/editor)
# - Blender (File -> Import -> glTF 2.0)
# - Windows 3D Viewer, macOS QuickLook, Google Scene Viewer (AR)
#
# Click "Download .GLB Model" below to download!`;

      case 'stl':
        return `# Stereolithography (.STL) - Universal 3D Polygon Mesh
# ---------------------------------------------------------
# Research Title: ${currentBranding.projectTitle}
# Lead Author:    ${currentBranding.leadAuthor} (${currentBranding.institution})
# Subtitle:       ${currentBranding.projectSubtitle}
#
# This STL file converts the atomistic spheres and covalent bond cylinders into
# a solid triangulated polygon mesh.
#
# Direct Compatibility:
# - Windows 3D Viewer (native Windows app - double-click to view immediately)
# - Cura, PrusaSlicer, Bambu Studio (3D Printing & physical molecular models)
# - SolidWorks, Autodesk Fusion 360, FreeCAD (Engineering & CAD software)
# - Blender (File -> Import -> Stl)
#
# Click "Download .STL Model" below to generate and save!`;

      case 'obj':
        return objContent;
      case 'html':
        return htmlContent;
      case 'blender':
        return blenderContent;
      case 'pdb':
        return pdbContent;
      case 'cif':
        return cifContent;
      case 'xyz':
        return xyzContent;
      case 'pymol':
        return pymolContent;
      case 'chimerax':
        return chimeraxContent;
      case 'molstar':
        return molstarGuide;
    }
  };

  const getActiveFileName = (): string => {
    switch (activeTab) {
      case 'glb':
        return 'zno_graphene_nanocomposite.glb';
      case 'stl':
        return 'zno_graphene_nanocomposite.stl';
      case 'obj':
        return 'zno_graphene_nanocomposite.obj';
      case 'html':
        return 'zno_gnp_interactive_3d.html';
      case 'blender':
        return 'generate_exact_zno_gnp.py';
      case 'pdb':
        return 'zno_graphene_nanocomposite.pdb';
      case 'cif':
        return 'zno_graphene_nanocomposite.cif';
      case 'xyz':
        return 'zno_graphene_nanocomposite.xyz';
      case 'pymol':
        return 'replicate_exact_pymol.pml';
      case 'chimerax':
        return 'replicate_exact_chimerax.cxc';
      case 'molstar':
        return 'molstar_replication_guide.txt';
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTextFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  };

  const handleDownloadActive = async () => {
    if (activeTab === 'glb') {
      try {
        setDownloadingGLB(true);
        const glbBuffer = await generateGLBFile(model, currentBranding);
        const blob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
        downloadBlob(blob, 'zno_graphene_nanocomposite.glb');
      } catch (err) {
        console.error('Error generating GLB:', err);
      } finally {
        setDownloadingGLB(false);
      }
      return;
    }

    if (activeTab === 'stl') {
      try {
        setDownloadingSTL(true);
        const stlData = await generateSTLFile(model, currentBranding);
        const blob =
          typeof stlData === 'string'
            ? new Blob([stlData], { type: 'model/stl' })
            : new Blob([stlData], { type: 'application/octet-stream' });
        downloadBlob(blob, 'zno_graphene_nanocomposite.stl');
      } catch (err) {
        console.error('Error generating STL:', err);
      } finally {
        setDownloadingSTL(false);
      }
      return;
    }

    if (activeTab === 'obj') {
      downloadTextFile(objContent, 'zno_graphene_nanocomposite.obj', 'text/plain');
      setTimeout(() => downloadTextFile(mtlContent, 'zno_graphene_nanocomposite.mtl', 'text/plain'), 200);
      return;
    }

    if (activeTab === 'html') {
      downloadTextFile(htmlContent, 'zno_gnp_interactive_3d.html', 'text/html');
      return;
    }

    if (activeTab === 'blender') {
      downloadTextFile(blenderContent, 'generate_exact_zno_gnp.py', 'text/x-python');
      return;
    }

    const filename = getActiveFileName();
    const content = getActiveContent();
    const mime =
      activeTab === 'pdb'
        ? 'chemical/x-pdb'
        : activeTab === 'xyz'
        ? 'chemical/x-xyz'
        : 'text/plain';
    downloadTextFile(content, filename, mime);
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingGLB(true);
      // 1. Download GLB
      const glbBuffer = await generateGLBFile(model, currentBranding);
      const glbBlob = new Blob([glbBuffer], { type: 'model/gltf-binary' });
      downloadBlob(glbBlob, 'zno_graphene_nanocomposite.glb');

      // 2. Download STL
      try {
        const stlData = await generateSTLFile(model, currentBranding);
        const stlBlob =
          typeof stlData === 'string'
            ? new Blob([stlData], { type: 'model/stl' })
            : new Blob([stlData], { type: 'application/octet-stream' });
        setTimeout(() => downloadBlob(stlBlob, 'zno_graphene_nanocomposite.stl'), 200);
      } catch (e) {
        console.warn('Could not bundle STL:', e);
      }

      // 3. Download HTML Standalone Player
      setTimeout(() => downloadTextFile(htmlContent, 'zno_gnp_interactive_3d.html', 'text/html'), 400);

      // 4. Download PDB
      setTimeout(() => downloadTextFile(pdbContent, 'zno_graphene_nanocomposite.pdb', 'chemical/x-pdb'), 600);

      // 5. Download CIF
      setTimeout(() => downloadTextFile(cifContent, 'zno_graphene_nanocomposite.cif', 'text/plain'), 800);

      // 6. Download OBJ + MTL
      setTimeout(() => downloadTextFile(objContent, 'zno_graphene_nanocomposite.obj', 'text/plain'), 1000);
      setTimeout(() => downloadTextFile(mtlContent, 'zno_graphene_nanocomposite.mtl', 'text/plain'), 1100);

      // 7. Download Blender & PyMOL Scripts
      setTimeout(() => downloadTextFile(blenderContent, 'generate_exact_zno_gnp.py', 'text/x-python'), 1300);
      setTimeout(() => downloadTextFile(pymolContent, 'replicate_exact_pymol.pml', 'text/plain'), 1500);

      setDownloadAllSuccess(true);
      setTimeout(() => setDownloadAllSuccess(false), 4000);
    } catch (err) {
      console.error('Error batch downloading:', err);
    } finally {
      setDownloadingGLB(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-5xl h-[92vh] max-h-[880px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  3D Model &amp; Molecular Replication Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  100% Visual &amp; Atomic Match
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Exact geometry, pre-baked colors, bond meshes, and metadata for 3D Modeling Sites, Windows 3D Viewer, Mol*, Blender &amp; PyMOL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-all-bundle"
              onClick={handleDownloadAll}
              disabled={downloadingGLB}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
            >
              {downloadAllSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>All 3D Formats Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Full 3D Bundle</span>
                </>
              )}
            </button>

            <button
              id="btn-close-replication-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Author Attribution & White-Label Bar */}
        <div className="bg-slate-950/80 px-5 py-2 border-b border-slate-800 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400 shrink-0">Research Attribution:</span>
            <span className="font-bold text-white truncate">{currentBranding.leadAuthor}</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-cyan-300 font-medium truncate">{currentBranding.institution}</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-amber-400 font-medium truncate">{currentBranding.projectSubtitle}</span>
          </div>

          <button
            onClick={() => setShowBrandingEditor(!showBrandingEditor)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition-all shrink-0"
          >
            <Edit3 className="w-3 h-3 text-cyan-400" />
            <span>{showBrandingEditor ? 'Hide Details' : 'Edit Author Attribution'}</span>
          </button>
        </div>

        {/* Collapsible Branding Customizer */}
        {showBrandingEditor && (
          <div className="bg-slate-900 border-b border-cyan-500/30 p-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Customize Metadata for All Exported 3D Files &amp; Headers:
              </span>
              <button
                onClick={handleSaveBranding}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold"
              >
                Apply to Files
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Lead Author</label>
                <input
                  type="text"
                  value={brandingForm.leadAuthor}
                  onChange={(e) => setBrandingForm({ ...brandingForm, leadAuthor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Team Members</label>
                <input
                  type="text"
                  value={brandingForm.teamMembers}
                  onChange={(e) => setBrandingForm({ ...brandingForm, teamMembers: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Institution / High School</label>
                <input
                  type="text"
                  value={brandingForm.institution}
                  onChange={(e) => setBrandingForm({ ...brandingForm, institution: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Contact Email</label>
                <input
                  type="text"
                  value={brandingForm.contactEmail}
                  onChange={(e) => setBrandingForm({ ...brandingForm, contactEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Project Title</label>
                <input
                  type="text"
                  value={brandingForm.projectTitle}
                  onChange={(e) => setBrandingForm({ ...brandingForm, projectTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Competition / Subtitle</label>
                <input
                  type="text"
                  value={brandingForm.projectSubtitle}
                  onChange={(e) => setBrandingForm({ ...brandingForm, projectSubtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Format Navigation */}
          <div className="w-full md:w-80 bg-slate-950/70 p-3.5 border-r border-slate-800 flex flex-col gap-3 overflow-y-auto shrink-0">
            {/* Group 1: 3D Modeling & Mesh Formats (Recommended) */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1">
                <Box className="w-3 h-3" />
                <span>3D Web &amp; Modeling Formats (Exact Look)</span>
              </div>
              <div className="space-y-1">
                <button
                  id="tab-export-glb"
                  onClick={() => setActiveTab('glb')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'glb'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Binary GLTF (.GLB)</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">100% Match</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Sketchfab, Three.js, Blender, 3D Sites</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">.glb</span>
                </button>

                <button
                  id="tab-export-stl"
                  onClick={() => setActiveTab('stl')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'stl'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Stereolithography (.STL)</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 font-bold">CAD/Print</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Windows 3D Viewer, 3D Printing, CAD</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold">.stl</span>
                </button>

                <button
                  id="tab-export-html"
                  onClick={() => setActiveTab('html')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'html'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Interactive 3D HTML</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">Zero-Install</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Double-click to open in any web browser</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">.html</span>
                </button>

                <button
                  id="tab-export-obj"
                  onClick={() => setActiveTab('obj')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'obj'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="font-bold">Wavefront (.OBJ + .MTL)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Maya, 3ds Max, Blender, CAD</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-yellow-400 font-bold">.obj</span>
                </button>

                <button
                  id="tab-export-blender"
                  onClick={() => setActiveTab('blender')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'blender'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="font-bold">Blender 4.x/3.x Script</div>
                      <div className="text-[10px] text-slate-400 font-normal">1-Click Cycles/EEVEE procedural render</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-orange-400 font-bold">.py</span>
                </button>
              </div>
            </div>

            {/* Group 2: Crystallography & Molecular Chemistry */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Atom className="w-3 h-3" />
                <span>Molecular &amp; Protein Viewers</span>
              </div>
              <div className="space-y-1">
                <button
                  id="tab-export-pdb"
                  onClick={() => setActiveTab('pdb')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'pdb'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold">Protein Data Bank (.PDB)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Standard HETATM &amp; CONECT records</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">.pdb</span>
                </button>

                <button
                  id="tab-export-cif"
                  onClick={() => setActiveTab('cif')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'cif'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold">Crystallographic CIF (.cif)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Modern IUCr / mmCIF format</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">.cif</span>
                </button>

                <button
                  id="tab-export-xyz"
                  onClick={() => setActiveTab('xyz')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'xyz'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Atom className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="font-bold">Cartesian XYZ (.xyz)</div>
                      <div className="text-[10px] text-slate-400 font-normal">VESTA, Avogadro, Quantum ESPRESSO</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-yellow-400 font-bold">.xyz</span>
                </button>

                <button
                  id="tab-export-pymol"
                  onClick={() => setActiveTab('pymol')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'pymol'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-bold">PyMOL Script (.pml)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Custom colors, raytracing &amp; camera view</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">.pml</span>
                </button>

                <button
                  id="tab-export-chimerax"
                  onClick={() => setActiveTab('chimerax')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'chimerax'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold">UCSF ChimeraX Script (.cxc)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Automated styles, materials &amp; lighting</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">.cxc</span>
                </button>

                <button
                  id="tab-export-molstar"
                  onClick={() => setActiveTab('molstar')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'molstar'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="font-bold">Mol* Web Viewer Guide</div>
                      <div className="text-[10px] text-slate-400 font-normal">RCSB PDB &amp; PDBe web instructions</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 font-bold">Guide</span>
                </button>
              </div>
            </div>

            {/* Direct Web Viewer Launchpad Links */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Online 3D &amp; Molecular Viewers
              </div>
              <div className="space-y-1.5 text-xs">
                <a
                  href="https://sketchfab.com/upload"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between group transition-all text-slate-300 hover:text-white"
                  title="Upload .GLB for instant 3D rendering with exact colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="font-medium">Sketchfab 3D (Upload .GLB)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </a>

                <a
                  href="https://threejs.org/editor"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between group transition-all text-slate-300 hover:text-white"
                  title="Load .GLB or .OBJ in WebGL Editor"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span className="font-medium">Three.js Web Editor</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </a>

                <a
                  href="https://molstar.org/viewer/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between group transition-all text-slate-300 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-medium">Mol* 3D Viewer</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </a>

                <a
                  href="https://www.rcsb.org/3d-view"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between group transition-all text-slate-300 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="font-medium">RCSB PDB 3D View</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Code & File Content Inspector */}
          <div className="flex-1 flex flex-col bg-slate-900/40 p-3.5 sm:p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {getActiveFileName()}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {activeTab === 'glb'
                    ? 'Binary 3D Model with PBR Materials & Geometry'
                    : activeTab === 'stl'
                    ? 'Solid Triangulated 3D Mesh for Windows 3D Viewer & Printing'
                    : `${getActiveContent().split('\n').length} lines • ${(new Blob([getActiveContent()]).size / 1024).toFixed(1)} KB`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeTab !== 'glb' && activeTab !== 'stl' && (
                  <button
                    id="btn-copy-code"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  id="btn-download-single-file"
                  onClick={handleDownloadActive}
                  disabled={downloadingGLB || downloadingSTL}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {activeTab === 'glb'
                      ? downloadingGLB
                        ? 'Building 3D Mesh...'
                        : 'Download .GLB Model'
                      : activeTab === 'stl'
                      ? downloadingSTL
                        ? 'Generating STL...'
                        : 'Download .STL Model'
                      : activeTab === 'html'
                      ? 'Download Offline .HTML'
                      : 'Download File'}
                  </span>
                </button>
              </div>
            </div>

            {/* Code / Content Box */}
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800/80 p-3 overflow-auto font-mono text-xs text-slate-300 leading-relaxed select-all">
              <pre className="whitespace-pre">{getActiveContent()}</pre>
            </div>

            {/* Instructions Footer */}
            <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">External Execution &amp; Viewing Instructions: </span>
                {activeTab === 'glb' ? (
                  <span>
                    Drag and drop <code className="text-cyan-300 font-mono">zno_graphene_nanocomposite.glb</code> into Sketchfab, Three.js Editor, Blender, or any 3D web platform. All sphere meshes, emerald/yellow/red materials, and bond cylinders are baked directly into the 3D file!
                  </span>
                ) : activeTab === 'stl' ? (
                  <span>
                    Double-click <code className="text-sky-300 font-mono">zno_graphene_nanocomposite.stl</code> to open directly in <strong>Windows 3D Viewer</strong> or import into Cura/Bambu Studio for physical 3D model fabrication.
                  </span>
                ) : activeTab === 'html' ? (
                  <span>
                    Double-click <code className="text-emerald-300 font-mono">zno_gnp_interactive_3d.html</code> on any computer. It runs an offline, full-fidelity 60FPS WebGL digital twin with OrbitControls, measurement caliper, and presentation HUD with your research credentials!
                  </span>
                ) : activeTab === 'blender' ? (
                  <span>
                    In Blender, open the Scripting tab, paste this Python script, and click <strong>Run</strong>. It instantly generates the procedural atoms, Principled BSDF shaders, and studio lighting.
                  </span>
                ) : (
                  <span>
                    Upload the <code className="text-cyan-300 font-mono">.pdb</code> or <code className="text-emerald-300 font-mono">.cif</code> to Mol*, PyMOL, or ChimeraX. Follow the color guide to match the green/yellow/red ISEF research theme.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
