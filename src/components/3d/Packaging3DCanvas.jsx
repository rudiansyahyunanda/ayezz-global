import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

export default function Packaging3DCanvas({
  modelType = 'tuck_box',
  dimensions = { width: 80, height: 120, depth: 50 },
  foldProgress = 100, // 0 = flat sheet, 100 = folded box
  colors = { front: '#FFFFFF', back: '#FFFFFF', left: '#F8FAFC', right: '#F8FAFC', top: '#0F172A', bottom: '#F8FAFC' },
  materialType = 'cardboard',
  lightingPreset = 'neutral',
  uploadedArtworks = {},
  autoRotate = false,
  shadows = true,
  cameraView = 'hero'
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const packageGroupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Generate dynamic canvas textures for box faces
  const createFaceTexture = useCallback((faceKey, color, artwork) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Clean background color
    ctx.fillStyle = color || '#FFFFFF';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle paper texture line effect for Kraft
    if (materialType === 'kraft') {
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < 1024; i += 6) {
        ctx.fillRect(0, i, 1024, 1.5);
      }
    }

    // Clean panel subtle inner border line
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 992, 992);

    // Face identifier text
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(faceKey.toUpperCase(), 512, 90);

    // Draw artwork if present
    if (artwork && artwork.img) {
      const scale = artwork.scale || 0.6;
      const w = 512 * scale;
      const h = 512 * scale;
      const x = 512 + (artwork.posX || 0) * 5;
      const y = 512 + (artwork.posY || 0) * 5;
      
      ctx.save();
      ctx.translate(x, y);
      if (artwork.rotation) {
        ctx.rotate((artwork.rotation * Math.PI) / 180);
      }
      ctx.drawImage(artwork.img, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      // Minimalist modern typography logo placeholder
      ctx.save();
      ctx.translate(512, 512);

      // Clean Minimalist Icon
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 110px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PACDORA', 0, -30);

      ctx.fillStyle = '#64748B';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MINIMAL 3D PACKAGING', 0, 45);

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-120, 90);
      ctx.lineTo(120, 90);
      ctx.stroke();

      ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [materialType]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene with Clean Neutral Light Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F8FAFC');
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(160, 140, 260);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group container
    const packageGroup = new THREE.Group();
    scene.add(packageGroup);
    packageGroupRef.current = packageGroup;

    // Clean Studio Soft Daylight
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(150, 250, 150);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 0.6);
    fillLight.position.set(-150, 100, -100);
    scene.add(fillLight);

    // Ground plane with soft ambient shadow
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -95;
    ground.receiveShadow = true;
    scene.add(ground);

    // Clean Minimalist Grid Helper
    const gridHelper = new THREE.GridHelper(600, 30, 0xE2E8F0, 0xF1F5F9);
    gridHelper.position.y = -95.1;
    scene.add(gridHelper);

    // Mouse Drag Rotation
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current || !packageGroupRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      packageGroupRef.current.rotation.y += deltaX * 0.008;
      packageGroupRef.current.rotation.x += deltaY * 0.008;

      packageGroupRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, packageGroupRef.current.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.2;
      cameraRef.current.position.z = Math.max(100, Math.min(600, cameraRef.current.position.z));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && packageGroupRef.current && !isDraggingRef.current) {
        packageGroupRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [shadows]);

  // Lighting preset
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    if (lightingPreset === 'warm') scene.background = new THREE.Color('#FFFBEB');
    else if (lightingPreset === 'softbox') scene.background = new THREE.Color('#F1F5F9');
    else scene.background = new THREE.Color('#F8FAFC');
  }, [lightingPreset]);

  // Camera angles
  useEffect(() => {
    if (!cameraRef.current || !packageGroupRef.current) return;
    const camera = cameraRef.current;
    const group = packageGroupRef.current;

    group.rotation.set(0, 0, 0);

    if (cameraView === 'front') camera.position.set(0, 0, 280);
    else if (cameraView === 'top') camera.position.set(0, 320, 10);
    else if (cameraView === 'iso') camera.position.set(220, 220, 220);
    else {
      camera.position.set(160, 140, 260);
      group.rotation.y = Math.PI / 6;
      group.rotation.x = Math.PI / 12;
    }
    camera.lookAt(0, 0, 0);
  }, [cameraView]);

  // Rebuild Meshes & Materials
  useEffect(() => {
    if (!packageGroupRef.current) return;
    const group = packageGroupRef.current;

    while (group.children.length > 0) {
      const obj = group.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      group.remove(obj);
    }

    const W = dimensions.width || 80;
    const H = dimensions.height || 120;
    const D = dimensions.depth || 50;

    let roughness = 0.6;
    let metalness = 0.05;
    if (materialType === 'glossy') { roughness = 0.15; metalness = 0.1; }
    if (materialType === 'metallic') { roughness = 0.2; metalness = 0.8; }
    if (materialType === 'kraft') { roughness = 0.9; metalness = 0.0; }
    if (materialType === 'matte') { roughness = 0.5; metalness = 0.0; }

    const createMat = (faceKey, colorKey) => {
      const tex = createFaceTexture(faceKey, colors[colorKey] || colors.front, uploadedArtworks[faceKey]);
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: roughness,
        metalness: metalness,
        side: THREE.DoubleSide
      });
    };

    if (modelType === 'tuck_box' || modelType === 'mailer_box') {
      const foldFactor = foldProgress / 100;
      const foldRad = (Math.PI / 2) * foldFactor;

      const frontGeo = new THREE.PlaneGeometry(W, H);
      const frontMesh = new THREE.Mesh(frontGeo, createMat('front', 'front'));
      frontMesh.castShadow = true;
      frontMesh.receiveShadow = true;
      group.add(frontMesh);

      const rightPivot = new THREE.Group();
      rightPivot.position.set(W / 2, 0, 0);
      frontMesh.add(rightPivot);

      const rightMesh = new THREE.Mesh(new THREE.PlaneGeometry(D, H), createMat('right', 'right'));
      rightMesh.position.set(D / 2, 0, 0);
      rightMesh.castShadow = true;
      rightPivot.add(rightMesh);

      const backPivot = new THREE.Group();
      backPivot.position.set(D / 2, 0, 0);
      rightMesh.add(backPivot);

      const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), createMat('back', 'back'));
      backMesh.position.set(W / 2, 0, 0);
      backMesh.castShadow = true;
      backPivot.add(backMesh);

      const leftPivot = new THREE.Group();
      leftPivot.position.set(-W / 2, 0, 0);
      frontMesh.add(leftPivot);

      const leftMesh = new THREE.Mesh(new THREE.PlaneGeometry(D, H), createMat('left', 'left'));
      leftMesh.position.set(-D / 2, 0, 0);
      leftMesh.castShadow = true;
      leftPivot.add(leftMesh);

      const topPivot = new THREE.Group();
      topPivot.position.set(0, H / 2, 0);
      frontMesh.add(topPivot);

      const topMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, D), createMat('top', 'top'));
      topMesh.position.set(0, D / 2, 0);
      topMesh.castShadow = true;
      topPivot.add(topMesh);

      const bottomPivot = new THREE.Group();
      bottomPivot.position.set(0, -H / 2, 0);
      frontMesh.add(bottomPivot);

      const bottomMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, D), createMat('bottom', 'bottom'));
      bottomMesh.position.set(0, -D / 2, 0);
      bottomMesh.castShadow = true;
      bottomPivot.add(bottomMesh);

      rightPivot.rotation.y = foldRad;
      backPivot.rotation.y = foldRad;
      leftPivot.rotation.y = -foldRad;
      topPivot.rotation.x = -foldRad;
      bottomPivot.rotation.x = foldRad;

      group.position.set(0, 0, 0);

    } else if (modelType === 'cylinder_can') {
      const radius = W / 2;
      const cylMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, H, 32),
        [createMat('front', 'front'), createMat('top', 'top'), createMat('bottom', 'bottom')]
      );
      cylMesh.castShadow = true;
      cylMesh.receiveShadow = true;
      group.add(cylMesh);

    } else if (modelType === 'dropper_bottle') {
      const radius = W / 2;
      const bodyMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, H * 0.7, 32),
        createMat('front', 'front')
      );
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      const capMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, H * 0.3, 24),
        new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.2 })
      );
      capMesh.position.y = H * 0.5;
      capMesh.castShadow = true;
      group.add(capMesh);

    } else {
      const boxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(W, H, D),
        [
          createMat('right', 'right'),
          createMat('left', 'left'),
          createMat('top', 'top'),
          createMat('bottom', 'bottom'),
          createMat('front', 'front'),
          createMat('back', 'back')
        ]
      );
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      group.add(boxMesh);
    }
  }, [modelType, dimensions, foldProgress, colors, materialType, uploadedArtworks, createFaceTexture]);

  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#F8FAFC] overflow-hidden select-none cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />

      {/* Minimalist Floating Info Pills */}
      <div className="absolute top-5 left-5 flex items-center space-x-2 pointer-events-none">
        <span className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-full shadow-clean flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          WebGL 3D Studio
        </span>
        <span className="px-3 py-1.5 text-xs font-medium bg-white/90 text-slate-600 border border-slate-200 rounded-full shadow-clean">
          {dimensions.width} x {dimensions.height} x {dimensions.depth} mm
        </span>
      </div>

      {/* Minimalist Interaction Tooltip */}
      <div className="absolute bottom-5 right-5 text-xs text-slate-500 bg-white/90 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-200 shadow-clean pointer-events-none flex items-center space-x-3">
        <span>Drag to rotate</span>
        <span className="text-slate-300">•</span>
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
}
