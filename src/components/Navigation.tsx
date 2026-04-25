import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Map as MapIcon, Users, CheckSquare, 
  Cpu, FileText, TrendingUp, History, Settings, Activity 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cn } from "../lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: MapIcon, label: "Heatmap", path: "/heatmap" },
  { icon: Users, label: "Volunteers", path: "/volunteers" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Cpu, label: "AI Engine", path: "/ai-engine" },
  { icon: FileText, label: "OCR Intake", path: "/ocr-intake" },
  { icon: TrendingUp, label: "Predictions", path: "/predictions" },
  { icon: History, label: "Impact Log", path: "/impact" },
  { icon: Settings, label: "Admin", path: "/admin" },
];

export function Sidebar() {
  return (
    <aside className="w-[200px] h-screen bg-brand-surface border-r border-brand-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-5 border-b border-brand-border">
        <h1 className="text-lg font-display font-extrabold tracking-tighter leading-none">
          SEVANET<span className="text-brand-teal">AI</span>
        </h1>
        <p className="text-[9px] text-brand-muted font-mono mt-1 uppercase tracking-wider">V 2.4.0 RESOURCE ENGINE</p>
      </div>
      
      <nav className="flex-1 py-3 overflow-y-auto">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-5 py-2.5 text-[13px] font-sans transition-all border-l-3",
              isActive 
                ? "bg-brand-teal/[0.05] text-brand-teal border-brand-teal" 
                : "text-brand-muted border-transparent hover:bg-brand-bg hover:text-brand-text"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-5 border-t border-brand-border mt-auto">
        <div className="bg-brand-bg p-2 rounded-sm border border-brand-border flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-teal rounded-sm flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold truncate leading-none">Priya Sharma</p>
            <p className="text-[9px] text-brand-muted font-mono mt-1 uppercase">Field Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Topbar() {
  return (
    <header className="h-[52px] bg-brand-surface border-b border-brand-border fixed top-0 right-0 left-[200px] z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="pulse-dot" />
        <span className="text-[11px] font-mono text-brand-muted uppercase">
          SYSTEM: <span className="text-brand-teal">ONLINE</span> // MAHARASHTRA-PUNE-ZONE
        </span>
      </div>

      <div className="flex items-center gap-6 font-mono text-[11px] text-brand-muted">
         <div>SYNC: <span className="text-brand-text">14:02:11</span></div>
         <div>TASKS: <span className="text-brand-amber">12 PENDING</span></div>
         <div className="w-8 h-8 rounded-sm bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal font-mono text-xs">
           AD
         </div>
      </div>
    </header>
  );
}
