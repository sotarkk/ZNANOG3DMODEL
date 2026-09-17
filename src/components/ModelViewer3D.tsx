import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AtomData, BondData, CameraPreset, RenderStyle, LayerFilter, FocusTarget } from '../types';
import { ModelData } from '../utils/atomisticGenerator';
import {
  Camera,
  Maximize2,
  Minimize2,
  Layers,
  Zap,
  Flame,
  RotateCcw,
  Ruler,
  Info,
  CheckCircle2,
  Crosshair,
  Compass,
  Sliders,
  Box,
  Eye,
  Sparkles,
  Film,
  Video,
  Play,
  ZoomIn,
} from 'lucide-react';
import { TOUR_CHAPTERS, TourChapter, TOTAL_TOUR_DURATION } from '../data/tourChapters';
import { getCameraFrameAtTime } from '../utils/tourCameraInterpolation';
import { VideoTourPlayer } from './VideoTourPlayer';

interface ModelViewer3DProps {
  model: ModelData;
  renderMode: RenderStyle;
  cameraPreset: CameraPreset;
  highlightBridges: boolean;
  highlightDefects: boolean;
  showElectronFlow: boolean;
  showROSAnimation: boolean;
  onSelectAtom?: (atom: AtomData | null) => void;
  selectedAtom: AtomData | null;
  selectedBond?: BondData | null;
  onSelectBond?: (bond: BondData | null) => void;
  onZoomToBond?: (bond: BondData, preset?: 'closeup' | 'axial' | 'coordination' | 'macro') => void;
  focusTarget?: FocusTarget | null;
  measurementMode: boolean;
  setMeasurementMode: (active: boolean) => void;
  onMeasureDistance?: (distance: number | null, atomA: AtomData | null, atomB: AtomData | null) => void;
  layerFilter?: LayerFilter;
  atomScale?: number;
  showBoundingBox?: boolean;
  onOpenEDXEditor?: () => void;
  onOpenReplicationModal?: () => void;
  isTourActive?: boolean;
  setIsTourActive?: (active: boolean) => void;
  tourSeekTarget?: number | null;
  onOpenTourShowcase?: () => void;
  isCleanScreen?: boolean;
  onToggleCleanScreen?: () => void;
  tourAutoRecordRequest?: { id: number; quality: '4k' | '1080p' } | null;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  model,
  renderMode,
  cameraPreset,
  highlightBridges,
  highlightDefects,
  showElectronFlow,
  showROSAnimation,
  onSelectAtom,
  selectedAtom,
  selectedBond,
  onSelectBond,
  onZoomToBond,
  focusTarget,
  measurementMode,
  setMeasurementMode,
  onMeasureDistance,
  layerFilter = 'all',
  atomScale = 1.0,
  showBoundingBox = true,
  onOpenEDXEditor,
  onOpenReplicationModal,
  isTourActive: propIsTourActive,
  setIsTourActive: propSetIsTourActive,
  tourSeekTarget,
  onOpenTourShowcase,
  isCleanScreen = false,
  onToggleCleanScreen,
  tourAutoRecordRequest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Group references
  const atomsGroupRef = useRef<THREE.Group | null>(null);
  const bondsGroupRef = useRef<THREE.Group | null>(null);
  const bridgesGroupRef = useRef<THREE.Group | null>(null);
  const defectsGroupRef = useRef<THREE.Group | null>(null);
  const electronFlowGroupRef = useRef<THREE.Group | null>(null);
  const rosParticlesGroupRef = useRef<THREE.Group | null>(null);
  const measurementGroupRef = useRef<THREE.Group | null>(null);
  const boundingBoxGroupRef = useRef<THREE.Group | null>(null);
  const selectedBondGroupRef = useRef<THREE.Group | null>(null);
  const selectionMarkerRef = useRef<THREE.Mesh | null>(null);

  // Measurement State
  const [measurePointA, setMeasurePointA] = useState<AtomData | null>(null);
  const [measurePointB, setMeasurePointB] = useState<AtomData | null>(null);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);

  // Hovered atom and bond for tooltip
  const [hoveredAtom, setHoveredAtom] = useState<AtomData | null>(null);
  const [hoveredBond, setHoveredBond] = useState<BondData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active selected bond 3D screen position for floating badge
  const [selectedBondScreenPos, setSelectedBondScreenPos] = useState<{ x: number; y: number } | null>(null);

  // 3D Video Tour States
  const [internalTourActive, setInternalTourActive] = useState(false);
  const isTourActive = propIsTourActive !== undefined ? propIsTourActive : internalTourActive;
  const setIsTourActive = propSetIsTourActive || setInternalTourActive;

  const [tourTime, setTourTime] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [tourSpeed, setTourSpeed] = useState(1);
  const [isRecordingTour, setIsRecordingTour] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [activeTourChapter, setActiveTourChapter] = useState<TourChapter>(TOUR_CHAPTERS[0]);
  const [calloutScreenPos, setCalloutScreenPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  const lastScreenPosRef = useRef<{ x: number; y: number; visible: boolean } | null>(null);
  const tourCalloutGroupRef = useRef<THREE.Group | null>(null);

  // Tour refs for animation loop synchronization
  const isTourActiveRef = useRef(false);
  const isTourPlayingRef = useRef(false);
  const tourTimeRef = useRef(0);
  const tourSpeedRef = useRef(1);
  const isAutoSavingRef = useRef(false);
  const activeChapterRef = useRef<TourChapter>(TOUR_CHAPTERS[0]);

  // Video recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const updateTourCallout3D = useCallback((chapter: TourChapter) => {
    if (!tourCalloutGroupRef.current) return;
    const group = tourCalloutGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material?.dispose();
      } else if (child instanceof THREE.Sprite) {
        child.material?.map?.dispose();
        child.material?.dispose();
      }
    }

    if (!chapter || !chapter.callout) return;

    const target = new THREE.Vector3(...chapter.callout.target3D);
    const color = new THREE.Color(chapter.badgeColor);

    // 1. Sleek 3D Holographic Target Beacon Ring around the exact atom/bond site
    const ringGeo = new THREE.RingGeometry(0.42, 0.62, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(target);
    ringMesh.name = 'targetRing';
    group.add(ringMesh);

    // 2. High-precision center focal sphere
    const dotGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
    });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.position.copy(target);
    group.add(dotMesh);
  }, []);

  const updateTourCallout3DRef = useRef(updateTourCallout3D);
  updateTourCallout3DRef.current = updateTourCallout3D;

  useEffect(() => {
    isTourActiveRef.current = isTourActive;
    if (isTourActive) {
      updateTourCallout3D(activeChapterRef.current);
    } else {
      if (tourCalloutGroupRef.current) {
        tourCalloutGroupRef.current.clear();
      }
      setCalloutScreenPos(null);
      lastScreenPosRef.current = null;
    }
  }, [isTourActive, updateTourCallout3D]);
  useEffect(() => {
    isTourPlayingRef.current = isTourPlaying;
  }, [isTourPlaying]);
  useEffect(() => {
    tourSpeedRef.current = tourSpeed;
  }, [tourSpeed]);

  const handleSeekTour = useCallback((time: number) => {
    tourTimeRef.current = time;
    setTourTime(time);
    const frame = getCameraFrameAtTime(time);
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(...frame.position);
      controlsRef.current.target.set(...frame.lookAt);
      controlsRef.current.update();
    }
    if (frame.chapter.id !== activeChapterRef.current.id) {
      activeChapterRef.current = frame.chapter;
      setActiveTourChapter(frame.chapter);
      updateTourCallout3DRef.current(frame.chapter);
    }
  }, []);

  const handleSelectTourChapter = useCallback((chapter: TourChapter) => {
    handleSeekTour(chapter.startTime);
    if (!isTourPlayingRef.current) {
      setIsTourPlaying(true);
      isTourPlayingRef.current = true;
    }
  }, [handleSeekTour]);

  const handleTogglePlayTour = useCallback(() => {
    setIsTourPlaying((prev) => {
      const next = !prev;
      isTourPlayingRef.current = next;
      return next;
    });
  }, []);

  // 4K 60fps Ultra HD or 1080p 60fps Full HD Tour Recording Quality
  const [tourRecordingQuality, setTourRecordingQuality] = useState<'4k' | '1080p'>('4k');
  const tourRecordingQualityRef = useRef<'4k' | '1080p'>('4k');

  useEffect(() => {
    tourRecordingQualityRef.current = tourRecordingQuality;
  }, [tourRecordingQuality]);

  // Video recording (4K 60fps Ultra HD or 1080p 60fps)
  const handleStartRecording = useCallback((qualityOverride?: '4k' | '1080p') => {
    if (!canvasRef.current || !containerRef.current) return;
    try {
      const q = qualityOverride || tourRecordingQualityRef.current;
      const is4K = q === '4k';
      const targetW = is4K ? 3840 : 1920;
      const targetH = is4K ? 2160 : 1080;
      const targetBitrate = is4K ? 50000000 : 18000000;

      // Configure Three.js renderer internal drawing buffer for 4K (3840×2160) or 1080p (1920×1080)
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setPixelRatio(1);
        rendererRef.current.setSize(targetW, targetH, false);
        cameraRef.current.aspect = targetW / targetH;
        cameraRef.current.updateProjectionMatrix();
        if (sceneRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }

      recordedChunksRef.current = [];
      const stream = canvasRef.current.captureStream(60);
      const mimeCandidates = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4;codecs=avc1',
        'video/mp4',
      ];
      const mimeType = mimeCandidates.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: targetBitrate,
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (recordedChunksRef.current.length === 0) return;
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const qTag = is4K ? '4K_60fps' : '1080p_60fps';
        a.download = `ZnO_GNP_Nanocomposite_Tour_${qTag}_${new Date().toISOString().slice(0, 10)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        setIsAutoSaving(false);
        isAutoSavingRef.current = false;
        setIsRecordingTour(false);

        // Restore canvas and camera viewport
        if (rendererRef.current && containerRef.current && cameraRef.current) {
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          rendererRef.current.setSize(w, h, true);
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecordingTour(true);
      if (!isTourActive) {
        setIsTourActive(true);
        isTourActiveRef.current = true;
      }
      if (!isTourPlaying) {
        setIsTourPlaying(true);
        isTourPlayingRef.current = true;
      }
    } catch (err) {
      console.error('Recording initialization error:', err);
      setIsRecordingTour(false);
      setIsAutoSaving(false);
    }
  }, [isTourActive, isTourPlaying, setIsTourActive]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }
    setIsRecordingTour(false);

    // Restore canvas and camera viewport
    if (rendererRef.current && containerRef.current && cameraRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererRef.current.setSize(w, h, true);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // 1-Click Automated Tour Video Recording & Saving
  const handleStartAutoSaveVideo = useCallback((quality?: '4k' | '1080p') => {
    if (quality) {
      setTourRecordingQuality(quality);
      tourRecordingQualityRef.current = quality;
    }
    handleSeekTour(0);
    setIsTourPlaying(true);
    isTourPlayingRef.current = true;
    setIsAutoSaving(true);
    isAutoSavingRef.current = true;
    handleStartRecording(quality);
  }, [handleSeekTour, handleStartRecording]);

  const handleStopAndSaveNow = useCallback(() => {
    handleStopRecording();
    setIsAutoSaving(false);
    isAutoSavingRef.current = false;
  }, [handleStopRecording]);

  const handleCancelAutoSave = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }
    recordedChunksRef.current = [];
    setIsRecordingTour(false);
    setIsAutoSaving(false);
    isAutoSavingRef.current = false;

    // Restore canvas and camera viewport
    if (rendererRef.current && containerRef.current && cameraRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererRef.current.setSize(w, h, true);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // Trigger recording from parent showcase modal if requested
  useEffect(() => {
    if (tourAutoRecordRequest) {
      handleStartAutoSaveVideo(tourAutoRecordRequest.quality);
    }
  }, [tourAutoRecordRequest, handleStartAutoSaveVideo]);

  useEffect(() => {
    if (tourSeekTarget !== undefined && tourSeekTarget !== null) {
      handleSeekTour(tourSeekTarget);
    }
  }, [tourSeekTarget, handleSeekTour]);

  // Electron particles pool
  const electronParticlesRef = useRef<{ mesh: THREE.Mesh; progress: number; speed: number; bridge: BondData }[]>([]);
  const rosParticlesRef = useRef<{ mesh: THREE.Mesh; life: number; maxLife: number; velocity: THREE.Vector3; origin: THREE.Vector3; type: string }[]>([]);

  // Camera Target Animation Ref
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  // 1. INITIALIZE THREE.JS SCENE
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    // Quantum dark slate background matching user's image
    scene.background = new THREE.Color(0x060913);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    // Initial view oriented to exactly match the reference image's Angle 1 Side-Profile
    camera.position.set(-14, -36, 17);
    cameraRef.current = camera;

    // Renderer with antialias & high pixel ratio
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 1.15;
    controls.panSpeed = 0.8;
    controls.minDistance = 2;
    controls.maxDistance = 150;
    controls.target.set(0, 0, 3.2);
    controlsRef.current = controls;

    // Lighting setup for crisp atomistic sphere rendering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(35, 45, 55);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.6); // Soft blue rim
    dirLight2.position.set(-35, -35, 25);
    scene.add(dirLight2);

    const rimLight = new THREE.DirectionalLight(0x00e676, 0.4); // Emerald green bottom accent
    rimLight.position.set(0, -45, -25);
    scene.add(rimLight);

    // Groups
    const atomsGroup = new THREE.Group();
    const bondsGroup = new THREE.Group();
    const bridgesGroup = new THREE.Group();
    const defectsGroup = new THREE.Group();
    const electronFlowGroup = new THREE.Group();
    const rosGroup = new THREE.Group();
    const measurementGroup = new THREE.Group();
    const boundingBoxGroup = new THREE.Group();
    const selectedBondGroup = new THREE.Group();

    scene.add(atomsGroup);
    scene.add(bondsGroup);
    scene.add(bridgesGroup);
    scene.add(defectsGroup);
    scene.add(electronFlowGroup);
    scene.add(rosGroup);
    scene.add(measurementGroup);
    scene.add(boundingBoxGroup);
    scene.add(selectedBondGroup);

    atomsGroupRef.current = atomsGroup;
    bondsGroupRef.current = bondsGroup;
    bridgesGroupRef.current = bridgesGroup;
    defectsGroupRef.current = defectsGroup;
    electronFlowGroupRef.current = electronFlowGroup;
    rosParticlesGroupRef.current = rosGroup;
    measurementGroupRef.current = measurementGroup;
    boundingBoxGroupRef.current = boundingBoxGroup;
    selectedBondGroupRef.current = selectedBondGroup;

    // 3D Tour Callout Group (3D Arrow, Reticle Ring, and Billboard Sprite)
    const tourCalloutGroup = new THREE.Group();
    scene.add(tourCalloutGroup);
    tourCalloutGroupRef.current = tourCalloutGroup;

    // Selection Halo marker
    const haloGeo = new THREE.RingGeometry(0.7, 0.95, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const selectionMarker = new THREE.Mesh(haloGeo, haloMat);
    selectionMarker.visible = false;
    scene.add(selectionMarker);
    selectionMarkerRef.current = selectionMarker;

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 3D Tour Camera Trajectory Animation
      if (isTourActiveRef.current) {
        if (isTourPlayingRef.current) {
          tourTimeRef.current += delta * tourSpeedRef.current;
          if (tourTimeRef.current >= TOTAL_TOUR_DURATION) {
            if (isAutoSavingRef.current) {
              // Tour finished during auto-save: finalize recording and trigger download
              tourTimeRef.current = TOTAL_TOUR_DURATION;
              isTourPlayingRef.current = false;
              setIsTourPlaying(false);
              handleStopRecording();
              setIsAutoSaving(false);
              isAutoSavingRef.current = false;
            } else {
              tourTimeRef.current = 0;
            }
          }
          setTourTime(tourTimeRef.current);
        }

        const frame = getCameraFrameAtTime(tourTimeRef.current);
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(...frame.position);
          controlsRef.current.target.set(...frame.lookAt);
        }

        if (frame.chapter.id !== activeChapterRef.current.id) {
          activeChapterRef.current = frame.chapter;
          setActiveTourChapter(frame.chapter);
          updateTourCallout3DRef.current(frame.chapter);
        }

        // Project callout 3D target coordinates to 2D screen coordinates for VideoTourPlayer SVG pointer
        if (frame.chapter.callout && cameraRef.current && containerRef.current) {
          const t3d = frame.chapter.callout.target3D;
          const proj = new THREE.Vector3(t3d[0], t3d[1], t3d[2]).project(cameraRef.current);
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          const isVisible = proj.z < 1.0;
          const sx = (proj.x * 0.5 + 0.5) * w;
          const sy = (-(proj.y * 0.5) + 0.5) * h;
          if (
            !lastScreenPosRef.current ||
            Math.abs(lastScreenPosRef.current.x - sx) > 1.5 ||
            Math.abs(lastScreenPosRef.current.y - sy) > 1.5 ||
            lastScreenPosRef.current.visible !== isVisible
          ) {
            lastScreenPosRef.current = { x: sx, y: sy, visible: isVisible };
            setCalloutScreenPos({ x: sx, y: sy, visible: isVisible });
          }
        }
      } else {
        // Smooth camera tweening if target set
        if (targetCamPos.current && targetLookAt.current && cameraRef.current && controlsRef.current) {
          cameraRef.current.position.lerp(targetCamPos.current, 0.08);
          controlsRef.current.target.lerp(targetLookAt.current, 0.08);

          if (
            cameraRef.current.position.distanceTo(targetCamPos.current) < 0.05 &&
            controlsRef.current.target.distanceTo(targetLookAt.current) < 0.05
          ) {
            cameraRef.current.position.copy(targetCamPos.current);
            controlsRef.current.target.copy(targetLookAt.current);
            targetCamPos.current = null;
            targetLookAt.current = null;
          }
        }
      }

      controls.update();

      // Update selected bond 3D screen position for floating HUD callout
      if (
        selectedBond &&
        selectedBond.atom1 &&
        selectedBond.atom2 &&
        cameraRef.current &&
        containerRef.current
      ) {
        const a1 = selectedBond.atom1;
        const a2 = selectedBond.atom2;
        const midWorld = new THREE.Vector3(
          (a1.x + a2.x) * 0.5,
          (a1.y + a2.y) * 0.5,
          (a1.z + a2.z) * 0.5 + 0.35
        );
        const projected = midWorld.clone().project(cameraRef.current);
        if (projected.z < 1.0) {
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          const sx = (projected.x * 0.5 + 0.5) * w;
          const sy = (-(projected.y * 0.5) + 0.5) * h;
          if (sx >= 10 && sx <= w - 10 && sy >= 10 && sy <= h - 10) {
            setSelectedBondScreenPos({ x: sx, y: sy });
          } else {
            setSelectedBondScreenPos(null);
          }
        } else {
          setSelectedBondScreenPos(null);
        }
      } else {
        setSelectedBondScreenPos(null);
      }

      // Animate 3D Tour Callout in Three.js Scene (Orient ring to camera & pulse)
      if (tourCalloutGroupRef.current && cameraRef.current) {
        const ring = tourCalloutGroupRef.current.getObjectByName('targetRing') as THREE.Mesh;
        if (ring) {
          ring.quaternion.copy(cameraRef.current.quaternion);
          const ringScale = 1 + 0.16 * Math.sin(elapsed * 6);
          ring.scale.set(ringScale, ringScale, ringScale);
        }
      }

      // Animate selection halo
      if (selectionMarkerRef.current && selectionMarkerRef.current.visible && cameraRef.current) {
        selectionMarkerRef.current.quaternion.copy(cameraRef.current.quaternion);
        const scale = 1 + 0.15 * Math.sin(elapsed * 6);
        selectionMarkerRef.current.scale.set(scale, scale, scale);
      }

      // Animate Selected Bond Highlight & Halos
      if (selectedBondGroupRef.current && selectedBondGroupRef.current.children.length > 0) {
        selectedBondGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry instanceof THREE.RingGeometry && cameraRef.current) {
              child.quaternion.copy(cameraRef.current.quaternion);
              const ringScale = 1 + 0.18 * Math.sin(elapsed * 7);
              child.scale.set(ringScale, ringScale, ringScale);
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissiveIntensity = 1.0 + 0.6 * Math.sin(elapsed * 5);
            }
          }
        });
      }

      // Animate Tour 3D Holographic Target Beacon Ring
      if (tourCalloutGroupRef.current && tourCalloutGroupRef.current.children.length > 0 && cameraRef.current) {
        const targetRing = tourCalloutGroupRef.current.getObjectByName('targetRing') as THREE.Mesh | undefined;
        if (targetRing) {
          targetRing.quaternion.copy(cameraRef.current.quaternion);
          const ringPulse = 1 + 0.15 * Math.sin(elapsed * 6);
          targetRing.scale.set(ringPulse, ringPulse, ringPulse);
        }
      }

      // Animate Covalent Bridge Pulses
      if (bridgesGroupRef.current) {
        bridgesGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(elapsed * 4 + (child.userData.index || 0));
          }
        });
      }

      // Animate Defect Site ($V_O$) Glow and Pulsing
      if (defectsGroupRef.current) {
        defectsGroupRef.current.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh) {
            const pulse = 1 + 0.25 * Math.sin(elapsed * 5 + i * 0.8);
            child.scale.set(pulse, pulse, pulse);
          }
        });
      }

      // Animate Electron Transfer Flow Particles (ZnO -> 16 Bridges -> Graphene Net)
      if (showElectronFlow && electronParticlesRef.current.length > 0) {
        electronParticlesRef.current.forEach((item) => {
          item.progress += item.speed * delta;
          if (item.progress > 1) item.progress = 0;

          const b = item.bridge;
          if (!b || !b.atom1 || !b.atom2) return;
          const znPos = new THREE.Vector3(b.atom1.x, b.atom1.y, b.atom1.z);
          const cPos = new THREE.Vector3(b.atom2.x, b.atom2.y, b.atom2.z);

          const midPos = new THREE.Vector3().addVectors(znPos, cPos).multiplyScalar(0.5);
          midPos.z += 0.4;

          const t = item.progress;
          const p = new THREE.Vector3()
            .copy(znPos)
            .multiplyScalar((1 - t) * (1 - t))
            .add(new THREE.Vector3().copy(midPos).multiplyScalar(2 * (1 - t) * t))
            .add(new THREE.Vector3().copy(cPos).multiplyScalar(t * t));

          item.mesh.position.copy(p);
          const s = 0.8 + 0.4 * Math.sin(t * Math.PI);
          item.mesh.scale.set(s, s, s);
        });
      }

      // Animate ROS Radical Emissions ($O_2 \rightarrow \cdot O_2^-$, $\cdot OH$)
      if (showROSAnimation && rosParticlesRef.current.length > 0) {
        rosParticlesRef.current.forEach((p) => {
          p.life += delta;
          if (p.life > p.maxLife) {
            p.life = 0;
            p.mesh.position.copy(p.origin);
            p.velocity.set((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, Math.random() * 2.0 + 1.0);
          }

          p.mesh.position.addScaledVector(p.velocity, delta);
          const fade = 1 - p.life / p.maxLife;
          if (p.mesh.material instanceof THREE.MeshBasicMaterial) {
            p.mesh.material.opacity = fade * 0.9;
          }
          p.mesh.scale.setScalar(fade * 1.2);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // 2. REBUILD ATOMS AND BONDS MESHES WHEN MODEL OR RENDER STYLE CHANGES
  useEffect(() => {
    if (
      !atomsGroupRef.current ||
      !bondsGroupRef.current ||
      !bridgesGroupRef.current ||
      !defectsGroupRef.current ||
      !boundingBoxGroupRef.current
    )
      return;

    // Clear old meshes
    while (atomsGroupRef.current.children.length > 0) {
      atomsGroupRef.current.remove(atomsGroupRef.current.children[0]);
    }
    while (bondsGroupRef.current.children.length > 0) {
      bondsGroupRef.current.remove(bondsGroupRef.current.children[0]);
    }
    while (bridgesGroupRef.current.children.length > 0) {
      bridgesGroupRef.current.remove(bridgesGroupRef.current.children[0]);
    }
    while (defectsGroupRef.current.children.length > 0) {
      defectsGroupRef.current.remove(defectsGroupRef.current.children[0]);
    }
    while (boundingBoxGroupRef.current.children.length > 0) {
      boundingBoxGroupRef.current.remove(boundingBoxGroupRef.current.children[0]);
    }
    if (electronFlowGroupRef.current) {
      while (electronFlowGroupRef.current.children.length > 0) {
        electronFlowGroupRef.current.remove(electronFlowGroupRef.current.children[0]);
      }
    }
    if (rosParticlesGroupRef.current) {
      while (rosParticlesGroupRef.current.children.length > 0) {
        rosParticlesGroupRef.current.remove(rosParticlesGroupRef.current.children[0]);
      }
    }

    electronParticlesRef.current = [];
    rosParticlesRef.current = [];

    const isCPK = renderMode === 'space_filling';
    const isWireframe = renderMode === 'wireframe';
    const isEDX = renderMode === 'edx_mapping';
    const isStrain = renderMode === 'strain_map';
    const isReferenceView = renderMode === 'reference_image_view';

    // Sphere geometry templates with high polygonal subdivision for pristine presentation rendering
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

    // Atom filter predicate based on layerFilter
    const shouldIncludeAtom = (atom: AtomData) => {
      if (layerFilter === 'all') return true;
      if (layerFilter === 'zno_only') return atom.element === 'Zn' || (atom.element === 'O' && !atom.isEdgeFunctionalGroup) || atom.element === 'VO';
      if (layerFilter === 'gnp_only') return atom.element === 'C' || atom.isEdgeFunctionalGroup;
      if (layerFilter === 'interface_only') return atom.isBridgeBonded || (atom.element === 'C' && atom.layer === model.stats.layerCount);
      if (layerFilter === 'layer_1') return atom.layer === 1;
      if (layerFilter === 'layer_2') return atom.layer === 2;
      if (layerFilter === 'layer_3') return atom.layer === 3;
      if (layerFilter === 'layer_4') return atom.layer === 4;
      if (layerFilter === 'layer_5') return atom.layer === 5;
      return true;
    };

    const visibleAtomIds = new Set<number>();

    // RENDER ATOMS
    model.atoms.forEach((atom) => {
      if (!shouldIncludeAtom(atom)) return;
      visibleAtomIds.add(atom.id);

      let radius = atom.radius * atomScale;
      if (isCPK) {
        radius = (atom.element === 'C' ? 1.15 : atom.element === 'Zn' ? 1.35 : atom.element === 'H' ? 0.65 : 1.05) * atomScale;
      } else if (isWireframe) {
        radius = 0.18 * atomScale;
      } else if (isReferenceView) {
        // Precise atomic radius ratios matching the reference molecular rendering
        radius = (atom.element === 'C' ? 0.46 : atom.element === 'Zn' ? 0.60 : atom.element === 'H' ? 0.24 : 0.44) * atomScale;
      }

      let colorHex = atom.color;

      if (isEDX || isReferenceView) {
        // High-contrast Presentation Colors matching image: C = Bright Green, Zn = Golden Yellow, O = Vivid Scarlet Red, H = Pure White
        if (atom.element === 'C') colorHex = '#00e676';
        else if (atom.element === 'Zn') colorHex = '#facc15';
        else if (atom.element === 'O') colorHex = '#ef4444';
        else if (atom.element === 'H') colorHex = '#ffffff';
        else if (atom.element === 'VO') colorHex = '#06b6d4';
      } else if (isStrain) {
        if (atom.isBridgeBonded) {
          colorHex = '#f43f5e';
        } else if (atom.element === 'C' && atom.layer === model.stats.layerCount) {
          colorHex = '#f59e0b';
        } else if (atom.element === 'C') {
          colorHex = '#10b981';
        } else {
          colorHex = '#38bdf8';
        }
      }

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: atom.element === 'Zn' ? 0.22 : atom.element === 'H' ? 0.12 : 0.35,
        metalness: atom.element === 'Zn' ? 0.55 : 0.08,
        wireframe: isWireframe,
        emissive: atom.isSurfaceDefect && highlightDefects ? new THREE.Color(0x06b6d4) : new THREE.Color(0x000000),
        emissiveIntensity: atom.isSurfaceDefect ? 0.7 : 0,
      });

      const sphereMesh = new THREE.Mesh(sphereGeo, mat);
      sphereMesh.position.set(atom.x, atom.y, atom.z);
      sphereMesh.scale.set(radius, radius, radius);
      sphereMesh.userData = { atom };
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;

      atomsGroupRef.current?.add(sphereMesh);
    });

    // RENDER BONDS
    if (!isCPK) {
      model.bonds.forEach((bond) => {
        const a1 = bond.atom1;
        const a2 = bond.atom2;
        if (!a1 || !a2) return;

        if (!visibleAtomIds.has(a1.id) || !visibleAtomIds.has(a2.id)) return;

        const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
        const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
        const dist = p1.distanceTo(p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const isBridge = bond.isCovalentBridge;
        const isEdgeBond = bond.type === 'c-o_edge' || bond.type === 'o-h_edge';
        const bondRadius = isBridge ? 0.14 : isWireframe ? 0.04 : isEdgeBond ? 0.06 : 0.07;

        let bondColor =
          bond.type === 'c-c'
            ? '#059669'
            : bond.type === 'zn-o'
            ? '#eab308'
            : bond.type === 'c-o_edge'
            ? '#ef4444'
            : bond.type === 'o-h_edge'
            ? '#cbd5e1'
            : '#38bdf8';

        if (isBridge) {
          bondColor = '#38bdf8';
        }

        const bondMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(bondColor),
          roughness: 0.3,
          metalness: isBridge ? 0.8 : 0.2,
          emissive: isBridge && highlightBridges ? new THREE.Color(0x0284c7) : new THREE.Color(0x000000),
          emissiveIntensity: isBridge ? 0.8 : 0,
        });

        const cylinder = new THREE.Mesh(cylinderGeo, bondMat);
        cylinder.position.copy(mid);
        cylinder.scale.set(bondRadius, dist, bondRadius);

        const axis = new THREE.Vector3(0, 1, 0);
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        cylinder.quaternion.setFromUnitVectors(axis, dir);
        cylinder.userData = { bond };

        // Invisible Raycast Hit Proxy with generous radius (0.28 Å) for responsive clicking and hovering
        const hitProxyMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitProxy = new THREE.Mesh(cylinderGeo, hitProxyMat);
        hitProxy.position.copy(mid);
        hitProxy.quaternion.copy(cylinder.quaternion);
        hitProxy.scale.set(0.28, dist, 0.28);
        hitProxy.userData = { bond };

        if (isBridge) {
          cylinder.userData = { bond, index: bond.bridgeIndex };
          hitProxy.userData = { bond, index: bond.bridgeIndex };
          bridgesGroupRef.current?.add(cylinder);
          bridgesGroupRef.current?.add(hitProxy);

          const bridgeMarkerGeo = new THREE.SphereGeometry(0.24, 16, 16);
          const bridgeMarkerMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.9,
          });
          const markerMesh = new THREE.Mesh(bridgeMarkerGeo, bridgeMarkerMat);
          markerMesh.position.copy(mid);
          markerMesh.userData = { bond, index: bond.bridgeIndex };
          bridgesGroupRef.current?.add(markerMesh);
        } else {
          bondsGroupRef.current?.add(cylinder);
          bondsGroupRef.current?.add(hitProxy);
        }
      });
    }

    // RENDER 3D BOUNDING BOX / CAGE (matching the wireframe frame in user's image)
    if (showBoundingBox && boundingBoxGroupRef.current) {
      // Calculate bounding envelope of current visible atoms
      let minX = -18, maxX = 18, minY = -18, maxY = 18, minZ = -15, maxZ = 24;
      if (model.atoms.length > 0) {
        minX = Math.min(...model.atoms.map((a) => a.x)) - 1.5;
        maxX = Math.max(...model.atoms.map((a) => a.x)) + 1.5;
        minY = Math.min(...model.atoms.map((a) => a.y)) - 1.5;
        maxY = Math.max(...model.atoms.map((a) => a.y)) + 1.5;
        minZ = Math.min(...model.atoms.map((a) => a.z)) - 1.5;
        maxZ = Math.max(...model.atoms.map((a) => a.z)) + 2.5;
      }

      const boxGeo = new THREE.BoxGeometry(maxX - minX, maxY - minY, maxZ - minZ);
      const edges = new THREE.EdgesGeometry(boxGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x334155, // Subtle slate border cage
        transparent: true,
        opacity: 0.45,
      });
      const boxWireframe = new THREE.LineSegments(edges, lineMat);
      boxWireframe.position.set((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
      boundingBoxGroupRef.current.add(boxWireframe);

      // Add Coordinate Axis Indicator in corner matching simulation viewport
      const axesHelper = new THREE.AxesHelper(6);
      axesHelper.position.set(maxX, maxY, minZ);
      boundingBoxGroupRef.current.add(axesHelper);
    }

    // RENDER 14 ACTIVE SURFACE OXYGEN VACANCIES ($V_O$)
    if (highlightDefects || renderMode === 'defect_focus') {
      const ringGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
      });

      model.defects.forEach((defect, idx) => {
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(defect.x, defect.y, defect.z);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.userData = { defectIndex: idx + 1, defect };
        defectsGroupRef.current?.add(ringMesh);

        const coreGeo = new THREE.OctahedronGeometry(0.28);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x06b6d4,
          emissiveIntensity: 1.2,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(defect.x, defect.y, defect.z);
        defectsGroupRef.current?.add(coreMesh);
      });
    }

    // INITIALIZE ELECTRON FLOW PARTICLES
    if (showElectronFlow && electronFlowGroupRef.current) {
      const particleGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
      });

      model.bridges.forEach((bridge) => {
        for (let k = 0; k < 3; k++) {
          const pMesh = new THREE.Mesh(particleGeo, particleMat);
          electronFlowGroupRef.current?.add(pMesh);
          electronParticlesRef.current.push({
            mesh: pMesh,
            progress: (k * 0.33 + Math.random() * 0.1) % 1,
            speed: 0.6 + Math.random() * 0.4,
            bridge,
          });
        }
      });
    }

    // INITIALIZE ROS RADICAL FORMATION PARTICLES
    if (showROSAnimation && rosParticlesGroupRef.current) {
      const rosGeo = new THREE.SphereGeometry(0.16, 12, 12);
      model.defects.forEach((defect) => {
        for (let k = 0; k < 4; k++) {
          const isSuperoxide = defect.reactionType === 'ROS_superoxide';
          const rosMat = new THREE.MeshBasicMaterial({
            color: isSuperoxide ? 0xf43f5e : 0xa855f7,
            transparent: true,
            opacity: 0.85,
          });
          const rosMesh = new THREE.Mesh(rosGeo, rosMat);
          const origin = new THREE.Vector3(defect.x, defect.y, defect.z);
          rosMesh.position.copy(origin);
          rosParticlesGroupRef.current?.add(rosMesh);

          rosParticlesRef.current.push({
            mesh: rosMesh,
            life: Math.random() * 1.5,
            maxLife: 2.0 + Math.random() * 1.0,
            origin,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, Math.random() * 2.0 + 1.0),
            type: defect.reactionType,
          });
        }
      });
    }
  }, [model, renderMode, highlightBridges, highlightDefects, showElectronFlow, showROSAnimation, layerFilter, atomScale, showBoundingBox]);

  // 3. HANDLE CAMERA PRESET TRANSITIONS
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    let targetPos = new THREE.Vector3(0, -36, 19);
    let targetLook = new THREE.Vector3(0, 0, 3.2);

    switch (cameraPreset) {
      case 'reference_exact':
      case 'figure1_side':
        // Exact angle matching user's reference image Angle 1
        targetPos = new THREE.Vector3(-14, -36, 17);
        targetLook = new THREE.Vector3(0, 0, 1.5);
        break;

      case 'figure2_topdown':
        targetPos = new THREE.Vector3(0, 0.1, 48);
        targetLook = new THREE.Vector3(0, 0, 0);
        break;

      case 'figure3_closeup':
        targetPos = new THREE.Vector3(6.5, -12.5, 5.0);
        targetLook = new THREE.Vector3(0, 0, 2.6);
        break;

      case 'cross_section':
        targetPos = new THREE.Vector3(30, -18, 12);
        targetLook = new THREE.Vector3(0, 0, 2.0);
        break;

      case 'defect_angle':
        targetPos = new THREE.Vector3(-14, 16, 20);
        targetLook = new THREE.Vector3(0, 0, 6);
        break;

      case 'overview':
      default:
        targetPos = new THREE.Vector3(-22, -34, 22);
        targetLook = new THREE.Vector3(0, 0, 2.0);
        break;
    }

    targetCamPos.current = targetPos;
    targetLookAt.current = targetLook;
  }, [cameraPreset]);

  // 3b. FOCUS TARGET TRANSITIONS (For zooming in directly to selected atomic bond or coordinate)
  useEffect(() => {
    if (!focusTarget || !controlsRef.current || !cameraRef.current) return;
    targetCamPos.current = new THREE.Vector3(...focusTarget.position);
    targetLookAt.current = new THREE.Vector3(...focusTarget.lookAt);
  }, [focusTarget]);

  // 4. SELECTION HALO UPDATE
  useEffect(() => {
    if (!selectionMarkerRef.current) return;
    if (selectedAtom) {
      selectionMarkerRef.current.position.set(selectedAtom.x, selectedAtom.y, selectedAtom.z);
      selectionMarkerRef.current.visible = true;
    } else {
      selectionMarkerRef.current.visible = false;
    }
  }, [selectedAtom]);

  // 4b. SELECTED BOND HIGHLIGHT UPDATE
  useEffect(() => {
    if (!selectedBondGroupRef.current) return;

    while (selectedBondGroupRef.current.children.length > 0) {
      selectedBondGroupRef.current.remove(selectedBondGroupRef.current.children[0]);
    }

    if (!selectedBond || !selectedBond.atom1 || !selectedBond.atom2) return;

    const a1 = selectedBond.atom1;
    const a2 = selectedBond.atom2;
    const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
    const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
    const dist = p1.distanceTo(p2);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const isBridge = selectedBond.isCovalentBridge || selectedBond.type === 'zn-o-c_bridge';
    const isGNP = selectedBond.type === 'c-c';
    const isZn = a1.element === 'Zn' || a2.element === 'Zn';

    let hexColor = 0x38bdf8; // Vivid cyan
    if (isBridge) hexColor = 0xf43f5e; // Vivid rose
    else if (isGNP) hexColor = 0x10b981; // Emerald
    else if (isZn) hexColor = 0xfacc15; // Amber

    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 24);
    const highlightMat = new THREE.MeshStandardMaterial({
      color: hexColor,
      emissive: hexColor,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      metalness: 0.3,
    });

    const highlightCyl = new THREE.Mesh(cylGeo, highlightMat);
    highlightCyl.position.copy(mid);
    highlightCyl.scale.set(0.18, dist * 1.02, 0.18);

    const axis = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    highlightCyl.quaternion.setFromUnitVectors(axis, dir);
    selectedBondGroupRef.current.add(highlightCyl);

    // Marker rings around participating atoms
    const ringGeo = new THREE.RingGeometry(0.5, 0.72, 32);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: hexColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const r1 = new THREE.Mesh(ringGeo, ringMat1);
    r1.position.copy(p1);
    const r2 = new THREE.Mesh(ringGeo, ringMat1.clone());
    r2.position.copy(p2);

    selectedBondGroupRef.current.add(r1);
    selectedBondGroupRef.current.add(r2);
  }, [selectedBond]);

  // 5. UPDATE MEASUREMENT RULER MESH
  useEffect(() => {
    if (!measurementGroupRef.current) return;

    while (measurementGroupRef.current.children.length > 0) {
      measurementGroupRef.current.remove(measurementGroupRef.current.children[0]);
    }

    if (measurePointA && measurePointB) {
      const p1 = new THREE.Vector3(measurePointA.x, measurePointA.y, measurePointA.z);
      const p2 = new THREE.Vector3(measurePointB.x, measurePointB.y, measurePointB.z);
      const dist = p1.distanceTo(p2);
      setCurrentDistance(dist);
      if (onMeasureDistance) onMeasureDistance(dist, measurePointA, measurePointB);

      const points = [p1, p2];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.4,
        gapSize: 0.2,
        linewidth: 3,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      measurementGroupRef.current.add(line);

      const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const s1 = new THREE.Mesh(sphereGeo, sphereMat);
      s1.position.copy(p1);
      const s2 = new THREE.Mesh(sphereGeo, sphereMat);
      s2.position.copy(p2);
      measurementGroupRef.current.add(s1);
      measurementGroupRef.current.add(s2);
    } else if (measurePointA) {
      const p1 = new THREE.Vector3(measurePointA.x, measurePointA.y, measurePointA.z);
      const sphereGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const s1 = new THREE.Mesh(sphereGeo, sphereMat);
      s1.position.copy(p1);
      measurementGroupRef.current.add(s1);
    }
  }, [measurePointA, measurePointB, onMeasureDistance]);

  // 6. RAYCASTING INTERACTION (CLICK & HOVER)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !cameraRef.current || !atomsGroupRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      const intersects = raycaster.intersectObjects(atomsGroupRef.current.children);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const atom = clickedMesh.userData.atom as AtomData;

        if (measurementMode) {
          if (!measurePointA) {
            setMeasurePointA(atom);
            setMeasurePointB(null);
          } else if (!measurePointB && measurePointA.id !== atom.id) {
            setMeasurePointB(atom);
          } else {
            setMeasurePointA(atom);
            setMeasurePointB(null);
          }
        } else {
          if (onSelectAtom) onSelectAtom(atom);
          if (onSelectBond) {
            const connectedBond = model.bonds.find(
              (b) => b.atom1.id === atom.id || b.atom2.id === atom.id
            );
            if (connectedBond) onSelectBond(connectedBond);
          }
        }
        return;
      }

      // Check bonds if not measurement mode
      if (!measurementMode) {
        const bondCandidates: THREE.Object3D[] = [
          ...(bondsGroupRef.current?.children || []),
          ...(bridgesGroupRef.current?.children || []),
        ];
        const bondIntersects = raycaster.intersectObjects(bondCandidates);
        if (bondIntersects.length > 0) {
          const clickedBondMesh = bondIntersects[0].object as THREE.Mesh;
          const bond = clickedBondMesh.userData.bond as BondData;
          if (bond) {
            if (onSelectBond) onSelectBond(bond);
            if (onSelectAtom) onSelectAtom(bond.atom1);
            if (onZoomToBond) onZoomToBond(bond, 'closeup');
            return;
          }
        }

        if (onSelectAtom) onSelectAtom(null);
        if (onSelectBond) onSelectBond(null);
      }
    },
    [measurementMode, measurePointA, measurePointB, onSelectAtom, onSelectBond, onZoomToBond, model.bonds]
  );

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !atomsGroupRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(atomsGroupRef.current.children);
    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      setHoveredAtom(mesh.userData.atom as AtomData);
      setHoveredBond(null);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      return;
    }

    setHoveredAtom(null);

    // Check bond candidates
    const bondCandidates: THREE.Object3D[] = [
      ...(bondsGroupRef.current?.children || []),
      ...(bridgesGroupRef.current?.children || []),
    ];
    const bondHits = raycaster.intersectObjects(bondCandidates);
    if (bondHits.length > 0) {
      const bMesh = bondHits[0].object as THREE.Mesh;
      const b = bMesh.userData.bond as BondData;
      if (b) {
        setHoveredBond(b);
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        return;
      }
    }

    setHoveredBond(null);
  }, []);

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      targetCamPos.current = new THREE.Vector3(-14, -36, 17);
      targetLookAt.current = new THREE.Vector3(0, 0, 1.5);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ZnO_GNP_Atomistic_Twin_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] bg-[#060913] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
    >
      {/* Centered Top Title Banner (Exact match to User's Reference Graphic - Hidden during Tour) */}
      {!isTourActive && (
        <div className="absolute top-3 inset-x-0 z-10 flex flex-col items-center pointer-events-none px-4">
          <div className="text-center bg-slate-950/85 backdrop-blur-md px-5 py-2 rounded-xl border border-slate-800/80 shadow-2xl pointer-events-auto">
            <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Angle 1: Side-Profile Interfacial View
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold tracking-tight mt-0.5">
              <span className="text-emerald-400 font-bold">Carbon = Green</span>
              <span className="text-slate-600">|</span>
              <span className="text-yellow-400 font-bold">Zinc = Yellow</span>
              <span className="text-slate-600">|</span>
              <span className="text-red-400 font-bold">Oxygen = Red</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredAtom(null)}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Canvas HUD Overlay (Top Left - Hidden during Tour) */}
      {!isTourActive && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg flex items-center gap-2 pointer-events-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wide text-slate-200 font-mono">
              zno_graphene_nanocomposite-v8.pdb
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
              {model.atoms.length} Atoms
            </span>
          </div>

          {/* Live Measurement Readout Banner */}
          {measurementMode && (
            <div className="bg-cyan-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-cyan-500/40 shadow-xl pointer-events-auto flex items-center justify-between gap-3 min-w-[280px]">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-medium text-cyan-200">Sub-Angstrom Distance Tool</div>
                  <div className="text-[11px] text-slate-400">
                    {!measurePointA
                      ? 'Click 1st atom to begin'
                      : !measurePointB
                      ? `Point A: ${measurePointA.name} (${measurePointA.element}) selected. Click 2nd atom.`
                      : `${measurePointA.name} ↔ ${measurePointB.name}: `}
                  </div>
                </div>
              </div>
              {currentDistance !== null && measurePointB && (
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-cyan-300">
                    {currentDistance.toFixed(3)} Å
                  </span>
                  <div className="text-[9px] text-cyan-400/80">
                    {Math.abs(currentDistance - 1.43) < 0.05
                      ? '★ Exact Zn-O-C Bridge (1.430 Å)'
                      : Math.abs(currentDistance - 1.42) < 0.05
                      ? '★ C-C Graphene Lattice'
                      : Math.abs(currentDistance - 1.98) < 0.1
                      ? '★ Wurtzite Zn-O Bond'
                      : 'Interatomic distance'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Viewport Toolbars (Top Right - Hidden during Tour) */}
      {!isTourActive && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {/* 3D Video Tour Showcase & Flight Button */}
          <button
            id="btn-viewport-video-tour"
            onClick={() => {
              setIsTourActive(true);
              setIsTourPlaying(true);
              isTourPlayingRef.current = true;
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-md active:scale-95 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-200 border-amber-500/40"
            title="Launch Pure 3D Video Tour around Model"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">3D Video Tour</span>
          </button>

          {onOpenReplicationModal && (
            <button
              id="btn-quick-export-replication"
              onClick={onOpenReplicationModal}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="Export for 3D Protein & Molecular Imaging Websites (Mol*, PyMOL, ChimeraX)"
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">3D Protein Export</span>
            </button>
          )}

          {onOpenEDXEditor && (
            <button
              id="btn-quick-edx"
              onClick={onOpenEDXEditor}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              title="Update & customize EDX data"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit EDX</span>
            </button>
          )}

          <button
            id="btn-ruler-tool"
            onClick={() => {
              setMeasurementMode(!measurementMode);
              if (measurementMode) {
                setMeasurePointA(null);
                setMeasurePointB(null);
                setCurrentDistance(null);
              }
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 shadow-md ${
              measurementMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
            title="Measure atomic distance in Ångstroms"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{measurementMode ? 'Measuring' : 'Ruler (Å)'}</span>
          </button>

          <button
            id="btn-reset-cam"
            onClick={resetCamera}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-md"
            title="Reset to Reference Image Angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-snapshot"
            onClick={handleCaptureSnapshot}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-md"
            title="Capture High-Res PNG for Poster / Paper"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-fullscreen"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-md"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Floating Hover Tooltip (Hidden during Tour) */}
      {!isTourActive && hoveredAtom && tooltipPos && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-2xl text-xs font-sans -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: hoveredAtom.color }}
            />
            <span className="font-bold text-slate-100">{hoveredAtom.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">[{hoveredAtom.element}]</span>
            {hoveredAtom.isBridgeBonded && (
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                1.430 Å Bridge #{hoveredAtom.bridgeId}
              </span>
            )}
            {hoveredAtom.isSurfaceDefect && (
              <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                Active Defect (V_O)
              </span>
            )}
            {hoveredAtom.isEdgeFunctionalGroup && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                Edge Passivation
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div>State: <span className="font-mono text-slate-100">{hoveredAtom.charge || 'Neutral'}</span></div>
            <div>
              Coords (Å):{' '}
              <span className="font-mono text-emerald-400">
                ({hoveredAtom.x.toFixed(2)}, {hoveredAtom.y.toFixed(2)}, {hoveredAtom.z.toFixed(2)})
              </span>
            </div>
            {hoveredAtom.layer && <div>GNP Layer: {hoveredAtom.layer} of {model.stats.layerCount}</div>}
          </div>
        </div>
      )}

      {!isTourActive && hoveredBond && tooltipPos && !hoveredAtom && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-2xl text-xs font-sans -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1 mb-1">
            <span className="font-bold text-cyan-300">
              {hoveredBond.isCovalentBridge
                ? `Zn-O-C Bridge #${hoveredBond.bridgeIndex || 1}`
                : hoveredBond.type.toUpperCase().replace('_', ' ')}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded border border-slate-700">
              {hoveredBond.length.toFixed(3)} Å
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div>
              Atoms: <span className="text-white font-semibold">{hoveredBond.atom1.name}</span> ──{' '}
              <span className="text-white font-semibold">{hoveredBond.atom2.name}</span>
            </div>
            <div className="text-[10px] text-cyan-400">Click to select and inspect bond in explorer</div>
          </div>
        </div>
      )}

      {/* Active Selected Bond Floating 3D HUD Badge with Direct Zoom Trigger */}
      {!isTourActive && selectedBond && selectedBondScreenPos && (
        <div
          className="absolute z-20 pointer-events-auto -translate-x-1/2 -translate-y-full mb-3 flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-200"
          style={{ left: selectedBondScreenPos.x, top: selectedBondScreenPos.y }}
        >
          <div className="bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-400 shadow-xl shadow-cyan-500/20 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="font-bold text-slate-100 font-mono text-[11px]">
              {selectedBond.atom1.name} ─ {selectedBond.atom2.name}
            </span>
            <span className="text-cyan-300 font-bold font-mono text-[11px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
              {selectedBond.length.toFixed(3)} Å
            </span>
            {onZoomToBond && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onZoomToBond(selectedBond, 'closeup');
                }}
                className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer"
                title="Zoom directly to this bond"
              >
                <ZoomIn className="w-3 h-3" />
                <span>Zoom</span>
              </button>
            )}
          </div>
          <div className="w-2 h-2 bg-cyan-400 rotate-45 -mt-1 shadow-sm" />
        </div>
      )}

      {/* Pure 3D Video Tour Player Overlay & Controls */}
      <VideoTourPlayer
        isActive={isTourActive}
        onClose={() => {
          setIsTourActive(false);
          setIsTourPlaying(false);
          isTourPlayingRef.current = false;
          if (isRecordingTour) {
            handleStopRecording();
          }
          if (isCleanScreen && onToggleCleanScreen) {
            onToggleCleanScreen();
          }
          if (tourCalloutGroupRef.current) {
            tourCalloutGroupRef.current.clear();
          }
          setCalloutScreenPos(null);
          lastScreenPosRef.current = null;
        }}
        currentTime={tourTime}
        onSeek={handleSeekTour}
        isPlaying={isTourPlaying}
        onTogglePlay={handleTogglePlayTour}
        speed={tourSpeed}
        onChangeSpeed={(s) => {
          setTourSpeed(s);
          tourSpeedRef.current = s;
        }}
        isAutoSaving={isAutoSaving}
        onStartAutoSaveVideo={handleStartAutoSaveVideo}
        onStopAndSaveNow={handleStopAndSaveNow}
        onCancelAutoSave={handleCancelAutoSave}
        videoQuality={tourRecordingQuality}
        onChangeVideoQuality={setTourRecordingQuality}
        isCleanScreen={!!isCleanScreen}
        onToggleCleanScreen={onToggleCleanScreen || (() => {})}
        activeChapter={activeTourChapter}
        targetScreenPos={calloutScreenPos}
      />

      {/* Bottom Floating Legend Bar (Only shown when not in Video Tour mode) */}
      {!isTourActive && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center gap-3 pointer-events-auto shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="font-medium text-slate-200">Carbon ({model.stats.carbonAtPct} at%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm" />
              <span className="font-medium text-slate-200">Zinc ({model.stats.zincAtPct} at%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
              <span className="font-medium text-slate-200">Oxygen ({model.stats.oxygenAtPct} at%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
              <span className="font-medium text-slate-200">16 Bridges (1.430 Å)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 ring-2 ring-cyan-500/50 shadow-sm" />
              <span className="font-medium text-slate-200">14 V_O Defect Sites</span>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 pointer-events-auto">
            <span>Drag: Rotate</span>
            <span>•</span>
            <span>Right-Click: Pan</span>
            <span>•</span>
            <span>Scroll: Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};
