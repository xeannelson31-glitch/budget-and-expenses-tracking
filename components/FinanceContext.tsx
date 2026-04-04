"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LayoutGrid, ShoppingCart, Coffee, Target } from "lucide-react";

export type Transaction = {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense" | "recurring";
  iconName?: string;
};

export type Budget = {
  name: string;
  spent: number;
  total: number;
  percent: number;
  color: string;
  iconName?: string;
};

export type Notification = {
  id: number;
  message: string;
  time: string;
};

type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: number) => void;
  budgets: Budget[];
  addBudget: (bg: Budget) => void;
  deleteBudget: (name: string) => void;
  updateBudgetSpent: (name: string, amount: number) => void;
  
  notifications: Notification[];
  clearNotifications: () => void;

  userProfilePic: string | null;
  setUserProfilePic: (url: string | null) => void;

  lastUpdated: string;
  updateBudgetIcon: (name: string, iconName: string) => void;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Initialize with empty/default to avoid hydration mismatch
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, name: "Modern Grocer", amount: -420.00, date: "TODAY, 2:45 PM", category: "Food", type: "expense", iconName: "ShoppingCart" },
    { id: 2, name: "Freelance Client", amount: 1250.00, date: "YESTERDAY", category: "Income", type: "income", iconName: "Target" },
    { id: 3, name: "Brew & Bean", amount: -180.00, date: "YESTERDAY", category: "Entertainment", type: "expense", iconName: "Coffee" },
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { name: "Food & Groceries", spent: 1700, total: 2500, percent: 68, color: "bg-primary", iconName: "ShoppingCart" },
    { name: "Entertainment", spent: 550, total: 1000, percent: 55, color: "bg-slate-500", iconName: "LayoutGrid" },
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedBudgets = localStorage.getItem("sb_budgets");
    const savedTransactions = localStorage.getItem("sb_transactions");
    const savedNotifications = localStorage.getItem("sb_notifications");
    const savedProfile = localStorage.getItem("sb_profile");
    const savedLastUpdated = localStorage.getItem("sb_lastUpdated");

    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedProfile) setUserProfilePic(savedProfile);
    if (savedLastUpdated) setLastUpdated(savedLastUpdated);
  }, []);

  // Save to localStorage when state changes (after initial load)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("sb_budgets", JSON.stringify(budgets));
      localStorage.setItem("sb_transactions", JSON.stringify(transactions));
      localStorage.setItem("sb_notifications", JSON.stringify(notifications));
      if (userProfilePic) localStorage.setItem("sb_profile", userProfilePic);
      else localStorage.removeItem("sb_profile");
      if (lastUpdated) localStorage.setItem("sb_lastUpdated", lastUpdated);
    }
  }, [budgets, transactions, notifications, userProfilePic, lastUpdated, isClient]);

  const formatTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const addNotification = (msg: string) => {
    setNotifications(prev => [{ id: Date.now(), message: msg, time: formatTime() }, ...prev]);
  };

  const markUpdated = () => setLastUpdated(new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    setTransactions(prev => [{ ...tx, id: Date.now() }, ...prev]);
    addNotification(`Added transaction: ${tx.name} (${tx.amount > 0 ? '+' : ''}${tx.amount})`);
    markUpdated();
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (tx) addNotification(`Deleted transaction: ${tx.name}`);
      return prev.filter(t => t.id !== id);
    });
    markUpdated();
  };

  const addBudget = (bg: Budget) => {
    setBudgets(prev => [{ ...bg }, ...prev]);
    addNotification(`Created budget category: ${bg.name}`);
    markUpdated();
  };

  const deleteBudget = (name: string) => {
    setBudgets(prev => prev.filter(b => b.name !== name));
    addNotification(`Deleted budget category: ${name}`);
    markUpdated();
  };

  const updateBudgetSpent = (name: string, amount: number) => {
    setBudgets(prev => prev.map(b => {
      if (b.name.toLowerCase() === name.toLowerCase()) {
        const newSpent = b.spent + amount;
        const percent = b.total > 0 ? Math.round((newSpent / b.total) * 100) : 0;
        return { ...b, spent: newSpent, percent };
      }
      return b;
    }));
    markUpdated();
  };

  const updateBudgetIcon = (name: string, iconName: string) => {
    setBudgets(prev => prev.map(b => b.name.toLowerCase() === name.toLowerCase() ? { ...b, iconName } : b));
    markUpdated();
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <FinanceContext.Provider value={{ 
      transactions, addTransaction, deleteTransaction, 
      budgets, addBudget, deleteBudget, updateBudgetSpent,
      notifications, clearNotifications,
      userProfilePic, setUserProfilePic,
      lastUpdated, updateBudgetIcon
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
