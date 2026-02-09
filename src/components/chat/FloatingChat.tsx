import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  ChevronLeft,
  Plus,
  Search,
  Check,
  CheckCheck,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { 
  useConversations, 
  useMessages, 
  useSendMessage, 
  useMarkAsRead,
  useGetOrCreateDirectConversation,
  useAvailableTeamMembers,
  useEditMessage,
  useDeleteMessage,
  useDeleteConversation,
  TeamMember
} from '@/hooks/useMessaging';

type ViewState = 'list' | 'thread' | 'new-message';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { activeTeamId, floatingChatOpen, floatingChatTargetUserId, openFloatingChat, closeFloatingChat, clearFloatingChatTarget, addToast } = useUIStore();
  
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedConversationId);
  const { data: teamMembers, isLoading: membersLoading } = useAvailableTeamMembers();
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const getOrCreateDirectConversation = useGetOrCreateDirectConversation();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const deleteConversation = useDeleteConversation();

  const selectedConversation = conversations?.find(c => c._id === selectedConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Click outside handler for emoji picker
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (floatingChatOpen) {
      setIsOpen(true);
    }
  }, [floatingChatOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!floatingChatTargetUserId) return;
    if (!activeTeamId) return;

    const run = async () => {
      try {
        const conversationId = await getOrCreateDirectConversation(activeTeamId, floatingChatTargetUserId);
        setSelectedConversationId(conversationId);
        setViewState('thread');
      } finally {
        clearFloatingChatTarget();
      }
    };

    run();
  }, [isOpen, floatingChatTargetUserId, activeTeamId, getOrCreateDirectConversation, clearFloatingChatTarget]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, selectedConversation?.unreadCount, markAsRead]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedConversationId) return;

    await sendMessage(selectedConversationId, inputValue);
    setInputValue('');
  };

  const handleStartConversation = async (member: TeamMember) => {
    if (!activeTeamId) return;
    
    const conversationId = await getOrCreateDirectConversation(activeTeamId, member.userId);
    setSelectedConversationId(conversationId);
    setViewState('thread');
    setSearchQuery('');
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;
    await editMessage(messageId, editText);
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file here and get a URL
      // For now, we'll just append the file name to the message
      setInputValue((prev) => prev + ` [File: ${file.name}] `);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setDeleteConfirmationId(conversationId);
  };

  const confirmDeleteConversation = async () => {
    if (deleteConfirmationId) {
      try {
        await deleteConversation(deleteConfirmationId);
        addToast({
          title: 'Conversation deleted',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to delete conversation:', error);
        addToast({
          title: 'Failed to delete conversation',
          message: 'Please try again later',
          type: 'error',
        });
      } finally {
        setDeleteConfirmationId(null);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const filteredTeamMembers = teamMembers?.filter(member => 
    member.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations?.filter(conv => {
    const participantNames = conv.participants.map(p => 
      p.fullName || p.username || 'Unknown'
    ).join(' ');
    return participantNames.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get total unread count
  const totalUnreadCount = conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

  if (!activeTeamId) return null;

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              openFloatingChat();
              setIsOpen(true);
            }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-600/30 flex items-center justify-center transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-card rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col"
          >
            {/* Header */}
            <div className="bg-card border-b border-border flex items-center px-4 py-3 shrink-0">
              {viewState === 'list' && (
                <>
                  <h2 className="text-lg font-bold text-foreground">Messages</h2>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => setViewState('new-message')}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                      title="New message"
                    >
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        closeFloatingChat();
                        setIsOpen(false);
                      }}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </>
              )}
              
              {viewState === 'thread' && selectedConversation && (
                <>
                  <button
                    onClick={() => {
                      setViewState('list');
                      setSelectedConversationId(null);
                    }}
                    className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="flex items-center gap-3 ml-2 flex-1 min-w-0">
                    <div className="flex -space-x-2">
                      {selectedConversation.isGroup ? (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                          {selectedConversation.groupName?.[0] || 'G'}
                        </div>
                      ) : (
                        selectedConversation.participants.slice(0, 2).map((participant, idx) => (
                          <div
                            key={participant.userId}
                            className={cn(
                              "w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br",
                              idx === 0 ? "from-violet-500 to-fuchsia-500" : "from-blue-500 to-cyan-500"
                            )}
                          >
                            {participant.avatarUrl ? (
                              <img src={participant.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              participant.fullName?.[0] || participant.username?.[0] || '?'
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {selectedConversation.isGroup 
                          ? selectedConversation.groupName 
                          : selectedConversation.participants[0]?.fullName || selectedConversation.participants[0]?.username || 'Unknown'
                        }
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedConversation.isGroup 
                          ? `${selectedConversation.participants.length} members`
                          : `@${selectedConversation.participants[0]?.username || 'unknown'}`
                        }
                      </p>
                    </div>
                  </div>
                </>
              )}

              {viewState === 'new-message' && (
                <>
                  <button
                    onClick={() => {
                      setViewState('list');
                      setSearchQuery('');
                    }}
                    className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <h2 className="text-lg font-bold text-foreground ml-2">New Message</h2>
                </>
              )}
            </div>

            {/* Search Bar */}
            {(viewState === 'list' || viewState === 'new-message') && (
              <div className="px-4 py-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={viewState === 'new-message' ? "Search team members..." : "Search messages..."}
                    className="w-full pl-9 pr-4 py-2 bg-muted/50 border-0 rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-card relative">
              {/* Delete Confirmation Overlay */}
              <AnimatePresence>
                {deleteConfirmationId && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-sm w-full"
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Delete conversation?</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            This action cannot be undone. The conversation will be removed from your list.
                          </p>
                        </div>
                        <div className="flex gap-3 w-full mt-2">
                          <button 
                            onClick={() => setDeleteConfirmationId(null)}
                            className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteConversation();
                            }}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conversation List */}
              {viewState === 'list' && (
                <div className="h-full overflow-y-auto">
                  {conversationsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full" />
                    </div>
                  ) : filteredConversations?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">No messages yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start a conversation with your team</p>
                      <button
                        onClick={() => setViewState('new-message')}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        Start a conversation
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredConversations?.map((conversation) => (
                        <div key={conversation._id} className="relative group">
                          <button
                            onClick={() => {
                              setSelectedConversationId(conversation._id);
                              setViewState('thread');
                            }}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 text-left"
                          >
                            <div className="flex -space-x-2 shrink-0">
                              {conversation.isGroup ? (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                                  {conversation.groupName?.[0] || 'G'}
                                </div>
                              ) : (
                                conversation.participants.slice(0, 2).map((participant, idx) => (
                                  <div
                                    key={participant.userId}
                                    className={cn(
                                      "w-11 h-11 rounded-full border-2 border-background flex items-center justify-center text-white font-bold bg-gradient-to-br",
                                      idx === 0 ? "from-violet-500 to-fuchsia-500" : "from-blue-500 to-cyan-500"
                                    )}
                                  >
                                    {participant.avatarUrl ? (
                                      <img src={participant.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      participant.fullName?.[0] || participant.username?.[0] || '?'
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <h4 className={cn(
                                  "truncate",
                                  conversation.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"
                                )}>
                                  {conversation.isGroup 
                                    ? conversation.groupName 
                                    : conversation.participants[0]?.fullName || conversation.participants[0]?.username || 'Unknown'
                                  }
                                </h4>
                                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                  {formatTime(conversation.lastMessageAt)}
                                </span>
                              </div>
                              <p className={cn(
                                "text-sm truncate pr-6", // Added padding right for delete button
                                conversation.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                              )}>
                                {conversation.lastMessageText || 'No messages yet'}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="w-5 h-5 bg-violet-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => handleDeleteConversation(e, conversation._id)}
                            className="absolute right-4 top-[calc(50%+8px)] -translate-y-1/2 p-1.5 bg-card/90 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message Thread */}
              {viewState === 'thread' && selectedConversation && (
                <>
                  <div className="h-[calc(100%-72px)] overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full" />
                      </div>
                    ) : messages?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Start a conversation</h3>
                        <p className="text-sm text-gray-500">Send a message to get started</p>
                      </div>
                    ) : (
                      <>
                        {messages?.map((message, index) => {
                          const isCurrentUser = message.senderId === user?.id;
                          const showDate = index === 0 || 
                            new Date(message._creationTime).toDateString() !== 
                            new Date(messages[index - 1]._creationTime).toDateString();
                          
                          return (
                            <div key={message._id}>
                              {showDate && (
                                <div className="flex items-center justify-center my-4">
                                  <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-100 rounded-full">
                                    {formatDate(message._creationTime)}
                                  </span>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                  "flex",
                                  isCurrentUser ? "justify-end" : "justify-start"
                                )}
                              >
                                <div className={cn(
                                  "flex gap-2 max-w-[85%]",
                                  isCurrentUser ? "flex-row-reverse" : "flex-row"
                                )}>
                                  {!isCurrentUser && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                      {message.sender.avatarUrl ? (
                                        <img src={message.sender.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        message.sender.fullName?.[0] || message.sender.username?.[0] || '?'
                                      )}
                                    </div>
                                  )}
                                  <div className={cn(
                                    "group relative",
                                    isCurrentUser ? "items-end" : "items-start"
                                  )}>
                                    {editingMessageId === message._id ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={editText}
                                          onChange={(e) => setEditText(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleEditMessage(message._id);
                                            if (e.key === 'Escape') {
                                              setEditingMessageId(null);
                                              setEditText('');
                                            }
                                          }}
                                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                          autoFocus
                                        />
                                        <button
                                          onClick={() => handleEditMessage(message._id)}
                                          className="p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className={cn(
                                        "px-4 py-2.5 rounded-2xl text-sm relative",
                                        isCurrentUser 
                                          ? "bg-violet-600 text-white rounded-br-md" 
                                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                                      )}>
                                        <p>{message.text}</p>
                                        <div className={cn(
                                          "flex items-center gap-1.5 mt-1 text-[10px]",
                                          isCurrentUser ? "text-violet-200" : "text-gray-500"
                                        )}>
                                          <span>{formatTime(message._creationTime)}</span>
                                          {message.editedAt && <span>(edited)</span>}
                                          {isCurrentUser && (
                                            <CheckCheck className="w-3 h-3" />
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-card border-t border-border">
                    <div className="flex items-center gap-2 relative">
                      <div className="relative" ref={emojiPickerRef}>
                        <button 
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-12 left-0 z-50 shadow-xl rounded-xl"
                            >
                              <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                theme={Theme.AUTO}
                                width={300}
                                height={400}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-foreground placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 text-white rounded-full transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* New Message - Team Members List */}
              {viewState === 'new-message' && (
                <div className="h-full overflow-y-auto">
                  {membersLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full" />
                    </div>
                  ) : filteredTeamMembers?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">No members found</h3>
                      <p className="text-sm text-muted-foreground">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredTeamMembers?.map((member) => (
                        <button
                          key={member.userId}
                          onClick={() => handleStartConversation(member)}
                          className="w-full px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 text-left"
                        >
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shrink-0">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              member.fullName?.[0] || member.username?.[0] || '?'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">
                              {member.fullName || member.username || 'Unknown'}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              @{member.username || 'unknown'} • {member.role}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
