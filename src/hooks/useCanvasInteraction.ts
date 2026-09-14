import { RefObject, useEffect } from 'react';
import { useToolStore } from '../store/useToolStore';
import { useViewStore } from '../store/useViewStore';
import { useConstructionStore } from '../store/useConstructionStore';
import { useUIStore } from '../store/useUIStore';
import { screenToWorld } from '../lib/coords/coordTransform';
import { hitTest } from '../core/tools/hitTest';
import { PointCoords } from '../core/geometry/Point';

export function useCanvasInteraction(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const toolManager = useToolStore((state) => state.toolManager);
  const viewport = useViewStore((state) => state.viewport);
  const objects = useConstructionStore((state) => state.objects);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPosAndTarget = (e: MouseEvent): { pos: PointCoords; target: any } => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pos = screenToWorld(x, y, rect.width, rect.height, viewport);
      const target = hitTest(pos, viewport, rect.width, rect.height, objects);
      return { pos, target };
    };

    const onPointerDown = (e: MouseEvent) => {
      const { pos, target } = getPosAndTarget(e);
      toolManager.handlePointerDown(pos, target);
    };

    const onPointerMove = (e: MouseEvent) => {
      const { pos, target } = getPosAndTarget(e);
      useUIStore.getState().setCurrentMouseWorld(pos);
      toolManager.handlePointerMove(pos, target);
    };

    const onPointerUp = (e: MouseEvent) => {
      const { pos, target } = getPosAndTarget(e);
      toolManager.handlePointerUp(pos, target);
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    return () => {
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
  }, [toolManager, viewport, objects, canvasRef]);
}
