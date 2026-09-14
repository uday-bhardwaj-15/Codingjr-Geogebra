import { segmentTool, lineTool, rayTool, vectorTool } from './lineHandlers';
import { circleCenterPointTool, compassTool, semicircleTool } from './circleHandlers';
import { midpointTool, perpendicularTool, parallelTool } from './constructHandlers';
import {
  deleteTool,
  showHideObjectTool,
  showHideLabelTool,
  moveGraphicsViewTool,
  selectObjectsTool,
} from './editHandlers';
import {
  pointTool,
  moveTool,
  intersectTool,
  extremumTool,
  rootsTool,
  bestFitLineTool,
  sliderTool,
} from './basicHandlers';
import { angleTool, distanceTool, areaTool } from './measureHandlers';
import { textTool, imageTool } from './mediaHandlers';

export const allTools = [
  moveTool,
  pointTool,
  sliderTool,
  intersectTool,
  extremumTool,
  rootsTool,
  bestFitLineTool,
  selectObjectsTool,
  moveGraphicsViewTool,
  deleteTool,
  showHideObjectTool,
  showHideLabelTool,
  segmentTool,
  lineTool,
  rayTool,
  vectorTool,
  circleCenterPointTool,
  compassTool,
  semicircleTool,
  midpointTool,
  perpendicularTool,
  parallelTool,
  angleTool,
  distanceTool,
  areaTool,
  textTool,
  imageTool,
];
