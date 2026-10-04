import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Droplet,
  Activity,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export type WaterCameraPreset = 'overview' | 'intake' | 'purification' | 'tank';

export interface WaterSimState {
  crewCount: number;
  dailyWaterHarvestLiters: number;
  dailyConsumptionLiters: number;
  daysRemaining: number;
  storageLiters: number;
  storagePercent: number;
  pumpRunning: boolean;
}

interface WaterTreatment3DProps {
  simulationState: WaterSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
}

export const WaterTreatment3D: React.FC<WaterTreatment3DProps> = ({
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

  const waterParticlesRef = useRef<THREE.Points | null>(null);
  const uvGlowRef = useRef<THREE.Mesh | null>(null);

  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const setCameraPreset = (preset: WaterCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 2.0, 0);
    if (preset === 'overview') {
      camera.position.set(13, 10, 15);
    } else if (preset === 'intake') {
      controls.target.set(-5.5, 1.2, -2);
      camera.position.set(-5.5, 3.2, 5.5);
    } else if (preset === 'purification') {
      controls.target.set(0, 1.8, 0);
      camera.position.set(0, 3.5, 6.5);
    } else if (preset === 'tank') {
      controls.target.set(5.5, 2.5, -1);
      camera.position.set(5.5, 4.2, 7.0);
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
    scene.background = new THREE.Color(0xf0f5fc); // Crisp light ice-blue off-white
    scene.fog = new THREE.FogExp2(0xf0f5fc, 0.008);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 160);
    camera.position.set(13, 10, 15);
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

    const spotLight = new THREE.SpotLight(0x0284c7, 1.8, 30, Math.PI / 3, 0.4);
    spotLight.position.set(0, 14, 8);
    scene.add(spotLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
      new THREE.MeshStandardMaterial({ color: 0xe2ebf5, roughness: 0.4, metalness: 0.05 })
    );
    floor.rotateX(-Math.PI / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    interactiveObjectsRef.current.clear();

    // 1. WATER SOURCE / GLACIAL MELT INTAKE PIT (Left)
    const intakeGroup = new THREE.Group();
    intakeGroup.position.set(-6.5, 0, -2);
    scene.add(intakeGroup);
    const intakeClickables: THREE.Object3D[] = [];

    // Melt pit enclosure with thermal heating coils
    const pitWall = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 3.6), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    pitWall.position.y = 0.7;
    intakeGroup.add(pitWall);
    intakeClickables.push(pitWall);

    // Glowing Glacial Meltwater Surface
    const waterSurf = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, transparent: true, opacity: 0.85 }));
    waterSurf.rotateX(-Math.PI / 2);
    waterSurf.position.y = 1.35;
    intakeGroup.add(waterSurf);

    // High-Pressure Intake Pump
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 });
    const intakePump = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16), pumpMat);
    intakePump.position.set(2.4, 0.6, 0);
    intakePump.rotateZ(Math.PI / 2);
    intakeGroup.add(intakePump);
    intakeClickables.push(intakePump);

    interactiveObjectsRef.current.set('intake-pit', intakeClickables);

    // 2. 3-STAGE MULTI-MEDIA FILTER SKID (Center Left)
    const filterGroup = new THREE.Group();
    filterGroup.position.set(-2.2, 0, 0);
    scene.add(filterGroup);
    const filterClickables: THREE.Object3D[] = [];

    const fMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.6, roughness: 0.3 });
    for (let f = 0; f < 3; f++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.2, 16), fMat);
      col.position.set(f * 0.95 - 0.95, 1.3, 0);
      col.castShadow = true;
      filterGroup.add(col);
      filterClickables.push(col);
    }
    interactiveObjectsRef.current.set('filtration-skid', filterClickables);

    // 3. DUAL REVERSE OSMOSIS (RO) PRESSURE VESSELS & UV STERILIZER (Center Right)
    const roGroup = new THREE.Group();
    roGroup.position.set(1.8, 0, 0);
    scene.add(roGroup);
    const roClickables: THREE.Object3D[] = [];

    const roMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
    // Horizontal RO pressure vessels
    const roTube1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.4, 16), roMat);
    roTube1.rotateZ(Math.PI / 2);
    roTube1.position.set(0, 1.2, 0);
    roGroup.add(roTube1);
    roClickables.push(roTube1);

    const roTube2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.4, 16), roMat);
    roTube2.rotateZ(Math.PI / 2);
    roTube2.position.set(0, 1.9, 0);
    roGroup.add(roTube2);
    roClickables.push(roTube2);

    // UV Sterilization Chamber (Glowing Violet/Blue)
    const uvTube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 16), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x7c3aed, emissiveIntensity: 1.2 }));
    uvTube.rotateZ(Math.PI / 2);
    uvTube.position.set(0, 2.6, 0);
    roGroup.add(uvTube);
    roClickables.push(uvTube);
    uvGlowRef.current = uvTube;

    interactiveObjectsRef.current.set('purification-unit', roClickables);

    // 4. VERTICAL CYLINDRICAL POTABLE STORAGE TANK (Right)
    const tankGroup = new THREE.Group();
    tankGroup.position.set(6.2, 0, -1);
    scene.add(tankGroup);
    const tankClickables: THREE.Object3D[] = [];

    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.35 });
    const storageTank = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 4.6, 24), tankMat);
    storageTank.position.y = 2.45;
    storageTank.castShadow = true;
    tankGroup.add(storageTank);
    tankClickables.push(storageTank);

    // Digital Level Sight Gauge on side of tank
    const gaugeGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 0.12), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 }));
    gaugeGlass.position.set(-1.84, 2.45, 0);
    tankGroup.add(gaugeGlass);

    interactiveObjectsRef.current.set('storage-tank', tankClickables);

    // 5. ANIMATED WATER FLOW PARTICLES THROUGH TRANSPARENT PIPES
    const PARTICLE_COUNT = 55;
    const waterGeo = new THREE.BufferGeometry();
    const waterPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const frac = i / PARTICLE_COUNT;
      waterPos[i * 3 + 0] = -6.5 + frac * 12.7;
      waterPos[i * 3 + 1] = 1.35 + Math.sin(frac * Math.PI) * 0.8;
      waterPos[i * 3 + 2] = -2.0 + frac * 1.5;
    }
    waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    const waterPartMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.28,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const waterPoints = new THREE.Points(waterGeo, waterPartMat);
    scene.add(waterPoints);
    waterParticlesRef.current = waterPoints;

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

      // Flow speed scales with daily consumption / crew demand
      const flowMult = delta * (simulationState.dailyConsumptionLiters / 65);
      if (waterParticlesRef.current) {
        const posAttr = waterParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let x = posAttr.getX(i);
          x += flowMult;
          if (x > 6.2) x = -6.5;
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
  }, [simulationState.dailyConsumptionLiters]);

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] bg-[#F0F5FC] rounded-3xl border border-[#D5E1F2] overflow-hidden shadow-xl select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D5E1F2] text-[#17213A] shadow-md pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            WATER TREATMENT & STORAGE PLANT
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs font-mono text-cyan-600 font-bold">
            {simulationState.daysRemaining} DAYS RESERVE ({simulationState.storageLiters} L)
          </span>
        </div>

        {/* Camera Views Preset Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-[#D5E1F2] pointer-events-auto shadow-md">
          <button
            onClick={() => setCameraPreset('overview')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setCameraPreset('intake')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            INTAKE PIT
          </button>
          <button
            onClick={() => setCameraPreset('purification')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            RO & UV
          </button>
          <button
            onClick={() => setCameraPreset('tank')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            STORAGE TANK
          </button>
        </div>
      </div>

      {hoveredEquipment && (
        <div className="absolute top-16 left-6 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm border border-cyan-400/40 text-xs font-mono text-[#17213A] shadow-md animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>Click to inspect: <strong className="text-cyan-700 uppercase">{hoveredEquipment.replace('-', ' ')}</strong></span>
        </div>
      )}

      {/* FLOATING EQUIPMENT TELEMETRY PANEL */}
      {selectedEquipment && (
        <div className="absolute top-20 right-5 w-80 max-w-[calc(100vw-40px)] bg-white/95 backdrop-blur-xl border border-[#D5E1F2] rounded-2xl p-5 text-[#17213A] shadow-2xl z-30 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-3 border-b border-[#D5E1F2] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                <h4 className="text-sm font-extrabold font-mono tracking-tight text-[#17213A] uppercase">
                  {selectedEquipment.replace('-', ' ')}
                </h4>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Potable Water Cycle Node</div>
            </div>
            <button
              onClick={() => onSelectEquipment(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-[#17213A] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedEquipment === 'storage-tank' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Total Capacity</span>
                <span className="font-bold text-[#17213A]">12,000 Liters</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Current Reserve</span>
                <span className="font-bold text-cyan-600">{simulationState.storageLiters} L</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Fill Level</span>
                <span className="font-bold text-emerald-600">{simulationState.storagePercent}%</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Estimated Autonomy</span>
                <span className="font-bold text-[#17213A]">{simulationState.daysRemaining} Days</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'intake-pit' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Heat Source</span>
                <span className="font-bold text-[#17213A]">Generator Jacket Loop</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Daily Melt Yield</span>
                <span className="font-bold text-cyan-600">280 L / day</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Pump Status</span>
                <span className="font-bold text-emerald-600">● RUNNING (4.2 bar)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'filtration-skid' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">3-Stage Stages</span>
                <span className="font-bold text-[#17213A]">Sand / Carbon / Micron</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">Filter Differential</span>
                <span className="font-bold text-emerald-600">0.08 bar (Nominal)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'purification-unit' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">RO Permeate Purity</span>
                <span className="font-bold text-cyan-600">99.8% TDS Rejection</span>
              </div>
              <div className="flex justify-between p-2 bg-[#F4F8FE] rounded-xl border border-[#D5E1F2]">
                <span className="text-slate-500">UV Sanitizer Lamp</span>
                <span className="font-bold text-purple-600">254 nm Germicidal</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Nav Instructions */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-[#D5E1F2] text-[11px] font-mono text-slate-700 flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-cyan-600" />
          <span>DRAG to Rotate · WHEEL to Zoom · CLICK Melt Pit, RO Unit, or Storage Tank</span>
        </div>
      </div>
    </div>
  );
};
