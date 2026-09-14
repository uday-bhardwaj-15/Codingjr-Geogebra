import { RefObject, useEffect } from 'react';
import { useViewStore } from '../store/useViewStore';

export function usePanZoom(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const { viewport, setViewport } = useViewStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Zoom logic
      const scale = e.deltaY > 0 ? 1.1 : 0.9;
      
      const width = viewport.xMax - viewport.xMin;
      const height = viewport.yMax - viewport.yMin;
      
      const newWidth = width * scale;
      const newHeight = height * scale;

      const rect = canvas.getBoundingClientRect();
      const mouseXRatio = (e.clientX - rect.left) / rect.width;
      const mouseYRatio = (e.clientY - rect.top) / rect.height;

      // Mouse position in world coords
      const worldX = viewport.xMin + width * mouseXRatio;
      const worldY = viewport.yMax - height * mouseYRatio;

      setViewport({
        xMin: worldX - newWidth * mouseXRatio,
        xMax: worldX + newWidth * (1 - mouseXRatio),
        yMin: worldY - newHeight * (1 - mouseYRatio),
        yMax: worldY + newHeight * mouseYRatio,
      });
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [viewport, setViewport, canvasRef]);
}
