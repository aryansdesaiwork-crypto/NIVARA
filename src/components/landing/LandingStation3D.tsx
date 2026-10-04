import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LandingStation3DProps {
  className?: string;
}

export const LandingStation3D: React.FC<LandingStation3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c192c);
    scene.fog = new THREE.FogExp2(0x0c192c, 0.014);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 200);
    camera.position.set(16, 12, 22);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting - Inspired by Oasis Odyssey (Cold starry night with warm glowing interior windows)
    const ambientLight = new THREE.AmbientLight(0x4a6d96, 0.7);
    scene.add(ambientLight);

    // Moonlight / Celestial directional light
    const moonLight = new THREE.DirectionalLight(0xcde3f8, 1.4);
    moonLight.position.set(15, 28, 20);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.bias = -0.0005;
    scene.add(moonLight);

    // Soft cyan rim light from polar horizon
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-20, 10, -15);
    scene.add(rimLight);

    // Warm golden glow point lights emanating from the station windows onto the snow
    const warmGlow1 = new THREE.PointLight(0xf59e0b, 2.8, 18, 1.2);
    warmGlow1.position.set(0, 3.2, 3.5);
    scene.add(warmGlow1);

    const warmGlow2 = new THREE.PointLight(0xfbbf24, 2.0, 14, 1.2);
    warmGlow2.position.set(-4.5, 3.2, 0);
    scene.add(warmGlow2);

    const warmGlow3 = new THREE.PointLight(0xf59e0b, 2.0, 14, 1.2);
    warmGlow3.position.set(4.5, 3.2, 0);
    scene.add(warmGlow3);

    // 5. Stylized Moon in the night sky
    const moonGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffaea });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(14, 30, -35);
    scene.add(moon);

    // Moon atmospheric halo
    const haloGeo = new THREE.SphereGeometry(3.0, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    const moonHalo = new THREE.Mesh(haloGeo, haloMat);
    moonHalo.position.copy(moon.position);
    scene.add(moonHalo);

    // 6. Stars in the background
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 120;
      starPos[i * 3 + 1] = Math.random() * 60 + 5;
      starPos[i * 3 + 2] = -Math.random() * 70 - 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 7. Antarctic Terrain - Sculpted Snowy Mounds
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xe6f0fa,
      roughness: 0.65,
      metalness: 0.05
    });

    const terrainGeo = new THREE.PlaneGeometry(60, 60, 48, 48);
    terrainGeo.rotateX(-Math.PI / 2);
    const posArr = terrainGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < posArr.length; i += 3) {
      const x = posArr[i];
      const z = posArr[i + 2];
      // Organic snow drift waves
      const elevation =
        Math.sin(x * 0.12) * Math.cos(z * 0.12) * 1.6 +
        Math.sin(x * 0.06 + z * 0.08) * 2.2 -
        (x * x + z * z) * 0.0008;
      posArr[i + 1] = elevation;
    }
    terrainGeo.computeVertexNormals();

    const terrain = new THREE.Mesh(terrainGeo, snowMat);
    terrain.position.y = -0.6;
    terrain.receiveShadow = true;
    terrainGroup.add(terrain);

    // Additional organic snow drift banks around the station
    for (let d = 0; d < 6; d++) {
      const duneGeo = new THREE.SphereGeometry(3.5 + (d % 3), 16, 12);
      duneGeo.scale(1.8, 0.4, 1.2);
      const dune = new THREE.Mesh(duneGeo, snowMat);
      const angle = (d / 6) * Math.PI * 2;
      const rad = 10 + (d % 3) * 2;
      dune.position.set(Math.cos(angle) * rad, -0.2, Math.sin(angle) * rad);
      dune.receiveShadow = true;
      terrainGroup.add(dune);
    }

    // Snowy Polar Conifers / Marker stakes
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x1e3a4c, roughness: 0.8 });
    const pineSnowMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const createSnowTree = (tx: number, tz: number, scale: number) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);
      tree.scale.set(scale, scale, scale);

      for (let t = 0; t < 3; t++) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(1.6 - t * 0.35, 2.2, 8),
          t % 2 === 0 ? pineMat : pineSnowMat
        );
        cone.position.y = t * 1.3 + 1.2;
        cone.castShadow = true;
        tree.add(cone);
      }
      return tree;
    };

    terrainGroup.add(createSnowTree(-14, -8, 1.4));
    terrainGroup.add(createSnowTree(-16, -2, 1.1));
    terrainGroup.add(createSnowTree(15, -10, 1.5));
    terrainGroup.add(createSnowTree(18, -4, 1.2));
    terrainGroup.add(createSnowTree(13, 6, 0.9));

    // 8. Antarctic Research Station Model (Central Hero Building)
    const stationGroup = new THREE.Group();
    stationGroup.position.set(0, 0, 0);
    scene.add(stationGroup);

    // Stilt pillars elevating station above drifting snow
    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const stiltHeight = 2.4;
    const stiltPositions = [
      [-6, -3],
      [-2, -3],
      [2, -3],
      [6, -3],
      [-6, 3],
      [-2, 3],
      [2, 3],
      [6, 3]
    ];
    stiltPositions.forEach(([sx, sz]) => {
      const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, stiltHeight, 12), stiltMat);
      stilt.position.set(sx, stiltHeight / 2, sz);
      stilt.castShadow = true;
      stationGroup.add(stilt);

      // Ice foot pad
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.25, 12), stiltMat);
      foot.position.set(sx, 0.12, sz);
      stationGroup.add(foot);
    });

    // Main Station Hull - Aerodynamic Antarctic Architecture
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.15
    });

    // Central Main Living & Operations Pod
    const mainHull = new THREE.Mesh(new THREE.BoxGeometry(15, 3.2, 8.5), hullMat);
    mainHull.position.set(0, stiltHeight + 1.6, 0);
    mainHull.castShadow = true;
    mainHull.receiveShadow = true;
    stationGroup.add(mainHull);

    // Rounded Aerodynamic Roof Cap
    const roofGeo = new THREE.CylinderGeometry(4.25, 4.25, 15, 24, 1, false, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    roofGeo.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, hullMat);
    roof.position.set(0, stiltHeight + 3.2, 0);
    roof.castShadow = true;
    stationGroup.add(roof);

    // Warm Glowing Observation Windows (Inspired by Oasis Odyssey arched warm entrance & glowing windows)
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.1
    });

    // Large Arched Central Observation Window on front facade
    const archWindowGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.2, 16, 1, false, 0, Math.PI);
    archWindowGeo.rotateZ(Math.PI / 2);
    const archWindow = new THREE.Mesh(archWindowGeo, windowMat);
    archWindow.position.set(0, stiltHeight + 2.4, 4.3);
    stationGroup.add(archWindow);

    // Panoramic Ribbon Windows along front
    for (let w = -5; w <= 5; w += 2.5) {
      if (Math.abs(w) < 1.5) continue; // Skip center where arch is
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.2), windowMat);
      win.position.set(w, stiltHeight + 1.8, 4.3);
      stationGroup.add(win);
    }

    // Lateral Wings Glowing Windows
    for (let w = -2.5; w <= 2.5; w += 2.5) {
      const winLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 1.8), windowMat);
      winLeft.position.set(-7.55, stiltHeight + 1.8, w);
      stationGroup.add(winLeft);

      const winRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 1.8), windowMat);
      winRight.position.set(7.55, stiltHeight + 1.8, w);
      stationGroup.add(winRight);
    }

    // Indian Polar Station Tricolor Emblem on the facade
    const flagMat = new THREE.MeshBasicMaterial({ color: 0xff9933 }); // Saffron
    const flagBar1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.05), flagMat);
    flagBar1.position.set(0, stiltHeight + 3.0, 4.32);
    stationGroup.add(flagBar1);

    const flagBar2 = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.18, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    flagBar2.position.set(0, stiltHeight + 2.8, 4.32);
    stationGroup.add(flagBar2);

    const flagBar3 = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.18, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x138808 }) // Green
    );
    flagBar3.position.set(0, stiltHeight + 2.6, 4.32);
    stationGroup.add(flagBar3);

    // Weather Observation Mast on Roof
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 5.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 })
    );
    mast.position.set(-4.5, stiltHeight + 4.8, -1.5);
    stationGroup.add(mast);

    // Spinning Anemometer Cups
    const anemometerGroup = new THREE.Group();
    anemometerGroup.position.set(-4.5, stiltHeight + 7.2, -1.5);
    stationGroup.add(anemometerGroup);
    for (let c = 0; c < 3; c++) {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
      );
      arm.rotation.y = (c * Math.PI * 2) / 3;
      anemometerGroup.add(arm);
      const cup = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xff5555 })
      );
      cup.rotation.y = (c * Math.PI * 2) / 3;
      cup.position.set(Math.cos((c * Math.PI * 2) / 3) * 0.25, 0, Math.sin((c * Math.PI * 2) / 3) * 0.25);
      anemometerGroup.add(cup);
    }

    // Communications Satellite Radome (White Spherical Dome)
    const radomeGeo = new THREE.SphereGeometry(1.5, 24, 24);
    const radome = new THREE.Mesh(
      radomeGeo,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
    );
    radome.position.set(4.5, stiltHeight + 4.2, -1.0);
    radome.castShadow = true;
    stationGroup.add(radome);

    // Radome Flashing Red Aviation Beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    beacon.position.set(4.5, stiltHeight + 5.75, -1.0);
    stationGroup.add(beacon);

    // Yellow Anomaly Indicator on the annex roof (matches Image 1)
    const anomalyGroup = new THREE.Group();
    anomalyGroup.position.set(-5.5, stiltHeight + 3.8, -1.8);
    const yellowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xfbbf24,
        emissiveIntensity: 1.8,
        roughness: 0.15
      })
    );
    anomalyGroup.add(yellowSphere);

    const yellowRing = new THREE.Mesh(
      new THREE.RingGeometry(0.48, 0.72, 32),
      new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      })
    );
    yellowRing.rotation.x = Math.PI / 2;
    anomalyGroup.add(yellowRing);
    stationGroup.add(anomalyGroup);

    // 9. Floating Atmospheric Snow Particles (Gentle polar wind)
    const snowCount = 280;
    const snowParticleGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 45;
      snowPositions[i * 3 + 1] = Math.random() * 20 + 0.2;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }
    snowParticleGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    const snowParticleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const snowParticles = new THREE.Points(snowParticleGeo, snowParticleMat);
    scene.add(snowParticles);

    // Mouse & Touch Move Parallax Handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const nx = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Restrained camera parallax tilt
      const targetCamX = 16 + mouseRef.current.x * 2.5;
      const targetCamY = 12 + mouseRef.current.y * 1.5;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, stiltHeight + 1.2, 0);

      // Rotate anemometer
      anemometerGroup.rotation.y += 0.06;

      // Pulse beacon
      const flash = Math.sin(time * 4) > 0.4;
      beacon.visible = flash;

      // Animate yellow anomaly marker (Image 1 match)
      const yellowPulse = 1.0 + Math.sin(time * 5) * 0.2;
      yellowSphere.scale.set(yellowPulse, yellowPulse, yellowPulse);
      const ringT = (time * 1.6) % 1;
      const ringScale = 1.0 + ringT * 1.8;
      yellowRing.scale.set(ringScale, ringScale, ringScale);
      (yellowRing.material as THREE.MeshBasicMaterial).opacity = (1 - ringT) * 0.85;

      // Atmospheric Snow Drift
      const sPos = snowParticleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < snowCount; i++) {
        sPos[i * 3] += 0.04; // Wind drift along x
        sPos[i * 3 + 1] -= 0.02; // Fall
        if (sPos[i * 3] > 22) sPos[i * 3] = -22;
        if (sPos[i * 3 + 1] < 0) sPos[i * 3 + 1] = 20;
      }
      snowParticleGeo.attributes.position.needsUpdate = true;

      // Subtle warm window pulse
      const glowScale = 1.6 + Math.sin(time * 2) * 0.2;
      warmGlow1.intensity = glowScale * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      // Adjust camera distance adaptively for mobile/tablet/desktop
      const baseDist = w < 480 ? 29 : w < 768 ? 25 : 22;
      camera.position.set(baseDist * 0.73, baseDist * 0.55, baseDist);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[300px] overflow-hidden rounded-3xl select-none shadow-2xl cursor-grab active:cursor-grabbing ${className}`}
    />
  );
};
