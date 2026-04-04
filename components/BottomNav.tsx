"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ReceiptText, Wallet, BarChart3 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutGrid, label: "DASHBOARD", href: "/" },
  { icon: ReceiptText, label: "TRANSACTIONS", href: "/transactions" },
  { icon: Wallet, label: "BUDGETS", href: "/budgets" },
  { icon: BarChart3, label: "ANALYTICS", href: "/analytics" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex items-center justify-around z-50 px-2 py-2 h-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl text-[#929fb0] max-w-screen-2xl left-1/2 -translate-x-1/2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[4rem]",
                isActive ? "text-[#1C695D] bg-[#F1FAFA]" : "hover:text-primary/70"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-[#1C695D]/10 stroke-[#1C695D]")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px] font-bold tracking-wide transition-all duration-300", isActive ? "opacity-100" : "opacity-80")}>
                {item.label}
              </span>
            </Link>
          );
        })}
    </nav>
  );
}
