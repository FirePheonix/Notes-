import { Router } from 'express';
import { ChatService } from '../services/chatService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { 
  CreateChatSchema, 
  UpdateChatSchema, 
  ChatIdSchema, 
  SearchSchema 
} from '../validators/chatValidators.js';
import { z } from 'zod';
import { ApiResponse } from '../types/index.js';

const router = Router();
const chatService = new ChatService();

// Validation schemas for routes
const createChatValidation = z.object({
  body: CreateChatSchema
});

const updateChatValidation = z.object({
  params: ChatIdSchema,
  body: UpdateChatSchema
});

const getChatValidation = z.object({
  params: ChatIdSchema
});

const getChatsValidation = z.object({
  query: SearchSchema
});

const saveElementsValidation = z.object({
  params: ChatIdSchema,
  body: z.object({
    elements: z.array(z.any())
  })
});

// Create new chat
router.post('/', validate(createChatValidation), async (req: AuthenticatedRequest, res) => {
  try {
    const chat = await chatService.createChat(req.userId!, req.body);
    res.status(201).json({
      success: true,
      data: chat,
      message: 'Chat created successfully'
    } as ApiResponse<typeof chat>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

// Get all user chats
router.get('/', validate(getChatsValidation), async (req: AuthenticatedRequest, res) => {
  try {
    const chats = await chatService.getUserChats(req.userId!, req.query as any);
    res.json({
      success: true,
      data: chats
    } as ApiResponse<typeof chats>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

// Get specific chat
router.get('/:id', validate(getChatValidation), async (req: AuthenticatedRequest, res) => {
  try {
    const chat = await chatService.getChatById(req.userId!, req.params.id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: chat
    } as ApiResponse<typeof chat>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

// Update chat
router.put('/:id', validate(updateChatValidation), async (req: AuthenticatedRequest, res) => {
  try {
    const chat = await chatService.updateChat(req.userId!, req.params.id, req.body);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: chat,
      message: 'Chat updated successfully'
    } as ApiResponse<typeof chat>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

// Delete chat
router.delete('/:id', validate(getChatValidation), async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await chatService.deleteChat(req.userId!, req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

// Save elements (for auto-save)
router.post('/:id/elements', validate(saveElementsValidation), async (req: AuthenticatedRequest, res) => {
  try {
    const chat = await chatService.saveElements(req.userId!, req.params.id, req.body.elements);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: chat,
      message: 'Elements saved successfully'
    } as ApiResponse<typeof chat>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

export default router;
