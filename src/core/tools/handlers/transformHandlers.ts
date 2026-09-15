import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { GeoObject } from '../../../types/geo';
import { useUIStore } from '../../../store/useUIStore';
import { resolvePoint } from '../../geometry/Point';
import { rotatePoint, dilatePoint, invertPointAboutCircle } from '../../geometry/transforms';

export const reflectLineTool: ToolHandler = {
  id: 'reflect-line',
  name: 'Reflect about Line',
  instruction: 'Select object to reflect, then line of reflection',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `pt_${Date.now()}`,
      label: `${selections[0].label}'`,
      type: 'point',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: { kind: 'dependent', x: 0, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'reflect-line',
      createdAt: Date.now(),
    });
  },
};

export const reflectPointTool: ToolHandler = {
  id: 'reflect-point',
  name: 'Reflect about Point',
  instruction: 'Select object to reflect, then center point',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `pt_${Date.now()}`,
      label: `${selections[0].label}'`,
      type: 'point',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: { kind: 'dependent', x: 0, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'reflect-point',
      createdAt: Date.now(),
    });
  },
};

export const translateVectorTool: ToolHandler = {
  id: 'translate-vector',
  name: 'Translate by Vector',
  instruction: 'Select object to translate, then vector',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    cm.addObject({
      id: `pt_${Date.now()}`,
      label: `${selections[0].label}'`,
      type: 'point',
      definition: '',
      dependsOn: [selections[0].id, selections[1].id],
      value: { kind: 'dependent', x: 0, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'translate-vector',
      createdAt: Date.now(),
    });
  },
};

export const rotateAroundPointTool: ToolHandler = {
  id: 'rotate-around-point',
  name: 'Rotate around Point',
  instruction: 'Select object to rotate, then center point, and enter angle',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const targetObj = selections[0];
    const centerObj = selections[1];

    useUIStore.getState().openValueInputModal({
      title: 'Rotate around Point',
      label: 'Angle (degrees)',
      defaultValue: '45°',
      inputType: 'angle',
      onConfirm: (val) => {
        const deg = parseFloat(val.replace('°', '')) || 45;
        const rad = (deg * Math.PI) / 180;
        const targetPt = resolvePoint(targetObj.value as any);
        const centerPt = resolvePoint(centerObj.value as any);
        const rotated = rotatePoint(targetPt, centerPt, rad);

        cm.addObject({
          id: `pt_${Date.now()}`,
          label: `${targetObj.label}'`,
          type: 'point',
          definition: `Rotate(${targetObj.label}, ${deg}°)`,
          dependsOn: [targetObj.id, centerObj.id],
          value: { kind: 'dependent', x: rotated.x, y: rotated.y, angleRad: rad },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 5, opacity: 1 },
          createdByToolId: 'rotate-around-point',
          createdAt: Date.now(),
        });
      },
    });
  },
};

export const dilateFromPointTool: ToolHandler = {
  id: 'dilate-from-point',
  name: 'Dilate from Point',
  instruction: 'Select object to dilate, then center point, and enter factor',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const targetObj = selections[0];
    const centerObj = selections[1];

    useUIStore.getState().openValueInputModal({
      title: 'Dilate from Point',
      label: 'Scale Factor',
      defaultValue: '2',
      inputType: 'number',
      onConfirm: (val) => {
        const factor = parseFloat(val) || 2;
        const targetPt = resolvePoint(targetObj.value as any);
        const centerPt = resolvePoint(centerObj.value as any);
        const dilated = dilatePoint(targetPt, centerPt, factor);

        cm.addObject({
          id: `pt_${Date.now()}`,
          label: `${targetObj.label}'`,
          type: 'point',
          definition: `Dilate(${targetObj.label}, ${factor})`,
          dependsOn: [targetObj.id, centerObj.id],
          value: { kind: 'dependent', x: dilated.x, y: dilated.y, factor },
          visible: true,
          labelVisible: true,
          style: { color: '#1565ef', thickness: 5, opacity: 1 },
          createdByToolId: 'dilate-from-point',
          createdAt: Date.now(),
        });
      },
    });
  },
};

export const reflectAboutCircleTool: ToolHandler = {
  id: 'reflect-about-circle',
  name: 'Reflect about Circle',
  instruction: 'Select object to reflect, then circle',
  clicksRequired: 2,
  commit: (selections: GeoObject[], cm: ConstructionManager) => {
    const targetObj = selections[0];
    const circleObj = selections[1];
    const targetPt = resolvePoint(targetObj.value as any);
    const cVal = circleObj.value as any;

    if (cVal?.center && typeof cVal?.radius === 'number') {
      const inverted = invertPointAboutCircle(targetPt, cVal);
      cm.addObject({
        id: `pt_${Date.now()}`,
        label: `${targetObj.label}'`,
        type: 'point',
        definition: `Invert(${targetObj.label}, ${circleObj.label})`,
        dependsOn: [targetObj.id, circleObj.id],
        value: { kind: 'dependent', x: inverted.x, y: inverted.y },
        visible: true,
        labelVisible: true,
        style: { color: '#1565ef', thickness: 5, opacity: 1 },
        createdByToolId: 'reflect-about-circle',
        createdAt: Date.now(),
      });
    }
  },
};
