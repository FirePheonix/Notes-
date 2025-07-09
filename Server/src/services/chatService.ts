import { ChatModel, ChatDocument } from '../models/Chat.js';
import { Chat, ChatResponse, PaginatedResponse } from '../types/index.js';
import { CreateChatInput, UpdateChatInput, PaginationInput, SearchInput } from '../validators/chatValidators.js';
import { Types } from 'mongoose';
import { Database } from '../config/database.js';

export class ChatService {
  
  // Ensure database connection before operations
  private async ensureConnection(): Promise<void> {
    const database = Database.getInstance();
    if (!database.isConnected()) {
      await database.connect();
    }
  }
  
  // Create a new chat
  async createChat(userId: string, data: CreateChatInput): Promise<ChatResponse> {
    try {
      await this.ensureConnection();
      
      const chat = new ChatModel({
        userId,
        title: data.title,
        elements: data.elements || []
      });
      
      const savedChat = await chat.save();
      return this.formatChatResponse(savedChat);
    } catch (error) {
      throw new Error(`Failed to create chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Get all chats for a user with pagination
  async getUserChats(userId: string, params: SearchInput): Promise<PaginatedResponse<ChatResponse>> {
    try {
      await this.ensureConnection();
      
      const { page, limit, search } = params;
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = { userId };
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }
      
      // Execute query with pagination
      const [chats, total] = await Promise.all([
        ChatModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        ChatModel.countDocuments(query)
      ]);
      
      return {
        data: chats.map(chat => this.formatChatResponse(chat)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Failed to get user chats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Get a specific chat by ID
  async getChatById(userId: string, chatId: string): Promise<ChatResponse | null> {
    try {
      await this.ensureConnection();
      
      const chat = await ChatModel.findOne({ _id: chatId, userId }).exec();
      return chat ? this.formatChatResponse(chat) : null;
    } catch (error) {
      throw new Error(`Failed to get chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Update a chat
  async updateChat(userId: string, chatId: string, data: UpdateChatInput): Promise<ChatResponse | null> {
    try {
      await this.ensureConnection();
      
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.elements !== undefined) updateData.elements = data.elements;
      
      const chat = await ChatModel.findOneAndUpdate(
        { _id: chatId, userId },
        updateData,
        { new: true, runValidators: true }
      ).exec();
      
      return chat ? this.formatChatResponse(chat) : null;
    } catch (error) {
      throw new Error(`Failed to update chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Delete a chat
  async deleteChat(userId: string, chatId: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const result = await ChatModel.deleteOne({ _id: chatId, userId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Save chat elements (for auto-save functionality)
  async saveElements(userId: string, chatId: string, elements: any[]): Promise<ChatResponse | null> {
    try {
      await this.ensureConnection();
      
      const chat = await ChatModel.findOneAndUpdate(
        { _id: chatId, userId },
        { elements },
        { new: true, runValidators: true }
      ).exec();
      
      return chat ? this.formatChatResponse(chat) : null;
    } catch (error) {
      throw new Error(`Failed to save elements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Format chat document for response
  private formatChatResponse(chat: ChatDocument): ChatResponse {
    return {
      id: (chat._id as Types.ObjectId).toString(),
      title: chat.title,
      elements: chat.elements,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    };
  }
}
