import React, { useState } from 'react';
import { ModelData } from '../utils/atomisticGenerator';
import { generateCompleteSuiteHTML } from '../utils/exportGenerators';
import { AuthorBranding, DEFAULT_AUTHOR_BRANDING } from '../types';
import {
  X,
  Download,
  Terminal,
  ExternalLink,
  Laptop,
  Globe,
  FileCode,
  Copy,
  Check,
  Play,
  Monitor,
  FolderArchive,
  Cloud,
  Layers,
  ChevronRight,
  ShieldCheck,
  Share2,
  Award,
  Edit3,
  UserCheck,
} from 'lucide-react';

interface ExternalExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelData;
  branding?: AuthorBranding;
  onUpdateBranding?: (branding: AuthorBranding) => void;
}

export const ExternalExecutionModal: React.FC<ExternalExecutionModalProps> = ({
  isOpen,
  onClose,
  model,
  branding = DEFAULT_AUTHOR_BRANDING,
  onUpdateBranding,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    'html' | 'branding' | 'desktop' | 'node' | 'python' | 'cloud'
  >('html');
  const [brandingForm, setBrandingForm] = useState<AuthorBranding>({ ...branding });
  const [brandingSavedNotice, setBrandingSavedNotice] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentBranding = brandingForm;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveBranding = () => {
    if (onUpdateBranding) {
      onUpdateBranding(brandingForm);
    }
    setBrandingSavedNotice(true);
    setTimeout(() => setBrandingSavedNotice(false), 2500);
  };

  const handleDownloadCompleteHTML = () => {
    const htmlContent = generateCompleteSuiteHTML(model, currentBranding);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NanAuracle_Complete_Suite.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenHTMLInNewTab = () => {
    try {
      const htmlContent = generateCompleteSuiteHTML(model, currentBranding);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        window.open('/NanAuracle_Complete_Suite.html', '_blank');
      }
    } catch {
      window.open('/NanAuracle_Complete_Suite.html', '_blank');
    }
  };

  const handleDownloadWindowsScript = () => {
    const batContent = `@echo off
TITLE ${currentBranding.projectTitle} - 3D Digital Twin Runner
COLOR 0B
echo ==============================================================================
echo   ${currentBranding.projectTitle}
echo   ${currentBranding.projectSubtitle}
echo   Lead Researcher: ${currentBranding.leadAuthor} | ${currentBranding.institution}
echo ==============================================================================
echo.
set DIR=%~dp0
cd /d "%DIR%"

:: Check for Python
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [Python detected] Starting local WebGL server on port 3000...
    start "" http://localhost:3000
    python -m http.server 3000
    goto end
)

:: Check for Node / npx
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [Node.js detected] Starting web server on port 3000...
    start "" http://localhost:3000
    npx serve -l 3000 .
    goto end
)

:: Fallback direct HTML launch
echo [Opening standalone HTML directly in browser...]
if exist "%DIR%NanAuracle_Complete_Suite.html" (
    start "" "%DIR%NanAuracle_Complete_Suite.html"
) else if exist "%DIR%index.html" (
    start "" "%DIR%index.html"
) else (
    echo [!] Could not locate NanAuracle_Complete_Suite.html
    pause
)

:end
pause >nul
`;
    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run_windows.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMacLinuxScript = () => {
    const shContent = `#!/usr/bin/env bash
# ${currentBranding.projectTitle} Runner for macOS / Linux
# Lead Researcher: ${currentBranding.leadAuthor} (${currentBranding.institution})
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=============================================================================="
echo "  ${currentBranding.projectTitle}"
echo "  ${currentBranding.projectSubtitle}"
echo "  Lead Researcher: ${currentBranding.leadAuthor} | ${currentBranding.institution}"
echo "=============================================================================="

open_browser() {
    local url="$1"
    if which xdg-open > /dev/null; then xdg-open "$url" &
    elif which open > /dev/null; then open "$url" &
    fi
}

if command -v python3 &>/dev/null; then
    echo "[Python 3 detected] Launching on http://localhost:3000..."
    (sleep 1 && open_browser "http://localhost:3000") &
    python3 -m http.server 3000
    exit 0
fi

if command -v npx &>/dev/null; then
    echo "[Node detected] Launching on http://localhost:3000..."
    (sleep 1 && open_browser "http://localhost:3000") &
    npx serve -l 3000 .
    exit 0
fi

if [ -f "$DIR/NanAuracle_Complete_Suite.html" ]; then
    open_browser "$DIR/NanAuracle_Complete_Suite.html"
elif [ -f "$DIR/index.html" ]; then
    open_browser "$DIR/index.html"
fi
`;
    const blob = new Blob([shContent], { type: 'text/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run_mac_linux.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  External Execution &amp; White-Label Deployment Hub
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  100% White-Labeled &bull; Zero Watermarks
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute the entirety of NanAuracle offline, as standalone HTML, locally via CLI, or on your own web server with your exact school &amp; author branding.
              </p>
            </div>
          </div>
          <button
            id="btn-close-external-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attribution Bar */}
        <div className="bg-slate-950/90 px-6 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 overflow-hidden">
            <Award className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-slate-400">Attribution:</span>
            <span className="font-bold text-white truncate">{currentBranding.leadAuthor}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-cyan-300 truncate">{currentBranding.institution}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-amber-400 truncate">{currentBranding.projectSubtitle}</span>
          </div>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all shrink-0 ${
              activeTab === 'branding'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Edit3 className="w-3 h-3 text-cyan-400" />
            <span>Customize Identity</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto text-xs">
          <button
            id="tab-exec-html"
            onClick={() => setActiveTab('html')}
            className={`px-3.5 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'html'
                ? 'text-cyan-300 border-cyan-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>Standalone Single-File HTML</span>
          </button>

          <button
            id="tab-exec-branding"
            onClick={() => setActiveTab('branding')}
            className={`px-3.5 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'branding'
                ? 'text-yellow-300 border-yellow-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span>Author &amp; White-Label Setup</span>
          </button>

          <button
            id="tab-exec-desktop"
            onClick={() => setActiveTab('desktop')}
            className={`px-3.5 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'desktop'
                ? 'text-emerald-300 border-emerald-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>1-Click Desktop Scripts (.bat / .sh)</span>
          </button>

          <button
            id="tab-exec-node"
            onClick={() => setActiveTab('node')}
            className={`px-3.5 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'node'
                ? 'text-yellow-300 border-yellow-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-yellow-400" />
            <span>Local Node.js / Vite</span>
          </button>

          <button
            id="tab-exec-python"
            onClick={() => setActiveTab('python')}
            className={`px-3.5 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'python'
                ? 'text-blue-300 border-blue-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Python One-Liner Server</span>
          </button>

          <button
            id="tab-exec-cloud"
            onClick={() => setActiveTab('cloud')}
            className={`px-3.5 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'text-purple-300 border-purple-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-purple-400" />
            <span>GitHub Pages / Vercel / Netlify</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-sm">
          {/* TAB 1: STANDALONE SINGLE-FILE HTML */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <h3 className="font-bold text-cyan-200 text-sm">
                      Full-Suite Standalone HTML File (<code className="font-mono text-cyan-300">NanAuracle_Complete_Suite.html</code>)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    Recommended for Intel ISEF Booths
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This bundles the <strong>entirety</strong> of NanAuracle into a single, completely white-labeled <code className="text-cyan-300">.html</code> file:
                  the full 3D atomistic Three.js WebGL visualizer (all atoms, 16 covalent bridges, 14 oxygen vacancies, electron flow, ROS generation),
                  the full 8-slide ISEF Defense Presentation Guide, speaking scripts, defense Q&amp;A simulator, live EDX customizer,
                  DLSU experimental characterization graphs, and the complete 3D file export suite (.GLB, .STL, .OBJ, .PDB, .CIF, .XYZ, Blender script).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-dl-complete-html-modal"
                    onClick={handleDownloadCompleteHTML}
                    className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download NanAuracle_Complete_Suite.html</span>
                  </button>

                  <button
                    id="btn-open-html-newtab"
                    onClick={handleOpenHTMLInNewTab}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Test / Launch in New Tab Immediately</span>
                  </button>
                </div>

                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400">Direct static link:</span>
                  <a
                    href="/NanAuracle_Complete_Suite.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-1"
                  >
                    <span>/NanAuracle_Complete_Suite.html</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>How to use the Standalone HTML file:</span>
                </div>
                <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Click <strong>Download NanAuracle_Complete_Suite.html</strong> above to save it onto your laptop or USB drive.</li>
                  <li>Double-click the downloaded file in Windows Explorer, macOS Finder, or Linux.</li>
                  <li>It immediately opens in Google Chrome, Microsoft Edge, Safari, Firefox, or Brave.</li>
                  <li><strong>Zero internet required</strong>; runs at a smooth 60 FPS offline on any standard PC or tablet.</li>
                  <li>Contains zero external platform branding; fully credited to <strong>{currentBranding.leadAuthor}</strong> and <strong>{currentBranding.institution}</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & WHITE-LABEL CONFIGURATION */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">
                      Author Attribution &amp; White-Label Metadata
                    </h3>
                  </div>
                  {brandingSavedNotice && (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Applied to all exports &amp; scripts!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  These details are embedded into the headers of all exported scientific files (.PDB, .CIF, .XYZ, Blender script, PyMOL script, ChimeraX script, STL, and the standalone HTML suite). This guarantees that every file explicitly attributes your research to your team.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Lead Researcher / Author</label>
                    <input
                      type="text"
                      value={brandingForm.leadAuthor}
                      onChange={(e) => setBrandingForm({ ...brandingForm, leadAuthor: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Research Team / Co-Authors</label>
                    <input
                      type="text"
                      value={brandingForm.teamMembers}
                      onChange={(e) => setBrandingForm({ ...brandingForm, teamMembers: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Institution / High School</label>
                    <input
                      type="text"
                      value={brandingForm.institution}
                      onChange={(e) => setBrandingForm({ ...brandingForm, institution: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Contact Email</label>
                    <input
                      type="text"
                      value={brandingForm.contactEmail}
                      onChange={(e) => setBrandingForm({ ...brandingForm, contactEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Project Title</label>
                    <input
                      type="text"
                      value={brandingForm.projectTitle}
                      onChange={(e) => setBrandingForm({ ...brandingForm, projectTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Competition / Category</label>
                    <input
                      type="text"
                      value={brandingForm.projectSubtitle}
                      onChange={(e) => setBrandingForm({ ...brandingForm, projectSubtitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveBranding}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Attribution Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK DESKTOP SCRIPTS */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-200 text-sm flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400" />
                    <span>Native Double-Click Desktop Launchers</span>
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Windows (.bat) &amp; Mac/Linux (.sh)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  These launcher scripts automatically check your computer for Python or Node.js to spin up a local web server on port 3000 and automatically open your default browser. If neither is installed, they seamlessly fall back to opening the standalone HTML file directly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-dl-windows-bat"
                    onClick={handleDownloadWindowsScript}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download run_windows.bat (Windows)</span>
                  </button>

                  <button
                    id="btn-dl-mac-sh"
                    onClick={handleDownloadMacLinuxScript}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download run_mac_linux.sh (macOS/Linux)</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-200">How to use:</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Place <code className="text-emerald-300">run_windows.bat</code> (or <code className="text-emerald-300">run_mac_linux.sh</code>) in the same folder as your <code className="text-cyan-300">NanAuracle_Complete_Suite.html</code> or exported project files, and double-click to run!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: LOCAL NODE.JS & VITE */}
          {activeTab === 'node' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                You can export the entire repository via AI Studio's <strong>Settings &rarr; Export to GitHub / ZIP</strong> and run it locally with standard Node.js:
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">Step 1: Install dependencies &amp; run development server</span>
                    <button
                      onClick={() => handleCopy(`git clone <your-repo-url>\ncd <project-folder>\nnpm install\nnpm run dev`, 1)}
                      className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                    >
                      {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                    <code>{`git clone <your-repo-url>
cd <project-folder>
npm install
npm run dev`}</code>
                  </pre>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">Step 2: Production build &amp; static preview</span>
                    <button
                      onClick={() => handleCopy(`npm run build\nnpm run preview`, 2)}
                      className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                    >
                      {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === 2 ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs text-yellow-300 overflow-x-auto leading-relaxed">
                    <code>{`npm run build
npm run preview`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PYTHON ONE-LINER SERVER */}
          {activeTab === 'python' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                If you have Python installed on your computer, you can run a local HTTP server from your terminal or command prompt with zero configuration:
              </p>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300">Terminal Command (Python 3)</span>
                  <button
                    onClick={() => handleCopy(`python -m http.server 3000`, 3)}
                    className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 3 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{`# Navigate to your folder containing NanAuracle_Complete_Suite.html or dist/
python -m http.server 3000

# Then open your browser at:
# http://localhost:3000`}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: CLOUD & FREE WEB HOSTING */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Deploy NanAuracle to free global hosting so your ISEF judges, mentors, and audience can access the simulation on their phones or laptops anywhere in the world:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>GitHub Pages</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Push repo to GitHub.<br />
                    2. Go to Settings &rarr; Pages.<br />
                    3. Select GitHub Actions (Vite deploy) or publish <code className="text-purple-300">dist/</code>.<br />
                    <code className="text-[10px] text-slate-500">Configured with base: './'</code>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Vercel</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Connect GitHub repo on vercel.com.<br />
                    2. Framework Preset: Vite.<br />
                    3. Click Deploy.<br />
                    Or run <code className="text-cyan-300">npx vercel</code> in terminal.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Netlify Drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Run <code className="text-emerald-300">npm run build</code>.<br />
                    2. Visit <code className="text-emerald-300">app.netlify.com/drop</code>.<br />
                    3. Drag and drop the <code className="text-emerald-300">dist</code> folder for instant live URL!
                  </p>
                </div>
              </div>

              {/* Direct Web Links */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Your Current Live Applet Web URLs</span>
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="truncate text-slate-300 text-[11px]">
                      {window.location.href}
                    </span>
                    <button
                      onClick={() => handleCopy(window.location.href, 4)}
                      className="ml-2 text-slate-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 text-[11px]"
                    >
                      {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === 4 ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for offline presentation, USB distribution, or independent cloud hosting.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
