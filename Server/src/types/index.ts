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
export type Roughness = 0 | 1 | 2;
export type StrokeWidth = 1 | 2 | 4;
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
  code?: string;
  codeLanguage?: string;
  codeOutput?: string;
  codeExplanation?: string;
  isExecuting?: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  elements: Element[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatRequest {
  title: string;
  elements?: Element[];
}

export interface UpdateChatRequest {
  title?: string;
  elements?: Element[];
}

export interface ChatResponse {
  id: string;
  title: string;
  elements: Element[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
