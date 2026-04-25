import React from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

// Stats Card
export function MetricCard({ label, value, trend, icon: Icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="tactical-card flex flex-col justify-between h-20"
    >
      <span className="metric-label">{label}</span>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {trend && (
          <span className={cn("text-[9px] font-mono uppercase", trend.startsWith("+") ? "text-brand-teal" : "text-brand-red")}>
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Status Badge
export function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    critical: "bg-brand-red/15 text-brand-red border-brand-red/30",
    high: "bg-brand-amber/15 text-brand-amber border-brand-amber/30",
    medium: "bg-brand-blue/15 text-brand-blue border-brand-blue/30",
    low: "bg-brand-teal/15 text-brand-teal border-brand-teal/30",
    verified: "bg-brand-teal/15 text-brand-teal border-brand-teal/30",
  };

  return (
    <span className={cn(
      "px-1.5 py-0.5 rounded-sm text-[9px] font-mono border uppercase tracking-wider",
      styles[status.toLowerCase()] || "bg-brand-muted/10 text-brand-muted border-brand-muted"
    )}>
      {status}
    </span>
  );
}

// Activity Item
export function ActivityItem({ message, time, type }: any) {
  return (
    <div className="flex gap-4 pb-4 border-l border-brand-border ml-2 pl-4 relative">
      <div className={cn(
        "absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-brand-bg",
        type === "alert" ? "bg-brand-red" : "bg-brand-teal"
      )} />
      <div className="flex-1">
        <p className="text-xs text-brand-text leading-relaxed">{message}</p>
        <p className="text-[10px] font-mono text-brand-muted mt-1 uppercase">{time}</p>
      </div>
    </div>
  );
}
