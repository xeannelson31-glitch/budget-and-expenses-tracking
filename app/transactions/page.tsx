"use client";

import { Search, Sparkles, Plus, Edit2, Trash2, X, Receipt, ShoppingCart, Target, Coffee, LayoutGrid } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useFinance, Transaction } from "@/components/FinanceContext";
import { getIcon } from "@/lib/getIcon";

const filters = ["All", "Income", "Expenses", "Recurring"];

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    name: "",
    amount: 0,
    category: "General",
    type: "expense",
    date: "TODAY",
    iconName: "ShoppingCart"
  });

  // Local Spending Limit state
  const [isSettingLimit, setIsSettingLimit] = useState(false);
  const [diningLimit, setDiningLimit] = useState("");
  const [savedLimit, setSavedLimit] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      name: "",
      amount: 0,
      category: "General",
      type: "expense",
      date: "TODAY",
      iconName: "ShoppingCart"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormData(tx);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.amount) return;

    // Enforce consistent signs: Expenses are negative, Income is positive
    const finalAmount = formData.type === 'income' ? Math.abs(formData.amount) : -Math.abs(formData.amount);
    const finalData = { ...formData, amount: finalAmount };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, finalData);
    } else {
      addTransaction(finalData as Omit<Transaction, "id">);
    }
    setIsModalOpen(false);
  };

  // Group transactions
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const dateGroup = tx.date.split(",")[0].trim().toUpperCase();
    if (!acc[dateGroup]) acc[dateGroup] = [];
    acc[dateGroup].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const filteredTransactions = Object.entries(groupedTransactions).reduce((acc, [date, items]) => {
    const filteredItems = items.filter(tx => {
      let matchesFilter = true;
      if (activeFilter === "Income") matchesFilter = tx.type === "income";
      else if (activeFilter === "Expenses") matchesFilter = tx.type === "expense";
      else if (activeFilter === "Recurring") matchesFilter = tx.type === "recurring";
      
      const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
    
    if (filteredItems.length > 0) acc[date] = filteredItems;
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="flex flex-col gap-8 py-6 pb-24 animate-scale-in">
      {/* Header with Title and Add Button */}
      <section className="flex items-center justify-between px-1">
        <h2 className="text-3xl font-black text-foreground tracking-tighter">Your Hub</h2>
        <button 
          onClick={openAddModal}
          className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </section>

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
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
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
                  <div key={tx.id} className="premium-card bg-white p-5 flex items-center justify-between shadow-sm transition-all group overflow-hidden relative">
                    <div className="flex items-center gap-5 z-10">
                      <div className={cn("w-14 h-14 flex items-center justify-center rounded-[1.25rem] transition-all ring-1 ring-black/5 bg-slate-50")}>
                        <TxIcon className="w-7 h-7 text-[#2B4C5F]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-ex-black text-lg tracking-tight text-[#071F24] leading-tight flex items-center gap-2">
                          {tx.name}
                          {tx.type === 'recurring' && <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] uppercase tracking-widest rounded-md">Recurring</span>}
                        </span>
                        <span className="text-[11px] text-text-muted font-bold opacity-70 uppercase tracking-widest">{tx.category} • {tx.date.split(",")[1]?.trim() || "12:00 PM"}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end z-10">
                      <span className={cn(
                        "text-lg font-black tracking-tight",
                        tx.type === 'income' ? "text-primary" : "text-danger"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}₱{Math.abs(tx.amount).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <button 
                          onClick={() => openEditModal(tx)}
                          className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteTransaction(tx.id)}
                          className="bg-danger/10 hover:bg-danger/20 text-danger p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Modal - CRUD Experience */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl relative z-10 flex flex-col p-8 sm:p-10 animate-slide-up origin-bottom">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-foreground tracking-tighter">
                {editingTransaction ? "Edit Transaction" : "New Transaction"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-text-muted hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Label / Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Starbucks, Client Payment"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-base font-bold placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Amount (₱)</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-base font-black placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-base font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner appearance-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Category</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g. Food, Salary, Car"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-base font-bold placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.amount}
                className="w-full bg-primary text-white py-5 rounded-3xl font-black text-base tracking-tighter uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {editingTransaction ? "Save Changes" : "Create Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spending Insight Card */}
      <section className="premium-card bg-[#F0F9FB] border-none p-7 shadow-sm flex flex-col gap-6 relative overflow-hidden group mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:animate-float transition-all">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            <h3 className="text-xl font-black text-[#2B4C5F] tracking-tighter">AI Discovery</h3>
            <p className="text-xs font-bold text-[#2B4C5F]/70 leading-relaxed tracking-tight">
              Your dining expenses are <span className="text-primary font-black">15% higher</span> than last month. Consider a &quot;Stay-In Saturday&quot; to save roughly <span className="text-primary font-black">₱240</span>.
            </p>
          </div>
        </div>
        
        {savedLimit ? (
          <div className="bg-white/80 backdrop-blur-sm border border-primary/20 text-primary py-4 px-6 rounded-2xl font-black text-sm tracking-tighter shadow-sm relative z-10 w-full sm:w-fit self-start flex items-center justify-between sm:justify-start gap-3 animate-scale-in">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="uppercase">Dining Limit: ₱{savedLimit}</span>
            </div>
            <button onClick={() => { setIsSettingLimit(true); setSavedLimit(null); setDiningLimit(""); }} className="text-[10px] bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors font-bold tracking-widest uppercase">
              Edit
            </button>
          </div>
        ) : !isSettingLimit ? (
          <button 
            onClick={() => setIsSettingLimit(true)}
            className="bg-primary text-white py-4 px-8 rounded-2xl font-black text-sm tracking-tighter uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all relative z-10 w-full sm:w-fit self-start"
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
                className="bg-primary text-white py-4 px-6 rounded-2xl font-black text-sm tracking-tighter uppercase shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex-1"
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

function cn(...inputs: Array<string | number | boolean | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
