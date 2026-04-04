"use client";

import { Lightbulb, Plus, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance } from "@/components/FinanceContext";
import { getIcon } from "@/lib/getIcon";

export default function Budgets() {
  const { budgets, addBudget, deleteBudget, updateBudgetSpent, addTransaction, updateBudgetIcon } = useFinance();
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [showViewAllInput, setShowViewAllInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIconBudget, setEditingIconBudget] = useState<string | null>(null);

  const getAutoIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("food") || n.includes("grocery") || n.includes("eat")) return "ShoppingCart";
    if (n.includes("coffee") || n.includes("drink")) return "Coffee";
    if (n.includes("school") || n.includes("tution") || n.includes("education")) return "Target";
    return "LayoutGrid";
  };

  const handleAddBudget = () => {
    if (budgetName.trim() && budgetAmount) {
      addBudget({
        name: budgetName,
        spent: 0,
        total: parseFloat(budgetAmount),
        percent: 0,
        color: "bg-primary", 
        iconName: getAutoIcon(budgetName)
      });
      setBudgetName("");
      setBudgetAmount("");
      setShowBudgetInput(false);
    }
  };

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.total, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  
  const [showMainExpenseInput, setShowMainExpenseInput] = useState(false);
  const [mainExpenseAmount, setMainExpenseAmount] = useState("");

  const filteredBudgets = budgets.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveExpense = (name: string) => {
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
      setEditingBudget(null);
    }
  };

  const handleSaveMainExpense = () => {
    const amt = parseFloat(mainExpenseAmount);
    if (!isNaN(amt) && amt > 0) {
      if (!budgets.find(b => b.name === "General")) {
        addBudget({ name: "General", spent: amt, total: amt * 2, percent: 50, color: "bg-primary", iconName: "LayoutGrid" });
      } else {
        updateBudgetSpent("General", amt);
      }
      
      addTransaction({
        name: `Quick Expense`,
        amount: -amt,
        date: "TODAY",
        category: "General",
        type: "expense",
        iconName: "LayoutGrid"
      });
      
      setMainExpenseAmount("");
      setShowMainExpenseInput(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-6 pb-24 animate-scale-in">
      {/* Budget Overview Header */}
      <section className="flex flex-col px-1">
        <p className="text-text-muted font-black text-[10px] mb-1 opacity-70 uppercase tracking-[0.2em]">Current Month</p>
        <h2 className="text-5xl font-black text-foreground tracking-tighter leading-tight">
          Budget Overview
        </h2>
      </section>

      {/* Main Budget Health Card */}
      <section 
        onClick={() => !showMainExpenseInput && setShowMainExpenseInput(true)}
        className={cn(
          "premium-card bg-white p-6 flex flex-col gap-6 relative overflow-hidden group transition-all",
          showMainExpenseInput ? "ring-2 ring-primary shadow-xl" : "shadow-sm hover:ring-2 hover:ring-primary/20 hover:scale-[1.01] cursor-pointer"
        )}
      >
        <div className="flex flex-col gap-1 relative z-10 pointer-events-none">
          <p className="text-xs font-black text-text-muted opacity-60 uppercase tracking-widest leading-none">Total Remaining</p>
          <div className="flex justify-between items-baseline">
            <h3 className="text-5xl font-black text-primary tracking-tighter leading-tight">₱{totalRemaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
            <span className="text-xs font-black text-text-muted opacity-80 uppercase tracking-widest">{overallPercent}% Spent</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 relative z-10 mt-2 pointer-events-none">
          {/* Progress Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-50">
            <div className="h-full bg-primary shadow-[0_0_15px_rgba(0,109,119,0.2)] transition-all duration-1000" style={{ width: `${Math.min(100, overallPercent)}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-black tracking-tighter uppercase opacity-60">
            <span>₱{totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })} USED</span>
            <span>₱{totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })} BUDGET</span>
          </div>
        </div>

        {showMainExpenseInput && (
          <div className="relative z-10 mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3 animate-scale-in">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Quick Add To General Expenses</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">₱</span>
                <input 
                  type="number" 
                  value={mainExpenseAmount}
                  onChange={(e) => setMainExpenseAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-slate-50 text-sm font-black outline-none border border-black/5 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary/20" 
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveMainExpense()}
                />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSaveMainExpense(); }}
                className="bg-primary text-white px-6 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#134D44]"
              >
                Save
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMainExpenseInput(false); setMainExpenseAmount(""); }}
                className="p-3 text-text-muted hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header Curve Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
      </section>

      {/* Architect Insight Card - Blue Theme */}
      <section className="premium-card bg-[#E2F0FD] border-none p-6 shadow-sm flex flex-col gap-3 group">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#A3D1FF] rounded-2xl flex items-center justify-center text-primary-dark shadow-sm">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-[#2B4C5F] tracking-tighter">Architect Insight</h3>
            <p className="text-xs font-bold text-[#2B4C5F]/70 leading-relaxed tracking-tight">
              You have a <span className="text-primary font-black decoration-primary/20 underline underline-offset-4 decoration-2">surplus of ₱142</span> in &quot;Entertainment&quot; this month. Consider moving these funds to your &quot;High-Yield Savings&quot; goal to accelerate your downpayment target by 12 days.
            </p>
          </div>
        </div>
      </section>

      {/* Categories List */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-black text-foreground tracking-tighter">Categories</h3>
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
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowBudgetInput(!showBudgetInput)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all outline-4 outline-white shrink-0"
              style={{ transform: showBudgetInput ? 'rotate(45deg)' : 'none' }}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {showBudgetInput && (
          <div className="premium-card bg-white p-5 flex flex-col gap-4 animate-scale-in border border-primary/20 shadow-md">
            <h4 className="text-sm font-black text-primary uppercase tracking-widest">Create New Budget</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                placeholder="Category (e.g. Travel)" 
                className="flex-1 bg-slate-50 text-sm font-bold placeholder:font-normal outline-none border border-black/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all" 
                autoFocus 
              />
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">₱</span>
                <input 
                  type="number" 
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Amount" 
                  className="w-full bg-slate-50 text-sm font-bold placeholder:font-normal outline-none border border-black/5 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>
            <button 
              onClick={handleAddBudget}
              className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-black shadow-md hover:scale-[1.02] active:scale-95 transition-transform w-full sm:w-auto self-end uppercase tracking-widest mt-1"
            >
              Add Budget
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {filteredBudgets.map((category) => {
            const CategoryIcon = getIcon(category.iconName);
            const isEditing = editingBudget === category.name;
            return (
            <div 
              key={category.name} 
              onClick={() => !isEditing && setEditingBudget(category.name)}
              className={cn(
                "premium-card bg-white p-5 flex flex-col gap-4 shadow-sm transition-all group cursor-pointer",
                isEditing ? "ring-2 ring-primary shadow-xl" : "ring-0 hover:ring-2 hover:ring-primary/20 hover:scale-[1.01]"
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div 
                      onClick={(e) => { e.stopPropagation(); setEditingIconBudget(editingIconBudget === category.name ? null : category.name); }}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform cursor-pointer border", 
                        editingIconBudget === category.name ? "bg-primary/10 border-primary ring-2 ring-primary" : "bg-slate-50 border-transparent hover:border-primary/20 hover:bg-slate-100"
                      )}
                      title="Change Icon"
                    >
                      <CategoryIcon className="w-6 h-6 text-[#2B4C5F]" />
                    </div>
                    {editingIconBudget === category.name && (
                      <div className="absolute top-14 left-0 bg-white shadow-xl rounded-2xl p-2 flex gap-2 z-50 animate-scale-in border border-primary/10">
                         {['ShoppingCart', 'Coffee', 'Target', 'LayoutGrid'].map(iconName => {
                            const Ico = getIcon(iconName);
                            return (
                               <button 
                                 key={iconName}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   updateBudgetIcon(category.name, iconName);
                                   setEditingIconBudget(null);
                                 }}
                                 className="p-3 hover:bg-slate-50 rounded-xl text-primary transition-colors hover:scale-110 active:scale-95"
                               >
                                  <Ico className="w-5 h-5" />
                               </button>
                            );
                         })}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base tracking-tight text-foreground">{category.name}</span>
                    <span className="text-[10px] text-text-muted font-bold tracking-tight opacity-70">₱{category.spent.toFixed(2)} / ₱{category.total.toFixed(2)}</span>
                  </div>
                </div>
                <span className="font-black text-sm text-foreground">{category.percent}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex shrink-0 min-h-2.5">
                <div 
                  className={cn("h-full transition-all duration-1000", category.color)} 
                  style={{ width: `${Math.min(100, category.percent)}%` }}
                ></div>
              </div>

              {isEditing && (
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3 animate-scale-in">
                  {category.percent >= 100 ? (
                    <div className="flex justify-between items-center bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                      <p className="text-xs font-black uppercase tracking-widest">Budget Limit Reached (100%+)</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteBudget(category.name); setEditingBudget(null); }}
                        className="p-3 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-none active:scale-95"
                        title="Delete Category"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pila akong nakiha ana? (How much was it?)</p>
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveExpense(category.name)}
                          />
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSaveExpense(category.name); }}
                          className="bg-primary text-white px-6 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#134D44]"
                        >
                          Save
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingBudget(null); setExpenseAmount(""); }}
                          className="p-3 text-text-muted hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteBudget(category.name); setEditingBudget(null); }}
                          className="p-3 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shrink-0 shadow-sm"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>
      </section>

      {/* Floating Action Button Removed */}
    </div>
  );
}

function cn(...inputs: Array<string | number | boolean | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
