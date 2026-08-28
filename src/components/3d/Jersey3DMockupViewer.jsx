'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Upload,
  Sparkles,
  RefreshCw,
  Palette,
  Check,
  Layers,
  Camera,
  Play,
  Pause,
  Sliders,
  Shirt,
  Trash2,
  ZoomIn
} from 'lucide-react';
import { DESIGN_TEMPLATES } from '../../data/sublimationProducts';
import { PLACEHOLDER_IMAGE } from '../../lib/supabaseService';

export default function Jersey3DMockupViewer({
  initialTextureUrl = PLACEHOLDER_IMAGE,
  modelPath = '/models/Jersey-Mockup.glb'
}) {
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState(null);

  const [activeTab, setActiveTab] = useState('front');
  const [autoRotate, setAutoRotate] = useState(true);
  const [fabricFinish, setFabricFinish] = useState('matte');

  // TEXTURE URL STATES
  const [frontTextureUrl, setFrontTextureUrl] = useState(initialTextureUrl);
  const [backTextureUrl, setBackTextureUrl] = useState(null);
  const [sleeveTextureUrl, setSleeveTextureUrl] = useState(null);
  const [collarTextureUrl, setCollarTextureUrl] = useState(null);

  // SCALES
  const [frontScale, setFrontScale] = useState(1.0);
  const [backScale, setBackScale] = useState(1.0);
  const [sleeveScale, setSleeveScale] = useState(1.0);

  // COLORS
  const [sleeveColor, setSleeveColor] = useState('#FFFFFF');
  const [collarColor, setCollarColor] = useState('#FFFFFF');
  const [stitchingColor, setStitchingColor] = useState('#E2E8F0');

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const textureCacheRef = useRef({});

  // 1. SAFE ASYNC TEXTURE LOADER
  const loadTexture = (url, scale = 1.0, callback) => {
    if (!url) {
      callback(null);
      return;
    }
    const cacheKey = `${url}_${scale}`;
    if (textureCacheRef.current[cacheKey]) {
      callback(textureCacheRef.current[cacheKey]);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(scale, scale);
        texture.center.set(0.5, 0.5);
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.needsUpdate = true;

        textureCacheRef.current[cacheKey] = texture;
        callback(texture);
      },
      undefined,
      (err) => {
        console.warn('Texture load error:', err);
        callback(null);
      }
    );
  };

  // 2. BULLETPROOF MATERIAL UPDATER WITH USERDATA ORIGINAL NAME PRESERVATION
  const updateModelMaterials = () => {
    if (!modelRef.current) return;

    let roughness = 0.5;
    let metalness = 0.0;
    if (fabricFinish === 'shiny') roughness = 0.25;
    else if (fabricFinish === 'spandex') roughness = 0.4;

    // Load textures in parallel
    loadTexture(frontTextureUrl, frontScale, (frontTex) => {
      loadTexture(backTextureUrl, backScale, (backTex) => {
        loadTexture(sleeveTextureUrl, sleeveScale, (sleeveTex) => {
          loadTexture(collarTextureUrl, 1.0, (collarTex) => {

            if (!modelRef.current) return;

            modelRef.current.traverse((child) => {
              if (child.isMesh) {
                // Preserve original material name in userData so subsequent texture changes match!
                const matName = (child.userData.originalMatName || child.material?.name || '').toLowerCase();

                // A. Inner Trims
                if (matName.includes('inside') || matName.includes('inner') || matName.includes('bottom')) {
                  child.material = new THREE.MeshStandardMaterial({
                    name: child.userData.originalMatName || 'Inside',
                    color: new THREE.Color('#E2E8F0'),
                    roughness: 0.8,
                    metalness: 0.0,
                    side: THREE.DoubleSide
                  });
                }
                // B. Stitching
                else if (matName.includes('stitching')) {
                  child.material = new THREE.MeshStandardMaterial({
                    name: child.userData.originalMatName || 'Stitching',
                    color: new THREE.Color(stitchingColor),
                    roughness: 0.8,
                    metalness: 0.0,
                    side: THREE.DoubleSide
                  });
                }
                // C. Front Body Torso Panel ("Front")
                else if (matName === 'front' || matName.includes('front')) {
                  const activeTex = frontTex || backTex;
                  child.material = new THREE.MeshStandardMaterial({
                    name: child.userData.originalMatName || 'Front',
                    map: activeTex || null,
                    color: new THREE.Color('#FFFFFF'),
                    roughness: roughness,
                    metalness: metalness,
                    side: THREE.DoubleSide
                  });
                }
                // D. Sleeve Panel ("Sleeve Colour")
                else if (matName.includes('sleeve')) {
                  child.material = new THREE.MeshStandardMaterial({
                    name: child.userData.originalMatName || 'Sleeve Colour',
                    map: sleeveTex || null,
                    color: sleeveTex ? new THREE.Color('#FFFFFF') : new THREE.Color(sleeveColor),
                    roughness: roughness,
                    metalness: metalness,
                    side: THREE.DoubleSide
                  });
                }
                // E. Collar Panel ("Collar Colour")
                else if (matName.includes('collar')) {
                  child.material = new THREE.MeshStandardMaterial({
                    name: child.userData.originalMatName || 'Collar Colour',
                    map: collarTex || null,
                    color: collarTex ? new THREE.Color('#FFFFFF') : new THREE.Color(collarColor),
                    roughness: roughness,
                    metalness: metalness,
                    side: THREE.DoubleSide
                  });
                }
              }
            });

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
          });
        });
      });
    });
  };

  useEffect(() => {
    if (!loading && modelRef.current) {
      updateModelMaterials();
    }
  }, [frontTextureUrl, backTextureUrl, sleeveTextureUrl, collarTextureUrl, frontScale, backScale, sleeveScale, sleeveColor, collarColor, stitchingColor, fabricFinish, loading]);

  // 3. THREE.JS INITIALIZATION & GLTF LOADING
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F1F5F9');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / Math.max(height, 1), 0.1, 1000);
    camera.position.set(0, 0.2, 2.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.5;
    controls.minDistance = 1.2;
    controls.maxDistance = 4.5;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Bright Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 2.0);
    backLight.position.set(-5, 6, -5);
    scene.add(backLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
    fillLight.position.set(0, -4, 5);
    scene.add(fillLight);

    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.92;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    setLoading(true);
    setLoadProgress(0);
    setLoadError(null);
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // TAG ORIGINAL MATERIAL NAMES BEFORE ANY EDITS!
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            const originalName = Array.isArray(child.material) ? child.material[0].name : child.material.name;
            child.userData.originalMatName = originalName || '';
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.65 / maxDim;
        model.scale.set(scale, scale, scale);

        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale - 0.08;
        model.position.z = -center.z * scale;

        scene.add(model);
        setLoading(false);

        updateModelMaterials();
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        } else {
          setLoadProgress((prev) => Math.min(prev + 12, 90));
        }
      },
      (err) => {
        console.error('Error loading 3D GLB model:', err);
        setLoadError('Gagal memuatkan file 3D GLB.');
        setLoading(false);
      }
    );

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelPath]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // DIRECT FILE UPLOAD HANDLER
  const handleFileUploadForPanel = (e, panelSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const svgContent = evt.target.result;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const objectUrl = URL.createObjectURL(blob);
        panelSetter(objectUrl);
      };
      reader.readAsText(file);
    } else {
      const objectUrl = URL.createObjectURL(file);
      panelSetter(objectUrl);
    }
  };

  // Camera Presets
  const setCameraPreset = (preset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (preset === 'front') camera.position.set(0, 0.2, 2.6);
    else if (preset === 'back') camera.position.set(0, 0.2, -2.6);
    else if (preset === 'left') camera.position.set(-2.6, 0.2, 0);
    else if (preset === 'right') camera.position.set(2.6, 0.2, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  // Export Snapshot PNG
  const exportSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = `AYEZZ_3D_Mockup_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col lg:flex-row font-sans">
      {/* 3D CANVAS VIEWPORT CONTAINER */}
      <div className="flex-1 relative bg-[#F1F5F9] h-[580px] lg:h-[680px] flex items-center justify-center overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md text-white space-y-4 p-6">
            <RefreshCw className="w-10 h-10 animate-spin text-amber-400" />
            <div className="text-center space-y-1">
              <span className="text-xs font-bold tracking-widest uppercase font-mono block">Memuatkan Studio 3D Configurator...</span>
              <span className="text-xs text-slate-400 font-mono block">{loadProgress}% (Sublimation Mesh 49 MB)</span>
            </div>
            <div className="w-56 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300" style={{ width: `${loadProgress}%` }} />
            </div>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 text-rose-400 p-6 text-center space-y-2">
            <span className="text-sm font-bold">{loadError}</span>
            <span className="text-xs text-slate-400">Pastikan file `Jersey-Mockup.glb` berada di `public/models/`.</span>
          </div>
        )}

        {/* Top Control Overlay Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-white text-xs font-semibold shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Studio 3D Live Configurator</span>
        </div>

        {/* Top Right Action Toolbar (Snapshot & Turntable) */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              autoRotate ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Putaran Autoritasi 360°"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-300" />}
            <span className="hidden sm:inline">360° Putaran</span>
          </button>

          <button
            type="button"
            onClick={exportSnapshot}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 border border-slate-700"
            title="Muat Turun Gambar Snapshot PNG"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>
        </div>

        {/* Interactive 3D Canvas */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Bottom View Angle Controls */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button onClick={() => setCameraPreset('front')} className="px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 rounded-lg transition-colors">Hadapan</button>
          <button onClick={() => setCameraPreset('back')} className="px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 rounded-lg transition-colors">Belakang</button>
          <button onClick={() => setCameraPreset('left')} className="px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 rounded-lg transition-colors">Kiri</button>
          <button onClick={() => setCameraPreset('right')} className="px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 rounded-lg transition-colors">Kanan</button>
        </div>
      </div>

      {/* SIDE CONTROL PANEL */}
      <div className="w-full lg:w-96 bg-white p-6 border-t lg:border-t-0 lg:border-l border-slate-200 space-y-6 flex flex-col justify-between shrink-0 overflow-y-auto max-h-[680px]">
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-slate-800" />
              <span>Studio Penyesuaian 3D</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Muat naik gambar corak anda (PNG / JPG / SVG) untuk bahagian hadapan, belakang, atau lengan secara berasingan.</p>
          </div>

          {/* PANEL SELECTION TABS */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-700">
            <button
              type="button"
              onClick={() => { setActiveTab('front'); setCameraPreset('front'); }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'front' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200'
              }`}
            >
              Hadapan
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('back'); setCameraPreset('back'); }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'back' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200'
              }`}
            >
              Belakang
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('sleeves'); setCameraPreset('right'); }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'sleeves' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200'
              }`}
            >
              Lengan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('accessories')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'accessories' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200'
              }`}
            >
              Aksesori
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'catalog' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200'
              }`}
            >
              Katalog
            </button>
          </div>

          {/* TAB 1: HADAPAN (FRONT TORSO PANEL) */}
          {activeTab === 'front' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  1. Gambar Corak Hadapan (PNG / JPG / GIF / SVG)
                </label>

                <div className="flex items-center space-x-2">
                  <label className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{frontTextureUrl ? 'Tukar Corak Hadapan' : 'Muat Naik Corak Hadapan'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, .gif, .svg"
                      onChange={(e) => handleFileUploadForPanel(e, setFrontTextureUrl)}
                      className="hidden"
                    />
                  </label>

                  {frontTextureUrl && (
                    <button
                      type="button"
                      onClick={() => setFrontTextureUrl(null)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all"
                      title="Padam Corak"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {frontTextureUrl && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center space-x-1">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Skala Zoom Corak ({frontScale.toFixed(1)}x)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFrontScale(1.0)}
                      className="text-[10px] text-slate-500 hover:underline font-bold"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={frontScale}
                    onChange={(e) => setFrontScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BELAKANG (BACK TORSO PANEL) */}
          {activeTab === 'back' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  1. Gambar Corak Belakang (PNG / JPG / GIF / SVG)
                </label>

                <div className="flex items-center space-x-2">
                  <label className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{backTextureUrl ? 'Tukar Corak Belakang' : 'Muat Naik Corak Belakang'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, .gif, .svg"
                      onChange={(e) => handleFileUploadForPanel(e, setBackTextureUrl)}
                      className="hidden"
                    />
                  </label>

                  {backTextureUrl && (
                    <button
                      type="button"
                      onClick={() => setBackTextureUrl(null)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all"
                      title="Padam Corak"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {backTextureUrl && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center space-x-1">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Skala Zoom Belakang ({backScale.toFixed(1)}x)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setBackScale(1.0)}
                      className="text-[10px] text-slate-500 hover:underline font-bold"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={backScale}
                    onChange={(e) => setBackScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LENGAN (SLEEVES PANEL) */}
          {activeTab === 'sleeves' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  1. Gambar Corak Lengan (PNG / JPG / GIF / SVG)
                </label>

                <div className="flex items-center space-x-2">
                  <label className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{sleeveTextureUrl ? 'Tukar Corak Lengan' : 'Muat Naik Corak Lengan'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, .gif, .svg"
                      onChange={(e) => handleFileUploadForPanel(e, setSleeveTextureUrl)}
                      className="hidden"
                    />
                  </label>

                  {sleeveTextureUrl && (
                    <button
                      type="button"
                      onClick={() => setSleeveTextureUrl(null)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all"
                      title="Padam Corak"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-700">Atau Pilih Warna Pepejal Lengan</span>
                <input
                  type="color"
                  value={sleeveColor}
                  onChange={(e) => { setSleeveTextureUrl(null); setSleeveColor(e.target.value); }}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0"
                />
              </div>
            </div>
          )}

          {/* TAB 4: AKSESORI (COLLAR, STITCHING, FINISH) */}
          {activeTab === 'accessories' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Warna Kolar & Jahitan
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700">Kolar</span>
                    <input type="color" value={collarColor} onChange={(e) => setCollarColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0" />
                  </div>
                  <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700">Jahitan</span>
                    <input type="color" value={stitchingColor} onChange={(e) => setStitchingColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Kemasan Material Kain (Finish)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFabricFinish('matte')}
                    className={`py-2 px-2.5 rounded-lg text-[11px] font-bold border transition-all text-center ${
                      fabricFinish === 'matte' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Microdot
                  </button>
                  <button
                    type="button"
                    onClick={() => setFabricFinish('shiny')}
                    className={`py-2 px-2.5 rounded-lg text-[11px] font-bold border transition-all text-center ${
                      fabricFinish === 'shiny' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Kilat Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => setFabricFinish('spandex')}
                    className={`py-2 px-2.5 rounded-lg text-[11px] font-bold border transition-all text-center ${
                      fabricFinish === 'spandex' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Spandex
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KATALOG TEMPLATE */}
          {activeTab === 'catalog' && (
            <div className="space-y-2 animate-fade-in">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Pilih Template Reka Bentuk Katalog
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DESIGN_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setFrontTextureUrl(tpl.thumbnail)}
                    className={`relative rounded-xl overflow-hidden border aspect-square bg-slate-100 hover:scale-105 transition-all ${
                      frontTextureUrl === tpl.thumbnail ? 'border-slate-900 ring-2 ring-slate-900/30' : 'border-slate-200'
                    }`}
                    title={tpl.name}
                  >
                    <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                    {frontTextureUrl === tpl.thumbnail && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE PREVIEW FOOTER */}
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between mt-4 shadow-md">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img src={frontTextureUrl || PLACEHOLDER_IMAGE} alt="Active Texture" className="w-10 h-10 object-cover rounded-xl border border-slate-700 aspect-square shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">STATUS TEXTURE 3D</span>
              <span className="text-xs font-bold text-slate-200 truncate block">Dimuatkan Secara Langsung</span>
            </div>
          </div>
          <button
            type="button"
            onClick={exportSnapshot}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold rounded-lg shrink-0 transition-colors shadow-2xs"
          >
            Export PNG
          </button>
        </div>
      </div>
    </div>
  );
}
