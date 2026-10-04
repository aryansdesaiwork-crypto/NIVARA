import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Wrench,
  Activity,
  Flame,
  Gauge,
  Sliders,
  Sparkles,
  Zap,
  Truck,
  X
} from 'lucide-react';

export type MaintenanceCameraPreset = 'overview' | 'groomer' | 'crane' | 'lathe' | 'hydraulics';

export interface MaintenanceSimState {
  engineWarmupActive: boolean;
  hydraulicPressureBar: number;
  blockHeaterTempC: number;
  groomerStatus: 'standby' | 'warming' | 'ready' | 'servicing';
}

interface Maintenance3DProps {
  simulationState: MaintenanceSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
}

export const Maintenance3D: React.FC<Maintenance3DProps> = ({
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

  const groomerBeaconRef = useRef<THREE.Mesh | null>(null);
  const craneHookRef = useRef<THREE.Group | null>(null);
  const latheChuckRef = useRef<THREE.Mesh | null>(null);

  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const setCameraPreset = (preset: MaintenanceCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 1.8, 0);
    if (preset === 'overview') {
      camera.position.set(13, 11, 14);
    } else if (preset === 'groomer') {
      controls.target.set(-4.5, 1.5, 0);
      camera.position.set(-4.5, 3.2, 5.0);
    } else if (preset === 'crane') {
      controls.target.set(0, 4.0, 0);
      camera.position.set(0, 6.0, 8.0);
    } else if (preset === 'lathe') {
      controls.target.set(5.5, 1.4, -3);
      camera.position.set(5.5, 3.0, 2.5);
    } else if (preset === 'hydraulics') {
      controls.target.set(5.5, 1.4, 3.5);
      camera.position.set(5.5, 3.0, 8.5);
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

    // Lights - Bright industrial workshop illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.8, 30, Math.PI / 3, 0.35);
    spotLight.position.set(0, 14, 8);
    scene.add(spotLight);

    // Heavy Epoxy Workshop Floor with oil resistance - Crisp light grey-blue epoxy
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
      new THREE.MeshStandardMaterial({ color: 0xe2ebf5, roughness: 0.45, metalness: 0.1 })
    );
    floor.rotateX(-Math.PI / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Hazard Safety Striping on Floor
    const hazardMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
    const lineLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 16), hazardMat);
    lineLeft.rotateX(-Math.PI / 2);
    lineLeft.position.set(-1.0, 0.01, 0);
    scene.add(lineLeft);

    const lineRight = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 16), hazardMat);
    lineRight.rotateX(-Math.PI / 2);
    lineRight.position.set(-8.0, 0.01, 0);
    scene.add(lineRight);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 6, 0.4), wallMat);
    backWall.position.set(0, 3, -10);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 20), wallMat);
    leftWall.position.set(-12, 3, 0);
    scene.add(leftWall);

    interactiveObjectsRef.current.clear();

    // =========================================================================
    // 1. LEFT BAY: ANTARCTIC PISTENBULLY / SNOW GROOMER TRACK VEHICLE
    // =========================================================================
    const groomerGroup = new THREE.Group();
    groomerGroup.position.set(-4.5, 0, 0);
    scene.add(groomerGroup);
    const groomerClickables: THREE.Object3D[] = [];

    // Red Chasis Body
    const chasis = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.4, 4.8),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 })
    );
    chasis.position.y = 1.1;
    chasis.castShadow = true;
    groomerGroup.add(chasis);
    groomerClickables.push(chasis);

    // Operator Cab with tinted glass
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.2, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    cab.position.set(0, 2.3, 0.8);
    groomerGroup.add(cab);
    groomerClickables.push(cab);

    // Flashing Amber Beacon on Cab Roof
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    beacon.position.set(0, 3.0, 0.8);
    groomerGroup.add(beacon);
    groomerBeaconRef.current = beacon;

    // Heavy Caterpillar Tracks (Left & Right)
    for (const side of [-1.8, 1.8]) {
      const track = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 5.0),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
      );
      track.position.set(side, 0.4, 0);
      groomerGroup.add(track);

      // Track Drive Sprockets
      for (const spz of [-2.0, 0, 2.0]) {
        const sprocket = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.7, 12),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
        );
        sprocket.rotateZ(Math.PI / 2);
        sprocket.position.set(side, 0.4, spz);
        groomerGroup.add(sprocket);
      }
    }

    // Front Snowplow Dozer Blade
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.9, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 })
    );
    blade.position.set(0, 0.6, 2.8);
    blade.rotateX(0.15);
    groomerGroup.add(blade);
    groomerClickables.push(blade);

    interactiveObjectsRef.current.set('groomer', groomerClickables);

    // =========================================================================
    // 2. CEILING: OVERHEAD GANTRY CRANE & HOIST
    // =========================================================================
    const craneGroup = new THREE.Group();
    craneGroup.position.set(0, 5.2, 0);
    scene.add(craneGroup);
    const craneClickables: THREE.Object3D[] = [];

    // Yellow Steel I-Beam Gantry Bridge
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.7, roughness: 0.4 })
    );
    craneGroup.add(bridge);
    craneClickables.push(bridge);

    // Crane Trolley Carriage
    const trolley = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    trolley.position.set(-2, -0.3, 0);
    craneGroup.add(trolley);
    craneClickables.push(trolley);

    // Hoist Cable & Heavy Hook Assembly
    const hookAssembly = new THREE.Group();
    hookAssembly.position.set(-2, -2.0, 0);
    craneGroup.add(hookAssembly);
    craneHookRef.current = hookAssembly;

    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    cable.position.y = 1.0;
    hookAssembly.add(cable);

    const hook = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 })
    );
    hook.position.y = -0.6;
    hook.rotateZ(Math.PI);
    hookAssembly.add(hook);
    craneClickables.push(hook);

    interactiveObjectsRef.current.set('crane', craneClickables);

    // =========================================================================
    // 3. RIGHT BACK: PRECISION INDUSTRIAL CNC LATHE & MILL
    // =========================================================================
    const latheGroup = new THREE.Group();
    latheGroup.position.set(6, 0, -4);
    scene.add(latheGroup);
    const latheClickables: THREE.Object3D[] = [];

    // Lathe Bed Casting Base
    const latheBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 1.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.6, roughness: 0.4 })
    );
    latheBase.position.y = 0.55;
    latheBase.castShadow = true;
    latheGroup.add(latheBase);
    latheClickables.push(latheBase);

    // Headstock & Chuck
    const headstock = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x134e4a, metalness: 0.7 })
    );
    headstock.position.set(-1.4, 1.3, 0);
    latheGroup.add(headstock);

    const chuck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    chuck.rotateZ(Math.PI / 2);
    chuck.position.set(-0.6, 1.3, 0);
    latheGroup.add(chuck);
    latheChuckRef.current = chuck;

    // Tool Carriage & Swarf Guard
    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 })
    );
    guard.position.set(0.4, 1.5, 0);
    latheGroup.add(guard);

    interactiveObjectsRef.current.set('lathe', latheClickables);

    // =========================================================================
    // 4. RIGHT FRONT: HYDRAULIC PRESSURE TEST STAND & MANIFOLD
    // =========================================================================
    const hydGroup = new THREE.Group();
    hydGroup.position.set(6, 0, 3.5);
    scene.add(hydGroup);
    const hydClickables: THREE.Object3D[] = [];

    // Workbench with manifold block
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.2, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    bench.position.y = 0.6;
    hydGroup.add(bench);
    hydClickables.push(bench);

    // Hydraulic accumulator cylinder
    const accum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
    );
    accum.position.set(-1.0, 1.8, 0);
    hydGroup.add(accum);
    hydClickables.push(accum);

    // Pressure Gauge Cluster
    for (let g = 0; g < 3; g++) {
      const dial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
      );
      dial.rotateX(Math.PI / 2);
      dial.position.set(g * 0.5 - 0.2, 2.0, 0.5);
      hydGroup.add(dial);
    }

    interactiveObjectsRef.current.set('hydraulics', hydClickables);

    // =========================================================================
    // 5. BACK WALL: HIGH-BAY SPARE PARTS SHELVING RACK
    // =========================================================================
    const rackGroup = new THREE.Group();
    rackGroup.position.set(0, 0, -8.5);
    scene.add(rackGroup);
    const rackClickables: THREE.Object3D[] = [];

    const shelfFrame = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 4.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, wireframe: false, metalness: 0.6 })
    );
    shelfFrame.position.y = 2.2;
    rackGroup.add(shelfFrame);
    rackClickables.push(shelfFrame);

    // Storage Crates & Filters on shelves
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.6, 0.9),
          new THREE.MeshStandardMaterial({ color: (r + c) % 2 === 0 ? 0x475569 : 0xf59e0b })
        );
        crate.position.set(c * 1.4 - 2.1, r * 1.2 + 0.8, 0);
        rackGroup.add(crate);
      }
    }

    interactiveObjectsRef.current.set('spares', rackClickables);

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

      // Flashing amber beacon
      if (groomerBeaconRef.current) {
        const flash = Math.sin(time * 8) > 0;
        const bmat = groomerBeaconRef.current.material as THREE.MeshBasicMaterial;
        bmat.color.setHex(flash ? 0xf59e0b : 0x78350f);
      }

      // Rotate Lathe chuck
      if (latheChuckRef.current) {
        latheChuckRef.current.rotation.x += 0.08;
      }

      // Gentle crane hook sway
      if (craneHookRef.current) {
        craneHookRef.current.rotation.z = Math.sin(time * 1.5) * 0.03;
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
    <div className="relative w-full h-[560px] bg-[#080e18] rounded-3xl overflow-hidden border border-white/10 select-none shadow-2xl">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1220]/80 backdrop-blur-md border border-white/15 text-white shadow-xl">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-200">
            MECHANICAL WORKSHOP & RELIABILITY 3D INTERIOR
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold">
            {simulationState.engineWarmupActive ? 'ENGINE BLOCK WARMUP ACTIVE' : 'WORKSHOP STANDBY'}
          </span>
        </div>
      </div>

      {/* Camera Presets Dock */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-[#0B1220]/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl">
        <span className="text-[10px] font-mono uppercase text-slate-400 px-2 font-bold flex items-center gap-1">
          <Compass className="w-3 h-3 text-amber-400" />
          VIEW:
        </span>
        {(['overview', 'groomer', 'crane', 'lathe', 'hydraulics'] as const).map((preset) => (
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
        <div className="absolute bottom-6 left-6 z-20 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/40 text-white text-xs font-mono shadow-xl pointer-events-none flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Click to inspect: <strong className="text-amber-300 uppercase">{hoveredEquipment}</strong></span>
        </div>
      )}

      {/* Selected Equipment Modal HUD */}
      {selectedEquipment && (
        <div className="absolute top-16 right-4 z-30 w-80 p-4 bg-[#0B1220]/95 backdrop-blur-xl rounded-2xl border border-amber-400/30 text-white shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase text-amber-200">
                {selectedEquipment === 'groomer' && 'PistenBully 300 Polar Track Vehicle'}
                {selectedEquipment === 'crane' && 'Overhead 5-Ton Gantry Hoist'}
                {selectedEquipment === 'lathe' && 'Heavy Industrial Precision Lathe'}
                {selectedEquipment === 'hydraulics' && 'Hydraulic Pressure Test Bench'}
                {selectedEquipment === 'spares' && 'High-Density Spares Rack'}
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
              <span className="text-slate-400">Block Heater Temp:</span>
              <span className="text-amber-400 font-bold">{simulationState.blockHeaterTempC.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Hydraulic Pressure:</span>
              <span className="text-sky-400 font-bold">{simulationState.hydraulicPressureBar} Bar</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Maintenance Score:</span>
              <span className="text-emerald-400 font-bold">96% Readiness</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Readiness Status:</span>
              <span className="text-white font-bold uppercase">{simulationState.groomerStatus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
