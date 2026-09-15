import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { useUIStore } from '../../../store/useUIStore';
import { resolvePoint } from '../../geometry/Point';
import {
  circleFromCenterAndPoint,
  circleFromCenterAndRadius,
  circleFromThreePoints,
  semicircleFromDiameter,
  circularArcFromCenter,
  circumcircularArc,
} from '../../geometry/Circle';
import { getNextPointLabel } from '../../construction/labelGenerator';

export const circleCenterPointTool: ToolHandler = {
  id: 'circle-center-point',
  name: 'Circle with Center through Point',
  instruction: 'Select center point, then point on circle',
  createsPoints: true,
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const center = selections[0];
    const point = selections[1];

    const newObj: GeoObject = {
      id: `circle_${Date.now()}`,
      label: 'c',
      type: 'circle',
      definition: `Circle(${center.label}, ${point.label})`,
      dependsOn: [center.id, point.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'circle-center-point',
      createdAt: Date.now(),
    };

    cm.addObject(newObj);
  },
};

export const circleCenterRadiusTool: ToolHandler = {
  id: 'circle-center-radius',
  name: 'Circle: Center & Radius',
  instruction: 'Select center point, then enter radius',
  createsPoints: true,
  clicksRequired: 1,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const centerObj = selections[0];

    useUIStore.getState().openValueInputModal({
      title: 'Circle with Center & Radius',
      label: 'Radius',
      defaultValue: '3',
      inputType: 'number',
      onConfirm: (val) => {
        const radius = parseFloat(val) || 3;
        const centerPt = resolvePoint(centerObj.value as any);

        cm.addObject({
          id: `circle_${Date.now()}`,
          label: 'c',
          type: 'circle',
          definition: `Radius = ${radius}`,
          dependsOn: [centerObj.id],
          value: circleFromCenterAndRadius(centerPt, radius),
          visible: true,
          labelVisible: true,
          style: { color: '#4b5563', thickness: 2, opacity: 1 },
          createdByToolId: 'circle-center-radius',
          createdAt: Date.now(),
        });
      },
    });
  },
};

export const circleThreePointsTool: ToolHandler = {
  id: 'circle-three-points',
  name: 'Circle through 3 Points',
  instruction: 'Select three points',
  createsPoints: true,
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `circle_${Date.now()}`,
      label: 'c',
      type: 'circle',
      definition: `Circle(${selections[0].label}, ${selections[1].label}, ${selections[2].label})`,
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'circle-three-points',
      createdAt: Date.now(),
    });
  },
};

export const compassTool: ToolHandler = {
  id: 'compass',
  name: 'Compass',
  instruction: 'Select segment or two points for radius, then center point',
  createsPoints: true,
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const p1 = selections[0];
    const p2 = selections[1];
    const center = selections[2];

    const newObj: GeoObject = {
      id: `circle_${Date.now()}`,
      label: 'c',
      type: 'circle',
      definition: '',
      dependsOn: [p1.id, p2.id, center.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'compass',
      createdAt: Date.now(),
    };

    cm.addObject(newObj);
  },
};

export const semicircleTool: ToolHandler = {
  id: 'semicircle',
  name: 'Semicircle',
  instruction: 'Select two end points',
  createsPoints: true,
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const p1 = selections[0];
    const p2 = selections[1];

    const newObj: GeoObject = {
      id: `semicircle_${Date.now()}`,
      label: 'c',
      type: 'circle',
      definition: `Semicircle(${p1.label}, ${p2.label})`,
      dependsOn: [p1.id, p2.id],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'semicircle',
      createdAt: Date.now(),
    };

    cm.addObject(newObj);
  },
};

export const circularArcTool: ToolHandler = {
  id: 'circular-arc',
  name: 'Circular Arc',
  instruction: 'Select center and two points',
  createsPoints: true,
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `arc_${Date.now()}`,
      label: 'd',
      type: 'circle',
      definition: `CircularArc(${selections[0].label}, ${selections[1].label}, ${selections[2].label})`,
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'circular-arc',
      createdAt: Date.now(),
    });
  },
};

export const circumcircularArcTool: ToolHandler = {
  id: 'circumcircular-arc',
  name: 'Circumcircular Arc',
  instruction: 'Select three points on arc',
  createsPoints: true,
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `arc_${Date.now()}`,
      label: 'd',
      type: 'circle',
      definition: `CircumcircularArc(${selections[0].label}, ${selections[1].label}, ${selections[2].label})`,
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'circumcircular-arc',
      createdAt: Date.now(),
    });
  },
};

export const circularSectorTool: ToolHandler = {
  id: 'circular-sector',
  name: 'Circular Sector',
  instruction: 'Select center and two points',
  createsPoints: true,
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `sector_${Date.now()}`,
      label: 's',
      type: 'circle',
      definition: `CircularSector(${selections[0].label}, ${selections[1].label}, ${selections[2].label})`,
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 2, opacity: 0.25 },
      createdByToolId: 'circular-sector',
      createdAt: Date.now(),
    });
  },
};

export const circumcircularSectorTool: ToolHandler = {
  id: 'circumcircular-sector',
  name: 'Circumcircular Sector',
  instruction: 'Select three points on sector',
  createsPoints: true,
  clicksRequired: 3,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `sector_${Date.now()}`,
      label: 's',
      type: 'circle',
      definition: `CircumcircularSector(${selections[0].label}, ${selections[1].label}, ${selections[2].label})`,
      dependsOn: selections.map((s) => s.id),
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 2, opacity: 0.25 },
      createdByToolId: 'circumcircular-sector',
      createdAt: Date.now(),
    });
  },
};
