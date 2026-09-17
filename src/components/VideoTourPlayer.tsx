import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  X,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  StopCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Atom,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { TourChapter, TOUR_CHAPTERS, TOTAL_TOUR_DURATION } from '../data/tourChapters';

interface VideoTourPlayerProps {
  isActive: boolean;
  onClose: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  isAutoSaving: boolean;
  onStartAutoSaveVideo: (quality?: '4k' | '1080p') => void;
  onStopAndSaveNow: () => void;
  onCancelAutoSave: () => void;
  videoQuality?: '4k' | '1080p';
  onChangeVideoQuality?: (quality: '4k' | '1080p') => void;
  isCleanScreen: boolean;
  onToggleCleanScreen: () => void;
  activeChapter: TourChapter;
  targetScreenPos?: { x: number; y: number; visible: boolean } | null;
}

export const VideoTourPlayer: React.FC<VideoTourPlayerProps> = ({
  isActive,
  onClose,
  currentTime,
  onSeek,
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  isAutoSaving,
  onStartAutoSaveVideo,
  onStopAndSaveNow,
  onCancelAutoSave,
  videoQuality = '4k',
  onChangeVideoQuality,
  isCleanScreen,
  onToggleCleanScreen,
  activeChapter,
  targetScreenPos,
}) => {
  // Controls visibility state for External Screen Recording (OBS, QuickTime, Game Bar)
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showCallouts, setShowCallouts] = useState(true);
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [justHiddenToast, setJustHiddenToast] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentChapterIndex = TOUR_CHAPTERS.findIndex((c) => c.id === activeChapter.id);

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      onSeek(TOUR_CHAPTERS[currentChapterIndex - 1].startTime);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < TOUR_CHAPTERS.length - 1) {
      onSeek(TOUR_CHAPTERS[currentChapterIndex + 1].startTime);
    }
  };

  // Auto-hide controls after 3.5s of mouse inactivity while playing
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    // Only auto-hide if tour is actively playing
    if (isPlaying) {
      hideTimeoutRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = () => {
      resetHideTimer();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
        resetHideTimer();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setControlsVisible((prev) => {
          const next = !prev;
          if (!next) {
            setJustHiddenToast(true);
            setTimeout(() => setJustHiddenToast(false), 2200);
          }
          return next;
        });
      } else if (e.key === 'Escape') {
        if (!controlsVisible) {
          setControlsVisible(true);
        } else if (isCleanScreen) {
          onToggleCleanScreen();
        } else {
          onClose();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        onSeek(0);
      } else if (e.key === 'ArrowLeft') {
        handlePrevChapter();
      } else if (e.key === 'ArrowRight') {
        handleNextChapter();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    // Initial timer
    resetHideTimer();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isActive, isPlaying, resetHideTimer, onTogglePlay, controlsVisible, isCleanScreen, onToggleCleanScreen, onClose, onSeek, currentChapterIndex]);

  if (!isActive) return null;

  const progressPct = Math.min(100, Math.max(0, (currentTime / TOTAL_TOUR_DURATION) * 100));

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-4 transition-all overflow-hidden"
    >
      {/* Top Bar: Minimal Status Pill & Quick Hide UI Button */}
      <div
        className={`flex items-center justify-between w-full transition-opacity duration-500 pointer-events-auto ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wide">
            3D Nanocomposite Tour
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {formatTime(currentTime)} / {formatTime(TOTAL_TOUR_DURATION)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Side Explanation Panel */}
          <button
            onClick={() => setShowCallouts((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border shadow-lg ${
              showCallouts
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 border-slate-700/80'
            }`}
            title="Toggle side explanation panel & target focus indicator"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{showCallouts ? 'Side Panel: ON' : 'Side Panel: OFF'}</span>
          </button>

          {/* Toggle Clean View (For External Screen Recording) */}
          <button
            onClick={() => {
              setControlsVisible(false);
              setJustHiddenToast(true);
              setTimeout(() => setJustHiddenToast(false), 2200);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Hide all UI controls for clean external screen recording in OBS / Game Bar (Press H to toggle)"
          >
            <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Hide UI (H)</span>
          </button>

          {/* Clean Screen Fullscreen Toggle */}
          <button
            onClick={onToggleCleanScreen}
            className={`p-2 rounded-xl text-xs font-semibold border shadow-lg transition-all ${
              isCleanScreen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
            }`}
            title={isCleanScreen ? 'Exit Clean Full-Viewport Mode' : 'Clean Full-Viewport View'}
          >
            {isCleanScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Exit Tour */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-lg transition-all"
            title="Exit 3D Video Tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Brief feedback toast when UI is hidden for external screen recording */}
      {justHiddenToast && (
        <div className="self-center bg-slate-950/95 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 shadow-2xl text-center pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Pure View Active: Move cursor or press H to reveal controls</span>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        SIDE HUD PANEL: LABELS & MINI EXPLANATIONS ON THE SIDE OF THE VIDEO
        Keeps center 3D canvas completely clear so the entire structure is visible!
        ========================================================================
      */}
      {showCallouts && activeChapter && (
        <div className="absolute top-14 sm:top-16 left-3 sm:left-5 w-[330px] sm:w-[380px] max-h-[calc(100vh-175px)] z-20 flex flex-col pointer-events-auto transition-all duration-300">
          {!isSidePanelCollapsed ? (
            <div
              className="bg-slate-950/92 backdrop-blur-2xl border rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col gap-2.5 animate-in fade-in slide-in-from-left-4 duration-300"
              style={{
                borderColor: `${activeChapter.badgeColor}66`,
                boxShadow: `0 24px 60px rgba(0,0,0,0.85), 0 0 35px ${activeChapter.badgeColor}18`,
              }}
            >
              {/* Vertical Color Accent Strip */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: activeChapter.badgeColor }}
              />

              {/* Header: Chapter Counter + Prev/Next Controls + Collapse */}
              <div className="flex items-center justify-between gap-2 pl-1.5 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                    style={{
                      backgroundColor: `${activeChapter.badgeColor}25`,
                      color: activeChapter.badgeColor,
                      border: `1px solid ${activeChapter.badgeColor}55`,
                    }}
                  >
                    Chapter {activeChapter.number} of {TOUR_CHAPTERS.length}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeChapter.startTime}s–{activeChapter.endTime}s
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Previous Chapter */}
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapterIndex === 0}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-all"
                    title="Previous Chapter (←)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {/* Next Chapter */}
                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === TOUR_CHAPTERS.length - 1}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-all"
                    title="Next Chapter (→)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {/* Minimize Panel */}
                  <button
                    onClick={() => setIsSidePanelCollapsed(true)}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all ml-1"
                    title="Collapse Side Panel to Corner"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="pl-1.5">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  {activeChapter.title}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 font-medium leading-normal">
                  {activeChapter.subtitle}
                </p>
              </div>

              {/* Primary Bond / Feature Badge Pill */}
              <div className="flex items-center justify-between gap-2 pl-1.5 bg-slate-900/80 rounded-xl px-2.5 py-1.5 border border-slate-800">
                <span className="text-[11px] text-slate-200 font-semibold truncate">
                  {activeChapter.callout.bondType}
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 shadow-inner"
                  style={{
                    backgroundColor: `${activeChapter.badgeColor}25`,
                    color: activeChapter.badgeColor,
                    border: `1px solid ${activeChapter.badgeColor}55`,
                  }}
                >
                  {activeChapter.callout.bondLength}
                </span>
              </div>

              {/* Structured Mini Explanations (Scrollable if necessary) */}
              <div className="pl-1.5 space-y-2 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1">
                {/* Visual Geometry */}
                <div className="bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-200 mb-1">
                    <Atom className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Structural Geometry</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {activeChapter.explanation?.whatYouSee || activeChapter.callout.description}
                  </p>
                </div>

                {/* Photocatalytic Role */}
                {activeChapter.explanation?.mechanism && (
                  <div className="bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-200 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Photocatalytic Role</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {activeChapter.explanation.mechanism}
                    </p>
                  </div>
                )}

                {/* Composite Impact */}
                {activeChapter.explanation?.significance && (
                  <div className="bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-200 mb-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Nanocomposite Significance</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {activeChapter.explanation.significance}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Quantitative Metrics Grid */}
              {activeChapter.metrics && activeChapter.metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5 pl-1.5 pt-1 border-t border-slate-800/80">
                  {activeChapter.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 rounded-xl p-1.5 border border-slate-800 flex flex-col"
                    >
                      <span className="text-[9px] text-slate-400 font-medium truncate">
                        {m.label}
                      </span>
                      <span className="text-[10px] font-bold text-white font-mono truncate">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Collapsed State: Sleek Pill */
            <button
              onClick={() => setIsSidePanelCollapsed(false)}
              className="bg-slate-950/90 backdrop-blur-xl border rounded-2xl px-3 py-2 shadow-2xl flex items-center gap-2 text-xs font-semibold text-white hover:bg-slate-900 transition-all pointer-events-auto"
              style={{ borderColor: activeChapter.badgeColor }}
              title="Expand Side Explanation Panel"
            >
              <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
              <span>Ch. {activeChapter.number}: {activeChapter.callout.bondType}</span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                style={{ backgroundColor: `${activeChapter.badgeColor}33`, color: activeChapter.badgeColor }}
              >
                {activeChapter.callout.bondLength}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        PRECISION 3D RETICLE / BEACON (NO FLOATING TEXT CARDS OVER ATOMS)
        Directly marks the targeted 3D bond/atom with a delicate radar pulse,
        leaving the atoms and bonds 100% visible and unoccluded!
        ========================================================================
      */}
      {showCallouts && targetScreenPos && targetScreenPos.visible && activeChapter && (
        <div
          className="absolute pointer-events-none z-15"
          style={{
            left: `${targetScreenPos.x}px`,
            top: `${targetScreenPos.y}px`,
          }}
        >
          <div className="absolute -translate-x-1/2 -translate-y-1/2">
            {/* Gentle radar ripple */}
            <div
              className="w-8 h-8 -ml-4 -mt-4 rounded-full border animate-ping opacity-40 pointer-events-none"
              style={{ borderColor: activeChapter.badgeColor }}
            />
            {/* Delicate high-precision dashed reticle ring */}
            <div
              className="w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border border-dashed opacity-80"
              style={{ borderColor: activeChapter.badgeColor }}
            />
            {/* Center focal micro-dot */}
            <div
              className="w-2 h-2 -ml-1 -mt-1 rounded-full border border-slate-950 shadow-md"
              style={{ backgroundColor: activeChapter.badgeColor }}
            />
          </div>
        </div>
      )}

      {/* Bottom Floating Minimal Control Dock */}
      <div
        className={`transition-opacity duration-500 max-w-2xl mx-auto w-full pointer-events-auto ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Auto-Saving Video Progress Banner */}
        {isAutoSaving && (
          <div className="mb-2 bg-slate-950/95 backdrop-blur-xl border border-rose-500/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Saving 3D Tour Video</span>
                  <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                    REC {videoQuality === '4k' ? '4K 60FPS' : '1080P 60FPS'} • {formatTime(currentTime)} / {formatTime(TOTAL_TOUR_DURATION)} ({Math.round(progressPct)}%)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {videoQuality === '4k'
                    ? 'Ultra HD 4K (3840×2160) at 60 FPS • 50 Mbps broadcast fidelity.'
                    : 'Full HD (1920×1080) at 60 FPS • 18 Mbps.'}{' '}
                  Video automatically downloads when tour finishes.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onStopAndSaveNow}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all shadow-sm"
                title="Stop recording now and save video"
              >
                Save Now
              </button>
              <button
                onClick={onCancelAutoSave}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[11px] transition-all"
                title="Cancel video recording"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Floating Glass Player Pill */}
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2">
          {/* Scrubbable Timeline */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-cyan-400 font-bold w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={TOTAL_TOUR_DURATION}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2 transition-all"
            />

            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatTime(TOTAL_TOUR_DURATION)}
            </span>
          </div>

          {/* Bottom Row Actions */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            {/* Left: Playback Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSeek(0)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="Restart Tour from Beginning (R)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onTogglePlay}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Speed Multiplier */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                {[1, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => onChangeSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      speed === s ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Quality Selector & Direct 1-Click "Save Tour Video" & Clean Screen */}
            <div className="flex items-center gap-2">
              {/* Quality Switcher */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                <button
                  onClick={() => onChangeVideoQuality?.('4k')}
                  disabled={isAutoSaving}
                  className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                    videoQuality === '4k'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="4K Ultra HD (3840×2160) at 60 FPS (50 Mbps)"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>4K 60fps</span>
                </button>
                <button
                  onClick={() => onChangeVideoQuality?.('1080p')}
                  disabled={isAutoSaving}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    videoQuality === '1080p'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="1080p Full HD (1920×1080) at 60 FPS (18 Mbps)"
                >
                  <span>1080p</span>
                </button>
              </div>

              {!isAutoSaving ? (
                <button
                  onClick={() => onStartAutoSaveVideo(videoQuality)}
                  className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                    videoQuality === '4k'
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-rose-500/20'
                      : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 shadow-rose-500/20'
                  }`}
                  title={`1-Click Save: Automatically records the complete 3D tour in ${videoQuality === '4k' ? '4K 60fps Ultra HD' : '1080p 60fps'} and downloads the video file`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save {videoQuality === '4k' ? '4K Tour' : '1080p Tour'}</span>
                </button>
              ) : (
                <button
                  onClick={onStopAndSaveNow}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 animate-pulse"
                  title="Save Video Now"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Stop & Save Video</span>
                </button>
              )}

              <button
                onClick={() => {
                  setControlsVisible(false);
                  setJustHiddenToast(true);
                  setTimeout(() => setJustHiddenToast(false), 2200);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
                title="Hide Controls for Screen Recording (H)"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

