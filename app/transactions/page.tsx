"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useFinance, Transaction } from "@/components/FinanceContext";
import { getIcon } from "@/app/page";

const filters = ["All", "Income", "Expenses", "Recurring"];

export default function Transactions() {
  const { transactions } = useFinance();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingLimit, setIsSettingLimit] = useState(false);
  const [diningLimit, setDiningLimit] = useState("");
  const [savedLimit, setSavedLimit] = useState<string | null>(null);

  // Group transactions
  const groupedTransactions = transactions.reduce((acc, tx) => {
    // Basic date grouping mechanism (e.g. split before comma or use as is)
    const dateGroup = tx.date.split(",")[0].trim().toUpperCase();
    if (!acc[dateGroup]) acc[dateGroup] = [];
    acc[dateGroup].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const filteredTransactions = Object.entries(groupedTransactions).reduce((acc, [date, items]) => {
    const filteredItems = items.filter(tx => {
      // Apply type/status filter
      let matchesFilter = true;
      if (activeFilter === "Income") matchesFilter = tx.type === "income";
      else if (activeFilter === "Expenses") matchesFilter = tx.type === "expense";
      else if (activeFilter === "Recurring") matchesFilter = tx.type === "recurring";
      
      // Apply search query filter
      const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
    
    if (filteredItems.length > 0) acc[date] = filteredItems;
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="flex flex-col gap-8 py-6 pb-24 animate-scale-in">
      {/* Search Bar */}
      <section className="relative px-1 group">
        <div className="absolute inset-y-0 left-5 flex items-center pr-3 pointer-events-none group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5 text-text-muted opacity-60" />
        </div>
        <input 
          type="text" 
          placeholder="Search transactions..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#EBF1F2] border-none rounded-2xl py-5 pl-14 pr-4 text-base font-bold placeholder:text-text-muted/60 placeholder:font-bold focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
        />
      </section>

      {/* Filters Hub */}
      <section className="flex gap-3 overflow-x-auto pb-4 px-1 no-scrollbar scroll-smooth">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-8 py-4 rounded-2xl text-base font-black tracking-tighter transition-all duration-300 whitespace-nowrap",
              activeFilter === filter 
                ? "bg-[#006D77] text-white shadow-xl shadow-primary/20 scale-105" 
                : "bg-[#F0F5F6] text-[#2B4C5F] hover:bg-white hover:shadow-md"
            )}
          >
            {filter}
          </button>
        ))}
      </section>

      {/* Transaction List Grouped by Date */}
      <div className="flex flex-col gap-8">
        {Object.keys(filteredTransactions).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-muted font-bold">No transactions found.</p>
          </div>
        ) : (
          Object.entries(filteredTransactions).map(([date, items]) => (
            <section key={date} className="flex flex-col gap-4">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-text-muted uppercase px-1 opacity-70">{date}</h3>
              <div className="flex flex-col gap-4">
                {items.map((tx) => {
                  const TxIcon = getIcon(tx.iconName);
                  return (
                  <div key={tx.id} className="premium-card bg-white p-5 flex items-center justify-between shadow-sm transition-all hover:scale-[1.01] hover:shadow-md group">
                    <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 flex items-center justify-center rounded-[1.25rem] transition-all group-hover:scale-110 group-hover:shadow-lg ring-1 ring-black/5", "bg-slate-50")}>
                        <TxIcon className="w-7 h-7 text-[#2B4C5F]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-ex-black text-lg tracking-tight text-[#071F24] leading-tight flex items-center gap-2">
                          {tx.name}
                          {tx.type === 'recurring' && <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] uppercase tracking-widest rounded-md">Recurring</span>}
                        </span>
                        <span className="text-[11px] text-text-muted font-bold tracking-tight opacity-70 uppercase tracking-widest">{tx.category} • {tx.date.split(",")[1]?.trim() || "12:00 PM"}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-lg font-black tracking-tight",
                      tx.type === 'income' ? "text-primary" : "text-[#A13D3D]"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}₱{Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                )})}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Spending Insight Card - Floating at Bottom of List */}
      <section className="premium-card bg-[#F0F9FB] border-none p-7 shadow-sm flex flex-col gap-6 relative overflow-hidden group mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:animate-float transition-all">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            <h3 className="text-xl font-black text-[#2B4C5F] tracking-tighter">AI Discovery</h3>
            <p className="text-xs font-bold text-[#2B4C5F]/70 leading-relaxed tracking-tight">
              Your dining expenses are <span className="text-primary font-black">15% higher</span> than last month. Most of this comes from weekend dinners. Consider a &quot;Stay-In Saturday&quot; to save roughly <span className="text-primary font-black">₱240</span> by month-end.
            </p>
          </div>
        </div>
        
        {savedLimit ? (
          <div className="bg-white/80 backdrop-blur-sm border border-primary/20 text-primary py-4 px-6 rounded-2xl font-black text-sm tracking-tighter shadow-sm relative z-10 w-full sm:w-fit self-start flex items-center justify-between sm:justify-start gap-3 animate-scale-in">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="uppercase">Dining Limit Set: ₱{savedLimit}</span>
            </div>
            <button onClick={() => { setIsSettingLimit(true); setSavedLimit(null); setDiningLimit(""); }} className="text-[10px] bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors font-bold tracking-widest uppercase">
              Edit
            </button>
          </div>
        ) : !isSettingLimit ? (
          <button 
            onClick={() => setIsSettingLimit(true)}
            className="bg-[#006D77] text-white py-4 px-8 rounded-2xl font-black text-sm tracking-tighter uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all relative z-10 w-full sm:w-fit self-start"
          >
            Set Dining Limit
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full sm:w-fit self-start animate-scale-in bg-white/40 p-2 rounded-3xl border border-white backdrop-blur-sm shadow-sm">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">₱</span>
              <input 
                type="number" 
                value={diningLimit}
                onChange={(e) => setDiningLimit(e.target.value)}
                placeholder="0.00"
                className="w-full sm:w-36 bg-white border border-primary/10 rounded-2xl py-4 pl-8 pr-4 text-base font-black text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none shadow-sm"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if(diningLimit) setSavedLimit(diningLimit);
                  setIsSettingLimit(false);
                }}
                className="bg-[#006D77] text-white py-4 px-6 rounded-2xl font-black text-sm tracking-tighter uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex-1"
              >
                Save
              </button>
              <button 
                onClick={() => setIsSettingLimit(false)}
                className="bg-white text-text-muted border border-gray-100 py-4 px-6 rounded-2xl font-black text-sm tracking-tighter uppercase hover:bg-gray-50 active:scale-95 transition-all flex-1 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Decorative Insight Graph Placeholder */}
        <div className="absolute bottom-0 right-0 w-32 h-24 bg-white/5 opacity-40 pointer-events-none p-4 flex items-end gap-1">
          <div className="w-2 bg-primary/20 h-8 rounded-full"></div>
          <div className="w-2 bg-primary/30 h-14 rounded-full"></div>
          <div className="w-2 bg-primary/40 h-10 rounded-full"></div>
          <div className="w-2 bg-primary h-20 rounded-full"></div>
          <div className="w-2 bg-primary/60 h-16 rounded-full"></div>
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
