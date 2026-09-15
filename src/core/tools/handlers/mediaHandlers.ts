import { ToolHandler } from '../ToolManager';
import { ConstructionManager } from '../../construction/ConstructionManager';
import { useUIStore } from '../../../store/useUIStore';

export const textTool: ToolHandler = {
  id: 'text',
  name: 'Text',
  instruction: 'Select position or existing point',
  clicksRequired: 1,
  createsPoints: true,
  commit: (selections: any, cm: ConstructionManager) => {
    const pos = selections[0].value;
    useUIStore.getState().openValueInputModal({
      title: 'Text',
      label: 'Enter text or formula',
      defaultValue: 'GeoGebra',
      inputType: 'text',
      onConfirm: (textContent) => {
        cm.addObject({
          id: `text_${Date.now()}`,
          label: 'text',
          type: 'text',
          definition: `"${textContent}"`,
          dependsOn: [],
          value: { x: pos.x, y: pos.y, text: textContent },
          visible: true,
          labelVisible: false,
          style: { color: '#1a1a1a', thickness: 1, opacity: 1 },
          createdByToolId: 'text',
          createdAt: Date.now(),
        });
      },
    });
  },
};

export const imageTool: ToolHandler = {
  id: 'image',
  name: 'Image',
  instruction: 'Select image from files',
  clicksRequired: 1,
  createsPoints: true,
  commit: (selections: any, cm: ConstructionManager) => {
    const pos = selections[0].value;

    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (readEvent) => {
            const dataUrl = readEvent.target?.result as string;
            const img = new Image();
            img.onload = () => {
              cm.addObject({
                id: `img_${Date.now()}`,
                label: 'image',
                type: 'image',
                definition: 'Image',
                dependsOn: [],
                value: {
                  x: pos.x,
                  y: pos.y,
                  src: dataUrl,
                  width: 4,
                  height: (4 * img.height) / img.width || 3,
                },
                visible: true,
                labelVisible: false,
                style: { color: '#000', thickness: 1, opacity: 1 },
                createdByToolId: 'image',
                createdAt: Date.now(),
              });
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  },
};
