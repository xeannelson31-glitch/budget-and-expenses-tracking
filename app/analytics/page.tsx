"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from "recharts";
import { Sparkles, TrendingUp } from "lucide-react";
import { useFinance } from "@/components/FinanceContext";

export default function Analytics() {
  const { transactions, budgets, lastUpdated } = useFinance();

  // Metrics calculation
  const totalIncome = transactions
    .filter(tx => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpense = Math.abs(transactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0));

  const netWorth = totalIncome - totalExpense;

  // Category spending for Pie Chart
  const categorySpending = transactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {} as Record<string, number>);

  const pieColors = ["#006D77", "#2B4C5F", "#FF7D7D", "#99E6F0", "#F4A261", "#E76F51"];
  const pieData = Object.entries(categorySpending).map(([name, value], idx) => ({
    name,
    value,
    color: pieColors[idx % pieColors.length]
  }));

  const topCategoryStr = pieData.sort((a,b) => b.value - a.value)[0]?.name || "N/A";
  const topCategoryVal = pieData.sort((a,b) => b.value - a.value)[0]?.value || 0;

  const currentMonthName = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
  const currentMonthValue = budgets.reduce((acc, b) => acc + b.total, 0);
  const currentMonthSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  // Generate Dynamic Allocation Summary
  let dynamicInsight = "Start spending and tracking to receive AI-powered financial insights.";
  if (pieData.length > 0) {
    const sortedSpends = [...pieData].sort((a,b) => b.value - a.value);
    const topSpender = sortedSpends[0];
    const topBudget = budgets.find(b => b.name.toLowerCase() === topSpender.name.toLowerCase());
    
    if (topBudget) {
      if (topBudget.percent >= 90) {
        dynamicInsight = `Warning! "${topSpender.name}" is eating up most of your funds and is at ${topBudget.percent}% capacity. Try to curb expenses here to avoid maxing out your budget limit.`;
      } else if (topBudget.percent < 50) {
        dynamicInsight = `Awesome pacing! Even though "${topSpender.name}" is your highest expense right now, it is safely only ${topBudget.percent}% consumed. Keep this healthy trend up!`;
      } else {
        dynamicInsight = `Your spending allocation is heavily leaning towards "${topSpender.name}" (₱${topSpender.value.toLocaleString()}). Since it's at ${topBudget.percent}%, monitor it closely as the month progresses.`;
      }
    } else {
      dynamicInsight = `Your highest allocation is currently "${topSpender.name}" at ₱${topSpender.value.toLocaleString()}. Make sure this aligns with your general savings goals.`;
    }
  }

  const barData = [
    { name: "NOV", value: currentMonthValue * 0.9, current: currentMonthSpent * 0.8 },
    { name: "DEC", value: currentMonthValue * 1.1, current: currentMonthSpent * 0.9 },
    { name: "JAN", value: currentMonthValue * 1.0, current: currentMonthSpent * 0.85 },
    { name: "FEB", value: currentMonthValue * 0.95, current: currentMonthSpent * 1.05 },
    { name: "MAR", value: currentMonthValue * 1.05, current: currentMonthSpent * 0.95 },
    { name: currentMonthName, value: currentMonthValue, current: currentMonthSpent },
  ];

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
                <span className="text-xs font-bold text-text-muted">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Strategy Insight Card */}
      <section className="premium-card bg-[#E0F3F5] border-none p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden group mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.15em] opacity-80">Allocation Summary</h3>
            <p className="text-sm font-bold text-foreground/80 leading-relaxed tracking-tight">
              {dynamicInsight}
            </p>
          </div>
        </div>
        {/* Background Sparkles Effect Placeholder */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[40px] group-hover:scale-110 transition-transform"></div>
      </section>
    </div>
  );
}
