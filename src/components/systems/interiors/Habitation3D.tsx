import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Users,
  Activity,
  Heart,
  Thermometer,
  ShieldCheck,
  Moon,
  Sun,
  Wind,
  Sparkles,
  X
} from 'lucide-react';

export type HabitationCameraPreset = 'overview' | 'quarters' | 'galley' | 'medical' | 'scrubber';

export interface HabitationSimState {
  crewCount: number;
  co2Ppm: number;
  indoorTempC: number;
  nightMode: boolean;
  ventilationPurgeActive: boolean;
}

interface Habitation3DProps {
  simulationState: HabitationSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
}

export const Habitation3D: React.FC<Habitation3DProps> = ({
  simulationState,
  selectedEquipment,
  onSelectEquipment
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const airParticlesRef = useRef<THREE.Points | null>(null);
  const scrubberGlowRef = useRef<THREE.Mesh | null>(null);
  const medicalMonitorRef = useRef<THREE.Mesh | null>(null);

  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const setCameraPreset = (preset: HabitationCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 1.8, 0);
    if (preset === 'overview') {
      camera.position.set(13, 11, 14);
    } else if (preset === 'quarters') {
      controls.target.set(-5, 1.5, -2);
      camera.position.set(-5, 3.2, 4.5);
    } else if (preset === 'galley') {
      controls.target.set(4, 1.5, -2);
      camera.position.set(4, 3.5, 4.5);
    } else if (preset === 'medical') {
      controls.target.set(-4.5, 1.2, 4);
      camera.position.set(-4.5, 3.0, 9.5);
    } else if (preset === 'scrubber') {
      controls.target.set(4.5, 2.0, 4);
      camera.position.set(4.5, 3.8, 9.5);
    }
    controls.update();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f5fc);
    scene.fog = new THREE.FogExp2(0xf0f5fc, 0.008);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 160);
    camera.position.set(13, 11, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.target.set(0, 1.8, 0);
    controlsRef.current = controls;

    // Lights - Bright hygienic habitation illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.8, 30, Math.PI / 3, 0.3);
    spotLight.position.set(0, 14, 8);
    scene.add(spotLight);

    // Floor with modular carpet tiles and zoning lines
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
      new THREE.MeshStandardMaterial({ color: 0xe2ebf5, roughness: 0.5, metalness: 0.05 })
    );
    floor.rotateX(-Math.PI / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid Floor Decals
    const grid = new THREE.GridHelper(24, 24, 0x94a3b8, 0xcfdceb);
    grid.position.y = 0.01;
    scene.add(grid);

    // Back & Side Enclosure Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.2 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 5.5, 0.4), wallMat);
    backWall.position.set(0, 2.75, -10);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 20), wallMat);
    leftWall.position.set(-12, 2.75, 0);
    scene.add(leftWall);

    // Partition divide in the middle
    const partWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 14), wallMat);
    partWall.position.set(0, 2.0, -3);
    scene.add(partWall);

    interactiveObjectsRef.current.clear();

    // =========================================================================
    // 1. SLEEPING QUARTERS / PODS (Left Wing Back)
    // =========================================================================
    const quartersGroup = new THREE.Group();
    quartersGroup.position.set(-6, 0, -5);
    scene.add(quartersGroup);
    const quartersClickables: THREE.Object3D[] = [];

    // Pod housing structure (2-tier bunk units)
    for (let p = 0; p < 3; p++) {
      const podFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 3.2, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 })
      );
      podFrame.position.set(p * 2.8 - 2.8, 1.6, 0);
      podFrame.castShadow = true;
      quartersGroup.add(podFrame);
      quartersClickables.push(podFrame);

      // Bunk beds interior cavity (mattresses)
      const matTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.25, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      matTop.position.set(p * 2.8 - 2.8, 2.2, 0.1);
      quartersGroup.add(matTop);

      const matBottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.25, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      matBottom.position.set(p * 2.8 - 2.8, 0.7, 0.1);
      quartersGroup.add(matBottom);

      // Warm Reading Light Glow
      const glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfde047 })
      );
      glowMesh.position.set(p * 2.8 - 2.8 + 0.8, 2.5, 0.5);
      quartersGroup.add(glowMesh);
    }
    interactiveObjectsRef.current.set('quarters', quartersClickables);

    // =========================================================================
    // 2. MESS HALL & GALLEY (Right Wing Back)
    // =========================================================================
    const galleyGroup = new THREE.Group();
    galleyGroup.position.set(6, 0, -5);
    scene.add(galleyGroup);
    const galleyClickables: THREE.Object3D[] = [];

    // Long Dining Table
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.15, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.5 })
    );
    tableTop.position.set(0, 1.1, 0);
    tableTop.castShadow = true;
    galleyGroup.add(tableTop);
    galleyClickables.push(tableTop);

    // Table legs
    for (const tx of [-2.2, 2.2]) {
      for (const tz of [-0.6, 0.6]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        leg.position.set(tx, 0.55, tz);
        galleyGroup.add(leg);
      }
    }

    // Bench Seating on both sides
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    bench1.position.set(0, 0.6, 1.4);
    galleyGroup.add(bench1);
    galleyClickables.push(bench1);

    const bench2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    bench2.position.set(0, 0.6, -1.4);
    galleyGroup.add(bench2);

    // Food prep & Ration Locker Counter behind table
    const foodCounter = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 1.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 })
    );
    foodCounter.position.set(0, 0.7, -3.2);
    galleyGroup.add(foodCounter);
    galleyClickables.push(foodCounter);

    interactiveObjectsRef.current.set('galley', galleyClickables);

    // =========================================================================
    // 3. MEDICAL DISPENSARY & ICU COT (Left Wing Front)
    // =========================================================================
    const medicalGroup = new THREE.Group();
    medicalGroup.position.set(-6, 0, 3.5);
    scene.add(medicalGroup);
    const medicalClickables: THREE.Object3D[] = [];

    // Medical Examination Bed / Cot
    const bedBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.8, 3.0),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    bedBase.position.set(0, 0.5, 0);
    bedBase.castShadow = true;
    medicalGroup.add(bedBase);
    medicalClickables.push(bedBase);

    // Mattress Cushion
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.25, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.6 })
    );
    cushion.position.set(0, 1.0, 0);
    medicalGroup.add(cushion);

    // Vital Signs Monitor Stand
    const monitorPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    monitorPole.position.set(1.4, 1.1, 1.2);
    medicalGroup.add(monitorPole);

    const monitorScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.15),
      new THREE.MeshBasicMaterial({ color: 0x10b981 }) // Glowing ECG Green
    );
    monitorScreen.position.set(1.4, 2.0, 1.2);
    medicalGroup.add(monitorScreen);
    medicalMonitorRef.current = monitorScreen;
    medicalClickables.push(monitorScreen);

    // Oxygen Tank Rack
    const o2Rack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    o2Rack.position.set(-1.6, 0.8, -1.2);
    medicalGroup.add(o2Rack);
    medicalClickables.push(o2Rack);

    // 2 Cylinders
    for (let c = 0; c < 2; c++) {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.4, 12), new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.6 }));
      cyl.position.set(-1.6 + c * 0.6 - 0.3, 0.9, -1.2);
      medicalGroup.add(cyl);
    }

    interactiveObjectsRef.current.set('medical', medicalClickables);

    // =========================================================================
    // 4. AIR LIFE SUPPORT & CO2 SCRUBBER (Right Wing Front)
    // =========================================================================
    const scrubberGroup = new THREE.Group();
    scrubberGroup.position.set(6, 0, 3.5);
    scene.add(scrubberGroup);
    const scrubberClickables: THREE.Object3D[] = [];

    // Twin CO2 Molecular Sieve Columns
    for (let col = 0; col < 2; col++) {
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 3.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x4338ca, metalness: 0.7, roughness: 0.25 })
      );
      column.position.set(col * 1.8 - 0.9, 1.7, 0);
      column.castShadow = true;
      scrubberGroup.add(column);
      scrubberClickables.push(column);

      // Status indicator ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.05, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x6366f1 })
      );
      ring.position.set(col * 1.8 - 0.9, 2.8, 0);
      ring.rotateX(Math.PI / 2);
      scrubberGroup.add(ring);
    }

    // HEPA Air Recirculation Blower
    const blower = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.8, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
    );
    blower.position.set(0, 0.4, 0);
    scrubberGroup.add(blower);
    scrubberClickables.push(blower);

    // Scrubber Core Status Light
    const statusLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    statusLight.position.set(0, 2.5, 0.7);
    scrubberGroup.add(statusLight);
    scrubberGlowRef.current = statusLight;

    interactiveObjectsRef.current.set('scrubber', scrubberClickables);

    // =========================================================================
    // 5. GYM & CARDIO ERGOMETER (Center)
    // =========================================================================
    const gymGroup = new THREE.Group();
    gymGroup.position.set(0, 0, 4.5);
    scene.add(gymGroup);
    const gymClickables: THREE.Object3D[] = [];

    // Antarctic Treadmill Deck
    const treadDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.2, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    treadDeck.position.set(0, 0.2, 0);
    gymGroup.add(treadDeck);
    gymClickables.push(treadDeck);

    // Console
    const treadPost = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    treadPost.position.set(0.5, 0.9, 1.1);
    gymGroup.add(treadPost);

    const treadScreen = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    treadScreen.position.set(0, 1.5, 1.1);
    gymGroup.add(treadScreen);

    interactiveObjectsRef.current.set('gym', gymClickables);

    // =========================================================================
    // 6. AIR CIRCULATION PARTICLES
    // =========================================================================
    const particleCount = 200;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 3.5 + 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.15,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const airParticles = new THREE.Points(partGeo, partMat);
    scene.add(airParticles);
    airParticlesRef.current = airParticles;

    // Raycaster for Hover & Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allObjects: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach((objs) => allObjects.push(...objs));

      const intersects = raycaster.intersectObjects(allObjects, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        let foundId: string | null = null;
        interactiveObjectsRef.current.forEach((objs, id) => {
          if (objs.includes(hit)) foundId = id;
        });
        setHoveredEquipment(foundId);
      } else {
        setHoveredEquipment(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allObjects: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach((objs) => allObjects.push(...objs));

      const intersects = raycaster.intersectObjects(allObjects, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        let foundId: string | null = null;
        interactiveObjectsRef.current.forEach((objs, id) => {
          if (objs.includes(hit)) foundId = id;
        });
        if (foundId) onSelectEquipment(foundId);
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Controls update
      controls.update();

      // Float air particles
      if (airParticlesRef.current) {
        const pos = airParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3 + 1] += Math.sin(time + i) * 0.003;
          pos[i * 3] += 0.015;
          if (pos[i * 3] > 10) pos[i * 3] = -10;
        }
        airParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Blink Scrubber Indicator
      if (scrubberGlowRef.current) {
        const mat = scrubberGlowRef.current.material as THREE.MeshBasicMaterial;
        mat.color.setHex(simulationState.co2Ppm > 700 ? 0xf59e0b : 0x38bdf8);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Update lighting on night mode toggle
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    if (simulationState.nightMode) {
      scene.background = new THREE.Color(0x04060c);
    } else {
      scene.background = new THREE.Color(0x070c18);
    }
  }, [simulationState.nightMode]);

  return (
    <div className="relative w-full h-[560px] bg-[#070c18] rounded-3xl overflow-hidden border border-white/10 select-none shadow-2xl">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1220]/80 backdrop-blur-md border border-white/15 text-white shadow-xl">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-indigo-200">
            HABITATION & LIFE SUPPORT 3D INTERIOR
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold">
            {simulationState.nightMode ? 'NIGHT CIRCADIAN MODE' : 'DAY CYCLE ACTIVE'}
          </span>
        </div>
      </div>

      {/* Camera Presets Dock */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-[#0B1220]/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl">
        <span className="text-[10px] font-mono uppercase text-slate-400 px-2 font-bold flex items-center gap-1">
          <Compass className="w-3 h-3 text-indigo-400" />
          VIEW:
        </span>
        {(['overview', 'quarters', 'galley', 'medical', 'scrubber'] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => setCameraPreset(preset)}
            className="px-2.5 py-1 text-[11px] font-mono uppercase font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Hover Info Tooltip */}
      {hoveredEquipment && (
        <div className="absolute bottom-6 left-6 z-20 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-indigo-400/40 text-white text-xs font-mono shadow-xl pointer-events-none flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          <span>Click to inspect: <strong className="text-indigo-300 uppercase">{hoveredEquipment}</strong></span>
        </div>
      )}

      {/* Selected Equipment Modal HUD */}
      {selectedEquipment && (
        <div className="absolute top-16 right-4 z-30 w-80 p-4 bg-[#0B1220]/95 backdrop-blur-xl rounded-2xl border border-indigo-400/30 text-white shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold uppercase text-indigo-200">
                {selectedEquipment === 'quarters' && 'Sleeping Quarters (Pods A1-A6)'}
                {selectedEquipment === 'galley' && 'Galley & Polar Mess Hall'}
                {selectedEquipment === 'medical' && 'Medical Dispensary & ICU Cot'}
                {selectedEquipment === 'scrubber' && 'CO2 Molecular Sieve Scrubber'}
                {selectedEquipment === 'gym' && 'Cardio Resistance Gym'}
              </span>
            </div>
            <button
              onClick={() => onSelectEquipment(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Atmospheric Temp:</span>
              <span className="text-emerald-400 font-bold">{simulationState.indoorTempC.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">CO2 Concentration:</span>
              <span className={`font-bold ${simulationState.co2Ppm > 700 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {simulationState.co2Ppm} ppm
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Station Occupancy:</span>
              <span className="text-white font-bold">{simulationState.crewCount} Personnel</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Air Turn-rate:</span>
              <span className="text-indigo-300 font-bold">
                {simulationState.ventilationPurgeActive ? '14.2 Air Changes/hr (Purge)' : '6.4 Air Changes/hr (Nominal)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
