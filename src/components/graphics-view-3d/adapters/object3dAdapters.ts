import * as THREE from 'three';
import { GeoObject } from '../../../types/geo';
import { resolvePoint3D } from '../../../core/geometry3d/point3d';
import { createTextSprite } from '../helpers/spriteLabelHelper';

/**
 * Cleanly dispose of any Three.js object, its geometries, materials, and textures
 */
export function disposeThreeObject(obj: THREE.Object3D): void {
  obj.traverse((child: any) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat: any) => {
          if (mat.map) mat.map.dispose();
          mat.dispose();
        });
      } else {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
  });
}

/**
 * Helper to build solid front edges + dashed hidden back edges for polyhedra
 */
function createPolyhedronEdges(
  geometry: THREE.BufferGeometry,
  color: THREE.Color,
  renderHiddenDashed: boolean = true
): THREE.Group {
  const edgeGroup = new THREE.Group();
  const edgesGeom = new THREE.EdgesGeometry(geometry, 25);

  // 1. Visible front edges (solid)
  const solidMat = new THREE.LineBasicMaterial({
    color: color,
    linewidth: 2,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    opacity: 0.95,
  });
  const frontEdges = new THREE.LineSegments(edgesGeom, solidMat);
  frontEdges.renderOrder = 2;
  edgeGroup.add(frontEdges);

  // 2. Occluded hidden edges (dashed via GreaterDepth depth-test pass)
  if (renderHiddenDashed) {
    const dashedEdgesGeom = edgesGeom.clone();

    const dashedMat = new THREE.LineDashedMaterial({
      color: color,
      linewidth: 2,
      dashSize: 0.35,
      gapSize: 0.22,
      depthTest: true,
      depthFunc: THREE.GreaterDepth, // Renders when occluded behind solid faces
      depthWrite: false,
      transparent: true,
      opacity: 0.85,
    });
    const backEdges = new THREE.LineSegments(dashedEdgesGeom, dashedMat);
    backEdges.computeLineDistances();
    backEdges.renderOrder = 1;
    edgeGroup.add(backEdges);
  }

  return edgeGroup;
}

/**
 * Builds a Three.js 3D representation for a GeoObject
 */
export function createThreeObject(geoObj: GeoObject): THREE.Object3D | null {
  if (geoObj.visible === false) return null;

  const group = new THREE.Group();
  group.name = geoObj.id;
  (group as any).geoId = geoObj.id;

  const baseColor = geoObj.style?.color || '#1e88e5';
  const threeColor = new THREE.Color(baseColor);
  const opacity = geoObj.style?.opacity ?? 0.55;
  const thickness = geoObj.style?.thickness ?? 2;

  switch (geoObj.type) {
    case 'point': {
      const pt = resolvePoint3D(geoObj.value as any);
      const geom = new THREE.SphereGeometry(0.18, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: threeColor,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(pt.x, pt.y, pt.z);
      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      if (geoObj.labelVisible !== false && geoObj.label) {
        const labelSprite = createTextSprite(geoObj.label, baseColor, 0.45, 26, true);
        labelSprite.position.set(pt.x + 0.25, pt.y + 0.25, pt.z + 0.3);
        group.add(labelSprite);
      }
      return group;
    }

    case 'segment':
    case 'line':
    case 'ray':
    case 'vector': {
      const val = geoObj.value as any;
      if (!val?.p1 || !val?.p2) return null;
      const p1 = resolvePoint3D(val.p1);
      const p2 = resolvePoint3D(val.p2);

      let start = new THREE.Vector3(p1.x, p1.y, p1.z);
      let end = new THREE.Vector3(p2.x, p2.y, p2.z);

      if (geoObj.type === 'line') {
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        start = new THREE.Vector3().copy(start).addScaledVector(dir, -50);
        end = new THREE.Vector3().copy(end).addScaledVector(dir, 50);
      } else if (geoObj.type === 'ray') {
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        end = new THREE.Vector3().copy(start).addScaledVector(dir, 50);
      }

      const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({
        color: threeColor,
        linewidth: thickness * 1.5,
      });
      const lineMesh = new THREE.Line(geom, mat);
      (lineMesh as any).geoId = geoObj.id;
      group.add(lineMesh);

      // Vector Arrowhead
      if (geoObj.type === 'vector') {
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const arrowGeom = new THREE.ConeGeometry(0.18, 0.55, 16);
        const arrowMat = new THREE.MeshBasicMaterial({ color: threeColor });
        const arrowMesh = new THREE.Mesh(arrowGeom, arrowMat);
        arrowMesh.position.copy(end);
        arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        (arrowMesh as any).geoId = geoObj.id;
        group.add(arrowMesh);
      }

      if (geoObj.labelVisible !== false && geoObj.label) {
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const labelSprite = createTextSprite(geoObj.label, baseColor, 0.42, 24, true);
        labelSprite.position.set(mid.x + 0.2, mid.y + 0.2, mid.z + 0.25);
        group.add(labelSprite);
      }
      return group;
    }

    case 'polyline': {
      const val = geoObj.value as any;
      if (!val?.points || val.points.length < 2) return null;
      const pts = val.points.map((p: any) => {
        const r = resolvePoint3D(p);
        return new THREE.Vector3(r.x, r.y, r.z);
      });
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: threeColor,
        linewidth: thickness * 1.5,
      });
      const polyline = new THREE.Line(geom, mat);
      (polyline as any).geoId = geoObj.id;
      group.add(polyline);
      return group;
    }

    case 'polygon': {
      const val = geoObj.value as any;
      if (!val?.vertices || val.vertices.length < 3) return null;
      const pts = val.vertices.map((v: any) => {
        const r = resolvePoint3D(v);
        return new THREE.Vector3(r.x, r.y, r.z);
      });

      // Triangulate using fan from vertex 0
      const indices: number[] = [];
      for (let i = 1; i < pts.length - 1; i++) {
        indices.push(0, i, i + 1);
        indices.push(0, i + 1, i); // Double-sided indexing
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        shininess: 30,
        specular: 0x444444,
      });
      const mesh = new THREE.Mesh(geom, mat);
      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      // Polygon perimeter line
      const linePts = [...pts, pts[0]];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 2 });
      const border = new THREE.Line(lineGeom, lineMat);
      group.add(border);

      return group;
    }

    case 'plane': {
      const val = geoObj.value as any;
      if (!val || typeof val.a !== 'number') return null;
      const normal = new THREE.Vector3(val.a, val.b, val.c).normalize();
      const p0 = new THREE.Vector3(val.p0?.x ?? 0, val.p0?.y ?? 0, val.p0?.z ?? 0);

      // Bounded square polygon representing the 3D plane
      const planeGeom = new THREE.PlaneGeometry(18, 18);
      const planeMat = new THREE.MeshBasicMaterial({
        color: threeColor,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(planeGeom, planeMat);
      mesh.position.copy(p0);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      // Plane outline
      const edges = new THREE.EdgesGeometry(planeGeom);
      const lineMat = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 1.5 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.copy(mesh.position);
      wireframe.quaternion.copy(mesh.quaternion);
      group.add(wireframe);

      if (geoObj.labelVisible !== false && geoObj.label) {
        const labelSprite = createTextSprite(geoObj.label, baseColor, 0.45, 26, true);
        labelSprite.position.set(p0.x + 0.3, p0.y + 0.3, p0.z + 0.3);
        group.add(labelSprite);
      }
      return group;
    }

    case 'sphere': {
      const val = geoObj.value as any;
      if (!val?.center || typeof val?.radius !== 'number') return null;
      const center = resolvePoint3D(val.center);
      const radius = Math.max(0.01, val.radius);

      const geom = new THREE.SphereGeometry(radius, 32, 24);
      const mat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: opacity,
        shininess: 45,
        specular: 0x666666,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(center.x, center.y, center.z);
      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      // Equator wireframe ring for 3D depth cue
      const ringGeom = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: threeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const equator = new THREE.Mesh(ringGeom, ringMat);
      equator.position.copy(mesh.position);
      group.add(equator);

      if (geoObj.labelVisible !== false && geoObj.label) {
        const labelSprite = createTextSprite(geoObj.label, baseColor, 0.45, 26, true);
        labelSprite.position.set(center.x, center.y, center.z + radius + 0.35);
        group.add(labelSprite);
      }
      return group;
    }

    case 'cube': {
      const val = geoObj.value as any;
      if (!val?.vertices || val.vertices.length < 8) return null;
      const pts = val.vertices.map((v: any) => new THREE.Vector3(v.x, v.y, v.z));

      // 6 quad faces, triangulated
      const faces = [
        [0, 1, 2, 3], // bottom
        [4, 7, 6, 5], // top
        [0, 1, 5, 4], // front
        [2, 3, 7, 6], // back
        [0, 3, 7, 4], // left
        [1, 2, 6, 5], // right
      ];

      const indices: number[] = [];
      faces.forEach(([a, b, c, d]) => {
        indices.push(a, b, c, a, c, d);
      });

      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        shininess: 35,
        specular: 0x555555,
      });
      const mesh = new THREE.Mesh(geom, mat);
      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      // Edges with solid front + dashed hidden edges matching image 2
      const edges = createPolyhedronEdges(geom, threeColor, true);
      group.add(edges);

      if (geoObj.labelVisible !== false && geoObj.label && pts[0]) {
        const labelSprite = createTextSprite(geoObj.label, baseColor, 0.45, 26, true);
        const topPt = pts[4] || pts[0];
        labelSprite.position.set(topPt.x + 0.3, topPt.y + 0.3, topPt.z + 0.3);
        group.add(labelSprite);
      }
      return group;
    }

    case 'cone': {
      const val = geoObj.value as any;
      if (!val?.baseCenter || !val?.apex || typeof val?.radius !== 'number') return null;
      const base = resolvePoint3D(val.baseCenter);
      const apex = resolvePoint3D(val.apex);
      const radius = Math.max(0.01, val.radius);

      const height = new THREE.Vector3(apex.x - base.x, apex.y - base.y, apex.z - base.z).length();
      if (height < 1e-4) return null;

      const geom = new THREE.ConeGeometry(radius, height, 32);
      const mat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        shininess: 35,
        specular: 0x555555,
      });
      const mesh = new THREE.Mesh(geom, mat);

      const mid = new THREE.Vector3().addVectors(base, apex).multiplyScalar(0.5);
      mesh.position.copy(mid);

      const dir = new THREE.Vector3().subVectors(apex, base).normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      const edges = createPolyhedronEdges(geom, threeColor, false);
      edges.position.copy(mesh.position);
      edges.quaternion.copy(mesh.quaternion);
      group.add(edges);

      return group;
    }

    case 'cylinder': {
      const val = geoObj.value as any;
      if (!val?.baseCenter || !val?.topCenter || typeof val?.radius !== 'number') return null;
      const base = resolvePoint3D(val.baseCenter);
      const top = resolvePoint3D(val.topCenter);
      const radius = Math.max(0.01, val.radius);

      const height = new THREE.Vector3(top.x - base.x, top.y - base.y, top.z - base.z).length();
      if (height < 1e-4) return null;

      const geom = new THREE.CylinderGeometry(radius, radius, height, 32);
      const mat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        shininess: 35,
        specular: 0x555555,
      });
      const mesh = new THREE.Mesh(geom, mat);

      const mid = new THREE.Vector3().addVectors(base, top).multiplyScalar(0.5);
      mesh.position.copy(mid);

      const dir = new THREE.Vector3().subVectors(top, base).normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      const edges = createPolyhedronEdges(geom, threeColor, false);
      edges.position.copy(mesh.position);
      edges.quaternion.copy(mesh.quaternion);
      group.add(edges);

      return group;
    }

    case 'tetrahedron':
    case 'pyramid':
    case 'prism': {
      const val = geoObj.value as any;
      if (!val?.vertices || val.vertices.length < 4) return null;
      const pts = val.vertices.map((v: any) => resolvePoint3D(v));
      const faces: number[][] = val.faces || [];

      // Build unindexed geometry so each triangle has its own flat facet normal
      const unindexedPositions: number[] = [];
      faces.forEach((face) => {
        for (let i = 1; i < face.length - 1; i++) {
          const p0 = pts[face[0]];
          const p1 = pts[face[i]];
          const p2 = pts[face[i + 1]];
          if (p0 && p1 && p2) {
            unindexedPositions.push(p0.x, p0.y, p0.z || 0, p1.x, p1.y, p1.z || 0, p2.x, p2.y, p2.z || 0);
          }
        }
      });

      if (unindexedPositions.length === 0) return null;

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(unindexedPositions, 3));
      geom.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        shininess: 35,
        specular: 0x555555,
      });
      const mesh = new THREE.Mesh(geom, mat);
      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      // Edges with solid front + dashed hidden edges matching image 2
      const edges = createPolyhedronEdges(geom, threeColor, true);
      group.add(edges);

      return group;
    }

    case 'circle': {
      const val = geoObj.value as any;
      if (!val?.center || typeof val?.radius !== 'number') return null;
      const center = resolvePoint3D(val.center);
      const radius = Math.max(0.001, val.radius);
      const normal = val.normal ? new THREE.Vector3(val.normal.x, val.normal.y, val.normal.z).normalize() : new THREE.Vector3(0, 0, 1);

      // Circle perimeter
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const points2d = curve.getPoints(64);
      const points3d = points2d.map((p) => new THREE.Vector3(p.x, p.y, 0));
      const geom = new THREE.BufferGeometry().setFromPoints(points3d);
      const mat = new THREE.LineBasicMaterial({ color: threeColor, linewidth: thickness * 1.5 });
      const circleLine = new THREE.LineLoop(geom, mat);

      // Subtle fill
      const discGeom = new THREE.CircleGeometry(radius, 64);
      const discMat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: Math.min(opacity, 0.35),
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const discMesh = new THREE.Mesh(discGeom, discMat);

      const circleGroup = new THREE.Group();
      circleGroup.add(circleLine);
      circleGroup.add(discMesh);
      circleGroup.position.set(center.x, center.y, center.z);
      circleGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      (circleGroup as any).geoId = geoObj.id;
      group.add(circleGroup);

      if (geoObj.labelVisible !== false && geoObj.label) {
        const labelSprite = createTextSprite(geoObj.label, baseColor, 0.42, 24, true);
        labelSprite.position.set(center.x + radius * 0.7, center.y + radius * 0.7, center.z + 0.2);
        group.add(labelSprite);
      }
      return group;
    }

    case 'circular-arc':
    case 'circular-sector':
    case 'semicircle':
    case 'circumcircular-arc':
    case 'circumcircular-sector':
    case 'arc': {
      const val = geoObj.value as any;
      if (!val?.center || typeof val?.radius !== 'number') return null;
      const center = resolvePoint3D(val.center);
      const radius = Math.max(0.001, val.radius);
      const normal = val.normal ? new THREE.Vector3(val.normal.x, val.normal.y, val.normal.z).normalize() : new THREE.Vector3(0, 0, 1);
      const startAngle = val.startAngle ?? 0;
      const endAngle = val.endAngle ?? Math.PI;
      const isSector = val.isSector ?? (geoObj.type === 'circular-sector' || geoObj.type === 'circumcircular-sector');

      const segments = 48;
      const arcPts: THREE.Vector3[] = [];
      let diff = endAngle - startAngle;
      while (diff < 0) diff += 2 * Math.PI;
      for (let i = 0; i <= segments; i++) {
        const theta = startAngle + (diff * i) / segments;
        arcPts.push(new THREE.Vector3(radius * Math.cos(theta), radius * Math.sin(theta), 0));
      }

      const arcGeom = new THREE.BufferGeometry().setFromPoints(isSector ? [new THREE.Vector3(0, 0, 0), ...arcPts, new THREE.Vector3(0, 0, 0)] : arcPts);
      const arcMat = new THREE.LineBasicMaterial({ color: threeColor, linewidth: thickness * 1.5 });
      const arcLine = new THREE.Line(arcGeom, arcMat);

      const arcGroup = new THREE.Group();
      arcGroup.add(arcLine);

      if (isSector) {
        const sectorPts = [new THREE.Vector2(0, 0), ...arcPts.map((p) => new THREE.Vector2(p.x, p.y))];
        const shape = new THREE.Shape(sectorPts);
        const fillGeom = new THREE.ShapeGeometry(shape);
        const fillMat = new THREE.MeshPhongMaterial({
          color: threeColor,
          transparent: true,
          opacity: Math.min(opacity, 0.4),
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const fillMesh = new THREE.Mesh(fillGeom, fillMat);
        arcGroup.add(fillMesh);
      }

      arcGroup.position.set(center.x, center.y, center.z);
      arcGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      (arcGroup as any).geoId = geoObj.id;
      group.add(arcGroup);
      return group;
    }

    case 'ellipse':
    case 'hyperbola':
    case 'parabola':
    case 'conic':
    case 'conic-five-points':
    case 'locus': {
      const val = geoObj.value as any;
      const pts: THREE.Vector3[] = [];
      if (Array.isArray(val?.points)) {
        val.points.forEach((p: any) => {
          const r = resolvePoint3D(p);
          pts.push(new THREE.Vector3(r.x, r.y, r.z));
        });
      } else if (val?.center && typeof val?.a === 'number' && typeof val?.b === 'number') {
        const c = resolvePoint3D(val.center);
        for (let i = 0; i <= 64; i++) {
          const th = (i * 2 * Math.PI) / 64;
          pts.push(new THREE.Vector3(c.x + val.a * Math.cos(th), c.y + val.b * Math.sin(th), c.z));
        }
      }
      if (pts.length < 2) return null;
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: threeColor, linewidth: thickness * 1.5 });
      const isClosed = geoObj.type === 'ellipse' || val?.conicType === 'ellipse';
      const curveLine = isClosed ? new THREE.LineLoop(geom, mat) : new THREE.Line(geom, mat);
      (curveLine as any).geoId = geoObj.id;
      group.add(curveLine);

      if (geoObj.labelVisible !== false && geoObj.label && pts.length > 0) {
        const midPt = pts[Math.floor(pts.length / 4)] || pts[0];
        const labelSprite = createTextSprite(geoObj.label, baseColor, 0.42, 24, true);
        labelSprite.position.set(midPt.x + 0.3, midPt.y + 0.3, midPt.z + 0.2);
        group.add(labelSprite);
      }
      return group;
    }

    case 'angle': {
      const val = geoObj.value as any;
      if (!val?.vertex || !val?.p1 || !val?.p2) return null;
      const v = resolvePoint3D(val.vertex);
      const p1 = resolvePoint3D(val.p1);
      const p2 = resolvePoint3D(val.p2);

      const v1 = new THREE.Vector3(p1.x - v.x, p1.y - v.y, p1.z - v.z).normalize();
      const v2 = new THREE.Vector3(p2.x - v.x, p2.y - v.y, p2.z - v.z).normalize();
      const arcRadius = 0.8;

      const arcPoints: THREE.Vector3[] = [];
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interp = new THREE.Vector3().lerpVectors(v1, v2, t).normalize().multiplyScalar(arcRadius);
        arcPoints.push(new THREE.Vector3(v.x + interp.x, v.y + interp.y, v.z + interp.z));
      }

      const geom = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const mat = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 2 });
      const arcMesh = new THREE.Line(geom, mat);
      (arcMesh as any).geoId = geoObj.id;
      group.add(arcMesh);

      const deg = typeof val.deg === 'number' ? val.deg.toFixed(1) + '°' : geoObj.label || 'α';
      const midDir = new THREE.Vector3().addVectors(v1, v2).normalize().multiplyScalar(arcRadius + 0.35);
      const labelSprite = createTextSprite(deg, baseColor, 0.42, 24, true);
      labelSprite.position.set(v.x + midDir.x, v.y + midDir.y, v.z + midDir.z);
      group.add(labelSprite);

      return group;
    }

    case 'surface-of-revolution':
    case 'surface': {
      const val = geoObj.value as any;
      if (!val?.vertices || val.vertices.length === 0) return null;
      const pts = val.vertices.map((v: any) => new THREE.Vector3(v.x, v.y, v.z));
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      if (Array.isArray(val.faces) && val.faces.length > 0) {
        const indices: number[] = [];
        val.faces.forEach((face: number[]) => {
          for (let i = 1; i < face.length - 1; i++) {
            indices.push(face[0], face[i], face[i + 1]);
            indices.push(face[0], face[i + 1], face[i]);
          }
        });
        geom.setIndex(indices);
      }
      geom.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        color: threeColor,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        shininess: 40,
        specular: 0x555555,
      });
      const mesh = new THREE.Mesh(geom, mat);
      (mesh as any).geoId = geoObj.id;
      group.add(mesh);

      const edges = createPolyhedronEdges(geom, threeColor, false);
      group.add(edges);

      return group;
    }

    case 'text':
    case 'distance':
    case 'area':
    case 'volume': {
      const val = geoObj.value as any;
      const textContent =
        val?.text ||
        (typeof val?.volume === 'number'
          ? `Volume = ${val.volume.toFixed(2)}`
          : typeof val?.area === 'number'
          ? `Area = ${val.area.toFixed(2)}`
          : typeof val?.distance === 'number'
          ? `Distance = ${val.distance.toFixed(2)}`
          : geoObj.definition || geoObj.label || '');
      if (!textContent) return null;

      const pos = new THREE.Vector3(0, 0, 1);
      if (val?.position) {
        const r = resolvePoint3D(val.position);
        pos.set(r.x, r.y, r.z);
      } else if (Array.isArray(val?.vertices) && val.vertices.length > 0) {
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        val.vertices.forEach((v: any) => {
          const p = resolvePoint3D(v);
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
          if ((p.z ?? 0) > maxZ) maxZ = (p.z ?? 0);
        });
        // Display on the side of the 3D solid (+X, +Y, slightly elevated)
        pos.set(maxX + 0.8, maxY + 0.5, maxZ + 0.4);
      } else if (val?.baseCenter && (val?.apex || val?.topCenter)) {
        const bc = resolvePoint3D(val.baseCenter);
        const top = resolvePoint3D(val.apex || val.topCenter);
        const r = val.radius || 1;
        pos.set(Math.max(bc.x, top.x) + r + 0.8, Math.max(bc.y, top.y) + r + 0.5, Math.max(bc.z || 0, top.z || 0) + 0.4);
      } else if (val?.center) {
        const r = resolvePoint3D(val.center);
        const rad = val.radius || 1;
        pos.set(r.x + rad + 0.8, r.y + rad + 0.5, (r.z ?? 0) + 0.4);
      } else if (val?.p1 && val?.p2) {
        const r1 = resolvePoint3D(val.p1);
        const r2 = resolvePoint3D(val.p2);
        pos.set(Math.max(r1.x, r2.x) + 0.8, Math.max(r1.y, r2.y) + 0.5, Math.max(r1.z ?? 0, r2.z ?? 0) + 0.4);
      }

      const labelSprite = createTextSprite(textContent, baseColor, 0.48, 28, true);
      labelSprite.position.copy(pos);
      (labelSprite as any).geoId = geoObj.id;
      group.add(labelSprite);
      return group;
    }

    default:
      return null;
  }
}
