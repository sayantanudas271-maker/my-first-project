import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Boxes,
  Eye,
  Layers,
  Gauge,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Activity,
  Zap,
} from 'lucide-react';

export const WarehouseDigitalTwin: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeCameraView, setActiveCameraView] = useState<'OVERVIEW' | 'AGV' | 'ARM' | 'RACK'>('OVERVIEW');
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [agvSpeed, setAgvSpeed] = useState<number>(1);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [hudStats, setHudStats] = useState({ agvBattery: 94, lidarRate: '60 Hz', guidanceLock: '100%' });

  // Mutable refs for animation loop
  const targetCamPos = useRef(new THREE.Vector3(18, 14, 22));
  const targetCamLook = useRef(new THREE.Vector3(0, 2, 0));
  const currentCamLook = useRef(new THREE.Vector3(0, 2, 0));
  const explodedRef = useRef(0);
  const speedRef = useRef(1);

  useEffect(() => {
    explodedRef.current = explodedAmount;
  }, [explodedAmount]);

  useEffect(() => {
    speedRef.current = agvSpeed;
  }, [agvSpeed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.022);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(18, 14, 22);

    // 3. Renderer with PBR tone mapping & color space
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. RoomEnvironment with PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x8bc0ff, 0x1a2639, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff3db, 2.2);
    dirLight.position.set(16, 22, 12);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    const d = 18;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Soft cyan accent rim light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-14, 10, -10);
    scene.add(rimLight);

    // 6. Procedural Warehouse Floor with Guide Grid
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const ctx = floorCanvas.getContext('2d')!;
    ctx.fillStyle = '#0c1220';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle dark blue tiles
    ctx.strokeStyle = '#162238';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Yellow navigational track striping for AGVs
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.rect(64, 64, 384, 384);
    ctx.stroke();

    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 8);
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.35,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // 7. Composite Procedural Models (3–12 parts per entity)

    // Helper: Soft contact shadow disc
    const createContactShadow = (radius: number, opacity = 0.45) => {
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const sCtx = shadowCanvas.getContext('2d')!;
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, `rgba(0,0,0,${opacity})`);
      grad.addColorStop(0.6, `rgba(0,0,0,${opacity * 0.4})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);

      const sTex = new THREE.CanvasTexture(shadowCanvas);
      const sMat = new THREE.MeshBasicMaterial({
        map: sTex,
        transparent: true,
        depthWrite: false,
      });
      const sGeo = new THREE.PlaneGeometry(radius * 2, radius * 2);
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.rotation.x = -Math.PI / 2;
      sMesh.position.y = 0.015;
      return sMesh;
    };

    // A. Autonomous Mobile Robot (AGV) - 8 Parts Group
    const agvGroup = new THREE.Group();

    // Part 1: Main Chassis (Dark Anthracite)
    const chassisGeo = new THREE.BoxGeometry(2.2, 0.45, 1.4);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.35;
    chassis.castShadow = !isSoftwareGl;
    agvGroup.add(chassis);

    // Part 2: Top Cargo Bed Plate
    const bedGeo = new THREE.BoxGeometry(2.0, 0.08, 1.25);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.15,
    });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.62;
    agvGroup.add(bed);

    // Part 3: Rotating LiDAR Sensor Turret (Cylinder)
    const lidarBaseGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.2, 16);
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const lidarTurret = new THREE.Mesh(lidarBaseGeo, lidarMat);
    lidarTurret.position.set(0.8, 0.72, 0);
    agvGroup.add(lidarTurret);

    // Part 4: Glowing Cyan LiDAR Ring
    const lidarRingGeo = new THREE.TorusGeometry(0.18, 0.03, 12, 24);
    const lidarRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const lidarRing = new THREE.Mesh(lidarRingGeo, lidarRingMat);
    lidarRing.rotation.x = Math.PI / 2;
    lidarRing.position.set(0.8, 0.76, 0);
    agvGroup.add(lidarRing);

    // Part 5-8: 4 Heavy-duty Drive Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.8,
      metalness: 0.1,
    });
    const wheelPositions = [
      [0.7, 0.25, 0.75],
      [0.7, 0.25, -0.75],
      [-0.7, 0.25, 0.75],
      [-0.7, 0.25, -0.75],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = !isSoftwareGl;
      agvGroup.add(wheel);
    });

    // Part 9: Cargo Payload (High-precision Servomotor crate)
    const payloadGeo = new THREE.BoxGeometry(0.9, 0.6, 0.8);
    const payloadMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      metalness: 0.4,
      roughness: 0.3,
    });
    const payload = new THREE.Mesh(payloadGeo, payloadMat);
    payload.position.set(-0.2, 0.98, 0);
    payload.castShadow = !isSoftwareGl;
    agvGroup.add(payload);

    // Part 10: Ground contact shadow
    agvGroup.add(createContactShadow(1.5, 0.5));
    scene.add(agvGroup);

    // B. High-Bay Storage Racks (Composite 10 Parts)
    const rackGroups: THREE.Group[] = [];
    const rackOffsets = [-6, 6];

    rackOffsets.forEach((rx) => {
      const rack = new THREE.Group();
      rack.position.set(rx, 0, -4);

      // Upright Columns (Blue Steel)
      const colGeo = new THREE.BoxGeometry(0.15, 7.5, 0.15);
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        metalness: 0.8,
        roughness: 0.2,
      });
      const colCoords = [
        [-2.5, 3.75, -1.2],
        [-2.5, 3.75, 1.2],
        [2.5, 3.75, -1.2],
        [2.5, 3.75, 1.2],
        [0, 3.75, -1.2],
        [0, 3.75, 1.2],
      ];
      colCoords.forEach(([cx, cy, cz]) => {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(cx, cy, cz);
        col.castShadow = !isSoftwareGl;
        rack.add(col);
      });

      // Horizontal Shelf Tiers (Safety Orange)
      const shelfTiers: THREE.Mesh[] = [];
      const shelfGeo = new THREE.BoxGeometry(5.2, 0.12, 2.5);
      const shelfMat = new THREE.MeshStandardMaterial({
        color: 0xea580c,
        metalness: 0.7,
        roughness: 0.35,
      });

      [1.2, 3.2, 5.2, 7.2].forEach((sy) => {
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(0, sy, 0);
        shelf.castShadow = !isSoftwareGl;
        shelf.receiveShadow = !isSoftwareGl;
        rack.add(shelf);
        shelfTiers.push(shelf);

        // Add SKU crates on shelves
        const crateColors = [0x6366f1, 0x06b6d4, 0x10b981, 0xf59e0b];
        for (let bx = -1.8; bx <= 1.8; bx += 1.2) {
          const crateGeo = new THREE.BoxGeometry(0.8, 0.7, 0.9);
          const crateMat = new THREE.MeshStandardMaterial({
            color: crateColors[Math.floor(Math.random() * crateColors.length)],
            roughness: 0.4,
            metalness: 0.1,
          });
          const crate = new THREE.Mesh(crateGeo, crateMat);
          crate.position.set(bx, sy + 0.4, (Math.random() - 0.5) * 0.4);
          crate.castShadow = !isSoftwareGl;
          rack.add(crate);
        }
      });

      rack.add(createContactShadow(3.5, 0.4));
      scene.add(rack);
      rackGroups.push(rack);
    });

    // C. Articulated Robotic Picking Arm (Composite 8 Parts)
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 0, 5);

    // Arm Base
    const armBaseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.5, 24);
    const armBaseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
    });
    const armBase = new THREE.Mesh(armBaseGeo, armBaseMat);
    armBase.position.y = 0.25;
    armGroup.add(armBase);

    // Turntable
    const turnGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 24);
    const turnMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const turntable = new THREE.Mesh(turnGeo, turnMat);
    turntable.position.y = 0.6;
    armGroup.add(turntable);

    // Lower Boom Arm
    const boomGeo = new THREE.BoxGeometry(0.5, 2.4, 0.5);
    const boomMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.75,
      roughness: 0.25,
    });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.position.set(0, 1.8, 0);
    boom.rotation.z = 0.2;
    armGroup.add(boom);

    // Elbow Joint
    const elbowGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const elbowMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15 });
    const elbow = new THREE.Mesh(elbowGeo, elbowMat);
    elbow.position.set(-0.25, 2.9, 0);
    armGroup.add(elbow);

    // Forearm
    const foreGeo = new THREE.BoxGeometry(0.4, 2.0, 0.4);
    const fore = new THREE.Mesh(foreGeo, boomMat);
    fore.position.set(0.4, 3.6, 0);
    fore.rotation.z = -0.6;
    armGroup.add(fore);

    // Gripper Effector
    const gripGeo = new THREE.BoxGeometry(0.3, 0.3, 0.6);
    const grip = new THREE.Mesh(gripGeo, elbowMat);
    grip.position.set(1.1, 4.3, 0);
    armGroup.add(grip);

    armGroup.add(createContactShadow(2.0, 0.4));
    scene.add(armGroup);

    // 8. Animation & Damped Camera Loop
    let clock = new THREE.Clock();
    let frameId = 0;
    let agvT = 0;

    const _scratchVec = new THREE.Vector3();

    const tick = () => {
      const dt = clock.getDelta();
      const speed = speedRef.current;

      // Move AGV on racetrack waypoints
      agvT += dt * 0.4 * speed;
      const rx = 6;
      const rz = 4.5;
      const agvX = Math.sin(agvT) * rx;
      const agvZ = Math.cos(agvT * 0.8) * rz;
      const nextX = Math.sin(agvT + 0.05) * rx;
      const nextZ = Math.cos((agvT + 0.05) * 0.8) * rz;

      agvGroup.position.set(agvX, 0, agvZ);
      agvGroup.lookAt(nextX, 0, nextZ);

      // Rotate LiDAR turret
      lidarTurret.rotation.y += dt * 8 * speed;

      // Animate robotic picking arm
      turntable.rotation.y = Math.sin(agvT * 1.2) * 0.6;
      boom.rotation.z = 0.2 + Math.sin(agvT * 1.5) * 0.15;
      fore.rotation.z = -0.6 + Math.cos(agvT * 1.5) * 0.2;

      // Apply Exploded-view vertical separation on racks
      const exploded = explodedRef.current;
      rackGroups.forEach((rack, rIdx) => {
        rack.position.y = THREE.MathUtils.damp(rack.position.y, exploded * (rIdx % 2 === 0 ? 1.5 : -0.5), 6, dt);
      });

      // Smooth exponential camera damping
      const lambda = 4.5;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, lambda, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, lambda, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, lambda, dt);

      currentCamLook.current.x = THREE.MathUtils.damp(currentCamLook.current.x, targetCamLook.current.x, lambda, dt);
      currentCamLook.current.y = THREE.MathUtils.damp(currentCamLook.current.y, targetCamLook.current.y, lambda, dt);
      currentCamLook.current.z = THREE.MathUtils.damp(currentCamLook.current.z, targetCamLook.current.z, lambda, dt);
      camera.lookAt(currentCamLook.current);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const setView = (view: 'OVERVIEW' | 'AGV' | 'ARM' | 'RACK') => {
    setActiveCameraView(view);
    switch (view) {
      case 'OVERVIEW':
        targetCamPos.current.set(18, 14, 22);
        targetCamLook.current.set(0, 2, 0);
        break;
      case 'AGV':
        targetCamPos.current.set(8, 7, 10);
        targetCamLook.current.set(0, 1, 0);
        break;
      case 'ARM':
        targetCamPos.current.set(3, 5, 9);
        targetCamLook.current.set(0, 2.5, 5);
        break;
      case 'RACK':
        targetCamPos.current.set(-10, 8, 4);
        targetCamLook.current.set(-6, 3.5, -4);
        break;
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Header Badge (Minimal viewport footprint) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Autonomous Warehouse 3D Digital Twin</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PBR STUDIO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Bay Austin-04 • AGV Fleet Active • LiDAR 60fps
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Live Telemetry Badge */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none hidden sm:block">
        <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">LiDAR:</span>
            <span className="text-cyan-400 font-semibold">{hudStats.lidarRate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">AGV Batt:</span>
            <span className="text-emerald-400 font-semibold">{hudStats.agvBattery}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Optical Nav:</span>
            <span className="text-indigo-400 font-semibold">{hudStats.guidanceLock}</span>
          </div>
        </div>
      </div>

      {/* Bottom Collapsible Control Dock (Per Three.js skill: <= 15% viewport footprint, solid/rgba surfaces) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[820px]">
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center -mb-2 relative z-30">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-3 py-1 rounded-t-lg bg-slate-900 border-t border-x border-slate-700 text-slate-400 hover:text-white text-[10px] font-mono flex items-center space-x-1 transition shadow-md"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="h-3 w-3" />
                <span>Show 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>Hide Controls (Zen Mode)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Surface */}
        {!isDockCollapsed && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Camera Viewpoints */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
                <Eye className="h-3 w-3 text-indigo-400" />
                Camera:
              </span>
              {[
                { id: 'OVERVIEW', label: 'Depot Orbit' },
                { id: 'AGV', label: 'AGV-01 Track' },
                { id: 'ARM', label: 'Robotic Cell' },
                { id: 'RACK', label: 'High-Bay Racks' },
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setView(cam.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                    activeCameraView === cam.id
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            {/* Exploded View & Speed Sliders */}
            <div className="flex items-center space-x-4">
              {/* Exploded Rack Separation */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-amber-400" />
                  Exploded:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-20 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* AGV Speed */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Speed:</span>
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setAgvSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                      agvSpeed === spd
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
