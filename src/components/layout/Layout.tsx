import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60">
        <Header />
        <main className="p-6 min-h-[calc(100vh-64px)]">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
