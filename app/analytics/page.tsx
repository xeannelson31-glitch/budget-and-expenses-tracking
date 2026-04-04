"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from "recharts";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { useFinance } from "@/components/FinanceContext";
import { useState, useEffect, useMemo } from "react";

export default function Analytics() {
  const { transactions, budgets, lastUpdated } = useFinance();

  // Metrics calculation
  const totalIncome = transactions
    .filter(tx => tx.type === "income")
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const totalExpense = Math.abs(transactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0));

  const netWorth = totalIncome - totalExpense;

  // Generate AI Summary Effect
  const [aiSummary, setAiSummary] = useState<{why: string; how: string; what: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Category spending for Pie Chart - Memoized
  const categorySpending = useMemo(() => {
    return transactions
      .filter(tx => tx.type === "expense")
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const pieColors = ["#006D77", "#2B4C5F", "#FF7D7D", "#99E6F0", "#F4A261", "#E76F51"];
  const pieData = useMemo(() => {
    return Object.entries(categorySpending).map(([name, value], idx) => ({
      name,
      value,
      color: pieColors[idx % pieColors.length]
    }));
  }, [categorySpending]);

  useEffect(() => {
    const generateSummary = async () => {
      if (pieData.length === 0 || isGenerating || aiSummary) return;
      
      setIsGenerating(true);
      try {
        const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim() || "";

        const dataContext = JSON.stringify({
          expenses: pieData,
          budgets: budgets.map(b => ({ name: b.name, limit: b.total, spent: b.spent, percent: b.percent }))
        });

        const prompt = `Analyze this spending allocation: ${dataContext}. 
        Provide a concise summary in THREE parts: 
        1. WHY: Explain the primary reason for this allocation pattern based on the largest expenses.
        2. HOW: Explain how the user is tracking against their budget limits.
        3. WHAT: Give one specific, actionable action the user should take right now.
        Format your response as a JSON object: {"why": "...", "how": "...", "what": "..."}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a financial analyst. Always reply in JSON format with exactly three fields: why, how, and what." }, 
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          })
        });

        if (!response.ok) {
          throw new Error("AI Summary failed to fetch");
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = typeof content === 'string' ? JSON.parse(content) : content;
        setAiSummary(result);
      } catch (err: unknown) {
        console.warn("AI Insight failed:", (err as Error).message);
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(generateSummary, 2000);
    return () => clearTimeout(timer);
  }, [pieData, budgets, aiSummary, isGenerating]);

  const topCategoryStr = pieData.sort((a,b) => b.value - a.value)[0]?.name || "N/A";
  const topCategoryVal = pieData.sort((a,b) => b.value - a.value)[0]?.value || 0;

  const currentMonthName = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
  const currentMonthValue = budgets.reduce((acc, b) => acc + b.total, 0);
  const currentMonthSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  const barData = [
    { name: "NOV", value: currentMonthValue * 0.9, current: currentMonthSpent * 0.8 },
    { name: "DEC", value: currentMonthValue * 1.1, current: currentMonthSpent * 0.9 },
    { name: "JAN", value: currentMonthValue * 1.0, current: currentMonthSpent * 0.85 },
    { name: "FEB", value: currentMonthValue * 0.95, current: currentMonthSpent * 1.05 },
    { name: "MAR", value: currentMonthValue * 1.05, current: currentMonthSpent * 0.95 },
    { name: currentMonthName, value: currentMonthValue, current: currentMonthSpent },
  ];

  return (
    <div className="flex flex-col gap-8 py-6 pb-32 animate-scale-in">
      {/* Analytics Overview Header */}
      <section className="flex flex-col px-1">
        <p className="text-text-muted font-bold tracking-tight text-[10px] mb-1 opacity-70 uppercase tracking-[0.2em] font-black">Analytics Overview</p>
        <div className="flex items-center gap-3">
          <h2 className="text-6xl font-black text-foreground tracking-tighter leading-none">
            ₱{netWorth.toLocaleString()}
          </h2>
          <div className="flex items-center gap-1 text-primary text-sm font-bold mt-2">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5%</span>
          </div>
        </div>
        <p className="text-sm font-bold text-text-muted mt-2 opacity-60">Net Worth current month</p>
      </section>

      {/* Top Cards Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="premium-card bg-[#F0F9FB] border-none p-5 flex flex-col gap-1 shadow-sm group cursor-pointer hover:bg-white transition-all">
          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-60">Top Category</p>
          <h4 className="text-xl font-black text-foreground tracking-tight">{topCategoryStr}</h4>
          <p className="text-sm font-extrabold text-primary">₱{topCategoryVal.toLocaleString()}</p>
        </div>
        
        <div className="premium-card bg-[#F0F9FB] border-none p-5 flex flex-col gap-1 shadow-sm group cursor-pointer hover:bg-white transition-all">
          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-60">Monthly Budget</p>
          <h4 className="text-xl font-black text-foreground tracking-tight">Limit</h4>
          <p className="text-sm font-extrabold text-primary flex items-center gap-1">₱{currentMonthValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Balance History Chart */}
      <section className="premium-card bg-white p-6 shadow-sm flex flex-col gap-6 group">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-foreground tracking-tighter">Balance History</h3>
            <p className="text-[10px] text-text-muted font-bold opacity-60">
              {lastUpdated ? `Last synchronized: ${lastUpdated}` : "Last 6 months growth"}
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barGap={4}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#718096', fontSize: 10, fontWeight: 800}} 
                dy={10}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="value" fill="#D2E8E6" radius={[12, 12, 12, 12]} barSize={14} />
              <Bar dataKey="current" fill="#006D77" radius={[12, 12, 12, 12]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Spending Allocation Donut Chart */}
      <section className="premium-card bg-[#F0F9FB] border-none p-6 shadow-sm flex flex-col gap-4 group">
        <h3 className="text-xl font-black text-foreground tracking-tighter mb-4">Spending Allocation</h3>
        
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-text-muted uppercase opacity-60">Total</span>
              <span className="text-xl font-black text-foreground">₱{totalExpense.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md" style={{backgroundColor: item.color}}></div>
                <span className="text-xs font-bold text-text-muted text-ellipsis overflow-hidden whitespace-nowrap">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Strategy Insight Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">AI Strategic Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {isGenerating ? (
            <div className="premium-card bg-[#F0F9FB] border-none p-10 flex flex-col items-center justify-center gap-3 shadow-sm">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Analyzing Trends...</p>
            </div>
          ) : aiSummary ? (
            <>
              {/* Strategic Why Card */}
              <div className="premium-card bg-[#E0F3F5] border-none p-6 shadow-sm flex flex-col gap-3 group relative overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategic Insight</h4>
                </div>
                <p className="text-sm font-bold text-foreground/80 leading-relaxed tracking-tight">{aiSummary.why}</p>
              </div>

              {/* Strategic Context Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="premium-card bg-[#FFF0F0] border-none p-5 flex flex-col gap-2 shadow-sm">
                  <h4 className="text-[10px] font-black text-[#FF7D7D] uppercase tracking-widest opacity-80">Efficiency</h4>
                  <p className="text-xs font-bold text-[#E76F51] leading-tight">{aiSummary.how}</p>
                </div>
                <div className="premium-card bg-[#F0FBFF] border-none p-5 flex flex-col gap-2 shadow-sm">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80">Next Move</h4>
                  <p className="text-xs font-bold text-foreground/80 leading-tight">{aiSummary.what}</p>
                </div>
              </div>
            </>
          ) : (
             <div className="premium-card bg-[#F0F9FB] border-none p-8 flex flex-col items-center justify-center gap-2 shadow-sm text-center">
                <p className="text-xs font-black text-text-muted opacity-40 uppercase tracking-widest">
                   No Strategy Available
                </p>
                <p className="text-[10px] font-bold text-text-muted opacity-60 italic">
                   {pieData.length === 0 ? "Add transactions to see AI insights." : "Verify Groq API Key and internet connection."}
                </p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: (string | number | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}
