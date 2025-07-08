export type Tool = 
  | 'select'
  | 'hand'
  | 'rectangle' 
  | 'diamond'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'draw'
  | 'text'
  | 'image'
  | 'eraser'
  | 'code';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type Roughness = 0 | 1 | 2; // smooth, semi-rough, rough
export type StrokeWidth = 1 | 2 | 4; // thin, medium, thick
export type EdgeStyle = 'sharp' | 'round';

export interface Point {
  x: number;
  y: number;
}

export interface Element {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: StrokeWidth;
  strokeStyle: StrokeStyle;
  roughness: Roughness;
  opacity: number;
  points?: Point[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  imageUrl?: string;
  angle: number;
  isDeleted: boolean;
  // Code block specific properties
  code?: string;
  codeLanguage?: string;
  codeOutput?: string;
  codeExplanation?: string;
  isExecuting?: boolean;
}

export interface AppState {
  selectedTool: Tool;
  selectedElements: string[];
  elements: Element[];
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: StrokeWidth;
  strokeStyle: StrokeStyle;
  roughness: Roughness;
  edgeStyle: EdgeStyle;
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  isDrawing: boolean;
  draggedElement: string | null;
}
