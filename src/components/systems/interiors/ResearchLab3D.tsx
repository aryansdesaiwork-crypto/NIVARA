import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  FlaskConical,
  Activity,
  Zap,
  Radio,
  Sparkles,
  Thermometer,
  ShieldCheck,
  Eye,
  X
} from 'lucide-react';

export type LabCameraPreset = 'overview' | 'lidar' | 'magnetometer' | 'cryo' | 'seismometer';

export interface ResearchLabSimState {
  isLidarActive: boolean;
  geomagneticStormActive: boolean;
  cryoLeak: boolean;
  cryoTempC: number;
  geomagneticPerturbationNt: number;
}

interface ResearchLab3DProps {
  simulationState: ResearchLabSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
}

export const ResearchLab3D: React.FC<ResearchLab3DProps> = ({
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

  const laserBeamRef = useRef<THREE.Mesh | null>(null);
  const aerosolParticlesRef = useRef<THREE.Points | null>(null);
  const cryoVaporRef = useRef<THREE.Points | null>(null);
  const magNeedleRef = useRef<THREE.Mesh | null>(null);

  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const setCameraPreset = (preset: LabCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 1.8, 0);
    if (preset === 'overview') {
      camera.position.set(13, 11, 14);
    } else if (preset === 'lidar') {
      controls.target.set(0, 1.8, 0);
      camera.position.set(0, 3.8, 5.5);
    } else if (preset === 'magnetometer') {
      controls.target.set(-5, 1.8, -2);
      camera.position.set(-5, 3.2, 3.5);
    } else if (preset === 'cryo') {
      controls.target.set(5.5, 1.8, -2);
      camera.position.set(5.5, 3.5, 3.5);
    } else if (preset === 'seismometer') {
      controls.target.set(-4.5, 0.8, 4);
      camera.position.set(-4.5, 2.5, 8.0);
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

    // Lights - Bright scientific cleanroom illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.8, 25, Math.PI / 3, 0.4);
    spotLight.position.set(0, 14, 8);
    scene.add(spotLight);

    // Floor (Cleanroom ESD epoxy flooring) - Crisp light grey-blue epoxy
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
      new THREE.MeshStandardMaterial({ color: 0xe2ebf5, roughness: 0.35, metalness: 0.1 })
    );
    floor.rotateX(-Math.PI / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Cleanroom grid floor lines
    const grid = new THREE.GridHelper(24, 24, 0x94a3b8, 0xcfdceb);
    grid.position.y = 0.01;
    scene.add(grid);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x090e1a, roughness: 0.8 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 6, 0.4), wallMat);
    backWall.position.set(0, 3, -10);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 20), wallMat);
    leftWall.position.set(-12, 3, 0);
    scene.add(leftWall);

    interactiveObjectsRef.current.clear();

    // =========================================================================
    // 1. CENTER: 532nm OPTICAL LIDAR TABLE & ROOF DOME SKYLIGHT
    // =========================================================================
    const lidarGroup = new THREE.Group();
    lidarGroup.position.set(0, 0, 0);
    scene.add(lidarGroup);
    const lidarClickables: THREE.Object3D[] = [];

    // Heavy granite optical isolation breadboard table
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.4, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    tableTop.position.y = 1.0;
    tableTop.castShadow = true;
    lidarGroup.add(tableTop);
    lidarClickables.push(tableTop);

    // Table legs
    for (const lx of [-2.0, 2.0]) {
      for (const lz of [-1.0, 1.0]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
        leg.position.set(lx, 0.5, lz);
        lidarGroup.add(leg);
      }
    }

    // Laser Emitter Housing (Nd:YAG frequency-doubled green laser head)
    const laserHead = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 })
    );
    laserHead.position.set(0, 1.45, 0);
    lidarGroup.add(laserHead);
    lidarClickables.push(laserHead);

    // Turning Mirror & Beam Expander Telescope
    const telescope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.2, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
    );
    telescope.position.set(0, 1.9, 0);
    lidarGroup.add(telescope);

    // Skylight Dome Aperture in ceiling
    const domeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.12, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
    );
    domeRing.position.set(0, 5.8, 0);
    domeRing.rotateX(Math.PI / 2);
    lidarGroup.add(domeRing);

    // Glowing 532nm Green Laser Beam shooting vertically
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.12, 8.0, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const laserBeam = new THREE.Mesh(beamGeo, beamMat);
    laserBeam.position.set(0, 5.5, 0);
    lidarGroup.add(laserBeam);
    laserBeamRef.current = laserBeam;

    interactiveObjectsRef.current.set('lidar', lidarClickables);

    // =========================================================================
    // 2. LEFT: 3-AXIS FLUXGATE MAGNETOMETER & AURORAL SENSOR RACK
    // =========================================================================
    const magGroup = new THREE.Group();
    magGroup.position.set(-6, 0, -4);
    scene.add(magGroup);
    const magClickables: THREE.Object3D[] = [];

    // Equipment 19-inch Instrument Rack
    const magRack = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 3.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 })
    );
    magRack.position.y = 1.7;
    magRack.castShadow = true;
    magGroup.add(magRack);
    magClickables.push(magRack);

    // Modular instrument faceplates
    for (let slot = 0; slot < 4; slot++) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.6, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
      );
      plate.position.set(0, slot * 0.7 + 0.6, 0.62);
      magGroup.add(plate);

      // Status LEDs
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      led.position.set(-0.8, slot * 0.7 + 0.6, 0.66);
      magGroup.add(led);
    }

    // Magnetometer dial needle
    const dialMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    dialMesh.position.set(0.5, 2.0, 0.66);
    magGroup.add(dialMesh);
    magNeedleRef.current = dialMesh;

    interactiveObjectsRef.current.set('magnetometer', magClickables);

    // =========================================================================
    // 3. RIGHT: CRYOGENIC ICE CORE STORAGE VAULT (-80°C)
    // =========================================================================
    const cryoGroup = new THREE.Group();
    cryoGroup.position.set(6, 0, -4);
    scene.add(cryoGroup);
    const cryoClickables: THREE.Object3D[] = [];

    // Twin High-Vacuum Cylindrical Cryo Freezers
    for (let c = 0; c < 2; c++) {
      const cryoTank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 2.8, 24),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
      );
      cryoTank.position.set(c * 2.0 - 1.0, 1.4, 0);
      cryoTank.castShadow = true;
      cryoGroup.add(cryoTank);
      cryoClickables.push(cryoTank);

      // Frost Glass Inspection Window
      const windowMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.81, 0.81, 0.5, 24, 1, true, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
      );
      windowMesh.position.set(c * 2.0 - 1.0, 1.6, 0);
      cryoGroup.add(windowMesh);

      // Pressure relief valve & digital display
      const disp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.05), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      disp.position.set(c * 2.0 - 1.0, 2.4, 0.82);
      cryoGroup.add(disp);
    }

    interactiveObjectsRef.current.set('cryo', cryoClickables);

    // =========================================================================
    // 4. FRONT-LEFT: SEISMOMETER BEDROCK VIBRATION PLINTH
    // =========================================================================
    const seisGroup = new THREE.Group();
    seisGroup.position.set(-6, 0, 4);
    scene.add(seisGroup);
    const seisClickables: THREE.Object3D[] = [];

    // Granite Seismic Isolated Pier (Anchored into permafrost)
    const pier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.1, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    );
    pier.position.y = 0.3;
    seisGroup.add(pier);
    seisClickables.push(pier);

    // Glass Bell Jar Dome over sensor
    const bellJar = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.45, roughness: 0.1 })
    );
    bellJar.position.y = 0.6;
    seisGroup.add(bellJar);
    seisClickables.push(bellJar);

    // Seismometer sensor core inside jar
    const sensorCore = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.45, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 })
    );
    sensorCore.position.y = 0.8;
    seisGroup.add(sensorCore);

    interactiveObjectsRef.current.set('seismometer', seisClickables);

    // =========================================================================
    // 5. FRONT-RIGHT: MASS SPECTROMETER & CLEAN AIR SAMPLING SKID
    // =========================================================================
    const specGroup = new THREE.Group();
    specGroup.position.set(6, 0, 4);
    scene.add(specGroup);
    const specClickables: THREE.Object3D[] = [];

    // Mass Spec Bench
    const specBench = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.2, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 })
    );
    specBench.position.y = 0.6;
    specGroup.add(specBench);
    specClickables.push(specBench);

    // Spec analyzer module
    const specModule = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.0, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
    );
    specModule.position.set(0, 1.7, 0);
    specGroup.add(specModule);
    specClickables.push(specModule);

    // Clean air stainless steel tube manifold
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    tube.position.set(-1.2, 2.4, 0);
    specGroup.add(tube);

    interactiveObjectsRef.current.set('air-sample', specClickables);

    // =========================================================================
    // 6. CRYOGENIC VAPOR & AEROSOL PARTICLES
    // =========================================================================
    // Cryo Vapor
    const vaporCount = 120;
    const vaporGeo = new THREE.BufferGeometry();
    const vaporPos = new Float32Array(vaporCount * 3);
    for (let i = 0; i < vaporCount; i++) {
      vaporPos[i * 3] = (Math.random() - 0.5) * 2.5 + 6;
      vaporPos[i * 3 + 1] = Math.random() * 2.0 + 0.3;
      vaporPos[i * 3 + 2] = (Math.random() - 0.5) * 2.0 - 4;
    }
    vaporGeo.setAttribute('position', new THREE.BufferAttribute(vaporPos, 3));
    const vaporMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.2,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const cryoVapor = new THREE.Points(vaporGeo, vaporMat);
    scene.add(cryoVapor);
    cryoVaporRef.current = cryoVapor;

    // Atmospheric Aerosol backscatter particles
    const aerosolCount = 160;
    const aerGeo = new THREE.BufferGeometry();
    const aerPos = new Float32Array(aerosolCount * 3);
    for (let i = 0; i < aerosolCount; i++) {
      aerPos[i * 3] = (Math.random() - 0.5) * 0.4;
      aerPos[i * 3 + 1] = Math.random() * 7.5 + 2.0;
      aerPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    aerGeo.setAttribute('position', new THREE.BufferAttribute(aerPos, 3));
    const aerMat = new THREE.PointsMaterial({
      color: 0x4ade80,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const aerosolParticles = new THREE.Points(aerGeo, aerMat);
    scene.add(aerosolParticles);
    aerosolParticlesRef.current = aerosolParticles;

    // Raycaster
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
      const time = clock.getElapsedTime();

      controls.update();

      // Pulsing laser beam
      if (laserBeamRef.current) {
        if (simulationState.isLidarActive) {
          laserBeamRef.current.visible = true;
          const scale = 1.0 + Math.sin(time * 15) * 0.15;
          laserBeamRef.current.scale.set(scale, 1.0, scale);
        } else {
          laserBeamRef.current.visible = false;
        }
      }

      // Aerosol particles motion
      if (aerosolParticlesRef.current && simulationState.isLidarActive) {
        const pos = aerosolParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < aerosolCount; i++) {
          pos[i * 3 + 1] += 0.05;
          if (pos[i * 3 + 1] > 9.5) pos[i * 3 + 1] = 2.0;
        }
        aerosolParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Cryo Vapor rise
      if (cryoVaporRef.current) {
        const vpos = cryoVaporRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < vaporCount; i++) {
          vpos[i * 3 + 1] += 0.015;
          if (vpos[i * 3 + 1] > 3.0) vpos[i * 3 + 1] = 0.3;
        }
        cryoVaporRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Magnetometer needle jitter
      if (magNeedleRef.current) {
        const jitter = simulationState.geomagneticStormActive
          ? Math.sin(time * 25) * 0.8
          : Math.sin(time * 3) * 0.1;
        magNeedleRef.current.rotation.z = jitter;
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

  return (
    <div className="relative w-full h-[560px] bg-[#060a14] rounded-3xl overflow-hidden border border-white/10 select-none shadow-2xl">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1220]/80 backdrop-blur-md border border-white/15 text-white shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-200">
            ATMOSPHERIC & GEOPHYSICAL LAB 3D INTERIOR
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-semibold">
            {simulationState.geomagneticStormActive ? 'GEOMAGNETIC STORM ALERT' : 'QUIET POLAR IONOSPHERE'}
          </span>
        </div>
      </div>

      {/* Camera Presets Dock */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-[#0B1220]/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl">
        <span className="text-[10px] font-mono uppercase text-slate-400 px-2 font-bold flex items-center gap-1">
          <Compass className="w-3 h-3 text-purple-400" />
          VIEW:
        </span>
        {(['overview', 'lidar', 'magnetometer', 'cryo', 'seismometer'] as const).map((preset) => (
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
        <div className="absolute bottom-6 left-6 z-20 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-purple-400/40 text-white text-xs font-mono shadow-xl pointer-events-none flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          <span>Click to inspect: <strong className="text-purple-300 uppercase">{hoveredEquipment}</strong></span>
        </div>
      )}

      {/* Selected Equipment Modal HUD */}
      {selectedEquipment && (
        <div className="absolute top-16 right-4 z-30 w-80 p-4 bg-[#0B1220]/95 backdrop-blur-xl rounded-2xl border border-purple-400/30 text-white shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold uppercase text-purple-200">
                {selectedEquipment === 'lidar' && '532nm Aerosol Lidar Sounder'}
                {selectedEquipment === 'magnetometer' && '3-Axis Fluxgate Magnetometer'}
                {selectedEquipment === 'cryo' && 'Cryogenic Polar Ice Vault'}
                {selectedEquipment === 'seismometer' && 'Broadband Bedrock Seismometer'}
                {selectedEquipment === 'air-sample' && 'Mass Spec Clean Air Manifold'}
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
              <span className="text-slate-400">Operating Status:</span>
              <span className="text-emerald-400 font-bold">ONLINE · RECORDING</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Cryo Core Temp:</span>
              <span className="text-cyan-300 font-bold">{simulationState.cryoTempC.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Magnetic Perturbation:</span>
              <span className={`font-bold ${simulationState.geomagneticStormActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {simulationState.geomagneticPerturbationNt.toFixed(1)} nT
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Laser Repetition:</span>
              <span className="text-emerald-400 font-bold">{simulationState.isLidarActive ? '20 Hz · 532nm' : 'STANDBY'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
