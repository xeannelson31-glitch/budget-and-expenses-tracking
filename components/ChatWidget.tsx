"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquareText, Send, X } from "lucide-react";
import { useFinance } from "./FinanceContext";
import Link from "next/link";

export default function ChatWidget() {
  const { addTransaction, addBudget, updateBudgetSpent, updateBudget, deleteBudget, transactions, budgets } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(scrollToBottom, 50);
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const totalIncome = transactions
        .filter(tx => tx.type === "income")
        .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

      const totalExpense = transactions
        .filter(tx => tx.type === "expense")
        .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

      const totalBalance = totalIncome - totalExpense;

      const budgetSummary = budgets.map(b => `${b.name}: ₱${b.spent} spent of ₱${b.total}`).join(", ");

      const systemPrompt = `You are SmartBudget AI. You MUST stay strictly relevant to the user's question. 
Keep your responses short and professional. 

Current Financial Status:
- Total Balance: ₱${totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Total Income: ₱${totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Total Expenses: ₱${totalExpense.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
- Budgets: ${budgetSummary || "No budgets set yet."}

If the user asks you to record a transaction (income or expense), add a budget, or update/subtract from a budget, reply nicely, then append a markdown JSON codeblock.

Actions:
1. ADD_TRANSACTION: For new income/expenses.
\`\`\`json
{"action":"ADD_TRANSACTION","data":{"name":"Coffee","amount":-15,"category":"Food","type":"expense","date":"TODAY","iconName":"Coffee"}}
\`\`\`
2. ADD_BUDGET: For creating new budget categories.
\`\`\`json
{"action":"ADD_BUDGET","data":{"name":"Travel","spent":0,"total":1000,"percent":0,"color":"bg-[#006D77]","iconName":"LayoutGrid"}}
\`\`\`
3. UPDATE_BUDGET_SPENT: When the user says they spent money from an existing budget. 
\`\`\`json
{"action":"UPDATE_BUDGET_SPENT","data":{"name":"Food & Groceries","amount":50}}
\`\`\`
4. DELETE_BUDGET: To remove a budget category.
\`\`\`json
{"action":"DELETE_BUDGET","data":{"name":"Entertainment"}}
\`\`\`
5. UPDATE_BUDGET: To change a budget's limit or name.
\`\`\`json
{"action":"UPDATE_BUDGET","data":{"name":"Travel","total":1500}}
\`\`\``;

      const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();
      let botReply = "";

      if (!groqApiKey) {
        throw new Error("Missing Groq API key.");
      }

      const chatHistory = messages
        .filter(m => !m.content.includes("```json"))
        .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
      
      chatHistory.unshift({ role: "system", content: systemPrompt });
      chatHistory.push({ role: "user", content: userMessage });

      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: chatHistory,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(errData.error?.message || response.statusText);
      }
      
      const data = await response.json();
      botReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
      
      // Check for JSON commands
      const jsonMatch = botReply.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
         try {
             const command = JSON.parse(jsonMatch[1]);
             let actionLink = "";
             
             if (command.action === "ADD_TRANSACTION") {
                 addTransaction(command.data);
                 actionLink = "\n\n🔗 Transaction saved! [View Transactions](/transactions)";
             } else if (command.action === "ADD_BUDGET") {
                 addBudget(command.data);
                 actionLink = "\n\n🔗 Budget created! [View Budgets](/budgets)";
             } else if (command.action === "UPDATE_BUDGET_SPENT") {
                 updateBudgetSpent(command.data.name, command.data.amount);
                 addTransaction({
                    name: `AI: ${command.data.name} expense`,
                    amount: -command.data.amount,
                    date: "TODAY",
                    category: command.data.name,
                    type: "expense"
                 });
                 actionLink = "\n\n🔗 Budget updated! [View Budgets](/budgets)";
             }
             botReply = botReply.replace(jsonMatch[0], "").trim() + actionLink;
         } catch(e) { console.error("Could not parse AI command", e); }
      }

      setMessages(prev => [...prev, { role: "assistant", content: botReply }]);
    } catch (error) {
      const e = error instanceof Error ? error : new Error(String(error));
      const errMsg = e.message === "Missing Groq API key" 
        ? "AI insight is disabled: Missing NEXT_PUBLIC_GROQ_API_KEY in environment variables." 
        : `Oops! AI failed. Reason: ${e.message}`;
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{content.substring(lastIndex, match.index)}</span>);
      }
      parts.push(
        <Link key={match.index} href={match[2]} className="text-[#A3D1FF] bg-[#134D44] px-2 py-0.5 rounded-lg active:scale-95 inline-block mt-2 underline font-bold" onClick={() => setIsOpen(false)}>
          {match[1]}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={lastIndex}>{content.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-32px)] sm:w-87.5 h-112.5 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#1C695D]/10 animate-scale-in origin-bottom-right">
          {/* Header */}
          <div className="bg-[#1C695D] text-white p-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <MessageSquareText className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight tracking-tight">AI Assistant</span>
                <span className="text-[10px] text-white/70 font-medium">Powered by GROQ</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#1C695D] shrink-0 flex items-center justify-center shadow-sm mt-1">
                    <span className="text-white text-[9px] font-black">AI</span>
                  </div>
                )}
                <div className={`px-4 py-2.5 shadow-sm text-xs leading-relaxed whitespace-pre-wrap max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-[#1C695D] text-white rounded-2xl rounded-tr-sm font-medium' 
                    : 'bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-black/5 font-medium'
                }`}>
                  <p>{renderMessageContent(msg.content)}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1C695D] shrink-0 flex items-center justify-center shadow-sm mt-1">
                  <span className="text-white text-[9px] font-black">AI</span>
                </div>
                <div className="bg-white px-4 py-3 shadow-sm rounded-2xl rounded-tl-sm border border-black/5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1C695D]/50 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1C695D]/50 animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1C695D]/50 animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1C695D]/30 transition-all placeholder:font-normal"
              />
              <button 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-1 w-9 h-9 bg-[#1C695D] disabled:opacity-50 hover:bg-[#134D44] text-white rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-[#1C695D] text-white rounded-full shadow-lg hover:shadow-[0_8px_25px_rgba(28,105,93,0.3)] hover:bg-[#134D44] transition-all transform hover:scale-105 animate-bounce-slow ring-4 ring-white"
        >
          <MessageSquareText className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
