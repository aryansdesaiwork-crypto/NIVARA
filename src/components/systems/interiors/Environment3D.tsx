import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Wind,
  Thermometer,
  CloudSnow,
  Radio,
  Eye,
  Activity,
  Sparkles,
  X
} from 'lucide-react';

export type EnvironmentCameraPreset = 'wide' | 'mast' | 'wind' | 'snow';

export interface EnvironmentSimState {
  weatherMode: 'normal' | 'storm' | 'blizzard';
  windSpeedKmh: number;
  apparentTempC: number;
  airTempC: number;
  visibilityKm: number;
  snowAccumMmDay: number;
  selectedSensor: string | null;
}

interface Environment3DProps {
  simulationState: EnvironmentSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
}

export const Environment3D: React.FC<Environment3DProps> = ({
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

  // Animated elements
  const anemometerCupsRef = useRef<THREE.Group | null>(null);
  const snowParticlesRef = useRef<THREE.Points | null>(null);
  const dataParticlesRef = useRef<THREE.Points | null>(null);

  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null);

  const setCameraPreset = (preset: EnvironmentCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 2.5, 0);
    if (preset === 'wide') {
      camera.position.set(16, 12, 18);
    } else if (preset === 'mast') {
      controls.target.set(0, 5.0, -4);
      camera.position.set(0, 6.2, 5);
    } else if (preset === 'wind') {
      controls.target.set(-6, 2.5, 3);
      camera.position.set(-6, 4.0, 9);
    } else if (preset === 'snow') {
      controls.target.set(6, 1.5, 4);
      camera.position.set(6, 3.2, 9);
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

    const isBlizzard = simulationState.weatherMode === 'blizzard';
    const isStorm = simulationState.weatherMode === 'storm';

    // Sky ambient color adapts to weather - crisp polar atmosphere
    const skyColor = isBlizzard ? 0xcfdceb : isStorm ? 0xaec3dc : 0xf0f5fc;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, isBlizzard ? 0.045 : isStorm ? 0.025 : 0.008);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 160);
    camera.position.set(16, 12, 18);
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
    controls.maxDistance = 45;
    controls.target.set(0, 2.5, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x7da4d4, isBlizzard ? 0.4 : 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, isBlizzard ? 0.4 : 1.2);
    sunLight.position.set(20, 25, 15);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Antarctic Snow Terrain (with sastrugi wave ripples)
    const terrainGeo = new THREE.PlaneGeometry(50, 50, 48, 48);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      posAttr.setY(i, Math.sin(x * 0.15) * 0.4 + Math.cos(z * 0.2) * 0.35);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xdde9f8,
      roughness: 0.9,
      metalness: 0.05
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    scene.add(terrain);

    interactiveObjectsRef.current.clear();

    // STATION MAIN FUSELAGE (Elevated in background)
    const stationGroup = new THREE.Group();
    scene.add(stationGroup);
    const stHull = new THREE.Mesh(new THREE.BoxGeometry(10, 2.8, 5.5), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 }));
    stHull.position.set(0, 3.2, 0);
    stHull.castShadow = true;
    stationGroup.add(stHull);

    // Warm station windows
    const stWin = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.7), new THREE.MeshStandardMaterial({ color: 0xffd97d, emissive: 0xffaa00, emissiveIntensity: 0.8 }));
    stWin.position.set(0, 3.2, 2.76);
    stationGroup.add(stWin);

    // Elevation stilts under station
    for (let sx = -4; sx <= 4; sx += 2) {
      for (let sz = -2; sz <= 2; sz += 4) {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.8, 12), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        stilt.position.set(sx, 0.9, sz);
        stationGroup.add(stilt);
      }
    }

    // 1. TALL AUTOMATIC WEATHER OBSERVATION MAST (Center Rear)
    const mastGroup = new THREE.Group();
    mastGroup.position.set(0, 0, -5.5);
    scene.add(mastGroup);
    const mastClickables: THREE.Object3D[] = [];

    // Lattice steel tower
    const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 8.5, 12), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 }));
    mastPole.position.y = 4.25;
    mastPole.castShadow = true;
    mastGroup.add(mastPole);
    mastClickables.push(mastPole);

    // Cross-arm boom at top
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    crossArm.position.y = 8.2;
    mastGroup.add(crossArm);
    mastClickables.push(crossArm);

    // Rotating 3-Cup Anemometer
    const cupGroup = new THREE.Group();
    cupGroup.position.set(-1.0, 8.45, 0);
    for (let c = 0; c < 3; c++) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
      arm.rotation.y = (c * Math.PI * 2) / 3;
      const cup = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      cup.position.x = 0.35;
      arm.add(cup);
      cupGroup.add(arm);
    }
    mastGroup.add(cupGroup);
    anemometerCupsRef.current = cupGroup;

    // Wind Vane at other side of crossarm
    const vane = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.02), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    vane.position.set(1.0, 8.45, 0);
    vane.rotation.y = Math.PI / 4;
    mastGroup.add(vane);

    interactiveObjectsRef.current.set('weather-mast', mastClickables);

    // 2. ULTRASONIC 3-AXIS WIND SENSOR NODE (West / Left)
    const windNodeGroup = new THREE.Group();
    windNodeGroup.position.set(-7.5, 0, 3.5);
    scene.add(windNodeGroup);
    const windClickables: THREE.Object3D[] = [];

    const wTripod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    wTripod.position.y = 1.25;
    windNodeGroup.add(wTripod);
    windClickables.push(wTripod);

    const wSensorHead = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 }));
    wSensorHead.position.y = 2.65;
    windNodeGroup.add(wSensorHead);
    windClickables.push(wSensorHead);

    // Pulsing sensor LED ring
    const wLed = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 8, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.2 }));
    wLed.position.y = 2.65;
    wLed.rotateX(Math.PI / 2);
    windNodeGroup.add(wLed);

    interactiveObjectsRef.current.set('wind-sensor', windClickables);

    // 3. SNOW ACCUMULATION & ACOUSTIC DEPTH NODE (East / Right)
    const snowNodeGroup = new THREE.Group();
    snowNodeGroup.position.set(7.5, 0, 3.5);
    scene.add(snowNodeGroup);
    const snowClickables: THREE.Object3D[] = [];

    const sTripod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    sTripod.position.y = 1.25;
    snowNodeGroup.add(sTripod);
    snowClickables.push(sTripod);

    // Ultrasonic downward transducer head pointing at snowdrift
    const sHead = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 }));
    sHead.position.y = 2.5;
    sHead.rotateX(Math.PI);
    snowNodeGroup.add(sHead);
    snowClickables.push(sHead);

    interactiveObjectsRef.current.set('snow-sensor', snowClickables);

    // 4. ASPIRATED TEMPERATURE & RADIOMETER NODE (Front South)
    const tempNodeGroup = new THREE.Group();
    tempNodeGroup.position.set(0, 0, 7.5);
    scene.add(tempNodeGroup);
    const tempClickables: THREE.Object3D[] = [];

    const tStand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    tStand.position.y = 0.9;
    tempNodeGroup.add(tStand);
    tempClickables.push(tStand);

    // Multi-plate radiation louvered shield (Stevenson screen cylinder)
    const tShield = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    tShield.position.y = 2.0;
    tempNodeGroup.add(tShield);
    tempClickables.push(tShield);

    interactiveObjectsRef.current.set('temp-sensor', tempClickables);

    // 5. EDGE TELEMETRY GATEWAY NODE (Connected to station)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(-3.5, 0, -2.5);
    scene.add(gateGroup);
    const gateClickables: THREE.Object3D[] = [];

    const gateCab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 }));
    gateCab.position.y = 1.0;
    gateGroup.add(gateCab);
    gateClickables.push(gateCab);

    // Solar panel power charger
    const gateSolar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.7), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 }));
    gateSolar.position.set(0, 1.8, 0);
    gateSolar.rotateX(Math.PI / 6);
    gateGroup.add(gateSolar);

    // Gateway Whip Antenna
    const gateAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    gateAnt.position.set(0.3, 2.4, 0);
    gateGroup.add(gateAnt);

    interactiveObjectsRef.current.set('edge-gateway', gateClickables);

    // 6. ANIMATED DATA PARTICLES STREAMING FROM SENSORS -> GATEWAY -> STATION
    const DATA_COUNT = 45;
    const dataGeo = new THREE.BufferGeometry();
    const dataPos = new Float32Array(DATA_COUNT * 3);
    for (let i = 0; i < DATA_COUNT; i++) {
      const frac = i / DATA_COUNT;
      // Interpolate along path: Wind node (-7.5, 3.5) -> Gateway (-3.5, -2.5) -> Station (0, 0)
      dataPos[i * 3 + 0] = -7.5 + frac * 7.5;
      dataPos[i * 3 + 1] = 2.2 - frac * 0.4;
      dataPos[i * 3 + 2] = 3.5 - frac * 3.5;
    }
    dataGeo.setAttribute('position', new THREE.BufferAttribute(dataPos, 3));
    const dataMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.32,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const dataPoints = new THREE.Points(dataGeo, dataMat);
    scene.add(dataPoints);
    dataParticlesRef.current = dataPoints;

    // 7. ANTARCTIC SNOW & WIND PARTICLE STORM
    const SNOW_COUNT = isBlizzard ? 350 : isStorm ? 180 : 80;
    const snowGeo = new THREE.BufferGeometry();
    const snowPos = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
      snowPos[i * 3 + 0] = (Math.random() - 0.5) * 45;
      snowPos[i * 3 + 1] = Math.random() * 18;
      snowPos[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: isBlizzard ? 0.35 : 0.22,
      transparent: true,
      opacity: isBlizzard ? 0.95 : 0.65
    });
    const snowPoints = new THREE.Points(snowGeo, snowMat);
    scene.add(snowPoints);
    snowParticlesRef.current = snowPoints;

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
        setHoveredSensor(foundId);
        container.style.cursor = 'pointer';
      } else {
        setHoveredSensor(null);
        container.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);
    renderer.domElement.addEventListener('mousemove', handlePointerMove);

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.update();

      // Cup rotation speed scales with simulated wind speed
      const cupSpeed = delta * (simulationState.windSpeedKmh / 8);
      if (anemometerCupsRef.current) {
        anemometerCupsRef.current.rotation.y += cupSpeed;
      }

      // Snow particle drift (wind blows from East/North-East)
      if (snowParticlesRef.current) {
        const posAttr = snowParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const windDrift = delta * (simulationState.windSpeedKmh * 0.4);
        for (let i = 0; i < SNOW_COUNT; i++) {
          let x = posAttr.getX(i);
          let y = posAttr.getY(i);
          let z = posAttr.getZ(i);

          x -= windDrift;
          y -= delta * (isBlizzard ? 8 : 4);
          z += windDrift * 0.5;

          if (y < 0) {
            y = 16;
            x = (Math.random() - 0.5) * 45;
            z = (Math.random() - 0.5) * 45;
          }
          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }

      // Data telemetry pulses
      if (dataParticlesRef.current) {
        const posAttr = dataParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < DATA_COUNT; i++) {
          let x = posAttr.getX(i);
          let z = posAttr.getZ(i);
          x += delta * 4.5;
          z -= delta * 2.5;
          if (x > 0) {
            x = -7.5;
            z = 3.5;
          }
          posAttr.setX(i, x);
          posAttr.setZ(i, z);
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
  }, [simulationState.weatherMode, simulationState.windSpeedKmh]);

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] bg-[#070c18] rounded-3xl border border-white/10 overflow-hidden shadow-2xl select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220]/80 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulationState.weatherMode === 'blizzard'
                ? 'bg-rose-500 animate-ping'
                : simulationState.weatherMode === 'storm'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-cyan-400'
            }`}
          />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            POLAR SENSOR NETWORK
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs font-mono text-cyan-300">
            {simulationState.windSpeedKmh} KM/H WIND · {simulationState.airTempC}°C
          </span>
        </div>

        {/* Camera Views Preset Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0B1220]/80 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto shadow-lg">
          <button
            onClick={() => setCameraPreset('wide')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            WIDE VIEW
          </button>
          <button
            onClick={() => setCameraPreset('mast')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            AWS MAST
          </button>
          <button
            onClick={() => setCameraPreset('wind')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            WIND NODE
          </button>
          <button
            onClick={() => setCameraPreset('snow')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            SNOW NODE
          </button>
        </div>
      </div>

      {hoveredSensor && (
        <div className="absolute top-16 left-6 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm border border-cyan-400/40 text-xs font-mono text-cyan-200 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click to inspect: {hoveredSensor.replace('-', ' ').toUpperCase()}</span>
        </div>
      )}

      {/* FLOATING SENSOR TELEMETRY PANEL */}
      {selectedEquipment && (
        <div className="absolute top-20 right-5 w-80 max-w-[calc(100vw-40px)] bg-[#0B1220]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 text-white shadow-2xl z-30 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h4 className="text-sm font-extrabold font-mono tracking-tight text-white uppercase">
                  {selectedEquipment.replace('-', ' ')}
                </h4>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Automated Weather Station (AWS)</div>
            </div>
            <button
              onClick={() => onSelectEquipment(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedEquipment === 'wind-sensor' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Wind Velocity</span>
                <span className="font-bold text-cyan-400">{simulationState.windSpeedKmh} km/h</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Wind Direction</span>
                <span className="font-bold text-white">ENE 065° (Katabatic)</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Peak Gusts</span>
                <span className="font-bold text-amber-400">
                  {Math.round(simulationState.windSpeedKmh * 1.35)} km/h
                </span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Sensor Status</span>
                <span className="font-bold text-emerald-400">● Normal Calibration</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'temp-sensor' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Air Temperature</span>
                <span className="font-bold text-sky-400">{simulationState.airTempC}°C</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Wind Chill Factor</span>
                <span className="font-bold text-rose-400">{simulationState.apparentTempC}°C</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Relative Humidity</span>
                <span className="font-bold text-white">48% (Dry Polar)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'snow-sensor' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Accumulation Rate</span>
                <span className="font-bold text-white">{simulationState.snowAccumMmDay} mm / day</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Acoustic Snowpack</span>
                <span className="font-bold text-cyan-400">1.42 m Hard Firn</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Sastrugi Drift Risk</span>
                <span
                  className={`font-bold ${
                    simulationState.weatherMode === 'blizzard' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationState.weatherMode === 'blizzard' ? 'HIGH (BASE SCOURING)' : 'LOW DRIFT'}
                </span>
              </div>
            </div>
          )}

          {selectedEquipment === 'weather-mast' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Mast Elevation</span>
                <span className="font-bold text-white">10.0 m Tower</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Barometric Pressure</span>
                <span className="font-bold text-emerald-400">982.4 hPa (Steady)</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Solar Irradiance</span>
                <span className="font-bold text-amber-400">14 W/m² (Twilight)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'edge-gateway' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Radio Link Quality</span>
                <span className="font-bold text-emerald-400">98% SNR</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Telemetry Cadence</span>
                <span className="font-bold text-white">1.0 Hz Real-time</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Buffer Memory</span>
                <span className="font-bold text-cyan-400">0 MB Buffered (Direct)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Nav Instructions */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>DRAG to Rotate · WHEEL to Zoom · CLICK Sensor Nodes around Station</span>
        </div>
      </div>
    </div>
  );
};
