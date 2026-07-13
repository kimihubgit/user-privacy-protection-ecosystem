import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CyberCanvas({ scanning, scanResult }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create scene, camera, renderer
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main rotating eyeball group (looks at mouse)
    const eyeGroup = new THREE.Group();
    scene.add(eyeGroup);

    // Static outer HUD group (remains aligned with screen)
    const hudGroup = new THREE.Group();
    scene.add(hudGroup);

    // 1. Cyber Eyeball Sclera
    const scleraGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const scleraMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const sclera = new THREE.Mesh(scleraGeo, scleraMat);
    eyeGroup.add(sclera);

    const scleraGridGeo = new THREE.SphereGeometry(1.31, 16, 16);
    const scleraGridMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const scleraGrid = new THREE.Mesh(scleraGridGeo, scleraGridMat);
    eyeGroup.add(scleraGrid);

    // 2. Iris Base (glowing cyan circle backdrop on face of eye)
    const irisBaseGeo = new THREE.RingGeometry(0.3, 0.8, 32);
    const irisBaseMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const irisBase = new THREE.Mesh(irisBaseGeo, irisBaseMat);
    irisBase.position.z = 1.01;
    eyeGroup.add(irisBase);

    // 3. Iris Mechanical Rings (Concentric dials)
    const irisRing1Geo = new THREE.TorusGeometry(0.8, 0.02, 8, 64);
    const irisRing1Mat = new THREE.MeshBasicMaterial({
      color: 0xff3e6c,
      transparent: true,
      opacity: 0.6
    });
    const irisRing1 = new THREE.Mesh(irisRing1Geo, irisRing1Mat);
    irisRing1.position.z = 1.02;
    eyeGroup.add(irisRing1);

    const irisRing2Geo = new THREE.TorusGeometry(0.55, 0.015, 8, 64);
    const irisRing2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.8
    });
    const irisRing2 = new THREE.Mesh(irisRing2Geo, irisRing2Mat);
    irisRing2.position.z = 1.02;
    eyeGroup.add(irisRing2);

    // 4. Iris Aperture Shutter / Dial Ticks
    const irisTicks = new THREE.Group();
    irisTicks.position.z = 1.03;
    const tickGeo = new THREE.BoxGeometry(0.018, 0.08, 0.01);
    const tickMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.9
    });
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2;
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.x = Math.cos(theta) * 0.68;
      tick.position.y = Math.sin(theta) * 0.68;
      tick.rotation.z = theta;
      irisTicks.add(tick);
    }
    eyeGroup.add(irisTicks);

    // 5. Pupil Center & Glowing Core Lens
    const pupilGeo = new THREE.CircleGeometry(0.28, 32);
    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0x07090e
    });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.z = 1.04;
    eyeGroup.add(pupil);

    const pupilCoreGeo = new THREE.CircleGeometry(0.12, 32);
    const pupilCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe
    });
    const pupilCore = new THREE.Mesh(pupilCoreGeo, pupilCoreMat);
    pupilCore.position.z = 1.05;
    eyeGroup.add(pupilCore);

    // 6. Mechanical Cyber Eyelids (Upper & Lower Torus Arcs)
    const eyelidTopGeo = new THREE.TorusGeometry(1.6, 0.04, 8, 64, Math.PI * 0.76);
    const eyelidTopMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.8
    });
    const eyelidTop = new THREE.Mesh(eyelidTopGeo, eyelidTopMat);
    eyelidTop.rotation.z = Math.PI * 0.12; // center top
    hudGroup.add(eyelidTop);

    const eyelidBottomGeo = new THREE.TorusGeometry(1.6, 0.04, 8, 64, Math.PI * 0.76);
    const eyelidBottomMat = new THREE.MeshBasicMaterial({
      color: 0xff3e6c,
      transparent: true,
      opacity: 0.7
    });
    const eyelidBottom = new THREE.Mesh(eyelidBottomGeo, eyelidBottomMat);
    eyelidBottom.rotation.z = Math.PI * 1.12; // center bottom
    hudGroup.add(eyelidBottom);

    // 7. Outer Target HUD Reticle (Concentric rings)
    const hudRing1Geo = new THREE.RingGeometry(2.1, 2.115, 64);
    const hudRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.3
    });
    const hudRing1 = new THREE.Mesh(hudRing1Geo, hudRing1Mat);
    hudGroup.add(hudRing1);

    const hudRing2Geo = new THREE.TorusGeometry(2.4, 0.008, 8, 100);
    const hudRing2Mat = new THREE.MeshBasicMaterial({
      color: 0xff3e6c,
      transparent: true,
      opacity: 0.2
    });
    const hudRing2 = new THREE.Mesh(hudRing2Geo, hudRing2Mat);
    hudRing2.rotation.x = Math.PI / 3;
    hudGroup.add(hudRing2);

    // Concentric crosshair ticks
    const crosshair = new THREE.Group();
    const crosshairLineGeo = new THREE.BoxGeometry(0.12, 0.012, 0.012);
    const crosshairLineMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.5
    });
    
    const tTick = new THREE.Mesh(crosshairLineGeo, crosshairLineMat);
    tTick.rotation.z = Math.PI / 2;
    tTick.position.y = 2.1;
    crosshair.add(tTick);

    const bTick = new THREE.Mesh(crosshairLineGeo, crosshairLineMat);
    bTick.rotation.z = Math.PI / 2;
    bTick.position.y = -2.1;
    crosshair.add(bTick);

    const lTick = new THREE.Mesh(crosshairLineGeo, crosshairLineMat);
    lTick.position.x = -2.1;
    crosshair.add(lTick);

    const rTick = new THREE.Mesh(crosshairLineGeo, crosshairLineMat);
    rTick.position.x = 2.1;
    crosshair.add(rTick);
    
    hudGroup.add(crosshair);

    // 8. Vertical Sweeping Laser Scan Line
    const scannerGeo = new THREE.BoxGeometry(4.2, 0.02, 0.02);
    const scannerMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.5
    });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scene.add(scanner);

    // 9. Cyber Space Background Particles (Data nodes)
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x00f2fe
    });

    const backgroundParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(backgroundParticles);

    // Mouse tracking state
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Color Theme targets for status interpolations
    let speedMultiplier = 1;
    const currentThemeColor1 = new THREE.Color(0x00f2fe);
    const currentThemeColor2 = new THREE.Color(0xff3e6c);

    const targetThemeColor1 = new THREE.Color(0x00f2fe);
    const targetThemeColor2 = new THREE.Color(0xff3e6c);

    // Animation variables
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Mouse tracking interpolation
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      // Rotate mechanical rings inside the iris
      irisTicks.rotation.z += delta * 0.4 * speedMultiplier;
      irisRing1.rotation.z -= delta * 0.2 * speedMultiplier;
      irisRing2.rotation.z += delta * 0.3 * speedMultiplier;

      // Slow drift for background particles
      backgroundParticles.rotation.y += delta * 0.015;
      hudRing2.rotation.z += delta * 0.05;

      // Scanning, Safe, Malicious behavior triggers
      if (scanning) {
        speedMultiplier = THREE.MathUtils.lerp(speedMultiplier, 5.0, 0.05);
        targetThemeColor1.setHex(0xf59e0b); // yellow/gold warning
        targetThemeColor2.setHex(0xff3e6c);

        // Sweeping scanner line (fast speed)
        scanner.position.y = Math.sin(time * 12.0) * 1.6;
        scannerMat.opacity = 0.8;

        // Pupil contracts/expands rapidly (active scan dialation)
        const pupilScale = 0.75 + Math.sin(time * 18.0) * 0.08;
        pupil.scale.setScalar(pupilScale);
        pupilCore.scale.setScalar(pupilScale);

        // Eyelids narrow focused search
        eyelidTop.position.y = THREE.MathUtils.lerp(eyelidTop.position.y, -0.25, 0.1);
        eyelidBottom.position.y = THREE.MathUtils.lerp(eyelidBottom.position.y, 0.25, 0.1);

        // Jitter eyeball rotation (cyber scanning search jitter)
        eyeGroup.rotation.y = targetX * 0.6 + Math.sin(time * 10) * 0.05;
        eyeGroup.rotation.x = -targetY * 0.6 + Math.cos(time * 10) * 0.05;
      } 
      else if (scanResult) {
        speedMultiplier = THREE.MathUtils.lerp(speedMultiplier, 1.2, 0.05);

        if (scanResult.status === 'safe') {
          targetThemeColor1.setHex(0x10b981); // green safe
          targetThemeColor2.setHex(0x059669);

          // Eyelids relax wide open
          eyelidTop.position.y = THREE.MathUtils.lerp(eyelidTop.position.y, 0, 0.1);
          eyelidBottom.position.y = THREE.MathUtils.lerp(eyelidBottom.position.y, 0, 0.1);

          // Pupil dilates (relaxed safe state)
          pupil.scale.setScalar(THREE.MathUtils.lerp(pupil.scale.x, 1.25, 0.1));
          pupilCore.scale.setScalar(THREE.MathUtils.lerp(pupilCore.scale.x, 1.25, 0.1));

          // Sweeping scanner halts at center, fades out
          scanner.position.y = THREE.MathUtils.lerp(scanner.position.y, 0, 0.1);
          scannerMat.opacity = THREE.MathUtils.lerp(scannerMat.opacity, 0.0, 0.05);
        } 
        else {
          // suspicious or malicious scam warning
          targetThemeColor1.setHex(0xef4444); // red danger
          targetThemeColor2.setHex(0xff3e6c);

          // Eyelids narrow/squint defensively
          eyelidTop.position.y = THREE.MathUtils.lerp(eyelidTop.position.y, -0.35 + Math.sin(time * 25) * 0.03, 0.1);
          eyelidBottom.position.y = THREE.MathUtils.lerp(eyelidBottom.position.y, 0.35 + Math.cos(time * 25) * 0.03, 0.1);

          // Pupil contracts to a tiny needle pin
          pupil.scale.setScalar(THREE.MathUtils.lerp(pupil.scale.x, 0.45, 0.1));
          pupilCore.scale.setScalar(THREE.MathUtils.lerp(pupilCore.scale.x, 0.45, 0.1));

          // Sweeping scanner sweeps red
          scanner.position.y = Math.sin(time * 6.0) * 1.6;
          scannerMat.opacity = 0.6;
        }

        // Mouse look-at rotation
        eyeGroup.rotation.y = targetX * 0.5 + (scanResult.status !== 'safe' ? (Math.random() - 0.5) * 0.05 : 0);
        eyeGroup.rotation.x = -targetY * 0.5 + (scanResult.status !== 'safe' ? (Math.random() - 0.5) * 0.05 : 0);
      } 
      else {
        // IDLE State
        speedMultiplier = THREE.MathUtils.lerp(speedMultiplier, 1.0, 0.05);
        targetThemeColor1.setHex(0x00f2fe); // original cyan
        targetThemeColor2.setHex(0xff3e6c); // original pink

        // Eyelids normal positions
        eyelidTop.position.y = THREE.MathUtils.lerp(eyelidTop.position.y, 0, 0.1);
        eyelidBottom.position.y = THREE.MathUtils.lerp(eyelidBottom.position.y, 0, 0.1);

        // Pupil breathes slowly
        const breatheVal = 1.0 + Math.sin(time * 2.5) * 0.08;
        pupil.scale.setScalar(breatheVal);
        pupilCore.scale.setScalar(breatheVal);

        // Sweeping scanner sweeps slowly (low opacity ambient line)
        scanner.position.y = Math.sin(time * 2.0) * 1.6;
        scannerMat.opacity = 0.2;

        // Eyeball follows mouse + slow idle orbit wobble
        eyeGroup.rotation.y = targetX * 0.5 + Math.sin(time * 0.6) * 0.02;
        eyeGroup.rotation.x = -targetY * 0.5 + Math.cos(time * 0.6) * 0.015;
      }

      // Smooth color theme transitions
      currentThemeColor1.lerp(targetThemeColor1, 0.06);
      currentThemeColor2.lerp(targetThemeColor2, 0.06);

      // Apply primary themes
      scleraGridMat.color.copy(currentThemeColor1);
      irisBaseMat.color.copy(currentThemeColor1);
      irisRing2Mat.color.copy(currentThemeColor1);
      tickMat.color.copy(currentThemeColor1);
      pupilCoreMat.color.copy(currentThemeColor1);
      eyelidTopMat.color.copy(currentThemeColor1);
      hudRing1Mat.color.copy(currentThemeColor1);
      crosshairLineMat.color.copy(currentThemeColor1);
      scannerMat.color.copy(currentThemeColor1);
      particleMat.color.copy(currentThemeColor1);

      // Apply secondary themes
      irisRing1Mat.color.copy(currentThemeColor2);
      eyelidBottomMat.color.copy(currentThemeColor2);
      hudRing2Mat.color.copy(currentThemeColor2);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scleraGeo.dispose();
      scleraMat.dispose();
      scleraGridGeo.dispose();
      scleraGridMat.dispose();
      irisBaseGeo.dispose();
      irisBaseMat.dispose();
      irisRing1Geo.dispose();
      irisRing1Mat.dispose();
      irisRing2Geo.dispose();
      irisRing2Mat.dispose();
      tickGeo.dispose();
      tickMat.dispose();
      pupilGeo.dispose();
      pupilMat.dispose();
      pupilCoreGeo.dispose();
      pupilCoreMat.dispose();
      eyelidTopGeo.dispose();
      eyelidTopMat.dispose();
      eyelidBottomGeo.dispose();
      eyelidBottomMat.dispose();
      hudRing1Geo.dispose();
      hudRing1Mat.dispose();
      hudRing2Geo.dispose();
      hudRing2Mat.dispose();
      crosshairLineGeo.dispose();
      crosshairLineMat.dispose();
      scannerGeo.dispose();
      scannerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      pTexture.dispose();
      renderer.dispose();
    };
  }, [scanning, scanResult]);

  return (
    <div className="checker-canvas-container">
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
      />
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        opacity: 0.6,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 'bold',
        background: 'rgba(255, 255, 255, 0.7)',
        padding: '4px 10px',
        borderRadius: '20px',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: scanning ? 'var(--warning)' : scanResult ? (scanResult.status === 'safe' ? 'var(--success)' : 'var(--danger)') : 'var(--secondary)',
          boxShadow: `0 0 8px ${scanning ? 'var(--warning)' : scanResult ? (scanResult.status === 'safe' ? 'var(--success)' : 'var(--danger)') : 'var(--secondary)'}`
        }} />
        Three.js Cyber Engine
      </div>
    </div>
  );
}
