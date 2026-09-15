import { describe, it, expect } from 'vitest';
import { ConstructionManager } from '../../src/core/construction/ConstructionManager';
import {
  AddObjectCommand,
  DeleteObjectCommand,
  UpdateObjectCommand,
  ToggleVisibilityCommand,
  ToggleLabelCommand,
} from '../../src/core/construction/commands/commands';
import { circleFromCenterAndPoint } from '../../src/core/geometry/Circle';
import { lineFromTwoPoints } from '../../src/core/geometry/Line';

describe('Undo / Redo & Command Stack', () => {
  it('should undo and redo object creation correctly', () => {
    const cm = new ConstructionManager();
    expect(cm.canUndo()).toBe(false);
    expect(cm.canRedo()).toBe(false);

    // 1. Add Point A
    cm.addObject({
      id: 'pt_A',
      label: 'A',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 1, y: 2 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    expect(cm.getObjects().length).toBe(1);
    expect(cm.canUndo()).toBe(true);
    expect(cm.canRedo()).toBe(false);

    // 2. Add Point B
    cm.addObject({
      id: 'pt_B',
      label: 'B',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 4, y: 6 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    expect(cm.getObjects().length).toBe(2);

    // 3. Undo Point B
    cm.undo();
    expect(cm.getObjects().length).toBe(1);
    expect(cm.getObject('pt_B')).toBeUndefined();
    expect(cm.getObject('pt_A')).toBeDefined();
    expect(cm.canUndo()).toBe(true);
    expect(cm.canRedo()).toBe(true);

    // 4. Undo Point A
    cm.undo();
    expect(cm.getObjects().length).toBe(0);
    expect(cm.canUndo()).toBe(false);
    expect(cm.canRedo()).toBe(true);

    // 5. Redo Point A
    cm.redo();
    expect(cm.getObjects().length).toBe(1);
    expect(cm.getObject('pt_A')).toBeDefined();
    expect(cm.canUndo()).toBe(true);
    expect(cm.canRedo()).toBe(true);

    // 6. Redo Point B
    cm.redo();
    expect(cm.getObjects().length).toBe(2);
    expect(cm.getObject('pt_B')).toBeDefined();
    expect(cm.canRedo()).toBe(false);
  });

  it('should clear redo stack when a new action is performed after undo', () => {
    const cm = new ConstructionManager();

    cm.addObject({
      id: 'pt_1',
      label: 'A',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 0, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    cm.addObject({
      id: 'pt_2',
      label: 'B',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 1, y: 1 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    cm.undo(); // Undo pt_2
    expect(cm.canRedo()).toBe(true);

    // New action
    cm.addObject({
      id: 'pt_3',
      label: 'C',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 2, y: 2 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    // Redo stack must be wiped
    expect(cm.canRedo()).toBe(false);
  });

  it('should handle cascading delete and restoration of dependent objects', () => {
    const cm = new ConstructionManager();

    // Center point A
    cm.addObject({
      id: 'pt_A',
      label: 'A',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 0, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    // Perimeter point B
    cm.addObject({
      id: 'pt_B',
      label: 'B',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 3, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    // Circle c dependent on A and B
    cm.addObject({
      id: 'circle_c',
      label: 'c',
      type: 'circle',
      definition: '',
      dependsOn: ['pt_A', 'pt_B'],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'circle-center-point',
      createdAt: Date.now(),
    });

    expect(cm.getObjects().length).toBe(3);
    const cObj = cm.getObject('circle_c');
    expect(cObj?.value).toBeDefined();
    expect((cObj?.value as any).radius).toBe(3);

    // Deleting Point A must delete Circle c as well
    cm.removeObject('pt_A');
    expect(cm.getObjects().length).toBe(1); // Only pt_B remains
    expect(cm.getObject('pt_A')).toBeUndefined();
    expect(cm.getObject('circle_c')).toBeUndefined();

    // Undo delete restores Point A and Circle c with valid computed value
    cm.undo();
    expect(cm.getObjects().length).toBe(3);
    expect(cm.getObject('pt_A')).toBeDefined();
    expect(cm.getObject('circle_c')).toBeDefined();
    expect((cm.getObject('circle_c')?.value as any).radius).toBe(3);
  });

  it('should undo and redo object updates and recompute dependents live', () => {
    const cm = new ConstructionManager();

    // Point A at (0, 0)
    cm.addObject({
      id: 'pt_A',
      label: 'A',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 0, y: 0 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    // Point B at (3, 4) -> distance = 5
    cm.addObject({
      id: 'pt_B',
      label: 'B',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 3, y: 4 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    // Circle centered at A through B (radius = 5)
    cm.addObject({
      id: 'circle_c',
      label: 'c',
      type: 'circle',
      definition: '',
      dependsOn: ['pt_A', 'pt_B'],
      value: null,
      visible: true,
      labelVisible: true,
      style: { color: '#4b5563', thickness: 2, opacity: 1 },
      createdByToolId: 'circle-center-point',
      createdAt: Date.now(),
    });

    expect((cm.getObject('circle_c')?.value as any).radius).toBe(5);

    // Edit Point B coordinates from (3, 4) to (6, 8) -> distance = 10
    cm.updateObject(
      'pt_B',
      { value: { kind: 'free', x: 6, y: 8 } },
      { value: { kind: 'free', x: 3, y: 4 } }
    );

    expect((cm.getObject('circle_c')?.value as any).radius).toBe(10);

    // Undo edit -> reverts Point B to (3, 4) and Circle radius back to 5
    cm.undo();
    expect((cm.getObject('pt_B')?.value as any).x).toBe(3);
    expect((cm.getObject('pt_B')?.value as any).y).toBe(4);
    expect((cm.getObject('circle_c')?.value as any).radius).toBe(5);

    // Redo edit -> Point B becomes (6, 8) and Circle radius becomes 10
    cm.redo();
    expect((cm.getObject('pt_B')?.value as any).x).toBe(6);
    expect((cm.getObject('pt_B')?.value as any).y).toBe(8);
    expect((cm.getObject('circle_c')?.value as any).radius).toBe(10);
  });

  it('should undo and redo visibility and label toggles', () => {
    const cm = new ConstructionManager();

    cm.addObject({
      id: 'pt_A',
      label: 'A',
      type: 'point',
      definition: '',
      dependsOn: [],
      value: { kind: 'free', x: 1, y: 1 },
      visible: true,
      labelVisible: true,
      style: { color: '#1565ef', thickness: 5, opacity: 1 },
      createdByToolId: 'point',
      createdAt: Date.now(),
    });

    // Toggle visibility
    cm.toggleVisibility(['pt_A']);
    expect(cm.getObject('pt_A')?.visible).toBe(false);

    cm.undo();
    expect(cm.getObject('pt_A')?.visible).toBe(true);

    cm.redo();
    expect(cm.getObject('pt_A')?.visible).toBe(false);

    // Toggle label
    cm.toggleLabel(['pt_A']);
    expect(cm.getObject('pt_A')?.labelVisible).toBe(false);

    cm.undo();
    expect(cm.getObject('pt_A')?.labelVisible).toBe(true);
  });
});
