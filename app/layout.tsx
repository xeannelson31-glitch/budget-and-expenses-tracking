import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
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
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <FinanceProvider>
          <div className="w-full mx-auto min-h-screen flex flex-col relative overflow-x-hidden shadow-2xl bg-white/50 backdrop-blur-sm">
            <Header />
            <main className="flex-1 pb-24 px-4 overflow-y-auto max-w-screen-2xl mx-auto w-full">
              {children}
            </main>
            <BottomNav />
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}
