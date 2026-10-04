import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Compass,
  Eye,
  Zap,
  Flame,
  Activity,
  Maximize2,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  Pause,
  Sliders,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export type CameraPreset = 'isometric' | 'front' | 'top' | 'closeup';
export type FlowFocus = 'all' | 'fuel' | 'cooling' | 'power';

export interface GeneratorSimulationState {
  generator1Running: boolean;
  generator2Running: boolean;
  generator1Health: number;
  generator2Health: number;
  generatorLoad: number; // 0 - 100 %
  ambientTempC: number;
  bessDischarging: boolean;
  bessSoc: number; // 0 - 100 %
  flowFocus: FlowFocus;
}

interface GeneratorRoom3DProps {
  simulationState: GeneratorSimulationState;
  onSimStateChange?: (newState: Partial<GeneratorSimulationState>) => void;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
  flowFocus?: FlowFocus;
}

export const GeneratorRoom3D: React.FC<GeneratorRoom3DProps> = ({
  simulationState,
  onSimStateChange,
  selectedEquipment,
  onSelectEquipment,
  flowFocus = 'all'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Three.js runtime references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Animated elements references
  const g1FanRef = useRef<THREE.Group | null>(null);
  const g2FanRef = useRef<THREE.Group | null>(null);
  const g1GroupRef = useRef<THREE.Group | null>(null);
  const g2GroupRef = useRef<THREE.Group | null>(null);
  const g1LightMeshRef = useRef<THREE.Mesh | null>(null);
  const g2LightMeshRef = useRef<THREE.Mesh | null>(null);
  const g1PointLightRef = useRef<THREE.PointLight | null>(null);
  const g2PointLightRef = useRef<THREE.PointLight | null>(null);

  // Particle systems
  const fuelParticlesRef = useRef<THREE.Points | null>(null);
  const coolantParticlesRef = useRef<THREE.Points | null>(null);
  const powerParticlesRef = useRef<THREE.Points | null>(null);
  const bessParticlesRef = useRef<THREE.Points | null>(null);
  const exhaustParticlesRef = useRef<THREE.Points | null>(null);

  // Clickable interactive meshes map (id -> array of meshes)
  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());

  // Local state for hover tooltip
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  // Calculated dynamic telemetry values based on load
  const loadFraction = simulationState.generatorLoad / 100;
  const g1Kw = simulationState.generator1Running ? Math.round(240 * loadFraction * (simulationState.generator2Running ? 0.58 : 1.0)) : 0;
  const g2Kw = simulationState.generator2Running ? Math.round(240 * loadFraction * (simulationState.generator1Running ? 0.42 : 1.0)) : 0;
  const totalKw = g1Kw + g2Kw + (simulationState.bessDischarging ? 42 : 0);
  const g1Temp = simulationState.generator1Running ? Math.round(52 + loadFraction * 26) : 24;
  const g2Temp = simulationState.generator2Running ? Math.round(50 + (g2Kw / 240) * 30) : 48;
  const fuelBurnLhr = Math.round(18 + (totalKw / 240) * 36);

  // Camera presets handler
  const setCameraPreset = (preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 1.8, 0);

    if (preset === 'isometric') {
      camera.position.set(12, 10, 14);
    } else if (preset === 'front') {
      camera.position.set(0, 2.8, 13);
    } else if (preset === 'top') {
      camera.position.set(0, 18, 0.5);
    } else if (preset === 'closeup') {
      controls.target.set(-3.2, 1.6, 0);
      camera.position.set(-3.2, 3.0, 5.2);
    }

    controls.update();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene setup - Crisp light scientific digital twin atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f5fc); // Crisp light ice-blue off-white
    scene.fog = new THREE.FogExp2(0xf0f5fc, 0.008);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.2, 150);
    camera.position.set(12, 10, 14);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going below floor
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.target.set(0, 1.8, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup - Bright clean laboratory illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Overhead high-bay industrial LED lights
    const ceilingLight1 = new THREE.SpotLight(0xffffff, 2.0, 30, Math.PI / 3.5, 0.4, 1.2);
    ceilingLight1.position.set(-3.2, 8.5, 0);
    ceilingLight1.target.position.set(-3.2, 0, 0);
    ceilingLight1.castShadow = true;
    ceilingLight1.shadow.mapSize.width = 1024;
    ceilingLight1.shadow.mapSize.height = 1024;
    scene.add(ceilingLight1);
    scene.add(ceilingLight1.target);

    const ceilingLight2 = new THREE.SpotLight(0xffffff, 2.0, 30, Math.PI / 3.5, 0.4, 1.2);
    ceilingLight2.position.set(3.2, 8.5, 0);
    ceilingLight2.target.position.set(3.2, 0, 0);
    ceilingLight2.castShadow = true;
    ceilingLight2.shadow.mapSize.width = 1024;
    ceilingLight2.shadow.mapSize.height = 1024;
    scene.add(ceilingLight2);
    scene.add(ceilingLight2.target);

    // Cool fill light from front
    const fillLight = new THREE.DirectionalLight(0xbcd2ec, 0.8);
    fillLight.position.set(0, 10, 14);
    scene.add(fillLight);

    // 6. Architectural Room Geometry (Floor, Walls, Ceiling Beams)
    // Concrete floor with light epoxy finish and grid
    const floorGeo = new THREE.PlaneGeometry(24, 20);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe2ebf5, // Crisp light grey-blue epoxy floor
      roughness: 0.4,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    scene.add(floor);

    // Concrete Plinths (Equipment Mounting Pads) for G1 and G2
    const padMat = new THREE.MeshStandardMaterial({ color: 0xd0dceb, roughness: 0.6, metalness: 0.08 });
    const padGeo = new THREE.BoxGeometry(4.2, 0.25, 7.6);

    const pad1 = new THREE.Mesh(padGeo, padMat);
    pad1.position.set(-3.4, 0.125, 0);
    pad1.receiveShadow = true;
    scene.add(pad1);

    const pad2 = new THREE.Mesh(padGeo, padMat);
    pad2.position.set(3.4, 0.125, 0);
    pad2.receiveShadow = true;
    scene.add(pad2);

    // Yellow/Black Hazard Striping around plinths
    const hazardMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const createHazardBorder = (cx: number, cz: number, w: number, d: number) => {
      const borderThick = 0.12;
      const borderGeoX = new THREE.BoxGeometry(w + borderThick * 2, 0.02, borderThick);
      const borderGeoZ = new THREE.BoxGeometry(borderThick, 0.02, d);

      const bTop = new THREE.Mesh(borderGeoX, hazardMat);
      bTop.position.set(cx, 0.26, cz - d / 2 - borderThick / 2);
      scene.add(bTop);

      const bBottom = new THREE.Mesh(borderGeoX, hazardMat);
      bBottom.position.set(cx, 0.26, cz + d / 2 + borderThick / 2);
      scene.add(bBottom);

      const bLeft = new THREE.Mesh(borderGeoZ, hazardMat);
      bLeft.position.set(cx - w / 2 - borderThick / 2, 0.26, cz);
      scene.add(bLeft);

      const bRight = new THREE.Mesh(borderGeoZ, hazardMat);
      bRight.position.set(cx + w / 2 + borderThick / 2, 0.26, cz);
      scene.add(bRight);
    };
    createHazardBorder(-3.4, 0, 4.2, 7.6);
    createHazardBorder(3.4, 0, 4.2, 7.6);

    // Industrial Walls (Light scientific laboratory walls)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xdae6f2, roughness: 0.65 });
    const backWallGeo = new THREE.BoxGeometry(24, 9, 0.4);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 4.5, -9.8);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWallGeo = new THREE.BoxGeometry(0.4, 9, 20);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-11.8, 4.5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWallGeo = new THREE.BoxGeometry(0.4, 9, 20);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(11.8, 4.5, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Overhead Steel I-Beams (Gantry beams)
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.5 });
    for (let bz = -6; bz <= 6; bz += 4) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(24, 0.45, 0.25), beamMat);
      beam.position.set(0, 8.2, bz);
      beam.castShadow = true;
      scene.add(beam);
    }

    // 7. BUILD INDUSTRIAL GENERATOR MODELS (GENERATOR 01 & GENERATOR 02)
    interactiveObjectsRef.current.clear();

    const buildGeneratorModel = (id: 'generator-01' | 'generator-02', posX: number, isLead: boolean) => {
      const genGroup = new THREE.Group();
      genGroup.position.set(posX, 0.25, 0);
      scene.add(genGroup);

      const clickableMeshes: THREE.Object3D[] = [];

      // A. Skid Base (Heavy steel bedplate with lifting eyes)
      const skidMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      const skid = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 6.8), skidMat);
      skid.position.y = 0.175;
      skid.castShadow = true;
      skid.receiveShadow = true;
      genGroup.add(skid);
      clickableMeshes.push(skid);

      // B. Diesel Engine Block (Heavy cast iron, dark industrial grey)
      const engineMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.5 });
      const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 3.2), engineMat);
      engineBlock.position.set(0, 1.25, 0.5);
      engineBlock.castShadow = true;
      engineBlock.receiveShadow = true;
      genGroup.add(engineBlock);
      clickableMeshes.push(engineBlock);

      // Cylinder head covers (twin chrome/ribbed rows)
      const headMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.25 });
      const head1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 2.9), headMat);
      head1.position.set(-0.6, 2.25, 0.5);
      head1.castShadow = true;
      genGroup.add(head1);

      const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 2.9), headMat);
      head2.position.set(0.6, 2.25, 0.5);
      head2.castShadow = true;
      genGroup.add(head2);

      // C. Alternator Section (Rear heavy cylindrical copper generator)
      const altMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.35, metalness: 0.7 });
      const alternatorGeo = new THREE.CylinderGeometry(1.05, 1.05, 2.4, 24);
      alternatorGeo.rotateX(Math.PI / 2);
      const alternator = new THREE.Mesh(alternatorGeo, altMat);
      alternator.position.set(0, 1.25, -2.1);
      alternator.castShadow = true;
      alternator.receiveShadow = true;
      genGroup.add(alternator);
      clickableMeshes.push(alternator);

      // Alternator cooling fins ring
      const finMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
      const finRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 12, 24), finMat);
      finRing.position.set(0, 1.25, -2.8);
      genGroup.add(finRing);

      // Alternator Terminal Box (High-voltage tap)
      const termBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f233f, metalness: 0.5 });
      const termBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 1.1), termBoxMat);
      termBox.position.set(0, 2.3, -2.1);
      termBox.castShadow = true;
      genGroup.add(termBox);

      // D. Radiator Shroud & Spinning Fan (Front section)
      const radMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const radiator = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.1, 0.65), radMat);
      radiator.position.set(0, 1.4, 2.7);
      radiator.castShadow = true;
      genGroup.add(radiator);
      clickableMeshes.push(radiator);

      // Radiator grille mesh
      const grilleMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.9, wireframe: false });
      const grille = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24), grilleMat);
      grille.position.set(0, 1.4, 3.03);
      genGroup.add(grille);

      // 4-Blade Rotating Cooling Fan Group
      const fanGroup = new THREE.Group();
      fanGroup.position.set(0, 1.4, 2.92);
      const fanHubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16), fanHubMat);
      fanHub.rotateX(Math.PI / 2);
      fanGroup.add(fanHub);

      const bladeGeo = new THREE.BoxGeometry(0.2, 0.7, 0.03);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
      for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.z = (i * Math.PI) / 2;
        blade.position.set(
          Math.sin((i * Math.PI) / 2) * 0.45,
          Math.cos((i * Math.PI) / 2) * 0.45,
          0
        );
        fanGroup.add(blade);
      }
      genGroup.add(fanGroup);
      if (isLead) g1FanRef.current = fanGroup;
      else g2FanRef.current = fanGroup;

      // E. Exhaust Manifold & Vertical Stack
      const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x78716c, metalness: 0.8, roughness: 0.35 });
      const exhaustPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 16), exhaustMat);
      exhaustPipe1.position.set(0.8, 3.6, 0.2);
      exhaustPipe1.castShadow = true;
      genGroup.add(exhaustPipe1);
      clickableMeshes.push(exhaustPipe1);

      // Exhaust elbow passing into back wall
      const elbowGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.0, 16);
      elbowGeo.rotateX(Math.PI / 2);
      const exhaustPipe2 = new THREE.Mesh(elbowGeo, exhaustMat);
      exhaustPipe2.position.set(0.8, 5.2, -1.8);
      genGroup.add(exhaustPipe2);

      // F. Local Generator Controller & Status Light
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.2, 0.25), panelMat);
      panel.position.set(1.4, 1.4, -0.6);
      panel.castShadow = true;
      genGroup.add(panel);

      // Glowing Status Light Beacon
      const lightGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const initialColor = isLead ? 0x10b981 : 0xf59e0b; // Green for G1, Amber for G2
      const lightMat = new THREE.MeshStandardMaterial({
        color: initialColor,
        emissive: initialColor,
        emissiveIntensity: 1.2,
        roughness: 0.2
      });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(1.4, 2.1, -0.6);
      genGroup.add(lightMesh);

      // Dedicated Point Light for Beacon Glow
      const pointLight = new THREE.PointLight(initialColor, 1.2, 4.5);
      pointLight.position.set(1.4, 2.2, -0.6);
      genGroup.add(pointLight);

      if (isLead) {
        g1LightMeshRef.current = lightMesh;
        g1PointLightRef.current = pointLight;
        g1GroupRef.current = genGroup;
      } else {
        g2LightMeshRef.current = lightMesh;
        g2PointLightRef.current = pointLight;
        g2GroupRef.current = genGroup;
      }

      // 3D Equipment Label Plate
      const labelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      const labelPlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.05), labelMat);
      labelPlate.position.set(0, 0.5, 3.45);
      genGroup.add(labelPlate);

      interactiveObjectsRef.current.set(id, clickableMeshes);
    };

    buildGeneratorModel('generator-01', -3.8, true);
    buildGeneratorModel('generator-02', 3.8, false);

    // 8. FUEL SYSTEM (Overhead supply manifold, filter unit, drop pipes)
    const fuelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7, roughness: 0.3 }); // Yellow/amber fuel
    const fuelPipeGroup = new THREE.Group();
    scene.add(fuelPipeGroup);
    const fuelClickables: THREE.Object3D[] = [];

    // Main header pipe running horizontally along wall
    const mainFuelPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 16, 16), fuelMat);
    mainFuelPipe.rotateZ(Math.PI / 2);
    mainFuelPipe.position.set(0, 4.8, -7.5);
    mainFuelPipe.castShadow = true;
    fuelPipeGroup.add(mainFuelPipe);
    fuelClickables.push(mainFuelPipe);

    // Drop pipe to G1
    const dropFuelG1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16), fuelMat);
    dropFuelG1.position.set(-3.8, 3.2, -7.5);
    fuelPipeGroup.add(dropFuelG1);
    fuelClickables.push(dropFuelG1);

    // Run to G1 fuel inlet
    const g1InletPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.2, 16), fuelMat);
    g1InletPipe.rotateX(Math.PI / 2);
    g1InletPipe.position.set(-3.8, 1.6, -4.4);
    fuelPipeGroup.add(g1InletPipe);
    fuelClickables.push(g1InletPipe);

    // Drop pipe to G2
    const dropFuelG2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16), fuelMat);
    dropFuelG2.position.set(3.8, 3.2, -7.5);
    fuelPipeGroup.add(dropFuelG2);
    fuelClickables.push(dropFuelG2);

    const g2InletPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.2, 16), fuelMat);
    g2InletPipe.rotateX(Math.PI / 2);
    g2InletPipe.position.set(3.8, 1.6, -4.4);
    fuelPipeGroup.add(g2InletPipe);
    fuelClickables.push(g2InletPipe);

    // Fuel Day Tank on wall
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.5, roughness: 0.4 });
    const fuelTank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.4, 20), tankMat);
    fuelTank.position.set(-9.5, 4.5, -7.5);
    fuelTank.castShadow = true;
    fuelPipeGroup.add(fuelTank);
    fuelClickables.push(fuelTank);
    interactiveObjectsRef.current.set('fuel-system', fuelClickables);

    // 9. COOLING LOOP & HEAT RECOVERY (Cyan / Blue piping circuit)
    const coolMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.35 });
    const coolPipeGroup = new THREE.Group();
    scene.add(coolPipeGroup);
    const coolClickables: THREE.Object3D[] = [];

    // Coolant return pipe overhead
    const coolMain = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 16, 16), coolMat);
    coolMain.rotateZ(Math.PI / 2);
    coolMain.position.set(0, 5.6, -6.5);
    coolPipeGroup.add(coolMain);
    coolClickables.push(coolMain);

    // Downpipes to G1 & G2 radiators
    const coolDropG1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 16), coolMat);
    coolDropG1.position.set(-2.5, 3.5, 1.5);
    coolPipeGroup.add(coolDropG1);
    coolClickables.push(coolDropG1);

    const coolDropG2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 16), coolMat);
    coolDropG2.position.set(2.5, 3.5, 1.5);
    coolPipeGroup.add(coolDropG2);
    coolClickables.push(coolDropG2);

    // Heat Exchanger Unit (Wall-mounted plate exchanger)
    const hxMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.7, roughness: 0.3 });
    const hxUnit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.8), hxMat);
    hxUnit.position.set(9.5, 4.5, -6.5);
    hxUnit.castShadow = true;
    coolPipeGroup.add(hxUnit);
    coolClickables.push(hxUnit);
    interactiveObjectsRef.current.set('cooling-system', coolClickables);

    // 10. MAIN POWER BUS & DISTRIBUTION SWITCHGEAR
    const busMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.2 }); // Electric blue
    const powerBusGroup = new THREE.Group();
    scene.add(powerBusGroup);
    const busClickables: THREE.Object3D[] = [];

    // Overhead high-voltage busway trunk
    const buswayTrunk = new THREE.Mesh(new THREE.BoxGeometry(14, 0.35, 0.5), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    buswayTrunk.position.set(0, 6.2, -2.1);
    powerBusGroup.add(buswayTrunk);
    busClickables.push(buswayTrunk);

    // Busway conductor lines (Glow)
    const busLine = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.08, 0.12), busMat);
    busLine.position.set(0, 6.0, -2.1);
    powerBusGroup.add(busLine);
    busClickables.push(busLine);

    // Feeder drops from G1 & G2 alternators
    const g1Feeder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5, 12), busMat);
    g1Feeder.position.set(-3.8, 4.2, -2.1);
    powerBusGroup.add(g1Feeder);
    busClickables.push(g1Feeder);

    const g2Feeder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5, 12), busMat);
    g2Feeder.position.set(3.8, 4.2, -2.1);
    powerBusGroup.add(g2Feeder);
    busClickables.push(g2Feeder);

    // Central Switchgear Panel & SCADA Master Cabinet (Center rear)
    const scadaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const scadaCabinet = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 0.9), scadaMat);
    scadaCabinet.position.set(0, 1.4, -8.8);
    scadaCabinet.castShadow = true;
    powerBusGroup.add(scadaCabinet);
    busClickables.push(scadaCabinet);

    // Digital Synchroscope Display on SCADA panel
    const synchroMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
    const synchroScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), synchroMat);
    synchroScreen.position.set(0, 1.8, -8.34);
    powerBusGroup.add(synchroScreen);
    busClickables.push(synchroScreen);

    interactiveObjectsRef.current.set('power-bus', busClickables);

    // 11. BATTERY ENERGY STORAGE SYSTEM (BESS) CABINET
    const bessGroup = new THREE.Group();
    scene.add(bessGroup);
    const bessClickables: THREE.Object3D[] = [];

    const bessCabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.35 });
    const bessCab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.0, 1.4), bessCabMat);
    bessCab.position.set(-8.8, 1.5, 3.5);
    bessCab.castShadow = true;
    bessCab.receiveShadow = true;
    bessGroup.add(bessCab);
    bessClickables.push(bessCab);

    // BESS LED Status Strip (Green when nominal, pulsing when discharging)
    const bessLedMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.0
    });
    const bessLed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.05), bessLedMat);
    bessLed.position.set(-8.8, 2.6, 4.22);
    bessGroup.add(bessLed);

    // BESS Cable Feed to Power Bus
    const bessConduit = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    bessConduit.rotateX(Math.PI / 2);
    bessConduit.position.set(-8.8, 3.0, 0.2);
    bessGroup.add(bessConduit);
    bessClickables.push(bessConduit);

    interactiveObjectsRef.current.set('bess', bessClickables);

    // 12. ANIMATED FLOW PARTICLES (Fuel, Coolant, Electricity, BESS, Exhaust)
    // Particle count: Lightweight for maximum smooth 60fps performance
    const PARTICLE_COUNT = 60;

    // A. Fuel Particles (Yellow / Amber)
    const fuelGeo = new THREE.BufferGeometry();
    const fuelPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      fuelPos[i * 3 + 0] = -9.5 + (i / PARTICLE_COUNT) * 13.3; // along main header
      fuelPos[i * 3 + 1] = 4.8;
      fuelPos[i * 3 + 2] = -7.5;
    }
    fuelGeo.setAttribute('position', new THREE.BufferAttribute(fuelPos, 3));
    const fuelPartMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.28,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const fuelPoints = new THREE.Points(fuelGeo, fuelPartMat);
    scene.add(fuelPoints);
    fuelParticlesRef.current = fuelPoints;

    // B. Coolant Particles (Cyan / Blue)
    const coolGeo = new THREE.BufferGeometry();
    const coolPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      coolPos[i * 3 + 0] = -5.0 + (i / PARTICLE_COUNT) * 14.5;
      coolPos[i * 3 + 1] = 5.6;
      coolPos[i * 3 + 2] = -6.5;
    }
    coolGeo.setAttribute('position', new THREE.BufferAttribute(coolPos, 3));
    const coolPartMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.26,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const coolPoints = new THREE.Points(coolGeo, coolPartMat);
    scene.add(coolPoints);
    coolantParticlesRef.current = coolPoints;

    // C. Power Particles (Electric Blue / Violet)
    const powerGeo = new THREE.BufferGeometry();
    const powerPos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      powerPos[i * 3 + 0] = -5.5 + (i / PARTICLE_COUNT) * 11;
      powerPos[i * 3 + 1] = 6.0;
      powerPos[i * 3 + 2] = -2.1;
    }
    powerGeo.setAttribute('position', new THREE.BufferAttribute(powerPos, 3));
    const powerPartMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.32,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const powerPoints = new THREE.Points(powerGeo, powerPartMat);
    scene.add(powerPoints);
    powerParticlesRef.current = powerPoints;

    // D. BESS Discharge Particles (Surge towards busbar when active)
    const bessGeo = new THREE.BufferGeometry();
    const bessPos = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
      bessPos[i * 3 + 0] = -8.8;
      bessPos[i * 3 + 1] = 3.0;
      bessPos[i * 3 + 2] = 3.5 - (i / 30) * 5.6;
    }
    bessGeo.setAttribute('position', new THREE.BufferAttribute(bessPos, 3));
    const bessPartMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.34,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const bessPoints = new THREE.Points(bessGeo, bessPartMat);
    scene.add(bessPoints);
    bessParticlesRef.current = bessPoints;

    // E. Generator 01 Exhaust Particles (heat drift)
    const exGeo = new THREE.BufferGeometry();
    const exPos = new Float32Array(25 * 3);
    for (let i = 0; i < 25; i++) {
      exPos[i * 3 + 0] = -3.0 + (Math.random() - 0.5) * 0.2;
      exPos[i * 3 + 1] = 5.2 + (i / 25) * 2.2;
      exPos[i * 3 + 2] = -3.8;
    }
    exGeo.setAttribute('position', new THREE.BufferAttribute(exPos, 3));
    const exMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.22,
      transparent: true,
      opacity: 0.4
    });
    const exPoints = new THREE.Points(exGeo, exMat);
    scene.add(exPoints);
    exhaustParticlesRef.current = exPoints;

    // 13. RAYCASTING & POINTER INTERACTIONS (Click to inspect equipment)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const getEquipmentFromIntersect = (intersectObject: THREE.Object3D): string | null => {
      let curr: THREE.Object3D | null = intersectObject;
      while (curr) {
        for (const [eqId, meshList] of interactiveObjectsRef.current.entries()) {
          if (meshList.includes(curr) || curr.id === intersectObject.id) {
            return eqId;
          }
        }
        curr = curr.parent;
      }
      return null;
    };

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const allMeshes: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach((meshes) => allMeshes.push(...meshes));
      const intersects = raycaster.intersectObjects(allMeshes, true);

      if (intersects.length > 0) {
        const foundId = getEquipmentFromIntersect(intersects[0].object);
        if (foundId) {
          onSelectEquipment(foundId);
        }
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const allMeshes: THREE.Object3D[] = [];
      interactiveObjectsRef.current.forEach((meshes) => allMeshes.push(...meshes));
      const intersects = raycaster.intersectObjects(allMeshes, true);

      if (intersects.length > 0) {
        const foundId = getEquipmentFromIntersect(intersects[0].object);
        setHoveredEquipment(foundId);
        container.style.cursor = 'pointer';
      } else {
        setHoveredEquipment(null);
        container.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);
    renderer.domElement.addEventListener('mousemove', handlePointerMove);

    // 14. ANIMATION RENDER LOOP
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Mechanical Fan Rotations
      // Fan speed scales with simulated load
      const g1Speed = simulationState.generator1Running ? (0.15 + (simulationState.generatorLoad / 100) * 0.45) : 0;
      const g2Speed = simulationState.generator2Running ? (0.12 + (simulationState.generatorLoad / 100) * 0.35) : 0;

      if (g1FanRef.current) {
        g1FanRef.current.rotation.z += g1Speed;
      }
      if (g2FanRef.current) {
        g2FanRef.current.rotation.z += g2Speed;
      }

      // Mechanical Engine Micro-vibration (Stop when failed)
      if (g1GroupRef.current) {
        if (simulationState.generator1Running) {
          const vibAmp = 0.008 + (simulationState.generatorLoad / 100) * 0.012;
          g1GroupRef.current.position.y = 0.25 + Math.sin(elapsed * 45) * vibAmp;
        } else {
          g1GroupRef.current.position.y = 0.25;
        }
      }

      if (g2GroupRef.current) {
        if (simulationState.generator2Running) {
          const vibAmp = 0.006 + (simulationState.generatorLoad / 100) * 0.01;
          g2GroupRef.current.position.y = 0.25 + Math.sin(elapsed * 38) * vibAmp;
        } else {
          g2GroupRef.current.position.y = 0.25;
        }
      }

      // Update Beacon Light Status Materials
      if (g1LightMeshRef.current && g1PointLightRef.current) {
        const mat = g1LightMeshRef.current.material as THREE.MeshStandardMaterial;
        if (simulationState.generator1Running) {
          mat.color.setHex(0x10b981);
          mat.emissive.setHex(0x10b981);
          g1PointLightRef.current.color.setHex(0x10b981);
        } else {
          // Failure Mode: FLASHING RED
          const flash = Math.sin(elapsed * 8) > 0 ? 0xff2222 : 0x440000;
          mat.color.setHex(flash);
          mat.emissive.setHex(flash);
          g1PointLightRef.current.color.setHex(flash);
        }
      }

      if (g2LightMeshRef.current && g2PointLightRef.current) {
        const mat = g2LightMeshRef.current.material as THREE.MeshStandardMaterial;
        if (simulationState.generator2Running) {
          mat.color.setHex(0x10b981);
          mat.emissive.setHex(0x10b981);
          g2PointLightRef.current.color.setHex(0x10b981);
        } else {
          mat.color.setHex(0xf59e0b);
          mat.emissive.setHex(0xf59e0b);
          g2PointLightRef.current.color.setHex(0xf59e0b);
        }
      }

      // Animated Particle Streams
      const particleSpeedFactor = 0.4 + (simulationState.generatorLoad / 100) * 0.9;

      // 1. Fuel Flow Particles
      if (fuelParticlesRef.current) {
        const posAttr = fuelParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let x = posAttr.getX(i);
          x += delta * 3.5 * particleSpeedFactor;
          if (x > 4.5) x = -9.5;
          posAttr.setX(i, x);
        }
        posAttr.needsUpdate = true;
      }

      // 2. Coolant Flow Particles
      if (coolantParticlesRef.current) {
        const posAttr = coolantParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let x = posAttr.getX(i);
          x += delta * 4.2 * particleSpeedFactor;
          if (x > 9.5) x = -5.0;
          posAttr.setX(i, x);
        }
        posAttr.needsUpdate = true;
      }

      // 3. Power Bus Electricity Particles
      if (powerParticlesRef.current) {
        const posAttr = powerParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const speed = (simulationState.generator1Running || simulationState.generator2Running) ? (delta * 6.5 * particleSpeedFactor) : 0;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let x = posAttr.getX(i);
          x += speed;
          if (x > 5.5) x = -5.5;
          posAttr.setX(i, x);
        }
        posAttr.needsUpdate = true;
      }

      // 4. BESS Particles
      if (bessParticlesRef.current) {
        bessParticlesRef.current.visible = simulationState.bessDischarging;
        if (simulationState.bessDischarging) {
          const posAttr = bessParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < 30; i++) {
            let z = posAttr.getZ(i);
            z -= delta * 5.0;
            if (z < -2.1) z = 3.5;
            posAttr.setZ(i, z);
          }
          posAttr.needsUpdate = true;
        }
      }

      // 5. Exhaust Particles
      if (exhaustParticlesRef.current) {
        exhaustParticlesRef.current.visible = simulationState.generator1Running;
        if (simulationState.generator1Running) {
          const posAttr = exhaustParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < 25; i++) {
            let y = posAttr.getY(i);
            y += delta * 2.5 * particleSpeedFactor;
            if (y > 7.5) y = 5.2;
            posAttr.setY(i, y);
          }
          posAttr.needsUpdate = true;
        }
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
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.domElement.removeEventListener('click', handlePointerDown);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] bg-[#F0F5FC] rounded-3xl border border-[#D5E1F2] overflow-hidden shadow-xl select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Header HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D5E1F2] text-[#17213A] shadow-md pointer-events-auto">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulationState.generator1Running
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-rose-500 animate-ping'
            }`}
          />
          <span className="text-xs font-mono font-bold tracking-wider uppercase">
            {simulationState.generator1Running ? 'GENERATOR 01 ONLINE' : 'G1 TRIPPED / BESS ACTIVE'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs font-mono text-[#617FF2] font-semibold">{totalKw} kW TOTAL</span>
        </div>

        {/* Camera Views Preset Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-[#D5E1F2] pointer-events-auto shadow-md">
          <button
            onClick={() => setCameraPreset('isometric')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            ISOMETRIC
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            FRONT
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            TOP
          </button>
          <button
            onClick={() => setCameraPreset('closeup')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-700 hover:text-[#17213A] hover:bg-[#F4F8FE] transition-colors cursor-pointer"
          >
            CLOSE-UP
          </button>
        </div>
      </div>

      {/* Floating Hover Indicator when pointing at 3D machinery */}
      {hoveredEquipment && (
        <div className="absolute top-16 left-6 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm border border-sky-400/40 text-xs font-mono text-sky-200 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Click to inspect: {hoveredEquipment.replace('-', ' ').toUpperCase()}</span>
        </div>
      )}

      {/* FLOATING DETAIL INSPECTION PANEL BESIDE THE SELECTED OBJECT */}
      {selectedEquipment && (
        <div className="absolute top-20 right-5 w-80 max-w-[calc(100vw-40px)] bg-[#0B1220]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 text-white shadow-2xl z-30 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedEquipment === 'generator-01'
                      ? simulationState.generator1Running
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-rose-500 animate-ping'
                      : selectedEquipment === 'generator-02'
                      ? simulationState.generator2Running
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                      : 'bg-[#617FF2]'
                  }`}
                />
                <h4 className="text-sm font-extrabold font-mono tracking-tight text-white uppercase">
                  {selectedEquipment.replace('-', ' ')}
                </h4>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Physical Twin Telemetry Node
              </div>
            </div>

            <button
              onClick={() => onSelectEquipment(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* GENERATOR 01 SPECIFIC METRICS */}
          {selectedEquipment === 'generator-01' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-slate-400">Operational Status</span>
                <span
                  className={`font-bold ${
                    simulationState.generator1Running ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulationState.generator1Running ? '● RUNNING (LEAD)' : '● FAILED / TRIPPED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Load Sharing</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {simulationState.generator1Running ? `${simulationState.generatorLoad}%` : '0%'}
                  </div>
                  <div className="text-[10px] text-slate-500">{g1Kw} kW active</div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Operating Temp</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{g1Temp}°C</div>
                  <div className="text-[10px] text-slate-500">Nominal 75°C max</div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Engine Speed</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {simulationState.generator1Running ? '1,498 RPM' : '0 RPM'}
                  </div>
                  <div className="text-[10px] text-slate-500">Governor synced</div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Machine Health</div>
                  <div className="text-base font-bold text-sky-400 mt-0.5">
                    {simulationState.generator1Health}%
                  </div>
                  <div className="text-[10px] text-slate-500">Vibration nominal</div>
                </div>
              </div>
            </div>
          )}

          {/* GENERATOR 02 SPECIFIC METRICS */}
          {selectedEquipment === 'generator-02' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-slate-400">Operational Status</span>
                <span
                  className={`font-bold ${
                    simulationState.generator2Running ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {simulationState.generator2Running ? '● RUNNING (ACTIVE LOAD)' : '● WARM STANDBY'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Load Sharing</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {simulationState.generator2Running ? `${simulationState.generatorLoad}%` : 'Standby'}
                  </div>
                  <div className="text-[10px] text-slate-500">{g2Kw} kW active</div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Operating Temp</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{g2Temp}°C</div>
                  <div className="text-[10px] text-amber-400/80">Jacket warm</div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Machine Health</div>
                  <div className="text-base font-bold text-sky-400 mt-0.5">
                    {simulationState.generator2Health}%
                  </div>
                  <div className="text-[10px] text-slate-500">Service: 6–9 days</div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Oil Pressure</div>
                  <div className="text-base font-bold text-white mt-0.5">4.6 bar</div>
                  <div className="text-[10px] text-emerald-400">Lubricated</div>
                </div>
              </div>
            </div>
          )}

          {/* POWER BUS SPECIFIC METRICS */}
          {selectedEquipment === 'power-bus' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Grid Voltage:</span>
                  <span className="font-bold text-white">415.2 V AC (3-Phase)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frequency:</span>
                  <span className="font-bold text-emerald-400">50.04 Hz (Locked)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Load:</span>
                  <span className="font-bold text-sky-400">{totalKw} kW</span>
                </div>
              </div>

              <div className="p-2.5 bg-sky-950/40 rounded-xl border border-sky-500/20 text-[11px] text-sky-200">
                <div className="font-bold text-white mb-1">ELECTRICAL POWER ROUTE:</div>
                GENERATORS → 415V BUS → BESS INVERTER → STATION HABITAT & LABS
              </div>
            </div>
          )}

          {/* FUEL SYSTEM METRICS */}
          {selectedEquipment === 'fuel-system' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fuel Consumption:</span>
                  <span className="font-bold text-amber-400">{fuelBurnLhr} L / hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fuel Type:</span>
                  <span className="font-bold text-white">Arctic Jet A-1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Manifold Pressure:</span>
                  <span className="font-bold text-emerald-400">3.4 bar (Heated)</span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-500/20 text-[11px] text-amber-200">
                <div className="font-bold text-white mb-1">FUEL FEED ROUTE:</div>
                BULK TANKS → DAY TANK (-9.5m) → FUEL PIPE → INJECTORS
              </div>
            </div>
          )}

          {/* COOLING SYSTEM METRICS */}
          {selectedEquipment === 'cooling-system' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coolant Loop Supply:</span>
                  <span className="font-bold text-sky-400">68.5°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thermal Recovery:</span>
                  <span className="font-bold text-emerald-400">94.2% Efficiency</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hydronics Return:</span>
                  <span className="font-bold text-white">44.0°C</span>
                </div>
              </div>

              <div className="p-2.5 bg-cyan-950/40 rounded-xl border border-cyan-500/20 text-[11px] text-cyan-200">
                <div className="font-bold text-white mb-1">COOLING ROUTE:</div>
                ENGINE WATER JACKET → RADIATORS → HEAT RECOVERY → STATION HEATING
              </div>
            </div>
          )}

          {/* BESS CABINET METRICS */}
          {selectedEquipment === 'bess' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">State of Charge (SOC):</span>
                  <span className="font-bold text-emerald-400">{simulationState.bessSoc}% (120 kWh)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inverter State:</span>
                  <span
                    className={`font-bold ${
                      simulationState.bessDischarging ? 'text-amber-400 animate-pulse' : 'text-slate-300'
                    }`}
                  >
                    {simulationState.bessDischarging ? 'DISCHARGING (42 kW)' : 'STANDBY BUFFER'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cell Temp:</span>
                  <span className="font-bold text-white">21.8°C (Heated Pod)</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-200">
                <div className="font-bold text-white mb-1">BUFFER OPERATION:</div>
                LiFePO4 buffer instantly arrests microgrid voltage drops upon diesel generator trip.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Nav Instructions */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>DRAG to Rotate · WHEEL to Zoom · CLICK any machine to inspect</span>
        </div>
      </div>
    </div>
  );
};
