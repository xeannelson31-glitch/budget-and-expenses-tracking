import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ChatWidget from "@/components/ChatWidget";
import { FinanceProvider } from "@/components/FinanceContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartBudget | Intelligent Financial Dashboard",
  description: "Track your expenses, manage budgets, and get AI-driven financial insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning>
        <FinanceProvider>
          <div className="w-full mx-auto min-h-screen flex flex-col relative overflow-x-hidden shadow-2xl bg-white/50 backdrop-blur-sm">
            <Header />
            <main className="flex-1 pb-24 px-4 overflow-y-auto max-w-screen-2xl mx-auto w-full">
              {children}
            </main>
            <BottomNav />
            <ChatWidget />
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}
