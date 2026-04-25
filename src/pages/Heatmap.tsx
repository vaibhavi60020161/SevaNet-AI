import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { getNeeds } from "../api";
import { Need } from "../types";
import { StatusBadge } from "../components/UI";
import { Filter, Layers } from "lucide-react";

// Helper to fix Leaflet map resize issues
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

import { cn } from "../lib/utils";

export default function Heatmap() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getNeeds().then(setNeeds);
  }, []);

  const filteredNeeds = filter === "All" ? needs : needs.filter(n => n.category === filter);

  const getMarkerColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "#ff4d6d";
      case "high": return "#ffaa00";
      case "medium": return "#3b9eff";
      default: return "#00d4a0";
    }
  };

  return (
    <div className="h-full flex flex-col -m-6 relative">
      {/* Map Control Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-brand-surface border border-brand-border p-4 rounded-brand shadow-2xl w-64">
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <Layers size={20} className="text-brand-teal" />
          Live Pulse Heatmap
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-brand-muted uppercase mb-2 block">Overlay View</label>
            <div className="flex flex-wrap gap-2">
              {["All", "Food", "Medical", "Education", "Shelter"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "px-3 py-1 rounded text-[10px] font-mono border transition-all",
                    filter === cat ? "bg-brand-teal text-brand-bg border-brand-teal" : "text-brand-muted border-brand-border hover:border-brand-teal/50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border">
             <div className="flex items-center justify-between text-[10px] font-mono mb-2">
               <span>LEGEND:</span>
             </div>
             <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-red shadow-[0_0_8px_#ff4d6d]" />
                 <span className="text-[10px] text-brand-muted">CRITICAL RISK</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-amber shadow-[0_0_8px_#ffaa00]" />
                 <span className="text-[10px] text-brand-muted">HIGH PRIORITY</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-blue shadow-[0_0_8px_#3b9eff]" />
                 <span className="text-[10px] text-brand-muted">ROUTINE NEED</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <MapContainer 
        center={[18.5204, 73.8567]} 
        zoom={12} 
        scrollWheelZoom={true}
        className="flex-1 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapResizer />
        
        {filteredNeeds.map(need => (
          <CircleMarker
            key={need.id}
            center={[need.lat, need.lng]}
            pathOptions={{ 
              color: getMarkerColor(need.urgency), 
              fillColor: getMarkerColor(need.urgency), 
              fillOpacity: 0.6,
              weight: 2 
            }}
            radius={need.families * 0.5 + 10}
          >
            <Popup className="brand-popup">
              <div className="p-1 space-y-2 bg-brand-bg text-brand-text">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-display font-bold text-sm m-0 text-brand-text">{need.location}</h3>
                  <StatusBadge status={need.urgency} />
                </div>
                <p className="text-xs text-brand-muted font-mono">{need.category} • {need.families} Families</p>
                <div className="pt-2 border-t border-brand-border">
                  <p className="text-[10px] leading-tight text-brand-text italic font-serif">"{need.description}"</p>
                </div>
                <button className="w-full mt-2 bg-brand-teal text-brand-bg text-[10px] font-bold font-mono py-1.5 rounded-sm">
                  DISPATCH SQUAD
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
