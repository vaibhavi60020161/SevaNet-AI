import React, { useEffect, useState } from "react";
import { AlertCircle, Users, CheckCircle, Package, Send, Mic, ScanLine, Activity } from "lucide-react";
import { MetricCard, StatusBadge, ActivityItem } from "../components/UI";
import { getStats, getNeeds, getVolunteers, submitTextIntake } from "../api";
import { Need, Volunteer } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Pulse every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [s, n, v] = await Promise.all([getStats(), getNeeds(), getVolunteers()]);
      setStats(s);
      setNeeds(n);
      setVolunteers(v);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    await submitTextIntake(inputText);
    setInputText("");
    fetchData();
  };

  const categoryData = [
    { name: "Food", total: needs.filter(n => n.category === "Food").length },
    { name: "Medical", total: needs.filter(n => n.category === "Medical").length },
    { name: "Education", total: needs.filter(n => n.category === "Education").length },
    { name: "Shelter", total: needs.filter(n => n.category === "Shelter").length },
  ];

  return (
    <div className="grid grid-cols-12 auto-rows-auto gap-4 h-full">
      {/* Metrics Row */}
      <div className="col-span-12 grid grid-cols-4 gap-4">
        <MetricCard label="Active Needs" value={stats?.activeNeeds || "1,482"} trend="+12%" />
        <MetricCard label="Volunteers Live" value={stats?.volunteersOnline || "342"} trend="+3" />
        <MetricCard label="Completed / 24H" value={stats?.tasksCompleted || "104"} />
        <MetricCard label="Estimated Impact" value="₹12.4M" />
      </div>

      {/* Main Content Row */}
      <div className="col-span-12 lg:col-span-8 grid grid-rows-[380px_180px] gap-4">
        <div className="tactical-card !p-0 overflow-hidden bg-white relative">
          <div className="panel-title sticky top-0 bg-white/90 backdrop-blur z-10 px-3 py-2 border-b border-brand-border">
            <span>Regional Live Heatmap: Pune Districts</span>
          </div>
          <div className="h-full w-full relative pattern-grid-light">
            <svg className="w-full h-full opacity-20 pointer-events-none p-8" viewBox="0 0 400 400">
               <path fill="none" stroke="currentColor" strokeWidth="1" d="M50 50 L100 80 L150 40 L200 90 L300 70 L350 150 L300 250 L200 350 L100 300 L20 150 Z" />
            </svg>
            
            {needs.map((need, idx) => (
              <motion.div
                key={need.id}
                className={cn(
                  "absolute rounded-full opacity-60 cursor-pointer",
                  need.urgency === "critical" ? "bg-brand-red w-10 h-10 shadow-[0_0_20px_#ff4d6d] pulse-red" : 
                  "bg-brand-amber w-8 h-8 shadow-[0_0_15px_#ffaa00]"
                )}
                style={{ top: `${20 + (idx * 15)%70}%`, left: `${10 + (idx * 20)%80}%` }}
              >
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap font-mono text-[10px]">
                  <span className={need.urgency === "critical" ? "text-brand-red" : "text-brand-amber"}>{need.location.toUpperCase()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {/* AI Activity Feed */}
           <div className="tactical-card overflow-hidden flex flex-col">
              <div className="panel-title border-b border-brand-border mb-2">AI Activity Hub</div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[11px] text-brand-muted">
                <div className="flex gap-2 border-l-2 border-brand-border pl-2"><span className="text-brand-blue font-mono">14:02:44</span> [MATCH] Priya Sharma assigned to Need #4029</div>
                <div className="flex gap-2 border-l-2 border-brand-border pl-2"><span className="text-brand-blue font-mono">14:02:10</span> [OCR] Extracted data from report_IMG82.png</div>
                <div className="flex gap-2 border-l-2 border-brand-border pl-2"><span className="text-brand-blue font-mono">14:01:55</span> [PREDICT] Demand spike forecast for Dhanori</div>
                <div className="flex gap-2 border-l-2 border-brand-border pl-2"><span className="text-brand-blue font-mono">14:01:22</span> [TRANS] Audio transcribed for Kothrud Sector</div>
              </div>
           </div>

           {/* Data Intake Systems */}
           <div className="tactical-card flex flex-col gap-2">
              <div className="panel-title border-b border-brand-border mb-1">Data Intake Systems</div>
              <button className="text-[11px] text-left p-2 bg-white/[0.05] border border-dashed border-brand-border hover:bg-white/[0.08] transition-all">[📷] OCR IMAGE INTAKE (DRAG & DROP)</button>
              <button className="text-[11px] text-left p-2 bg-white/[0.05] border border-dashed border-brand-border hover:bg-white/[0.08] transition-all">[🎙️] VOICE REPORT INTAKE (RECORD)</button>
              <div className="mt-auto border border-brand-border p-1 text-[9px] font-mono text-brand-muted uppercase">INPUT_STATUS: LISTENING...</div>
           </div>
        </div>
      </div>

      {/* Right Column: Queue & Category */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <div className="tactical-card flex-1 flex flex-col">
          <div className="panel-title border-b border-brand-border mb-3">AI Task Dispatch Queue</div>
          <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {needs.map(n => (
              <div key={n.id} className="flex items-center gap-3 p-2 border-b border-brand-border text-[12px] hover:bg-white/[0.02] cursor-pointer">
                <StatusBadge status={n.urgency} />
                <div className="overflow-hidden">
                  <p className="font-bold truncate">{n.category} Dispatch - {n.location}</p>
                  <p className="text-[10px] text-brand-muted truncate transition-colors group-hover:text-brand-teal">Suggestion: Ready for AI Match</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tactical-card h-[180px] flex flex-col">
           <div className="panel-title border-b border-brand-border mb-3">Needs by Category</div>
           <div className="space-y-3 pt-1">
             {[
               { label: 'FOOD', val: 85, col: 'bg-brand-red' },
               { label: 'MEDICAL', val: 62, col: 'bg-brand-amber' },
               { label: 'SHELTER', val: 38, col: 'bg-brand-blue' },
               { label: 'EDU', val: 20, col: 'bg-brand-teal' }
             ].map(item => (
               <div key={item.label} className="flex items-center gap-2">
                 <div className="w-12 text-[10px] font-mono leading-none">{item.label}</div>
                 <div className="flex-1 h-2 bg-brand-bg relative">
                   <div className={cn("h-full absolute left-0 top-0", item.col)} style={{ width: `${item.val}%` }} />
                 </div>
                 <div className="w-6 text-[10px] font-mono text-right">{item.val}%</div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
