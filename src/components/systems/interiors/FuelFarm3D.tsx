import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Fuel,
  Flame,
  Activity,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export type FuelCameraPreset = 'overview' | 'tanks' | 'pumps' | 'manifold';

export interface FuelSimState {
  consumptionMode: 'normal' | 'high' | 'extreme';
  dailyBurnLiters: number;
  daysRemaining: number;
  activeTank: 'tank1' | 'tank2' | 'tank3';
  tank1Liters: number;
  tank2Liters: number;
  tank3Liters: number;
}

interface FuelFarm3DProps {
  simulationState: FuelSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
}

export const FuelFarm3D: React.FC<FuelFarm3DProps> = ({
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

  const fuelParticlesRef = useRef<THREE.Points | null>(null);
  const pumpPiston1Ref = useRef<THREE.Mesh | null>(null);
  const pumpPiston2Ref = useRef<THREE.Mesh | null>(null);

  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const setCameraPreset = (preset: FuelCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 2.0, 0);
    if (preset === 'overview') {
      camera.position.set(15, 12, 16);
    } else if (preset === 'tanks') {
      controls.target.set(0, 2.5, -2);
      camera.position.set(0, 5.0, 11);
    } else if (preset === 'pumps') {
      controls.target.set(0, 1.2, 5.0);
      camera.position.set(0, 2.8, 10.5);
    } else if (preset === 'manifold') {
      controls.target.set(6, 1.5, 3.5);
      camera.position.set(6, 3.5, 8.5);
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
    camera.position.set(15, 12, 16);
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
    controls.maxDistance = 40;
    controls.target.set(0, 2.0, 0);
    controlsRef.current = controls;

    // Lights - Bright daylight scientific illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
    sunLight.position.set(15, 20, 12);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fillLight.position.set(-12, 6, -10);
    scene.add(fillLight);

    // Concrete Bunding Basin (Spill Containment Basin) - Crisp light grey pad
    const basinMat = new THREE.MeshStandardMaterial({ color: 0xd0dceb, roughness: 0.75 });
    const basinFloor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 18), basinMat);
    basinFloor.position.y = 0.15;
    basinFloor.receiveShadow = true;
    scene.add(basinFloor);

    // Basin containment bund walls
    const bundWallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const bundRear = new THREE.Mesh(new THREE.BoxGeometry(22, 0.8, 0.4), bundWallMat);
    bundRear.position.set(0, 0.6, -9);
    scene.add(bundRear);

    const bundLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 18), bundWallMat);
    bundLeft.position.set(-11, 0.6, 0);
    scene.add(bundLeft);

    const bundRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 18), bundWallMat);
    bundRight.position.set(11, 0.6, 0);
    scene.add(bundRight);

    interactiveObjectsRef.current.clear();

    // 3 HORIZONTAL CYLINDRICAL FUEL TANKS (TANK 01, TANK 02, TANK 03)
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.65, roughness: 0.35 });
    const insulationBandMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.5 });
    const saddleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });

    const createTank = (id: 'tank-01' | 'tank-02' | 'tank-03', posX: number, labelText: string) => {
      const tankGroup = new THREE.Group();
      tankGroup.position.set(posX, 0.3, -2.5);
      scene.add(tankGroup);

      const clickables: THREE.Object3D[] = [];

      // Saddles
      const saddle1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.5), saddleMat);
      saddle1.position.set(0, 0.45, -2.2);
      tankGroup.add(saddle1);

      const saddle2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.5), saddleMat);
      saddle2.position.set(0, 0.45, 2.2);
      tankGroup.add(saddle2);

      // Main Tank Cylinder
      const tankGeo = new THREE.CylinderGeometry(1.4, 1.4, 6.4, 24);
      tankGeo.rotateX(Math.PI / 2);
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.y = 1.95;
      tankMesh.castShadow = true;
      tankMesh.receiveShadow = true;
      tankGroup.add(tankMesh);
      clickables.push(tankMesh);

      // Rounded end caps
      const capGeo = new THREE.SphereGeometry(1.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const cap1 = new THREE.Mesh(capGeo, tankMat);
      cap1.position.set(0, 1.95, 3.2);
      cap1.rotateX(Math.PI / 2);
      tankGroup.add(cap1);
      clickables.push(cap1);

      const cap2 = new THREE.Mesh(capGeo, tankMat);
      cap2.position.set(0, 1.95, -3.2);
      cap2.rotateX(-Math.PI / 2);
      tankGroup.add(cap2);
      clickables.push(cap2);

      // Top Inspection Manhole & Level Sensor
      const manhole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16), insulationBandMat);
      manhole.position.set(0, 3.5, 0);
      tankGroup.add(manhole);

      // Label plaque
      const label = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      label.position.set(0, 2.0, 3.35);
      tankGroup.add(label);

      interactiveObjectsRef.current.set(id, clickables);
    };

    createTank('tank-01', -6.0, 'TANK 01');
    createTank('tank-02', 0, 'TANK 02');
    createTank('tank-03', 6.0, 'TANK 03');

    // TRANSFER PUMP SKID (Front center)
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(0, 0.3, 4.5);
    scene.add(pumpGroup);
    const pumpClickables: THREE.Object3D[] = [];

    const pumpSkid = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.25, 2.6), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    pumpSkid.position.y = 0.125;
    pumpGroup.add(pumpSkid);

    // Pump 01 Motor & Impeller Housing
    const pMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const pump1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.2, 16), pMat);
    pump1.rotateZ(Math.PI / 2);
    pump1.position.set(-1.4, 0.75, 0);
    pumpGroup.add(pump1);
    pumpClickables.push(pump1);
    pumpPiston1Ref.current = pump1;

    // Pump 02 (Standby)
    const pump2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.2, 16), pMat);
    pump2.rotateZ(Math.PI / 2);
    pump2.position.set(1.4, 0.75, 0);
    pumpGroup.add(pump2);
    pumpClickables.push(pump2);
    pumpPiston2Ref.current = pump2;

    interactiveObjectsRef.current.set('transfer-pumps', pumpClickables);

    // INSULATED FUEL PIPING MANIFOLD & GENERATOR CONNECTION
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    const manifoldGroup = new THREE.Group();
    scene.add(manifoldGroup);
    const pipeClickables: THREE.Object3D[] = [];

    // Header pipe from tanks into pumps
    const mainHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 14, 16), pipeMat);
    mainHeader.rotateZ(Math.PI / 2);
    mainHeader.position.set(0, 1.2, 2.0);
    manifoldGroup.add(mainHeader);
    pipeClickables.push(mainHeader);

    // Discharge pipe leading off toward the station generator room
    const dischargePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 12, 16), pipeMat);
    dischargePipe.rotateX(Math.PI / 2);
    dischargePipe.position.set(3.5, 1.2, 8.5);
    manifoldGroup.add(dischargePipe);
    pipeClickables.push(dischargePipe);

    interactiveObjectsRef.current.set('manifold-pipes', pipeClickables);

    // ANIMATED FUEL FLOW PARTICLES (Tanks -> Pumps -> Generator Connection)
    const PARTICLE_COUNT = 50;
    const fuelGeo = new THREE.BufferGeometry();
    const fuelPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const frac = i / PARTICLE_COUNT;
      fuelPos[i * 3 + 0] = -6.0 + frac * 9.5;
      fuelPos[i * 3 + 1] = 1.2;
      fuelPos[i * 3 + 2] = 2.0 + frac * 6.5;
    }
    fuelGeo.setAttribute('position', new THREE.BufferAttribute(fuelPos, 3));
    const fuelPartMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.3,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const fuelPoints = new THREE.Points(fuelGeo, fuelPartMat);
    scene.add(fuelPoints);
    fuelParticlesRef.current = fuelPoints;

    // RAYCASTING
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const allMeshes: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach((mList) => allMeshes.push(...mList));
      const intersects = raycaster.intersectObjects(allMeshes, true);

      if (intersects.length > 0) {
        let foundId: string | null = null;
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr) {
          for (const [eqId, meshList] of interactiveObjectsRef.current.entries()) {
            if (meshList.includes(curr) || curr.id === intersects[0].object.id) {
              foundId = eqId;
              break;
            }
          }
          if (foundId) break;
          curr = curr.parent;
        }
        if (foundId) onSelectEquipment(foundId);
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const allMeshes: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach((mList) => allMeshes.push(...mList));
      const intersects = raycaster.intersectObjects(allMeshes, true);

      if (intersects.length > 0) {
        let foundId: string | null = null;
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr) {
          for (const [eqId, meshList] of interactiveObjectsRef.current.entries()) {
            if (meshList.includes(curr) || curr.id === intersects[0].object.id) {
              foundId = eqId;
              break;
            }
          }
          if (foundId) break;
          curr = curr.parent;
        }
        setHoveredEquipment(foundId);
        container.style.cursor = 'pointer';
      } else {
        setHoveredEquipment(null);
        container.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);
    renderer.domElement.addEventListener('mousemove', handlePointerMove);

    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.update();

      // Flow speed scales with consumption mode
      const speedMult = simulationState.consumptionMode === 'extreme' ? 2.2 : simulationState.consumptionMode === 'high' ? 1.5 : 1.0;
      if (fuelParticlesRef.current) {
        const posAttr = fuelParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let z = posAttr.getZ(i);
          let x = posAttr.getX(i);
          z += delta * 3.5 * speedMult;
          x += delta * 1.5 * speedMult;
          if (z > 8.5) {
            z = 2.0;
            x = -6.0;
          }
          posAttr.setZ(i, z);
          posAttr.setX(i, x);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / (container.clientHeight || 560);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight || 560);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.dispose();
      controls.dispose();
    };
  }, [simulationState.consumptionMode]);

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] bg-[#070c18] rounded-3xl border border-white/10 overflow-hidden shadow-2xl select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220]/80 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            POLAR HYDROCARBON FUEL FARM
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs font-mono text-amber-300">
            {simulationState.daysRemaining} DAYS REMAINING
          </span>
        </div>

        {/* Camera Views Preset Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto shadow-lg">
          <button
            onClick={() => setCameraPreset('overview')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setCameraPreset('tanks')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            TANKS
          </button>
          <button
            onClick={() => setCameraPreset('pumps')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            PUMPS
          </button>
          <button
            onClick={() => setCameraPreset('manifold')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            MANIFOLD
          </button>
        </div>
      </div>

      {hoveredEquipment && (
        <div className="absolute top-16 left-6 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm border border-amber-400/40 text-xs font-mono text-amber-200 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Click to inspect: {hoveredEquipment.replace('-', ' ').toUpperCase()}</span>
        </div>
      )}

      {/* FLOATING EQUIPMENT TELEMETRY PANEL */}
      {selectedEquipment && (
        <div className="absolute top-20 right-5 w-80 max-w-[calc(100vw-40px)] bg-[#0B1220]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 text-white shadow-2xl z-30 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h4 className="text-sm font-extrabold font-mono tracking-tight text-white uppercase">
                  {selectedEquipment.replace('-', ' ')}
                </h4>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Jet A-1 Fuel System Node</div>
            </div>
            <button
              onClick={() => onSelectEquipment(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {(selectedEquipment === 'tank-01' || selectedEquipment === 'tank-02' || selectedEquipment === 'tank-03') && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Total Capacity</span>
                <span className="font-bold text-white">12,000 Liters</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Current Volume</span>
                <span className="font-bold text-amber-400">
                  {selectedEquipment === 'tank-01'
                    ? simulationState.tank1Liters
                    : selectedEquipment === 'tank-02'
                    ? simulationState.tank2Liters
                    : simulationState.tank3Liters}{' '}
                  L
                </span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Fill Level</span>
                <span className="font-bold text-emerald-400">
                  {selectedEquipment === 'tank-01' ? '68%' : selectedEquipment === 'tank-02' ? '82%' : '95%'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Flow Draw Rate</span>
                <span className="font-bold text-cyan-400">42 L / hr</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Heater Trace</span>
                <span className="font-bold text-emerald-400">Active (+6.0°C)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'transfer-pumps' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Pump 01 (Lead)</span>
                <span className="font-bold text-emerald-400">● RUNNING</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Pump 02 (Standby)</span>
                <span className="font-bold text-amber-400">● WARM STANDBY</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Manifold Pressure</span>
                <span className="font-bold text-white">3.4 bar (Stable)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'manifold-pipes' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Line Route</span>
                <span className="font-bold text-white">BUND → GENERATOR ANNEX</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Ultrasonic Leak Sensor</span>
                <span className="font-bold text-emerald-400">0 Leaks Detected</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Nav Instructions */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>DRAG to Rotate · WHEEL to Zoom · CLICK Tank 01, Tank 02, or Transfer Pumps</span>
        </div>
      </div>
    </div>
  );
};
