import { describe, it, expect } from 'vitest';
import { GEOMETRY_CATEGORIES } from '../../src/config/appConfig';
import { TOOLS } from '../../src/components/tools-panel/toolsConfig';
import { allTools } from '../../src/core/tools/handlers';

describe('Geometry Tools Parity & Configuration', () => {
  it('should have all expanded geometry tool IDs defined and enabled in TOOLS', () => {
    const allExpandedToolIds = GEOMETRY_CATEGORIES.expanded.flatMap((cat) => cat.toolIds);
    
    // Check that there are at least 12 categories
    expect(GEOMETRY_CATEGORIES.expanded.length).toBe(12);

    for (const toolId of allExpandedToolIds) {
      const toolDef = TOOLS.find((t) => t.id === toolId);
      expect(toolDef, `Tool definition for ${toolId} should exist`).toBeDefined();
      expect(toolDef?.enabled, `Tool ${toolId} should be enabled`).not.toBe(false);
    }
  });

  it('should have handlers registered for all tools in allTools', () => {
    const allExpandedToolIds = GEOMETRY_CATEGORIES.expanded.flatMap((cat) => cat.toolIds);
    const registeredHandlerIds = new Set(allTools.map((t) => t.id));

    for (const toolId of allExpandedToolIds) {
      expect(registeredHandlerIds.has(toolId), `Handler for ${toolId} should be registered`).toBe(true);
    }
  });

  it('should include all Others tools from user screenshot in expanded category', () => {
    const othersCat = GEOMETRY_CATEGORIES.expanded.find((cat) => cat.id === 'others');
    expect(othersCat).toBeDefined();
    expect(othersCat?.toolIds).toEqual([
      'pen',
      'freehand-shape',
      'relation',
      'button',
      'check-box',
      'input-box',
    ]);
  });
});
