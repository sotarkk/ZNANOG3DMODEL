import { TOUR_CHAPTERS, TourChapter, TOTAL_TOUR_DURATION } from '../data/tourChapters';

export interface CameraFrame {
  position: [number, number, number];
  lookAt: [number, number, number];
  chapter: TourChapter;
  chapterProgress: number; // 0 to 1
  totalProgress: number;   // 0 to 1
}

// Smoothstep easing
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

// Interpolate shortest angular distance
function lerpAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % (2 * Math.PI);
  if (diff < -Math.PI) diff += 2 * Math.PI;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  return a + diff * t;
}

export function getCameraFrameAtTime(timeInSeconds: number): CameraFrame {
  const clampedTime = Math.max(0, Math.min(TOTAL_TOUR_DURATION, timeInSeconds));
  const totalProgress = clampedTime / TOTAL_TOUR_DURATION;

  // Find active chapter
  let chapter = TOUR_CHAPTERS[0];
  for (let i = 0; i < TOUR_CHAPTERS.length; i++) {
    if (clampedTime >= TOUR_CHAPTERS[i].startTime && clampedTime <= TOUR_CHAPTERS[i].endTime) {
      chapter = TOUR_CHAPTERS[i];
      break;
    }
  }

  // Chapter local progress
  const chapterElapsed = clampedTime - chapter.startTime;
  // Smoothly zoom directly into the specific part over the first 1.2s, then HOLD COMPLETELY STILL
  const transitionDuration = Math.min(1.2, (chapter.duration || 8) * 0.2);
  const transitionT = Math.min(1, Math.max(0, chapterElapsed / transitionDuration));
  const s = smoothstep(0, 1, transitionT);

  const p1 = chapter.camStart.pos;
  const p2 = chapter.camEnd.pos;
  const l1 = chapter.camStart.lookAt;
  const l2 = chapter.camEnd.lookAt;

  // LookAt: Straightforward centering on the targeted bond or defect site
  const lookAt: [number, number, number] = [
    l1[0] + (l2[0] - l1[0]) * s,
    l1[1] + (l2[1] - l1[1]) * s,
    l1[2] + (l2[2] - l1[2]) * s,
  ];

  // Camera Position: Direct linear zoom straight into the part along a single line of sight
  // Zero rotational spinning and zero wandering drift to keep the target atomic feature rock-solid
  const position: [number, number, number] = [
    p1[0] + (p2[0] - p1[0]) * s,
    p1[1] + (p2[1] - p1[1]) * s,
    p1[2] + (p2[2] - p1[2]) * s,
  ];

  return {
    position,
    lookAt,
    chapter,
    chapterProgress: Math.max(0, Math.min(1, chapterElapsed / (chapter.duration || 1))),
    totalProgress,
  };
}
