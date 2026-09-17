import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AtomData, BondData } from '../types';
import { ModelData } from '../utils/atomisticGenerator';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Film,
  Video,
  Download,
  Sparkles,
  Layers,
  Zap,
  Eye,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  Activity,
  Compass,
  Presentation,
  Award,
  Check,
  Tag,
  BookOpen,
  Microscope,
  Clock,
  Sliders,
  CheckCircle,
  Atom,
} from 'lucide-react';
import {
  FORMATION_PHASES,
  TOTAL_FORMATION_DURATION,
  MINIMAL_ANGLES,
  FormationPhase,
} from '../data/formationPhases';

interface BondFormationVideoExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelData;
}

export const BondFormationVideoExplorer: React.FC<BondFormationVideoExplorerProps> = ({
  isOpen,
  onClose,
  model,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Mesh groupings for dynamic formation
  const grapheneGroupRef = useRef<THREE.Group | null>(null);
  const oxygenBridgeGroupRef = useRef<THREE.Group | null>(null);
  const znoGroupRef = useRef<THREE.Group | null>(null);
  const bridgesGroupRef = useRef<THREE.Group | null>(null);
  const defectsGroupRef = useRef<THREE.Group | null>(null);
  const boundingBoxGroupRef = useRef<THREE.Group | null>(null);
  const energyWavesGroupRef = useRef<THREE.Group | null>(null);
  const electronFlowGroupRef = useRef<THREE.Group | null>(null);

  // Playback state (0 to 20s) - isLooping defaults to false so it holds on the final structure!
  const [currentTime, setCurrentTime] = useState<number>(0);
  const currentTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const isPlayingRef = useRef<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.5);
  const playbackSpeedRef = useRef<number>(1.5);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const isLoopingRef = useRef<boolean>(false);
  const loopHoldTimerRef = useRef<number>(0);

  // Minimal angles state: 'auto' (cinematic director) or locked to presets
  const [angleMode, setAngleMode] = useState<
    'auto' | 'side' | 'zoomBridge' | 'zoomAnchorO' | 'topdown' | 'macro' | 'horizon' | 'isometric'
  >('auto');
  const angleModeRef = useRef<
    'auto' | 'side' | 'zoomBridge' | 'zoomAnchorO' | 'topdown' | 'macro' | 'horizon' | 'isometric'
  >('auto');

  // Clean Screen Mode (hide HUD for video capturing)
  const [isCleanScreen, setIsCleanScreen] = useState<boolean>(false);
  const isCleanScreenRef = useRef<boolean>(false);

  // Video recording quality state (4K 60fps Ultra HD or 1080p 60fps Full HD)
  const [videoQuality, setVideoQuality] = useState<'4k' | '1080p'>('4k');
  const videoQualityRef = useRef<'4k' | '1080p'>('4k');

  // Video recording state (.webm or .mp4 60fps)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const lastReactTimeUpdateRef = useRef<number>(0);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Fullscreen presentation state: defaults to true so it immediately opens full screen ready for the panel
  const modalRootRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);

  // ISEF Panel Presentation & Defense Mode state
  const [isPanelPresentationMode, setIsPanelPresentationMode] = useState<boolean>(true);
  const [showSpeakerDeck, setShowSpeakerDeck] = useState<boolean>(false);
  const [showCallouts, setShowCallouts] = useState<boolean>(true);
  const [presentationTab, setPresentationTab] = useState<'defense' | 'mechanism'>('defense');

  // Elaborative Subtitle Ribbon View Tab:
  // 'script': large teleprompter speech with key phrases highlighted for the panel
  // 'reactions': step-by-step microscopic atomic mechanisms & bond lengths
  // 'metrology': quantitative lab validation cards (XRD, XPS 531.4 eV, TRPL 7.9 ns, TEM 146.95 nm)
  const [narrativeTab, setNarrativeTab] = useState<'script' | 'reactions' | 'metrology'>('script');

  // Toggle browser fullscreen with native API or container fallback
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (modalRootRef.current) {
          if (modalRootRef.current.requestFullscreen) {
            await modalRootRef.current.requestFullscreen();
          }
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request error:', err);
      // Fallback: toggle internal full-viewport mode
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // Listen to browser fullscreen changes (e.g. Esc pressed natively)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // When modal opens: ensure full screen, deliberate presentation speed (1.0x), and attempt browser fullscreen
  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(true);
      setPlaybackSpeed(1.0);
      playbackSpeedRef.current = 1.0;
      setIsPlaying(true);
      isPlayingRef.current = true;
      if (!document.fullscreenElement && modalRootRef.current?.requestFullscreen) {
        modalRootRef.current.requestFullscreen().catch(() => {});
      }
    }
  }, [isOpen]);

  // Jump directly to a formation stage (e.g. via 1-4 buttons or keys)
  const jumpToStage = useCallback((stageId: number) => {
    const targetPhase = FORMATION_PHASES.find((p) => p.id === stageId);
    if (targetPhase) {
      setCurrentTime(targetPhase.startTime + 0.05);
      currentTimeRef.current = targetPhase.startTime + 0.05;
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
  }, []);

  // 1-Click Launch "Present to Panel" flow
  const startPresentingToPanel = useCallback(async () => {
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setPlaybackSpeed(1.0); // 1.0x optimal deliberate presentation speed
    playbackSpeedRef.current = 1.0;
    setIsPlaying(true);
    isPlayingRef.current = true;
    setIsPanelPresentationMode(true);
    setShowSpeakerDeck(true);
    setIsFullscreen(true);
    if (!document.fullscreenElement && modalRootRef.current) {
      try {
        await modalRootRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(true);
      }
    }
  }, []);

  // Current active phase
  const activePhase = useMemo(() => {
    return (
      FORMATION_PHASES.find(
        (p) => currentTime >= p.startTime && currentTime < p.endTime
      ) || FORMATION_PHASES[FORMATION_PHASES.length - 1]
    );
  }, [currentTime]);
  const activePhaseRef = useRef<FormationPhase>(FORMATION_PHASES[0]);

  // Keep refs updated
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    angleModeRef.current = angleMode;
  }, [angleMode]);

  useEffect(() => {
    isCleanScreenRef.current = isCleanScreen;
  }, [isCleanScreen]);

  useEffect(() => {
    videoQualityRef.current = videoQuality;
  }, [videoQuality]);

  useEffect(() => {
    activePhaseRef.current = activePhase;
  }, [activePhase]);

  // Handle keyboard shortcuts (Space: play/pause, Left/Right: skip phase, F: fullscreen, P: speaker deck, Esc: exit clean screen)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipPhase(1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipPhase(-1);
      } else if (e.key === '1') {
        e.preventDefault();
        jumpToStage(1);
      } else if (e.key === '2') {
        e.preventDefault();
        jumpToStage(2);
      } else if (e.key === '3') {
        e.preventDefault();
        jumpToStage(3);
      } else if (e.key === '4') {
        e.preventDefault();
        jumpToStage(4);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setShowSpeakerDeck((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isCleanScreen) {
          setIsCleanScreen(false);
        } else if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCleanScreen, onClose, toggleFullscreen]);

  const skipPhase = (delta: number) => {
    const curIdx = FORMATION_PHASES.findIndex((p) => p.id === activePhase.id);
    const nextIdx = Math.max(0, Math.min(FORMATION_PHASES.length - 1, curIdx + delta));
    const targetPhase = FORMATION_PHASES[nextIdx];
    setCurrentTime(targetPhase.startTime + 0.05);
    currentTimeRef.current = targetPhase.startTime + 0.05;
  };

  // Helper to interpolate camera smoothly between minimal angles
  const lerpCam = (
    from: { pos: [number, number, number]; lookAt: [number, number, number] },
    to: { pos: [number, number, number]; lookAt: [number, number, number] },
    ease: number
  ) => ({
    pos: [
      THREE.MathUtils.lerp(from.pos[0], to.pos[0], ease),
      THREE.MathUtils.lerp(from.pos[1], to.pos[1], ease),
      THREE.MathUtils.lerp(from.pos[2], to.pos[2], ease),
    ] as [number, number, number],
    lookAt: [
      THREE.MathUtils.lerp(from.lookAt[0], to.lookAt[0], ease),
      THREE.MathUtils.lerp(from.lookAt[1], to.lookAt[1], ease),
      THREE.MathUtils.lerp(from.lookAt[2], to.lookAt[2], ease),
    ] as [number, number, number],
  });

  // Helper to interpolate minimal angles with proper camera focus on each synthesis event
  const getCameraTargetAtTime = (t: number) => {
    if (angleModeRef.current !== 'auto') {
      const preset = MINIMAL_ANGLES[angleModeRef.current];
      return { pos: preset.pos, lookAt: preset.lookAt };
    }

    // Calibrated 4-Stage Protocol Camera Choreography (Snappy 13s Timeline):
    // Stage 1 (0.0s - 3.0s): Side profile tracking immediate arrival of ZnO & integration onto graphene
    // Stage 2 (3.0s - 6.5s): Macro zoom on zinc oxide binding to graphene (16 Zn-O-C bridges, 1.430 Å C-O, 1.850 Å Zn-O)
    // Stage 3 (6.5s - 9.8s): Targeted zoom on the other Oxygen atoms anchoring to graphene sheets (C-O 1.428 Å) & 14 VO defects
    // Stage 4 (9.8s - 13.0s): 3D Atomic Digital Twin with orbital glide & 7.9 ns ballistic electron highway
    if (t < 2.5) {
      // Stage 1: Side profile showing immediate ZnO arrival and conformational settling
      return { pos: MINIMAL_ANGLES.side.pos, lookAt: MINIMAL_ANGLES.side.lookAt };
    } else if (t < 3.2) {
      // Smooth camera glide zooming into the zinc oxide binding to graphene
      const alpha = (t - 2.5) / 0.7;
      const ease = alpha * alpha * (3 - 2 * alpha);
      return lerpCam(MINIMAL_ANGLES.side, MINIMAL_ANGLES.zoomBridge, ease);
    } else if (t < 6.0) {
      // Stage 2: Sub-angstrom macro zoom on zinc oxide binding to graphene (16 Zn-O-C bridges)
      return { pos: MINIMAL_ANGLES.zoomBridge.pos, lookAt: MINIMAL_ANGLES.zoomBridge.lookAt };
    } else if (t < 6.7) {
      // Smooth camera transition zooming over to the other Oxygen atoms anchoring to graphene sheets
      const alpha = (t - 6.0) / 0.7;
      const ease = alpha * alpha * (3 - 2 * alpha);
      return lerpCam(MINIMAL_ANGLES.zoomBridge, MINIMAL_ANGLES.zoomAnchorO, ease);
    } else if (t < 9.3) {
      // Stage 3: Targeted close-up on the other Oxygen atoms anchoring to graphene sheets
      return { pos: MINIMAL_ANGLES.zoomAnchorO.pos, lookAt: MINIMAL_ANGLES.zoomAnchorO.lookAt };
    } else if (t < 10.1) {
      // Smooth pull-back into full 3D atomic digital twin overview
      const alpha = (t - 9.3) / 0.8;
      const ease = alpha * alpha * (3 - 2 * alpha);
      return lerpCam(MINIMAL_ANGLES.zoomAnchorO, MINIMAL_ANGLES.isometric, ease);
    } else {
      // Stage 4: Panoramic orbital glide around complete digital twin (9.8s to 13.0s)
      const drift = (t - 9.8) * 0.085;
      const basePos = MINIMAL_ANGLES.isometric.pos;
      const cosD = Math.cos(drift);
      const sinD = Math.sin(drift);
      const rx = basePos[0] * cosD - basePos[1] * sinD;
      const ry = basePos[0] * sinD + basePos[1] * cosD;
      return {
        pos: [rx, ry, basePos[2]] as [number, number, number],
        lookAt: MINIMAL_ANGLES.isometric.lookAt,
      };
    }
  };

  // Video Recording Logic - Broadcast Quality 4K Ultra HD (3840×2160) or Full HD (1080p) at 60 FPS (1.5x Playback Speed)
  // Direct WebGL canvas stream capture: zero CPU readback stalls, 100% hardware accelerated, completely smooth!
  const startRecording = useCallback((overrideQuality?: '4k' | '1080p') => {
    if (!canvasRef.current || !containerRef.current) return;
    try {
      recordedChunksRef.current = [];

      const q = overrideQuality || videoQualityRef.current;
      const is4K = q === '4k';
      const targetW = is4K ? 3840 : 1920;
      const targetH = is4K ? 2160 : 1080;
      // 50 Mbps bitrate for pristine 4K 60fps broadcast fidelity, 18 Mbps for 1080p 60fps
      const targetBitrate = is4K ? 50000000 : 18000000;

      // Enforce 1.5x playback speed for video recording
      setPlaybackSpeed(1.5);
      playbackSpeedRef.current = 1.5;

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

      // Stream directly from the WebGL canvas at 60 FPS (hardware-accelerated, zero lag, zero dropped frames)
      const stream = canvasRef.current.captureStream(60);

      const mimeCandidates = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4;codecs=avc1',
        'video/mp4',
      ];
      let mimeType = mimeCandidates.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || '';

      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: targetBitrate,
      };
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      const mr = new MediaRecorder(stream, recorderOptions);
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        try {
          const type = mimeType || 'video/webm';
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const blob = new Blob(recordedChunksRef.current, { type });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const qTag = is4K ? '4K_60fps' : '1080p_60fps';
          a.download = `ZnO_GNP_Bond_Formation_${qTag}_1.5x_${new Date().toISOString().slice(0, 10)}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          setDownloadToast(
            is4K
              ? 'Ultra HD 4K Video Downloaded: 3840×2160 • 60fps • 1.5x Speed Simulation'
              : 'Full HD Video Downloaded: 1080p • 60fps • 1.5x Speed Simulation'
          );
          setTimeout(() => setDownloadToast(null), 4500);
        } catch (err) {
          console.error('Error in MediaRecorder onstop:', err);
        }
        setIsRecording(false);
        isRecordingRef.current = false;

        // Restore Three.js renderer and camera to normal container viewport
        if (rendererRef.current && containerRef.current && cameraRef.current) {
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          rendererRef.current.setSize(w, h, true);
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
        }
      };

      mediaRecorderRef.current = mr;
      mr.start(100);
      isRecordingRef.current = true;
      setIsRecording(true);

      // Start from 0.0s for a complete capture covering the entire formation simulation through complete heterojunction
      currentTimeRef.current = 0;
      setCurrentTime(0);
      lastReactTimeUpdateRef.current = 0;
      setIsPlaying(true);
      isPlayingRef.current = true;
    } catch (err) {
      console.error('Failed to start video recording:', err);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }

    // Restore Three.js renderer and camera to normal container size
    if (rendererRef.current && containerRef.current && cameraRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererRef.current.setSize(w, h, true);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // Three.js Scene Setup & Animation Loop
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    sceneRef.current = scene;

    // Camera
    const initialCam = MINIMAL_ANGLES.side;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(...initialCam.pos);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // required for captureStream & screenshots
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(...initialCam.lookAt);
    controls.maxDistance = 60;
    controls.minDistance = 3;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(15, -20, 25);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.85);
    dirLight2.position.set(-15, 20, 15);
    scene.add(dirLight2);

    const interfaceGlow = new THREE.PointLight(0xf43f5e, 1.4, 20);
    interfaceGlow.position.set(0, 0, 1.15);
    scene.add(interfaceGlow);

    // Create groups
    const grapheneGroup = new THREE.Group();
    const oxygenBridgeGroup = new THREE.Group();
    const znoGroup = new THREE.Group();
    const bridgesGroup = new THREE.Group();
    const defectsGroup = new THREE.Group();
    const boundingBoxGroup = new THREE.Group();
    const energyWavesGroup = new THREE.Group();
    const electronFlowGroup = new THREE.Group();

    scene.add(grapheneGroup);
    scene.add(oxygenBridgeGroup);
    scene.add(znoGroup);
    scene.add(bridgesGroup);
    scene.add(defectsGroup);
    scene.add(boundingBoxGroup);
    scene.add(energyWavesGroup);
    scene.add(electronFlowGroup);

    grapheneGroupRef.current = grapheneGroup;
    oxygenBridgeGroupRef.current = oxygenBridgeGroup;
    znoGroupRef.current = znoGroup;
    bridgesGroupRef.current = bridgesGroup;
    defectsGroupRef.current = defectsGroup;
    boundingBoxGroupRef.current = boundingBoxGroup;
    energyWavesGroupRef.current = energyWavesGroup;
    electronFlowGroupRef.current = electronFlowGroup;

    // Geometries
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

    // 1. Build Pure Graphene Substrate Meshes (Pure Carbon Only - NO OXYGEN on the sheets in Phase 1!)
    const pureCarbonAtoms = model.atoms.filter((a) => a.element === 'C');
    const grapheneMeshes: { mesh: THREE.Mesh; finalPos: THREE.Vector3; atom: AtomData; baseRadius: number }[] = [];
    const pureCarbonBonds = model.bonds.filter((b) => b.type === 'c-c');
    const grapheneBondMeshes: { mesh: THREE.Mesh; p1: THREE.Vector3; p2: THREE.Vector3; bond: BondData; baseRadius: number; length: number }[] = [];

    const matCarbon = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00ff66), // Bright Green #00FF66 (Protocol Section 3)
      roughness: 0.35,
      metalness: 0.1,
    });
    const matCarbonBond = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00cc55),
      roughness: 0.4,
    });

    pureCarbonAtoms.forEach((atom) => {
      const radius = 0.44;
      const mesh = new THREE.Mesh(sphereGeo, matCarbon);
      mesh.scale.set(radius, radius, radius);
      mesh.position.set(atom.x, atom.y, atom.z);
      grapheneGroup.add(mesh);
      grapheneMeshes.push({
        mesh,
        finalPos: new THREE.Vector3(atom.x, atom.y, atom.z),
        atom,
        baseRadius: radius,
      });
    });

    pureCarbonBonds.forEach((bond) => {
      const a1 = bond.atom1;
      const a2 = bond.atom2;
      if (!a1 || !a2) return;
      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
      const dist = p1.distanceTo(p2);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const radius = 0.065;

      const mesh = new THREE.Mesh(cylinderGeo, matCarbonBond);
      mesh.position.copy(mid);
      mesh.scale.set(radius, dist, radius);
      const axis = new THREE.Vector3(0, 1, 0);
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      mesh.quaternion.setFromUnitVectors(axis, dir);
      grapheneGroup.add(mesh);
      grapheneBondMeshes.push({ mesh, p1, p2, bond, baseRadius: radius, length: dist });
    });

    // 2. Build Perimeter Side Oxygen and Hydrogen Functional Groups (Arrive & Anchor to sides only with Zn & O)
    const sideOxygenAtoms = model.atoms.filter((a) => a.isEdgeFunctionalGroup && a.element === 'O');
    const sideHydrogenAtoms = model.atoms.filter((a) => a.isEdgeFunctionalGroup && a.element === 'H');

    const sideOxygenMeshes: {
      mesh: THREE.Mesh;
      finalPos: THREE.Vector3;
      prePos: THREE.Vector3;
      dockPos: THREE.Vector3;
      atom: AtomData;
      baseRadius: number;
    }[] = [];
    const sideHydrogenMeshes: {
      mesh: THREE.Mesh;
      finalPos: THREE.Vector3;
      prePos: THREE.Vector3;
      dockPos: THREE.Vector3;
      atom: AtomData;
      baseRadius: number;
    }[] = [];

    const sideBondCOMeshes: {
      mesh: THREE.Mesh;
      p1: THREE.Vector3;
      p2: THREE.Vector3;
      midPos: THREE.Vector3;
      bond: BondData;
      baseRadius: number;
      length: number;
    }[] = [];
    const sideBondOHMeshes: {
      mesh: THREE.Mesh;
      p1: THREE.Vector3;
      p2: THREE.Vector3;
      midPos: THREE.Vector3;
      bond: BondData;
      baseRadius: number;
      length: number;
    }[] = [];

    const matHydrogen = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffffff),
      roughness: 0.15,
      metalness: 0.05,
    });
    const matOxygenEdge = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff3333), // Deep Red #FF3333 (Protocol Section 3)
      roughness: 0.3,
    });
    const matEdgeBondCO = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff3333),
      roughness: 0.3,
    });
    const matEdgeBondOH = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xcbd5e1),
      roughness: 0.3,
    });

    sideOxygenAtoms.forEach((atom) => {
      const radius = 0.40;
      const mesh = new THREE.Mesh(sphereGeo, matOxygenEdge);
      mesh.scale.set(radius, radius, radius);
      mesh.position.set(atom.x, atom.y, atom.z);
      grapheneGroup.add(mesh);
      const finalPos = new THREE.Vector3(atom.x, atom.y, atom.z);
      const radLen = Math.hypot(atom.x, atom.y) || 1;
      const sideOffset = new THREE.Vector3(atom.x / radLen, atom.y / radLen, 0).multiplyScalar(6.0);
      const prePos = new THREE.Vector3().addVectors(finalPos, sideOffset);
      const dockPos = new THREE.Vector3().addVectors(finalPos, sideOffset.clone().multiplyScalar(0.35));
      sideOxygenMeshes.push({
        mesh,
        finalPos,
        prePos,
        dockPos,
        atom,
        baseRadius: radius,
      });
    });

    sideHydrogenAtoms.forEach((atom) => {
      const radius = 0.24;
      const mesh = new THREE.Mesh(sphereGeo, matHydrogen);
      mesh.scale.set(radius, radius, radius);
      mesh.position.set(atom.x, atom.y, atom.z);
      grapheneGroup.add(mesh);
      const finalPos = new THREE.Vector3(atom.x, atom.y, atom.z);
      const radLen = Math.hypot(atom.x, atom.y) || 1;
      const sideOffset = new THREE.Vector3(atom.x / radLen, atom.y / radLen, 0).multiplyScalar(6.5);
      const prePos = new THREE.Vector3().addVectors(finalPos, sideOffset);
      const dockPos = new THREE.Vector3().addVectors(finalPos, sideOffset.clone().multiplyScalar(0.35));
      sideHydrogenMeshes.push({
        mesh,
        finalPos,
        prePos,
        dockPos,
        atom,
        baseRadius: radius,
      });
    });

    const edgeCOBonds = model.bonds.filter((b) => b.type === 'c-o_edge');
    edgeCOBonds.forEach((bond) => {
      const a1 = bond.atom1;
      const a2 = bond.atom2;
      if (!a1 || !a2) return;
      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
      const dist = p1.distanceTo(p2);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const radius = 0.06;
      const mesh = new THREE.Mesh(cylinderGeo, matEdgeBondCO);
      mesh.position.copy(mid);
      mesh.scale.set(radius, dist, radius);
      const axis = new THREE.Vector3(0, 1, 0);
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      mesh.quaternion.setFromUnitVectors(axis, dir);
      grapheneGroup.add(mesh);
      sideBondCOMeshes.push({ mesh, p1, p2, midPos: mid, bond, baseRadius: radius, length: dist });
    });

    const edgeOHBonds = model.bonds.filter((b) => b.type === 'o-h_edge');
    edgeOHBonds.forEach((bond) => {
      const a1 = bond.atom1;
      const a2 = bond.atom2;
      if (!a1 || !a2) return;
      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
      const dist = p1.distanceTo(p2);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const radius = 0.06;
      const mesh = new THREE.Mesh(cylinderGeo, matEdgeBondOH);
      mesh.position.copy(mid);
      mesh.scale.set(radius, dist, radius);
      const axis = new THREE.Vector3(0, 1, 0);
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      mesh.quaternion.setFromUnitVectors(axis, dir);
      grapheneGroup.add(mesh);
      sideBondOHMeshes.push({ mesh, p1, p2, midPos: mid, bond, baseRadius: radius, length: dist });
    });

    // Build Interfacial Oxygen Atoms (16 bridge oxygen atoms at Z = 1.15 Å)
    const bridgeOxygenAtoms = model.atoms.filter((a) => a.isBridgeBonded && a.element === 'O');
    const oxygenBridgeMeshes: { mesh: THREE.Mesh; finalPos: THREE.Vector3; atom: AtomData; baseRadius: number }[] = [];

    const matOxygenBridge = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff3333), // Deep Red #FF3333 (Protocol Section 3)
      roughness: 0.25,
      emissive: new THREE.Color(0xf43f5e),
      emissiveIntensity: 0.6,
    });

    bridgeOxygenAtoms.forEach((atom) => {
      const mesh = new THREE.Mesh(sphereGeo, matOxygenBridge);
      const radius = 0.48;
      mesh.scale.set(radius, radius, radius);
      mesh.position.set(atom.x, atom.y, atom.z);
      oxygenBridgeGroup.add(mesh);
      oxygenBridgeMeshes.push({
        mesh,
        finalPos: new THREE.Vector3(atom.x, atom.y, atom.z),
        atom,
        baseRadius: radius,
      });
    });

    // Build ZnO Wurtzite Dome Atoms & Bonds
    const znoAtoms = model.atoms.filter(
      (a) => (a.element === 'Zn' || (a.element === 'O' && !a.isBridgeBonded && !a.isEdgeFunctionalGroup) || a.element === 'VO')
    );
    const znoMeshes: { mesh: THREE.Mesh; finalPos: THREE.Vector3; atom: AtomData; baseRadius: number }[] = [];
    // Only wurtzite lattice bonds, keeping interfacial coordination bonds in the anchor sites
    const znoBonds = model.bonds.filter(
      (b) => b.type === 'zn-o' && !(b.atom1?.isBridgeBonded && b.atom2?.isBridgeBonded)
    );
    const znoBondMeshes: { mesh: THREE.Mesh; p1: THREE.Vector3; p2: THREE.Vector3; midPos: THREE.Vector3; bond: BondData; baseRadius: number; length: number }[] = [];

    const matZn = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffcc00), // Bright Yellow / Gold #FFCC00 (Protocol Section 3)
      roughness: 0.22,
      metalness: 0.55,
    });
    const matLatticeO = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff3333), // Deep Red #FF3333 (Protocol Section 3)
      roughness: 0.3,
    });
    const matDefectVO = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x06b6d4), // Cyan Vacancy #06B6D4 (Protocol Section 3)
      roughness: 0.2,
      emissive: new THREE.Color(0x06b6d4),
      emissiveIntensity: 0.8,
    });
    const matZnOBond = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffcc00), // Matching Zinc Wurtzite #FFCC00
      roughness: 0.35,
    });

    znoAtoms.forEach((atom) => {
      const mat = atom.element === 'Zn' ? matZn : atom.element === 'VO' ? matDefectVO : matLatticeO;
      const radius = atom.element === 'Zn' ? 0.6 : atom.element === 'VO' ? 0.45 : 0.44;
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.set(radius, radius, radius);
      mesh.position.set(atom.x, atom.y, atom.z);
      znoGroup.add(mesh);
      znoMeshes.push({
        mesh,
        finalPos: new THREE.Vector3(atom.x, atom.y, atom.z),
        atom,
        baseRadius: radius,
      });
    });

    znoBonds.forEach((bond) => {
      const a1 = bond.atom1;
      const a2 = bond.atom2;
      if (!a1 || !a2) return;
      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
      const dist = p1.distanceTo(p2);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const mesh = new THREE.Mesh(cylinderGeo, matZnOBond);
      mesh.position.copy(mid);
      mesh.scale.set(0.07, dist, 0.07);
      const axis = new THREE.Vector3(0, 1, 0);
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      mesh.quaternion.setFromUnitVectors(axis, dir);
      znoGroup.add(mesh);
      znoBondMeshes.push({ mesh, p1, p2, midPos: mid, bond, baseRadius: 0.07, length: dist });
    });

    // Build 16 Covalent & Coordination Interfacial Anchors (GNP-O-ZnO Integration)
    // Segment 1: Lower C-O Covalent Anchor (1.430 Å, Basal Graphene Pinning)
    // Segment 2: Upper Zn-O Coordination Anchor (1.850 Å, ZnO Nanoparticle Docking)
    const bridgeCarbonAtoms = model.atoms.filter((a) => a.isBridgeBonded && a.element === 'C');
    const bridgeZnAtoms = model.atoms.filter((a) => a.isBridgeBonded && a.element === 'Zn');

    interface AnchorSite {
      bridgeIndex: number;
      cAtom: AtomData;
      oAtom: AtomData;
      znAtom: AtomData;
      cPos: THREE.Vector3;
      oPos: THREE.Vector3;
      znPos: THREE.Vector3;
      coMesh: THREE.Mesh;
      coMat: THREE.MeshStandardMaterial;
      coDist: number;
      coDir: THREE.Vector3;
      coMid: THREE.Vector3;
      znoMesh: THREE.Mesh;
      znoMat: THREE.MeshStandardMaterial;
      znoDist: number;
      znoDir: THREE.Vector3;
      znoMid: THREE.Vector3;
      chemFlash: THREE.Mesh;
      chemFlashMat: THREE.MeshBasicMaterial;
      marker: THREE.Mesh;
      dashedLine: THREE.Line;
      dashedMat: THREE.LineDashedMaterial;
      oItem: { mesh: THREE.Mesh; finalPos: THREE.Vector3; atom: AtomData; baseRadius: number };
      znItem: { mesh: THREE.Mesh; finalPos: THREE.Vector3; atom: AtomData; baseRadius: number };
    }

    const anchorSites: AnchorSite[] = [];
    const matBridgeMarker = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
    });
    const torusRingGeo = new THREE.TorusGeometry(0.38, 0.04, 12, 24);

    for (let i = 1; i <= 16; i++) {
      const oAtom = bridgeOxygenAtoms.find((a) => a.bridgeId === i) || bridgeOxygenAtoms[i - 1];
      const cAtom =
        bridgeCarbonAtoms.find((a) => a.bridgeId === i) ||
        model.atoms
          .filter((a) => a.element === 'C' && Math.abs(a.z) < 1.0)
          .reduce((best, cur) => {
            const dCur = Math.hypot(cur.x - (oAtom?.x || 0), cur.y - (oAtom?.y || 0));
            const dBest = Math.hypot(best.x - (oAtom?.x || 0), best.y - (oAtom?.y || 0));
            return dCur < dBest ? cur : best;
          }, model.atoms[0]);
      const znAtom =
        bridgeZnAtoms.find((a) => a.bridgeId === i) ||
        model.atoms
          .filter((a) => a.element === 'Zn')
          .reduce((best, cur) => {
            const dCur = Math.hypot(cur.x - (oAtom?.x || 0), cur.y - (oAtom?.y || 0));
            const dBest = Math.hypot(best.x - (oAtom?.x || 0), best.y - (oAtom?.y || 0));
            return dCur < dBest ? cur : best;
          }, model.atoms.find((a) => a.element === 'Zn')!);

      if (!oAtom || !cAtom || !znAtom) continue;

      const cPos = new THREE.Vector3(cAtom.x, cAtom.y, cAtom.z);
      const oPos = new THREE.Vector3(oAtom.x, oAtom.y, oAtom.z);
      const znPos = new THREE.Vector3(znAtom.x, znAtom.y, znAtom.z);

      const coDist = cPos.distanceTo(oPos);
      const znoDist = oPos.distanceTo(znPos);

      // Lower C-O Covalent Anchor (1.430 Å)
      const coMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xf43f5e),
        roughness: 0.25,
        metalness: 0.5,
        emissive: new THREE.Color(0xf43f5e),
        emissiveIntensity: 0.6,
      });
      const coMesh = new THREE.Mesh(cylinderGeo, coMat);
      const coMid = new THREE.Vector3().addVectors(cPos, oPos).multiplyScalar(0.5);
      const coDir = new THREE.Vector3().subVectors(oPos, cPos).normalize();
      coMesh.position.copy(coMid);
      coMesh.scale.set(0.12, coDist, 0.12);
      coMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), coDir);
      bridgesGroup.add(coMesh);

      // Upper Zn-O Coordination Anchor (1.850 Å)
      const znoMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffcc00),
        roughness: 0.25,
        metalness: 0.5,
        emissive: new THREE.Color(0xeab308),
        emissiveIntensity: 0.5,
      });
      const znoMesh = new THREE.Mesh(cylinderGeo, znoMat);
      const znoMid = new THREE.Vector3().addVectors(oPos, znPos).multiplyScalar(0.5);
      const znoDir = new THREE.Vector3().subVectors(znPos, oPos).normalize();
      znoMesh.position.copy(znoMid);
      znoMesh.scale.set(0.12, znoDist, 0.12);
      znoMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), znoDir);
      bridgesGroup.add(znoMesh);

      // Programmatic Dashed Bridge Line (Simulation Rule 3: connects top carbon directly to lower wurtzite facet)
      const dashLineGeo = new THREE.BufferGeometry().setFromPoints([cPos, znPos]);
      const dashedMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.35,
        gapSize: 0.18,
        scale: 1,
        transparent: true,
        opacity: 0.9,
      });
      const dashedLine = new THREE.Line(dashLineGeo, dashedMat);
      dashedLine.computeLineDistances();
      dashedLine.visible = false;
      bridgesGroup.add(dashedLine);

      // Chemisorption pulse flash halo at carbon anchor site
      const chemFlashMat = new THREE.MeshBasicMaterial({
        color: 0x00ff66,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      const chemFlash = new THREE.Mesh(torusRingGeo, chemFlashMat);
      chemFlash.position.copy(cPos);
      chemFlash.rotation.x = Math.PI / 2;
      bridgesGroup.add(chemFlash);

      // Central Quantum Conduit Marker at Interfacial Oxygen
      const marker = new THREE.Mesh(sphereGeo, matBridgeMarker);
      marker.scale.set(0.26, 0.26, 0.26);
      marker.position.copy(oPos);
      bridgesGroup.add(marker);

      const oItem = oxygenBridgeMeshes.find((m) => m.atom.id === oAtom.id) || oxygenBridgeMeshes[0];
      const znItem = znoMeshes.find((m) => m.atom.id === znAtom.id) || znoMeshes[0];

      anchorSites.push({
        bridgeIndex: i,
        cAtom,
        oAtom,
        znAtom,
        cPos,
        oPos,
        znPos,
        coMesh,
        coMat,
        coDist,
        coDir,
        coMid,
        znoMesh,
        znoMat,
        znoDist,
        znoDir,
        znoMid,
        chemFlash,
        chemFlashMat,
        marker,
        dashedLine,
        dashedMat,
        oItem,
        znItem,
      });
    }

    const anchorZnIds = new Set(anchorSites.map((s) => s.znAtom.id));
    const otherZnoMeshes = znoMeshes.filter((m) => !anchorZnIds.has(m.atom.id));

    // Build 14 Surface Oxygen Vacancy Defect Markers (As Shown in the App)
    const defectMeshes: { ring: THREE.Mesh; core: THREE.Mesh; defect: (typeof model.defects)[0] }[] = [];
    const matDefectRing = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const matDefectCore = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: new THREE.Color(0x06b6d4),
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });
    const torusGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 32);
    const octaGeo = new THREE.OctahedronGeometry(0.28);

    (model.defects || []).forEach((defect) => {
      const ring = new THREE.Mesh(torusGeo, matDefectRing);
      ring.position.set(defect.x, defect.y, defect.z);
      ring.rotation.x = Math.PI / 2;

      const core = new THREE.Mesh(octaGeo, matDefectCore);
      core.position.set(defect.x, defect.y, defect.z);

      defectsGroup.add(ring);
      defectsGroup.add(core);
      defectMeshes.push({ ring, core, defect });
    });

    // Build 3D Bounding Cage & Coordinate Axes (As Shown in the App)
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
    const boundingBoxMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.45,
    });
    const boxWireframe = new THREE.LineSegments(edges, boundingBoxMat);
    boxWireframe.position.set((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
    boundingBoxGroup.add(boxWireframe);

    const axesHelper = new THREE.AxesHelper(6);
    axesHelper.position.set(maxX, maxY, minZ);
    boundingBoxGroup.add(axesHelper);

    // Electron flow particles for Phase 5 (Tunneling across the 16 Zn-O-C bridges into Graphene)
    const electronCount = 40;
    interface ElectronParticle {
      mesh: THREE.Mesh;
      progress: number;
      speed: number;
      pStart: THREE.Vector3;
      pBridge: THREE.Vector3;
      pEnd: THREE.Vector3;
    }
    const electronParticles: ElectronParticle[] = [];
    const matElectron = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
    });

    for (let i = 0; i < electronCount; i++) {
      const eMesh = new THREE.Mesh(sphereGeo, matElectron);
      eMesh.scale.set(0.18, 0.18, 0.18);
      eMesh.visible = false;
      electronFlowGroup.add(eMesh);

      const site = anchorSites[i % Math.max(1, anchorSites.length)];
      const rZn = znoAtoms[Math.floor(Math.random() * znoAtoms.length)];
      const rC = pureCarbonAtoms[Math.floor(Math.random() * pureCarbonAtoms.length)];
      electronParticles.push({
        mesh: eMesh,
        progress: Math.random(),
        speed: 0.6 + Math.random() * 0.8,
        pStart: new THREE.Vector3(rZn.x, rZn.y, rZn.z),
        pBridge: site ? site.oPos.clone() : new THREE.Vector3(rZn.x, rZn.y, 1.15),
        pEnd: new THREE.Vector3(rC.x, rC.y, rC.z),
      });
    }

    // Animation Clock & reusable vector allocations (zero per-frame garbage collection)
    const clock = new THREE.Clock();
    const tmpCamPos = new THREE.Vector3();
    const tmpCamLook = new THREE.Vector3();
    const _axisY = new THREE.Vector3(0, 1, 0);
    const _scratch1 = new THREE.Vector3();
    const _scratch2 = new THREE.Vector3();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const rawDelta = clock.getDelta();
      // Clamp delta to 33ms (30fps min step) to prevent time jumps or stuttering
      const delta = Math.min(rawDelta, 0.035);

      // Advance Time (Strictly 1.5x playback speed during HD video recording as specified by user)
      if (isPlayingRef.current) {
        const speed = isRecordingRef.current ? 1.5 : playbackSpeedRef.current;
        currentTimeRef.current += delta * speed;

        if (currentTimeRef.current >= TOTAL_FORMATION_DURATION) {
          currentTimeRef.current = TOTAL_FORMATION_DURATION;
          if (isRecordingRef.current) {
            // Stop recording cleanly upon covering the complete formation and heterojunction
            stopRecording();
            setIsPlaying(false);
            isPlayingRef.current = false;
          } else if (isLoopingRef.current) {
            loopHoldTimerRef.current += delta;
            // Hold on the complete final structure for 3.0s before restarting loop
            if (loopHoldTimerRef.current >= 3.0) {
              loopHoldTimerRef.current = 0;
              currentTimeRef.current = 0;
            }
          } else {
            // Pauses cleanly at end of simulation so the user can inspect the final complete structure!
            setIsPlaying(false);
            isPlayingRef.current = false;
          }
        } else {
          loopHoldTimerRef.current = 0;
        }

        // Throttle React state updates to ~20 Hz to keep the main thread smooth for 60fps Three.js & encoding
        const curT = currentTimeRef.current;
        if (Math.abs(curT - lastReactTimeUpdateRef.current) >= 0.05 || curT >= TOTAL_FORMATION_DURATION) {
          lastReactTimeUpdateRef.current = curT;
          setCurrentTime(curT);
        }
      }

      const t = currentTimeRef.current;

      // 1. UPDATE CAMERA ACCORDING TO MINIMAL ANGLES & TIMELINE
      const camTarget = getCameraTargetAtTime(t);
      tmpCamPos.set(camTarget.pos[0], camTarget.pos[1], camTarget.pos[2]);
      tmpCamLook.set(camTarget.lookAt[0], camTarget.lookAt[1], camTarget.lookAt[2]);
      // Frame-rate independent smooth exponential damping (responsive, zero lag, silky smooth)
      const camSmoothing = Math.min(1.0, 1.0 - Math.exp(-12.0 * delta));
      camera.position.lerp(tmpCamPos, camSmoothing);
      controls.target.lerp(tmpCamLook, camSmoothing);
      controls.update();

      // 2. DYNAMIC FORMATION ANIMATION MATH (Covering 4-Stage Protocol & Complete Heterojunction)
      // -------------------------------------------------------------
      if (t >= 9.8) {
        // =============================================================
        // STAGE 4 (9.8 to 13.0s): 3D ATOMIC DIGITAL TWIN & EXTENDED CHARGE LIFETIME
        // Complete 1,060-atom heterojunction, 16 Zn-O-C quantum highways, 7.9 ns ballistic kinetics
        // =============================================================
        grapheneMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.setScalar(item.baseRadius);
          item.mesh.position.copy(item.finalPos);
        });

        grapheneBondMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
        });

        sideOxygenMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.setScalar(item.baseRadius);
          item.mesh.position.copy(item.finalPos);
        });

        sideHydrogenMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.setScalar(item.baseRadius);
          item.mesh.position.copy(item.finalPos);
        });

        sideBondCOMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
        });

        sideBondOHMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
        });

        oxygenBridgeMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.setScalar(item.baseRadius);
          item.mesh.position.copy(item.finalPos);
        });

        znoMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.setScalar(item.baseRadius);
          item.mesh.position.copy(item.finalPos);
        });

        znoBondMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
        });

        anchorSites.forEach((site, idx) => {
          site.coMesh.visible = true;
          site.coMesh.position.copy(site.coMid);
          site.coMesh.scale.set(0.12, site.coDist, 0.12);
          site.coMesh.quaternion.setFromUnitVectors(_axisY, site.coDir);
          site.coMat.color.setHex(0x38bdf8);
          site.coMat.emissive.setHex(0x0284c7);
          site.coMat.emissiveIntensity = 0.95;

          site.znoMesh.visible = true;
          site.znoMesh.position.copy(site.znoMid);
          site.znoMesh.scale.set(0.12, site.znoDist, 0.12);
          site.znoMesh.quaternion.setFromUnitVectors(_axisY, site.znoDir);
          site.znoMat.color.setHex(0x38bdf8);
          site.znoMat.emissive.setHex(0x0284c7);
          site.znoMat.emissiveIntensity = 0.95;

          // Dashed bridge line (Simulation Rule 3)
          site.dashedLine.visible = true;
          site.dashedMat.opacity = 0.85;

          site.chemFlash.visible = false;
          site.marker.visible = true;
          const pulse = Math.sin(t * 7 + idx) * 0.18 + 0.92;
          site.marker.scale.setScalar(0.26 * pulse);
        });

        defectMeshes.forEach((item) => {
          item.ring.visible = true;
          item.core.visible = true;
          item.ring.scale.setScalar(1.0);
          item.core.scale.setScalar(1.0);
          item.core.rotation.y = t * 2.0;
          item.ring.rotation.z = t * 1.5;
        });

        boundingBoxGroup.visible = true;
        boundingBoxMat.opacity = 0.45;

        // Ballistic Electron Flow along the 16 Zn-O-C bridges into Graphene
        electronParticles.forEach((ep) => {
          ep.mesh.visible = true;
          ep.progress = (ep.progress + delta * ep.speed * 2.2) % 1.0;
          if (ep.progress < 0.5) {
            ep.mesh.position.lerpVectors(ep.pStart, ep.pBridge, ep.progress * 2.0);
          } else {
            ep.mesh.position.lerpVectors(ep.pBridge, ep.pEnd, (ep.progress - 0.5) * 2.0);
          }
        });
      } else {
        // =============================================================
        // STAGES 1 - 3: PROGRESSIVE PROTOCOL SYNTHESIS
        // =============================================================

        // Graphene Scaffold: Exfoliated 5-layer graphene sheets are always structured and formed at t = 0.0s
        grapheneMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.setScalar(item.baseRadius);
          item.mesh.position.copy(item.finalPos);
        });

        grapheneBondMeshes.forEach((item) => {
          item.mesh.visible = true;
          item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
        });

        if (t < 3.0) {
          // =============================================================
          // STAGE 1 (0.0 to 3.0s): IMMEDIATE ARRIVAL & SIDE-VIEW INTEGRATION
          // The simulation proceeds IMMEDIATELY to the arrival of the ZnO cluster in side profile.
          // Under acoustic cavitation shear forces, the pre-bonded 1:1 wurtzite cluster descends
          // smoothly from 8.5 Å and settles intimately onto the corrugated 5-layer graphene sheet.
          // =============================================================
          const prog = Math.min(1.0, t / 2.7);
          const ease = prog * prog * (3 - 2 * prog);
          const curZOffset = THREE.MathUtils.lerp(8.5, 0.0, ease);

          // ZnO cluster settles smoothly down onto graphene corrugated surface, conforming to wavy profile
          znoMeshes.forEach((m) => {
            m.mesh.visible = true;
            const wave = m.finalPos.z < 3.2
              ? Math.sin(m.finalPos.x * 0.45) * Math.cos(m.finalPos.y * 0.45) * 0.18 * (1.0 - m.finalPos.z / 3.2) * ease
              : 0;
            m.mesh.position.set(m.finalPos.x, m.finalPos.y, m.finalPos.z + curZOffset + wave);
            m.mesh.scale.setScalar(m.baseRadius);
          });

          znoBondMeshes.forEach((item) => {
            item.mesh.visible = true;
            item.mesh.position.set(item.midPos.x, item.midPos.y, item.midPos.z + curZOffset);
            item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
          });

          // Interfacial oxygens descend towards pre-annealing contact
          oxygenBridgeMeshes.forEach((m) => {
            m.mesh.visible = true;
            const curOZ = THREE.MathUtils.lerp(m.finalPos.z + 8.5, m.finalPos.z + 0.9, ease);
            m.mesh.position.set(m.finalPos.x, m.finalPos.y, curOZ);
            m.mesh.scale.setScalar(m.baseRadius);
          });

          // Side oxygen and hydrogen atoms migrate smoothly toward edge coordination positions
          sideOxygenMeshes.forEach((m) => {
            m.mesh.visible = true;
            m.mesh.position.lerpVectors(m.prePos, m.dockPos, ease);
            m.mesh.scale.setScalar(m.baseRadius);
          });

          sideHydrogenMeshes.forEach((m) => {
            m.mesh.visible = true;
            m.mesh.position.lerpVectors(m.prePos, m.dockPos, ease);
            m.mesh.scale.setScalar(m.baseRadius);
          });

          // No chemical bonds pinned yet (no dashed lines or solid bridge bonds)
          sideBondCOMeshes.forEach((m) => {
            m.mesh.visible = false;
          });
          sideBondOHMeshes.forEach((m) => {
            m.mesh.visible = false;
          });

          anchorSites.forEach((site, idx) => {
            site.coMesh.visible = false;
            site.znoMesh.visible = false;
            site.marker.visible = false;
            site.dashedLine.visible = false;
            // Subtle green glow at basal carbon sites showing physical contact coordination
            site.chemFlash.visible = true;
            site.chemFlashMat.color.setHex(0x00ff66);
            const pulse = Math.sin(t * 7 + idx) * 0.06 + 0.25;
            site.chemFlash.scale.setScalar(pulse);
            site.chemFlashMat.opacity = 0.45 * ease;
          });

          defectMeshes.forEach((d) => {
            d.ring.visible = false;
            d.core.visible = false;
          });
          boundingBoxGroup.visible = false;
          electronParticles.forEach((ep) => {
            ep.mesh.visible = false;
          });
        } else if (t < 6.5) {
          // =============================================================
          // STAGE 2 (3.0 to 6.5s): INTERFACE MACRO ZOOM — ZINC OXIDE BINDING TO GRAPHENE
          // Camera glides into a sub-angstrom macro zoom directly on the ZnO-graphene interface.
          // Thermal activation drives solid-state chemical pinning of the 16 Zn–O–C bridges.
          // =============================================================
          // All ZnO atoms and internal wurtzite bonds in final position
          znoMeshes.forEach((m) => {
            m.mesh.visible = true;
            m.mesh.position.copy(m.finalPos);
            m.mesh.scale.setScalar(m.baseRadius);
          });
          znoBondMeshes.forEach((item) => {
            item.mesh.visible = true;
            item.mesh.position.copy(item.midPos);
            item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
          });

          // Side oxygen and hydrogen hold poised at edge docking positions
          sideOxygenMeshes.forEach((m) => {
            m.mesh.visible = true;
            m.mesh.position.copy(m.dockPos);
            m.mesh.scale.setScalar(m.baseRadius);
          });
          sideHydrogenMeshes.forEach((m) => {
            m.mesh.visible = true;
            m.mesh.position.copy(m.dockPos);
            m.mesh.scale.setScalar(m.baseRadius);
          });

          sideBondCOMeshes.forEach((m) => {
            m.mesh.visible = false;
          });
          sideBondOHMeshes.forEach((m) => {
            m.mesh.visible = false;
          });

          // 16 Zn-O-C Interfacial Chemical Bridges: Covalent Pinning & Dashed Bridge Lines (3.0 - 6.5s)
          anchorSites.forEach((site, idx) => {
            const stagger = 3.1 + (idx % 16) * 0.12;
            const localA = Math.min(1.0, Math.max(0.0, (t - stagger) / 0.85));

            if (t < stagger) {
              site.oItem.mesh.visible = true;
              site.oItem.mesh.position.set(site.oPos.x, site.oPos.y, site.oPos.z + 0.9);
              site.oItem.mesh.scale.setScalar(0.48);
              site.coMesh.visible = false;
              site.znoMesh.visible = false;
              site.dashedLine.visible = false;
              site.marker.visible = false;
              site.chemFlash.visible = true;
              site.chemFlashMat.color.setHex(0x00ff66);
              site.chemFlash.scale.setScalar(0.35);
              site.chemFlashMat.opacity = 0.45;
            } else {
              // 1. Oxygen moves down into anchored position (Z = 1.15 Å)
              site.oItem.mesh.visible = true;
              const curOZ = THREE.MathUtils.lerp(site.oPos.z + 0.9, site.oPos.z, localA);
              site.oItem.mesh.position.set(site.oPos.x, site.oPos.y, curOZ);
              site.oItem.mesh.scale.setScalar(0.48);

              // 2. Lower C-O covalent bond line forms down to carbon in graphene sheet (1.430 Å)
              site.coMesh.visible = true;
              const curDist = Math.hypot(site.oPos.x - site.cPos.x, site.oPos.y - site.cPos.y, curOZ - site.cPos.z);
              site.coMesh.position.set(
                (site.cPos.x + site.oPos.x) * 0.5,
                (site.cPos.y + site.oPos.y) * 0.5,
                (site.cPos.z + curOZ) * 0.5
              );
              site.coMesh.scale.set(0.12, Math.max(0.001, curDist), 0.12);
              _scratch1.set(site.oPos.x - site.cPos.x, site.oPos.y - site.cPos.y, curOZ - site.cPos.z).normalize();
              site.coMesh.quaternion.setFromUnitVectors(_axisY, _scratch1);

              // 3. Upper Zn-O coordination bond line forms up to zinc in ZnO nanoparticle (1.850 Å)
              site.znoMesh.visible = true;
              const curZnPos = site.znItem.mesh.position;
              const curZnDist = Math.hypot(curZnPos.x - site.oPos.x, curZnPos.y - site.oPos.y, curZnPos.z - curOZ);
              site.znoMesh.position.set(
                (site.oPos.x + curZnPos.x) * 0.5,
                (site.oPos.y + curZnPos.y) * 0.5,
                (curOZ + curZnPos.z) * 0.5
              );
              site.znoMesh.scale.set(0.12, Math.max(0.001, curZnDist), 0.12);
              _scratch2.set(curZnPos.x - site.oPos.x, curZnPos.y - site.oPos.y, curZnPos.z - curOZ).normalize();
              site.znoMesh.quaternion.setFromUnitVectors(_axisY, _scratch2);

              // 4. Programmatic Dashed Bridge Line (Simulation Rule 3)
              site.dashedLine.visible = true;
              site.dashedMat.opacity = Math.min(0.9, localA * 0.9);

              // 5. Chemisorption reaction flash at carbon anchor site
              site.chemFlash.visible = true;
              site.chemFlashMat.color.setHex(0x00ff66);
              if (localA < 0.8) {
                site.chemFlash.scale.setScalar(0.35 + localA * 0.25);
                site.chemFlashMat.opacity = 0.7;
              } else {
                const flashProg = (localA - 0.8) / 0.2;
                site.chemFlash.scale.setScalar(0.55 + flashProg * 0.75);
                site.chemFlashMat.opacity = Math.max(0.0, (1.0 - flashProg) * 0.85);
              }

              // When t >= 5.2s, consolidate into cyan quantum conduit!
              if (t >= 5.2) {
                site.coMat.color.setHex(0x38bdf8);
                site.coMat.emissive.setHex(0x0284c7);
                site.coMat.emissiveIntensity = 0.95;
                site.znoMat.color.setHex(0x38bdf8);
                site.znoMat.emissive.setHex(0x0284c7);
                site.znoMat.emissiveIntensity = 0.95;

                site.marker.visible = true;
                const pulse = Math.sin(t * 8 + idx) * 0.2 + 0.9;
                site.marker.scale.setScalar(0.26 * pulse);
              } else {
                site.coMat.color.setHex(0xf43f5e); // C-O covalent red
                site.coMat.emissive.setHex(0xf43f5e);
                site.coMat.emissiveIntensity = 0.6;
                site.znoMat.color.setHex(0xffcc00); // Zn-O yellow coordination
                site.znoMat.emissive.setHex(0xeab308);
                site.znoMat.emissiveIntensity = 0.5;
                site.marker.visible = false;
              }
            }
          });

          defectMeshes.forEach((d) => {
            d.ring.visible = false;
            d.core.visible = false;
          });
          boundingBoxGroup.visible = false;
          electronParticles.forEach((ep) => {
            ep.mesh.visible = false;
          });
        } else {
          // =============================================================
          // STAGE 3 (6.5 to 9.8s): TARGETED ZOOM — OTHER O ATOMS ANCHORING TO GRAPHENE SHEETS
          // Camera zooms in specifically to the other Oxygen atoms anchoring to graphene sheets.
          // Edge and surface oxygen atoms complete covalent C-O bonds (1.428 Å) and O-H bonds,
          // while 14 surface oxygen vacancies (V_O) activate with luminous cyan defect markers.
          // =============================================================
          // All ZnO atoms and internal wurtzite bonds in final position
          znoMeshes.forEach((m) => {
            m.mesh.visible = true;
            m.mesh.position.copy(m.finalPos);
            m.mesh.scale.setScalar(m.baseRadius);
          });
          znoBondMeshes.forEach((item) => {
            item.mesh.visible = true;
            item.mesh.position.copy(item.midPos);
            item.mesh.scale.set(item.baseRadius, item.length, item.baseRadius);
          });

          // 16 Zn-O-C bridges are already fully locked and consolidated in cyan
          anchorSites.forEach((site, idx) => {
            site.coMesh.visible = true;
            site.coMesh.position.copy(site.coMid);
            site.coMesh.scale.set(0.12, site.coDist, 0.12);
            site.coMesh.quaternion.setFromUnitVectors(_axisY, site.coDir);
            site.coMat.color.setHex(0x38bdf8);
            site.coMat.emissive.setHex(0x0284c7);
            site.coMat.emissiveIntensity = 0.95;

            site.znoMesh.visible = true;
            site.znoMesh.position.copy(site.znoMid);
            site.znoMesh.scale.set(0.12, site.znoDist, 0.12);
            site.znoMesh.quaternion.setFromUnitVectors(_axisY, site.znoDir);
            site.znoMat.color.setHex(0x38bdf8);
            site.znoMat.emissive.setHex(0x0284c7);
            site.znoMat.emissiveIntensity = 0.95;

            site.dashedLine.visible = true;
            site.dashedMat.opacity = 0.85;

            site.chemFlash.visible = false;
            site.marker.visible = true;
            const pulse = Math.sin(t * 8 + idx) * 0.2 + 0.9;
            site.marker.scale.setScalar(0.26 * pulse);
          });

          // Edge & surface oxygen and hydrogen atoms complete covalent anchoring onto sheet edges (6.5 - 9.8s)
          sideOxygenMeshes.forEach((m, idx) => {
            const stagger = 6.6 + (idx % 20) * 0.08;
            const localA = Math.min(1.0, Math.max(0.0, (t - stagger) / 0.75));
            m.mesh.visible = true;
            if (t < stagger) {
              m.mesh.position.copy(m.dockPos);
            } else {
              m.mesh.position.lerpVectors(m.dockPos, m.finalPos, localA);
            }
            m.mesh.scale.setScalar(m.baseRadius);
          });

          sideHydrogenMeshes.forEach((m, idx) => {
            const stagger = 6.7 + (idx % 20) * 0.08;
            const localA = Math.min(1.0, Math.max(0.0, (t - stagger) / 0.75));
            m.mesh.visible = true;
            if (t < stagger) {
              m.mesh.position.copy(m.dockPos);
            } else {
              m.mesh.position.lerpVectors(m.dockPos, m.finalPos, localA);
            }
            m.mesh.scale.setScalar(m.baseRadius);
          });

          sideBondCOMeshes.forEach((item, idx) => {
            const stagger = 6.8 + (idx % 20) * 0.08;
            const localA = Math.min(1.0, Math.max(0.0, (t - stagger) / 0.7));
            if (t < stagger) {
              item.mesh.visible = false;
            } else {
              item.mesh.visible = true;
              const dist = item.length * localA;
              item.mesh.scale.set(item.baseRadius * localA, Math.max(0.001, dist), item.baseRadius * localA);
            }
          });

          sideBondOHMeshes.forEach((item, idx) => {
            const stagger = 6.9 + (idx % 20) * 0.08;
            const localA = Math.min(1.0, Math.max(0.0, (t - stagger) / 0.7));
            if (t < stagger) {
              item.mesh.visible = false;
            } else {
              item.mesh.visible = true;
              const dist = item.length * localA;
              item.mesh.scale.set(item.baseRadius * localA, Math.max(0.001, dist), item.baseRadius * localA);
            }
          });

          // Surface oxygen vacancies (14 VO defects) activate at 7.6s
          defectMeshes.forEach((item, idx) => {
            const staggerDefect = 7.6 + (idx % 14) * 0.08;
            const localD = Math.min(1.0, Math.max(0.0, (t - staggerDefect) / 0.7));
            if (t < staggerDefect) {
              item.ring.visible = false;
              item.core.visible = false;
            } else {
              item.ring.visible = true;
              item.core.visible = true;
              item.ring.scale.setScalar(localD);
              item.core.scale.setScalar(localD);
              item.core.rotation.y = t * 2.0;
              item.ring.rotation.z = t * 1.5;
            }
          });

          // Crystalline bounding box cage fades in near end of Stage 3
          if (t >= 8.8) {
            boundingBoxGroup.visible = true;
            const boxAlpha = Math.min(0.45, ((t - 8.8) / 0.7) * 0.45);
            boundingBoxMat.opacity = boxAlpha;
          } else {
            boundingBoxGroup.visible = false;
          }

          electronParticles.forEach((ep) => {
            ep.mesh.visible = false;
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (isRecordingRef.current) return; // Maintain 1920x1080 during active HD recording
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
  }, [isOpen, model]);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 10);
    return `00:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div
      ref={modalRootRef}
      className={`fixed inset-0 z-50 flex items-center justify-center select-none ${
        isFullscreen
          ? 'p-0 w-screen h-screen bg-black'
          : 'p-0 md:p-3 bg-slate-950/85 backdrop-blur-lg'
      } animate-in fade-in duration-200`}
    >
      <div
        className={`relative w-full h-full bg-slate-950 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'max-w-none max-h-none rounded-none border-0 shadow-none'
            : 'max-w-7xl max-h-[96vh] border border-slate-800 rounded-none md:rounded-2xl shadow-2xl'
        }`}
      >
        {/* Top Header Bar (Hidden in Clean Screen Mode) */}
        {!isCleanScreen && (
          <header className="h-14 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Zn-O-C Bond Formation Explorer</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden xs:inline-block">
                    {TOTAL_FORMATION_DURATION.toFixed(1)}s ISEF Panel Simulation
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                  C-O covalent pinning (1.430 Å) &amp; Zn-O coordination (1.850 Å) yielding 16 quantum conduits into graphene
                </p>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* 1-Click Launch "Present to Panel" button */}
              <button
                id="btn-present-to-panel"
                onClick={startPresentingToPanel}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                title="1-Click Launch: Fullscreen, 1.0x deliberate presentation speed, 0:00 reset, and open ISEF panel speaker deck"
              >
                <Presentation className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span className="font-extrabold tracking-tight hidden sm:inline">Present to Panel</span>
                <span className="font-extrabold tracking-tight sm:hidden">Present</span>
              </button>

              {/* Fullscreen Toggle Button */}
              <button
                id="btn-toggle-fullscreen"
                onClick={toggleFullscreen}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isFullscreen
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/60 shadow-cyan-500/10'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title={isFullscreen ? 'Exit Full Screen (Press F or Esc)' : 'Open Full Screen Presentation (Press F)'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden md:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden md:inline">Full Screen (F)</span>
                  </>
                )}
              </button>

              {/* Judge Speaker Deck Toggle */}
              <button
                id="btn-toggle-speaker-deck"
                onClick={() => setShowSpeakerDeck((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  showSpeakerDeck
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Toggle Judge Defense Talking Points & Empirical Metrology Cards (Press P)"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">{showSpeakerDeck ? 'Hide Panel Notes' : 'Judge Deck (P)'}</span>
              </button>

              {/* Minimal Angle Switcher Buttons */}
              <div className="hidden xl:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setAngleMode('auto')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    angleMode === 'auto'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Auto Minimal Director: Smooth transition with dedicated focus on each formation stage"
                >
                  Auto Director
                </button>
                <button
                  onClick={() => setAngleMode('side')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    angleMode === 'side'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Stage 1: Side Profile (15° Elevation)"
                >
                  Side
                </button>
                <button
                  onClick={() => setAngleMode('zoomBridge')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    angleMode === 'zoomBridge'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Stage 2: Interface Macro Zoom (16 Zn-O-C Bridges)"
                >
                  Bridge Zoom
                </button>
                <button
                  onClick={() => setAngleMode('zoomAnchorO')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    angleMode === 'zoomAnchorO'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Stage 3: Targeted Zoom: Graphene Edge O-Anchors & 14 V_O Defect Sites"
                >
                  O-Anchor Zoom
                </button>
                <button
                  onClick={() => setAngleMode('isometric')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    angleMode === 'isometric'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Stage 4: 3D Atomic Digital Twin Overview (Complete 1,060-atom Composite)"
                >
                  Digital Twin
                </button>
              </div>

              {/* Clean Screen Mode */}
              <button
                onClick={() => setIsCleanScreen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Hide All HUD Controls for Clean Screen (Press Esc to restore)"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Clean</span>
              </button>

              {/* 4K 60fps / 1080p Quality Switcher */}
              <div className="hidden sm:flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-700/80 text-[11px]">
                <button
                  onClick={() => setVideoQuality('4k')}
                  disabled={isRecording}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    videoQuality === '4k'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Export in 4K Ultra HD (3840×2160) at 60 FPS (50 Mbps)"
                >
                  <Sparkles className="w-3 h-3 text-current" />
                  <span>4K</span>
                </button>
                <button
                  onClick={() => setVideoQuality('1080p')}
                  disabled={isRecording}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    videoQuality === '1080p'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Export in Full HD (1920×1080) at 60 FPS (18 Mbps)"
                >
                  <span>1080p</span>
                </button>
              </div>

              {/* Save Video (4K 60fps or 1080p, 1.5x) */}
              <button
                id="btn-download-hd-formation-video"
                onClick={isRecording ? stopRecording : () => startRecording()}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/25 text-rose-200 border-rose-500/70 animate-pulse'
                    : videoQuality === '4k'
                    ? 'bg-gradient-to-r from-amber-500/25 via-cyan-500/25 to-emerald-500/25 hover:from-amber-500/35 hover:to-emerald-500/35 text-white border-amber-500/50 shadow-amber-500/10'
                    : 'bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 hover:from-cyan-500/35 hover:to-emerald-500/35 text-emerald-200 border-emerald-500/50'
                }`}
                title={
                  isRecording
                    ? 'Stop recording and save video now'
                    : `Record & download ${videoQuality === '4k' ? 'Ultra HD 4K (3840×2160)' : 'Full HD 1080p'} 60fps simulation`
                }
              >
                <Download className={`w-3.5 h-3.5 ${videoQuality === '4k' ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="hidden sm:inline">{isRecording ? 'Stop & Save' : `Download ${videoQuality.toUpperCase()}`}</span>
                <span className="sm:hidden">{videoQuality.toUpperCase()}</span>
              </button>

              {/* Close Modal */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all ml-1 cursor-pointer"
                title="Close Explorer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>
        )}

        {/* Floating Quick Controls for Clean Screen Mode */}
        {isCleanScreen && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Quick Angle Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 text-[11px]">
              {(['auto', 'side', 'zoomBridge', 'zoomAnchorO', 'topdown', 'horizon', 'macro', 'isometric'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAngleMode(mode)}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                    angleMode === mode
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Switch to ${mode} angle`}
                >
                  {mode === 'auto'
                    ? 'Auto'
                    : mode === 'side'
                    ? 'Side'
                    : mode === 'zoomBridge'
                    ? 'Bridge'
                    : mode === 'zoomAnchorO'
                    ? 'O-Anchor'
                    : mode === 'topdown'
                    ? 'Top'
                    : mode === 'horizon'
                    ? 'Horizon'
                    : mode === 'macro'
                    ? 'Macro'
                    : 'Twin'}
                </button>
              ))}
            </div>

            {/* Exit Clean Screen Button */}
            <button
              onClick={() => setIsCleanScreen(false)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1"
              title="Exit Clean Screen (Esc)"
            >
              <span>✕ Exit (Esc)</span>
            </button>
          </div>
        )}

        {/* Main 3D Canvas Viewport */}
        <div ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden bg-[#020617]">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Floating Recording Active Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 backdrop-blur-md border border-rose-500/70 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-extrabold text-rose-300 uppercase tracking-wider">
                  Recording {videoQuality === '4k' ? '4K Ultra HD (3840×2160 • 60fps)' : 'Full HD (1080p • 60fps)'} • 1.5x
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-white font-bold">{currentTime.toFixed(1)}s</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">{TOTAL_FORMATION_DURATION.toFixed(1)}s</span>
              </div>
              <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-100"
                  style={{ width: `${(currentTime / TOTAL_FORMATION_DURATION) * 100}%` }}
                />
              </div>
              <button
                onClick={stopRecording}
                className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] transition-all shadow-sm active:scale-95"
                title="Stop recording immediately and download WebM video"
              >
                Stop &amp; Save Now
              </button>
            </div>
          )}

          {/* Download Complete Success Toast */}
          {downloadToast && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-emerald-500/60 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{downloadToast}</span>
            </div>
          )}

          {/* Interfacial Anchoring Live Telemetry HUD (Docked top-left, reveals GNP-ZnO integration) */}
          {!isCleanScreen && (
            <div className="absolute top-4 left-4 z-10 w-64 sm:w-72 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 text-xs shadow-xl pointer-events-auto select-none">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-tight text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Interfacial Anchoring Telemetry
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {currentTime.toFixed(1)}s / {TOTAL_FORMATION_DURATION.toFixed(1)}s
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[10.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Graphene Scaffold:</span>
                  <span className="text-emerald-400 font-bold">
                    5-Layer sp² Carbon (61.27 at%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ZnO Nanoparticles:</span>
                  <span
                    className={
                      currentTime < 3.0
                        ? 'text-amber-400 font-bold'
                        : 'text-amber-200'
                    }
                  >
                    {currentTime < 3.0
                      ? 'Immediate Arrival & Conforming'
                      : 'Integrated onto Graphene'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">C-O-Zn Pinning:</span>
                  <span
                    className={
                      currentTime < 3.0
                        ? 'text-slate-500'
                        : currentTime < 6.5
                        ? 'text-rose-400 font-bold'
                        : 'text-rose-300'
                    }
                  >
                    {currentTime < 3.0
                      ? 'Approaching Contact'
                      : currentTime < 6.5
                      ? 'Pinning 16 Bridges (1.430 Å)'
                      : '16 Covalently Pinned (1.430 Å)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sheet O-Anchors:</span>
                  <span
                    className={
                      currentTime < 6.5
                        ? 'text-slate-500'
                        : currentTime < 9.8
                        ? 'text-emerald-400 font-bold'
                        : 'text-emerald-300 font-bold'
                    }
                  >
                    {currentTime < 6.5
                      ? 'Poised at Edges'
                      : currentTime < 9.8
                      ? 'Covalent Pinning (1.428 Å)'
                      : 'Locked to Graphene Sheets'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Oxygen Vacancies (V_O):</span>
                  <span
                    className={
                      currentTime < 7.6
                        ? 'text-slate-500'
                        : currentTime < 9.8
                        ? 'text-cyan-400 font-bold'
                        : 'text-cyan-300 font-bold'
                    }
                  >
                    {currentTime < 7.6
                      ? 'Inactive'
                      : currentTime < 9.8
                      ? 'Activating 14 V_O Defect Sites'
                      : '14 Active Centers & Zn²⁺'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Charge Lifetime (τ_e):</span>
                  <span
                    className={
                      currentTime < 9.8
                        ? 'text-slate-400'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {currentTime < 9.8
                      ? '~1.2 ns (Uncoupled)'
                      : '7.9 ns (84.7% Suppressed)'}
                  </span>
                </div>
              </div>

              {/* Real-time status badge */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Protocol Stage:</span>
                <span
                  className="font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${activePhase.color}22`,
                    color: activePhase.color,
                    border: `1px solid ${activePhase.color}44`,
                  }}
                >
                  {activePhase.title}
                </span>
              </div>
            </div>
          )}

          {/* Floating In-Scene Structural Callout Chips (Top-Center) */}
          {!isCleanScreen && showCallouts && activePhase.calloutAnnotations && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 max-w-3xl px-2 pointer-events-auto select-none">
              {activePhase.calloutAnnotations.map((callout, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-lg text-[11px] animate-in fade-in slide-in-from-top-1 duration-200"
                  style={{ borderColor: `${callout.color}55` }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: callout.color, boxShadow: `0 0 8px ${callout.color}` }}
                  />
                  <div>
                    <span className="font-extrabold text-white mr-1.5">{callout.title}:</span>
                    <span className="text-slate-300 text-[10.5px]">{callout.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phase Narrative / Panel Defense Side Deck (Docked to right, collapsible) */}
          {!isCleanScreen && (
            showSpeakerDeck ? (
              <div className="absolute top-4 right-4 w-80 sm:w-96 max-h-[calc(100%-120px)] overflow-y-auto bg-slate-950/92 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl z-20 pointer-events-auto select-none flex flex-col gap-2.5">
                {/* Deck Header with Minimize and Stage Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      ISEF 2026 Defense Deck
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${activePhase.color}22`,
                        color: activePhase.color,
                        border: `1px solid ${activePhase.color}55`,
                      }}
                    >
                      Stage {activePhase.id} of {FORMATION_PHASES.length}
                    </span>
                    <button
                      onClick={() => setShowSpeakerDeck(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors text-xs"
                      title="Minimize Defense Deck (Press P to restore)"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Stage Title and Subtitle */}
                <div>
                  <h3 className="text-sm font-black text-white leading-snug">
                    {activePhase.title}
                  </h3>
                  <p
                    className="text-[11px] font-semibold mt-0.5 leading-tight"
                    style={{ color: activePhase.color }}
                  >
                    {activePhase.subtitle}
                  </p>
                </div>

                {/* Tab Switcher: Panel Defense vs. Atomic Mechanism */}
                <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setPresentationTab('defense')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                      presentationTab === 'defense'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Panel Defense</span>
                  </button>
                  <button
                    onClick={() => setPresentationTab('mechanism')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                      presentationTab === 'mechanism'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Mechanism</span>
                  </button>
                </div>

                {/* TAB 1: Panel Defense (Key Talking Points & Quantitative Metrics) */}
                {presentationTab === 'defense' && (
                  <div className="space-y-3">
                    {/* Panel Defense Talking Points */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 mb-1.5 flex items-center gap-1">
                        <span>Key Points to Defend to Judges</span>
                      </div>
                      <div className="space-y-1.5">
                        {activePhase.panelKeyPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-200 leading-snug bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/60">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quantitative Verification 4-Card Grid */}
                    {activePhase.quantitativeMetrics && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 mb-1.5">
                          Quantitative Verification
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {activePhase.quantitativeMetrics.map((metric, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold mb-0.5">
                                <span>{metric.label}</span>
                                {metric.badge && (
                                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-slate-800 text-slate-300">
                                    {metric.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-mono font-black text-white">
                                {metric.value}
                              </div>
                              {metric.sub && (
                                <div className="text-[9.5px] text-emerald-400/90 font-medium">
                                  {metric.sub}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analytical Proof Box */}
                    <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                      <div className="text-[9.5px] uppercase tracking-wider font-extrabold text-emerald-400 mb-0.5">
                        Spectroscopic / Lab Metrology Proof
                      </div>
                      <div className="text-slate-200 text-[11px] leading-snug font-medium">
                        {activePhase.analyticalEvidence}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Detailed Atomic Mechanism */}
                {presentationTab === 'mechanism' && (
                  <div className="space-y-2.5 text-[11px] leading-relaxed">
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400 mb-0.5">
                        Formation Observation
                      </div>
                      <div className="text-slate-200">{activePhase.whatYouSee}</div>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                      <div className="text-[9.5px] uppercase tracking-wider font-extrabold text-cyan-400 mb-0.5">
                        Chemical & Electronic Mechanism
                      </div>
                      <div className="text-slate-300 text-[10.5px]">
                        {activePhase.chemicalMechanism}
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[9.5px] uppercase tracking-wider font-extrabold text-emerald-400 mb-0.5">
                        Composite Stability & Synergy
                      </div>
                      <div className="text-slate-400 text-[10.5px]">
                        {activePhase.compositeSignificance}
                      </div>
                    </div>
                  </div>
                )}

                {/* Angle Framing and Steady Indicator */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Framing: {MINIMAL_ANGLES[activePhase.cameraAngle].shortLabel}</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-[10px]">
                    Sub-Angstrom Registry
                  </span>
                </div>
              </div>
            ) : (
              /* Minimized Floating Button to Reopen Deck */
              <button
                onClick={() => setShowSpeakerDeck(true)}
                className="absolute top-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-amber-300 hover:text-white hover:border-amber-500/50 shadow-xl flex items-center gap-1.5 pointer-events-auto cursor-pointer"
                title="Expand ISEF Judge Defense Deck (Press P)"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Show Panel Deck (P)</span>
              </button>
            )
          )}

          {/* In-Canvas Floating Stage HUD & Microscopic Feature Callouts for Presentation */}
          {!isCleanScreen && (
            <>
              {/* Top-Left Floating Stage Badge & Live Countdown */}
              <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/70 text-slate-200 shadow-2xl flex flex-col gap-1 max-w-xs sm:max-w-sm pointer-events-none">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: activePhase.color }}
                    />
                    <span
                      className="text-[10px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${activePhase.color}25`,
                        color: activePhase.color,
                        border: `1px solid ${activePhase.color}60`,
                      }}
                    >
                      Stage {activePhase.id} / {FORMATION_PHASES.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {Math.min(100, Math.max(0, ((currentTime - activePhase.startTime) / activePhase.duration) * 100)).toFixed(0)}% Complete
                  </span>
                </div>
                <div className="text-xs font-black text-white leading-tight">
                  {activePhase.title.replace(/^Stage \d+:\s*/, '')}
                </div>
                <div className="text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                  <span>{activePhase.bondLength}</span>
                  <span className="text-slate-400 font-normal">
                    {Math.max(0, activePhase.endTime - currentTime).toFixed(1)}s left
                  </span>
                </div>
                {/* Live Stage Mini Progress Fill */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full transition-all duration-75"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((currentTime - activePhase.startTime) / activePhase.duration) * 100))}%`,
                      backgroundColor: activePhase.color,
                    }}
                  />
                </div>
              </div>

              {/* Dynamic In-Canvas Floating Badges Callouts specific to each stage */}
              {showCallouts && (
                <div className="absolute top-20 left-4 z-10 hidden sm:flex flex-col gap-1.5 pointer-events-none max-w-xs animate-in fade-in duration-300">
                  {activePhase.id === 1 && (
                    <>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>ZnO Wurtzite Cluster (146.95 nm)</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          Acoustic cavitation descent from 8.5 Å to 1.43 Å
                        </p>
                      </div>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>5-Layer GNP Scaffold (61.27 at% C)</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          Wrinkled sp² carbon prevents irreversible restacking
                        </p>
                      </div>
                    </>
                  )}

                  {activePhase.id === 2 && (
                    <>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-rose-500/60 text-rose-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          <span>16 Covalent Zn-O-C Bridges (1.430 Å)</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          1.430 Å C-O covalent pinning • 1.850 Å Zn-O coordination
                        </p>
                      </div>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Solid-State Chemisorption at 300°C</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          Eliminates Schottky resistance • Permanent anchoring
                        </p>
                      </div>
                    </>
                  )}

                  {activePhase.id === 3 && (
                    <>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-teal-500/60 text-teal-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-teal-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          <span>Graphene Edge O-Anchors (1.428 Å)</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          Passivates reactive edge carbons into ether/hydroxyl
                        </p>
                      </div>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-rose-500/50 text-rose-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                          <span>14 Catalytic Oxygen Vacancies (V_O)</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          Uncoordinated Zn²⁺ active catalytic sites exposed
                        </p>
                      </div>
                    </>
                  )}

                  {activePhase.id === 4 && (
                    <>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-cyan-500/60 text-cyan-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>Ballistic Electron Highway</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          τ_avg = 7.9 ns (+558% Extension) • 84.7% Recombination Suppressed
                        </p>
                      </div>
                      <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-200 shadow-lg text-[10.5px]">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Complete Heterojunction Twin</span>
                        </div>
                        <p className="text-[9.5px] text-slate-300 font-mono mt-0.5">
                          1,060 Atoms • 16 Zn-O-C Bridges • 14 V_O Defects
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Elaborative Presenter Teleprompter & Live Subtitle Ribbon (Prominent presentation narration at bottom-center of canvas) */}
          {!isCleanScreen && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-5xl bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-3 sm:p-4 shadow-2xl pointer-events-auto transition-all select-none">
              {/* Header with Stage Badge, Time, and Teleprompter View Tabs */}
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: `${activePhase.color}25`,
                      color: activePhase.color,
                      border: `1px solid ${activePhase.color}77`,
                    }}
                  >
                    Stage {activePhase.id}: {activePhase.title.replace(/^Stage \d+:\s*/, '')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-bold hidden sm:inline">
                    {formatSeconds(activePhase.startTime)} – {formatSeconds(activePhase.endTime)}
                  </span>
                </div>

                {/* Elaborative Ribbon Mode Tabs (Script vs Reactions vs Metrology) */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700/80 text-[11px]">
                    <button
                      onClick={() => setNarrativeTab('script')}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        narrativeTab === 'script'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      title="Large presenter spoken narration script for panel defense"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Speaker Script</span>
                    </button>
                    <button
                      onClick={() => setNarrativeTab('reactions')}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        narrativeTab === 'reactions'
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      title="Step-by-step microscopic atomic reactions and bond lengths"
                    >
                      <Atom className="w-3 h-3" />
                      <span>Atomic Steps</span>
                    </button>
                    <button
                      onClick={() => setNarrativeTab('metrology')}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        narrativeTab === 'metrology'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      title="Empirical laboratory validation (XRD, XPS, TEM, TRPL)"
                    >
                      <Microscope className="w-3 h-3" />
                      <span>Lab Proof</span>
                    </button>
                  </div>

                  {/* Speaker Deck Sidebar Toggle */}
                  <button
                    onClick={() => setShowSpeakerDeck((prev) => !prev)}
                    className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 cursor-pointer hidden md:flex"
                    title="Toggle ISEF Judge Panel Notes (Press P)"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showSpeakerDeck ? 'Hide Notes' : 'Show Notes (P)'}</span>
                  </button>
                </div>
              </div>

              {/* Elaborative Tab 1: Spoken Presenter Script with High-Legibility Keywords */}
              {narrativeTab === 'script' && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs sm:text-sm md:text-[15px] font-medium text-slate-100 leading-snug sm:leading-relaxed">
                    {activePhase.id === 1 && (
                      <>
                        "Honorable judges, our synthesis begins with ultrasonic shear forces exfoliating{' '}
                        <span className="font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/40">5-layer graphene nanoplatelets</span> (61.27 at% Carbon). Pre-crystallized{' '}
                        <span className="font-bold text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/40">wurtzite ZnO nanoparticles (146.95 nm)</span> descend under acoustic cavitation and conform intimately to the wrinkled carbon substrate without restacking."
                      </>
                    )}
                    {activePhase.id === 2 && (
                      <>
                        "Upon 300°C thermal activation, our solid-state chemisorption forms{' '}
                        <span className="font-bold text-rose-400 bg-rose-950/60 px-1 py-0.5 rounded border border-rose-500/40">16 covalent Zn-O-C chemical bridges</span> across a precise{' '}
                        <span className="font-bold text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-500/40">1.430 Å C-O gap</span> and 1.850 Å Zn-O coordination. These bonds permanently anchor the nanoparticle and{' '}
                        <span className="font-bold text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/40">eliminate the Schottky contact resistance barrier</span>."
                      </>
                    )}
                    {activePhase.id === 3 && (
                      <>
                        "Concurrent with interfacial pinning, oxygen atoms passivate reactive graphene edges into{' '}
                        <span className="font-bold text-teal-300 bg-teal-950/60 px-1 py-0.5 rounded border border-teal-500/40">1.428 Å C-O anchors</span>, while creating{' '}
                        <span className="font-bold text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/40">14 catalytic surface oxygen vacancies (V_O sites)</span>. These sub-stoichiometric defects expose active Zn²⁺ centers that double organic pollutant adsorption."
                      </>
                    )}
                    {activePhase.id === 4 && (
                      <>
                        "Here is the finalized nanocomposite digital twin: 1,060 atoms and 16 quantum bridges. Under solar excitation, photoelectrons inject ballistically from ZnO into graphene via the 16 bridges in{' '}
                        <span className="font-bold text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-500/40">0.35 ns</span>, extending average carrier lifetime to{' '}
                        <span className="font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/40">7.9 ns (+558%)</span> and suppressing charge recombination by 84.7%."
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Elaborative Tab 2: Detailed Atomic Reaction Steps & Distances */}
              {narrativeTab === 'reactions' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {activePhase.id === 1 && (
                    <>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-amber-300 text-[11px] mb-0.5">1. Pre-Bonded ZnO Core</div>
                        <p className="text-slate-300 text-[10.5px]">1:1 Stoichiometric wurtzite Zn-O bonds (1.980 Å) intact along [0001] c-axis polar growth facet.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-emerald-300 text-[11px] mb-0.5">2. 5-Layer Exfoliation</div>
                        <p className="text-slate-300 text-[10.5px]">Turbostratic graphite sheets separated to 3.35 Å interlayer d-spacing; 61.27 at% sp² carbon.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-cyan-300 text-[11px] mb-0.5">3. Acoustic Cavitation</div>
                        <p className="text-slate-300 text-[10.5px]">Nanoparticles descend from 8.5 Å to 1.43 Å, seating into wrinkles without agglomeration.</p>
                      </div>
                    </>
                  )}
                  {activePhase.id === 2 && (
                    <>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-rose-300 text-[11px] mb-0.5">1. Interfacial C-O Pinning</div>
                        <p className="text-slate-300 text-[10.5px]">Thermal activation at 300°C drives 16 bridging oxygens into 1.430 Å covalent bonds with basal carbon.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-cyan-300 text-[11px] mb-0.5">2. Zn-O Coordination</div>
                        <p className="text-slate-300 text-[10.5px]">Zn²⁺ atoms from the basal facet coordinate at 1.850 Å, completing the ternary Zn-O-C quantum bridge.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-emerald-300 text-[11px] mb-0.5">3. Barrier-Free Conduit</div>
                        <p className="text-slate-300 text-[10.5px]">Eliminates Schottky barrier; forms 0.35 ns ultrafast electron injection highway into the graphene sheet.</p>
                      </div>
                    </>
                  )}
                  {activePhase.id === 3 && (
                    <>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-teal-300 text-[11px] mb-0.5">1. Edge Carbon Passivation</div>
                        <p className="text-slate-300 text-[10.5px]">Peripheral oxygen and hydroxyl groups dock at 1.428 Å, preventing carbon edge degradation.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-amber-300 text-[11px] mb-0.5">2. 14 Oxygen Vacancies (V_O)</div>
                        <p className="text-slate-300 text-[10.5px]">Sub-stoichiometric surface annealing removes 14 lattice oxygens, exposing catalytic Zn²⁺ sites.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-rose-300 text-[11px] mb-0.5">3. Radical Generation Center</div>
                        <p className="text-slate-300 text-[10.5px]">Defect sites trap photogenerated holes, catalyzing continuous •OH and •O₂⁻ reactive radical generation.</p>
                      </div>
                    </>
                  )}
                  {activePhase.id === 4 && (
                    <>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-cyan-300 text-[11px] mb-0.5">1. Ballistic Charge Injection</div>
                        <p className="text-slate-300 text-[10.5px]">Photoelectrons cross the 16 Zn-O-C bridges in 0.35 ns, escaping electron-hole recombination.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-emerald-300 text-[11px] mb-0.5">2. Lifetime Extension (+558%)</div>
                        <p className="text-slate-300 text-[10.5px]">Average carrier lifetime reaches 7.9 ns (vs 1.2 ns pure ZnO), proven by TRPL biexponential fitting.</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-amber-300 text-[11px] mb-0.5">3. Photocatalytic Longevity</div>
                        <p className="text-slate-300 text-[10.5px]">Nanoparticles remain locked under 10+ operational cycles without leeching or catalytic degradation.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Elaborative Tab 3: Empirical Laboratory Metrology Proof Cards */}
              {narrativeTab === 'metrology' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">X-Ray Diffraction</span>
                    <span className="text-xs font-black text-emerald-300 mt-0.5">XRD (002) Broadening</span>
                    <span className="text-[10px] text-slate-300 mt-0.5">Confirms 5-layer exfoliation &amp; wurtzite P63mc lattice</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">XPS Core Levels</span>
                    <span className="text-xs font-black text-rose-300 mt-0.5">531.4 eV (C-O-Zn)</span>
                    <span className="text-[10px] text-slate-300 mt-0.5">Direct spectroscopic proof of covalent Zn-O-C bridge</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Carrier Lifetime</span>
                    <span className="text-xs font-black text-cyan-300 mt-0.5">τ_avg = 7.9 ns</span>
                    <span className="text-[10px] text-slate-300 mt-0.5">TRPL biexponential: +558% extension vs 1.2 ns ZnO</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Electron Microscopy</span>
                    <span className="text-xs font-black text-amber-300 mt-0.5">TEM 146.95 nm</span>
                    <span className="text-[10px] text-slate-300 mt-0.5">Uniform crystal dispersion with 0.38% error</span>
                  </div>
                </div>
              )}

              {/* Bottom Teleprompter Control Footer */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[10.5px]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-bold">Empirical Evidence:</span>
                  <span className="text-slate-400">{activePhase.analyticalEvidence}</span>
                </div>
                <div className="text-cyan-300 font-mono text-[9.5px] hidden sm:flex items-center gap-2">
                  <span>Keys: [1-4] Jump Stage • [Space] Play/Pause • [F] Fullscreen • [P] Speaker Notes</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Floating Angle Indicator (Bottom Left) */}
          {!isCleanScreen && (
            <div className="absolute bottom-32 left-4 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Camera:</span>
              <span className="text-cyan-300 font-medium">
                {angleMode === 'auto'
                  ? `Auto Minimal (${MINIMAL_ANGLES[activePhase.cameraAngle].shortLabel})`
                  : MINIMAL_ANGLES[angleMode].label}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Playback & Scrubber Controls Bar (Hidden in Clean Screen Mode) */}
        {!isCleanScreen && (
          <footer className="bg-slate-900/95 border-t border-slate-800 p-2.5 sm:px-5 flex flex-col gap-2 shrink-0 z-20">
            {/* Interactive 4-Stage Stepper for Fast Panel Navigation (Click or Keys 1-4) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
              {FORMATION_PHASES.map((p) => {
                const isActive = activePhase.id === p.id;
                const isPast = currentTime > p.endTime;
                return (
                  <button
                    key={p.id}
                    onClick={() => jumpToStage(p.id)}
                    className={`py-1.5 px-2 sm:px-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                      isActive
                        ? 'bg-slate-900/95 border-emerald-400 shadow-md ring-1 ring-emerald-400/40 text-white'
                        : isPast
                        ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-900/80 hover:text-white'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                    title={`Jump directly to Stage ${p.id}: ${p.title} (Press ${p.id})`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {p.id}
                      </span>
                      <div className="truncate">
                        <div className={`text-[11px] font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {p.id === 1 && '1. Arrival & Descent'}
                          {p.id === 2 && '2. 16 Zn-O-C Bridges'}
                          {p.id === 3 && '3. O-Anchors & 14 Defects'}
                          {p.id === 4 && '4. Ballistic Twin'}
                        </div>
                        <div className="text-[9.5px] font-mono text-slate-400 truncate">
                          {formatSeconds(p.startTime)}–{formatSeconds(p.endTime)} • {p.id === 2 ? '1.430 Å C-O' : p.id === 4 ? 'τ = 7.9 ns' : p.bondLength.split('•')[0]}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 hidden sm:inline-block" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scrubber Progress Bar with 4 Color-Coded Phase Blocks */}
            <div className="flex flex-col gap-1">
              <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 cursor-pointer group">
                {/* Phase Segments Background Colors */}
                <div className="absolute inset-0 flex">
                  {FORMATION_PHASES.map((p) => {
                    const widthPct = (p.duration / TOTAL_FORMATION_DURATION) * 100;
                    return (
                      <div
                        key={p.id}
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: `${p.color}33`,
                          borderRight: '1px solid rgba(2,6,23,0.8)',
                        }}
                        title={`${p.title} (${p.startTime}s - ${p.endTime}s)`}
                        className="h-full hover:opacity-80 transition-opacity"
                        onClick={() => jumpToStage(p.id)}
                      />
                    );
                  })}
                </div>

                {/* Filled Progress Bar */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-rose-500 to-cyan-400 transition-all pointer-events-none"
                  style={{ width: `${(currentTime / TOTAL_FORMATION_DURATION) * 100}%` }}
                />

                {/* Scrubber Thumb */}
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-lg -ml-1.5 pointer-events-none transition-all"
                  style={{ left: `${(currentTime / TOTAL_FORMATION_DURATION) * 100}%` }}
                />

                {/* Actual Range Input for Smooth Scrubbing */}
                <input
                  type="range"
                  min={0}
                  max={TOTAL_FORMATION_DURATION}
                  step={0.05}
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    currentTimeRef.current = val;
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Chapter Labels below progress bar */}
              <div className="hidden sm:flex justify-between text-[9px] font-mono text-slate-400 px-0.5">
                {FORMATION_PHASES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentTime(p.startTime + 0.05);
                      currentTimeRef.current = p.startTime + 0.05;
                    }}
                    className="hover:text-white transition-colors"
                  >
                    <span style={{ color: p.color }}>P{p.id}:</span> {p.bondLength}
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Play/Pause, Skip, Time Counter */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (currentTime >= TOTAL_FORMATION_DURATION) {
                      setCurrentTime(0);
                      currentTimeRef.current = 0;
                      setIsPlaying(true);
                      isPlayingRef.current = true;
                    } else {
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-xs px-3"
                  title={isPlaying ? 'Pause Formation (Space)' : 'Play Formation (Space)'}
                >
                  {currentTime >= TOTAL_FORMATION_DURATION ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Replay Simulation</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => skipPhase(-1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs flex items-center gap-1"
                  title="Previous Phase (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Prev Phase</span>
                </button>

                <button
                  onClick={() => skipPhase(1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs flex items-center gap-1"
                  title="Next Phase (Right Arrow)"
                >
                  <span className="hidden md:inline">Next Phase</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setCurrentTime(0);
                    currentTimeRef.current = 0;
                    setIsPlaying(true);
                  }}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
                  title="Restart from 0:00"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Digital Time Display */}
                <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs flex items-center gap-1">
                  <span className="text-white font-bold">{formatSeconds(currentTime)}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">{formatSeconds(TOTAL_FORMATION_DURATION)}</span>
                </div>

                {currentTime >= 9.8 && (
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>3D Atomic Digital Twin (1,060 Atoms • 16 Bridges • 14 Defects)</span>
                  </div>
                )}
              </div>

              {/* Center: Minimal Angles Switcher for Mobile / Small Screens */}
              <div className="flex lg:hidden items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
                <button
                  onClick={() => setAngleMode('auto')}
                  className={`px-2 py-0.5 rounded-lg ${angleMode === 'auto' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Auto
                </button>
                <button
                  onClick={() => setAngleMode('side')}
                  className={`px-2 py-0.5 rounded-lg ${angleMode === 'side' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Side
                </button>
                <button
                  onClick={() => setAngleMode('topdown')}
                  className={`px-2 py-0.5 rounded-lg ${angleMode === 'topdown' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Top
                </button>
                <button
                  onClick={() => setAngleMode('macro')}
                  className={`px-2 py-0.5 rounded-lg ${angleMode === 'macro' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Macro
                </button>
                <button
                  onClick={() => setAngleMode('isometric')}
                  className={`px-2 py-0.5 rounded-lg ${angleMode === 'isometric' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Twin
                </button>
              </div>

              {/* Right: Speed, Loop, and Video Status */}
              <div className="flex items-center gap-2">
                {/* Speed selector (Locked to 1.5x during HD recording) */}
                {isRecording ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-[10px] font-mono font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>1.5x Speed (Locked for HD Recording)</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setPlaybackSpeed(s);
                          playbackSpeedRef.current = s;
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                          playbackSpeed === s
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title={s === 1.0 ? '1.0x (Optimal Deliberate Speed for Panel Presentation)' : `${s}x Speed`}
                      >
                        {s === 1.0 ? '1.0x (Panel)' : `${s}x`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Auto Loop Toggle */}
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isLooping
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title="Toggle Simulation Loop"
                >
                  Loop: {isLooping ? 'ON' : 'OFF'}
                </button>

                {/* Callouts Overlay Toggle */}
                <button
                  onClick={() => setShowCallouts((prev) => !prev)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer hidden sm:flex items-center gap-1 ${
                    showCallouts
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                  title="Toggle 3D Callout annotations"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Callouts</span>
                </button>

                {/* Fullscreen Quick Button in Footer */}
                <button
                  onClick={toggleFullscreen}
                  className={`p-1.5 rounded-xl text-xs border transition-all cursor-pointer flex items-center gap-1 ${
                    isFullscreen
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                  title={isFullscreen ? 'Exit Full Screen (F)' : 'Full Screen (F)'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
