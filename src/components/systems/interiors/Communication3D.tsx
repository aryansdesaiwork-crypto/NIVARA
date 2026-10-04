import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Radio,
  Wifi,
  WifiOff,
  Server,
  Sparkles,
  X
} from 'lucide-react';

export type CommCameraPreset = 'console' | 'racks' | 'antenna' | 'overview';

export interface CommSimState {
  isConnected: boolean;
  signalQualityPercent: number;
  bufferedEvents: number;
  isSyncing: boolean;
  dataRateMbps: number;
}

interface Communication3DProps {
  simulationState: CommSimState;
  selectedEquipment: string | null;
  onSelectEquipment: (eqId: string | null) => void;
}

export const Communication3D: React.FC<Communication3DProps> = ({
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

  const dataBeamParticlesRef = useRef<THREE.Points | null>(null);
  const dishAntennaRef = useRef<THREE.Group | null>(null);
  const serverLedsRef = useRef<THREE.Mesh[]>([]);

  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const [hoveredEquipment, setHoveredEquipment] = useState<string | null>(null);

  const setCameraPreset = (preset: CommCameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    controls.target.set(0, 2.2, 0);
    if (preset === 'overview') {
      camera.position.set(12, 10, 14);
    } else if (preset === 'console') {
      controls.target.set(-2, 1.8, 1);
      camera.position.set(-2, 3.2, 5.8);
    } else if (preset === 'racks') {
      controls.target.set(3.5, 2.2, -2);
      camera.position.set(3.5, 3.2, 3.8);
    } else if (preset === 'antenna') {
      controls.target.set(-5.5, 5.0, -5.5);
      camera.position.set(-5.5, 6.5, 1.5);
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
    camera.position.set(12, 10, 14);
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
    controls.maxDistance = 38;
    controls.target.set(0, 2.2, 0);
    controlsRef.current = controls;

    // Lighting - Bright scientific laboratory illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const roomLight = new THREE.SpotLight(0xffffff, 1.8, 25, Math.PI / 3, 0.4);
    roomLight.position.set(0, 8, 4);
    scene.add(roomLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), new THREE.MeshStandardMaterial({ color: 0xe2ebf5, roughness: 0.4 }));
    floor.rotateX(-Math.PI / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall with large observation window looking out into polar sky
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc8d7eb, roughness: 0.6 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 7, 0.3), wallMat);
    backWall.position.set(0, 3.5, -8.8);
    scene.add(backWall);

    interactiveObjectsRef.current.clear();
    serverLedsRef.current = [];

    // 1. DUAL 42U HIGH-DENSITY SERVER RACKS WITH BLINKING LEDS (Right bay)
    const rackGroup = new THREE.Group();
    rackGroup.position.set(3.8, 0, -2.5);
    scene.add(rackGroup);
    const rackClickables: THREE.Object3D[] = [];

    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
    for (let r = 0; r < 2; r++) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.4, 1.2), rackMat);
      rack.position.set(r * 1.8 - 0.9, 1.7, 0);
      rack.castShadow = true;
      rackGroup.add(rack);
      rackClickables.push(rack);

      // Blinking status LEDs on rack faces
      for (let u = 0; u < 6; u++) {
        const led = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.04, 0.02),
          new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x10b981,
            emissiveIntensity: 1.0
          })
        );
        led.position.set(r * 1.8 - 0.9, 0.6 + u * 0.45, 0.61);
        rackGroup.add(led);
        serverLedsRef.current.push(led);
      }
    }
    interactiveObjectsRef.current.set('server-racks', rackClickables);

    // 2. MAIN SATELLITE COMMUNICATIONS WORKSTATION CONSOLE (Left bay)
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(-2.8, 0, 1.2);
    scene.add(consoleGroup);
    const consoleClickables: THREE.Object3D[] = [];

    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 1.6), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 }));
    desk.position.y = 0.4;
    consoleGroup.add(desk);
    consoleClickables.push(desk);

    // Triple widescreen monitors displaying satellite track & spectrum
    for (let m = 0; m < 3; m++) {
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.05), new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.8 }));
      mon.position.set(m * 1.05 - 1.05, 1.1, 0.1);
      mon.rotation.y = (m - 1) * -0.15;
      consoleGroup.add(mon);
      consoleClickables.push(mon);
    }
    interactiveObjectsRef.current.set('satellite-terminal', consoleClickables);

    // 3. OUTDOOR PARABOLIC SATELLITE DISH ANTENNA (Visible through window / on roof gantry)
    const dishGroup = new THREE.Group();
    dishGroup.position.set(-5.5, 0, -6.5);
    scene.add(dishGroup);
    const dishClickables: THREE.Object3D[] = [];

    // Pedestal tower
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 4.0, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
    ped.position.y = 2.0;
    dishGroup.add(ped);
    dishClickables.push(ped);

    // Parabolic Dish assembly
    const dishHead = new THREE.Group();
    dishHead.position.set(0, 4.2, 0);
    dishHead.rotation.x = -Math.PI / 4; // Pointing up toward GSAT-14
    dishGroup.add(dishHead);
    dishAntennaRef.current = dishHead;

    const dishMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 }));
    dishMesh.rotateX(Math.PI);
    dishHead.add(dishMesh);
    dishClickables.push(dishMesh);

    // Feedhorn tripod
    const feed = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    feed.position.z = 0.9;
    feed.rotateX(Math.PI / 2);
    dishHead.add(feed);

    interactiveObjectsRef.current.set('antenna-dish', dishClickables);

    // 4. ANIMATED HIGH-FREQUENCY SATELLITE DATA BEAM PARTICLES (DISH -> SKY)
    const BEAM_COUNT = 40;
    const beamGeo = new THREE.BufferGeometry();
    const beamPos = new Float32Array(BEAM_COUNT * 3);
    for (let i = 0; i < BEAM_COUNT; i++) {
      const frac = i / BEAM_COUNT;
      beamPos[i * 3 + 0] = -5.5 + frac * 4.5;
      beamPos[i * 3 + 1] = 4.2 + frac * 12.0;
      beamPos[i * 3 + 2] = -6.5 - frac * 10.0;
    }
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
    const beamMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.34,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const beamPoints = new THREE.Points(beamGeo, beamMat);
    scene.add(beamPoints);
    dataBeamParticlesRef.current = beamPoints;

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
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Satellite Dish Tracking Motion
      if (dishAntennaRef.current && simulationState.isConnected) {
        dishAntennaRef.current.rotation.y = Math.sin(elapsed * 0.3) * 0.12;
      }

      // Data beam visibility and motion
      if (dataBeamParticlesRef.current) {
        dataBeamParticlesRef.current.visible = simulationState.isConnected;
        if (simulationState.isConnected) {
          const posAttr = dataBeamParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < BEAM_COUNT; i++) {
            let y = posAttr.getY(i);
            let z = posAttr.getZ(i);
            y += delta * 6.5;
            z -= delta * 5.2;
            if (y > 16.2) {
              y = 4.2;
              z = -6.5;
            }
            posAttr.setY(i, y);
            posAttr.setZ(i, z);
          }
          posAttr.needsUpdate = true;
        }
      }

      // Server LEDs Blinking
      serverLedsRef.current.forEach((led, idx) => {
        const mat = led.material as THREE.MeshStandardMaterial;
        if (simulationState.isConnected) {
          const flash = Math.sin(elapsed * 12 + idx) > 0;
          mat.color.setHex(flash ? 0x10b981 : 0x064e3b);
          mat.emissive.setHex(flash ? 0x10b981 : 0x000000);
        } else {
          // Amber/Red blinking when connection lost (Edge buffer mode)
          const flash = Math.sin(elapsed * 6 + idx) > 0;
          mat.color.setHex(flash ? 0xf59e0b : 0x78350f);
          mat.emissive.setHex(flash ? 0xf59e0b : 0x000000);
        }
      });

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
  }, [simulationState.isConnected]);

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] bg-[#070c18] rounded-3xl border border-white/10 overflow-hidden shadow-2xl select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220]/80 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulationState.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'
            }`}
          />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            {simulationState.isConnected ? 'MAINLAND SATELLITE LINK' : 'AUTONOMOUS EDGE MODE'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs font-mono text-[#8FAAFF]">
            {simulationState.isConnected
              ? `GSAT-14 · ${simulationState.signalQualityPercent}% SNR`
              : `${simulationState.bufferedEvents} EVENTS BUFFERED`}
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
            onClick={() => setCameraPreset('console')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            CONSOLE
          </button>
          <button
            onClick={() => setCameraPreset('racks')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            SERVER RACKS
          </button>
          <button
            onClick={() => setCameraPreset('antenna')}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            DISH ANTENNA
          </button>
        </div>
      </div>

      {hoveredEquipment && (
        <div className="absolute top-16 left-6 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm border border-emerald-400/40 text-xs font-mono text-emerald-200 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click to inspect: {hoveredEquipment.replace('-', ' ').toUpperCase()}</span>
        </div>
      )}

      {/* FLOATING EQUIPMENT TELEMETRY PANEL */}
      {selectedEquipment && (
        <div className="absolute top-20 right-5 w-80 max-w-[calc(100vw-40px)] bg-[#0B1220]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 text-white shadow-2xl z-30 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    simulationState.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'
                  }`}
                />
                <h4 className="text-sm font-extrabold font-mono tracking-tight text-white uppercase">
                  {selectedEquipment.replace('-', ' ')}
                </h4>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">ISRO Telemetry Node</div>
            </div>
            <button
              onClick={() => onSelectEquipment(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedEquipment === 'antenna-dish' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Target Geostationary</span>
                <span className="font-bold text-white">GSAT-14 (74°E)</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Uplink Carrier Signal</span>
                <span
                  className={`font-bold ${
                    simulationState.isConnected ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulationState.isConnected ? '84% SNR 14.8dB' : '0% CARRIER LOST'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Round-Trip Latency</span>
                <span className="font-bold text-sky-400">540 ms (Geo Link)</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'server-racks' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Storage Mode</span>
                <span
                  className={`font-bold ${
                    simulationState.isConnected ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {simulationState.isConnected ? 'DIRECT UPLINK' : 'LOCAL NVMe BUFFER'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Buffered Telemetry</span>
                <span className="font-bold text-white">{simulationState.bufferedEvents} Events</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Mainland Gateway</span>
                <span className="font-bold text-sky-400">NCAOR Goa / NRSC</span>
              </div>
            </div>
          )}

          {selectedEquipment === 'satellite-terminal' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Station Terminal</span>
                <span className="font-bold text-white">Console Master 01</span>
              </div>
              <div className="flex justify-between p-2 bg-white/5 rounded-xl">
                <span className="text-slate-400">Data Throughput</span>
                <span className="font-bold text-cyan-400">
                  {simulationState.isConnected ? '12.4 Mbps Ku-Band' : '0.0 Mbps'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Instructions */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>DRAG to Rotate · WHEEL to Zoom · CLICK Terminal, Server Racks, or Dish Antenna</span>
        </div>
      </div>
    </div>
  );
};
