import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import ChatService, { ChatData } from '../services/chatService';

interface ChatContextType {
  chats: ChatData[];
  currentChat: ChatData | null;
  loading: boolean;
  error: string | null;
  createChat: (title: string) => Promise<void>;
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  updateChat: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  saveElements: (elements: any[]) => Promise<void>;
  autoSaveElements: (elements: any[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { getToken, isSignedIn } = useAuth();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove debug logs that are causing repeated console output
  // console.log('Auth state:', { isSignedIn, userId });

  const chatService = useMemo(() => {
    return new ChatService(
      import.meta.env.VITE_API_URL || 'http://localhost:3000',
      async () => {
        try {
          const token = await getToken();
          // Reduced logging to prevent spam
          return token;
        } catch (error) {
          console.error('Failed to get auth token:', error);
          return null;
        }
      }
    );
  }, [getToken]);

  const handleError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const createChat = useCallback(async (title: string) => {
    try {
      setLoading(true);
      const response = await chatService.createChat({ title });
      
      if (response.success && response.data) {
        setChats(prev => [response.data!, ...prev]);
        setCurrentChat(response.data);
      } else {
        handleError(response.error || 'Failed to create chat');
      }
    } catch (error) {
      handleError('Failed to create chat');
    } finally {
      setLoading(false);
    }
  }, [chatService]);

  const loadChats = useCallback(async () => {
    if (!isSignedIn) {
      // Reduced logging to prevent spam
      return;
    }
    
    try {
      setLoading(true);
      const response = await chatService.getChats();
      
      if (response.success && response.data) {
        setChats(response.data.data);
      } else {
        handleError(response.error || 'Failed to load chats');
      }
    } catch (error) {
      handleError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [chatService, isSignedIn]);

  const selectChat = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      const response = await chatService.getChat(chatId);
      
      if (response.success && response.data) {
        setCurrentChat(response.data);
      } else {
        handleError(response.error || 'Failed to load chat');
      }
    } catch (error) {
      handleError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, [chatService]);

  const updateChat = useCallback(async (chatId: string, title: string) => {
    try {
      const response = await chatService.updateChat(chatId, { title });
      
      if (response.success && response.data) {
        setChats(prev => prev.map(chat => 
          chat.id === chatId ? response.data! : chat
        ));
        if (currentChat?.id === chatId) {
          setCurrentChat(response.data);
        }
      } else {
        handleError(response.error || 'Failed to update chat');
      }
    } catch (error) {
      handleError('Failed to update chat');
    }
  }, [chatService, currentChat]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const response = await chatService.deleteChat(chatId);
      
      if (response.success) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
        }
      } else {
        handleError(response.error || 'Failed to delete chat');
      }
    } catch (error) {
      handleError('Failed to delete chat');
    }
  }, [chatService, currentChat]);

  const saveElements = useCallback(async (elements: any[]) => {
    if (!currentChat) return;
    
    try {
      const response = await chatService.saveElements(currentChat.id, elements);
      
      if (response.success && response.data) {
        setCurrentChat(response.data);
        setChats(prev => prev.map(chat => 
          chat.id === currentChat.id ? response.data! : chat
        ));
      } else {
        handleError(response.error || 'Failed to save elements');
      }
    } catch (error) {
      handleError('Failed to save elements');
    }
  }, [chatService, currentChat]);

  const autoSaveElements = useCallback((_elements: any[]) => {
    // Auto-save disabled to improve performance
    // Use the manual save button instead
    return;
  }, []);

  const value: ChatContextType = {
    chats,
    currentChat,
    loading,
    error,
    createChat,
    loadChats,
    selectChat,
    updateChat,
    deleteChat,
    saveElements,
    autoSaveElements
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
