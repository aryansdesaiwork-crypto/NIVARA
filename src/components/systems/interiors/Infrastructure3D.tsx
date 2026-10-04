import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Zap,
  Flame,
  Droplet,
  Wind,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export type InfrastructureCameraPreset = 'cutaway' | 'front' | 'top' | 'closeup';
export type InfrastructureFlowFocus = 'all' | 'heating' | 'ventilation' | 'electrical' | 'water';

export interface InfrastructureSimState {
  ambientTempC: number;
  heatingLoadPercent: number;
  hvacRunning: boolean;
  ventilationFlowCfm: number;
  foundationTiltDeg: number;
  selectedObject: string | null;
  flowFocus: InfrastructureFlowFocus;
}

interface Infrastructure3DProps {
  simulationState: InfrastructureSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
  flowFocus?: InfrastructureFlowFocus;
}

export const Infrastructure3D: React.FC<Infrastructure3DProps> = ({
  simulationState,
  selectedEquipment,
  onSelectEquipment,
  flowFocus = 'all'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Animated elements
  const hvacFanRef = useRef<THREE.Group | null>(null);
  const glycolParticlesRef = useRef<THREE.Points | null>(null);
  const airParticlesRef = useRef<THREE.Points | null>(null);
  const waterParticlesRef = useRef<THREE.Points | null>(null);

  // Clickable interactive objects map
  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const setCameraPreset = (preset: InfrastructureCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 2.8, 0);
    if (preset === 'cutaway') {
      camera.position.set(13, 10, 15);
    } else if (preset === 'front') {
      camera.position.set(0, 3.2, 16);
    } else if (preset === 'top') {
      camera.position.set(0, 20, 0.5);
    } else if (preset === 'closeup') {
      controls.target.set(-4, 2.5, 0);
      camera.position.set(-4, 3.8, 6.5);
    }
    controls.update();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene setup - Crisp light ice-blue scientific digital-twin aesthetic
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f5fc);
    scene.fog = new THREE.FogExp2(0xf0f5fc, 0.008);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 160);
    camera.position.set(13, 10, 15);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.target.set(0, 2.8, 0);
    controlsRef.current = controls;

    // 5. Lighting - Bright clean scientific laboratory illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(12, 16, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-10, 8, -10);
    scene.add(fillLight);

    // 6. Terrain & Rock Foundation - Crisp polar ice & permafrost
    const terrainGeo = new THREE.PlaneGeometry(30, 26);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.7 });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    terrain.position.y = 0;
    scene.add(terrain);

    interactiveObjectsRef.current.clear();

    // 7. FOUNDATION STILTS & HYDRAULIC JACKS (Elevated above permafrost)
    const foundationGroup = new THREE.Group();
    scene.add(foundationGroup);
    const foundationClickables: THREE.Object3D[] = [];

    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const jackMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.6, roughness: 0.4 }); // Yellow jacks

    const stiltCols = [-6, -2, 2, 6];
    const stiltRows = [-3, 0, 3];
    stiltCols.forEach((x) => {
      stiltRows.forEach((z) => {
        // Concrete base footer
        const footer = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        footer.position.set(x, 0.15, z);
        footer.receiveShadow = true;
        foundationGroup.add(footer);

        // Steel stilt pillar
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 16), stiltMat);
        stilt.position.set(x, 1.05, z);
        stilt.castShadow = true;
        foundationGroup.add(stilt);
        foundationClickables.push(stilt);

        // Hydraulic leveling jack collar
        const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.35, 16), jackMat);
        jack.position.set(x, 1.7, z);
        foundationGroup.add(jack);
        foundationClickables.push(jack);
      });
    });
    interactiveObjectsRef.current.set('foundation', foundationClickables);

    // 8. 3D CUTAWAY STATION BUILDING
    // Main building platform slab
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.3 });
    const platformSlab = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 9.5), slabMat);
    platformSlab.position.set(0, 1.95, 0);
    platformSlab.castShadow = true;
    platformSlab.receiveShadow = true;
    scene.add(platformSlab);

    // Back & Side Exterior Walls (Cutaway front wall so interior rooms are fully visible)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.4, metalness: 0.6 });
    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 3.4, 0.3), wallMat);
    backWall.position.set(0, 3.8, -4.6);
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 9.5), wallMat);
    leftWall.position.set(-7.85, 3.8, 0);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 9.5), wallMat);
    rightWall.position.set(7.85, 3.8, 0);
    scene.add(rightWall);

    // Aerodynamic Roof with Solar Panels (half cutaway)
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.7 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.25, 5.0), roofMat);
    roof.position.set(0, 5.6, -2.3);
    roof.castShadow = true;
    scene.add(roof);

    // Interior Room Partition Walls (creating HVAC plant bay, corridor, and main modules)
    const partMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, transparent: true, opacity: 0.75 });
    const part1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.2, 9.0), partMat);
    part1.position.set(-2.8, 3.6, 0);
    scene.add(part1);

    const part2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.2, 9.0), partMat);
    part2.position.set(2.8, 3.6, 0);
    scene.add(part2);

    // 9. HVAC AIR HANDLER & VENTILATION DUCTS
    const hvacClickables: THREE.Object3D[] = [];
    const ventClickables: THREE.Object3D[] = [];

    // Central HVAC Unit (Air Handler) in left bay
    const hvacMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const hvacBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), hvacMat);
    hvacBox.position.set(-5.3, 3.2, -1.8);
    hvacBox.castShadow = true;
    scene.add(hvacBox);
    hvacClickables.push(hvacBox);

    // HVAC Fan Rotor inside intake port
    const fanGroup = new THREE.Group();
    fanGroup.position.set(-5.3, 3.2, -0.55);
    const fanBladesMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.75, 0.04), fanBladesMat);
      b.rotation.z = (i * Math.PI) / 2;
      fanGroup.add(b);
    }
    scene.add(fanGroup);
    hvacFanRef.current = fanGroup;

    // Overhead Rectangular Galvanized Ventilation Ducts
    const ductMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.3 });
    const mainDuct = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.5, 0.7), ductMat);
    mainDuct.position.set(0.5, 5.0, 0);
    scene.add(mainDuct);
    ventClickables.push(mainDuct);

    // Drop diffusers
    const diff1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), ductMat);
    diff1.position.set(0, 4.6, 0);
    scene.add(diff1);
    ventClickables.push(diff1);

    const diff2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), ductMat);
    diff2.position.set(5.2, 4.6, 0);
    scene.add(diff2);
    ventClickables.push(diff2);

    interactiveObjectsRef.current.set('hvac', hvacClickables);
    interactiveObjectsRef.current.set('ventilation', ventClickables);

    // 10. HEATING SYSTEM (Hydronic Glycol Pipes with red/orange supply and blue return)
    const heatingClickables: THREE.Object3D[] = [];
    const supplyPipeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.25 }); // Hot supply
    const returnPipeMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.7, roughness: 0.25 }); // Cold return

    // Supply pipe along perimeter floor
    const hotSupply = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 14, 16), supplyPipeMat);
    hotSupply.rotateZ(Math.PI / 2);
    hotSupply.position.set(0, 2.3, -3.8);
    scene.add(hotSupply);
    heatingClickables.push(hotSupply);

    const coldReturn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 14, 16), returnPipeMat);
    coldReturn.rotateZ(Math.PI / 2);
    coldReturn.position.set(0, 2.5, -3.8);
    scene.add(coldReturn);
    heatingClickables.push(coldReturn);

    // Radiator convectors on partitions
    const radMat = new THREE.MeshStandardMaterial({ color: 0xdcfce7, metalness: 0.6, roughness: 0.4 });
    const rad1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.18), radMat);
    rad1.position.set(0, 2.6, -3.6);
    scene.add(rad1);
    heatingClickables.push(rad1);

    const rad2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.18), radMat);
    rad2.position.set(5.2, 2.6, -3.6);
    scene.add(rad2);
    heatingClickables.push(rad2);

    interactiveObjectsRef.current.set('heating', heatingClickables);

    // 11. ELECTRICAL TRUNK & WATER PIPES
    const electClickables: THREE.Object3D[] = [];
    const waterClickables: THREE.Object3D[] = [];

    // Electrical Cable Ladder Tray
    const cableTrayMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const cableTray = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.12, 0.4), cableTrayMat);
    cableTray.position.set(0.5, 4.5, -2.5);
    scene.add(cableTray);
    electClickables.push(cableTray);
    interactiveObjectsRef.current.set('electrical', electClickables);

    // Insulated Water Supply Pipe
    const waterPipeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.6, roughness: 0.3 });
    const waterPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 13.5, 12), waterPipeMat);
    waterPipe.rotateZ(Math.PI / 2);
    waterPipe.position.set(0.5, 2.25, 2.8);
    scene.add(waterPipe);
    waterClickables.push(waterPipe);
    interactiveObjectsRef.current.set('water-pipes', waterClickables);

    // 12. ANIMATED FLOW PARTICLES (Glycol Heat Flow & Air Flow)
    // Glycol particles (Red glowing)
    const PARTICLE_COUNT = 45;
    const glycolGeo = new THREE.BufferGeometry();
    const glycolPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      glycolPos[i * 3 + 0] = -6.5 + (i / PARTICLE_COUNT) * 13;
      glycolPos[i * 3 + 1] = 2.3;
      glycolPos[i * 3 + 2] = -3.8;
    }
    glycolGeo.setAttribute('position', new THREE.BufferAttribute(glycolPos, 3));
    const glycolMat = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.28,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const glycolPoints = new THREE.Points(glycolGeo, glycolMat);
    scene.add(glycolPoints);
    glycolParticlesRef.current = glycolPoints;

    // Air particles (Cyan glowing inside duct)
    const airGeo = new THREE.BufferGeometry();
    const airPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      airPos[i * 3 + 0] = -5.5 + (i / PARTICLE_COUNT) * 12;
      airPos[i * 3 + 1] = 5.0;
      airPos[i * 3 + 2] = 0;
    }
    airGeo.setAttribute('position', new THREE.BufferAttribute(airPos, 3));
    const airMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const airPoints = new THREE.Points(airGeo, airMat);
    scene.add(airPoints);
    airParticlesRef.current = airPoints;

    // 13. RAYCASTING
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

    // 14. ANIMATION LOOP
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.update();

      // Fan rotation
      if (hvacFanRef.current) {
        hvacFanRef.current.rotation.z += delta * 6.5;
      }

      // Particle speed scales with heating load
      const heatSpeed = delta * 3.5 * (simulationState.heatingLoadPercent / 60);
      if (glycolParticlesRef.current) {
        const posAttr = glycolParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let x = posAttr.getX(i);
          x += heatSpeed;
          if (x > 6.5) x = -6.5;
          posAttr.setX(i, x);
        }
        posAttr.needsUpdate = true;
      }

      if (airParticlesRef.current) {
        const posAttr = airParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let x = posAttr.getX(i);
          x += delta * 4.2;
          if (x > 6.5) x = -5.5;
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
  }, []);

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] bg-[#070c18] rounded-3xl border border-white/10 overflow-hidden shadow-2xl select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220]/80 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            BUILDING CUTAWAY DIGITAL TWIN
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs font-mono text-[#8FAAFF]">
            HEATING LOAD {simulationState.heatingLoadPercent}%
          </span>
        </div>

        {/* Camera Views Preset Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto shadow-lg">
          <button
            onClick={() => setCameraPreset('cutaway')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            CUTAWAY
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            FRONT
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            TOP
          </button>
          <button
            onClick={() => setCameraPreset('closeup')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            HVAC BAY
          </button>
        </div>
      </div>

      {hoveredEquipment && (
        <div className="absolute top-16 left-6 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm border border-sky-400/40 text-xs font-mono text-sky-200 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Click to inspect: {hoveredEquipment.replace('-', ' ').toUpperCase()}</span>
        </div>
      )}

      {/* FLOATING EQUIPMENT TELEMETRY PANEL */}
      {selectedEquipment && (
        <div className="absolute top-20 right-5 w-80 max-w-[calc(100vw-40px)] bg-[#0B1220]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 text-white shadow-2xl z-30 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-sm font-extrabold font-mono tracking-tight text-white uppercase">
                  {selectedEquipment.replace('-', ' ')}
                </h4>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Physical Structural Node</div>
            </div>
            <button
              onClick={() => onSelectEquipment(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedEquipment === 'hvac' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-400">● OPERATIONAL</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Fan Load</span>
                <span className="font-bold text-white">{simulationState.heatingLoadPercent}%</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Core Temp</span>
                <span className="font-bold text-sky-400">21.2°C Supply</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Health Index</span>
                <span className="font-bold text-emerald-400">94%</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'foundation' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Hydraulic Stilts</span>
                <span className="font-bold text-emerald-400">12 Primary Pillars</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Pillar Horizontal Tilt</span>
                <span className="font-bold text-white">0.08° (Nominal &lt;0.5°)</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Snow Scour Air Gap</span>
                <span className="font-bold text-emerald-400">1.8m Aeroway Clear</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Permafrost Anchor</span>
                <span className="font-bold text-sky-400">Zero Heave</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'heating' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Glycol Supply Temp</span>
                <span className="font-bold text-rose-400">68.0°C</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Hydronic Return Temp</span>
                <span className="font-bold text-sky-400">44.2°C</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Thermal Recovery</span>
                <span className="font-bold text-emerald-400">94% Efficiency</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'ventilation' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Air Distribution</span>
                <span className="font-bold text-white">1,840 CFM</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Positive Pressure</span>
                <span className="font-bold text-emerald-400">+22 Pa (Airlock Locked)</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">HEPA Filter Status</span>
                <span className="font-bold text-sky-400">Clean (0.04 kPa dP)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'electrical' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Cable Tray Bus</span>
                <span className="font-bold text-amber-400">415V 3-Phase</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Building Power</span>
                <span className="font-bold text-white">46.5 kW Active</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'water-pipes' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Potable Loop</span>
                <span className="font-bold text-cyan-400">Active Circulation</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Trace Heating</span>
                <span className="font-bold text-emerald-400">+4.2°C (Anti-Freeze)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Instructions */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>DRAG to Rotate · WHEEL to Zoom · CLICK Foundation, HVAC, Heating, or Ducts</span>
        </div>
      </div>
    </div>
  );
};
