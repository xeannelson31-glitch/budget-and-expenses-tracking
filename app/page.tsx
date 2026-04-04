"use client";

import { ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { useState } from "react";
import { useFinance } from "@/components/FinanceContext";
import { getIcon } from "@/lib/getIcon";

export default function Dashboard() {
  const { budgets: activeBudgets, transactions: recentActivity } = useFinance();
  const [showViewAllInput, setShowViewAllInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBudgets = activeBudgets.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIncome = recentActivity
    .filter(tx => tx.type === "income")
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const totalExpense = recentActivity
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const totalBalance = totalIncome - totalExpense;
  
  return (
    <div className="flex flex-col gap-8 py-6 pb-24 animate-scale-in">
      {/* Total Balance */}
      <section className="flex flex-col px-1">
        <p className="text-text-muted font-bold text-sm mb-1 opacity-70 uppercase tracking-widest">Total Balance</p>
        <h2 className="text-6xl font-black text-primary tracking-tighter">
          ₱{totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </h2>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="premium-card bg-white border-l-4 border-l-primary flex flex-col gap-1 p-4 shadow-sm group">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-80">Monthly Income</p>
          <p className="text-2xl font-black text-foreground tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">₱{totalIncome.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-primary text-[10px] font-black">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12% vs last month</span>
          </div>
        </div>
        {/* Expense Card */}
        <div className="premium-card bg-white border-l-4 border-l-danger flex flex-col gap-1 p-4 shadow-sm group">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-80">Monthly Expenses</p>
          <p className="text-2xl font-black text-foreground tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">₱{totalExpense.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-danger text-[10px] font-black">
            <ArrowDownRight className="w-3 h-3" />
            <span>-5% vs last month</span>
          </div>
        </div>
      </div>

      {/* AI Strategic Insights Card */}
      <section className="premium-card bg-[#E0F7F9] border-none p-6 flex flex-col gap-4 relative overflow-hidden group">
        <div className="flex items-center gap-2 relative z-10">
          <Zap className="w-5 h-5 text-primary fill-primary/20" />
          <h3 className="text-lg font-black text-primary tracking-tight">AI Strategic Insights</h3>
        </div>

        <div className="flex flex-col gap-4 relative z-10">
          {/* Insight Card 1 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-black text-foreground text-sm tracking-tight">Great Savings Rate</h4>
              <span className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-md tracking-tighter uppercase">ELITE</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed font-medium">
              You&apos;ve saved 85% of your income this month. Keep this up to reach your goals 4 months early.
            </p>
          </div>

          {/* Goal Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-black text-foreground text-sm tracking-tight flex items-center gap-2">
                Goal: New Car
              </h4>
              <span className="text-[10px] font-black text-primary uppercase tracking-tighter">₱120,000 / ₱850,000</span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden shadow-inner mb-2 ring-1 ring-primary/5">
              <div className="h-full bg-primary w-[32%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,109,119,0.3)]"></div>
            </div>
            <p className="text-[9px] text-text-muted italic opacity-80 leading-snug">
              Recommended: Increase monthly allocation by ₱2,000.
            </p>
          </div>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000 opacity-60"></div>
      </section>

      {/* Budget Overview Section */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1 relative">
          <h3 className="text-xl font-black text-foreground tracking-tighter">Budget Overview</h3>
          <div className="flex items-center gap-3">
            {!showViewAllInput ? (
              <button 
                onClick={() => setShowViewAllInput(true)}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
              >
                View All
              </button>
            ) : (
              <div className="flex animate-scale-in">
                <input 
                  type="text" 
                  placeholder="Search budgets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-24 sm:w-32 bg-slate-100 rounded-l-lg px-2 py-1 text-[10px] font-bold outline-none border border-primary/20" 
                  autoFocus 
                />
                <button 
                  onClick={() => { setShowViewAllInput(false); setSearchQuery(""); }} 
                  className="bg-primary text-white px-2 py-1 rounded-r-lg text-[10px] font-black uppercase hover:bg-[#134D44] transition-colors"
                >
                  X
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filteredBudgets.length > 0 ? (
            filteredBudgets.map((budget) => {
              const BudgetIcon = getIcon(budget.iconName);
              return (
              <div key={budget.name} className="premium-card bg-white p-4 flex flex-col gap-3 hover:scale-[1.01] transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all")}>
                      <BudgetIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm tracking-tight text-foreground">{budget.name}</span>
                      <span className="text-[10px] text-text-muted font-bold tracking-tight opacity-70">₱{budget.spent} of ₱{budget.total} left</span>
                    </div>
                  </div>
                  <span className="font-black text-sm text-foreground">{budget.percent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={cn("h-full transition-all duration-1000", budget.color)} 
                    style={{ width: `${budget.percent}%` }}
                  ></div>
                </div>
              </div>
            )})
          ) : (
            <div className="text-center py-6">
              <p className="text-text-muted font-bold text-sm">No budgets found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-black text-foreground tracking-tighter px-1">Recent Activity</h3>
        <div className="bg-white rounded-[2rem] border border-card-border p-3 flex flex-col gap-1 shadow-sm">
          {recentActivity.map((activity, idx) => {
            const ActivityIcon = getIcon(activity.iconName);
            return (
            <div key={activity.id} className={cn(
              "flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group",
              idx !== recentActivity.length - 1 && "border-b border-slate-50"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <ActivityIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground tracking-tight">{activity.name}</span>
                  <span className="text-[10px] text-text-muted font-bold tracking-widest opacity-60 uppercase">{activity.date}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "font-black text-sm",
                  activity.type === 'income' ? "text-primary" : "text-danger"
                )}>
                  {activity.type === 'income' ? '+' : '-'}₱{Math.abs(activity.amount).toFixed(2)}
                </span>
                <span className="text-[9px] text-text-muted font-medium opacity-70">{activity.category}</span>
              </div>
            </div>
          )})}
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: Array<string | number | boolean | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
