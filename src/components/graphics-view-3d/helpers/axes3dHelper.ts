import * as THREE from 'three';
import { createTextSprite } from './spriteLabelHelper';

// Axis color tokens matching GeoGebra 3D reference
export const AXIS_COLORS = {
  x: { hex: 0xdc2626, str: '#dc2626' }, // Red
  y: { hex: 0x16a34a, str: '#16a34a' }, // Green
  z: { hex: 0x2563eb, str: '#2563eb' }, // Blue
};

/**
 * Generates an offscreen radial-gradient texture for the soft-faded ground plane
 */
export function createGroundPlaneTexture(size: number = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const radius = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);

  // Soft gray fill in center fading smoothly to completely transparent at edge
  gradient.addColorStop(0, 'rgba(180, 188, 198, 0.45)');
  gradient.addColorStop(0.35, 'rgba(195, 202, 210, 0.38)');
  gradient.addColorStop(0.65, 'rgba(215, 222, 228, 0.22)');
  gradient.addColorStop(0.85, 'rgba(235, 240, 244, 0.08)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates the soft-faded semi-transparent ground plane
 */
export function createGroundPlane(planeSize: number = 28): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(planeSize, planeSize);
  const texture = createGroundPlaneTexture(512);

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false, // Prevents depth-sorting artifacts with objects drawn on it
  });

  const planeMesh = new THREE.Mesh(geom, mat);
  planeMesh.name = '__ground_plane__';
  planeMesh.renderOrder = -1; // Draw before other transparent objects
  return planeMesh;
}

/**
 * Builds the complete 3D Coordinate Axes group matching GeoGebra reference
 */
export function createAxesGroup(
  axisLength: number = 8.5,
  tickMin: number = -8,
  tickMax: number = 8,
  zTickMin: number = -3,
  zTickMax: number = 6
): THREE.Group {
  const group = new THREE.Group();
  group.name = '__axes_group__';

  const coneRadius = 0.16;
  const coneHeight = 0.55;
  const coneGeom = new THREE.ConeGeometry(coneRadius, coneHeight, 16);

  // ----------------------------------------------------
  // 1. X-AXIS (Red)
  // ----------------------------------------------------
  const xLineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-axisLength, 0, 0),
    new THREE.Vector3(axisLength, 0, 0),
  ]);
  const xLineMat = new THREE.LineBasicMaterial({ color: AXIS_COLORS.x.hex, linewidth: 2 });
  const xLine = new THREE.Line(xLineGeom, xLineMat);
  group.add(xLine);

  // Positive X Arrowhead Cone
  const xArrowMat = new THREE.MeshBasicMaterial({ color: AXIS_COLORS.x.hex });
  const xArrow = new THREE.Mesh(coneGeom, xArrowMat);
  xArrow.position.set(axisLength, 0, 0);
  xArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
  group.add(xArrow);

  // Positive X Label
  const xLabel = createTextSprite('x', AXIS_COLORS.x.str, 0.6, 32, true);
  xLabel.position.set(axisLength + 0.5, -0.3, 0);
  group.add(xLabel);

  // ----------------------------------------------------
  // 2. Y-AXIS (Green)
  // ----------------------------------------------------
  const yLineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -axisLength, 0),
    new THREE.Vector3(0, axisLength, 0),
  ]);
  const yLineMat = new THREE.LineBasicMaterial({ color: AXIS_COLORS.y.hex, linewidth: 2 });
  const yLine = new THREE.Line(yLineGeom, yLineMat);
  group.add(yLine);

  // Positive Y Arrowhead Cone
  const yArrowMat = new THREE.MeshBasicMaterial({ color: AXIS_COLORS.y.hex });
  const yArrow = new THREE.Mesh(coneGeom, yArrowMat);
  yArrow.position.set(0, axisLength, 0);
  yArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0));
  group.add(yArrow);

  // Positive Y Label
  const yLabel = createTextSprite('y', AXIS_COLORS.y.str, 0.6, 32, true);
  yLabel.position.set(0.3, axisLength + 0.5, 0);
  group.add(yLabel);

  // ----------------------------------------------------
  // 3. Z-AXIS (Blue) - Solid above z=0, Dashed below z=0
  // ----------------------------------------------------
  // Solid positive segment (z >= 0)
  const zPosGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, axisLength),
  ]);
  const zPosMat = new THREE.LineBasicMaterial({ color: AXIS_COLORS.z.hex, linewidth: 2 });
  const zPosLine = new THREE.Line(zPosGeom, zPosMat);
  group.add(zPosLine);

  // Dashed negative segment (z < 0)
  const zNegGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -axisLength),
    new THREE.Vector3(0, 0, 0),
  ]);
  const zNegMat = new THREE.LineDashedMaterial({
    color: AXIS_COLORS.z.hex,
    linewidth: 2,
    dashSize: 0.35,
    gapSize: 0.25,
  });
  const zNegLine = new THREE.Line(zNegGeom, zNegMat);
  zNegLine.computeLineDistances(); // Critical for LineDashedMaterial to render dashes!
  group.add(zNegLine);

  // Positive Z Arrowhead Cone
  const zArrowMat = new THREE.MeshBasicMaterial({ color: AXIS_COLORS.z.hex });
  const zArrow = new THREE.Mesh(coneGeom, zArrowMat);
  zArrow.position.set(0, 0, axisLength);
  zArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
  group.add(zArrow);

  // Positive Z Label
  const zLabel = createTextSprite('z', AXIS_COLORS.z.str, 0.6, 32, true);
  zLabel.position.set(0.3, 0, axisLength + 0.5);
  group.add(zLabel);

  // ----------------------------------------------------
  // 4. INTEGER TICK MARKS (Instanced dots + Sprite numbers)
  // ----------------------------------------------------
  const dotRadius = 0.055;
  const dotGeom = new THREE.SphereGeometry(dotRadius, 10, 10);

  // Collect tick positions for instanced meshes
  const xTicks: number[] = [];
  for (let i = tickMin; i <= tickMax; i++) {
    if (i !== 0) xTicks.push(i);
  }

  const yTicks: number[] = [];
  for (let i = tickMin; i <= tickMax; i++) {
    if (i !== 0) yTicks.push(i);
  }

  const zTicks: number[] = [];
  for (let i = zTickMin; i <= zTickMax; i++) {
    if (i !== 0) zTicks.push(i);
  }

  // --- X-Axis Ticks ---
  const xDotMat = new THREE.MeshBasicMaterial({ color: AXIS_COLORS.x.hex });
  const xInstancedDots = new THREE.InstancedMesh(dotGeom, xDotMat, xTicks.length);
  const dummyObj = new THREE.Object3D();

  xTicks.forEach((tickVal, idx) => {
    dummyObj.position.set(tickVal, 0, 0);
    dummyObj.updateMatrix();
    xInstancedDots.setMatrixAt(idx, dummyObj.matrix);

    // Number label in red
    const numSprite = createTextSprite(`${tickVal}`, AXIS_COLORS.x.str, 0.38, 22, true);
    numSprite.position.set(tickVal, -0.28, 0);
    group.add(numSprite);
  });
  xInstancedDots.instanceMatrix.needsUpdate = true;
  group.add(xInstancedDots);

  // --- Y-Axis Ticks ---
  const yDotMat = new THREE.MeshBasicMaterial({ color: AXIS_COLORS.y.hex });
  const yInstancedDots = new THREE.InstancedMesh(dotGeom, yDotMat, yTicks.length);

  yTicks.forEach((tickVal, idx) => {
    dummyObj.position.set(0, tickVal, 0);
    dummyObj.updateMatrix();
    yInstancedDots.setMatrixAt(idx, dummyObj.matrix);

    // Number label in green
    const numSprite = createTextSprite(`${tickVal}`, AXIS_COLORS.y.str, 0.38, 22, true);
    numSprite.position.set(0.28, tickVal, 0);
    group.add(numSprite);
  });
  yInstancedDots.instanceMatrix.needsUpdate = true;
  group.add(yInstancedDots);

  // --- Z-Axis Ticks ---
  const zDotMat = new THREE.MeshBasicMaterial({ color: AXIS_COLORS.z.hex });
  const zInstancedDots = new THREE.InstancedMesh(dotGeom, zDotMat, zTicks.length);

  zTicks.forEach((tickVal, idx) => {
    dummyObj.position.set(0, 0, tickVal);
    dummyObj.updateMatrix();
    zInstancedDots.setMatrixAt(idx, dummyObj.matrix);

    // Number label in blue
    const numSprite = createTextSprite(`${tickVal}`, AXIS_COLORS.z.str, 0.38, 22, true);
    numSprite.position.set(-0.28, 0, tickVal);
    group.add(numSprite);
  });
  zInstancedDots.instanceMatrix.needsUpdate = true;
  group.add(zInstancedDots);

  return group;
}
