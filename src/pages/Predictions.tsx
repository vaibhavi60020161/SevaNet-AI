import React, { useEffect, useState } from "react";
import { getPredictions } from "../api";
import { Prediction } from "../types";
import { StatusBadge } from "../components/UI";
import { TrendingUp, AlertTriangle, CloudRain, Thermometer, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion } from "motion/react";

export default function Predictions() {
  const [data, setData] = useState<Prediction | null>(null);

  useEffect(() => {
    getPredictions().then(setData);
  }, []);

  return (
    <div className="space-y-8 py-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold">Predictive Intel</h1>
          <p className="text-brand-muted font-mono text-sm mt-1">7-Day Forecasting & Resource Positioning Optimization</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-lg">
             <CloudRain size={16} className="text-brand-blue" />
             <span className="text-xs font-mono">Weather: Monsoon Risk Mid</span>
           </div>
           <div className="flex items-center gap-2 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-lg">
             <Thermometer size={16} className="text-brand-amber" />
             <span className="text-xs font-mono">Heat: 38°C Normal</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="tactical-card !p-6 h-[400px]">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-mono text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <TrendingUp size={14} className="text-brand-teal" />
                 RESRCE_DEMAND_PROJ_72H
               </h3>
               <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-[9px] font-mono"><div className="w-2 h-2 rounded-sm bg-brand-teal" /> FOOD</div>
                 <div className="flex items-center gap-2 text-[9px] font-mono"><div className="w-2 h-2 rounded-sm bg-brand-blue" /> MED</div>
               </div>
             </div>
             
             <div className="h-[280px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data?.trends}>
                   <defs>
                     <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#00d4a0" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#00d4a0" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b9eff" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#3b9eff" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e2a40" vertical={false} />
                   <XAxis dataKey="day" stroke="#6b7a99" fontSize={9} axisLine={false} tickLine={false} />
                   <YAxis stroke="#6b7a99" fontSize={9} axisLine={false} tickLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: "#111520", border: "1px solid #1e2a40", borderRadius: "0px" }}
                     itemStyle={{ fontSize: "10px", fontFamily: "DM Mono" }}
                   />
                   <Area type="monotone" dataKey="food" stroke="#00d4a0" fillOpacity={1} fill="url(#colorFood)" strokeWidth={2} />
                   <Area type="monotone" dataKey="medical" stroke="#3b9eff" fillOpacity={1} fill="url(#colorMed)" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="tactical-card !bg-brand-surface group">
            <h4 className="text-[10px] font-mono text-brand-teal uppercase tracking-widest mb-2 flex items-center gap-2">
               <TrendingUp size={12} /> AI_STRATEGIC_ADVISORY
            </h4>
            <p className="text-brand-muted text-xs leading-relaxed max-w-3xl font-mono uppercase">
              Pre-position <span className="text-brand-teal">500_RATION_KITS</span> in <span className="text-brand-teal">HADAPSAR_EAST</span> by T+48H. 
              Increase standby personnel in <span className="text-brand-blue">KOTHRUD</span> by 20% to mitigate projected medical vector spike.
            </p>
          </div>
        </div>

        <div className="space-y-4">
           {data?.alerts.map((alert, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="tactical-card space-y-3 hover:border-brand-red/40 transition-all border-l-2 border-l-brand-red"
             >
               <div className="flex items-center justify-between">
                 <StatusBadge status={alert.probability} />
                 <AlertTriangle size={14} className={alert.probability === "High" ? "text-brand-red" : "text-brand-amber"} />
               </div>
               <p className="text-[12px] font-bold tracking-tight uppercase">{alert.message}</p>
               <div className="flex items-center gap-1 text-[9px] font-mono text-brand-muted">
                 <MapPin size={10} /> ZONE_CLUSTER: {alert.location.toUpperCase()}
               </div>
               <button className="w-full bg-brand-bg border border-brand-border hover:bg-brand-red hover:text-brand-bg hover:border-brand-red text-brand-red font-mono font-bold py-1.5 rounded-sm text-[9px] uppercase transition-all tracking-tighter">
                 INIT_PRE_EMPTIVE_LOGISTICS
               </button>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
