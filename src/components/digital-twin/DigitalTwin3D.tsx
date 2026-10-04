import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useStation } from '../../context/StationContext';
import { BuildingNode } from '../../types';
import {
  RotateCcw,
  Compass,
  Eye,
  Sun,
  Moon,
  CloudSnow,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  AlertTriangle,
  ArrowRight,
  X,
  ShieldAlert
} from 'lucide-react';

interface DigitalTwin3DProps {
  onSelectBuilding?: (buildingId: string) => void;
  selectedBuildingId: string | null;
  className?: string;
  compact?: boolean;
}

type EnvironmentMode = 'day' | 'aurora' | 'blizzard';

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  onSelectBuilding,
  selectedBuildingId,
  className = '',
  compact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stationId, buildings, selectBuilding, navigateTo } = useStation();

  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingNode | null>(null);
  const [envMode, setEnvMode] = useState<EnvironmentMode>('day');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAnomalyModal, setShowAnomalyModal] = useState<boolean>(false);
  const [hoveredAnomaly, setHoveredAnomaly] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const clickableMeshesRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const anomalyBeaconRef = useRef<{
    group: THREE.Group;
    sphere: THREE.Mesh;
    ring: THREE.Mesh;
    hitTarget: THREE.Mesh;
    stationId: string;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const snowParticlesRef = useRef<THREE.Points | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.5, 0));
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: stationId === 'bharati' ? Math.PI / 4 : 0,
    phi: Math.PI / 5.2,
    radius: stationId === 'bharati' ? 44 : 48
  });

  // Camera update helper
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(
      cameraTargetRef.current.x + x,
      cameraTargetRef.current.y + y,
      cameraTargetRef.current.z + z
    );
    cameraRef.current.lookAt(cameraTargetRef.current);
  }, []);

  // View Presets
  const setViewPreset = (preset: 'front' | 'iso' | 'top' | 'close') => {
    if (preset === 'front') {
      cameraTargetRef.current.set(0, 2.5, 0);
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 5.5, radius: 38 };
    } else if (preset === 'iso') {
      cameraTargetRef.current.set(0, 2.5, 0);
      cameraAngleRef.current = { theta: Math.PI / 3.8, phi: Math.PI / 4.6, radius: 42 };
    } else if (preset === 'top') {
      cameraTargetRef.current.set(0, 2.5, 0);
      cameraAngleRef.current = { theta: 0, phi: 0.12, radius: 52 };
    } else if (preset === 'close') {
      if (stationId === 'bharati') {
        cameraTargetRef.current.set(0, 3.5, 6);
        cameraAngleRef.current = { theta: Math.PI / 5, phi: Math.PI / 5.2, radius: 24 };
      } else {
        cameraTargetRef.current.set(0, 2.0, 0);
        cameraAngleRef.current = { theta: 0.05, phi: Math.PI / 5.5, radius: 26 };
      }
    }
    updateCameraPosition();
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const delta = direction === 'in' ? -5 : 5;
    cameraAngleRef.current.radius = Math.max(14, Math.min(85, cameraAngleRef.current.radius + delta));
    updateCameraPosition();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const isNight = envMode === 'aurora';
    scene.background = new THREE.Color(isNight ? 0x07101e : 0xdde9f7);
    scene.fog = new THREE.FogExp2(isNight ? 0x07101e : 0xdde9f7, 0.014);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 350);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb8d4f0, 0.9);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff8eb, 1.45);
    sunLight.position.set(30, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 140;
    const d = 34;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const fillLight = new THREE.AmbientLight(0x7da4d4, 0.55);
    scene.add(fillLight);

    // 5. Antarctic Terrain matching the real station landscapes
    // Maitri is situated on rocky permafrost ground (Schirmacher Oasis)
    // Bharati is situated on snowy permafrost hills (Larsemann Hills)
    const isMaitri = stationId === 'maitri';
    const terrainGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const ripple = Math.sin(x * 0.08) * Math.cos(z * 0.07) * 0.6 + Math.sin(z * 0.15) * 0.25;
      posAttr.setY(i, ripple);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: isMaitri ? 0x948979 : 0xf0f5fc, // Maitri has rocky permafrost, Bharati has bright snow
      roughness: 0.95,
      metalness: 0.05
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.position.y = -0.05;
    scene.add(terrainMesh);

    // Rocky outcrops (Nunataks and boulders)
    const rockMat = new THREE.MeshStandardMaterial({
      color: isMaitri ? 0x5a4a3a : 0x475569,
      roughness: 0.95
    });
    for (let i = 0; i < (isMaitri ? 24 : 12); i++) {
      const rockGeo = new THREE.DodecahedronGeometry(0.7 + Math.random() * 1.1, 1);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 75;
      const rz = (Math.random() - 0.5) * 75;
      if (Math.hypot(rx, rz) > 12) {
        rock.position.set(rx, 0.35, rz);
        rock.scale.set(1 + Math.random() * 1.2, 0.45 + Math.random() * 0.5, 1 + Math.random() * 1.2);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
      }
    }

    // Snow patches over rocky terrain for Maitri
    if (isMaitri) {
      const snowPatchGeo = new THREE.PlaneGeometry(12, 10);
      snowPatchGeo.rotateX(-Math.PI / 2);
      const snowPatchMat = new THREE.MeshStandardMaterial({ color: 0xf4f8fe, roughness: 0.9 });
      for (let s = 0; s < 7; s++) {
        const snowMesh = new THREE.Mesh(snowPatchGeo, snowPatchMat);
        snowMesh.position.set((Math.random() - 0.5) * 60, 0.02, (Math.random() - 0.5) * 60);
        snowMesh.rotation.y = Math.random() * Math.PI;
        snowMesh.scale.set(1 + Math.random(), 1, 1 + Math.random());
        snowMesh.receiveShadow = true;
        scene.add(snowMesh);
      }
    }

    clickableMeshesRef.current.clear();

    // =========================================================================
    // 6A. BHARATI STATION (MATCHING USER'S 1ST IMAGE EXACTLY)
    // =========================================================================
    if (!isMaitri) {
      const bharatiGroup = new THREE.Group();
      scene.add(bharatiGroup);

      // Materials matching the photo:
      // Silver-metallic insulated composite aluminum panels
      const silverPanelMat = new THREE.MeshStandardMaterial({
        color: 0xc8d1db,
        metalness: 0.85,
        roughness: 0.28
      });
      // Dark grey window frame and recessed panel trim
      const darkTrimMat = new THREE.MeshStandardMaterial({
        color: 0x1e2633,
        metalness: 0.5,
        roughness: 0.6
      });
      // Windows with warm glowing interior (as visible in the user's night photo)
      const glowingWindowMat = new THREE.MeshStandardMaterial({
        color: 0xffd97d,
        emissive: 0xff9900,
        emissiveIntensity: envMode === 'day' ? 0.45 : 0.95,
        roughness: 0.2
      });
      // Heavy V-pylon columns steel
      const vPylonMat = new THREE.MeshStandardMaterial({
        color: 0xd8e0ea,
        metalness: 0.75,
        roughness: 0.35
      });

      // 1. UPPER AERODYNAMIC HULL (Cantilevered trapezoidal aerodynamic shape)
      const upperLength = 26;
      const upperHeight = 3.6;
      const upperWidth = 12.5;

      const upperHullGeo = new THREE.BoxGeometry(upperWidth, upperHeight, upperLength);
      const upperHullMesh = new THREE.Mesh(upperHullGeo, silverPanelMat);
      upperHullMesh.position.set(0, 4.8, 0);
      upperHullMesh.castShadow = true;
      upperHullMesh.receiveShadow = true;
      upperHullMesh.userData = { buildingId: 'bharati-upper-deck', isClickable: true };
      bharatiGroup.add(upperHullMesh);

      // Add to clickable registry
      if (!clickableMeshesRef.current.has('bharati-upper-deck')) {
        clickableMeshesRef.current.set('bharati-upper-deck', []);
      }
      clickableMeshesRef.current.get('bharati-upper-deck')?.push(upperHullMesh);

      // 2. MASSIVE FRONT PANORAMIC OBSERVATION GLASS FACADE (at +Z)
      // Exactly matching the large front glass salon overlooking the icy bay in Image 1
      const frontGlassGeo = new THREE.PlaneGeometry(upperWidth * 0.88, upperHeight * 0.78);
      const frontGlassMesh = new THREE.Mesh(frontGlassGeo, glowingWindowMat);
      frontGlassMesh.position.set(0, 4.8, upperLength / 2 + 0.05);
      frontGlassMesh.userData = { buildingId: 'bharati-observation', isClickable: true };
      bharatiGroup.add(frontGlassMesh);

      // Observation front glass frame & mullions
      for (let m = -3; m <= 3; m++) {
        const mullionGeo = new THREE.BoxGeometry(0.12, upperHeight * 0.8, 0.15);
        const mullion = new THREE.Mesh(mullionGeo, darkTrimMat);
        mullion.position.set(m * 1.5, 4.8, upperLength / 2 + 0.1);
        bharatiGroup.add(mullion);
      }
      if (!clickableMeshesRef.current.has('bharati-observation')) {
        clickableMeshesRef.current.set('bharati-observation', []);
      }
      clickableMeshesRef.current.get('bharati-observation')?.push(frontGlassMesh);

      // 3. CONTINUOUS HORIZONTAL RIBBON WINDOWS ALONG BOTH FLANKS
      // As shown in both daytime and nighttime photos of Bharati
      const sideRibbonGeo = new THREE.BoxGeometry(0.08, 1.1, upperLength * 0.84);
      // Left side ribbon
      const leftRibbon = new THREE.Mesh(sideRibbonGeo, glowingWindowMat);
      leftRibbon.position.set(-upperWidth / 2 - 0.03, 5.0, 0);
      leftRibbon.userData = { buildingId: 'bharati-upper-deck', isClickable: true };
      bharatiGroup.add(leftRibbon);
      // Right side ribbon
      const rightRibbon = new THREE.Mesh(sideRibbonGeo, glowingWindowMat);
      rightRibbon.position.set(upperWidth / 2 + 0.03, 5.0, 0);
      rightRibbon.userData = { buildingId: 'bharati-upper-deck', isClickable: true };
      bharatiGroup.add(rightRibbon);

      // Vertical window dividers along the flanks
      for (let s = -upperLength * 0.38; s <= upperLength * 0.38; s += 2.0) {
        const sideMullionGeo = new THREE.BoxGeometry(0.14, 1.2, 0.12);
        const sideMullionL = new THREE.Mesh(sideMullionGeo, darkTrimMat);
        sideMullionL.position.set(-upperWidth / 2 - 0.06, 5.0, s);
        bharatiGroup.add(sideMullionL);

        const sideMullionR = new THREE.Mesh(sideMullionGeo, darkTrimMat);
        sideMullionR.position.set(upperWidth / 2 + 0.06, 5.0, s);
        bharatiGroup.add(sideMullionR);
      }

      // 4. RECESSED LOWER LEVEL (Nestled beneath the cantilever)
      const lowerLength = 17;
      const lowerHeight = 2.6;
      const lowerWidth = 9.2;
      const lowerDeckGeo = new THREE.BoxGeometry(lowerWidth, lowerHeight, lowerLength);
      const lowerDeckMesh = new THREE.Mesh(lowerDeckGeo, silverPanelMat);
      lowerDeckMesh.position.set(0, 2.0, -1.5);
      lowerDeckMesh.castShadow = true;
      lowerDeckMesh.receiveShadow = true;
      lowerDeckMesh.userData = { buildingId: 'bharati-lower-deck', isClickable: true };
      bharatiGroup.add(lowerDeckMesh);

      // Lower deck ribbon windows
      const lowerRibbonGeo = new THREE.BoxGeometry(0.08, 0.9, lowerLength * 0.75);
      const lowerRibbonL = new THREE.Mesh(lowerRibbonGeo, glowingWindowMat);
      lowerRibbonL.position.set(-lowerWidth / 2 - 0.03, 2.1, -1.5);
      bharatiGroup.add(lowerRibbonL);

      const lowerRibbonR = new THREE.Mesh(lowerRibbonGeo, glowingWindowMat);
      lowerRibbonR.position.set(lowerWidth / 2 + 0.03, 2.1, -1.5);
      bharatiGroup.add(lowerRibbonR);

      if (!clickableMeshesRef.current.has('bharati-lower-deck')) {
        clickableMeshesRef.current.set('bharati-lower-deck', []);
      }
      clickableMeshesRef.current.get('bharati-lower-deck')?.push(lowerDeckMesh);

      // 5. DISTINCTIVE HEAVY V-SHAPED STEEL COLUMNS / PYLONS (`\ / \ / \ /`)
      // Notice in Image 1: The pairs of angled columns forming clean V-structures under the cantilever!
      const pylonOffsetsZ = [9.5, 6.0, 2.5, -1.0, -4.5];
      const pylonSpreadX = upperWidth * 0.44;

      if (!clickableMeshesRef.current.has('bharati-v-stilts')) {
        clickableMeshesRef.current.set('bharati-v-stilts', []);
      }

      pylonOffsetsZ.forEach((pz, pIndex) => {
        [-pylonSpreadX, pylonSpreadX].forEach((px) => {
          // A pair of legs meeting at ground footing plate to form a 'V'
          const legHeight = 3.4;
          const legRadius = 0.22;
          const legGeo = new THREE.CylinderGeometry(legRadius * 0.85, legRadius * 1.15, legHeight, 10);

          // Left angled leg
          const leg1 = new THREE.Mesh(legGeo, vPylonMat);
          leg1.position.set(px, legHeight / 2, pz + 0.7);
          leg1.rotation.x = -Math.PI / 11;
          leg1.castShadow = true;
          leg1.userData = { buildingId: 'bharati-v-stilts', isClickable: true };
          bharatiGroup.add(leg1);
          clickableMeshesRef.current.get('bharati-v-stilts')?.push(leg1);

          // Right angled leg
          const leg2 = new THREE.Mesh(legGeo, vPylonMat);
          leg2.position.set(px, legHeight / 2, pz - 0.7);
          leg2.rotation.x = Math.PI / 11;
          leg2.castShadow = true;
          leg2.userData = { buildingId: 'bharati-v-stilts', isClickable: true };
          bharatiGroup.add(leg2);
          clickableMeshesRef.current.get('bharati-v-stilts')?.push(leg2);

          // Ground foundation base plate
          const footGeo = new THREE.BoxGeometry(0.8, 0.15, 0.8);
          const foot = new THREE.Mesh(footGeo, darkTrimMat);
          foot.position.set(px, 0.08, pz);
          foot.castShadow = true;
          bharatiGroup.add(foot);
        });
      });

      // 6. FRONT SERVICE PIPE GANTRY LATTICE TRUSS
      // Prominently shown running across the front foreground in both Bharati photos!
      const gantryLength = 34;
      const gantryGeo = new THREE.BoxGeometry(gantryLength, 0.45, 0.45);
      const gantryMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const gantryMesh = new THREE.Mesh(gantryGeo, gantryMat);
      gantryMesh.position.set(0, 1.2, 14.5);
      gantryMesh.castShadow = true;
      bharatiGroup.add(gantryMesh);

      // Gantry support towers
      for (let gx = -15; gx <= 15; gx += 7.5) {
        const gPostGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.2, 8);
        const gPost = new THREE.Mesh(gPostGeo, gantryMat);
        gPost.position.set(gx, 0.6, 14.5);
        gPost.castShadow = true;
        bharatiGroup.add(gPost);
      }

      // 7. PARKED RED TRACKED POLAR SNOWCATS (PISTENBULLY)
      // Visible under the overhang in the night photo of Bharati!
      const snowcat1 = createPolarSnowcat(0xef4444);
      snowcat1.position.set(3.5, 0.2, 9.8);
      snowcat1.rotation.y = -Math.PI / 12;
      bharatiGroup.add(snowcat1);

      const snowcat2 = createPolarSnowcat(0xef4444);
      snowcat2.position.set(6.8, 0.2, 8.5);
      snowcat2.rotation.y = -Math.PI / 8;
      bharatiGroup.add(snowcat2);

      // 8. C-BAND RADOME EARTH STATION & FUEL MANIFOLD (Rear & Periphery)
      const commsTowerGroup = createSatelliteEarthStation();
      commsTowerGroup.position.set(13, 0, 4);
      commsTowerGroup.userData = { buildingId: 'bharati-comms', isClickable: true };
      bharatiGroup.add(commsTowerGroup);
      if (!clickableMeshesRef.current.has('bharati-comms')) {
        clickableMeshesRef.current.set('bharati-comms', []);
      }
      clickableMeshesRef.current.get('bharati-comms')?.push(commsTowerGroup);

      const fuelTanksGroup = createInsulatedFuelTanks();
      fuelTanksGroup.position.set(-11, 0, -6);
      fuelTanksGroup.userData = { buildingId: 'bharati-fuel', isClickable: true };
      bharatiGroup.add(fuelTanksGroup);
      if (!clickableMeshesRef.current.has('bharati-fuel')) {
        clickableMeshesRef.current.set('bharati-fuel', []);
      }
      clickableMeshesRef.current.get('bharati-fuel')?.push(fuelTanksGroup);

      // Visual 3D anomaly marker on Bharati lower utility deck (HVAC / Substation Bay)
      const anomalyGroup = new THREE.Group();
      anomalyGroup.position.set(-6, 4.0, -1.8);

      const beaconSphereGeo = new THREE.SphereGeometry(0.44, 24, 24);
      const beaconSphereMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xfbbf24,
        emissiveIntensity: 1.8,
        roughness: 0.15
      });
      const beaconSphere = new THREE.Mesh(beaconSphereGeo, beaconSphereMat);
      beaconSphere.userData = { isAnomalyPoint: true, stationId: 'bharati' };
      anomalyGroup.add(beaconSphere);

      const beaconRingGeo = new THREE.RingGeometry(0.55, 0.85, 32);
      const beaconRingMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beaconRing.rotation.x = Math.PI / 2;
      beaconRing.userData = { isAnomalyPoint: true, stationId: 'bharati' };
      anomalyGroup.add(beaconRing);

      // Large invisible hit target for easy clicking and touch
      const hitTargetGeo = new THREE.SphereGeometry(1.3, 16, 16);
      const hitTargetMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
      const hitTarget = new THREE.Mesh(hitTargetGeo, hitTargetMat);
      hitTarget.userData = { isAnomalyPoint: true, stationId: 'bharati' };
      anomalyGroup.add(hitTarget);

      bharatiGroup.add(anomalyGroup);
      anomalyBeaconRef.current = { group: anomalyGroup, sphere: beaconSphere, ring: beaconRing, hitTarget, stationId: 'bharati' };

    } else {
      // =========================================================================
      // 6B. MAITRI STATION (MATCHING USER'S 2ND IMAGE EXACTLY)
      // =========================================================================
      const maitriGroup = new THREE.Group();
      scene.add(maitriGroup);

      // Colors matching the photo:
      // Sage-green / olive-grey container panels
      const maitriSageMat = new THREE.MeshStandardMaterial({
        color: 0x768d7f,
        roughness: 0.55,
        metalness: 0.15
      });
      // Indian Flag colors for the central facade
      const flagSaffronMat = new THREE.MeshStandardMaterial({ color: 0xff7722, roughness: 0.5 });
      const flagWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const flagGreenMat = new THREE.MeshStandardMaterial({ color: 0x138808, roughness: 0.5 });
      const chakraBlueMat = new THREE.MeshStandardMaterial({ color: 0x000080, roughness: 0.3 });

      // Steel truss stilts material
      const steelTrussMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, metalness: 0.75, roughness: 0.45 });
      // White window frames
      const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const windowGlassMat = new THREE.MeshStandardMaterial({
        color: 0xa8c5da,
        roughness: 0.1,
        metalness: 0.3
      });

      // 1. ELEVATED LONG MODULAR CONTAINER STRUCTURE
      // In the photo, Maitri is a single long rectangular block on stilts!
      const totalLength = 32.0;
      const stationHeight = 3.6;
      const stationDepth = 6.4;
      const stiltHeight = 1.6; // clearance above permafrost

      const mainBodyGeo = new THREE.BoxGeometry(totalLength, stationHeight, stationDepth);
      const mainBodyMesh = new THREE.Mesh(mainBodyGeo, maitriSageMat);
      mainBodyMesh.position.set(0, stiltHeight + stationHeight / 2, 0);
      mainBodyMesh.castShadow = true;
      mainBodyMesh.receiveShadow = true;
      mainBodyMesh.userData = { buildingId: 'maitri-living-quarters', isClickable: true };
      maitriGroup.add(mainBodyMesh);

      if (!clickableMeshesRef.current.has('maitri-living-quarters')) {
        clickableMeshesRef.current.set('maitri-living-quarters', []);
      }
      clickableMeshesRef.current.get('maitri-living-quarters')?.push(mainBodyMesh);

      // 2. CENTRAL ENTRYWAY & INDIAN TRICOLOR (The defining centerpiece of Maitri)
      // Raised central block protruding slightly forward with the Indian Flag!
      const centerWidth = 5.2;
      const centerDepth = stationDepth + 0.35;
      const centerHeight = stationHeight + 0.5;

      const centerBlockGeo = new THREE.BoxGeometry(centerWidth, centerHeight, centerDepth);
      const centerBlockMesh = new THREE.Mesh(centerBlockGeo, maitriSageMat);
      centerBlockMesh.position.set(0, stiltHeight + centerHeight / 2, 0.15);
      centerBlockMesh.castShadow = true;
      centerBlockMesh.userData = { buildingId: 'maitri-tricolor-hub', isClickable: true };
      maitriGroup.add(centerBlockMesh);

      if (!clickableMeshesRef.current.has('maitri-tricolor-hub')) {
        clickableMeshesRef.current.set('maitri-tricolor-hub', []);
      }
      clickableMeshesRef.current.get('maitri-tricolor-hub')?.push(centerBlockMesh);

      // THE INDIAN TRICOLOR ON THE FACADE:
      // Saffron Band (Top)
      const flagWidth = centerWidth * 0.9;
      const bandHeight = 0.45;
      const saffronBand = new THREE.Mesh(
        new THREE.PlaneGeometry(flagWidth, bandHeight),
        flagSaffronMat
      );
      saffronBand.position.set(0, stiltHeight + centerHeight - 0.5, centerDepth / 2 + 0.19);
      maitriGroup.add(saffronBand);

      // White Band (Middle)
      const whiteBand = new THREE.Mesh(
        new THREE.PlaneGeometry(flagWidth, bandHeight),
        flagWhiteMat
      );
      whiteBand.position.set(0, stiltHeight + centerHeight - 0.5 - bandHeight, centerDepth / 2 + 0.19);
      maitriGroup.add(whiteBand);

      // Ashoka Chakra (Center of White Band)
      const chakraRing = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.15, 16),
        chakraBlueMat
      );
      chakraRing.position.set(0, stiltHeight + centerHeight - 0.5 - bandHeight, centerDepth / 2 + 0.2);
      maitriGroup.add(chakraRing);

      // Green Band (Bottom)
      const greenBand = new THREE.Mesh(
        new THREE.PlaneGeometry(flagWidth, bandHeight),
        flagGreenMat
      );
      greenBand.position.set(0, stiltHeight + centerHeight - 0.5 - bandHeight * 2, centerDepth / 2 + 0.19);
      maitriGroup.add(greenBand);

      // 3. MAIN STEEL ACCESS STAIRCASE & HANDRAILS (Descending from central door)
      // Exactly matching the center stairs in the photo!
      const stairSteps = 8;
      const stairWidth = 1.8;
      for (let st = 0; st < stairSteps; st++) {
        const stepY = (st / stairSteps) * stiltHeight;
        const stepZ = centerDepth / 2 + (1 - st / stairSteps) * 2.8;
        const stepGeo = new THREE.BoxGeometry(stairWidth, 0.12, 0.4);
        const stepMesh = new THREE.Mesh(stepGeo, steelTrussMat);
        stepMesh.position.set(0, stepY + 0.06, stepZ);
        stepMesh.castShadow = true;
        maitriGroup.add(stepMesh);
      }

      // Secondary stair on the right side (visible in the photo)
      for (let st = 0; st < stairSteps; st++) {
        const stepY = (st / stairSteps) * stiltHeight;
        const stepZ = stationDepth / 2 + (1 - st / stairSteps) * 2.6;
        const stepGeo = new THREE.BoxGeometry(1.2, 0.12, 0.35);
        const stepMesh = new THREE.Mesh(stepGeo, steelTrussMat);
        stepMesh.position.set(12.5, stepY + 0.06, stepZ);
        stepMesh.castShadow = true;
        maitriGroup.add(stepMesh);
      }

      // 4. REGULAR ROW OF WHITE-FRAMED RECTANGULAR WINDOWS
      // Notice in Image 2: Regular uniform windows lining the entire length of the building
      const winCountPerSide = 10;
      for (let w = -winCountPerSide; w <= winCountPerSide; w++) {
        // Skip where central entrance is
        if (Math.abs(w) <= 1) continue;
        const wx = (w / winCountPerSide) * (totalLength / 2 - 1.2);

        // Front window frame
        const winFrameGeo = new THREE.BoxGeometry(0.7, 0.9, 0.08);
        const winFrame = new THREE.Mesh(winFrameGeo, windowFrameMat);
        winFrame.position.set(wx, stiltHeight + stationHeight * 0.55, stationDepth / 2 + 0.04);
        maitriGroup.add(winFrame);

        // Front glass
        const winGlassGeo = new THREE.BoxGeometry(0.52, 0.72, 0.02);
        const winGlass = new THREE.Mesh(winGlassGeo, windowGlassMat);
        winGlass.position.set(wx, stiltHeight + stationHeight * 0.55, stationDepth / 2 + 0.09);
        maitriGroup.add(winGlass);

        // Rear window
        const winFrameBack = new THREE.Mesh(winFrameGeo, windowFrameMat);
        winFrameBack.position.set(wx, stiltHeight + stationHeight * 0.55, -stationDepth / 2 - 0.04);
        maitriGroup.add(winFrameBack);
      }

      // 5. STEEL TRUSS STILTS WITH DIAGONAL CROSS-BRACES (UNDERNEATH)
      // Exactly matching the structural undercarriage in the photo
      const stiltCount = 14;
      for (let i = 0; i < stiltCount; i++) {
        const sx = -totalLength / 2 + 1.2 + (i / (stiltCount - 1)) * (totalLength - 2.4);

        [-stationDepth * 0.42, stationDepth * 0.42].forEach((sz) => {
          // Vertical stilt leg
          const pylonGeo = new THREE.BoxGeometry(0.18, stiltHeight, 0.18);
          const pylon = new THREE.Mesh(pylonGeo, steelTrussMat);
          pylon.position.set(sx, stiltHeight / 2, sz);
          pylon.castShadow = true;
          maitriGroup.add(pylon);
        });

        // Diagonal X-cross brace between front and back stilts
        const crossGeo = new THREE.CylinderGeometry(0.04, 0.04, Math.hypot(stationDepth * 0.84, stiltHeight), 6);
        const cross1 = new THREE.Mesh(crossGeo, steelTrussMat);
        cross1.position.set(sx, stiltHeight / 2, 0);
        cross1.rotation.x = Math.atan2(stiltHeight, stationDepth * 0.84);
        maitriGroup.add(cross1);

        const cross2 = new THREE.Mesh(crossGeo, steelTrussMat);
        cross2.position.set(sx, stiltHeight / 2, 0);
        cross2.rotation.x = -Math.atan2(stiltHeight, stationDepth * 0.84);
        maitriGroup.add(cross2);
      }

      // 6. ROOFTOP COMMUNICATIONS RADOME & ANTENNA MASTS
      // Cylindrical white radome / cupola above center block in the photo
      const roofRadomeGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.2, 16);
      const roofRadomeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const roofRadome = new THREE.Mesh(roofRadomeGeo, roofRadomeMat);
      roofRadome.position.set(0, stiltHeight + centerHeight + 0.6, 0);
      roofRadome.castShadow = true;
      roofRadome.userData = { buildingId: 'maitri-radome', isClickable: true };
      maitriGroup.add(roofRadome);

      if (!clickableMeshesRef.current.has('maitri-radome')) {
        clickableMeshesRef.current.set('maitri-radome', []);
      }
      clickableMeshesRef.current.get('maitri-radome')?.push(roofRadome);

      // Antenna Wire Towers & Mast poles on the roof
      for (let ax = -10; ax <= 10; ax += 10) {
        const mastGeo = new THREE.CylinderGeometry(0.05, 0.08, 6.0, 8);
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const mast = new THREE.Mesh(mastGeo, mastMat);
        mast.position.set(ax, stiltHeight + stationHeight + 3.0, 0);
        mast.castShadow = true;
        maitriGroup.add(mast);
      }

      // 7. ADJACENT GENERATOR ANNEX & FUEL TANKS (Connected via pipe gantry)
      const genAnnexGeo = new THREE.BoxGeometry(6.5, 3.0, 5.0);
      const genAnnex = new THREE.Mesh(genAnnexGeo, new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 }));
      genAnnex.position.set(-totalLength / 2 - 4.5, 1.5, -4);
      genAnnex.castShadow = true;
      genAnnex.userData = { buildingId: 'maitri-generator', isClickable: true };
      maitriGroup.add(genAnnex);

      // Twin exhaust stacks on generator annex
      for (let ex = -1; ex <= 1; ex += 2) {
        const stackGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8);
        const stack = new THREE.Mesh(stackGeo, new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9 }));
        stack.position.set(-totalLength / 2 - 4.5 + ex * 1.2, 3.8, -4);
        genAnnex.add(stack);
      }

      if (!clickableMeshesRef.current.has('maitri-generator')) {
        clickableMeshesRef.current.set('maitri-generator', []);
      }
      clickableMeshesRef.current.get('maitri-generator')?.push(genAnnex);

      // 7.b VISUAL 3D ANOMALY INDICATOR: Pulsing sphere and expanding halo on Generator Annex (Image 1 match)
      const anomalyGroup = new THREE.Group();
      anomalyGroup.position.set(-totalLength / 2 - 4.5, 4.15, -4);

      const beaconSphereGeo = new THREE.SphereGeometry(0.44, 24, 24);
      const beaconSphereMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xfbbf24,
        emissiveIntensity: 1.8,
        roughness: 0.15
      });
      const beaconSphere = new THREE.Mesh(beaconSphereGeo, beaconSphereMat);
      beaconSphere.userData = { isAnomalyPoint: true, stationId: 'maitri' };
      anomalyGroup.add(beaconSphere);

      const beaconRingGeo = new THREE.RingGeometry(0.55, 0.85, 32);
      const beaconRingMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beaconRing.rotation.x = Math.PI / 2;
      beaconRing.userData = { isAnomalyPoint: true, stationId: 'maitri' };
      anomalyGroup.add(beaconRing);

      // Large invisible hit target for easy clicking and touch
      const hitTargetGeo = new THREE.SphereGeometry(1.3, 16, 16);
      const hitTargetMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
      const hitTarget = new THREE.Mesh(hitTargetGeo, hitTargetMat);
      hitTarget.userData = { isAnomalyPoint: true, stationId: 'maitri' };
      anomalyGroup.add(hitTarget);

      maitriGroup.add(anomalyGroup);
      anomalyBeaconRef.current = { group: anomalyGroup, sphere: beaconSphere, ring: beaconRing, hitTarget, stationId: 'maitri' };

      // Fuel Tank Farm (cylindrical horizontal tanks)
      const fuelFarm = createInsulatedFuelTanks();
      fuelFarm.position.set(totalLength / 2 + 5.0, 0, -5);
      fuelFarm.userData = { buildingId: 'maitri-fuel', isClickable: true };
      maitriGroup.add(fuelFarm);

      if (!clickableMeshesRef.current.has('maitri-fuel')) {
        clickableMeshesRef.current.set('maitri-fuel', []);
      }
      clickableMeshesRef.current.get('maitri-fuel')?.push(fuelFarm);
    }

    // Helper functions for accessories
    function createPolarSnowcat(colorHex: number): THREE.Group {
      const cat = new THREE.Group();
      // Cab
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.3, 1.6),
        new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 })
      );
      cab.position.y = 0.9;
      cab.castShadow = true;
      cat.add(cab);

      // Windshield
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 1.62),
        new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 })
      );
      win.position.set(0.6, 1.1, 0);
      cat.add(win);

      // Headlights
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff382 });
      const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.25), lightMat);
      hlL.position.set(1.22, 0.8, 0.5);
      cat.add(hlL);
      const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.25), lightMat);
      hlR.position.set(1.22, 0.8, -0.5);
      cat.add(hlR);

      // Heavy crawler tracks
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.9 });
      const leftTrack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.42), trackMat);
      leftTrack.position.set(0, 0.23, 0.95);
      cat.add(leftTrack);
      const rightTrack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.42), trackMat);
      rightTrack.position.set(0, 0.23, -0.95);
      cat.add(rightTrack);

      return cat;
    }

    function createSatelliteEarthStation(): THREE.Group {
      const grp = new THREE.Group();
      const pylon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.45, 3.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 })
      );
      pylon.position.y = 1.75;
      pylon.castShadow = true;
      grp.add(pylon);

      // Radome sphere
      const radome = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
      );
      radome.position.y = 4.3;
      radome.castShadow = true;
      grp.add(radome);
      return grp;
    }

    function createInsulatedFuelTanks(): THREE.Group {
      const grp = new THREE.Group();
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.4 });
      for (let i = -1; i <= 1; i++) {
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4.5, 16), tankMat);
        cyl.rotation.z = Math.PI / 2;
        cyl.position.set(0, 0.9 + (i + 1) * 0.35, i * 1.5);
        cyl.castShadow = true;
        grp.add(cyl);
      }
      return grp;
    }

    // 8. Snow Particle System
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 90;
      particlePositions[i + 1] = Math.random() * 32;
      particlePositions[i + 2] = (Math.random() - 0.5) * 90;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.16,
      transparent: true,
      opacity: 0.45
    });
    const snowParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(snowParticles);
    snowParticlesRef.current = snowParticles;

    // 9. Pointer Event Listeners for Raycasting & Drag Orbit
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        cameraAngleRef.current.theta -= deltaX * 0.007;
        cameraAngleRef.current.phi = Math.max(
          0.08,
          Math.min(Math.PI / 2.1, cameraAngleRef.current.phi - deltaY * 0.007)
        );

        updateCameraPosition();
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // 1. Raycast hover test against Anomaly Marker first
        raycaster.setFromCamera(mouse, camera);
        if (anomalyBeaconRef.current) {
          const anomalyTargets = [
            anomalyBeaconRef.current.hitTarget,
            anomalyBeaconRef.current.sphere,
            anomalyBeaconRef.current.ring
          ];
          const anomalyHits = raycaster.intersectObjects(anomalyTargets, true);
          if (anomalyHits.length > 0) {
            setHoveredAnomaly(true);
            setHoveredBuilding(null);
            renderer.domElement.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredAnomaly(false);

        // 2. Raycast hover test across clickable nodes
        const allClickable: THREE.Object3D[] = [];
        clickableMeshesRef.current.forEach((meshArr) => {
          allClickable.push(...meshArr);
        });

        const intersects = raycaster.intersectObjects(allClickable, true);
        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          let foundId: string | null = null;
          while (topObj && !foundId) {
            if (topObj.userData?.buildingId) {
              foundId = topObj.userData.buildingId;
            }
            topObj = topObj.parent;
          }
          if (foundId) {
            const found = buildings.find((b) => b.id === foundId) || null;
            setHoveredBuilding(found);
            renderer.domElement.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredBuilding(null);
        renderer.domElement.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = Math.abs(e.clientX - previousMousePositionRef.current.x);
        const deltaY = Math.abs(e.clientY - previousMousePositionRef.current.y);

        if (deltaX < 6 && deltaY < 6) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

          // 1. Check if user clicked the Anomaly Marker
          raycaster.setFromCamera(mouse, camera);
          if (anomalyBeaconRef.current) {
            const anomalyTargets = [
              anomalyBeaconRef.current.hitTarget,
              anomalyBeaconRef.current.sphere,
              anomalyBeaconRef.current.ring
            ];
            const anomalyHits = raycaster.intersectObjects(anomalyTargets, true);
            if (anomalyHits.length > 0) {
              setShowAnomalyModal(true);
              isDraggingRef.current = false;
              return;
            }
          }

          // 2. Clickable buildings
          const allClickable: THREE.Object3D[] = [];
          clickableMeshesRef.current.forEach((meshArr) => {
            allClickable.push(...meshArr);
          });

          const intersects = raycaster.intersectObjects(allClickable, true);
          if (intersects.length > 0) {
            let topObj: THREE.Object3D | null = intersects[0].object;
            let foundId: string | null = null;
            while (topObj && !foundId) {
              if (topObj.userData?.buildingId) {
                foundId = topObj.userData.buildingId;
              }
              topObj = topObj.parent;
            }
            if (foundId) {
              if (onSelectBuilding) {
                onSelectBuilding(foundId);
              } else {
                selectBuilding(foundId);
              }
            }
          }
        }
      }
      isDraggingRef.current = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95;
      cameraAngleRef.current.radius = Math.max(
        14,
        Math.min(85, cameraAngleRef.current.radius * zoomFactor)
      );
      updateCameraPosition();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Slow ambient turntable rotation if enabled & not dragging
      if (isRotating && !isDraggingRef.current) {
        cameraAngleRef.current.theta += delta * 0.045;
        updateCameraPosition();
      }

      // Snow particle drift
      if (snowParticlesRef.current) {
        const positions = snowParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const speed = envMode === 'blizzard' ? 0.35 : 0.06;
        const windX = envMode === 'blizzard' ? 0.25 : 0.02;

        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= speed;
          positions[i - 1] += windX;
          if (positions[i] < 0) {
            positions[i] = 32;
          }
          if (positions[i - 1] > 45) {
            positions[i - 1] = -45;
          }
        }
        snowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Anomaly beacon pulsing & wave expansion
      if (anomalyBeaconRef.current) {
        const t = clock.getElapsedTime();
        const pulse = 1.0 + Math.sin(t * 6) * 0.22;
        anomalyBeaconRef.current.sphere.scale.set(pulse, pulse, pulse);

        const ringProgress = (t * 1.2) % 1;
        const ringScale = 0.6 + ringProgress * 2.6;
        const ringOpacity = Math.max(0, 0.9 * (1 - ringProgress));
        anomalyBeaconRef.current.ring.scale.set(ringScale, ringScale, ringScale);
        (anomalyBeaconRef.current.ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [stationId, buildings, updateCameraPosition, isRotating, onSelectBuilding, selectBuilding, envMode]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-gradient-to-b from-[#DCEBF9] to-[#EAF2FC] ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : compact ? 'h-[360px]' : 'h-[520px] lg:h-[600px]'
      } ${className}`}
    >
      {/* Three.js canvas container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: 3D HUD Title & Status */}
      <div className="absolute top-5 left-5 pointer-events-none z-10">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#617FF2] uppercase font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {stationId === 'bharati'
              ? 'Bharati Aerodynamic V-Pylon Digital Twin'
              : 'Maitri Schirmacher Modular Digital Twin'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">True Scale Model</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {stationId === 'bharati'
            ? 'Silver composite cantilever hull with V-shaped stilts and panoramic observation salon'
            : 'Elevated sage-green modular blocks on steel truss piles with central Indian Tricolor'}
        </p>
      </div>

      {/* Top Center: Prominent Real-time Anomaly Chip */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center">
        <button
          onClick={() => setShowAnomalyModal(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/95 hover:bg-amber-600 text-white backdrop-blur-md shadow-lg border border-amber-300/60 text-xs font-mono font-bold transition-all cursor-pointer animate-pulse hover:animate-none"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>1 ACTIVE ANOMALY: G2 COOLANT DRIFT (+6.2°C)</span>
          <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full uppercase">INSPECT</span>
        </button>
      </div>

      {/* Top Right: Preset View & Environment Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        {/* Environment Modes */}
        <div className="flex items-center bg-white/90 backdrop-blur-md rounded-xl p-1 border border-[#D5E1F2] shadow-sm">
          <button
            onClick={() => setEnvMode('day')}
            title="Daylight mode"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              envMode === 'day' ? 'bg-[#617FF2] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEnvMode('aurora')}
            title="Night / Glowing Interior mode"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              envMode === 'aurora' ? 'bg-[#0B1220] text-amber-400' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEnvMode('blizzard')}
            title="Blizzard simulation mode"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              envMode === 'blizzard' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudSnow className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Presets */}
        <div className="hidden sm:flex items-center bg-white/90 backdrop-blur-md rounded-xl p-1 border border-[#D5E1F2] shadow-sm text-xs font-medium">
          <button
            onClick={() => setViewPreset('front')}
            className="px-2.5 py-1 text-slate-700 hover:text-[#617FF2] transition-colors cursor-pointer"
          >
            Facade Front
          </button>
          <button
            onClick={() => setViewPreset('iso')}
            className="px-2.5 py-1 text-slate-700 hover:text-[#617FF2] transition-colors cursor-pointer"
          >
            Isometric
          </button>
          <button
            onClick={() => setViewPreset('close')}
            className="px-2.5 py-1 text-slate-700 hover:text-[#617FF2] transition-colors cursor-pointer"
          >
            Close-Up
          </button>
          <button
            onClick={() => setViewPreset('top')}
            className="px-2.5 py-1 text-slate-700 hover:text-[#617FF2] transition-colors cursor-pointer"
          >
            Top-Down
          </button>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center bg-white/90 backdrop-blur-md rounded-xl p-1 border border-[#D5E1F2] shadow-sm">
          <button
            onClick={() => setIsRotating((prev) => !prev)}
            title={isRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isRotating ? 'text-[#617FF2] bg-[#EAF2FC]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            title="Toggle Fullscreen"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hover Tooltip for Yellow Anomaly Marker */}
      {hoveredAnomaly && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-2xl shadow-2xl border border-amber-300 flex items-center gap-2 text-xs font-mono animate-bounce">
          <AlertTriangle className="w-4 h-4 text-slate-950" />
          <span>
            {stationId === 'bharati'
              ? 'CLICK YELLOW POINT: Blower Fan 03 Bearing Anomaly'
              : 'CLICK YELLOW POINT: Generator 02 Coolant Valve Anomaly'}
          </span>
        </div>
      )}

      {/* Floating Hover Label for Buildings */}
      {hoveredBuilding && !hoveredAnomaly && (
        <div className="absolute bottom-5 left-5 z-20 pointer-events-none bg-[#0B1220]/90 backdrop-blur-md text-white rounded-xl px-4 py-2.5 border border-white/10 shadow-xl transition-all">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredBuilding.status === 'operational'
                  ? 'bg-emerald-400'
                  : hoveredBuilding.status === 'stable'
                  ? 'bg-blue-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-sm font-semibold tracking-tight">{hoveredBuilding.name}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
              {hoveredBuilding.category}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-mono">
            <span>Temp: {hoveredBuilding.temperature}°C</span>
            <span>·</span>
            <span>Power: {hoveredBuilding.powerDrawKw} kW</span>
            <span>·</span>
            <span>Health: {hoveredBuilding.healthScore}%</span>
          </div>
        </div>
      )}

      {/* 3D Anomaly Detailed Inspection Modal (Station Adaptive) */}
      {showAnomalyModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-600 font-bold tracking-wider">
                    {stationId === 'bharati' ? 'BHARATI (69°S) ANOMALY TELEMETRY' : 'MAITRI (70°S) ANOMALY TELEMETRY'}
                  </div>
                  <h4 className="text-base font-extrabold text-[#17213A] tracking-tight">
                    {stationId === 'bharati'
                      ? 'HVAC Blower Fan 03 Bearing Vibration'
                      : 'Generator 02 Coolant Valve Drift'}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setShowAnomalyModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/70 space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Asset Location:</span>
                <span className="font-bold text-slate-800">
                  {stationId === 'bharati' ? 'Bharati Lower Utility Deck (Substation Bay 02)' : 'Maitri Generator Annex (Block B - Power Hub)'}
                </span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Telemetry Reading:</span>
                <span className="font-bold text-amber-700">
                  {stationId === 'bharati' ? '74.2°C Bearing Delta (Warning: 52.0°C) · RMS 4.8 mm/s' : '64.2°C Coolant Valve (Warning Threshold: 58.0°C)'}
                </span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Status & Mitigation:</span>
                <span className="font-bold text-emerald-700">
                  {stationId === 'bharati' ? 'Secondary Bypass Duct Standing By' : 'Automatic Load Leveling Active'}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="font-mono text-[10px] uppercase text-slate-400 font-bold">
                AI PREDICTIVE ASSESSMENT:
              </div>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-sans">
                {stationId === 'bharati'
                  ? 'High vibration frequency harmonics detected on primary blower fan bearings. Lubricant breakdown imminent under continuous -18°C coastal air intake. Recommend switching to secondary redundant loop.'
                  : 'Thermal drift detected on bypass coolant valve actuator. MTBF degradation analysis projects valve seating wear within 6–9 days. Recommend physical inspection in Generator Room.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAnomalyModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setShowAnomalyModal(false);
                  navigateTo('systems/infrastructure');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs font-mono transition-all shadow-sm cursor-pointer"
              >
                <span>INSPECT IN INFRASTRUCTURE &amp; SOLUTIONS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
