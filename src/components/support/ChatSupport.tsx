import React, { useState } from 'react';
import { Send, MessageSquare, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ChatSupport = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{id: number, text: string, isUser: boolean, time: string}[]>([
    { id: 1, text: "Hi there! How can we help you with Vault Vibe today?", isUser: false, time: 'Just now' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = { id: Date.now(), text: message, isUser: true, time: 'Just now' };
    setMessages([...messages, newMsg]);
    setMessage('');

    // Simulate response
    setTimeout(() => {
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: "Thanks for reaching out! Our support team typically replies within 2 hours. We've received your message.", 
            isUser: false, 
            time: 'Just now' 
        }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Vault Vibe Support</h2>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Online
            </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-black/20">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.isUser 
                        ? 'bg-violet-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-card border border-gray-100 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                }`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${msg.isUser ? 'text-violet-200' : 'text-gray-400 dark:text-gray-500'}`}>
                        {msg.time}
                    </span>
                </div>
            </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-card border-t border-gray-100 dark:border-white/10">
        <form onSubmit={handleSend} className="flex gap-2">
            <button type="button" className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5" />
            </button>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent p-3 outline-none transition-all"
            />
            <button type="button" className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                <Smile className="w-5 h-5" />
            </button>
            <Button type="submit" disabled={!message.trim()} className="rounded-xl px-4">
                <Send className="w-4 h-4" />
            </Button>
        </form>
      </div>
    </div>
  );
};
