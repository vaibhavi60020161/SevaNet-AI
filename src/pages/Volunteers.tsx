import React, { useEffect, useState } from "react";
import { getVolunteers, matchVolunteer } from "../api";
import { Volunteer } from "../types";
import { StatusBadge } from "../components/UI";
import { Search, MapPin, Award, Zap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getVolunteers().then(setVolunteers);
  }, []);

  const filtered = volunteers.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold">Volunteer Force</h1>
          <p className="text-brand-muted font-mono text-sm mt-1">Directory of {volunteers.length} Active Personnel in Pune Cluster</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or skill..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-surface border border-brand-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-teal transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((v, idx) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="tactical-card group cursor-pointer hover:border-brand-teal/50 transition-all font-sans"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-sm bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal font-display font-bold text-base">
                    {v.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight group-hover:text-brand-teal transition-colors">{v.name}</h3>
                    <div className="flex items-center gap-1 text-[9px] text-brand-muted font-mono uppercase mt-0.5">
                      <MapPin size={10} /> {v.location} SECTOR
                    </div>
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {v.skills.map(skill => (
                    <span key={skill} className="bg-brand-bg border border-brand-border px-1.5 py-0.5 rounded-sm text-[9px] text-brand-muted font-mono">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-brand-border py-3 my-3">
                   <div>
                     <p className="text-[9px] font-mono text-brand-muted uppercase mb-0.5">Impact Score</p>
                     <div className="flex items-center gap-1">
                       <Award size={12} className="text-brand-amber" />
                       <span className="font-bold text-sm text-brand-text font-mono">982</span>
                     </div>
                   </div>
                   <div>
                     <p className="text-[9px] font-mono text-brand-muted uppercase mb-0.5">Operations</p>
                     <div className="flex items-center gap-1">
                       <CheckCircle size={12} className="text-brand-teal" />
                       <span className="font-bold text-sm text-brand-text font-mono">42</span>
                     </div>
                   </div>
                </div>

                <button 
                  onClick={() => matchVolunteer(v.id)}
                  className="w-full bg-brand-surface border border-brand-border hover:bg-brand-teal hover:text-brand-bg hover:border-brand-teal text-brand-teal font-mono font-bold py-1.5 rounded-sm text-[10px] flex items-center justify-center gap-2 transition-all uppercase tracking-tighter"
                >
                  <Zap size={12} /> AI_DEPLOY_PERSONNEL
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CheckCircle({ size, className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
