'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CanvasSurface3D } from './CanvasSurface3D';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Home,
  Sliders,
  Eye,
  Grid,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';

export const GraphicsView3D: React.FC = () => {
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showPlane, setShowPlane] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rotationTimerRef = useRef<number | null>(null);

  const handleControlsReady = useCallback((controls: OrbitControls, camera: THREE.PerspectiveCamera) => {
    controlsRef.current = controls;
    cameraRef.current = camera;
  }, []);

  // Zoom In
  const handleZoomIn = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
      camera.position.addScaledVector(dir, 2);
      controls.update();
    }
  };

  // Zoom Out
  const handleZoomOut = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
      camera.position.addScaledVector(dir, -2);
      controls.update();
    }
  };

  // Reset to Standard View
  const handleResetView = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      controls.target.set(0, 0, 0);
      camera.position.set(15, -18, 12);
      camera.up.set(0, 0, 1);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  };

  // Toggle Auto-Rotation
  const handleToggleAutoRotate = () => {
    const controls = controlsRef.current;
    if (!controls) return;
    const nextState = !isRotating;
    setIsRotating(nextState);
    controls.autoRotate = nextState;
    controls.autoRotateSpeed = 2.0;
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white overflow-hidden select-none">
      {/* 3D WebGL Canvas Surface */}
      <CanvasSurface3D
        showAxes={showAxes}
        showGrid={showGrid}
        showPlane={showPlane}
        onControlsReady={handleControlsReady}
      />

      {/* Floating 3D Navigation Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-[#dadce0] z-20 transition-all">
        {/* Reset / Standard View */}
        <button
          onClick={handleResetView}
          title="Standard 3D View"
          className="p-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={handleToggleAutoRotate}
          title={isRotating ? 'Stop Rotation' : 'Auto Rotate View'}
          className={clsx(
            'p-2 rounded-xl transition-colors cursor-pointer',
            isRotating ? 'bg-[#f3f1fd] text-[#6557d2]' : 'text-[#5f6368] hover:text-[#1a73e8] hover:bg-black/5'
          )}
        >
          <RotateCw className={clsx('w-4 h-4', isRotating && 'animate-spin')} />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* View Options Menu Trigger */}
        <button
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          title="View Settings"
          className={clsx(
            'p-2 rounded-xl transition-colors cursor-pointer',
            showSettingsMenu ? 'bg-black/10 text-[#1a73e8]' : 'text-[#5f6368] hover:text-[#1a73e8] hover:bg-black/5'
          )}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Popup Menu */}
      {showSettingsMenu && (
        <div className="absolute top-4 right-16 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#dadce0] p-3 w-48 z-30 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-xs font-bold text-[#5f6368] uppercase tracking-wider mb-2">3D View Options</div>

          <div className="space-y-1.5 text-sm">
            <button
              onClick={() => setShowAxes(!showAxes)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 text-[#3c4043] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#5f6368]" />
                <span>Show Axes</span>
              </div>
              <input type="checkbox" checked={showAxes} onChange={() => {}} className="cursor-pointer accent-[#6557d2]" />
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 text-[#3c4043] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#5f6368]" />
                <span>Show Grid</span>
              </div>
              <input type="checkbox" checked={showGrid} onChange={() => {}} className="cursor-pointer accent-[#6557d2]" />
            </button>

            <button
              onClick={() => setShowPlane(!showPlane)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 text-[#3c4043] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5f6368]" />
                <span>Show XY-Plane</span>
              </div>
              <input type="checkbox" checked={showPlane} onChange={() => {}} className="cursor-pointer accent-[#6557d2]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
