import React, { useState } from 'react';
import { CustomEDXData } from '../types';
import { DEFAULT_EDX_DATA } from '../utils/atomisticGenerator';
import {
  X,
  Sparkles,
  Save,
  RotateCcw,
  Activity,
  CheckCircle2,
  FileText,
  HelpCircle,
  BarChart3,
  Sliders,
  Download,
  Flame,
  Zap,
} from 'lucide-react';

interface EDXDataCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEDX: CustomEDXData;
  onSaveEDX: (newEDX: CustomEDXData) => void;
}

export const EDXDataCustomizerModal: React.FC<EDXDataCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentEDX,
  onSaveEDX,
}) => {
  const [formData, setFormData] = useState<CustomEDXData>({ ...currentEDX });
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEDX({
      ...formData,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 900);
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_EDX_DATA });
  };

  const handlePresetSelect = (preset: 'dlsu_micro' | 'dlsu_macro' | 'equal_stoichiometry' | 'high_defect') => {
    if (preset === 'dlsu_micro') {
      setFormData((prev) => ({
        ...prev,
        sampleName: 'ZnO-GNP Heterojunction (Micro-Spot Focus)',
        carbonAtPct: 51.66,
        zincAtPct: 24.85,
        oxygenAtPct: 23.49,
        carbonErrorPct: 0.82,
        zincErrorPct: 0.65,
        oxygenErrorPct: 0.74,
      }));
    } else if (preset === 'dlsu_macro') {
      setFormData((prev) => ({
        ...prev,
        sampleName: 'ZnO-GNP Heterojunction (Macro-Field 26.9µm)',
        carbonAtPct: 50.66,
        zincAtPct: 24.54,
        oxygenAtPct: 24.43,
        carbonErrorPct: 1.15,
        zincErrorPct: 0.88,
        oxygenErrorPct: 0.95,
      }));
    } else if (preset === 'equal_stoichiometry') {
      setFormData((prev) => ({
        ...prev,
        sampleName: 'Ideal Stoichiometric 1:1 ZnO on GNP',
        carbonAtPct: 50.0,
        zincAtPct: 25.0,
        oxygenAtPct: 25.0,
        carbonErrorPct: 0.5,
        zincErrorPct: 0.5,
        oxygenErrorPct: 0.5,
      }));
    } else if (preset === 'high_defect') {
      setFormData((prev) => ({
        ...prev,
        sampleName: 'Oxygen-Deficient Heterojunction (pH 11.0)',
        carbonAtPct: 54.2,
        zincAtPct: 26.1,
        oxygenAtPct: 19.7,
        carbonErrorPct: 0.9,
        zincErrorPct: 0.7,
        oxygenErrorPct: 0.8,
      }));
    }
  };

  // Normalization preview
  const sumAtPct = formData.carbonAtPct + formData.zincAtPct + formData.oxygenAtPct + (formData.traceAtPct || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Live EDX Spectroscopy Data Customizer
                </h2>
                <span className="text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Dynamic Twin Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Input your newly updated wet-lab EDX characterization values to live-update the 3D twin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Quick Presets:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePresetSelect('dlsu_micro')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-mono text-[11px]"
            >
              DLSU Micro (13.4µm)
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('dlsu_macro')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-mono text-[11px]"
            >
              DLSU Macro (26.9µm)
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('equal_stoichiometry')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-mono text-[11px]"
            >
              Stoichiometric 50:25:25
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('high_defect')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-mono text-[11px]"
            >
              High Defect ($V_O$)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sample Identification / Code
              </label>
              <input
                type="text"
                value={formData.sampleName}
                onChange={(e) => setFormData({ ...formData, sampleName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-400 font-mono"
                placeholder="e.g., ZnO-GNP 50:50 Heterojunction"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Instrument & Facility Description
              </label>
              <input
                type="text"
                value={formData.sourceDescription}
                onChange={(e) => setFormData({ ...formData, sourceDescription: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                placeholder="e.g., DLSU Central Instrumentation Facility"
              />
            </div>
          </div>

          {/* Primary Atomic Percentages (at%) Grid */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Primary Elemental Stoichiometry (Atomic %)
              </span>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  Math.abs(sumAtPct - 100) < 0.5
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}
              >
                Sum: {sumAtPct.toFixed(2)}% {Math.abs(sumAtPct - 100) >= 0.5 && '(Auto-balanced in Twin)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Carbon Field */}
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400">Carbon (C)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    Green
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.carbonAtPct}
                    onChange={(e) =>
                      setFormData({ ...formData, carbonAtPct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-emerald-500/40 rounded-lg text-sm font-bold text-emerald-300 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <span className="text-xs font-mono text-slate-400">at%</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                  <span>Error: ±</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.carbonErrorPct}
                    onChange={(e) =>
                      setFormData({ ...formData, carbonErrorPct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-14 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-center"
                  />
                  <span>%</span>
                </div>
              </div>

              {/* Zinc Field */}
              <div className="p-3 bg-yellow-950/20 rounded-xl border border-yellow-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-yellow-400">Zinc (Zn)</span>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.2 rounded font-mono">
                    Yellow
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.zincAtPct}
                    onChange={(e) =>
                      setFormData({ ...formData, zincAtPct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-yellow-500/40 rounded-lg text-sm font-bold text-yellow-300 font-mono focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                  <span className="text-xs font-mono text-slate-400">at%</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                  <span>Error: ±</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.zincErrorPct}
                    onChange={(e) =>
                      setFormData({ ...formData, zincErrorPct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-14 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-center"
                  />
                  <span>%</span>
                </div>
              </div>

              {/* Oxygen Field */}
              <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-red-400">Oxygen (O)</span>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-mono">
                    Red
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.oxygenAtPct}
                    onChange={(e) =>
                      setFormData({ ...formData, oxygenAtPct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-red-500/40 rounded-lg text-sm font-bold text-red-300 font-mono focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <span className="text-xs font-mono text-slate-400">at%</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                  <span>Error: ±</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oxygenErrorPct}
                    onChange={(e) =>
                      setFormData({ ...formData, oxygenErrorPct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-14 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-center"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated EDX Characteristic X-ray Peaks Graphic */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Simulated Characteristic Emission Peaks (EDX Spectrum)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">E₀ = {formData.acceleratingVoltageKv} kV</span>
            </div>

            {/* Visual Spectrum Bars */}
            <div className="h-28 bg-slate-900/90 rounded-xl p-3 flex items-end gap-3 border border-slate-800 relative">
              {/* C Kα 0.277 keV */}
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full bg-emerald-500 rounded-t transition-all duration-300 relative group"
                  style={{ height: `${Math.min(100, Math.max(15, (formData.carbonAtPct / 60) * 100))}%` }}
                >
                  <span className="absolute -top-5 inset-x-0 text-center text-[10px] font-mono text-emerald-400 font-bold">
                    {formData.carbonAtPct}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">C Kα (0.28 keV)</span>
              </div>

              {/* O Kα 0.525 keV */}
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full bg-red-500 rounded-t transition-all duration-300 relative"
                  style={{ height: `${Math.min(100, Math.max(15, (formData.oxygenAtPct / 60) * 100))}%` }}
                >
                  <span className="absolute -top-5 inset-x-0 text-center text-[10px] font-mono text-red-400 font-bold">
                    {formData.oxygenAtPct}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">O Kα (0.53 keV)</span>
              </div>

              {/* Zn Lα 1.012 keV */}
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full bg-yellow-400 rounded-t transition-all duration-300 relative"
                  style={{ height: `${Math.min(100, Math.max(15, (formData.zincAtPct / 60) * 85))}%` }}
                >
                  <span className="absolute -top-5 inset-x-0 text-center text-[10px] font-mono text-yellow-400 font-bold">
                    {formData.zincAtPct}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Zn Lα (1.01 keV)</span>
              </div>

              {/* Zn Kα 8.630 keV */}
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full bg-yellow-500/80 rounded-t transition-all duration-300 relative"
                  style={{ height: `${Math.min(100, Math.max(12, (formData.zincAtPct / 60) * 92))}%` }}
                >
                  <span className="absolute -top-5 inset-x-0 text-center text-[10px] font-mono text-yellow-300 font-bold">
                    Zn Kα
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Zn Kα (8.63 keV)</span>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to DLSU Baseline</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-apply-edx-changes"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{showSavedFeedback ? 'Updated Successfully!' : 'Apply to 3D Digital Twin'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
