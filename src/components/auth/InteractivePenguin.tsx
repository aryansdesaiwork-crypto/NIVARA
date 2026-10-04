import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface InteractivePenguinProps {
  className?: string;
  onInteract?: (message: string) => void;
  interactiveBubble?: boolean;
  soundEnabled?: boolean;
  initialMessage?: string;
  autoGreeting?: boolean;
}

// Lightweight Web Audio API synthesizer for friendly penguin chirps
const playPenguinChirpSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Friendly 2-tone baby penguin chirp
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(1450, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(1620, now + 0.22);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Graceful fallback if audio is blocked
  }
};

export const InteractivePenguin: React.FC<InteractivePenguinProps> = ({
  className = '',
  onInteract,
  interactiveBubble = true,
  soundEnabled = true,
  initialMessage,
  autoGreeting = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speechBubble, setSpeechBubble] = useState<string | null>(initialMessage || null);
  const speechTimeoutRef = useRef<number | null>(null);

  const mouseRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    distanceToCenter: number;
    isWaving: boolean;
    waveTimer: number;
    blinkTimer: number;
    isBlinking: boolean;
    isShivering: boolean;
    shiverTimer: number;
  }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    distanceToCenter: 1,
    isWaving: false,
    waveTimer: 0,
    blinkTimer: 0,
    isBlinking: false,
    isShivering: false,
    shiverTimer: 0
  });

  const triggerReaction = (customMsg?: string, actionType: 'wave' | 'shiver' | 'chirp' = 'wave') => {
    if (soundEnabled) {
      playPenguinChirpSound();
    }

    if (actionType === 'shiver') {
      mouseRef.current.isShivering = true;
      mouseRef.current.shiverTimer = 90;
    } else {
      mouseRef.current.isWaving = true;
      mouseRef.current.waveTimer = 65; // ~1 second of cheerful waving
    }

    const messages = [
      'Chirp! Welcome to Companion!',
      'Welcome to Companion! 🐧 Say "change station" anytime to switch between Maitri and Bharati!',
      'Welcome to Companion! All 3D digital-twin sensors are calibrated and ready!',
      'Welcome to Companion! Ask me about anomalies or station telemetry!',
      'Yum, thanks for the fresh Antarctic krill! 🐟',
      'The Indian Antarctic Programme is in good hands with you!'
    ];
    const picked = customMsg || messages[Math.floor(Math.random() * messages.length)];
    setSpeechBubble(picked);

    if (onInteract) {
      onInteract(picked);
    }

    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
    }
    speechTimeoutRef.current = window.setTimeout(() => {
      setSpeechBubble(null);
    }, 4500);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene setup - Crisp ice-blue soft studio atmosphere matching reference image
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe0f7); // Soft polar baby-blue backdrop
    scene.fog = new THREE.FogExp2(0xbfe0f7, 0.012);

    // 2. Camera setup with excellent responsive framing
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.5, 100);
    camera.position.set(0, 1.25, 7.2);
    camera.lookAt(0, 0.7, 0);

    // 3. High quality WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Soft studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffdf5, 1.3);
    keyLight.position.set(5, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.45);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    // 5. Stylized Polar Mound Floor
    const groundGeo = new THREE.CylinderGeometry(4.8, 5.2, 1.5, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe0ecf8,
      roughness: 0.85
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.65;
    ground.receiveShadow = true;
    scene.add(ground);

    // =========================================================================
    // 6. MASTER PENGUIN MODEL (MATCHING USER'S BABY PENGUIN REFERENCE EXACTLY)
    // =========================================================================
    const penguinRoot = new THREE.Group();
    penguinRoot.position.set(0, -0.75, 0);
    scene.add(penguinRoot);

    // Materials
    // Soft downy grey feathers
    const fluffyGreyMat = new THREE.MeshStandardMaterial({
      color: 0x768798,
      roughness: 0.8,
      metalness: 0.05
    });

    // Fluffy white belly feathers
    const bellyWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.75,
      metalness: 0.02
    });

    // Soft pastel pale yellow chest patch
    const pastelYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.8,
      metalness: 0.02
    });

    // Cute orange beak
    const beakOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.35,
      metalness: 0.08
    });

    // Rosy pink blushed cheeks
    const blushPinkMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.7,
      transparent: true,
      opacity: 0.82
    });

    // Sky-blue knitted scarf material
    const scarfBlueMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.75,
      metalness: 0.08
    });

    // Glossy black eyes
    const eyeBlackMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0c,
      roughness: 0.05,
      metalness: 0.95
    });

    const pupilReflectionMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Cute pink/coral feet
    const feetPinkMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.45,
      metalness: 0.05
    });

    // --- BODY & TORSO ---
    const torsoGeo = new THREE.SphereGeometry(1.22, 32, 32);
    torsoGeo.scale(1.0, 1.25, 0.95);
    const torso = new THREE.Mesh(torsoGeo, fluffyGreyMat);
    torso.position.y = 1.22;
    torso.castShadow = true;
    torso.receiveShadow = true;
    penguinRoot.add(torso);

    // Front White Tummy
    const bellyGeo = new THREE.SphereGeometry(1.08, 32, 32);
    bellyGeo.scale(0.85, 1.15, 0.85);
    const belly = new THREE.Mesh(bellyGeo, bellyWhiteMat);
    belly.position.set(0, 1.18, 0.24);
    penguinRoot.add(belly);

    // Pastel Yellow Chest Patch (just under the scarf, as seen in reference image)
    const chestYellowGeo = new THREE.SphereGeometry(0.75, 24, 24);
    chestYellowGeo.scale(0.9, 0.7, 0.4);
    const chestYellow = new THREE.Mesh(chestYellowGeo, pastelYellowMat);
    chestYellow.position.set(0, 1.55, 0.82);
    penguinRoot.add(chestYellow);

    // --- HEAD GROUP (Rotates & tilts to track cursor) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.22, 0);
    penguinRoot.add(headGroup);

    // Fluffy Grey Head Sphere
    const headGeo = new THREE.SphereGeometry(0.95, 32, 32);
    headGeo.scale(1.02, 0.96, 0.95);
    const head = new THREE.Mesh(headGeo, fluffyGreyMat);
    head.castShadow = true;
    headGroup.add(head);

    // White Face Mask (arches over eyes and cheeks like baby emperor penguin)
    const faceMaskGeo = new THREE.SphereGeometry(0.88, 32, 32);
    faceMaskGeo.scale(0.84, 0.78, 0.62);
    const faceMask = new THREE.Mesh(faceMaskGeo, bellyWhiteMat);
    faceMask.position.set(0, -0.04, 0.44);
    headGroup.add(faceMask);

    // --- EYES (Big, glossy with sweet highlights) ---
    const eyePupilGroupL = new THREE.Group();
    eyePupilGroupL.position.set(-0.36, 0.08, 0.85);
    headGroup.add(eyePupilGroupL);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.145, 24, 24), eyeBlackMat);
    eyePupilGroupL.add(eyeL);

    const glintL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), pupilReflectionMat);
    glintL.position.set(0.04, 0.045, 0.125);
    eyePupilGroupL.add(glintL);

    const glintSubL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), pupilReflectionMat);
    glintSubL.position.set(-0.04, -0.04, 0.12);
    eyePupilGroupL.add(glintSubL);

    const eyePupilGroupR = new THREE.Group();
    eyePupilGroupR.position.set(0.36, 0.08, 0.85);
    headGroup.add(eyePupilGroupR);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.145, 24, 24), eyeBlackMat);
    eyePupilGroupR.add(eyeR);

    const glintR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), pupilReflectionMat);
    glintR.position.set(0.04, 0.045, 0.125);
    eyePupilGroupR.add(glintR);

    const glintSubR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), pupilReflectionMat);
    glintSubR.position.set(-0.04, -0.04, 0.12);
    eyePupilGroupR.add(glintSubR);

    // --- ROSY BLUSHING CHEEKS (Exact matching detail from reference photo) ---
    const cheekGeo = new THREE.CircleGeometry(0.16, 24);

    const cheekL = new THREE.Mesh(cheekGeo, blushPinkMat);
    cheekL.position.set(-0.52, -0.08, 0.82);
    cheekL.rotation.y = -0.42;
    headGroup.add(cheekL);

    const cheekR = new THREE.Mesh(cheekGeo, blushPinkMat);
    cheekR.position.set(0.52, -0.08, 0.82);
    cheekR.rotation.y = 0.42;
    headGroup.add(cheekR);

    // --- CUTE ORANGE BEAK ---
    const beakGeo = new THREE.ConeGeometry(0.16, 0.38, 16);
    beakGeo.rotateX(Math.PI / 2);
    beakGeo.scale(1.2, 0.7, 1.0);
    const beak = new THREE.Mesh(beakGeo, beakOrangeMat);
    beak.position.set(0, -0.08, 1.02);
    beak.castShadow = true;
    headGroup.add(beak);

    // --- KNITTED SKY-BLUE SCARF (Matching reference photo!) ---
    const scarfGroup = new THREE.Group();
    scarfGroup.position.set(0, 1.88, 0);
    penguinRoot.add(scarfGroup);

    // Main Knitted Collar Ring (Torus around the neck)
    const scarfMainGeo = new THREE.TorusGeometry(0.85, 0.16, 16, 36);
    scarfMainGeo.rotateX(Math.PI / 2);
    const scarfMain = new THREE.Mesh(scarfMainGeo, scarfBlueMat);
    scarfMain.castShadow = true;
    scarfGroup.add(scarfMain);

    // Second overlapping wrap layer for knitted plush depth
    const scarfSecondGeo = new THREE.TorusGeometry(0.88, 0.14, 16, 36);
    scarfSecondGeo.rotateX(Math.PI / 2 + 0.08);
    scarfSecondGeo.rotateZ(0.2);
    const scarfSecond = new THREE.Mesh(scarfSecondGeo, scarfBlueMat);
    scarfSecond.position.y = -0.08;
    scarfGroup.add(scarfSecond);

    // Hanging Scarf Tail (Drapes down over the left side of the chest)
    const scarfTailGeo = new THREE.BoxGeometry(0.35, 0.9, 0.12);
    const scarfTail = new THREE.Mesh(scarfTailGeo, scarfBlueMat);
    scarfTail.position.set(0.48, -0.45, 0.75);
    scarfTail.rotation.z = -0.15;
    scarfTail.rotation.y = -0.25;
    scarfTail.castShadow = true;
    scarfGroup.add(scarfTail);

    // Scarf Tassels / Fringe at the bottom of the tail
    const fringeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8);
    for (let f = -2; f <= 2; f++) {
      const tassel = new THREE.Mesh(fringeGeo, scarfBlueMat);
      tassel.position.set(0.48 + f * 0.06, -0.92, 0.76);
      scarfGroup.add(tassel);
    }

    // --- FLIPPER WINGS ---
    const wingGeo = new THREE.BoxGeometry(0.22, 1.35, 0.48);
    wingGeo.scale(0.8, 1.0, 0.8);

    const wingL = new THREE.Mesh(wingGeo, fluffyGreyMat);
    wingL.position.set(-1.22, 1.35, 0);
    wingL.rotation.z = 0.24;
    wingL.castShadow = true;
    penguinRoot.add(wingL);

    const wingR = new THREE.Mesh(wingGeo, fluffyGreyMat);
    wingR.position.set(1.22, 1.35, 0);
    wingR.rotation.z = -0.24;
    wingR.castShadow = true;
    penguinRoot.add(wingR);

    // --- CUTE PINK FEET ---
    const footGeo = new THREE.BoxGeometry(0.48, 0.14, 0.72);
    const footL = new THREE.Mesh(footGeo, feetPinkMat);
    footL.position.set(-0.46, 0.07, 0.38);
    footL.rotation.y = -0.15;
    footL.castShadow = true;
    penguinRoot.add(footL);

    const footR = new THREE.Mesh(footGeo, feetPinkMat);
    footR.position.set(0.46, 0.07, 0.38);
    footR.rotation.y = 0.15;
    footR.castShadow = true;
    penguinRoot.add(footR);

    // --- MOUSE & TOUCH TRACKING & INTERACTIVE LISTENERS ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseRef.current.targetX = Math.max(-1.4, Math.min(1.4, nx));
      mouseRef.current.targetY = Math.max(-1.4, Math.min(1.4, ny));
      mouseRef.current.distanceToCenter = Math.sqrt(nx * nx + ny * ny);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const nx = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);

      mouseRef.current.targetX = Math.max(-1.4, Math.min(1.4, nx));
      mouseRef.current.targetY = Math.max(-1.4, Math.min(1.4, ny));
      mouseRef.current.distanceToCenter = Math.sqrt(nx * nx + ny * ny);
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const m = mouseRef.current;

      // Smooth interpolation for head tracking
      m.x += (m.targetX - m.x) * 0.07;
      m.y += (m.targetY - m.y) * 0.07;

      // 1. Head turns and tilts smoothly toward cursor / touch
      const maxHeadTurnY = 0.52;
      const maxHeadTiltX = 0.32;
      headGroup.rotation.y = m.x * maxHeadTurnY;
      headGroup.rotation.x = -m.y * maxHeadTiltX;
      headGroup.rotation.z = -m.x * 0.06; // Inquisitive head tilt

      // 2. Eyes follow cursor smoothly
      const pupilShiftX = m.x * 0.035;
      const pupilShiftY = m.y * 0.03;
      eyePupilGroupL.position.x = -0.36 + pupilShiftX;
      eyePupilGroupL.position.y = 0.08 + pupilShiftY;
      eyePupilGroupR.position.x = 0.36 + pupilShiftX;
      eyePupilGroupR.position.y = 0.08 + pupilShiftY;

      // 3. Eye Blinking animation (every 3-5 seconds)
      m.blinkTimer += 1;
      if (m.blinkTimer > 220) {
        m.isBlinking = true;
        if (m.blinkTimer > 232) {
          m.isBlinking = false;
          m.blinkTimer = Math.floor(Math.random() * 50);
        }
      }
      const eyeScaleY = m.isBlinking ? 0.08 : 1.0;
      eyePupilGroupL.scale.y = eyeScaleY;
      eyePupilGroupR.scale.y = eyeScaleY;

      // 4. Gentle breathing motion
      const breathing = Math.sin(time * 2.2) * 0.015;
      torso.scale.y = 1.25 + breathing;
      chestYellow.scale.y = 0.7 + breathing * 0.5;

      // 5. Waving flipper or shivering reaction
      if (m.isShivering && m.shiverTimer > 0) {
        m.shiverTimer -= 1;
        const shiverOffset = Math.sin(time * 35) * 0.03;
        penguinRoot.position.x = m.x * 0.1 + shiverOffset;
        wingL.rotation.z = 0.35 + Math.sin(time * 30) * 0.08;
        wingR.rotation.z = -0.35 - Math.sin(time * 30) * 0.08;
        if (m.shiverTimer === 0) {
          m.isShivering = false;
        }
      } else if (m.isWaving && m.waveTimer > 0) {
        m.waveTimer -= 1;
        wingR.rotation.z = -0.85 + Math.sin(time * 14) * 0.45;
        wingR.position.y = 1.45;
        if (m.waveTimer === 0) {
          m.isWaving = false;
        }
      } else {
        const isClose = m.distanceToCenter < 0.55;
        const targetWingL = 0.24 + (isClose ? Math.sin(time * 5) * 0.07 : 0);
        const targetWingR = -0.24 - (isClose ? Math.sin(time * 5) * 0.07 : 0);
        wingL.rotation.z += (targetWingL - wingL.rotation.z) * 0.1;
        wingR.rotation.z += (targetWingR - wingR.rotation.z) * 0.1;
        wingR.position.y = 1.35;
      }

      // 6. Body parallax and hop on wave
      if (!m.isShivering) {
        penguinRoot.rotation.y = m.x * 0.12;
        penguinRoot.position.x = m.x * 0.1;
      }
      if (m.isWaving) {
        penguinRoot.position.y = -0.75 + Math.abs(Math.sin(time * 10)) * 0.08;
      } else if (!m.isShivering) {
        penguinRoot.position.y = -0.75;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.position.z = w < 480 ? 8.2 : w < 768 ? 7.6 : 7.2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // Initial responsive check
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (speechTimeoutRef.current) {
        window.clearTimeout(speechTimeoutRef.current);
      }
      renderer.dispose();
    };
  }, [onInteract]);

  return (
    <div
      onClick={() => triggerReaction()}
      onTouchStart={() => triggerReaction()}
      className={`relative w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[520px] overflow-hidden rounded-2xl select-none cursor-pointer group ${className}`}
      title="Click baby penguin to wave and say hello!"
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Interactive Speech Bubble */}
      {interactiveBubble && speechBubble && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 max-w-[85%] sm:max-w-xs w-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-sky-200 text-xs font-medium text-slate-800 animate-fadeIn transition-all pointer-events-none text-center">
          <p className="leading-snug">{speechBubble}</p>
          <div className="w-3 h-3 bg-white border-b border-r border-sky-200 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* Floating Prompt Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[11px] font-mono text-slate-700 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sky-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
          <span>Tap to wave & chirp</span>
          <span>❄️</span>
        </span>
      </div>
    </div>
  );
};
