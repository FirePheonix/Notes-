import React, { useState, useEffect } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { Plus, MessageSquare, Search, Edit, Trash2 } from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle }) => {
  const { 
    chats, 
    currentChat, 
    loading, 
    error, 
    createChat, 
    loadChats, 
    selectChat, 
    updateChat, 
    deleteChat 
  } = useChatContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [hasLoadedChats, setHasLoadedChats] = useState(false);

  useEffect(() => {
    // Only load chats once when the component mounts and user is signed in
    if (!hasLoadedChats && chats.length === 0) {
      loadChats().then(() => setHasLoadedChats(true));
    }
  }, [loadChats, hasLoadedChats, chats.length]);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = async () => {
    if (newChatTitle.trim()) {
      await createChat(newChatTitle.trim());
      setNewChatTitle('');
      setShowNewChatInput(false);
    }
  };

  const handleUpdateChat = async (chatId: string) => {
    if (editingTitle.trim()) {
      await updateChat(chatId, editingTitle.trim());
      setEditingChatId(null);
      setEditingTitle('');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteChat(chatId);
    }
  };

  const startEditing = (chat: any) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  if (!isOpen) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={onToggle}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 border"
        >
          <MessageSquare size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg border-r border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chats</h2>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ×
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* New Chat Section */}
      <div className="p-4 border-b border-gray-200">
        {showNewChatInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Chat title..."
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateChat()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateChat}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewChatInput(false);
                setNewChatTitle('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewChatInput(true)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={16} />
            New Chat
          </button>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            Loading chats...
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        )}
        
        {!loading && filteredChats.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No chats found
          </div>
        )}
        
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              currentChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => selectChat(chat.id)}
          >
            <div className="flex items-center justify-between">
              {editingChatId === chat.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateChat(chat.id)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateChat(chat.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingChatId(null)}
                    className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {chat.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chat);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
