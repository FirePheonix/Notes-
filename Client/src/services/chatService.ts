import axios from 'axios';

// Types
export interface ChatData {
  id: string;
  title: string;
  elements: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatRequest {
  title: string;
  elements?: any[];
}

export interface UpdateChatRequest {
  title?: string;
  elements?: any[];
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

class ChatService {
  private baseURL: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(baseURL: string = 'http://localhost:3000', getAuthToken: () => Promise<string | null>) {
    this.baseURL = baseURL;
    this.getAuthToken = getAuthToken;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      console.log('Making request to:', `${this.baseURL}/api${endpoint}`);
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      const response = await axios({
        method,
        url: `${this.baseURL}/api${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      return response.data;
    } catch (error) {
      console.error('Request failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  // Create a new chat
  async createChat(data: CreateChatRequest): Promise<ApiResponse<ChatData>> {
    return this.request<ChatData>('POST', '/chats', data);
  }

  // Get all user chats
  async getChats(page: number = 1, limit: number = 10, search?: string): Promise<ApiResponse<PaginatedResponse<ChatData>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    return this.request<PaginatedResponse<ChatData>>('GET', `/chats?${params}`);
  }

  // Get a specific chat
  async getChat(id: string): Promise<ApiResponse<ChatData>> {
    return this.request<ChatData>('GET', `/chats/${id}`);
  }

  // Update a chat
  async updateChat(id: string, data: UpdateChatRequest): Promise<ApiResponse<ChatData>> {
    return this.request<ChatData>('PUT', `/chats/${id}`, data);
  }

  // Delete a chat
  async deleteChat(id: string): Promise<ApiResponse<null>> {
    return this.request<null>('DELETE', `/chats/${id}`);
  }

  // Save canvas elements
  async saveElements(chatId: string, elements: any[]): Promise<ApiResponse<ChatData>> {
    return this.request<ChatData>('POST', `/chats/${chatId}/elements`, { elements });
  }

  // Auto-save elements (debounced)
  private saveTimeout: number | null = null;
  
  autoSaveElements(chatId: string, elements: any[], delay: number = 2000): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      try {
        await this.saveElements(chatId, elements);
        console.log('Canvas auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);
  }
}

export default ChatService;
