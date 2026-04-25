import React, { useEffect, useState } from "react";
import { getImpact } from "../api";
import { ImpactLog as ImpactType } from "../types";
import { History, Target, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";

export default function ImpactLog() {
  const [logs, setLogs] = useState<ImpactType[]>([]);

  useEffect(() => {
    getImpact().then(setLogs);
  }, []);

  return (
    <div className="space-y-8 py-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold">Impact Documentation</h1>
          <p className="text-brand-muted font-mono text-sm mt-1">Proof of Contribution & Quantitative Transformation Metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-brand-card border border-brand-border p-6 rounded-xl text-center">
            <Target className="mx-auto mb-3 text-brand-teal" size={32} />
            <p className="text-[10px] font-mono text-brand-muted uppercase">Families Sustained</p>
            <p className="text-3xl font-display font-bold">4,821</p>
         </div>
         <div className="bg-brand-card border border-brand-border p-6 rounded-xl text-center">
            <TrendingUp className="mx-auto mb-3 text-brand-blue" size={32} />
            <p className="text-[10px] font-mono text-brand-muted uppercase">Efficiency Gain</p>
            <p className="text-3xl font-display font-bold">+34%</p>
         </div>
         <div className="bg-brand-card border border-brand-border p-6 rounded-xl text-center">
            <Users className="mx-auto mb-3 text-brand-amber" size={32} />
            <p className="text-[10px] font-mono text-brand-muted uppercase">Volunteer Hours</p>
            <p className="text-3xl font-display font-bold">12,450</p>
         </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
         <table className="w-full text-left border-collapse">
           <thead className="bg-brand-surface border-b border-brand-border text-[10px] font-mono text-brand-muted uppercase tracking-widest">
             <tr>
               <th className="p-4">Timestamp</th>
               <th className="p-4">Impact Zone</th>
               <th className="p-4">Operational Category</th>
               <th className="p-4">Transformation Metrics</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-brand-border">
             {logs.map(log => (
               <motion.tr 
                 key={log.id} 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="hover:bg-brand-surface/30 transition-colors"
               >
                 <td className="p-4 text-xs font-mono text-brand-muted">{log.date}</td>
                 <td className="p-4 font-bold text-sm tracking-tight">{log.location} Cluster</td>
                 <td className="p-4">
                    <span className="bg-brand-teal/10 text-brand-teal border border-brand-teal/20 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                      {log.type}
                    </span>
                 </td>
                 <td className="p-4 text-sm font-mono text-brand-teal">{log.impact}</td>
               </motion.tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}
