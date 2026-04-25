import React, { useEffect, useState } from "react";
import { getTasks } from "../api";
import { Task } from "../types";
import { StatusBadge } from "../components/UI";
import { Calendar, MapPin, User, ChevronRight, Filter, Plus } from "lucide-react";
import { motion } from "motion/react";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold">Strategy Console</h1>
          <p className="text-brand-muted font-mono text-sm mt-1">Resource Allocation & Logistics Tracking</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-brand-surface border border-brand-border px-4 py-2 rounded-lg text-sm font-mono hover:border-brand-teal transition-all">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 bg-brand-teal text-brand-bg px-4 py-2 rounded-lg text-sm font-mono font-bold hover:bg-brand-teal/90 transition-all shadow-lg shadow-brand-teal/20">
            <Plus size={16} /> New Asset Deployment
          </button>
        </div>
      </div>

      <div className="tactical-card !p-0 overflow-hidden divide-y divide-brand-border">
         <div className="grid grid-cols-12 gap-4 p-3 bg-brand-surface border-b border-brand-border text-[9px] font-mono text-brand-muted uppercase tracking-widest">
            <div className="col-span-1">ID_VEC</div>
            <div className="col-span-4">Operation Target</div>
            <div className="col-span-2">Cluster</div>
            <div className="col-span-2">Lead Personnel</div>
            <div className="col-span-2">Status_Flag</div>
            <div className="col-span-1">Opt</div>
         </div>

         {tasks.map(task => (
           <motion.div 
             key={task.id} 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-brand-surface/50 transition-colors group cursor-pointer"
           >
              <div className="col-span-1 font-mono text-[11px] text-brand-muted">{task.id}</div>
              <div className="col-span-4">
                 <p className="text-[13px] font-bold flex items-center gap-2 tracking-tight">
                   {task.title}
                 </p>
                 <p className="text-[9px] font-mono text-brand-muted mt-0.5 uppercase flex items-center gap-1">
                   <Calendar size={10} /> DEADLINE: {task.deadline}
                 </p>
              </div>
              <div className="col-span-2 flex items-center gap-1 text-[11px] text-brand-muted font-mono uppercase">
                <MapPin size={12} className="text-brand-teal" /> {task.location}
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-brand-blue/10 flex items-center justify-center text-[9px] font-mono text-brand-blue border border-brand-blue/20">
                  {task.assignedTo.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[11px] font-mono">{task.assignedTo}</span>
              </div>
              <div className="col-span-2">
                <StatusBadge status={task.status} />
              </div>
              <div className="col-span-1 flex justify-end">
                 <button className="p-1 rounded-sm hover:bg-brand-teal hover:text-brand-bg transition-colors text-brand-muted">
                    <ChevronRight size={14}/>
                 </button>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-brand-surface border border-dashed border-brand-border p-6 rounded-xl text-center">
           <Zap className="mx-auto mb-3 text-brand-teal" size={32} />
           <h4 className="font-display font-bold text-sm mb-1">AI Match Pending</h4>
           <p className="text-[10px] font-mono text-brand-muted">12 unassigned hotspots detected. Initialize AI Match Engine for optimal routing.</p>
           <button className="mt-4 bg-brand-teal/10 text-brand-teal border border-brand-teal/30 px-4 py-1.5 rounded-full text-xs font-mono font-bold hover:bg-brand-teal hover:text-brand-bg transition-all">
             ACTIVATE MATCHING
           </button>
        </div>
      </div>
    </div>
  );
}

function Zap({ size, className, mxAuto, mb3 }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className + (mxAuto ? " mx-auto" : "") + (mb3 ? " mb-3" : "")}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
