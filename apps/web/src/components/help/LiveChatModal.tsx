'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'agent';
  timestamp: Date;
}

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChatModal({ isOpen, onClose }: LiveChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today? If needed, I can connect you with a human agent.',
      sender: 'ai',
      timestamp: new Date(),
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

  if (!isOpen) return null;

  const logAiUsage = async (tokens: number) => {
    try {
      await fetch('/api/usage/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tokensUsed: tokens,
          metadata: { source: 'live_chat' },
        }),
      });
    } catch {
      // best-effort logging
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    void logAiUsage(250);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. I\'m processing your request. Would you like me to escalate this to a human agent?',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleEscalate = () => {
    const escalateMessage: Message = {
      id: Date.now().toString(),
      text: 'Connecting you to a human agent. Please wait...',
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([...messages, escalateMessage]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-2xl h-[600px] rounded-lg border shadow-2xl flex flex-col modal-bg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-sm text-muted-foreground">Live Chat Support</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' ? 'bg-primary' : 'bg-accent'
              }`}>
                {message.sender === 'user' ? (
                  <UserIcon className="h-4 w-4 text-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-foreground" />
                )}
              </div>
              <div className={`flex flex-col max-w-[70%] ${message.sender === 'user' ? 'items-end' : ''}`}>
                <div className={`px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
                <span className="text-xs text-muted-foreground/50 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleEscalate}
              className="text-xs text-primary font-medium hover:underline"
            >
              Escalate to Human Agent
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
            />
            <Button
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
