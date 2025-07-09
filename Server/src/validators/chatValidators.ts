import { z } from 'zod';

// Element validation schema
const PointSchema = z.object({
  x: z.number(),
  y: z.number()
});

const ElementSchema = z.object({
  id: z.string(),
  type: z.enum(['select', 'hand', 'rectangle', 'diamond', 'circle', 'arrow', 'line', 'draw', 'text', 'image', 'eraser', 'code']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  strokeColor: z.string(),
  backgroundColor: z.string(),
  strokeWidth: z.union([z.literal(1), z.literal(2), z.literal(4)]),
  strokeStyle: z.enum(['solid', 'dashed', 'dotted']),
  roughness: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  opacity: z.number().min(0).max(1),
  points: z.array(PointSchema).optional(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  imageUrl: z.string().optional(),
  angle: z.number(),
  isDeleted: z.boolean(),
  code: z.string().optional(),
  codeLanguage: z.string().optional(),
  codeOutput: z.string().optional(),
  codeExplanation: z.string().optional(),
  isExecuting: z.boolean().optional()
});

// Chat validation schemas
export const CreateChatSchema = z.object({
  title: z.string().min(1).max(200),
  elements: z.array(ElementSchema).optional().default([])
});

export const UpdateChatSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  elements: z.array(ElementSchema).optional()
});

export const ChatIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid chat ID format')
});

// Query validation schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

export const SearchSchema = z.object({
  search: z.string().optional(),
  ...PaginationSchema.shape
});

// Export types
export type CreateChatInput = z.infer<typeof CreateChatSchema>;
export type UpdateChatInput = z.infer<typeof UpdateChatSchema>;
export type ChatIdInput = z.infer<typeof ChatIdSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;
