import React, { useState } from 'react';
import {
  X,
  Play,
  Film,
  Video,
  Download,
  Sparkles,
  Layers,
  Zap,
  Flame,
  Atom,
  CheckCircle2,
  Volume2,
  Clock,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { TOUR_CHAPTERS, TourChapter, TOTAL_TOUR_DURATION } from '../data/tourChapters';

interface VideoTourShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTourAtChapter: (chapter: TourChapter) => void;
  onStartRecordingTour: (quality: '4k' | '1080p') => void;
  onOpenFormationExplorer?: () => void;
}

export const VideoTourShowcaseModal: React.FC<VideoTourShowcaseModalProps> = ({
  isOpen,
  onClose,
  onStartTourAtChapter,
  onStartRecordingTour,
  onOpenFormationExplorer,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<TourChapter>(TOUR_CHAPTERS[0]);
  const [recordingQuality, setRecordingQuality] = useState<'4k' | '1080p'>('4k');

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  3D Atomistic Video Tour Showcase
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {formatTime(TOTAL_TOUR_DURATION)} High-Def Tour
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated cinematic flight path showcasing all 1,060 atoms, 16 bridges, and 14 catalytic vacancies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all"
            title="Close Showcase"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Chapter Playlist */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              <span>Tour Chapters ({TOUR_CHAPTERS.length})</span>
              <span className="text-slate-400 font-mono text-[11px]">Duration</span>
            </div>

            <div className="space-y-2">
              {TOUR_CHAPTERS.map((ch, idx) => {
                const isSelected = ch.id === selectedChapter.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapter(ch)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${ch.badgeColor}25`,
                        color: ch.badgeColor,
                        border: `1px solid ${ch.badgeColor}50`,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">{ch.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{ch.subtitle}</div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                        <span className="text-cyan-400 font-semibold">{formatTime(ch.startTime)}</span>
                        <span>•</span>
                        <span>{ch.duration} seconds</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Separate 20-Second Formation & Final Structure Video Card */}
            {onOpenFormationExplorer && (
              <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-950 border border-emerald-500/40 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Separate Explorer
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">20.0s Full Synthesis</span>
                </div>
                <div className="text-xs font-bold text-white">Zn-O-C Formation & Final Structure Video</div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Shows the entire formation and complete final structure (as shown in the app) with bounding cage, 14 defects, and 16 bridges in 20s.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenFormationExplorer();
                  }}
                  className="mt-2.5 w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>Launch 20s Formation Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Active Chapter Detail & Quick Actions */}
          <div className="md:col-span-7 flex flex-col justify-between bg-slate-950/80 rounded-2xl border border-slate-800/80 p-5">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${selectedChapter.badgeColor}25`,
                      color: selectedChapter.badgeColor,
                      border: `1px solid ${selectedChapter.badgeColor}50`,
                    }}
                  >
                    {selectedChapter.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatTime(selectedChapter.startTime)} – {formatTime(selectedChapter.endTime)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-2">{selectedChapter.title}</h3>
                <p className="text-xs text-cyan-400 font-medium mt-0.5">{selectedChapter.subtitle}</p>
              </div>

              {/* Clean Cinematic Flight Path Details */}
              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cinematic 3D Trajectory</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    Pure Video Tour Mode
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fly around the ZnO-Graphene nanocomposite with sub-Angstrom camera precision. Visualizes the continuous wurtzite lattice, C-C honeycomb sheets, and interfacial Zn-O-C bridges with zero on-screen text or narration.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-300 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" /> 1-Click Auto-Save Video
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Clean Screen for External Recording
                  </span>
                </div>
              </div>

              {/* Scientific Key Metrics */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Verified Characterization Metrics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedChapter.metrics.map((m, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90 flex flex-col"
                    >
                      <span className="text-[10px] text-slate-400">{m.label}</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons & Quality Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 mt-4 border-t border-slate-800/80">
              <button
                onClick={() => {
                  onStartTourAtChapter(selectedChapter);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Tour at Chapter {selectedChapter.number}</span>
              </button>

              {/* Resolution Toggle */}
              <div className="flex items-center justify-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-xs">
                <button
                  onClick={() => setRecordingQuality('4k')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    recordingQuality === '4k'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Record in 4K Ultra HD (3840×2160, 60 FPS, 50 Mbps)"
                >
                  <Sparkles className="w-3 h-3 text-current" />
                  <span>4K 60fps</span>
                </button>
                <button
                  onClick={() => setRecordingQuality('1080p')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    recordingQuality === '1080p'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Record in 1080p Full HD (1920×1080, 60 FPS, 18 Mbps)"
                >
                  <span>1080p</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onStartRecordingTour(recordingQuality);
                  onClose();
                }}
                className={`py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                  recordingQuality === '4k'
                    ? 'bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-orange-500/25 hover:from-amber-500/35 hover:to-orange-500/35 text-white border-amber-500/50 shadow-amber-500/10'
                    : 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 hover:from-rose-500/30 hover:to-orange-500/30 text-rose-300 border-rose-500/40 shadow-rose-500/10'
                }`}
                title={`Start the tour and record in ${recordingQuality === '4k' ? '4K Ultra HD (3840×2160)' : '1080p Full HD'} at 60 FPS`}
              >
                <Video className={`w-4 h-4 ${recordingQuality === '4k' ? 'text-amber-400' : 'text-rose-400'}`} />
                <span>Record {recordingQuality.toUpperCase()} Video (60fps)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Real-Time 3D Spline Camera Trajectory • 1-Click Video Save & Clean Screen External Recording Mode</span>
          </div>
          <span className="font-mono text-slate-400">4K Ultra HD &amp; 1080p • 60 FPS Capture</span>
        </div>
      </div>
    </div>
  );
};
