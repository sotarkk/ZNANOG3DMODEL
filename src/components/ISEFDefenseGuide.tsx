import React, { useState } from 'react';
import { PresentationSlide, CameraPreset, RenderStyle } from '../types';
import { ISEF_PRESENTATION_SLIDES, DEFENSE_QA_DATABASE } from '../data/isefPresentation';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Award,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle,
  Layers,
  Zap,
  Flame,
  ArrowRight,
  Eye,
  ShieldCheck,
} from 'lucide-react';

interface ISEFDefenseGuideProps {
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onApplySlideConfig: (slide: PresentationSlide) => void;
}

export const ISEFDefenseGuide: React.FC<ISEFDefenseGuideProps> = ({
  currentSlideIndex,
  onSelectSlide,
  onApplySlideConfig,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'slides' | 'qa' | 'table45'>('slides');
  const [selectedQAIndex, setSelectedQAIndex] = useState<number | null>(0);

  const currentSlide = ISEF_PRESENTATION_SLIDES[currentSlideIndex];

  const handleNext = () => {
    const nextIdx = (currentSlideIndex + 1) % ISEF_PRESENTATION_SLIDES.length;
    onSelectSlide(nextIdx);
    onApplySlideConfig(ISEF_PRESENTATION_SLIDES[nextIdx]);
  };

  const handlePrev = () => {
    const prevIdx =
      (currentSlideIndex - 1 + ISEF_PRESENTATION_SLIDES.length) % ISEF_PRESENTATION_SLIDES.length;
    onSelectSlide(prevIdx);
    onApplySlideConfig(ISEF_PRESENTATION_SLIDES[prevIdx]);
  };

  const handleSelect = (idx: number) => {
    onSelectSlide(idx);
    onApplySlideConfig(ISEF_PRESENTATION_SLIDES[idx]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-200">
                ISEF 2026 Defense Presentation Suite
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ZnO-GNP Heterojunction
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Atomistic Digital Twin Synchronization</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            id="tab-slides"
            onClick={() => setActiveTab('slides')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'slides'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Defense Slides
          </button>
          <button
            id="tab-table45"
            onClick={() => setActiveTab('table45')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'table45'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Table 4.5 Sync
          </button>
          <button
            id="tab-qa"
            onClick={() => setActiveTab('qa')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'qa'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Judges Q&A
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === 'slides' && (
          <div className="space-y-4">
            {/* Slide Navigation Pill Carousel */}
            <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
              {ISEF_PRESENTATION_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => handleSelect(idx)}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    currentSlideIndex === idx
                      ? 'bg-slate-800 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                      : 'border-transparent hover:bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      0{slide.id}
                    </span>
                    {slide.figureRef && (
                      <span className="text-[9px] bg-slate-900 text-slate-400 px-1 py-0.2 rounded">
                        Fig {slide.id === 1 ? '1' : slide.id === 3 ? '2' : slide.id === 4 ? '3' : '•'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate">
                    {slide.title.split(':')[0]}
                  </div>
                </button>
              ))}
            </div>

            {/* Active Slide Card */}
            <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      SLIDE {currentSlideIndex + 1} OF {ISEF_PRESENTATION_SLIDES.length}
                    </span>
                    {currentSlide.figureRef && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                        {currentSlide.figureRef}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{currentSlide.title}</h3>
                  <p className="text-xs text-emerald-400/90 font-medium">{currentSlide.subtitle}</p>
                </div>

                <button
                  onClick={() => onApplySlideConfig(currentSlide)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                  title="Snap 3D camera to this figure's angle and trigger visual modes"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Align 3D View</span>
                </button>
              </div>

              {/* Spoken Defense Script */}
              <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verbal Research Defense Script (For Presentation to Judges):</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 italic font-serif">
                  "{currentSlide.script}"
                </p>
              </div>

              {/* Research Bullet Points */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">Technical Key Takeaways:</div>
                <ul className="space-y-1">
                  {currentSlide.bulletPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Experimental Validation Table */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Laboratory Characterization Correlation:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {currentSlide.scientificValidation.map((v, i) => (
                    <div key={i} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 truncate">{v.labMetric}</div>
                      <div className="text-xs font-bold text-slate-200">{v.modelValue}</div>
                      <div className="text-[9px] text-emerald-400/90 font-mono mt-0.5">{v.expValue}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                id="btn-prev-slide"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Section</span>
              </button>

              <div className="text-xs text-slate-400 font-mono">
                {currentSlideIndex + 1} / {ISEF_PRESENTATION_SLIDES.length}
              </div>

              <button
                id="btn-next-slide"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Next Section</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table 4.5 Visual Guide Mapping */}
        {activeTab === 'table45' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Table 4.5: Visualizing and Mapping the Synthesized ZnO-GNP Composite</span>
              </h4>
              <p className="text-xs text-slate-400">
                Direct correlation between 3D atomistic features and laboratory experimental data.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Figure 1 Card */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Figure 1
                    </span>
                    <span className="text-xs font-semibold text-slate-200">Angle 1: Side-Profile Interfacial View</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectSlide(0);
                      onApplySlideConfig(ISEF_PRESENTATION_SLIDES[0]);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>View 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">3D Model Feature</span>
                    <span className="text-slate-200">5-layer turbostratic carbon sheet; ±12° rotational stacking faults; epitaxial lattice relaxation.</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-emerald-400 uppercase font-mono block mb-0.5">Lab Correlation</span>
                    <span className="text-slate-200">Matches SEM GNP crumpled topography (88.18 nm edge thickness) and porous ZnO aggregates (146.95 nm).</span>
                  </div>
                </div>
              </div>

              {/* Figure 2 Card */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      Figure 2
                    </span>
                    <span className="text-xs font-semibold text-slate-200">Angle 2: Top-Down Orthographic View</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectSlide(2);
                      onApplySlideConfig(ISEF_PRESENTATION_SLIDES[2]);
                    }}
                    className="text-[11px] text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-1"
                  >
                    <span>View 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">3D Model Feature</span>
                    <span className="text-slate-200">Uniform lateral spatial dispersion of yellow Zinc and red Oxygen atoms across the green Carbon net.</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-yellow-400 uppercase font-mono block mb-0.5">Lab Correlation</span>
                    <span className="text-slate-200">Directly correlates with EDX bulk composite stoichiometry (51.66 at% C, 24.85 at% Zn, 23.49 at% O).</span>
                  </div>
                </div>
              </div>

              {/* Figure 3 Card */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Figure 3
                    </span>
                    <span className="text-xs font-semibold text-slate-200">Angle 3: Close-Up Interfacial View</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectSlide(3);
                      onApplySlideConfig(ISEF_PRESENTATION_SLIDES[3]);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>View 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">3D Model Feature</span>
                    <span className="text-slate-200">16 covalent Zn-O-C bridges at 1.430 Å; 14 active surface Oxygen vacancies (V_O) and Zn dangling bonds.</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-cyan-400 uppercase font-mono block mb-0.5">Lab Correlation</span>
                    <span className="text-slate-200">Reflects simulated 1.430 Å Zn-O-C bridges, 7.9 ns carrier lifetime, and oxygen-vacancy defect ROS sites.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Defense Q&A Master Sheet */}
        {activeTab === 'qa' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>ISEF Grand Award Judges Q&A Defense Matrix</span>
              </h4>
              <p className="text-xs text-slate-400">
                Prepared bulletproof scientific responses grounded in physical wet-chemistry characterization.
              </p>
            </div>

            <div className="space-y-2">
              {DEFENSE_QA_DATABASE.map((qa, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedQAIndex(selectedQAIndex === idx ? null : idx)}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                        Q{idx + 1}
                      </span>
                      <span>{qa.question}</span>
                    </div>
                  </div>

                  {selectedQAIndex === idx && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-lg border-l-2 border-l-emerald-500">
                      <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold mb-1">
                        Defensive Answer Protocol:
                      </div>
                      {qa.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
