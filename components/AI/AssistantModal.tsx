import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { getCarRecommendation } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const AssistantModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to AeroDrive. I am your AI concierge. Describe your trip, and I will find the perfect vehicle for you.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await getCarRecommendation(userMsg.text);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to neural network.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-brand-blue text-white shadow-lg shadow-brand-blue/40 hover:scale-110 transition-transform duration-300 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed bottom-8 right-4 md:right-8 w-[90vw] md:w-96 h-[500px] z-50 bg-brand-navy/95 backdrop-blur-xl border border-brand-blue/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-blue/20 to-brand-navy/50 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center border border-brand-blue">
                <Bot className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">AERO AI</h3>
                <p className="text-[10px] text-brand-teal uppercase tracking-wider">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/10 flex gap-1">
                  <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about cars..."
                className="w-full bg-slate-900/80 border border-white/20 rounded-full py-2 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-600"
              />
              <button
                onClick={handleSend}
                className="absolute right-1 top-1 p-1.5 bg-brand-blue rounded-full text-white hover:bg-blue-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantModal;