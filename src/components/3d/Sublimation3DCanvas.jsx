import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function Sublimation3DCanvas({
  modelType = 'jersey_futsal',
  colors = { body: '#0F172A', sleeves: '#2563EB', collar: '#0F172A', accents: '#10B981' },
  playerName = 'AYEZ',
  playerNumber = '10',
  teamLogo = null,
  sponsorLogo = null,
  patternStyle = 'clean',
  cameraView = 'front',
  autoRotate = true,
  clothAnimation = true
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const apparelGroupRef = useRef(null);
  const loadedModelRef = useRef(null);
  const basePositionRef = useRef({ x: 0, y: 0, z: 0 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const [isGLBLoaded, setIsGLBLoaded] = useState(false);

  // Generate Dry-Fit Fabric Microdot Bump Map for Realistic Cloth Texture
  const createFabricBumpMap = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#A0A0A0';
    for (let x = 0; x < 512; x += 4) {
      for (let y = (x % 8 === 0 ? 0 : 2); y < 512; y += 4) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }, []);

  // Generate dynamic 2K high-definition canvas texture for Body
  const createBodyTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    const bodyColor = colors.body || '#0F172A';
    const sleeveColor = colors.sleeves || '#2563EB';
    const accentColor = colors.accents || '#10B981';

    ctx.fillStyle = bodyColor;
    ctx.fillRect(0, 0, 2048, 2048);

    if (patternStyle === 'stripes') {
      ctx.fillStyle = sleeveColor;
      ctx.fillRect(0, 0, 360, 2048);
      ctx.fillRect(1688, 0, 360, 2048);
    } else if (patternStyle === 'diagonal') {
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(0, 800);
      ctx.lineTo(2048, 1600);
      ctx.lineTo(2048, 1900);
      ctx.lineTo(0, 1100);
      ctx.fill();
    }

    // FRONT: Left Chest Logo
    if (teamLogo && teamLogo.img) {
      ctx.drawImage(teamLogo.img, 450, 400, 320, 320);
    } else {
      ctx.save();
      ctx.translate(550, 500);
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 90px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', 0, 4);
      ctx.restore();
    }

    // FRONT: Center Sponsor Logo
    if (sponsorLogo && sponsorLogo.img) {
      ctx.drawImage(sponsorLogo.img, 524, 1000, 1000, 360);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 120px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AYEZ SUBLIMATION', 1024, 1150);

      ctx.fillStyle = accentColor;
      ctx.font = '700 48px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CUSTOM ATHLETICS', 1024, 1260);
    }

    // BACK: Player Name & Player Number
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 140px "Plus Jakarta Sans", sans-serif';
    ctx.fillText((playerName || 'AYEZ').toUpperCase(), 1024, 380);

    ctx.fillStyle = accentColor;
    ctx.font = '900 520px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(playerNumber || '10', 1024, 900);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 20;
    ctx.strokeText(playerNumber || '10', 1024, 900);

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  }, [colors, playerName, playerNumber, teamLogo, sponsorLogo, patternStyle]);

  // Generate Sleeve Canvas Texture
  const createSleeveTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const sleeveColor = colors.sleeves || '#2563EB';
    const accentColor = colors.accents || '#10B981';

    ctx.fillStyle = sleeveColor;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 880, 1024, 144);

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  }, [colors]);

  // Setup Three.js Scene with 100% TRANSPARENT Backdrop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null; // 100% TRANSPARENT!
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 195);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // 100% TRANSPARENT!
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const apparelGroup = new THREE.Group();
    scene.add(apparelGroup);
    apparelGroupRef.current = apparelGroup;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(120, 220, 180);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-150, 80, -100);
    scene.add(rimLight);

    // Ground Shadow Plane
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -60;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load Real 3D Jersey GLB Model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/Jersey-Mockup.glb',
      (gltf) => {
        const model = gltf.scene;
        loadedModelRef.current = model;

        const rawBox = new THREE.Box3().setFromObject(model);
        const rawSize = rawBox.getSize(new THREE.Vector3());

        if (rawSize.y > 0) {
          const targetHeight = 92;
          const scaleFactor = targetHeight / rawSize.y;
          model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

        model.position.x = -scaledCenter.x;
        model.position.y = -scaledCenter.y;
        model.position.z = -scaledCenter.z;

        basePositionRef.current = {
          x: -scaledCenter.x,
          y: -scaledCenter.y,
          z: -scaledCenter.z
        };

        apparelGroup.add(model);
        setIsGLBLoaded(true);
      },
      undefined,
      (error) => console.error('Error loading 3D model:', error)
    );

    // Drag Interaction (Rotation only)
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current || !apparelGroupRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      apparelGroupRef.current.rotation.y += deltaX * 0.006;
      apparelGroupRef.current.rotation.x += deltaY * 0.006;
      apparelGroupRef.current.rotation.x = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, apparelGroupRef.current.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Real-Time Animation Loop
    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (loadedModelRef.current) {
        if (autoRotate && apparelGroupRef.current && !isDraggingRef.current) {
          apparelGroupRef.current.rotation.y += 0.004;
        }

        if (clothAnimation && !isDraggingRef.current) {
          const swayY = Math.sin(elapsedTime * 2.2) * 0.8;
          const swayZ = Math.cos(elapsedTime * 1.8) * 0.5;
          const tiltZ = Math.sin(elapsedTime * 1.5) * 0.012;

          loadedModelRef.current.position.y = basePositionRef.current.y + swayY;
          loadedModelRef.current.position.z = basePositionRef.current.z + swayZ;
          loadedModelRef.current.rotation.z = tiltZ;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Camera View
  useEffect(() => {
    if (!cameraRef.current || !apparelGroupRef.current) return;
    const group = apparelGroupRef.current;

    group.rotation.set(0, 0, 0);

    if (cameraView === 'back') group.rotation.y = Math.PI;
    else if (cameraView === 'side') group.rotation.y = Math.PI / 2;
    else group.rotation.y = 0;
  }, [cameraView]);

  // Apply Textures & Fabric Bump Map to Materials (WITH FORCED MATERIAL & TEXTURE RE-RENDERING)
  useEffect(() => {
    if (!loadedModelRef.current) return;

    const bodyTexture = createBodyTexture();
    const sleeveTexture = createSleeveTexture();
    const fabricBumpMap = createFabricBumpMap();

    loadedModelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;

        const matName = child.material.name || '';

        if (matName.includes('Front')) {
          child.material = new THREE.MeshStandardMaterial({
            map: bodyTexture,
            bumpMap: fabricBumpMap,
            bumpScale: 0.04,
            roughness: 0.65,
            metalness: 0.05
          });
          child.material.needsUpdate = true;
        } else if (matName.includes('Sleeve Colour')) {
          child.material = new THREE.MeshStandardMaterial({
            map: sleeveTexture,
            bumpMap: fabricBumpMap,
            bumpScale: 0.04,
            roughness: 0.65,
            metalness: 0.05
          });
          child.material.needsUpdate = true;
        } else if (matName.includes('Collar Colour')) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colors.collar || '#0F172A'),
            roughness: 0.8,
            metalness: 0.0
          });
          child.material.needsUpdate = true;
        } else if (matName.includes('Stitching')) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colors.accents || '#10B981'),
            roughness: 0.9,
            metalness: 0.0
          });
          child.material.needsUpdate = true;
        } else if (matName.includes('Inside') || matName.includes('Bottom')) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#1E293B'),
            roughness: 0.9,
            metalness: 0.0
          });
          child.material.needsUpdate = true;
        } else {
          child.material = new THREE.MeshStandardMaterial({
            map: bodyTexture,
            bumpMap: fabricBumpMap,
            bumpScale: 0.04,
            roughness: 0.65
          });
          child.material.needsUpdate = true;
        }
      }
    });

  }, [colors, playerName, playerNumber, teamLogo, sponsorLogo, patternStyle, isGLBLoaded, createBodyTexture, createSleeveTexture, createFabricBumpMap]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-transparent overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full bg-transparent" />

      {!isGLBLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-transparent">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin mb-2" />
          <div className="text-xs font-semibold text-slate-400">Memuat Model 3D...</div>
        </div>
      )}
    </div>
  );
}
