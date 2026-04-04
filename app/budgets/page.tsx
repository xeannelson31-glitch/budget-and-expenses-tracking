"use client";

import { Lightbulb, Plus, X, Trash2, Edit2, ShoppingCart, Coffee, Target, LayoutGrid, Check, Receipt, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { useFinance, Budget } from "@/components/FinanceContext";
import { getIcon } from "@/lib/getIcon";

const budgetColors = [
  "bg-[#006D77]", // Primary Teal
  "bg-[#2B4C5F]", // Charcoal
  "bg-[#FF7D7D]", // Pastel Red
  "bg-[#F4A261]", // Orange
  "bg-[#E76F51]", // Terracotta
  "bg-[#5FAD56]", // Green
  "bg-[#A3D1FF]", // Blue
];

const availableIcons = ['ShoppingCart', 'Coffee', 'Target', 'LayoutGrid', 'Receipt', 'Zap'];

export default function Budgets() {
  const { budgets, addBudget, deleteBudget, updateBudget, updateBudgetSpent, addTransaction } = useFinance();
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<Partial<Budget>>({
    name: "",
    total: 0,
    spent: 0,
    color: "bg-[#006D77]",
    iconName: "LayoutGrid"
  });

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showViewAllInput, setShowViewAllInput] = useState(false);

  // Quick Expense state
  const [activeQuickExpenseName, setActiveQuickExpenseName] = useState<string | null>(null);
  const [expenseAmount, setExpenseAmount] = useState("");

  const getAutoIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("food") || n.includes("grocery") || n.includes("eat")) return "ShoppingCart";
    if (n.includes("coffee") || n.includes("drink")) return "Coffee";
    if (n.includes("school") || n.includes("study") || n.includes("education")) return "Target";
    return "LayoutGrid";
  };

  const openAddModal = () => {
    setEditingBudget(null);
    setFormData({
      name: "",
      total: 0,
      spent: 0,
      color: "bg-[#006D77]",
      iconName: "LayoutGrid"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bg: Budget) => {
    setEditingBudget(bg);
    setFormData(bg);
    setIsModalOpen(true);
  };

  const handleSaveBudget = () => {
    if (!formData.name || !formData.total) return;

    if (editingBudget) {
      updateBudget(editingBudget.name, formData);
    } else {
      addBudget({
        ...formData,
        iconName: formData.name ? getAutoIcon(formData.name) : "LayoutGrid",
        spent: formData.spent || 0,
        percent: formData.total ? Math.round(((formData.spent || 0) / (formData.total)) * 100) : 0,
      } as Budget);
    }
    setIsModalOpen(false);
  };

  const handleQuickExpense = (name: string) => {
    const amt = parseFloat(expenseAmount);
    if (!isNaN(amt) && amt > 0) {
      updateBudgetSpent(name, amt);
      addTransaction({
        name: `Reduced from ${name}`,
        amount: -amt,
        date: "TODAY",
        category: name,
        type: "expense",
        iconName: getAutoIcon(name)
      });
      setExpenseAmount("");
      setActiveQuickExpenseName(null);
    }
  };

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.total, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const filteredBudgets = budgets.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 py-6 pb-24 animate-scale-in">
      {/* Budget Overview Header */}
      <section className="flex flex-col px-1 justify-between sm:flex-row sm:items-end">
        <div className="flex flex-col">
          <p className="text-text-muted font-black text-[10px] mb-1 opacity-70 uppercase tracking-[0.2em]">Current Month</p>
          <h2 className="text-5xl font-black text-foreground tracking-tighter leading-tight">
            Structure
          </h2>
        </div>
        <button 
          onClick={openAddModal}
          className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all mt-4 sm:mt-0"
        >
          <Plus className="w-6 h-6" />
        </button>
      </section>

      {/* Main Budget Health Card */}
      <section className="premium-card bg-white p-6 flex flex-col gap-6 relative overflow-hidden group shadow-sm transition-all hover:ring-2 hover:ring-primary/20">
        <div className="flex flex-col gap-1 relative z-10">
          <p className="text-xs font-black text-text-muted opacity-60 uppercase tracking-widest leading-none">Total Remaining</p>
          <div className="flex justify-between items-baseline">
            <h3 className="text-5xl font-black text-primary tracking-tighter leading-tight">₱{totalRemaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
            <span className="text-xs font-black text-text-muted opacity-80 uppercase tracking-widest">{overallPercent}% Spent</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 relative z-10 mt-2">
          {/* Progress Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-50">
            <div className="h-full bg-primary shadow-[0_0_15px_rgba(0,109,119,0.2)] transition-all duration-1000" style={{ width: `${Math.min(100, overallPercent)}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-black tracking-tighter uppercase opacity-60">
            <span>₱{totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })} USED</span>
            <span>₱{totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })} BUDGET</span>
          </div>
        </div>

        {/* Header Curve Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
      </section>

      {/* Architect Insight Card */}
      <section className="premium-card bg-[#E2F0FD] border-none p-6 shadow-sm flex flex-col gap-3 group">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#A3D1FF] rounded-2xl flex items-center justify-center text-[#1C695D] shadow-sm">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-[#2B4C5F] tracking-tighter">Architect Insight</h3>
            <p className="text-xs font-bold text-[#2B4C5F]/70 leading-relaxed tracking-tight">
              You have a <span className="text-primary font-black decoration-primary/20 underline underline-offset-4 decoration-2">surplus of ₱142</span> in entertainment. Consider moving these to savings.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Search/Header List */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xl font-black text-foreground tracking-tighter">Categories</h3>
        <div className="flex items-center gap-3">
          {!showViewAllInput ? (
            <button 
              onClick={() => setShowViewAllInput(true)}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              Search
            </button>
          ) : (
            <div className="flex animate-scale-in">
              <input 
                type="text" 
                placeholder="Find category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-24 sm:w-32 bg-slate-100 rounded-l-lg px-2 py-1 text-[10px] font-bold outline-none border border-primary/20" 
                autoFocus 
              />
              <button 
                onClick={() => { setShowViewAllInput(false); setSearchQuery(""); }} 
                className="bg-primary text-white px-2 py-1 rounded-r-lg text-[10px] font-black uppercase hover:bg-[#134D44] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredBudgets.map((category) => {
          const CategoryIcon = getIcon(category.iconName);
          const isQuickExpenseActive = activeQuickExpenseName === category.name;
          
          return (
          <div 
            key={category.name} 
            className="premium-card bg-white p-5 flex flex-col gap-4 shadow-sm transition-all group overflow-hidden relative"
          >
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl ring-1 ring-black/5 bg-slate-50")}>
                  <CategoryIcon className="w-6 h-6 text-[#2B4C5F]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-foreground leading-tight">{category.name}</span>
                  <span className="text-[10px] text-text-muted font-bold tracking-tight opacity-70">
                    ₱{category.spent.toLocaleString()} / ₱{category.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-black text-sm text-foreground">{category.percent}%</span>
                <div className="flex items-center gap-2 mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity translate-y-0 sm:translate-y-2 group-hover:translate-y-0 duration-300">
                  <button 
                    onClick={() => setActiveQuickExpenseName(isQuickExpenseActive ? null : category.name)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors"
                    title="Quick Spend"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => openEditModal(category)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => deleteBudget(category.name)}
                    className="bg-danger/10 hover:bg-danger/20 text-danger p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner z-10">
              <div 
                className={cn("h-full transition-all duration-1000", category.color)} 
                style={{ width: `${Math.min(100, category.percent)}%` }}
              ></div>
            </div>

            {isQuickExpenseActive && (
              <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3 animate-scale-in z-10">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pila akong nakiha ana?</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">₱</span>
                    <input 
                      type="number" 
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-slate-50 text-sm font-black outline-none border border-black/5 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary/20" 
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickExpense(category.name)}
                    />
                  </div>
                  <button 
                    onClick={() => handleQuickExpense(category.name)}
                    className="bg-primary text-white px-6 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#134D44]"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => { setActiveQuickExpenseName(null); setExpenseAmount(""); }}
                    className="p-3 text-text-muted hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )})}
      </div>

      {/* Modal - CRUD Experience for Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl relative z-10 flex flex-col p-8 sm:p-10 animate-slide-up origin-bottom">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-foreground tracking-tighter">
                {editingBudget ? "Edit Category" : "New Category"}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Category Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Travel, Shopping"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-base font-bold placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner uppercase tracking-tight"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Budget Limit (₱)</label>
                <input 
                  type="number" 
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: parseFloat(e.target.value)})}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-base font-black placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Icon & Theme Color</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {budgetColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({...formData, color})}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all flex items-center justify-center ring-offset-2 ring-primary",
                        color,
                        formData.color === color ? "ring-2 scale-110" : "hover:scale-105"
                      )}
                    >
                      {formData.color === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableIcons.map(icon => {
                    const Ico = getIcon(icon);
                    return (
                      <button
                        key={icon}
                        onClick={() => setFormData({...formData, iconName: icon})}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                          formData.iconName === icon ? "bg-primary text-white border-primary shadow-md" : "bg-slate-50 text-text-muted border-transparent hover:bg-slate-100"
                        )}
                      >
                        <Ico className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <button 
                onClick={handleSaveBudget}
                disabled={!formData.name || !formData.total}
                className="w-full bg-primary text-white py-5 rounded-3xl font-black text-base tracking-tighter uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {editingBudget ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: Array<string | number | boolean | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
