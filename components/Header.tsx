"use client";

import { Bell, User, Search } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useFinance } from "./FinanceContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const router = useRouter();
  const { notifications, clearNotifications, userProfilePic, setUserProfilePic, budgets, transactions } = useFinance();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = searchQuery ? [
    ...budgets.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).map(b => ({ type: 'budget', name: b.name, category: 'Budget Category', link: '/budgets' })),
    ...transactions.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())).map(t => ({ type: 'transaction', name: t.name, category: t.category, link: '/transactions' }))
  ].slice(0, 5) : [];

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-50 glass-nav p-5 flex items-center justify-between animate-slide-up bg-white/80 border-b border-primary/5">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-premium transform hover:rotate-6 transition-transform">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">SmartBudget</h1>
          <p className="text-[10px] text-primary/70 font-semibold uppercase tracking-widest leading-none">Financial Intelligence</p>
        </div>
      </div>

      {currentTime && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[13px] font-black tracking-widest text-[#1C695D] leading-none">{formatTime(currentTime)}</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C695D]/60 mt-1">{formatDate(currentTime)}</span>
        </div>
      )}
      
      <div className="flex items-center gap-3 relative">
        {/* Search */}
        {showSearch && (
          <div className="absolute top-14 right-10 sm:right-16 flex flex-col items-end animate-scale-in z-50">
            <div className="flex items-center shadow-lg w-64 sm:w-80">
              <input 
                type="text" 
                placeholder="Search budgets and transactions..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/95 rounded-l-2xl px-5 py-3 text-sm font-bold outline-none border border-primary/20 backdrop-blur-sm focus:border-primary/50 shadow-inner" 
                autoFocus 
              />
              <button onClick={() => {setShowSearch(false); setSearchQuery("");}} className="bg-primary text-white px-5 py-3 rounded-r-2xl text-sm font-black uppercase hover:bg-[#134D44] transition-colors border border-primary h-full">X</button>
            </div>
            
            {searchQuery.length > 0 && (
              <div className="mt-2 w-full bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden flex flex-col">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs font-bold text-text-muted opacity-70">No results found</div>
                ) : (
                  searchResults.map((res, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                         setShowSearch(false); 
                         setSearchQuery(""); 
                         router.push(res.link);
                      }}
                      className="text-left px-4 py-3 hover:bg-slate-50 border-b border-primary/5 last:border-none transition-colors group flex flex-col"
                    >
                      <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{res.name}</span>
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">{res.type} • {res.category}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        <button onClick={() => {setShowSearch(!showSearch); setShowNotifs(false); setShowProfile(false);}} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors relative group">
          <Search className="w-5 h-5 text-text-muted group-hover:text-primary" />
        </button>

        {/* Notifications */}
        <button onClick={() => {setShowNotifs(!showNotifs); setShowSearch(false); setShowProfile(false);}} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors relative group">
          <Bell className="w-5 h-5 text-text-muted group-hover:text-primary" />
          {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>}
        </button>
        {showNotifs && (
          <div className="absolute top-full right-8 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-primary/10 p-4 animate-scale-in flex flex-col gap-3 z-50">
            <div className="flex justify-between items-center border-b border-primary/5 pb-2">
               <h4 className="text-sm font-black text-foreground">Notifications</h4>
               {unreadCount > 0 && <button onClick={clearNotifications} className="text-[10px] font-bold text-primary uppercase hover:underline">Clear All</button>}
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4 font-bold opacity-60">No recent activity</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="flex flex-col gap-1 p-2 hover:bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-foreground/80 leading-tight">{n.message}</p>
                    <span className="text-[9px] text-primary/60 font-black uppercase tracking-widest">{n.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div onClick={() => {setShowProfile(!showProfile); setShowSearch(false); setShowNotifs(false);}} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/10 overflow-hidden cursor-pointer hover:border-primary/40 transition-all">
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            {userProfilePic ? <Image src={userProfilePic} alt="User Profile" className="w-full h-full object-cover" width={40} height={40} unoptimized /> : <User className="w-6 h-6 text-primary" />}
          </div>
        </div>
        {showProfile && (
          <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-primary/10 p-4 animate-scale-in flex flex-col gap-4 z-50">
            <h4 className="text-sm font-black text-foreground border-b border-primary/5 pb-2">Profile Picture</h4>
            <div className="flex flex-col gap-3">
              <input 
                type="file" 
                accept="image/*"
                id="profileUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUserProfilePic(reader.result as string);
                      setShowProfile(false);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label 
                htmlFor="profileUpload"
                className="w-full bg-primary text-white rounded-xl py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#134D44] transition-colors cursor-pointer text-center block"
              >
                Upload Image
              </label>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
