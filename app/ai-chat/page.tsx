"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquareText, Send } from "lucide-react";

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your SmartBudget AI assistant. How can I help you analyze your finances today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Create request payload for Groq (OpenAI-compatible)
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      // Inject system prompt at the beginning
      chatHistory.unshift({
        role: "system",
        content: "You are SmartBudget AI, a highly intelligent, concise, and professional financial advisor. You help users construct budgets, analyze expenses, and provide actionable money-saving tips."
      });

      // Add the latest user message
      chatHistory.push({ role: "user", content: userMessage });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: chatHistory
        })
      });

      const data = await response.json();
      
      // If we got an error from the API
      if (data.error) {
        throw new Error(data.error.message || "Unknown API Error");
      }

      const botReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
      
      setMessages(prev => [...prev, { role: "assistant", content: botReply }]);
    } catch (err: unknown) {
      const e = err as Error;
      console.error("Chat Error:", e);
      setMessages(prev => [...prev, { role: "assistant", content: `Oops! Connecting to Groq failed. Reason: ${e.message || "Unknown context error"}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in pt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#1C695D]/10 rounded-2xl flex items-center justify-center text-[#1C695D]">
          <MessageSquareText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
          <p className="text-text-muted text-sm">Powered by Groq</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 bg-white/60 p-4 rounded-3xl border border-white scrollbar-hide space-y-4 shadow-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#1C695D] flex-shrink-0 flex items-center justify-center shadow-md">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            )}
            <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-[#1C695D] text-white rounded-tr-sm' 
                : 'bg-white border border-gray-50 text-gray-700 rounded-tl-sm'
            }`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C695D] flex-shrink-0 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..." 
          className="w-full bg-white border border-gray-200 rounded-full py-4 pl-6 pr-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C695D]/30 focus:border-[#1C695D]/50 transition-all text-sm"
        />
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1C695D] disabled:opacity-50 hover:bg-[#134D44] text-white rounded-full flex items-center justify-center transition-colors shadow-md transform hover:scale-105"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
