import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  BookOpen,
  Check,
  CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'kb'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'How can we help you?',
      sender: 'agent',
      timestamp: new Date(),
      status: 'read'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for reaching out! Our team will get back to you shortly.',
        sender: 'agent',
        timestamp: new Date(),
        status: 'read'
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

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
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-600/30 flex items-center justify-center transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
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
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-violet-600 text-white">
              {/* Tabs */}
              <div className="flex items-center px-4 pt-3 pb-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    activeTab === 'chat' ? "bg-white/20" : "hover:bg-white/10"
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('kb')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ml-2",
                    activeTab === 'kb' ? "bg-white/20" : "hover:bg-white/10"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  Knowledge Base
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Welcome Section */}
              {activeTab === 'chat' && (
                <div className="px-4 pb-4 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-violet-400 border-2 border-violet-600 flex items-center justify-center text-xs font-bold text-white"
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-violet-600 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">Got questions? Let us help.</h3>
                  <p className="text-sm text-violet-100 mt-0.5">We typically reply within 12 hours</p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="h-[400px] flex flex-col bg-gray-50">
              {activeTab === 'chat' ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Date divider */}
                    <div className="flex items-center justify-center">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>

                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          message.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                          message.sender === 'user' 
                            ? "bg-violet-600 text-white rounded-br-md"
                            : "bg-white shadow-sm border border-gray-100 rounded-bl-md text-gray-800"
                        )}>
                          <p>{message.text}</p>
                          <div className={cn(
                            "flex items-center gap-1 mt-1 text-[10px]",
                            message.sender === 'user' ? "text-violet-200" : "text-gray-400"
                          )}>
                            <span>{formatTime(message.timestamp)}</span>
                            {message.sender === 'user' && message.status && (
                              message.status === 'read' ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 bg-gray-100 border-0 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Knowledge Base */
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-semibold text-gray-900 mb-1">Getting Started Guide</h4>
                      <p className="text-sm text-gray-600">Learn the basics of using Vibe Vault</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-semibold text-gray-900 mb-1">Managing Workspaces</h4>
                      <p className="text-sm text-gray-600">How to create and organize workspaces</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-semibold text-gray-900 mb-1">Billing & Plans</h4>
                      <p className="text-sm text-gray-600">Understanding your subscription options</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                      <h4 className="font-semibold text-gray-900 mb-1">API Documentation</h4>
                      <p className="text-sm text-gray-600">Integrate with our API</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
