"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { useFinance } from "@/components/FinanceContext";
import { useMemo } from "react";

export default function Analytics() {
  const { transactions, budgets, lastUpdated } = useFinance();
  const [mounted, setMounted] = useState(false);
  const [aiSummary, setAiSummary] = useState<{why: string; how: string; what: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Metrics calculation
  const totalIncome = transactions
    .filter(tx => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpense = Math.abs(transactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0));

  const netWorth = totalIncome - totalExpense;

  // Category spending for Pie Chart
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

  // Generate AI Summary Effect
  useEffect(() => {
    const generateSummary = async () => {
      // Don't call if isGenerating is true, or if summary already exists for this state
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
          const errData = await response.json().catch(() => ({ error: { message: response.statusText } }));
          throw new Error(errData.error?.message || response.statusText);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = typeof content === 'string' ? JSON.parse(content) : content;
        setAiSummary(result);
      } catch (e: any) {
        console.warn("AI Strategic Insight generation skipped or failed:", e?.message || e);
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(generateSummary, 1500); // 1.5s delay to avoid spamming
    return () => clearTimeout(timer);
  }, [pieData, budgets, aiSummary]); // Removed isGenerating and transactions, as pieData covers transactions. aiSummary added to prevent double-calls.


  const topCategoryStr = pieData.sort((a,b) => b.value - a.value)[0]?.name || "N/A";
  const topCategoryVal = pieData.sort((a,b) => b.value - a.value)[0]?.value || 0;

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
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

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-screen bg-white/50 backdrop-blur-sm">
        <div className="relative">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-premium animate-pulse">
                <span className="text-white font-black text-3xl">S</span>
            </div>
            <Loader2 className="w-20 h-20 text-primary/20 animate-spin absolute -top-2 -left-2" />
        </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 py-6 pb-24 animate-scale-in">
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
          <p className="text-sm font-extrabold text-primary flex items-center gap-1">₱{budgets.reduce((a,b)=>a+b.total, 0).toLocaleString()}</p>
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
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/20"></div>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
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
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Spending Allocation</h3>
            {isGenerating && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        </div>
        
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
                <span className="text-xs font-bold text-text-muted">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Summary Panel */}
        {aiSummary && (
          <div className="mt-4 grid grid-cols-3 gap-3 animate-scale-in">
              <div className="flex flex-col gap-1 p-3 bg-white rounded-2xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-[9px] font-black text-primary tracking-widest uppercase">Why</span>
                  </div>
                  <p className="text-[10px] font-bold text-text-muted leading-tight line-clamp-3">{aiSummary.why}</p>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-white rounded-2xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 bg-[#2B4C5F] rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-[9px] font-black text-[#2B4C5F] tracking-widest uppercase">How</span>
                  </div>
                  <p className="text-[10px] font-bold text-text-muted leading-tight line-clamp-3">{aiSummary.how}</p>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-white rounded-2xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full group-hover:scale-125 transition-transform"></div>
                      <span className="text-[9px] font-black text-accent tracking-widest uppercase">What</span>
                  </div>
                  <p className="text-[10px] font-bold text-text-muted leading-tight line-clamp-3">{aiSummary.what}</p>
              </div>
          </div>
        )}
      </section>

    </div>
  );
}
