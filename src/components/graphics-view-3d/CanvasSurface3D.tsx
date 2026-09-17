'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useConstructionStore } from '../../store/useConstructionStore';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { createThreeObject, disposeThreeObject } from './adapters/object3dAdapters';
import { createAxesGroup, createGroundPlane } from './helpers/axes3dHelper';
import { GeoObject } from '../../types/geo';

interface CanvasSurface3DProps {
  showAxes?: boolean;
  showGrid?: boolean;
  showPlane?: boolean;
  onControlsReady?: (controls: OrbitControls, camera: THREE.PerspectiveCamera) => void;
}

export const CanvasSurface3D: React.FC<CanvasSurface3DProps> = ({
  showAxes = true,
  showGrid = true,
  showPlane = true,
  onControlsReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const objects = useConstructionStore((s) => s.objects);
  const manager = useConstructionStore((s) => s.manager);
  const { activeToolId } = useToolStore();

  // Internal refs for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const helpersGroupRef = useRef<THREE.Group | null>(null);
  const groundPlaneRef = useRef<THREE.Mesh | null>(null);

  // Render request flag for on-demand rendering
  const needsRenderRef = useRef<boolean>(true);
  const isAutoRotatingRef = useRef<boolean>(false);

  // Multi-step tool state
  const toolStepRef = useRef<{ toolId: string; selectedIds: string[] }>({
    toolId: activeToolId,
    selectedIds: [],
  });

  // Dragging state
  const dragRef = useRef<{
    isDragging: boolean;
    dragObjId: string | null;
    startPoint: THREE.Vector3 | null;
    dragPlane: THREE.Plane;
    isVerticalDrag: boolean;
  }>({
    isDragging: false,
    dragObjId: null,
    startPoint: null,
    dragPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    isVerticalDrag: false,
  });

  // Request on-demand render
  const requestRender = useCallback(() => {
    needsRenderRef.current = true;
  }, []);

  // Reset tool step on tool change
  useEffect(() => {
    toolStepRef.current = { toolId: activeToolId, selectedIds: [] };

    // Update OrbitControls button mapping based on active navigation tool
    if (controlsRef.current) {
      if (activeToolId === 'move-graphics-view') {
        controlsRef.current.mouseButtons = {
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        };
      } else {
        controlsRef.current.mouseButtons = {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        };
      }
    }
  }, [activeToolId]);

  // Generate unique object names (A, B, C... / l1, l2... / pl1... / c1...)
  const getNextName = useCallback(
    (prefix: string) => {
      const existing = objects.map((o) => o.label);
      if (prefix.length === 1 && prefix >= 'A' && prefix <= 'Z') {
        for (let i = 0; i < 26; i++) {
          const char = String.fromCharCode(65 + i);
          if (!existing.includes(char)) return char;
        }
        let counter = 1;
        while (existing.includes(`${prefix}${counter}`)) counter++;
        return `${prefix}${counter}`;
      }
      let counter = 1;
      while (existing.includes(`${prefix}${counter}`)) counter++;
      return `${prefix}${counter}`;
    },
    [objects]
  );

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene with Pure White Background matching reference
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // 2. Camera (Z is up in GeoGebra 3D) with Isometric-like Look-Down Angle
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.set(15, -18, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer (setClearColor pure white, devicePixelRatio capped at 2)
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0xffffff, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.maxDistance = 200;
    controls.minDistance = 1.5;
    controlsRef.current = controls;

    // Listen to controls change for on-demand rendering
    controls.addEventListener('change', () => {
      // Dynamic ground plane scaling to reach visible horizon
      if (groundPlaneRef.current && camera) {
        const dist = camera.position.distanceTo(controls.target);
        const scaleFactor = THREE.MathUtils.clamp(dist / 22, 0.75, 3.2);
        groundPlaneRef.current.scale.set(scaleFactor, scaleFactor, 1);
      }
      needsRenderRef.current = true;
    });

    if (onControlsReady) onControlsReady(controls, camera);

    // 5. Fixed Scene-Level Lighting (1 DirectionalLight + 1 AmbientLight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(15, 20, 25);
    scene.add(dirLight);

    // 6. Groups
    const helpersGroup = new THREE.Group();
    scene.add(helpersGroup);
    helpersGroupRef.current = helpersGroup;

    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // 7. On-Demand Render Loop (0% idle CPU/GPU when scene is resting)
    let animationFrameId: number;
    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const hasAutoRotate = controls.autoRotate;
      isAutoRotatingRef.current = hasAutoRotate;

      if (hasAutoRotate) {
        controls.update();
        needsRenderRef.current = true;
      }

      if (needsRenderRef.current) {
        controls.update();
        renderer.render(scene, camera);
        needsRenderRef.current = false;
      }
    };
    renderLoop();
    needsRenderRef.current = true;

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      needsRenderRef.current = true;
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onControlsReady]);

  // Update Environment Helpers (Axes, Ticks, Radial-Gradient Ground Plane)
  useEffect(() => {
    const helpers = helpersGroupRef.current;
    if (!helpers) return;

    // Clear previous helpers
    while (helpers.children.length > 0) {
      const child = helpers.children[0];
      disposeThreeObject(child);
      helpers.remove(child);
    }
    groundPlaneRef.current = null;

    // 1. Soft-faded Radial-Gradient Ground Plane
    if (showPlane) {
      const planeMesh = createGroundPlane(28);
      helpers.add(planeMesh);
      groundPlaneRef.current = planeMesh;
    }

    // 2. Coordinate Axes with integer ticks, positive arrowheads & letter labels
    if (showAxes) {
      const axesGroup = createAxesGroup(8.5, -8, 8, -3, 6);
      helpers.add(axesGroup);
    }

    requestRender();
  }, [showAxes, showGrid, showPlane, requestRender]);

  // Sync ConstructionManager GeoObjects into Three.js Scene
  useEffect(() => {
    const group = objectsGroupRef.current;
    if (!group) return;

    // Cleanly dispose existing objects
    while (group.children.length > 0) {
      const child = group.children[0];
      disposeThreeObject(child);
      group.remove(child);
    }

    // Build new Three.js objects
    objects.forEach((geoObj) => {
      const threeObj = createThreeObject(geoObj);
      if (threeObj) {
        group.add(threeObj);
      }
    });

    requestRender();
  }, [objects, requestRender]);

  // Raycasting utility
  const getRaycastHit = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const group = objectsGroupRef.current;
      if (!container || !camera || !group) return null;

      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.params.Line = { threshold: 0.25 };
      raycaster.params.Points = { threshold: 0.35 };
      raycaster.setFromCamera(mouse, camera);

      // Check objects in scene
      const intersects = raycaster.intersectObjects(group.children, true);
      if (intersects.length > 0) {
        let hitMesh: THREE.Object3D | null = intersects[0].object;
        while (hitMesh && !(hitMesh as any).geoId && hitMesh !== group) {
          hitMesh = hitMesh.parent;
        }
        const geoId = hitMesh ? (hitMesh as any).geoId : undefined;
        return {
          geoId,
          point: intersects[0].point,
          object: hitMesh,
        };
      }

      // Check intersection with XY Plane (z = 0)
      const xyPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const targetPoint = new THREE.Vector3();
      const hitPlane = raycaster.ray.intersectPlane(xyPlane, targetPoint);
      if (hitPlane) {
        return {
          geoId: undefined,
          point: targetPoint,
          object: null,
        };
      }

      return null;
    },
    []
  );

  // Helper to create a point at coordinates
  const createPointAt = useCallback(
    (pos: THREE.Vector3): string => {
      const name = getNextName('A');
      const ptId = `pt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newPt: GeoObject = {
        id: ptId,
        label: name,
        type: 'point',
        definition: `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`,
        value: {
          kind: 'free',
          x: parseFloat(pos.x.toFixed(2)),
          y: parseFloat(pos.y.toFixed(2)),
          z: parseFloat(pos.z.toFixed(2)),
        },
        style: { color: '#1e88e5', thickness: 5, opacity: 1 },
        visible: true,
        labelVisible: true,
        dependsOn: [],
        createdByToolId: 'point',
        createdAt: Date.now(),
      };
      manager.addObject(newPt);
      return ptId;
    },
    [getNextName, manager]
  );

  // Handle pointer down (Tool trigger or Drag start)
  const handlePointerDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const hit = getRaycastHit(event);
    if (!hit) return;

    // --- Move Tool: start point dragging or allow camera orbit ---
    if (activeToolId === 'move') {
      if (hit.geoId) {
        const obj = manager.getObject(hit.geoId);
        if (obj && obj.type === 'point' && obj.dependsOn.length === 0) {
          if (controlsRef.current) controlsRef.current.enabled = false;
          dragRef.current = {
            isDragging: true,
            dragObjId: hit.geoId,
            startPoint: hit.point.clone(),
            dragPlane: event.shiftKey
              ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -hit.point.y) // Vertical Z drag
              : new THREE.Plane(new THREE.Vector3(0, 0, 1), -hit.point.z), // Horizontal XY drag
            isVerticalDrag: event.shiftKey,
          };
        }
      }
      return;
    }

    // --- Navigation Tools (handled natively by OrbitControls) ---
    if (activeToolId === 'rotate-3d-view' || activeToolId === 'move-graphics-view') {
      return;
    }

    // --- Delete Tool ---
    if (activeToolId === 'delete') {
      if (hit.geoId) {
        manager.removeObject(hit.geoId);
      }
      return;
    }

    // --- Show/Hide Label Tool ---
    if (activeToolId === 'show-hide-label') {
      if (hit.geoId) {
        const obj = manager.getObject(hit.geoId);
        if (obj) {
          manager.updateObject(hit.geoId, { labelVisible: obj.labelVisible === false });
        }
      }
      return;
    }

    // --- Show/Hide Object Tool ---
    if (activeToolId === 'show-hide-object') {
      if (hit.geoId) {
        const obj = manager.getObject(hit.geoId);
        if (obj) {
          manager.updateObject(hit.geoId, { visible: obj.visible === false });
        }
      }
      return;
    }

    // --- Copy Visual Style Tool ---
    if (activeToolId === 'copy-visual-style') {
      if (hit.geoId) {
        const state = toolStepRef.current;
        if (state.selectedIds.length === 0) {
          state.selectedIds.push(hit.geoId);
        } else {
          const sourceObj = manager.getObject(state.selectedIds[0]);
          if (sourceObj && sourceObj.style) {
            manager.updateObject(hit.geoId, { style: { ...sourceObj.style } });
          }
        }
      }
      return;
    }

    // --- Text Tool (ValueInputModal) ---
    if (activeToolId === 'text') {
      const pos = hit.point.clone();
      useUIStore.getState().openValueInputModal({
        title: 'Text',
        label: 'Text Content',
        defaultValue: 'Text 1',
        inputType: 'text',
        placeholder: 'Enter text',
        onConfirm: (val) => {
          if (!val.trim()) return;
          const name = getNextName('text');
          const newObj: GeoObject = {
            id: `text_${Date.now()}`,
            label: name,
            type: 'text' as any,
            definition: `"${val}"`,
            value: { text: val, position: { x: pos.x, y: pos.y, z: pos.z } },
            style: { color: '#000000', thickness: 2, opacity: 1 },
            visible: true,
            labelVisible: true,
            dependsOn: [],
            createdByToolId: 'text',
            createdAt: Date.now(),
          };
          manager.addObject(newObj);
        },
      });
      return;
    }

    // --- Area Tool ---
    if (activeToolId === 'area') {
      if (hit.geoId) {
        const target = manager.getObject(hit.geoId);
        if (target) {
          const name = getNextName('area');
          const newObj: GeoObject = {
            id: `area_${Date.now()}`,
            label: name,
            type: 'area' as any,
            definition: `Area(${target.label})`,
            value: target.value,
            style: { color: '#000000', thickness: 2, opacity: 1 },
            visible: true,
            labelVisible: true,
            dependsOn: [hit.geoId],
            createdByToolId: 'area',
            createdAt: Date.now(),
          };
          manager.addObject(newObj);
        }
      }
      return;
    }

    // --- Volume Tool ---
    if (activeToolId === 'volume') {
      if (hit.geoId) {
        const target = manager.getObject(hit.geoId);
        if (target) {
          const name = getNextName('vol');
          const newObj: GeoObject = {
            id: `vol_${Date.now()}`,
            label: name,
            type: 'volume' as any,
            definition: `Volume(${target.label})`,
            value: target.value,
            style: { color: '#000000', thickness: 2, opacity: 1 },
            visible: true,
            labelVisible: true,
            dependsOn: [hit.geoId],
            createdByToolId: 'volume',
            createdAt: Date.now(),
          };
          manager.addObject(newObj);
        }
      }
      return;
    }

    // --- Extrude to Pyramid / Prism (ValueInputModal) ---
    if (activeToolId === 'extrude-to-prism' || activeToolId === 'extrude-to-pyramid') {
      if (hit.geoId) {
        const polyObj = manager.getObject(hit.geoId);
        if (polyObj && polyObj.type === 'polygon') {
          const isPrism = activeToolId === 'extrude-to-prism';
          useUIStore.getState().openValueInputModal({
            title: isPrism ? 'Extrude to Prism' : 'Extrude to Pyramid',
            label: 'Altitude',
            defaultValue: '4',
            inputType: 'number',
            placeholder: 'Enter altitude (e.g. 4)',
            onConfirm: (val) => {
              const altitude = Math.max(0.1, parseFloat(val) || 4);
              const name = getNextName(isPrism ? 'prism' : 'pyramid');
              const newObj: GeoObject = {
                id: `${activeToolId}_${Date.now()}`,
                label: name,
                type: (isPrism ? 'prism' : 'pyramid') as any,
                definition: `${isPrism ? 'Prism' : 'Pyramid'}(${polyObj.label}, ${altitude})`,
                value: { vertices: [], faces: [], altitude },
                style: { color: isPrism ? '#00897b' : '#fb8c00', thickness: 2, opacity: 0.55 },
                visible: true,
                labelVisible: true,
                dependsOn: [hit.geoId!],
                createdByToolId: activeToolId,
                createdAt: Date.now(),
              };
              manager.addObject(newObj);
            },
          });
        }
      }
      return;
    }

    // --- Net Tool ---
    if (activeToolId === 'net') {
      if (hit.geoId) {
        const solidObj = manager.getObject(hit.geoId);
        if (
          solidObj &&
          (solidObj.type === 'cube' ||
            solidObj.type === 'pyramid' ||
            solidObj.type === 'prism' ||
            (solidObj.type as string) === 'tetrahedron')
        ) {
          const name = getNextName('net');
          const newObj: GeoObject = {
            id: `net_${Date.now()}`,
            label: name,
            type: 'polygon' as any,
            definition: `Net(${solidObj.label})`,
            value: solidObj.value,
            style: { color: '#8e24aa', thickness: 2, opacity: 0.35 },
            visible: true,
            labelVisible: true,
            dependsOn: [hit.geoId],
            createdByToolId: 'net',
            createdAt: Date.now(),
          };
          manager.addObject(newObj);
        }
      }
      return;
    }

    // --- Point Tool & Point on Object ---
    if (activeToolId === 'point' || activeToolId === 'point-on-object') {
      createPointAt(hit.point);
      return;
    }

    // --- Attach / Detach Point ---
    if (activeToolId === 'attach-detach-point') {
      const state = toolStepRef.current;
      if (hit.geoId) {
        state.selectedIds.push(hit.geoId);
        if (state.selectedIds.length === 2) {
          state.selectedIds = [];
        }
      }
      return;
    }

    // --- Segment with Given Length (ValueInputModal) ---
    if (activeToolId === 'segment-given-length') {
      const clickedId = hit.geoId || createPointAt(hit.point);
      const p1 = manager.getObject(clickedId);
      if (p1) {
        useUIStore.getState().openValueInputModal({
          title: 'Segment with Given Length',
          label: 'Length',
          defaultValue: '5',
          inputType: 'number',
          placeholder: 'Enter length',
          onConfirm: (val) => {
            const len = Math.max(0.01, parseFloat(val) || 5);
            const p1Val = p1.value as any;
            const p2Name = getNextName('B');
            const p2Id = `pt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const p2X = parseFloat(((p1Val?.x ?? 0) + len).toFixed(2));
            const p2Y = parseFloat((p1Val?.y ?? 0).toFixed(2));
            const p2Z = parseFloat((p1Val?.z ?? 0).toFixed(2));
            const p2: GeoObject = {
              id: p2Id,
              label: p2Name,
              type: 'point',
              definition: `(${p2X}, ${p2Y}, ${p2Z})`,
              value: { kind: 'free', x: p2X, y: p2Y, z: p2Z },
              style: { color: '#1e88e5', thickness: 5, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [],
              createdByToolId: 'point',
              createdAt: Date.now(),
            };
            manager.addObject(p2);

            const segName = getNextName('f');
            const segObj: GeoObject = {
              id: `segment_${Date.now()}`,
              label: segName,
              type: 'segment',
              definition: `Segment(${p1.label}, ${len})`,
              value: { p1: p1.value, p2: p2.value },
              style: { color: '#1e88e5', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [clickedId, p2Id],
              createdByToolId: 'segment',
              createdAt: Date.now(),
            };
            manager.addObject(segObj);
          },
        });
      }
      return;
    }

    // --- Sphere with Center and Radius (ValueInputModal) ---
    if (activeToolId === 'sphere-center-radius') {
      const clickedId = hit.geoId || createPointAt(hit.point);
      const p1 = manager.getObject(clickedId);
      if (p1) {
        useUIStore.getState().openValueInputModal({
          title: 'Sphere with Center and Radius',
          label: 'Radius',
          defaultValue: '3',
          inputType: 'number',
          placeholder: 'Enter radius (e.g. 3)',
          onConfirm: (val) => {
            const radius = Math.max(0.01, parseFloat(val) || 3);
            const name = getNextName('sphere');
            const newObj: GeoObject = {
              id: `sphere_${Date.now()}`,
              label: name,
              type: 'sphere',
              definition: `Sphere(${p1.label}, ${radius})`,
              value: { center: p1.value, radius },
              style: { color: '#e53935', thickness: 2, opacity: 0.55 },
              visible: true,
              labelVisible: true,
              dependsOn: [clickedId],
              createdByToolId: 'sphere-center-radius',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          },
        });
      }
      return;
    }

    // --- 3D Polygon Tool: Click vertices in order, click first vertex to close ---
    if (activeToolId === 'polygon') {
      const state = toolStepRef.current;
      const clickedId = hit.geoId || createPointAt(hit.point);

      if (state.selectedIds.length >= 3 && clickedId === state.selectedIds[0]) {
        const polyPointIds = [...state.selectedIds];
        const name = getNextName('poly');
        const newObj: GeoObject = {
          id: `poly_${Date.now()}`,
          label: name,
          type: 'polygon',
          definition: `Polygon(${polyPointIds.map((id) => manager.getObject(id)?.label || id).join(', ')})`,
          value: { vertices: [] },
          style: { color: '#ff7043', thickness: 2, opacity: 0.45 },
          visible: true,
          labelVisible: true,
          dependsOn: polyPointIds,
          createdByToolId: 'polygon',
          createdAt: Date.now(),
        };
        manager.addObject(newObj);
        state.selectedIds = [];
        return;
      }

      if (!state.selectedIds.includes(clickedId)) {
        state.selectedIds.push(clickedId);
      }
      return;
    }

    // --- Polyline Tool: Click vertices in order, click first vertex to close ---
    if (activeToolId === 'polyline') {
      const state = toolStepRef.current;
      const clickedId = hit.geoId || createPointAt(hit.point);

      if (state.selectedIds.length >= 2 && clickedId === state.selectedIds[0]) {
        const pts = [...state.selectedIds];
        const name = getNextName('polyline');
        const newObj: GeoObject = {
          id: `polyline_${Date.now()}`,
          label: name,
          type: 'polyline' as any,
          definition: `Polyline(${pts.map((id) => manager.getObject(id)?.label || id).join(', ')})`,
          value: { points: [] },
          style: { color: '#0288d1', thickness: 2.5, opacity: 1 },
          visible: true,
          labelVisible: true,
          dependsOn: pts,
          createdByToolId: 'polyline',
          createdAt: Date.now(),
        };
        manager.addObject(newObj);
        state.selectedIds = [];
        return;
      }

      if (!state.selectedIds.includes(clickedId)) {
        state.selectedIds.push(clickedId);
      }
      return;
    }

    // --- Regular Polygon: Click 2 points, enter vertex count >= 3 (ValueInputModal) ---
    if (activeToolId === 'regular-polygon') {
      const clickedId = hit.geoId || createPointAt(hit.point);
      const state = toolStepRef.current;
      state.selectedIds.push(clickedId);

      if (state.selectedIds.length === 2) {
        const [id1, id2] = state.selectedIds;
        const p1 = manager.getObject(id1);
        const p2 = manager.getObject(id2);
        if (p1 && p2) {
          useUIStore.getState().openValueInputModal({
            title: 'Regular Polygon',
            label: 'Vertices',
            defaultValue: '4',
            inputType: 'number',
            placeholder: 'Enter number of vertices (≥3)',
            onConfirm: (val) => {
              const n = Math.max(3, parseInt(val, 10) || 4);
              const name = getNextName('poly');
              const newObj: GeoObject = {
                id: `regpoly_${Date.now()}`,
                label: name,
                type: 'polygon',
                definition: `RegularPolygon(${p1.label}, ${p2.label}, ${n})`,
                value: { vertices: [], n, is3D: true },
                style: { color: '#ff7043', thickness: 2, opacity: 0.45 },
                visible: true,
                labelVisible: true,
                dependsOn: [id1, id2],
                createdByToolId: 'regular-polygon',
                createdAt: Date.now(),
              };
              manager.addObject(newObj);
            },
          });
        }
        state.selectedIds = [];
      }
      return;
    }

    // --- Pyramid & Prism: Dual Mode (Select Polygon Base + Apex OR Click Points Directly) ---
    if (activeToolId === 'pyramid' || activeToolId === 'prism') {
      const state = toolStepRef.current;

      // 1. If user clicked on an existing polygon object as the first selection
      if (state.selectedIds.length === 0 && hit.geoId) {
        const obj = manager.getObject(hit.geoId);
        if (obj && obj.type === 'polygon') {
          state.selectedIds.push(hit.geoId);
          return;
        }
      }

      // 2. If base polygon was selected (length === 1 and it's a polygon), next click is apex
      if (state.selectedIds.length === 1) {
        const firstObj = manager.getObject(state.selectedIds[0]);
        if (firstObj && firstObj.type === 'polygon') {
          const apexId = hit.geoId || createPointAt(hit.point);
          const apexObj = manager.getObject(apexId);
          if (apexObj) {
            const name = getNextName(activeToolId);
            const newObj: GeoObject = {
              id: `${activeToolId}_${Date.now()}`,
              label: name,
              type: activeToolId as any,
              definition: `${activeToolId === 'pyramid' ? 'Pyramid' : 'Prism'}(${firstObj.label}, ${apexObj.label})`,
              value: { vertices: [], faces: [] },
              style: { color: activeToolId === 'pyramid' ? '#fb8c00' : '#00897b', thickness: 2, opacity: 0.55 },
              visible: true,
              labelVisible: true,
              dependsOn: [state.selectedIds[0], apexId],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
          return;
        }
      }

      // 3. Otherwise: Point-by-point mode
      const clickedPtId = hit.geoId || createPointAt(hit.point);

      // Case A: User clicked the first point again to close base polygon (>= 3 points clicked)
      if (state.selectedIds.length >= 3 && clickedPtId === state.selectedIds[0]) {
        const basePts = [...state.selectedIds];
        const basePolyName = getNextName('poly');
        const basePolyObj: GeoObject = {
          id: `poly_${Date.now()}`,
          label: basePolyName,
          type: 'polygon',
          definition: `Polygon(${basePts.map((id) => manager.getObject(id)?.label || id).join(', ')})`,
          value: { vertices: [] },
          style: { color: '#ff7043', thickness: 2, opacity: 0.45 },
          visible: true,
          labelVisible: true,
          dependsOn: basePts,
          createdByToolId: 'polygon',
          createdAt: Date.now(),
        };
        manager.addObject(basePolyObj);
        state.selectedIds = [basePolyObj.id]; // Next click will be apex
        return;
      }

      // Case B: User clicked a new point
      if (!state.selectedIds.includes(clickedPtId)) {
        state.selectedIds.push(clickedPtId);
      }

      // If user has clicked 4 points without manually closing loop, automatically construct base [p1,p2,p3] + apex [p4]
      if (state.selectedIds.length === 4) {
        const [p1Id, p2Id, p3Id, p4Id] = state.selectedIds;
        const p1 = manager.getObject(p1Id);
        const p2 = manager.getObject(p2Id);
        const p3 = manager.getObject(p3Id);
        const p4 = manager.getObject(p4Id);
        if (p1 && p2 && p3 && p4) {
          const basePolyName = getNextName('poly');
          const basePolyObj: GeoObject = {
            id: `poly_${Date.now()}`,
            label: basePolyName,
            type: 'polygon',
            definition: `Polygon(${p1.label}, ${p2.label}, ${p3.label})`,
            value: { vertices: [] },
            style: { color: '#ff7043', thickness: 2, opacity: 0.45 },
            visible: true,
            labelVisible: true,
            dependsOn: [p1Id, p2Id, p3Id],
            createdByToolId: 'polygon',
            createdAt: Date.now(),
          };
          manager.addObject(basePolyObj);

          const name = getNextName(activeToolId);
          const newObj: GeoObject = {
            id: `${activeToolId}_${Date.now()}`,
            label: name,
            type: activeToolId as any,
            definition: `${activeToolId === 'pyramid' ? 'Pyramid' : 'Prism'}(${basePolyName}, ${p4.label})`,
            value: { vertices: [], faces: [] },
            style: { color: activeToolId === 'pyramid' ? '#fb8c00' : '#00897b', thickness: 2, opacity: 0.55 },
            visible: true,
            labelVisible: true,
            dependsOn: [basePolyObj.id, p4Id],
            createdByToolId: activeToolId,
            createdAt: Date.now(),
          };
          manager.addObject(newObj);
        }
        state.selectedIds = [];
        return;
      }
      return;
    }

    // --- Other Multi-Step Tools ---
    handleMultiStepTool(hit);
  };

  // Dispatch other multi-step tools
  const handleMultiStepTool = (hit: { geoId?: string; point: THREE.Vector3 }) => {
    let clickedPointId = hit.geoId;
    if (!clickedPointId) {
      clickedPointId = createPointAt(hit.point);
    }

    const state = toolStepRef.current;
    state.selectedIds.push(clickedPointId);

    switch (activeToolId) {
      // --- 2-Point Lines ---
      case 'segment':
      case 'line':
      case 'ray':
      case 'vector': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            const prefix = activeToolId === 'vector' ? 'u' : 'f';
            const name = getNextName(prefix);
            const newObj: GeoObject = {
              id: `${activeToolId}_${Date.now()}`,
              label: name,
              type: activeToolId as any,
              definition: `${activeToolId}(${p1.label}, ${p2.label})`,
              value: { p1: p1.value, p2: p2.value },
              style: { color: activeToolId === 'vector' ? '#7b1fa2' : '#1e88e5', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Perpendicular Line & Parallel Line ---
      case 'perpendicular-line':
      case 'parallel-line': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('g');
            const newObj: GeoObject = {
              id: `${activeToolId}_${Date.now()}`,
              label: name,
              type: 'line',
              definition: `${activeToolId === 'perpendicular-line' ? 'PerpendicularLine' : 'ParallelLine'}(${o1.label}, ${o2.label})`,
              value: { p1: { x: 0, y: 0, z: 0 }, p2: { x: 1, y: 0, z: 0 } },
              style: { color: '#00897b', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Angle Bisector ---
      case 'angle-bisector': {
        if (state.selectedIds.length === 3) {
          const [id1, id2, id3] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          const p3 = manager.getObject(id3);
          if (p1 && p2 && p3) {
            const name = getNextName('b');
            const newObj: GeoObject = {
              id: `bisector_${Date.now()}`,
              label: name,
              type: 'line',
              definition: `AngleBisector(${p1.label}, ${p2.label}, ${p3.label})`,
              value: { p1: { x: 0, y: 0, z: 0 }, p2: { x: 1, y: 0, z: 0 } },
              style: { color: '#8e24aa', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2, id3],
              createdByToolId: 'angle-bisector',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Tangents ---
      case 'tangents': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('t');
            const newObj: GeoObject = {
              id: `tangent_${Date.now()}`,
              label: name,
              type: 'line',
              definition: `Tangent(${o1.label}, ${o2.label})`,
              value: { p1: { x: 0, y: 0, z: 0 }, p2: { x: 1, y: 0, z: 0 } },
              style: { color: '#00897b', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'tangents',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Midpoint / Center ---
      case 'midpoint-center': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            const name = getNextName('M');
            const newObj: GeoObject = {
              id: `mid_${Date.now()}`,
              label: name,
              type: 'point',
              definition: `Midpoint(${p1.label}, ${p2.label})`,
              value: { kind: 'dependent', x: 0, y: 0, z: 0 },
              style: { color: '#00897b', thickness: 5, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'midpoint-center',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Intersect ---
      case 'intersect': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('I');
            const newObj: GeoObject = {
              id: `intersect_${Date.now()}`,
              label: name,
              type: 'point',
              definition: `Intersect(${o1.label}, ${o2.label})`,
              value: { kind: 'dependent', x: 0, y: 0, z: 0 },
              style: { color: '#d81b60', thickness: 5, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'intersect',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- 3D Planes ---
      case 'plane-three-points':
      case 'plane': {
        if (state.selectedIds.length === 3) {
          const [id1, id2, id3] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          const p3 = manager.getObject(id3);
          if (p1 && p2 && p3) {
            const name = getNextName('p');
            const newObj: GeoObject = {
              id: `plane_${Date.now()}`,
              label: name,
              type: 'plane',
              definition: `Plane(${p1.label}, ${p2.label}, ${p3.label})`,
              value: { a: 0, b: 0, c: 1, d: 0 },
              style: { color: '#00acc1', thickness: 2, opacity: 0.28 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2, id3],
              createdByToolId: 'plane-three-points',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'parallel-plane':
      case 'perpendicular-plane': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('p');
            const newObj: GeoObject = {
              id: `plane_${Date.now()}`,
              label: name,
              type: 'plane',
              definition: `${activeToolId}(${o1.label}, ${o2.label})`,
              value: { a: 0, b: 0, c: 1, d: 0 },
              style: { color: '#00acc1', thickness: 2, opacity: 0.28 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- 3D Solids: Cube & Tetrahedron ---
      case 'cube': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            const name = getNextName('cube');
            const newObj: GeoObject = {
              id: `cube_${Date.now()}`,
              label: name,
              type: 'cube',
              definition: `Cube(${p1.label}, ${p2.label})`,
              value: { vertices: [], faces: [] },
              style: { color: '#e91e63', thickness: 2, opacity: 0.5 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'cube',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'tetrahedron': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            const name = getNextName('tetra');
            const newObj: GeoObject = {
              id: `tetra_${Date.now()}`,
              label: name,
              type: 'tetrahedron' as any,
              definition: `Tetrahedron(${p1.label}, ${p2.label})`,
              value: { vertices: [], faces: [] },
              style: { color: '#7e57c2', thickness: 2, opacity: 0.5 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'tetrahedron',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'sphere-center-point': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            const name = getNextName('sphere');
            const newObj: GeoObject = {
              id: `sphere_${Date.now()}`,
              label: name,
              type: 'sphere',
              definition: `Sphere(${p1.label}, ${p2.label})`,
              value: { center: p1.value, radius: 2 },
              style: { color: '#e53935', thickness: 2, opacity: 0.55 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'sphere-center-point',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'cone': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            useUIStore.getState().openValueInputModal({
              title: 'Cone',
              label: 'Radius',
              defaultValue: '2',
              inputType: 'number',
              placeholder: 'Enter radius',
              onConfirm: (val) => {
                const radius = Math.max(0.01, parseFloat(val) || 2);
                const name = getNextName('cone');
                const newObj: GeoObject = {
                  id: `cone_${Date.now()}`,
                  label: name,
                  type: 'cone',
                  definition: `Cone(${p1.label}, ${p2.label}, ${radius})`,
                  value: { baseCenter: p1.value, apex: p2.value, radius },
                  style: { color: '#00897b', thickness: 2, opacity: 0.5 },
                  visible: true,
                  labelVisible: true,
                  dependsOn: [id1, id2],
                  createdByToolId: 'cone',
                  createdAt: Date.now(),
                };
                manager.addObject(newObj);
              },
            });
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'cylinder': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            useUIStore.getState().openValueInputModal({
              title: 'Cylinder',
              label: 'Radius',
              defaultValue: '2',
              inputType: 'number',
              placeholder: 'Enter radius',
              onConfirm: (val) => {
                const radius = Math.max(0.01, parseFloat(val) || 2);
                const name = getNextName('cylinder');
                const newObj: GeoObject = {
                  id: `cylinder_${Date.now()}`,
                  label: name,
                  type: 'cylinder',
                  definition: `Cylinder(${p1.label}, ${p2.label}, ${radius})`,
                  value: { baseCenter: p1.value, topCenter: p2.value, radius },
                  style: { color: '#00897b', thickness: 2, opacity: 0.5 },
                  visible: true,
                  labelVisible: true,
                  dependsOn: [id1, id2],
                  createdByToolId: 'cylinder',
                  createdAt: Date.now(),
                };
                manager.addObject(newObj);
              },
            });
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Surface of Revolution ---
      case 'surface-of-revolution': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('rev');
            const newObj: GeoObject = {
              id: `surface_rev_${Date.now()}`,
              label: name,
              type: 'surface-of-revolution' as any,
              definition: `Surface(${o1.label}, ${o2.label})`,
              value: { vertices: [], faces: [] },
              style: { color: '#ab47bc', thickness: 2, opacity: 0.55 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'surface-of-revolution',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- 3D Circles & Arcs ---
      case 'circle-axis-point': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('c');
            const newObj: GeoObject = {
              id: `circle_axis_${Date.now()}`,
              label: name,
              type: 'circle',
              definition: `Circle(${o1.label}, ${o2.label})`,
              value: { center: { x: 0, y: 0, z: 0 }, radius: 2, normal: { x: 0, y: 0, z: 1 } },
              style: { color: '#e53935', thickness: 2, opacity: 0.35 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'circle-axis-point',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'circle-center-radius-direction': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const d2 = manager.getObject(id2);
          if (p1 && d2) {
            useUIStore.getState().openValueInputModal({
              title: 'Circle with Center, Radius & Direction',
              label: 'Radius',
              defaultValue: '3',
              inputType: 'number',
              placeholder: 'Enter radius',
              onConfirm: (val) => {
                const radius = Math.max(0.01, parseFloat(val) || 3);
                const name = getNextName('c');
                const newObj: GeoObject = {
                  id: `circle_dir_${Date.now()}`,
                  label: name,
                  type: 'circle',
                  definition: `Circle(${p1.label}, ${radius}, ${d2.label})`,
                  value: { center: p1.value, radius, normal: { x: 0, y: 0, z: 1 } },
                  style: { color: '#e53935', thickness: 2, opacity: 0.35 },
                  visible: true,
                  labelVisible: true,
                  dependsOn: [id1, id2],
                  createdByToolId: 'circle-center-radius-direction',
                  createdAt: Date.now(),
                };
                manager.addObject(newObj);
              },
            });
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Conics ---
      case 'ellipse':
      case 'hyperbola': {
        if (state.selectedIds.length === 3) {
          const [id1, id2, id3] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          const p3 = manager.getObject(id3);
          if (p1 && p2 && p3) {
            const name = getNextName('c');
            const newObj: GeoObject = {
              id: `${activeToolId}_${Date.now()}`,
              label: name,
              type: activeToolId as any,
              definition: `${activeToolId === 'ellipse' ? 'Ellipse' : 'Hyperbola'}(${p1.label}, ${p2.label}, ${p3.label})`,
              value: { points: [] },
              style: { color: '#8e24aa', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2, id3],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'parabola': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('c');
            const newObj: GeoObject = {
              id: `parabola_${Date.now()}`,
              label: name,
              type: 'parabola',
              definition: `Parabola(${o1.label}, ${o2.label})`,
              value: { points: [] },
              style: { color: '#8e24aa', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'parabola',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'conic-five-points': {
        if (state.selectedIds.length === 5) {
          const pts = state.selectedIds.map((id) => manager.getObject(id)).filter(Boolean);
          if (pts.length === 5) {
            const name = getNextName('c');
            const newObj: GeoObject = {
              id: `conic_${Date.now()}`,
              label: name,
              type: 'conic-five-points' as any,
              definition: `Conic(${pts.map((p) => p!.label).join(', ')})`,
              value: { points: [] },
              style: { color: '#8e24aa', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: state.selectedIds,
              createdByToolId: 'conic-five-points',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Circles & Arcs ---
      case 'circle-three-points':
      case 'circumcircular-arc':
      case 'circumcircular-sector': {
        if (state.selectedIds.length === 3) {
          const [id1, id2, id3] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          const p3 = manager.getObject(id3);
          if (p1 && p2 && p3) {
            const name = getNextName('c');
            const newObj: GeoObject = {
              id: `${activeToolId}_${Date.now()}`,
              label: name,
              type: activeToolId as any,
              definition: `${activeToolId}(${p1.label}, ${p2.label}, ${p3.label})`,
              value: { center: { x: 0, y: 0, z: 0 }, radius: 2, normal: { x: 0, y: 0, z: 1 } },
              style: { color: '#e53935', thickness: 2, opacity: 0.35 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2, id3],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'circular-arc':
      case 'circular-sector': {
        if (state.selectedIds.length === 3) {
          const [id1, id2, id3] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          const p3 = manager.getObject(id3);
          if (p1 && p2 && p3) {
            const name = getNextName('c');
            const newObj: GeoObject = {
              id: `${activeToolId}_${Date.now()}`,
              label: name,
              type: activeToolId as any,
              definition: `${activeToolId}(${p1.label}, ${p2.label}, ${p3.label})`,
              value: { center: p1.value, radius: 2, normal: { x: 0, y: 0, z: 1 } },
              style: { color: '#e53935', thickness: 2, opacity: 0.35 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2, id3],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Transforms ---
      case 'reflect-plane':
      case 'reflect-point':
      case 'reflect-line':
      case 'translate-vector': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName(o1.label || 'o') + "'";
            const newObj: GeoObject = {
              id: `trans_${Date.now()}`,
              label: name,
              type: o1.type,
              definition: `${activeToolId}(${o1.label}, ${o2.label})`,
              value: o1.value,
              style: { ...(o1.style || { color: '#00897b', thickness: 2, opacity: 0.8 }) },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: activeToolId,
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'rotate-around-line': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            useUIStore.getState().openValueInputModal({
              title: 'Rotate around Line',
              label: 'Angle (degrees)',
              defaultValue: '45',
              inputType: 'number',
              placeholder: 'Enter angle in degrees',
              onConfirm: (val) => {
                const angleDeg = parseFloat(val) || 45;
                const name = getNextName(o1.label || 'o') + "'";
                const newObj: GeoObject = {
                  id: `rot_${Date.now()}`,
                  label: name,
                  type: o1.type,
                  definition: `Rotate(${o1.label}, ${angleDeg}°, ${o2.label})`,
                  value: o1.value,
                  style: { ...(o1.style || { color: '#00897b', thickness: 2, opacity: 0.8 }) },
                  visible: true,
                  labelVisible: true,
                  dependsOn: [id1, id2],
                  createdByToolId: 'rotate-around-line',
                  createdAt: Date.now(),
                };
                manager.addObject(newObj);
              },
            });
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'dilate-from-point': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            useUIStore.getState().openValueInputModal({
              title: 'Dilate from Point',
              label: 'Dilation Factor',
              defaultValue: '2',
              inputType: 'number',
              placeholder: 'Enter factor',
              onConfirm: (val) => {
                const factor = parseFloat(val) || 2;
                const name = getNextName(o1.label || 'o') + "'";
                const newObj: GeoObject = {
                  id: `dilate_${Date.now()}`,
                  label: name,
                  type: o1.type,
                  definition: `Dilate(${o1.label}, ${factor}, ${o2.label})`,
                  value: o1.value,
                  style: { ...(o1.style || { color: '#00897b', thickness: 2, opacity: 0.8 }) },
                  visible: true,
                  labelVisible: true,
                  dependsOn: [id1, id2],
                  createdByToolId: 'dilate-from-point',
                  createdAt: Date.now(),
                };
                manager.addObject(newObj);
              },
            });
          }
          state.selectedIds = [];
        }
        break;
      }

      // --- Measure & Special ---
      case 'angle': {
        if (state.selectedIds.length === 3) {
          const [id1, id2, id3] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          const p3 = manager.getObject(id3);
          if (p1 && p2 && p3) {
            const name = getNextName('α');
            const newObj: GeoObject = {
              id: `angle_${Date.now()}`,
              label: name,
              type: 'angle',
              definition: `Angle(${p1.label}, ${p2.label}, ${p3.label})`,
              value: { vertex: p2.value, p1: p1.value, p2: p3.value, deg: 60 },
              style: { color: '#2e7d32', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2, id3],
              createdByToolId: 'angle',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'distance-length': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const p2 = manager.getObject(id2);
          if (p1 && p2) {
            const name = getNextName('d');
            const newObj: GeoObject = {
              id: `dist_${Date.now()}`,
              label: name,
              type: 'distance' as any,
              definition: `Distance(${p1.label}, ${p2.label})`,
              value: { p1: p1.value, p2: p2.value, distance: 0 },
              style: { color: '#000000', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'distance-length',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'vector-from-point': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const p1 = manager.getObject(id1);
          const v2 = manager.getObject(id2);
          if (p1 && v2) {
            const name = getNextName('u');
            const newObj: GeoObject = {
              id: `vec_${Date.now()}`,
              label: name,
              type: 'vector',
              definition: `Vector(${p1.label}, ${v2.label})`,
              value: { p1: p1.value, p2: p1.value },
              style: { color: '#7b1fa2', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'vector-from-point',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      case 'polar-diameter-line': {
        if (state.selectedIds.length === 2) {
          const [id1, id2] = state.selectedIds;
          const o1 = manager.getObject(id1);
          const o2 = manager.getObject(id2);
          if (o1 && o2) {
            const name = getNextName('p');
            const newObj: GeoObject = {
              id: `polar_${Date.now()}`,
              label: name,
              type: 'line',
              definition: `PolarLine(${o1.label}, ${o2.label})`,
              value: { p1: { x: 0, y: 0, z: 0 }, p2: { x: 1, y: 0, z: 0 } },
              style: { color: '#00897b', thickness: 2, opacity: 1 },
              visible: true,
              labelVisible: true,
              dependsOn: [id1, id2],
              createdByToolId: 'polar-diameter-line',
              createdAt: Date.now(),
            };
            manager.addObject(newObj);
          }
          state.selectedIds = [];
        }
        break;
      }

      default:
        break;
    }
  };


  // Handle pointer move (Dragging 3D Point in XY or Vertical Z)
  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging || !dragRef.current.dragObjId) return;

    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersectionPoint = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(dragRef.current.dragPlane, intersectionPoint);

    if (hit) {
      const objId = dragRef.current.dragObjId;
      const obj = manager.getObject(objId);
      if (obj && obj.type === 'point' && obj.dependsOn.length === 0) {
        const newX = parseFloat(intersectionPoint.x.toFixed(2));
        const newY = parseFloat(intersectionPoint.y.toFixed(2));
        const newZ = dragRef.current.isVerticalDrag
          ? parseFloat(intersectionPoint.z.toFixed(2))
          : (obj.value as any)?.z ?? 0;

        manager.updateObject(objId, {
          value: {
            kind: 'free',
            x: newX,
            y: newY,
            z: newZ,
          },
          definition: `(${newX}, ${newY}, ${newZ})`,
        });
        requestRender();
      }
    }
  };

  // Handle pointer up (End point drag)
  const handlePointerUp = () => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      dragRef.current.dragObjId = null;
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
      requestRender();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      className="relative w-full h-full bg-white overflow-hidden select-none outline-hidden cursor-default"
    />
  );
};
